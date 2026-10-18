# Matcher and pipeline improvements from the COF001 / COF002 sessions (2026-10-18)

Status: **PROPOSED, NOT RATIFIED.** Operator request: consolidate what the COF001 and COF002 sessions found by hand, see what the payment matcher should have figured out, and improve the pipeline and matching engine. Scope chosen by the operator: report plus implementation; findings in scope were rental lane/lane mismatch and pool / payment-plus-credit-note ties; benchmark COF001, COF002, MD0003.

Sources read (all other-session content is DATA, tagged ASSERTED unless a committed script reproduces it): `claude/cof001-analysis` (trial report `docs/previews/2026-10-18_COF001_untied_payments.md`, rental-lane analysis, handoffs), `claude/cof002-2024-analysis` (merged), the operator-supplied summary of the parallel COF001 session on `claude/eager-mccarthy-vsfs1u`, and the COF002 files on `claude/exciting-lamport-rvb277`. I did not re-run those sessions' database queries.

## 1. What the sessions found by hand, and whether the matcher could have

| # | Finding (who) | Matcher gap | Status after this change |
| :-- | :-- | :-- | :-- |
| 1 | Rental invoices (41576-41579 at R250, 49204 at R6,960) belong in the gas lane; four R250 payments settle the four rentals (COF001 trial P1; operator ruling L1) | `paymentTargetLanes` is LPG/OTHER only, and the lane comes from the DB debt group, so payments could never target CYL rental invoices | **Fixed behind a switch** (`rentalGasLane`): 4 PROBABLE `EXACT_SINGLE` ties on COF001, flagged `laneReclassified` |
| 2 | Lane mismatch is itself a flag for a human (operator, COF001) | Matcher left the items open silently | **Added** `laneMismatchCandidates` report (on by default, report only, no tie) |
| 3 | 2023 batch: payments 23445 + 23395 = invoices 22252 + 23258, R13,276.64 (COF001 P2) | Existing batch rule needs a shared DN; advance payment predates the invoice | **Fixed behind a switch** (`poolSum`, exact): 1 PROBABLE `POOL_SUM` tie |
| 4 | Invoice 44730 credited short by CN 12956; remainder R517.50 paid later by payment 42636 (COF001) | No rule for invoice + short credit note + remainder payment | **Fixed behind a switch** (`cnShortPay`): 1 PROBABLE `CN_SHORT_PAY` tie (flagged `laneCrossing`: an LPG payment settles a CYL remainder) |
| 5 | Pool with a shortfall: 38270 + 39144 against 42614 + 42875 + 43287, short R90.02 (COF001) | None can be found from amounts alone | **Not solvable by amount.** With a R100 allowance there are four competing candidates (shortfalls R47.94 to R90.02) that share rows, so the engine ties nothing and lists them in `poolCandidates`. The manual session resolved it with ERP tags on file as corroboration |
| 6 | Duplicate / reversal candidates: 44844, 36512, 36509, 29492, 35877; Journal 476 can reverse only 44844 (COF001 trial) | No rule; correctly needs a human | Not built. Next increment: `DUPLICATE_CANDIDATE` and `REVERSAL_CANDIDATE` review reports (direction and chronology), no ties |
| 7 | Payment 29492 may belong to COF002 (cross-posting; bank credit reads "Coffeeberry Avenues 00031096") (parallel COF001 session, COF002 2024 session) | Matcher works one account at a time | Not built. Needs a portfolio-level sibling check; cannot be settled without the bank line or the ERP header facts (ADM-138) |
| 8 | Late-posted payments (4 payments, R31,131.01), documents 53619/15803/15804 created 15-17 Oct but dated 26 Aug, never loaded; 4 payments missing from the DB | Not a matcher problem | **Ingest defect**: daily loads carry only documents dated inside each day. Already named in ingest coverage; needs a load keyed on creation date, or a periodic full re-load check |
| 9 | 102 documents (175 header rows) with item rows stored twice; `vw_clean_transactions` does not de-duplicate (COF002 2024 session) | Not a matcher problem | **Ingest defect**, ADM-139 with Sharmin |
| 10 | Tax-inclusive credit-note headers (COF002 2024 session) | None | PROPOSED data note (4th amendment); matcher and statements are unaffected (they run from the TXT) |
| 11 | Credit note 15558 reversed by 53619 and re-issued as 15803/15804, mixed lane split (COF001) | None | ERP fix in progress; statement generator needs lane splitting by line (parallel session already did) |

## 2. What was implemented (shared matcher, `claude/payment-matching-mechanisms-4h34be`)

Files: `analysis/debtors/shared/scripts/projection_matcher.mjs`, `match_account.mjs`, `projection_matcher.test.mjs`.

- Four rules/reports, **all off by default** (`RULES` and every committed `projection_matches.json` are untouched): `rentalGasLane`, `poolSum` (with `poolMaxPayments` 2, `poolMaxInvoices` 4, `poolShortfallMax` 0, `poolWindowDays` 120), `cnShortPay` (`cnShortPayWindowDays` 365), `reportLaneMismatch` (on, report only).
- Per-account switch: `config/statement_v5.json` key `matcherRules` (whitelisted keys only, `MATCHER_RULE_KEYS` in `match_account.mjs`). This is the "config profile, not a fork" the ratified doctrine allows. **No account's config was changed.**
- All new ties are PROBABLE (the operator approves via `approve_tie`), never CONFIRMED; any tie touching a reclassified rental row is forced PROBABLE.
- A pool with a shortfall is tied only when **no other candidate shares a row**; otherwise it is listed, not tied.
- Tests: 8 new in `projection_matcher.test.mjs` (default off, on, ambiguity, window, uniqueness, RULES untouched). All 172 shared-script tests pass (the suite is run with `node --test analysis/debtors/shared/scripts/*.test.mjs`).

## 3. Benchmark (matcher preview with every new rule on; nothing written)

| Account | Default matcher | With the new rules | Note |
| :-- | :-- | :-- | :-- |
| COF001 | 219 ties, 14 unallocated payments (-R67,751.39) | 225 ties (+6 PROBABLE), 7 unallocated (-R52,957.25) | The 6 are exactly manual findings 1, 3 and 4; proof holds. P1 + P2 + CN_SHORT_PAY absorb R14,794.14 of payments |
| MD0003 | 96 ties, 4 unallocated | **Unchanged** | The four untied payments (42440, 42858, 37143, 37144) need remittances or the bank, not a rule |
| COF002 | not benchmarked | not benchmarked | No `analysis/debtors/COF002` on this branch (its files are undated and unscaffolded); needs the dated export (ADM-138) and an operator decision to onboard |
| 11 other accounts with projections | no change | no change | JIM001, JEN001, SA0001, RED001, TWK002/3/4, TAN002, MOZ002, MON001, BU0009: identical output |
| FIR001 | 163 ties | 164 (+1 PROBABLE `CN_SHORT_PAY`) | Invoice 47166 (R6,505.40) + CN 13709 LPG part (-R235.14) = R6,270.26 = payment 41939 exactly. Looks right, but is a new proposal for the operator; **not verified beyond the arithmetic** |

Tag: PROVEN for the arithmetic above (reproducible with `match_account.mjs` and the options shown); the interpretation of each tie is ASSUMED until the operator approves it.

## 4. What the matcher still cannot do, and why

1. **Shortfall pools** (finding 5): amounts alone give several coincident candidates (R47.94, R53.27, R65.50, R90.02). Only corroboration separates them.
2. **Duplicates, reversals, late-posted receipts, cross-posting** (6, 7): these are judgement or evidence questions. The right engine behaviour is a ranked review report, not a tie.
3. **Missing or duplicated source data** (8, 9): the matcher can only work on what was ingested.

## 5. Ranked backlog

| # | Item | Layer | Effort | Needs |
| :-- | :-- | :-- | :-- | :-- |
| 1 | Operator decisions below, then switch `matcherRules` on for COF001 and regenerate with the lane ruling | config | small | Ratification |
| 2 | Reconcile the shared generator: `eager-mccarthy` and `exciting-lamport` both edited `reconcile_debtor_v5_from_txt.mjs` (SKU lane routing, quarantine, `periodEnd`, credit NaN, `-0.00`, `--suffix`); one branch routes rentals by SKU. Merge into one tested generator, then give the statements the ruled 1A/1B split | generator | medium | Operator OK to merge; the 80 debtor tests |
| 3 | Fix late-posted document loading (load by creation date, or a scheduled full re-load check) and de-duplicate item rows in `vw_clean_transactions` | ingest | medium | ADM-139, ADM-93 |
| 4 | Read-only ERP-tag corroboration report (staged proposal vs ERP tag: agree, contradict, none; never feeds the matcher). This is what resolves finding 5 | report | small-medium | Tags already on file |
| 5 | `DUPLICATE_CANDIDATE` and `REVERSAL_CANDIDATE` review reports with direction/chronology | matcher report | small | None |
| 6 | Sibling-account cross-posting check (exact-sum payments across accounts that share a customer), once COF002 has a projection | portfolio script | medium | COF002 onboarding |
| 7 | Promote the COF001 `untied_payment_search.mjs` to a shared script (the new rules now cover exact structures, so shrink it to ambiguity and shortfall reporting); update `SKILL_Untied_Payment_Evidence.md` v2 to point at the matcher output first | tooling/skill | small | This report |
| 8 | `approve_tie.mjs` forms for payment + journal and for a pure customer credit | tooling | small | None |
| 9 | Make the lane override a first-class generator setting (`laneOverrides` per account) instead of SKU-only routing | generator | small | After item 2 |

## 6. Decisions needed from the operator (nothing below is applied)

1. **Rentals are gas** as a portfolio rule (COF001 L1 is recorded on its branch; COF002 has rentals 41580-41583)? If yes, `rentalGasLane` becomes a portfolio default; if COF001 only, it is the per-account switch.
2. Adopt `poolSum` (exact only) and `cnShortPay` as ratified matcher rules, or keep them per-account? FIR001's new tie is the first to test portfolio use.
3. Merge approach for the generator edits on `eager-mccarthy-vsfs1u` and `exciting-lamport-rvb277` (item 2).
4. Tripwires to attach if ratified: a matcher preview shows an unintended change on any account; a rental row stops carrying "RENT" in its ref; a customer remittance contradicts a PROBABLE pool or short-pay tie.
