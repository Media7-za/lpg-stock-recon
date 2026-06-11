# TAN001 Debtor Reconstruction Baseline - Version 4

## Metadata
- **Date:** 11 June 2026
- **Analyst:** Reconciliation Analyst & Debtor Reconstruction Specialist
- **Source Files Reviewed:**
  - Database schema (`transaction_headers`, `vw_clean_transactions`, `vw_cylinder_ledger`)
  - Raw ERP transaction dumps (`DETRANS.TXT`, `april_dump.TXT`)
- **Doctrine Version:** CYL Settlement Allocation Doctrine (v4 Canonical)

## Statement Scope
- **Period:** 1 January 2026 to 30 June 2026
- **Included Accounts:** `account_no = 'TAN001'`

## Opening Balance Analysis (as of 1 January 2026) — Informative, Not Canonical
- **Method Used:** `openingBalanceStrategy: dynamic_db`
  - Opening balances are derived dynamically from database transactions occurring strictly before 2026-01-01.
  - The Credit Note tax sign correction is applied to ensure exact tax totals.
- **Supporting Evidence:**
  - **Combined B/F Balance:** R60,355.10
  - **Raw Cylinder B/F Value:** R-6,210.00
  - **LPG Gas Opening B/F:** R66,565.10

## Cylinder Analysis
- **Outstanding Quantities (as of 1 January 2026 B/F):**
  - `19.1` (19kg): **-3 cylinders**
  - `9.1` (9kg): **13 cylinders**
  - `D.1` (48kg DV): **2 cylinders**
  - `S.1` (48kg SV): **-9 cylinders**
- **Period Net Qty Changes (Jan–Jun 2026):**
  - `19.1` (19kg): Net change: **-1 cylinders**
  - `9.1` (9kg): Net change: **0 cylinders**
  - `D.1` (48kg DV): Net change: **0 cylinders**
  - `S.1` (48kg SV): Net change: **5 cylinders**
- **Net Returnable Cylinder Position (Custody outstanding as of 30 June 2026):**
  - `19.1` (19kg) Outstanding: **-4 cylinders**
  - `9.1` (9kg) Outstanding: **13 cylinders**
  - `D.1` (48kg DV) Outstanding: **2 cylinders**
  - `S.1` (48kg SV) Outstanding: **-4 cylinders**

## Cylinder Financial Analysis
- **Net Cylinder Custody Exposure:** **R1,667.50**
- **Cylinder Financial Balance:** **R-862.50**
- **Cylinder Variance:** **R-2,530.00** (Financial - Custody)
  - The cylinder variance of R-2,530.00 arises due to legacied price variations and deposit rate shifts.

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
| **Opening Balances** | Pre-Jan 2026 | Various | -8 | R-6,210.00 | Legacy Statement | **Assumed** | `SYSTEM_MIGRATION_CARRIED` | **Medium** | Reconciled balances carried forward from historical audit prior to 1 January 2026. |
| **Period Movements** | Jan-Jun 2026 | Various | 5 | R5,347.50 | Monthly Payments | **Probable** | `FULL_INVOICE_SETTLEMENT` | **High** | Monthly pool payments settled period cylinder invoices and returns in full. |

## LPG Analysis
- **LPG Balance:** R97,146.68
- **LPG Supporting Calculations:**
  - **LPG Gas Opening B/F:** R66,565.10
  - **LPG Gas Billed (Period):** R71,271.79
  - **LPG Gas Credits (Period):** R-3,190.21
  - **LPG Payments (Period):** R-37,500.00
  - **LPG Gas Closing Balance:** `66,565.10 + 71,271.79 + (-3,190.21) + (37,500.00) =` **R97,146.68**

### Monthly LPG Insight Register
*This register tracks Net LPG Gas Billed vs Payments received. The Net Monthly Change reflects monthly gas debt movements.*

| Month | LPG Invoiced | Credits | Net Invoiced | Payments | Net Monthly Change | Month Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **Opening Balance B/F** | — | — | — | — | — | **R66,565.10** |
| January 2026 | R10,945.42 | R0.00 | R10,945.42 | R-12,000.00 | R-1,054.58 | **Overpaid** |
| February 2026 | R10,809.28 | R0.00 | R10,809.28 | R-9,000.00 | R1,809.28 | **Underpaid** |
| March 2026 | R15,680.00 | R-3,190.21 | R12,489.79 | R-3,000.00 | R9,489.79 | **Underpaid** |
| April 2026 | R14,203.54 | R0.00 | R14,203.54 | R-5,000.00 | R9,203.54 | **Underpaid** |
| May 2026 | R15,598.29 | R0.00 | R15,598.29 | R-6,500.00 | R9,098.29 | **Underpaid** |
| June 2026 | R4,035.26 | R0.00 | R4,035.26 | R-2,000.00 | R2,035.26 | **Underpaid** |

## Final Reconciliation

```
Cylinder Financial Balance:      R-862.50
Plus LPG Gas Balance:            R97,146.68
========================================
Total Reconciled Balance:        R96,284.18
ERP Statement Current Balance:   R99,374.75
Variance:                         R3,090.57
```

## Variance Analysis (v3 vs v4)

| Metric | Version 3 Statement | Version 4 Statement | Material Variance | Reason for Variance |
| :--- | :--- | :--- | :---: | :--- |
| **LPG Gas Balance** | N/A | R97,146.68 | N/A | First v4 reconstruction for TAN001. |
| **Cylinder Financial Balance** | N/A | R-862.50 | N/A | First v4 reconstruction for TAN001. |
| **Cylinder Custody Exposure** | N/A | R1,667.50 | N/A | First v4 reconstruction for TAN001. |
| **Total Reconciled Balance** | N/A | R96,284.18 | N/A | First v4 reconstruction for TAN001. |

## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Contains raw ERP statement transaction summaries. Contains date-shifted duplicates.
- **Itemized Component Layer (`vw_clean_transactions`):** Canonical source for line-item components.
