# JIM001 — 2018 Payment Pattern Analysis

Generated on 2026-06-16 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R9,000.02**
* **Permanent Outstanding Anomalies:** **R9,000.02**
  * **2018-12 Statement Skip:** Billed **R9,000.02**, completely skipped.
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2018-12** | R9,000.02 | — | — | R0.00 | — | +R9,000.02 | **Skipped Month:** Statement was completely unpaid. |
| **TOTAL** | **R9,000.02** | | | **-R0.00** | | **R9,000.02** | **Net balance change for 2018.** |

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| **2018-12** | R9,000.02 | Unpaid | Statement was completely unpaid during the calendar year. |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R0.00

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 4832** | 4832 | 2018-12-18 | −R3,750.00 | | ✅ Present. |
| **Doc 4839** | 4839 | 2018-12-29 | −R4,250.00 | | ✅ Present. |
| **Doc 4807** | 4807 | 2019-01-05 | −R700.01 | | ✅ Present. |
| **Doc 4898** | 4898 | 2019-01-09 | −R8,500.00 | | ✅ Present. |
| **Doc 4841** | 4841 | 2019-01-10 | −R700.01 | | ✅ Present. |
| **Doc 4904** | 4904 | 2019-01-21 | −R7,000.00 | | ✅ Present. |
| **Doc 5043** | 5043 | 2019-02-07 | −R4,870.00 | | ✅ Present. |
| **Doc 5047** | 5047 | 2019-02-19 | −R6,827.39 | | ✅ Present. |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2018-01-01 through to the closing balance as of 2018-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2018-01-01)

* LPG Gas Components (Invoices/Credits pre-2018): **+R0.00**
* Cylinder Components (Invoices/Credits pre-2018): **R0.00**
* ERP Journals (pre-2018): **+R0.00**
* Payments Received (pre-2018): **-R0.00**
* **Total Corrected Opening Balance:** **R0.00**

#### 2. Net 2018 Activity

* LPG Invoices: **+R9,000.02**
* LPG Credit Notes: **R0.00**
* Cylinder Invoices: **+R0.00**
* Cylinder Credit Notes: **R0.00**
* ERP Journals: **+R8,000.00**
* Payments Received: **-R8,000.00**
* **Net 2018 Corrected Activity:** **+R9,000.02**

#### 3. Closing Balance (as of 2018-12-31)

* LPG Gas Components (Lifetime to date): **+R9,000.02**
* Cylinder Components (Lifetime to date): **+R0.00**
* ERP Journals (Lifetime to date): **+R8,000.00**
* Payments Received (Lifetime to date): **-R8,000.00**
* **Total Corrected Closing Balance:** **R9,000.02**

> **Proof:**
> `Opening Balance (R0.00) + Net 2018 Activity (R9,000.02) = Closing Balance (R9,000.02)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R9,000.02**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R-27,597.39**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2018-01-01) | R0.00 |
| Corrected Closing Balance (as of 2018-12-31) | R9,000.02 |
| **Net Ledger Balance Movement** | **+R9,000.02** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R9,000.02 |
| Payment Allocations (Settling 2018 Invoices) | −R36,597.41 |
| **Net Variance Outstanding** | **+R-27,597.39** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R36,597.41** between the Ledger Balance Movement (+R9,000.02) and the Monthly Table (+R-27,597.39) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R0.00 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R8,000.00 | ERP adjustments posted in year 2018 |
| Cash Timing Boundary Shift | R28,597.41 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R36,597.41** | ✅ Matches difference |

---

## 5. Unallocated Payment Pool (2018 Items)

The following cash payments received during 2018 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
