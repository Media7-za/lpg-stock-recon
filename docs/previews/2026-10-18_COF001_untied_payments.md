# COF001 untied payments: trial of the draft SKILL_Untied_Payment_Evidence, 2026-10-18

**Analyst session, branch `claude/cof001-analysis`. INTERNAL. Trial of a DRAFT skill (`.agents/skills/SKILL_Untied_Payment_Evidence.md`, commit `219cf3a` on `claude/payment-matching-mechanisms-4h34be`, not operator-approved, not edited). Nothing applied: no `approve_tie.mjs` write, no lock, no ruling, no `reconState`, no config write, no customer email, no Gmail draft. No ERP allocation detail requested. Database not used.**

Tags: **PROVEN** = arithmetic on the committed projection by the committed script `analysis/debtors/COF001/scripts/untied_payment_search.mjs` (outputs in `docs/previews/2026-10-18_COF001_untied_payments/out/`); **ASSERTED** = read from a committed ERP TXT, or a stated inference; **ASSUMED** = a customer's intention. ERP payment tags (INVNO in `ERP RAW DATA/DETRANS.TXT`, 2025-03 to 2026-02 only) are **corroboration at best** and are never used as proof.

## 1. Inputs and scope (skill section 1)

| Item | Value | Tag / artifact |
| :-- | :-- | :-- |
| Matcher | v5, generated 2026-10-16T10:50:28Z, 219 ties (219 confirmed, 0 probable; 14 are operator locks L0001-L0014), `reviewOnly` (ingest coverage partial: 4 group A gaps) | PROVEN `data/projection_matches.json` |
| Ledger file | `raw/COF001_COMBINED.TXT`, **undated** (D21 interim exception ruled by the operator, Q3), last row 2026-09-09, sha256 `af6fa321fa8c` | PROVEN `data/v5_projection.json` source |
| ERP balance | -R16,256.52 (operator Q1) | PROVEN header |
| Untied payments | **14, total -R70,753.72** | PROVEN `out/..._tol0.txt` |
| Other untied rows | Bank XFer 7473 +R3,002.33; Journal 476 +R7,224.65 | PROVEN |
| Matcher bucket "unallocated" | 15 rows, -R67,751.39 (= 14 payments + Bank XFer) | PROVEN `projection_matches.json` |
| Open invoices | 21, +R86,879.03 (LPG 8: R53,124.53; CYL 13: R33,754.50) | PROVEN |
| Unmatched credit notes | 13, -R42,608.83 | PROVEN |
| Tie nets | +R0.02 | PROVEN |
| **Check** | -70,753.72 + 3,002.33 + 7,224.65 + 86,879.03 - 42,608.83 + 0.02 = **-16,256.52 = ERP** | PROVEN |

Note: the earlier COF001 preview (section 11) omitted the matcher's fifth bucket `otherUntied` (Journal 476); the bucket sum above includes it.

## 2. Classification table (skill sections 2, 3, 4)

Rungs: 1 remittance, 2 customer ledger, 3 bank line, 4 bounded exact-sum search, 5 pattern. **Rungs 1 to 3: no evidence on file for any payment** (no `raw/Remittances/`, no `data/remittance_lines_*.csv`, no customer ledger, no bank line in the repo). Rung 4 ran at tolerance 0.00 and 0.05 (section 3). "ERP tag" = DETRANS corroboration only.

| # | Payment | Date | STAT | Amount | Class (candidate) | Rung | Evidence / tests |
| :-- | :-- | :-- | :-- | --: | :-- | :-- | :-- |
| 1 | 37628 | 2025-03-19 | 113 | -250.00 | **LANE** (LPG payment, CYL invoices) | 4 | set of 4 x R250 vs rental invoices 41576-41579 (2025-03-18, CYL). ERP tag 37628 -> 41578 |
| 2 | 37629 | same | 113 | -250.00 | LANE | 4 | ERP tag -> 41577 |
| 3 | 37630 | same | 113 | -250.00 | LANE | 4 | ERP tag -> 41579 |
| 4 | 37631 | same | 113 | -250.00 | LANE | 4 | ERP tag -> 41576 |
| 5 | 23445 | 2023-05-18 | 91 | -8,827.62 | **ADVANCE** (55 days before invoice 22252); alt **DUPLICATE** (equals invoice 19400, settled by 20487) | 4 | exact batch with 23395 vs 22252 + 23258 |
| 6 | 23395 | 2023-08-14 | 94 | -4,449.02 | partner of 23445 | 4 | no ERP tag on file (DETRANS starts 2025-03) |
| 7 | 38270 | 2025-04-15 | 114 | -9,070.63 | **POOL / short-pay** (and equals invoice 41930's amount, settled by 38217) | 4 near-sum | with 39144 vs 42614 + 42875 + 43287: R15,517.23 vs R15,607.25, short **R90.02** (not exact: outside 0.05). ERP slices: 42614 560.65, 42875 7,475.29, 43287 1,034.69 |
| 8 | 39144 | 2025-06-02 | 116 | -6,446.60 | POOL | 4 near-sum | ERP tag -> 43287. Bank UD slice 22.91 of 40294 also tagged 43287 (R67.11 then short) |
| 9 | 42636 | 2025-12-17 | 122 | -517.50 | **LANE + credit note** (payment + CN vs CYL invoice) | 4 extended | -517.50 + CN 12956 (-8,107.50) = invoice 44730 (R8,625.00) exactly. 517.50 = the 9KG deposit rate in config (`skuRates` 9.1). ERP tag -> 44730 |
| 10 | 44844 | 2024-11-14 | 109 | -7,224.65 | **DUPLICATE** (equals 38158, 38734, 38735, each settled by another payment) + **REVERSAL** candidate Journal 476 (+7,224.65, 2024-12-11, 27 days after) | n/a | no structure |
| 11 | 36512 | 2025-01-31 | 111 | -7,224.65 | **DUPLICATE** (same three invoices). Journal 476 **cannot** be its reversal (journal is 51 days *before* the payment) | n/a | no structure |
| 12 | 36509 | 2025-01-31 | 111 | -8,715.19 | **DUPLICATE** (equals 39944, settled by 36950) | n/a | no structure |
| 13 | 29492 | 2024-04-18 | 102 | -7,628.30 | **DUPLICATE** (equals 30276, settled by 30219). **CROSS-POSTING QUESTION, see below** | n/a | ERP header: applied to invoice 30276 |
| 14 | 35877 | 2024-12-30 | 110 | -9,649.56 | **CREDIT / UNKNOWN** | n/a | no structure, no equal invoice. 39311 (R8,390.92, 7 days earlier) is open but the R1,258.64 difference matches nothing (ASSUMED only) |

**Payment 29492 (cross-posting question, not ruled here).** COF002 session suspect A (`docs/previews/2026-10-16_COF002_2024_analysis.md`): R7,628.30 equals COF002 invoice 31096 (2024-04-08, ERP flag N). Evidence for/against as in that report and in `docs/previews/2026-10-17_COF002_header_lookup/FINDINGS.md`. Reported by the other COF001 session as quarantined by the operator on 2026-10-18 (`claude/eager-mccarthy-vsfs1u`, `config/quarantine.json`); that decision is not recorded in this branch. Check that would settle it: bank lines for STAT 101/102 and the ERP document header facts. 30219 (untagged in the ERP delivery, blank INVNO) is as plausible an odd receipt as 29492.

**Other rows not payments:** Bank XFer 7473 (+R3,002.33, 2026-09-09) is the cash side of the credit note 15558 correction (operator Q2); credit note 15558 LPG part is -R3,002.83, difference R0.50. Not classified here.

## 3. Bounded exact-sum search (skill section 3, rung 4)

`node analysis/debtors/COF001/scripts/untied_payment_search.mjs [--tol 0.05] --out ...` (subsets of up to 4 untied payments vs up to 4 open invoices, whole-invoice sums only):

| Tolerance | Hits (raw) | Minimal structures | Reading |
| :-- | --: | --: | :-- |
| 0.00 | 122 | **2** | rentals (4 x R250 vs 41576-41579) and 2023 batch (23445 + 23395 vs 22252 + 23258) |
| 0.05 | 198 | 11 | 9 extra, all **coincidences**: they mix years (2023 payments with 2025 invoices), 3 to 4 payments with 3 to 4 invoices; none is plausible. Report as tried, rejected |

Structures **not** found by this search but found with extra steps: the pool 38270 + 39144 (needs a shortfall allowance of R90.02, beyond 0.05) and 42636 + credit note 12956 vs invoice 44730 (needs credit notes on the payment side). See the trial report.

## 4. Explanation tests (skill section 4)

- **DUPLICATE:** 29492, 44844, 36512, 36509 (and 38270's amount, explained by the pool). Four payments equal an invoice that another payment already settles: R30,792.79 together. Either the customer paid twice or the ERP posted a receipt twice (PROVEN equality; the reason is ASSUMED).
- **REVERSAL:** Journal 476 (+7,224.65, 2024-12-11) can only offset 44844 (2024-11-14); it predates 36512 (2025-01-31), so it cannot reverse it. The script flags both; chronology removes 36512 (ASSERTED by dates).
- **LANE:** rentals (4 payments) and 42636 (cylinder deposit).
- **CREDIT:** after the staged items, the gas lane is in credit (section 6).
- **Sibling account:** 29492 flagged (above). 2025 payments 36509, 36512, 38270, 39144 and 2024 35877 were not tested against COF002 (the COF002 session tested only 2024 spare payments: one hit, 29492).

## 5. Staged questions (nothing applied; dry-run commands verified 2026-10-18, each would record L0015)

| Q | Proposal | Total | Class / rung | Tag | Dry-run command | Alternative | Tripwire |
| :-- | :-- | --: | :-- | :-- | :-- | :-- | :-- |
| **P1** | 37628, 37629, 37630, 37631 vs rental invoices 41576-41579 (set tie, treatment exact) | R1,000.00 | LANE / 4 | PROVEN sum; intent ASSUMED (ERP tags agree 1:1) | `node analysis/debtors/shared/scripts/approve_tie.mjs --debtor COF001 --payment 37628,37629,37630,37631 --deposits 41576,41577,41578,41579 --treatment exact --reason "..." --dry-run` | leave open (rentals are CYL, payments LPG lane) | dated export tags them to other documents |
| **P2** | 23445 + 23395 vs 22252 + 23258 (exact) | R13,276.64 | ADVANCE (23445) / 4 | PROVEN sum; intent ASSUMED | `... --payment 23445,23395 --invoices 22252,23258 --treatment exact ... --dry-run` | 23445 as duplicate of 19400's amount and 23395 alone as a part payment | remittance or customer ledger for 2023 |
| **P3** | 38270 + 39144 vs 42614 + 42875 + 43287, `short_paid` (net R90.02 stays unpaid) | R15,517.23 vs R15,607.25 | POOL / 4 near-sum | PROVEN sums; shortfall reason ASSUMED (ERP slices corroborate) | `... --payment 38270,39144 --invoices 42614,42875,43287 --treatment short_paid ... --dry-run` | `part_payment` with 43287 as the partial: `... --invoices 42614,42875 --treatment part_payment --partial 43287` (net -R7,481.29; same remainder R90.02 open on 43287) | the R90.02 turns out to be a further payment or credit |
| **P4** | 42636 + credit note 12956 vs CYL invoice 44730, exact (R517.50 = one 9KG deposit not returned) | R8,625.00 | LANE + CN / 4 extended | PROVEN arithmetic; "one unreturned cylinder" ASSUMED | `... --payment 42636 --deposits 44730 --credit-notes 12956 --treatment exact ... --dry-run` | leave 42636 as credit and 44730 open | custody check (blocked: ingest partial) shows a different cylinder count |
| **P5** | Journal 476 pairs with payment 44844 (reversal) | R7,224.65 | REVERSAL / n/a | PROVEN equality and chronology; reversal intent ASSUMED | **no `approve_tie.mjs` form** (payment + journal without invoices is refused: "no invoices given") | record as an operator note | an ERP document shows the journal was posted for something else |
| **P6** | The rest, **no tie**: 29492, 36512, 36509, 35877 (-R33,217.70) as customer credit | -R33,217.70 | DUPLICATE x3, CREDIT x1 | PROVEN sums; reason ASSUMED | **not needed**: unallocated stays the default; `customer_credit` is refused without invoices | refund, or reallocation if evidence appears (29492 may belong to COF002; see cross-posting) | bank evidence, ERP reversal, remittance |

### Residual check (skill section 5)

| | Payments | Open invoices | Unmatched CNs | Other | Total |
| :-- | --: | --: | --: | --: | --: |
| Before staging | -70,753.72 | +86,879.03 | -42,608.83 | +10,226.98 (Bank XFer 3,002.33 + Journal 476 7,224.65) + tie nets 0.02 | **-16,256.52** |
| Absorbed by P1 to P4 | -30,311.37 | +38,508.89 | -8,107.50 | P3 net +90.02 | |
| **Remaining** | **-40,442.35** (44844, 36512, 36509, 29492, 35877) | **+48,370.14** (LPG 24,240.64: 41238, 41562, 39311; CYL 24,129.50) | -34,501.33 | +10,226.98 + 90.02 + 0.02 | **-16,256.52** |

By lane after P1 to P4 (PROVEN): remaining LPG rows -R8,977.56, CYL rows -R7,369.00, plus tie nets 0.02 and P3 net 90.02 = -R16,256.52. The unresolved cash is the 5 payments (R40,442.35) against LPG open invoices R24,240.64, Journal 476 and Bank XFer 7473. The CYL lane's -R7,369.00 is dominated by credit notes (including 15558 CYL -R15,697.50, operator Q2).

## 6. Chase list (draft only, nothing sent or drafted)

| Payment | Date | Amount | STAT | Who can supply | Note |
| :-- | :-- | --: | :-- | :-- | :-- |
| 29492, 30219 | 2024-04-18 / 03-12 | -7,628.30 each | 102 / 101 | **bank line** (operator), ERP header facts (ERP agent) | cross-posting vs COF002 31096 |
| 44844, 36512, 36509 | 2024-11-14 / 2025-01-31 | -7,224.65 / -7,224.65 / -8,715.19 | 109 / 111 | bank lines (operator); customer ledger (Sue at coffeeberry.co.za is the only customer address seen in the mailbox) | duplicates or genuine repeats? |
| 35877 | 2024-12-30 | -9,649.56 | 110 | bank line | no structure |
| 23445, 23395 | 2023-05-18 / 08-14 | -8,827.62 / -4,449.02 | 91 / 94 | customer ledger or remittance | P2 |
| 37628-37631, 38270, 39144, 42636 | 2025 | see section 2 | 113-122 | ERP tags already corroborate; bank lines optional | P1, P3, P4 |

**Mailbox check (skill section 6):** one read-only metadata search (`Coffeeberry OR COF001`), no messages opened: about 200 hits, almost all Jira/Linear notifications; one 2026-09-09 thread involving sue@coffeeberry.co.za (subject not read); two FNB statement emails (2026-03-31, 2026-05-03) that may be the bank-line source. **No earlier COF001 remittance or ledger request was identified.** Customer contact is therefore **unconfirmed**; no Gmail draft was created. Bank-line request for the operator: STAT 101, 102, 105 (COF002), 106, 109, 110, 111 lines with payer name, amount and reference. ERP requests would not ask for allocation detail (ADM-135 does not).

## 7. Output (skill section 7)

This file, the script and `out/` files, and the handoff entry in `docs/handoffs/2026-10-16_COF001.md` (untied total before/after staging: -R70,753.72 -> -R40,442.35 if P1 to P4 are ruled; open questions P1 to P6; evidence missing: bank lines, remittance, customer ledger; tripwires in section 5).

---

# Skill trial report

**(a) Does the skill reproduce P1 to P4 and the 8-payment credit residual?**

| Earlier (preview 2026-10-14, section 11) | Skill trial |
| :-- | :-- |
| P1 rentals 4 x R250 | **Reproduced** (same, plus ERP tags agree 1:1) |
| P2 2023 batch R13,276.64 | **Reproduced** (same; the skill also surfaces the DUPLICATE alternative for 23445 vs invoice 19400) |
| P3 "8 remaining payments, R56,477.08, treat as customer credit" | **Different.** The skill's explanation tests split them: 38270 + 39144 are a **pool** against 42614/42875/43287 (short R90.02) and 42636 is **payment + credit note 12956 vs invoice 44730**. Only **5** payments (R40,442.35) remain, not 8 (R56,477.08). Of the 5, **4 are DUPLICATE** candidates (R30,792.79) and 1 is CREDIT/UNKNOWN (35877) |
| P4 "Journal 476 vs 44844" | **Reproduced and sharpened**: the REVERSAL test finds both 44844 and 36512; chronology (journal before 36512) leaves only 44844 |
| Credit position | Earlier: gas lane "about R16.6k" credit (R56,477.08 payments vs R39,847.89 LPG invoices, which ignored Journal 476 and Bank XFer 7473). Now: gas lane -R8,977.56 after P1 to P4 (PROVEN), because the pool and the journal are accounted for |

So the skill does not reproduce my earlier 8-payment credit; it finds a more accurate (smaller) one. The difference came from steps the skill implied but did not specify (pool search, CN on the payment side, ERP tags as corroboration).

**(b) Unclear steps / no value**
- Section 3 rung 5 "pattern" added no value here (ASSUMED at best; COF001 pays each invoice 3 to 6 days after delivery, which only says the duplicates are anomalies).
- "Record the matcher version and as-at": useful, but the projection's `generatedAt` (10-16) pre-dates the 10-18 trial and says nothing about whether the ledger file is current; say "also record file sha and D21 status".
- Section 1 is fine but does not tell you the matcher has **five** buckets, not four (`otherUntied`); easy to omit a journal and get the residual wrong.
- Section 5 requires a dry-run command for every question, but two of the proposals (P5 journal pairing, P6 customer credit) have **no valid `approve_tie.mjs` form**. The skill should say so.
- The mailbox check in section 6 reads the operator's mail; the skill should say how much to open (I read metadata only) and that a missing contact stops the draft.

**(c) What I did by hand that should be a shared script**
- *Bounded exact-sum search.* Done in `untied_payment_search.mjs` (committed). Wanted in shared form: inputs = `data/v5_projection.json`, `data/projection_matches.json`, K, tolerance, **date window** (e.g. invoices within N days of the payment, default 120), allowed side items (**credit notes and journals on the payment side**, **pool mode** with a shortfall allowance); outputs = minimal structures collapsed by equal amounts (interchangeable items as a multiset, so 4 x R250 is one set tie, not 16 hits), each with lane/ADVANCE/DUPLICATE/REVERSAL tags and the `approve_tie` dry-run command.
- *Residual check by bucket and lane.* Wanted: one table of bucket totals before/after the staged proposals that must equal the ERP balance, with `otherUntied` included.
- *ERP tag corroboration.* I summed DETRANS slice tags per invoice and per payment by hand (python). Wanted: a read-only report "ERP tags vs staged proposals: agree / contradict / no tag" that never feeds the matcher.

**(d) Missing from the skill**
1. **ERP tags already in hand** (DETRANS, delivered DEBENQ files): the skill forbids requesting allocation detail but never says how to use tags already on file. They were decisive for the pool (38270/39144) and 42636. Suggest a rung 4b: "ERP tag, corroboration only; a tag that contradicts the structure is a flag, an agreeing tag does not raise confidence above ASSUMED".
2. **Pool / short-pay structures** (payments vs invoices with a small shortfall) and **payment + credit note vs invoice**.
3. **Date-window plausibility** for exact-sum hits (at tolerance 0.05, 9 of 11 structures are cross-year coincidences).
4. **Chronology for REVERSAL** (journal must follow the payment).
5. **Tool limits**: `approve_tie.mjs` cannot record a payment+journal pair or a pure customer-credit; `--deposits` is how a payment in the LPG lane ties to CYL invoices; `part_payment` needs `--partial` to be a non-settled invoice.
6. **Late-posted receipts** (group A / COF002 CURRENT-only receipts): out-of-order documents distort file-order balances; classify a "LATE_POSTED" flag using document date vs file position.
7. A line on **who may approve** each class (e.g. DUPLICATE as customer credit vs refund).
8. Cross-posting: a standard check list (bank line, ERP header facts, sibling account's open invoices) and a pointer to the sibling-account analysis.

**(e) Where the skill was wrong or too coarse**
- Class **LANE**: defined as "equal sums sit on CYL". Correct for the rentals; for 42636 the lane crossing needs a **credit note** on the CYL side, which the definition does not cover.
- Class **ADVANCE**: 23445 is an ADVANCE only within the P2 structure; alone it is also a DUPLICATE of 19400's amount. The classes are not mutually exclusive; the table needs a primary and an alternative column (as used above).
- Class **DUPLICATE**: "equals an invoice already settled by another payment" over-flags: 38270 equals invoice 41930's amount by coincidence of the pool (the ERP split sums to the same R9,070.63); a DUPLICATE flag needs the pool test first.
- Class **REVERSAL**: "same amount, opposite sign" without direction/chronology flags 36512 wrongly.
- **CREDIT**: defined as "no open invoice can absorb it". That is not decidable per payment; it is a lane-level residual. Better: "CREDIT = lane in credit after all structures".
- Section 5 says "the remaining amount must reconcile to the lane balance": true only if `otherUntied` rows and tie nets are included; otherwise the residual is wrong by the journal.
- Hard rule 4: "Arithmetic on the committed projection is PROVEN" is true only when the script that did it is committed; scratch arithmetic is ASSERTED. (This trial committed its script.)

### 8. Trial notes (text block for the operator to paste into the skill's section 8; skill file NOT edited)

> **2026-10-18, COF001 trial (analyst session `claude/cof001-analysis`).** (1) Added value: classification table, dry-run staging, residual check. (2) Reproduced P1 (rentals) and P2 (2023 batch) exactly; the earlier "8-payment credit" shrank to 5 payments (R40,442.35) once a pool (38270 + 39144 vs 42614/42875/43287, short R90.02) and payment + credit note vs invoice (42636 + CN 12956 vs 44730) were found. (3) Unclear/no value: pattern rung; mailbox step lacks scope; matcher has a fifth bucket (`otherUntied`). (4) Do by script, not by hand: bounded search with date window, credit notes/journals on the payment side, pool mode with shortfall, interchangeable-amount collapse; residual-by-bucket table; ERP-tag corroboration report. (5) Missing: rung for ERP tags already in hand (corroboration only); pool and CN structures; REVERSAL chronology; `approve_tie` cannot stage payment+journal or pure customer credit; late-posted receipts; cross-posting checklist. (6) Wrong/coarse: LANE needs CN; ADVANCE/DUPLICATE are alternatives not exclusives; DUPLICATE must run after the pool test; REVERSAL needs direction; CREDIT is a lane residual. (7) At tolerance 0.05 nine of eleven exact-sum hits were cross-year coincidences; always apply a date window.
