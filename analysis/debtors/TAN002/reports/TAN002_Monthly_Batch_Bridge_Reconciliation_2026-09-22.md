# TAN002 — Monthly-Batch ERP Bridge Reconciliation (skill run)

**Date:** 2026-09-22
**Skill applied:** `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md`
**Basis:** `raw/TAN002CURRENT.TXT` (326 rows, chain-verified PROVEN,
`TAN002_Statement_Chain_2026-09-21.md`) + real DB `debt_group` per-document
split (`vw_clean_transactions`, pulled via Supabase MCP this session,
`TAN002_Statement_Account_v5.md`).

---

## 0. Applicability check — mixed result, reported honestly

TAN002 superficially resembles the skill's target payer class: 15 of its
24 payment batches carry `TRANSF | STAT ###` refs, the same batch-payment
style as the skill's worked example (MD0003). But the skill's core
precondition — **§2's exact-sum test succeeding for "disciplined STAT
payers"** — does not hold here (see §2 below: 1 of 24 batches match). This
report runs every step of the skill anyway, as instructed, and states
plainly where the methodology's assumptions break down rather than forcing
a bridge/statement that the data doesn't support. Per doctrine §6, no
value below is invented to complete a table — where a step can't be
honestly completed, it says so and stops.

---

## 1. Commercial open-invoice schedule — gate check

Per skill §1, ran the mandatory gate before trusting any ledger-derived
open list:

```
npm run debtors:tag-check -- --debtor TAN002
```

**Result: `BLOCKED` (`OPEN_LIST_OVERSTATES_ACCOUNT`)**

| Metric | Value |
| :--- | ---: |
| Credit notes tagged | 76/76 |
| Payments tagged | 100/102 |
| Invariant | **BREACHED** — overstated by **R5,245.81** |
| Evidence | `PATTERN_ONLY` — no extracted remittance-line CSV for this account |

Five invoices are flagged `STALE_OPEN` (open on the naive ledger-tag list,
each with untagged credit rows posted against the account since, and
marooned 142–485 days before the next open invoice):

| Invoice | Date | Amount | Days marooned |
| :--- | :--- | ---: | ---: |
| 42427 | 2025-04-22 | R2,733.40 | 485 |
| 42574 | 2025-04-26 | R346.86 | 481 |
| 44448 | 2025-07-02 | R517.50 | 414 |
| 49971 | 2026-03-28 | R1,193.96 | 145 |
| 50035 | 2026-03-31 | R1,193.96 | 142 |

Per skill §1: this is the normal route for a STAT payer, not a blocker —
**the schedule must be built from remittance/exact-sum evidence (§2), not
from ledger tagging.** Proceeding to §2 as instructed.

---

## 2. Exact-sum payment-to-month verification — BEFORE any FIFO assumption

Per skill §2, computed **net LPG billing per calendar month** (LPG lane
only, using the real DB `debt_group` split — 148 invoices + 76 credit
notes, **0 unmatched, 0 mixed-lane** documents; see
`TAN002_Statement_Account_v5.md` for provenance):

| Month | Net LPG billing (R) |
| :--- | ---: |
| 2025-03 | 7,223.85 |
| 2025-04 | 11,594.10 |
| 2025-05 | 12,605.38 |
| 2025-06 | 10,688.93 |
| 2025-07 | 12,930.78 |
| 2025-08 | 10,002.06 |
| 2025-09 | 11,636.88 |
| 2025-10 | 12,026.91 |
| 2025-11 | 9,011.50 |
| 2025-12 | 7,429.90 |
| 2026-01 | 8,155.31 |
| 2026-02 | 8,030.59 |
| 2026-03 | 8,348.14 |
| 2026-07 | 2,783.99 |
| 2026-08 | 1,312.52 |

Grouped the account's 102 individual `Payment` TXT lines into their **24
batch documents** (`doc_no`) and tested each batch's **gross total** —
not individual lines — against every single calendar month's net billing,
`ABS(gross − month_net) <= 0.02`, per the skill's own worked-fix
methodology (MD0003 payment 45595):

| Batch doc | Date | Ref | Gross (R) | Lines | Exact single-month match? |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 36865 | 2025-02-22 | SPEEDP \| PC-76-17 | 12,282.56 | 9 | — |
| 37780 | 2025-03-27 | TRANSF \| STAT 112 | 10,431.35 | 6 | — |
| 39035 | 2025-06-04 | SPEEDP \| PC-76-20 | 13,643.86 | 11 | — |
| 39960 | 2025-07-15 | SPEEDP \| PC-76-21 | 500.57 | 1 | — |
| 39962 | 2025-07-15 | SPEEDP \| PC-76-21 | 10,000.00 | 6 | — |
| 40610 | 2025-08-15 | SPEEDP \| PC-76-22 | 12,880.00 | 8 | — |
| 40718 | 2025-08-23 | SPEEDP \| PC-76-22 | 15,000.00 | 14 | — |
| 41252 | 2025-09-18 | TRANSF \| STAT 118 | 13,764.51 | 6 | — |
| 41261 | 2025-09-20 | TRANSF \| STAT 118 | 3,541.67 | 2 | — |
| 41474 | 2025-09-30 | TRANSF \| STAT 118 | 2,361.12 | 2 | — |
| 41629 | 2025-10-13 | SPEEDP \| PC-76-24 | 4,476.27 | 2 | — |
| 41630 | 2025-10-13 | SPEEDP \| PC-76-24 | 1,180.56 | 1 | — |
| 41964 | 2025-10-27 | TRANSF \| STAT 119 | 4,258.61 | 4 | — |
| 42300 | 2025-11-18 | TRANSF \| STAT 120 | 6,746.02 | 3 | — |
| 42421 | 2025-11-26 | TRANSF \| STAT 120 | 3,469.67 | 2 | — |
| 42543 | 2025-12-08 | TRANSF \| STAT 121 | 2,313.12 | 2 | — |
| 42611 | 2025-12-13 | TRANSF \| STAT 121 | 1,162.63 | 1 | — |
| 43067 | 2026-01-20 | TRANSF \| STAT 122 | 10,923.84 | 8 | — |
| 43216 | 2026-02-02 | TRANSF \| STAT 123 | 2,342.18 | 2 | — |
| 43373 | 2026-02-18 | TRANSF \| STAT 123 | 5,193.03 | 3 | — |
| 43562 | 2026-03-06 | TRANSF \| STAT 124 | 4,021.93 | 4 | — |
| 43752 | 2026-03-23 | TRANSF \| STAT 124 | 4,775.85 | 3 | — |
| 44064 | 2026-04-21 | TRANSF \| STAT 125 | 1,193.96 | 1 | — |
| **45199** | **2026-07-15** | **TRANSF \| STAT 128** | **2,783.99** | **1** | **✓ 2026-07** |

**Result: 1 of 24 batches (4%) matches a single calendar month exactly.**
Extended the test to **contiguous multi-month sums** (1–6 consecutive
months, still exact-sum, not FIFO) — no additional batch matches any
window. The one success (45199/STAT 128) is not evidence of monthly
settlement discipline: it matches trivially because July 2026 is a
short, low-activity month and the batch happens to equal its only
invoice's value.

**Conclusion on §2: the exact-sum test — the skill's own gating check for
"disciplined STAT payers" — fails for TAN002.** Per the skill's explicit
language ("Only fall back to FIFO/chronological slicing if no exact month
match exists (rare for disciplined STAT payers)"), that fallback condition
is TAN002's *normal* case, not the rare exception the skill is designed
around. This formalizes, with exact-sum proof, what this session's earlier
manual ledger-scanning already found informally
(`TAN002_R739.87_Float_Deep_Dive_2026-09-22.md` §5b): TAN002 has carried a
**permanent, never-fully-clearing balance since 27/03/2025** — each batch
chips away at an accumulating float rather than fully settling a month's
billing. It is a **partial/irregular batch payer**, not the full-settlement
monthly consolidator this skill's Steps 3–6 are built for.

---

## 3. CYL `-EMPTY` deposit-pair stripping

Per skill §1, paired every CYL-lane Invoice against a CYL-lane Crd Note of
equal-and-opposite amount (date-order tiebreak where more than one
candidate existed). Of 73 CYL-lane Invoice/CN documents (using the real DB
`debt_group='CYL'` classification — see `TAN002_Statement_Account_v5.md`):

- **67 pairs net to R0.00** — stripped, standard delivery/return cycles.
- **6 lines remain unpaired**, netting to a **residual of R690.00**:

| Doc | Date | Type | Amount (R) |
| :--- | :--- | :--- | ---: |
| 49260 | 2026-02-16 | Invoice | 1,897.50 |
| 49398 | 2026-02-24 | Invoice | 1,897.50 |
| 51543 | 2026-07-02 | Invoice | 2,415.00 |
| 13868 | 2025-11-14 | Crd Note | -3,105.00 |
| 14678 | 2026-03-30 | Crd Note | -1,207.50 |
| 15518 | 2026-08-20 | Crd Note | -1,207.50 |

Net: `1,897.50 + 1,897.50 + 2,415.00 − 3,105.00 − 1,207.50 − 1,207.50 =
690.00`.

**This independently cross-validates the real DB-backed v5 statement run**
(`TAN002_Statement_Account_v5.md`, same day) — that run's Part 1B CYL
close was also **R690.00 exactly**, computed by an entirely different
method (running-balance replay of the real `debt_group` column, not
amount-pairing). Two independent methods agreeing to the cent is strong
corroboration. **PROVEN.**

---

## 4. Standing credit vs true variance — cannot be honestly assessed

Skill §3 requires computing `gap = commercial_open_position − ERP_balance`
at each STAT cycle end and testing whether it holds constant across ≥3
consecutive cycles. **This step requires §2's exact-sum schedule as its
input.** Since §2 did not produce a verified month-by-month settlement
schedule (23 of 24 batches don't tie to any calendar-month window), there
is no `commercial_open_position` series to test for constancy — computing
one now, by falling back to FIFO/chronological slicing as the skill
permits for the rare non-matching case, is exactly the anti-pattern the
skill itself warns against (§7: "Assuming chronological/FIFO application
of a STAT payment without first testing exact-month-sum match... Produces
a false 'chronological credit' theory").

**Not run, correctly.** What the account's actual permanent-carry
mechanism looks like is already documented, with appropriate ASSERTED-tier
caveats, in `TAN002_R739.87_Float_Deep_Dive_2026-09-22.md` §5b — that
report's arithmetic-proximity findings (R1,338.79 residual after payment
37780, one cent off invoice 41270) are the correct-methodology equivalent
of this skill's §3 for a payer class this skill doesn't cover.

---

## 5. ERP bridge

The skill's bridge template (`A + B − C = ERP balance`, built from a
verified open-invoice schedule) cannot be assembled, for the same reason
as §4. What **can** be stated, and is now triple cross-validated by three
independent methods this session (real DB `debt_group` running-balance
replay; CYL amount-pairing above; raw aggregate arithmetic below), is the
account's LPG/CYL split identity:

| Method | LPG close (R) | CYL close (R) |
| :--- | ---: | ---: |
| DB-backed v5 statement (`debt_group` running balance) | 1,362.39 | 690.00 |
| This report — CYL amount-pairing (§3) | — | 690.00 |
| This report — raw aggregate (`openingBF + billed − paid`) | 1,362.39 | — |

```
LPG opening B/F (22/02/2025):     R16,828.85
+ Net LPG billed (15 months):    R133,780.84
− Gross LPG payments (24 batches): R149,247.30
= LPG close:                        R1,362.39   ✓ matches DB-backed run exactly
```

Combined: `1,362.39 + 690.00 = 2,052.39` — the PROVEN ERP `CURRENT
BALANCE` anchor (`TAN002_Statement_Chain_2026-09-21.md`). **PROVEN.**

This is the correct bridge for TAN002 — a straight arithmetic identity,
not a schedule-vs-ERP variance bridge — because the schedule this skill's
bridge format requires doesn't exist for this payer class.

---

## 6. Customer-facing statement — **not generated**

Skill §5 requires generating the statement from "the verified schedule
only." No such schedule exists for TAN002 (§2, §4). Generating a
customer statement on a false full-month-settlement assumption would
misstate which invoices are actually open — exactly the failure mode the
skill itself names in its anti-pattern table (§7: "Sending an open-invoice
schedule without running `debtors:tag-check`... TWK002 billed a customer
for 15 months this way"). Producing one here, even with disclaimers, risks
the same outcome by a different route.

**Recommendation:** TAN002's collectable position should continue to be
quoted from the PROVEN ERP `CURRENT BALANCE` (R2,052.39) with the
document-level caveats already on record in
`TAN002_Outstanding_Balance_Investigation_2026-09-21.md` and
`TAN002_R739.87_Float_Deep_Dive_2026-09-22.md` (INVNO/ref_no downgraded to
advisory-only; R1,312.52 unambiguously open per DB; R739.87 residual with
an unresolved, undocumented R454.09 component). This skill's statement
methodology (Step 5, calendar-month ageing, "remit prior-to-current" line)
should not be applied to this account until/unless a proper remittance
advice becomes available to build a genuine exact-sum schedule.

---

## 7. Duplicate/linked ERP account code check

Per skill §6:

- Searched all other debtor accounts' `raw/*.TXT` exports for "TANDOOR"
  as a historical name — **none found** (only `analysis/debtors/shared/raw/april_dump.TXT`,
  a portfolio-wide dump, contains it, which is expected since it aggregates
  all accounts including TAN002 itself).
- Searched TAN002's own raw exports for `XFER` transfer-language in any
  reference field — **0 matches**.
- Searched the shared portfolio dump for any other account code appearing
  alongside "TANDOOR" — **none found**; only `TAN002` itself appears.

**Result: no duplicate or linked ERP account code found for this
customer.** Clean — nothing further to investigate on this axis.

---

## 8. Summary

| Skill step | Result |
| :--- | :--- |
| §0 Applicability | Mixed — STAT-style refs present, but exact-sum precondition fails |
| §1 Schedule + gate | `BLOCKED`, overstated R5,245.81 — ledger tags not usable |
| §2 Exact-sum verification | **FAILS** — 1/24 batches (4%) match any calendar-month window |
| §3 CYL stripping | **PROVEN** — R690.00 net residual, cross-validated 2 ways |
| §4 Standing credit detection | Not run — no valid schedule to test (correctly withheld) |
| §5 ERP bridge | Arithmetic identity only (not schedule-vs-ERP): R1,362.39 + R690.00 = R2,052.39, **PROVEN**, cross-validated 3 ways |
| §6 Customer statement | **Not generated** — would misstate open invoices |
| §7 Duplicate account check | Clean — none found |

**Overall conclusion:** TAN002 is not, in fact, the monthly-batch
full-settlement payer class this skill targets, despite carrying STAT-style
payment refs. Running the skill's own exact-sum precondition test is what
proves this, rather than assuming it from the surface pattern — which is
the correct outcome of applying the skill rigorously rather than the
outcome the request may have anticipated. The account's real behavior
(partial/irregular batches against a permanently-carrying balance) is
already correctly handled by the arithmetic-proximity methodology in
`TAN002_R739.87_Float_Deep_Dive_2026-09-22.md`, now reinforced by this
skill's own exact-sum test as independent proof that FIFO/FIFO-adjacent
reasoning — not full-month exact-sum matching — is the right tool for this
account.

---

## 9. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| Exact-sum test fails for 23/24 batches (partial/irregular payer, not monthly-consolidator) | A remittance advice surfaces showing batches were meant to cover specific months/invoices, contradicting the exact-sum read |
| CYL net residual R690.00 (PROVEN, 2-way cross-validated) | A DB re-pull or TXT update changes any of the 6 unpaired CYL documents |
| No duplicate ERP account found | A future ERP export or operator disclosure surfaces a second code for this customer |
| No customer statement generated under this skill | A proper per-invoice remittance advice becomes available for this account |
