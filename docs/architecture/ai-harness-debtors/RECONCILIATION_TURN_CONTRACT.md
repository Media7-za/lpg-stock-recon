> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# Debtor Reconciliation Turn Contract

**ID:** AHA-CON-001  
**Version:** 1.0.0  
**Date:** 2026-10-03  
**Status:** Proposed technical contract; validate against existing turn artifacts before adoption  
**Implements:** [AHA-DOC-001](AI_HARNESS_ARCHITECTURE_DOCTRINE.md) and [PRD 003](PRD_003_BOUNDED_RECONCILIATION_RUNTIME.md)

The contract makes one reconciliation turn bounded, reproducible and reviewable. It specifies required information and enforcement behaviour; it does not declare new authoritative business state. Reuse existing turn brief/manifest formats where they already provide these guarantees.

## 1 Record locations and ownership

Proposed artifact set under an account-scoped unique turn directory:

| Artifact | Purpose | Writer |
|---|---|---|
| turn_request.json | Objective, snapshot, policy and budget | Control layer before execution |
| findings.json | Structured claims, proof and proposals | Worker, validated before acceptance |
| turn_manifest.json | Final methods, inputs, outputs and outcome | Control layer from actual execution |
| summary.md | Operator-readable result with evidence links | Worker/control layer |
| scratch/ | Exploratory scripts supporting the result | Worker inside isolated turn workspace |
| outputs/ | Staged datasets/reports | Bounded methods |

Candidate location is `analysis/debtors/{CODE}/turns/{turnId}/`. Confirm existing repository conventions before using it. No files from prior turns are silently replaced. Normal account data/reports are publication targets rather than unconstrained worker write directories.

## 2 Required invocation fields

| Field | Requirement |
|---|---|
| schemaVersion | Explicit contract version |
| turnId, attemptId, idempotencyKey | Stable request identity plus distinct execution attempt |
| debtorCode | Account resolved from the workspace and checked against scope |
| actor | Attributable authenticated initiator; no fabricated operator ID |
| requestedAt | ISO 8601 with timezone |
| objective | Business question and measurable completion criteria |
| focusLayer | Proposed proof layer or explicit cross-layer question |
| repositorySnapshot | Git commit if known, dirty-worktree indicator and content hashes for actual inputs |
| evidence | File references, hashes, roles, account/period/as-at where established |
| instructions | Accepted doctrine/skills/config references with versions or hashes |
| priorFindings | Compatible previous finding references; explicit stale qualifiers |
| permissions | Approved read roots, staged write roots, executables and external capabilities |
| budget | Enforced duration, tool calls and model/token/spend ceiling where applicable |
| stopConditions | Missing/conflicting evidence, relevant defects, permission violations and source change handling |

If commit/version metadata is unavailable, record it as unknown and use content hashes. Do not manufacture a commit ID. Current source content is the basis for proof; a git commit alone does not cover uncommitted evidence.

## 3 Execution envelope

The control layer fixes account scope and permissions before the worker starts. The model cannot enlarge them. Resolve paths inside allowed roots and reject traversal, symlink escape and alternate account writes. Raw evidence is read-only. Network and credential access are denied unless an explicitly approved capability requires them.

Scripts run in an isolated environment with only needed input copies or read-only mounts and a staged output directory. Use runtime enforcement for filesystem and process limits. Scratch code is not executed with the control service's unrestricted credentials. Timeouts and cancellation terminate child processes and preserve completed evidence.

Execution permission is separate from publication permission. After execution, validate staged files, confirm source hashes and acquire the target publication lock. Publish only the approved derived outputs atomically or as a validated coherent output set. If inputs changed, preserve results for the captured snapshot and return conflict for current publication.

Unknown method dependencies, unrecorded runtime requirements or relevant known defects prevent the method from being treated as an accepted production capability. Investigation can proceed only within the remaining explicit permissions.

## 4 Method provenance

Every actual method execution records a method ID/path, class, version or content hash, applicability basis, input references, structured arguments, outcome, output references, verification result and known defect references. Record the actual executed code, including a scratch script whose findings are retained.

Allowed classes are LOCKED_SHARED, ACCOUNT_SPECIFIC and SESSION_SCRATCHPAD. Configuration hashes are included separately from script hashes. Persist return codes and useful logs as execution evidence where appropriate; successful exit is not semantic verification.

Do not log secrets or unnecessary raw customer payloads. Record observable decisions and evidence, not hidden model reasoning.

## 5 Findings and proof

Required result fields are schemaVersion, turnId, attemptId, objective, executionStatus, findings, methods, artifacts, unresolvedItems, proposedChanges, nextTurnRecommendation and limitations.

Each finding includes:

- finding ID, layer and exact claim;
- proofStatus: NOT_ASSESSED, PARTIAL, PROVEN or DISPUTED;
- freshness: CURRENT, STALE or UNKNOWN relative to its declared as-at/basis;
- evidence references and hashes;
- verification method and result;
- assumptions, unresolved items and effects on dependent claims;
- whether it supersedes or invalidates a previous finding.

These labels are proposed derived result vocabulary. They do not extend reconState or D17 statuses. Schema health and ingest requirements remain independently evaluated.

Financial outputs record currency, source period, signed integer minor units or an exact decimal representation, and the domain's rounding/tolerance policy. The default target is zero unexplained cents; a nonzero acceptance tolerance must be explicitly supported by doctrine and reported. Do not use binary float comparisons as the proof policy.

For composition, retain component membership or source-line references, classification rules, exclusions and a check that components are mutually exclusive on the declared accounting basis. Compare the reconstruction to the ERP anchor. Report semantic classification checks separately from the arithmetic check.

For allocations, record payment, trading document and evidence links, amounts, evidence strength, remaining balances and uncertain alternatives. Preserve a pool-level proof separately from document-level allocations. For custody, record physical quantity evidence separately from financial CYL values.

## 6 State proposals

A proposed authoritative change is a payload for the governed updater, not a patch applied by the worker. It contains proposal ID, target path/field, expected old value, proposed new value, source snapshot/hash, supporting finding IDs, required gates, required decision authority and reason.

The updater rereads current state and evidence, validates policy and schema, checks the expected source version and applies only the authorized change. A changed source yields conflict and reassessment. Approval references must be real recorded decisions; the worker cannot create its own approval reference.

NextTurnRecommendation is guidance. It does not overwrite collections.nextAction or create a task. If a human task is needed, return a draft through the approved task service. Runtime-generated draft text has no task authority until that write succeeds.

## 7 Audit lifecycle

Slice 1 retains one terminal JSONL record per completed RUN attempt. The runtime extends this with append-only lifecycle records using the same audit source or an existing compatible audit location. This is execution audit, not event-sourced debtor state.

Runtime record types are started and completed. Both share invocationId/turnId and attemptId. A completed record has one terminal status: succeeded, partial, failed, blocked, cancelled, interrupted or conflict. The recovery service closes orphan starts with an interrupted outcome when the attempt is no longer active. It must not duplicate a terminal record on retry.

Required fields include schemaVersion, recordType, timestamp, invocationId, attemptId, actor, debtorCode, operation, sourceSnapshotRef and summary. Completion adds status, startedAt, completedAt and resultManifestRef where available. Times are persisted with timezone; render in Africa/Johannesburg. Serialize line appends and preserve prior lines.

The request, audit start and manifest use consistent IDs. Persist the start before launching execution. If start persistence fails, do not run. If completion logging fails after execution, retain the final manifest and mark audit pending; recover the record before reporting the operation as fully recorded or retrying effects.

Example completion record, with deliberately illustrative IDs and actor:

```json
{
  "schemaVersion": "1.0.0",
  "recordType": "completed",
  "timestamp": "2026-10-03T21:30:00+02:00",
  "invocationId": "illustrative-turn-id",
  "attemptId": "illustrative-attempt-id",
  "actor": "illustrative-authenticated-actor",
  "debtorCode": "EXAMPLE",
  "operation": "reconciliation.turn",
  "status": "partial",
  "startedAt": "2026-10-03T21:25:00+02:00",
  "completedAt": "2026-10-03T21:30:00+02:00",
  "sourceSnapshotRef": "turn_request.json",
  "resultManifestRef": "turn_manifest.json",
  "summary": "ERP arithmetic reconstructed; category classification remains unresolved"
}
```

## 8 Recovery and idempotency

An idempotency key identifies the intended account/objective/snapshot request, not every tool call. Return the known turn when the same request is submitted twice. Repeated intentional work on changed inputs uses a new request identity and links the previous turn.

Acquire the account/output resource lock for affected shared publications. Lock ownership includes attempt ID and an expiry/recovery mechanism; a second worker cannot publish merely because a lease expired while the first remains active. Validate ownership and source version at publication.

After interruption, inspect the request, audit records, process state, manifest and staged outputs before resuming or retrying. Preserve uncertain outcomes. Do not rerun side effects just because the browser timed out. Externally consequential effects remain out of scope for this increment.

## 9 Operator result template

The summary states the account, objective and source as-at; execution outcome; proof established; proof still missing; monetary bridge or residue where relevant; methods grouped by class; generated artifacts; assumptions and defects; actual publication outcome; proposed state changes; and the next bounded question.

State whether authoritative state changed using the observed governed-write result. For this worker contract the result will normally be none; do not infer a mutation from a recommendation or a generated report.

## 10 Adoption checks

- Existing turn formats are reused or explicitly amended.
- Actual script dependencies, output paths and skill versions are verified.
- Runtime boundaries are enforced beyond prompts.
- Financial arithmetic and semantic checks are both represented.
- Provenance survives cancellation, retry and source change.
- Derived labels do not create new authoritative statuses.
- Governed proposals cannot bypass version checks or approvals.
- Existing logs remain intact and Slice 1 consumers tolerate the additional record types before the runtime writes them.

This contract becomes implementation-ready only when its proposed fields, execution environment and repository compatibility are adopted explicitly.
