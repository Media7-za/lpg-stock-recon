# 008ORY raw inputs

Place authoritative ERP creditor enquiry exports here:

| File | Purpose |
| :--- | :--- |
| `008ORYCURRENT.TXT` | Tier-3 AP statement (CREDENQ CSV with `CURRENT BALANCE`, `GRV`, `Deb Note`, `Bank XFer`) |
| `supplier_ledger/ORYX_2026.csv` | **Advisory only** — Oryx's own ledger for ledger-vs-ledger comparison. Save the Excel as CSV. |

**Current file:** official CREDENQ export (updated 2026-08-25 from `CREDENQ008ORY.TXT`). Account `008ORY - ORYX ENERGY`. Header `CURRENT BALANCE` R-568,317.86; line export close R-181,607.67 through **25 Aug 2026**. `UD CHEQUES/PAY` R386,710.19 is in the header only.

Drop new ERP exports as `CREDENQ008ORY.TXT` then merge into `008ORYCURRENT.TXT` (date order).

Generate from DB when `008ORY` exists in Supabase: `npm run creditors:export-txt -- --creditor 008ORY`
