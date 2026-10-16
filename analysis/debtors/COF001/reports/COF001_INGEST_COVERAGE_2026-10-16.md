# COF001 — Ingest Coverage Report

**Generated:** 2026-10-16 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` |
| TXT as-at (last period row) | 2026-09-09 |
| Header sync as-at | 2026-10-13 |
| Items sync as-at | 2026-10-13 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 480 |
| Healthy / expected | 473 |
| Gaps | 7 |
| DB-only (not in TXT) | 0 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | BLOCKED |
| SKU analysis | BLOCKED |
| Allocation | BLOCKED |

## Document gaps

| Doc | Type | Date | Class | Blocks |
| :--- | :--- | :--- | :--- | :--- |
| 24732 | Payment | 2023-09-29 | MISSING_HEADER | custody, sku_analysis, allocation |
| 30219 | Payment | 2024-03-12 | MISSING_HEADER | custody, sku_analysis, allocation |
| 29646 | Payment | 2024-03-20 | MISSING_HEADER | custody, sku_analysis, allocation |
| 29696 | Payment | 2024-03-25 | MISSING_HEADER | custody, sku_analysis, allocation |
| 32615 | Bank UD | 2024-08-03 | DOCUMENT_TYPE_UNRESOLVED | custody, sku_analysis, allocation |
| 40294 | Bank UD | 2025-07-22 | DOCUMENT_TYPE_UNRESOLVED | custody, sku_analysis, allocation |
| 42621 | Bank UD | 2025-12-09 | DOCUMENT_TYPE_UNRESOLVED | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
