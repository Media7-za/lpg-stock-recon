# IVE001 — Ingest Coverage Report

**Generated:** 2026-09-19 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/IVE001/raw/IVE001X19092026.TXT` |
| TXT as-at (last period row) | 2026-09-14 |
| Header sync as-at | 2026-09-17 |
| Items sync as-at | 2026-09-17 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 69 |
| Healthy / expected | 66 |
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
| 45331 | Payment | 2026-07-22 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45890 | Payment | 2026-08-25 | MISSING_HEADER | custody, sku_analysis, allocation |
| 46004 | Payment | 2026-09-02 | MISSING_HEADER | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
