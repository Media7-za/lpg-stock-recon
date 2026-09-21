# TAN002 raw intake

Extracted 2026-09-21 from the portfolio-wide ERP dumps in `ERP RAW DATA/` by
filtering `ACCNO == "TAN002"` (header row preserved, no rows edited):

| File | Source | Rows |
| :--- | :--- | :--- |
| `TAN002_DETRANS.TXT` | `ERP RAW DATA/DETRANS.TXT` | 342 |
| `TAN002_STTRANS.TXT` | `ERP RAW DATA/STTRANS.TXT` | 258 |
| `TAN002_2024.TXT` | `ERP RAW DATA/2024.TXT` | 75 |
| `TAN002_CURRENT.TXT` | `ERP RAW DATA/CURRENT.TXT` | 434 |

These are **line-item / stock-transaction exports** (DETRANS/STTRANS-style),
not a DEBENQ statement-of-account dump. There is no `"ACCOUNT:" / "CURRENT
BALANCE:"` header anywhere in the source files, so **no ERP-anchored closing
balance exists yet** for this account — unlike e.g. `TAN001CURRENT.TXT`.

**Still needed before recon can proceed (see `project.json` blockers):**

- A DEBENQ-style statement export (`TAN002CURRENT.TXT`, header + running
  balance) — the §2 ERP anchor. Drop it here as `TAN002CURRENT.TXT`.
- `DATABASE_URL` access to run `debtors:ingest-check` /
  `reconcile_debtor_v5_from_txt.mjs` (not available in this session).

See `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §2 and `PROJECT_SCHEMA.md`.
