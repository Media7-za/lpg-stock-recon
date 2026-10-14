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

1. **Post the export request** (drafted file above) to Sharmin (new Linear ticket under ADM-76, or add to ADM-96)? Please confirm; this session did not post it.
2. **COF001 and COF002**: kept separate, not netted. If the operator wants them handled as a payer family, that needs an explicit ruling (D20 `payerGroup`); none is assumed. COF002 is balance -R5,267.66, deferred (ASSERTED, same CSV).
3. When the export arrives, its cylinder opening (B/F split between LPG and CYL deposits) will need operator confirmation if it cannot be derived from the first rows (as with TAN001).

## 5. Tripwires
Reopen if: a dated COF001 export arrives; the portfolio balance moves from R7,958.38; COF002 balance changes sign or is activated; an operator ruling groups COF001 with COF002.

## 6. Next steps once the export arrives
Verify per D21 (chain, header CURRENT BALANCE, TOTAL TRANSACTIONS, UD gap) -> file as `raw/COF001_<date>.TXT` -> set `txtPath`, `combinedBf`, `periodStart` from the header (cite lines in `bfSourceNote`) -> `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor COF001` -> `npm run debtors:ingest-check -- --debtor COF001` (needs DB authorisation) -> review variance and open items.
