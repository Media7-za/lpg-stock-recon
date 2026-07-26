# JEN001 — Ingest Coverage Report

**Generated:** 2026-07-22 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JEN001/raw/JEN00116JULY.TXT` |
| TXT as-at (last period row) | 2026-07-14 |
| Header sync as-at | 2026-07-01 |
| Items sync as-at | 2026-07-01 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 63 |
| Healthy / expected | 45 |
| Gaps | 18 |
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
| 50939 | Invoice | 2026-05-05 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 14994 | Crd Note | 2026-05-06 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 14995 | Crd Note | 2026-05-06 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51154 | Invoice | 2026-06-11 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51155 | Invoice | 2026-06-11 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15193 | Crd Note | 2026-07-03 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51564 | Invoice | 2026-07-03 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51565 | Invoice | 2026-07-03 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15204 | Crd Note | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15205 | Crd Note | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51669 | Invoice | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51670 | Invoice | 2026-07-07 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15220 | Crd Note | 2026-07-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51691 | Invoice | 2026-07-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51692 | Invoice | 2026-07-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 15258 | Crd Note | 2026-07-14 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51823 | Invoice | 2026-07-14 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 51824 | Invoice | 2026-07-14 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
