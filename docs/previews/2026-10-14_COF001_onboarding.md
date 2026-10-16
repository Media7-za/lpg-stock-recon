# COF001 (COFFEEBERRY-CASCADES) — onboarding preview, 2026-10-14

**Analyst session, branch `claude/cof001-analysis`. INTERNAL. No customer release, no statement sent, no locks or rulings taken.**

## 1. Verdict

| Item | Status |
| :-- | :-- |
| ERP balance R7,958.38 | **ASSERTED** (`analysis/debtors/shared/data/portfolio_candidates.csv`, row COF001). **Not proven.** |
| Variance R0.00 | **Not reached. Not computable**: no per-account ERP export. |
| Blocker | Missing dated `COF001_<YYYY-MM-DD>.TXT` (D21 intake). Request drafted: `docs/requests/2026-10-14_cof001_erp_export_request.md` (not posted; Linear untouched). |
| DB connector | Not used. Not authorised this session. |

## 2. Step 0 — input search

- `analysis/debtors/COF001/`: did not exist. After `git fetch origin`, no file or path containing `COF001` exists on any remote branch (checked every `origin/*` tree). **PROVEN** (git ls-tree scan).
- Shared dumps, filtered for ACCNO `COF001` (provisional, **ASSUMED**, not filed under `raw/`, not a D21 input):

| Source | COF001 rows | Window | Sum of AMOUNT | Usable for proof? |
| :-- | --: | :-- | --: | :-- |
| `ERP RAW DATA/DETRANS.TXT` | 163 | 2025-03-05 to 2026-02-18 | R14,115.56 (ASSUMED) | No: no B/F, no running balance, stops 18 Feb 2026 |
| `analysis/debtors/shared/raw/april_dump.TXT` | 8 | 2026-04-02 to 2026-04-21 | R0.00 (ASSUMED) | No: 8 rows only |
| `ERP RAW DATA/CURRENT, 2023, 2024, STTRANS` | stock lines | 2022 to 2025 | n/a | No: stock lines, no payments or balances |

- The sum of DETRANS rows is a flow, not a balance: there is no B/F before 2025-03-05 and no data for 19 Feb to 1 Apr 2026 or 22 Apr to Oct 2026. The one DETRANS row flagged unpaid plus the one unpaid payment net R6,552.28 (ASSUMED); this does **not** equal R7,958.38 and no inference is drawn from the difference (R1,406.10) because the later months are missing.
- DETRANS shows 3 `Bank UD` rows and several `Alloc` pairs. UD handling must be checked against the header UD figure once the real export arrives (D21).

## 3. Scaffold (done)

- `analysis/debtors/COF001/project.json`: `status active`, `reconState pending`; `totalOutstanding` 7958.38 is ASSERTED (carried from the portfolio list) and is noted as such in `collections.notes`.
- `analysis/debtors/COF001/config/statement_v5.json`: from `shared/templates/statement_v5_config.template.json` with the current portfolio `skuRates` (14.1 632.5, 19.1 690, 9.1 517.5, D.1 1207.5, S.1 1207.5; ratified option B, `docs/previews/2026-10-13_sku_rates_portfolio_preview.md`). `combinedBf`, `periodStart` and `txtPath` are deliberately **null / placeholder** with `awaitingExport: true`; `cylOpeningFinancial` and `cylOpeningQty` are template zeros that are **unverified** until the export arrives. Nothing was invented.
- `npm run debtors:sync`: COF001 only produces D19 WARNs. The run still fails overall because of pre-existing errors in DON001, JAY000, RED001, TWK002 and others (it fails identically without COF001). **PROVEN** (run with and without the COF001 folder).
- Not run, because they need the export: `reconcile_debtor_v5_from_txt.mjs`, `debtors:ingest-check`, `v5_projection`, open-items renderers.

## 4. Questions for the operator (none is a ruling by this session)

1. ~~Post the export request~~ Done by the PM session as Linear ADM-135 (reported by message; not verified here). Expected at `analysis/debtors/COF001/raw/COF001_<date>.TXT` on `claude/payment-matching-mechanisms-4h34be` or in the ADM-79 Drive folder.
2. **COF001 and COF002**: kept separate, not netted. If the operator wants them handled as a payer family, that needs an explicit ruling (D20 `payerGroup`); none is assumed. COF002 is balance -R5,267.66, deferred (ASSERTED, same CSV).
3. When the export arrives, its cylinder opening (B/F split between LPG and CYL deposits) will need operator confirmation if it cannot be derived from the first rows (as with TAN001).

## 5. Tripwires
Reopen if: a dated COF001 export arrives; the portfolio balance moves from R7,958.38; COF002 balance changes sign or is activated; an operator ruling groups COF001 with COF002.

## 6. Next steps once the export arrives
Verify per D21 (chain, header CURRENT BALANCE, TOTAL TRANSACTIONS, UD gap) -> file as `raw/COF001_<date>.TXT` -> set `txtPath`, `combinedBf`, `periodStart` from the header (cite lines in `bfSourceNote`) -> `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor COF001` -> `npm run debtors:ingest-check -- --debtor COF001` (needs DB authorisation) -> review variance and open items.

## 7. Provisional extract (added after PM message)
`analysis/debtors/COF001/data/provisional/COF001_shared_dump_extract_ASSUMED.csv` (171 rows, filtered only, ASSUMED; see README there). No first-pass generator run was possible without inventing a B/F, so none was run.

---

## 8. UPDATE 2026-10-16 — generators run on the operator-directed ERP files (supersedes the section 1 verdict where it differs)

**Inputs (operator instruction 2026-10-16: ERP TXT files from `claude/eager-mccarthy-vsfs1u` only):** `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` (481 rows, B/F 0.00 at 2022-03-01, last row 2026-09-09; sha256 prefix `af6fa321fa8c`). D21 status: chain 0 breaks, last balance = header CURRENT BALANCE = TOTAL TRANSACTIONS = -R16,256.52, UD 0.00 (**PROVEN**, ad hoc intake script, session scratch). **Exceptions:** file is undated and carries `EXCLUDE: ALLOCATION DETAIL`; interim use by operator instruction until the dated ADM-135 export replaces it. DB: connector replay, operator-authorised 2026-10-16 (read-only SELECT, md5-verified captures in `analysis/debtors/COF001/data/db_replay/2026-10-16/`), output is **connector-sourced**.

| Result | Value | Tag / artifact |
| :-- | --: | :-- |
| ERP CURRENT BALANCE (customer in credit) | -R16,256.52 | PROVEN `raw/COF001_COMBINED.TXT` header |
| Portfolio list figure | R7,958.38 | ASSERTED, **does not match**; equals the intermediate running balance on 2026-07-08 (ASSUMED explanation) |
| v5 Part 1A LPG / Part 1B CYL close | -R16,442.52 / +R186.00 | PROVEN `reports/COF001_Statement_Account_v5.md` |
| ERP variance (1A+1B vs header) | **R0.00** | PROVEN `reconcile_debtor_v5_from_txt.mjs` |
| Sub-ledger tie variance | R0.00 | PROVEN same run |
| Open-items proof (B/F + open rows + tie rounding R0.02 = ERP) | **R0.00, HOLDS** (LPG -R10,405.02; CYL -R5,851.50) | PROVEN `reports/COF001_Open_Items_v5.md` |
| Matcher | 219 ties (205 confirmed, 14 probable); 149 payments, **14 unallocated** | `data/projection_matches.json` |
| Ingest coverage | **partial**: 7 gaps (payments 24732, 30219, 29646, 29696 `MISSING_HEADER`; Bank UD 32615, 40294, 42621 `DOCUMENT_TYPE_UNRESOLVED`); custody, SKU and allocation **BLOCKED** | `reports/COF001_INGEST_COVERAGE_2026-10-16.md` |
| Output status | **REVIEW ONLY** (ingest coverage partial); not a release copy | |
| Custody exposure at option B rates | -R8,280.00 (not gated, ASSERTED) | statement Part 2 |

So the ERP balance **is proven at variance R0.00 on this file**, but the statement is review-only, the matcher leaves many unmatched items, and nothing here is a customer release. **No release, no send, `reconState` left `pending`, no locks.**

### Ruling pack (questions for the operator; nothing decided here)
- **Q1 (balance of record).** Portfolio list R7,958.38 vs ledger -R16,256.52 at 2026-09-09. Which is current? Either confirm the ledger or have the dated ADM-135 export settle it. Tripwire: dated export with a different last balance.
- **Q2 (credit note 15558, 2026-08-26, -R18,700.33, DN#22890-EMPTY).** Posted against DN#22890 whose invoices total R3,284.35 (LPG) + R4,657.50 (EMPTY invoices 52750/52751); split 1A -R3,002.83, 1B -R15,697.50 (7x 9.1 and 10x S.1 returned in the DB lines). Followed by Bank XFer +R3,002.33 on 2026-09-09 (STAT 130). Is it a valid posting, or an ERP error to be reversed? Drives most of the credit position. Not for the analyst to rule.
- **Q3 (unallocated payments, R-67,751.39 across 15 items in the matcher residual).** Needs allocation detail (ADM-135 asks for it) before ruling; list in `projection_matches.json` `unallocatedPayments`.
- **Q4 (7 ingest gaps).** Re-ingest or ratified exception? Until then custody/SKU/allocation conclusions stay blocked.
- **Q5 (14 probable ties, Appendix A of the open-items report).** Approve or reject; analyst did not approve any.
- **Q6 (D21 interim exception).** Accept the undated, allocation-detail-excluded files until ADM-135 lands?
- **Q7 (COF001/COF002).** Still separate, not netted; payer-family ruling only if you want one.

---

## 9. Operator rulings 2026-10-16 (recorded in `config/operator_rulings.json` and `config/payment_pattern_overrides.json`)

| Q | Ruling | Effect |
| :-- | :-- | :-- |
| Q1 | -R16,256.52 is the correct balance | Balance of record; portfolio R7,958.38 retired |
| Q2 | Credit note 15558 is NOT valid; ERP agent is fixing it | Open: await corrected dated export; nothing changed in the repo |
| Q3 | Interim D21 exception accepted | Undated files stay in use until ADM-135 lands |
| Q5 | "Accept": 14 probable ties approved | Locks L0001 to L0014; matcher now 219 confirmed, 0 probable; proof still HOLDS (R-16,256.52, variance R0.00) |
| Q6 | No payer family | COF001 and COF002 stay separate |
| Q4 | **Not decided** | Explanation below |

Rebuilt after the locks: `data/projection_matches.json`, `reports/COF001_Open_Items_v5.md`, customer preview (now 50 open rows, was 79). Still `reviewOnly` (ingest coverage partial). The 14 unallocated payments (R-67,751.39) are unchanged.

### Q4 explained: the 7 ingest gaps
The database (a copy of ERP exports) holds a header row per document. For these 7 documents the statement TXT has the row but the database has no header, so the checker blocks custody, SKU and allocation conclusions. The money balance is unaffected (it comes from the TXT).

| Group | Documents | What it is | Amounts (PROVEN from the TXT) |
| :-- | :-- | :-- | :-- |
| A. Payments missing from the database | 24732 (2023-09-29), 30219 (2024-03-12), 29646 (2024-03-20), 29696 (2024-03-25) | Real customer payments (STAT 95, 101, 101, 101) with no DB header | -R6,625.90, -R7,628.30, -R8,390.33, -R8,486.48 = **-R31,131.01** |
| B. Bank UD documents | 32615 (2024-08-03), 40294 (2025-07-22), 42621 (2025-12-09) | A Bank UD (undeposited payment) posting paired with a Payment of the same number and amount on the same day; each pair nets R0.00 | +R8,512.36, +R6,446.60, +R7,360.82 against equal payments |

- **Option 1, re-ingest.** Ask the data/ERP agent to re-run the HEADERS sync so the DB carries these 7 headers. For group A this is the real fix: those 4 payments are cash that allocation cannot use until the database sees them. For group B the checker cannot classify the type `Bank UD` at all (`DOCUMENT_TYPE_UNRESOLVED`), so a re-sync alone may not clear it; that is a rule gap in the shared checker, not missing data.
- **Option 2, ratified exception.** The operator records the documents in `config/ingest_exceptions.json` with a reason; the checker then counts them as `RATIFIED_EXCEPTION` and unblocks the lane. It is a conclusion the operator signs (the DB lacks these but the TXT is the authority), not an inference of mine. Reasonable for group B (zero net, no cylinder lines). Weaker for group A, because allocation of R31,131.01 of payments would then proceed on the TXT alone, with no DB header.
- **Analyst recommendation (not a ruling):** re-ingest group A (4 payments); for group B choose between an exception and a checker fix (a portfolio-wide change to `ingest_coverage_classifier.mjs` is doctrine-adjacent, so it would be staged `PROPOSED — NOT RATIFIED`, not done here). Either way custody/SKU/allocation stay blocked until you choose, and the corrected ADM-135 export may change these documents anyway, so waiting for it before ratifying anything is also sensible.
- Tripwires for any exception: the DB later receives these headers; the dated export shows a different amount or type for any of the 7.

---

## 10. Q4 decision and ERP fix evidence (2026-10-16, later)

- **Q4 operator ruling:** "Re-ingest group A, exception for group B." Group B (Bank UD 32615, 40294, 42621) recorded as exceptions ING-COF001-001 to 003 in `config/ingest_exceptions.json` (SA0001 precedent). Group A (payments 24732, 30219, 29646, 29696; -R31,131.01) needs a data re-ingest that the analyst cannot do; request drafted in `docs/requests/2026-10-16_cof001_reingest_request.md` (not posted). Group A stays a gap, so custody/SKU/allocation stay blocked and outputs stay review-only until the re-ingest.
- **Upload `COF001.TXT` (ERP fix, Q2).** Filed unchanged as `raw/Enquiry/COF001_UNDATED_post_fix_window.TXT`. Not used as the statement TXT: undated, not full history (B/F -R1,076.02 = balance after payment 45480 on 2026-07-31, ASSUMED from the main ledger), sorted by document number. Checks (PROVEN, ad hoc): running-balance chain 0 breaks; last balance = header = TOTAL TRANSACTIONS = -R16,256.52; UD 0.00; the 8 documents it shares with `COF001_COMBINED.TXT` have identical dates and amounts; 3 new documents net R0.00: invoice 53619 (+R18,700.33) reverses credit note 15558 (-R18,700.33), and credit notes 15803 (-R3,002.83, DN#22890) and 15804 (-R15,697.50, DN#22890) re-issue it as the two split lines. **Balance unchanged at -R16,256.52.** Credit note 15558 is still in the ledger (reversed, not deleted).
- **Open for the operator:** (a) is the reversal-plus-reissue what the ERP agent intended as the Q2 fix? (b) the dated full-history export (ADM-135) is still needed to rebuild, because the generators need full history; I will not splice the window into the old file.

---

## 11. Correction and the 14 unallocated payments (2026-10-16, after operator feedback)

**Correction (amends sections 8 Q3 and 10, and the handoff):** I wrongly listed "allocation detail from the ERP" as something the 14 unallocated payments were waiting for. ERP allocations are unreliable (business_rules §3; `debenq_open_invoices.mjs`); reconstructing allocation from ledger evidence is the matcher's job and the operator's ruling. The dated full-history export (ADM-135) is still wanted to replace the undated interim files, but allocation detail is **not** a blocker for these payments. The "EXCLUDE: ALLOCATION DETAIL" header stays an accepted D21 exception.

**Evidence search (ad hoc exact-sum search over the matcher's residual; PROVEN arithmetic on `data/v5_projection.json` and `data/projection_matches.json`).** Subsets of up to 4 unallocated payments against up to 4 open invoices, cent-exact. Only two structures exist; nothing else sums:

| Proposal | Payments | Open invoices | Amount | Basis |
| :-- | :-- | :-- | --: | :-- |
| **P1** rentals | 37628, 37629, 37630, 37631 (2025-03-19, STAT:113, R250 each) | 41576, 41577, 41578, 41579 (2025-03-18, cylinder rental D/N 11836 FEB/MAR, 12851 FEB/MARCH) | R1,000.00 | four equal payments the day after four equal invoices; the four are interchangeable, so it is a set tie, not 1:1. The matcher leaves it open because payments post to the LPG lane and the invoices are CYL lane |
| **P2** 2023 batch | 23445 (2023-05-18, STAT:91, R8,827.62) + 23395 (2023-08-14, STAT:94, R4,449.02) | 22252 (2023-07-12, R7,596.15) + 23258 (2023-08-08, R5,680.49) | R13,276.64 | exact batch sum; 23445 predates invoice 22252 by two months, so it would be an advance payment |

Both are accepted by `approve_tie.mjs` in `--dry-run` (P1 via `--payment ... --deposits ...`, P2 via `--payment ... --invoices ...`, treatment `exact`, would be L0015 each). **Nothing applied**: they need your ruling. Tripwires if approved: a dated export or remittance tagging any of these to different documents.

**What is left after P1 and P2 (not resolvable by exact sums):**

| Item | Detail |
| :-- | :-- |
| 8 payments | 44844 R7,224.65; 29492 R7,628.30; 38270 R9,070.63; 39144 R6,446.60; 35877 R9,649.56; 36509 R8,715.19; 36512 R7,224.65; 42636 R517.50 = **R56,477.08** |
| Open LPG invoices | 39311, 41238, 41562, 42614, 42875, 43287 = R39,847.89 |
| Result | Payments exceed open LPG invoices by about R16.6k (R56,477.08 - R39,847.89 = R16,629.19), i.e. the account is in credit on the gas lane. This is consistent with the -R16.4k gas-lane close and is not a matcher failure |

Observations for review (not conclusions): payments 44844 and 36512 (R7,224.65) and 29492 (R7,628.30) each equal an invoice that is already settled by another payment (38158/38734/38735 and 30276); an ERP Journal 476 (+R7,224.65, 2024-12-11) offsets one of them; payment 30219 (R7,628.30) is one of the group A payments missing from the database. These are candidates for duplicate or advance payments, treated as customer credit (`customer_credit`) unless you say otherwise.

**Questions for the operator**
- **P1:** approve the four rental payments against the four rental invoices (set tie)?
- **P2:** approve the 2023 batch tie?
- **P3:** for the remaining 8 payments (R56,477.08), approve treating them as `customer_credit` (account in credit on the gas lane) or instruct otherwise per payment?
- **P4:** Journal 476 (+R7,224.65, 2024-12-11): is it a reversal of payment 44844?
