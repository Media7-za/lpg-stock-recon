import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
from collections import defaultdict

SUPABASE_URL = "postgresql+psycopg2://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

def run_monthly_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    csv_file = 'analysis/debtors/FAM000/raw/FAM000.TXT'
    
    # We will track data grouped by YYYY-MM
    months_data = defaultdict(list)
    bf_val = 0.0
    
    # 1. Parse the CSV Financials
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
                            bf_val = balance
                        elif '2026-03-01' <= iso_date <= '2026-05-11':
                            dt = datetime.strptime(iso_date, '%Y-%m-%d')
                            display_date = dt.strftime('%d %b %Y')
                            month_key = dt.strftime('%B %Y') # e.g. "March 2026"
                            
                            months_data[month_key].append({
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
    
    # Order of months to process
    month_keys = ["March 2026", "April 2026", "May 2026"]
    
    # Gather all clean docs for SQL Query
    all_clean_docs = []
    for mk in month_keys:
        for r in months_data[mk]:
            if r['Clean_Doc']:
                all_clean_docs.append(r['Clean_Doc'])
                
    docs_str = ",".join(f"'{d}'" for d in all_clean_docs) if all_clean_docs else "''"
    
    with engine.connect() as conn:
        df_cyl_tx = pd.DataFrame()
        if all_clean_docs:
            df_cyl_tx = pd.read_sql_query(text(f"""
                SELECT LTRIM(doc_no, '0') as clean_doc, stock_no, entry_type, SUM(qty) as qty
                FROM vw_clean_transactions
                WHERE account_no IN ('FAM000', 'FAM002') 
                AND debt_group = 'CYL' 
                AND LTRIM(doc_no, '0') IN ({docs_str})
                GROUP BY clean_doc, stock_no, entry_type
            """), conn)

    def fmt(x): return f"{x:,.2f}"
    skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']

    part1_sections = []
    part2_sections = []
    
    running_opening_balance = bf_val

    for mk in month_keys:
        rows = months_data.get(mk, [])
        if not rows:
            continue
            
        # Enforce business rule: sort by date, then ensure Invoices come before Credit Notes
        # We assign Crd Note a priority of 1, everything else 0, so Crd Note goes last on that date
        rows.sort(key=lambda x: (x['ISO_Date'], 1 if x['Entry_Type'] == 'Crd Note' else 0, x['Doc_No']))
        
        # Recalculate the Running Balance dynamically
        current_bal = running_opening_balance
        for r in rows:
            current_bal += r['Amount']
            r['Running_Balance'] = current_bal
            
        # -- Part 1 Data --
        closing_balance = current_bal
        total_inv = sum(r['Amount'] for r in rows if r['Entry_Type'] == 'Invoice')
        total_pay = sum(r['Amount'] for r in rows if r['Entry_Type'] in ('Payment', 'Ud Paymnt'))
        total_crd = sum(r['Amount'] for r in rows if r['Entry_Type'] == 'Crd Note')
        
        md_stmt = [
            f"### {mk}",
            f"**Mini-Summary:**",
            f"* Opening Balance: **R{fmt(running_opening_balance)}**",
            f"* Total Invoices: **R{fmt(total_inv)}**",
            f"* Total Payments: **R{fmt(total_pay)}**",
            f"* Total Credit Notes: **R{fmt(total_crd)}**",
            f"* Closing Balance: **R{fmt(closing_balance)}**",
            "",
            "| Date | Entry Type | Doc # | Amount (R) | Running Balance (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | | **{fmt(running_opening_balance)}** |"
        ]
        
        for r in rows:
            md_stmt.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Amount'])} | {fmt(r['Running_Balance'])} |")
            
        part1_sections.append("\n".join(md_stmt))
        
        # Prepare opening balance for next month
        running_opening_balance = closing_balance
        
        # -- Part 2 Data --
        md_cyl = [
            f"### {mk}",
            "| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |",
            "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |"
        ]
        
        has_cyl_moves = False
        if not df_cyl_tx.empty:
            for r in rows:
                clean_doc = r['Clean_Doc']
                subset = df_cyl_tx[df_cyl_tx['clean_doc'] == clean_doc]
                if not subset.empty:
                    changes = {s: 0 for s in skus}
                    for _, sub_row in subset.iterrows():
                        if sub_row['stock_no'] in skus:
                            changes[sub_row['stock_no']] += int(sub_row['qty'])
                    
                    if sum(abs(v) for v in changes.values()) > 0:
                        has_cyl_moves = True
                        change_strs = []
                        for s in skus:
                            c = changes[s]
                            if c > 0: change_strs.append(f"+{c}")
                            elif c < 0: change_strs.append(f"{c}")
                            else: change_strs.append("0")
                        md_cyl.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | " + " | ".join(change_strs) + " |")
        
        if not has_cyl_moves:
            md_cyl.append("| _No cylinder movements recorded this month_ | | | | | | | |")
            
        part2_sections.append("\n".join(md_cyl))

    # Assemble Document
    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - GROUND TRUTH (MONTHLY)
**Period:** 1 March 2026 → 11 May 2026

---

## Part 1: Financial Statement (ERP CSV Ground Truth)
*Parsed directly from the ERP CSV. Segmented chronologically by month.*

""" + "\n\n---\n\n".join(part1_sections) + f"""

---

## Part 2: Cylinder (CYL) Net Movements
*Cylinder quantities extracted from the Database by mapping the exact Document Numbers printed on the CSV. Shows net monthly movements without cumulative carried balances, as requested.*

""" + "\n\n---\n\n".join(part2_sections) + "\n"

    with open('analysis/debtors/FAM000/reports/FAM000_CSV_Ground_Truth_Monthly.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_CSV_Ground_Truth_Monthly.md")

if __name__ == "__main__":
    run_monthly_reconciliation()
