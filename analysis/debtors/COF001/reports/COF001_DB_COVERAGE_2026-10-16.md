# COF001 - TXT vs Supabase document coverage (2026-10-16)

Method: all 480 TXT rows (`raw/COF001_COMBINED.TXT`) compared per document (document number without leading zeros + entry type) against Supabase project `oqhpxnaadahohwkslive`, account `COF001`. Invoices and credit notes use de-duplicated `vw_clean_transactions` line totals (same rule as `reconcile_debtor_v5_from_txt.mjs`). Other entry types use `transaction_headers.amount_excl`. This is a manual run through the Supabase connector, not the `debtors:ingest-check` script (needs `DATABASE_URL`, not set in this session). Tag: PROVEN for the counts below (query output in this session); the script gate is still not run.

## Result

| Entry type | TXT rows | Match | Amount differs | Date differs | In TXT, not in DB |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Invoice | 231 | 229 | 0 | 2 | 0 |
| Crd Note | 92 | 91 | 0 | 1 | 0 |
| Payment | 152 | 143 | 5 | 0 | 4 |
| Bank UD | 3 | 2 | 1 | 0 | 0 |
| Bank XFer | 1 | 1 | 0 | 0 | 0 |
| Journal | 1 | 1 | 0 | 0 | 0 |

Documents in the DB but not in the TXT: none. Distinct DB documents (Invoice 231, Crd Note 92, Payment 148, Bank UD 3) equal the matched TXT documents. The extra header rows (Invoice 317 rows, Crd Note 132, Payment 263, Bank UD 7) are duplicate copies of those documents, not extra documents.

## Differences

| Doc | Type | TXT date / amount | DB | Effect |
| :--- | :--- | :--- | :--- | :--- |
| 50513, 50515 | Invoice | 2026-05-05 | dated 2026-05-06, amounts match | None on lane or balance. DB date is one day later. |
| 14854 | Crd Note | 2026-05-05 | dated 2026-05-06, amount matches | None on lane or balance. |
| 29646, 30219, 24732, 29696 | Payment | -8,390.33; -7,628.30; -6,625.90; -8,486.48 | absent | None: payments route to 1A from the TXT. These are the four payments in the CURRENT extract that post out of date order (see `COF001_CURRENT.TXT` lines 15 to 18). |
| 42889 | Payment | -7,264.46 | -6,856.74 | Payments are TXT-authoritative, so no effect on the statement. DB amount unexplained. |
| 33627 | Payment | -7,902.65 | -4,794.87 | As above. |
| 23445 | Payment | -8,827.62 | -7,596.15 | As above. |
| 32620 | Payment | -7,437.11 | -6,630.67 | As above. |
| 35877 | Payment | -9,649.56 | -8,390.92 | As above. |
| 40294 | Bank UD | 6,446.60 | 430.63 | As above. |

The payment amount differences look like partial or duplicate rows in the DB; I did not investigate the cause. They are open items for the ingest owner, not statement errors.

## Conclusion

Cylinder routing is safe: every invoice and credit note in the TXT exists in the DB with the same amount, so no document fell to 1A by default. Part 1A and 1B tie to the ERP on every row. Ten payment-type documents differ or are missing in the DB; they do not touch routing but would matter to any allocation work that reads DB payments.

## Replay of the earlier snapshot

Re-queried the same day: routing counts (LPG 155 inv + 13 CN; CYL 69 inv + 77 CN; MIXED 7 inv + 2 CN), the nine mixed-document splits, custody quantities (9.1 -3, 19.1 -1, S.1 -15, D.1 10, 14.1 none) and header row counts are identical to `data/db_sku_classification.json`.

## Tripwires (reopen when)

- New COF001 documents are ingested or the DB is re-ingested (duplicate rows could change the de-duplicated totals).
- `DATABASE_URL` becomes available: re-run `npm run debtors:ingest-check -- --debtor COF001` and the shared v5 generator, and compare to this report.
- The four missing payments or the six payment amount differences are explained or corrected.
