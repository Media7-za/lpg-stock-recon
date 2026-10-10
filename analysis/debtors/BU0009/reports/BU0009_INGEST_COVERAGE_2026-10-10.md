# BU0009 — Ingest Coverage Report

**Generated:** 2026-10-10 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/BU0009/raw/BU0009_2026-10-10.TXT` |
| TXT as-at (last period row) | 2026-09-22 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 166 |
| Healthy / expected | 165 |
| Gaps | 1 |
| DB-only (not in TXT) | 19 |

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
| 35692 | Payment | 2024-12-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39405 | Invoice | 2024-12-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11609 | Crd Note | 2024-12-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39504 | Invoice | 2024-12-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35962 | Payment | 2025-01-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39894 | Invoice | 2025-01-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11704 | Crd Note | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11705 | Crd Note | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11711 | Crd Note | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39917 | Invoice | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39932 | Invoice | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36193 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40392 | Invoice | 2025-02-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11812 | Crd Note | 2025-02-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36802 | Payment | 2025-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11905 | Crd Note | 2025-02-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40706 | Invoice | 2025-02-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40707 | Invoice | 2025-02-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36792 | Payment | 2025-02-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 42900 | Bank UD | 2026-01-06 | DOCUMENT_TYPE_UNRESOLVED | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
