import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
from collections import defaultdict

SUPABASE_URL = "postgresql+psycopg2://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

def run_split_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    # 1. Fetch historical CYL value prior to 2026-03-01
    with engine.connect() as conn:
        res = conn.execute(text("""
            SELECT SUM(line_total) as hist_cyl
            FROM vw_clean_transactions 
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' 
            AND tx_date < '2026-03-01'
        """)).fetchone()
        hist_cyl_val = float(res[0]) if res and res[0] else 0.0
        
    csv_file = 'analysis/debtors/FAM000/raw/FAM000.TXT'
    months_data = defaultdict(list)
    csv_bf_val = 0.0
    
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
                        balance = float(parts[10])
                        clean_doc = str(doc_no).lstrip('0')
                        d, m, y = date_str.split('/')
                        iso_date = f"{y}-{m}-{d}"
                        
                        if iso_date < '2026-03-01':
                            csv_bf_val = balance
                        elif '2026-03-01' <= iso_date <= '2026-05-11':
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
                                'Original_Amount': amount,
                                'Original_Balance': balance
                            })
                    except ValueError:
                        pass
    
    gas_opening_balance = csv_bf_val - hist_cyl_val
    
    # 3. Query DB for CYL line totals per document during this period
    clean_docs_list = [r['Clean_Doc'] for r in parsed_rows if r['Clean_Doc']]
    docs_str = ",".join(f"'{d}'" for d in clean_docs_list) if clean_docs_list else "''"
    
    with engine.connect() as conn:
        df_cyl_tx = pd.DataFrame()
        if clean_docs_list:
            df_cyl_tx = pd.read_sql_query(text(f"""
                SELECT LTRIM(doc_no, '0') as clean_doc, stock_no, entry_type, SUM(qty) as qty, SUM(line_total) as cyl_line_total
                FROM vw_clean_transactions
                WHERE account_no IN ('FAM000', 'FAM002') 
                AND debt_group = 'CYL' 
                AND LTRIM(doc_no, '0') IN ({docs_str})
                GROUP BY clean_doc, stock_no, entry_type
            """), conn)
        
    # Group by clean_doc to get total financial CYL value per document
    doc_cyl_val = defaultdict(float)
    if not df_cyl_tx.empty:
        grouped = df_cyl_tx.groupby('clean_doc')['cyl_line_total'].sum()
        for doc, val in grouped.items():
            doc_cyl_val[doc] = float(val)

    # 4. Process and sort rows, split the financials
    for r in parsed_rows:
        if r['Entry_Type'] in ('Payment', 'Ud Paymnt'):
            # 100% to Gas
            gas_amount = r['Original_Amount']
        else:
            # Invoice or Crd Note
            cyl_val = doc_cyl_val.get(r['Clean_Doc'], 0.0)
            gas_amount = r['Original_Amount'] - cyl_val
            
        r['Gas_Amount'] = gas_amount
        r['Cyl_Amount'] = doc_cyl_val.get(r['Clean_Doc'], 0.0)
        months_data[r['Month_Key']].append(r)
        
    month_keys = ["March 2026", "April 2026", "May 2026"]
    
    running_gas_balance = gas_opening_balance
    part1_sections = []
    part2_sections = []
    
    skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']
    def fmt(x): return f"{x:,.2f}"

    for mk in month_keys:
        rows = months_data.get(mk, [])
        if not rows:
            continue
            
        rows.sort(key=lambda x: (x['ISO_Date'], 1 if x['Entry_Type'] == 'Crd Note' else 0, x['Doc_No']))
        
        month_opening = running_gas_balance
        for r in rows:
            running_gas_balance += r['Gas_Amount']
            r['Running_Gas_Balance'] = running_gas_balance
            
        closing_balance = running_gas_balance
        total_inv = sum(r['Gas_Amount'] for r in rows if r['Entry_Type'] == 'Invoice')
        total_pay = sum(r['Gas_Amount'] for r in rows if r['Entry_Type'] in ('Payment', 'Ud Paymnt'))
        total_crd = sum(r['Gas_Amount'] for r in rows if r['Entry_Type'] == 'Crd Note')
        
        md_stmt = [
            f"### {mk}",
            f"**Pure Gas Mini-Summary:**",
            f"* Gas Opening Balance: **R{fmt(month_opening)}**",
            f"* Total Gas Invoices: **R{fmt(total_inv)}**",
            f"* Total Payments: **R{fmt(total_pay)}**",
            f"* Total Gas Credit Notes: **R{fmt(total_crd)}**",
            f"* Gas Closing Balance: **R{fmt(closing_balance)}**",
            "",
            "| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | | **{fmt(month_opening)}** |"
        ]
        
        for r in rows:
            md_stmt.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Gas_Amount'])} | {fmt(r['Running_Gas_Balance'])} |")
            
        part1_sections.append("\n".join(md_stmt))
        
        # CYL part
        md_cyl = [
            f"### {mk}",
            "| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |",
            "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |"
        ]
        
        has_cyl = False
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
                        has_cyl = True
                        change_strs = []
                        for s in skus:
                            c = changes[s]
                            if c > 0: change_strs.append(f"+{c}")
                            elif c < 0: change_strs.append(f"{c}")
                            else: change_strs.append("0")
                        md_cyl.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | " + " | ".join(change_strs) + " |")
        
        if not has_cyl:
            md_cyl.append("| _No cylinder movements recorded this month_ | | | | | | | |")
            
        part2_sections.append("\n".join(md_cyl))

    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - PURE GAS STATEMENT
**Period:** 1 March 2026 → 11 May 2026

> [!TIP]
> **Historical Extraction:** 
> * Original ERP CSV Starting Balance (1 Mar): **R{fmt(csv_bf_val)}**
> * Historical Cylinder Deposit Debt (pre-1 Mar): **R{fmt(hist_cyl_val)}**
> * Derived "Pure Gas" Starting Balance (1 Mar): **R{fmt(gas_opening_balance)}**

---

## Part 1: Financial Statement (Pure LPG Gas)
*Financial values dynamically subtracted from the ERP CSV. Cylinder deposits have been removed from Invoices and Credit Notes. All Payments are applied 100% to this Gas ledger.*

""" + "\n\n---\n\n".join(part1_sections) + f"""

---

## Part 2: Cylinder (CYL) Net Movements
*Cylinder quantities extracted from the Database.*

""" + "\n\n---\n\n".join(part2_sections) + "\n"

    with open('analysis/debtors/FAM000/reports/FAM000_CSV_Ground_Truth_Monthly_Split.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_CSV_Ground_Truth_Monthly_Split.md")

if __name__ == "__main__":
    run_split_reconciliation()
