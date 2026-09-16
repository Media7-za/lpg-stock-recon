# WES002 — Ingest Coverage Report (2026-09-16)

**Statement TXT:** `analysis/debtors/WES004/raw/WES002.TXT`  
**TXT as-at:** 2026-04-10  
**DB header sync as-at:** 2026-04-10 (checked via Supabase MCP `execute_sql` — `DATABASE_URL` not set in this session, so `npm run debtors:ingest-check` could not run natively; this report reproduces the same doc-level check by direct query)  
**Display status:** `CURRENT_COMPLETE`

| Check | Status |
| :--- | :--- |
| Documents in TXT | 84 |
| Header present in DB (`transaction_headers`) | 84/84 |
| Line items present in DB where expected (`transaction_items`) | 53/53 |
| `ingestFreshness` | **current** |
| `ingestCoverage` | **complete** |

## Gates

| Scope | Status |
| :--- | :--- |
| financial_balance_from_txt | **ALLOWED** |
| custody | **BLOCKED** |
| sku_analysis | **BLOCKED** |
| allocation | **NOT_APPLICABLE (position_recon lane)** |

> DATA INTEGRITY FLAG (not a TXT/DB coverage gap -- a separate DB row-count anomaly): every doc_no in transaction_headers for this account has 2+ rows (up to 16 for some Payment docs), spanning multiple source_file re-ingests (e.g. DTRX2603.TXT ingested 2026-04-12, DETRANS2307.TXT ingested 2026-07-26) plus what appear to be ERP allocation-detail sub-rows sharing one doc_no within a single file. Financial balance_from_txt is unaffected (built from TXT running balance only, per doctrine -- never from raw DB row sums). But any DB-derived SUM() over transaction_headers/transaction_items for this account (custody qty, SKU exposure) risks double- or multi-counting until root-caused. Recommend running the `lpg-recon-bug-fixer` skill against WES002/WES004 (and likely more of the portfolio, since this looks systemic to the ingest pipeline) before relying on DB sums for any account's custody/SKU figures. Custody and SKU gates are BLOCKED here pending that investigation, independent of TXT freshness.
