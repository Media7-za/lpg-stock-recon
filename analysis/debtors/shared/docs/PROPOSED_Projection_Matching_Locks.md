# DOCTRINE (PROPOSED — NOT RATIFIED) — Projection-First Matching, Locks & Period Close

**Status:** PROPOSED — NOT RATIFIED. Staged by a worker session on 2026-10-04
(branch `claude/payment-matching-mechanisms-4h34be`). Under `DEBTORS_DOCTRINE.md`
§7, worker sessions do not author constitutional changes. Every operator decision
quoted below was stated explicitly in that session. **None of them has been applied
to `DEBTORS_DOCTRINE.md`, `business_rules.md` or any skill file.** Ratification
happens in an orchestration session, and each decision is applied by a turn brief.

**Relationship to other staged doctrine:** This note is a concrete design for tiers 1 and 2
of `DOCTRINE_Layered_Reconciliation_Architecture_PROPOSED.md` (D-NEW.1 / D-NEW.2:
shared logic lives once and is never re-implemented per account). It also stays
within `business_rules.md` §15: an open-invoice list is a hypothesis, and only the
ERP `CURRENT BALANCE` header is ground truth.

**Problem it solves:** Today each scripted account runs its own `allocation_ingest*.mjs`
over raw TXT/DB, repeating the cleaning that `reconcile_debtor_v5_from_txt.mjs`
already does and then throws away. The shared engine `payment_doc_allocation.mjs`
("WO0001 Archetype") is used by WO0001 only. Matching results are not locked, so a
re-run can silently reshuffle settled history.

---

## P1 — Proving the balance and proving its composition are separate jobs

- **Balance proof:** opening B/F + Σ movements = ERP `CURRENT BALANCE`, variance R0.00.
  This needs no allocation. The v5 bridge already proves it for most accounts.
- **Composition proof:** which documents make up the balance. Allocation exists
  only for this.

## P2 — v5 is a persisted, filtered projection; matching runs on top of it

```
ERP TXT ──► v5 projection (rows persisted)          ← cleaning happens once
              │  gate: 1A + 1B = CURRENT BALANCE
              │  filters: window, lane, dedupe, ratification rows
              ▼
            matching (reads projection rows only) ──► allocation_edges.csv
              ▼
            open-items view = projection − tied rows (must still = balance)
```

- The v5 generator already builds these rows in memory (doc, date, ref, amount,
  LPG/CYL split, ratification rows) but writes only markdown and a totals-only
  fixture. **ASSERTED** from `reconcile_debtor_v5_from_txt.mjs`, and from
  `src/features/debtor-position-workspace/data/fixtures/BR0001.v5.json`, which has
  no row array.
- Matching may only *remove* (tie) rows. It never creates rows.
- *Open, not decided:* the row grain (per document, or per document per lane) and
  whether the projection is persisted (`data/v5_projection.json`) or matching runs
  as a stage inside the v5 run.

> **RESOLVED 2026-10-05 (operator, open question 4):** *"I agree"*.
> - **Grain:** one row **per document per lane** (LPG / CYL / OTHER); each row carries its
>   own `split_basis` (P10). LPG + OTHER matching selects those rows; CYL pairing uses CYL
>   rows; the open-items view can retire an invoice's LPG row while its CYL row stays.
> - **Persisted and stamped:** every v5 run writes `data/v5_projection.json` together with a
>   fingerprint of the source TXT. Matching runs as a separate step and **refuses to run**
>   when the stored fingerprint does not match the current TXT.

## P3 — Target output: the "open items" v5 report

Operator: *"Imagine a v5 report like the one for JEN001, but exclude invoices that
are tied to a payment and or credit note and vice versa."*

- **Confirmed ties** drop out of the main view: the invoice and the payment or
  credit note that settled it.
- **Probable ties** also drop out, and are listed in a review appendix with their
  evidence tier and variance. (Operator: "Drop out, listed in appendix".)
- **Partly paid invoices** keep both the invoice row and the payment row(s) until
  fully settled. (Operator: "Invoice + payment rows".)
- **Proof identity:** open items + unallocated payments/credits + journals pending
  (P9) + named residuals (P7, P8) = ERP `CURRENT BALANCE`, exactly.

> **RESOLVED 2026-10-05 (operator, open question 3):** option 1, *internal only*.
> Probable ties drop out of the **internal** open-items view (to the appendix) only.
> On **customer-facing** copies, invoices whose only tie is probable stay listed as
> **open** until the tie is confirmed (auto-lock at close, or operator ratification).
> This keeps `business_rules.md` §15 rule 7 (a recorded basis before retiring an invoice
> on a customer document) and rule 4 (tag-check gate before release) intact.

## P4 — Default matching rules (every account) and tie-break

Operator-selected defaults: credit-note `ref_no` pairing (+1 day), exact
single / exact-sum, amount proximity ±R5, mirror carry / surplus.

**Tie-break when candidates compete** (operator): *"exact match, smallest variance
(<5.00), closest to the payment date."*
- This **supersedes SA0001's oldest-first (FIFO) pool rule** (`SA0001/reports/SA0001_*_Payment_Match.md`).
  It is consistent with JEN001's `allocation_method: lpg_stripped_lifo_chronological`
  (`JEN001/config/payment_pattern_overrides.json`) and with skill Tier 4's
  tie-break (smallest variance, then most recent).

**Match target:** LPG + OTHER lines on the invoice by default; CYL lines are
excluded. (Operator: "LPG + OTHER as default".) This matches the WO0001 example in
`SKILL_Payment_To_Invoice_Allocation.md` Tier 1.

**ERP payment `INVNO`/`ref_no`:** corroborates only, never decides. (Operator:
"Corroborate only".) This is relevant to GAS004 (629 of 642 payments tagged) and
TAN002 (144 of 146). **PROVEN** by counting payment rows with column 6 populated in
each account's `raw/*.TXT`.

> **CONFLICT — operator decision needed.** Applying mirror carry
> (`business_rules.md` §14) to *every* account contradicts the locked rule in
> `SKILL_Payment_To_Invoice_Allocation.md` §4.6, "one payment doc = one pass; never sum
> across payment docs". Mirror carry is cross-document by nature. Decide: does
> mirror carry override §4.6 everywhere, or only on accounts flagged as monthly
> batch payers?
>
> **RESOLVED 2026-10-04 (operator):** *"mirror carry only for monthly batch payers"*.
> Mirror carry / surplus (`business_rules.md` §14/§13) applies **only** to accounts
> flagged as monthly batch payers (proposed config flag: `payerCadence: "monthly_batch"`
> in `statement_v5.json`; set per account, never inferred). Everywhere else the
> skill's §4.6 rule "one payment doc = one pass" stands unchanged. The P4 default
> list therefore becomes credit-note ref pairing, exact / exact-sum and proximity ±R5;
> mirror carry is opt-in. *(The conflict text above is kept as the record of the question.)*
>
> **Also open:** does skill Tier 4's guard still hold under proximity-by-default
> (an explicit ref with an amount mismatch → unallocated, not proximity)? Keep the
> 3–14 day proximity window, or allow any invoice dated on or before the payment?

> **RESOLVED 2026-10-04 (operator):** *"agree, keep guard as probable and widen window"*.
> - **Reference guard kept, softened:** a payment with an explicit invoice ref whose amount
>   does not match that invoice is **not** confirmed and is **not** silently redirected. It
>   produces a **probable** tie to the best proximity candidate (appendix, `review_required`,
>   never auto-locks), recording both the ref'd invoice and the candidate. This amends skill
>   Tier 4's "→ Unallocated (Tier 5)" outcome for this case.
> - **Proximity window widened:** any open invoice dated **on or before** the payment date
>   (was 3–14 days prior). Ordering is by the P4 tie-break; ±R5 tolerance unchanged.
>   Every proximity tie stays probable.

## P5 — Lock decisions, re-run the script every session

- Every session re-runs the projection and matching. That is cheap, and it keeps the
  balance proof fresh (`DEBTORS_DOCTRINE.md` §3: projections are regenerated).
- **Locked matches are applied first, as fixed facts.** Each run re-validates every
  lock against the fresh projection: the documents exist and the amounts and
  fingerprint are unchanged. If a lock no longer holds, it becomes a **`CONFLICT`**
  for review and is never silently re-matched. That conflict is the lock's tripwire.
- **Matching runs only on the unlocked frontier.**
- **Where locks live:** the existing per-account
  `config/payment_pattern_overrides.json`, which already carries per-payment
  targets, `approval_status`, `evidence_source` and edge IDs (8 accounts today). No
  second registry.
  - `approval_status` gains: `auto_locked` (period close; records the rule that
    produced it), `approved` (operator ratified), `voided` (superseded; points to its
    replacement).
  - **Append-only:** void and append, never edit in place. Counter-example to fix
    going forward: the PDP-33 correction in `JEN001/config/payment_pattern_overrides.json`
    edited target `51155` → `51154` in place.
- Generated files (`allocation_edges.csv`, reports) are never hand-edited (§5
  idempotency).

## P6 — Period close: one date per account, agent-executed, auto-lock

Operator: *"Auto lock at period close"*, *"one per account"*, *"Auto-lock is agent a
decision will be fine with me... for speed"*.

- Each account carries a `closedThrough` date and a close history (proposed home:
  the same `payment_pattern_overrides.json`).
- The agent may close a period with no per-close approval. **Only confirmed ties
  (credit-note pairing, exact, exact-sum, remittance-backed) auto-lock.** Probable
  ties never auto-lock; they carry over as review items.
- Each close is one commit recording: the close date, the agent session, the run's
  variance, and the count and value of locks created, plus any unitemised residual
  (P7). A close is undone by voiding it (appended).

**Split gate with partial closes** (operator: "accept split gate with partial closes"):

| Gate state | Matching | Close / auto-lock |
| :--- | :--- | :--- |
| v5 projection exists | Runs; if the close gate fails, output is **review-only** | — |
| Variance R0.00, tag-check not `BLOCKED`, no lock `CONFLICT`, ingest complete | Runs | **Allowed** |
| Variance R0.00, ingest **partial** | Runs | Allowed only **through the day before the earliest missing document** |
| Ingest **stale** | Runs | Not beyond the TXT's as-at date |
| Variance ≠ 0 | Runs, review-only | **No close** until resolved |

Snapshot at staging (**ASSERTED**; from the latest `*_INGEST_COVERAGE_*.json` and the
v5 bridge per account):
- Full pass: JEN001, JAY000, MOZ002, SA0001, TWK002.
- Partial or stale with variance R0.00: BR0001, IVE001, FIR001.
- Variance ≠ 0: GAS004 (−R10,180.95), RED001 (R7,245.00; equals the pending
  CN13687 scenario), TAN001 (R4,480.00).
- TAN002 has no coverage report. CAP000, DON001, MON001 and others have no v5 yet.

## P7 — First deep lookback per account (history before the window)

- **Approach:** matching may see invoices from before the window (read-only) back to a
  per-account `compositionStart` in `statement_v5.json`. Older invoices still open
  appear itemised as **brought-forward open items**. Whatever cannot be itemised is
  one **unitemised opening residual**, which is never aged as if it were an invoice.
  Invariant: itemised B/F items + residual = B/F.
- **Priority:** pre-window invoices compete under the normal P4 tie-break, with no
  oldest-first rule. (Operator: "Use normal tie break".)
- **Default depth:** the start of the account's earliest *complete* TXT history,
  i.e. the point from which TXT rows recompute to the next B/F with variance R0.00.
  If that check fails, step forward to the latest point where it holds. If it never
  holds, depth = 0 (the B/F stays a single residual line). **No hard cap.**
  (Operator: "default depth is fine, no hard cap".)
- **Caveat (ASSERTED):** the earliest TXT row is not necessarily the start of complete
  history. For example, BR0001's 2023 rows look like loose items before a B/F line.
  The completeness check must run per account.
- The first close after a lookback is allowed once the completeness check passes.

## P8 — Multi-site remittances: `payerGroup`

Operator: "accept payerGroup approach, add TWK003 and TWK004 to onboarding".

- The `payerGroup` in config lists the site debtor codes (TWK002: TWK002, TWK003,
  TWK004). **The remittance batch is the unit that must balance:** Σ cash across the
  group = remittance cash; cash + discount = gross, within 0.1%.
- Each remittance line is assigned to the account whose projection contains its
  invoice. `remittance_lines_*.csv` has no site column, so the assignment is inferred.
- Lines for sites not yet onboarded are marked **`OUT_OF_SCOPE_SITE`**. They are not
  unmatched, are not errors and do not block a close. Each batch records them as a
  named residual (today partly hard-coded as the −R300.00 "TWK003 site adjustment"
  in `TWK002/scripts/decompose_balance_gap.mjs`).
- **Action:** TWK003 and TWK004 join the onboarding list (their ERP TXTs must be
  requested). `TWK002/config/statement_of_account.json` `siteTxts` stays empty until then.

## P9 — Settlement discount: "journals pending" state

Operator: "accept journals pending and probable rule, MOZ002 no discount".

- For accounts whose `settlement_discount_overrides.json` says the discount applies,
  an eligible invoice's target is **cash expected = gross × (1 − rate)**, and the
  remittance discount column takes priority over the formula (TWK002 doctrine v2 §2).
- When cash ties, the invoice counts as settled. The remainder moves to a **"discount
  journals pending"** section, not to open items. It clears when the journal row
  appears in the TXT. BU0005's rounding excess (`BU0005_Allocation_Doctrine_v1.md` §7)
  uses the same mechanism as "rounding journals pending".
- Over-post orphans (TWK002: R690.00 in 2023, R6,374.90 in 2024; doctrine v2 §3)
  are named residuals.
- **Evidence:** remittance-backed discount ties are confirmed (they auto-lock).
  Formula-only discount ties are **probable** (appendix, no auto-lock).
- **MOZ002 has no settlement discount**, following its locked allocation doctrine
  (`MOZ002_Allocation_Doctrine_v1.md` §1, Q3 = NONE). `MOZ002/config/settlement_discount_overrides.json`
  (`settlement-discount-v1-draft`) and `MOZ002_Settlement_Discount_Doctrine_v1.md`
  are to be marked **superseded** (marked, not deleted).

## P10 — Mixed LPG/CYL invoices: `split_basis`

Operator: "accept split_basis rule".

Every projection row carries the basis of its LPG/CYL split (logic already in
`reconcile_debtor_v5_from_txt.mjs`, around lines 295–316):

| `split_basis` | Meaning | Can produce |
| :--- | :--- | :--- |
| `DB_LINES` | DB line detail matches the TXT header (±R0.02) | Confirmed |
| `SINGLE_LANE` | Line detail is all one lane | Confirmed |
| `REF_EMPTY` | No line detail; an `-EMPTY`/`EMPTIES` ref sends the row to CYL | Confirmed (CYL pairing) |
| `HEADER_FALLBACK` | No line detail; the whole amount is assumed LPG | **Probable only.** Listed as an ingest gap; upgrades when line detail arrives |

## P11 — Remittance-backed accounts

Operator: the batch payers supported by remittances are **TWK002, CAP000 and MD0003**
(`business_rules.md` §15 order A lists "TWK002, MD0003, +1"; CAP000 is the +1).
On these accounts, remittance lines are rank-1 evidence matched against the same
projection rows. CAP000's coverage is partial: 3 batches mapped, 5 payments without
an advice (`CAP000/reports/CAP000_Allocation_Gap_Analysis.md`). CAP000's lane is still
`settlement_discount` **ASSUMED** (`CAP000/reports/CAP000_Onboarding_Status.md`).

---

## Open questions (decisions still needed)

1. ~~Mirror carry vs skill §4.6 (see P4).~~ **Resolved 2026-10-04:** monthly batch payers only (see P4).
2. ~~Proximity: keep skill Tier 4's explicit-ref guard? Keep the 3–14 day window?~~ **Resolved 2026-10-04:** guard kept as a probable tie; window widened to any invoice dated on or before the payment (see P4).
3. ~~In **customer-facing** copies, may probable ties drop out, or only in the internal
   copy?~~ **Resolved 2026-10-05:** internal copy only; customer copies keep them open (see P3). (`business_rules.md` §15 rule 7 requires a recorded basis to retire an
   invoice on a customer document.)
4. ~~Projection grain, and persisted file vs inline stage (P2).~~ **Resolved 2026-10-05:** per document per lane; persisted `data/v5_projection.json` with a TXT fingerprint (see P2).
5. ~~Build shape: a mode of the v5 generator or a new generator. Pilot account:
   SA0001 (its hand-made monthly matches are an answer key) or JEN001 (the reference
   layout).~~ **Resolved 2026-10-06** — see "Build plan" below.
6. ~~Why `payment_doc_allocation.mjs` was never adopted beyond WO0001. Answer this
   before building another shared engine.~~ **Answered 2026-10-06** — see "Lessons from
   `payment_doc_allocation.mjs`" below.

## Build plan (operator: "Yes" to build shape and pilot order, 2026-10-06)

1. **Extend `reconcile_debtor_v5_from_txt.mjs`** to also write `data/v5_projection.json`
   (rows per document per lane, `split_basis` on each row, TXT fingerprint). Existing
   statement output must stay byte-identical.
2. **New shared matching script** that reads the projection and locks and writes
   `allocation_edges.csv` using the P4 rules, tie-break and evidence levels. No account
   names in code; account differences come from config only (`payerCadence`,
   `payerGroup`, settlement-discount config).
3. **New open-items renderer:** internal and customer copies, probable appendix, and the
   P3 proof line.
4. **Period close** comes later, as its own command, after matching is proven on the pilot.

**Progress (2026-10-06):** Step 1 is implemented. `v5_projection.mjs` (pure builder plus
`verifyProjection` guard) is wired into `reconcile_debtor_v5_from_txt.mjs`; it writes
`analysis/debtors/{CODE}/data/v5_projection.json`, and contract tests are in `v5_projection.test.mjs`.
Regression on SA0001: old and new generator versions were run on identical inputs (stub DB layer,
two modes: no line detail, and real line detail for six SA0001 documents) and produced a
**byte-identical statement markdown and fixture** (apart from the `lastGeneratedAt` timestamp).
**Not yet done:** a real SA0001 run against the live DB (needs `DATABASE_URL`), and committing its
`data/v5_projection.json`.

**Pilot order:** SA0001 first (full gate pass; its window already starts at its first TXT
row; its June/July 2026 hand-matching reports are the answer key, and differences from its
FIFO results are reviewed as tests of the new tie-break), then JEN001 (reference layout;
payment 45717, R15,000, is the first real pre-window lookback test).

**Progress (2026-10-06, step 2):** the shared matcher `projection_matcher.mjs` (pure) and the CLI
`match_projection.mjs` are implemented, with 13 contract tests (`projection_matcher.test.mjs`). The CLI writes the **new**
file `data/projection_matches.json` and never touches `allocation_edges.csv`. Rules implemented:
UD_CLEARING, CN_DN_PAIR, CN_AMOUNT_DATE (probable fallback), EXACT_SINGLE, EXACT_MONTH_SUM, EXACT_SUM (2–3),
PROXIMITY (probable), NEAR_SUM (2–3 within R1.00, probable), plus the P10 downgrade and a residual proof.
Not yet implemented: locks / period close, mirror carry, settlement discount, remittance evidence, payerGroup,
lookback, and the open-items renderer (step 3).

**Progress (2026-10-06, step 3):** the open-items renderer `open_items.mjs` (pure) and the CLI
`render_open_items.mjs` (4 tests in `open_items.test.mjs`) write `reports/{CODE}_Open_Items_v5.md` (internal)
and `reports/{CODE}_Open_Items_v5_Customer_PREVIEW.md` (draft; not for release; the official customer path stays
`generate_statement_of_account.mjs` + `debtors:tag-check`). Both refuse mismatched inputs and print the proof bridge.
SA0001 and MD0003 both tie to the ERP header (variance R0.00).

**Progress (2026-10-06, P11 remittance evidence):** `remittance_evidence.mjs` normalises
`data/remittance_manifest_*.json` batches. Lines come from the manifest, or are extracted from the batch's
C O D REMITTANCE ADVICE PDF (`pdftotext`) and accepted only if Σ lines = the advice total = the manifest total.
Malformed manifests are reported and skipped. `match_projection.mjs` writes `data/remittance_evidence.json` and applies the
**REMITTANCE** rule before every pattern rule. It requires all named documents present and a reconciling batch,
is CONFIRMED when lines equal ERP amounts, and PROBABLE with the discrepancies listed otherwise. Discounts are carried
as `discountPending` (P9). The open-items statement shows "settlement discount journals pending". 8 tests
(`remittance_evidence.test.mjs`). TWK002's CSV remittance format and CAP000 (no structured remittance file yet) are
**not yet adapted**.

**Progress (2026-10-07, P5–P6 locks & period close):** `locks.mjs` (pure) holds the registry model
(`config/payment_pattern_overrides.json` → new top-level key `projectionLocks`; existing `overrides` are untouched),
the split-gate `planClose` and append-only voids. `close_period.mjs` closes or voids. `match_account.mjs` is the shared runner,
so a close locks exactly what the matcher produces. The matcher (v3) applies locks first; a changed or missing locked member
becomes a CONFLICT that blocks further closes. Locks are keyed by document, type, lane, date and amount, never by TXT line.
**Design correction (2026-10-07):** P5's "frontier" means the *unlocked* rows, not rows after the close date. A
date-based frontier was tried and dropped: it froze closed-period probable ties into open items (16 → 43 rows) and would have
ignored late remittances for old payments. Non-LOCKED ties inside the closed period are now flagged `inClosedPeriod`.
SA0001 closed C0001 through 2026-06-30: 112 locks; statement unchanged (16 rows, R0.00 variance). WO0001 is refused
(flat-array legacy registry). 7 tests (`locks.test.mjs`).

**Progress (2026-10-08, matcher v4, operator rulings, TWK002 adapter):**
- **Matcher v4.** Payment rules run in two passes: exact rules (a–c) for every payment first, then probable rules (d–e)
  on what is left. v3 let SA0001 46092's NEAR_SUM take invoice 53011, which the later payment 46160 matches exactly.
- **Approved locks (P5 "approved" status).** `approve_tie.mjs` records an operator ruling as a lock with
  `close_id: null` and a `ruling.treatment` for the tie's net: `exact`, `customer_credit`, `applied_to_bf`,
  `part_payment` (with `partialDoc`), `short_paid`. The open-items proof shows each treatment on its own line.
  Part-payments are noted against the open invoice, and Appendix D lists the rulings. `writeRegistry` rewrites only the
  `projectionLocks` key, so recorded `overrides` keep their text byte for byte. SA0001 carries 7 approved locks (L0113–L0119).
- **Remittance.**
  - The builder now also reads TWK002-style snake_case manifests, with lines from `data/remittance_lines_YYYY.csv`.
    Credit-note discounts are stored as magnitudes, so they are signed on read.
  - A document listed on several advice lines (for example gas and deposit) is compared and tied once.
  - A document an advice settles only in part (net ≠ gross − discount) leaves the batch **unresolved**: tying it would
    hide the remainder. Combined-batch evidence is not built.
  - TWK002 STAT 129 (45899) applied CONFIRMED. STAT 123 (43500) names TWK003/TWK004 invoices, so it needs P8 `payerGroup`.
- `debtors:test` 133/133.

## Lessons from `payment_doc_allocation.mjs` (open question 6, read-only, 2026-10-06)

Why the "shared" engine never spread beyond WO0001 (PROVEN from code reading unless tagged):

| # | Finding | Evidence | Consequence for the new script |
| :--- | :--- | :--- | :--- |
| L1 | **Override schema is WO0001-only.** It expects a flat array of `{payment_doc, target_doc, allocated_amount}` and calls `overrides.filter(...)`. Every other account's registry is an object (`{overrides:[{targets:[…]}]}`: JEN001, JIM001, MD0003, MOZ002, RED001, TWK002), so `.filter` throws a TypeError for those accounts. | `payment_doc_allocation.mjs:47–55, 176–191`; `WO0001/config/payment_pattern_overrides.json` (array) vs the others (object) | One versioned lock/override schema with a loader that validates it and fails with a clear message. Migrate WO0001's flat array into it (append; keep the old entries as voided pointers). |
| L2 | **Database only, no ingest gate, no dedupe.** Reads `transaction_headers` ⨝ `vw_clean_transactions` with no `DISTINCT ON`. `vw_clean_transactions` does not dedupe (PDP-31; `DOCTRINE_Layered_Reconciliation_Architecture_PROPOSED.md` D-NEW.1), so duplicated lines inflate LPG targets. The per-account engines (MON001, RED001) add `DISTINCT ON (doc_no, debt_group, stock_no, category, line_total)` themselves. | lines 59–72, 84–96 | Read the stamped v5 projection, never the raw view. Dedupe happens once, upstream. |
| L3 | **Labels proximity as `CONFIRMED_*`.** Rules 1 and 3 (±R5 within a 3–15 or 0–90 day lag) emit `CONFIRMED_LAG_PROXIMITY` / `CONFIRMED_EXPANDED_PROXIMITY`. This contradicts skill Tier 4 (proximity = Probable) and P4. | lines ~197–290 | Evidence level comes from the rule and is enforced in one place. Proximity is always probable. |
| L4 | **Effectively oldest-first.** Candidates are sorted by ascending date and the first hit wins, which contradicts the P4 tie-break. | `candidates.sort((a,b)=>a.date-b.date)` | Implement the P4 tie-break explicitly: exact, then smallest variance, then closest date. |
| L5 | **Hard-coded windows drifted from docs.** The code uses 3–15 / 0–90 days; the skill says 3–14; CHANGELOG says the CN mapping window is `[-2, 7]` days, but the current CN step has no date window at all. | lines ~200, 263; `CHANGELOG.md:52–59` | Windows and tolerances come from one config block, are echoed in each output's header, and have tests. |
| L6 | **Pairs only, no exact-sum beyond two invoices**, and no month exact-sum (the strongest rung of `business_rules.md` §15 order B). | Rules 2 and 4 | Combination search covers 2–3 invoices and billing-month sums, as in P4. |
| L7 | **CN sign handling is unverified (ASSERTED).** Net open = `invoice − cn.amount`. If CN `line_total` is negative (skill Tier 3: "CN amounts are negative"), this *increases* open. Not verified, because this session has no `DATABASE_URL`. | line ~110 | Test fixtures covering both signs; read CN rows from the projection, whose signs come from the TXT. |
| L8 | **Year-split outputs** (`allocation_edges_{year}.csv`) beside the account's canonical `allocation_edges.csv`; no locks, no fingerprint. | lines 31–36; `WO0001/data/` has 4 edge files | One `allocation_edges.csv` per account, rebuilt from projection + locks. |
| L9 | **Later accounts copied a different engine.** MON001 and RED001 headers say "MOZ002 engine pattern"; the de facto shared design is a per-account copy of `MOZ002/scripts/allocation_ingest.mjs`. | `MON001/scripts/allocation_ingest_pilot.mjs`, `RED001/scripts/allocation_ingest_pilot.mjs` headers | Review the MOZ002 engine before writing the new script and keep what works (line dedupe, LPG-only targets, prepayment rule). |

**Takeaway:** the engine wasn't rejected on principle. It was WO0001-shaped: its own override
format, its own windows, its own labels. Each new account found it easier to copy and edit
than to generalize. The new script must therefore be config-driven from day one, with
contract tests (in the style of `debenq_open_invoices.test.mjs`) that any account's config
and lock file must pass.

## Tripwires (reopen this proposal if…)

- A remittance advice contradicts an `auto_locked` tie.
- A locked document changes in a fresh ERP extract (amount, reversal, renumbering).
- An account's projection stops tying after a close.
- The ERP begins posting trustworthy payment allocation (would revisit P4
  "corroborate only").
- TWK003/TWK004 onboarding shows that site slices do not reconcile per batch.
- A discount account turns out to have per-invoice eligibility exceptions that the
  formula cannot express.

**Amendment (2026-10-08, operator ruling, ADM-86): tie-break is FIFO within proximity.** This supersedes the P4 tie-break "closest to the payment date".
- **Rule:** among equally exact candidates, take the oldest invoice dated within 14 days (`fifoWindowDays`) of the closest candidate.
- **Rejected alternative:** unbounded FIFO was tried and dropped. It reached back months (RED001 40727 → 43614) and overturned a ratified ruling (MOZ002 43640 ↔ 49550, 2026-07-20).
- **Effect on open matches:** re-matching swapped equal-amount pairings in MD0003 (4), MOZ002 (4), TAN002 (8) and MON001 (2). Open totals are unchanged. No locked tie changed.
- **Operator approval (2026-10-08):** the 14-day `fifoWindowDays` was proposed by the agent. The operator approved it with "Ok", replying to the agent's recommendation to keep 14 days. The rest of the proposal remains NOT RATIFIED (ADM-90). **Tripwire:** reopen the window if a ruling or remittance shows a payment settling an older invoice more than 14 days before the closest one.

**Amendment (2026-10-08, operator rulings): UD payments are unconfirmed.** A FINCON `Ud Paymnt` row is a receipt captured but not yet confirmed by the bank reconciliation agent, so it is not money received. The operator said "No, UD Payments are not yet ratified by bank reconciliation agent…", and answered "Yes" to building the handling.
- `reconcile_debtor_v5_from_txt.mjs` drops UD rows from the statement and projection rows, so the account ties to the ERP `CURRENT BALANCE`, which already excludes them.
- The UD rows are reported as a memo (`projection.udPending`; a statement memo; an open-items memo line) and are never matched.
- When the bank confirms one, FINCON posts it as a payment (or a Bank UD/Payment pair) and it matches normally.
- Statements without UD rows are byte-identical (SA0001 checked).
- **Tripwire:** a UD row dated before `periodStart` sits inside the B/F and shows as a variance with a note. Revisit this if any account hits it (GAS004, TAN001, FAM000 and WO0001 TXTs carry old UD rows).

**Amendment (2026-10-09, operator instruction): matcher v5, batch sums and cylinder exchange netting.** PROPOSED — NOT RATIFIED.

The operator said: "A customer very rarely pays for part of an invoice. The combination of batches probably need to be reviewed." Asked "Shall I build them?", the operator answered "Yes".

- **Rule 4, `BATCH_SUM` (always PROBABLE).**
  - Scope: payments still unallocated after rule 3.
  - Match: 1–3 payments together settle 1–2 whole delivery batches within ±R0.05. A batch is every open invoice row sharing a DN number, gas and cylinder-deposit lanes together.
  - A batch set needs at least one gas/other row. A deposit invoice alone is never a payment target, because deposit amounts recur and coincidences are common.
  - Timing: payments fall on or after the batch, and within `batchWindowDays` (120) of it.
  - Rounding: a payment of ≤ R0.05 that exactly removes the remaining variance is absorbed as the rounding cent.
  - A part-payment is no longer inferred. It needs an operator ruling (`approve_tie --treatment part_payment`).
- **Rule 5, `CYL_EXCHANGE` (CONFIRMED, net R0.00).**
  - Scope: cylinder-deposit invoices and empties credit notes left unpaired because the counts differ, so the amounts differ.
  - These rows form a custody chain. In date order, every stretch whose running total returns to R0.00 closes as one group. The same pass then runs from the latest row backwards.
  - What stays open is the genuinely outstanding middle.
- **Open-items view.** A tie spanning the gas and cylinder lanes carries its net on the gas side.
- **Customer layout `open_items` (`generate_statement_of_account.mjs`).** Operator: "Let the customer facing statement show only open items tying up to the erp balance".
  - Content: the customer view of the open items, with settled items omitted and PROBABLE-tie rows footnoted until approved.
  - Gate: open items + named lines must equal the ERP header, the projection must not be stale, and no lock may be in conflict. Otherwise the statement is not written.
  - The TXT invoice-tag gate does not apply to this layout, because the open list does not come from TXT tags.
- **Pilot: MOZ002 only.** Not yet run across other accounts, by operator instruction ("Before you run this across every account…").
  - Payments 44227 + 45590 (+ 41529, R0.01) settle the DN#22222 batch: 50528 gas + 50529 deposit = R8,469.29 (PROBABLE).
  - 8 exchange groups close. Internal open items: invoice 53402 R5,702.67 and empties CN 15128 R−4,140.00 = ERP R1,562.67, variance R0.00 (PROVEN, `analysis/debtors/MOZ002/data/projection_matches.json`).
- **Tripwires:**
  - A remittance or an operator ruling contradicts a `BATCH_SUM` tie.
  - A `CYL_EXCHANGE` group spans a cylinder count the custody (SKU) gate disputes.
  - Running v5 across other accounts overturns an approved lock or a period close. Any lock conflict counts.

**Amendment (2026-10-09, operator observation): rule 6, `BALANCE_ZERO`.** PROPOSED — NOT RATIFIED. The operator asked: "Notice March 2026 the opening balance is equal to 0?"

- **The rule.**
  - The ERP running balance is the opening B/F plus every row in TXT line order.
  - Find its **latest** return to R0.00 (within R0.05). Every row on or before that line is settled in aggregate.
  - Untied rows close as one CONFIRMED group.
  - PROBABLE ties lying wholly before that line are dissolved into the group: settlement is proven even where the pairing is not.
  - Confirmed ties and locks are kept.
  - The group also settles the opening B/F. The open-items view shows this on an "Opening B/F settled" line.
- **Related tightening of `BATCH_SUM`.** A rounding cent is absorbed only if it is dated on or after the batch.
- **MOZ002.** The ERP balance returns to R−0.01 at TXT line 183 (payment 43962, 9 Apr 2026).
  - 11 rows close, and 4 probable ties dissolve: 41522/12079, 46826/13602, 49329/14458, and the 40729 run.
  - The customer copy drops from 18 to 6 items; 4 of the 6 await approval of the `BATCH_SUM` tie.
  - It still ties to R1,562.67 (PROVEN, `analysis/debtors/MOZ002/data/projection_matches.json`).
- **Tripwire.** A later ERP export changes any row on or before the cut line. The ERP backdating seen on 2026-10-08 is exactly that case: the cut moves and the group re-forms. Once a period close locks it, it becomes a lock conflict.

**Progress (2026-10-09): first `BATCH_SUM` ruling.** `approve_tie.mjs` now takes several payments (`--payment A,B`) and a delivery's deposit invoices (`--deposits N`), so a probable `BATCH_SUM` tie can be approved as a lock. MOZ002 L0001 (provisional, "Yes for now"): payments 44227 + 45590 settle DN#22222 (gas 50528 + deposit 50529). The R4,140.00 credit stays open on the statement as empties credit note 15128. The ruling is reversible with `close_period.mjs --void-lock L0001`. PROPOSED — NOT RATIFIED.

**Amendment (2026-10-09, operator ruling ADM-92): "settled through" records.** PROPOSED — NOT RATIFIED.

The operator confirmed the JEN001 ruling: payments that each paid a statement balance settle every document on that statement, gas, cylinders and credit notes alike, recorded as one record rather than one lock per payment.

- **Registry.** `projectionLocks.settledThrough` is a new append-only list. Each record holds: `through`, the anchor TXT line, `memberCount`, a SHA-256 `memberDigest` of the covered row keys, the opening B/F, an optional `includes` list (a payment dated after `through` that pays the last statement in the range), and the `ruling`. A void uses `target: 'settled'`.
- **Tool.** `settle_through.mjs`. It refuses unless opening B/F + the covered rows = R0.00 (±R0.05), the anchor is the last covered TXT line, and no covered row is already locked.
- **Matcher rule 0b, `SETTLED_THROUGH`.** Applied before every other rule, as one CONFIRMED group. The tripwire is enforced: if the covered row count or digest changes (a document added, changed or back-dated into the range) or the proof no longer holds, the record becomes a lock CONFLICT and its rows stay untied.
- **Period close.** A `SETTLED_THROUGH` tie is never locked by `close_period.mjs`; the record is its own lock.
- **Chained part-payments.** One oldest-first chain across several payments is recorded as a single `part_payment` lock (`approve_tie.mjs --payment A,B,C --invoices … --partial P`), because the approval model carries one `partialDoc`.
- **Pilot:** JEN001 S0001 + L0002. Open items 52044 (R3,003.68 after part-payment), 52305, 52648, 53029, 53224, 53468 = ERP R25,332.00 (PROVEN, `analysis/debtors/JEN001/data/projection_matches.json`).
- **Tripwires:** a remittance naming invoices for the covered payments; a new TXT with a different B/F or window start; any document added or back-dated into the range.

**Amendment (2026-10-09, operator rulings on TWK002, ADM-94): remittance rules in matcher v5.** PROPOSED — NOT RATIFIED.

Operator rulings: Q3′ ratified M1 (lane-aware split remittances); Q1 and Q15 made TWK003/TWK004 child accounts of TWK002 (consolidated parent, one customer statement); Q2 resolved an advice line by alias; Q10 approved the build (M1, family tie, alias, M3). Q8′ and Q7 and Q6′ are recordings, not rules.

- **M1, lane-aware split.** A line whose settled share (paid + discount) is only part of a document, or does not equal the document's ERP rows, ties only the lane rows whose sum equals that share. Both conditions must hold: exactly one lane subset fits (±R0.05), and all advices in the evidence together settle the whole document (Σ shares = the advice's document gross, ±R0.05). Otherwise the batch stays unresolved, as before. A document paid by two advices (invoice 41747: CYL by STAT 114, LPG by STAT 123) ties lane by lane.
- **Family (payer group).** Config `payerGroup` (children and their TXTs). A document in a child's TXT is out of scope for this account's remittance tie. The in-scope lines must equal this account's posting of the payment, and this posting + the children's postings (read from their TXTs by payment doc) must equal the advice cash. Interim: until the children have their own projections, only this account's slice is tied; the child share is carried on the tie (`siteLines`, `familyPostings`). Opt-in by config.
- **Alias.** Config `remittanceDocAliases` { batchId: { "Type|doc": "ERP doc" } } re-points an advice line's identity when the evidence is built. Generated CSV/JSON are never hand-edited.
- **M3.** A REMITTANCE tie whose net is a discount takes the unique free journal equal to −net, dated on/after the payment; the discount is then no longer "pending". Two equal journals: not guessed.
- **Recording tools.** `approve_tie.mjs --journals N` (journals join a settlement) and `--ties T0001,T0002` (approve the matcher's probable ties by id, one approved lock each). Tie ids are only stable within one matcher run: the tool prints each tie's documents; re-list the ids after every recorded lock.
- **Display.** Config `namedResiduals` shows listed untied journals under ratified bridge ids as proof lines instead of open rows; `rowNotes` carries an operator note on a still-open row.
- **Preview gate (the build's done criterion):** `matcher_preview.mjs` showed NO row change on the other eight projected accounts, including MD0003, the only other account with remittance evidence. TWK002: 69 → 36 on evidence, → 34 with the recorded locks, → 10 with the named residuals.
- **Tripwires:** a preview showing any row change on another account; an advice share that fits two lane subsets equally; a child TXT whose open documents differ from those used.
