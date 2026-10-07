# JEN001 — Ingest Coverage Report

**Generated:** 2026-10-07 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JEN001/raw/DEBENQ.TXT` |
| TXT as-at (last period row) | 2026-08-14 |
| Header sync as-at | 2026-10-05 |
| Items sync as-at | 2026-10-05 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 22 |
| Healthy / expected | 22 |
| Gaps | 0 |
| DB-only (not in TXT) | 11 |

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
| 15506 | Crd Note | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52648 | Invoice | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 52649 | Invoice | 2026-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53029 | Invoice | 2026-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53030 | Invoice | 2026-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15627 | Crd Note | 2026-09-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15682 | Crd Note | 2026-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53224 | Invoice | 2026-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53225 | Invoice | 2026-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53468 | Invoice | 2026-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 53469 | Invoice | 2026-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
