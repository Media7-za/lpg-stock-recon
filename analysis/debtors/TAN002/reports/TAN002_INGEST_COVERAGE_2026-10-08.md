# TAN002 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TAN002/raw/TAN002CURRENT.TXT` |
| TXT as-at (last period row) | 2026-08-20 |
| Header sync as-at | 2026-10-05 |
| Items sync as-at | 2026-10-05 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 248 |
| Healthy / expected | 248 |
| Gaps | 0 |
| DB-only (not in TXT) | 7 |

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
| 11976 | Crd Note | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41042 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41043 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46208 | Payment | 2026-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46208 | Payment | 2026-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53267 | Invoice | 2026-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53368 | Invoice | 2026-09-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
