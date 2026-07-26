# JEN001 — Ingest Coverage Report

**Generated:** 2026-07-26 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JEN001/raw/JEN00116JULY.TXT` |
| TXT as-at (last period row) | 2026-07-14 |
| Header sync as-at | 2026-07-26 |
| Items sync as-at | 2026-07-26 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 63 |
| Healthy / expected | 63 |
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
| 52044 | Invoice | 2026-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15317 | Crd Note | 2026-07-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52050 | Invoice | 2026-07-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52051 | Invoice | 2026-07-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15329 | Crd Note | 2026-07-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
