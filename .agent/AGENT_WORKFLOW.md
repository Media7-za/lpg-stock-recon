# Agent Workflow

## Purpose

This document defines the agent-first debtor workflow for the Debtor Position Workspace.

The React/Vite PWA is the review and control surface. It must not become the reconciliation engine. Reconciliation, classification, evidence synthesis, statement generation, and exception handling remain agent-owned workflows that emit structured state for the UI to display.

## Core Principle

Agent produces structured debtor state → UI displays it → user reviews or approves → agent performs the next controlled action.

## Debtor Lifecycle

1. **Ingest**
   - Load debtor source data, ERP extracts, generated reports, statements, and custody evidence.
   - Preserve original files and source references.

2. **Reconcile**
   - Calculate financial position.
   - Calculate custody position.
   - Compare generated debtor state against known baseline and statement outputs.

3. **Classify**
   - Classify invoices, payments, credits, reversals, deposits, custody movements, and exceptions.
   - Preserve split allocations and multi-row evidence.

4. **Generate**
   - Generate internal statement view.
   - Generate customer-safe statement view.
   - Generate or update baseline report.
   - Generate allocation evidence where applicable.

5. **Review**
   - Present structured debtor position to the user.
   - Surface reconciliation blocks, allocation evidence, exceptions, and file outputs.

6. **Approve**
   - User confirms whether debtor output is review-ready, customer-ready, sent, disputed, or requires follow-up.

7. **Send / Export**
   - Produce final customer-safe output only after review state permits it.

8. **Follow Up**
   - Track disputes, unresolved allocation items, custody variances, and next action requirements.

## Review States

- `draft`
- `review_required`
- `reviewed`
- `customer_ready`
- `sent`
- `follow_up_required`
- `disputed`
- `blocked`

## Agent Responsibilities

The agent owns:

- Evidence interpretation
- Allocation logic
- Exception classification
- Statement generation orchestration
- Baseline generation orchestration
- Audit trail creation
- Final structured state emission

## UI Responsibilities

The UI owns:

- Displaying debtor state
- Surfacing evidence and exceptions
- Providing controlled action buttons
- Showing internal/customer output previews
- Capturing review state transitions

## Non-Goals

The UI must not independently infer reconciliation results, allocation status, or customer-safe visibility. It consumes agent-emitted state and invokes allowed actions.
