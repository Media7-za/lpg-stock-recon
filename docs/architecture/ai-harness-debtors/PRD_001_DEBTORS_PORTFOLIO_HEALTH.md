> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# Debtors Portfolio Health and Workspace PRD

**ID:** AHA-PRD-001  
**Version:** 1.0.0  
**Date:** 2026-10-03  
**Increment:** Slice 1  
**Status:** Specification captured; repository adoption and blocking state decision outstanding  
**Doctrine:** [AHA-DOC-001](AI_HARNESS_ARCHITECTURE_DOCTRINE.md), especially AHA-D03 through AHA-D08 and AHA-D19 through AHA-D20

## 1 Problem and outcome

Debtor work can continue while generated portfolio projections remain stale because one or more project files violate the current contract. The operator needs a single surface that exposes current accounts, exact validation failures, projection freshness and collections restrictions.

Slice 1 succeeds when the operator can identify what changed, explain why an account fails validation, inspect its evidence and safely regenerate the existing portfolio projection. Schema drift is a primary product capability.

## 2 Blocking decision before implementation

The supplied review reports validation_pending in RED001 and TWK002 while the canonical reconState enum permits pending, in-progress and complete. Inspect the current files and contract before treating this as a live defect.

AHA-DEC-006 remains unresolved. Recommended disposition: keep the enum and represent validation pending as in-progress plus an explicit validation blocker and next action. The alternative is a formal state-machine extension with its downstream changes. The coding agent must not choose, silently normalize accounts or extend the enum. A decision must identify evidence, owner and permitted edits before adoption.

## 3 Scope and authorities

Build Portfolio Health and Debtor Workspace. Discover every `analysis/debtors/*/project.json` dynamically. Use the existing validator and D17 implementation. If those functions are not reusable, extract them into a shared module with parity checks rather than implement independent copies.

Read existing project state, registry, tasks, skills, reports, raw/data artifact references and git history. No new domain database is introduced. Disposable read caches are allowed and must expose their source version.

Only two RUN operations exist:

| Operation | Behaviour | Permitted effects |
|---|---|---|
| portfolio.validate | Run the existing portfolio contract checks | Append invocation record; return issues |
| portfolio.refresh | Validate and regenerate the existing projection only if hard checks pass | Update approved derived projections and freshness metadata; append invocation record |

The application must expose no general command, arbitrary script or skill invocation endpoint.

## 4 Portfolio Health

The header displays discovered account count, valid/invalid/warning counts, D17 collections-blocked count and the projection's baseline. Human task counts are displayed only when the existing format can be parsed reliably; otherwise show unavailable.

Use this projection-status precedence: BLOCKED when hard validation errors prevent refresh; otherwise NOT_GENERATED when no projection exists; otherwise STALE when inputs differ from the successful generation baseline or freshness cannot be established; otherwise CURRENT. When blocked, also display whether an older projection exists and its age. Freshness and refresh eligibility must both remain visible.

CURRENT must be based on input content/version coverage, not file modification times alone. A successful refresh records a source manifest or uses an existing equivalent: included account files plus relevant validator, schema, registry and other actual generator dependencies. Such metadata describes generation, not financial truth. If an old projection has no reliable baseline, show freshness unknown and explain the limitation.

Validation issues expose debtor, source path, field/path, rule, expected and actual value/type, severity and explanation. Malformed JSON or missing required fields must still produce an account error row; one bad account must not crash the portfolio read.

ERROR, WARNING and COLLECTIONS_BLOCKED remain separate. D17 restrictions are not schema failures. Multiple issues are counted separately from invalid accounts so totals cannot be misread.

The table displays debtor code, client, reconState, workflow status, outstanding, 180+ debt, ingest state, open blockers, explicit next action and schema health. Include a distinct collections eligibility indicator. Missing/null amounts are unknown, never zero.

## 5 Debtor Workspace

Render current position, source/as-at dates, reconState, workflow, schema health, ingest freshness/coverage, D17 gate reasons, blockers, next action, authoritative lane and relevant worker references.

If ingestGate is absent, show Not yet assessed. If a required gate cannot be evaluated because input is invalid, show Not evaluated with the reason. Never interpret absence or an error as PASS.

Use the existing D17 decision. Link active blocker source and evidence when available. Resolved blockers appear in history rather than the active count. Show a lane only where declared or derived under explicit existing doctrine; otherwise Not classified. Worker references are contextual information in this slice.

Next action display priority is: hard validation issue, applicable collections failure, explicit collections.nextAction, relevant existing human task, doctrine-supported lane action, then no action recorded. Derived guidance must be labeled and must not overwrite the recorded nextAction.

Link only existing artifacts: project.json, onboarding, statement, allocation/reconciliation reports, turn brief/manifest, evidence and tasks. Artifact access must be restricted to allowed repository roots, preserve access control and reject path traversal and symlink escape.

## 6 Drift since the successful projection

Compare current inputs with the successful generation snapshot. Git history is usable only when it identifies that baseline; the latest commit mentioning the dashboard is not automatically the generation source.

Show accounts added/removed, reconState/workflow changes, balances, next action, blockers opened/resolved/removed and lane changes when available. Use existing stable blocker IDs; where absent, label comparison uncertainty rather than invent authoritative identity. Removal is not proof of resolution.

If the baseline cannot be reconstructed, state this explicitly. After the first successful refresh, reliable snapshot comparison must be available. This is operational change visibility, not historical accounting reconstruction.

## 7 Refresh and audit

Refresh runs under one operation lock for shared projections. Validate the captured source set, then check it has not changed before publishing. On changed inputs, stop with a conflict or rerun validation; do not publish against an obsolete validation result. Failed/blocked refresh leaves the prior projection intact.

Operations append one terminal JSON object to the existing approved debtor audit location, provisionally `analysis/debtors/audit/invocations.jsonl`. Record operation ID, actor, timestamps with timezone, scope, status and summary. Status distinguishes succeeded, failed, blocked and conflict. Validation may succeed as an operation while reporting invalid accounts; refresh must then be blocked.

Existing lines are never rewritten. Serialize appends. If audit persistence is unavailable before a RUN, fail closed rather than perform an unrecorded write. Unexpected termination must not be reported as success. The runtime increment adds a start record and recovery contract separately.

## 8 Acceptance

- [ ] New debtor files appear without frontend changes; removed accounts disappear from current discovery and appear in drift where a baseline exists.
- [ ] Malformed and schema-invalid projects remain visible with exact errors.
- [ ] Portfolio counts distinguish account counts from issue counts.
- [ ] Recon, workflow, schema, ingest and D17 eligibility are visibly independent.
- [ ] Unknown amounts and absent ingest/gate evidence cannot render as zero or PASS.
- [ ] Existing validator and D17 decisions match console results on representative valid, invalid and blocked fixtures.
- [ ] Hard failures block refresh and preserve the previous projection.
- [ ] A source change during refresh cannot produce a falsely current projection.
- [ ] Successful refresh records a usable baseline; subsequent field changes show accurate drift.
- [ ] Old projections without recoverable baselines show the stated limitation.
- [ ] Every completed RUN attempt appends an attributable outcome record, including failures and blocked attempts.
- [ ] Workspace links resolve only existing authorized artifacts.
- [ ] HUMAN actions have view links and no Execute or Mark completed control.
- [ ] No ERP write, customer send, ratification, agent runtime or arbitrary command endpoint exists.

## 9 Definition of done and delivery gate

The operator can answer: how many accounts exist, whether projection freshness is established, which accounts fail and why, which are collections-blocked, what evidence and actions exist, what changed, and whether refresh can run safely.

Before release, resolve AHA-DEC-006, confirm source authorities and identify actor/access control. Repository parity and safety checks are required; the account counts and historical examples in the discussion are not fixed acceptance values.
