# JIM001 — 2026 Payment Pattern Analysis

Generated on 2026-06-16 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R72,399.45**
* **Permanent Outstanding Anomalies:** **R72,399.45**
  * **2026-01 Statement Skip:** Billed **R14,323.09**, completely skipped.
  * **2026-02 Statement Skip:** Billed **R10,559.95**, completely skipped.
  * **2026-03 Statement Skip:** Billed **R11,937.56**, completely skipped.
  * **2026-04 Statement Skip:** Billed **R14,303.99**, completely skipped.
  * **2026-05 Statement Skip:** Billed **R21,274.86**, completely skipped.
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2026-01** | R14,323.09 | — | — | R0.00 | — | +R14,323.09 | **Skipped Month:** Statement was completely unpaid. |
| **2026-02** | R10,559.95 | — | — | R0.00 | — | +R10,559.95 | **Skipped Month:** Statement was completely unpaid. |
| **2026-03** | R11,937.56 | — | — | R0.00 | — | +R11,937.56 | **Skipped Month:** Statement was completely unpaid. |
| **2026-04** | R14,303.99 | — | — | R0.00 | — | +R14,303.99 | **Skipped Month:** Statement was completely unpaid. |
| **2026-05** | R21,274.86 | — | — | R0.00 | — | +R21,274.86 | **Skipped Month:** Statement was completely unpaid. |
| **TOTAL** | **R72,399.45** | | | **-R0.00** | | **R72,399.45** | **Net balance change for 2026.** |

### 2.1 Candidate Invoice Details for Underpayments

| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |
| :--- | :---: | :---: | :---: | :--- | ---: |
| — | — | — | — | No Pattern 2 candidate invoice underpayments identified for this period. | — |

**Investigation Notes:**
* No candidate invoice details were identified for this period; skipped statements are listed separately below where applicable.

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| **2026-01** | R14,323.09 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-02** | R10,559.95 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-03** | R11,937.56 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-04** | R14,303.99 | Unpaid | Statement was completely unpaid during the calendar year. |
| **2026-05** | R21,274.86 | Unpaid | Statement was completely unpaid during the calendar year. |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R1,207.50

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 43199** | 43199 | 2026-02-05 | −R15,578.23 | — | ✅ Present. |
| **Doc 44555** | 44555 | 2026-06-05 | −R11,666.12 | — | ✅ Present. |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2026-01-01 through to the closing balance as of 2026-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2026-01-01)

* LPG Gas Components (Invoices/Credits pre-2026): **+R1,030,244.10**
* Cylinder Components (Invoices/Credits pre-2026): **R-1,214.00**
* ERP Journals (pre-2026): **+R7,350.00**
* Payments Received (pre-2026): **-R942,501.38**
* **Total Corrected Opening Balance:** **R93,878.72**

#### 2. Net 2026 Activity

* LPG Invoices: **+R78,955.95**
* LPG Credit Notes: **R-6,556.50**
* Cylinder Invoices: **+R59,167.50**
* Cylinder Credit Notes: **R-57,960.00**
* ERP Journals: **+R0.00**
* Payments Received: **-R27,244.35**
* **Net 2026 Corrected Activity:** **+R46,362.60**

#### 3. Closing Balance (as of 2026-12-31)

* LPG Gas Components (Lifetime to date): **+R1,102,643.55**
* Cylinder Components (Lifetime to date): **+R-6.50**
* ERP Journals (Lifetime to date): **+R7,350.00**
* Payments Received (Lifetime to date): **-R969,745.73**
* **Total Corrected Closing Balance:** **R140,241.32**

> **Proof:**
> `Opening Balance (R93,878.72) + Net 2026 Activity (R46,362.60) = Closing Balance (R140,241.32)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R46,362.60**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R72,399.45**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2026-01-01) | R93,878.72 |
| Corrected Closing Balance (as of 2026-12-31) | R140,241.32 |
| **Net Ledger Balance Movement** | **+R46,362.60** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R72,399.45 |
| Payment Allocations (Settling 2026 Invoices) | −R0.00 |
| **Net Variance Outstanding** | **+R72,399.45** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R-26,036.85** between the Ledger Balance Movement (+R46,362.60) and the Monthly Table (+R72,399.45) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R1,207.50 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R0.00 | ERP adjustments posted in year 2026 |
| Cash Timing Boundary Shift | R-27,244.35 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R-26,036.85** | ✅ Matches difference |

---

## 5. Unallocated Payment Pool (2026 Items)

The following cash payments received during 2026 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
