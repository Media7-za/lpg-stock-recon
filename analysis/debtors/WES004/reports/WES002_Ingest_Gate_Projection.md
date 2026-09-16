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

## PDP-31 — confirmed, not just suspected (shared with WES004)

Root-caused via the `lpg-recon-bug-fixer` skill and confirmed against this account: [PDP-31](https://media7.atlassian.net/browse/PDP-31) (`transaction_headers`/`transaction_items` fingerprint dedup fails across re-exported files). Grouped on the true fingerprint-input tuple (`account_no, entry_type, doc_no, ref_no, batch_ref, tx_date, amount_excl, tax_amount`), WES002 has **137 true duplicate header groups / 137 extra rows** (of 292 total) — every one sourced from both `DTRX2603.TXT` and `DETRANS2307.TXT`. At the item level, **100% of rows (116/116) sit in duplicate groups**: WES002 is dormant (no activity since 2026-04-10), so its entire item history was effectively re-ingested wholesale in the July 2026 export. This blocks Part 2 custody/SKU sign-off even though WES002's TXT itself is current and fully covered.

**Not every multi-row `doc_no` is this bug.** `Payment` docs legitimately carry several header rows sharing one `doc_no` (ERP allocation-detail sub-rows, `ref_no='Alloc'` or a settled invoice number) — e.g. doc `00040407` has 8 rows with different amounts that net to exactly the TXT's stated -R2,405.00. Already documented in `WES004_BASELINE_v1.md` §6.3; not a defect. Only rows duplicating on the full tuple above are PDP-31.

## Collections status (context, not an ingest concern)

WES002's `project.json` (dated 2026-06-15) records a Letter of Demand issued 2026-06-15 with a **2026-06-29 deadline**. That deadline is now ~11 weeks past with no recorded response or follow-up in `history`. No payment has posted since 10 Apr 2026. Recommend operator follow-up: confirm whether the demand was actioned/escalated, or whether it should be re-issued/escalated to the next collections step.

## Next Sources action

1. No fresh TXT pull needed for WES002 itself (already current — it's simply inactive).
2. PDP-31 is tracked and confirmed (see link above) — no further action from this account's side; wait for the fingerprint/dedup fix.
3. Operator: resolve the overdue Letter of Demand deadline (see above).
