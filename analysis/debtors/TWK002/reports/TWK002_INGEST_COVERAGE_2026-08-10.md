# TWK002 — Ingest Coverage Report

**Generated:** 2026-08-10 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT` |
| TXT as-at (last period row) | 2026-08-09 |
| Header sync as-at | 2026-08-04 |
| Items sync as-at | 2026-08-04 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 99 |
| Healthy / expected | 92 |
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
| 503 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 504 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 505 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 506 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 507 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 508 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |
| 509 | Journal | 2026-08-09 | MISSING_HEADER | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
