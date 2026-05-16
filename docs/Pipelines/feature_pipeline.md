# Pipeline: FEATURE

Use this pipeline when building something new — a screen, workflow,
capability, module, or slice that does not yet exist.

A feature starts with an idea. This pipeline exists to remove all ambiguity
before anyone builds, then implement cleanly within locked constraints.

---

## When to Use This Pipeline

- A new screen or workflow is needed
- A new capability is being added to an existing screen
- A new module or vertical slice is being introduced
- A third-party integration is being added
- An existing flow is being redesigned (not just fixed)

---

## Two Phases, One Pipeline

```
Phase 1 — EXPLORATION
Remove ambiguity. Define the slice. Lock the constraints.
No code is written in this phase.

Phase 2 — BUILD
Implement the locked slice. Enforce conformance.
No product decisions are made in this phase.
```

The gate between phases is PM approval of all exploration artifacts.
Nothing in Phase 2 can reopen a decision made in Phase 1.

---

## Phase 1 — Exploration

### Stage 1 — EXPLORATION-ARCHITECT

**Role doc:** `docs/roles/exploration_architect.md`

**Session starter:**
```
Role: EXPLORATION-ARCHITECT | Feature: {one line description} | Ticket: {TICKET-ID}
git pull origin main
Then read docs/roles/exploration_architect.md and follow it.
```

**Input pack:**
- PM's feature idea (free-form description)
- Jira ticket number
- Repo access (read-only)
- Governance docs: `system_invariants.md`, `entity_definitions.md`,
  `state_machines.md`, `api_contracts.md`

**Output — Slice Brief posted to Jira:**
- Feature name and actor
- User outcome
- Workflow / capability / subsystem classification
- MVP-critical / operational / future-facing
- Scope: what is IN and OUT
- Events that enter the slice
- Outputs that leave the slice
- Systems/entities read and written
- Dependency map
- Open Questions Register
- Recommended vertical slice definition

**Gate:**
- PM reviews Slice Brief
- PM resolves Open Questions
- PM approves scope boundary
- APPROVED → proceed to Stage 2

---

### Stage 2 — DOMAIN-PRD-AGENT

**Role doc:** `docs/roles/domain_prd_agent.md`

**Session starter:**
```
Role: DOMAIN-PRD-AGENT | Feature: {name} | Ticket: {TICKET-ID}
git pull origin main
Then read docs/roles/domain_prd_agent.md and follow it.
```

**Input pack:**
- Approved Slice Brief (from Stage 1, in Jira)
- Governance docs: `system_invariants.md`, `entity_definitions.md`,
  `state_machines.md`, `domain_glossary.md`

**Output — Module PRD posted to Jira:**
- Business rules (authoritative, not aspirational)
- Actor behaviours per role
- Workflows (happy path + unhappy paths)
- Acceptance criteria (testable, binary)
- Error conditions and handling
- Role/permission constraints
- Authoritative vocabulary for this slice

**Gate:**
- PM reviews PRD
- PM confirms business rules are correct
- PM confirms acceptance criteria are testable
- APPROVED → proceed to Stage 3

---

### Stage 3 — ARCHITECT-AGENT

**Role doc:** `docs/roles/architect_agent.md`

**Session starter:**
```
Role: ARCHITECT-AGENT | Feature: {name} | Ticket: {TICKET-ID}
git pull origin main
Then read docs/roles/architect_agent.md and follow it.
```

**Input pack:**
- Approved Slice Brief (Stage 1)
- Approved Module PRD (Stage 2)
- Repo access (read-only — reads existing code structure)
- Governance docs: `api_contracts.md`, `state_machines.md`,
  `entity_definitions.md`, `system_invariants.md`

**Output — Architecture Note posted to Jira:**
- Frontend surfaces touched
- Backend services/routes required
- API contract plan (new endpoints or changes to existing)
- Schema impact plan (new tables, fields, enums)
- State machine changes (new transitions or states)
- Event model impact
- Frontend/backend ownership split
- Sequencing recommendation (what to build first)
- Observability/audit implications

**Gate:**
- PM reviews Architecture Note
- PM confirms no out-of-scope integrations
- PM confirms sequencing is correct
- APPROVED → proceed to Stage 4 (if schema change) or Stage 5 (if no schema change)

---

### Stage 4 — SCHEMA-AGENT *(only if schema changes required)*

**Role doc:** `docs/roles/schema_agent.md`

**Session starter:**
```
Role: SCHEMA-AGENT | Feature: {name} | Ticket: {TICKET-ID}
git pull origin main
Then read docs/roles/schema_agent.md and follow it.
```

**Input pack:**
- Approved Architecture Note (Stage 3)
- Approved Module PRD (Stage 2)
- Repo access (reads `prisma/schema.prisma`)
- `Docs/entity_definitions.md`

**Output — Schema Diff posted to Jira:**
- Exact Prisma schema changes required
- Migration impact (additive / breaking / destructive)
- Backfill needs (existing records that need updating)
- Enum/state changes
- Data safety warnings
- Query/index implications
- Recommended migration sequence

**Gate:**
- PM reviews Schema Diff
- PM confirms no destructive changes without explicit sign-off
- APPROVED → proceed to Stage 5

---

### Stage 5 — UX-DESIGN-AGENT *(only if UI changes required)*

**Role doc:** `docs/roles/ux_design_agent.md`

**Session starter:**
```
Role: UX-DESIGN-AGENT | Feature: {name} | Ticket: {TICKET-ID}
git pull origin main
Then read docs/roles/ux_design_agent.md and follow it.
```

**Input pack:**
- Approved Slice Brief (Stage 1)
- Approved Module PRD (Stage 2)
- Approved Architecture Note (Stage 3)
- Governance docs: `system_invariants.md` (INV-002 through INV-004)
- Repo access (reads existing screens for consistency)

**Output — UX Flow posted to Jira:**
- Screen list (new and modified)
- Ideal user flow (happy path)
- Unhappy paths and edge cases
- Empty / loading / error states per screen
- Role-specific behaviour and permission gates
- Component usage plan (shadcn components to use)
- Token-compliant layout notes
- Interaction states (hover, focus, disabled, selected)

**Gate:**
- PM reviews UX Flow
- PM confirms flow matches business rules in PRD
- PM confirms nothing violates INV-002, INV-003, INV-004
- APPROVED → Phase 1 complete

---

### Phase 1 Lock

Before Phase 2 begins, PM confirms all approved artifacts are frozen:

- [ ] Slice Brief — approved
- [ ] Module PRD — approved
- [ ] Architecture Note — approved
- [ ] Schema Diff — approved (or N/A)
- [ ] UX Flow — approved (or N/A)
- [ ] All Open Questions — resolved
- [ ] Vocabulary — agreed
- [ ] Scope boundary — locked

**Nothing in Phase 2 reopens these decisions.**
If an agent in Phase 2 discovers something that requires a scope change,
it raises a blocking question and waits for PM decision.
It does not self-authorise the change.

---

## Phase 2 — Build

### Stage 6 — CODING-AGENT (Backend)

**Role doc:** `docs/roles/coding_agent.md`

**Session starter:**
```
Role: CODING-AGENT | Task: {TICKET-ID} | Mode: BACKEND
git pull origin main
Then read docs/roles/coding_agent.md and follow it.
```

**Input pack:**
- Approved Architecture Note (Stage 3)
- Approved Module PRD (Stage 2)
- Approved Schema Diff (Stage 4, if applicable)
- Governance docs: `api_contracts.md`, `state_machines.md`,
  `entity_definitions.md`, `system_invariants.md`, `validation_checklist.md`

**Scope:** API routes, validation, permission enforcement, events, DB operations.
Does NOT touch frontend files.

**Output:**
- Backend commit pushed to GitHub
- Validation checklist (Sections 1, 2, 8, 9, 10)
- API contract summary (what was built vs what was planned)

---

### Stage 7 — CODING-AGENT (Frontend)

**Role doc:** `docs/roles/coding_agent.md`

**Session starter:**
```
Role: CODING-AGENT | Task: {TICKET-ID} | Mode: FRONTEND
git pull origin main
Then read docs/roles/coding_agent.md and follow it.
```

**Input pack:**
- Approved UX Flow (Stage 5)
- Approved Architecture Note (Stage 3)
- Backend commit from Stage 6 (already live in repo)
- Governance docs: `system_invariants.md`, `validation_checklist.md`

**Scope:** Screens, components, data fetching, state management.
Builds against the backend already implemented in Stage 6.
Does NOT modify API routes or schema.

**Output:**
- Frontend commit pushed to GitHub
- Validation checklist (Sections 3, 4, 5, 6, 7, 9)

---

### Stage 8 — CODE-REVIEWER

**Role doc:** `docs/roles/code_reviewer.md`

**Session starter:**
```
Role: CODE-REVIEWER | Task: {TICKET-ID} | Commits: {BACKEND_HASH} {FRONTEND_HASH}
git pull origin main
Then read docs/roles/code_reviewer.md and follow it.
```

**Input pack:**
- Both commits (backend + frontend)
- Approved Architecture Note (checks backend against it)
- Approved UX Flow (checks frontend against it)
- Approved Module PRD (checks behaviour against it)

Reviews both commits. Returns single verdict.

---

### Stage 9 — REGRESSION-DETECTOR

**Role doc:** `docs/roles/regression_detector.md`

Same as bug pipeline. Checks both commits against all previously closed fixes.

---

### Stage 10 — QA-AUDITOR

**Role doc:** `docs/roles/qa_auditor.md`

**Session starter:**
```
Role: QA-AUDITOR | Task: {TICKET-ID} | PRD: in ticket comments
git pull origin main
Then read docs/roles/qa_auditor.md and follow it.
```

For the feature pipeline, QA-AUDITOR receives the PRD as an additional
authority — it checks not just invariants but PRD conformance.

**Checks:**
- All standard invariant checks (Sections 1-10)
- PRD acceptance criteria — does each criterion have corresponding code?
- Workflow coverage — are all happy paths and unhappy paths implemented?
- Permission gates — are role constraints enforced?
- Error states — are empty/loading/error states present?

---

### PM Deploy

After QA-AUDITOR passes:

1. Deploy to production
2. Smoke test against acceptance criteria from PRD
3. Close Jira ticket
4. Update SESSION-CLOSER at end of session

---

## Simplified Pipeline Variants

### UI-Only Slice
*A new screen with no new backend logic or schema changes.*

```
Stage 1 — EXPLORATION-ARCHITECT
Stage 2 — DOMAIN-PRD-AGENT
Stage 5 — UX-DESIGN-AGENT
[Phase 1 Lock]
Stage 7 — CODING-AGENT (Frontend only)
Stage 8 — CODE-REVIEWER
Stage 9 — REGRESSION-DETECTOR
Stage 10 — QA-AUDITOR
```

### Backend Workflow Slice
*New API logic, no schema changes, no new UI screens.*

```
Stage 1 — EXPLORATION-ARCHITECT
Stage 2 — DOMAIN-PRD-AGENT
Stage 3 — ARCHITECT-AGENT
[Phase 1 Lock]
Stage 6 — CODING-AGENT (Backend only)
Stage 8 — CODE-REVIEWER
Stage 9 — REGRESSION-DETECTOR
Stage 10 — QA-AUDITOR
```

### Data-Heavy Module
*New module with schema changes, full stack.*

```
All stages in order (1 → 2 → 3 → 4 → 5 → Phase Lock → 6 → 7 → 8 → 9 → 10)
```

---

## Phase Gate Checklists

These are formal control points. The PM works through each checklist before
allowing the pipeline to advance. Partial completion is not sufficient.
A single unchecked item holds the pipeline.

---

### Gate 1 — Exploration → Build

Before any code is written, the PM confirms:

**Scope**
- [ ] Scope is explicit — what is IN is listed
- [ ] Non-goals are explicit — what is OUT is listed
- [ ] Scope has not expanded since Stage 1

**Artifacts**
- [ ] Slice Brief is approved
- [ ] Module PRD is approved — all acceptance criteria are binary and testable
- [ ] Architecture Note is approved — ownership split is unambiguous
- [ ] Schema Diff is approved (or explicitly N/A)
- [ ] UX Flow is approved (or explicitly N/A)

**Open Questions**
- [ ] All Open Questions from the Slice Brief are resolved
- [ ] No new unresolved questions introduced in later stages
- [ ] Authority order is clear — every artifact knows which doc it defers to

**Domain**
- [ ] All new vocabulary is in the Module PRD or approved for glossary
- [ ] All new state transitions are mapped in the Architecture Note
- [ ] No naming conflicts with existing domain concepts

**First Slice**
- [ ] The smallest end-to-end vertical slice is defined
- [ ] That slice can be shipped independently
- [ ] What is deferred to a later slice is stated explicitly

If any item is unchecked → the pipeline does not advance.
The relevant exploration agent is sent back to resolve the gap.

---

### Gate 2 — Build → Deploy

After CODE-REVIEWER approves and REGRESSION-DETECTOR clears, the PM confirms:

**Scope compliance**
- [ ] Only files listed in the Architecture Note were changed
- [ ] No new endpoints were added beyond those in the Architecture Note
- [ ] No schema changes were made beyond the approved Schema Diff

**Constraint preservation**
- [ ] All system invariants are intact (confirmed by CODE-REVIEWER)
- [ ] All state machine side effects are implemented
- [ ] Deploy policy was followed — no agent ran `vercel deploy` or `prisma db push`

**Acceptance criteria**
- [ ] Each AC from the Module PRD has a corresponding implementation
- [ ] QA-AUDITOR has confirmed PRD conformance (for feature pipeline)

**Risk**
- [ ] No known regressions (confirmed by REGRESSION-DETECTOR)
- [ ] Any data migrations are safe to run on production
- [ ] Rollback plan exists if the deploy fails

If any item is unchecked → the pipeline does not advance to production.

---

## Optional Agent Invocation Rules

Not every feature needs every agent. Use these rules to decide.

### When to invoke SCHEMA-AGENT (Stage 4)

Invoke if any of the following are true:
- A new table is required
- A new field is added to an existing table
- An existing field type changes
- A new enum or enum value is introduced
- An existing enum value is removed or renamed
- A relation between tables changes
- A backfill of existing rows is needed
- A new index is needed for query performance

Skip only if the Architecture Note explicitly states: "No schema changes required."

### When to invoke UX-DESIGN-AGENT (Stage 5)

Invoke if any of the following are true:
- A new screen is created
- An existing screen gains a new section or panel
- A new user flow is introduced (multi-step interaction)
- New form inputs, selects, or buttons are added
- A new empty / loading / error state is needed
- Role-based visibility changes are introduced
- A new confirmation dialog or toast is required

Skip only if the change is purely backend with zero UI surface.

### CODING-AGENT Mode Selection

| Mode | When to use |
|---|---|
| `BACKEND` | API routes, validation, DB operations only. No frontend files. |
| `FRONTEND` | Screen components, data fetching, UI state only. No API routes. |
| `FULL` | Bug fix or small change touching both layers in one commit. |
| `PATCH` | Single file, single concern. Cosmetic or isolated fix. |

For the feature pipeline, always use BACKEND then FRONTEND separately.
This ensures the frontend builds against a verified backend.

### CODE-REVIEWER Mode Selection

| Mode | When to use |
|---|---|
| `CORRECTNESS` | Bug pipeline — did the fix do exactly what the spec said? |
| `CONFORMANCE` | Feature pipeline — does the implementation match PRD + Architecture Note? |
| `REGRESSION` | Any pipeline — focused check on previously fixed patterns only. |

For the feature pipeline, use CONFORMANCE mode.
For the bug pipeline, use CORRECTNESS mode.
REGRESSION mode is always run by the REGRESSION-DETECTOR as a separate session.

---

## Return-to-Exploration Criteria

A slice must return to exploration if any of the following are discovered
during later pipeline stages. This is non-negotiable.

**Scope expansion:**
An agent in Phase 2 determines that implementing the feature correctly requires
touching something outside the approved Slice Brief scope.
→ Stop. Return to EXPLORATION-ARCHITECT. Revise the Slice Brief.

**Naming conflict:**
An agent encounters a concept that conflicts with an existing glossary term,
or two agents use different names for the same thing.
→ Stop. Return to DOMAIN-PRD-AGENT. Resolve the vocabulary conflict.

**Unresolved ownership conflict:**
Two agents disagree on which owns a file, API, or data structure.
→ Stop. Return to ARCHITECT-AGENT. Clarify the ownership split.

**Unexpected schema requirement:**
An agent discovers a schema change is needed that was not in the approved
Schema Diff (or Schema Agent was skipped and schema changes are now required).
→ Stop. Invoke SCHEMA-AGENT. Get the change approved before proceeding.

**Domain rule contradiction:**
The approved PRD contains a rule that, when implemented, contradicts another
approved rule or an existing system invariant.
→ Stop. Return to DOMAIN-PRD-AGENT. Resolve the contradiction before coding.

**Architecture contradiction:**
The approved Architecture Note describes an approach that cannot work given
the actual codebase (e.g. an API that doesn't exist, a pattern that breaks an invariant).
→ Stop. Return to ARCHITECT-AGENT. Revise the Architecture Note.

**Unresolved open question discovered late:**
An agent in Phase 2 encounters a question that should have been in the
Open Questions Register but wasn't. The answer materially affects implementation.
→ Stop. Raise it to the PM. Do not guess. Do not proceed.

---

## The Most Important Rule

**No agent in Phase 2 makes a product decision.**

If an agent discovers something in Phase 2 that wasn't covered in Phase 1:
- It raises a blocking question
- It waits for PM resolution
- It does NOT self-authorise a solution

Phase 1 exists precisely to prevent this. If Phase 2 is full of blocking questions,
Phase 1 was not thorough enough. That is a signal to improve the exploration agents,
not to give build agents more autonomy.

When in doubt: stop, surface, wait. Never guess.
