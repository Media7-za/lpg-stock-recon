# Authority Model

This document sits above all roles and pipelines for the **LPG Stock Recon App**.
Every agent reads this first. Every conflict is resolved by consulting this document.

---

## Authority Hierarchy

```
Level 1 — PM Decision (highest authority)
        ↓
Level 2 — Product Truth (Module PRDs, Slice Briefs)
        ↓
Level 3 — Domain Truth (Invariants, State Machines)
        ↓
Level 4 — Architecture Truth (API Contracts, Schema)
        ↓
Level 5 — Implementation Truth (The Codebase)
```

An agent operating at a lower level cannot override a decision made at a higher level.

---

## Level 1 — PM Decision
**Where it lives:** Jira ticket comments, Session handoffs, Open Questions Registers.
**Rule:** No agent overrides or works around a PM decision. If a PM decision is missing, raise a blocking question.

---

## Level 2 — Product Truth
**Where it lives:**
- `docs/Pipelines/feature_pipeline.md` (and resulting PRDs in Jira)
- `docs/Pipelines/bug_pipeline.md` (and resulting Specs in Jira)
- Jira ticket acceptance criteria.

---

## Level 3 — Domain Truth
**Where it lives:**
- `Documents/system-invariants.md` (INV-xxx rules)
- `Documents/recon-engine-spec.md` (Entity and logic definitions)
- `Documents/state-machines.md` (Valid status transitions)

---

## Level 4 — Architecture Truth
**Where it lives:**
- `docs/domain-api.md` (API contracts)
- `prisma/schema.prisma` (DB schema source of truth)
- Architecture Notes produced by `ARCHITECT-AGENT`.

---

## Level 5 — Implementation Truth
**Where it lives:** The codebase (`src/`, `supabase/`, etc.) and Git history.
**Rule:** Implementation is the lowest authority. Code that contradicts a higher-level authority is wrong and must be aligned.

---

## Conflict Resolution Protocol
1. Identify authority levels in conflict.
2. The higher-level document wins unconditionally.
3. If the conflict involves Level 1 or is unclear, raise a blocking question.
4. Note the conflict in your output.

---

## Naming Authority
The authoritative names for all concepts are defined in `Documents/recon-engine-spec.md`. No agent invents synonyms or aliases.

---

## Document Ownership

| Document | Owner | Authority Level |
|---|---|---|
| `Documents/authority_model.md` | PM | Above all levels |
| `Documents/system-invariants.md` | PM | Level 3 |
| `Documents/recon-engine-spec.md` | PM | Level 3 |
| `Documents/state-machines.md` | PM | Level 3 |
| `docs/domain-api.md` | PM | Level 4 |
| `prisma/schema.prisma` | PM | Level 4 |
| `docs/Pipelines/feature_pipeline.md` | PM | Level 2 |
| `docs/Pipelines/bug_pipeline.md` | PM | Level 2 |
| Code in repo | CODING-AGENT | Level 5 |
