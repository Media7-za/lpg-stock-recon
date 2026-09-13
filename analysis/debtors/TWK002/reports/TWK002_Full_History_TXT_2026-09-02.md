# TWK002 — full-history TXT (stitched)

**Generated:** 2026-09-02
**Output:** `raw/TWK002_FULL_HISTORY.TXT`

## Summary

| Field | Value | Tag |
| :--- | ---: | :--- |
| Rows | 301 | PROVEN |
| Date range | 2023-04-28 → 2026-08-31 | PROVEN |
| Opening B/F | R0.00 | PROVEN |
| Closing balance | R26 498,36 | PROVEN |

## Sources

| Slice | File | Rows |
| :--- | :--- | ---: |
| 2023 slice (YEAR: 2024 FEBRUARY) | `analysis/debtors/TWK002/raw/TWK0022023.TXT` | 78 |
| 2024 slice (YEAR: 2025 MARCH) | `analysis/debtors/TWK002/raw/TWK0022024.TXT` | 65 |
| current tail (through 2026-08-31) | `analysis/debtors/TWK002/raw/DEBENQ.TXT` | 158 |

## Checkpoints

| Label | As-at | Expected | Actual |
| :--- | :--- | ---: | ---: |
| 2023 slice close | 2024-02-26 | 87226.46 | 87226.46 |
| 2024 slice close | 2025-02-24 | 38791.27 | 38791.27 |

## Authority

Stitched analytical export — **not** a single ERP pull. Replace when H-013 fresh export lands.

Regenerate:

```bash
node analysis/debtors/TWK002/scripts/build_full_history_txt.mjs --write
```
