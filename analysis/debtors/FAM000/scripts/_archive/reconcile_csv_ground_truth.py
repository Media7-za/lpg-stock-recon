import os
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime

SUPABASE_URL = os.environ['DATABASE_URL']

def run_csv_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    csv_file = 'analysis/debtors/FAM000/raw/erp_statement_fam000.csv'
    
    # 1. Parse the CSV Financials
    csv_rows = []
    bf_val = 0.0
    first_iso_date = '2026-03-01'
    
    with open(csv_file, 'r') as f:
        in_data = False
        for line in f:
            line = line.strip()
            if 'BALANCE B/F' in line:
                in_data = True
                parts = line.split(',')
                bf_val = float(parts[-1].replace('"', ''))
                continue
            if in_data and line and not line.startswith('--'):
                parts = [p.replace('"', '') for p in line.split(',')]
                if len(parts) >= 11:
                    doc_no = parts[2]
                    entry_type = parts[3]
                    date_str = parts[4]
                    try:
                        amount = float(parts[9])
                        balance = float(parts[10])
                        clean_doc = str(doc_no).lstrip('0')
                        
                        d, m, y = date_str.split('/')
                        iso_date = f"{y}-{m}-{d}"
                        dt = datetime.strptime(iso_date, '%Y-%m-%d')
                        display_date = dt.strftime('%d %b %Y')
                        
                        csv_rows.append({
                            'Date_Str': display_date,
                            'ISO_Date': iso_date,
                            'Entry_Type': entry_type,
                            'Doc_No': doc_no,
                            'Clean_Doc': clean_doc,
                            'Amount': amount,
                            'Running_Balance': balance
                        })
                    except ValueError:
                        pass
    
    df_financials = pd.DataFrame(csv_rows)
    final_balance = df_financials.iloc[-1]['Running_Balance'] if not df_financials.empty else bf_val
    
    # Calculate CSV Balance B/F as of 28 Feb 2026
    # It is the running balance of the last row before 2026-03-01
    df_before_march = df_financials[df_financials['ISO_Date'] < '2026-03-01']
    if not df_before_march.empty:
        march_bf_val = df_before_march.iloc[-1]['Running_Balance']
    else:
        march_bf_val = bf_val
        
    df_march_onwards = df_financials[df_financials['ISO_Date'] >= '2026-03-01']
    
    # 2. Extract Document Numbers to Query CYL from DB
    clean_docs = [r['Clean_Doc'] for r in csv_rows if r['Clean_Doc']]
    if not clean_docs:
        print("No docs found in CSV.")
        return
        
    docs_str = ",".join(f"'{d}'" for d in clean_docs)
    
    with engine.connect() as conn:
        # Get cylinder B/F (everything before 2026-03-01)
        df_cyl_bf = pd.read_sql_query(text(f"""
            SELECT stock_no, SUM(qty) as qty
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' AND tx_date < '2026-03-01'
            GROUP BY stock_no
        """), conn)
        
        # Get cylinder transactions matching the exact CSV documents on or after 2026-03-01
        # Wait, the user wants the CYL ledger to also start from March 2026.
        # But the CYL queries should fetch all CYL movements on/after 2026-03-01, mapped to the docs in the CSV.
        df_cyl_tx = pd.read_sql_query(text(f"""
            SELECT LTRIM(doc_no, '0') as clean_doc, stock_no, entry_type, SUM(qty) as qty
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' 
            AND LTRIM(doc_no, '0') IN ({docs_str})
            AND tx_date >= '2026-03-01'
            GROUP BY clean_doc, stock_no, entry_type
        """), conn)

    # 3. Build Part 1 Markdown
    md_stmt_rows = []
    
    def fmt(x): return f"{x:,.2f}"

    # B/F row for March
    md_stmt_rows.append(f"| **28 Feb 2026** | **Balance B/F** | — | | **{fmt(march_bf_val)}** |")
    for _, r in df_march_onwards.iterrows():
        md_stmt_rows.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Amount'])} | {fmt(r['Running_Balance'])} |")
        
    # 4. Build Part 2 Markdown
    skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']
    cyl_bf_dict = {row['stock_no']: int(row['qty']) for _, row in df_cyl_bf.iterrows()}
    
    md_cyl_rows = []
    bf_vals = [cyl_bf_dict.get(s, 0) for s in skus]
    md_cyl_rows.append(f"| **28 Feb 2026** | **Balance B/F** | — | " + " | ".join(f"**{v}**" for v in bf_vals) + " |")
    
    current_bals = list(bf_vals)
    
    for _, r in df_march_onwards.iterrows():
        clean_doc = r['Clean_Doc']
        doc_no = r['Doc_No']
        date_str = r['Date_Str']
        entry_type = r['Entry_Type']
        
        subset = df_cyl_tx[df_cyl_tx['clean_doc'] == clean_doc]
        if not subset.empty:
            changes = {s: 0 for s in skus}
            for _, sub_row in subset.iterrows():
                if sub_row['stock_no'] in skus:
                    changes[sub_row['stock_no']] += int(sub_row['qty'])
            
            if sum(abs(v) for v in changes.values()) == 0:
                continue
                
            change_strs = []
            for i, s in enumerate(skus):
                c = changes[s]
                current_bals[i] += c
                if c > 0: change_strs.append(f"+{c}")
                elif c < 0: change_strs.append(f"{c}")
                else: change_strs.append("0")
                
            md_cyl_rows.append(f"| {date_str} | {entry_type} | {doc_no} | " + " | ".join(change_strs) + " |")

    md_cyl_rows.append(f"| **TOTAL OUTSTANDING** | — | — | " + " | ".join(f"**{v}**" for v in current_bals) + " |")
    
    deposit_val = current_bals[0]*550 + current_bals[2]*450 + current_bals[4]*1050
    final_cyl_str = f"R{abs(deposit_val):,.2f} {'Debt' if deposit_val >= 0 else 'Credit'}"
    final_lpg_str = f"R{abs(final_balance):,.2f} {'Debt' if final_balance >= 0 else 'Credit'}"
    final_net_val = final_balance + deposit_val
    final_net = f"R{abs(final_net_val):,.2f} {'Debt' if final_net_val >= 0 else 'Credit'}"

    # 5. Write Executive Summary
    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - GROUND TRUTH
**Period:** March 2026 → Latest

---

## ⚠️ Methodology: ERP Statement as Absolute Ground Truth

Per instruction, this Stacked Statement perfectly mirrors the logic, truncation rules, and financial amounts presented in the ERP Statement CSV.

Because the ERP CSV dynamically truncates historical records and enforces an arbitrary starting `Balance B/F`, it is mathematically impossible to recreate this final balance by organically querying the Database's history. 

Therefore, **Part 1 (The Financial Ledger)** is constructed directly by parsing the explicit lines found in the CSV. **Part 2 (The Cylinder Ledger)** is constructed by taking those exact document numbers from the CSV and querying the Database to extract the underlying cylinder quantities (which the CSV omitted).

---

## Part 1: Financial Statement
*Parsed directly from ERP CSV. The `Balance B/F` is the ERP's running balance as of 28 February 2026.*

| Date | Entry Type | Doc # | Amount (R) | Running Balance (R) |
| :--- | :--- | :--- | ---: | ---: |
""" + "\n".join(md_stmt_rows) + f"""

> [!IMPORTANT]
> **Final Account Balance (per CSV): {final_lpg_str}**

---

## Part 2: Cylinder (CYL) Ledger
*Extracted from the Database by mapping the exact Document Numbers printed on the CSV.*

| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
""" + "\n".join(md_cyl_rows) + f"""

> [!TIP]
> **Final CYL Deposit Value (Net Balances Only): {final_cyl_str}**

---

## 🧮 Final Reconciliation

* **CSV Final Balance:** {final_lpg_str}
* **CYL Deposit Debt:** {final_cyl_str}
* **Combined Total Liability: {final_net}**
"""
    
    with open('analysis/debtors/FAM000/reports/FAM000_CSV_Ground_Truth_Statement.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_CSV_Ground_Truth_Statement.md")

if __name__ == "__main__":
    run_csv_reconciliation()
