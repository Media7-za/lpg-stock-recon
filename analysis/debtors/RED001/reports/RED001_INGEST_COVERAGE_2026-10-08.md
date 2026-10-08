# RED001 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/RED001/raw/RED001CURRENT.TXT` |
| TXT as-at (last period row) | 2026-07-25 |
| Header sync as-at | 2026-10-05 |
| Items sync as-at | 2026-10-05 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 108 |
| Healthy / expected | 107 |
| Gaps | 1 |
| DB-only (not in TXT) | 30 |

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
| 15366 | Crd Note | 2026-07-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52217 | Invoice | 2026-07-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52218 | Invoice | 2026-07-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45584 | Payment | 2026-08-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15418 | Crd Note | 2026-08-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52382 | Invoice | 2026-08-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52383 | Invoice | 2026-08-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45715 | Payment | 2026-08-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15462 | Crd Note | 2026-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52545 | Invoice | 2026-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52546 | Invoice | 2026-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15493 | Crd Note | 2026-08-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52635 | Invoice | 2026-08-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52636 | Invoice | 2026-08-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15519 | Crd Note | 2026-08-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52705 | Invoice | 2026-08-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52706 | Invoice | 2026-08-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52842 | Invoice | 2026-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15570 | Crd Note | 2026-08-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52843 | Invoice | 2026-08-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53043 | Invoice | 2026-09-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53044 | Invoice | 2026-09-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15630 | Crd Note | 2026-09-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53163 | Invoice | 2026-09-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53164 | Invoice | 2026-09-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15667 | Crd Note | 2026-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53283 | Invoice | 2026-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53422 | Invoice | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53423 | Invoice | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15742 | Crd Note | 2026-10-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
