# TAN002 — Onboarding Status

**Date:** 2026-09-21 (updated same day — DEBENQ statements received)
**Session role:** WORKER

---

## 1. What this is

`analysis/debtors/TAN002/` was created for TANDOOR THE CLAY OVEN. It started
as a scaffold-only turn (folder + line-item ERP extracts, no ERP-anchored
balance), then the operator supplied three DEBENQ account-enquiry exports
covering the account's full history, which produced a **PROVEN §2 anchor**.
See `reports/TAN002_Statement_Chain_2026-09-21.md` for the chain
verification.

---

## 2. Current state

| Field | Value | Basis |
| :--- | :--- | :--- |
| `status` | `active` | Live/recent trading, no dispute evident |
| `reconState` | `in-progress` | Financial anchor proven; custody/SKU/ingest not yet run |
| `financials.totalOutstanding` / `erpTxtClosing` | R2,052.39 | **PROVEN** — `raw/TAN002CURRENT.TXT`, chain-verified |
| `financials.erpTxtClosingAsOf` | 2026-08-20 | Last transaction row |
| `financials.agedDebt180Plus` | R0.00 | **ASSERTED** — entire balance dated 20/08/2026 (32 days old at session date); no FIFO aging run |

---

## 3. What was done, in order

1. **Scaffold turn:** created `raw/`, `config/`, `reports/`; extracted
   TAN002's rows from the portfolio-wide `ERP RAW DATA/` line-item dumps
   (now `raw/TAN002_STOCKTXN_*.TXT`); initialized `project.json` as
   `on-hold` / `pending` sourced only from `shared/data/portfolio_candidates.csv`
   (ASSERTED, since no ERP statement existed and no DB access this session).
2. **Evidence turn:** operator supplied `TAN002_2024.TXT`, `TAN002_2025.TXT`,
   `TAN002CURRENT.TXT` (DEBENQ exports). Verified their B/F-to-close chain
   ties exactly end-to-end and each file is internally arithmetic-consistent
   (recomputed programmatically, zero mismatches). Updated `project.json`
   to the PROVEN R2,052.39 anchor; promoted `status: on-hold → active`,
   `reconState: pending → in-progress`. Superseded the stale
   `portfolio_candidates.csv` snapshot (R3,523.86 was a real but stale
   mid-period balance, not an error — see chain report §3).

No line was edited, aggregated, or reformatted from any source file.

---

## 4. Why this stops short of `reconState: complete`

Per `DEBTORS_DOCTRINE.md` §4 (evidence hierarchy) and `PROJECT_SCHEMA.md`,
a statement-level balance identity proves the **financial** anchor only.
Still unverified, and requiring `DATABASE_URL` (unavailable this session):

- **Custody** — cylinder/SKU quantities out vs returned.
- **SKU / allocation** — which invoices remain open, matched via
  `reconcile_debtor_v5_from_txt.mjs`.
- **Ingest coverage** — DB vs TXT document coverage, via
  `validate_txt_db_coverage.mjs`.

`ingestGate` is left absent rather than fabricated (D19: absence ≠
clearance). `status` was **not** set to `collection` — D17/D18 eligibility
was never assessed, and the account shows no aged, disputed, or stale
balance that would warrant it.

---

## 5. Next steps

1. Obtain `DATABASE_URL` and run:
   ```bash
   npm run debtors:ingest-check -- --debtor TAN002
   node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor TAN002
   ```
2. Build `config/statement_v5.json` (B/F, `cylOpeningQty`, `skuRates`) —
   see `TAN001/config/statement_v5.json` for the field shape. R16,828.85 as
   at 22/02/2025 is the latest available period-start anchor.
3. Re-evaluate `reconState` toward `complete` once custody/SKU/ingest are
   verified.

---

## 6. Tripwires

| Closed statement | Reopens if |
| :--- | :--- |
| R2,052.39 PROVEN anchor as at 20/08/2026 | A fresher DEBENQ export changes the CURRENT BALANCE header |
| `status: active`, `reconState: in-progress` | Custody/SKU/ingest verification completes (→ reassess toward `complete`), or a dispute/aged-debt signal appears (→ reassess `collection` eligibility under D17) |
| `agedDebt180Plus: 0.00` (ASSERTED) | A FIFO/open-invoice aging run finds unpaid lines older than 180 days |
