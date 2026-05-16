# Authority Model

This document sits above all roles and pipelines.
Every agent reads this first. Every conflict is resolved by consulting this document.

---

## Purpose

When two documents say different things, which one wins?
When an agent is uncertain what it is allowed to do, where does it look?
When a decision needs to be made and the PM is not present, what is the authority order?

This document answers all of those questions.

---

## Authority Hierarchy

```
Level 1 — PM Decision (highest authority)
        ↓
Level 2 — Product Truth
        ↓
Level 3 — Domain Truth
        ↓
Level 4 — Architecture Truth
        ↓
Level 5 — Implementation Truth (lowest authority)
```

An agent operating at a lower level cannot override a decision made at a higher level.
If a lower-level artifact contradicts a higher-level artifact, the higher-level wins
and the lower-level must be corrected — not worked around.

---

## Level 1 — PM Decision

**What it governs:** Scope, priority, tradeoffs, anything unresolved

**Where it lives:**
- Jira ticket comments (explicit approvals and decisions)
- Session handoff docs (`Docs/handoffs/`)
- Open Questions Register (in Slice Briefs)

**Who can produce it:** The PM only

**When it applies:**
- Any time two lower-level documents conflict
- Any time a question is marked "Awaiting PM" in an Open Questions Register
- Any time a phase gate requires sign-off
- Any time a destructive database operation is proposed

**Rule:** No agent at any level overrides or works around a PM decision.
If a PM decision is missing and an agent cannot proceed, it raises a blocking question.
It does not guess.

---

## Level 2 — Product Truth

**What it governs:** What the system must do, for whom, and why

**Where it lives:**
- `Docs/pipelines/feature_pipeline.md` — Slice Briefs and Module PRDs (in Jira)
- `Docs/PRD_Core.md` — core product requirements
- Jira ticket descriptions (acceptance criteria)

**Who can produce it:** EXPLORATION-ARCHITECT, DOMAIN-PRD-AGENT, PM

**Conflicts resolved by:** PM Decision (Level 1)

**Rule:** No implementation detail (API shape, component choice, SQL query)
can contradict a product requirement. If an API cannot support a business rule,
the API must change — not the business rule.

---

## Level 3 — Domain Truth

**What it governs:** Entities, vocabulary, state machines, invariants, data model

**Where it lives:**
- `Docs/system_invariants.md` — INV-001 through INV-009
- `Docs/entity_definitions.md` — canonical field names, types, status values
- `Docs/state_machines.md` — valid transitions and side effects
- `Docs/domain_glossary.md` — authoritative terminology

**Who can produce it:** DOMAIN-PRD-AGENT, ARCHITECT-AGENT, PM

**Conflicts resolved by:** PM Decision (Level 1) or Product Truth (Level 2)

**Rule:** No agent invents new domain vocabulary or introduces a status value
not defined in `entity_definitions.md`. No agent adds a state transition not
defined in `state_machines.md`. Domain truth is extended through the formal
pipeline — not informally by a coding agent mid-implementation.

---

## Level 4 — Architecture Truth

**What it governs:** How the system is structured — files, APIs, schema, patterns

**Where it lives:**
- `Docs/api_contracts.md` — endpoint shapes, ID rules, request/response
- Architecture Notes (produced by ARCHITECT-AGENT, stored in Jira)
- Schema Diffs (produced by SCHEMA-AGENT, stored in Jira)
- `prisma/schema.prisma` — current DB schema (source of truth for data structure)

**Who can produce it:** ARCHITECT-AGENT, SCHEMA-AGENT, PM

**Conflicts resolved by:** Domain Truth (Level 3) or above

**Rule:** No coding agent introduces a new architectural pattern without it
first appearing in an approved Architecture Note. No coding agent modifies
the schema without an approved Schema Diff. If a coding agent discovers that
the architecture as designed cannot implement a business rule, it raises a
blocking question — it does not self-design an alternative.

---

## Level 5 — Implementation Truth

**What it governs:** The actual code — what exists in the repo right now

**Where it lives:**
- The codebase (`app/`, `components/`, `lib/`, `prisma/`)
- Git history

**Who can produce it:** CODING-AGENT only

**Conflicts resolved by:** All higher levels

**Rule:** Implementation is the lowest authority. Code that contradicts a
business rule, a domain invariant, or an architectural decision is wrong —
regardless of whether it currently works. The fix is to bring the code into
alignment with the higher-level authority, not to accept the code as the
new truth.

---

## Conflict Resolution Protocol

When any agent encounters a conflict between documents:

```
Step 1 — Identify which authority levels are in conflict.

Step 2 — The higher-level document wins.
         Do not average them. Do not pick the more convenient one.
         The higher level wins unconditionally.

Step 3 — If the conflict involves Level 1 (PM Decision) or the
         correct level is unclear, raise a blocking question.
         Do not proceed until resolved.

Step 4 — Note the conflict in your output so the PM can correct
         the lower-level document after resolution.
```

---

## Naming Authority

The authoritative name for any concept is the one in `Docs/domain_glossary.md`.

If a concept does not appear in the glossary, the name used in the approved
Module PRD for that feature becomes authoritative for that slice.

No agent invents a synonym for an existing named concept.
No agent uses a different capitalisation, abbreviation, or alias.

Example:
- ✅ `Delivery` (glossary term)
- ❌ `Shipment`, `DeliveryRecord`, `delivery_item` used where `Delivery` is meant

---

## Scope Authority

The authoritative scope definition for any feature is the approved Slice Brief.

If something is not mentioned in the approved Slice Brief, it is out of scope.
Period. Not "probably in scope" or "implied by the feature." Out of scope.

No agent adds scope that is not in the Slice Brief.
If a coding agent believes something needs to be added, it raises a blocking question.
It does not self-authorise the addition.

---

## What Every Agent Must Do

Before starting any work, every agent reads this document and confirms:

- [ ] I know which pipeline I am in
- [ ] I know which stage I am at
- [ ] I know what authority level my inputs operate at
- [ ] I know what authority level my outputs operate at
- [ ] I know which document wins if I encounter a conflict
- [ ] I know to raise a blocking question rather than guess

---

## Document Ownership

| Document | Owner | Authority Level |
|---|---|---|
| `Docs/governance/authority_model.md` | PM | Above all levels |
| `Docs/system_invariants.md` | PM | Level 3 |
| `Docs/entity_definitions.md` | PM | Level 3 |
| `Docs/state_machines.md` | PM | Level 3 |
| `Docs/domain_glossary.md` | PM | Level 3 |
| `Docs/api_contracts.md` | PM | Level 4 |
| `prisma/schema.prisma` | PM | Level 4 |
| Slice Brief (in Jira) | EXPLORATION-ARCHITECT → PM approval | Level 2 |
| Module PRD (in Jira) | DOMAIN-PRD-AGENT → PM approval | Level 2 |
| Architecture Note (in Jira) | ARCHITECT-AGENT → PM approval | Level 4 |
| Schema Diff (in Jira) | SCHEMA-AGENT → PM approval | Level 4 |
| UX Flow (in Jira) | UX-DESIGN-AGENT → PM approval | Level 4 |
| Implementation spec (in Jira) | TICKET-ARCHITECT → PM implied | Level 4-5 |
| Code in repo | CODING-AGENT | Level 5 |
| Session handoffs | SESSION-CLOSER | Level 1 record |

---

## Version and Change Policy

This document is owned by the PM.
No agent modifies it. No agent proposes changes to it inline.

If the system evolves and this document needs updating:
1. PM identifies the change needed
2. PM updates this document directly
3. SESSION-CLOSER records the change in the session handoff
4. All future agent sessions inherit the updated authority model

The version of this document in the repo at the time of a session
is the authoritative version for that session.
