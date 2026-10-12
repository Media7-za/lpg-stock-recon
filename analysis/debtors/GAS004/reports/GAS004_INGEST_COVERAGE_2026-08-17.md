# GAS004 — Ingest Coverage Report

**Generated:** 2026-08-17 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/GAS004/raw/DEBENQ_CURRENT.TXT` |
| TXT as-at (last period row) | 2026-08-03 |
| Header sync as-at | 2026-08-17 |
| Items sync as-at | 2026-08-17 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 89 |
| Healthy / expected | 79 |
| Gaps | 10 |
| DB-only (not in TXT) | 6 |

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
| 44130 | Ud Paymnt | 2026-05-02 | MISSING_HEADER | custody, sku_analysis, allocation |
| 44139 | Ud Paymnt | 2026-05-02 | MISSING_HEADER | custody, sku_analysis, allocation |
| 44533 | Ud Paymnt | 2026-06-06 | MISSING_HEADER | custody, sku_analysis, allocation |
| 44534 | Ud Paymnt | 2026-06-06 | MISSING_HEADER | custody, sku_analysis, allocation |
| 44845 | Payment | 2026-06-26 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45049 | Payment | 2026-07-10 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45077 | Payment | 2026-07-13 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45282 | Payment | 2026-07-23 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45412 | Payment | 2026-07-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45412 | Ud Paymnt | 2026-07-30 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45484 | Ud Paymnt | 2026-08-03 | MISSING_HEADER | custody, sku_analysis, allocation |
| 52467 | Invoice | 2026-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52478 | Invoice | 2026-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52518 | Invoice | 2026-08-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52519 | Invoice | 2026-08-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52586 | Invoice | 2026-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
