# COF001: cylinder rentals ruled into the gas lane, effect and what is needed to apply it (2026-10-18)

**Operator ruling (this session, 2026-10-18), recorded as L1 in `analysis/debtors/COF001/config/operator_rulings.json`:** "Cylinder Rentals should be handled in the gas lane not cylinder lane", and "That mismatch itself says someone should check." This note is analysis only: nothing in the generator, matcher, locks or other config was changed. Tags: PROVEN = arithmetic on the committed `data/v5_projection.json` and `data/projection_matches.json`; ASSERTED = stated inference; the ruling itself is the operator's.

## 1. Which documents
Five invoices carry stock 3112 (rental) and sit in the CYL lane today (PROVEN, `data/v5_projection.json`; stock number ASSERTED from the replay capture `data/db_replay/2026-10-16/c72d9a4c6da4bc55.rows.json`):

| Doc | Date | Reference | Qty | Amount |
| :-- | :-- | :-- | --: | --: |
| 41576 | 2025-03-18 | D/N 11836 RENTAL FEB | 1 | 250.00 |
| 41577 | 2025-03-18 | D/N 11836 MAR RENTAL | 1 | 250.00 |
| 41578 | 2025-03-18 | D/N 12851 FEB RENTAL | 1 | 250.00 |
| 41579 | 2025-03-18 | D/N 12851 MARCH RENT | 1 | 250.00 |
| 49204 | 2026-02-11 | SM CYL RENTAL | 2 | 6,960.00 |
| | | | | **7,960.00** |

## 2. Effect on the lane totals (ASSERTED arithmetic, nothing regenerated)
| | Today (branch, `reports/COF001_Statement_Account_v5.md`) | With rentals in 1A |
| :-- | --: | --: |
| Part 1A gas | -16,442.52 | **-8,482.52** |
| Part 1B cylinder deposits | +186.00 | **-7,774.00** |
| Combined (= ERP) | -16,256.52 | -16,256.52 |

The with-rentals figures equal the 1A/1B closings of the other COF001 statement session (`claude/eager-mccarthy-vsfs1u`, which routes by cylinder SKU), so that session already follows this ruling. The two sessions' split differed by exactly R7,960.00 for this reason.

## 3. Effect on the untied-payment proposals (`docs/previews/2026-10-18_COF001_untied_payments.md`)
- **P1 becomes a same-lane tie.** Payments 37628 to 37631 (LPG lane) and invoices 41576 to 41579 would both be gas lane. The `approve_tie.mjs` form changes from `--deposits 41576,...` to `--invoices 41576,...`; the "LANE" class disappears for these four. The ERP tags (37628 -> 41578, 37629 -> 41577, 37630 -> 41579, 37631 -> 41576) still agree 1:1, corroboration only. Whether the matcher would then tie the set on its own is **untested** (equal amounts, four to four): needs a regeneration.
- **Invoice 49204 (R6,960.00) becomes an open gas-lane invoice.** Remaining rows after P1 to P4, by lane (ASSERTED):

| | LPG (gas) | CYL |
| :-- | --: | --: |
| Before the ruling (preview section 5) | -8,977.56 | -7,369.00 |
| With rentals in the gas lane | **-2,017.56** | **-14,329.00** |
| Tie nets and P3 net | +0.02, +90.02 | |
| Total | **-16,256.52** | |

  So most of the "gas lane in credit by about R9k" was the R6,960.00 rental sitting on the other lane. The remaining 5 payments (R40,442.35) against gas-lane items now leave a gas credit of about R2k, not R9k.
- **Open question the ruling exposes:** 49204 has been unpaid since 2026-02-11, and none of the 5 remaining untied payments equals R6,960.00. Its unit price is R3,480.00 against R250.00 for the March 2025 rentals (14 times). Is 49204 a genuine rental charge, a deposit-like or one-off charge, or disputed? Not for the analyst to rule. Chase list: ERP document header and delivery note for 49204; the customer.

## 4. What is needed to apply it (PROPOSED, NOT RATIFIED; not done here)
1. **Generator support for a lane override.** Today the v5 generator derives lanes from database `debt_group` (query in `reconcile_debtor_v5_from_txt.mjs`, `fetchDocLineSplit`); there is no config key. A minimal, per-account design would be a config list in `config/statement_v5.json` or a new `config/lane_overrides.json`, for example `[{"doc_no":"41576","entry_type":"Invoice","lane":"LPG","ruling":"L1"}]`, or by stock number (`"stock_no":"3112"` once line detail is available). It is a shared-script change (portfolio-wide code), so it needs the PM or orchestration session, not this worker; the other COF001 session has also edited that script on its branch, so the two changes must be merged by the PM.
2. **Rebuild** with the override: `reconcile_debtor_v5_from_txt.mjs`, `match_projection.mjs`, `render_open_items.mjs`, and re-check P1 to P6.
3. **Matcher and skill: surface lane mismatches for a human.** The operator's second point: a payment on one lane and an equal-amount invoice on another is itself a flag. Proposal: the matcher (and `SKILL_Untied_Payment_Evidence`) should list **LANE_MISMATCH** candidates (untied payment whose amount or set-sum equals open items on a different lane) in the review output instead of only leaving them open. This is a portfolio-wide matcher change: PROPOSED, NOT RATIFIED.
4. **Portfolio rule.** "Rental charges belong in the gas lane" is a portfolio-wide classification rule if it is to hold for all accounts (COF002 has rentals 41580 to 41583). Per AGENTS.md section 7 that is a doctrine decision: the operator ratifies it, the orchestration session writes it. The ruling here is recorded for COF001 only.

## 5. Not done
No generator or matcher edit, no regeneration, no lock, no `approve_tie` apply, no config other than the ruling record. The existing reports in this branch still show the rentals in 1B until the override exists.
