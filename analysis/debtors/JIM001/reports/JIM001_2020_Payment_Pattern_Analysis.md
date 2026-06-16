# JIM001 — 2020 Payment Pattern Analysis

Generated on 2026-06-16 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R21,375.15**
* **Permanent Outstanding Anomalies:** **R21,375.06**
  * **2020-02 Statement Skip:** Billed **R11,250.03**, completely skipped.
  * **2020-03 Statement Skip:** Billed **R10,125.03**, completely skipped.
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2020-01** | R15,302.89 | 2020-03-03 | 6685 | -R15,302.80 | -R0.00 | R0.09 | Paid in full. |
| **2020-02** | R11,250.03 | — | — | R0.00 | — | +R11,250.03 | **Skipped Month:** Statement was completely unpaid. |
| **2020-03** | R10,125.03 | — | — | R0.00 | — | +R10,125.03 | **Skipped Month:** Statement was completely unpaid. |
| **TOTAL** | **R36,677.95** | | | **-R15,302.80** | | **R21,375.15** | **Net balance change for 2020.** |

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| **2020-02** | R11,250.03 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2020-03** | R10,125.03 | Unpaid | Statement was completely unpaid during the calendar year. |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R-345.00

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 6423** | 6423 | 2020-01-17 | −R12,715.00 | | ✅ Present. |
| **Doc 6685** | 6685 | 2020-03-03 | −R15,302.80 | | ✅ Present. |
| **Doc 7216** | 7216 | 2020-06-04 | −R3,250.00 | | ✅ Present. |
| **Doc 7226** | 7226 | 2020-06-29 | −R5,000.00 | | ✅ Present. |
| **Doc 7348** | 7348 | 2020-08-04 | −R3,000.00 | | ✅ Present. |
| **Doc 7489** | 7489 | 2020-09-04 | −R5,000.00 | | ✅ Present. |
| **Doc 7572** | 7572 | 2020-11-05 | −R5,125.00 | | ✅ Present. |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2020-01-01 through to the closing balance as of 2020-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2020-01-01)

* LPG Gas Components (Invoices/Credits pre-2020): **+R156,444.59**
* Cylinder Components (Invoices/Credits pre-2020): **R345.00**
* ERP Journals (pre-2020): **+R7,350.00**
* Payments Received (pre-2020): **-R151,301.41**
* **Total Corrected Opening Balance:** **R12,838.18**

#### 2. Net 2020 Activity

* LPG Invoices: **+R36,677.95**
* LPG Credit Notes: **R0.00**
* Cylinder Invoices: **+R345.00**
* Cylinder Credit Notes: **R-690.00**
* ERP Journals: **+R0.00**
* Payments Received: **-R49,392.80**
* **Net 2020 Corrected Activity:** **+R-13,059.85**

#### 3. Closing Balance (as of 2020-12-31)

* LPG Gas Components (Lifetime to date): **+R193,122.54**
* Cylinder Components (Lifetime to date): **+R0.00**
* ERP Journals (Lifetime to date): **+R7,350.00**
* Payments Received (Lifetime to date): **-R200,694.21**
* **Total Corrected Closing Balance:** **R-221.67**

> **Proof:**
> `Opening Balance (R12,838.18) + Net 2020 Activity (R-13,059.85) = Closing Balance (R-221.67)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R-13,059.85**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R0.15**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2020-01-01) | R12,838.18 |
| Corrected Closing Balance (as of 2020-12-31) | R-221.67 |
| **Net Ledger Balance Movement** | **+R-13,059.85** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R36,677.95 |
| Payment Allocations (Settling 2020 Invoices) | −R36,677.80 |
| **Net Variance Outstanding** | **+R0.15** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R-13,060.00** between the Ledger Balance Movement (+R-13,059.85) and the Monthly Table (+R0.15) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R-345.00 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R0.00 | ERP adjustments posted in year 2020 |
| Cash Timing Boundary Shift | R-12,715.00 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R-13,060.00** | ✅ Matches difference |

---

## 5. Unallocated Payment Pool (2020 Items)

The following cash payments received during 2020 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
