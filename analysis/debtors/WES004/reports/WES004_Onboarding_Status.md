# WES004 (+ sibling WES002) — Onboarding Status

**Updated:** 2026-09-16
**Lane:** `position_recon` (v5 sub-ledger layout) — confirmed from TXT evidence (STAT-batch EFT payments, `-EMPTY`/`EMPTIES` credit-note pairing, no settlement-discount pattern). Overrides the `allocation` hint in `shared/data/portfolio_candidates.csv`, which predates this confirmation and isn't supported by the TXT's own running-balance authority.
**Sibling accounts:** WES002 (legacy code, same customer) and WES004 (active code) are reconciled **separately** per doctrine — not merged. Prior v1 baseline (`WES004_BASELINE_v1.md`) combined them; this v5 turn does not.

---

## Turn 1 — Financial reconciliation (this session)

| Item | Path | Status |
| :--- | :--- | :---: |
| v5 config — WES004 | `config/statement_v5.json` | ✅ |
| v5 config — WES002 | `config/statement_v5_WES002.json` | ✅ |
| Statement v5 — WES004 | `reports/WES004_Statement_Account_v5.md` | ✅ Part 1 bridge R0.00 (as at 11 Jun 2026) |
| Statement v5 — WES002 | `reports/WES002_Statement_Account_v5.md` | ✅ Part 1 bridge R0.00 (as at 10 Apr 2026) |
| Coverage JSON/MD — WES004 | `reports/WES004_INGEST_COVERAGE_2026-09-16.{json,md}` | ✅ `STALE_COMPLETE` |
| Coverage JSON/MD — WES002 | `reports/WES002_INGEST_COVERAGE_2026-09-16.{json,md}` | ✅ `CURRENT_COMPLETE` |
| Ingest projection — WES004 | `reports/WES004_Ingest_Gate_Projection.md` | ✅ |
| Ingest projection — WES002 | `reports/WES002_Ingest_Gate_Projection.md` | ✅ |
| Onboarding status | `reports/WES004_Onboarding_Status.md` (this file) | ✅ |
| Workspace fixture — WES004 | `src/features/debtor-position-workspace/data/fixtures/WES004.v5.json` | ✅ |
| Workspace fixture — WES002 | `src/features/debtor-position-workspace/data/fixtures/WES002.v5.json` | ✅ |

**Tooling note:** `DATABASE_URL` is not set in this remote session, so `npm run debtors:ingest-check` and `reconcile_debtor_v5_from_txt.mjs` (both hard-require `pg` + `DATABASE_URL`) could not run natively. Part 1A/1B/Bridge were rebuilt from the TXT files directly (same routing rules as the `.mjs` script — see `.agents/skills/SKILL_Debtor_Statement_v5_From_TXT.md`), and DB coverage/duplication checks were run via the Supabase MCP `execute_sql` tool against project `lpg-stock-recon` (`oqhpxnaadahohwkslive`) instead. An operator with `DATABASE_URL` configured should re-run the official scripts to confirm.

---

## Pass gates

| Gate | Result |
| :--- | :--- |
| Part 1 bridge (1A + 1B = ERP) | **PASS** — R0.00 variance, both accounts, at their respective TXT as-at dates |
| Sub-ledger tie | **PASS** — R0.00 row-by-row (0 mismatches against the TXT's own BALANCE column) |
| ingestFreshness | WES004 **stale** · WES002 **current** |
| ingestCoverage | **complete** for both (91/91 and 84/84 docs resolve in DB) |
| Part 2 custody sign-off | **NOT ATTEMPTED** — gate BLOCKED (see below) |

---

## Two open blockers (operator action required)

1. **WES004.TXT is ~3 months stale.** DB shows 20 more WES004 documents (through 31 Aug 2026, ~R7,081.67 net) than the current TXT reflects. The R28,772.47 balance in this statement is a snapshot as at 11 Jun 2026, not today. **Action:** pull a fresh WES004 statement TXT and re-run.
2. **`transaction_headers` duplicate-row anomaly**, confirmed on both WES002 and WES004: every document number has 2+ header rows (up to 16 on some Payment docs), from overlapping periodic re-exports and apparent ERP allocation-detail sub-rows sharing one `doc_no`. This doesn't affect the TXT-sourced Part 1 bridge (which never sums DB rows), but it blocks Part 2 custody/SKU sign-off for these accounts, and likely for the wider portfolio since the same ingest pipeline and source files (`DTRX*.TXT`, `DETRANS*.TXT`) feed every debtor. **Action:** run the `lpg-recon-bug-fixer` skill to root-cause before any account's Part 2/custody figures are trusted from DB sums.

---

## Not in scope this turn (per doctrine)

- No merge of WES002 into WES004 (sibling accounts stay separate unless the user requests otherwise).
- No custody/SKU/allocation sign-off while the ingest gate is BLOCKED.
- No changes to `WES004_BASELINE_v1.md` or the existing Letter of Demand (v4-era artifacts, left unchanged).
- No fix applied to the DB duplication — that's a `lpg-recon-bug-fixer` investigation, not a v5 statement task, and touches shared/portfolio-wide data.

---

## Also flagged (not this account's scope, but discovered incidentally)

`Supabase.list_tables` reported **20 tables with Row Level Security disabled** on the `lpg-stock-recon` project (`solicitation_queue`, `routes`, `drivers`, `orders`, etc.) — fully exposed to the anon/authenticated roles. Not touched here (out of scope, and enabling RLS without policies would break access); surfaced for the operator to decide on remediation.
