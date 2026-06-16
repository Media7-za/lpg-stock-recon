# JIM001 — 2022 Payment Pattern Analysis

Generated on 2026-06-16 | Tolerance: R5.00

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R133,170.91**
* **Permanent Outstanding Anomalies:** **R133,170.91**
  * **2022-03 Statement Skip:** Billed **R14,943.48**, completely skipped.
  * **2022-05 Statement Skip:** Billed **R18,947.57**, completely skipped.
  * **2022-06 Statement Skip:** Billed **R16,103.76**, completely skipped.
  * **2022-08 Statement Skip:** Billed **R15,337.50**, completely skipped.
  * **2022-09 Statement Skip:** Billed **R16,606.08**, completely skipped.
  * **2022-10 Statement Skip:** Billed **R15,222.24**, completely skipped.
  * **2022-11 Statement Skip:** Billed **R8,139.84**, completely skipped.
  * **2022-12 Statement Skip:** Billed **R27,870.44**, completely skipped.
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2022-01** | R14,982.58 | 2022-03-17 | 13245 | -R14,982.58 | -R0.00 | R0.00 | Paid in full. |
| **2022-02** | R13,949.00 | 2022-04-12 | 13583 | -R13,949.00 | -R0.00 | R0.00 | Paid in full. |
| **2022-03** | R14,943.48 | — | — | R0.00 | — | +R14,943.48 | **Skipped Month:** Statement was completely unpaid. |
| **2022-04** | R18,184.64 | 2022-06-01 | 14135 | -R18,184.64 | -R0.00 | R0.00 | Paid in full. |
| **2022-05** | R18,947.57 | — | — | R0.00 | — | +R18,947.57 | **Skipped Month:** Statement was completely unpaid. |
| **2022-06** | R16,103.76 | — | — | R0.00 | — | +R16,103.76 | **Skipped Month:** Statement was completely unpaid. |
| **2022-07** | R17,169.29 | 2022-09-10 | 15987 | -R17,169.29 | -R0.00 | R0.00 | Paid in full. |
| **2022-08** | R15,337.50 | — | — | R0.00 | — | +R15,337.50 | **Skipped Month:** Statement was completely unpaid. |
| **2022-09** | R16,606.08 | — | — | R0.00 | — | +R16,606.08 | **Skipped Month:** Statement was completely unpaid. |
| **2022-10** | R15,222.24 | — | — | R0.00 | — | +R15,222.24 | **Skipped Month:** Statement was completely unpaid. |
| **2022-11** | R8,139.84 | — | — | R0.00 | — | +R8,139.84 | **Skipped Month:** Statement was completely unpaid. |
| **2022-12** | R27,870.44 | — | — | R0.00 | — | +R27,870.44 | **Skipped Month:** Statement was completely unpaid. |
| **TOTAL** | **R197,456.42** | | | **-R64,285.51** | | **R133,170.91** | **Net balance change for 2022.** |

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R1,541.00

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. STAT Sequence & Payment Flow Reconciliation

| Batch | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **STAT196** | 12719 | 2022-01-31 | −R17,018.30 | Nov 2021 | ✅ Present. Out of 2022 scope (settles Nov 2021 invoice). |
| **STAT197** | 13245 | 2022-03-17 | −R14,982.58 | Jan 2022 | ✅ Present. Settled Jan 2022 invoice in full. |
| **STAT198** | 13583 | 2022-04-12 | −R13,949.00 | Feb 2022 | ✅ Present. Settled Feb 2022 invoice in full. |
| **STAT199** | **—** | **—** | **R0.00** | Mar 2022 | **🔴 MISSING — Under bank recon investigation.** |
| **STAT200** | 14135 | 2022-06-01 | −R18,184.64 | Apr 2022 | ✅ Present. Settled Apr 2022 invoice in full. |
| **STAT201** | 15071 | 2022-07-26 | −R17,275.67 | May 2022 | ✅ Present. Partially settled May 2022 invoice (underpaid R1,671.90). |
| **STAT202** | 15473 | 2022-08-11 | −R14,488.95 | Jun 2022 | ✅ Present. Partially settled Jun 2022 invoice (underpaid R1,614.81). |
| **STAT203** | 15987 | 2022-09-10 | −R17,169.29 | Jul 2022 | ✅ Present. Settled Jul 2022 invoice in full. |
| **STAT204** | 16648 | 2022-10-20 | −R15,885.27 | Aug 2022 | ✅ Present. Reconciled Aug 2022 invoice with R547.77 surplus (Rule 13). |
| **STAT205** | 17073 | 2022-11-24 | −R13,838.40 | Sep 2022 | ✅ Present. Reconciled Sep 2022 invoice (Pattern 3 mirror carry). |
| **STAT206** | 17578 | 2022-12-19 | −R17,989.92 | Oct 2022 | ✅ Present. Reconciled Oct 2022 invoice and covered Sep carryover. |
| **STAT207** | 17777 | 2023-01-19 | −R10,825.92 | Nov 2022 | ✅ Present. Reconciled Nov 2022 invoice (Pattern 3 mirror carry). |
| **STAT208** | 18185 | 2023-02-13 | −R25,184.36 | Dec 2022 | ✅ Present. Reconciled Dec 2022 invoice (Pattern 3 mirror carry). |

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2022-01-01 through to the closing balance as of 2022-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2022-01-01)

* LPG Gas Components (Invoices/Credits pre-2022): **+R316,382.55**
* Cylinder Components (Invoices/Credits pre-2022): **R-1,380.00**
* ERP Journals (pre-2022): **+R7,350.00**
* Payments Received (pre-2022): **-R306,935.92**
* **Total Corrected Opening Balance:** **R15,416.63**

#### 2. Net 2022 Activity

* LPG Invoices: **+R210,692.08**
* LPG Credit Notes: **R-13,235.66**
* Cylinder Invoices: **+R60,329.00**
* Cylinder Credit Notes: **R-58,788.00**
* ERP Journals: **+R0.00**
* Payments Received: **-R160,782.02**
* **Net 2022 Corrected Activity:** **+R38,215.40**

#### 3. Closing Balance (as of 2022-12-31)

* LPG Gas Components (Lifetime to date): **+R513,838.97**
* Cylinder Components (Lifetime to date): **+R161.00**
* ERP Journals (Lifetime to date): **+R7,350.00**
* Payments Received (Lifetime to date): **-R467,717.94**
* **Total Corrected Closing Balance:** **R53,632.03**

> **Proof:**
> `Opening Balance (R15,416.63) + Net 2022 Activity (R38,215.40) = Closing Balance (R53,632.03)` ✅

### 4.2 Reconciling Calendar Year Activity (View C) vs. Invoice Settlement Pool

This section reconciles the cash transactions posted within calendar year 2022 (**View C**) to the payments allocated in the monthly settlement pool (**Section 2**).

#### View C — Assumed R0.00 Opening Balance (Calendar Year 2022 Activity)

| Line Item | Amount |
| :--- | ---: |
| LPG Gas Invoices Billed | +R210,692.08 |
| LPG Gas Credit Notes Applied | −R13,235.66 |
| **Net LPG Gas Billed** | **R197,456.42** |
| Payments Received (Posted in 2022) | −R160,782.02 |
| **Net 2022 Activity / Outstanding Balance** | **+R36,674.40** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R197,456.42 |
| Payment Allocations (Settling 2022 Invoices) | −R179,774.00 |
| **Net Variance Outstanding** | **+R17,682.42** |

#### Mathematical Bridge — Cash Boundary Shift Proof

The exact difference of **R18,991.98** between View C (+R36,674.40) and the Monthly Table (+R17,682.42) is proven by mapping the three timing boundary-crossing payments:

| STAT Batch | Doc | Payment Date | Amount | Boundary Crossing |
| :--- | :---: | :---: | ---: | :--- |
| STAT196 | 12719 | 2022-01-31 | −R17,018.30 | Paid in 2022, settles **Nov 2021** → exits 2022 pool |
| STAT207 | 17777 | 2023-01-19 | +R10,825.92 | Paid in 2023, settles **Nov 2022** → enters 2022 pool |
| STAT208 | 18185 | 2023-02-13 | +R25,184.36 | Paid in 2023, settles **Dec 2022** → enters 2022 pool |
| | | | **R18,991.98** | ✅ Matches exactly |

> **Proof:**
> `R179,774.00 (Settlement Pool) − R160,782.02 (Calendar Payments) = R18,991.98`
> `= (−R17,018.30) + R10,825.92 + R25,184.36` ✅

---

## 5. Unallocated Payment Pool (2022 Items)

The following cash payments received during 2022 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

* **STAT196** (Doc 12719, 2022-01-31): **R239.48** unallocated portion.
* **STAT204** (Doc 16648, 2022-10-20): **R547.77** unallocated portion (August 2022 surplus).

*Note: The R2,767.68 clerical surplus in STAT206 (Doc 17578) is excluded from this list because it was fully consumed by the September 2022 Pattern 3 mirror carry.*
