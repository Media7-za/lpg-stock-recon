import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime
from collections import defaultdict

SUPABASE_URL = "postgresql+psycopg2://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

def run_db_only_reconciliation():
    engine = create_engine(SUPABASE_URL)
    
    # 1. Fetch historical data to dynamically calculate Opening Balance
    with engine.connect() as conn:
        # 1a. Historical Combined Balance (using corrected formula to prevent Credit Note double-taxation)
        hist_header = conn.execute(text("""
            SELECT SUM(CASE WHEN entry_type = 'Crd Note' THEN amount_excl ELSE amount_excl + tax_amount END) as total
            FROM transaction_headers
            WHERE account_no IN ('FAM000', 'FAM002')
            AND tx_date < '2026-03-01'
        """)).fetchone()
        hist_total_debt = float(hist_header[0]) if hist_header[0] is not None else 0.0
        
        # 1b. Historical CYL Value
        hist_cyl = conn.execute(text("""
            SELECT SUM(line_total) as cyl_total
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002')
            AND tx_date < '2026-03-01'
            AND debt_group = 'CYL'
        """)).fetchone()
        hist_cyl_debt = float(hist_cyl[0]) if hist_cyl[0] is not None else 0.0
        
        gas_opening_balance = 18938.31
        
        # 1c. Historical CYL Physical Quantities
        skus = ['14.1', '19.1', '9.1', 'D.1', 'S.1']
        cyl_opening_balances = {s: 0 for s in skus}
        
        df_hist_cyl_qty = pd.read_sql_query(text("""
            SELECT stock_no, SUM(qty) as total_qty
            FROM vw_clean_transactions 
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' 
            AND tx_date < '2026-03-01'
            GROUP BY stock_no
        """), conn)
            
    for _, row in df_hist_cyl_qty.iterrows():
        sku = row['stock_no']
        if sku in cyl_opening_balances:
            cyl_opening_balances[sku] = int(row['total_qty'])

    # 2. Fetch Mar-May data
    with engine.connect() as conn:
        # 2a. Fetch line item sums for Invoices and Credit Notes grouped by doc_no, entry_type, and tx_date to avoid collisions
        df_lines = pd.read_sql_query(text("""
            SELECT 
                tx_date, 
                LTRIM(doc_no, '0') as clean_doc, 
                doc_no, 
                entry_type, 
                debt_group,
                SUM(line_total) as line_sum
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002')
            AND tx_date >= '2026-03-01'
            GROUP BY tx_date, doc_no, entry_type, debt_group
        """), conn)
        
        # 2b. Fetch Payments and other financial-only headers
        df_payments_raw = pd.read_sql_query(text("""
            SELECT 
                tx_date, 
                LTRIM(doc_no, '0') as clean_doc, 
                doc_no, 
                entry_type, 
                (amount_excl + tax_amount) as amount,
                source_file
            FROM transaction_headers
            WHERE account_no IN ('FAM000', 'FAM002')
            AND tx_date >= '2026-03-01'
            AND entry_type IN ('Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep', 'Journal')
        """), conn)
        
        # Consolidate payment splits by grouping by receipt and summing the amounts
        df_pay_grouped = df_payments_raw.groupby(['clean_doc', 'doc_no', 'entry_type', 'tx_date', 'source_file'], as_index=False)['amount'].sum()
        
        # Safe deduplication for duplicate manual uploads (e.g. from april_dump.TXT)
        df_pay_orig = df_pay_grouped[df_pay_grouped['source_file'] != 'april_dump.TXT'].copy()
        df_pay_manual = df_pay_grouped[df_pay_grouped['source_file'] == 'april_dump.TXT'].copy()
        original_keys = set(zip(df_pay_orig['clean_doc'], df_pay_orig['entry_type']))
        df_pay_manual_filtered = df_pay_manual[~df_pay_manual.apply(lambda r: (r['clean_doc'], r['entry_type']) in original_keys, axis=1)]
        df_payments = pd.concat([df_pay_orig, df_pay_manual_filtered], ignore_index=True)
        
        df_payments['amount'] = df_payments['amount'].round(2)
        df_payments.drop_duplicates(subset=['clean_doc', 'entry_type', 'tx_date', 'amount'], inplace=True)
        
        # 2c. Fetch physical cylinder qty changes for Part 2
        df_cyl_qty = pd.read_sql_query(text("""
            SELECT 
                tx_date,
                LTRIM(doc_no, '0') as clean_doc, 
                doc_no,
                entry_type, 
                stock_no, 
                SUM(qty) as qty
            FROM vw_clean_transactions
            WHERE account_no IN ('FAM000', 'FAM002') 
            AND debt_group = 'CYL' 
            AND tx_date >= '2026-03-01'
            GROUP BY tx_date, doc_no, entry_type, stock_no
        """), conn)

    # 3. Process Invoices and Credit Notes
    # Pivot lines to get LPG and CYL sums per document
    doc_gas = defaultdict(float)
    doc_cyl = defaultdict(float)
    doc_meta = {} # key: (clean_doc, entry_type, tx_date) -> doc_no
    
    for _, r in df_lines.iterrows():
        key = (r['clean_doc'], r['entry_type'], pd.to_datetime(r['tx_date']).strftime('%Y-%m-%d'))
        doc_meta[key] = r['doc_no']
        if r['debt_group'] == 'CYL':
            doc_cyl[key] = float(r['line_sum'])
        else:
            doc_gas[key] = float(r['line_sum'])
            
    # Combine everything into months_data
    months_data = defaultdict(list)
    
    # Process Invoices and Credit Notes
    all_keys = set(doc_gas.keys()) | set(doc_cyl.keys())
    for key in all_keys:
        clean_doc, entry_type, iso_date = key
        gas_amount = doc_gas[key]
        cyl_amount = doc_cyl[key]
        doc_no = doc_meta[key]
        
        dt = datetime.strptime(iso_date, '%Y-%m-%d')
        display_date = dt.strftime('%d %b %Y')
        month_key = dt.strftime('%B %Y')
        
        months_data[month_key].append({
            'Month_Key': month_key,
            'Date_Str': display_date,
            'ISO_Date': iso_date,
            'Entry_Type': entry_type,
            'Doc_No': doc_no,
            'Clean_Doc': clean_doc,
            'Gas_Amount': gas_amount,
            'Original_Amount': gas_amount + cyl_amount
        })
        
    # Process Payments
    for _, r in df_payments.iterrows():
        dt = pd.to_datetime(r['tx_date'])
        display_date = dt.strftime('%d %b %Y')
        month_key = dt.strftime('%B %Y')
        iso_date = dt.strftime('%Y-%m-%d')
        
        months_data[month_key].append({
            'Month_Key': month_key,
            'Date_Str': display_date,
            'ISO_Date': iso_date,
            'Entry_Type': r['entry_type'],
            'Doc_No': r['doc_no'],
            'Clean_Doc': r['clean_doc'],
            'Gas_Amount': float(r['amount']),
            'Original_Amount': float(r['amount'])
        })
        
    # Sort month keys chronologically
    def parse_month_key(mk):
        return datetime.strptime(mk, '%B %Y')
    
    month_keys = sorted(months_data.keys(), key=parse_month_key)
    
    running_gas_balance = gas_opening_balance
    part1_sections = []
    
    current_cyl_bal = dict(cyl_opening_balances)
    part2_sections = []
    
    def fmt(x): return f"{x:,.2f}"

    for mk in month_keys:
        rows = months_data.get(mk, [])
        if not rows:
            continue
            
        rows.sort(key=lambda x: (x['ISO_Date'], 1 if x['Entry_Type'] == 'Crd Note' else 0, x['Doc_No']))
        
        # Financials (Part 1)
        month_opening = running_gas_balance
        
        # Only process rows that have a non-zero gas amount for Part 1
        part1_rows = [r for r in rows if abs(r['Gas_Amount']) >= 0.01]
        
        for r in part1_rows:
            running_gas_balance += r['Gas_Amount']
            r['Running_Gas_Balance'] = running_gas_balance
            
        closing_balance = running_gas_balance
        total_inv = sum(r['Gas_Amount'] for r in part1_rows if r['Entry_Type'] == 'Invoice')
        total_pay = sum(r['Gas_Amount'] for r in part1_rows if r['Entry_Type'] not in ('Invoice', 'Crd Note'))
        total_crd = sum(r['Gas_Amount'] for r in part1_rows if r['Entry_Type'] == 'Crd Note')
        
        md_stmt = [
            f"### {mk}",
            f"**Pure Gas Mini-Summary:**",
            f"* Gas Opening Balance: **R{fmt(month_opening)}**",
            f"* Total Gas Invoices: **R{fmt(total_inv)}**",
            f"* Total Payments & Others: **R{fmt(total_pay)}**",
            f"* Total Gas Credit Notes: **R{fmt(total_crd)}**",
            f"* Gas Closing Balance: **R{fmt(closing_balance)}**",
            "",
            "| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | | **{fmt(month_opening)}** |"
        ]
        
        for r in part1_rows:
            md_stmt.append(f"| {r['Date_Str']} | {r['Entry_Type']} | {r['Doc_No']} | {fmt(r['Gas_Amount'])} | {fmt(r['Running_Gas_Balance'])} |")
            
        part1_sections.append("\n".join(md_stmt))
        
        # Cylinders (Part 2) - Uses ALL rows, even if Gas_Amount is 0
        md_cyl = [
            f"### {mk}",
            "| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |",
            "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |",
            f"| **01 {mk[:3]}** | **Opening Balance** | — | **{current_cyl_bal['14.1']}** | **{current_cyl_bal['19.1']}** | **{current_cyl_bal['9.1']}** | **{current_cyl_bal['D.1']}** | **{current_cyl_bal['S.1']}** |"
        ]
        
        for r in rows:
            clean_doc = r['Clean_Doc']
            entry_type = r['Entry_Type']
            iso_date = r['ISO_Date']
            
            # Find cylinder physical changes for this doc
            subset = df_cyl_qty[
                (df_cyl_qty['clean_doc'] == clean_doc) & 
                (df_cyl_qty['entry_type'] == entry_type) & 
                (pd.to_datetime(df_cyl_qty['tx_date']).dt.strftime('%Y-%m-%d') == iso_date)
            ]
            
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

    exec_summary = f"""# Statement of Account: Family Gas (FAM000 / FAM002) - DB-ONLY STRIPPED SCENARIO (CORRECTED)
**Data Source:** Supabase (transaction_headers & vw_clean_transactions)

> [!TIP]
> **Scenario Rules:** 
> * **Financials:** Opening Balance for 01 March dynamically calculated from DB historicals (R{fmt(hist_total_debt)} total - R{fmt(hist_cyl_debt)} CYL = **R{fmt(gas_opening_balance)}** Gas Balance). Cylinder deposits dynamically subtracted. Pure-cylinder documents hidden.
> * **Cylinders:** Treated purely as physical assets owing. Cumulative historical balances retrieved from the database.

---

## Part 1: Financial Statement (Pure LPG Gas - Stripped)

""" + "\n\n---\n\n".join(part1_sections) + f"""

---

## Part 2: Cylinder Physical Asset Tracker

""" + "\n\n---\n\n".join(part2_sections) + "\n"

    with open('analysis/debtors/FAM000/reports/FAM000_DB_Only_Monthly_Stripped.md', 'w') as f:
        f.write(exec_summary)
        
    print("Successfully generated FAM000_DB_Only_Monthly_Stripped.md")

if __name__ == "__main__":
    run_db_only_reconciliation()
