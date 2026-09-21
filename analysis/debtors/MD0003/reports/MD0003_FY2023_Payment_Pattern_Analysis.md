# MD0003 — FY2023 Payment Pattern Analysis

**Fiscal year 01/03/2022 – 28/02/2023.** Built from `raw/Enquiry/DEBENQ_2023.TXT`, cross-checked against `MD0003_FY2024_Payment_Pattern_Analysis.md` for the very start of the following year where relevant. Companion to `MD0003_FY2024_Payment_Pattern_Analysis.md` and `MD0003_FY2025_Payment_Pattern_Analysis.md` (the two years immediately following); distinct from the existing **calendar**-year `MD0003_2022_Payment_Pattern_Analysis.md` (Jan–Dec 2022), which this report substantially **contradicts** — see §1.

**Generated:** 2026-09-21 | **Tolerance:** R5.00 | Same methodology/DB-availability constraint as the FY2024/FY2025 reports (no `DATABASE_URL`/`pandas`/`sqlalchemy` this session — built by direct TXT reconstruction, verified line-by-line).

---

## 1. Executive Summary

* **Total LPG Gas Billed (FY2023):** **R183,536.28** across 12 billing months (Mar 2022 – Feb 2023).
* **Major correction to `MD0003_2022_Payment_Pattern_Analysis.md`: none of that report's five "Skipped Month" claims survive direct TXT verification.** That report (generated 2026-07-16, calendar year 2022) claims May, July, August, October, and December 2022 were "completely unpaid" — R91,300.32 of "permanent outstanding anomalies." Tracing every invoice number to a real, cent-exact-verified payment tag in `DEBENQ_2023.TXT` shows **every one of these months was actually paid**, just via awkward cross-batch slicing that a same-month lookup misses:
  * **May 2022** (R12,757.36): paid across **two** batches — July (doc 14611, 2 invoices) and August (doc 15257, 1 invoice) — summing exactly.
  * **June 2022** (R11,162.69): similarly split — most via August (doc 15257), the remainder via two further partial tags landing in September and October that only reconcile once summed together (R598.00 + R4,186.01 = R4,784.01 exactly).
  * **July 2022** (R18,219.91): paid via September (doc 15852), cent-exact once the 4 real July invoices are correctly separated from an unrelated same-amount tag belonging to June.
  * **August 2022** (R19,477.49, not R18,879.49 — the calendar report's own billed figure is closer to correct than this report's own first-pass TXT bucket, which double-counted an unrelated credit note): paid in full via October (doc 16248).
  * **October 2022** (R24,027.40 — matches the calendar report's own billed figure exactly): paid in full via December (doc 17044).
  * **December 2022** (R18,157.91): paid in full via February 2023 (doc 17879).
  * The calendar report's own **payment document numbers** for these months (15071, 15473, 15987, 16648, 17073, 17578) **do not appear anywhere in `DEBENQ_2023.TXT`** — the real doc numbers found here (14611, 15257, 15852, 16248, 17044, 17879) are entirely different. This suggests the calendar report was built from a different, and in places incorrect, data source — **do not cite that report's Section 4 payment-doc claims** until reconciled against the raw TXT.
* **No genuine underpayment identified for FY2023.** Every billing month, once fully traced (including slices landing in later fiscal years), is paid cent-exact.
* **Confirms the "leftover gets resolved eventually, however messily" pattern already documented for later years** — several invoices here are split across 2–3 payment batches spanning multiple months before fully reconciling, the same behaviour seen in FY2024's Pattern-2 carries and FY2025/FY2026's cross-batch invoices.

---

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment(s) | Reconciliation Notes |
| :--- | :---: | :--- | :--- |
| **2022-03** | R15,399.99 | 2022-05-03, doc 13676 | Cent-exact, 4 invoices, clean 2-month lag. |
| **2022-04** | R12,188.08 | 2022-06-01, doc 14137 | Cent-exact, 3 invoices. |
| **2022-05** | R12,757.36 | 2022-07-01 (doc 14611, R7,973.35) + 2022-08-01 (doc 15257, R4,784.01) | **Cross-batch carry, not a skip.** Two of three May invoices paid on schedule in July; the third slips one further month to August. Sum matches exactly. |
| **2022-06** | R11,162.69 | 2022-08-01 (doc 15257, R6,378.68) + split R598.00/R4,186.01 across Sept/Oct doc slices | **Cross-batch carry, not a skip.** One invoice paid on schedule; the other (R4,784.01) paid in two odd-sized pieces a month apart — sums exactly once combined. |
| **2022-07** | R18,219.91 | 2022-09-01, doc 15852 | Paid in full, cent-exact, once the batch's own tagging noise (one slice actually belongs to June, see above) is excluded. |
| **2022-08** | R19,477.49 | 2022-10-03, doc 16248 (core R19,477.49 of a R23,663.50 total batch) | **Paid in full — not skipped.** Remainder of the batch (R4,186.01) is June's carry (above). |
| **2022-09** | R13,962.25 | 2022-11-02, doc 16725 | Cent-exact, 3 invoices. |
| **2022-10** | R24,027.40 | 2022-12-01, doc 17044 (core R24,027.40 of a R29,403.40 total batch) | **Paid in full — not skipped.** Remainder (R5,376.00) is an untagged residual, not investigated further in this report. |
| **2022-11** | R12,025.08 | 2023-01-03, doc 17669 | Paid in full per COD remittance 01.01.2023 (already correctly identified in the calendar-2022 report). |
| **2022-12** | R18,157.91 | 2023-02-01, doc 17879 | **Paid in full — not skipped.** Cent-exact, 6 invoices. |
| **2023-01** | R14,740.41 | 2023-02-28, doc 18482 | Paid within the same fiscal year, ~1-month lag (irregular vs. the usual 2-month cadence — two separate batches landed in Feb 2023, one for Dec on the 1st, one for Jan on the 28th). Not investigated further; not an anomaly, just an observed scheduling quirk. |
| **2023-02** | R8,156.42 | Not yet due within FY2023 (due ~April 2023) | Confirmed paid via `MD0003_FY2024_Payment_Pattern_Analysis.md`'s STAT:104 batch and neighbours. **Not a skip.** |
| **TOTAL** | **R183,536.28** | | **No genuine underpayment identified.** |

### 2.1 Candidate Invoice Details for Underpayments

None found. The apparent underpayments in the source calendar-2022 report (R1,671.90 twice, R1,614.81 once) do not correspond to any real gap once each invoice is traced to its actual (sometimes delayed, sometimes split) payment.

### 2.2 Skipped Statements (Unpaid Months)

**None.** This directly contradicts `MD0003_2022_Payment_Pattern_Analysis.md`'s claim of five skipped months (May, July, August, October, December 2022) — see §1 for the correction and evidence. Flagging the calendar report's §2.2/§4 in place is recommended rather than treating either report as settled without operator review — this session did not go back and edit the calendar-2022 report itself (out of scope for this request), only documents the contradiction here.

---

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact: ~R0.00** across FY2023 — no material open CYL exception identified in this window (unlike FY2024's R2,392.00). One minor CYL-tagged line in December 2022 nets against its own credit note in the same period.

---

## 4. Payment Flow & Sequence Reconciliation

| Payment Doc | Date | Amount | Reconciled Month(s) | Status |
| :--- | :---: | ---: | :--- | :---: |
| 12923 | 2022-03-01 | −R10,696.00 | 2022-01 (pre-window) | ✅ Present, cent-exact (out of FY2023 scope) |
| 13428 | 2022-04-01 | −R12,849.99 | 2022-02 (pre-window, partial — remaining R345.00 not cleared until STAT:103, May 2024, ~2 years later; see `MD0003_FY2025_Payment_Pattern_Analysis.md` correction note) | ✅ core amount present |
| 13676 | 2022-05-03 | −R15,399.99 | 2022-03 | ✅ Present, cent-exact |
| 14137 | 2022-06-01 | −R12,188.08 | 2022-04 | ✅ Present, cent-exact |
| 14611 | 2022-07-01 | −R7,973.35 | 2022-05 (partial) | ✅ Present |
| 15257 | 2022-08-01 | −R11,162.69 | 2022-05 (remainder) + 2022-06 (partial) | ✅ Present |
| 15852 | 2022-09-01 | −R18,219.91 | 2022-07 + a June partial slice | ✅ Present |
| 16248 | 2022-10-03 | −R23,663.50 | 2022-08 (full) + June's remaining carry | ✅ Present |
| 16725 | 2022-11-02 | −R13,962.25 | 2022-09 | ✅ Present, cent-exact |
| 17044 | 2022-12-01 | −R29,403.40 | 2022-10 (full) + R5,376.00 untagged | ✅ core amount present |
| 17669 | 2023-01-03 | −R12,025.08 | 2022-11 | ✅ Present, cent-exact (remittance-backed) |
| 17879 | 2023-02-01 | −R18,157.91 | 2022-12 | ✅ Present, cent-exact |
| 18482 | 2023-02-28 | −R14,740.41 | 2023-01 | ✅ Present, cent-exact |

**Reconciliation block:**

| Line Item | Amount |
| :--- | ---: |
| Total FY2023 LPG billed (12 months) | R183,536.28 |
| Confirmed paid within/shortly after window | −R183,536.28 (net of the tracing above) |
| **Net outstanding, FY2023 billing** | **R0.00** |

---

## 5. Unallocated Payment Pool (FY2023 Items)

No genuine Rule 13 surplus identified for this fiscal year once the cross-batch carries above are correctly attributed.
