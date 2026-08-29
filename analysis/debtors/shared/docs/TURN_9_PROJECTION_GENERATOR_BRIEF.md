# Turn 9 — Operator Projection Generator (Queued → Executed)

**Status:** Executed 2026-07-21 (after Turn 10 doctrine consolidation)  
**Constitutional basis:** `analysis/debtors/shared/DEBTORS_DOCTRINE.md`

---

## Objective

Establish the operator projection as the primary operator artifact: schema, template, and governance hooks — **staged**, not yet enforced by sync.

---

## Addendum (a) — Doctrine citation in orchestrator preamble

**Completed by Turn 10.** Orchestrator skill §5 preamble cites `DEBTORS_DOCTRINE.md` (pointer only; verbatim text in constitutional file).

---

## Steps (executed)

| Step | Action | Output |
| :---: | :--- | :--- |
| 1 | Stage projection JSON schema (max 5 questions, collectable bridge) | `shared/PROJECT_PROJECTION_SCHEMA.md` |
| 2 | Stage operator-facing template | `shared/docs/DEBTOR_PROJECTION_TEMPLATE.md` |
| 3 | Cross-link from `DEBTORS_DOCTRINE.md` §8 | Done in Turn 10 |
| 4 | Roadmap milestone recorded | `DEBTORS_ORCHESTRATION_ROADMAP.md` |
| 5 | **Do not** activate event sourcing / digital twin | Parked — operator decision |

---

## Out of scope (this turn)

- `debtors:sync` enforcement of projection schema  
- `project.json` schema migration (staged separately)  
- Sample projection files per debtor  
- MOZ002 / WO0001 analysis  

---

## Next (operator)

1. Pilot one projection (e.g. MOZ002) using template + P17 anchor  
2. Decide sync enforcement date  
3. Rule Turn 8b conflicts (ref_no payer-class) before elevating matching doctrine  
