# JIM001 — Monthly-Batch Exact-Sum Bridge Review (2018–2026)

Generated 2026-09-13, updated 2026-09-14 | Method: `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md` §2 | Evidence ceiling: Tier 3 / ASSERTED for most findings (no remittance advice exists for JIM001) — **two exceptions: doc 40746's July assignment is Tier 2 / PROVEN, verified against a raw ERP transaction export (§5); doc 44555's December-2025 assignment is an explicit account-owner DECISION (2026-09-14), not independently proven — see §5**

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

**Net position at that point: doc 40746 (June vs. July) and doc 44555
(March-2026 vs. December-2025) were genuinely unresolved.** Neither the
exact-sum aggregate match nor the ERP-ledger invoice split was
authoritative on its own.

3. A third, targeted check (also requested) ruled out one candidate
   explanation: the disputed totals are not contaminated by cylinder
   "shell" deposit SKUs (`docs/governance/sku_suffix_mapping.md`'s `.1`
   suffixes). Recomputing directly from `invoices.csv` confirms both sides
   of the dispute are already clean — see §5's shell-check paragraph.
   Separately, payment 39812's `UNALLOCATED_PORTION` tag turned out to be
   routine (32 of 78 payments carry it), not the anomaly the paragraph
   above first suggested — the more promising thread is that it and doc
   38846 have no month assignment at all, not that either is individually
   suspicious. §5 reflects both corrections.
4. **Doc 40746 is now resolved: July, not June.** The user supplied an
   independent source — `JIM001_LPG_Reconciliation_v4` (a Google Sheet;
   internal analyst workbook, not a remittance advice, so still Tier 3) —
   whose own separately-computed "Exact Monthly LPG Invoice-Payment
   Matches" table flags doc 40746 as an exact `R0.00` match to **July**,
   independently of both this review's aggregate exact-sum test and the
   published 2025 report (which already said July). That's two
   independent computations converging on July against one unconfirmed
   mechanical invoice split that said June — enough to move this from
   `UNRESOLVED` to `ASSERTED`. Applied directly to
   `monthly_lpg_insights.csv`. **Doc 44555 is not addressed by this
   source** (its payments table stops before that payment's date) and
   remains genuinely unresolved. §5, §8, §9 updated.
5. **Doc 44555 is now closed by explicit account-owner decision (2026-09-14):
   allocated to December 2025.** No new evidence emerged — the raw ERP
   export (§5) still shows this payment's `INVNO` field blank, so neither
   December nor March is independently proven. The account owner made the
   call to close out the dispute in favor of December (the only reading
   with any support at all, via the aggregate exact-sum match) rather than
   leave it open indefinitely ahead of legal handoff. This is recorded as
   a **DECISION**, evidence tier unchanged (3), status `ASSERTED
   (decision)` — not `PROVEN`. Applied to `monthly_lpg_insights.csv`:
   December 2025 moves `UNPAID` → `FULLY_SETTLED` (1-cent rounding
   residual), March 2026 reverts to genuinely `UNPAID`. §5, §8, §9
   updated.

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

A fourth discrepancy looked like the reverse case, went through an
unresolved phase, and is now settled: the **2025** report reassigns doc
40746 from 2025-06 to 2025-07 because the gross amount (`14,579.44`)
happens to equal July's aggregate billing to the cent. `allocation_edges.csv`
does carry invoice-level rows for it (AL-0337–AL-0340, four invoices all
dated June 2025), but those rows are unconfirmed (`ERP_LEDGER`/`Probable`)
and, on inspection, look like a mechanical FIFO fill of an already-assumed
month rather than independent evidence. An external source
(`JIM001_LPG_Reconciliation_v4`) independently confirms July with its own
exact `R0.00` match. **The 2025 report's July assignment is correct; the
CSV's June assignment (now fixed) was the error.** See §5.

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
| 2025 | ≈R49,685.01 | Holds. Jan and Feb move UNPAID → SETTLED; June moves SETTLED → UNPAID and July moves UNPAID → SETTLED (doc 40746 externally confirmed as July, §5); December moves UNPAID → SETTLED (doc 44555, account-owner decision, not independently proven — §5). Real, growing exposure remains in Apr/May/June. Unreviewed overall. |
| 2026 (through May) | R72,399.45 | All five months genuinely unpaid — no candidate payment in the window matches any of them. Doc 44555 (Jun-2026) is allocated to December 2025 by explicit account-owner decision, not March 2026 — see §5; March 2026's full R11,937.56 accordingly stays unpaid (this total already reflected that before today's decision — see §5's note). Unreviewed. |

**Verdict on the generalization:** the exact-sum-per-calendar-month test
holds for JIM001 across all 9 years, in the sense that every month which
tests as an exact match is a real, cent-accurate settlement, and every
month that doesn't is either (a) a genuine partial payment/mirror carry
already independently corroborated by candidate-invoice evidence (2019,
2021-tail, 2022, 2023, 2024), (b) a genuinely unpaid month with no
candidate payment anywhere in a ±3 month window (2019-01/03, 2020-02/03,
2025's open months, all of 2026), or (c) doc 44555, still genuinely
unresolved, where an aggregate exact-sum match and an unconfirmed
ERP-ledger invoice split disagree (§5) — doc 40746 was in this category
too but is now resolved via external evidence. It does **not** hold as a
simple
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

## 5. Two disputed payments — both now closed (one proven, one decided)

The original pass of this review found three payments whose *gross amount*
exact-matches a different month's *aggregate* billing total than the one
they're paired with in `monthly_lpg_insights.csv`. A first follow-up
checked `allocation_edges.csv`'s invoice-level rows and retracted two of
them as false positives. **A second follow-up checked how those
invoice-level rows were generated, and that retraction was itself
premature.** At that point both readings for docs 40746 and 44555 remained
open; a fourth check (user-supplied external evidence) has since resolved
40746 — see the table and discussion below.

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
| **40746** (2025-08-22, R14,579.44) | 2025-07 (matches July's billing to the cent) | AL-0337–AL-0340: 4 invoices (43628, 43910, 44097, 44241), all dated June 2025, R38.67 short on the last | **PROVEN — July** (raw ERP ledger; see below) |
| **44555** (2026-06-05, R11,666.12) | 2025-12 (matches Dec's billing to the cent) | AL-0359–AL-0361: 3 invoices (49540, 49727, 49842), all dated March 2026, R271.44 short on the last — **confirmed fictitious, see below** | **DECIDED — December** (account-owner instruction, 2026-09-14; not independently proven — see below) |

**Doc 40746 resolved (July) via an independent external source.** The
user supplied `JIM001_LPG_Reconciliation_v4` (a Google Sheet; internal
analyst workbook, last modified 2026-06-12, owned by an internal analyst
account — not a customer remittance advice, so still Tier 3, not Tier 1).
Its own "Exact Monthly LPG Invoice-Payment Matches" table, built
separately from `allocation_edges.csv`, flags doc 40746 as an exact
`R0.00`-variance match to **July**:

> `2025 | July | R14,579.44 | 00040746 | 2025-08-22 | R14,579.44 | ... | R0.00 | July`

This is a second, independently-computed method (distinct from this
review's own aggregate exact-sum test, and from the published 2025
report) landing on July — three converging readings against one
unconfirmed mechanical invoice split that said June. That tips this from
"neither side proven" to "confirmed, on the weight of evidence, though
still not remittance-grade Tier 1." Applied to `monthly_lpg_insights.csv`:
June moves to `UNPAID` (R14,618.11), July to `FULLY_SETTLED`. Total 2025
exposure is unchanged — this only moves which specific month is unpaid.

The same source's payments table stops before doc 44555's date
(2026-06-05) and does not address it — **44555 remains unresolved.**
Worth noting: it independently labels doc 38846 → "January" and doc
39812 → "jan/Feb", matching this review's own contiguous-run finding
(§6) exactly, before this review ever saw that file — good convergent
validation of that resolution too, for what it's worth given it's the
same non-Tier-1 source class.

**Doc 40746 upgraded to PROVEN — a raw ERP transaction export settles it
directly.** The user supplied a live pull from JIM001's ERP (`DEBENQ`
enquiry screen, "YEAR: CURRENT"), saved to
`raw/DEBENQ_CURRENT.TXT`. Unlike everything else cited for this payment,
this is the actual system-of-record ledger, not a reconstruction. Its
running balance is internally perfect (272 transaction rows, zero
chain breaks, closing balance matches the file's own stated
`CURRENT BALANCE: 122884.84` exactly) — this is a genuine, coherent
export, not a fragment. Doc 40746's six lines in it:

| Invoice tagged | Date | Amount | What it is |
| :--- | :--- | :--- | :--- |
| 43628 | 2025-06-05 | −R262.54 | Tiny residual cleanup on a **June** invoice |
| 44516 | 2025-07-04 | −R3,115.05 | Full **July** invoice |
| 44707 | 2025-07-10 | −R4,200.69 | Full **July** invoice |
| 44933 | 2025-07-18 | −R4,200.69 | Full **July** invoice |
| 45091 | 2025-07-24 | −R2,800.46 | Full **July** invoice |
| 45323 | 2025-08-01 | −R0.01 | Rounding cleanup on an **August** invoice |

These sum to exactly R14,579.44 — the payment's gross to the cent — and
they are **real invoice numbers with real dates that the ERP itself
tagged this payment against**, not an inferred split. Four of six lines,
and the overwhelming majority of the cash (R14,316.89 of R14,579.44), are
full July invoices. The June and August lines are boundary cleanup
residue, consistent with how every other STAT payment in this ledger
tidies up a few cents/Rand against the tail of the prior cycle and the
head of the next. **This settles June vs. July definitively: July.**
The `ERP_LEDGER`/`Probable` rows in `allocation_edges.csv` that pointed
to June (AL-0337–AL-0340) do not correspond to anything in this real
export — confirming what §5's fingerprint analysis already suspected,
that those rows were a mechanical reconstruction, not genuine ERP
tagging. `monthly_lpg_insights.csv`'s notes for 2025-06/07 have been
updated to cite this directly.

**The same export also changes the picture on doc 44555 — without
resolving it.** Doc 44555's line in the raw ledger reads:

> `LINE 272 | PERIOD 16 | DOCNO 00044555 | Payment | 05/06/2026 | INVNO: (blank) | TRANSF | STAT 127 | -11666.12 | 122884.84`

**The `INVNO` field is blank.** The real ERP has not tagged this
payment to any invoice at all — not March 2026's invoices, not
December 2025's. This means `allocation_edges.csv`'s AL-0359–AL-0361
rows (which claim doc 44555 splits across three named March-2026
invoices) **do not correspond to anything in the real ERP either** —
exactly the same mechanical-reconstruction pattern already identified
for doc 40746's false June reading. The March-2026 reading is therefore
now *confirmed fictitious* at the invoice-tagging level, not merely
"unconfirmed." That doesn't make December 2025 proven — it was never
based on ERP tagging either, only the aggregate exact-sum coincidence —
but it removes March 2026's only claimed evidentiary basis entirely.
**44555 stays `UNRESOLVED` on the evidence alone, but December 2025 is now
the only reading with any support left; March 2026 has none.**

**Update (2026-09-14, same day): closed by explicit account-owner
decision, not by new evidence.** No further document surfaced — the
`INVNO` field above is still blank. The account owner instructed that
doc 44555 be allocated to December 2025 to close out this item ahead of
legal handoff, on the basis that December is the only reading with any
support at all (the aggregate exact-sum match) and March has none.
`monthly_lpg_insights.csv` has been updated accordingly: December 2025
moves `UNPAID` → `FULLY_SETTLED` (R11,666.12 against R11,666.11 net
billing — a 1-cent rounding residual, immaterial), and March 2026 reverts
to genuinely `UNPAID` (R11,937.56). **This is recorded as a decision, not
a proof** — evidence tier stays 3, status `ASSERTED (decision)`, not
`PROVEN`. Unlike doc 40746 (Tier 2, independently verified against the
real ERP ledger), nothing here changes the underlying evidence picture;
if a remittance advice for doc 44555 ever surfaces and contradicts
December, this allocation should be revisited.

**A note on this export's own limits, so it isn't over-relied on
elsewhere:** cross-checking every LPG/CYL invoice doc number against
`invoices.csv`, this raw file is **complete only from 2025-03-01
onward** (zero missing docs from that date forward) — before that, it's
missing 420 of 620 invoice/credit-note documents that exist in
`invoices.csv` for the 2022-05-16 to 2025-02-28 stretch, consistent with
its "YEAR: CURRENT" filter showing only recent/still-open activity, not
full history. **Do not use this file to bridge anything dated before
March 2025** — it will look like a huge unexplained gap that isn't
real, just archived-out history. From March 2025 onward, though, it's
solid: see §7 for a full balance-bridge validation using exactly that
window.

A related thread sits in the same window: payment **39812** (2025-06-12,
R20,557.69 — alone more than enough to cover all of June 2025's
R14,618.11 billing) is marked **100% `UNALLOCATED_PORTION`**, with no
invoice target at all. This tag by itself is routine, not suspicious — 32
of JIM001's 78 payments carry it across all 9 years, several already
human-ratified. What is unusual is that 39812 (and doc 38846 just before
it) have **no month assignment at all** in `monthly_lpg_insights.csv`,
unlike the ratified cases — see the correction note below the
recommendation for why this, not 39812's allocation tag on its own, is
the more promising thread.

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
is R14,579.44, confirmed independently of which month it settles** (now
resolved as July — see below).

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

**Shell/CYL contamination check (requested, ruled out):** recomputed
`is_lpg=True`-only totals directly from `invoices.csv` for all four
candidate months (2025-06, 2025-07, 2025-12, 2026-03) per
`docs/governance/sku_suffix_mapping.md` (the `.1`-suffix SKUs — `9.1`,
`14.1`, `19.1`, `S.1`, `D.1` — are the brand-neutral cylinder deposit
"shell asset" and must be stripped from the LPG ledger). All four match
`monthly_lpg_insights.csv` exactly to the cent. Every invoice line under
both payments' target docs (43628, 43880/43910, 44097, 44241, 49540,
49727, 49842) is a pure `S01`/`901`/`S.4` gas-content line — none carry a
mixed-in `.1` deposit line. Across the whole dataset, all 549 `.1`-suffix
rows are correctly `is_cyl=True`, zero leaked into the LPG side. **This
was not a shell-stripping bug; the numbers on both sides of the dispute
are clean.**

**Correction to the 39812 framing above:** on closer look, `payment 39812`
being tagged `UNALLOCATED_PORTION`/`Exception` is not unique to this
window — 32 of JIM001's 78 payments carry the same tag across all 9
years, including several already human-ratified (2022's doc 16648,
2023's doc 27468, 2024's docs 28893/30269/32896/33810/34425). A nonzero
invoice-level gap is routine for this account's Rule 13 surplus / pooled-
settlement pattern. What was unusual about 39812 is that, unlike those
ratified cases, it had **no month assignment at all** in
`monthly_lpg_insights.csv` — it and doc 38846 (2025-05-22, R7,337.97) sat
as two consecutive, fully orphaned payments (R27,895.66 combined)
immediately before the two disputed ones. This thread is now resolved —
see below.

**Docs 38846 and 39812 are resolved: they settle January + February 2025
in full, not an unexplained orphan.** An exhaustive contiguous-run search
of `invoices.csv`'s LPG invoice sequence (not just aggregate month
totals) finds an exact, cent-precise partial-month split:

| Payment | Invoices matched | Sum |
| :--- | :--- | ---: |
| **38846** (R7,337.97) | 39558 (2025-01-02, R2,950.74) + 39714 (2025-01-09, R4,387.23) — first 2 January invoices | R7,337.97 |
| **39812** (R20,557.69) | 39898, 40143, 40319 (remaining 3 January invoices, R10,236.87) + 40622, 40881, 41051 (all 3 February invoices, R10,320.82) | R20,557.69 |
| **Combined** | All of January + all of February 2025 | R27,895.66 |

This matches January's (R17,574.84) and February's (R10,320.82) net LPG
billing from `monthly_lpg_insights.csv` exactly (17,574.84 + 10,320.82 =
27,895.66). CYL-adjusted combinations weren't needed to close this —
`cylinder_transactions.csv` shows the CYL deposit/return pairs for this
window net to ~R0 every cycle (the standard EMPTY-pair pattern), so there
was no CYL residual to fold in; this resolved on plain invoice-level
partial-month splits. **January and February 2025 should move from
UNPAID to SETTLED** (§3, §9). Note these two payments were never part of
the pre-2021 R54,902.41 orphaned-cash figure below (§6) — that group and
this one were always separate; resolving this one does not change that
total.

This does not by itself settle the June-vs-July question for doc 40746
(§5 above remains unresolved) — it's a different pair of payments in an
adjacent window — but it does show the exact-sum method, applied at the
invoice level rather than just the aggregate month level, resolves real
gaps cleanly when the precedent actually exists.

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
14 payments totaling **R54,902.41**, all pre-2021, are unassigned to any
billing month in `monthly_lpg_insights.csv`, even though the cash was
received: 4832, 4839, 4807, 4898, 4841, 5043, 5047, 5226, 6381, 7216,
7226, 7348, 7489, 7572.

**Tried the same contiguous-run search here (as done for 38846/39812) —
it does not resolve, for principled reasons, not just absence of a
match.** Building the same "open" invoice list (LPG invoices not already
claimed by another payment's `SPLIT_PAYMENT_PORTION` rows) and searching
contiguous date-ordered runs with a realistic ≤75-day span:

1. **Ambiguous, duplicate matches.** Several targets return 2–8 equally
   plausible contiguous matches. Worse: doc 7226 (2020-06-29) and doc
   7489 (2020-09-04) — different payments, months apart — both "match"
   the identical invoice range (4690–4766, Jan–Feb 2019). Two different
   payments cannot both correctly claim the same invoices; this is the
   signature of coincidence, not resolution.
2. **Round-number amounts throughout this era** (R700.01, R1,400.01,
   R3,000.00, R5,000.00, R3,250.00, R5,125.00, R930.00) recur constantly
   as multiples of a standard per-unit rate, so exact matches against
   round payment targets are cheap and unreliable. This is the opposite
   of the Jan/Feb 2025 case, where the match was on non-round, unique
   sums (R7,337.97, R20,557.69) — precision that made that match
   credible and is absent here.
3. A genuine **~10-month invoicing gap** (April 2020–February 2021, no
   LPG invoices recorded at all) means a naive index-based "contiguous"
   search silently bridges a year and calls it adjacent — a further
   source of false positives that had to be explicitly excluded by the
   span cap.

**Verdict: these 14 payments cannot be resolved by the exact-sum /
contiguous-run method**, consistent with §0's applicability boundary —
this era predates JIM001's STAT-batch discipline and looks like round,
ad hoc on-account payments rather than sums targeting specific invoices.
Resolving them, if possible at all, needs a different kind of evidence
(a period bank statement or bordereau), not further search over this
same dataset.

**A fourth attempt (2026-09-14, Supabase `transaction_headers.ref_no`) —
looked promising, then disproved itself; still unresolved.** The
underlying database exposes a field the earlier CSV-only analysis never
had: each `Payment` row in `transaction_headers` can carry multiple
sub-lines, each tagged with a `ref_no` pointing at what looks like a
specific invoice doc number. Querying this for all 14 orphaned docs
found real invoice-number matches for 9 of them (R36,025.02 of the
R54,902.41), 20 of 24 individual invoice references landing exact to
the cent — enough to look, at first pass, like genuine remittance
evidence finally surfacing for this era.

**It isn't.** Cross-checking the *same* `ref_no` mechanism against an
already-settled payment (doc 5876, the STAT-era payment already
assigned to July 2019 via the aggregate exact-sum test) shows why: doc
5876 alone carries over 50 `ref_no` sub-lines, spanning invoices dated
January through July 2019, mixing positive *and* negative amounts, plus
one large R25,425.03 line with no `ref_no` at all. And the smoking gun —
**the same invoice reference appears in two different payment docs,
months apart, with amounts that exactly cancel:**

| Invoice ref | Appears in doc 4898 (2019-01-09) | Appears in doc 5876 (2019-08-06) | Net |
| :--- | ---: | ---: | ---: |
| 4559 | −2,100.01 | +2,100.01 | 0.00 |
| 4561 | −350.00 | +350.00 | 0.00 |
| 4562 | −700.01 | +700.01 | 0.00 |
| 4565 | −1,724.97 | −25.04 | −1,750.01 (invoice's full value, split across both docs) |

A genuine remittance record does not get reversed and re-applied seven
months later by an unrelated payment. This is the ERP's own **internal,
mutable open-item allocation ledger** continuously re-sweeping cash
against invoices as new transactions post — exactly the mechanism
`analysis/debtors/shared/docs/business_rules.md` §3 already names:
*"The ERP's built-in payment allocation system is historically broken.
Payments are not reliably matched to specific invoices."* The "exact to
the cent" matches are the expected signature of a FIFO/round-number
sweep against this era's recurring per-unit amounts (§6 point 2 above),
not evidence of customer intent. Checked `description`/`order_no`
(no free-text bank narrative — just `TRANSF`/`CASH` and the known
`batch_ref`) too: no independent remittance data exists anywhere in the
database for this era beyond what `payments.csv` already showed.

**Verdict unchanged: the R54,902.41 pre-2021 orphaned cash remains
UNRESOLVED.** This fourth attempt closes off the one ERP-internal
source left unchecked, with a concrete disproof rather than an absence
of a match — reinforcing, not just repeating, recommendation §9.5.
`monthly_lpg_insights.csv` is **not** updated by this finding.

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

### 7.1 Second bridge, against the real ERP header balance (2025-03 onward)

The raw ERP export (`raw/DEBENQ_CURRENT.TXT`, §5) is complete from
2025-03-01 onward and carries two genuine ERP-stated balance points: the
running balance immediately before its first March-2025 entry
(**R45,202.67**, as of the last pre-window posting, 2024-07-04) and its
own header's **`CURRENT BALANCE: R122,884.84`** (as of the last posting,
2026-06-05). This is the actual "transaction header balance" bridge
this review lacked before — not a computed proxy.

| | Amount |
| :--- | ---: |
| ERP balance immediately before window (2024-07-04) | R45,202.67 |
| ERP `CURRENT BALANCE` (2026-06-05) | R122,884.84 |
| **Raw ERP net movement over the window** | **R77,682.17** |
| LPG net invoiced, 2025-03-01 onward (`invoices.csv`) | R218,795.03 |
| CYL net invoiced, 2025-03-01 onward | R1,725.00 |
| Cash paid, 2025-03-01 onward (`payments.csv`) | R140,422.86 |
| **Computed net movement (LPG + CYL − cash)** | **R80,097.17** |
| **Gap** | **R2,415.00** |

R2,415.00 is itself a recognizable, round CYL-deposit unit (the same
value appears dozens of times throughout this export as a `-EMPTY`
credit-note/invoice pair amount) — consistent with a single boundary-date
CYL line landing on one side of the 2025-03-01 cutoff in one dataset and
the other side in the other, not a systemic problem. **A R2,415 gap on a
R77,682 movement (97% tie-out) against the actual ERP header balance is
strong, independent confirmation that `invoices.csv`/`payments.csv` are
sound for this window** — precisely the window covering both disputed
payments (§5).

**Do not extend this specific bridge before 2025-03-01** — the raw
export is missing 420 of 620 invoice/credit-note documents that exist in
`invoices.csv` for 2022-05-16 through 2025-02-28 (it's a "current
activity" snapshot, not full history; see §5's note on this file's
limits). Anything computed against this file for that earlier stretch
will show a large, spurious gap that reflects archived-out history, not
a real discrepancy.

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
- **`evidence_tier`** — 1 (remittance advice — a customer-issued
  document) · 2 (the actual ERP system-of-record transaction ledger,
  pulled directly, with real invoice-level tagging — added to the schema
  once such a file existed for this account; see §5's raw
  `DEBENQ_CURRENT.TXT`) · 3 (gross-amount / candidate-invoice reasoning,
  or a *reconstructed* invoice split, with no independent document
  behind it). **JIM001 has no remittance advice on file; nothing here
  clears Tier 1.** Before this session, every entry was ceilinged at
  Tier 3 — doc 40746 (§5) is the first to reach Tier 2, once a genuine
  ERP export existed to check it against.
- **`evidence_status`** — `ASSERTED` (this review's own conclusion) vs.
  `PROVEN` (independently confirmed against real evidence — Tier 1 *or*
  Tier 2, not this review's own inference). Every JIM001 finding in this
  review is `ASSERTED` **except doc 40746, now `PROVEN`** by the raw ERP
  ledger's direct invoice tagging (§5) — the 2022–2024 human-ratified
  entries stay `ASSERTED`, since ratification there was candidate-invoice
  and STAT-sequence reasoning, not a Tier 1/2 document.

For the 2018–2021 and 2025–2026 findings in this review (unreviewed by a
human), the same fields would apply once ratified:

| Month(s) | settlement_unit | evidence_tier | evidence_status |
| :--- | :--- | :---: | :--- |
| 2019 (10 of 12 months) | calendar_month | 3 | ASSERTED |
| 2021-04 to 2021-09 | calendar_month | 3 | ASSERTED |
| 2021-10/11 | mirror_carry_pair | 3 | ASSERTED |
| 2025-01 (docs 38846 partial + 39812 partial) | calendar_month, invoice-split | 3 | ASSERTED — cent-exact invoice-level match (§5/§6) |
| 2025-02 (doc 39812 partial) | calendar_month, invoice-split | 3 | ASSERTED — cent-exact invoice-level match (§5/§6) |
| 2025-07 (doc 40746) | calendar_month | **2** | **PROVEN** — raw ERP transaction ledger tags this payment to 4 named July invoices directly (§5); upgraded from Tier 3/ASSERTED once real system-of-record data existed. Still not Tier 1 (no customer remittance advice), but no longer a reconstruction. |
| 2025 (4 other settled months) | calendar_month | 3 | ASSERTED |
| 2025-12 (doc 44555) | calendar_month | 3 | **ASSERTED (decision)** — allocated to December 2025 by explicit account-owner decision (2026-09-14), not by new evidence; the raw ERP ledger still shows this payment untagged to any invoice (§5). Not `PROVEN`. |
| Standing credit, 2021-04–10 | n/a (not a settlement) | 3 | ASSERTED, flagged for ERP-side verification |

---

## 9. Recommendations

1. Regenerate the 2018, 2019, and 2021 `Payment_Pattern_Analysis` reports
   from the current `monthly_lpg_insights.csv` — they currently overstate
   JIM001's historical anomaly by roughly R101,500 combined and should not
   be relied on for collections or balance-confidence figures until fixed.
2. **Update `monthly_lpg_insights.csv`:** move 2025-01 and 2025-02 from
   `UNPAID` to `FULLY_SETTLED`, assigning docs 38846 and 39812
   per the invoice-level split in §5/§6 (cent-exact, no dedup issue).
   This is confirmed, not a candidate — apply it.
3. **Update `monthly_lpg_insights.csv` (done):** doc 40746 moved from
   2025-06 to 2025-07 — now `PROVEN` (Tier 2) by the raw ERP transaction
   ledger's direct invoice tagging (§5), on top of the earlier
   `JIM001_LPG_Reconciliation_v4` and 2025-report convergence. June is
   now `UNPAID`, July `FULLY_SETTLED`. Do not apply doc 44555's
   aggregate-match reassignment — it remains genuinely unresolved (§5).
4. **Doc 44555 is closed by account-owner decision, not by evidence.**
   An ERP export was pulled and did not settle it on its own — its raw
   ledger line carries a blank `INVNO`, i.e. genuinely untagged. That
   killed March-2026's claimed invoice-level basis (§5) but didn't prove
   December either. The account owner has since instructed that it be
   allocated to December 2025 to close the item out ahead of legal
   handoff (2026-09-14) — applied to `monthly_lpg_insights.csv`. Record
   this in any legal-facing material as a decision, not an independently
   proven fact: if a remittance advice for doc 44555 ever surfaces, revisit.
5. Do **not** re-run the contiguous-run search *or* the
   `transaction_headers.ref_no` lookup against the R54,902.41 pre-STAT-era
   orphans (§6) expecting another 38846/39812-style resolution — both
   were tried and ruled out for principled reasons (ambiguous/duplicate
   matches, round recurring amounts, a genuine 10-month invoicing gap;
   and, for `ref_no`, a proven mutable-ledger contradiction — the same
   invoice reference appears in two different payment docs seven months
   apart with amounts that exactly cancel). Every ERP-internal source
   this account has is now exhausted. Resolving these needs a period
   bank statement or bordereau — external evidence, not further search
   over this same dataset.
6. Get ERP-side confirmation of the R7,571.68 standing credit origin (§4)
   before netting it anywhere.

JIM001 still has no remittance advice on file, so nothing here reaches
Tier 1. **Doc 40746's July assignment is the one exception to
`ASSERTED`** — it's `PROVEN` at Tier 2, verified against the actual ERP
transaction ledger (§5), not just this review's own inference. **Doc
44555's December-2025 assignment is closed by explicit account-owner
decision (2026-09-14)** — recorded as `ASSERTED (decision)`, still Tier
3, not `PROVEN`; it should not be cited as independently confirmed.
Every other figure above is `ASSERTED` pending Tier 1/2 evidence or
explicit human ratification.
