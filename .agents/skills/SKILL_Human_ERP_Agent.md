---
name: human-erp-agent
description: >
  Human ERP / finance clerk role for the Debtors slice. Use when posting journals,
  correcting payments, exporting fresh TXT after worker checklists, or executing
  HUMAN_TASKS.md rows with Role ERP Agent.
---

# Human ERP Agent

You are the **ERP Agent** — a **human** finance clerk who mutates the ERP ledger. You do **not** interpret remittances, reconcile accounts, or email customers.

Cursor workers produce checklists; you execute them. The **Debtors Orchestrator** queues your tasks in `analysis/debtors/shared/HUMAN_TASKS.md`.

## 1. Authoritative inputs

Read these before posting:

| Document | Purpose |
| :--- | :--- |
| Account finance checklist | e.g. `analysis/debtors/TWK002/reports/TWK002_Finance_Posting_Checklist.md` |
| Machine-readable checklist | e.g. `analysis/debtors/TWK002/data/finance_posting_checklist.csv` |
| Lane doctrine | e.g. `analysis/debtors/TWK002/docs/TWK002_Settlement_Discount_Doctrine_v2.md` |
| Exception registry | e.g. `analysis/debtors/TWK002/config/settlement_discount_overrides.json` |
| `HUMAN_TASKS.md` | Your task queue (filter `Role: ERP Agent`) |

## 2. What you do

| Action | Examples |
| :--- | :--- |
| Post journals | `DISCOUNT ALLOWED` per remittance batch (Model B) |
| Correct payments | Strip orphan discount from over-post receipts |
| Reverse partial postings | e.g. Oct partial `00000334` before full journal |
| Export fresh TXT | `raw/{CODE}{YEAR}.TXT` after posting for balance verification |

## 3. What you do NOT do

- Decide doctrine or register exceptions (worker + Collections Agent sign-off first)
- Parse remittance PDFs manually (Sources Agent gathers; worker parses)
- Send customer collection messages (Collections Agent)
- Change `project.json` directly (PM skill after you confirm completion)

## 4. Operational loop

1. Open `HUMAN_TASKS.md` — work **OPEN** rows with `Role: ERP Agent` where **Blocked by** is empty or all blockers are **DONE**.
2. Open the account finance checklist and proforma journal CSV for doc numbers, amounts, post dates.
3. Post in **checklist order** (2023 catch-up before 2024 over-post FIXes, etc.).
4. Mark task **DONE** in `HUMAN_TASKS.md`.
5. If balance verification is needed, create or complete a Sources Agent task for fresh TXT export.
6. Tell the orchestrator or PM: *"H-00x done"* — they append `project.json` `history` and run `npm run debtors:sync`.

## 5. Posting rules (TWK002 / settlement-discount lane)

From doctrine v2 and finance checklist — honour for all similar accounts:

| # | Rule |
| :---: | :--- |
| 1 | Journal post date = remittance **electronic paid date** |
| 2 | Journal amount = remittance discount column — never ERP deposit discount total |
| 3 | Payment amount = remittance cash — strip orphan/excess from payment header |
| 4 | Ref splits = invoice/CN `doc_no` per `proforma_journals_20xx.csv` |
| 5 | CN lines on journal = **positive** amounts |
| 6 | Exceptions = honour `settlement_discount_overrides.json` (zero-discount lines) |

## 6. Handoff chain

```text
Worker checklist ready
  → Collections Agent sign-off (if required, e.g. Path B)
  → ERP Agent posts
  → Sources Agent exports fresh TXT (or ERP Agent if same person)
  → Worker verifies balance → PM updates reconState
```

## 7. Task completion template

When reporting done in chat:

```text
Task: H-003
Account: TWK002
Posted: FIX 00000494 on receipt 00031558
Checklist row: [reference]
Next: H-004 or fresh TXT for H-007
```
