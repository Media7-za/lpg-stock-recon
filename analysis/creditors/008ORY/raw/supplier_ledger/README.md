# Oryx supplier-side ledger (advisory)

Drop Oryx's own ledger export here as **CSV** (save the Excel as CSV — no xlsx parser in this project).

**Naming:** `ORYX_2026.csv` (one file per year).

## Authority

Advisory only. Per `CREDITORS_DOCTRINE.md`, the ERP creditor enquiry TXT is Tier-3 authority for our AP balance. This file is used to **find discrepancies**, never to adjust our ledger.

## Expected columns

The comparison script needs at minimum a date, their document number, their document type (invoice / credit note / receipt), the SO#, and the amount. Extra columns are ignored. If the header names differ from the list below, they can be mapped in config rather than editing the file.

| Concept | Typical header |
| :--- | :--- |
| Document date | `Date` |
| Their document no | `Invoice No` / `Document` |
| Document type | `Type` |
| Sales order number | `SO#` / `Order` |
| Amount | `Amount` / `Value` |

## Matching key

Our ERP carries Oryx's SO# in the `SUPPLIER/BANK REF` column on `GRV` and `Deb Note` rows. Formats vary and are normalised to a bare integer on both sides:

| Ours | Normalised |
| :--- | ---: |
| `SON049` | 49 |
| `SON#128` | 128 |
| `SON 174` | 174 |
| `SO#067` | 67 |

Payments carry bank references (`STAT 129`, `C-COUNT`) rather than an SO#, so their receipts are matched on date plus amount with fuzzy candidates for human or agent ratification.
