> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# AI Harness Architecture doctrine

**ID:** AHA-DOC-001  
**Version:** 1.0.0  
**Date:** 2026-10-03  
**Status:** Recorded discussion baseline; repository adoption pending  
**Scope:** Architectural intent for bounded AI work, demonstrated through debtor reconciliation  
**Decision lineage:** AHA-DEC-001 through AHA-DEC-005 in [README.md](README.md)

The harness coordinates bounded work toward an evidenced business outcome. Its runtime chooses suitable capabilities within a turn, records how results were obtained, and returns findings through the domain's governed write boundaries. Debtor reconciliation is the first proving ground. The general principles below express intent; they do not require a generic harness implementation before the debtor console works.

## 1 Invocation follows the business question

**AHA-D01.** The operator begins with a business object and an objective. In debtor-space the account supplies the context, and Start Reconciliation or Continue Reconciliation supplies the entry point. Selecting a worker skill is an internal routing step where appropriate.

**AHA-D02.** A bounded turn is the unit of agentic invocation. A turn may combine evidence reads, locked methods, applicable account scripts and exploratory scratchpad analysis. Each internal operation remains attributable to the turn. A deterministic operation may also be invoked directly when its business purpose and permissions are already clear.

The objective must be narrow enough to evaluate. “Prove the composition of this ERP balance” is evaluable. “Finish the entire debtor account” is insufficiently bounded without a defined budget, evidence requirements and stopping conditions.

## 2 Authority remains with the domain

**AHA-D03.** The harness must use existing authoritative artifacts and mutation paths. It must not create parallel debtor state, blockers, tasks, capability definitions or accounting balances merely to power its interface.

For the debtor application, the supplied discussion identifies these integration authorities:

| Concern | Existing integration reference |
|---|---|
| Operational account state | `analysis/debtors/{CODE}/project.json` |
| Schema and state transitions | `shared/PROJECT_SCHEMA.md` and `shared/DEBTOR_STATE_MACHINE.md` |
| Registered capabilities and dependencies | `shared/SLICE_REGISTRY.json` |
| Human work | `shared/HUMAN_TASKS.md` |
| Portfolio validation and generation | `shared/scripts/debtors_sync.mjs` |
| Collections eligibility | Existing `evaluateD17Gate()` implementation |
| Worker behaviour | Applicable repository skill and doctrine files |
| Financial and custody proof | Source evidence and reproducible derivations |

Confirm exact locations and semantics during adoption. Operational state authority and financial evidence authority are different: a project field can declare workflow state, but it cannot prove a financial claim without evidence.

**AHA-D04.** Worker findings are not governed state changes. A worker may produce derived artifacts and a proposed change. A governed updater must independently validate the evidence, authority and current source version before applying the change. Successful execution cannot promote reconState, authorize ERP posting or permit customer communication.

**AHA-D05.** Memory and prior sessions help discover relevant context. They cannot substitute for current source evidence, accepted doctrine, valid state or a governed decision. Prior findings whose evidence changed must be reassessed.

## 3 Progress is measured through proof

**AHA-D06.** Each claim has its own evidence basis. Proving the account balance does not prove category composition, invoice allocation, physical cylinder custody or collectability.

The debtor runtime uses the following progression as an operational model:

| Layer | Business question | Evidence required for the claim |
|---|---|---|
| 1 ERP anchor | What does ERP say as at a specific date? | Identified source, account, period, reconstruction and freshness assessment |
| 2 Balance composition | What creates the balance? | LPG, AGR, CYL financial and other signed components with traceable classifications |
| 3 Payment reconciliation | What cash and credits exist, and how does the account pay? | A reconciled payment pool and evidence-backed payer behaviour |
| 4 Allocation analysis | Which trading events did those payments settle? | Explicit supported relationships and unresolved alternatives |
| 5 Open position | What is still outstanding? | Residual position consistent with the anchor and accepted allocations |
| 6 Exceptions and custody | What remains unresolved financially or physically? | Financial exceptions and separate cylinder movement/custody evidence |
| 7 Customer and collections position | What may safely be represented as collectable? | Accepted position plus existing collections gates and required confirmations |

**AHA-D07.** Investigate the earliest unresolved prerequisite for the chosen objective. The progression is not a rigid single-pass workflow. Payment evidence may help prove composition; custody investigation may run independently. Such work is allowed, but a dependent claim must remain unproven until its prerequisites are established.

The seven layers are a view of claims and dependencies, not seven new canonical project-state fields. Their initial status is derived from existing evidence and accepted findings. Any persisted authoritative representation requires a separate schema decision.

**AHA-D08.** Mathematical closure and semantic correctness are separate checks. A zero variance can coexist with incorrectly classified transactions. A composition is proven only when both the signed arithmetic and the classification evidence meet domain requirements.

LPG, AGR and CYL are integration category labels from the discussion. Their definitions must come from current domain doctrine. The runtime must not guess them from customer names, total amounts or file names. Mixed documents require the level of classification supported by source evidence. Unknown residue stays explicit.

An ERP bridge must avoid double-counting journals, cash and opening positions already included in category net balances. Use one declared signed accounting basis. Report the source period, currency, rounding policy and unexplained remainder. CYL financial deposits are not interchangeable with physical cylinder quantities or custody claims.

## 4 Method classes have explicit assurance

**AHA-D09.** Every executed method is classified by maturity and applicability.

| Class | Meaning | Required treatment |
|---|---|---|
| LOCKED_SHARED | Shared method with an accepted version and stated validation coverage | Prefer when applicable; check known defects and input compatibility |
| ACCOUNT_SPECIFIC | Method or configuration tailored to a debtor | Verify scope, assumptions and reviewed version; do not generalize silently |
| SESSION_SCRATCHPAD | Exploratory code created for a specific turn | Isolate execution and outputs; preserve the method when findings depend on it |

“Locked” describes an accepted method version, not immunity from defects. “Account-specific” describes scope, not automatic trust. A scratchpad can yield useful evidence, but it has no automatic right to overwrite shared production outputs.

**AHA-D10.** Scratchpad analysis is permitted inside the turn's execution boundary. The runtime may create code to investigate an unresolved question where existing methods do not suffice. The harness must enforce read/write, executable and network boundaries at runtime; prompt instructions alone are insufficient.

Scratchpad code and input references are retained whenever they support reported findings. Disposable intermediate files may be discarded under an explicit retention policy. A result whose method is lost is not reproducible evidence.

**AHA-D11.** Promotion requires a separate reviewed change. Repeated usefulness is a trigger to assess promotion, not an automatic approval rule or a mandatory “three accounts” threshold. Promotion requires scope, assumptions, fixture coverage, classification checks, versioning, defect review, documentation and registry integration as applicable.

## 5 Turns have enforceable boundaries

**AHA-D12.** Each turn declares the account, objective, source snapshot, doctrine and method versions, permitted outputs, resource budget and stop conditions before execution.

**AHA-D13.** The worker must stop or return partial findings when evidence is missing or contradictory, budgets are exhausted, a required method has a relevant defect, permissions are exceeded or the current source no longer matches the invocation snapshot. Exploratory work may continue on unaffected evidence within the same boundary, with limitations stated.

**AHA-D14.** Publication and governed mutations must reject stale writes. Parallel analysis may use isolated outputs. Publishing shared derived artifacts or updating account state requires concurrency control at the target resource. A prior approval does not authorize applying a change against a changed source snapshot.

**AHA-D15.** No worker has default permission to alter project.json, shared doctrine, registry, HUMAN_TASKS.md, raw evidence, ERP or outbound customer channels. The runtime increment in this package permits account-scoped analysis. Human task write-back in Slice 2 is performed through its own governed service.

## 6 Results survive the session

**AHA-D16.** A turn returns the objective, outcome, evidence references, methods used, proof results, unresolved residue, artifacts, proposed changes and next-turn recommendation. The operator result must be understandable without reading terminal output or reconstructing an entire chat.

Execution status and business proof status are separate. A successful process may return an unresolved finding. An interrupted turn may preserve useful partial evidence. Completion of a turn is not completion of reconciliation.

**AHA-D17.** Record operation and turn provenance without turning the audit trail into a new domain source of truth. Retain identifiers, actor, timing, versions, inputs, outputs and failure reasons. Do not require raw customer payloads or hidden model reasoning in the audit log.

**AHA-D18.** Corrections preserve lineage. When a method defect invalidates a finding, mark affected results as needing reassessment and supersede them explicitly. Do not silently relabel data, overwrite prior evidence or keep a known defect hidden to reproduce an incorrect historical output.

## 7 Delivery and extraction

**AHA-D19.** Slice 1 is Portfolio Health and Debtor Workspace with portfolio.validate and portfolio.refresh. It has no agent-turn execution or scratchpad entry point. Slice 2 adds human task round-trip and selected deterministic operations. The bounded reconciliation runtime is a later explicit increment.

**AHA-D20.** The general harness is extracted from demonstrated patterns. The debtor console does not need a generic event store, domain database, policy engine, skill catalog or arbitrary command endpoint to establish its value.

The earlier Operations Control Plane PRD remains a separate broader proposal. Its event/job/task/watch model does not override debtor authorities or mandate event sourcing for this product.

## 8 Unresolved matters

This doctrine does not decide the validation_pending enum conflict. The earlier recommendation to represent pending validation as an in-progress state plus explicit blocker remains recorded for decision. It also does not select a model provider, deployment environment, identity system, scratch executor or repository publication workflow. Those choices belong to the relevant implementation gate.

The governing distinction is durable: the runtime investigates and produces evidence; the domain's governed write path decides whether that evidence changes authoritative business state.
