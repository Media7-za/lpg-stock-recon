# Session Prompts — Index

Entry point for all agent sessions on the LPG Stock Recon project.
Each role has its own dedicated doc in `docs/roles/`.
Each pipeline has its own doc in `docs/Pipelines/`.

---

## Execution Environment

All agent sessions run in **Cursor or Claude Code** with direct access to the
local repository. No cloning required.

```bash
cd /path/to/lpg-stock-recon
claude
```

---

## Claude.ai Session Starter (when NOT using Cursor/Claude Code)

Use this when running an agent session in the Claude.ai browser interface.
The repo is not on disk — a clone is needed to read governance docs.

See `docs/handoffs/Session_Starter.md` for the full setup guide.

Quick version:
```
Before starting any task, clone the repo:
git clone https://[PAT]@github.com/Media7-za/lpg-stock-recon.git /home/claude/lpg-stock-recon
cd /home/claude/lpg-stock-recon

Then read docs/session_prompts.md for the relevant role starter.
```

Generate a PAT at: github.com → Settings → Developer settings →
Personal access tokens → Contents: Read only → Expiry: 1 day
Paste it in place of [PAT]. Rotate it after the session.

---

## Which Pipeline Do I Need?

| Situation | Pipeline |
|---|---|
| Something is broken | `docs/Pipelines/feature_pipeline.md` (bug path) |
| Something new needs to be built | `docs/Pipelines/feature_pipeline.md` |
| Financial reconciliation issue | `docs/Pipelines/financial_control_pipeline.md` |
| Data integrity problem | DATA-INTEGRITY-AGENT (below) |
| Recurring operational problem | RCA-AGENT (below) |

---

## Feature Pipeline — Quick Start

```
Feature: LSR-{NUMBER} — {one line description}
Read docs/Pipelines/feature_pipeline.md then begin Phase 1 (Exploration).
```

Phase 1 (Exploration): EXPLORATION-ARCHITECT → DOMAIN-PRD-AGENT →
ARCHITECT-AGENT → SCHEMA-AGENT* → UX-DESIGN-AGENT* → PM Gate

Phase 2 (Build): CODING-AGENT → CODE-REVIEWER → REGRESSION-DETECTOR →
QA-AUDITOR → PM deploys

*optional — only if schema/UI changes required

---

## Financial Control Pipeline — Quick Start

```
Task: LSR-{NUMBER} — {one line description}
Read docs/Pipelines/financial_control_pipeline.md then begin.
```

---

## RCA Session — Quick Start

```
Role: RCA-AGENT

Read docs/handoffs/rca-template.md for the report format.

System constants:
- Repo: Media7-za/lpg-stock-recon
- RCA template: docs/handoffs/rca-template.md
- Jira: project LSR

When ready, ask me:
1. What is the recurring operational problem?
2. How long has it been happening?
3. What has been tried before?

Facilitate Phase 1 (5 Whys), Phase 2 (Three Layers), Phase 3 (Countermeasure Routing).
Do not write the report until all three phases are complete.
Ask one question at a time.
```

---

## Role Session Starters

### EXPLORATION-ARCHITECT
```
Feature: LSR-{NUMBER} — {description}
Read docs/roles/exploration_architect.md and follow it.
```

### DOMAIN-PRD-AGENT
```
Feature: LSR-{NUMBER} — {name}
Read docs/roles/domain_prd_agent.md and follow it.
```

### ARCHITECT-AGENT
```
Feature: LSR-{NUMBER} — {name}
Read docs/roles/architect_agent.md and follow it.
```

### SCHEMA-AGENT
```
Feature: LSR-{NUMBER} — {name}
Read docs/roles/schema_agent.md and follow it.
```

### UX-DESIGN-AGENT
```
Feature: LSR-{NUMBER} — {name}
Read docs/roles/ux_design_agent.md and follow it.
```

### TICKET-ARCHITECT
```
Task: LSR-{NUMBER}
Read docs/roles/ticket_architect.md and follow it.
The Phase 1 report is in LSR-{NUMBER} Jira comments.
```

### CODING-AGENT
```
Task: LSR-{NUMBER} — Phase 2: Implement
Read docs/roles/coding_agent.md.
The spec is in LSR-{NUMBER} Jira comments.
Branch: feature/LSR-{NUMBER} or fix/LSR-{NUMBER}
```

### CODE-REVIEWER
```
Code Review: LSR-{NUMBER} | Branch: feature/LSR-{NUMBER}
Read docs/roles/code_reviewer.md then review the branch diff cold.
The spec is in LSR-{NUMBER} Jira comments.
```

### REGRESSION-DETECTOR
```
Regression check: LSR-{NUMBER} | Branch: feature/LSR-{NUMBER}
Read docs/roles/regression_detector.md and follow it.
```

### QA-AUDITOR
```
QA: LSR-{NUMBER}
Read docs/roles/qa_auditor.md and follow it.
```

### ANOMALY-INVESTIGATOR
```
Task: LSR-{NUMBER} — {description}
Read docs/roles/anomaly_investigator.md and follow it.
```

### FINANCIAL-VALIDATOR
```
Task: LSR-{NUMBER} — {description}
Read docs/roles/financial_validator.md and follow it.
```

### DATA-INTEGRITY-AGENT
```
Read docs/roles/data_integrity_agent.md and follow it.
No repo access needed — queries run via Supabase SQL Editor.
Supabase project ref: movixifclapeprdemgwk (eu-west-2)
```

### ALLOCATION-WORKER (invoice-linked debtors — WO0001 family)
```
Role: ALLOCATION-WORKER

Read .agents/skills/SKILL_Allocation_Worker.md and follow §0 (session starter).
Replace [DEBTOR_CODE], turn, and pilot dates before starting.

Mandatory skill chain:
1. .agents/skills/SKILL_Allocation_Worker.md
2. .agents/skills/SKILL_Payment_To_Invoice_Allocation.md
3. analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md

NOT for JIM001 (monthly batch) or TWK002 (settlement discount).
Account-specific: BU0005 → SKILL_BU0005_Allocation_Worker.md instead.
```

### SESSION-CLOSER
```
Role: SESSION-CLOSER
Produce the session handoff doc.
Save to docs/handoffs/YYYY-MM-DD.md
```

---

## Full Role Library

| Role | Doc | Pipeline | Job |
|---|---|---|---|
| EXPLORATION-ARCHITECT | `roles/exploration_architect.md` | Feature | Frame + bound the slice |
| DOMAIN-PRD-AGENT | `roles/domain_prd_agent.md` | Feature | Business rules + acceptance criteria |
| ARCHITECT-AGENT | `roles/architect_agent.md` | Feature | Implementation structure |
| SCHEMA-AGENT | `roles/schema_agent.md` | Feature | Schema changes + migration plan |
| UX-DESIGN-AGENT | `roles/ux_design_agent.md` | Feature | UX flow + component spec |
| TICKET-ARCHITECT | `roles/ticket_architect.md` | Both | Implementation spec |
| CODING-AGENT | `roles/coding_agent.md` | Both | Implement on branch |
| CODE-REVIEWER | `roles/code_reviewer.md` | Both | Cold review of branch diff |
| REGRESSION-DETECTOR | `roles/regression_detector.md` | Both | Check for regressions |
| QA-AUDITOR | `roles/qa_auditor.md` | Both | Audit codebase quality |
| ANOMALY-INVESTIGATOR | `roles/anomaly_investigator.md` | Financial | Investigate data anomalies |
| FINANCIAL-VALIDATOR | `roles/financial_validator.md` | Financial | Validate reconciliation results |
| DATA-INTEGRITY-AGENT | `roles/data_integrity_agent.md` | Ops | Audit live database |
| ALLOCATION-WORKER | `.agents/skills/SKILL_Allocation_Worker.md` | Debtors | Payment→invoice graph for ref_no-linked payers |

---

## Starting a New PM Session

Read the latest handoff first:

```bash
ls docs/handoffs/*.md | sort | tail -1 | xargs cat
```

Then check open Jira backlog:
- Jira project: LSR
- Live app: https://lpg-stock-recon.vercel.app
