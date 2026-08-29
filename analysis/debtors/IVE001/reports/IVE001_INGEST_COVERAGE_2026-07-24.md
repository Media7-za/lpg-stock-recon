# IVE001 — Ingest Coverage Report

**Generated:** 2026-07-24 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/IVE001/raw/IVE001X22072026.TXT` |
| TXT as-at (last period row) | 2026-07-15 |
| Header sync as-at | 2026-07-01 |
| Items sync as-at | 2026-07-01 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 52 |
| Healthy / expected | 43 |
| Gaps | 9 |
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
| 14883 | Crd Note | 2026-04-15 | MISSING_LINES | custody, sku_analysis, allocation |
| 44457 | Payment | 2026-05-27 | MISSING_HEADER | custody, sku_analysis, allocation |
| 15188 | Crd Note | 2026-07-04 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51603 | Invoice | 2026-07-04 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51604 | Invoice | 2026-07-04 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 45099 | Payment | 2026-07-07 | MISSING_HEADER | custody, sku_analysis, allocation |
| 15265 | Crd Note | 2026-07-15 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51844 | Invoice | 2026-07-15 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51845 | Invoice | 2026-07-15 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
