# TAN002 raw intake

## DEBENQ account-enquiry statements (§2 anchor — operator-supplied 2026-09-21)

| File | Period | B/F | Close |
| :--- | :--- | ---: | ---: |
| `TAN002_2024.TXT` | 19/09/2023 – 29/02/2024 | R0.00 | R2,641.92 |
| `TAN002_2025.TXT` | 06/03/2024 – 27/02/2025 | R2,641.92 | R16,828.85 |
| `TAN002CURRENT.TXT` | 22/02/2025 – 20/08/2026 | R16,828.85 | **R2,052.39** |

Chain verified PROVEN (arithmetic recompute + B/F handoffs tie exactly) —
see `reports/TAN002_Statement_Chain_2026-09-21.md`. `TAN002CURRENT.TXT` is
the current §2 anchor; do not treat it as stale until a newer DEBENQ export
supersedes it.

## Line-item / stock-transaction exports (custody/SKU lane, no balance anchor)

Extracted 2026-09-21 from the portfolio-wide ERP dumps in `ERP RAW DATA/` by
filtering `ACCNO == "TAN002"` (header row preserved, no rows edited):

| File | Source | Rows |
| :--- | :--- | :--- |
| `TAN002_STOCKTXN_DETRANS.TXT` | `ERP RAW DATA/DETRANS.TXT` | 342 |
| `TAN002_STOCKTXN_STTRANS.TXT` | `ERP RAW DATA/STTRANS.TXT` | 258 |
| `TAN002_STOCKTXN_2024.TXT` | `ERP RAW DATA/2024.TXT` | 75 |
| `TAN002_STOCKTXN_CURRENT.TXT` | `ERP RAW DATA/CURRENT.TXT` | 434 |

These carry no account-level running balance; they're line-item detail for
future custody/SKU reconciliation, not a §2 anchor substitute.

**Still needed before full recon can proceed (see `project.json` collections.notes):**

- `DATABASE_URL` access to run `debtors:ingest-check` and
  `reconcile_debtor_v5_from_txt.mjs` (not available in this session) —
  covers custody, SKU, and allocation lanes, none of which are verified yet.

See `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §2/§4 and `PROJECT_SCHEMA.md`.
