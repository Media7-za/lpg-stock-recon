# Portfolio Review — Statement Pipeline & Payment-Pattern Classification

**Date:** 2026-09-13
**Type:** Review + proposal. No schema, pipeline, or config changes were made as part of this review. Everything below is a finding or a recommendation pending sign-off.
**Scope:** All 20 debtor accounts under `analysis/debtors/` (excluding `shared`, `evidence_exchange`, `Global Reports`).

---

## 0. How to read this document

Part 1 answers "what statement output does each account actually have, and does it show open items or just a ledger." Part 2 answers "should the two generators become one." Part 3 answers "what do we actually know about how each account pays, and is the draft taxonomy right." Part 4 proposes a registry to make all of this queryable in one place instead of requiring a doctrine-folder read per account. Section 5 lists everything found that contradicts or complicates what this session had previously established — read that section even if you skip the rest.

---

## 1. Statement pipeline lineage — one row per account

**No pre-existing version of this table was found.** Checked `SLICE_REGISTRY.json`/`SLICE_REGISTRY.md` (defines slice *types*, not per-account state), `portfolio_candidates.csv` (portfolio triage — balance/ageing/lane, no statement fields), `DEBTORS_DOCTRINE.md`, and `CURRENT_STATE.md` (scoped to an unrelated LSR-5/INC001 spec, explicitly disclaimed as non-harmonized). This table is the first consolidated enumeration.

| Account | Lineage A (highest v) | Customer/Internal split | Lineage B | Bespoke/deviates | Notes |
|---|---|---|---|---|---|
| BR0001 | v5 | No | No | No | Clean case — config → output, nothing unusual. |
| BU0002 | **Config only, no output** | No | No | No | `config/statement_v5.json` exists but no `BU0002_Statement_Account_v5.*` was ever rendered. No `project.json` at all — unlike every other configured account. |
| BU0005 | No statement output at all | No | No | No | Only settlement-discount/allocation investigation reports, different naming scheme entirely. |
| BU0009 | No | No | No | No | Only one intelligence note; no config, no statement. |
| CAP000 | No | No | No | No | Only settlement-discount config + onboarding reports. |
| FAM000 | v4 | **Yes** — unversioned baseline (Customer+Internal) and v4 (Customer+Internal) | No | **Yes** | `config/` is empty — no `statement_v4.json` ever existed. `scripts/reconcile_fam_v4_extended.py` is a **second bespoke generator** (previously unflagged): hardcodes B/F balances and SKU rates, talks to Supabase directly, bypasses the shared `reconcile_debtor_v4_from_txt.mjs` entirely despite producing standard-looking filenames. |
| FAM001 | No | No | No | No | Empty shell — `project.json` only. |
| GAS004 | v5 | No | No | No | Clean case. |
| IVE001 | v5 | No | No | No | Has a one-off `IVE001_Customer_Ledger_Apr2026` report — not a versioned `_Customer` split, don't conflate. |
| JEN001 | v5 (full v1→v5 progression) | **Yes, asymmetrically** — Customer-only at baseline/v2/v3, **both** at v4, **neither** at v5 | **Yes** | No | Fullest lineage of any account. Split coverage varies by version — flatten to one Y/N and you lose the v4-only detail. |
| JIM001 | v4 (no v5 built) | **Yes** — v4 and baseline, Customer+Internal | No | No (script folder holds payment-pattern tooling only, not a statement generator) | **Config/output mismatch:** `config/statement_v4.json` does not exist and never existed in git history, yet full v4 output (including the split) exists. All v4 artifacts landed in one bulk onboarding commit with the raw data — the actual generation mechanism is untraceable. |
| MD0003 | **Config only, no output** | No | **Yes** | No | Mirror image of BU0002: `config/statement_v4.json` was scaffolded (per its own `project.json` log) but never rendered. MD0003 is doctrine-classed a monthly-batch payer; its real delivered effort went into Lineage B instead, leaving the v4 scaffold orphaned. |
| MON001 | v5 | No | No | No | Clean case. |
| MOZ002 | v5 (v1 and v5 only — no v2–v4) | **Yes** — v1 only | No | **Yes (confirmed outlier)** | `scripts/build_statement_account.mjs` is fully bespoke, confirmed. Also has a second bespoke artifact, `build_operator_view.mjs` → `MOZ002_OPERATOR_VIEW.md`. |
| RED001 | v5 | No | No | No | Has account-specific `ratification_scenarios.json` but still renders via the shared v5 generator, not a bespoke script. |
| SA0001 | v5 | No | No | No | Clean case. |
| TAN001 | v5 (v4 and v5 only — no v1–v3) | **Yes** — v4 only | No | No | Same config/output gap as JIM001: no `statement_v4.json` in git history, yet full v4 output (including the split) exists, no local `scripts/` folder either. |
| TWK002 | v5 | No | **Yes** | No | Supplementary scripts are investigation/bridge tools, not alternate generators. Has an archived snapshot of its Lineage B output (`snapshots/2026-08-11_v1/`) — a point-in-time copy, not a new version line. |
| WES004 | v1 only | No | No | No | `config/` empty — v1 predates the templated-config convention (templates only exist for v4/v5). |
| WO0001 | v1 only | No | No | No | Has a separate `WO0001_Statement_Bridge_v1/v2/v3.md` family — **not** the same lineage as `_Statement_Account_vN`; don't mistake its v3 for a Lineage-A v3. |

**Structural findings that apply across the table, not to one account:**

1. **The v1–v3 config-template gap is systemic.** `shared/templates/` only has v4 and v5 templates. Every account whose highest/only version predates v4 (WES004, WO0001, MOZ002's v1, JEN001's/FAM000's earliest baseline) has no config JSON, because the templated-config convention postdates those runs. Expected, not a defect.
2. **The Customer/Internal split never survives to v5.** Every account that ever had it (FAM000, JEN001, JIM001, MOZ002, TAN001) had it at v1–v4 or unversioned only. The likely explanation: v5 is an internal, line-level reconciliation format (see `SLICE_REGISTRY.json`), and once it became standard, customer-facing delivery moved to Lineage B where that pipeline exists (JEN001, MD0003, TWK002) — v5 stopped needing a customer-safe variant of itself. This is a load-bearing fact for Part 2 below.
3. **Two accounts have config without output (BU0002, MD0003) — the mirror image of JIM001/TAN001 having output without config.** None of these four could be resolved with certainty from repo evidence alone; flagging rather than guessing.
4. **Bespoke generators: two accounts, not one.** MOZ002 (already known) and FAM000 (newly found). Every other account's script folder either delegates to the shared generators or holds unrelated investigation tooling — checked all of them.
5. **No doctrine-vs-filesystem contradictions found.** `DEBTORS_DOCTRINE.md` and `CURRENT_STATE.md` don't make per-account version claims that the filesystem could confirm or refute; the few account-specific mechanisms they do name (TWK002's balance bridge, RED001's ratification scenarios) check out exactly as described.

---

## 2. Should ledger view and open-items view be one generator or stay separate?

**Recommendation: keep them separate, but extract the shared parsing layer.** Not the merge the working hypothesis expected — the code doesn't support it.

**Why not a merge — three independent, load-bearing reasons, each sufficient on its own:**

1. **They run on different runtimes by design.** Lineage B (`generate_statement_of_account.mjs` + `debenq_open_invoices.mjs`) is deliberately DB-free — no `pg` import anywhere, pure TXT parsing, stated explicitly in its own header comment. Lineage A (`reconcile_debtor_v4_from_txt.mjs`/`v5`) *requires* Postgres — not optionally, for the line-level LPG/CYL split (`vw_clean_transactions`) and the entire Part 2 physical-cylinder ledger. Merging means either forcing DB access onto the statement-of-account path (defeats its documented purpose) or forcing Lineage A's line-splitting into TXT-only territory the codebase has already found unsafe: doc-level `-EMPTY` regex splitting manufactured a phantom −R1,207.50 residual on MOZ002, per `SKILL_Debtor_Statement_v4_From_TXT.md`'s own doctrine addendum.
2. **They encode different accounting doctrines, not just different views of the same numbers.** Lineage B treats every open-invoice claim as a hypothesis requiring evidence before customer release (business_rules.md §15's whole tag-coverage gate, which can abort a run with `BLOCKED`/`NOT_DERIVABLE_FROM_TXT`) — Lineage A never makes an invoice-level claim, so it has never needed that gate. Separately, v5 has an explicit "no proportional payment split" doctrine that isn't obviously compatible with Lineage B's per-invoice netting. Bolting one onto the other risks conflating two deliberately different settlement models, not adding a feature flag.
3. **The two config schemas differ in kind, not just shape.** Lineage A's config is fixed typed constants (`cylOpeningQty`, `skuRates`, etc.), edited rarely, by developers. Lineage B's config is a live, append-only audit ledger of human settlement decisions — TWK002's real config has 32 `closedInvoiceOverrides` and 7 `balanceBridgeLines`, each with a prose settlement rationale and citation, edited frequently by whoever is doing collections/finance sign-off, with dated staleness warnings baked in as `_comment_*` fields. A unified schema would confuse both purposes and risks a v5 config edit accidentally touching fields that gate customer-facing invoice release.

Real duplication does exist, but at a smaller and safer grain than a generator merge:
- The same DEBENQ TXT format is parsed independently by `parseDebenqWithRunning` (Lineage B) and `parseTxtRows` (v4 and v5 each have their own copy) — same header/row shape, different fields extracted for different purposes.
- `export_to_html.py` and `export_to_pdf.py` duplicate their `enhance_html()` function almost verbatim.
- No shared computed artifact exists between the lineages for an account onboarded to both: TWK002's B/F figure (R38,791.27) is entered once in `statement_v5.json.combinedBf` and again by hand in `statement_of_account.json.balanceBridgeLines[0].amount` — same number, two files, no cross-check if the source TXT changes.

**Concrete recommendation (proposal, not implemented):**
- Extract one shared TXT-parsing module (superset of `parseDebenqWithRunning`/`parseTxtRows`) that v4, v5, and the statement-of-account generator all import, instead of three independent re-parses of the same format.
- If a v4/v5 account ever genuinely needs an open-items table, have that script **import `debenq_open_invoices.mjs`'s functions directly** to add a section to its own output — not merge the generators.
- Separately (out of scope for this decision, flagged for cleanup): de-duplicate `enhance_html()` between the two Python export scripts, and confirm whether `generate_statement_from_workspace.py` is dead code — it expects `data/invoices.csv`/`payments.csv`/etc. that don't exist for any checked account (JEN001's `data/` only has `allocation_edges.csv`), isn't wired into `package.json`, and isn't referenced by either live SKILL doc.

---

## 3. Payment-pattern classification

### 3.1 What JIM001's 9-year history already establishes

All 9 `JIM001_<YEAR>_Payment_Pattern_Analysis.md` reports (2018–2026), the override registry, `allocation_edges.csv`, and the three analysis scripts were read in full.

**The "exact-to-the-cent" idea already exists in committed doctrine — but scoped differently than the working hypothesis assumed.** `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md` §2 states the rule at the *calendar-month* level: test whether a STAT payment equals a whole month's net LPG billing to the cent before ever assuming chronological/FIFO application. Its own frontmatter says it was **first built for MD0003** and should be **generalized to JIM001** — that generalization was never actually done. JIM001's 9 reports were built with the older, looser `lpg-payment-pattern-analysis` skill (±R5 tolerance matching), not this exact-sum method.

**Confirmed with real data, at the invoice-batch level:** ran `allocation_edges.csv` (394 rows / 77 payment docs) — **43 of 77 payment docs (56%) sum exactly to the cent** against consecutive invoices in **oldest-invoice-first (FIFO)** order. Two full worked examples:
- Doc 00013245 (2022-03-17, STAT197, R14,982.58) across 7 invoices (2022-01-03→01-28): sums to R14,982.58 exactly.
- Doc 00014135 (2022-06-01, STAT200, R18,184.64) across 8 invoices (2022-04-01→04-28): sums to R18,184.64 exactly.

**Caveat that matters for the taxonomy:** these are human-reconstructed allocations (`evidence_source = HUMAN_WORKSHEET_AND_ERP`), not remittance advices. The pattern's own skill doctrine says never to claim customer intent without a remittance advice. So "exact-to-the-cent against a FIFO batch" is a real, demonstrable property of the ledger, not proof of intent.

**JIM001 is not one uniform pattern across 9 years** — at least four sub-regimes: 2018–2021 near-exact monthly matches, under-detected by the naive matcher's lag handling (false "Skipped Month" flags — e.g. 2021-11 is flagged skipped by the 2021 report but the 2022 report's own table shows it was in fact settled by Doc 12719 on 2022-01-31); 2022–2023 genuine underpayment/overpayment requiring Rule 13 / Pattern 2/3 corrections; 2024 Apr–Nov a **pooled multi-month settlement window** (6 payments jointly clearing 8 months) that has no name in any skill doc; 2025–2026 sporadic matches with no maintained override registry past 2024-12. Only 2022–2024 have been through human review with recorded overrides — 2018–2021 and 2025–2026 are unreviewed algorithm output and shouldn't be cited as verified "batch payer" behavior on the same footing.

### 3.2 The draft `matched_via` taxonomy — does not exist in the repo as committed data

Searched the entire repo for `matched_via`, `LIFO_BATCH`, `REMITTANCE_BATCH`, `PROXIMITY_MATCH`, `RUNNING_BALANCE_ONLY`, `MANUAL_ADHOC`. **None of these exist as literal field names or enum values anywhere in committed code or config.** `REMITTANCE_BATCH` and `PROXIMITY_MATCH` appear only as substrings inside real `override_type` values (`VERIFIED_REMITTANCE_BATCH_MATCH` on TWK002, `VERIFIED_PROXIMITY_MATCH` in the generic invoice-linked doctrine). This is flagged as a finding, not a gap to quietly fill: the taxonomy this review was asked to reconcile against the codebase was itself never persisted to the codebase. See §5 for why this matters.

What the repo actually has is a different, already-committed classification: a **skill-selection tree** (`.agents/skills/SKILL_Payment_To_Invoice_Allocation.md` §13) that routes an account to one of three skills based on whether >50% of payment value has `ref_no → invoice.doc_no`, then whether it pays monthly STAT totals against pooled debt. JIM001 routes to `lpg-payment-pattern-analysis`; JEN001 routes to a third, differently-named lane ("Reconciliation skill — running balance + CYL strip"), not a batch-matching skill at all in this table.

### 3.3 BU0002 — hypothesis untestable, not confirmed by analogy

Verified: `analysis/debtors/BU0002/` contains only `config/statement_v5.json`, `BU0002_Ingest_Gate_Projection.md`, `BU0002_Onboarding_Status.md`. No `allocation_edges.csv`, `invoices.csv`, or `payments.csv` exists. Both reports state `reconState: blocked`, gate `UNVERIFIED`, and the ingest check fails on a missing statement TXT. There's a Supabase derived-cache signal (1,394 `transaction_headers` rows) but both onboarding docs explicitly flag it as cache-only, not Tier-3 authority. No `DATABASE_URL` was available in this session to query it directly.

**Conclusion: the exact-to-the-cent-batch hypothesis cannot be tested for BU0002 with what's currently committed.** The only signal — a preliminary note that it pays `TRANSF` + STAT batches — is a lane classification, not evidence of exact-sum matching. Treating BU0002 as JIM001-like by analogy would be exactly the unverified generalization this review exists to prevent. This is a data gap to close (ingest BU0002's statement TXT) before the account gets a payment-pattern bucket at all — it should not be assigned one provisionally.

### 3.4 Proposed reconciled taxonomy

The flat, five-value `matched_via` enum doesn't survive contact with the evidence — it conflates two independent axes, which is exactly why JIM001 and JEN001 don't fit cleanly into single buckets. Proposal: two fields, not one.

**`evidence_tier`** (already implicit in the repo's own `evidence_source`/`confidence` fields):

| Tier | Meaning | Existing repo term |
|---|---|---|
| 1 | Remittance advice names the settled invoices | TWK002's `VERIFIED_REMITTANCE_BATCH_MATCH` |
| 2 | ERP `ref_no` links payment→invoice, amounts cent-align | `EXPLICIT_ALLOCATION` / `OPEN_BALANCE_MATCH` |
| 3 | Reconstructed exact-sum match, no remittance, numbers tie exactly | JIM001's FIFO batches (§3.1); MD0003's exact-month-sum |
| 4 | Amount-proximity / best-fit, tolerance-based | `VERIFIED_PROXIMITY_MATCH`, `BEST_FIT_AMOUNT_MATCH` |
| 5 | Unallocated / unmatched | `VERIFIED_UNALLOCATED`, `RULE_13_SURPLUS`, `VERIFIED_MISSING_PAYMENT` |

**`settlement_unit`** (what the batch actually is):

| Unit | Meaning | Example |
|---|---|---|
| Per-invoice, ref-linked | ERP ref_no ties payment to one invoice | WO0001 |
| Per-invoice, FIFO-batch | One payment spans N invoices, oldest first, no remittance | **JIM001 — this is the evidenced pattern, not "LIFO_BATCH"** |
| Per-invoice, LIFO-batch — **asserted, unconfirmed** | One payment spans N invoices, newest first | JEN001 — `evidence_tier: 3`, `evidence_status: ASSERTED` (see §5 items 2 and 10; re-checked and re-confirmed as ASSERTED, not upgraded, during this review) |
| Per-calendar-month, exact-sum | Payment gross equals one month's net billing | MD0003 (proven); JIM001 partially (2022–23) |
| Pooled multi-month settlement window | N payments jointly clear M months; no single-month attribution is meaningful | JIM001 2024 Apr–Nov — needs a name, doesn't have one yet |
| Remittance-batch (named, evidenced) | Explicit advice lists a batch | TWK002 |
| Proximity-only | No ref/remittance/exact-sum; amount+date window fallback | MOZ002 |
| Uncharacterized — insufficient evidence | No committed data to assign a pattern | BU0002 — an explicit state, not a default bucket |

Recommendation: store both fields per account rather than collapsing to one enum. It's what actually distinguishes, e.g., `REMITTANCE_BATCH` (tier 1 + batch unit) from `PROXIMITY_MATCH` (tier 4, no settlement-unit claim at all) — the current draft's single axis erases that distinction.

**A third field is required, orthogonal to both of the above: `evidence_status` (`ASSERTED` / `PROVEN`).** This was not in the original two-axis proposal and was added after a follow-up check on JEN001 exposed why it can't be left implicit (full account in §5 item 10). In short: `evidence_tier` describes *what kind* of evidence exists, but tier alone doesn't tell you whether that evidence has actually cleared the bar the repo's own doctrine sets for calling something settled. Tier 3 ("reconstructed exact-sum match") is the sharpest case — an exhaustive allocator (LIFO, FIFO, or any other consumption order) is *guaranteed by construction* to sum exactly against the invoices it targets, once it fully exhausts a payment; that arithmetic holding up confirms the allocator ran to completion, not that the order it assumed is what the customer actually did. So a tier-3, `settlement_unit`-batch row must carry `evidence_status: ASSERTED` unless something outside the allocator itself — a remittance advice, a bank deposit reference — names the target. Concretely: JEN001's `settlement_unit = "Per-invoice, LIFO-batch"` gets `evidence_tier: 3` and `evidence_status: ASSERTED`, per the repo's own recorded kill condition (§5 item 2) — not `PROVEN`, and not something a future query against the registry should be able to round up to PROVEN by omission.

---

## 4. Proposal: a canonical account registry

**No canonical "all accounts" registry currently exists** beyond `analysis/debtors/shared/data/portfolio_candidates.csv`, which covers balance/ageing/lane/triage-tier for portfolio *candidates* only (69 rows, includes many accounts with no debtors-analysis folder at all) and has no statement-lineage or payment-pattern fields.

**Proposal:** extend that CSV (simplest option, matches its existing format and role) or introduce a companion CSV/JSON keyed the same way, with at minimum:

| Column | Source | Notes |
|---|---|---|
| `account_code` | existing | join key |
| `remittance_basis` | `debtors:tag-check` output (`REMITTANCE_BACKED` / `PATTERN_ONLY`) | **Already computed programmatically** from whether extracted remittance lines exist for the account — don't hand-maintain this column, generate it. |
| `statement_lineage_a` | Part 1 table | highest version reached, or "none" |
| `statement_lineage_a_split` | Part 1 table | which version(s) have Customer/Internal split, if any |
| `statement_lineage_b` | Part 1 table | Y/N |
| `statement_bespoke` | Part 1 table | Y/N + script name if Y |
| `settlement_unit` | Part 3.4 | from the reconciled taxonomy, or "uncharacterized" |
| `evidence_tier` | Part 3.4 | 1–5, or "uncharacterized" |
| `evidence_status` | Part 3.4 | `ASSERTED` / `PROVEN`, mandatory alongside `evidence_tier` — see §3.4's third field. Never leave blank on a populated row: a missing value here is indistinguishable from "not yet assessed," which is a different claim than "assessed as asserted." |
| `pattern_evidence_confidence` | derived | e.g. "human-reviewed 2022-2024, unreviewed elsewhere" for JIM001-style partial coverage — a plain Y/N here would misrepresent accounts like JIM001 |

Two things worth deciding explicitly before building this, not after:
1. **Generate what can be generated.** `remittance_basis` is already computed by `debtors:tag-check`; wire the registry to read that output rather than re-entering it by hand, or it will drift the first time an account's remittance data changes.
2. **Don't force a bucket where evidence doesn't support one.** BU0002 (§3.3) and every "no data" account in Part 1 should get an explicit "uncharacterized/insufficient evidence" value, not a best-guess bucket — the whole point of this registry is to stop someone from assuming a pattern that was never actually tested.
3. **`evidence_status` must be a stored field, not a derived display label.** The whole reason it exists is that `ASSERTED` rows (JEN001's LIFO row, first and worst case) are computed by the same pilot script whose own premise is in question — so if a future regeneration of this registry re-derives `evidence_status` from the allocator's own output rather than from a recorded human/doctrine judgment, it will silently launder the assertion into something that reads as checked and settled. Treat `evidence_status` the way `closedInvoiceOverrides` are already treated in this codebase: written once by whoever has the authority to make the call (operator ratification, or a named kill-condition check), never regenerated from the pattern data it's meant to be qualifying.

This directly addresses the "read the entire doctrine folder before knowing what kind of account this is" friction the brief cited. One caveat: I could not locate the specific "gotcha #8" citation in any committed methodology document (checked `docs/README.md`'s Known Gotchas table, `DEBTORS_DOCTRINE.md`, `SKILL_QA_Agent.md`/`SKILL_Coding_Agent.md`'s gotcha tables — none contain a numbered item matching that description). It may be from session context not yet committed to the repo; flagging rather than guessing at its source.

---

## 5. Explicit contradictions and things that don't hold up

1. **The draft `matched_via` taxonomy (LIFO_BATCH/REMITTANCE_BATCH/PROXIMITY_MATCH/RUNNING_BALANCE_ONLY/MANUAL_ADHOC) is not implemented anywhere in the repo.** It's not in `matched_via` fields, not in any `override_type` enum, not in report prose. Whatever it was derived from, it wasn't a grep of this codebase's actual artifacts.
2. **`LIFO_BATCH` traces to JEN001, not JIM001, and the repo itself calls it unproven.** `docs/handoffs/2026-08-29.md` states LIFO is JEN001's assumed payment-application order, explicitly tagged **"ASSERTED not PROVEN for collections"**, with a named kill condition (a bank deposit itemizing a different invoice set for STAT 129 would reopen it), and flagged as proposed doctrine, not ratified. A taxonomy that presents `LIFO_BATCH` as settled behavior overstates what the repo itself claims.
3. **JIM001's actual evidenced batch pattern is FIFO (oldest-invoice-first), not LIFO** — the opposite order from what the `_BATCH` naming alongside JEN001's LIFO label would suggest if the two were read as parallel cases.
4. **JIM001 and JEN001 are not the same payer class in the repo's own doctrine.** The skill-selection tree in `SKILL_Payment_To_Invoice_Allocation.md` §13 routes them to two different skills. Grouping them under a shared "batch payer" umbrella by naming convention elides a real structural difference: JEN001's stripped-LPG open-invoice model exists because its ERP export excludes allocation detail — a data-availability constraint, not a chosen payment behavior like JIM001's.
5. **JIM001 is not one pattern across its 9-year history** — see the four sub-regimes in §3.1. Only 2022–2024 carry human-reviewed overrides; treating the full 9 years as uniformly-evidenced "batch payer" behavior would be citing unreviewed algorithm output (which has demonstrated false positives, e.g. 2021-11) as settled fact.
6. **The `monthly-batch-erp-bridge-reconciliation` skill's exact-sum method was built for MD0003 and explicitly earmarked for generalization to JIM001 — but that generalization was never done.** JIM001's actual 9 reports run on the older, looser tolerance-based skill. If a reconciled taxonomy leans on "JIM001 is exact-to-the-cent," it should cite the invoice-level `allocation_edges.csv` reconstruction (§3.1, real but human-reconstructed, not remittance-confirmed) rather than implying the calendar-month exact-sum method has already been applied there — it hasn't.
7. **BU0002 shares nothing testable with JIM001 today.** No allocation or invoice-level data exists for BU0002; asserting it shares JIM001's pattern "by analogy" is precisely the mistake this review was scoped to catch (see §3.3).
8. **A second bespoke statement generator exists (FAM000's `reconcile_fam_v4_extended.py`) beyond the already-known MOZ002 outlier** — previously unflagged, found by checking every account's script folder rather than stopping at the one named case.
9. **The "gotcha #8" methodology-doc citation could not be located** in any committed doctrine file checked (§4). Not asserting it's wrong — just that it isn't verifiable from what's in the repo today.
10. **A follow-up check on JEN001's LIFO row confirmed item 2 rather than overturning it, and surfaced a sharper reason why.** The reviewer re-derived doc 41615's clearance (four partial payments across `data/allocation_edges.csv`, 2025-05-28 → 2026-01-07, summing exactly to R3,680.67) directly from the ledger. Worth recording precisely what that check does and doesn't establish: **exact-sum/residual-exhaustion conservation is a structural guarantee of any exhaustive allocator — LIFO, FIFO, or an arbitrary order — once it fully consumes a payment against a target set; it does not discriminate between them.** The final residual reaching R0.00 confirms `scripts/allocation_ingest_pilot.mjs` ran to completion, not that LIFO is the order the customer's payments actually followed. The one piece of the check that is even suggestive is the *temporal signature* — an invoice from March 2025 taking eight months and four separate payments to clear while later-dated invoices settle cleanly in between is consistent with LIFO and inconsistent with strict FIFO — but that signature is still the pilot script's own output describing its own internal consistency, not a source independent of the assumption it's checking. No remittance advice or bank deposit reference exists for any of the four payments involved. **Net effect: `evidence_status: ASSERTED` for JEN001's LIFO row stands as originally flagged; this review's own confidence in item 2 should not be read as higher than it was before this check, and the registry in Part 4 now carries `evidence_status` as a mandatory, separately-written field for exactly this reason** — so that a tier-3 pattern match can't be queried later as if it were tier-1 remittance confirmation.

---

## 6. What this review recommends, summarized

- **Part 1 table** — built above; keep it, and feed it into the Part 4 registry rather than re-deriving it per session.
- **Part 2** — do not merge Lineage A and Lineage B generators. Extract the shared TXT-parsing layer only. Separately clean up the duplicated `enhance_html()` and confirm/retire the apparently-orphaned `generate_statement_from_workspace.py`.
- **Part 3** — adopt the three-field model (`evidence_tier` × `settlement_unit` × `evidence_status`) instead of the flat `matched_via` enum; correct the JIM001-FIFO/JEN001-LIFO conflation and carry JEN001's `ASSERTED` status as a stored field, not just prose, wherever its pattern is cited; treat BU0002 as uncharacterized until its statement TXT is ingested, not as JIM001-by-analogy; apply the `monthly-batch-erp-bridge-reconciliation` exact-sum method to JIM001 as originally earmarked, rather than continuing to rely on the older tolerance-based reports for years without human review.
- **Part 4** — extend `portfolio_candidates.csv` (or a companion file keyed the same way) with the columns above, generating `remittance_basis` from `debtors:tag-check` rather than hand-entering it, writing `evidence_status` once by human/doctrine judgment rather than re-deriving it from an allocator's own output, and using an explicit "uncharacterized" state instead of a forced guess wherever evidence doesn't support a bucket yet.

All of the above is proposal pending sign-off — no code, config, or schema changes were made in this review.
