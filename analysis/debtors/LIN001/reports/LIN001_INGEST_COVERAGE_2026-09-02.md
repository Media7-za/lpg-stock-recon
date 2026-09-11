# LIN001 — Ingest Coverage Report

**Generated:** 2026-09-02 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/LIN001/raw/DEBENQ (1).TXT` |
| TXT as-at (last period row) | 2026-09-02 |
| Header sync as-at | 2026-09-01 |
| Items sync as-at | 2026-09-01 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 30 |
| Healthy / expected | 27 |
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
| 44976 | Payment | 2026-07-03 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45840 | Payment | 2026-08-22 | MISSING_HEADER | custody, sku_analysis, allocation |
| 52924 | Invoice | 2026-09-02 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
