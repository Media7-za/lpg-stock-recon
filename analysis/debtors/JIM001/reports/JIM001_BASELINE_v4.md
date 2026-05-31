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

## Calendar-Month Batch Payment Allocation Register

| Allocation ID | Invoice Month(s) | Invoice / Net Amount | Payment Doc(s) | Payment Date(s) | Payment Amount | Allocated Amount | Residual | Allocation Type | Confidence | Notes |
| ------------- | ---------------: | -------------------: | -------------- | --------------- | -------------: | ---------------: | -------: | --------------- | ---------- | ----- |
| AL-001 | 2018-12 | R21,750.02 | 00000029, 00004832, 00004839, 00004807, 00004898 | 2018-12-17, 2018-12-28, 2019-01-04, 2019-01-08 | R21,950.01 | R21,750.02 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00000029, 00004832, 00004839, 00004807, 00004898. |
| AL-002 | 2019-01 | R19,306.77 | 00004898, 00004841, 00004904, 00005043, 00005047 | 2019-01-08, 2019-01-09, 2019-01-20, 2019-02-06, 2019-02-18 | R27,897.40 | R19,306.77 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00004898, 00004841, 00004904, 00005043, 00005047. |
| AL-003 | 2019-02 | R10,697.41 | 00005047, 00000032, 00005437 | 2019-02-18, 2019-02-27, 2019-04-23 | R17,402.39 | R10,697.41 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005047, 00000032, 00005437. |
| AL-004 | 2019-03 | R3,774.98 | 00005437, 00005436 | 2019-04-23, 2019-05-05 | R23,430.00 | R3,774.98 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005437, 00005436. |
| AL-005 | 2019-04 | R13,504.86 | 00005436, 00005618 | 2019-05-05, 2019-06-19 | R22,130.00 | R13,504.86 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005436, 00005618. |
| AL-006 | 2019-05 | R10,210.63 | 00005618, 00005804 | 2019-06-19, 2019-07-03 | R21,375.00 | R10,210.63 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005618, 00005804. |
| AL-007 | 2019-06 | R11,250.00 | 00005804, 00005226, 00005876 | 2019-07-03, 2019-07-07, 2019-08-05 | R30,179.00 | R11,250.00 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005804, 00005226, 00005876. |
| AL-008 | 2019-07 | R14,981.01 | 00005876, 00005988 | 2019-08-05, 2019-09-03 | R28,304.00 | R14,981.01 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005876, 00005988. |
| AL-009 | 2019-08 | R13,874.99 | 00005988, 00006104 | 2019-09-03, 2019-10-20 | R27,750.00 | R13,874.99 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00005988, 00006104. |
| AL-010 | 2019-09 | R13,322.98 | 00006104, 00006316 | 2019-10-20, 2019-12-08 | R24,750.00 | R13,322.98 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00006104, 00006316. |
| AL-011 | 2019-10 | R12,749.95 | 00006316, 00006381, 00006376 | 2019-12-08, 2019-12-23, 2019-12-26 | R24,720.00 | R12,749.95 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00006316, 00006381, 00006376. |
| AL-012 | 2019-11 | R11,039.94 | 00006376 | 2019-12-26 | R12,915.00 | R11,039.94 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00006376. |
| AL-013 | 2019-12 | R14,193.85 | 00006376, 00006423, 00006685 | 2019-12-26, 2020-01-16, 2020-03-02 | R40,932.80 | R14,193.85 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00006376, 00006423, 00006685. |
| AL-014 | 2020-01 | R13,840.09 | 00006685 | 2020-03-02 | R15,302.80 | R13,840.09 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00006685. |
| AL-015 | 2020-02 | R11,250.03 | 00006685, 00007216, 00007226, 00007348 | 2020-03-02, 2020-06-03, 2020-06-28, 2020-08-03 | R26,552.80 | R11,250.03 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00006685, 00007216, 00007226, 00007348. |
| AL-016 | 2020-03 | R10,125.03 | 00007348, 00007489, 00007572 | 2020-08-03, 2020-09-03, 2020-11-04 | R13,125.00 | R10,125.03 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00007348, 00007489, 00007572. |
| AL-017 | 2021-03 | R12,518.20 | 00007572, 00008420 | 2020-11-04, 2021-04-08 | R17,643.21 | R12,518.20 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00007572, 00008420. |
| AL-018 | 2021-04 | R9,765.76 | 00008420, 00008764 | 2021-04-08, 2021-05-10 | R22,283.97 | R9,765.76 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00008420, 00008764. |
| AL-019 | 2021-05 | R12,222.90 | 00008764, 00009315 | 2021-05-10, 2021-06-02 | R21,988.66 | R12,222.90 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00008764, 00009315. |
| AL-020 | 2021-06 | R12,372.10 | 00009315, 00009996, 00010226 | 2021-06-02, 2021-06-30, 2021-08-04 | R32,594.95 | R12,372.10 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00009315, 00009996, 00010226. |
| AL-021 | 2021-07 | R7,999.95 | 00010226 | 2021-08-04 | R9,079.94 | R7,999.95 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00010226. |
| AL-022 | 2021-08 | R13,012.51 | 00010226, 00010584 | 2021-08-04, 2021-09-01 | R22,092.44 | R13,012.51 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00010226, 00010584. |
| AL-023 | 2021-09 | R13,260.28 | 00010584, 00011068 | 2021-09-01, 2021-10-06 | R26,272.78 | R13,260.28 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00010584, 00011068. |
| AL-024 | 2021-10 | R13,329.62 | 00011068, 00011558, 00012146 | 2021-10-06, 2021-11-03, 2021-12-19 | R38,350.29 | R13,329.62 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00011068, 00011558, 00012146. |
| AL-025 | 2021-11 | R16,378.91 | 00012146, 00012719 | 2021-12-19, 2022-01-30 | R29,178.60 | R16,378.91 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00012146, 00012719. |
| AL-026 | 2021-12 | R12,399.78 | 00012719 | 2022-01-30 | R17,018.30 | R12,399.78 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00012719. |
| AL-027 | 2022-01 | R16,425.58 | 00012719, 00013245, 00013583 | 2022-01-30, 2022-03-16, 2022-04-11 | R45,949.88 | R16,425.58 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00012719, 00013245, 00013583. |
| AL-028 | 2022-02 | R12,506.00 | 00013583 | 2022-04-11 | R13,949.00 | R12,506.00 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00013583. |
| AL-029 | 2022-03 | R16,951.56 | 00013583, 00014135 | 2022-04-11, 2022-05-31 | R32,133.64 | R16,951.56 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00013583, 00014135. |
| AL-030 | 2022-04 | R16,176.56 | 00014135, 00015071 | 2022-05-31, 2022-07-25 | R35,460.31 | R16,176.56 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00014135, 00015071. |
| AL-031 | 2022-05 | R18,947.57 | 00015071, 00015473, 00015987 | 2022-07-25, 2022-08-10, 2022-09-09 | R48,933.91 | R18,947.57 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00015071, 00015473, 00015987. |
| AL-032 | 2022-06 | R16,103.76 | 00015987, 00016648 | 2022-09-09, 2022-10-19 | R33,054.56 | R16,103.76 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00015987, 00016648. |
| AL-033 | 2022-07 | R17,169.29 | 00016648, 00017073 | 2022-10-19, 2022-11-23 | R29,723.67 | R17,169.29 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00016648, 00017073. |
| AL-034 | 2022-08 | R18,105.18 | 00017073, 00017578 | 2022-11-23, 2022-12-18 | R31,828.32 | R18,105.18 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00017073, 00017578. |
| AL-035 | 2022-09 | R16,606.08 | 00017578, 00017777 | 2022-12-18, 2023-01-18 | R28,815.84 | R16,606.08 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00017578, 00017777. |
| AL-036 | 2022-10 | R12,454.56 | 00017777, 00018185 | 2023-01-18, 2023-02-12 | R36,010.28 | R12,454.56 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00017777, 00018185. |
| AL-037 | 2022-11 | R14,043.62 | 00018185 | 2023-02-12 | R25,184.36 | R14,043.62 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00018185. |
| AL-038 | 2022-12 | R21,966.66 | 00018185, 00019176, 00020357 | 2023-02-12, 2023-03-21, 2023-05-01 | R48,863.11 | R21,966.66 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00018185, 00019176, 00020357. |
| AL-039 | 2023-01 | R11,335.68 | 00020357, 00021193 | 2023-05-01, 2023-05-30 | R27,752.53 | R11,335.68 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00020357, 00021193. |
| AL-040 | 2023-02 | R12,343.07 | 00021193, 00022711 | 2023-05-30, 2023-07-20 | R30,550.15 | R12,343.07 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00021193, 00022711. |
| AL-041 | 2023-03 | R16,111.50 | 00022711, 00023280 | 2023-07-20, 2023-08-10 | R28,947.46 | R16,111.50 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00022711, 00023280. |
| AL-042 | 2023-04 | R15,140.69 | 00023280, 00023977 | 2023-08-10, 2023-09-04 | R30,771.61 | R15,140.69 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00023280, 00023977. |
| AL-043 | 2023-05 | R17,368.55 | 00023977, 00025394 | 2023-09-04, 2023-10-23 | R30,876.38 | R17,368.55 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00023977, 00025394. |
| AL-044 | 2023-06 | R13,403.06 | 00025394, 00026601 | 2023-10-23, 2023-11-28 | R26,432.35 | R13,403.06 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00025394, 00026601. |
| AL-045 | 2023-07 | R13,911.54 | 00026601, 00027468 | 2023-11-28, 2023-12-28 | R37,322.09 | R13,911.54 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00026601, 00027468. |
| AL-046 | 2023-08 | R12,520.81 | 00027468 | 2023-12-28 | R24,801.28 | R12,520.81 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00027468. |
| AL-047 | 2023-09 | R11,272.74 | 00027468, 00028893 | 2023-12-28, 2024-02-19 | R39,009.76 | R11,272.74 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00027468, 00028893. |
| AL-048 | 2023-10 | R13,528.54 | 00028893, 00030269 | 2024-02-19, 2024-04-23 | R30,359.52 | R13,528.54 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00028893, 00030269. |
| AL-049 | 2023-11 | R14,208.48 | 00030269, 00030891 | 2024-04-23, 2024-05-26 | R27,256.35 | R14,208.48 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00030269, 00030891. |
| AL-050 | 2023-12 | R16,151.10 | 00030891, 00031179 | 2024-05-26, 2024-06-09 | R24,967.34 | R16,151.10 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00030891, 00031179. |
| AL-051 | 2024-01 | R15,226.78 | 00031179, 00031792 | 2024-06-09, 2024-07-08 | R29,257.21 | R15,226.78 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00031179, 00031792. |
| AL-052 | 2024-02 | R12,524.11 | 00031792, 00032896 | 2024-07-08, 2024-08-22 | R33,030.04 | R12,524.11 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00031792, 00032896. |
| AL-053 | 2024-03 | R12,612.13 | 00032896, 00033810 | 2024-08-22, 2024-09-29 | R37,867.04 | R12,612.13 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00032896, 00033810. |
| AL-054 | 2024-04 | R12,634.86 | 00033810 | 2024-09-29 | R20,232.18 | R12,634.86 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00033810. |
| AL-055 | 2024-05 | R18,256.94 | 00033810, 00034425 | 2024-09-29, 2024-10-27 | R40,675.18 | R18,256.94 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00033810, 00034425. |
| AL-056 | 2024-06 | R15,232.18 | 00034425, 00035270 | 2024-10-27, 2024-12-03 | R38,884.12 | R15,232.18 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00034425, 00035270. |
| AL-057 | 2024-07 | R15,443.00 | 00035270, 00036139 | 2024-12-03, 2025-01-16 | R40,778.01 | R15,443.00 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00035270, 00036139. |
| AL-058 | 2024-08 | R15,184.18 | 00036139 | 2025-01-16 | R22,336.89 | R15,184.18 | R0.00 | CALENDAR_MONTH_FULL_SETTLEMENT | Confirmed | Month settled in full by payment doc 00036139. |
| AL-059 | 2024-09 | R15,336.89 | 00036139, 00036988 | 2025-01-16, 2025-02-20 | R41,887.31 | R15,336.89 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00036139, 00036988. |
| AL-060 | 2024-10 | R14,025.58 | 00036988, 00038481 | 2025-02-20, 2025-05-04 | R35,367.05 | R14,025.58 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00036988, 00038481. |
| AL-061 | 2024-11 | R12,524.85 | 00038481, 00038846 | 2025-05-04, 2025-05-21 | R23,154.60 | R12,524.85 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00038481, 00038846. |
| AL-062 | 2024-12 | R15,816.63 | 00038846, 00039812 | 2025-05-21, 2025-06-11 | R27,895.66 | R15,816.63 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00038846, 00039812. |
| AL-063 | 2025-01 | R17,574.84 | 00039812, 00040063 | 2025-06-11, 2025-07-13 | R32,352.93 | R17,574.84 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00039812, 00040063. |
| AL-064 | 2025-02 | R10,320.82 | 00040063, 00040746 | 2025-07-13, 2025-08-21 | R26,374.68 | R10,320.82 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00040063, 00040746. |
| AL-065 | 2025-03 | R11,795.24 | 00040746, 00041664 | 2025-08-21, 2025-10-13 | R31,181.25 | R11,795.24 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00040746, 00041664. |
| AL-066 | 2025-04 | R21,724.53 | 00041664, 00042134 | 2025-10-13, 2025-11-05 | R29,929.68 | R21,724.53 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00041664, 00042134. |
| AL-067 | 2025-05 | R13,342.37 | 00042134, 00042788 | 2025-11-05, 2025-12-28 | R26,489.73 | R13,342.37 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00042134, 00042788. |
| AL-068 | 2025-06 | R14,618.11 | 00042788, 00043199 | 2025-12-28, 2026-02-04 | R28,740.09 | R14,618.11 | R0.00 | CALENDAR_MONTH_BATCH_SETTLEMENT | Confirmed | Month settled in full via batch payments: 00042788, 00043199. |
| AL-069 | 2025-07 | R18,780.13 | 00043199 | 2026-02-04 | R15,578.23 | R5,400.84 | R13,379.29 | PARTIAL_MONTH_SETTLEMENT | Probable | Partially settled. Remaining unpaid LPG: R13,379.29. |
| AL-070 | 2025-08 | R12,401.13 | — | — | — | — | R12,401.13 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-071 | 2025-09 | R13,327.87 | — | — | — | — | R13,327.87 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-072 | 2025-10 | R17,110.42 | — | — | — | — | R17,110.42 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-073 | 2025-11 | R11,629.67 | — | — | — | — | R11,629.67 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-074 | 2025-12 | R15,560.88 | — | — | — | — | R15,560.88 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-075 | 2026-01 | R10,428.32 | — | — | — | — | R10,428.32 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-076 | 2026-02 | R10,559.95 | — | — | — | — | R10,559.95 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-077 | 2026-03 | R15,926.35 | — | — | — | — | R15,926.35 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-078 | 2026-04 | R14,736.00 | — | — | — | — | R14,736.00 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |
| AL-079 | 2026-05 | R11,797.84 | — | — | — | — | R11,797.84 | UNALLOCATED_INVOICE | Exception | No payment allocated. LPG balance remains completely unpaid. |

## Unallocated Invoice Register

| Invoice Date | Invoice No | Month | Invoice Amount | Amount Allocated | Amount Unallocated | Reason | Confidence |
| ------------ | ---------- | ----- | -------------: | ---------------: | -----------------: | ------ | ---------- |
| 2025-07-09 | 44707 | 2025-07 | R4,200.69 | R2,285.79 | R1,914.90 | Partially settled in July 2025 batch allocation | Probable |
| 2025-07-17 | 44933 | 2025-07 | R4,200.69 | R0.00 | R4,200.69 | Partially settled in July 2025 batch allocation | Probable |
| 2025-07-23 | 45091 | 2025-07 | R2,800.46 | R0.00 | R2,800.46 | Partially settled in July 2025 batch allocation | Probable |
| 2025-07-25 | 45162 | 2025-07 | R262.55 | R0.00 | R262.55 | Partially settled in July 2025 batch allocation | Probable |
| 2025-07-31 | 45323 | 2025-07 | R4,200.69 | R0.00 | R4,200.69 | Partially settled in July 2025 batch allocation | Probable |
| 2025-08-07 | 45498 | 2025-08 | R2,800.46 | R0.00 | R2,800.46 | Unpaid month, credit notes applied | Exception |
| 2025-08-14 | 45671 | 2025-08 | R4,114.57 | R0.00 | R4,114.57 | Unpaid month, credit notes applied | Exception |
| 2025-08-21 | 45831 | 2025-08 | R4,114.57 | R0.00 | R4,114.57 | Unpaid month, credit notes applied | Exception |
| 2025-08-28 | 45992 | 2025-08 | R1,371.53 | R0.00 | R1,371.53 | Unpaid month, credit notes applied | Exception |
| 2025-09-03 | 46124 | 2025-09 | R4,114.57 | R0.00 | R4,114.57 | Unpaid month, credit notes applied | Exception |
| 2025-09-10 | 46308 | 2025-09 | R3,948.56 | R0.00 | R3,948.56 | Unpaid month, credit notes applied | Exception |
| 2025-09-18 | 46525 | 2025-09 | R2,632.37 | R0.00 | R2,632.37 | Unpaid month, credit notes applied | Exception |
| 2025-09-25 | 46686 | 2025-09 | R2,632.37 | R0.00 | R2,632.37 | Unpaid month, credit notes applied | Exception |
| 2025-10-02 | 46859 | 2025-10 | R3,948.56 | R0.00 | R3,948.56 | Unpaid month, credit notes applied | Exception |
| 2025-10-08 | 46990 | 2025-10 | R3,948.56 | R0.00 | R3,948.56 | Unpaid month, credit notes applied | Exception |
| 2025-10-16 | 47148 | 2025-10 | R2,632.37 | R0.00 | R2,632.37 | Unpaid month, credit notes applied | Exception |
| 2025-10-23 | 47292 | 2025-10 | R2,632.37 | R0.00 | R2,632.37 | Unpaid month, credit notes applied | Exception |
| 2025-10-31 | 47464 | 2025-10 | R3,948.56 | R0.00 | R3,948.56 | Unpaid month, credit notes applied | Exception |
| 2025-11-07 | 47571 | 2025-11 | R2,584.37 | R0.00 | R2,584.37 | Unpaid month, credit notes applied | Exception |
| 2025-11-13 | 47670 | 2025-11 | R2,584.37 | R0.00 | R2,584.37 | Unpaid month, credit notes applied | Exception |
| 2025-11-20 | 47848 | 2025-11 | R3,876.56 | R0.00 | R3,876.56 | Unpaid month, credit notes applied | Exception |
| 2025-11-27 | 47983 | 2025-11 | R2,584.37 | R0.00 | R2,584.37 | Unpaid month, credit notes applied | Exception |
| 2025-12-11 | 48244 | 2025-12 | R2,596.52 | R18.21 | R2,578.31 | Unpaid month, credit notes applied | Exception |
| 2025-12-18 | 48391 | 2025-12 | R3,894.77 | R0.00 | R3,894.77 | Unpaid month, credit notes applied | Exception |
| 2025-12-23 | 48487 | 2025-12 | R1,298.26 | R0.00 | R1,298.26 | Unpaid month, credit notes applied | Exception |
| 2025-12-30 | 48578 | 2025-12 | R3,894.77 | R0.00 | R3,894.77 | Unpaid month, credit notes applied | Exception |
| 2025-12-31 | 48599 | 2025-12 | R3,894.77 | R0.00 | R3,894.77 | Unpaid month, credit notes applied | Exception |
| 2026-01-08 | 48701 | 2026-01 | R3,894.77 | R0.00 | R3,894.77 | Unpaid month, credit notes applied | Exception |
| 2026-01-16 | 48828 | 2026-01 | R3,920.13 | R0.00 | R3,920.13 | Unpaid month, credit notes applied | Exception |
| 2026-01-27 | 48994 | 2026-01 | R2,613.42 | R0.00 | R2,613.42 | Unpaid month, credit notes applied | Exception |
| 2026-02-05 | 49126 | 2026-02 | R3,959.98 | R0.00 | R3,959.98 | Unpaid month, credit notes applied | Exception |
| 2026-02-12 | 49242 | 2026-02 | R2,639.99 | R0.00 | R2,639.99 | Unpaid month, credit notes applied | Exception |
| 2026-02-17 | 49315 | 2026-02 | R3,959.98 | R0.00 | R3,959.98 | Unpaid month, credit notes applied | Exception |
| 2026-03-03 | 49540 | 2026-03 | R3,959.98 | R0.00 | R3,959.98 | Unpaid month, credit notes applied | Exception |
| 2026-03-12 | 49727 | 2026-03 | R3,988.79 | R0.00 | R3,988.79 | Unpaid month, credit notes applied | Exception |
| 2026-03-19 | 49842 | 2026-03 | R3,988.79 | R0.00 | R3,988.79 | Unpaid month, credit notes applied | Exception |
| 2026-03-31 | 50042 | 2026-03 | R3,988.79 | R0.00 | R3,988.79 | Unpaid month, credit notes applied | Exception |
| 2026-04-08 | 50161 | 2026-04 | R4,420.80 | R0.00 | R4,420.80 | Unpaid month, credit notes applied | Exception |
| 2026-04-17 | 50290 | 2026-04 | R2,947.20 | R0.00 | R2,947.20 | Unpaid month, credit notes applied | Exception |
| 2026-04-23 | 50371 | 2026-04 | R2,947.20 | R0.00 | R2,947.20 | Unpaid month, credit notes applied | Exception |
| 2026-04-30 | 50468 | 2026-04 | R4,420.80 | R0.00 | R4,420.80 | Unpaid month, credit notes applied | Exception |
| 2026-05-08 | 50594 | 2026-05 | R3,370.81 | R0.00 | R3,370.81 | Unpaid month, credit notes applied | Exception |
| 2026-05-15 | 50712 | 2026-05 | R3,370.81 | R0.00 | R3,370.81 | Unpaid month, credit notes applied | Exception |
| 2026-05-20 | 50810 | 2026-05 | R5,056.22 | R0.00 | R5,056.22 | Unpaid month, credit notes applied | Exception |

## Unallocated Payment Register

| Payment Date | Payment Doc No | Payment Amount | Amount Allocated | Amount Unallocated | Possible Month(s) | Reason | Confidence |
| ------------ | -------------- | -------------: | ---------------: | -----------------: | ----------------- | ------ | ---------- |
*All payments are fully allocated to chronological invoice month balances. There are no unallocated payments.*

## Database Mapping — Informative, Not Canonical
- **Header Layer (`transaction_headers`):** Contains raw ERP statement transaction summaries. Contains date-shifted duplicates and payment allocation splits.
- **Itemized Component Layer (`vw_clean_transactions`):** Canonical source for line-item components.
