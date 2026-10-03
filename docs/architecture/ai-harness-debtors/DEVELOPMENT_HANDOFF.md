# Development handoff for the Debtors Control Plane

**ID:** AHA-DEV-001  
**Version:** 1.0.0  
**Date:** 2026-10-03, Africa/Johannesburg  
**Repository:** Media7-za/lpg-stock-recon  
**Read baseline:** main at a5077af884f4e0494cdae694d781bb5e9956e0dc  
**Stage:** Repository compatibility review and Slice 1 preparation  
**Authority:** Operator authorized documentation capture and development handoff. New portfolio doctrine and unresolved implementation choices remain PROPOSED — NOT RATIFIED.

## Start here

Read this handoff and the attached documentation package, inspect the current repository authorities, and return a compatibility report with a bounded Slice 1 implementation plan. Work can start with read-only discovery immediately. Do not normalize debtor state or begin implementing a new architectural pattern before its blocking decisions and repository phase gates have been resolved.

The product direction is Portfolio Health plus Debtor Workspace first. A later bounded runtime invokes a reconciliation turn and chooses appropriate scripts and skills within it. Do not expand Slice 1 to implement that runtime.

## Required reading

1. `AGENTS.md`, `docs/README.md` and `docs/governance/authority_model.md`.
2. Latest dated `docs/handoffs/*.md`; this handoff links the 2026-09-23 predecessor, which concerns Pricing Desk consolidation rather than this build.
3. `docs/CURRENT_CONTEXT.md`, `.agent/AGENT_WORKFLOW.md` and `docs/agent_prompt_template.md`.
4. `analysis/debtors/shared/DEBTORS_DOCTRINE.md`, `PROJECT_SCHEMA.md` and `DEBTOR_STATE_MACHINE.md`.
5. Existing orchestration PRD, roadmap and debtor workspace material under `analysis/debtors/shared/docs/`.
6. `DOCTRINE_Layered_Reconciliation_Architecture_PROPOSED.md`, `reconciliation_status_taxonomy.md` and `ALLOCATION_DOCTRINE.md` in that directory.
7. Current `SLICE_REGISTRY.json`, `HUMAN_TASKS.md`, `debtors_sync.mjs`, D17 implementation and owning dashboard generator.
8. Package README, doctrine and PRD 001. Read PRDs 002/003 and the turn contract as future context, not current build scope.

This package is staged under `docs/architecture/ai-harness-debtors/`. Existing constitutional doctrine wins on conflict. The staging directory is an intake package, not a second constitutional home. Adopt or merge appropriate rules through the existing governance path; do not duplicate binding rules.

## Verified repository observations

These are file-content observations, not new financial proof:

- Root AGENTS requires resume/harvest and prohibits worker-authored constitutional changes.
- DEBTORS_DOCTRINE.md is ratified and names itself the single constitutional home for cross-lane reconciliation.
- Its Projection Rule limits an operator projection to five operational questions. The seven-layer runtime view therefore needs a layout/authority decision; it cannot silently enlarge one constitutional projection.
- Its evidence hierarchy makes lane membership a line property and separates PROVEN/ASSERTED/ASSUMED from allocation confidence.
- Its D18 contract distinguishes `totalOutstanding` exposure from the ERP anchor and keeps blocked accounts visible. UI totals must not relabel exposure as a proven ERP balance.
- D19 distinguishes ingest object schema validity from freshness and coverage. Absence is not clearance, and ingest failures do not automatically create collection blockers.
- `.agent/AGENT_WORKFLOW.md` keeps reconciliation in agents/scripts; the React/Vite PWA is a review/control surface.
- RED001 and TWK002 currently declare `reconState: validation_pending`, while the state machine lists pending, in-progress and complete. Do not infer approval to edit either file from this handoff.
- An existing layered reconciliation architecture proposal overlaps this package and remains marked not ratified. Its proposed settlement/evidence taxonomy must not be treated as accepted doctrine merely because a script consumes it.
- The recursive tree at the read baseline has one AGENTS.md and no path named as a control plane or harness. This is not proof that no functionally overlapping implementation exists; inspect the existing workspace and orchestration code.

## First deliverable

Return `COMPATIBILITY_REVIEW.md` and a bounded implementation plan. Identify current sources and owning functions, existing UI reuse, actual validator failures, projection generation baseline, artifact access boundary, execution host, audit path/format and actor identity.

Classify each package requirement as supported by current doctrine, additive implementation, proposed doctrine, or conflict. Include exact file/section references and proposed minimal resolution. Do not implement corrections merely to make the compatibility report pass.

The review must explicitly address:

| Decision | Owner | Requirement |
|---|---|---|
| validation_pending | Operator/PM | Decide normalization to in-progress with blockers versus a formal enum extension; recommended normalization is not yet a ruling |
| Doctrine adoption | Operator/architecture governance | Reconcile package with the single constitutional home and existing layered proposal |
| Execution boundary | Architect/PM | Identify approved host for repository reads and the two RUN operations; do not put reconciliation or privileged execution in the browser |
| Identity/access | Architect/PM | Establish actor identity and permitted repository/evidence access |
| Projection layout | Architect/PM | Respect the five-question rule; distinguish portfolio health, debtor projection and detailed reports |
| Proof vocabulary | Domain/PM, later increment | Preserve epistemic tags; proposed layer labels cannot replace PROVEN/ASSERTED/ASSUMED or extend reconState |

Raise precise unresolved decisions with the evidence and minimal options. Continue independent read-only review while those decisions remain open.

## Slice 1 implementation after gates

1. Dynamically discover accounts and reuse the existing portfolio validator and D17 gate.
2. Build a disposable read model preserving separate recon, workflow, schema, ingest and collections axes. Invalid JSON must remain visible as an error row.
3. Add Portfolio Health with exact validation issues and content-based projection freshness.
4. Add Debtor Workspace with current position, evidence, blockers, recorded actions and links to existing artifacts.
5. Expose only `portfolio.validate` and `portfolio.refresh` through a strict command allow-list. Refresh validates and checks source consistency before publishing existing derived projections.
6. Add append-only operation outcomes and reliable generation-baseline metadata, reusing existing conventions where possible.
7. Add drift comparison and unknown-baseline behaviour. Removed blockers are not automatically resolved blockers.
8. Verify requirements and deliver a separate implementation PR for review. Do not merge or deploy as part of this handoff.

Do not use account count, account balance or scenario example as a fixed constant. Use sanitized fixtures for tests that should not depend on live customer evidence.

## Acceptance and validation

PRD 001 is the full checklist. Minimum checks for the implementation PR:

- Discovery works for new/removed accounts and malformed JSON.
- Console validator and D17 results match the owning implementation.
- Unknown amounts cannot become zero; totalOutstanding cannot become the ERP anchor.
- Absent ingest evidence or an unevaluated gate cannot become PASS.
- ERROR, WARNING and COLLECTIONS_BLOCKED remain distinct.
- Failed/blocked refresh preserves prior output; changed inputs cannot produce a falsely current projection.
- Successful generation records a usable baseline; subsequent drift reflects the right source version.
- Artifact access rejects path traversal and symlink escape and follows the approved identity boundary.
- Only the two approved RUN operations exist, and completed attempts have attributable append-only outcomes.
- HUMAN actions remain view-only in Slice 1.
- No project state, task, registry, raw evidence, ERP or customer-message mutation is added.
- Run the repository's appropriate tests and required build/type checks, including `npm run build` and `npx tsc --noEmit` where the implementation uses the existing frontend. Report failures and introduced warnings candidly.

## Later increments

PRD 002 adds HUMAN_TASKS.md completion through a governed round-trip and explicitly approved deterministic operations. PRD 003 adds Start/Continue Reconciliation with isolated outputs, capability selection and controlled scratch execution. The turn contract is a proposed technical specification for that later increment.

Neither increment is authorized as part of the Slice 1 implementation scope. Useful generic patterns may be extracted after operating the first two slices; no generic database, event store or policy engine is a prerequisite.

## Scope boundaries

This handoff authorizes preparation for development, not financial ratification, state normalization, credential changes, schema migrations, production writes, outbound sends, merge or deployment. The current documentation PR stages intent for review. Follow existing role and phase gates; a coding agent may not invent missing architecture or adopt an unratified evidence hierarchy.

## Required return from the developer

Provide the compatibility report, blocking decision register, proposed approved-scope implementation sequence and validation plan first. After gates are resolved, provide the implementation PR, changed behaviour, evidence of checks, material limitations and a dated session handoff. State the exact branch and commit; do not claim a clean checkout without checking it.
