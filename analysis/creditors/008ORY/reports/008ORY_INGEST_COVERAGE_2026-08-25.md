# 008ORY — Creditor Ingest Coverage Report

**Generated:** 2026-08-25 · **Display status:** `STALE_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/creditors/008ORY/raw/008ORYCURRENT.TXT` |
| Linked accounts | 008ORY, 007ORY |
| TXT as-at (last period row) | 2026-08-25 |
| Items sync as-at (STDatabase) | 2026-08-25 |
| Ingest model | `lines_only` (GRV/DN) · `txt_only` (payments) |
| ingestFreshness | `stale` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 85 |
| Healthy / expected | 83 |
| Gaps | 2 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | BLOCKED |
| SKU analysis | BLOCKED |

## Document gaps

| Doc | Type | Date | Class |
| :--- | :--- | :--- | :--- |
| 3692 | Deb Note | 2026-08-25 | MISSING_LINES |
| 6831 | GRV | 2026-08-25 | MISSING_LINES |
