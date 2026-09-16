# WES004 — Ingest Coverage Report (2026-09-16)

**Statement TXT:** `analysis/debtors/WES004/raw/WES004.TXT`  
**TXT as-at:** 2026-06-11  
**DB header sync as-at:** 2026-08-31 (checked via Supabase MCP `execute_sql` — `DATABASE_URL` not set in this session, so `npm run debtors:ingest-check` could not run natively; this report reproduces the same doc-level check by direct query)  
**Display status:** `STALE_COMPLETE`

| Check | Status |
| :--- | :--- |
| Documents in TXT | 91 |
| Header present in DB (`transaction_headers`) | 91/91 |
| Line items present in DB where expected (`transaction_items`) | 73/73 |
| `ingestFreshness` | **stale** |
| `ingestCoverage` | **complete** |

## Gates

| Scope | Status |
| :--- | :--- |
| financial_balance_from_txt | **ALLOWED** |
| custody | **BLOCKED** |
| sku_analysis | **BLOCKED** |
| allocation | **NOT_APPLICABLE (position_recon lane)** |

> PDP-31 (confirmed, tracked: https://media7.atlassian.net/browse/PDP-31) -- transaction_headers/transaction_items fingerprint dedup fails across re-exported files. Grouped on the true fingerprint-input tuple (account_no, entry_type, doc_no, ref_no, batch_ref, tx_date, amount_excl, tax_amount): WES004 has 67 true duplicate header groups / 69 extra rows (of 220); WES002 has 137 dup groups / 137 extra rows (of 292, dormant account, ~100% of item rows duplicated too). NOT every multi-row doc_no is this bug -- Payment docs legitimately carry several header rows under one doc_no (ERP allocation-detail sub-rows, ref_no='Alloc' or a settled invoice number, netting to the TXT's stated line) per WES004_BASELINE_v1.md 6.3; only rows duplicating on the full tuple above are PDP-31. Financial balance_from_txt is unaffected (built from TXT running balance only). Custody and SKU gates stay BLOCKED here pending the fingerprint fix + dedup migration landing (existing draft is transaction_items-only; PDP-31 comment flags it needs extending to transaction_headers).
