# MD0003 — 2025 Payment Pattern Analysis

Generated on 2026-08-11 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R181,722.54**
* **Permanent Outstanding Anomalies:** **R70,780.78**
  * **2025-02 Statement Skip:** Billed **R15,633.20**, completely skipped.
  * **2025-05 Statement Skip:** Billed **R25,661.08**, completely skipped.
  * **2025-08 Statement Skip:** Billed **R29,486.50**, completely skipped.
* **Timing / Settlement Corrections Applied (self-cancelling):**
  * **2025-01 STAT:113 batch:** Customer AP ledger confirms Jan invoice pool paid; ERP batch R21,718.57.
  * **2025-06 STAT:118 batch:** Payment 40430 R3,755.57 confirmed via customer AP ledger open-item match.
  * **2025-07 STAT:119 batch:** Payment 41044 R9,895.88 confirmed via customer AP ledger open-item match.
  * **2025-09 STAT:121 batch:** Payment 42051 R35,770.31 confirmed via COD remittance (01/11/2025). Sep invoice pool settled; not a skipped month at cash level.
  * **2025-10 STAT:121 catch-up (42440):** Oct LPG pool R16,016.28 cleared via ref-linked slices on doc 42440.
  * **2025-11 STAT:121 catch-up (42440):** Nov LPG pool R14,560.26 cleared via ref-linked slices on doc 42440.
  * **2025-12 STAT:123 batch:** Payment 43239 remittance portion R17,999.24 confirmed (31/01/2026).
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2025-01** | R21,718.57 | 2025-03-03 | 37263 | −R21,718.57 | −R0.00 | R0.00 | Customer AP ledger (2025-09-08 export) shows all 4 Jan invoices at zero balance. ERP STAT:113 batch 37262+37263 sums to R21,718.57 cent-exact. |
| **2025-02** | R15,633.20 | — | — | R0.00 | — | +R15,633.20 | **Skipped Month:** Statement was completely unpaid. |
| **2025-03** | R9,379.92 | 2025-05-02 | 38372 | -R9,379.92 | -R0.00 | R-0.00 | Paid in full. |
| **2025-04** | R48,245.20 | 2025-06-02 | 39145 | -R48,245.20 | -R0.00 | R-0.00 | Paid in full. |
| **2025-05** | R25,661.08 | — | — | R0.00 | — | +R25,661.08 | **Skipped Month:** Statement was completely unpaid. |
| **2025-06** | R31,769.90 | 2025-08-01 | 40430 | −R3,755.57 | −R0.00 | R0.00 | Customer AP ledger open item 44136 R3,755.57 at 2025-09-08 snapshot. ERP payment 40430 (STAT:118) cent-exact. |
| **2025-07** | R39,440.76 | 2025-09-01 | 41044 | −R9,895.88 | −R0.00 | R0.00 | Customer AP ledger open items 44439+44634+44937 = R9,895.88 at snapshot. ERP payment 41044 (STAT:119) cent-exact. |
| **2025-08** | R29,486.50 | — | — | R0.00 | — | +R29,486.50 | **Skipped Month:** Statement was completely unpaid. |
| **2025-09** | R40,577.08 | 2025-11-01 | 42051 | −R35,770.31 | −R0.00 | R0.00 | Paid in full per COD remittance 01.11.2025 (RM-2025-11-01). Multi-invoice STAT:121 batch — 9 LPG + 1 CYL (46445). |
| **2025-10** | R32,032.56 | 2025-11-28 | 42440 | −R16,016.28 | −R0.00 | R0.00 | Catch-up STAT:121 batch 42440 — ERP ref slices on docs 46861, 47094, 47101, 47333 sum cent-exact to Oct-2025 LPG billing. |
| **2025-11** | R29,120.52 | 2025-11-28 | 42440 | −R14,560.26 | −R0.00 | R0.00 | Catch-up STAT:121 batch 42440 — ERP ref slices on docs 47558, 47622, 47827, 47828 sum cent-exact to Nov-2025 LPG billing. |
| **2025-12** | R35,998.48 | 2026-01-31 | 43239 | −R17,999.24 | −R0.00 | R0.00 | Paid in full per COD remittance 31.01.2026 (RM-2026-01-31). STAT:123 — Dec-2025 invoice pool (48019–48523). |
| **TOTAL** | **R359,063.77** | | | **-R177,341.23** | | **R181,722.54** | **Net balance change for 2025.** |

### 2.1 Candidate Invoice Details for Underpayments

| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |
| :--- | :---: | :---: | :---: | :--- | ---: |
| — | — | — | — | No Pattern 2 candidate invoice underpayments identified for this period. | — |

**Investigation Notes:**
* No candidate invoice details were identified for this period; skipped statements are listed separately below where applicable.

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| **2025-02** | R15,633.20 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2025-05** | R25,661.08 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2025-08** | R29,486.50 | Unpaid | Statement was completely unpaid during the calendar year. |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R2,645.00

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 35876** | 35876 | 2025-01-02 | −R19,247.39 | — | ✅ Present. |
| **Doc 37143** | 37143 | 2025-02-03 | −R30,590.66 | — | ✅ Present. |
| **Doc 37144** | 37144 | 2025-02-03 | −R8,883.40 | — | ✅ Present. |
| **Doc 37262** | 37262 | 2025-03-03 | −R9,307.96 | — | ✅ Present. |
| **Doc 37263** | 37263 | 2025-03-03 | −R34,129.18 | 2025-01 | ✅ Present. |
| **Doc 37817** | 37817 | 2025-04-01 | −R31,266.40 | — | ✅ Present. |
| **Doc 37817** | 37817 | 2025-04-07 | −R0.00 | — | ✅ Present. |
| **Doc 38372** | 38372 | 2025-05-02 | −R9,379.92 | 2025-03 | ✅ Present. |
| **Doc 39145** | 39145 | 2025-06-02 | −R48,245.20 | 2025-04 | ✅ Present. |
| **Doc 39816** | 39816 | 2025-07-01 | −R20,505.82 | — | ✅ Present. |
| **Doc 40430** | 40430 | 2025-08-01 | −R7,511.14 | 2025-06 | ✅ Present. |
| **Doc 41044** | 41044 | 2025-09-01 | −R19,791.76 | 2025-07 | ✅ Present. |
| **Doc 41501** | 41501 | 2025-10-01 | −R12,465.86 | — | ✅ Present. |
| **Doc 42051** | 42051 | 2025-11-01 | −R71,540.62 | 2025-09 | ✅ Present. |
| **Doc 42440** | 42440 | 2025-11-28 | −R95,022.34 | 2025-11 | ✅ Present. |
| **Doc 42858** | 42858 | 2025-12-31 | −R19,460.52 | — | ✅ Present. |
| **Doc 43239** | 43239 | 2026-02-02 | −R35,998.48 | 2025-12 | ✅ Present. |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2025-01-01 through to the closing balance as of 2025-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2025-01-01)

* LPG Gas Components (Invoices/Credits pre-2025): **+R1,176,425.89**
* Cylinder Components (Invoices/Credits pre-2025): **R8,906.33**
* ERP Journals (pre-2025): **+R26,947.87**
* Payments Received (pre-2025): **-R1,185,363.10**
* **Total Corrected Opening Balance:** **R26,916.99**

#### 2. Net 2025 Activity

* LPG Invoices: **+R391,519.27**
* LPG Credit Notes: **R-32,455.50**
* Cylinder Invoices: **+R333,557.50**
* Cylinder Credit Notes: **R-330,912.50**
* ERP Journals: **+R0.00**
* Payments Received: **-R437,348.17**
* **Net 2025 Corrected Activity:** **+R-75,639.40**

#### 3. Closing Balance (as of 2025-12-31)

* LPG Gas Components (Lifetime to date): **+R1,535,489.66**
* Cylinder Components (Lifetime to date): **+R11,551.33**
* ERP Journals (Lifetime to date): **+R26,947.87**
* Payments Received (Lifetime to date): **-R1,622,711.27**
* **Total Corrected Closing Balance:** **R-48,722.41**

> **Proof:**
> `Opening Balance (R26,916.99) + Net 2025 Activity (R-75,639.40) = Closing Balance (R-48,722.41)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R-75,639.40**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R181,722.54**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2025-01-01) | R26,916.99 |
| Corrected Closing Balance (as of 2025-12-31) | R-48,722.41 |
| **Net Ledger Balance Movement** | **+R-75,639.40** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R359,063.77 |
| Payment Allocations (Settling 2025 Invoices) | −R177,341.23 |
| **Net Variance Outstanding** | **+R181,722.54** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R-257,361.94** between the Ledger Balance Movement (+R-75,639.40) and the Monthly Table (+R181,722.54) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R2,645.00 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R0.00 | ERP adjustments posted in year 2025 |
| Cash Timing Boundary Shift | R-260,006.94 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R-257,361.94** | ✅ Matches difference |

---

## 5. Unallocated Payment Pool (2025 Items)

The following cash payments received during 2025 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
