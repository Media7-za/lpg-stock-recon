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

### D16 — Workbench `COMPLETE` is a UI state, not a reconciliation state (ratified 2026-07-26)

*Amends:* §2 (closure semantics) · *Implemented in:* `AR_Recon_Workflow.md` §19.2

A session or account may show status `COMPLETE` in the LSR-5 / `AR_Recon_Workflow.md` workflow **without** ERP balance convergence, full invoice settlement, cylinder custody return, or zero suspense. That state records only that an operator has finished working the account for now.

It therefore:

- confers **no** `PROVEN` status (per **D15**, closure requires an anchored identity or conservation result);
- does **not** satisfy `reconState: complete` under this Constitution;
- leaves workbench outputs tagged **ASSERTED** except where independently anchored.

**Display requirement.** Every derived view that shows an account's status must display **both** labels — workbench status **and** constitutional `reconState` — wherever they diverge. Never the workbench label alone. A single status field can be read confidently when it should not be; two fields that disagree cannot.

### D17 — Collections gate requires a collectable balance, not just age (ratified 2026-07-26)

*Amends:* §2 (Collectable Rule) · *Implemented in:* `DEBTOR_STATE_MACHINE.md` · `SKILL_Debtors_Orchestrator.md` §4

`status: collection` requires **all** of:

1. `reconState: complete` — existing gate, unchanged;
2. a **stated collectable balance** under the §2 Collectable Rule (`ERP balance − Σ ratified holds`), with any bridge itemized, dated, and registered;
3. **no** unresolved dispute, stale source, unratified hold, or open identity blocking that balance.

**Age never establishes truth-readiness.** Ageing determines collections *priority* after eligibility is met. An aged account with an open dispute or an unratified hold routes to **human review**, not to the collections lane.

### D18 — Collectable-balance contract; projection validity is separable from collections eligibility (ratified 2026-07-26)

*Amends:* §2 (Collectable Rule) · *Implemented in:* `PROJECT_SCHEMA.md` · `debtors_sync.mjs` · `debtors_dashboard.mjs`

**(1) Schema — `financials.collectable`.** The inspectable §2 identity lives in:

```json
{
  "amount": 0.0,
  "erpBalance": 0.0,
  "ratifiedHoldsTotal": 0.0,
  "asAt": "YYYY-MM-DD",
  "source": "path/to/anchor/artifact",
  "basis": "PROVEN",
  "operatorConfirmation": "confirmed"
}
```

- Identity: `amount = erpBalance − ratifiedHoldsTotal` (bridge itemized when they diverge).
- `basis`: `PROVEN` | `ASSERTED` | `STALE` — **only `PROVEN` closes** collections eligibility.
- `totalOutstanding` is a multi-code exposure aggregate and is **never** the ERP anchor.

**(2) Schema — `collections.blockers`.** An array of:

```json
{
  "type": "DISPUTE|STALE_SOURCE|UNRESOLVED_IDENTITY|HOLD|OTHER",
  "status": "open|resolved",
  "description": "string",
  "source": "artifact ref",
  "asAt": "YYYY-MM-DD"
}
```

- `[]` = **assessed and clear**.
- **Absent field** = **not assessed** → fails closed.
- Only **`open`** blockers gate; **`resolved`** entries are retained as history.

**(3) Separation.** Projection validity (may we generate and display the account?) is distinct from collections eligibility (may a human act on it as collectable?). A missing D18 contract blocks the **second only**. A blocked account:

- **must** remain visible on the register;
- **must** be labelled `COLLECTIONS_BLOCKED` in every operator-facing projection;
- **must not** have demand text drafted — drafting a payment demand **is** presenting the balance as collectable.

### D19 — `ingestGate` is canonical but optional; `status` is schema validity, not ingest health (ratified 2026-07-26)

*Amends:* §2 (evidence hierarchy — source completeness) · *Implemented in:* `PROJECT_SCHEMA.md` (pending) · `INGEST_GATE_SCHEMA_STAGED.md` · `analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs` (pending)

**(1) Canonical, optional.** `ingestGate` becomes a recognised `project.json` field. It is **not required** on every account — only accounts whose recon claims custody, SKU, or allocation conclusions have anything for it to gate.

**(2) Schema.**

```json
{
  "ingestGate": {
    "status": "pass | fail | unverified",
    "ingestFreshness": "current | stale | unverified",
    "ingestCoverage": "complete | partial | unverified",
    "displayStatus": "CURRENT_PARTIAL",
    "asAt": "YYYY-MM-DD",
    "reportPath": "analysis/debtors/[CODE]/reports/[CODE]_INGEST_COVERAGE_[date].json",
    "ingestBlockedScopes": ["custody", "sku_analysis", "allocation", "financial_bridge_from_txt"],
    "exceptions": []
  }
}
```

**(3) `status` is schema validity, not an operational assessment.** This is the refinement that distinguishes D19 from the original staged draft:

- `pass` — the `ingestGate` object is present and internally well-formed (required sub-fields present, values from the declared enums).
- `fail` — the object is present but malformed (bad enum, missing field, malformed path).
- `unverified` — no validated `ingestGate` exists yet.

`status` answers **"can I trust this object?"** only. It must **never** be computed from freshness or coverage results — that would create two overlapping expressions of ingest health (`status` and the freshness/coverage combination) that can silently drift apart. Operational ingest health is expressed exclusively by `ingestFreshness`, `ingestCoverage`, `ingestBlockedScopes`, and `displayStatus`.

**(4) Fail-closed on the claim, not on the schema.** `ingestGate` absent is not itself a hard failure. But **absence is never read as clearance**: any conclusion claiming custody, SKU, or allocation closure must treat a missing `ingestGate` identically to `ingestBlockedScopes: ["custody", "sku_analysis", "allocation"]` — the same non-inference discipline as D17(b)/D18 applied to ingest health instead of collectable balance. A malformed-but-present `ingestGate` (`status: fail`) is a hard validation failure, same severity class as a D17/D18 schema-gap error.

**(5) Independence from reconState, collections, workspaceStatus.** Three boundaries, mirroring D16's separation:

- **Does not confer `reconState: complete`** — financial reconciliation may close purely from TXT while `ingestGate` shows blocked custody (the pre-existing ERP Ingest Completeness Rule in `INGEST_GATE_SCHEMA_STAGED.md`).
- **Does not satisfy D17/D18 collections eligibility**, and a failing `ingestGate` must **never** be auto-copied into `collections.blockers` — populating a blocker from ingest evidence still requires its own D18 evidence-backed assessment, exactly the non-inference rule B3 already established for statement exceptions.
- **Does not set or read `workspaceStatus`** — independent axis, same as D16.
- **Open dependency, not resolved by this ruling:** `ingestGate` is designed to gate custody/SKU/allocation *conclusions*, but no ratified doctrine yet defines what a custody conclusion is or requires (custody doctrine has no dedicated constitutional home — open work, unrelated to this ruling). D19 ratifies the gate mechanism; it does not retroactively close that gap.

**(6) Migration.** No existing debtor has `ingestGate` populated today. Validators must **warn**, not fail, on its absence for any pre-existing account; a hard failure applies only to a malformed-but-present object. Retroactively failing `debtors:sync` for the 13 accounts that never populated this field — including four already `reconState: complete` — is not an acceptable consequence of ratifying this schema.

### D20 — Registers declare; discovery only contradicts (ratified 2026-09-29)

*Amends:* §5 (staged registries) · *Implemented in:* `SKILL_REGISTRY.json` · `SCRIPT_REGISTRY.json` · `PORTFOLIO_ARTIFACT_INDEX.json` · `docs/REGISTERS_PLAN.md`

**A register is authored, never generated from the thing it governs.** A register
derived by scanning its own subject cannot detect that the subject has drifted — it
absorbs every defect as normal. Discovery is therefore permitted only to
**contradict** a declaration, never to build one. `SLICE_REGISTRY.json` already held
this relationship to its slices; this ruling generalises it.

Three registers are ratified under this principle:

| Register | Governs | Artifact |
| :--- | :--- | :--- |
| Skills | Every agent skill file, its lane, canonical scope, negative scope, owned scripts, produced slices | `analysis/debtors/shared/SKILL_REGISTRY.json` |
| Scripts | Scope, durability, owning slice, and entry point of every script | `analysis/debtors/shared/SCRIPT_REGISTRY.json` |
| Account artifacts | Which account holds which slice instance, and whether it is stale | `analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json` |

Consequent rules:

- **One skill name, one file.** A name declared by two files makes which one loads
  depend on load order, which is a silent correctness hazard, not an untidiness.
  `NAME_UNIQUE` is a **hard** gate.
- **No unregistered skill file.** A skill added without registration is invisible to
  discovery and therefore to governance. `NO_ORPHAN_FILES` is a **hard** gate.
- **Cross-register references are foreign keys.** `produces_slices` resolves into
  `SLICE_REGISTRY.json` and `owns_scripts` into `package.json`. A rename that breaks
  them is the gate working, not the gate failing.
- **The artifact index lives beside `project.json`, not inside it.** This ruling
  therefore **does not** amend `PROJECT_SCHEMA.md`. Rationale: it keeps `project.json`
  diffs clean and cannot break the `debtors:sync` path the whole portfolio depends on.
- **Slice staleness reports; it does not fail.** A slice older than its `depends_on`
  is surfaced, never fatal. Failing `debtors:sync` portfolio-wide on staleness would
  repeat the migration mistake D19 §(6) exists to prevent.

**Not ratified by this entry.** The payer-class taxonomy remains prose, duplicated in
`SKILL_Debtors_Orchestrator.md` §4 and `DEBTORS_ORCHESTRATION_PRD.md` §6. Promoting it
is a lane-routing change and stays open.

**Tripwires.** A sixth skill root appears (defeats `NO_ORPHAN_FILES` silently); a
`SLICE_REGISTRY.json` slice is renamed or removed; a skill gains or loses an owning
script without the same commit updating the register.

### D21 — ERP payment tags: chronology, provenance, and recorded false leads (ratified 2026-09-29)

*Amends:* §5 (invoice tag coverage) · *Implemented in:* `.agents/skills/SKILL_ERP_Payment_Tag_Verification.md` · `check_invoice_tag_coverage.mjs` · `config/payment_tag_false_leads.json`

§5 already holds that payment tagging is not canonical and that no open list may rest
on it alone. This ruling names the two rejections that follow from it, so they are
applied as procedure rather than rediscovered per session.

- **`INVNO_TAG_CHRONOLOGY`.** A payment's `INVNO` tag may not close an invoice whose
  `tx_date` is **after** the payment's. Such a tag is a prepay or placeholder pointer,
  not a settlement. Rejection is unconditional under Order B; under Order A a customer
  remittance naming the invoice still outranks it.
- **`TAG_EVIDENCE_PROVENANCE`.** `allocation_edges.csv` rows that are wholly
  `ERP_LEDGER`/`Probable` and form a dense date-ordered run inside an already-assumed
  month are that assumption expanded into invoice rows. They may not be cited as
  independent confirmation of the month they came from. This circularity produced a
  retraction and counter-retraction in `JIM001_Exact_Sum_Bridge_Review_2026-09-13.md`.
- **False leads are config, not memory.** A tag proven false is recorded in the
  account's `config/payment_tag_false_leads.json` and **enforced** by
  `npm run debtors:tag-check`. Per §5 idempotency, operator judgement that lives only
  in a session does not survive regeneration.

**Tripwires.** A customer remittance names a doc recorded as a false lead (Order A
outranks — reopen that doc); allocation-edge provenance labelling changes such that
`ERP_LEDGER`/`Probable` no longer identifies derived rows.

### Scoped-canonical implementation (do not duplicate here)

| Topic | Constitutional home for implementation |
| :--- | :--- |
| Line-level lanes, four-lane identity, CYL conservation | `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum — line-level lanes |
| Invoice-linked payment→invoice matching | `analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md` + `SKILL_Payment_To_Invoice_Allocation.md` §3 |
| Monthly batch payers (JIM001 class) | `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` |
| Settlement discount lane | Account doctrine (e.g. TWK002 v2) |
| ERP payment tag verification (chronology, provenance, false leads) | `.agents/skills/SKILL_ERP_Payment_Tag_Verification.md` (see **D21**) |
| Register schemas, gates, and sequencing | `analysis/debtors/shared/docs/REGISTERS_PLAN.md` (see **D20**) |

---

## §5 — Write-gating, registries, invariants, tripwires

- **Write-gating:** Writes are conditional steps inside turn briefs, gated on evidence from earlier read-only steps.
- **Staged registries:** Proposals never self-apply. Diff names every entry that changes and rand impact. Ratification is operator action.
- **Invariant checks:** Σ registry outstanding qty per class **must** equal net custody per class. `INVARIANT_FAIL — DO NOT RATIFY` stops the turn. Both sides read from live data — hardcoded sides are theatre.
- **Invoice tag coverage:** Σ(open invoices) **must not exceed** the ERP `CURRENT BALANCE`. A breach proves settled debt is being carried as open and blocks customer-facing release. An open-invoice list is a hypothesis, never ground truth; only the balance header is. ERP payment allocation is broken by long-standing finding (§3) — Crd Note tagging is broadly canonical, payment tagging is not, and no open list rests on payment tagging alone. Exports taken with `EXCLUDE: ALLOCATION DETAIL` are a deliberate posture, not a defect: they carry balance and ageing, and the invoice-level view comes from the allocation lane. Remittance advices lead where they exist (3 accounts); for every other account settlement rests on exact-sum arithmetic, the established payment pattern, business rules for the payer type, and operator judgement **recorded in config** — unrecorded human inference does not survive regeneration. Every gate result carries an evidence basis (`REMITTANCE_BACKED` / `PATTERN_ONLY`) and is never quoted without it. Gate: `npm run debtors:tag-check`. Rule: `docs/business_rules.md` §15.
- **Tripwires:** Every closed ruling records named future events that reopen it (twin-invoice payment, warehouse SKU reclassification, remittance for unallocated credit, ERP extract supersession, etc.). A remittance advice naming an invoice the ledger still shows open reopens that invoice's status — the advice outranks ERP tagging.
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

**Ratified 2026-07-26 (Turn 14b):** D16 (workbench `COMPLETE` is a UI state, not a reconciliation state — promotes `AR_Recon_Workflow.md` §19.2 from an application clause to constitutional rule, adds the dual-label display requirement) and D17 (collections gate requires a stated collectable balance and no blocking dispute or hold; age sets priority, not eligibility).

**Ratified 2026-07-26 (Turn 14c):** D18 (collectable-balance and blocker contract in `PROJECT_SCHEMA.md`; projection validity separable from collections eligibility; blocked accounts remain visible, labelled `COLLECTIONS_BLOCKED`, with demand drafting prohibited).

**Ratified 2026-09-29 (in-session, operator):** D20 (registers declare and discovery only contradicts; skills, scripts, and account artifacts each get a register; `NAME_UNIQUE` and `NO_ORPHAN_FILES` are hard gates; the artifact index lives beside `project.json` so `PROJECT_SCHEMA.md` is untouched; slice staleness reports rather than fails) and D21 (`INVNO_TAG_CHRONOLOGY` and `TAG_EVIDENCE_PROVENANCE` as named rejections; payment-tag false leads recorded in config and enforced by `debtors:tag-check`).

> **Operator ratification, verbatim:** *"yes to all recommendations"* — 2026-09-29,
> answering an enumerated list of decisions D1–D6 plus proposal P7 in
> `docs/handoffs/2026-09-29.md` §4. D6 (payer-class taxonomy) was explicitly left open.
>
> **Vehicle deviation — flagged, not hidden.** §7 requires doctrine changes to
> originate in the designated orchestration session and be applied by turn brief. This
> session began as a **worker** session (BR0001 v5 Turn 1); the proposals were staged
> here and the operator ratified them directly, without a turn brief. The ratifying
> authority is correct (§7: *"ratified by the operator"*); the vehicle was not. Recorded
> this way so the next orchestration session can confirm the entries rather than
> discover them. Substance stands; procedure is noted.

**Ratified 2026-07-26 (Turn B4):** D19 (`ingestGate` canonical but optional in `project.json`; `status` redefined as schema validity — not ingest health — to prevent it overlapping with `ingestFreshness`/`ingestCoverage`; absence never read as clearance for custody/SKU/allocation claims; no auto-population of `collections.blockers`; existing debtors migrate under a warning model, not retroactive failure). **Implementation pending** — `PROJECT_SCHEMA.md` promotion, and the `status` field in the already-shipped `validate_txt_db_coverage.mjs` (Turn B1, commit `269d8ce`), are not yet aligned to this ruling; see flag below.

---

## §8 — Related documents (non-constitutional)

| Document | Role |
| :--- | :--- |
| `PROJECT_SCHEMA.md` | `project.json` field contract |
| `PROJECT_PROJECTION_SCHEMA.md` | Operator projection artifact (Turn 9 — staged) |
| `DEBTOR_STATE_MACHINE.md` | `reconState` / `status` transitions |
| `DEBTORS_ORCHESTRATION_PRD.md` | Orchestration MVP + decisions log |
| `.agent/AGENT_WORKFLOW.md` | Agent vs UI boundary (PWA review surface) |
