# FIR001 — Ingest Coverage Report

**Generated:** 2026-09-11 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/FIR001/raw/FIR001CURRENT.TXT.TXT` |
| TXT as-at (last period row) | 2026-09-05 |
| Header sync as-at | 2026-09-10 |
| Items sync as-at | 2026-09-10 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 45 |
| Healthy / expected | 42 |
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
| 15488 | Crd Note | 2026-08-15 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 45779 | Payment | 2026-08-17 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45995 | Payment | 2026-08-31 | MISSING_HEADER | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
