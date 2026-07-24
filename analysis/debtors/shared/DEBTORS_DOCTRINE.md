# Debtors Portfolio — Constitutional Doctrine

**Status:** Ratified  
**Ratified by:** Operator  
**Ratified date:** 2026-07-20  
**Scope:** Debtors Portfolio Management slice (`analysis/debtors/`)  
**Authority:** This file is the **single constitutional home** for cross-lane debtor reconciliation doctrine. Lane-specific implementation remains in scoped-canonical blocks (see §4).

> Amendments **append**; they do not rewrite. Superseded text in other files is marked in place, never deleted. See §7 Governance.

---

## §1 — Six-line doctrine

1. **Evidence is canonical.** Ledger facts decide; narratives follow.
2. **State is derived.** `project.json`, dashboards, and projections are outputs of evidence + ratified decisions — not inputs to reconciliation.
3. **Projections are regenerated.** Any material evidence change invalidates stale projections until re-run.
4. **Decisions are ratified.** Overrides, registry promotions, and closure rulings require operator authority.
5. **History is immutable.** Past turn artifacts and ratified registry versions are retained; supersession is explicit, not erasure.
6. **Closed rulings reopen on defined evidence.** Tripwires name the events that invalidate a prior close.

---

## §2 — Projection and collectable rules

### Projection Rule

An **operator projection** answers at most **five operational questions**. A sixth means a new projection or a report — never growth of one surface.

The projection is the **interface**; the evidence chain is the **warranty**; neither is a product without the other.

### Collectable Rule

| Term | Definition |
| :--- | :--- |
| **ERP balance** | Anchored figure — **PROVEN**, with explicit as-at date and source file |
| **Collectable** | **Derived:** `ERP balance − Σ ratified holds` |
| **Bridge** | When Collectable ≠ ERP balance, show line-by-line on the projection — itemized, dated, registered |
| **Credits** | Never re-subtracted — ERP is authoritative on netting |

Ratified holds include: verified unallocated credits, outstanding LPG invoices operator-confirmed, staged registry residuals not yet cleared, and governance blocks (e.g. collection without recon).

---

## §3 — Role separation

| Layer | May do | May never do |
| :--- | :--- | :--- |
| **Operator** | Ratify, rule, contact debtors, rotate credentials, approve sends | — (authority terminates here) |
| **Orchestration layer** | Synthesize state, cross-check artifacts, hypotheses, turn briefs, comms drafts, visuals | Touch DB/repo/ERP directly; ratify registry entries; contact debtors |
| **Repo agent** | Read freely; write **only** downstream of ledger evidence or operator ratification | Infer-then-write; hand-patch generated CSVs; apply staged registries without ratification |

**Deletion test:** A conclusion that changes if a human-captured field (`ref_no`, clerk text) is deleted was never proven.

Summarized operationally in `SKILL_Debtors_Orchestrator.md` §5 Orchestration Methods (`.agents/skills/`).

---

## §4 — Evidence hierarchy (summary)

| Rank | Class | Use |
| :--- | :--- | :--- |
| **Canonical** | Line quantities (`transaction_items` / `vw_clean_transactions`) | Decides. Conservation: Σout − Σin = net held, per SKU |
| **Structural** | DN references, doc pairing | Groups; never settles |
| **Advisory** | `ref_no`, clerk allocations, header desc regex | Corroborates; never decides globally (see **D14** for allocation-lane payer-class exception). Regex: flagged fallback for TXT-only docs only |
| **Derived** | Value | Never input. Residuals must decompose to integer units at a dated price; non-integer = defect flag |

**Lane membership is a property of the line, not the document.**

### D14 — `ref_no` rank (ratified 2026-07-22)

**Advisory globally.** In the **allocation lane** only, a **payer-class exception** applies: customer-authored (bank-import) references may **corroborate and close** an allocation where independent evidence has already identified or sufficiently constrained the candidate set.

Constraints:

- May **not** create an allocation from nothing.
- May **not** break an unresolved contradiction — conflicting evidence → **STOP**.
- **Clerk-keyed** references and **mixed or unmarked-provenance** references are **never** elevated.
- **Activation condition:** Turn 8b Step 1 (provenance verification) must be satisfied before elevation.

Implementation: `SKILL_Payment_To_Invoice_Allocation.md` §3 · `REF_DECIDED` label rule.

### D15 — Edge labels vs epistemic tags (ratified 2026-07-22)

**Allocation confidence labels describe edges; epistemic labels describe facts, figures, and conclusions.** A `Confirmed` edge is not `PROVEN` until validated within a closed identity or conservation result.

Glossary: use **PROVEN / ASSERTED / ASSUMED** on balances, quantities, and closure conclusions; use **Confirmed / REF_DECIDED / VERIFIED_UNALLOCATED** (etc.) on allocation edges — do not treat them as interchangeable.

### Scoped-canonical implementation (do not duplicate here)

| Topic | Constitutional home for implementation |
| :--- | :--- |
| Line-level lanes, four-lane identity, CYL conservation | `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum — line-level lanes |
| Invoice-linked payment→invoice matching | `analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md` + `SKILL_Payment_To_Invoice_Allocation.md` §3 |
| Monthly batch payers (JIM001 class) | `skills/lpg-payment-pattern-analysis/SKILL.md` |
| Settlement discount lane | Account doctrine (e.g. TWK002 v2) |

---

## §5 — Write-gating, registries, invariants, tripwires

- **Write-gating:** Writes are conditional steps inside turn briefs, gated on evidence from earlier read-only steps.
- **Staged registries:** Proposals never self-apply. Diff names every entry that changes and rand impact. Ratification is operator action.
- **Invariant checks:** Σ registry outstanding qty per class **must** equal net custody per class. `INVARIANT_FAIL — DO NOT RATIFY` stops the turn. Both sides read from live data — hardcoded sides are theatre.
- **Tripwires:** Every closed ruling records named future events that reopen it (twin-invoice payment, warehouse SKU reclassification, remittance for unallocated credit, ERP extract supersession, etc.).
- **Idempotency:** Overrides live in config; ingest applies them — never patch generated CSVs by hand.

Enforcement vehicle: turn brief template in orchestrator skill §5.5.

---

## §6 — Epistemic tags (summary)

Every material number carries one tag:

| Tag | Meaning |
| :--- | :--- |
| **PROVEN** | Closes under identity or conservation to external anchor (TXT closing, qty conservation) |
| **ASSERTED** | Stated by artifact, not yet itemized/closed |
| **ASSUMED** | Hypothesis or registry inference — must carry kill condition |

A variance explained in prose is **not** reconciled.

Full rules: `SKILL_Debtors_Orchestrator.md` §5.2 Epistemic bookkeeping.

---

## §7 — Governance

| Rule | Detail |
| :--- | :--- |
| **Authoring path** | Architecture and doctrine changes originate in the **designated orchestration (architecture) session**, are ratified by the operator, and are applied to the repo by **turn brief** |
| **Worker sessions** | Consume doctrine (WO0001, MOZ002, etc.); they **do not author** constitutional changes |
| **Amendments** | Append to this file and PRD decisions log; mark superseded text elsewhere — **never delete** |
| **Parallel specs** | LSR-5 HTML spec governs PMT/sub-ledger **application** slice; this file governs **debtors portfolio recon** — cite both when scopes overlap; do not silently merge |
| **Session fork** | Orchestrator plans; repo agent executes brief; PM commits `project.json` state — no role collapse across sessions |

**Ratified 2026-07-20 (Turn 10):** Projection is the primary operator artifact; doctrine consolidated here; governance per §7.

**Ratified 2026-07-22 (Turn 11C):** D14 (`ref_no` payer-class exception) and D15 (edge vs epistemic labels) — supersede Turn 10 pending C1 status.

---

## §8 — Related documents (non-constitutional)

| Document | Role |
| :--- | :--- |
| `PROJECT_SCHEMA.md` | `project.json` field contract |
| `PROJECT_PROJECTION_SCHEMA.md` | Operator projection artifact (Turn 9 — staged) |
| `DEBTOR_STATE_MACHINE.md` | `reconState` / `status` transitions |
| `DEBTORS_ORCHESTRATION_PRD.md` | Orchestration MVP + decisions log |
| `.agent/AGENT_WORKFLOW.md` | Agent vs UI boundary (PWA review surface) |
