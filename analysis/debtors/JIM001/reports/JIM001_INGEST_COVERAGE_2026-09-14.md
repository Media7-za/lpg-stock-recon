# JIM001 — Ingest Coverage Report

**Generated:** 2026-09-14 · **Display status:** `CURRENT_COMPLETE`

*Generated via the MCP-cache variant (DATABASE_URL unavailable in-session) -- sync_logs/transaction_headers/vw_clean_transactions lookups sourced via Supabase MCP query 2026-09-14 against project `oqhpxnaadahohwkslive`, same SQL as the shared `validate_txt_db_coverage.mjs`.*

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JIM001/raw/DEBENQ_CURRENT.TXT` |
| TXT as-at (last period row) | 2026-06-05 |
| Header sync as-at | 2026-09-12 |
| Items sync as-at | 2026-09-12 |
| ingestFreshness | `current` |
| ingestCoverage | `complete` |
| Documents in TXT (period) | 208 |
| Healthy / expected | 208 |
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
