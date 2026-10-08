# TWK002 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TWK002/raw/TWK002_2026-10-08.TXT` |
| TXT as-at (last period row) | 2026-10-08 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 117 |
| Healthy / expected | 115 |
| Gaps | 2 |
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
| 15775 | Crd Note | 2026-10-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 53507 | Invoice | 2026-10-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
