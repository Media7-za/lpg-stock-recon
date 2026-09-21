# MD0003 — 2026 Open Invoices (Working Projection — No Opening Balance)

**INTERNAL_ONLY — do not send to the customer.** This is a working document for the R12,263.61 gap investigation, not a customer statement. Per `business_rules.md` §15 and `DEBTORS_DOCTRINE.md` §2, `debtors:tag-check` is currently **BLOCKED** for this account (see `MD0003_TAG_COVERAGE_2026-09-21.md`) — an itemized open-invoice list must not be released externally until that gate clears. Internal use (this investigation, collections triage) is unaffected.

**Generated:** 2026-09-21 | **Source:** `raw/Enquiry/DEBENQ_CURRENT.TXT` (refreshed through 15/09/2026) | **Gate status:** `debtors:tag-check` → BLOCKED, over-stated by R12,263.61

---

## Why no opening balance

This projection deliberately **excludes any Balance B/F / prior-period carry**. It lists only invoices dated in 2026 that remain open after the 20 remittance-backed closures already ratified this session (`config/statement_of_account.json` → `closedInvoiceOverrides`, covering STAT:126–130). The account's real, provable position (R5,735.63 opening at 2026-01-01 → R15,309.11 today) is documented separately in `MD0003_Lifetime_Balance_Investigation_2026-09-17.md` and is **not restated here** — this document exists specifically to isolate the open-invoice question from the balance-bridge question while the R12,263.61 gap is still being traced (`MD0003_Lifetime_Balance_Investigation_2026-09-17.md` §Addendum has the current state of that investigation).

---

## 2026 Open Invoices

| Invoice | Date | DN / Reference | Amount (R) |
| :--- | :--- | :--- | ---: |
| 52421 | 08 Aug 2026 | DN#23948-ROSEDALE | 545.77 |
| 52422 | 08 Aug 2026 | DN#23948-EMPTY (net of CN) | 517.50 |
| 52542 | 14 Aug 2026 | DN#24270-VICTORIA | 3,827.91 |
| 52720 | 21 Aug 2026 | DN#24926-MKONDENI | 2,551.94 |
| 52757 | 23 Aug 2026 | DN#228976 | 2,551.94 |
| 52772 | 25 Aug 2026 | DN#22897-VICTORIA | 3,827.91 |
| 53004 | 07 Sep 2026 | DN#24826-ROSEDALE | 5,709.61 |
| 53019 | 07 Sep 2026 | DN#24972 | 4,440.15 |
| 53138 | 15 Sep 2026 | DN#24853 | 3,599.99 |
| **Total open (2026, no opening balance)** | | | **27,572.72** |

No invoices from 2022–2025 appear on this list — the four fiscal-year Payment Pattern Analyses completed this session (`MD0003_FY2022_..._Analysis.md` through `MD0003_FY2025_..._Analysis.md`) found no genuine outstanding LPG debt from those years, with the single, separately-tracked exception of invoice 38939 (Dec 2024, R5,376.00 — see `MD0003_FY2025_Payment_Pattern_Analysis.md` §2.1), which is **not** included in this 2026-only projection.

---

## Why this total (R27,572.72) is not the account balance (R15,309.11)

This is the same gap under active investigation, not a new number. Reconciliation so far (`MD0003_Lifetime_Balance_Investigation_2026-09-17.md` §Addendum):

| Component | Amount (R) | Status |
| :--- | ---: | :--- |
| This projection's total (open 2026 invoices) | 27,572.72 | Sum of the table above |
| Less: real ERP balance | 15,309.11 | PROVEN |
| **= Unexplained gap** | **12,263.61** | Of which: |
| — identified (doc 48372 mistag) | 3,273.10 | Not force-closed — true target unknown |
| — checked, unresolved (4 small residuals) | 4,973.79 | No remittance, no exact-sum match, no AP-ledger match |
| — no lead yet | ~4,016.72 | Open |

**Do not treat R27,572.72 as what the customer owes.** The R15,309.11 ERP balance remains the only PROVEN figure safe to quote externally. This table exists so the gap investigation has a stable, opening-balance-free baseline to work against without re-deriving the open-invoice list each time.
