# SKILL: Creditor Analysis Statement v5 From TXT

**When to use:** Reconciling a **supplier / Accounts Payable** account (e.g. `008ORY` Oryx)
from an ERP creditor-enquiry TXT into a v5 sub-ledger position statement. This is the AP
counterpart of `SKILL_Debtor_Statement_v4/v5_From_TXT.md` and must never modify debtor
artifacts.

**Reference account:** `008ORY` (Oryx Energy), linked legacy `007ORY`.

## Doctrine
- Tier-3 authority = ERP TXT `CURRENT BALANCE`. See `analysis/creditors/shared/docs/CREDITORS_DOCTRINE.md`.
- Document map: `Invoice→GRV`, `Crd Note→Deb Note`, `Payment→Payment`.
- Direction: GRV `+` (increase payable); Deb Note & Payment `−` (reduce payable). Signs are
  carried by the TXT `AMOUNT` column, so the arithmetic matches the debtor lane.
- Part 1A = LPG gas (`.4` SKUs) + payments; Part 1B = CYL deposits (`.1` SKUs); Bridge proves
  `1A + 1B = ERP CURRENT BALANCE`; Part 2 = cylinder shell custody.

## Pipeline
1. **Config** — `analysis/creditors/[CODE]/config/statement_v5.json` from
   `analysis/creditors/shared/templates/statement_v5_config.template.json`. Set
   `creditorCode`, `creditorName`, `periodStart`, `combinedBf`, `paymentLane`, `linkedAccounts`.
2. **Ingest gate** — `npm run creditors:ingest-check -- --creditor [CODE]` (needs `DATABASE_URL`).
3. **Statement** — `npm run creditors:statement-v5 -- --creditor [CODE]`.
4. **Sign-off** — require all financial ties = **R0.00**: the ledger tie (`1A + 1B` vs ERP
   `TOTAL TRANSACTIONS`), the ERP tie (`Combined − UD Cheques/Pay` vs `CURRENT BALANCE`), and
   the sub-ledger tie. Custody sign-off additionally needs a non-blocked ingest gate.

## Two-tier bridge (real exports)
`CURRENT BALANCE = TOTAL TRANSACTIONS − UD CHEQUES/PAY` (undeposited `Ud XFer` payments). The
generator parses all three and reconciles both tiers to R0.00. AP sign convention in real
exports: `AMOUNT` carries GRV negative / Deb Note positive; balances follow those signs
directly. See `analysis/creditors/shared/docs/CREDITORS_DOCTRINE.md` (C8).

## DB-optional (TXT-only) mode
Without `DATABASE_URL`, `creditors:statement-v5` skips Part 1B line-split and Part 2 custody
(everything routes to Part 1A) and still reconciles the Tier-3 financial bridge to R0.00.
Custody is left blank and flagged `UNVERIFIED`. Wire `DATABASE_URL` for the full custody lane.

## Guardrails
- Do not edit `analysis/debtors/**`.
- Do not derive a `payable-now` / `collectable` figure inside the generator — positions and
  variances only.
- `008ORYCURRENT.TXT` is currently an **interim synthetic** file; replace with the authoritative
  ERP export before financial sign-off (see `analysis/creditors/008ORY/raw/README.md`).

## Not yet built (future Tier-2 lane)
Supplier-ledger cross-check (`creditors:oryx-parse` / `creditors:oryx-bridge`,
`config/oryx_ledger_map.json`) matching Oryx SON refs to ERP GRV refs. Unmatched lines would
surface as bridge exceptions without blocking the Tier-3 v5 sign-off.
