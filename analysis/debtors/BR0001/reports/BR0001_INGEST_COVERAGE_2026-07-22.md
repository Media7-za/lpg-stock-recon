# BR0001 — Ingest Coverage Report

**Generated:** 2026-07-22 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/BR0001/raw/BR0001P1TOP17.TXT` |
| TXT as-at (last period row) | 2026-07-20 |
| Header sync as-at | 2026-07-01 |
| Items sync as-at | 2026-07-01 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 40 |
| Healthy / expected | 32 |
| Gaps | 8 |
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
| 51171 | Invoice | 2026-06-11 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51172 | Invoice | 2026-06-11 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15210 | Crd Note | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51659 | Invoice | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51660 | Invoice | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15282 | Crd Note | 2026-07-20 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51925 | Invoice | 2026-07-20 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51926 | Invoice | 2026-07-20 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
