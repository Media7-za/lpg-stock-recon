# MD0003 — FY2024 Payment Pattern Analysis

**Fiscal year 01/03/2023 – 29/02/2024** (this ERP account runs a March–February fiscal year — confirmed via the unbroken B/F chain in `MD0003_Lifetime_Balance_Investigation_2026-09-17.md`). Companion report to `MD0003_FY2025_Payment_Pattern_Analysis.md` (the year immediately following this one) and distinct from the calendar-year `MD0003_2025_Payment_Pattern_Analysis.md`.

**Generated:** 2026-09-20 | **Tolerance:** R5.00 | **Source:** `raw/Enquiry/DEBENQ_2024.TXT` (the FY2024 archive), cross-checked against `raw/Enquiry/DEBENQ_2025.TXT` where a payment for an FY2024 invoice was filed in the adjacent archive (see below).

> **Methodology note.** Same constraint as the FY2025 report: the real generator needs `DATABASE_URL` + a `.venv_fam` Python environment, unavailable this session. Built by direct TXT reconstruction; LPG/CYL classification uses the `-EMPTY`/`EMPTIES` text heuristic (ASSERTED). Payment-to-invoice matching is again unusually strong — nearly every FY2024 payment slice carries a real `INVNO` tag verified cent-exact against its invoice.

---

## 1. Executive Summary

* **Total LPG Gas Billed (FY2024):** **R194,290.61** across 12 billing months (Mar 2023 – Feb 2024)
* **No underpayment found — the cleanest fiscal year checked so far.** Every single billing month either paid exactly on the account's established 2-month lag (confirmed here as far back as March 2023, extending the pattern already documented for FY2025/FY2026) or was legitimately not yet due when the fiscal year closed (Jan/Feb 2024, both independently confirmed paid in `MD0003_FY2025_Payment_Pattern_Analysis.md`'s own STAT:101/STAT:102 rows). December 2023 (R24,786.90) is cent-exact to the rand, with a trivial R0.51 rounding residual on top — immaterial, not treated as an anomaly.
* **Archive-boundary finding, same pattern as FY2025→FY2026:** August 2023's billing (R12,838.37) is paid via STAT:96, dated 02/10/2023 — but that payment is **not present in `DEBENQ_2024.TXT` at all**; it's filed in `DEBENQ_2025.TXT` (lines 13–15), despite being dated well within FY2024. This is the same "Bank UD + reversal, same amount, same date" pair already flagged in `DEBENQ_CURRENT.TXT` during this session's lifetime investigation — confirms it's a genuine archival/filing quirk (a payment processed later gets filed by processing date, not transaction date), not a data-integrity bug, but a real trap for any single-archive analysis: **checking one fiscal year's TXT in isolation can wrongly show a "skipped" month that a look at the adjacent archive resolves.**
* **CYL exposure: R2,392.00 net open as of 29/02/2024**, entirely explained by 5 identified invoice/CN pairs (§3) — not a single unexplained residual, and the same "recurring ~R598-per-unit under/over-credit" pattern already seen in later years (docs 46445/48927/48372) traces back at least this far.
* **Correction to `MD0003_FY2025_Payment_Pattern_Analysis.md`:** that report flagged invno `24010` as an unresolved "legacy reference, matches no FY2025 invoice" appearing on STAT:103 (−R335.09) and STAT:107 (−R860.91). It is not a mystery — **doc 24010 is a real FY2024 CYL invoice** (R1,196.00, "D/N 6421 EMPTIES", 01/09/2023), and R335.09 + R860.91 = **R1,196.00 exactly**. It was simply outside the FY2025 archive this report checked. Flagged for a correction note in the FY2025 report (append, not delete, per doctrine).

---

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **2023-03** | R15,774.66 | 2023-05-02 | 20333 (STAT:?) | −R15,774.66 | Invoices 18500+18502+18504+18568+18913 (net of CN 4607, "delivery postponed", −R3,155.09 on 18500), cent-exact. |
| **2023-04** | R14,869.34 | 2023-06-01 | 21457 | −R14,869.34 | Invoices 18993+19492+19589, cent-exact. |
| **2023-05** | R20,033.14 | 2023-07-01 | 22175 | −R20,033.14 | Invoices 19991+20095+20270+20576+20635+20756, cent-exact. |
| **2023-06** | R13,521.52 | 2023-08-01 | 23096 | −R13,521.52 | Invoices 21097+21353+21793, cent-exact. |
| **2023-07** | R18,792.15 | 2023-09-01 | 23989 | −R18,792.15 | Invoices 22003+22473+22772+22855, cent-exact. |
| **2023-08** | R12,838.37 | 2023-10-02 | 25004 (STAT:96) | −R12,838.37 | **Filed in `DEBENQ_2025.TXT`, not this archive** — see archive-boundary finding above. Invoices 23449+23931+23960, cent-exact once cross-checked there. |
| **2023-09** | R16,460.88 | 2023-11-01 | 25880 | −R16,460.88 | Invoices 24009+24396+24778+24804, cent-exact. |
| **2023-10** | R20,967.20 | 2023-12-01 | 26667 | −R20,967.20 | Invoices 25138+25484+25576+25580, cent-exact. |
| **2023-11** | R14,598.01 | 2024-01-02 | 27447 | −R14,598.01 | Invoices 26381+26458+26778, cent-exact. |
| **2023-12** | R24,786.90 | 2024-02-01 | 28482 | −R24,787.41 | Invoices 27211+27347+27453+27502+28024+28025, cent-exact to R24,786.90. Batch also carries a trivial R0.51 untagged residual — immaterial, not investigated further. |
| **2024-01** | R21,648.44 | 2024-03-01 (outside window) | 29259 (STAT:101) | −R21,648.44 | Not yet due within FY2024 (due 2 months later, March 2024). Confirmed paid in full per `MD0003_FY2025_Payment_Pattern_Analysis.md` §2 (2024-03 row). **Not an anomaly.** |
| **2024-02** | R15,357.36 | 2024-04-02 (outside window) | 30014 (STAT:102) | −R15,357.36 | Not yet due within FY2024 (due 2 months later, April 2024). Confirmed paid in full per `MD0003_FY2025_Payment_Pattern_Analysis.md` §2 (2024-04 row). **Not an anomaly.** |
| **TOTAL** | **R194,290.61** | | | **R194,291.12 confirmed paid (within + shortly after window, incl. R0.51 immaterial residual)** | **No genuine underpayment identified for FY2024.** |

### 2.1 Candidate Invoice Details for Underpayments

None. Every billing month reconciles cent-exact to its own STAT batch (allowing for the archive-boundary filing of the August 2023 payment, and one immaterial R0.51 residual on the December batch).

### 2.2 Skipped Statements (Unpaid Months)

**None**, including August 2023 — which would look skipped from `DEBENQ_2024.TXT` alone, but is confirmed paid via `DEBENQ_2025.TXT`. This is exactly the mistake already corrected once this session (the "2026-07 skip" in `MD0003_2026_Payment_Pattern_Analysis.md`) — flagging it here proactively rather than repeating it a third time.

---

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact: +R2,392.00** (open, as of 29/02/2024) — unlike FY2025 (R0.00 net CYL exposure), FY2024 does carry a real, itemizable residual:

| Doc | Date | Ref | Invoice | Credited | Net open |
| :--- | :--- | :--- | ---: | ---: | ---: |
| 19614 | 24/04/2023 | D/N 4127 EMPTIES | R598.00 | R0.00 | +R598.00 |
| 21110 | 08/06/2023 | D/N 5316 EMPTIES R | R2,990.00 | −R2,392.00 | +R598.00 |
| 22004 | 05/07/2023 | D/N 4861 EMPTIES R | R2,990.00 | −R2,392.00 | +R598.00 |
| 23961 | 31/08/2023 | D/N 6416 EMPTIES | R2,990.00 | −R3,588.00 | −R598.00 |
| 24010 | 01/09/2023 | D/N 6421 EMPTIES | R1,196.00 | R0.00 (paid via LPG-lane cash — see correction note in §1) | +R1,196.00 |

Three of the five (19614, 21110, 22004) show the identical R598.00 shortfall pattern — the same "recurring ~R598-per-unit under/over-credit" signature later seen on docs 46445 (R57.50) and 48927 (R57.50) in FY2026, and the doc-48372 mistagging (R3,273.10) also found this session — reinforcing the case for a portfolio-wide review of this ERP's residual-crediting behaviour (`lpg-recon-bug-fixer` ticket recommended in the FY2025 report applies here too).

---

## 4. Payment Flow & Sequence Reconciliation

| STAT Batch (approx.) | Payment Doc | Payment Date | Amount | Reconciled Billing Month | Status |
| :--- | :--- | :--- | ---: | :--- | :---: |
| — | 20333 | 2023-05-02 | −R19,852.87 | 2023-03 (R15,774.66) + 1 unrelated pre-window tag (18033, R4,078.21) | ✅ core amount present |
| — | 21457 | 2023-06-01 | −R14,869.34 | 2023-04 | ✅ Present, cent-exact |
| — | 22175 | 2023-07-01 | −R20,033.14 | 2023-05 | ✅ Present, cent-exact |
| — | 23096 | 2023-08-01 | −R13,521.52 | 2023-06 | ✅ Present, cent-exact |
| — | 23989 | 2023-09-01 | −R18,792.15 | 2023-07 | ✅ Present, cent-exact |
| STAT:96 | 25004 | 2023-10-02 | −R12,838.37 | 2023-08 | ✅ Present **in `DEBENQ_2025.TXT`**, not this archive |
| — | 25880 | 2023-11-01 | −R16,460.88 | 2023-09 | ✅ Present, cent-exact |
| — | 26667 | 2023-12-01 | −R20,967.20 | 2023-10 | ✅ Present, cent-exact |
| — | 27447 | 2024-01-02 | −R14,598.01 | 2023-11 | ✅ Present, cent-exact |
| — | 28482 | 2024-02-01 | −R24,787.41 | 2023-12 | ✅ Present, cent-exact (+R0.51 residual) |

**Reconciliation block — Payment Settlement Pool vs. FY2024 ERP headers:**

| Line Item | Amount |
| :--- | ---: |
| Total FY2024 LPG billed (12 months) | R194,290.61 |
| Confirmed paid within/shortly after window (incl. Jan/Feb 2024 settled Mar/Apr 2024, and Aug 2023 via the adjacent archive) | −R194,291.12 |
| **Net outstanding, FY2024 billing** | **−R0.51** (immaterial rounding, not a real credit balance) |

**This is the cleanest fiscal year reconciliation found across this account's history to date** — no genuine underpayment, in contrast to FY2025's R5,376.00 shortfall (invoice 38939).

---

## 5. Unallocated Payment Pool (FY2024 Items)

No genuine surplus (Rule 13) items identified. The single R0.51 residual on the December 2023 batch is too small to be a meaningful surplus and is not tracked separately.
