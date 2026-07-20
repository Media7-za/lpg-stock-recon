import pandas as pd
from sqlalchemy import create_engine
import os

SUPABASE_URL = os.environ['DATABASE_URL']

# SQL Queries
sql_statement = """
WITH correct_items AS (
  SELECT category, tx_date, doc_no, entry_type, qty, retail_price, line_tax,
    ROUND((qty * retail_price) + CASE WHEN qty < 0 THEN -line_tax ELSE line_tax END, 2) AS line_total
  FROM transaction_items
  WHERE account_no IN ('FAM000', 'FAM002') AND entry_type IN ('Invoice', 'Crd Note')
    AND category IN ('19K', '9KG', 'LPG', 'CYL')
),
item_docs AS (
  SELECT entry_type, tx_date, doc_no,
    SUM(CASE WHEN category IN ('19K','9KG','LPG') THEN line_total ELSE 0 END) AS lpg_amount,
    SUM(CASE WHEN category = 'CYL' THEN line_total ELSE 0 END) AS cyl_amount
  FROM correct_items
  GROUP BY entry_type, tx_date, doc_no
),
daily_items AS (
  SELECT entry_type, tx_date, SUM(lpg_amount) AS lpg_amount, SUM(cyl_amount) AS cyl_amount,
    SUM(lpg_amount + cyl_amount) AS combined_amount, STRING_AGG(LTRIM(doc_no,'0'), ' / ' ORDER BY doc_no) AS docs
  FROM item_docs GROUP BY entry_type, tx_date
),
payments AS (
  SELECT entry_type, tx_date, 0::numeric AS lpg_amount, 0::numeric AS cyl_amount,
    ROUND(SUM(amount_excl + tax_amount), 2) AS combined_amount, STRING_AGG(LTRIM(doc_no,'0'), ' / ' ORDER BY doc_no) AS docs
  FROM transaction_headers
  WHERE account_no IN ('FAM000','FAM002') AND entry_type IN ('Payment', 'Bank XFer')
  GROUP BY entry_type, tx_date
),
bf_val AS (
  SELECT ROUND(
    COALESCE((SELECT SUM(line_total) FROM correct_items WHERE tx_date < '2026-03-01'), 0)
    + COALESCE((SELECT SUM(amount_excl+tax_amount) FROM transaction_headers
      WHERE account_no IN ('FAM000','FAM002') AND entry_type IN ('Payment', 'Bank XFer') AND tx_date < '2026-03-01'), 0)
  , 2) AS bf_balance
),
all_txns AS (
  SELECT * FROM daily_items UNION ALL SELECT * FROM payments
),
statement AS (
  SELECT 0 AS sort_key, entry_type AS "Entry Type", tx_date AS "Date", lpg_amount AS "LPG (R)", cyl_amount AS "CYL (R)", combined_amount AS "Total (R)", docs AS "Doc #",
    ROUND((SELECT bf_balance FROM bf_val) + SUM(combined_amount) OVER (ORDER BY tx_date, docs ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS "Balance (R)"
  FROM all_txns WHERE tx_date >= '2026-03-01'
),
with_bf AS (
  SELECT -1 AS sort_key, 'Balance B/F' AS "Entry Type", DATE '2026-02-28' AS "Date", NULL::numeric AS "LPG (R)", NULL::numeric AS "CYL (R)", NULL::numeric AS "Total (R)", '—' AS "Doc #", (SELECT bf_balance FROM bf_val) AS "Balance (R)"
  UNION ALL SELECT * FROM statement
)
SELECT "Entry Type", "Date", "LPG (R)", "CYL (R)", "Total (R)", "Balance (R)", "Doc #"
FROM with_bf ORDER BY sort_key, "Date", "Doc #";
"""

sql_cyl_audit = """
SELECT 
    tx_date AS "Date", 
    doc_no AS "Doc #", 
    account_no AS "Account", 
    stock_no AS "SKU",
    CASE WHEN entry_type = 'Invoice' THEN 'Out (Delivered)' ELSE 'In (Returned)' END AS "Action",
    qty AS "Qty", 
    SUM(qty) OVER (
        PARTITION BY stock_no 
        ORDER BY 
            tx_date ASC, 
            CASE WHEN entry_type = 'Invoice' THEN 1 ELSE 2 END ASC,
            doc_no ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS "Running Outstanding"
FROM vw_clean_transactions
WHERE account_no IN ('FAM000', 'FAM002') AND debt_group = 'CYL'
ORDER BY stock_no, tx_date, CASE WHEN entry_type = 'Invoice' THEN 1 ELSE 2 END, doc_no;
"""

print("Connecting to db...")
engine = create_engine(SUPABASE_URL)

with engine.connect() as conn:
    print("Executing queries...")
    df_statement = pd.read_sql_query(sql_statement, conn)
    df_cyl_audit = pd.read_sql_query(sql_cyl_audit, conn)

print("Queries executed. Formatting data...")
df_cyl_14 = df_cyl_audit[df_cyl_audit['SKU'] == '14.1']
df_cyl_19 = df_cyl_audit[df_cyl_audit['SKU'] == '19.1']
df_cyl_9 = df_cyl_audit[df_cyl_audit['SKU'] == '9.1']
df_cyl_d = df_cyl_audit[df_cyl_audit['SKU'] == 'D.1']
df_cyl_s = df_cyl_audit[df_cyl_audit['SKU'] == 'S.1']

output_file = 'analysis/debtors/FAM000/raw/FAM000_Final_Recon_Export.xlsx'
print(f"Writing Excel file to {output_file}...")

with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    df_statement.to_excel(writer, sheet_name='Statement of Account', index=False)
    df_cyl_14.to_excel(writer, sheet_name='14kg Cylinder Ledger', index=False)
    df_cyl_19.to_excel(writer, sheet_name='19kg Cylinder Ledger', index=False)
    df_cyl_9.to_excel(writer, sheet_name='9kg Cylinder Ledger', index=False)
    df_cyl_d.to_excel(writer, sheet_name='Double-Valve Ledger', index=False)
    df_cyl_s.to_excel(writer, sheet_name='Single-Valve Ledger', index=False)

print("Done!")
