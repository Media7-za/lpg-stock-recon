# MD0003 — 2026 Payment Pattern Analysis

Generated on 2026-08-11 | Tolerance: R5.00

> **AMENDED 2026-09-20 (manual, not a script re-run).** The real generator (`analysis/debtors/shared/scripts/payment_pattern_analysis.py`) requires `DATABASE_URL` plus a `.venv_fam` with `pandas`/`sqlalchemy` — none available in this session, so Sections 1–3 below are **not** regenerated from scratch. Per this report's own "Drift Protection" rule, hand-edits to Sections 1–2 would normally be overwritten by a real re-run — this amendment should be treated as a temporary patch, superseded the next time the script actually runs. Two corrections applied, both backed by hard evidence available since this report was written:
> 1. **"2026-07 Statement Skip" is WRONG — the month was paid, just 2 months late.** STAT:130 (ERP doc 46021, posted 01/09/2026, R30,053.70) settled the full July 2026 LPG month (6 invoices, R25,014.18) plus the outstanding June carry (invoice 51470, R5,039.52) — confirmed cent-exact against remittance `01.09.2026.pdf` and `DEBENQ_CURRENT.TXT`. See `MD0003_Remittance_Payment_46021.md`.
> 2. **§4.1/§4.2 below (flagged 2026-09-17) are superseded by a verified replacement**, §4.1-CORRECTED, added after §4.2 — see that section for the real, TXT-anchored fiscal-year figures.
>
> `Net LPG Gas Balance Change` (R89,132.22, below) and the per-month `LPG Variance` column are **not recomputed** in this amendment — they came from a DB query (`vw_clean_transactions` filtered on `debt_group`) this session cannot reproduce, and recomputing only the July row by hand risks a fresh, unverified number replacing an old one. Flagged as **stale, not corrected** — needs the real script run.

---

## 1. Executive Summary

* **Net LPG Gas Balance Change:** **R89,132.22** — **STALE, includes the now-resolved July "skip" as a permanent anomaly; needs recomputation by the real script.**
* **Permanent Outstanding Anomalies:** ~~R25,014.18 (2026-07 Statement Skip)~~ — **RESOLVED 2026-09-20.** July 2026 was paid via STAT:130 (doc 46021, 01/09/2026), 2 months in arrears, together with the June carry (invoice 51470). No longer a skip — see amendment note above. No other permanent anomaly identified for Jan–Jul 2026 to date.
* **Timing / Settlement Corrections Applied (self-cancelling):**
  * **2026-01 STAT:124 batch:** Payment 43494 R13,845.67 confirmed via remittance; R57.50 review residual.
  * **2026-02 STAT:125 batch:** Payment 43854 R13,773.92 confirmed via remittance (01/04/2026).
  * **2026-03 STAT:126 batch:** Payment 44231 R15,017.78 confirmed via remittance (01/05/2026).
  * **2026-04 STAT:127 batch:** Payment 44561 R13,014.20 confirmed via remittance (01/06/2026).
  * **2026-05 STAT:128 batch:** Payment 44972 R17,311.60 confirmed via remittance + CURRENT.TXT. R4,539.72 Rule 13 surplus.
  * **2026-06 STAT:129 batch:** Payment 45595 R14,863.43 confirmed via COD remittance (01/08/2026). R4,689.53 Pattern 2 residual — see 2026-07 entry below, this is the mirror half of the same carry.
  * **2026-07 STAT:130 batch (added 2026-09-20):** Payment 46021 R30,053.70 confirmed via COD remittance (01/09/2026) — exact sum of invoice 51470 (June carry, R5,039.52) + the 6 July invoices (R25,014.18). Per Rule/Pattern 3 (Exact Mirror Carry), both June and July should be treated as **FULLY SETTLED via timing correction**, not as a June underpayment plus a July skip — the R4,689.53 June "residual" above and the R25,014.18 July "skip" are two halves of one carried invoice, not two separate anomalies. (Note: R4,689.53 + R5,039.52 do not reconcile to a single clean figure without the DB-sourced June LPG total; flagged for the real script to confirm the exact Pattern-3 tie-out, not asserted here.)
* **Arrears Catch-Up Payments Received:** **-R0.00**

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **2026-01** | R27,806.34 | 2026-03-02 | 43494 | −R13,845.67 | −R0.00 | R57.50 | Remittance 02.03.2026 (RM-2026-03-02). Net after CN 14328. R57.50 residual vs Jan billing — ERP CYL slice on 48927. |
| **2026-02** | R27,547.84 | 2026-04-01 | 43854 | −R13,773.92 | −R0.00 | R0.00 | Paid in full per COD remittance 01.04.2026 (RM-2026-04-01). STAT:125 — Feb-2026 invoices 49128–49443. |
| **2026-03** | R30,035.56 | 2026-05-01 | 44231 | −R15,017.78 | −R0.00 | R0.00 | Paid in full per COD remittance 01.05.2026 (RM-2026-05-01). STAT:126 — Mar-2026 invoice pool 49573–50013. |
| **2026-04** | R22,124.14 | 2026-06-01 | 44561 | −R13,014.20 | −R0.00 | R0.00 | Paid in full per COD remittance 01.06.2026 (RM-2026-06-01). STAT:127 — Apr-2026 invoices 50100, 50234, 50429. |
| **2026-05** | R24,877.80 | 2026-07-01 | 44972 | −R17,311.60 | −R0.00 | −R4,539.72 | COD remittance 01.07.2026 (RM-2026-07-01) + ERP CURRENT.TXT payment 44972 STAT:128 posted. Docs 50524–50886. Gross exceeds May-2026 LPG billing by R4,539.72 — Rule 13 surplus. |
| **2026-06** | R19,552.96 | 2026-08-03 | 45595 | −R14,863.43 | −R0.00 | R4,689.53 | COD remittance 01.08.2026 (RM-2026-08-01). STAT:129 — docs 50996, 50998, 51099, 51398 cent-exact R14,863.43. Underpaid R4,689.53 vs Jun-2026 LPG month (DN#22920=ROSEDALE 51470 not on remittance). |
| **2026-07** | R25,014.18 | 2026-09-01 | 46021 | −R30,053.70 | −R0.00 | ~~+R25,014.18~~ **R0.00 (AMENDED 2026-09-20)** | ~~Skipped Month~~ — **PAID, 2 months late.** COD remittance 01.09.2026.pdf (RM-2026-09-01), STAT:130. Payment 46021 = exact sum of invoice 51470 (June carry, R5,039.52) + 6 July invoices (R25,014.18) = R30,053.70. See amendment note above the Executive Summary. |
| **TOTAL** | **R176,958.82** | | | **-R87,826.60** | | **R89,132.22 — STALE, see amendment note** | **Net balance change for 2026 — needs recomputation by the real script now that July is resolved.** |

### 2.1 Candidate Invoice Details for Underpayments

| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |
| :--- | :---: | :---: | :---: | :--- | ---: |
| — | — | — | — | No Pattern 2 candidate invoice underpayments identified for this period. | — |

**Investigation Notes:**
* No candidate invoice details were identified for this period; skipped statements are listed separately below where applicable.

### 2.2 Skipped Statements (Unpaid Months)

| Skipped Month | Billed Amount | Payment Status | Investigation / Action Notes |
| :--- | :---: | :--- | :--- |
| ~~**2026-07**~~ | ~~R25,014.18~~ | **RESOLVED 2026-09-20** | No longer unpaid — STAT:130 (doc 46021, 01/09/2026) settled it 2 months in arrears. Not a skip; this account's established cadence (see `lpg-payment-pattern-analysis` skill) can run behind by more than one cycle without the debt being permanently lost. |

**No skipped statements remain as of this amendment (Jan–Jul 2026).** August and September 2026 are separately open per the account's normal one-month-in-arrears cadence — not skips — see `MD0003_Statement_of_Account.md` for the current-window detail and the still-unresolved R12,263.61 residual there (unrelated to the July skip corrected here).

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact:** R-115.00

Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules.

## 4. Payment Flow & Sequence Reconciliation

| Sequence | Payment Doc | Payment Date | Payment Amount | Reconciled Month | Status / Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Doc 43239** | 43239 | 2026-02-02 | −R35,998.48 | 2025-12 | ✅ Present. |
| **Doc 43494** | 43494 | 2026-03-02 | −R27,691.34 | 2026-01 | ✅ Present. |
| **Doc 43854** | 43854 | 2026-04-01 | −R27,547.84 | 2026-02 | ✅ Present. |
| **Doc 44231** | 44231 | 2026-05-05 | −R15,017.78 | 2026-03 | ✅ Present. |
| **Doc 44561** | 44561 | 2026-06-01 | −R13,014.20 | 2026-04 | ✅ Present. |
| **Doc 44972** | 44972 | 2026-07-01 | −R17,311.60 | 2026-05 | ✅ Present. |
| **Doc 45595** *(added 2026-09-20)* | 45595 | 2026-08-03 | −R14,863.43 | 2026-06 | ✅ Present. COD remittance 01.08.2026.pdf, docs 50996/50998/51099/51398. |
| **Doc 46021** *(added 2026-09-20)* | 46021 | 2026-09-01 | −R30,053.70 | 2026-06 (partial: invoice 51470) + 2026-07 (full) | ✅ Present. COD remittance 01.09.2026.pdf. This is the payment that resolves the "2026-07 Statement Skip" flagged in §1/§2 originally — see amendment note. |

> **⚠ FLAGGED 2026-09-17 — §4.1/§4.2 below do not match the verified ledger.** A full fiscal-year-by-fiscal-year reconstruction of `DEBENQ_2017.TXT`–`DEBENQ_CURRENT.TXT` (see `MD0003_Lifetime_Balance_Investigation_2026-09-17.md`) shows the actual ERP balance at 31/12/2025 was **R5,735.63** (a small debtor balance), not the **R-48,722.41 credit balance** claimed below, and the account's balance is positive at every fiscal year-end since FY2017 — a R1.5M+ pre-2026 LPG component never appears in the raw export. Treat §4.1–4.2 as unreliable pending a from-scratch regeneration; do not cite the figures below.

### 4.1 Ledger-Wide Historical Balance Reconciliation (View A/B)

This section reconciles the lifetime-to-date ledger balances starting from the opening balance as of 2026-01-01 through to the closing balance as of 2026-12-31, incorporating historical carry-forwards, cylinder flows, and journal adjustments:

#### 1. Opening Balance (as of 2026-01-01)

* LPG Gas Components (Invoices/Credits pre-2026): **+R1,535,489.66**
* Cylinder Components (Invoices/Credits pre-2026): **R11,551.33**
* ERP Journals (pre-2026): **+R26,947.87**
* Payments Received (pre-2026): **-R1,622,711.27**
* **Total Corrected Opening Balance:** **R-48,722.41**

#### 2. Net 2026 Activity

* LPG Invoices: **+R183,845.78**
* LPG Credit Notes: **R-6,886.96**
* Cylinder Invoices: **+R173,247.50**
* Cylinder Credit Notes: **R-173,362.50**
* ERP Journals: **+R0.00**
* Payments Received: **-R136,581.24**
* **Net 2026 Corrected Activity:** **+R40,262.58**

#### 3. Closing Balance (as of 2026-12-31)

* LPG Gas Components (Lifetime to date): **+R1,712,448.48**
* Cylinder Components (Lifetime to date): **+R11,436.33**
* ERP Journals (Lifetime to date): **+R26,947.87**
* Payments Received (Lifetime to date): **-R1,759,292.51**
* **Total Corrected Closing Balance:** **R-8,459.83**

> **Proof:**
> `Opening Balance (R-48,722.41) + Net 2026 Activity (R40,262.58) = Closing Balance (R-8,459.83)` ✅

### 4.2 Reconciling Ledger Balance Movement (View A/B) vs. Invoice Settlement Pool

This section reconciles the lifetime ledger balance movement (**View A/B** net change of **R40,262.58**) to the matching payments allocated in the monthly settlement pool (**Section 2** net change of **R89,132.22**):

#### Ledger Balance Movement (View A/B Totals)

| Line Item | Amount |
| :--- | ---: |
| Corrected Opening Balance (as of 2026-01-01) | R-48,722.41 |
| Corrected Closing Balance (as of 2026-12-31) | R-8,459.83 |
| **Net Ledger Balance Movement** | **+R40,262.58** |

#### Monthly Settlement Pool (Section 2 Totals)

| Line Item | Amount |
| :--- | ---: |
| Net LPG Gas Billed | R176,958.82 |
| Payment Allocations (Settling 2026 Invoices) | −R87,826.60 |
| **Net Variance Outstanding** | **+R89,132.22** |

#### Mathematical Bridge — Cumulative Ledger to Settlement Pool Proof

The exact difference of **R-48,869.64** between the Ledger Balance Movement (+R40,262.58) and the Monthly Table (+R89,132.22) is proven by mapping all non-cash items, journals, and timing boundary-crossing payments:

| Reconciliation Component | Amount | Description |
| :--- | ---: | :--- |
| Cylinder Net Movement | R-115.00 | Ledger-only returns & debits (excluded from LPG cash pool) |
| ERP Journal Adjustments | R0.00 | ERP adjustments posted in year 2026 |
| Cash Timing Boundary Shift | R-48,754.64 | Payments crossing the calendar year boundary |
| **Total Reconciliation Variance** | **R-48,869.64** | ✅ Matches difference |

### 4.1-CORRECTED — Verified fiscal-year chain (replaces §4.1/§4.2 above, added 2026-09-20)

§4.1/§4.2 above were flagged 2026-09-17 as not matching the verified ledger (they claimed a R-48,722.41 credit balance and R1.5M+ pre-2026 LPG activity that appear nowhere in the raw ERP export). This section replaces them with figures reconstructed directly from `DEBENQ_CURRENT.TXT`, verified line-by-line against the TXT's own running balance with zero divergence (full method: `MD0003_Lifetime_Balance_Investigation_2026-09-17.md`, `MD0003_Statement_Account_v5.md`).

**This section covers 2026-01-01 → 2026-09-15 (the latest data available), not a projected full calendar year** — §4.1's original "closing balance as of 2026-12-31" could not have been known on its 2026-08-11 generation date and is not reconstructed here as a projection.

| | Combined | LPG (1A) | CYL (1B) | Basis |
| :--- | ---: | ---: | ---: | :--- |
| **Opening (2026-01-01)** | R5,735.63 | R5,678.13 | R57.50 | Combined: **PROVEN** (`DEBENQ_CURRENT.TXT` line 204, 31/12/2025). 1A/1B split: **ASSERTED** — assumes CYL sub-ledger was R0.00 at the TXT's own Feb-2025 opening; supporting evidence in `MD0003_Statement_Account_v5.md` |
| **Closing (2026-09-15)** | R15,309.11 | R14,791.61 | R517.50 | Combined: **PROVEN** (ERP `CURRENT BALANCE` header). 1A/1B split: ASSERTED, same basis |
| **Net movement, YTD** | **+R9,573.48** | +R9,113.48 | +R460.00 | Derived from the above |

**Proof:** `Opening (R5,735.63) + Net YTD movement (R9,573.48) = Closing (R15,309.11)` ✅ — ties exactly, unlike the original §4.1's proof chain.

No "Cash Timing Boundary Shift" or multi-hundred-thousand-Rand pre-2026 LPG/CYL component exists in the verified data — the original §4.1's R-48,754.64 bridge line and R1,535,489.66 opening LPG figure do not correspond to anything found in `DEBENQ_2017.TXT`–`DEBENQ_CURRENT.TXT`.

---

## 5. Unallocated Payment Pool (2026 Items)

The following cash payments received during 2026 had surplus amounts that were not consumed by any LPG invoices. In line with **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)**, these are tracked in the unallocated pool rather than matching individual month balances:

No unallocated items mapped for this period.
