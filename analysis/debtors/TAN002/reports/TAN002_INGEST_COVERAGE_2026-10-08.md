# TAN002 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TAN002/raw/TAN002_2026-10-08.TXT` |
| TXT as-at (last period row) | 2026-10-06 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 255 |
| Healthy / expected | 254 |
| Gaps | 1 |
| DB-only (not in TXT) | 3 |

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
| 11976 | Crd Note | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41042 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41043 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46364 | Ud Paymnt | 2026-10-06 | MISSING_HEADER | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
