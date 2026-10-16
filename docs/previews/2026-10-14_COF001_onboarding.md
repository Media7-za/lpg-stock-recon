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
