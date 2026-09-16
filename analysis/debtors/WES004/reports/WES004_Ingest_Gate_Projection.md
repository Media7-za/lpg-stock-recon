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
2. **PDP-31 — confirmed, not just suspected.** The `lpg-recon-bug-fixer` skill root-caused this: `syncService.ts` upserts on `onConflict: 'fingerprint'`, and `computeFingerprint()` in `src/lib/erpImportEngine.ts` produced a different hash for byte-identical data re-exported under a different `source_file`. WES004 header doc `00048117` reproduces the signature exactly — recomputing today's fingerprint algorithm over the stored fields yields the *newer* row's fingerprint precisely, never the older one. Grouped on the true fingerprint-input tuple (`account_no, entry_type, doc_no, ref_no, batch_ref, tx_date, amount_excl, tax_amount` — not `doc_no` alone), WES004 has **67 true duplicate groups / 69 extra header rows** (of 220 total) and **142/164 (86.6%)** of item rows sit in duplicate groups. WES002 is worse: **137 dup groups / 137 extra header rows** (of 292) and **100% of item rows** duplicated (dormant account — its whole history was re-ingested wholesale). Full writeup and the reproduction query: [PDP-31 comment](https://media7.atlassian.net/browse/PDP-31).
   - **Correction to the original "every doc_no has 2-16 rows" framing:** most of that multiplicity is *not* this bug. `Payment` docs legitimately carry multiple header rows under one `doc_no` (ERP allocation-detail sub-rows, `ref_no='Alloc'` or a settled invoice number, each with a genuinely different `amount_excl` that nets to the TXT's single stated line) — already documented in `WES004_BASELINE_v1.md` §6.3, not a defect. Only rows that duplicate on the *full* fingerprint-input tuple (same `ref_no`/amount too, sourced from both `DTRX2603.TXT` and `DETRANS2307.TXT`) are the real PDP-31 bug.

## Next Sources action

1. Pull a **fresh WES004 statement TXT** from the ERP (as-at today or later) and drop it in `raw/`.
2. PDP-31 is tracked and confirmed (see link above). No fix needed from this account's side — wait for the `computeFingerprint`/dedup-migration fix to land (draft dedup SQL is `transaction_items`-only today; the header-level extension found here still needs a reviewed draft + human sign-off before any historical rows are touched).
3. Re-run `npm run debtors:ingest-check -- --debtor WES004` (requires `DATABASE_URL` — not set in this remote session; coverage above was computed by direct Supabase MCP query as a substitute) once (1) and (2) are resolved.
4. Target: `CURRENT_COMPLETE` with a clean custody gate before signing off Part 2.
