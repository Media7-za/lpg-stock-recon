# TWK002 — Ingest Coverage Report

**Generated:** 2026-08-29 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT` |
| TXT as-at (last period row) | 2026-08-09 |
| Header sync as-at | 2026-08-27 |
| Items sync as-at | 2026-08-27 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 99 |
| Healthy / expected | 99 |
| Gaps | 0 |
| DB-only (not in TXT) | 4 |

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
| 15443 | Crd Note | 2026-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52484 | Invoice | 2026-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15553 | Crd Note | 2026-08-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52803 | Invoice | 2026-08-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
