# TWK AGRI consolidated customer statement: PREVIEW (draft, not for release)

**Date:** 2026-10-10. **Status:** DRAFT PREVIEW. PROPOSED, NOT RATIFIED where a ruling is pending (below). Nothing released, no `--snapshot`, no lock recorded, no tie approved, no period closed, no matcher rule or doctrine changed, no generated CSV edited.
**Authority:** one consolidated customer statement, children reconciled as a family (operator ruling ADM-94 Q1/Q15; `analysis/debtors/TWK002/config/statement_v5.json` `payerGroup`).
**Channel:** no database access in this session. All figures come from the committed projections (which are connector-sourced db_replay captures, see `docs/previews/2026-10-10_TWK_family_children.md`) and the ERP TXT exports.

## 1. What was built

| Piece | Where |
| :--- | :--- |
| Family builder, customer renderer, internal renderer (pure, config-driven, no account names) | `analysis/debtors/shared/scripts/family_statement.mjs` |
| Generator integration (`customerLayout: open_items` + `consolidatedFamily: true`) | `analysis/debtors/shared/scripts/generate_statement_of_account.mjs` |
| Shared customer-summary helper; `pendingKind` on listed rows | `analysis/debtors/shared/scripts/open_items.mjs` |
| Tests (8 new) | `analysis/debtors/shared/scripts/family_statement.test.mjs` |
| TWK002 config | `analysis/debtors/TWK002/config/statement_of_account.json` |

**How it works.** The family is the `payerGroup` of the parent's `statement_v5.json` (parent plus `children[{code, txtPath}]`). For every member the generator reads its TXT, `data/v5_projection.json` and `data/projection_matches.json`, builds the customer open-items view, and renders one list with an **Account** column and a summary by account.

**Safeguards (abort, nothing written; `--force` does not override them):**
1. Each member's TXT sha256 equals the fingerprint of its projection and of its matcher output.
2. Each projection was built for the ERP header in its TXT.
3. Each member's rebuild proof holds and there are no unresolved lock conflicts.
4. Each member: listed open items + named lines = its ERP header (to the cent).
5. Family amount due = sum of the member ERP headers.

**Draft rule.** If any member's matcher output is `reviewOnly`, the output is titled and bannered "DRAFT PREVIEW. NOT FOR RELEASE", is written as `TWK002_Statement_of_Account_Consolidated_DRAFT_PREVIEW.md` (never the release file name), and `--pdf` is refused. The reasons are shown only in the internal view and on the console. `--snapshot` is refused for a family statement in all cases (archiving the children's inputs is not designed, and release is the operator's decision).

**Config changes to `TWK002/config/statement_of_account.json` (append-only):** `primaryTxt` now `TWK002_2026-10-08.TXT` (the file the projection is built from); the previous value and its comment are kept in `_comment_primaryTxt` marked SUPERSEDED; `_comment_siteTxts` is marked SUPERSEDED in place and `siteTxts` stays `{}` (children are listed through `payerGroup`, so they are not counted twice); added `customerLayout: "open_items"`, `consolidatedFamily: true` and `_comment_consolidatedFamily`.

## 2. Run (TWK002, no `--snapshot`)

`node analysis/debtors/shared/scripts/generate_statement_of_account.mjs --debtor TWK002`

Outputs (derived; regenerate with the script, do not edit):
* `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account_Consolidated_DRAFT_PREVIEW.md` (customer-facing layout, draft)
* `analysis/debtors/TWK002/reports/TWK002_Family_Internal_Reconciliation.md` (internal: per-account open rows, reconciliation to each ERP header, probable ties, operator notes)

## 3. Numbers

| Account | ERP header (R) | Open items listed (R) | Other lines (R) | Statement balance (R) | Variance | Review-only | Tag |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- | :--- |
| TWK002 | 54,136.19 | 46,051.52 (10 rows) | 8,084.67 | 54,136.19 | 0.00 | yes (ingest partial) | PROVEN: `TWK002/raw/TWK002_2026-10-08.TXT` header; `TWK002/data/projection_matches.json` proof holds |
| TWK003 | -300.00 | -300.00 (9 rows) | 0.00 | -300.00 | 0.00 | no | PROVEN: `TWK002/raw/TWK003_2026-10-10.TXT` line 4; `TWK003/data/projection_matches.json` |
| TWK004 | 61,000.00 | 61,000.00 (5 rows) | 0.00 | 61,000.00 | 0.00 | **yes** (ingest partial) | PROVEN: `TWK002/raw/TWK004_2026-10-10.TXT` line 4; `TWK004/data/projection_matches.json` |
| **Family** | **114,836.19** | **106,751.52** (24 rows) | **8,084.67** | **114,836.19** | **0.00** | draft | PROVEN arithmetic: 54,136.19 - 300.00 + 61,000.00 |

* **Amount due on the draft: R114,836.19** = sum of the three ERP headers (PROVEN; all three TXT fingerprints match their projections, `TWK002_Family_Internal_Reconciliation.md` sources table).
* **TWK002 other lines R8,084.67** = opening B/F 38,791.27 - payments against opening balance 35,922.77 + pre-window journals 9,894.01 - 4,677.84 (PROVEN, `TWK002/config/statement_v5.json` `namedResiduals`; operator ruling ADM-94 Q8'). On the customer copy the two journal groups read as one line "Journal adjustments brought forward" (generic wording; the internal bridge ids are not shown to the customer).
* **TWK003 shows 9 rows netting R-300.00** because the matcher left payment 43500 (R-38,501.31) unallocated and only PROBABLE-tied 47880 / CN 13966 (kept listed with footnote 2). The rows are the ERP's, not an allocation (PROVEN, `TWK003/data/projection_matches.json`). Which invoices payment 43500 settles is not decided here.
* **TWK004:** invoice 53535 R32,500.00 and CN 15781 R-32,500.00 are listed with footnote 2 (PROBABLE CN_DN_PAIR T0002, not approved); **invoice 53536 R30,000.00 remains open** (PROVEN arithmetic; whether 53536 replaces 53535 is `unverified`).
* Family tie to documents, for reference: 106,751.52 + 8,084.67 = 114,836.19 (PROVEN, as in `docs/previews/2026-10-10_TWK_family_children.md` B3).
* **Customer wording:** "Accounts: TWK002, TWK003, TWK004 (consolidated statement)", Account column, footnotes: 1 payment received, allocation being confirmed; 2 credit note issued against this invoice, matching being confirmed; "A negative amount is a credit in your favour; it is included in the amount due above." No internal terms (review-only, ties, ADM numbers) appear on the customer copy.

## 4. What blocks release

1. **TWK004 documents missing from the DB** (ASSERTED, `TWK004/reports/TWK004_INGEST_COVERAGE_2026-10-10.md`): invoices 53535, 53536 and CN 15781 are in the TXT but not in the DB (last sync 2026-10-08), so TWK004 is review-only and the whole family output is a DRAFT. Needs the DB sync (ADM-93), regeneration of the TWK004 projection and matches, then rerun. Approving T0002 (53535 / CN 15781) is a separate operator decision.
2. **TWK002 is also review-only** (ingest partial): CN 15775 and invoice 53507 (DN#23843, 08 Oct) are not in the DB (2 gaps, `TWK002/reports/TWK002_INGEST_COVERAGE_2026-10-08.md`; documents identified in `docs/previews/2026-10-10_TWK_family_children.md` B2, ASSERTED). The generator reports this as a draft reason for TWK002 too.
3. **CN 15775 lane ruling pending.** It is shown as it is: R-7,935.00 in the gas lane (HEADER_FALLBACK), amount unchanged. The operator note (ADM-94 Q5, CYL) is shown on the internal view only. Not decided here. Reopen when DB lines arrive and any part lands in LPG.
4. **TWK003 credit R-300.00 treatment pending** (customer credit to carry vs price correction vs refund). Shown as it is: the statement nets it into the amount due (R-300.00 within R114,836.19) and says only that a negative amount is a credit in the customer's favour. Whether R100 (invoice 47866) or R115 (CN 13933) was the right price is `unverified`; ASSERTED that it is a price difference.
5. **Release gate not cleared.** `npm run debtors:tag-check -- --debtor TWK002` returns `NOT_DERIVABLE_FROM_TXT (NO_INVOICE_TAGGING_IN_EXPORT)` on the 2026-10-08 export (it did before the config change too, on the old file), and it reads the parent TXT only. The open_items layout does not rely on invoice tags and the generator warns instead of aborting on that gate, as for the existing single-account layout, but whether a family release may proceed on that verdict is an operator call.
6. Snapshotting a family statement is deliberately unsupported (see section 1); release needs an operator decision on how the children's inputs are archived.

## 5. Tripwires (reopen if)

* Any member TXT is re-exported (fingerprint changes: the generator aborts until the projection and matches are rebuilt).
* The DB sync brings 53535 / 53536 / CN 15781 or CN 15775 / 53507, or the DB header ratio defect (credit notes 1.1304 times the TXT, see family children preview) shows up on lines.
* A remittance or ERP correction touches 47866 / CN 13933, or a credit/refund of the R300.00 is posted.
* The operator rules on CN 15775, the R300.00 treatment, or approves T0001 (TWK003) / T0002 (TWK004).

## 6. Verification

* `node --test analysis/debtors/shared/scripts/*.test.mjs`: 167 pass (159 existing + 8 new in `family_statement.test.mjs`: aggregation with Account column, settled items omitted, per-account tie gate abort, stale fingerprint / lock conflict / projection ERP mismatch abort, reviewOnly child draft marker, no marker when none, negative-balance child R-300.00, credit-note footnote wording). PROVEN, test run output.
* `generate_statement_of_account.mjs --debtor TWK002 --snapshot` aborts with exit 1 and archives nothing (PROVEN, console run; no new folder under `TWK002/snapshots/`).

## 7. Update 2026-10-11/12: connector replay for TWK002 and TWK004 (still a DRAFT)

**Channel:** connector-sourced (db_replay). Read-only SELECTs through the Supabase connector (project `oqhpxnaadahohwkslive`), run unchanged from each `captureSql`, md5 and length verified by `record_capture.mjs`. Captures: `analysis/debtors/TWK002/data/db_replay/2026-10-11/` (6 captures) and `analysis/debtors/TWK004/data/db_replay/2026-10-11/` (5 captures). DB sync as at 2026-10-10 19:22 UTC (headers) / 19:22 UTC (items). One earlier ad-hoc SELECT (not a capture) was used only to see whether the documents had arrived.

| Account | Ingest coverage (artifact) | Matcher | reviewOnly | Closing vs ERP |
| :--- | :--- | :--- | :--- | :--- |
| TWK002 | complete, `CURRENT_COMPLETE`, 0 gaps (`TWK002/reports/TWK002_INGEST_COVERAGE_2026-10-12.md`) | 17 ties, 5 locks applied, 0 conflicts | **false** | R54,136.19 = ERP, HOLDS |
| TWK004 | complete, `STALE_COMPLETE`, 0 gaps (`TWK004/reports/TWK004_INGEST_COVERAGE_2026-10-11.md`; exit 1 is the script's rule for stale freshness) | 3 confirmed / 0 probable | **false** | R61,000.00 = ERP, HOLDS |

PROVEN (script output). What moved:
* **CN 15775 is now a CYL document in the projection** (lines: 19.1 x -4 = R-2,760.00 and 9.1 x -10 = R-5,175.00, all CYL, no LPG line). TWK002 split is now LPG R45,281.19 / CYL R8,855.00 (was 45,971.19 / 8,165.00; difference R690.00 = invoice 53507's 19.1 deposit net of the credit). Total unchanged, R54,136.19. The "reopen if any part lands in LPG" tripwire did not fire. The lane ruling itself is still the operator's to record.
* **Invoice 53507 split** (R14,375.86): CYL R8,625.00 (5 x 19.1, 10 x 9.1) and gas R5,750.86 (5 x 19.4, 10 x 9.4).
* **TWK004's T0002 (53535 / CN 15781) is now a CONFIRMED CN_DN_PAIR by the matcher's own rule** (exact amount, same DN, lines present and equal). That is a matcher result, **not an operator approval and not a lock**. Both documents therefore drop off the customer list; **invoice 53536 (R30,000.00) stays open**. Whether 53536 replaces 53535 (53536 has 10 fewer units of stock 00000401) is `unverified`.
* Customer list now 23 open items (was 24); amount due unchanged at R114,836.19 (PROVEN, `TWK002_Family_Internal_Reconciliation.md`).

**Why it is still a draft.** Neither account is review-only any more, so the review-only rule alone would have dropped the draft marker. Because the five operator decisions are still open, the generator now also reads `familyReleaseHolds` in `TWK002/config/statement_of_account.json` (H1 CN 15775 lane, H2 TWK003 R-300.00 credit, H3 53535/CN 15781 tie and 53536, H4 release gate, H5 TWK004 DB documents, which is cleared in evidence and awaits your confirmation). While any hold is listed the output stays a DRAFT PREVIEW under the draft file name; the operator clears a hold by ruling on it. A test covers this (`operator hold keeps the output a draft...`). 168 tests pass.

Still not done, by design: no lock recorded, no tie approved, no snapshot, no release, tag-check unchanged (`NOT_DERIVABLE_FROM_TXT`), custody view for CN 15775 not yet re-read (the TWK002 custody gate is now ALLOWED; the double-credit check against the R7,590 STAT 123 deposits is still open).

## 8. Update 2026-10-12: CN 15775 lane ruling recorded

The operator confirmed the CYL lane ruling ("yes, record it", main session, 2026-10-12) after the DB lines arrived. Recorded as an appended line on the existing ADM-94 Q5 `rowNotes` entry in `analysis/debtors/TWK002/config/statement_v5.json` (earlier text kept). Basis: CN 15775 is entirely cylinder (PROVEN, replay 2026-10-11) and the double-credit check shows no overlap with the STAT 123 deposits (ASSERTED; `docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md`). Hold `H1_CN15775_LANE` is removed from `familyReleaseHolds`. The statement is **still a DRAFT** on H2 (TWK003 R-300.00 credit), H3 (53535 / CN 15781 tie, 53536), H4 (release gate) and H5 (TWK004 DB documents, cleared in evidence, awaiting confirmation). No lock, tie approval or matcher/doctrine change. Amount due unchanged at R114,836.19.

## 9. Update 2026-10-12: TWK004 53535 / CN 15781 and invoice 53536 ruled

Operator answered "yes" to approving the 53535 / CN 15781 tie and to invoice 53536 replacing 53535. Recorded as a dated `rowNotes` entry on 53536 in `analysis/debtors/TWK004/config/statement_v5.json` (appended; nothing removed). **No lock was recorded:** the matcher already confirms T0002 on its own rule (CONFIRMED CN_DN_PAIR, replay 2026-10-11) and `approve_tie.mjs` refuses confirmed ties by design. Hold `H3_TWK004_TIE` removed. TWK004 projection and matches regenerated from the existing captures (no new queries): 3 confirmed ties, proof HOLDS at R61,000.00, not review-only. Open on TWK004 is unchanged: 52948 R9,000.00, 53113 R22,000.00, 53536 R30,000.00. Why 53536 is R2,500.00 lower than 53535 (10 x R250.00 of stock 00000401) is `unverified`. Amount due unchanged at R114,836.19. **Still a DRAFT** on H2 (TWK003 R-300.00 credit), H4 (release gate) and H5 (TWK004 DB documents, cleared in evidence, awaiting confirmation).

## 10. Update 2026-10-12: hold H5 removed

Operator confirmed ("yes, remove H5") after a live read-only DB check: TWK004 invoices 52948, 53113, 53535, 53536 and CN 15781 are in the DB with headers and line counts matching the TXT (last sync 2026-10-10 19:22 UTC; replay 2026-10-11 ingest coverage complete, 0 gaps). `H5_TWK004_DB_DOCS` is removed from `familyReleaseHolds`. **Still a DRAFT** on `H2_TWK003_CREDIT` (R-300.00 credit treatment) and `H4_RELEASE_GATE` (`debtors:tag-check` returns `NOT_DERIVABLE_FROM_TXT`). Amount due unchanged at R114,836.19.

## 11. Update 2026-10-12: TWK003 R-300.00 ruled an ERP price typo

Operator ruling (main session): the R-300.00 is an ERP agent typo on the unit price of CN 13933 (R115.00 instead of the original R100.00). The ERP agent will reverse it: invoice at the credit-note price (20 x R115.00 = R2,300.00) and credit at the original (20 x R100.00 = R2,000.00), which takes TWK003 to R0.00. So it is **not** a customer credit and not a refund (this supersedes the open "carry as a credit" options in section 4 item 4). Mechanics are the agent's reading of the operator's words, to be confirmed against the posted documents. Recorded as dated `rowNotes` on 47866 and CN 13933 in `analysis/debtors/TWK003/config/statement_v5.json` (TWK003 projection rebuilt from the existing 2026-10-10 captures: proof HOLDS at R-300.00). No lock.

**The correction has not posted**, so the ERP balance and this draft still show R-300.00. Hold `H2_TWK003_CREDIT` is replaced by `H2_TWK003_ERP_CORRECTION`: the statement stays a DRAFT until the correcting documents post and TWK003 is re-exported. When they do, TWK003 should be R0.00 and the family amount due should rise by R300.00, from R114,836.19 to **R115,136.19** (ASSUMED until the posted amounts are seen). Still a DRAFT also on `H4_RELEASE_GATE`.

## 12. Update 2026-10-12: release with the TWK003 R-300.00 quarantined (supersedes the hold in section 11)

Operator ruling (main session): **release with the R-300.00 quarantined; do not show it on the customer statement.** Implemented as a config-declared quarantine, not a silent exclusion: `customerQuarantine` `Q1_PRICE_TYPO` in `analysis/debtors/TWK003/config/statement_v5.json` names invoice 47866 and CN 13933 and the amount they must net to (R-300.00). The generator takes those two rows off the customer list, shows nothing about them on the customer copy, and reports them on the internal view (`TWK002_Family_Internal_Reconciliation.md`). The generator **aborts** if the two rows ever stop netting to exactly R-300.00 (for example after the ERP correction posts), so the ruling is reviewed then. Hold `H2_TWK003_ERP_CORRECTION` is removed.

Effect (PROVEN, generator output, tests 171/171): customer amount due **R115,136.19** = sum of the ERP balances R114,836.19 less the quarantined R-300.00. TWK003 shows R0.00 with its listed rows netting nil. The customer amount due therefore deliberately differs from the ERP header sum by R300.00; the internal view carries the reconciling line, and R115,136.19 is also the figure expected once the ERP reversal posts (ASSUMED until seen).

**Still a DRAFT** on one hold: `H4_RELEASE_GATE` (`debtors:tag-check` returns `NOT_DERIVABLE_FROM_TXT`). Releasing remains the operator's step via `generate_statement_of_account.mjs` plus `npm run debtors:tag-check`; `--snapshot` for a family statement is still unsupported, and nothing was released or snapshotted here.

## 13. Update 2026-10-12: payment 43500 allocated on TWK003 (lock L0001)

Operator approval ("approve the allocation of payment 43500"), recorded with `approve_tie.mjs` as **lock L0001** in `analysis/debtors/TWK003/config/payment_pattern_overrides.json` (`projectionLocks`; treatment `exact`, net R0.00): payment 43500 (TWK003 slice R-38,501.31) settles invoices 46857, 47076, 47523 (R11,000.44 each) and 47991 (R5,499.99). The STAT 123 advice names 47880 for the R5,499.99; 47880 is reversed by CN 13966 (same DN#21166), so the cash is applied to 47991, the only open invoice of that amount. Same cash either way (ASSERTED, `docs/previews/2026-10-10_TWK_family_children.md` B1). 47880 / CN 13966 stays a separate PROBABLE tie, **not approved**. Undo with `close_period.mjs --debtor TWK003 --void-lock L0001 --reason ...` (not run). TWK003 projection and matches rebuilt from the existing 2026-10-10 captures: proof HOLDS at R-300.00, 1 lock applied, 0 conflicts, not review-only.

Effect on the draft (PROVEN, generator output): the three paid invoices and the unallocated payment no longer appear. TWK003 on the customer copy is now only the 47880 / CN 13966 pair (net R0.00, footnote 2); invoice 47866 / CN 13933 stay quarantined (section 12). Customer open items 16 (was 21); amount due unchanged at R115,136.19. **Still a DRAFT** on `H4_RELEASE_GATE` only. TWK003 still has no tag-check of its own (no `statement_of_account.json`).

## 14. Update 2026-10-12: hold H4 removed, `familyReleaseHolds` is empty

Operator ruling ("yes, remove H4"): the v5 evidence path and the generator's per-account tie-out stand in for the invoice-tag gate on the `open_items` layout. Basis (PROVEN unless marked): `debtors:tag-check` returns `NOT_DERIVABLE_FROM_TXT` (deliberate `EXCLUDE: ALLOCATION DETAIL` export, evidence REMITTANCE_BACKED), which is neither a pass nor a block; no untied invoice on the family list appears on a remittance advice after lock L0001 (TWK002 and TWK004 never did). **Not covered:** TWK003 and TWK004 have no tag-check of their own (no `statement_of_account.json`), so the stand-in rests on the matcher proof and the advice cross-check done by hand this session, not on a script.

With no holds and no review-only member, the generator no longer marks the output a draft. The live write `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md` is now the non-draft consolidated statement: 16 open items R107,051.52 + other R8,084.67 = **amount due R115,136.19** (ERP sum R114,836.19 excluding the quarantined R-300.00, section 12). That overwrote the August single-account live file by design. **No `--snapshot`, no PDF** (unsupported for a family statement). `TWK002_Statement_of_Account_Consolidated_DRAFT_PREVIEW.md` is now a stale artifact of the earlier draft runs and is not regenerated.

Sending it to the customer is the operator's step and is not done. Tripwires for re-opening: a TXT re-export of any family account (fingerprint gate aborts), the ERP correction on TWK003 posting (quarantine gate aborts), a new document on any family account, or a lock conflict.
