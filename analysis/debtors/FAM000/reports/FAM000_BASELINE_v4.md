# FAM000 Debtor Reconstruction Baseline - Version 4

## Metadata
- **Date:** 31 May 2026
- **Analyst:** Reconciliation Analyst & Debtor Reconstruction Specialist
- **Source Files Reviewed:**
  - `analysis/debtors/FAM000/raw/FAM000.TXT` (Raw ERP statement export)
  - Supabase database schema (`transaction_headers`, `vw_clean_transactions`, `vw_cylinder_ledger`)
- **Doctrine Version:** CYL Settlement Allocation Doctrine (v4 Canonical)

## Statement Scope
- **Period:** 1 March 2026 to 31 May 2026
- **Included Accounts:** `account_no IN ('FAM000', 'FAM002')` consolidated.

## Opening Balance Analysis (as of 1 March 2026) — Informative, Not Canonical
- **Method Used:** `openingBalanceStrategy: dynamic_db`
  - Opening balances are derived dynamically from database transactions occurring strictly before 2026-03-01.
  - The Credit Note tax sign correction is applied to ensure exact tax totals.
- **Supporting Evidence:**
  - **Combined B/F Balance:** R77,151.77
  - **Raw Cylinder B/F Value:** R15,525.00 (Sum of all pre-period CYL line totals)
  - **Net Cylinder Exposure B/F:** R15,525.00 (Outstanding physical custody cylinders valued at standard deposit rates)
  - **LPG Gas Opening B/F:** R61,626.77 (Combined B/F R77,151.77 - Net Cylinder B/F R15,525.00)

## Cylinder Analysis
- **Outstanding Quantities (as of 1 March 2026 B/F):**
  - `14.1` (14kg): **24 cylinders**
  - `19.1` (19kg): **-75 cylinders** (Credit)
  - `9.1` (9kg): **90 cylinders**
  - `D.1` (48kg DV): **-2 cylinders** (Credit)
  - `S.1` (48kg SV): **8 cylinders**
- **Period Net Qty Changes (March–May 2026):**
  - `14.1` (14kg): Deliveries: +24 | Returns: -25 | Net: **-1 cylinder**
  - `19.1` (19kg): Deliveries: +42 | Returns: -48 | Net: **-6 cylinders** (Wait! Looking at the table, net change is: `-3 + 1 - 1 + 1 - 1 + 5 - 5 + 5 + 2 - 5 - 6 + 2 - 2 + 3 - 3 + 8 - 8 + 6 - 7 + 1 - 1 + 3 - 3 + 3 - 3 = -8`. Let's correct this. B/F is -75, Closing is -83, so the net change is `-8 cylinders`.)
  - `9.1` (9kg): Deliveries: +158 | Returns: -174 | Net: **-16 cylinders**
  - `D.1` (48kg DV): Deliveries: +0 | Returns: -5 | Net: **-5 cylinders**
  - `S.1` (48kg SV): Deliveries: +137 | Returns: -144 | Net: **-7 cylinders**
- **Net Returnable Cylinder Position (Custody outstanding as of 31 May 2026):**
  - `14.1` (14kg) Outstanding: **23 cylinders**
  - `19.1` (19kg) Outstanding: **-83 cylinders** (Credit)
  - `9.1` (9kg) Outstanding: **74 cylinders**
  - `D.1` (48kg DV) Outstanding: **-7 cylinders** (Credit)
  - `S.1` (48kg SV) Outstanding: **1 cylinder**

## Cylinder Financial Analysis
- **Gross Custody Exposure (outstanding value at standard rates):**
  - `14.1`: 23 cylinders @ R575.00 = R13,225.00
  - `19.1`: -83 cylinders @ R690.00 = -R57,270.00
  - `9.1`: 74 cylinders @ R517.50 = R38,295.00
  - `D.1`: -7 cylinders @ R1,150.00 = -R8,050.00
  - `S.1`: 1 cylinder @ R1,150.00 = R1,150.00
  - **Net Cylinder Custody Exposure:** **-R12,650.00** (Credit)
- **Cylinder Financial Balance:** **-R5,117.50** (Credit)
  - This is the actual financial balance allocated to cylinders on the ledger (representing total transaction line items).
- **Cylinder Variance:** **+R7,532.50** (Financial - Custody)
  - Surfaced in Section 3 of the workspace. This is due to historical price discrepancies where older cylinders were invoiced or credited at historical rates (e.g., R345 incl) rather than the standard rates.

## 🔍 Allocation Evidence Register
This register traces cylinder deposit transaction assumptions, classifying the strength of the evidence trail according to the Cylinder Allocation Doctrine:

### Evidence Strength Tiers
- **Confirmed**: Cent-matching payment explicitly clearing the parent invoice. (High confidence)
- **Probable**: The invoice containing cylinder exposure is cleared in full through general monthly statement payments (running balance pool) rather than a dedicated transaction match. (High/Medium confidence)
- **Assumed**: No direct transactional payment match, but assumed based on historical system migration boundaries (e.g. legacy B/F credit carries). (Medium/Low confidence)

### Evidence Source Types
- `EXPLICIT_ALLOCATION`: Direct operator-entered allocation mapping a payment to a cylinder.
- `FULL_INVOICE_SETTLEMENT`: System infers allocation because a payment (or monthly pool payment) cleared the parent invoice containing both LPG and CYL components in full.
- `SYSTEM_MIGRATION_CARRIED`: Carried balance from legacy account migration.

| Event / Document | Date | SKU | Qty | Amount | Match Target | Classification | Evidence Source | Confidence | Evidence Trail / Logic |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :---: | :--- |
| **Opening Balances** | Pre-Mar 2026 | Various | +8 | R15,525.00 | Legacy Statement | **Assumed** | `SYSTEM_MIGRATION_CARRIED` | **Medium** | Reconciled balances carried forward from historical consolidated audit prior to 1 March 2026. |
| **Period Movements** | Mar-May 2026 | Various | -37 | -R20,642.50 | Monthly Payments | **Probable** | `FULL_INVOICE_SETTLEMENT` | **High** | Monthly pool payments and credit note reversals settled period cylinder invoices and returns in full. |

## LPG Analysis
- **LPG Balance:** R65,389.38
- **LPG Supporting Calculations:**
  - **LPG Gas Opening B/F:** R61,626.77
  - **LPG Gas Billed (Period):** R361,776.01 (Sum of all gas revenue line totals)
  - **LPG Payments & Reversals (Period):** -R358,013.40
  - **LPG Gas Closing Balance:** `61626.77 + 361776.01 - 358013.40 =` **R65,389.38** (Debit)

## Final Reconciliation

```
Cylinder Financial Balance:      -R5,117.50 (Credit)
Plus LPG Gas Balance:            R65,389.38 (Debit)
========================================
Total Reconciled Balance:        R60,271.88 (Debit)
ERP Statement Current Balance:   R60,271.88
Variance:                         R0.00 (Perfect Match)
```

## Variance Analysis (v3 vs v4)

| Metric | Version 3 Statement | Version 4 Statement | Material Variance | Reason for Variance |
| :--- | :--- | :--- | :---: | :--- |
| **LPG Gas Balance** | R65,389.38 | R65,389.38 | R0.00 | Aligned on financial gas balance. |
| **Cylinder Financial Balance** | -R5,117.50 | -R5,117.50 | R0.00 | Both statements agree on the financial cylinder credit balance. |
| **Cylinder Custody Exposure** | -R5,117.50 | -R12,650.00 | -R7,532.50 | v3 incorrectly forced custody exposure to equal the financial balance. v4 correctly calculates the custody exposure of R-12,650.00 at standard deposit rates, exposing a Cylinder Variance of +R7,532.50. |
| **Total Reconciled Balance** | R60,271.88 | R60,271.88 | R0.00 | Both reconcile perfectly to the consolidated ERP statement balance of R60,271.88. |

## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Acts as the cash-ledger and primary source for calculating the `totalDebtorBalance`. This contains combined invoice totals, credit note totals, and payment transactions.
- **Itemized Component Layer (`vw_clean_transactions`):** Acts as the line-item detail view. The script queries this to separate LPG gas line totals from CYL deposit line totals (filtering by `category = 'CYL'`), which calculates the `gasDebt` and `cylinderFinancialBalance` splits.
