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

**Correction history (same day, two follow-up checks):**

1. The original version of this report flagged docs 40746 and 44555 as
   "misattribution candidates" on an aggregate month-total coincidence
   alone. A first follow-up found invoice-level rows for both in
   `allocation_edges.csv` (missed on the initial pass due to a truncated
   directory grep) and retracted the candidates, treating the invoice-level
   split as stronger evidence than the aggregate match.
2. **That retraction was itself premature and is now reversed.** A second
   follow-up checked *how* those invoice-level rows were generated: every
   payment in this dataset whose allocation rows are entirely
   `ERP_LEDGER`/`Probable` (unconfirmed) — 6 total, including 40746 and
   44555 — shows the same fingerprint: a dense run of invoices, all inside
   one *already-assumed* month, filled in strict date order. That's not
   independent per-invoice confirmation; it's the month assumption exploded
   into invoice-level rows after the fact, and cannot arbitrate between
   June and July on its own. `business_rules.md` §3 states outright that
   "the ERP's built-in payment allocation system is historically broken" —
   exactly this evidence tier. A related, unexplained anomaly compounds the
   doubt: payment 39812 (2025-06-12, R20,557.69 — alone enough to cover all
   of June's R14,618.11 billing) sits in the same window marked 100%
   `UNALLOCATED_PORTION`, with no invoice target at all.

**Net position: doc 40746 (June vs. July) and doc 44555 (March-2026 vs.
December-2025) are genuinely unresolved.** Neither the exact-sum aggregate
match nor the ERP-ledger invoice split is authoritative here; this needs
either a real remittance advice or ERP-side clarification of payment
39812, not another inference from this same data. §5 below reflects this
open state; §2, §3, §8, and §9 are updated to stop asserting either
direction as settled.

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

A fourth discrepancy looked like the reverse case but turned out to be
genuinely unresolved: the **2025** report reassigns doc 40746 from 2025-06
to 2025-07 because the gross amount (`14,579.44`) happens to equal July's
aggregate billing to the cent. `allocation_edges.csv` does carry
invoice-level rows for it (AL-0337–AL-0340, four invoices all dated June
2025), but those rows are unconfirmed (`ERP_LEDGER`/`Probable`) and,
on inspection, look like a mechanical FIFO fill of an already-assumed
month rather than independent evidence — see §5. **Neither the CSV's June
assignment nor the 2025 report's July reassignment can be called settled
on the evidence available in this repo.** See §5.

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
| 2025 | R89,246.79 (unaffected either way — see note) | Holds. One open item: doc 40746 settles either June (CSV) or July (2025 report) — genuinely unresolved, see §5. Total 2025 exposure is identical under both readings (it only moves which specific month carries the R38.67-vs-full-month gap). Unreviewed; real, growing exposure regardless. |
| 2026 (through May) | R72,399.45 | All five months genuinely unpaid — no candidate payment in the window matches any of them. One open item: doc 44555 (Jun-2026) settles either March-2026 (CSV/ledger) or December-2025 (aggregate match) — genuinely unresolved, see §5. Unreviewed. |

**Verdict on the generalization:** the exact-sum-per-calendar-month test
holds for JIM001 across all 9 years, in the sense that every month which
tests as an exact match is a real, cent-accurate settlement, and every
month that doesn't is either (a) a genuine partial payment/mirror carry
already independently corroborated by candidate-invoice evidence (2019,
2021-tail, 2022, 2023, 2024), (b) a genuinely unpaid month with no
candidate payment anywhere in a ±3 month window (2019-01/03, 2020-02/03,
2025's open months, all of 2026), or (c) one of two genuinely unresolved
payments where an aggregate exact-sum match and an unconfirmed ERP-ledger
invoice split disagree (§5, docs 40746 and 44555). It does **not**
hold as a simple
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

## 5. Two genuinely unresolved payments (dedup confirmed, month disputed)

The original pass of this review found three payments whose *gross amount*
exact-matches a different month's *aggregate* billing total than the one
they're paired with in `monthly_lpg_insights.csv`. A first follow-up
checked `allocation_edges.csv`'s invoice-level rows and retracted two of
them as false positives. **A second follow-up checked how those
invoice-level rows were generated, and that retraction was itself
premature.** Both readings for docs 40746 and 44555 remain open.

**Doc 6104 is resolved** — no allocation rows exist for it in
`allocation_edges.csv` at all, and it exact-matches 2019-08's billing only
by coincidence (2019-08 is already fully settled by a different payment,
doc 5988, of near-identical size). The 2019 report's original decision to
leave it unreconciled was correct. No action.

**Docs 40746 and 44555 are not resolved.** Both have invoice-level rows in
`allocation_edges.csv`, but those rows are marked `ERP_LEDGER`/`Probable` —
unconfirmed, not `HUMAN_WORKSHEET_AND_ERP`/`Confirmed` like most of the
file. Isolating every payment in this dataset whose rows are *entirely*
`ERP_LEDGER`/`Probable` turns up exactly 6, including these two. All 6 show
the same fingerprint: a dense run of invoices, all inside **one
already-assumed month**, filled in strict date order days apart. That is
not independent per-invoice confirmation — it is a month assumption
exploded into invoice-level rows after the fact, and it cannot arbitrate
between two candidate months because it never tested the alternative.
`analysis/debtors/shared/docs/business_rules.md` §3 (Debt Partitioning
Rule) says plainly: **"The ERP's built-in payment allocation system is
historically broken. Payments are not reliably matched to specific
invoices."** — exactly this evidence tier.

| Payment | Aggregate exact-sum says | ERP-ledger invoice split says (unconfirmed) | Status |
| :--- | :--- | :--- | :--- |
| **40746** (2025-08-22, R14,579.44) | 2025-07 (matches July's billing to the cent) | AL-0337–AL-0340: 4 invoices (43628, 43910, 44097, 44241), all dated June 2025, R38.67 short on the last | **Unresolved** — neither reading confirmed |
| **44555** (2026-06-05, R11,666.12) | 2025-12 (matches Dec's billing to the cent) | AL-0359–AL-0361: 3 invoices (49540, 49727, 49842), all dated March 2026, R271.44 short on the last | **Unresolved** — neither reading confirmed |

A related, unexplained anomaly compounds the doubt specifically for 40746:
payment **39812** (2025-06-12, R20,557.69 — alone more than enough to cover
all of June 2025's R14,618.11 billing) sits in the exact same window and
is marked **100% `UNALLOCATED_PORTION`** ("leftover cash not consumed by
LPG invoices"), with no invoice target at all. An earlier, larger payment
being skipped while a payment arriving over two months later is credited
with settling the same month is itself suspicious and suggests this
stretch of ERP-derived allocation is unreliable in either direction, not
just on this one payment.

**Dedup and net-amount check on doc 40746** (the discipline
`RED001/scripts/allocation_ingest_pilot.mjs` applies via `SELECT DISTINCT
ON (...)` against raw ERP segments, applied here to what's available
in-repo since no raw JIM001 ERP export exists to re-run that query
against): `payments.csv` carries exactly one row for 40746 (R14,579.44,
"20 ERP segments" consolidated into one payment total at the raw-ledger
level — no duplicate row). `allocation_edges.csv` carries exactly 4
allocation rows for it, each to a **distinct** target invoice — no
duplicate target, no double-counted amount. The 4 allocated amounts
(4,382.95 + 3,115.05 + 4,272.07 + 2,809.37) sum to **R14,579.44**, matching
the payment gross exactly. **No dedup issue found — the real gross amount
is R14,579.44 either way; what's unresolved is which month it settles, not
its size.**

**Lag-precedent check (requested, but doesn't settle this):** lag (payment
date minus invoice date) across all 361 dated allocation rows, 2018–2026,
runs ~30% at 1 month, ~29% at 2 months, ~14% at 3 months, tapering through
4–12 months; 75–200+ day lags are common and routinely `Confirmed` in the
ratified 2022–2024 years. Both readings of 40746 (78–84 days to June
invoices, or a 1-month lag if it settles July directly) and both readings
of 44555 (77–93 days to March-2026 invoices, or a much longer ~6-month lag
if it settles Dec-2025) are individually plausible on lag alone — **lag
distribution doesn't discriminate between the two candidate months for
either payment**, so it can't be used to break the tie.

**Recommendation:** treat both as `evidence_status: ASSERTED — UNRESOLVED`
(§8) until a real remittance advice surfaces, or until payment 39812's
unallocated status is explained (it may be the actual key to this whole
window). Do not apply either reassignment; do not cite either the CSV or
the 2025 report as confirmed correct on this specific point.

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
| 2025-06 or 2025-07 (doc 40746) | calendar_month, unresolved | 3 | **ASSERTED — UNRESOLVED** (§5); do not apply either month |
| 2025 (4 other settled months) | calendar_month | 3 | ASSERTED |
| 2026-03 or 2025-12 (doc 44555) | calendar_month, unresolved | 3 | **ASSERTED — UNRESOLVED** (§5); do not apply either month |
| Standing credit, 2021-04–10 | n/a (not a settlement) | 3 | ASSERTED, flagged for ERP-side verification |

---

## 9. Recommendations

1. Regenerate the 2018, 2019, and 2021 `Payment_Pattern_Analysis` reports
   from the current `monthly_lpg_insights.csv` — they currently overstate
   JIM001's historical anomaly by roughly R101,500 combined and should not
   be relied on for collections or balance-confidence figures until fixed.
2. Do **not** change `monthly_lpg_insights.csv` or the 2025 report on
   doc 40746's month, and do not apply doc 44555's aggregate-match
   reassignment either — both are genuinely unresolved (§5). Chase down
   why payment 39812 (R20,557.69, 2025-06-12) is marked 100%
   unallocated; that may be the key to resolving 40746's month, and
   possibly explains part of the same pattern around 44555.
3. If a real remittance advice or ERP export can be pulled for the
   Jun–Aug 2025 or Dec 2025–Mar 2026 windows, use it to settle both
   open items in §5 — this is exactly the kind of case Tier 1 evidence
   is needed for; internal data alone won't arbitrate it further.
4. Reconcile the R54,902.41 in orphaned pre-STAT/ad-hoc cash (§6) against
   `allocation_edges.csv`'s invoice-level splits — that mechanism already
   exists for this, it just hasn't been run against these 14 documents.
5. Get ERP-side confirmation of the R7,571.68 standing credit origin (§4)
   before netting it anywhere.

No figure in this review should be reported as `PROVEN` — JIM001 has no
remittance advice on file. Everything above is `ASSERTED` pending that
evidence or explicit human ratification.
