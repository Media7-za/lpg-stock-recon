# DOCTRINE (PROPOSED, NOT RATIFIED) — Layered Reconciliation Architecture

**Status:** ASSERTED. Derived from this session's work across TWK002, JEN001, JIM001, MOZ002, BU0002. Not yet tested against the full portfolio. Requires ratification before superseding any existing rule.

**Source:** pulled into this repo from Google Docs on 2026-09-16 (PDP-46 follow-up) —
https://docs.google.com/document/d/1i-DsX4ZdRKIO2Du00O6kRUjOrMpDOd-6yIPtTgGoRJs/edit
— after the PDP-46 ticket flagged that its `settlement_unit`/`evidence_tier`/
`evidence_status` taxonomy came from a "Portfolio Review — Statement Pipeline
& Payment-Pattern Classification" document that could not be found anywhere
in this repo's git history or branches. This doc's title differs slightly
from that citation, but its content is unmistakably the same material: D-NEW.5
below gives the exact `settlement_unit` → `evidence_tier` mapping the ticket's
taxonomy draws on. Treat this as the taxonomy's real source going forward —
see `reconciliation_status_taxonomy.md` for how `build_reconciliation_status.mjs`
was reconciled against it. **Still PROPOSED, NOT RATIFIED per its own status
line** — a future session should re-check whether it has since been ratified
or superseded before treating it as binding doctrine.

**Supersedes the implicit prior model:** that each account should be reconciled by finding or building *the* correct generator for it — v5, Option C, or a bespoke script, chosen once and treated as that account's answer. That model was never written down as doctrine, but it's what every account-specific investigation this session implicitly assumed until this reframing.

-----

## D-NEW.1 — Three tiers, not one pipeline

Reconciliation work for any account decomposes into three tiers, each with a different job and a different reason to exist:

1.  **Shared computation layer** — capabilities every account needs, regardless of its settlement pattern: deduplication (PDP-31), lane classification (debt_group, LPG/CYL/OTHER split), and cylinder value-owed (deposit_rate × running_balance). These are properties of the *data*, not of any one account's reconciliation approach, and belong in one place — currently vw_clean_transactions/vw_cylinder_ledger, proposed to extend with vw_cylinder_value_owed.

**Tier 1 is a computation layer, not a verification layer — do not treat its output as ground truth.** It performs no validation against anything outside the database. Three concrete limits found this session: (a) vw_clean_transactions does *not* deduplicate — PDP-31's duplicate rows pass straight through, and as of the last portfolio sweep 434 accounts / 57,453 duplicate groups remain unfixed, so any consumer must dedupe itself (this is why v5 wraps its own DISTINCT ON on top); (b) debt_group is a three-way CASE over a category field whose own accuracy has never been audited, and its 'OTHER' branch is an undifferentiated catch-all — on MOZ002 it was hiding a beverage line (category='BEV'), not a genuine third settlement lane; (c) the engine never compares against the raw ERP .TXT export, so it will compute a wrong answer just as cleanly as a right one if its inputs are wrong. The canonical source remains the raw ERP export (Rule 8), not this layer.

2.  **Sibling artifacts** — the account-specific reconciliation output: v5 ledger (running balance, monthly rollups), Option C (reconciliation_status.csv, per-document status), or a bespoke script (MOZ002-style) where neither fits. **These are not competing alternatives to be resolved into one; they are legitimately different outputs for different needs**, confirmed by direct evidence this session — TWK002 and JEN001 both run *multiple* lineages simultaneously (v5 for the ledger view, a separate Lineage B for open-items), and MOZ002's bespoke script exists because neither shared generator fit its structure. An account is not "done" once it has one artifact; it's done once it has whichever artifacts its actual customer/legal needs require.

3.  **Customer view** — a fixed set of questions, answered the same way regardless of which sibling artifact(s) an account has underneath: last N payments' allocation, open invoices, cylinder movement + value owed, and the validation identity (LPG value + CYL value = header running balance). This tier queries tier 2's outputs; it does not reimplement them.

**The load-bearing consequence:** a request like "give me a reconciliation for account X" is underspecified until you know which tier is being asked for. A request for the customer view doesn't require picking a winning generator — it requires knowing which sibling artifact(s) exist for that account and querying them.

-----

## D-NEW.2 — Shared logic lives in tier 1, never gets reimplemented per sibling

**Evidence this rule is necessary, not aspirational:** this session found the same capability solved independently, multiple times, at different tiers, with different completeness:

  - Deduplication: reimplemented by hand in every Option C run (TWK002, JEN001, JIM001) before PDP-46 proposed extracting it once.
  - Lane classification: PDP-33's fix, PDP-35's investigation, and MOZ002's phantom −R1,207.50 residual are three separate incidents of the same underlying risk (doc-level heuristics substituting for the shared debt_group computation).
  - Cylinder value-owed: solved correctly on JIM001 (custody_exposure in cylinder_transactions.csv), never promoted to the shared layer, so every other account has no equivalent.

**Rule:** any computation whose correctness doesn't depend on an account's settlement pattern belongs in tier 1. A capability discovered in one account's bespoke tooling is a signal to generalize into tier 1, not to leave in place and let other accounts lack it.

-----

## D-NEW.3 — Sibling artifacts are chosen per need, not per account, and can coexist

**Rejects:** "this account uses v5" / "this account uses Option C" as a permanent, exclusive classification.

**Asserts instead:** an account's artifact set is a function of what's being asked of it. TWK002 needs a ledger view (v5) *and* a customer-facing open-items statement (Lineage B) *and*, per the legal-handoff thread, will need an evidentiary view distinct from both once it goes to collections. These aren't sequential upgrades or competing choices — they can all exist for the same account simultaneously, because they answer different questions.

-----

## D-NEW.4 — The customer view's four questions are the generalization test

Any new account, or any newly-discovered settlement pattern, should be checked against these four questions before being considered "reconciled" in a customer-facing sense:

1.  How were the last N payments allocated?
2.  What invoices (by lane) are open?
3.  What is owed in cylinders — movement and value — not just quantity?
4.  Does (LPG value owed) + (CYL value owed) = the header running balance?

**#4 is the validation gate, and it must be checked per-lane, not just as a combined total** — a total-only check is exactly what would have missed MOZ002's phantom residual (a per-lane misclassification that a combined total wouldn't surface). This is the doctrine's concrete instantiation of the "four-lane identity" principle already established elsewhere, now made into an explicit, checkable step rather than a background assumption.

**Not all four questions are answerable for every account, and the unanswerable ones must fail loudly.** Question 1 depends on an allocation artifact existing at all — for UNCHARACTERIZED accounts (BU0002: no allocation_edges.csv, no payments file, ingest gate UNVERIFIED) it is not merely harder, it is unanswerable, and the correct output is an explicit blocked state rather than a silently empty or inferred answer. Question 3 currently has no implementation anywhere outside JIM001's bespoke custody_exposure column. A customer view that renders a plausible-looking answer where no evidence exists is worse than one that refuses.

-----

## D-NEW.5 — Statement type is determined by settlement bucket AND evidence tier, not by artifact type

**Rejects:** the assumption that having a given artifact (v5, Lineage B, Option C) determines what statement an account can be issued. Two accounts with the same artifact type can require different statement honesty levels, because artifact type and evidence tier are independent axes — the same independence the settlement_unit/evidence_tier/evidence_status taxonomy exists to preserve.

**The mapping:**

| **settlement_unit** | **Tier** | **Epistemically honest statement** | **Rationale** |
| :-: | :-: | :-: | :-: |
| PER_INVOICE_REF_LINKED | 1-2 | Per-invoice, confident | ERP directly names the target; no inference |
| REMITTANCE_BATCH | 1 | Per-invoice, confident | Advice names the batch; genuine evidence backs invoice-level claims |
| PER_CALENDAR_MONTH_EXACT_SUM | 3 | **Month-level only, never per-invoice** | The exact-sum test proves the month ties out; it says nothing about which invoice within that month a payment targeted |
| PER_INVOICE_FIFO_BATCH / PER_INVOICE_LIFO_BATCH | 3 (ASSERTED) | Per-invoice claims must be explicitly labeled pattern-based, or default to ledger/month level | Exact-sum conservation cannot distinguish FIFO from LIFO from any other consumption order — a per-invoice claim here states an assumption as fact unless independently corroborated |
| POOLED_MULTI_MONTH_WINDOW | 3 (weak) | Its own window-level presentation | Neither per-invoice nor per-month attribution is meaningful; forcing either manufactures false precision |
| PROXIMITY_ONLY | 4 | Balance-only, no invoice-level claims | Weakest inferential basis |
| UNCHARACTERIZED | 5 | **No statement** | Not a default to guess through — an explicit blocked state |

**Rule:** a statement generator must check evidence_status before emitting invoice-level claims, not just check which artifact exists for the account. A generator that produces a confident per-invoice statement for an ASSERTED LIFO/FIFO account is over-claiming — this is the same failure the legal-handoff process guards against, one layer earlier in the pipeline.

**Worked cautionary cases from this session:** JEN001's LIFO pattern closes arithmetically across doc 41615's four partial payments and remains ASSERTED, never upgraded. JIM001's doc 40746 June-vs-July dispute was only settled by an independent external workbook, not by any internal exact-sum reasoning. MOZ002's phantom −R1,207.50 residual came from a doc-level heuristic over-claiming a lane split it couldn't actually support.

-----

## D-NEW.6 — Lane classification is a property of the line, never of the document

Accounts differ in whether LPG and CYL appear as **separate sibling documents** (JEN001: doc 51154 LPG / 51155 CYL, adjacent numbers, same delivery) or **mixed lines on one document** (MOZ002 and, per existing doctrine, the norm in cylinder trading). This is an account-level structural variable that must be established before any lane-dependent work begins — it is not safe to infer from one account and apply to another.

**Rule:** classify by debt_group on the line itself. Never infer a document's lane from a reference-field heuristic (-EMPTY suffix matching), a doc-number pattern, or the document's other lines. Doc-level classification manufactures phantom residuals — MOZ002's −R1,207.50, exactly one shell-module wide, is the documented case. PDP-33 is the same failure in a different guise: an allocator classified CYL-vs-LPG by a hand-maintained text suffix instead of the DB column, and mistargeted a payment onto the wrong sibling document.

**Corollary:** wherever a script uses a string heuristic to make a classification a DB column already answers, prefer the column. Heuristics drift out of sync with reality; a column cannot.

-----

## D-NEW.7 — Absence of a match is not evidence of non-payment

Before treating any document as unmatched, unpaid, or anomalous, check whether the artifact being consulted actually **covers that document's period and scope at all**.

**The case:** 36 of JEN001's 90 LPG invoices showed zero coverage in allocation_edges.csv and looked like a large backlog. They predated the edges file's own earliest payment (2025-03-05) — the file was built from a raw ERP export that only reaches back to March 2025, so the allocator never had data to consider them. The account's balance independently ties to the ERP exactly at later checkpoints, which would be impossible if those invoices were genuinely open.

**Rule:** establish an artifact's own coverage boundary (earliest date, scope filters, which lanes/entry types it includes) before interpreting gaps in it. A gap outside the coverage boundary is NOT_ATTEMPTED_BY_DESIGN, not an open item. Apply this check *before* any age-based staleness classification, or a whole block of pre-scope history gets misclassified as backlog.

-----

## D-NEW.8 — Tier-2 artifacts are claims subject to audit, not facts

An artifact being generated by an established script does not make its contents correct. Session evidence:

  - allocation_edges.csv targeted the wrong document entirely on JEN001 (PDP-33) and targeted a beverage line on MOZ002 (PDP-35).
  - monthly_lpg_insights.csv and the JIM001 yearly narrative reports disagreed in *both directions* — the CSV was stale for some months, the reports stale for others; neither was uniformly authoritative.
  - Two JIM001 yearly reports overstated historical anomaly by roughly R101,500 combined, because they used a sequential pairing method that predated the split-allocation work.

**Rule:** when two artifacts disagree, neither wins by default and neither is resolved by re-reasoning over the same data. Resolve with genuinely independent evidence. The JIM001 40746 June-vs-July dispute went through two reversals on internal reasoning alone and was only settled when an external analyst workbook — computed independently — agreed with one side. An audit finding that contradicts a generating script is a finding about the script, not an error in the audit.

-----

## D-NEW.9 — Aggregates hide structure; validate at the grain where the error would live

Three separate incidents this session were the same failure: a correct-looking total concealing offsetting or indistinguishable components.

  - JIM001 2021: October short by R399.91, November over by exactly R399.91 — the year nets to ≈R0 and looks settled. Two real events, not one non-event.
  - TWK002: PDP-31's item duplication and PDP-34's header duplication both inflated their side ~2×, so affected docs *appeared* to tie out. Fixing one side alone breaks the accidental cancellation and makes tie-out rates look worse while the data is genuinely more correct.
  - FIFO vs LIFO: an exhaustive allocator's amounts sum exactly to its targets *by construction*, regardless of which consumption order it assumed. The arithmetic tying out proves the allocator ran to completion — nothing about the order.

**Rule:** validate at the finest grain where the error could exist, not at the level where the number looks clean. This is why D-NEW.4's identity must be checked per-lane rather than as a combined total, and why granularity is load-bearing architecturally: **tier-3 and tier-2 artifacts must not be built downstream of a coarser-grained artifact.** Option C needs per-document rows; v5 produces monthly rollups — building the former on the latter would discard exactly the grain at which PDP-33 and the MOZ002 beverage line were caught. Share computation logic (tier 1), not aggregated output.

-----

## Open questions — not resolved by this session, flagged for whoever ratifies this

  - Whether all three sibling artifact types (v5, Option C, bespoke) can actually answer all four customer-view questions, or whether some require a fourth artifact type not yet built. Not verified against MOZ002's bespoke script specifically.
  - Whether tier 1's cylinder-value-owed rate table is genuinely complete across the portfolio (JIM001's 8-year history gives 5 confirmed weight-group rates; not confirmed this covers every weight group in use elsewhere).
  - Whether this doctrine should live as its own file or be folded into DEBTORS_DOCTRINE.md directly, and what ratification process (if any) applies before it's treated as binding.
  - **D-NEW.5's mapping names statement types that don't all exist yet.** No generator currently produces a window-level presentation (POOLED_MULTI_MONTH_WINDOW), and no existing generator checks evidence_status before emitting invoice-level claims — Lineage B's Rule 15 tag-check gate is the closest existing mechanism, but it gates on remittance coverage, not on the ASSERTED/PROVEN distinction specifically. Applying D-NEW.5 requires building at least one new statement type and adding an evidence-status check to existing generators, not just classifying accounts against the table.
