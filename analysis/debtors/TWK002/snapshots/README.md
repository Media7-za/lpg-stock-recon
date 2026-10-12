# TWK002 — Statement snapshots

**Authority:** `docs/TWK002_Model_B_Position.md` (snapshot doctrine, 2026-08-29)

Immutable statement artifacts for finance sign-off, collections gate, and customer send.
**Do not** cite live `reports/TWK002_Statement_of_Account.md` for disputes — cite a snapshot folder + `manifest.json` sha256.

## Regenerate

```bash
npm run debtors:twk002-statement-snapshot -- --as-at YYYY-MM-DD
```

Auto-versions (`_v1`, `_v2`, …) when the date folder already exists.

## Snapshots on file

| Snapshot id | Statement as-at | Customer due (PROVEN) | Gate | Manifest |
| :--- | :--- | ---: | :--- | :--- |
| `2026-08-11_v1` | 2026-08-11 | R110,046.87 | ALLOWED · REMITTANCE_BACKED | `2026-08-11_v1/manifest.json` |

Internal (not on customer document): ERP header R118,131.54 · account-level bridge R8,084.67 — see manifest `amounts`.

## Tripwires — reopen snapshot validity if

| Closed ruling | Reopens if |
| :--- | :--- |
| Customer due R110,046.87 (11 open invoices) | Fresh TXT changes open list or amounts; remittance contradicts an open invoice; operator removes `closedInvoiceOverrides` 42468/42470 without ERP tagging (H-023) |
| Snapshot `2026-08-11_v1` immutability | Operator sends a regenerated live draft instead of this snapshot; TXT archived in folder superseded by H-013 export |
| Ageing as-at 31 Jul 2026 | Statement as-at date changes without new snapshot; ageing rule changed in generator without re-snapshot |
| Gate ALLOWED | `debtors:tag-check` returns BLOCKED on same TXT; remittance names a listed open invoice as paid |
