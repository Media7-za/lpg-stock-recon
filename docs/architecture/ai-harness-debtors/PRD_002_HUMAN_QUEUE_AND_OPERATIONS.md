> Repository staging status: **PROPOSED — NOT RATIFIED**. This discussion snapshot does not supersede `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. Read DEVELOPMENT_HANDOFF.md for the adoption gates.

# Debtors Human Queue and Operations PRD

**ID:** AHA-PRD-002  
**Version:** 1.0.0  
**Date:** 2026-10-03  
**Increment:** Slice 2  
**Status:** Proposed implementation specification  
**Dependency:** [PRD 001](PRD_001_DEBTORS_PORTFOLIO_HEALTH.md) operational  
**Doctrine:** [AHA-DOC-001](AI_HARNESS_ARCHITECTURE_DOCTRINE.md), AHA-D03, AHA-D04, AHA-D14, AHA-D15 and AHA-D19

## 1 Outcome and scope

The operator can see existing human work, inspect its evidence and record completion through the authoritative task artifact. Selected deterministic debtor operations are available through business actions. Slice 2 does not start agent turns or scratchpad execution.

Build Human Queue and Operations views linked to the debtor workspace. Keep HUMAN_TASKS.md authoritative. The queue is a regenerated view; a completion checkbox is not a separate task-state store.

## 2 Task round-trip

Inspect the current HUMAN_TASKS.md format and its readers before implementing the writer. Confirm stable task IDs, legal statuses, required evidence, prerequisites and completion metadata. Do not invent a new Markdown structure that existing tools cannot read. If the format lacks necessary fields, propose a minimal explicit format change before enabling the operation.

The completion command carries task ID, authenticated actor, observed source hash/version, evidence references and completion note. The service rereads the file, checks the version, validates dependencies and evidence, applies the smallest supported task-block edit and validates the updated file. Write atomically and preserve unrelated content.

Return conflict on a stale version; do not merge concurrent edits by guessing. Record before/after hashes and an attributable audit outcome. Reload the queue from the saved artifact. A failed write leaves the task open in the UI. Prevent partial success from appearing as completion.

Task completion means the defined human action has been evidenced. It does not automatically ratify a financial assumption, change reconState or prove an ERP posting. Those effects require their own existing governed pathway.

## 3 Deterministic operations

Candidate operations from the discussion are reconciliation status generation, statement generation and backlog refresh. Their exact command, scope and outputs require repository inspection and approved registration before any button is enabled.

For every enabled operation declare: capability ID, pinned implementation, applicability, required inputs/gates, account scope, permitted outputs, timeout, retry behaviour and validation. Resolve from existing registration where possible; avoid a duplicate capability catalog.

Business actions show their purpose, prerequisites and effects. Missing prerequisites display a reason. Customer statement generation requires current existing financial and collections/presentation gates; do not assume that every internal statement has the same send eligibility. Generating an artifact never authorizes sending it.

Arguments use a structured allow-list. Neither a task description nor a browser request can supply an arbitrary executable or shell command. Report and evidence links follow the Slice 1 access boundary.

## 4 Safety and recovery

Use resource locks for operations that publish the same artifacts, source-version checks before publication, atomic replacement for derived files, attributable actor identity and append-only outcomes. Preserve the previous output on failure. Where a process may outlive the request, retain enough execution metadata to recover an uncertain result before retrying.

Human actions retain Create/view task, View evidence and the governed completion action where supported. ERP posting, customer contact and ratification have no software Execute button.

## 5 Acceptance

- [ ] Existing task IDs, statuses, evidence and dependencies render from HUMAN_TASKS.md.
- [ ] Completion modifies the authoritative file in its established supported format.
- [ ] Unrelated Markdown and other task blocks remain unchanged.
- [ ] Missing completion evidence or unmet prerequisites prevent completion with a precise reason.
- [ ] Concurrent file edits return conflict and preserve both users' existing content.
- [ ] A failed write cannot leave a locally completed task in the UI.
- [ ] Before/after hashes, actor, evidence and outcome are auditable.
- [ ] Only explicitly approved deterministic operations are runnable.
- [ ] Gates and generated artifacts match the existing implementations.
- [ ] Unsupported commands, out-of-scope paths and stale-source publication are rejected.
- [ ] Task completion and statement generation cannot mutate debtor state, post ERP or send messages.

## 6 Pre-implementation decisions

Confirm the current task write-back format, task completion authority, mandatory evidence and supported dependencies. Approve the specific deterministic allow-list after implementation inspection. The package proposes this round-trip; it does not claim the writer or operations already exist.
