# RED001 — Ingest Coverage Report

**Generated:** 2026-07-29 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/RED001/raw/RED001CURRENT.TXT` |
| TXT as-at (last period row) | 2026-07-25 |
| Header sync as-at | 2026-07-26 |
| Items sync as-at | 2026-07-26 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 108 |
| Healthy / expected | 104 |
| Gaps | 4 |
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
| 45328 | Payment | 2026-07-21 | MISSING_HEADER | custody, sku_analysis, allocation |
| 52086 | Invoice | 2026-07-24 | MISSING_LINES | custody, sku_analysis, allocation |
| 15325 | Crd Note | 2026-07-25 | MISSING_LINES | custody, sku_analysis, allocation |
| 15327 | Crd Note | 2026-07-25 | MISSING_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
