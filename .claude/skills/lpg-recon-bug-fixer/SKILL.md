---
name: lpg-recon-bug-fixer
description: Diagnose and fix data-integrity bugs in the media7-za/lpg-stock-recon codebase — ERP import duplication, payment-allocation mistargeting, and header/line-item mismatches. Use this whenever debugging why reconciliation numbers don't tie out, why a document appears duplicated or missing in transaction_items/allocation_edges.csv, why a payment allocated to the wrong invoice, or when triaging a new Jira ticket in the PDP project about this repo's debtor/creditor reconciliation. Also use when asked to root-cause a discrepancy between the ERP's stated balance and a reconciliation script's computed balance for any account in this repo, even if the request doesn't mention a specific bug by name.
---

# LPG Recon Bug Fixer

This repo reconciles LPG distributor debtor/creditor accounts against ERP exports. Its data-integrity bugs share a shape: something upstream of the final report silently corrupts, duplicates, or mistargets a row, and the report still *runs* — it just produces a subtly wrong number. That's what makes them dangerous and why this skill exists: naive "does the report run" checks don't catch them, only checks that compare against an independent ground truth do.

**Read `analysis/debtors/shared/docs/business_rules.md` before touching any bug in this codebase.** It documents 15 known quirks (tax-sign inversion, doc-number reuse, SKU dual-line patterns, etc.) that look exactly like bugs but are actually already-understood ERP behavior. Half the value of debugging here is telling "known quirk" apart from "new defect" — check the doctrine first so you don't reopen a solved problem or, worse, "fix" expected behavior into something wrong.

## Ground truth hierarchy

Before trusting any number this codebase produces, know what actually anchors it:

1. **ERP raw `.TXT`/`CURRENT BALANCE` export** — the actual source of truth. Everything else is a reconstruction.
2. **`transaction_headers`** — has ALL entry types including `Payment`; financial-total-only, no line detail.
3. **`transaction_items` / `vw_clean_transactions`** — line-item detail, but ONLY `Invoice`/`Crd Note`. Never expect `Payment` rows here.
4. **`allocation_edges.csv`** (where it exists) — a reconstruction of which payment matched which invoice. Downstream of everything above; only as good as its inputs and its own logic.

Bugs in this repo almost always live in the transition between two of these layers — raw export → DB, or DB → allocation script. Find which boundary is involved before hypothesizing a fix.

## Known bug patterns (worked examples — use these as templates, not an exhaustive list)

### Pattern 1: Silent row duplication across re-ingested source files (PDP-31)
**Symptom:** The same real transaction appears twice in `transaction_items` with different `id`s and different `source_file`, `created_at` — inflating any `SUM(line_total)` by exactly 2x for affected docs.
**Root cause location:** `src/lib/erpImportEngine.ts` (`computeFingerprint()`) + `src/lib/syncService.ts` (`onConflict: 'fingerprint'`). The fingerprint hash is computed over 9 fields that all look byte-identical *once in the DB* — meaning the actual divergence happens in the **raw source text before `clean()` runs**, not anything visible in a normal SQL query.
**How to confirm:** `SELECT ... GROUP BY doc_no, entry_type, stock_no, qty, line_total, tx_date HAVING COUNT(*) > 1` against `vw_clean_transactions` for the account in question. If a same 55%-ish block of docs in a specific date window shows duplicates, check whether the same window is duplicated on *other* accounts too — this bug has shown up as a cross-account, time-bound event (not account-specific) every time it's been checked.
**How to actually fix it (not work around):** diff the two raw source files byte-for-byte around a known duplicate pair — don't stop at the DB, the bug is upstream of it. Whitespace/encoding is the leading suspect. Normalize before hashing.
**Workaround if you're just doing analysis, not fixing the import path:** wrap every query in `SELECT DISTINCT (doc_no, entry_type, stock_no, qty, line_total, tx_date)` before aggregating. This is a query-time patch, not a fix — say so if you use it.

### Pattern 2: Allocation script targets the wrong sibling document (PDP-33)
**Symptom:** A payment-matching script (LIFO or otherwise) allocates against a `doc_no` that turns out to belong to the wrong `debt_group` (e.g. matched a CYL deposit invoice instead of its paired LPG gas invoice) — usually because the two documents were issued as adjacent doc numbers for the same delivery/date.
**How to confirm:** for any allocation edge, look up the actual `debt_group` of its `target_doc` in the DB and check it matches the ledger the script claims to be building (e.g. an LPG-only allocation script should never target a `debt_group='CYL'` doc). Then check whether the doc's true sibling (often `doc_no ± 1`, same date) has zero coverage anywhere — that's the tell that the script picked the wrong one of a pair rather than genuinely missing a document.
**Root cause pattern:** matching logic that joins on date + delivery-note proximity without also filtering on `debt_group`/entry category first.
**Fix pattern:** add the category/`debt_group` filter *before* date/DN proximity in the target-selection logic, not after. Re-run the full replay once fixed, since removing an invalid target changes what's available in the queue for every allocation that comes after it chronologically.
**Don't assume it's isolated:** once you find one instance, check every account using the same allocation script (or a shared library it's built on) for the same adjacent-sibling-doc pattern before closing the ticket.

### Pattern 3: Header/line-item totals don't tie out (PDP-32-style)
**Symptom:** `transaction_headers.amount_excl + tax_amount` doesn't equal `SUM(vw_clean_transactions.line_total)` for a doc.
**Check business_rules.md Rule 1 and Rule 6 before treating this as new.** Most Credit Note deltas are the already-documented tax-sign bug (ERP stores `line_tax` positive even on negative-qty rows) — expected, not a defect. The cross-check query itself is already Rule 6 doctrine; you're not inventing it.
**What's actually worth investigating:** unexplained *Invoice* deltas (Rule 1 only covers Credit Notes), or deltas Rule 1's formula doesn't fully account for. Before escalating, test whether Rule 7 (ERP doc-number reuse across years) explains it — a doc_no collision between an old Invoice and a much later Crd Note under the same number will produce exactly this symptom when a query joins on `doc_no` alone without also filtering `entry_type`.
**This bridge does not gate matching decisions** — basket-check (line-item matching) only ever reads `transaction_items`, never `transaction_headers`. An unresolved header/items mismatch on a doc doesn't block that doc from being correctly matched elsewhere. Don't let this bucket become a blocker for unrelated reconciliation work.

## General diagnostic method (apply this to bugs not covered above too)

1. **Locate which layer boundary is actually in question** (raw export → DB, DB → allocation script, or allocation script → report) before writing any fix. A fix at the wrong layer will look like it works and then recur.
2. **Never trust a value without deduping first.** `SELECT DISTINCT` before any `SUM`/`GROUP BY` against `transaction_items`-derived tables, always — Pattern 1 above is common enough that skipping this step is the single most likely way to reintroduce a bug you thought was fixed.
3. **Always use the stored `line_total`, never recompute `qty * retail_price`/`qty * cost_price`.** They are not guaranteed equal — `retail_price`/`cost_price` behave like catalog reference rates, not necessarily what was actually charged on that specific line. Recomputing silently reintroduces exactly the kind of error this whole system exists to catch.
4. **Check for cross-account recurrence before treating any bug as account-specific.** Every bug found in this repo so far — the duplication window, the sibling-doc mistargeting risk — turned out to be broader than the account where it was first noticed. Assume the same until you've actually checked another account and ruled it out.
5. **Check `business_rules.md` for a documented explanation before assuming something is a new bug.** A mismatch that looks alarming is very often already-known, already-tolerated ERP behavior with a rule number attached.
6. **Verify against the ERP raw export, not just internal consistency between DB tables.** Internal consistency can be wrong in a way that's consistent with itself — the raw `.TXT`/`CURRENT BALANCE` is the only thing outside this codebase's own control.

## When you fix something

- Write a regression test/verification query that would have caught the bug, not just a patch for the one instance found. For duplication bugs, that's a query that reimports the same logical row from two differently-named source files and asserts one row results. For mistargeting bugs, that's a query asserting every allocation's target matches the ledger's expected `debt_group`.
- Note in the fix's commit/PR whether other accounts need re-auditing for the same pattern — don't assume the fix's blast radius is limited to the account where the bug was found.
- If the fix changes historical `allocation_edges.csv` output, flag that downstream reconciliation-status files built from the old output are now stale and need regenerating, not just future runs.

## Jira

File/track bugs in the PDP (Product Data Pipeline) Jira project. Include: exact file(s) and function(s) implicated, a reproducible query or byte-level diff showing the divergence, what's already been ruled out, and — critically — whether the same pattern was checked on other accounts. A ticket that only proves one instance without checking for recurrence is an incomplete diagnosis, not a finished one.
