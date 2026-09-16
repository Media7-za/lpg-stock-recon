# WES002 (sibling account) — Operator Ingest Gate Projection

**As at:** 2026-09-16 · **Source:** `WES002_INGEST_COVERAGE_2026-09-16.json`

| Field | Value |
| :--- | :--- |
| Display status | `CURRENT_COMPLETE` |
| ingestFreshness | `current` — WES002.TXT ends **10 Apr 2026**; Supabase `transaction_headers` for WES002 also ends **10 Apr 2026** exactly. No new ERP activity since (account is dormant, under collection). |
| ingestCoverage | `complete` — all 84 documents resolve to header (+ line items where expected) |
| Financial balance from TXT | **ALLOWED** — Part 1 bridge ties at R0.00 |
| Custody / Part 2 | **BLOCKED** — same DB row-count anomaly as WES004 (see below); not a freshness or coverage issue for WES002 specifically |
| SKU analysis | **BLOCKED** — same reason |
| Allocation | Not applicable — lane is `position_recon` |

## DB row-count anomaly (shared with WES004)

Every `doc_no` in `transaction_headers` for WES002 has 2+ rows (up to 16 for some `Payment` docs), same pattern as WES004 — see `WES004_Ingest_Gate_Projection.md` for detail. This blocks Part 2 custody/SKU sign-off even though WES002's TXT itself is current and fully covered.

## Collections status (context, not an ingest concern)

WES002's `project.json` (dated 2026-06-15) records a Letter of Demand issued 2026-06-15 with a **2026-06-29 deadline**. That deadline is now ~11 weeks past with no recorded response or follow-up in `history`. No payment has posted since 10 Apr 2026. Recommend operator follow-up: confirm whether the demand was actioned/escalated, or whether it should be re-issued/escalated to the next collections step.

## Next Sources action

1. No fresh TXT pull needed for WES002 itself (already current — it's simply inactive).
2. Same as WES004: run `lpg-recon-bug-fixer` against the `transaction_headers` duplication before trusting any DB-derived custody/SKU figure for this account.
3. Operator: resolve the overdue Letter of Demand deadline (see above).
