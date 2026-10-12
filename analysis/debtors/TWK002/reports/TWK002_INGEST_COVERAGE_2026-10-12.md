# TWK002 — Ingest Coverage Report

**Generated:** 2026-10-12 · **Display status:** `CURRENT_COMPLETE`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/TWK002/raw/TWK002_2026-10-08.TXT` |
| TXT as-at (last period row) | 2026-10-08 |
| Header sync as-at | 2026-10-10 |
| Items sync as-at | 2026-10-10 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 117 |
| Healthy / expected | 117 |
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
