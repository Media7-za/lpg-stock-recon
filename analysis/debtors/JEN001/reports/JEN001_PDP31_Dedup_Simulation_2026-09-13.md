# JEN001 — PDP-31 Dedup Migration: Read-Only Before/After Simulation

**Date:** 2026-09-13
**Ticket:** PDP-31 (fingerprint-drift duplicate `transaction_items` rows), fix merged in `claude/friendly-maxwell-ncrgsc` (commit `d754d0c`)
**Migration under test:** `analysis/debtors/shared/scripts/pdp31_dedup_transaction_items.sql` — **still NOT executed against production**, still pending manual review.

## Method

No Supabase branch was created for this. A branch (`create_branch`) provisions schema-only — "production data will not carry over" — so it would have given an empty `transaction_items`/`transaction_headers` and nothing to actually test. Since the migration's dedup policy is a pure row exclusion (within each `(account_no, doc_no, entry_type, stock_no, qty, retail_price, tx_date)` group, keep the smallest `id`, drop the rest), its effect on any aggregate is fully computable with a read-only `SELECT` against production — a `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY id)` CTE marks which rows the `DELETE` would remove, and both "before" and "after" `SUM(line_total)` are computed from the same read. **No writes were made to production at any point.**

`line_total` is computed inline exactly as `vw_clean_transactions` defines it (Rule 1 sign-corrected): `(qty * retail_price) + CASE WHEN qty < 0 THEN -abs(line_tax) ELSE abs(line_tax) END`.

Window: `tx_date BETWEEN '2024-03-01' AND '2026-05-31'` (the confirmed affected window from the PDP-31 fix commit).

## Aggregate: rows the migration would delete

| Metric | Value |
|---|---|
| Total item rows in window (before) | 481 |
| Item rows after dedup | 246 |
| Rows the migration would delete | 235 |
| `line_total` removed | R267,408.21 |
| Distinct docs affected | 180 |

## Reconciliation tie-out (Rule 6 cross-check), split by confound

180 affected docs were joined against `transaction_headers` (matched on `account_no` + normalized `doc_no` + `entry_type`, per Rule 7's collision-safe join pattern). **125 of the 180 (69%) also carry PDP-32/PDP-34's separate, still-open header-duplication problem** (two `transaction_headers` rows for the same doc) — mixing these into one comparison would be meaningless, so they're split:

| Cohort | Docs | Ties clean before | Ties clean after | Abs. delta before | Abs. delta after |
|---|---|---|---|---|---|
| Clean single header | 55 | 0 | **42 (76%)** | R207,714.80 | **R5,749.81** (−97%) |
| Confounded (dual header, PDP-34) | 125 | 78 | 0 | R65,383.64 | R590,057.26 |

**Read the confounded row carefully — it is not evidence the dedup is wrong.** The 78/125 "clean" ties *before* the item-level fix are almost certainly two independent bugs coincidentally cancelling: the item total was inflated ~2x by PDP-31, and the header total is *also* wrong (PDP-34, two header rows), and removing only the item-side duplication breaks that accidental cancellation. PDP-31 and PDP-34 need to be resolved together before this cohort's tie-out is a meaningful signal at all. See PDP-34 (Jira) for the cross-reference — this finding was added there.

## Hand-verification samples (clean-header cohort, largest deltas first)

| doc_no | entry_type | rows before→after | before_total | after_total | ERP header total | delta_after |
|---|---|---|---|---|---|---|
| 00038859 | Invoice | 8→4 | 20,377.14 | 10,188.57 | 10,188.57 | 0.00 |
| 00039192 | Invoice | 4→2 | 15,550.26 | 7,775.13 | 7,775.13 | 0.00 |
| 00030227 | Invoice | 4→2 | 14,091.74 | 7,045.87 | 7,045.87 | 0.00 |
| 00030652 | Invoice | 4→2 | 14,091.74 | 7,045.87 | 7,045.87 | 0.00 |
| 00033353 | Invoice | 4→2 | 10,190.20 | 5,095.10 | 5,095.10 | 0.00 |
| 00036892 | Invoice | 6→3 | 10,099.54 | 5,049.77 | 5,049.77 | 0.00 |
| 00036084 | Invoice | 4→2 | 10,099.54 | 5,049.77 | 5,049.77 | 0.00 |
| 00011960 | Crd Note | 4→2 | -11,385.00 | -5,692.50 | -6,435.00* | 742.50* |
| 00032195 | Invoice | 4→2 | 8,552.48 | 4,276.24 | 4,276.24 | 0.00 |
| 00032589 | Invoice | 4→2 | 8,552.48 | 4,276.24 | 4,276.24 | 0.00 |
| 00034870 | Invoice | 4→2 | 8,552.48 | 4,276.24 | 4,276.24 | 0.00 |

`00030227` is the exact doc used as the pinned/golden regression test in the PDP-31 commit (`erpImportEngine.test.ts`) — good independent cross-confirmation that the dedup and the code fix agree.

**\*00011960 investigated directly, not a residual dedup gap:** its header row has `amount_excl = -5,692.50` and `tax_amount = -742.50` stored separately (source: `DTRX2603.TXT`). The naive `amount_excl + tax_amount` cross-check used above computes -6,435.00 and shows a R742.50 "residual" — but this is exactly the already-documented Rule 1 tax double-count on a Credit Note (business_rules.md §1/§6: expected, not a defect). The item total after dedup (-5,692.50) ties *exactly* to `amount_excl` alone. This doc is fully explained; the dedup fully resolves its item-level duplication and the remaining "delta" shown by the raw cross-check formula is the pre-existing, tolerated Rule 1 artifact, not a gap in this fix.

## Conclusion

On docs where item-level duplication (PDP-31) is the only thing wrong, the dedup migration recovers near-perfect header tie-out (97% delta reduction, 0→76% clean ties). It has not yet been executed against production — see the migration script header for review status.
