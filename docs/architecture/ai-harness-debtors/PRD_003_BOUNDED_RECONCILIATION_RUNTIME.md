> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# Bounded Debtor Reconciliation Runtime PRD

**ID:** AHA-PRD-003  
**Version:** 1.0.0  
**Date:** 2026-10-03  
**Increment:** Later debtor-specific runtime increment  
**Status:** Proposed implementation specification  
**Dependency:** Slices 1 and 2 operate in practice and their findings are reviewed  
**Doctrine:** [AHA-DOC-001](AI_HARNESS_ARCHITECTURE_DOCTRINE.md)  
**Technical contract:** [RECONCILIATION_TURN_CONTRACT.md](RECONCILIATION_TURN_CONTRACT.md)

## 1 Problem and outcome

Early debtor reconciliation combines reading evidence, reconstructing ERP, category classification, payment analysis, account-specific methods and exploratory scripts. A one-button-to-one-skill model cannot express this work reliably.

The runtime launches an account-scoped turn with an evaluable objective, chooses applicable methods and returns reproducible findings. The operator can see which claims are established, what is unresolved, and the evidence needed for the next turn.

## 2 Operator workflow

Open an account. Display the seven derived proof layers and relevant evidence. Start Reconciliation creates a first bounded turn; Continue Reconciliation uses the latest compatible findings and current evidence. Existing reports may require initial indexing; missing proof is shown as not assessed rather than inferred from filenames.

Before starting, show the suggested objective, unresolved prerequisites, permitted outputs and material limits. The operator can choose another bounded objective. The runtime proposes the earliest unresolved prerequisite for that objective using evidence references, not a free-form authoritative nextAction edit.

During execution show queued/running state and concise progress. The result presents proof findings, variance, remaining questions, methods, artifacts and proposed next action. Internal terminal output may be retained as evidence but is not the main operator result.

## 3 Context assembly and routing

Resolve the account from the workspace, not retyped free text. Load current project.json, onboarding/turn records, latest valid reports, available evidence inventory, applicable account config, relevant skill/doctrine and registry entries. Record the source snapshot and versions. Retrieve prior sessions only as contextual leads.

Separate instruction sources from evidence. Customer text, ERP descriptions and remittances are data; they cannot grant tool permission or rewrite doctrine. A bounded worker reads the actual selected skill version. The UI must not contain a second implementation of worker logic.

The turn can use LOCKED_SHARED, ACCOUNT_SPECIFIC and SESSION_SCRATCHPAD methods. Check applicability and known defects before invocation. If a registry entry or method is missing, return a limitation or use authorized exploration; do not fabricate a locked capability.

Deterministic scripts execute as bounded capabilities inside the turn. Scratch execution is enabled only after technical enforcement of its sandbox, inputs and outputs has been demonstrated. No arbitrary browser-supplied command endpoint is exposed.

## 4 Proof rules

ERP anchor reconstruction reports account, source, period, as-at, currency, freshness and variance. Composition reports signed components with classification evidence and reconciles them to that same anchor. Unknown components are explicit; arithmetic closure alone is insufficient.

Payment reconciliation establishes the pool before making settlement claims. Payer behaviour may be invoice-linked, monthly/batch, remittance-backed or unresolved. ERP INVNO and amount coincidence cannot alone become proof of an allocation where domain doctrine requires stronger evidence.

Invoice allocation and open position retain supported edges, uncertain alternatives and residue. CYL financial balance and cylinder custody are separate claims. Collections eligibility uses the existing D17 gate and any required ratification, never an agent's confidence score.

Working proof statuses are proposed as NOT_ASSESSED, PARTIAL, PROVEN and DISPUTED. STALE is a separate freshness qualifier. These are derived finding labels, not reconState values. Exact adoption is a contract decision.

The runtime may read later-layer evidence to answer an earlier question, but may not declare a dependent claim proven while prerequisites remain unresolved. Explicit, evidence-backed alternative sequencing is permitted.

## 5 Outputs and state boundary

Stage outputs under a unique account turn directory. Preserve supporting scratch scripts, input hashes, method versions and findings. Proposed published account reports pass deterministic checks before replacing shared outputs. Failed or stale runs leave accepted outputs intact.

Worker outputs include findings and optional proposed changes. No worker mutation of project.json, reconState, HUMAN_TASKS.md, registry, shared scripts, doctrine, raw evidence, ERP or customer channels is granted by this increment.

A proposed state update includes exact old/new values, evidence, prerequisites and source hash. Route it to the existing governed updater. Revalidate at application time and reject stale sources. Running the turn, accepting its narrative or completing a related human task is not blanket state-change authorization.

## 6 Method lifecycle and defects

Scratchpad findings remain turn-scoped until reviewed. Useful patterns may become promotion candidates. Promotion is a distinct code/doctrine change requiring assumptions, fixtures, semantic classification checks, versioning and registry updates where applicable.

Include the classification defect described in the supplied context as a mandatory adversarial scenario: reading a customer-name field instead of the delivery reference can leave CYL documents classified as LPG while total arithmetic still closes. The runtime must flag the semantic failure, identify affected outputs and preserve corrective lineage. Reproducing an incorrect committed CSV is not acceptance proof.

## 7 Concurrency and execution recovery

Serialize runs for the same account where they target shared artifacts. Isolated parallel exploratory work may be permitted under distinct turns. Use a run lock with ownership and recovery semantics; a source snapshot protects validity independently of that lock. Recheck source hashes before publication.

Assign turn, attempt and idempotency IDs. A retry reuses the intended request identity and creates an attributable attempt. Recover known attempts before rerunning work with uncertain effects. Interrupted runs retain partial evidence and show an interrupted outcome.

Execution budget includes duration, tool-call count and model/token or spend limits. Stop conditions and cancellation are enforced by the runtime. Provider, queue and deployment choices remain implementation decisions.

## 8 Acceptance scenarios

| Scenario | Required result |
|---|---|
| New account with incomplete evidence | Establish supported anchor or return missing evidence; do not invent layer completion |
| Balance closes with CYL misclassified as LPG | Composition remains unproven and the classification defect is visible |
| Mixed LPG/AGR/CYL transactions | Classify at the supported evidence level; no guessed category split |
| Invoice-linked payer | Invoke applicable method with supported allocation evidence |
| Batch payer with misleading INVNO | Preserve unresolved settlement relationships and use an applicable payer model |
| Remittance names invoice lines | Produce supported edges with payment/remittance/invoice provenance |
| Financial CYL bridge closes but custody evidence is missing | Financial and physical claim statuses differ |
| Source changes during the turn | Retain findings for the captured snapshot; block current publication and state proposal application |
| Two turns target the same report | Lock/conflict handling prevents overwrite and mixed output sets |
| Relevant locked-method defect | Block affected proof; permit only explicit bounded investigation or correction proposal |
| Scratch code attempts forbidden write/network use | Execution enforcement rejects it and logs the outcome |
| Worker proposes recon completion | No automatic project mutation; proposal follows governed update path |
| Cancel, timeout or crash | Partial evidence survives; status cannot become succeeded without verification |
| Resume a prior turn with changed inputs | Prior findings are stale where affected and must be reassessed |

## 9 Non-goals and release decisions

No autonomous ERP posting, outbound communication, financial ratification, automatic method promotion, new domain database, generic workflow builder or unbounded skill catalog.

Before implementation approve the execution provider/environment, identity model, sandbox enforcement, account output locations, proof label contract, retention policy, budgets and governed proposal destination. These decisions are newly specified design work, not already approved operational capabilities.

The first pilot must demonstrate two complementary cases: one with established reusable methods and one requiring bounded scratch investigation. Use sanitized fixtures or approved account evidence. Do not hardcode CAP000 or any historical balance into runtime logic.
