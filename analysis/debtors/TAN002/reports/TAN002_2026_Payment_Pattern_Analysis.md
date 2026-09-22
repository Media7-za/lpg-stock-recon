# TAN002 — 2026 Payment Pattern Analysis

Generated on 2026-09-22 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R27,054.06**
* **Permanent Outstanding Anomalies:** **R27,054.06**
  * **2026-01 Statement Skip:** Billed **R9,362.81**, completely skipped.
  * **2026-02 Statement Skip:** Billed **R8,030.59**, completely skipped.
  * **2026-03 Statement Skip:** Billed **R8,348.14**, completely skipped.
  * **2026-08 Statement Skip:** Billed **R1,312.52**, completely skipped.
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2026-01** | R9,362.81 | — | — | R0.00 | — | +R9,362.81 | **Skipped Month:** Statement was completely unpaid. |
| **2026-02** | R8,030.59 | — | — | R0.00 | — | +R8,030.59 | **Skipped Month:** Statement was completely unpaid. |
| **2026-03** | R8,348.14 | — | — | R0.00 | — | +R8,348.14 | **Skipped Month:** Statement was completely unpaid. |
| **2026-07** | R2,783.99 | 2026-07-15 | 45199 | -R2,783.99 | -R0.00 | R0.00 | Paid in full. |
| **2026-08** | R1,312.52 | — | — | R0.00 | — | +R1,312.52 | **Skipped Month:** Statement was completely unpaid. |
| **TOTAL** | **R29,838.05** | | | **-R2,783.99** | | **R27,054.06** | **Net balance change for 2026.** |

### 2.1 Candidate Invoice Details for Underpayments

| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |
| :--- | :---: | :---: | :---: | :--- | ---: |
| — | — | — | — | No Pattern 2 candidate invoice underpayments identified for this period. | — |

**Investigation Notes:**
* No candidate invoice details were identified for this period; skipped statements are listed separately below where applicable.

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| **2026-01** | R9,362.81 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-02** | R8,030.59 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-03** | R8,348.14 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-08** | R1,312.52 | Unpaid | Statement was completely unpaid during the calendar year. |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R-1,207.50

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 43067** | 43067 | 2026-01-20 | −R10,923.84 | — | ✅ Present. |
| **Doc 43216** | 43216 | 2026-02-02 | −R2,342.18 | — | ✅ Present. |
| **Doc 43373** | 43373 | 2026-02-18 | −R5,193.03 | — | ✅ Present. |
| **Doc 43562** | 43562 | 2026-03-06 | −R4,021.93 | — | ✅ Present. |
| **Doc 43752** | 43752 | 2026-03-23 | −R4,775.85 | — | ✅ Present. |
| **Doc 44064** | 44064 | 2026-04-21 | −R1,193.96 | — | ✅ Present. |
| **Doc 45199** | 45199 | 2026-07-15 | −R2,783.99 | 2026-07 | ✅ Present. |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2026-01-01 through to the closing balance as of 2026-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2026-01-01)

* LPG Gas Components (Invoices/Credits pre-2026): **+R273,883.60**
* Cylinder Components (Invoices/Credits pre-2026): **R1,207.50**
* ERP Journals (pre-2026): **+R0.00**
* Payments Received (pre-2026): **-R270,434.48**
* **Total Corrected Opening Balance:** **R4,656.62**

#### 2. Net 2026 Activity

* LPG Invoices: **+R38,092.45**
* LPG Credit Notes: **R-8,254.40**
* Cylinder Invoices: **+R27,921.87**
* Cylinder Credit Notes: **R-29,129.37**
* ERP Journals: **+R0.00**
* Payments Received: **-R31,234.78**
* **Net 2026 Corrected Activity:** **+R-2,604.23**

#### 3. Closing Balance (as of 2026-12-31)

* LPG Gas Components (Lifetime to date): **+R303,721.65**
* Cylinder Components (Lifetime to date): **+R0.00**
* ERP Journals (Lifetime to date): **+R0.00**
* Payments Received (Lifetime to date): **-R301,669.26**
* **Total Corrected Closing Balance:** **R2,052.39**

> **Proof:**
> `Opening Balance (R4,656.62) + Net 2026 Activity (R-2,604.23) = Closing Balance (R2,052.39)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R-2,604.23**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R27,054.06**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2026-01-01) | R4,656.62 |
| Corrected Closing Balance (as of 2026-12-31) | R2,052.39 |
| **Net Ledger Balance Movement** | **+R-2,604.23** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R29,838.05 |
| Payment Allocations (Settling 2026 Invoices) | −R2,783.99 |
| **Net Variance Outstanding** | **+R27,054.06** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R-29,658.29** between the Ledger Balance Movement (+R-2,604.23) and the Monthly Table (+R27,054.06) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R-1,207.50 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R0.00 | ERP adjustments posted in year 2026 |
| Cash Timing Boundary Shift | R-28,450.79 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R-29,658.29** | ✅ Matches difference |

---

## 5. Unallocated Payment Pool (2026 Items)

The following cash payments received during 2026 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
