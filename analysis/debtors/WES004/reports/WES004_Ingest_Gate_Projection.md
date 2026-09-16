# WES004 — Operator Ingest Gate Projection

**As at:** 2026-09-16 · **Source:** `WES004_INGEST_COVERAGE_2026-09-16.json`

| Field | Value |
| :--- | :--- |
| Display status | `STALE_COMPLETE` |
| ingestFreshness | `stale` — WES004.TXT ends **11 Jun 2026**; Supabase `transaction_headers`/`transaction_items` for WES004 run through **31 Aug 2026** (20 extra documents, ~R7,081.67 net movement) |
| ingestCoverage | `complete` — every one of the 91 documents in WES004.TXT resolves to header (+ line items where an Invoice/Crd Note/Journal expects them) in the DB |
| Financial balance from TXT | **ALLOWED** — Part 1 bridge ties at R0.00 as at 11 Jun 2026 |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | Not applicable — lane is `position_recon`, not `allocation` |

## Why custody/SKU are blocked (two independent reasons)

1. **Staleness** — even if DB SKU sums were trustworthy, they'd need to be sliced to the TXT's 11 Jun cutoff to avoid pulling in 3 months of untied activity.
2. **DB row-count anomaly** — every `doc_no` for WES004 (and WES002) has 2+ rows in `transaction_headers` (up to 16 for some `Payment` docs), from overlapping periodic re-exports (`DTRX2603.TXT`, `DETRANS2307.TXT`, ...) plus apparent ERP allocation-detail sub-rows sharing one `doc_no`. A naive `SUM(qty)` or `SUM(amount)` over `transaction_items`/`transaction_headers` for this account would overstate custody exposure. Needs the `lpg-recon-bug-fixer` skill to root-cause before Part 2 can be trusted for *any* account, not just this one.

## Next Sources action

1. Pull a **fresh WES004 statement TXT** from the ERP (as-at today or later) and drop it in `raw/`.
2. Run the `lpg-recon-bug-fixer` skill against the `transaction_headers` duplication pattern (WES002/WES004 confirmed affected; likely portfolio-wide — same pipeline, same source files).
3. Re-run `npm run debtors:ingest-check -- --debtor WES004` (requires `DATABASE_URL` — not set in this remote session; coverage above was computed by direct Supabase MCP query as a substitute) once (1) and (2) are resolved.
4. Target: `CURRENT_COMPLETE` with a clean custody gate before signing off Part 2.
