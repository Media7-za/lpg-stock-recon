import os
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime

SUPABASE_URL = os.environ['DATABASE_URL']

def run_csv_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    csv_file = 'analysis/debtors/FAM000/raw/FAM000.TXT'
    
    # 1. Parse the CSV Financials
    csv_rows = []
    bf_val = 0.0
    
    # We want to find the running balance as of 28 Feb 2026 on the CSV
    with open(csv_file, 'r') as f:
        in_data = False
        for line in f:
            line = line.strip()
            if 'BALANCE B/F' in line:
                in_data = True
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
                        
                        if iso_date < '2026-03-01':
                            # Keep updating bf_val until we hit March
                            bf_val = balance
                        elif '2026-03-01' <= iso_date <= '2026-05-11':
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
    
    # 2. Extract Document Numbers to Query CYL from DB
    clean_docs = [r['Clean_Doc'] for r in csv_rows if r['Clean_Doc']]
    docs_str = ",".join(f"'{d}'" for d in clean_docs) if clean_docs else "''"
    
    with engine.connect() as conn:
        # Get cylinder B/F as of 28 Feb 2026
        df_cyl_bf = pd.read_sql_query(text(f"""
            SELECT stock_no, SUM(qty) as qty
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' AND tx_date < '2026-03-01'
            GROUP BY stock_no
        """), conn)
        
        # Get cylinder transactions matching the exact CSV documents in the window
        df_cyl_tx = pd.DataFrame()
        if clean_docs:
            df_cyl_tx = pd.read_sql_query(text(f"""
                SELECT LTRIM(doc_no, '0') as clean_doc, stock_no, entry_type, SUM(qty) as qty
                FROM vw_clean_transactions
                WHERE account_no IN ('FAM000', 'FAM002') 
                AND debt_group = 'CYL' 
                AND LTRIM(doc_no, '0') IN ({docs_str})
                GROUP BY clean_doc, stock_no, entry_type
            """), conn)

    # 3. Build Part 1 Markdown
    md_stmt_rows = []
    def fmt(x): return f"{x:,.2f}"

    # B/F row for 28 Feb 2026
    md_stmt_rows.append(f"| **28 Feb 2026** | **Balance B/F** | — | | **{fmt(bf_val)}** |")
    for r in csv_rows:
        md_stmt_rows.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Amount'])} | {fmt(r['Running_Balance'])} |")
        
    # 4. Build Part 2 Markdown
    skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']
    cyl_bf_dict = {row['stock_no']: int(row['qty']) for _, row in df_cyl_bf.iterrows()}
    
    md_cyl_rows = []
    bf_vals = [cyl_bf_dict.get(s, 0) for s in skus]
    md_cyl_rows.append(f"| **28 Feb 2026** | **Balance B/F** | — | " + " | ".join(f"**{v}**" for v in bf_vals) + " |")
    
    current_bals = list(bf_vals)
    
    if not df_cyl_tx.empty:
        for r in csv_rows:
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

    # Calculate summaries
    total_invoices = sum(r['Amount'] for r in csv_rows if r['Entry_Type'] == 'Invoice')
    total_payments = sum(r['Amount'] for r in csv_rows if r['Entry_Type'] in ('Payment', 'Ud Paymnt'))
    total_crd_notes = sum(r['Amount'] for r in csv_rows if r['Entry_Type'] == 'Crd Note')

    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - GROUND TRUTH
**Period:** 1 March 2026 → 11 May 2026

---

## 📊 Statement Summary

### Part 1: Financial Summary (March - May)
* **Starting Balance (28 Feb 2026):** R{bf_val:,.2f}
* **Total Invoices Billed:** R{total_invoices:,.2f}
* **Total Payments Received:** R{total_payments:,.2f}
* **Total Credit Notes:** R{total_crd_notes:,.2f}
* **Closing Account Balance:** **{final_lpg_str}**

### Part 2: Cylinder Deposit Summary
* **Final Outstanding Cylinders:** 14kg: **{current_bals[0]}** | 19kg: **{current_bals[1]}** | 9kg: **{current_bals[2]}** | D.1: **{current_bals[3]}** | S.1: **{current_bals[4]}**
* **Total Deposit Liability:** **{final_cyl_str}**

---

## Part 1: Financial Statement (ERP CSV Ground Truth)
*Parsed directly from the ERP CSV. The `Balance B/F` is the exact closing balance found on the ERP CSV as of 28 Feb 2026.*

| Date | Entry Type | Doc # | Amount (R) | Running Balance (R) |
| :--- | :--- | :--- | ---: | ---: |
""" + "\n".join(md_stmt_rows) + f"""

> [!IMPORTANT]
> **Final Account Balance (per CSV): {final_lpg_str}**

---

## Part 2: Cylinder (CYL) Ledger
*Cylinder quantities extracted from the Database by mapping the exact Document Numbers printed on the CSV between March 1 and May 11.*

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
    
    with open('analysis/debtors/FAM000/reports/FAM000_CSV_Ground_Truth_Mar_May.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_CSV_Ground_Truth_Mar_May.md")

if __name__ == "__main__":
    run_csv_reconciliation()
