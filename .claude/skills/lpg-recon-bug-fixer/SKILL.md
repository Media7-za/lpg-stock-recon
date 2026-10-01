---
name: lpg-recon-bug-fixer
description: Diagnose and fix data-integrity bugs in the media7-za/lpg-stock-recon codebase — ERP import duplication, payment-allocation mistargeting, and header/line-item mismatches. Use this whenever debugging why reconciliation numbers don't tie out, why a document appears duplicated or missing in transaction_items/allocation_edges.csv, why a payment allocated to the wrong invoice, or when triaging a new Jira ticket in the PDP project about this repo's debtor/creditor reconciliation. Also use when asked to root-cause a discrepancy between the ERP's stated balance and a reconciliation script's computed balance for any account in this repo, even if the request doesn't mention a specific bug by name.
---

# LPG Recon Bug Fixer

This repo reconciles LPG distributor debtor/creditor accounts against ERP exports. Its data-integrity bugs share a shape: something upstream of the final report silently corrupts, duplicates, or mistargets a row, and the report still *runs* — it just produces a subtly wrong number. That's what makes them dangerous and why this skill exists: naive "does the report run" checks don't catch them, only checks that compare against an independent ground truth do.

**Read `analysis/debtors/shared/docs/business_rules.md` before touching any bug in this codebase.** It documents known quirks (tax-sign inversion, doc-number reuse, SKU dual-line patterns, etc.) that look exactly like bugs but are actually already-understood ERP behavior. Half the value of debugging here is telling "known quirk" apart from "new defect" — check the doctrine first so you don't reopen a solved problem, or worse, "fix" expected behavior into something wrong. But don't over-trust it either — PDP-34 (below) is a case where the documented rules were checked first and genuinely didn't explain the data, which is exactly what should happen next when they don't.

## Ground truth hierarchy

Before trusting any number this codebase produces, know what actually anchors it:

1. **ERP raw `.TXT`/`CURRENT BALANCE` export** — the actual source of truth. Everything else is a reconstruction.
2. **`transaction_headers`** — has ALL entry types including `Payment`; financial-total-only, no line detail.
3. **`transaction_items` / `vw_clean_transactions`** — line-item detail, but ONLY `Invoice`/`Crd Note`. Never expect `Payment` rows here.
4. **`allocation_edges.csv`** (where it exists) — a reconstruction of which payment matched which invoice. Downstream of everything above; only as good as its inputs and its own logic.

Bugs in this repo almost always live in the transition between two of these layers — raw export → DB, or DB → allocation script. Find which boundary is involved before hypothesizing a fix.

## The core diagnostic discipline: disprove before you conclude

The most valuable move made across every bug in this repo so far wasn't finding a plausible-sounding explanation — it was **actively trying to break that explanation with a concrete test, before repeating it as fact.**

The clearest example: PDP-31 was first hypothesized as a whitespace/encoding divergence in the raw source files. Instead of writing a fix for that guess, the actual test was: pull the two duplicate rows, run `length()`/`octet_length()` on every fingerprint-input field, and check if they're really different. They weren't — 100% identical, byte for byte. Since SHA-256 over identical input is deterministic, that single test *ruled out* the entire whitespace theory in one query, and pointed at what turned out to be the real cause (the fingerprint algorithm itself had changed between two ingestion dates, confirmed via git history — not the data).

Apply this pattern to every hypothesis in this codebase:
- Don't just check whether a rule *could* explain a discrepancy — test whether it actually predicts the specific numbers you're seeing (PDP-34 tested Rule 7 against 30 real docs with a signature table, found 0/30 matched, and only then treated it as a genuinely new, undocumented pattern instead of forcing the existing rule to fit).
- If you're about to write "this looks like X," find the one query or diff that would prove X false if it's actually false, and run it first.
- A correction mid-investigation ("the whitespace theory was wrong, here's what's actually true") is a sign of good diagnosis, not a failure — flag it as such rather than quietly revising the story.
- The same discipline applies to *your own* claims, not just the ones you're checking: a number is "confirmed" only once someone has actually run the query and shown the output, not merely stated the conclusion (see the 300+ accounts example under Pattern 1 — it was flagged unverified for exactly this reason, then verified for real by running the sweep and matching it against the commit's own stated numbers).

## Known bug patterns (worked examples — use these as templates, not an exhaustive list)

### Pattern 1: Silent row duplication from an unversioned hashing scheme (PDP-31 — root-caused, partially fixed)
**Symptom:** The same real transaction appears twice in `transaction_items` with different `id`s and different `source_file`/`created_at` — inflating any `SUM(line_total)` by exactly 2x for affected docs.
**Confirmed root cause:** `computeFingerprint()` in `src/lib/erpImportEngine.ts` has no stability contract. It was modified on 2026-04-13; a batch originally ingested one day earlier (`source_file='2025.TXT'`) was re-exported months later (`source_file='STTRANS2024.TXT'`, 2026-09-07) and re-hashed under the *new* version of the function. Same underlying data, different fingerprint, so `onConflict:'fingerprint'` in `src/lib/syncService.ts` had nothing to match against and inserted a duplicate. Confirmed by recomputing the current algorithm against each duplicate pair's stored fields — it reproduces the newer row's fingerprint exactly, never the older one.
**What's fixed:** `clean()` now collapses internal whitespace before trimming — a related latent-risk fix, not the confirmed root cause itself. `computeFingerprint()` now carries a documented stability contract: changing the field list, order, or cleaning logic invalidates every previously-stored fingerprint and requires a coordinated backfill, not a silent redeploy.
**What's NOT fixed yet, on purpose:** the historical rows are still duplicated — fixing the algorithm doesn't retroactively fix data hashed under the old one. A dedup migration exists as a **reviewed-but-unexecuted draft** (`analysis/debtors/shared/scripts/pdp31_dedup_transaction_items.sql`, `BEGIN`/`DELETE` lines commented out). Don't execute it without explicit human sign-off — it deletes production rows, and the affected scope is large (tens of thousands of rows spanning hundreds of accounts).
**"300+ accounts industry-wide" — verified, not just claimed:** this number originally surfaced in the PDP-31 commit message without a runnable query attached to this skill, so it was flagged unverified. It has since been checked directly against the live DB (Supabase project `oqhpxnaadahohwkslive`) with the sweep query below. Actual result: **434 accounts**, 57,449 duplicate groups, 57,469 extra rows in the 2024-03..2026-05 window — matching the dedup script's own preview counts exactly, and confirming (not just repeating) that this is portfolio-wide. Per-account spot checks also matched the commit's stated percentages exactly: GAS004 99.2%, MON001 98.8%, WES004 98.6%, FAM000 97.3%, MD0003 96.6%, RED001 87.5% of line-item groups duplicated. Treat this as settled unless the underlying data changes (e.g. the dedup migration finally runs).
**How to confirm duplication exists right now on any account:**
```sql
select doc_no, entry_type, stock_no, qty, line_total, tx_date, count(*) as row_count
from vw_clean_transactions
where account_no = '<ACCOUNT>'
group by doc_no, entry_type, stock_no, qty, line_total, tx_date
having count(*) > 1;
```
Non-zero rows here means the migration hasn't been applied to that account yet (as of this writing, it hasn't been applied anywhere).
**How the portfolio-wide sweep was actually verified (reuse this, don't just cite the number):**
```sql
with dup_groups as (
  select account_no, doc_no, entry_type, stock_no, qty, retail_price, tx_date, count(*) as row_count
  from transaction_items
  where tx_date between '2024-03-01' and '2026-05-31'
  group by account_no, doc_no, entry_type, stock_no, qty, retail_price, tx_date
  having count(*) > 1
)
select count(distinct account_no) as affected_accounts, count(*) as duplicate_groups, sum(row_count - 1) as extra_rows
from dup_groups;
```

### Pattern 2: Allocation script trusts a text heuristic where DB ground truth exists (PDP-33 — fixed)
**Symptom:** A payment-matching script (LIFO or otherwise) allocates against a `doc_no` that turns out to belong to the wrong category (e.g. matched a CYL deposit invoice instead of its paired LPG gas invoice) — usually because the two documents were issued as adjacent doc numbers for the same delivery/date.
**Confirmed root cause:** the LIFO pool builder (`buildLpgInvoicePool()` in `analysis/debtors/JEN001/scripts/allocation_ingest_pilot.mjs`) classified CYL-vs-LPG using only the hand-maintained `-EMPTY` suffix on the delivery-note reference — a text heuristic — never the DB's own `debt_group` column, which is the actual ground truth for this distinction.
**Fix:** added `isCylByDbOrRef()`, which checks a DB-sourced `debt_group` snapshot first and only falls back to the old `-EMPTY` heuristic for docs absent from that snapshot. Applied on both the Invoice and Crd Note sides, before DN/date-proximity matching runs — filter the category first, then let proximity logic pick among what's left, never the other order.
**Recurrence check result:** found 2 more mistargeted docs within JEN001 itself once the real filter was applied (same missing-EMPTY-marker pattern, previously invisible to the heuristic). Checked the other LIFO-based accounts (RED001, MON001, MOZ002, MD0003) — none share this vulnerability, because they already gate on `debt_group`/lane at the query level rather than a text heuristic. One unrelated bug surfaced during the sweep (MOZ002 targeting a `debt_group='OTHER'` line) — correctly left flagged, not fixed, since it's a different bug outside this ticket's scope.
**General lesson, not just this bug:** whenever you find a script using a string-pattern heuristic (suffix matching, ref-field parsing) to make a classification decision that a DB column already answers directly, prefer the DB column. Heuristics drift out of sync with reality in exactly the way `-EMPTY` did here; a real column can't.
**Verification after any fix here:** re-run the full replay, don't just patch the one bad edge — removing an invalid target changes what's available in the queue for every allocation chronologically after it, so downstream edges shift too. Diff the full `allocation_edges.csv` before/after and expect changes beyond the single edge you fixed.

### Pattern 3: Header/line-item totals don't tie out — check documented rules, but don't force them (PDP-32 → PDP-34)
**Symptom:** `transaction_headers.amount_excl + tax_amount` doesn't equal `SUM(vw_clean_transactions.line_total)` for a doc.
**Check `business_rules.md` Rule 1 and Rule 6 first** — most Credit Note deltas are the documented tax-sign bug (ERP stores `line_tax` positive even on negative-qty rows), and the cross-check query itself is already Rule 6 doctrine. But verify the fit numerically, don't assume it — on TWK002, only 25 of 46 "VAT-ratio mismatch" docs actually resolved under Rule 1 to the cent. The other 21 showed item-level sums consistently ~2x what the header implied — a distinct item-duplication signature, flagged as possibly connected to PDP-31 (worth checking once that migration is reviewed/applied, not assumed to auto-resolve).
**A second, genuinely new pattern surfaced this way:** 30 TWK002 docs with two `amount_excl` values under one `doc_no` were tested against Rule 7 (doc-number reuse across years) with an explicit signature table — mixed entry types? multi-year date gap? — and matched **0 of 30**. Instead all 30 showed a consistent, previously-undocumented arithmetic chain: `amount_excl_2 = amount_excl_1 - tax_amount`, same date, same `tax_amount` on both rows — looking like a double-application of a tax deduction across two same-day postings of the same document. This is tracked as its own ticket (PDP-34) rather than force-fit into Rule 7 or silently closed as "explained." As of this writing PDP-34 is investigation-only — no code changes exist for it yet, so don't assume a fix is already in the codebase when this pattern comes up again.
**This bridge does not gate matching decisions** — basket-check (line-item matching) only ever reads `transaction_items`, never `transaction_headers`. An unresolved header/items mismatch on a doc doesn't block that doc from being correctly matched elsewhere. Don't let this bucket become a blocker for unrelated reconciliation work.

## General diagnostic method (apply this to bugs not covered above too)

1. **Locate which layer boundary is actually in question** (raw export → DB, DB → allocation script, or allocation script → report) before writing any fix. A fix at the wrong layer will look like it works and then recur.
2. **Never trust a value without deduping first.** `SELECT DISTINCT` before any `SUM`/`GROUP BY` against `transaction_items`-derived tables, always — duplication (Pattern 1) is common enough, and currently *unresolved in historical data*, that skipping this step will pull already-known-bad numbers.
3. **Always use the stored `line_total`, never recompute `qty * retail_price`/`qty * cost_price`.** They are not guaranteed equal — `retail_price`/`cost_price` behave like catalog reference rates, not necessarily what was actually charged on that specific line.
4. **Check for cross-account recurrence before treating any bug as account-specific.** Confirmed pattern across this repo's history so far: every bug found turned out to be broader than the account where it was first noticed, or was explicitly checked and ruled out elsewhere (as PDP-33's sweep did) — either way, check, don't assume.
5. **Check `business_rules.md` for a documented explanation before assuming something is new — then verify the fit numerically rather than accepting a plausible-sounding match.** PDP-32/34 is the reference case for doing this right: checked Rule 1 and Rule 7 explicitly, found they explained *most but not all* of the data, and opened a new ticket for the genuine residual instead of rounding it off.
6. **Verify against the ERP raw export, not just internal consistency between DB tables.** Internal consistency can be wrong in a way that's consistent with itself.
7. **Prefer DB-sourced categorical ground truth over text/reference-field heuristics** wherever both exist for the same classification. See Pattern 2.
8. **A number stated in a commit message or prior report is a claim, not a fact, until you've re-run the query yourself.** Before repeating any headline figure (accounts affected, rows duplicated, percentage mismatched) in a new ticket or fix description, either find the query that produced it and re-run it, or produce your own. This is the same disprove-before-conclude discipline applied to institutional memory, not just to hypotheses about a specific bug.

## When you fix something

- Write a regression test/verification query that would have caught the bug, not just a patch for the one instance found.
- Add a stability contract to anything hash- or fingerprint-based: document what happens if the scheme changes, and require a coordinated backfill rather than a silent redeploy (see Pattern 1).
- Note in the fix's commit/PR whether other accounts need re-auditing for the same pattern — don't assume the fix's blast radius is limited to the account where the bug was found, but also don't assert a portfolio-wide number without showing the sweep that produced it.
- If the fix changes historical `allocation_edges.csv` output, flag that downstream reconciliation-status files built from the old output are now stale and need regenerating — diff old vs new before/after, since changes propagate chronologically beyond the single row fixed.
- Data-deleting migrations (dedup scripts especially) go in as reviewed, commented-out drafts. Never execute one without explicit human sign-off, regardless of how confident the root-cause analysis is.

## Jira

File/track bugs in the PDP (Product Data Pipeline) Jira project. Include: exact file(s) and function(s) implicated, a reproducible query or diff showing the divergence, what's already been ruled out (and the specific test that ruled it out, not just the conclusion), and whether the same pattern was checked on other accounts. When a documented business rule only partially explains a discrepancy, open a new ticket for the residual rather than closing the original as resolved (see PDP-34) — a ticket that rounds off "mostly explained" to "explained" loses the part that still needs investigating.
