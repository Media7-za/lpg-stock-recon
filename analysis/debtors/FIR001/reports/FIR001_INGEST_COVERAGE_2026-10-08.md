# FIR001 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/FIR001/raw/FIR001CURRENT.TXT.TXT` |
| TXT as-at (last period row) | 2026-09-05 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 45 |
| Healthy / expected | 45 |
| Gaps | 0 |
| DB-only (not in TXT) | 22 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | ALLOWED |
| SKU analysis | ALLOWED |
| Allocation | ALLOWED |

## Document gaps

| Doc | Type | Date | Class | Blocks |
| :--- | :--- | :--- | :--- | :--- |
| 46084 | Payment | 2026-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53075 | Invoice | 2026-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53076 | Invoice | 2026-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15638 | Crd Note | 2026-09-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46099 | Payment | 2026-09-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15678 | Crd Note | 2026-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53192 | Invoice | 2026-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53193 | Invoice | 2026-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53213 | Invoice | 2026-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15675 | Crd Note | 2026-09-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53277 | Invoice | 2026-09-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53281 | Invoice | 2026-09-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15693 | Crd Note | 2026-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15694 | Crd Note | 2026-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53280 | Invoice | 2026-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46327 | Payment | 2026-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46328 | Payment | 2026-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53394 | Invoice | 2026-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46334 | Payment | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53480 | Invoice | 2026-10-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53481 | Invoice | 2026-10-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15770 | Crd Note | 2026-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
