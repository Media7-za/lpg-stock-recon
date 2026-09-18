# JAY000 — Ingest Coverage Report

**Generated:** 2026-09-14 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JAY000/raw/JAY000CURRENT.TXT.TXT` |
| TXT as-at (last period row) | 2026-09-03 |
| Header sync as-at | 2026-09-12 |
| Items sync as-at | 2026-09-12 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 9 |
| Healthy / expected | 9 |
| Gaps | 0 |
| DB-only (not in TXT) | 0 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | ALLOWED |
| SKU analysis | ALLOWED |
| Allocation | ALLOWED |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
