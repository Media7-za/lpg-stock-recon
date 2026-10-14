# COF001 provisional extract — ASSUMED, NOT a D21 input

`COF001_shared_dump_extract_ASSUMED.csv` is a plain filter (ACCNO = COF001, header kept, one SOURCE column added) of `ERP RAW DATA/DETRANS.TXT` (2025-03-05 to 2026-02-18) and `analysis/debtors/shared/raw/april_dump.TXT` (2026-04-02 to 2026-04-21). No values were edited.

- **ASSUMED.** Not a dated per-account export: no B/F, no running balance, no header CURRENT BALANCE, gaps 2026-02-19 to 04-01 and 2026-04-22 onward.
- Cannot prove R7,958.38 and must not be used as `txtPath`, for a statement, or for any release.
- Requested from Sharmin as Linear ADM-135 (per PM session message, 2026-10-14). When `raw/COF001_<date>.TXT` arrives: verify per D21, rebuild from it, and retire this folder (keep for audit; do not delete).
