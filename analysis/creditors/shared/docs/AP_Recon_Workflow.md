# AP Reconciliation Workflow (Creditor v5)

End-to-end pipeline to reconcile a supplier account from the ERP TXT (Tier-3 authority).
Mirrors the debtor v5 workflow; commands live in `package.json`.

## 1. Onboard the account
```
analysis/creditors/[CODE]/
  config/statement_v5.json      # from shared/templates/statement_v5_config.template.json
  raw/[CODE]CURRENT.TXT         # authoritative ERP creditor-enquiry export
  docs/[CODE]_Linked_Accounts.md
  reports/                      # generated
```
Set `creditorCode`, `creditorName`, `periodStart`, `combinedBf` (BALANCE B/F before the
first period row), `paymentLane`, and any `linkedAccounts`.

## 2. Ingest gate (TXT ↔ DB coverage)
```
npm run creditors:ingest-check -- --creditor [CODE]
```
Writes `reports/[CODE]_INGEST_COVERAGE_[date].{json,md}`. Requires `DATABASE_URL` to
verify custody/SKU/allocation coverage. Without it the report is emitted as `UNVERIFIED`
(financial balance still `ALLOWED`) and the command exits non-zero.

## 3. Generate the v5 statement
```
npm run creditors:statement-v5 -- --creditor [CODE]
```
Writes `reports/[CODE]_Statement_Account_v5.md` and a UI fixture at
`src/features/creditor-position-workspace/data/fixtures/[CODE].v5.json`. Prints the
bridge and both pass gates (ERP variance, sub-ledger tie).

## 4. Sign-off
Confirm **ERP variance = R0.00** and **sub-ledger tie = R0.00** (see CREDITORS_DOCTRINE
C5). Custody sign-off additionally requires the ingest gate to be non-blocked.

## TXT-only (no DATABASE_URL) mode
`creditors:statement-v5` runs without Supabase: Part 1B line-split and Part 2 custody are
skipped, every financial row routes to Part 1A, and the ERP financial bridge still
reconciles to R0.00. Custody is left blank and flagged `UNVERIFIED` by the ingest gate.
Use this for a Tier-3-only financial pass; wire `DATABASE_URL` for the full custody lane.

## Future: Tier-2 supplier-ledger cross-check (not yet built)
A second lane (`creditors:oryx-parse` / `creditors:oryx-bridge`) is planned to parse the
supplier's own ledger and cross-check SON refs against ERP GRV refs. Unmatched lines
would surface as bridge exceptions without blocking the Tier-3 v5 sign-off.
