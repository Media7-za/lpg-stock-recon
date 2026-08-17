# 008ORY — Creditor Ingest Coverage Report

**Generated:** 2026-08-17 · **Display status:** `UNVERIFIED`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/creditors/008ORY/raw/008ORYCURRENT.TXT` |
| Linked accounts | 008ORY, 007ORY |
| TXT as-at (last period row) | 2026-07-08 |
| Header sync as-at | unverified |
| Items sync as-at | unverified |
| ingestFreshness | `unverified` |
| ingestCoverage | `unverified` |
| Documents in TXT (period) | 18 |
| Healthy / expected | 6 |
| Gaps | 12 |
| DB-only (not in TXT) | 0 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | UNVERIFIED |
| SKU analysis | UNVERIFIED |
| Allocation | UNVERIFIED |

> **DATABASE_URL not set.** TXT ↔ DB coverage could not be verified; custody / SKU / allocation lanes are `UNVERIFIED` and Part 2 qty must not be trusted until Supabase is wired and this check re-run.

## Document gaps

| Doc | Type | Date | Class | Blocks |
| :--- | :--- | :--- | :--- | :--- |
| 31810 | Deb Note | 2026-07-01 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58291 | GRV | 2026-07-01 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 31811 | Deb Note | 2026-07-02 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58292 | GRV | 2026-07-02 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 31812 | Deb Note | 2026-07-03 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58293 | GRV | 2026-07-03 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 31813 | Deb Note | 2026-07-04 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58294 | GRV | 2026-07-04 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 31814 | Deb Note | 2026-07-06 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58295 | GRV | 2026-07-06 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 31815 | Deb Note | 2026-07-08 | DB_UNVERIFIED | custody, sku_analysis, allocation |
| 58296 | GRV | 2026-07-08 | DB_UNVERIFIED | custody, sku_analysis, allocation |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the creditor statement TXT manifest to database feeds. It does **not** infer missing GRV lines from Deb Notes.
