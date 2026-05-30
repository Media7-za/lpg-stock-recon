import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
from collections import defaultdict

SUPABASE_URL = "postgresql+psycopg2://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

def run_zero_cyl_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    # 1. Fetch historical CYL physical quantities prior to 2026-03-01
    skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']
    cyl_opening_balances = {s: 0 for s in skus}
    
    with engine.connect() as conn:
        df_hist_cyl = pd.read_sql_query(text("""
            SELECT stock_no, SUM(qty) as total_qty
            FROM vw_clean_transactions 
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' 
            AND tx_date < '2026-03-01'
            GROUP BY stock_no
        """), conn)
        
    for _, row in df_hist_cyl.iterrows():
        sku = row['stock_no']
        if sku in cyl_opening_balances:
            cyl_opening_balances[sku] = int(row['total_qty'])
            
    csv_file = 'analysis/debtors/FAM000/raw/FAM000.TXT'
    months_data = defaultdict(list)
    
    # HARDCODED Opening Balance for Part 1 as requested by user
    hardcoded_opening_balance = 18938.31
    
    # 2. Parse the CSV
    parsed_rows = []
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
                        clean_doc = str(doc_no).lstrip('0')
                        d, m, y = date_str.split('/')
                        iso_date = f"{y}-{m}-{d}"
                        
                        if '2026-03-01' <= iso_date <= '2026-05-11':
                            dt = datetime.strptime(iso_date, '%Y-%m-%d')
                            display_date = dt.strftime('%d %b %Y')
                            month_key = dt.strftime('%B %Y')
                            
                            parsed_rows.append({
                                'Month_Key': month_key,
                                'Date_Str': display_date,
                                'ISO_Date': iso_date,
                                'Entry_Type': entry_type,
                                'Doc_No': doc_no,
                                'Clean_Doc': clean_doc,
                                'Amount': amount
                            })
                    except ValueError:
                        pass
    
    # 3. Query DB for CYL movements during this period
    clean_docs_list = [r['Clean_Doc'] for r in parsed_rows if r['Clean_Doc']]
    docs_str = ",".join(f"'{d}'" for d in clean_docs_list) if clean_docs_list else "''"
    
    with engine.connect() as conn:
        df_cyl_tx = pd.DataFrame()
        if clean_docs_list:
            df_cyl_tx = pd.read_sql_query(text(f"""
                SELECT LTRIM(doc_no, '0') as clean_doc, stock_no, entry_type, SUM(qty) as qty
                FROM vw_clean_transactions
                WHERE account_no IN ('FAM000', 'FAM002') 
                AND debt_group = 'CYL' 
                AND LTRIM(doc_no, '0') IN ({docs_str})
                GROUP BY clean_doc, stock_no, entry_type
            """), conn)

    # 4. Process and sort rows
    for r in parsed_rows:
        months_data[r['Month_Key']].append(r)
        
    month_keys = ["March 2026", "April 2026", "May 2026"]
    
    running_gas_balance = hardcoded_opening_balance
    part1_sections = []
    
    current_cyl_bal = dict(cyl_opening_balances)
    part2_sections = []
    
    def fmt(x): return f"{x:,.2f}"

    for mk in month_keys:
        rows = months_data.get(mk, [])
        if not rows:
            continue
            
        rows.sort(key=lambda x: (x['ISO_Date'], 1 if x['Entry_Type'] == 'Crd Note' else 0, x['Doc_No']))
        
        # Financials
        month_opening = running_gas_balance
        for r in rows:
            running_gas_balance += r['Amount']
            r['Running_Gas_Balance'] = running_gas_balance
            
        closing_balance = running_gas_balance
        total_inv = sum(r['Amount'] for r in rows if r['Entry_Type'] == 'Invoice')
        total_pay = sum(r['Amount'] for r in rows if r['Entry_Type'] in ('Payment', 'Ud Paymnt'))
        total_crd = sum(r['Amount'] for r in rows if r['Entry_Type'] == 'Crd Note')
        
        md_stmt = [
            f"### {mk}",
            f"**Financial Mini-Summary:**",
            f"* Opening Balance: **R{fmt(month_opening)}**",
            f"* Total Invoices: **R{fmt(total_inv)}**",
            f"* Total Payments: **R{fmt(total_pay)}**",
            f"* Total Credit Notes: **R{fmt(total_crd)}**",
            f"* Closing Balance: **R{fmt(closing_balance)}**",
            "",
            "| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | | **{fmt(month_opening)}** |"
        ]
        
        for r in rows:
            md_stmt.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Amount'])} | {fmt(r['Running_Gas_Balance'])} |")
            
        part1_sections.append("\n".join(md_stmt))
        
        # Cylinders
        md_cyl = [
            f"### {mk}",
            "| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |",
            "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | **{current_cyl_bal['14.1']}** | **{current_cyl_bal['19.1']}** | **{current_cyl_bal['9.1']}** | **{current_cyl_bal['D.1']}** | **{current_cyl_bal['S.1']}** |"
        ]
        
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
                        change_strs = []
                        for s in skus:
                            c = changes[s]
                            current_cyl_bal[s] += c  # Update cumulative balance
                            if c > 0: change_strs.append(f"+{c}")
                            elif c < 0: change_strs.append(f"{c}")
                            else: change_strs.append("0")
                        md_cyl.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | " + " | ".join(change_strs) + " |")
        
        md_cyl.append(f"| **End {mk[:3]}** | **Closing Balance** | — | **{current_cyl_bal['14.1']}** | **{current_cyl_bal['19.1']}** | **{current_cyl_bal['9.1']}** | **{current_cyl_bal['D.1']}** | **{current_cyl_bal['S.1']}** |")
        part2_sections.append("\n".join(md_cyl))

    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - ZERO-VALUE CYLINDER SCENARIO
**Period:** 1 March 2026 → 11 May 2026

> [!TIP]
> **Scenario Rules:** 
> * **Financials:** Opening Balance for 01 March explicitly hardcoded to **R18,938.31**. Cylinder deposits are assumed to have **R0.00** financial value, so ERP Invoice amounts are taken literally as-is.
> * **Cylinders:** Treated purely as physical assets owing. Cumulative historical balances have been retrieved from the database to establish the physical starting point.

---

## Part 1: Financial Statement (Zero-Value Cylinders)
*Based on the ERP CSV exactly as-is, but overriding the starting balance to R18,938.31 and recalculating chronologically down the page.*

""" + "\n\n---\n\n".join(part1_sections) + f"""

---

## Part 2: Cylinder Physical Asset Tracker
*Cylinders are tracked purely by physical quantity. The Opening Balance on 01 March reflects the all-time historical net quantity owing by the customer up to that date.*

""" + "\n\n---\n\n".join(part2_sections) + "\n"

    with open('analysis/debtors/FAM000/reports/FAM000_CSV_Ground_Truth_Scenario_Zero_Cyl.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_CSV_Ground_Truth_Scenario_Zero_Cyl.md")

if __name__ == "__main__":
    run_zero_cyl_reconciliation()
