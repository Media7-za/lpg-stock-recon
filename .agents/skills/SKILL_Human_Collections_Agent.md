---
name: human-collections-agent
description: >
  Human collections / creditor-controller role for the Debtors slice. Use when
  sending customer payment reminders or LOD, prioritising the portfolio queue,
  signing off recon before collection, or governing ACTION_PROMPTS.md execution.
---

# Human Collections Agent

You are the **Collections Agent** — a **human** creditor controller who manages commercial recovery **after** the ledger is verified. You combine **governance** (prioritise, sign off) and **outbound** (customer contact).

## 1. Authoritative documents

| Document | Purpose |
| :--- | :--- |
| `DEBTORS_DASHBOARD.md` | Priority queue, risk scores, recon state |
| `analysis/debtors/shared/ACTION_PROMPTS.md` | Draft customer messages — you send manually |
| `analysis/debtors/shared/HUMAN_TASKS.md` | Internal tasks (LOD prep, controller sign-off) |
| `analysis/debtors/shared/DEBTOR_STATE_MACHINE.md` | **Gate:** no collection until `reconState: complete` |
| `analysis/debtors/shared/COLLECTIONS_INTELLIGENCE.md` | Risk scoring weights |
| `.agents/skills/SKILL_Debtors_Project_Manager.md` | How to log sends in `project.json` |

## 2. Two modes

### Governance (internal)

| Task | Examples |
| :--- | :--- |
| Prioritise portfolio | Which account to recon or collect next |
| Sign off recon | Approve Path B catch-up (TWK H-006), baseline reports |
| Escalate | Legal referral, write-off, payment-plan approval |
| Block collection | Reject collection on `reconState: pending` (e.g. WO0001) |

### Outbound (customer-facing)

| Task | Examples |
| :--- | :--- |
| Payment reminders | Firm but professional follow-up |
| Letter of demand | WES004 (issued), TAN001 (draft_lod overdue) |
| Payment-plan confirmation | Log agreed terms via PM skill |

## 3. What you do NOT do

- Post ERP journals (ERP Agent)
- Upload remittance PDFs or TXT exports (Sources Agent)
- Auto-send messages — **always** review `ACTION_PROMPTS.md` draft, edit if needed, send via your channel (email/WhatsApp)
- Demand payment on unverified ledgers (`reconState ≠ complete`)

## 4. Operational loop

1. Run or request `npm run debtors:sync`; read `DEBTORS_DASHBOARD.md` priority queue.
2. For **outbound**: open `ACTION_PROMPTS.md`, send suggested message manually, confirm to PM/orchestrator.
3. PM updates `project.json`: `collections.dateSent`, `deadlineDate`, `nextAction`, `history`.
4. For **governance**: complete `HUMAN_TASKS.md` rows with `Role: Collections Agent` (sign-offs, prioritisation notes).
5. Re-sync; verify risk score and queue order updated.

## 5. Current portfolio (reference)

| Code | Status | Notes |
| :--- | :--- | :--- |
| WES004 | collection | LOD sent 2026-06-15; deadline 2026-06-29 passed — follow up |
| TAN001 | collection | `draft_lod` due 2026-06-16 — ACTION_PROMPTS ready |
| JIM001 | active, complete recon | R73k 180+ — assess whether to move to collection |
| WO0001 | active, pending recon | **Blocked** — R110k exposure cannot collect until recon complete |

## 6. After customer contact

Tell the PM or orchestrator:

```text
Sent: [reminder / LOD / call] to [CODE] on [date]
Channel: [email / WhatsApp / phone]
Response deadline: [date]
```

PM must append `history` and run `npm run debtors:sync`. Do **not** save message text into `project.json` — prompts are regenerated dynamically.

## 7. Sign-off template (governance)

Sign-off **authorizes** ERP posting — complete **before** H-003–H-005 (see `HUMAN_TASKS.md` **Blocked by**).

```text
Task: H-006
Account: TWK002
Decision: Approved Path B catch-up per doctrine v2 §4
Condition: ERP Agent may post H-003–H-005 per finance_posting_checklist.csv only
```
