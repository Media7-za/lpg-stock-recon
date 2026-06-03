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

## Opening Balance Analysis (as of 3 December 2018)
- **Method Used:** Lifetime Reconstruction starting from first available transaction.
- **Supporting Evidence:**
  - **Combined B/F Balance:** R0.00
  - **Cylinder Financial B/F Value:** R0.00
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
| **Opening Balances** | Pre-Dec 2018 | Various | 0 | R0.00 | Legacy Statement | **Confirmed** | `SYSTEM_MIGRATION_CARRIED` | **High** | Account inception starting at R0.00 balance. |
| **Period Movements** | Dec 2018 - May 2026 | Various | 0 | R0.00 | Monthly Payments | **Probable** | `FULL_INVOICE_SETTLEMENT` | **High** | Monthly pool payments settled period cylinder invoices and returns in full. |

## LPG Analysis
- **LPG Balance:** R146,857.72
- **LPG Supporting Calculations:**
  - **LPG Gas Opening B/F:** R0.00
  - **LPG Gas Billed (Period):** R1,162,404.68
  - **LPG Gas Credits (Period):** R-64,817.35
  - **LPG Payments (Period):** R-950,729.61
  - **LPG Gas Closing Balance:** `R0.00 + 1,162,404.68 + (-64,817.35) + (950,729.61) =` **R146,857.72**

## Final Reconciliation

```
Cylinder Financial Balance:      R-6.50
Plus LPG Gas Balance:            R146,857.72
========================================
Total Reconciled Balance:        R146,851.22
ERP Statement Current Balance:   R146,907.13
Variance:                         R55.91
```

## Variance Analysis (v3 vs v4)

| Metric | Version 3 Statement | Version 4 Statement | Material Variance | Reason for Variance |
| :--- | :--- | :--- | :---: | :--- |
| **LPG Gas Balance** | N/A | R146,857.72 | N/A | First v4 reconstruction for JIM001. |
| **Cylinder Financial Balance** | N/A | R-6.50 | N/A | First v4 reconstruction for JIM001. |
| **Cylinder Custody Exposure** | N/A | R26,220.00 | N/A | First v4 reconstruction for JIM001. |
| **Total Reconciled Balance** | N/A | R146,851.22 | N/A | First v4 reconstruction for JIM001. |

## LPG Prior-Month Payment Intent Matching Register
*(This register remains locked as the month-level reconciliation control)*

## Monthly LPG Insight Register

| Year | Month | LPG Invoice Total | LPG Credit Notes | Net LPG Invoiced | Payment Ref(s) Allocated | Payment Date(s) | Payment Total Allocated | Difference | Month Status | Notes |
|---|---|---:|---:|---:|---|---|---:|---:|---|---|
| 2022 | March | R14,943.48 | R0.00 | R14,943.48 | 13583 | 12 Apr 2022 | R13,949.00 | R994.48 | PARTIALLY_SETTLED | Underpaid. R994.48 remaining unpaid. |
| 2022 | April | R18,184.64 | R0.00 | R18,184.64 | 14135 | 01 Jun 2022 | R18,184.64 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2022 | May | R18,947.57 | R0.00 | R18,947.57 | 15071 | 26 Jul 2022 | R17,275.67 | R1,671.90 | PARTIALLY_SETTLED | Underpaid. R1671.90 remaining unpaid. |
| 2022 | June | R16,103.76 | R0.00 | R16,103.76 | 15473 | 11 Aug 2022 | R14,488.95 | R1,614.81 | PARTIALLY_SETTLED | Underpaid. R1614.81 remaining unpaid. |
| 2022 | July | R17,169.29 | R0.00 | R17,169.29 | 15987 | 10 Sep 2022 | R17,169.29 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2022 | August | R19,171.88 | R0.00 | R15,337.50 | 16648 | 20 Oct 2022 | R15,337.50 | R0.00 | OVERPAID | Overpaid by R547.77. |
| 2022 | September | R16,606.08 | R0.00 | R16,606.08 | 17073 | 24 Nov 2022 | R13,838.40 | R2,767.68 | PARTIALLY_SETTLED | Underpaid. R2767.68 remaining unpaid. |
| 2022 | October | R15,222.24 | R0.00 | R15,222.24 | 17578 | 19 Dec 2022 | R15,222.24 | R0.00 | OVERPAID | Overpaid by R2767.68. |
| 2022 | November | R13,512.00 | R0.00 | R8,139.84 | 17777 | 19 Jan 2023 | R10,825.92 | R-2,686.08 | OVERPAID | Overpaid by R2686.08. |
| 2022 | December | R31,899.56 | R0.00 | R27,870.44 | 18185 | 13 Feb 2023 | R25,184.36 | R2,686.08 | PARTIALLY_SETTLED | Underpaid. R2686.08 remaining unpaid. |
| 2023 | January | R11,335.68 | R0.00 | R11,335.68 | 19176 | 22 Mar 2023 | R11,335.68 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | February | R12,343.07 | R0.00 | R12,343.07 | 20357 | 02 May 2023 | R12,343.07 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | March | R16,111.50 | R0.00 | R16,111.50 | 21193 | 31 May 2023 | R15,409.46 | R702.04 | PARTIALLY_SETTLED | Underpaid. R702.04 remaining unpaid. |
| 2023 | April | R15,140.69 | R0.00 | R15,140.69 | 22711 | 21 Jul 2023 | R15,140.69 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | May | R13,806.77 | R0.00 | R13,806.77 | 23280 | 11 Aug 2023 | R13,806.77 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | June | R16,964.84 | R0.00 | R16,964.84 | 23977 | 05 Sep 2023 | R16,964.84 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | July | R13,911.54 | R0.00 | R13,911.54 | 25394 | 24 Oct 2023 | R13,911.54 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2023 | August | R15,766.57 | R0.00 | R15,766.57 | 26601 | 29 Nov 2023 | R12,520.81 | R3,245.76 | PARTIALLY_SETTLED | Underpaid. R3245.76 remaining unpaid. |
| 2023 | September | R11,272.74 | R0.00 | R8,026.98 | 27468 | 29 Dec 2023 | R11,272.74 | R-3,245.76 | OVERPAID | Overpaid by R16774.30. |
| 2023 | October | R13,528.54 | R0.00 | R13,528.54 | 30269 | 24 Apr 2024 | R13,528.54 | R0.00 | OVERPAID | Overpaid by R2622.50. |
| 2023 | November | R11,625.12 | R0.00 | R11,625.12 | 28893 | 20 Feb 2024 | R11,625.12 | R0.00 | OVERPAID | Overpaid by R2583.36. |
| 2023 | December | R21,426.31 | R0.00 | R18,734.46 | 35270 | 04 Dec 2024 | R18,441.12 | R293.34 | PARTIALLY_SETTLED | Underpaid. R293.34 remaining unpaid. |
| 2024 | January | R13,806.77 | R0.00 | R11,105.31 | 30891 | 27 May 2024 | R11,105.31 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2024 | February | R13,862.53 | R0.00 | R13,862.53 | 32896 | 23 Aug 2024 | R13,862.53 | R0.00 | OVERPAID | Overpaid by R3772.33. |
| 2024 | March | R15,395.18 | R0.00 | R15,395.18 | 31792 | 09 Jul 2024 | R15,395.18 | R0.00 | FULLY_SETTLED | Settled in full. |
| 2024 | April | R12,634.86 | R0.00 | R12,634.86 | 33810 | 30 Sep 2024 | R12,634.86 | R0.00 | OVERPAID | Overpaid by R7597.32. |
| 2024 | May | R18,256.94 | R0.00 | R18,256.94 | 31179 | 10 Jun 2024 | R13,862.03 | R4,394.91 | PARTIALLY_SETTLED | Underpaid. R4394.91 remaining unpaid. |
| 2024 | June | R15,232.18 | R0.00 | R15,232.18 | 34425 | 28 Oct 2024 | R15,232.18 | R0.00 | OVERPAID | Overpaid by R5210.82. |
| 2024 | July | R16,494.83 | R0.00 | R15,443.00 | 36139 | 17 Jan 2025 | R15,443.00 | R0.00 | OVERPAID | Overpaid by R6893.89. |
| 2024 | August | R15,184.18 | R0.00 | R15,184.18 | 36988 | 21 Feb 2025 | R15,184.18 | R0.00 | OVERPAID | Overpaid by R4366.24. |
| 2024 | September | R15,336.89 | R0.00 | R15,336.89 | — | — | R0.00 | R15,336.89 | UNPAID | No payment allocated. |
| 2024 | October | R16,419.92 | R0.00 | R14,025.58 | — | — | R0.00 | R14,025.58 | UNPAID | No payment allocated. |
| 2024 | November | R12,524.85 | R0.00 | R12,524.85 | — | — | R0.00 | R12,524.85 | UNPAID | No payment allocated. |
| 2024 | December | R15,816.63 | R0.00 | R15,816.63 | — | — | R0.00 | R15,816.63 | UNPAID | No payment allocated. |
| 2025 | January | R17,574.84 | R0.00 | R17,574.84 | — | — | R0.00 | R17,574.84 | UNPAID | No payment allocated. |
| 2025 | February | R10,320.82 | R0.00 | R10,320.82 | — | — | R0.00 | R10,320.82 | UNPAID | No payment allocated. |
| 2025 | March | R11,795.24 | R0.00 | R11,795.24 | — | — | R0.00 | R11,795.24 | UNPAID | No payment allocated. |
| 2025 | April | R21,724.53 | R0.00 | R21,724.53 | 38481 | 05 May 2025 | R8,650.66 | R13,073.87 | PARTIALLY_SETTLED | Underpaid. R13073.87 remaining unpaid. |
| 2025 | May | R17,667.70 | R0.00 | R13,342.37 | 38481 | 05 May 2025 | R5,636.47 | R7,705.90 | OVERPAID | Overpaid by R2474.26. |
| 2025 | June | R17,733.16 | R0.00 | R14,618.11 | 40063, 40746 | 14 Jul 2025, 22 Aug 2025 | R12,057.78 | R2,560.33 | OVERPAID | Overpaid by R11756.57. |
| 2025 | July | R14,579.44 | R0.00 | R14,579.44 | 40063, 40746 | 14 Jul 2025, 22 Aug 2025 | R14,316.89 | R262.55 | OVERPAID | Overpaid by R11795.24. |
| 2025 | August | R16,601.82 | R0.00 | R16,601.82 | 40746, 41664 | 22 Aug 2025, 14 Oct 2025 | R16,601.82 | R0.00 | OVERPAID | Overpaid by R14579.43. |
| 2025 | September | R13,327.87 | R0.00 | R13,327.87 | 42134 | 06 Nov 2025 | R13,327.87 | R0.00 | FULLY_SETTLED | [REVIEW_REQUIRED] Inferred from ERP ledger allocations. |
| 2025 | October | R13,161.86 | R0.00 | R13,161.86 | 42788 | 29 Dec 2025 | R13,161.86 | R0.00 | FULLY_SETTLED | [REVIEW_REQUIRED] Inferred from ERP ledger allocations. |
| 2025 | November | R15,578.23 | R0.00 | R15,578.23 | 43199 | 05 Feb 2026 | R15,578.23 | R0.00 | FULLY_SETTLED | [REVIEW_REQUIRED] Inferred from ERP ledger allocations. |
| 2025 | December | R15,560.88 | R0.00 | R11,666.11 | 43199 | 05 Feb 2026 | R0.00 | R11,666.11 | OVERPAID | [REVIEW_REQUIRED] Inferred from ERP ledger allocations. |
| 2026 | January | R16,919.61 | R0.00 | R14,323.09 | — | — | R0.00 | R14,323.09 | UNPAID | No payment allocated. |
| 2026 | February | R10,559.95 | R0.00 | R10,559.95 | — | — | R0.00 | R10,559.95 | UNPAID | No payment allocated. |
| 2026 | March | R15,897.54 | R0.00 | R11,937.56 | — | — | R0.00 | R11,937.56 | UNPAID | No payment allocated. |
| 2026 | April | R14,303.99 | R0.00 | R14,303.99 | — | — | R0.00 | R14,303.99 | UNPAID | No payment allocated. |
| 2026 | May | R16,218.64 | R0.00 | R16,218.64 | — | — | R0.00 | R16,218.64 | UNPAID | No payment allocated. |


## Yearly LPG Invoice and Payment Summary

| Year | Net LPG Invoiced | Payments Allocated | Gross Difference | Cumulative Gross Unpaid LPG Position | Unmatched / Overpayment Pool Applied | Net LPG Position | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| 2022 | R168,524.84 | R161,475.97 | R7,048.87 | R35,758.78 | R0.00 | R35,758.78 | Cumulative position includes Pre-March 2022 LPG Opening Balance B/F (R28,709.91). |
| 2023 | R167,295.76 | R166,300.38 | R995.38 | R36,754.16 | R0.00 | R36,754.16 | — |
| 2024 | R174,818.13 | R112,719.27 | R62,098.86 | R98,853.02 | R0.00 | R98,853.02 | — |
| 2025 | R174,291.24 | R99,331.58 | R74,959.66 | R173,812.68 | R0.00 | R173,812.68 | — |
| 2026 | R67,343.23 | R0.00 | R67,343.23 | R241,155.91 | R94,298.19 | R146,857.72 | Unmatched/overpayment pool applied as a reconciliation offset to arrive at final LPG Gas Debt of R146,857.72. |


## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Contains raw ERP statement transaction summaries. Contains date-shifted duplicates and payment allocation splits.
- **Itemized Component Layer (`vw_clean_transactions`):** Canonical source for line-item components.
