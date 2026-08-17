# 008ORY — raw sources

## `008ORYCURRENT.TXT` (INTERIM — synthetic)
This file is **not** an authoritative ERP export. It was reconstructed from the July 2026
Oryx supplier-ledger excerpt to bootstrap the creditor v5 pipeline:

- `SAINV` → `GRV` (`+Debit`, increases payable)
- `SACRN` → `Deb Note` (`−Credit`, reduces payable)
- `ARPAY` → `Payment` (`−Credit`, reduces payable)
- `BALANCE B/F: 115,550.83` — derived from the ledger opening cumulative totals
  (Debit 6,525,913.48 / Credit 6,641,464.31 are cumulative-to-date, not a single opening).
- `CURRENT BALANCE: 257,563.80` — B/F + net July movement (R142,012.97).

ERP `DOCNO` values are fabricated sequential placeholders; the real Oryx document numbers
are preserved in the `INVNO` column and the SON order refs / payment refs in the
`CUSTOMER/BANK REF` column for the future Tier-2 cross-check.

## To finalize
Drop the authoritative ERP creditor-enquiry export here as `008ORYCURRENT.TXT`, re-derive
`combinedBf` from its real `BALANCE B/F` line, then re-run:
```
npm run creditors:ingest-check -- --creditor 008ORY   # needs DATABASE_URL
npm run creditors:statement-v5 -- --creditor 008ORY
```
