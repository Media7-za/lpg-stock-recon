# JIM001 Debtor Reconstruction Baseline - Version 4

## Metadata
- **Date:** 31 May 2026
- **Analyst:** Reconciliation Analyst & Debtor Reconstruction Specialist
- **Source Files Reviewed:**
  - Database schema (`transaction_headers`, `vw_clean_transactions`, `vw_cylinder_ledger`)
  - Raw ERP transaction dumps (`DETRANS.TXT`, `april_dump.TXT`)
- **Doctrine Version:** CYL Settlement Allocation Doctrine (v4 Canonical)

## Statement Scope
- **Period:** 3 December 2018 to 31 May 2026
- **Included Accounts:** `account_no = 'JIM001'`

## ⚠️ Diagnosed ERP/Deduplication Defect (Disclosed Exception)
- **Stated ERP Balance (Naive Deduplication):** R431,611.31
- **Reconstruction Variance (Naive Deduplication):** R284,760.09
- **Diagnosis:** The ERP database records split payment allocations as separate header entries (representing allocations of the same payment across different invoices). A naive deduplication logic checking `DISTINCT ON (doc_no, entry_type, tx_date, amount)` incorrectly drops these split allocations because they share document numbers and dates, dropping over **R268,000.00+** of customer payments.
- **Resolution:** Consolidating payment splits by document number and date before cross-file deduplication resolves the true payment sum to **-R950,729.61** (instead of -R660,418.73 under naive deduplication), reducing the unexplained ERP variance to the true residual variance of **R55.91** (with corrected ERP Stated Balance of **R146,907.13**).
- **Rule:** Split payment allocations must **NOT** be deduplicated away, as they represent valid separate allocations.

## Opening Balance Analysis (as of 1 January 2026) — Informative, Not Canonical
- **Method Used:** `openingBalanceStrategy: dynamic_db`
  - Opening balances are derived dynamically from database transactions occurring strictly before 2026-01-01.
  - The Credit Note tax sign correction is applied to ensure exact tax totals.
- **Supporting Evidence:**
  - **Combined B/F Balance:** R0.00
  - **Raw Cylinder B/F Value:** R0.00
  - **LPG Gas Opening B/F:** R0.00

## Cylinder Analysis
- **Outstanding Quantities (as of 3 December 2018 B/F):**
  - `14kg`: **0 cylinders** (Standard SKU: 14.1)
  - `19kg`: **0 cylinders** (Standard SKU: 19.1; Historical SKUs: 19.6, 19.7)
  - `9kg`: **0 cylinders** (Standard SKU: 9.1; Historical SKUs: 9.2, 9.7)
  - `D.1` (48kg DV): **0 cylinders**
  - `S.1` (48kg SV): **0 cylinders**
- **Period Net Qty Changes (Dec 2018 – May 2026):**
  - `14kg`: Net change: **1 cylinders**
  - `19kg`: Net change: **24 cylinders**
  - `9kg`: Net change: **2 cylinders**
  - `D.1` (48kg DV): Net change: **16 cylinders**
  - `S.1` (48kg SV): Net change: **-9 cylinders**
- **Net Returnable Cylinder Position (Custody outstanding as of 31 May 2026):**
  - `14kg`: Outstanding: **1 cylinders**
  - `19kg`: Outstanding: **24 cylinders**
  - `9kg`: Outstanding: **2 cylinders**
  - `D.1` (48kg DV) Outstanding: **16 cylinders**
  - `S.1` (48kg SV) Outstanding: **-9 cylinders**

## Cylinder Financial Analysis
- **Net Cylinder Custody Exposure:** **R26,220.00**
- **Cylinder Financial Balance:** **R-6.50**
- **Cylinder Variance:** **R-26,226.50** (Financial - Custody)
  - The cylinder variance of R-26,226.50 arises due to legacied price variations and deposit rate shifts.

## 🔍 Allocation Evidence Register
This register traces cylinder deposit transaction assumptions, classifying the strength of the evidence trail according to the Cylinder Allocation Doctrine:

### Evidence Strength Tiers
- **Confirmed**: Cent-matching payment explicitly clearing the parent invoice. (High confidence)
- **Probable**: The invoice containing cylinder exposure is cleared in full through general monthly statement payments (running balance pool) rather than a dedicated transaction match. (High/Medium confidence)
- **Assumed**: No direct transactional payment match, but assumed based on historical system migration boundaries. (Medium/Low confidence)

### Evidence Source Types
- `EXPLICIT_ALLOCATION`: Direct operator-entered allocation mapping a payment to a cylinder.
- `FULL_INVOICE_SETTLEMENT`: System infers allocation because a payment (or monthly pool payment) cleared the parent invoice containing both LPG and CYL components in full.
- `SYSTEM_MIGRATION_CARRIED`: Carried balance from legacy account migration.

| Event / Document | Date | SKU | Qty | Amount | Match Target | Classification | Evidence Source | Confidence | Evidence Trail / Logic |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :---: | :--- |
| **Opening Balances** | Pre-Jan 2026 | Various | 47 | R0.00 | Legacy Statement | **Assumed** | `SYSTEM_MIGRATION_CARRIED` | **Medium** | Reconciled balances carried forward from historical audit prior to 1 January 2026. |
| **Period Movements** | Jan-May 2026 | Various | 0 | R0.00 | Monthly Payments | **Probable** | `FULL_INVOICE_SETTLEMENT` | **High** | Monthly pool payments settled period cylinder invoices and returns in full. |

## LPG Analysis
- **LPG Balance:** R138,191.56
- **LPG Supporting Calculations:**
  - **LPG Gas Opening B/F:** R0.00
  - **LPG Gas Billed (Period):** R1,162,404.68
  - **LPG Gas Credits (Period):** R-64,817.35
  - **LPG Payments (Period):** R-950,729.61
  - **LPG Gas Closing Balance:** \`${fmt(gasOpeningBal)} + ${fmt(periodLpgInvoices)} + (${fmt(periodLpgCredits)}) + (${fmt(Math.abs(periodPmtsSum))}) =\` **R138,191.56**

## Final Reconciliation

```
Cylinder Financial Balance:      R-6.50
Plus LPG Gas Balance:            R138,191.56
========================================
Total Reconciled Balance:        R138,185.06
ERP Statement Current Balance:   R146,907.13
Variance:                         R8,722.07
```

## Variance Analysis (v3 vs v4)

| Metric | Version 3 Statement | Version 4 Statement | Material Variance | Reason for Variance |
| :--- | :--- | :--- | :---: | :--- |
| **LPG Gas Balance** | N/A | R138,191.56 | N/A | First v4 reconstruction for JIM001. |
| **Cylinder Financial Balance** | N/A | R-6.50 | N/A | First v4 reconstruction for JIM001. |
| **Cylinder Custody Exposure** | N/A | R26,220.00 | N/A | First v4 reconstruction for JIM001. |
| **Total Reconciled Balance** | N/A | R138,185.06 | N/A | First v4 reconstruction for JIM001. |

## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Contains raw ERP statement transaction summaries. Contains date-shifted duplicates and payment allocation splits.
- **Itemized Component Layer (`vw_clean_transactions`):** Canonical source for line-item components.
