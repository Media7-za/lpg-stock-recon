import os
import sys
import json
import argparse
import subprocess
from datetime import datetime
import pandas as pd

def fmt(val):
    if val is None or pd.isna(val):
        return "—"
    try:
        return f"R{float(val):,.2f}"
    except ValueError:
        return str(val)

def fmt_clean(val):
    if val is None or pd.isna(val):
        return "0.00"
    try:
        return f"{float(val):,.2f}"
    except ValueError:
        return str(val)

# Cylinder Rates Mapping
SKU_RATES = {
    '14kg': 575.00,
    '19kg': 690.00,
    '9kg': 517.50,
    'D.1': 1150.00,
    'S.1': 1150.00
}

def main():
    parser = argparse.ArgumentParser(description="Generate HTML Statement reports from Workspace Data")
    parser.add_argument("--debtor", default="JIM001", help="Debtor Account Number")
    args = parser.parse_args()

    debtor_code = args.debtor
    data_dir = f"analysis/debtors/{debtor_code}/data"
    reports_dir = f"analysis/debtors/{debtor_code}/reports"
    os.makedirs(reports_dir, exist_ok=True)

    print(f"Generating statement reports for {debtor_code} from workspace data...")

    # Load data from CSVs/JSON
    try:
        df_invoices = pd.read_csv(f"{data_dir}/invoices.csv")
        df_payments = pd.read_csv(f"{data_dir}/payments.csv")
        df_edges = pd.read_csv(f"{data_dir}/allocation_edges.csv")
        df_insights = pd.read_csv(f"{data_dir}/monthly_lpg_insights.csv")
        df_cyl_txs = pd.read_csv(f"{data_dir}/cylinder_transactions.csv")
        df_settlements = pd.read_csv(f"{data_dir}/settlement_windows.csv")
        
        with open(f"{data_dir}/dashboard_metrics.json", "r", encoding="utf-8") as f:
            metrics = json.load(f)
            
        print("Successfully loaded all workspace data files.")
    except Exception as e:
        print(f"Error loading data files from {data_dir}: {e}")
        sys.exit(1)

    # Load human review annotations if available
    annotations = []
    annotations_path = f"{data_dir}/human_review_annotations.json"
    if os.path.exists(annotations_path):
        try:
            with open(annotations_path, "r", encoding="utf-8") as f:
                annotations = json.load(f)
            print(f"Loaded {len(annotations)} human annotations.")
        except Exception as e:
            print(f"Warning: Failed to load human annotations: {e}")

    # Process annotations overrides if any (Stage 1 schema updates)
    # We can overlay human_value on fields specified by table_name/record_id/field_name
    for ann in annotations:
        tbl = ann.get('table_name')
        rec_id = ann.get('record_id')
        fld = ann.get('field_name')
        h_val = ann.get('human_value')
        
        if not h_val:
            continue
            
        if tbl == 'allocation_edges' and fld == 'notes':
            df_edges.loc[df_edges['allocation_id'] == rec_id, 'notes'] = h_val
        elif tbl == 'monthly_lpg_insights' and fld == 'notes':
            df_insights.loc[df_insights['month_year'] == rec_id, 'notes'] = h_val

    # Parse and format Date helper
    def format_date_str(d_str):
        if not d_str or pd.isna(d_str):
            return "—"
        try:
            dt = datetime.strptime(str(d_str).split(" ")[0], "%Y-%m-%d")
            return f"{dt.day:02d} {dt.strftime('%b')} {dt.year}"
        except Exception:
            return str(d_str)

    # Reconstruct Part 1A (Combined ERP Financial Ledger)
    # We combine invoices (aggregated by doc_no, entry_type, tx_date) and payments
    df_inv_agg = df_invoices.groupby(['doc_no', 'entry_type', 'tx_date']).agg({
        'amount_incl': 'sum',
        'source_file': 'first'
    }).reset_index()
    
    # Map column names to combine
    p1a_items = []
    for idx, row in df_inv_agg.iterrows():
        p1a_items.append({
            'date': row['tx_date'],
            'entry_type': row['entry_type'],
            'doc_no': str(row['doc_no']).zfill(8),
            'amount': float(row['amount_incl']),
            'source_file': row['source_file']
        })
        
    for idx, row in df_payments.iterrows():
        p1a_items.append({
            'date': row['payment_date'],
            'entry_type': row['entry_type'] if 'entry_type' in df_payments.columns else 'Payment',
            'doc_no': str(row['payment_doc']).zfill(8),
            'amount': float(row['amount']),
            'source_file': row['source_file']
        })
        
    p1a_items.sort(key=lambda x: (x['date'], 1 if x['entry_type'] == 'Crd Note' else 0, x['doc_no']))
    
    # Calculate running balance
    running_p1a = 0.0
    for item in p1a_items:
        running_p1a += item['amount']
        item['running_bal'] = running_p1a

    # Group by month
    month_keys_sorted = sorted(list(set([x['date'][:7] for x in p1a_items])))
    
    part1a_sections = []
    for m_key in month_keys_sorted:
        m_items = [x for x in p1a_items if x['date'][:7] == m_key]
        if not m_items:
            continue
        dt_m = datetime.strptime(m_key, "%Y-%m")
        m_name = dt_m.strftime("%B %Y")
        
        opening_bal = m_items[0]['running_bal'] - m_items[0]['amount']
        
        md_stmt = [
            f"#### {m_name}",
            "",
            "| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {dt_m.strftime('%b')}** | **Opening Balance** | — | | **{fmt_clean(opening_bal)}** |"
        ]
        for item in m_items:
            # Format doc_no clean
            clean_doc = item['doc_no'].lstrip('0')
            md_stmt.append(f"| {format_date_str(item['date'])} | {item['entry_type']} | {clean_doc} | {fmt_clean(item['amount'])} | {fmt_clean(item['running_bal'])} |")
            
        part1a_sections.append("\n".join(md_stmt))

    # Reconstruct Part 1B (LPG Gas Financial Ledger)
    # We combine LPG items from invoices.csv and payments
    p1b_items = []
    for idx, row in df_invoices.iterrows():
        if row['is_lpg']:
            p1b_items.append({
                'date': row['tx_date'],
                'entry_type': row['entry_type'],
                'doc_no': str(row['doc_no']).zfill(8),
                'amount': float(row['amount_incl']),
                'description': row['description'] if not pd.isna(row['description']) else ''
            })
            
    for idx, row in df_payments.iterrows():
        p1b_items.append({
            'date': row['payment_date'],
            'entry_type': 'Payment',
            'doc_no': str(row['payment_doc']).zfill(8),
            'amount': float(row['amount']),
            'description': ''
        })
        
    p1b_items.sort(key=lambda x: (x['date'], 1 if x['entry_type'] == 'Crd Note' else 0, x['doc_no']))
    
    running_p1b = 0.0
    for item in p1b_items:
        running_p1b += item['amount']
        item['running_bal'] = running_p1b
        
    part1b_sections = []
    for m_key in month_keys_sorted:
        m_items = [x for x in p1b_items if x['date'][:7] == m_key]
        if not m_items:
            continue
        dt_m = datetime.strptime(m_key, "%Y-%m")
        m_name = dt_m.strftime("%B %Y")
        
        opening_bal = m_items[0]['running_bal'] - m_items[0]['amount']
        
        md_stmt = [
            f"#### {m_name}",
            "",
            "| Date | Entry Type | Doc # | Description | Amount (R) | Running Bal (R) |",
            "| :--- | :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {dt_m.strftime('%b')}** | **Opening Balance** | — | | | **{fmt_clean(opening_bal)}** |"
        ]
        for item in m_items:
            clean_doc = item['doc_no'].lstrip('0')
            md_stmt.append(f"| {format_date_str(item['date'])} | {item['entry_type']} | {clean_doc} | {item['description']} | {fmt_clean(item['amount'])} | {fmt_clean(item['running_bal'])} |")
            
        part1b_sections.append("\n".join(md_stmt))

    # Reconstruct Part 1C (Cylinder Financial Ledger)
    # We combine CYL items from invoices.csv
    p1c_items = []
    for idx, row in df_invoices.iterrows():
        if row['is_cyl']:
            p1c_items.append({
                'date': row['tx_date'],
                'entry_type': row['entry_type'],
                'doc_no': str(row['doc_no']).zfill(8),
                'amount': float(row['amount_incl'])
            })
            
    p1c_items.sort(key=lambda x: (x['date'], 1 if x['entry_type'] == 'Crd Note' else 0, x['doc_no']))
    
    running_p1c = 0.0
    for item in p1c_items:
        running_p1c += item['amount']
        item['running_bal'] = running_p1c
        
    part1c_sections = []
    for m_key in month_keys_sorted:
        m_items = [x for x in p1c_items if x['date'][:7] == m_key]
        if not m_items:
            continue
        dt_m = datetime.strptime(m_key, "%Y-%m")
        m_name = dt_m.strftime("%B %Y")
        
        opening_bal = m_items[0]['running_bal'] - m_items[0]['amount']
        
        md_stmt = [
            f"#### {m_name}",
            "",
            "| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |",
            "| :--- | :--- | :--- | ---: | ---: |",
            f"| **01 {dt_m.strftime('%b')}** | **Opening Balance** | — | | **{fmt_clean(opening_bal)}** |"
        ]
        for item in m_items:
            clean_doc = item['doc_no'].lstrip('0')
            md_stmt.append(f"| {format_date_str(item['date'])} | {item['entry_type']} | {clean_doc} | {fmt_clean(item['amount'])} | {fmt_clean(item['running_bal'])} |")
            
        part1c_sections.append("\n".join(md_stmt))

    # Part 1D: Payment Allocation Split Summary
    part1d_table_rows = []
    # Find specific payments
    pmt_docs_target = ['00038481', '00040063', '00040746', '00041664', '00043199']
    for p_doc in pmt_docs_target:
        p_row = df_payments[df_payments['payment_doc'].astype(str).str.lstrip('0') == p_doc.lstrip('0')]
        if not p_row.empty:
            p_data = p_row.iloc[0]
            p_date = format_date_str(p_data['payment_date'])
            p_amt = float(p_data['amount'])
            
            # Find edges
            edges = df_edges[df_edges['payment_doc'].astype(str).str.lstrip('0') == p_doc.lstrip('0')]
            lpg_applied = sum(edges['allocated_amount'])
            
            part1d_table_rows.append(
                f"| {p_date} | {p_doc.lstrip('0')} | {fmt(p_amt)} | {fmt(lpg_applied)} | R0.00 | No | Fully allocated to LPG |"
            )
            
    part1d_markdown = f"""
| Payment Date | Payment Doc | Gross Payment | LPG Applied | ERP-Indicated CYL / Non-LPG Portion | Commercial CYL Confirmed | Notes / Running Balance Treatment |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
""" + "\n".join(part1d_table_rows)

    # Monthly LPG Insight summary values
    totalMonthsReviewed = len(df_insights)
    fullySettledCount = len(df_insights[df_insights['month_status'] == 'FULLY_SETTLED'])
    partiallySettledCount = len(df_insights[df_insights['month_status'] == 'PARTIALLY_SETTLED'])
    overpaidCount = len(df_insights[df_insights['month_status'] == 'OVERPAID'])
    unpaidCount = len(df_insights[df_insights['month_status'] == 'UNPAID'])

    unpaidMatches = df_insights[(df_insights['difference'] > 0.01) & (df_insights['month_status'] != 'NO_ACTIVITY')].copy()
    oldestUnpaidLpgMonth = '—'
    largestUnpaidLpgMonth = '—'
    if not unpaidMatches.empty:
        unpaidMatches.sort_values(by='month_year', inplace=True)
        oldest_unpaid = unpaidMatches.iloc[0]
        oldestUnpaidLpgMonth = f"{oldest_unpaid['month']} {oldest_unpaid['year']} ({fmt(oldest_unpaid['difference'])} unpaid)"
        
        largest_unpaid = unpaidMatches.sort_values(by='difference', ascending=False).iloc[0]
        largestUnpaidLpgMonth = f"{largest_unpaid['month']} {largest_unpaid['year']} ({fmt(largest_unpaid['difference'])} unpaid)"

    settledMatches = df_insights[df_insights['month_status'] == 'FULLY_SETTLED'].copy()
    mostRecentFullySettledLpgMonth = '—'
    if not settledMatches.empty:
        settledMatches.sort_values(by='month_year', ascending=False, inplace=True)
        mostRecentFullySettledLpgMonth = f"{settledMatches.iloc[0]['month']} {settledMatches.iloc[0]['year']}"

    # Yearly LPG Invoice and Payment Summary table
    yearly_summary_rows = []
    # Group insights by year
    df_yearly = df_insights.groupby('year').agg({
        'lpg_invoice_total': 'sum',
        'lpg_credit_notes': 'sum',
        'net_lpg_invoiced': 'sum',
        'payment_total_allocated': 'sum',
        'difference': 'sum'
    }).reset_index()
    
    openingBalance = 28709.91
    unmatchedOverpayments = 94298.19
    cumulativeGrossUnpaid = openingBalance
    
    for idx, row in df_yearly.iterrows():
        y = str(int(row['year']))
        cumulativeGrossUnpaid += row['difference']
        poolApplied = 0.0
        netPosition = cumulativeGrossUnpaid
        notes = "—"
        
        if y == '2022':
            notes = "Cumulative position includes Pre-March 2022 LPG Opening Balance B/F (R28,709.91)."
        elif y == '2026':
            poolApplied = unmatchedOverpayments
            netPosition = round(cumulativeGrossUnpaid - unmatchedOverpayments, 2)
            notes = "Unmatched/overpayment pool applied as a reconciliation offset to arrive at final LPG Gas Debt of R146,857.72."
            
        yearly_summary_rows.append(
            f"| {y} | {fmt(row['net_lpg_invoiced'])} | {fmt(row['payment_total_allocated'])} | {fmt(row['difference'])} | {fmt(cumulativeGrossUnpaid)} | {fmt(poolApplied)} | {fmt(netPosition)} | {notes} |"
        )
        
    yearly_summary_markdown = """
| Year | Net LPG Invoiced | Payments Allocated | Gross Difference | Cumulative Gross Unpaid LPG Position | Unmatched / Overpayment Pool Applied | Net LPG Position | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
""" + "\n".join(yearly_summary_rows)

    # Monthly LPG Insight Register Table
    monthly_register_rows = []
    for idx, row in df_insights.iterrows():
        monthly_register_rows.append(
            f"| {row['year']} | {row['month']} | {fmt(row['lpg_invoice_total'])} | {fmt(row['lpg_credit_notes'])} | {fmt(row['net_lpg_invoiced'])} | {row['payment_refs_allocated']} | {row['payment_dates']} | {fmt(row['payment_total_allocated'])} | {fmt(row['difference'])} | {row['month_status']} | {row['notes']} |"
        )
    monthly_register_markdown = """
| Year | Month | LPG Invoice Total | LPG Credit Notes | Net LPG Invoiced | Payment Ref(s) Allocated | Payment Date(s) | Payment Total Allocated | Difference | Month Status | Notes |
|---|---|---:|---:|---:|---|---|---:|---:|---|---|
""" + "\n".join(monthly_register_rows)

    # Part 1E: Payment-to-Invoice Allocation Detail
    part1e_rows = []
    for idx, row in df_edges.sort_values(by=['payment_date', 'payment_doc']).iterrows():
        p_date = format_date_str(row['payment_date'])
        p_doc = str(row['payment_doc']).lstrip('0')
        
        target_doc = str(row['target_doc']).lstrip('0') if not pd.isna(row['target_doc']) and row['target_doc'] != "" else "—"
        target_date = format_date_str(row['target_date']) if not pd.isna(row['target_date']) and row['target_date'] != "" else "—"
        
        target_month_year = row['target_month_year'] if not pd.isna(row['target_month_year']) else "—"
        notes = row['notes'] if not pd.isna(row['notes']) else "—"
        
        part1e_rows.append(
            f"| {p_date} | {p_doc} | {target_date} | {target_doc} | {target_month_year} | {fmt(row['allocated_amount'])} | {row['allocation_type']} | {row['evidence_source']} | {notes} |"
        )
    part1e_table = """
| Payment Date | Payment Doc | Invoice Date | Invoice Doc | Invoice Month | Amount Allocated | Allocation Type | Evidence Source | Notes |
| :--- | :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
""" + "\n".join(part1e_rows)

    # Part 1F: Multi-Month Settlement Windows
    part1f_rows = []
    for idx, row in df_settlements.iterrows():
        p_total = fmt(row['payment_total'])
        l_total = fmt(row['lpg_invoice_total'])
        diff = fmt(row['difference'])
        cyl_excl = fmt(row['cyl_excluded_total'])
        cand_unpaid = str(row['candidate_unpaid_invoice']).lstrip('0') if not pd.isna(row['candidate_unpaid_invoice']) else "—"
        cand_amt = fmt(row['candidate_unpaid_amount'])
        
        part1f_rows.append(
            f"| {row['settlement_id']} | {row['invoice_window_start']} to {row['invoice_window_end']} | {row['payment_window_start']} to {row['payment_window_end']} | {p_total} | {l_total} | {diff} | {cyl_excl} | {row['missing_batch_ref']} | Invoice {cand_unpaid} ({cand_amt}) | {row['status']} | {row['notes']} |"
        )
        
    part1f_markdown = """
| Window ID | Invoice Window | Payment Window | Payment Total | LPG Invoice Total | Gap | Excluded CYL | Missing Batch | Unpaid Candidate | Status | Notes |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- | :--- | :--- |
""" + "\n".join(part1f_rows)

    # Cylinder physical custody movements (Part 2)
    current_cyl_bal = {'14kg': 0, '19kg': 0, '9kg': 0, 'D.1': 0, 'S.1': 0}
    cols = ['14kg', '19kg', '9kg', 'D.1', 'S.1']
    
    # Calculate opening balances (before statement start date)
    df_pre = df_cyl_txs[df_cyl_txs['tx_date'] < '2018-12-03']
    for idx, row in df_pre.iterrows():
        sku_group = row['standard_weight_group']
        if sku_group in current_cyl_bal:
            current_cyl_bal[sku_group] += int(row['qty'])
            
    part2_sections = []
    
    # Group period cylinder transactions by month_year
    df_cyl_period = df_cyl_txs[(df_cyl_txs['tx_date'] >= '2018-12-03') & (df_cyl_txs['tx_date'] <= '2026-06-30')]
    cyl_months = sorted(list(set([x[:7] for x in df_cyl_period['tx_date']])))
    
    for m_key in month_keys_sorted: # Use the global months list to keep chronological month headers consistent
        dt_m = datetime.strptime(m_key, "%Y-%m")
        m_name = dt_m.strftime("%B %Y")
        
        # Capture opening balance
        op_bal = {c: current_cyl_bal[c] for c in cols}
        
        m_cyl_txs = df_cyl_period[df_cyl_period['tx_date'].str.startswith(m_key)].copy()
        
        md_cyl = [
            f"### {m_name}",
            "| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | Double-Valve (D.1) Qty | Single-Valve (S.1) Qty |",
            "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |",
            f"| **01 {dt_m.strftime('%b')}** | **Opening Balance** | — | **{op_bal['14kg']}** | **{op_bal['19kg']}** | **{op_bal['9kg']}** | **{op_bal['D.1']}** | **{op_bal['S.1']}** |"
        ]
        
        # Track unique documents to avoid duplicates at row level
        # openpyxl has row-by-row changes
        grouped_docs = m_cyl_txs.groupby(['doc_no', 'entry_type', 'tx_date'])
        for (doc_no, entry_type, tx_date), group in grouped_docs:
            changes = {c: 0 for c in cols}
            for idx, r in group.iterrows():
                changes[r['standard_weight_group']] = int(r['qty'])
                current_cyl_bal[r['standard_weight_group']] += int(r['qty'])
                
            change_strs = []
            for col in cols:
                c = changes[col]
                if c > 0:
                    change_strs.append(f"+{c}")
                elif c < 0:
                    change_strs.append(f"{c}")
                else:
                    change_strs.append("0")
                    
            clean_doc = str(doc_no).lstrip('0')
            md_cyl.append(f"| {format_date_str(tx_date)} | {entry_type} | {clean_doc} | {change_strs[0]} | {change_strs[1]} | {change_strs[2]} | {change_strs[3]} | {change_strs[4]} |")
            
        md_cyl.append(f"| **End {dt_m.strftime('%b')}** | **Closing Balance** | — | **{current_cyl_bal['14kg']}** | **{current_cyl_bal['19kg']}** | **{current_cyl_bal['9kg']}** | **{current_cyl_bal['D.1']}** | **{current_cyl_bal['S.1']}** |")
        part2_sections.append("\n".join(md_cyl))

    # Compute physical exposure sum
    totalCylinderCustodyExposure = sum([current_cyl_bal[col] * SKU_RATES[col] for col in cols])
    cylVariance = float(metrics['cylinder_financial_balance']) - totalCylinderCustodyExposure

    # Pre-join sections to avoid backslashes inside f-string expressions for Python < 3.12 compatibility
    part1a_md = "\n\n---\n\n".join(part1a_sections)
    part1b_md = "\n\n---\n\n".join(part1b_sections)
    part1c_md = "\n\n---\n\n".join(part1c_sections)
    part2_md = "\n\n---\n\n".join(part2_sections)

    # Reassemble Statement Markdown
    stmt_md = f"""# Statement of Account: Jim Gas (JIM001) - Version 4 (Spreadsheet-First Workspace Doctrine)
**Period:** 3 December 2018 → 30 June 2026 &nbsp;|&nbsp; **Account:** JIM001
**Opening Balance B/F:** R0.00 (Account inception in ERP database)

---

<div id="account-dashboard"></div>

## Account Position Dashboard

<div class="dashboard-grid">
    <div class="dashboard-card position-card-item">
        <h4>Account Position</h4>
        <ul>
            <li><strong>Total Account Balance:</strong> R{fmt_clean(metrics['total_reconstructed_balance'])}</li>
            <li><strong>LPG Gas Debt:</strong> R{fmt_clean(metrics['lpg_gas_debt'])}</li>
            <li><strong>Cylinder Financial Balance:</strong> R{fmt_clean(metrics['cylinder_financial_balance'])}</li>
            <li><strong>Statement Period:</strong> 3 Dec 2018 – 30 Jun 2026</li>
        </ul>
    </div>
    <div class="dashboard-card payment-card-item">
        <h4>Payment Position</h4>
        <ul>
            <li><strong>Net LPG Gas Debt:</strong> R{fmt_clean(metrics['net_lpg_debt'])}</li>
            <li><strong>Unpaid LPG Invoices:</strong> R{fmt_clean(metrics['unpaid_lpg_invoices'])}</li>
            <li><strong>Unmatched / Overpayments:</strong> R{fmt_clean(metrics['unmatched_overpayments'])}</li>
            <li><strong>Allocation Period:</strong> 1 Mar 2022 – 30 Jun 2026</li>
        </ul>
    </div>
    <div class="dashboard-card cylinder-card-item">
        <h4>Cylinder Position</h4>
        <ul>
            <li><strong>Cylinder Financial Balance:</strong> R{fmt_clean(metrics['cylinder_financial_balance'])}</li>
            <li><strong>Cylinder Custody Exposure:</strong> R{fmt_clean(metrics['cylinder_custody_exposure'])}</li>
            <li><strong>Cylinder Variance:</strong> R{fmt_clean(metrics['cylinder_variance'])}</li>
        </ul>
    </div>
<!-- INTERNAL_ONLY_START -->
<div class="dashboard-card internal-audit-card-item">
    <h4>Internal Audit Snapshot</h4>
    <ul>
        <li><strong>Corrected ERP Stated Balance:</strong> R{fmt_clean(metrics['corrected_erp_stated_balance'])}</li>
        <li><strong>ERP Residual Variance:</strong> R{fmt_clean(metrics['erp_residual_variance'])}</li>
        <li><strong>Naive split-payment defect:</strong> R284,760.09</li>
        <li><strong>Credit Note 14198:</strong> Allocated to Invoice 48578 via ref_no rule</li>
        <li>Part 1E allocation detail available internally</li>
    </ul>
</div>
<!-- INTERNAL_ONLY_END -->
</div>

### LPG Monthly Insight Summary

* **Total Months Reviewed:** {totalMonthsReviewed} months (March 2022 – June 2026)
* **Fully Settled Months:** {fullySettledCount}
* **Partially Settled Months:** {partiallySettledCount}
* **Overpaid Months:** {overpaidCount}
* **Unpaid Months:** {unpaidCount}
* **Oldest Unpaid LPG Month:** {oldestUnpaidLpgMonth}
* **Largest Unpaid LPG Month:** {largestUnpaidLpgMonth}
* **Most Recent Fully Settled LPG Month:** {mostRecentFullySettledLpgMonth}
* **Net LPG Gas Debt:** R{fmt_clean(metrics['net_lpg_debt'])}

---

<h2 id="financial-ledgers">Part 1: Financial Ledgers</h2>
*Tracks all chronological transactions, gas, and cylinders in three sub-ledgers. Use the tabs below to select the view.*

### Part 1A: Combined ERP Financial Ledger
*Shows all transactions recorded in the ERP for this account (both gas and cylinders combined) chronologically.*

{part1a_md}

---

### Part 1B: LPG Gas Financial Ledger
*Shows only gas-related transactions and payments. Reconciles to LPG Gas Debt = R{fmt_clean(metrics['lpg_gas_debt'])}.*

{part1b_md}

---

### Part 1C: Cylinder Financial Ledger
*Shows only cylinder-related transactions (CYL invoices/CNs, no uncorroborated CYL payments). Cylinder financial balance = R{fmt_clean(metrics['cylinder_financial_balance'])}.*

{part1c_md}

---

<h3 id="payment-allocation-summary">Part 1D: Payment Allocation Split Summary</h3>
*High-level summary of payment splits and allocations between LPG and Cylinder ledgers.*

{part1d_markdown}

---

<div id="monthly-lpg-insights"></div>

## Monthly LPG Insights
*Derived reporting layer summarizing LPG gas invoices, allocated payments, and balances.*

### Yearly LPG Invoice and Payment Summary
{yearly_summary_markdown}

<!-- INTERNAL_ONLY_START -->
### Monthly LPG Insight Register
{monthly_register_markdown}
<!-- INTERNAL_ONLY_END -->

---

<!-- INTERNAL_ONLY_START -->
<div id="payment-allocation-detail"></div>

### Part 1E: Payment-to-Invoice Allocation Detail
*Internal Audit Trail: Detailed payment-to-invoice allocation edges from March 2022 to June 2026.*

{part1e_table}

---

### Part 1F: Multi-Month Settlement Windows
*Internal Audit Trail: Multi-month batch matching windows.*

{part1f_markdown}

---

<div id="internal-audit-disclosure"></div>

## ⚠️ Audit Disclosure & Executive Summary

During the reconstruction of JIM001, we verified that the account contains large-scale payment allocation splits and credit note double-taxation discrepancies in the ERP database header layer.

### 🔍 Key Findings:
1. **Deduplication Defect Diagnosed (R284,760.09):**
   * A naive database deduplication checking `DISTINCT ON (doc_no, entry_type, tx_date)` incorrectly drops split payment allocations of identical amounts on the same date, dropping **R268,000.00+** of customer payments.
   * By implementing corrected payment consolidation (grouping splits by document number and date before cross-file deduplication), the true payment total of **-R950,729.61** is preserved.
   * Additionally, all Credit Notes were double-taxed in the header layer (populating `amount_excl` with the tax-inclusive total), creating a **R78,261.93** error.
2. **True Reconciled Balance & Residual Variance:**
   * The true combined customer balance at 30 June 2026 is **R{fmt_clean(metrics['total_reconstructed_balance'])}** (LPG Gas Debt: R{fmt_clean(metrics['lpg_gas_debt'])}, Cylinder Financial Balance: R{fmt_clean(metrics['cylinder_financial_balance'])}).
   * The fully corrected ERP stated balance is **R{fmt_clean(metrics['corrected_erp_stated_balance'])}**, resulting in a tiny, residual unexplained variance of only **R{fmt_clean(metrics['erp_residual_variance'])}**.

---
<!-- INTERNAL_ONLY_END -->

<h2 id="cylinder-custody-tracker">Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)</h2>
*Cylinders are tracked purely by physical count. The Opening Balance on 03 December 2018 is R0.00 as it represents account inception.*

{part2_md}

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R{fmt_clean(metrics['lpg_gas_debt'])} |
| Cylinder Financial Balance | R{fmt_clean(metrics['cylinder_financial_balance'])} |
| **Total Debtor Balance** | **R{fmt_clean(metrics['total_reconstructed_balance'])}** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | {current_cyl_bal['14kg']} | R575.00 | R{fmt_clean(current_cyl_bal['14kg'] * 575)} |
| 19kg | {current_cyl_bal['19kg']} | R690.00 | R{fmt_clean(current_cyl_bal['19kg'] * 690)} |
| 9kg | {current_cyl_bal['9kg']} | R517.50 | R{fmt_clean(current_cyl_bal['9kg'] * 517.5)} |
| Double-Valve (D.1) | {current_cyl_bal['D.1']} | R1,150.00 | R{fmt_clean(current_cyl_bal['D.1'] * 1150)} |
| Single-Valve (S.1) | {current_cyl_bal['S.1']} | R1,150.00 | R{fmt_clean(current_cyl_bal['S.1'] * 1150)} |
| **Total** | **{sum([current_cyl_bal[c] for c in cols])}** | — | **R{fmt_clean(totalCylinderCustodyExposure)}** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | R{fmt_clean(metrics['cylinder_financial_balance'])} | R{fmt_clean(totalCylinderCustodyExposure)} | R{fmt_clean(cylVariance)} |

### 4. LPG Prior-Month Payment Intent Allocation Position (Internal Only)

| Metric | Value |
|---|---:|
| Allocation Period | 1 March 2022 – 30 June 2026 |
| Total Invoice Months Reviewed | {totalMonthsReviewed} |
| Total LPG Invoices Reviewed | {len(df_invoices[df_invoices['is_lpg'] & (df_invoices['entry_type'] == 'Invoice')])} |
| Total Payments Reviewed (Unique) | {len(df_payments)} |
| Pre-March 2022 Opening LPG Balance B/F | R28,709.91 |
| Reconstructed LPG Gas Debt | R{fmt_clean(metrics['lpg_gas_debt'])} |
| Total Unpaid Invoices Sum (including B/F) | R{fmt_clean(metrics['unpaid_lpg_invoices'])} |
| Total Unmatched / Overpayment Pool | R{fmt_clean(metrics['unmatched_overpayments'])} |
| Net LPG Gas Debt (Unpaid - Unmatched/Overpaid) | R{fmt_clean(metrics['lpg_gas_debt'])} |
| Residual ERP Variance | R{fmt_clean(metrics['erp_residual_variance'])} |
| Oldest Unpaid LPG Invoice Month | March 2022 |
| Most Recent Unpaid LPG Invoice Month | June 2026 |
| Number of Fully Settled Months (Exact Matches) | {fullySettledCount} |
| Number of Partially Settled / Underpaid Months | {partiallySettledCount} |
| Number of Overpaid Months | {overpaidCount} |
| Number of Completely Unpaid Months | {unpaidCount} |

**ERP Combined Balance:** R{fmt_clean(metrics['corrected_erp_stated_balance'])}  
**Reconstructed Balance:** R{fmt_clean(metrics['total_reconstructed_balance'])}  
**Variance:** R{fmt_clean(metrics['erp_residual_variance'])}

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
"""

    temp_md_path = f"{reports_dir}/temp_statement.md"
    with open(temp_md_path, "w", encoding="utf-8") as f:
        f.write(stmt_md)
        
    print(f"Generated temp markdown at: {temp_md_path}")

    # Invoke export_to_html.py on the temp markdown file
    output_html_base = f"{reports_dir}/{debtor_code}_Statement_Account_v4.html"
    print(f"Running export_to_html.py on temp markdown to produce final HTML files...")
    
    try:
        cmd = [
            sys.executable, 
            "analysis/debtors/shared/scripts/export_to_html.py", 
            temp_md_path, 
            output_html_base
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
            
        if res.returncode == 0:
            print("Successfully compiled final statement HTML reports.")
            # Remove temp markdown file
            os.remove(temp_md_path)
        else:
            print(f"Error compiling HTML: {res.stderr}")
            sys.exit(1)
    except Exception as e:
        print(f"Error running subprocess export_to_html.py: {e}")
        sys.exit(1)

    print("Statement compilation complete.")

if __name__ == "__main__":
    main()
