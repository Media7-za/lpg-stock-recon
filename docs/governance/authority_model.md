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
- Session handoff docs (`docs/handoffs/`)
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
- `docs/Pipelines/feature_pipeline.md` — Slice Briefs and Module PRDs (in Jira)
- `LPG-Stock-Recon-Blueprint.md` — core product requirements and epics
- Jira ticket descriptions (acceptance criteria)

**Who can produce it:** EXPLORATION-ARCHITECT, DOMAIN-PRD-AGENT, PM

**Conflicts resolved by:** PM Decision (Level 1)

**Rule:** No implementation detail (component choice, SQL query, Prisma field name)
can contradict a product requirement. If the schema cannot support a business rule,
the schema must change — not the business rule.

---

## Level 3 — Domain Truth

**What it governs:** Entities, vocabulary, reconciliation rules, data model

**Where it lives:**
- `docs/CURRENT_CONTEXT.md` — current architecture state
- `LPG-Stock-Recon-Blueprint.md` — SKU structure, reconciliation math, auto-shell logic
- `docs/USER_FLOW.md` — operational flows and edge cases
- Approved Module PRDs (stored in Jira)

**Who can produce it:** DOMAIN-PRD-AGENT, ARCHITECT-AGENT, PM

**Conflicts resolved by:** PM Decision (Level 1) or Product Truth (Level 2)

**Rule:** No agent invents new SKU codes, reconciliation tiers, or status values
not defined in the domain docs. Domain truth is extended through the formal
pipeline — not informally by a coding agent mid-implementation.

---

## Level 4 — Architecture Truth

**What it governs:** How the system is structured — components, Supabase views, schema, patterns

**Where it lives:**
- `prisma/schema.prisma` — current DB schema (source of truth for data structure)
- `supabase/deploy_all.sql` — view definitions
- `docs/domain-api.md` — API contracts
- Architecture Notes (produced by ARCHITECT-AGENT, stored in Jira)
- Schema Diffs (produced by SCHEMA-AGENT, stored in Jira)

**Who can produce it:** ARCHITECT-AGENT, SCHEMA-AGENT, PM

**Conflicts resolved by:** Domain Truth (Level 3) or above

**Rule:** No coding agent introduces a new architectural pattern without it
first appearing in an approved Architecture Note. No coding agent modifies
the Prisma schema or Supabase views without an approved Schema Diff.
If a coding agent discovers that the architecture as designed cannot implement
a business rule, it raises a blocking question — it does not self-design an alternative.

---

## Level 5 — Implementation Truth

**What it governs:** The actual code — what exists in the repo right now

**Where it lives:**
- The codebase (`src/`, `prisma/`, `supabase/`, `scripts/`)
- Git history

**Who can produce it:** CODING-AGENT only

**Conflicts resolved by:** All higher levels

**Rule:** Implementation is the lowest authority. Code that contradicts a
business rule, a domain invariant, or an architectural decision is wrong —
regardless of whether it currently works. The fix is to bring the code into
alignment with the higher-level authority, not to accept the code as the new truth.

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

The authoritative name for any concept is the one used in `LPG-Stock-Recon-Blueprint.md`
and the approved Module PRD for that feature.

No agent invents a synonym for an existing named concept.
No agent uses a different capitalisation, abbreviation, or alias.

Examples:
- ✅ `CountSession` (domain term)
- ❌ `StockCount`, `SessionRecord`, `count_session` used where `CountSession` is meant
- ✅ `reconciliation_summary` (Supabase view name)
- ❌ `recon_view`, `summaryView` used in code where the view name is referenced

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
| `docs/governance/authority_model.md` | PM | Above all levels |
| `LPG-Stock-Recon-Blueprint.md` | PM | Level 2–3 |
| `docs/CURRENT_CONTEXT.md` | PM | Level 3 |
| `docs/USER_FLOW.md` | PM | Level 3 |
| `prisma/schema.prisma` | PM | Level 4 |
| `supabase/deploy_all.sql` | PM | Level 4 |
| Slice Brief (in Jira) | EXPLORATION-ARCHITECT → PM approval | Level 2 |
| Module PRD (in Jira) | DOMAIN-PRD-AGENT → PM approval | Level 2 |
| Architecture Note (in Jira) | ARCHITECT-AGENT → PM approval | Level 4 |
| Schema Diff (in Jira) | SCHEMA-AGENT → PM approval | Level 4 |
| UX Flow (in Jira) | UX-DESIGN-AGENT → PM approval | Level 4 |
| Implementation spec (in Jira) | TICKET-ARCHITECT → PM implied | Level 4–5 |
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
