# TAN002 — Onboarding Status

**Date:** 2026-09-21
**Session role:** WORKER (scaffold only — no reconciliation performed)

---

## 1. What this is

`analysis/debtors/TAN002/` was created for TANDOOR THE CLAY OVEN, a debtor
code present in the portfolio candidates list
(`analysis/debtors/shared/data/portfolio_candidates.csv`) but **not
previously onboarded** as a micro-project (no `TAN002` folder existed prior
to this session; `TAN001` was already onboarded and is unrelated).

Candidates-list row:

```
TAN002,TANDOOR THE CLAY OVEN,7,3523.86,739.87,no,defer,C,
```

`terms=7`, `balance=3523.86`, `aged_120_plus=739.87`, `in_portfolio=no`,
`suggested_lane=defer`, `triage_tier=C`.

---

## 2. What was done

| Artifact | Content | Basis |
| :--- | :--- | :--- |
| `raw/TAN002_DETRANS.TXT` | 342 rows, `ACCNO=TAN002` filtered from `ERP RAW DATA/DETRANS.TXT` | **PROVEN** — verbatim subset |
| `raw/TAN002_STTRANS.TXT` | 258 rows, from `ERP RAW DATA/STTRANS.TXT` | **PROVEN** — verbatim subset |
| `raw/TAN002_2024.TXT` | 75 rows, from `ERP RAW DATA/2024.TXT` | **PROVEN** — verbatim subset |
| `raw/TAN002_CURRENT.TXT` | 434 rows, from `ERP RAW DATA/CURRENT.TXT` | **PROVEN** — verbatim subset |
| `config/` | Empty — no `statement_v5.json` yet (no B/F, SKU rates, or period start established) | — |
| `project.json` | `status: on-hold`, `reconState: pending`; `financials` sourced from candidates CSV only, tagged ASSERTED | **ASSERTED** |

No line was edited, aggregated, or reformatted from the ERP source files.

---

## 3. Why this stops here (governance)

Per `DEBTORS_DOCTRINE.md` §1 ("Evidence is canonical") and §2 (Collectable
Rule), and `PROJECT_SCHEMA.md`:

- **No §2 ERP anchor exists.** The four extracted files are line-item /
  stock-transaction exports (`DETRANS`/`STTRANS` style) — none carries an
  `"ACCOUNT:"` / `"CURRENT BALANCE:"` header the way `TAN001CURRENT.TXT`
  does. A closing balance cannot be anchored, only reconstructed, and
  reconstruction from raw lines without a stated B/F is exactly the kind of
  invented figure the doctrine forbids.
- **No database access this session** (`DATABASE_URL` unset), so
  `reconcile_debtor_v5_from_txt.mjs` and `validate_txt_db_coverage.mjs`
  (the ingest-gate / v5 statement generators) could not be run.
- **Candidates list marks this account `in_portfolio: no`,
  `suggested_lane: defer`, `triage_tier: C`** — i.e. explicitly not yet
  slated for active work. `status: on-hold` reflects that rather than
  inventing an `active`/`collection` posture.

Because `status` is `on-hold` (not `collection`), the D17/D18 collections
gate does not apply here — this account is not eligible for demand
drafting under this scaffold, and should not be treated as such.

---

## 4. Next steps (for whoever picks this up)

1. Obtain a DEBENQ-style `TAN002CURRENT.TXT` statement export (header +
   running balance) and drop it in `raw/`.
2. Set `DATABASE_URL` and run:
   ```bash
   npm run debtors:ingest-check -- --debtor TAN002
   node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor TAN002
   ```
3. Build `config/statement_v5.json` (B/F, `cylOpeningQty`, `skuRates`) once
   an opening position is established — see `TAN001/config/statement_v5.json`
   for the field shape.
4. Get an operator decision on whether to move this account off `defer`
   into the active portfolio before any collections posture is set.

---

## 5. Tripwires

| Closed statement | Reopens if |
| :--- | :--- |
| `status: on-hold`, no collectable stated | Operator promotes TAN002 out of `defer` in the candidates list, or supplies a statement export |
| `financials.*` ASSERTED from candidates CSV | A `TAN002CURRENT.TXT` header lands and its balance is confirmed/disconfirmed |
