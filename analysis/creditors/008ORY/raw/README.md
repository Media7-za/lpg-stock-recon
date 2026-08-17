# 008ORY — raw sources

## `008ORYCURRENT.TXT` (AUTHORITATIVE)
Authoritative ERP creditor-enquiry export (`CREDENQ_2939`) for account `008ORY` — full
ledger from `06/03/2025`, `BALANCE B/F: 0.00`. This is Tier-3 authority for the payable.

### Format notes (creditor / AP enquiry)
- Columns: `LINE, PERIOD, DOCNO, ENTRY, DATE, GRVNO, SUPPLIER/BANK REF, ORDER, REFERENCE, AMOUNT, BALANCE`.
- Sign convention in the `AMOUNT` column: **GRV negative**, **Deb Note positive**, Bank/Ud XFer positive. The reconstructed balance follows these signs directly.
- Three header/footer figures drive the two-tier bridge:
  - `TOTAL TRANSACTIONS: -121,237.70` — sum of the itemised `AMOUNT` column (== last `BALANCE`).
  - `UD CHEQUES/PAY: 315,876.33` — undeposited payments (the `Ud XFer` rows), excluded from the payable.
  - `CURRENT BALANCE: -437,114.03` — the payable = `TOTAL TRANSACTIONS − UD CHEQUES/PAY`.

### Reconciliation (TXT-only, no DATABASE_URL)
`npm run creditors:statement-v5 -- --creditor 008ORY` reconciles to **R0.00** on all three
ties (ledger, ERP current-balance, sub-ledger). `EMPTIES`-ref GRV/Deb Note lines are split
into Part 1B by ref pattern even without the DB.

### To complete the custody lane
Wire `DATABASE_URL` (Supabase) and re-run:
```
npm run creditors:ingest-check -- --creditor 008ORY
npm run creditors:statement-v5 -- --creditor 008ORY
```
to populate the Part 1B DB line-split and the Part 2 cylinder shell tracker, and to move the
ingest gate from `UNVERIFIED` to a verified coverage status.
