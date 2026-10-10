# TWK004 — Ingest Coverage Report

**Generated:** 2026-10-10 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TWK002/raw/TWK004_2026-10-10.TXT` |
| TXT as-at (last period row) | 2026-10-10 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 12 |
| Healthy / expected | 9 |
| Gaps | 3 |
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
| 53535 | Invoice | 2026-10-09 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 53536 | Invoice | 2026-10-09 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15781 | Crd Note | 2026-10-10 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
