# MOZ002 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/MOZ002/raw/MOZ002CURRENT.TXT` |
| TXT as-at (last period row) | 2026-07-13 |
| Header sync as-at | 2026-10-05 |
| Items sync as-at | 2026-10-05 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 224 |
| Healthy / expected | 224 |
| Gaps | 0 |
| DB-only (not in TXT) | 27 |

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
| 45287 | Payment | 2026-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45202 | Payment | 2026-07-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15284 | Crd Note | 2026-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 51954 | Invoice | 2026-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 51955 | Invoice | 2026-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45333 | Payment | 2026-07-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45487 | Payment | 2026-07-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15404 | Crd Note | 2026-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52270 | Invoice | 2026-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52271 | Invoice | 2026-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45590 | Payment | 2026-08-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45714 | Payment | 2026-08-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15501 | Crd Note | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52662 | Invoice | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52663 | Invoice | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52911 | Invoice | 2026-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52912 | Invoice | 2026-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15591 | Crd Note | 2026-09-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15649 | Crd Note | 2026-09-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53111 | Invoice | 2026-09-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53112 | Invoice | 2026-09-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 46166 | Payment | 2026-09-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15738 | Crd Note | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15739 | Crd Note | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53401 | Invoice | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53402 | Invoice | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53403 | Invoice | 2026-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
