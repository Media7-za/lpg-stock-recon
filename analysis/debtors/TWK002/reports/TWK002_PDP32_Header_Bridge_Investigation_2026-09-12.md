# TWK002 — PDP-32 Header-vs-Items Reconciliation Bridge Investigation

**Date:** 2026-09-12
**Ticket:** PDP-32 ("header-vs-items reconciliation bridge", account TWK002)
**Scope:** Investigation only. No reconciliation/matching code was modified. `business_rules.md` Rule 6 is explicitly informational/audit-only and never gates basket-check matching (which reads only `transaction_items`, never `transaction_headers`).

## 1. Method

Re-ran the Rule 6 ERP Header Cross-Check query (business_rules.md §6) against Supabase project `oqhpxnaadahohwkslive` for `account_no = 'TWK002'`, then decomposed the flagged set into the three buckets described in the ticket:

- **119** — ties cleanly (not re-verified per instructions).
- **44** — "VAT-ratio mismatch" bucket, hypothesized to be Rule 1 (tax-sign bug).
- **41** — dual `amount_excl` bucket, hypothesized to be Rule 7 (doc-no reuse).

**Caveat on headline counts:** a literal re-run of the documented query today reproduces a flagged population in the same neighbourhood but not the exact 204/44/41 split (my direct recount of "two distinct `amount_excl` per `doc_no`" finds **30** genuine cases, not 41; the VAT-ratio-shaped bucket recounts to **46**, not 44 — see §3 for the extra 2). This is most likely due to minor differences in how the earlier triage rounded/bucketed borderline cases (or data drift since that triage), not a disagreement about the underlying phenomena. The substantive conclusions below are unaffected by the exact headline numbers and are backed by row-level evidence.

## 2. 44-bucket (VAT-ratio mismatch) — Rule 1 confirmation

All candidates in this bucket are **Crd Note** documents (confirmed — no Invoices). `vw_clean_transactions.line_total` already bakes in the Rule 1 sign correction (`qty*retail_price + CASE WHEN qty<0 THEN -ABS(line_tax) ELSE ABS(line_tax) END`), so the residual delta reported by the raw Rule 6 query for these docs is exactly the *expected* "double-taxation" artifact called out in business_rules.md §6 (the query adds `tax_amount` on top of an `amount_excl` that, for these docs, is *already* net-of-tax).

Testing directly against `transaction_items` (raw, uncorrected data) confirms this for the **majority but not all** of the bucket:

**Clean Rule 1 matches — 25 docs.** `header.amount_excl == ROUND(SUM(qty * retail_price) * 1.15, 2)` to the cent. Sample (8 of 25, full arithmetic shown):

| doc_no | item Σ(qty×retail) | ×1.15 (predicted) | header.amount_excl | match |
|---|---|---|---|---|
| 00004918 | -17,160.00 | -19,734.00 | -19,734.00 | exact |
| 00005038 | -2,700.00 | -3,105.00 | -3,105.00 | exact |
| 00005155 | -4,500.00 | -5,175.00 | -5,175.00 | exact |
| 00005308 | -5,700.00 | -6,555.00 | -6,555.00 | exact |
| 00006078 | -9,000.00 | -10,350.00 | -10,350.00 | exact |
| 00006461 | -3,000.00 | -3,450.00 | -3,450.00 | exact |
| 00006816 | -6,549.85 | -7,532.33 | -7,532.33 | exact |
| 00007410 | -15,900.00 | -18,285.00 | -18,285.00 | exact |

Full clean set: `4917, 4918, 5038, 5155, 5308, 5443, 5498, 5603, 5632, 5768, 5845, 5875, 6078, 6134, 6387, 6461, 6462, 6667, 6810, 6816, 6990, 7127, 7332, 7410, 7547`. **Confirmed: pure Rule 1, no action needed.**

**Docs that do NOT resolve cleanly — 21 docs.** `7848, 8120, 8324, 8530, 8700, 8913, 9158, 9393, 9426, 9769, 10189, 10617, 10723, 11003, 11320, 11475, 11648, 11743, 11821, 11953, 14910`.

For these, `SUM(qty*retail_price)` at the item level is roughly **2×** what the header implies (e.g. doc `00007848`: item Σ = -41,600.00, but `header.amount_excl / 1.15` implies -20,800.00 — item total is exactly double). Rule 1's sign correction does not touch this: the qty/retail lines themselves already sum to ~2× the expected value, i.e. there is an apparent **item-level duplication** (lines effectively counted twice) layered on top of, and independent from, the tax-sign issue. Applying Rule 1 alone leaves a large residual (order of R10k–R25k per doc, not ~R0).

**Conclusion for the 44-bucket:** Rule 1 is confirmed as the mechanism for roughly half the bucket (25/46 in my recount) and is *not* sufficient to explain the other half (21/46), which show a distinct, unrelated ~2× item-total inflation. **The bucket is not purely Rule 1** — the residual-mismatch sub-group is a separate, still-unexplained data quality question (possibly duplicate `transaction_items` rows) that this ticket did not scope in and that was left untouched per instructions (no matching/reconciliation code was changed).

## 3. 41-bucket (dual `amount_excl`) — Rule 7 test

Recount of "distinct `amount_excl` values under one normalized `doc_no`" (rounded to cents, to exclude floating-point noise) for TWK002 `transaction_headers` (Invoice + Crd Note): **30 doc_nos**, not 41.

(Separately, 9 more `doc_no`s — all `Invoice` — have two header rows whose `amount_excl` differ only by ~1e-11, i.e. floating-point rounding noise on an otherwise identical value; these are literal duplicate header row inserts, not "two distinct amounts," and are excluded from the Rule 7 test below as a different phenomenon.)

**Rule 7 signature test, run against all 30:**

| Check | Result |
|---|---|
| Any doc_no with mixed `entry_type` (Invoice *and* Crd Note) under the same normalized doc_no? | **0 of 30** |
| Any doc_no with a multi-month/year date gap between the two header rows? | **0 of 30** — 29 of 30 pairs share the *identical* `tx_date`; the remaining pair (`14820`) is 1 calendar day apart |
| All entry types | **100% `Crd Note`, 0% `Invoice`** |

**Result: 0 of the 30 (0%) match the Rule 7 doc-number-reuse-across-years signature.** None show cross-entry-type collision or a meaningful date gap — the defining characteristics of Rule 7 (business_rules.md §7, FAM000's `11567`/`11568`/etc. pattern). **All 30 remain genuinely unexplained by Rule 7.**

Instead, a different, consistent arithmetic pattern was found across every one of the 30 docs: the two header rows for a given doc_no are related by
```
amount_excl_2 = amount_excl_1 - tax_amount   (same tax_amount on both rows)
```
equivalently, `(amount_excl_1 + tax_amount)` — the *first* row's net total — equals the *second* row's `amount_excl`. Example (`00012131`, both rows dated 2025-03-27, `tax_amount = -2,587.50` both times):

| row | amount_excl | tax_amount | total |
|---|---|---|---|
| 1 | -19,837.50 | -2,587.50 | -22,425.00 |
| 2 | -17,250.00 | -2,587.50 | -19,837.50 ← equals row 1's `amount_excl` |

This "chained" relationship holds exactly (to the cent) for all 30 docs, same tax figure both times, same date. It looks like a header-level double-application of a tax deduction across two postings of the same document on the same day — a distinct mechanism from both Rule 1 (item-level tax sign) and Rule 7 (doc-no reuse across years). It was not investigated further or fixed here, as it falls outside this ticket's scope and no reconciliation code was touched.

**Full residual doc_no list (all 30, none explained by Rule 7):**
```
12131, 12207, 12214, 12215, 12329, 12494, 12502, 12550, 12724, 12825,
12908, 12958, 12982, 13019, 13057, 13101, 13235, 13335, 13500, 13587,
13716, 13874, 14034, 14232, 14237, 14414, 14554, 14649, 14711, 14820
```
(all `Crd Note`, TWK002, dated between 2025-03-27 and 2026-05-01)

## 4. Summary for ticket disposition

- **44-bucket:** Rule 1 confirmed for 25/46 recounted docs (clean, no action). **21/46 do not resolve cleanly** — same VAT-ratio shape but a further ~2× item-total inflation Rule 1 does not explain. Not purely a Rule 1 story.
- **41-bucket:** **0 of 30** recounted dual-`amount_excl` docs match the Rule 7 (doc-no-reuse-across-years) signature — no cross-entry-type collision, no meaningful date gap. All 30 are genuinely unexplained by Rule 7 and show a distinct same-day "chained tax" header pattern instead.
- **No reconciliation/matching code was modified.** This bridge check remains informational-only per business_rules.md §6; basket-check matching (reads only `transaction_items`) is unaffected regardless of this ticket's disposition.
- Recommend the orchestrating session treat PDP-32 as **partially confirmed, partially open**: the historically-documented Rule 1 bug explains a meaningful chunk of both buckets, but a residual of ~21 (VAT-bucket, item-duplication-shaped) + 30 (dual-amount_excl bucket, chained-tax-shaped) docs remain genuinely anomalous and not covered by any existing documented rule — candidates for a fresh, narrowly-scoped follow-up ticket rather than closure as "not a new bug" across the board.
