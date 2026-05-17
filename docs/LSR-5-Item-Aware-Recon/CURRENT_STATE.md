# CURRENT_STATE

> **Source of truth for LSR-5 Item-Aware Financial Reconciliation Engine.**
> Generated from Decision Node (2026-05-17, v2.3.1) and Sessions A + B.
> Future AI sessions, agents, and developers must treat this document as the operational baseline.

---

## 1. PROJECT STATUS

- **Current Phase:** Pre-implementation — Specification locked, schema design pending
- **Active Focus:** Data schema build + Session load pipeline
- **Operational Stability:** No code in production. Living spec (v2.3.1) is the only active artefact.
- **Last Major Update:** 2026-05-17 — Decision Node merged from Sessions A and B; spec passed three domain review passes (v2.1.0 → v2.3.1); 18/18 validation checks pass. T-01 completed and validated.

---

## 2. ACTIVE ARCHITECTURE

### Overview

LSR-5 is a **human-in-the-loop hybrid AR + Custody reconciliation workbench**, not an invoice matching engine. It reconstructs the true state of a customer's AR ledger from four partially incomplete sources and surfaces unresolved items for operator decision. No autonomous financial allocation is permitted.

### Source Architecture (four-source)

| Source | Role |
|---|---|
| ERP summary CSV (`RECON_SUMMARY_INC001.CSV`) | Document headers and reference balance |
| ERP detail CSV (`DETAILED_REPORT_INC001.CSV`) | Item signatures and sub-ledger seeding |
| `transaction_headers` (Supabase DTRX) | **Sole reliable payment source** |
| `transaction_items` (Supabase DTRX) | CYL qty per SKU for custody tracking |

`erp_snapshots` and `movement_data` are out of scope — CYL Custody Engine, deferred post-MVP.

### Invoice Model — Four-Component Sub-Ledger

Every invoice carries four independently tracked components:

```
lpg_value_balance       -- monetary: LPG product value
cyl_value_balance       -- monetary: cylinder deposit value
other_value_balance     -- monetary: miscellaneous charges
cyl_qty_balance_by_sku  -- JSONB: physical cylinder qty by SKU
```

These components are settled independently. Settling one does not imply settling others.

### Settlement Model — Dual Independent State Machines

```
financial_state  ∈ { OPEN, PARTIALLY_SETTLED, SETTLED, WRITTEN_OFF, EXCEPTION }
custody_state    ∈ { OUTSTANDING, PARTIALLY_RETURNED, RETURNED, EXCEPTION }
```

`financial_state = SETTLED` + `custody_state = OUTSTANDING` is a **valid, complete financial outcome** (applies when `pays_for_cyl = true` accounts return cylinders separately).

### PMT Allocation Mechanics (locked)

- One PMT → one invoice → one sub-ledger component → operator-confirmed action
- No proportional split across components
- No automatic spillover to next component
- PMT remainder → `Suspense-PMT`; second operator action required for remainder
- Engine suggests next allocation but never executes it

### Payment Chronology (hard invariant)

`invoice_date ≤ payment_date` is non-negotiable. Future-dated invoices are filtered out before scoring and are invisible to the allocation scorer.

### Session Scope

- One account per session
- Session state is fully operator-driven
- Read-only workbench — ERP is never written back to

### Exception Taxonomy (five lanes)

| Lane | Type | Blocking? |
|---|---|---|
| `Suspense-PMT` | Financial — unallocated payment remainder | No |
| `UNCLASSIFIED_EXCEPTION` | Financial — Bank UD / JNL requiring operator classification | Yes — blocks session completion |
| `DEBIT_ADJUSTMENT` | Financial — exposure-increasing adjustment; danger UX mandatory | No |
| `ROUNDING_WRITE_OFF` | Financial — residuals ≤ R1.00; one-click operator approval required | No |
| `OPERATIONAL_EXCEPTION` | Custody-only — unmatched zero-value CRNs | No — non-blocking, separate lane |

### Custody Reconciliation Audit Model (locked)

Operational CRN deterministic auto-apply (session load step 5) uses **Model A — logged operational event**. Model B (silent mutation) is explicitly rejected.

- Auto-apply **must** write a `custody_reconciliation_event` record
- Auto-apply **must not** write a financial `allocation_record`
- `custody_reconciliation_event` is a separate append-only table from `allocation_record`
- This preserves accounting semantics: financial audit log stays clean; custody state changes remain traceable

Permitted in auto-apply: reduce `cyl_qty_balance_by_sku`, update `custody_state` if qtys reach zero.
Prohibited in auto-apply without operator confirmation: any change to value balances or `financial_state`.

### Customer Configuration (friction-born)

| Flag | Behaviour |
|---|---|
| `allows_cross_bucket_settlement` | Set at first qualifying cross-bucket allocation event — not via settings screen |
| `pays_for_cyl` | Set at first qualifying CYL-related friction event |

Flags are persistent, operator-driven, never inferred from historical behaviour.

### Zero-Value CRN Handling

- Zero-value CRNs are **custody events only** — they never enter the financial engine
- Auto-apply condition: exact SKU match + prior-dated invoice match
- Ambiguous CRNs → `OPERATIONAL_EXCEPTION` queue

### Bank UD Handling

- Bank UD always routes to `UNCLASSIFIED_EXCEPTION` on session load
- `Suspense-PMT` implies confirmed cash receipt — Bank UD does not qualify
- Must be operator-classified before session completion

### ERP Balance Role

- ERP running balance is an **informational health signal only**
- Balance mismatch between reconstructed balance and ERP is expected operating reality
- Session completion does **not** require ERP balance convergence

### Canonical Spec Governance

- Single living file: `LSR5_Business_Rules_Spec.html` (v2.3.1, 26 sections)
- Edits are surgical `str_replace` operations only — no new versioned file copies
- Version history maintained as internal timeline inside the document
- Target location: GitHub repo `LPG Stock Recon`, `docs/` folder, GitHub Pages enabled

---

## 3. IMPLEMENTED / WORKING

- **Business rules spec:** `LSR5_Business_Rules_Spec.html` v2.3.1 — 26 sections, 18/18 validation checks passing, no known contradictions
- **Domain model:** Four-component sub-ledger fully specified; dual-state settlement model fully specified
- **Decision Node:** Merged and locked (2026-05-17) — no active architectural conflicts
- **INC001 first-pass analysis completed:**
  - 197 open invoices
  - 108 CRNs (majority zero-value — operational custody artifacts)
  - 1 payment present in CSV export (confirms DTRX as required payment source)
  - 2 Bank UD records (~R9,860) flagged MISSING IN DATABASE → UNCLASSIFIED_EXCEPTION on load
- **Rejected approaches formally closed:** proportional PMT split, auto-spill, behavioural inference, blind CRN auto-apply, Bank UD → Suspense-PMT, ERP balance as gate

**Nothing is in production. No code has been written. The above represents specification completeness only.**

---

## 4. ACTIVE DECISIONS

### D1 — Four-component sub-ledger model
- **Status:** Active — locked
- **Operational impact:** All invoice tables, allocation records, and scoring logic must operate on lpg/cyl/other value balances and cyl_qty JSONB independently
- **Dependencies:** Schema build (§8, immediate priority)

### D2 — DTRX (transaction_headers) as sole payment source
- **Status:** Active — validated on 2026-05-17 (T-01 complete)
- **Operational impact:** PMT lane must ingest `entry_type = 'Payment'` records. Polarity: negative amounts = payments (credit transactions); positive amounts = allocation adjustments/reversals. Duplicate `doc_no` represents legitimate receipt splits or adjustment offsets and must not be discarded.
- **Dependencies:** None (T-01 complete)

### D3 — One PMT → one invoice → one component (locked)
- **Status:** Active — locked
- **Operational impact:** No split allocation logic permitted anywhere in codebase. Remainder always to Suspense-PMT.
- **Dependencies:** None

### D4 — Friction-born customer configuration
- **Status:** Active — locked
- **Operational impact:** No settings screen for `allows_cross_bucket_settlement` or `pays_for_cyl`. Flags surface at first qualifying event only.
- **Dependencies:** UI implementation pending

### D5 — Bank UD → UNCLASSIFIED_EXCEPTION (not Suspense-PMT)
- **Status:** Active — locked
- **Operational impact:** Session load pipeline must classify Bank UD on load. UNCLASSIFIED_EXCEPTION blocks session completion.
- **Dependencies:** Session load pipeline (§8)

### D6 — ERP balance as health signal only
- **Status:** Active — locked
- **Operational impact:** No convergence check in session completion logic. Balance delta is display-only.
- **Dependencies:** None

### D7 — Operational CRNs excluded from financial engine
- **Status:** Active — locked
- **Operational impact:** Zero-value CRNs must be filtered at session load and routed to deterministic custody apply or OPERATIONAL_EXCEPTION. They must never touch financial lane logic.
- **Dependencies:** Session load pipeline

### D8 — Suggest-only allocation engine
- **Status:** Active — locked
- **Operational impact:** Engine proposes next allocation; operator confirms every action. No autonomous execution.
- **Dependencies:** None

### D9 — DEBIT_ADJUSTMENT requires danger-class UX
- **Status:** Active — locked
- **Operational impact:** Any UI surface exposing DEBIT_ADJUSTMENT must implement a confirmation modal. This is mandatory, not optional.
- **Dependencies:** UI implementation

### D10 — Single canonical spec file
- **Status:** Active
- **Operational impact:** All spec changes are surgical edits to `LSR5_Business_Rules_Spec.html`. No new versioned file copies permitted.
- **Dependencies:** Git repo creation (open action)

---

## 5. OPEN PROBLEMS

| Problem | Severity | Notes |
|---|---|---|
| DTRX `entry_type` values unvalidated | **Closed** | Validated on 2026-05-17 (T-01). Literal is `'Payment'` (not `'PMT'`). Negatives = credits, positives = adjustments/reversals. |
| Findings #1–#13 audit (ChatGPT PRD session) | **Closed** | All 13 findings from the v2.1.0 PRD review verified against v2.3.1. Every finding resolved. T-02 complete. One low-priority cosmetic note: "epoch anchor" phrase in §17 step 6 could be replaced in a future v2.3.2 pass — not a functional defect. |
| INC001 Bank UD origin unconfirmed | **Medium** | 2 records, R9,860, status MISSING IN DATABASE. May be ERP artifacts or legitimate transactions. Classify on load; origin investigation separate. |
| Git repo not yet created | **Medium** | Canonical spec not under version control. Risk of divergence. |
| `cyl_qty_balance_by_sku` JSONB at scale | **Medium** | GIN index strategy undefined. No performance baseline established. |
| PMT component selection UX (mixed invoices) | **Medium** | Spec locked; UI interaction pattern not yet designed. |
| R1.00 rounding threshold | **Low** | Currently a fixed constant. Should be per-account configurable. |
| Cross-period allocation rules | **Low** | Deferred post-MVP. Not specified. |
| INC001 ~R700k open balance | **Medium** | Assumed genuine outstanding AR. Not yet validated — may partly reflect data completeness issues. |
| CYL Custody Engine boundary stability | **Low** | MVP boundary defined at OPERATIONAL_EXCEPTION queue. Volume of unmatched operational CRNs in production unknown. |

---

## 6. ACTIVE BRANCHES / EXPERIMENTS

*No active experimental branches. All architectural directions have been resolved and locked in the Decision Node (2026-05-17).*

*CYL Custody Engine is a deferred post-MVP workstream, not an active branch.*

---

## 7. ASSUMED BUSINESS RULES

### Validated (passed domain review — treat as operational truth)

- An invoice is not a single open balance. It carries four independent sub-ledger components.
- `financial_state` and `custody_state` are independent. Neither requires the other to be resolved.
- `invoice_date ≤ payment_date` is a hard accounting invariant. Not a soft preference.
- Zero-value CRNs are cylinder deposit returns with no monetary effect.
- Operational CRNs auto-apply only on exact SKU match + prior-dated invoice. Ambiguous → OPERATIONAL_EXCEPTION.
- One PMT targets one invoice and one component. No spillover. No proportional split.
- PMT remainder routes to Suspense-PMT and requires a second operator action.
- Bank UD is not confirmed cash receipt — it is UNCLASSIFIED_EXCEPTION until operator classifies it.
- Customer flags are set exclusively by operator action at friction events. Never inferred.
- ERP exports are structurally incomplete for payment linkage. DTRX is the only complete payment source.
- ERP running balance mismatch is expected; not a failure condition.
- OB (opening balance) ranks before all dated invoices in allocation scoring.
- Negative OB = persistent credit pool source (operator-triggered only; engine never auto-applies).
- Positive OB = invoice-like debit ranked before dated invoices.
- `ROUNDING_WRITE_OFF` requires one-click operator approval — never silent.
- `DEBIT_ADJUSTMENT` increases debtor exposure and requires danger-class UX with confirmation modal.
- Cross-bucket allocations are allowed, warned, and gated by `allows_cross_bucket_settlement` flag.

### Validated (passed DTRX live database discovery — 2026-05-17)

- DTRX `entry_type` values are `'Payment'` (PMT), `'Invoice'` (INV), `'Crd Note'` (CRN), `'Journal'` (JNL), and `'Bank UD'`.
- Payment transactions are primarily **negative** (credits reducing AR balance), with 269 negative records totaling R-722,194.68.
- Positive payment transactions (**8 records** totaling R15,425.47) represent **system reversals or allocation adjustments** in the ERP, characterized by matching offsetting amounts under the same `doc_no` series (e.g. `00016282`).
- Duplicate `doc_no` values are legitimate splits (splitting one receipt across multiple invoices) or offsetting adjustment rows, not import errors. They must not be deduplicated out during ingestion.
- DTRX is complete for INC001 with 277 total payments totaling R-706,769.21.

### Assumed but unverified (do not treat as validated)

- Static CYL pricing table exists and is accessible from the application layer
- INC001 ~R700k open balance is genuine outstanding AR (not a data completeness artifact)

---

## 8. NEXT PRIORITIES

1. **[COMPLETED] Run DTRX discovery query** (Completed on 2026-05-17. Verified literals: `'Payment'`, `'Invoice'`, `'Crd Note'`, `'Journal'`, `'Bank UD'`. Negative values = credit payments, positive values = adjustments/reversals, duplicate doc_nos = legitimate splits/offsets).

2. **[BLOCKER] Audit Findings #1, #2, #3 from Session B (ChatGPT PRD session)**
   Retrieve the original ChatGPT session transcript. Map Findings #1/#2/#3 against v2.3.1 spec. Apply surgical corrections if needed before implementation begins.

3. **[ARCHITECTURAL] Create Git repository and commit canonical spec**
   Repo: `LPG Stock Recon`. File: `docs/LSR5_Business_Rules_Spec.html` (v2.3.1). Enable GitHub Pages.

4. **[IMPLEMENTATION] Build data schemas**
   Required tables: `invoice_sub_ledger`, `allocation_record`, `session`, `customer_config`, `exception_queue`, `classification_table`, `customer_credit_pool`.
   GIN index strategy for `cyl_qty_balance_by_sku` must be defined before schema is committed.

5. **[IMPLEMENTATION] Session load pipeline (9-step sequence per §17 of spec)**
   Includes: ERP ingestion, sub-ledger seeding from detail lines, DTRX payment ingestion, zero-value CRN filtering, Bank UD classification, exception routing.

6. **[IMPLEMENTATION] Composite allocation scorer**
   Hard past-only filter (invoice_date ≤ payment_date). OB ranks first. Scoring logic per §10 of spec.

7. **[IMPLEMENTATION] PMT allocation mechanics**
   One PMT → one invoice → one component. Suspense-PMT remainder. Suggest-only. Gated on item 1 above.

8. **[IMPLEMENTATION] Exception lanes**
   Four financial lanes + OPERATIONAL_EXCEPTION custody lane. UNCLASSIFIED_EXCEPTION must block session completion.

9. **[IMPLEMENTATION] DEBIT_ADJUSTMENT danger UI**
   Confirmation modal mandatory. Must not be a standard-class action.

10. **[IMPLEMENTATION] Friction-born customer flag prompts (§25 of spec)**
    `allows_cross_bucket_settlement` and `pays_for_cyl` surface at first qualifying event. No settings screen.

---

## 9. CONTEXT FOR FUTURE AI SESSIONS

### Constraints — never violate these

- **No autonomous financial allocation.** The engine suggests; the operator confirms. Every allocation action is one-at-a-time, operator-triggered.
- **No proportional PMT split.** One PMT → one invoice → one component is the locked rule. Do not introduce split logic under any framing.
- **No auto-spill of PMT remainder.** Remainder always routes to Suspense-PMT explicitly.
- **No inferred customer configuration.** `allows_cross_bucket_settlement` and `pays_for_cyl` are set only by operator action at friction events.
- **No ERP writeback.** Read-only workbench. ERP is never modified.
- **No ERP balance as session gate.** Balance delta is informational only.
- **Do not treat Bank UD as cash receipt.** Always UNCLASSIFIED_EXCEPTION until operator classifies.
- **Do not let zero-value CRNs enter financial engine.** They are custody-only artifacts.
- **Do not reintroduce partial_settled, mixed_invoices flag, or single-balance invoice model.** These are formally deprecated.

### Patterns to preserve

- Four-component sub-ledger on every invoice record
- Independent financial_state and custody_state enums
- Friction-born customer config UX pattern
- Single canonical spec file with surgical edits only
- Session-scoped, single-account architecture

### Spec as source of truth

`LSR5_Business_Rules_Spec.html` v2.3.1 is the canonical implementation contract. When in doubt, it takes precedence over any reasoning in this document. Changes to business rules must be applied to the spec first, then reflected here.

### What AI should not rewrite without explicit instruction

- PMT allocation mechanics (§10 of spec) — locked after three review passes
- Exception taxonomy (five lanes) — locked
- Settlement state model (dual independent enums) — locked
- Customer config UX pattern (§25 of spec) — locked
- Session load pipeline sequence (§17 of spec) — locked

### Known assumptions requiring validation before trusting

- CYL static pricing table availability
- INC001 balance genuineness

---

## 10. DEPRECATED / INACTIVE

The following must not be treated as active truth. They were explicitly rejected and superseded.

| Deprecated | Replaced by |
|---|---|
| Single invoice balance scalar | Four-component sub-ledger |
| `partial_settled` boolean | `financial_state` / `custody_state` independent enums |
| `is_financially_settled` boolean | `financial_state = SETTLED` |
| Proportional PMT split across components | One PMT → one invoice → one component |
| Auto-spill PMT remainder | Explicit Suspense-PMT routing |
| 40% historical cross-bucket suppression | `allows_cross_bucket_settlement` operator flag |
| `mixed_invoices` customer flag | Document fact derived from detail lines |
| Bank UD → Suspense-PMT routing | Bank UD → UNCLASSIFIED_EXCEPTION |
| Blind operational CRN auto-apply | Conditional deterministic apply (exact match only) |
| Three-source architecture | Four-source architecture |
| ERP balance as convergence gate | Informational health signal only |
| Customer config via settings screen | Friction-born at first qualifying event |
| Fully automated / high-confidence matching | Suggest-only; human-confirmed |
| Epoch anchor `1900-01-01` for OB ranking | Business rule: OB ranks before all dated invoices |
| Regenerated parallel spec artifact copies | Single canonical HTML, surgical edits only |
| `erp_snapshots` / `movement_data` in MVP scope | CYL Custody Engine — deferred post-MVP |
