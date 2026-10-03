> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# AI Harness Architecture documentation baseline

**Package:** AHA-DEBTORS-20261003  
**Version:** 1.0.0  
**Recorded:** 2026-10-03, Africa/Johannesburg  
**Owner:** Media7  
**Status:** Discussion baseline recorded at the user's request; repository adoption and implementation outstanding.

This package locks the architectural intent of the debtor-space discussion into versioned Markdown. The central decision is that a bounded reconciliation turn is the invocation unit. The runtime selects appropriate scripts and skills inside that turn to progressively establish the debtor position. Portfolio health remains the first delivery increment.

The package records agreed direction and separately identifies design proposals and unresolved decisions. Creating these files does not approve financial assumptions, alter debtor state, implement a runtime or ratify every detail of a future implementation.

## Read order

| Document | Purpose | Status |
|---|---|---|
| [AI_HARNESS_ARCHITECTURE_DOCTRINE.md](AI_HARNESS_ARCHITECTURE_DOCTRINE.md) | Governing architectural intent and debtor-specific application | Recorded baseline; repository compatibility review required |
| [PRD_001_DEBTORS_PORTFOLIO_HEALTH.md](PRD_001_DEBTORS_PORTFOLIO_HEALTH.md) | Slice 1 Portfolio Health and Debtor Workspace | Implementation specification; state decision blocks adoption |
| [PRD_002_HUMAN_QUEUE_AND_OPERATIONS.md](PRD_002_HUMAN_QUEUE_AND_OPERATIONS.md) | Slice 2 human task round-trip and deterministic operations | Proposed implementation specification |
| [PRD_003_BOUNDED_RECONCILIATION_RUNTIME.md](PRD_003_BOUNDED_RECONCILIATION_RUNTIME.md) | Later increment for Continue Reconciliation | Proposed implementation specification |
| [RECONCILIATION_TURN_CONTRACT.md](RECONCILIATION_TURN_CONTRACT.md) | Input, output, execution and evidence requirements for a turn | Proposed technical contract implementing the baseline |

## What is locked

1. The debtor console is the proving ground. Generic implementation abstractions are extracted after practical use across the first two slices.
2. Slice 1 detects schema and projection drift, presents the account workspace, and permits only portfolio validation and refresh.
3. The later reconciliation runtime operates account-first, with a bounded objective, through one or more scripts and skills.
4. Account balance proof, category composition, payment reconciliation, invoice allocation, custody and collections eligibility remain distinct claims.
5. Shared locked scripts, account-specific scripts and session scratchpad scripts have distinct applicability and assurance.
6. Worker findings and successful script execution do not authorize project-state mutation.
7. Evidence, method versions, unresolved residue and next-turn guidance must survive the session.

## Decision register

| ID | Decision | Disposition | Effect |
|---|---|---|---|
| AHA-DEC-001 | Debtor-specific proving ground before a generic harness build | Recorded direction | No generic registry, event store or new domain database in Slice 1 |
| AHA-DEC-002 | Turn is the unit of agentic invocation | Recorded direction | Continue Reconciliation can use several bounded capabilities |
| AHA-DEC-003 | Progressive proof with separate claims | Recorded direction | Balance proof cannot imply allocation or collections proof |
| AHA-DEC-004 | Three method classes | Recorded direction | Method maturity and evidence correctness are separately assessed |
| AHA-DEC-005 | Workers produce findings and proposals; governed paths own state | Recorded direction | No worker mutation of project.json or ERP |
| AHA-DEC-006 | Normalize validation_pending to in-progress plus explicit validation blocker | Recommendation only, unresolved | No enum or debtor-file change authorized by this package |
| AHA-DEC-007 | Seven reconciliation layers are a derived operational view | Design proposal | Do not add seven authoritative status fields automatically |
| AHA-DEC-008 | Turn records, concurrency and scratch execution contract | Design proposal | Validate against repository conventions before runtime work |

## Implementation order

Deliver PRD 001 first. Deliver PRD 002 next. Review repeated patterns and operational feedback before implementing PRD 003. Documenting the runtime now prevents loss of intent; it does not enlarge Slice 1. Generic extraction is a separate later decision, and need not precede the debtor-specific runtime.

## Source coverage

The source is the supplied discussion of the Slice 1 specification, skill invocation and progressive debtor reconciliation, plus the user's request to lock it into doctrine and PRDs. The supplied conversation is explicitly truncated; complete session coverage is not claimed.

Two existing documents were read in full for compatibility: `ARCHITECTURE_OFFICE_BLUEPRINT.md` dated 2 August 2026 and `Operations_Control_Plane_Prototype_PRD.md` dated 28 September 2026. The blueprint separates architectural intent, doctrine, approval and implementation. The Operations PRD describes a broader operational event/job/task/watch product; its event-native implementation is not required by the debtor console.

Repository paths, script names, account examples, counts and balances in the supplied discussion were not independently checked against current GitHub contents in this turn. They are integration references or historical examples, not verified current facts. This package does not replace those existing documents or claim a repository commit.

## Repository adoption handoff

The intended integration target from the discussion is `Media7-za/lpg-stock-recon`. The repository agent must first read the current AGENTS instructions, accepted doctrine, project schema, state machine, registry and scripts. Reuse existing artifact locations and identifiers. The paths below are suggested placements only:

- General architecture intent under the repository's existing architecture/doctrine area.
- Debtor PRDs and turn contract under the existing debtor documentation area.
- Existing debtor skills, validators and registries remain the implementation authority.

Perform a compatibility review before assigning repository-authoritative status. Record any required doctrine or schema change explicitly. No hidden normalization, migration, evidence rewrite or registry amendment is part of this handoff.

## Version policy

Version 1.0.0 captures the discussion baseline. Future corrections preserve the prior version and record the reason, affected decision IDs, source request, timestamp and downstream impact. Changes to authority, proof requirements or write permissions require an explicit governance decision. Editorial clarifications do not imply a change in runtime permissions.

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-10-03 | Initial doctrine, three staged PRDs and bounded-turn contract |
