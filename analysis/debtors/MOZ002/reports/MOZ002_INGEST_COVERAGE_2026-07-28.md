# MOZ002 — Ingest Coverage Report

**Generated:** 2026-07-28 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/MOZ002/raw/MOZ002CURRENT.TXT` |
| TXT as-at (last period row) | 2026-07-13 |
| Header sync as-at | 2026-07-26 |
| Items sync as-at | 2026-07-26 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 224 |
| Healthy / expected | 224 |
| Gaps | 0 |
| DB-only (not in TXT) | 5 |

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
| 45287 | Payment | 2026-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 45202 | Payment | 2026-07-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15284 | Crd Note | 2026-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 51954 | Invoice | 2026-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 51955 | Invoice | 2026-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
