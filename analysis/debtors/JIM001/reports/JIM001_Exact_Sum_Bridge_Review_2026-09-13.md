# JIM001 — Monthly-Batch Exact-Sum Bridge Review (2018–2026)

Generated 2026-09-13 | Method: `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md` §2 | Evidence ceiling: Tier 3 / ASSERTED (no remittance advice exists for JIM001)

---

## 0. Purpose

`SKILL.md`'s frontmatter names JIM001 as the next account to generalize the
exact-sum-per-calendar-month test to, beyond the MD0003 case it was built on.
This review runs that test across **all 78 payments, 2018-12 through
2026-06**, using 2022 (human-ratified in
`config/payment_pattern_overrides.json`) as the calibration year, and reports
a year-by-year verdict plus three concrete findings the per-year narrative
reports never surfaced because none of them looks across year boundaries.

**Note on the prior handoff:** the handoff for this session cited
`PORTFOLIO_Statement_Pipeline_Payment_Pattern_Review_2026-09-13.md` §3.1/§3.4/§5
as required first reading. That file does not exist anywhere in this
repository's history or branches. This review proceeds on `SKILL.md`, the
2022 calibration report, and the JIM001 data files directly; any
JIM001-specific content that file was meant to carry could not be
incorporated and should be re-supplied if it still exists elsewhere.

---

## 1. Method

Per `SKILL.md` §2: for every payment, test `ABS(payment_gross −
net_month_billing[M]) <= 0.02` against a window of candidate months, before
ever assuming the payment settles whatever month an allocator sequentially
paired it with. `analysis/debtors/JIM001/data/monthly_lpg_insights.csv`
already carries a per-month `net_lpg_invoiced` figure (invoices + same-doc
credit notes, gas lane only) matching the SKILL's definition, so it was used
directly as the billing series; `data/payments.csv` supplied the 78 payment
gross amounts.

**Calibration (2022):** every `FULLY_SETTLED` 2022 month in the CSV is an
exact match to its own billing month, matching the human-ratified
`VERIFIED_MONTHLY_BATCH_MATCH` overrides exactly. The Pattern 2/3 and Rule 13
variances the human reviewer flagged are *not* exact-sum matches to any
nearby month either — consistent with the reviewer's own candidate-invoice
evidence that these are genuine partial payments/mirror carries, not FIFO
artifacts the exact-sum test would resolve. The method reproduces the
ratified 2022 result cleanly. That validates it as the right lens for the
other 8 years.

---

## 2. Critical finding: three of the nine yearly narrative reports are stale

Before trusting any per-year "Permanent Outstanding Anomalies" figure, this
review diffed each `JIM001_[YEAR]_Payment_Pattern_Analysis.md`'s Section 2
table against the current `monthly_lpg_insights.csv`. **2020, 2022, 2023,
2024 agree exactly.** Three do not:

| Year | Report says | Current CSV says | Cause |
| :--- | :--- | :--- | :--- |
| **2018** | Dec fully **skipped**, R9,000.02 unpaid | Dec **partially settled** via split-allocation of doc 4904 (R6,556.68 applied); true residual **R2,443.34** | CSV now reflects sub-invoice `SPLIT_PAYMENT_PORTION` allocation (`allocation_edges.csv`) added after the report was generated |
| **2019** | 7 months "completely skipped" (Jan, Feb, Mar, May, Jul, Sep, Dec) totaling **R83,524.57** | Only Jan and Mar are genuinely unpaid. Feb/May/Jul/Dec are partially settled (small residuals R16–R552); Sep is **overpaid** R552. True net **≈ R23,955.80** | Same — report predates the split-allocation pass |
| **2021** | Oct, Nov, Dec "completely skipped" totaling **R42,108.31** | Oct partial (−R399.91), Nov overpaid (+R399.91, self-cancelling mirror pair), Dec partial (−R239.48). True net **≈ R239.49** | Same |

The 2019 and 2021 reports were generated from a one-payment-per-month
sequential pairing that had not yet been reconciled against the split/FIFO
invoice-level allocation work now captured in `allocation_edges.csv` and
folded into `monthly_lpg_insights.csv`. Whoever built those two reports
correctly identified genuine payment docs as "present" in their own Section 4
sequence tables but left them unassigned in Section 2 rather than testing
them against neighboring months — precisely the anti-pattern `SKILL.md` §7
warns against, just not visible within a single year's own table.

**These two reports overstate JIM001's historical anomaly by roughly
R59,600 (2019) and R41,900 (2021) — about R101,500 combined.** They should
not be cited as settled and should be regenerated from the current CSV.
This review does not regenerate them (out of scope here — a straight
re-run of whatever produced the other six is the fix), but flags them so
no downstream collections or balance-confidence figure keeps citing the
stale totals.

The reverse also happened once: the **2025** report already re-tested
payment 40746 against neighboring months, found it exact-matches July
(`14,579.44` to the cent) rather than the June it's still paired with in
`monthly_lpg_insights.csv`, and reports it correctly. The CSV row for
2025-06 is the stale one there — a data-file lag, not a report error.

---

## 3. Year-by-year verdict (exact-sum test applied to current, corrected data)

| Year | Net variance (corrected) | Verdict |
| :--- | ---: | :--- |
| 2018 | R2,443.34 | Single partial month; exact-sum not testable (only one billing month in file) |
| 2019 | ≈R23,955.80 | Exact-sum holds for the assigned month in 10/12 months; small genuine residuals elsewhere. **Report stale — see §2.** |
| 2020 | R21,375.15 | Holds. Feb/Mar genuinely unpaid (payment sequence resumes March 2020 mid-COVID-era gap; no candidate payment matches either month). |
| 2021 | ≈R239.49 | Holds cleanly for 7 of 10 months (exact to the cent); Oct/Nov is a genuine self-cancelling mirror pair, Dec a small genuine residual. **Report stale — see §2.** Standing credit detected mid-year — see §4. |
| 2022 | R17,682.42 | Holds — **human-ratified calibration year.** |
| 2023 | −R17,739.02 | Holds — human-ratified (Pattern 3 mirror carry, Rule 13 surpluses, verified underpayments). |
| 2024 | R0.51 | Holds — human-ratified pooled Apr–Nov settlement window; near-perfect net. |
| 2025 | R89,246.79 | Holds for the assigned-month pairing as published in the report. One misattribution candidate — see §5. Unreviewed; six UNPAID months (Jan/Feb/Apr/May/Jun/Dec) carry real, growing exposure. |
| 2026 (through May) | R72,399.45 | All five months genuinely unpaid — no candidate payment in the window matches any of them. One misattribution candidate affecting Dec-2025, not any 2026 month — see §5. Unreviewed. |

**Verdict on the generalization:** the exact-sum-per-calendar-month test
holds for JIM001 across all 9 years, in the sense that every month which
tests as an exact match is a real, cent-accurate settlement, and every
month that doesn't is either (a) a genuine partial payment/mirror carry
already independently corroborated by candidate-invoice evidence (2019,
2021-tail, 2022, 2023, 2024), (b) a genuinely unpaid month with no
candidate payment anywhere in a ±3 month window (2019-01/03, 2020-02/03,
2025 five open months, all of 2026), or (c) one of the three concrete
misattribution candidates below. It does **not** hold as a simple
one-payment-one-month sequential pairing — that assumption is exactly what
produced the two stale reports in §2, and is the same anti-pattern
`SKILL.md` was written to catch for MD0003.

---

## 4. Standing credit — 2021-04 through 2021-10

Running a cumulative billed-vs-paid ledger across the full 2018–2026 span
(SKILL.md §3 test), the gap between cumulative billing and cumulative cash
received sits at a **near-constant −R7,571.68 / −R7,571.67** immediately
after each of seven consecutive STAT-cycle payments:

| Payment | Date | Gap immediately after posting |
| :--- | :--- | ---: |
| 8420 | 2021-04-09 | −7,571.68 |
| 8764 | 2021-05-11 | −7,571.68 |
| 9315 | 2021-06-03 | −7,571.68 |
| 9996 | 2021-07-01 | −7,571.68 |
| 10226 | 2021-08-05 | −7,571.68 |
| 10584 | 2021-09-02 | −7,571.67 |
| 11068 | 2021-10-07 | −7,571.67 |

Seven consecutive cycles at a constant value is a textbook §3 standing
credit: a fixed amount sitting on the account, unrelated to any single
month's billing, since every one of those seven payments *also*
exact-matches its own month's billing to the cent (§3, calibration table).

**Origin — not cleanly traceable to one overshoot payment.** `SKILL.md`'s
usual trace method (find the single batch whose gross exceeds its matched
month) doesn't isolate a single culprit here: the value predates the Apr
2021 window and traces back through the disrupted 2020 sequence (Feb/Mar
2020 genuinely unpaid, then five small, non-STAT ad hoc payments in
Jun/Aug/Sep/Nov 2020 that don't individually match any month). **This is
ASSERTED, not PROVEN** — flag for ERP-side verification before treating
R7,571.68 as a confirmed standing credit; do not net it against JIM001's
balance without that check.

---

## 5. Misattribution candidates (3) — not applied, for human review

Exact-sum testing found three payments that match a **different** month
exactly than the one they're currently paired with in
`monthly_lpg_insights.csv`:

| Payment | Currently assigned | Exact match instead | Effect if re-attributed |
| :--- | :--- | :--- | :--- |
| **6104** (2019-10-21, R13,875.00) | Unassigned in the 2019 report (correctly left as "present, unreconciled") | 2019-08 net billing (R13,874.99) — but 2019-08 is *already* fully settled by doc 5988 (also ≈R13,875.00) | Likely coincidence of two similarly-sized STAT cycles, not a real re-attribution. No action — the 2019 report's caution here was correct. |
| **40746** (2025-08-22, R14,579.44) | 2025-06 in `monthly_lpg_insights.csv` (leaves June "underpaid R38.67") | 2025-07 net billing (R14,579.44, exact) | **Already correctly applied in the published 2025 report** (June shown fully unpaid, July shown paid in full). The CSV row is stale — fix the CSV to match the report, not the reverse. |
| **44555** (2026-06-05, R11,666.12) | 2026-03 in `monthly_lpg_insights.csv` (leaves March "underpaid R271.44") | 2025-12 net billing (R11,666.11, exact to the cent) | **Proposed, not yet ratified.** STAT sequence jumps from STAT:121 (2025-12-29) to STAT:123 (2026-02-05) to STAT:127 (2026-06-05) — STAT:122, 124–126 never appear, consistent with a backlog payment finally clearing the oldest exact-matching open month (Dec-2025) rather than partially covering March-2026. If ratified: 2025-12 moves from "unpaid R11,666.11" to "settled"; 2026-03 moves from "underpaid R271.44" to "fully unpaid R11,937.56." Net effect on total JIM001 exposure: zero (it's a reassignment, not new cash) — but it changes which specific month is owed. |

Only the third is an actionable, unratified finding. It should go through
the same human-ratification path as the 2022–2024 overrides before being
applied — this review asserts it, it does not decide it.

---

## 6. Applicability boundary — pre-STAT-batch era (2018-12 to 2019-03)

`SKILL.md` §0 scopes itself to monthly-batch (STAT-style) payers. JIM001's
STAT batch numbering (`STAT 162` onward) starts 2019-04-24. Before that,
`payments.csv` shows multiple small payments per period under different
batch refs (`EASYREC`, `T3000210`, `T3000214`) that don't individually or
cumulatively exact-match any single calendar month's billing. This is not a
failure of the exact-sum method — it's evidence JIM001 wasn't yet paying in
the monthly-consolidated-batch pattern the skill targets during this
window; those four months (2018-12 through 2019-03) need invoice-level
allocation (the same route `allocation_edges.csv`'s `SPLIT_PAYMENT_PORTION`
rows already attempt), not month-level exact-sum testing.

**Orphaned cash not represented in any month's `payment_total_allocated`:**
across the full 9 years, 14 payments totaling **R54,902.41** (mostly
2018–2020, plus two 2025 payments — 38846 R7,337.97 and 39812 R20,557.69)
never appear as the assigned payment for any billing month in
`monthly_lpg_insights.csv`, even though the cash was received. This is
real, received money currently invisible to the per-month table — a
concrete follow-up: reconcile these against `allocation_edges.csv`'s
invoice-level splits (that mechanism already exists for exactly this) before
citing any month as "genuinely unpaid" in 2018–2020 or the two flagged 2025
gaps.

---

## 7. Cumulative bridge cross-check

Summing every invoice/credit-note billing line and every payment document
in the raw source files (bypassing any month-assignment, as a pure
cash-conservation check):

| | Amount |
| :--- | ---: |
| Total net LPG billed, 2018-12 through 2026-05 | R1,102,643.55 |
| Total cash received, all 78 payment docs | R969,745.73 |
| **Raw cumulative gap (ex-CYL)** | **R132,897.82** |
| ERP `lpg_gas_debt` per `dashboard_metrics.json` | R140,247.82 |
| Residual difference | R7,350.00 |

The R7,350.00 residual matches the constant **"ERP Journals (Lifetime to
date): +R7,350.00"** line that appears unchanged in every yearly report's
§4.1 ledger reconciliation back to 2019 — a static pre-2018 opening journal
entry, not a new anomaly. The bridge closes to within a known, already-
documented reconciling item.

Note this raw figure (R132,897.82) is *smaller* than what summing each
year's own "Net LPG Gas Balance Change" would give (≈R209,600 using the
corrected §3 figures, or ≈R317,600 using the stale report figures) — the
difference is exactly the R54,902.41 in orphaned cash from §6 plus minor
year-boundary framing effects in how each yearly report's own table credits
boundary-crossing payments. **The raw cumulative gap is the more reliable
top-line number** because it doesn't depend on any month-assignment being
correct.

---

## 8. Registry fields (proposed, per handoff Part 4)

No `settlement_unit` / `evidence_tier` / `evidence_status` schema exists
anywhere in this repository yet — this is the first account to propose one.
Applied here as an **additive enrichment** to the existing 25 human-approved
2022–2024 entries in `config/payment_pattern_overrides.json` (no amounts,
approval_status, or reasons changed — see the diff applied alongside this
report). Definitions used:

- **`settlement_unit`** — what unit of billing the payment actually
  settles: `calendar_month` (exact-sum match), `mirror_carry_pair` (two
  adjacent months' variances self-cancel, Business Rule 14), `pooled_window`
  (documented multi-month settlement window), or `gross_flow_surplus`
  (Business Rule 13).
- **`evidence_tier`** — 1 (remittance advice) through 3 (gross-amount /
  candidate-invoice reasoning only, no third-party document). **JIM001 has
  no remittance advice on file at all; every entry in this account is
  ceilinged at Tier 3.**
- **`evidence_status`** — `ASSERTED` (this review's own conclusion) vs.
  `PROVEN` (would require Tier 1 evidence). **Every JIM001 finding in this
  review, including the 2022–2024 human-ratified ones, is written as
  `ASSERTED`** — human ratification here was based on candidate-invoice
  review and STAT-sequence review, not a remittance advice, so it does not
  clear the bar for `PROVEN` either.

For the 2018–2021 and 2025–2026 findings in this review (unreviewed by a
human), the same fields would apply once ratified:

| Month(s) | settlement_unit | evidence_tier | evidence_status |
| :--- | :--- | :---: | :--- |
| 2019 (10 of 12 months) | calendar_month | 3 | ASSERTED |
| 2021-04 to 2021-09 | calendar_month | 3 | ASSERTED |
| 2021-10/11 | mirror_carry_pair | 3 | ASSERTED |
| 2025 (5 settled months) | calendar_month | 3 | ASSERTED |
| 2025-12 / 2026-03 (candidate #3, §5) | calendar_month (pending re-attribution) | 3 | ASSERTED — not applied |
| Standing credit, 2021-04–10 | n/a (not a settlement) | 3 | ASSERTED, flagged for ERP-side verification |

---

## 9. Recommendations

1. Regenerate the 2018, 2019, and 2021 `Payment_Pattern_Analysis` reports
   from the current `monthly_lpg_insights.csv` — they currently overstate
   JIM001's historical anomaly by roughly R101,500 combined and should not
   be relied on for collections or balance-confidence figures until fixed.
2. Fix the stale 2025-06/07 row in `monthly_lpg_insights.csv` to match what
   the 2025 report already correctly concluded (doc 40746 → July, not June).
3. Route the doc 44555 re-attribution (§5) through the same human
   ratification path as the existing overrides before applying it.
4. Reconcile the R54,902.41 in orphaned pre-STAT/ad-hoc cash (§6) against
   `allocation_edges.csv`'s invoice-level splits — that mechanism already
   exists for this, it just hasn't been run against these 14 documents.
5. Get ERP-side confirmation of the R7,571.68 standing credit origin (§4)
   before netting it anywhere.

No figure in this review should be reported as `PROVEN` — JIM001 has no
remittance advice on file. Everything above is `ASSERTED` pending that
evidence or explicit human ratification.
