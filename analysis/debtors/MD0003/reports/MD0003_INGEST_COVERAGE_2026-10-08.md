# MD0003 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/MD0003/raw/MD0003_2026-10-08.TXT` |
| TXT as-at (last period row) | 2026-10-08 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 273 |
| Healthy / expected | 270 |
| Gaps | 3 |
| DB-only (not in TXT) | 37 |

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
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35876 | Payment | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11664 | Crd Note | 2025-01-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39753 | Invoice | 2025-01-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39784 | Invoice | 2025-01-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11685 | Crd Note | 2025-01-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39842 | Invoice | 2025-01-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39843 | Invoice | 2025-01-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11728 | Crd Note | 2025-01-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40016 | Invoice | 2025-01-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40024 | Invoice | 2025-01-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40112 | Invoice | 2025-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11882 | Crd Note | 2025-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40661 | Invoice | 2025-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40662 | Invoice | 2025-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11915 | Crd Note | 2025-02-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40803 | Invoice | 2025-02-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40804 | Invoice | 2025-02-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40954 | Invoice | 2025-02-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11968 | Crd Note | 2025-02-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41010 | Invoice | 2025-02-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41011 | Invoice | 2025-02-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15774 | Crd Note | 2026-10-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 53508 | Invoice | 2026-10-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |
| 53509 | Invoice | 2026-10-08 | MISSING_HEADER_AND_LINES | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
