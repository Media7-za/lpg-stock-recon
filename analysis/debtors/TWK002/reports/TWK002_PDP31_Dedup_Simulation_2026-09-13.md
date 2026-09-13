# TWK002 — PDP-31 Dedup Migration: Read-Only Before/After Simulation

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
| Total item rows in window (before) | 659 |
| Item rows after dedup | 334 |
| Rows the migration would delete | 325 |
| `line_total` removed | R469,486.42 |
| Distinct docs affected | 112 |

## Reconciliation tie-out (Rule 6 cross-check), split by confound

112 affected docs were joined against `transaction_headers` (matched on `account_no` + normalized `doc_no` + `entry_type`, per Rule 7's collision-safe join pattern). **62 of the 112 (55%) also carry PDP-32/PDP-34's separate, still-open header-duplication problem** (two `transaction_headers` rows for the same doc) — mixing these into one comparison would be meaningless, so they're split:

| Cohort | Docs | Ties clean before | Ties clean after | Abs. delta before | Abs. delta after |
|---|---|---|---|---|---|
| Clean single header | 50 | 0 | **31 (62%)** | R888,747.25 | **R43,570.11** (−95%) |
| Confounded (dual header, PDP-34) | 62 | 32 | 0 | R90,870.50 | R1,175,301.52 |

**Read the confounded row carefully — it is not evidence the dedup is wrong.** The 32/62 "clean" ties *before* the item-level fix are almost certainly two independent bugs coincidentally cancelling: the item total was inflated ~2x by PDP-31, and the header total is *also* wrong (PDP-34, two header rows), and removing only the item-side duplication breaks that accidental cancellation. PDP-31 and PDP-34 need to be resolved together before this cohort's tie-out is a meaningful signal at all. See PDP-34 (Jira) for the cross-reference — this finding was added there.

## Hand-verification samples (clean-header cohort, largest deltas first)

| doc_no | entry_type | rows before→after | before_total | after_total | ERP header total | delta_after |
|---|---|---|---|---|---|---|
| 00038582 | Invoice | 12→6 | 69,680.14 | 34,840.07 | 34,840.07 | 0.00 |
| 00032425 | Invoice | 6→3 | 56,212.00 | 28,106.00 | 28,106.00 | 0.00 |
| 00033278 | Invoice | 4→2 | 53,820.00 | 26,910.00 | 26,910.00 | 0.00 |
| 00039683 | Invoice | 12→6 | 53,531.84 | 26,765.92 | 26,765.92 | 0.00 |
| 00040950 | Invoice | 12→6 | 50,915.74 | 25,457.87 | 25,457.87 | 0.00 |
| 00030763 | Invoice | 4→2 | 47,840.00 | 23,920.00 | 23,920.00 | 0.00 |
| 00036006 | Invoice | 4→2 | 47,840.00 | 23,920.00 | 23,920.00 | 0.00 |
| 00040459 | Invoice | 12→6 | 45,891.90 | 22,945.95 | 22,945.95 | 0.00 |

All eight tie to the cent after dedup — no residuals to investigate in this account's clean cohort (contrast with JEN001's `00011960`, which needed a Rule 1 carve-out explained in that account's report).

## Conclusion

On docs where item-level duplication (PDP-31) is the only thing wrong, the dedup migration recovers near-perfect header tie-out (95% delta reduction, 0→62% clean ties). It has not yet been executed against production — see the migration script header for review status.
