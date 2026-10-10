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
