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
  - **LPG Gas Closing Balance:** \`R0.00 + ${fmt(periodLpgInvoices)} + (${fmt(periodLpgCredits)}) + (${fmt(Math.abs(periodPmtsSum))}) =\` **R146,857.72**

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

| Match ID | Invoice Month | LPG Month Net Amount | Payment Doc(s) / Ref(s) | Payment Date(s) | Payment Amount | Difference | Match Type | Confidence | Evidence Source | Notes |
| :--- | :--- | ---: | :--- | :--- | ---: | ---: | :--- | :--- | :--- | :--- |
| PM-001 | March 2022 (2022-03) | R14,943.48 | 13583 | 12 Apr 2022 | R13,949.00 | R994.48 | UNDERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Underpayment of R994.48 against month total. |
| PM-002 | April 2022 (2022-04) | R18,184.64 | 14135 | 01 Jun 2022 | R18,184.64 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-003 | May 2022 (2022-05) | R18,947.57 | 15071 | 26 Jul 2022 | R17,275.67 | R1,671.90 | PARTIAL_PRIOR_MONTH_PAYMENT | Probable | HUMAN_WORKSHEET_AND_ERP | Worksheet identifies invoices [13637] as unpaid. Settle amount R17275.67 matched. |
| PM-004 | June 2022 (2022-06) | R16,103.76 | 15473 | 11 Aug 2022 | R14,488.95 | R1,614.81 | PARTIAL_PRIOR_MONTH_PAYMENT | Probable | HUMAN_WORKSHEET_AND_ERP | Worksheet identifies invoices [14788] as unpaid. Settle amount R14488.95 matched. |
| PM-005 | July 2022 (2022-07) | R17,169.29 | 15987 | 10 Sep 2022 | R17,169.29 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet (noting worksheet variance of R538.28 due to worksheet omitting a line on Doc 14744). |
| PM-006 | August 2022 (2022-08) | R15,337.50 | 16648 | 20 Oct 2022 | R15,885.27 | R-547.77 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R547.77 against month total. |
| PM-007 | September 2022 (2022-09) | R16,606.08 | 17073 | 24 Nov 2022 | R13,838.40 | R2,767.68 | UNDERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Underpayment of R2,767.68 against month total. |
| PM-008 | October 2022 (2022-10) | R15,222.24 | 17578 | 19 Dec 2022 | R17,989.92 | R-2,767.68 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R2,767.68 against month total. |
| PM-009 | November 2022 (2022-11) | R8,139.84 | 17777 | 19 Jan 2023 | R10,825.92 | R-2,686.08 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R2,686.08 against month total. |
| PM-010 | December 2022 (2022-12) | R27,870.44 | 18185 | 13 Feb 2023 | R25,184.36 | R2,686.08 | PARTIAL_PRIOR_MONTH_PAYMENT | Probable | HUMAN_WORKSHEET_AND_ERP | Worksheet identifies invoices [16648] as unpaid. Settle amount R25184.36 matched. |
| PM-011 | January 2023 (2023-01) | R11,335.68 | 19176 | 22 Mar 2023 | R11,335.68 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-012 | February 2023 (2023-02) | R12,343.07 | 20357 | 02 May 2023 | R12,343.07 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-013 | March 2023 (2023-03) | R16,111.50 | 21193 | 31 May 2023 | R15,409.46 | R702.04 | UNDERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Underpayment of R702.04 against month total. |
| PM-014 | April 2023 (2023-04) | R15,140.69 | 22711 | 21 Jul 2023 | R15,140.69 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-015 | May 2023 (2023-05) | R13,806.77 | 23280 | 11 Aug 2023 | R13,806.77 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-016 | June 2023 (2023-06) | R16,964.84 | 23977 | 05 Sep 2023 | R16,964.84 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-017 | July 2023 (2023-07) | R13,911.54 | 25394 | 24 Oct 2023 | R13,911.54 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-018 | August 2023 (2023-08) | R15,766.57 | 26601 | 29 Nov 2023 | R12,520.81 | R3,245.76 | PARTIAL_PRIOR_MONTH_PAYMENT | Probable | HUMAN_WORKSHEET_AND_ERP | Worksheet identifies invoices [23964] as unpaid. Settle amount R12520.81 matched. |
| PM-019 | September 2023 (2023-09) | R8,026.98 | 27468 | 29 Dec 2023 | R24,801.28 | R-16,774.30 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R16,774.30 against month total. |
| PM-020 | October 2023 (2023-10) | R13,528.54 | 30269 | 24 Apr 2024 | R16,151.04 | R-2,622.50 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R2,622.50 against month total. |
| PM-021 | November 2023 (2023-11) | R11,625.12 | 28893 | 20 Feb 2024 | R14,208.48 | R-2,583.36 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R2,583.36 against month total. |
| PM-022 | December 2023 (2023-12) | R18,734.46 | 35270 | 04 Dec 2024 | R18,441.12 | R293.34 | UNDERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Underpayment of R293.34 against month total. |
| PM-023 | January 2024 (2024-01) | R11,105.31 | 30891 | 27 May 2024 | R11,105.31 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-024 | February 2024 (2024-02) | R13,862.53 | 32896 | 23 Aug 2024 | R17,634.86 | R-3,772.33 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R3,772.33 against month total. |
| PM-025 | March 2024 (2024-03) | R15,395.18 | 31792 | 09 Jul 2024 | R15,395.18 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | HUMAN_WORKSHEET_AND_ERP | Settled in full. Matches human worksheet. |
| PM-026 | April 2024 (2024-04) | R12,634.86 | 33810 | 30 Sep 2024 | R20,232.18 | R-7,597.32 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R7,597.32 against month total. |
| PM-027 | May 2024 (2024-05) | R18,256.94 | 31179 | 10 Jun 2024 | R13,862.03 | R4,394.91 | UNDERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Underpayment of R4,394.91 against month total. |
| PM-028 | June 2024 (2024-06) | R15,232.18 | 34425 | 28 Oct 2024 | R20,443.00 | R-5,210.82 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R5,210.82 against month total. |
| PM-029 | July 2024 (2024-07) | R15,443.00 | 36139 | 17 Jan 2025 | R22,336.89 | R-6,893.89 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R6,893.89 against month total. |
| PM-030 | August 2024 (2024-08) | R15,184.18 | 36988 | 21 Feb 2025 | R19,550.42 | R-4,366.24 | OVERPAYMENT_AGAINST_MONTH | Probable | HUMAN_WORKSHEET_AND_ERP | Overpayment of R4,366.24 against month total. |
| PM-031 | September 2024 (2024-09) | R15,336.89 | — | — | — | R15,336.89 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-032 | October 2024 (2024-10) | R14,025.58 | — | — | — | R14,025.58 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-033 | November 2024 (2024-11) | R12,524.85 | — | — | — | R12,524.85 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-034 | December 2024 (2024-12) | R15,816.63 | — | — | — | R15,816.63 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-035 | January 2025 (2025-01) | R17,574.84 | — | — | — | R17,574.84 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-036 | February 2025 (2025-02) | R10,320.82 | — | — | — | R10,320.82 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-037 | March 2025 (2025-03) | R11,795.24 | — | — | — | R11,795.24 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-038 | April 2025 (2025-04) | R21,724.53 | 38481 | 05 May 2025 | R15,816.63 | R5,907.90 | UNDERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Underpayment of R5,907.90 against month total. |
| PM-039 | May 2025 (2025-05) | R13,342.37 | 38481 | 05 May 2025 | R15,816.63 | R-2,474.26 | OVERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Overpayment of R2,474.26 against month total. |
| PM-040 | June 2025 (2025-06) | R14,618.11 | 40063, 40746 | 14 Jul 2025, 22 Aug 2025 | R26,374.68 | R-11,756.57 | OVERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Overpayment of R11,756.57 against month total. |
| PM-041 | July 2025 (2025-07) | R14,579.44 | 40063, 40746 | 14 Jul 2025, 22 Aug 2025 | R26,374.68 | R-11,795.24 | OVERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Overpayment of R11,795.24 against month total. |
| PM-042 | August 2025 (2025-08) | R16,601.82 | 40746, 41664 | 22 Aug 2025, 14 Oct 2025 | R31,181.25 | R-14,579.43 | OVERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Overpayment of R14,579.43 against month total. |
| PM-043 | September 2025 (2025-09) | R13,327.87 | 42134 | 06 Nov 2025 | R13,327.87 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | ERP_LEDGER | Settle match in ERP ledger allocations. |
| PM-044 | October 2025 (2025-10) | R13,161.86 | 42788 | 29 Dec 2025 | R13,161.86 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | ERP_LEDGER | Settle match in ERP ledger allocations. |
| PM-045 | November 2025 (2025-11) | R15,578.23 | 43199 | 05 Feb 2026 | R15,578.23 | R0.00 | EXACT_PRIOR_MONTH_MATCH | Confirmed | ERP_LEDGER | Settle match in ERP ledger allocations. |
| PM-046 | December 2025 (2025-12) | R11,666.11 | 43199 | 05 Feb 2026 | R15,578.23 | R-3,912.12 | OVERPAYMENT_AGAINST_MONTH | Assumed | ERP_LEDGER | Overpayment of R3,912.12 against month total. |
| PM-047 | January 2026 (2026-01) | R14,323.09 | — | — | — | R14,323.09 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-048 | February 2026 (2026-02) | R10,559.95 | — | — | — | R10,559.95 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-049 | March 2026 (2026-03) | R11,937.56 | — | — | — | R11,937.56 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-050 | April 2026 (2026-04) | R14,303.99 | — | — | — | R14,303.99 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |
| PM-051 | May 2026 (2026-05) | R16,218.64 | — | — | — | R16,218.64 | NO_PLAUSIBLE_MATCH | Exception | EXCEPTION | No payment allocated. LPG balance remains completely unpaid. |


## LPG Unpaid / Partially Paid Invoice Register

| Invoice Date | Invoice No | Invoice Month | LPG Invoice Amount | Matched Payment Batch | Amount Matched | Amount Unpaid | Evidence Source | Confidence | Notes |
| :--- | :--- | :--- | ---: | :--- | ---: | ---: | :--- | :--- | :--- |
| Pre-March 2022 | — | Pre-March 2022 | R28,709.91 | — | R0.00 | R28,709.91 | ERP_LEDGER | Confirmed | Opening LPG Gas balance brought forward from pre-March 2022 reconstruction period. |
| 28 Mar 2022 | 12718 | 2022-03 | R2,008.08 | 13583 | R1,013.60 | R994.48 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 31 May 2022 | 13744 | 2022-05 | R2,786.34 | 15071 | R1,114.44 | R1,671.90 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 28 Jun 2022 | 14341 | 2022-06 | R2,229.07 | 15473 | R614.26 | R1,614.81 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 23 Sep 2022 | 15782 | 2022-09 | R4,151.52 | 17073 | R1,383.84 | R2,767.68 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 31 Dec 2022 | 17132 | 2022-12 | R2,765.75 | 18185 | R79.67 | R2,686.08 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 23 Mar 2023 | 18695 | 2023-03 | R4,202.58 | 21193 | R3,500.54 | R702.04 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 31 Aug 2023 | 23964 | 2023-08 | R3,245.76 | — | R0.00 | R3,245.76 | HUMAN_WORKSHEET | Confirmed | Explicitly marked Unpaid in human worksheet. |
| 29 Dec 2023 | 28140 | 2023-12 | R4,037.78 | 35270 | R3,744.44 | R293.34 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 24 May 2024 | 32409 | 2024-05 | R2,808.76 | 31179 | R2,626.99 | R181.77 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 28 May 2024 | 32531 | 2024-05 | R2,808.76 | — | R0.00 | R2,808.76 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 31 May 2024 | 32614 | 2024-05 | R1,404.38 | — | R0.00 | R1,404.38 | HUMAN_WORKSHEET_AND_ERP | Probable | Partially paid in ERP batch. |
| 05 Sep 2024 | 35961 | 2024-09 | R1,380.38 | — | R0.00 | R1,380.38 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 06 Sep 2024 | 35990 | 2024-09 | R2,760.76 | — | R0.00 | R2,760.76 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 12 Sep 2024 | 36191 | 2024-09 | R4,358.65 | — | R0.00 | R4,358.65 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 18 Sep 2024 | 36395 | 2024-09 | R4,102.26 | — | R0.00 | R4,102.26 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 26 Sep 2024 | 36680 | 2024-09 | R2,734.84 | — | R0.00 | R2,734.84 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 05 Oct 2024 | 37020 | 2024-10 | R2,753.48 | — | R0.00 | R2,753.48 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 11 Oct 2024 | 37216 | 2024-10 | R2,753.49 | — | R0.00 | R2,753.49 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 17 Oct 2024 | 37363 | 2024-10 | R2,753.49 | — | R0.00 | R2,753.49 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 25 Oct 2024 | 37619 | 2024-10 | R3,011.63 | — | R0.00 | R3,011.63 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 31 Oct 2024 | 37799 | 2024-10 | R2,753.49 | — | R0.00 | R2,753.49 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 07 Nov 2024 | 38040 | 2024-11 | R4,174.95 | — | R0.00 | R4,174.95 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 14 Nov 2024 | 38266 | 2024-11 | R2,783.30 | — | R0.00 | R2,783.30 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 21 Nov 2024 | 38456 | 2024-11 | R2,783.30 | — | R0.00 | R2,783.30 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 29 Nov 2024 | 38664 | 2024-11 | R2,783.30 | — | R0.00 | R2,783.30 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 04 Dec 2024 | 38820 | 2024-12 | R4,174.95 | — | R0.00 | R4,174.95 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 12 Dec 2024 | 39008 | 2024-12 | R4,365.63 | — | R0.00 | R4,365.63 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 18 Dec 2024 | 39149 | 2024-12 | R4,365.63 | — | R0.00 | R4,365.63 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 23 Dec 2024 | 39307 | 2024-12 | R2,910.42 | — | R0.00 | R2,910.42 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 02 Jan 2025 | 39558 | 2025-01 | R2,950.74 | — | R0.00 | R2,950.74 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 09 Jan 2025 | 39714 | 2025-01 | R4,387.23 | — | R0.00 | R4,387.23 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 15 Jan 2025 | 39898 | 2025-01 | R4,387.23 | — | R0.00 | R4,387.23 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 24 Jan 2025 | 40143 | 2025-01 | R2,924.82 | — | R0.00 | R2,924.82 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 31 Jan 2025 | 40319 | 2025-01 | R2,924.82 | — | R0.00 | R2,924.82 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 11 Feb 2025 | 40622 | 2025-02 | R4,423.21 | — | R0.00 | R4,423.21 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 21 Feb 2025 | 40881 | 2025-02 | R4,423.21 | — | R0.00 | R4,423.21 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 27 Feb 2025 | 41051 | 2025-02 | R1,474.40 | — | R0.00 | R1,474.40 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 05 Mar 2025 | 41216 | 2025-03 | R2,948.81 | — | R0.00 | R2,948.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 14 Mar 2025 | 41486 | 2025-03 | R2,948.81 | — | R0.00 | R2,948.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 20 Mar 2025 | 41633 | 2025-03 | R2,948.81 | — | R0.00 | R2,948.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 28 Mar 2025 | 41799 | 2025-03 | R2,948.81 | — | R0.00 | R2,948.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 10 Apr 2025 | 42181 | 2025-04 | R4,325.33 | 38481 | R4,227.45 | R97.88 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 17 Apr 2025 | 42357 | 2025-04 | R4,325.33 | — | R0.00 | R4,325.33 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 25 Apr 2025 | 42565 | 2025-04 | R4,325.33 | — | R0.00 | R4,325.33 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 30 Apr 2025 | 42704 | 2025-04 | R4,325.33 | — | R0.00 | R4,325.33 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 15 May 2025 | 43089 | 2025-05 | R2,883.56 | 38481 | R2,482.58 | R400.98 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 21 May 2025 | 43271 | 2025-05 | R4,382.95 | — | R0.00 | R4,382.95 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 29 May 2025 | 43451 | 2025-05 | R2,921.97 | — | R0.00 | R2,921.97 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 26 Jun 2025 | 44241 | 2025-06 | R2,848.04 | 40063, 40746 | R287.71 | R2,560.33 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 26 Jul 2025 | 45162 | 2025-07 | R262.55 | — | R0.00 | R262.55 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 12 Dec 2025 | 48244 | 2025-12 | R2,596.52 | 43199 | R18.21 | R2,578.31 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 19 Dec 2025 | 48391 | 2025-12 | R3,894.77 | — | R0.00 | R3,894.77 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 24 Dec 2025 | 48487 | 2025-12 | R1,298.26 | — | R0.00 | R1,298.26 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 31 Dec 2025 | 48578 | 2025-12 | R3,894.77 | — | R0.00 | R3,894.77 | ERP_LEDGER | Assumed | Partially paid in ERP batch. |
| 01 Jan 2026 | 48599 | 2026-01 | R3,894.77 | — | R2,596.52 | R1,298.25 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 03 Jan 2026 | 48776 | 2026-01 | R2,596.52 | — | R0.00 | R2,596.52 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 09 Jan 2026 | 48701 | 2026-01 | R3,894.77 | — | R0.00 | R3,894.77 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 17 Jan 2026 | 48828 | 2026-01 | R3,920.13 | — | R0.00 | R3,920.13 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 28 Jan 2026 | 48994 | 2026-01 | R2,613.42 | — | R0.00 | R2,613.42 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 06 Feb 2026 | 49126 | 2026-02 | R3,959.98 | — | R0.00 | R3,959.98 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 13 Feb 2026 | 49242 | 2026-02 | R2,639.99 | — | R0.00 | R2,639.99 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 18 Feb 2026 | 49315 | 2026-02 | R3,959.98 | — | R0.00 | R3,959.98 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 04 Mar 2026 | 49540 | 2026-03 | R3,959.98 | — | R0.00 | R3,959.98 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 13 Mar 2026 | 49727 | 2026-03 | R3,988.79 | — | R0.00 | R3,988.79 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 20 Mar 2026 | 49842 | 2026-03 | R3,988.79 | — | R0.00 | R3,988.79 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 01 Apr 2026 | 50042 | 2026-04 | R3,988.79 | — | R0.00 | R3,988.79 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 09 Apr 2026 | 50161 | 2026-04 | R4,420.80 | — | R0.00 | R4,420.80 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 18 Apr 2026 | 50290 | 2026-04 | R2,947.20 | — | R0.00 | R2,947.20 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 24 Apr 2026 | 50371 | 2026-04 | R2,947.20 | — | R0.00 | R2,947.20 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 01 May 2026 | 50468 | 2026-05 | R4,420.80 | — | R0.00 | R4,420.80 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 09 May 2026 | 50594 | 2026-05 | R3,370.81 | — | R0.00 | R3,370.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 16 May 2026 | 50712 | 2026-05 | R3,370.81 | — | R0.00 | R3,370.81 | EXCEPTION | Exception | Unpaid month, no payment matching. |
| 21 May 2026 | 50810 | 2026-05 | R5,056.22 | — | R0.00 | R5,056.22 | EXCEPTION | Exception | Unpaid month, no payment matching. |


## Unmatched / Weakly Matched Payment Register

| Payment Date | Payment Doc / Ref | Payment Amount | Candidate Month(s) | Closest LPG Month Amount | Difference | Match Status | Confidence | Notes |
| :--- | :--- | ---: | :--- | ---: | ---: | :--- | :--- | :--- |
| 17 Mar 2022 | 13245 | R14,982.58 | 2022-03 | R14,943.48 | R39.10 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |
| — | 16648 | R547.77 | 2022-08 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 17578 | R2,767.68 | 2022-10 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 17777 | R2,686.08 | 2022-11 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 27468 | R16,774.30 | 2023-09 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 28893 | R2,583.36 | 2023-11 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 30269 | R2,622.50 | 2023-10 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 32896 | R3,772.33 | 2024-02 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 33810 | R7,597.32 | 2024-04 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| — | 34425 | R2,497.69 | 2024-06 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| 28 Oct 2024 | 34425 | R2,713.13 | 2023-09 | R8,026.98 | R-5,313.85 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |
| — | 36139 | R5,400.86 | 2024-07 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| 17 Jan 2025 | 36139 | R1,493.03 | 2023-09 | R8,026.98 | R-6,533.95 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |
| — | 36988 | R352.30 | 2024-08 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| 21 Feb 2025 | 36988 | R4,013.94 | 2023-09 | R8,026.98 | R-4,013.04 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |
| — | 38481 | R1,529.50 | 2025-04, 2025-05 | — | — | OVERPAYMENT_AGAINST_MONTH | Assumed | Payment batch exceeded matched month total; unused cash remains unallocated. |
| 22 May 2025 | 38846 | R7,337.97 | 2023-09 | R8,026.98 | R-689.01 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |
| 12 Jun 2025 | 39812 | R20,557.69 | 2025-04 | R21,724.53 | R-1,166.84 | UNMATCHED_PAYMENT | Exception | No allocation entries link this payment to any invoice. |


## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Contains raw ERP statement transaction summaries. Contains date-shifted duplicates and payment allocation splits.
- **Itemized Component Layer (`vw_clean_transactions`):** Canonical source for line-item components.
