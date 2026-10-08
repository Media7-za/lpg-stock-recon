# MON001 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/MON001/raw/MON001CURRENT_FROM202401.TXT` |
| TXT as-at (last period row) | 2026-07-22 |
| Header sync as-at | 2026-10-05 |
| Items sync as-at | 2026-10-05 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 86 |
| Healthy / expected | 84 |
| Gaps | 2 |
| DB-only (not in TXT) | 49 |

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
| 34081 | Invoice | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34082 | Invoice | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45158 | Payment | 2024-07-11 | MISSING_HEADER | custody, sku_analysis, allocation |
| 9311 | Crd Note | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35241 | Invoice | 2024-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35242 | Invoice | 2024-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9834 | Crd Note | 2024-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32849 | Payment | 2024-08-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33672 | Payment | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33672 | Payment | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33672 | Payment | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33672 | Payment | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33672 | Payment | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36720 | Invoice | 2024-09-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36721 | Invoice | 2024-09-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10514 | Crd Note | 2024-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39293 | Payment | 2024-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11103 | Crd Note | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38044 | Invoice | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38045 | Invoice | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11205 | Crd Note | 2024-11-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38283 | Invoice | 2024-11-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35241 | Payment | 2024-11-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11510 | Crd Note | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35818 | Payment | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39150 | Invoice | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35817 | Payment | 2025-01-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36258 | Payment | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36258 | Payment | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11714 | Crd Note | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39953 | Invoice | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39972 | Invoice | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36737 | Payment | 2025-02-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11874 | Crd Note | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40628 | Invoice | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40629 | Invoice | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52130 | Invoice | 2026-01-27 | MISSING_HEADER | custody, sku_analysis, allocation |
| 45589 | Payment | 2026-08-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15578 | Crd Note | 2026-08-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52879 | Invoice | 2026-08-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52880 | Invoice | 2026-08-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15750 | Crd Note | 2026-10-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53432 | Invoice | 2026-10-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53433 | Invoice | 2026-10-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
