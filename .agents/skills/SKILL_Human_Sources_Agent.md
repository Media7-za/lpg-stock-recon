---
name: human-sources-agent
description: >
  Human intake / operator role for the Debtors slice. Use when gathering remittance
  PDFs, ERP TXT exports, global aged-debt reports, deposit screenshots, or client
  ledgers and placing them in the correct raw/ folders for worker parsing.
---

# Human Sources Agent

You are the **Sources Agent** — a **human** operator who **acquires evidence** and lands it in the repo. You gather; Cursor workers parse. You do **not** manually transcribe remittance tables or post ERP journals.

## 1. Authoritative documents

| Document | Purpose |
| :--- | :--- |
| `analysis/debtors/shared/HUMAN_TASKS.md` | Your task queue (`Role: Sources Agent`) |
| `analysis/debtors/shared/docs/LANE_1_INPUT_INGESTION.md` | Ingest expectations |
| Account `raw/` folder | Where files must land |
| `.agents/skills/SKILL_Debtors_Orchestrator.md` | Triggers worker dispatch after intake |

## 2. Source types and drop locations

| Source | Destination | Naming convention |
| :--- | :--- | :--- |
| Remittance advice PDFs | `analysis/debtors/{CODE}/raw/Remittances/` | `DD.MM.YYYY.pdf` (match TWK002 pattern) |
| Debtor account TXT | `analysis/debtors/{CODE}/raw/{CODE}{YEAR}.TXT` | ERP export label in header |
| Global aged-debt TXT | `analysis/debtors/Global Reports/` | `DDMMYYYYHMM.TXT` (ERP export timestamp) |
| Deposit screenshots | `analysis/debtors/{CODE}/raw/` | Descriptive filename + date |
| Client ledger / statement | `analysis/debtors/{CODE}/raw/` | PDF or CSV from customer |

## 3. What you do

| Action | Trigger after upload |
| :--- | :--- |
| Request remittances from client AP | Orchestrator dispatches settlement-discount worker |
| Pull debtor TXT from ERP | Worker ingest / balance verification turn |
| Export global aged-debt report | `npm run debtors:parse-backlog` then `npm run debtors:sync` |
| Upload deposit evidence | Worker variance / over-post investigation |

## 4. What you do NOT do

- Parse PDF tables into CSV by hand (use `parse_remittance_pdfs.mjs` via worker)
- Post journals or correct payments (ERP Agent)
- Send collection messages (Collections Agent)
- Edit `project.json` or reconciliation reports (workers + PM)

## 5. Operational loop

1. Open `HUMAN_TASKS.md` — work **OPEN** rows with `Role: Sources Agent`.
2. Acquire file from ERP, client, or bank portal.
3. Save to correct path; verify filename matches existing convention in that account folder.
4. Mark task **DONE** in `HUMAN_TASKS.md`.
5. Notify orchestrator: *"TWK002 remittance 26.06.2024.pdf uploaded"* — worker ingests on next turn.

**Global report workflow:**

```bash
# After placing new TXT in Global Reports/
npm run debtors:parse-backlog
npm run debtors:sync
```

## 6. Paired ERP export rule (mandatory for debtor recon)

A sync session is **not complete** until all three artifacts exist for the **same ERP session / date range / same day**:

| Artifact | Feed | Destination |
| :--- | :--- | :--- |
| Debtor **statement TXT** | Document manifest + running balance | `analysis/debtors/{CODE}/raw/` |
| **DTRX** header export | `transaction_headers` | DataHub → Supabase |
| **CURRENT / STTR** items export | `transaction_items` / line detail | DataHub → Supabase |

Optional: operator manifest with paths + `exportBatchId` (see `analysis/debtors/shared/docs/INGEST_GATE_SCHEMA_STAGED.md`).

**Do not** mark intake DONE on DTRX alone. After upload, run:

```bash
npm run debtors:ingest-check -- --debtor {CODE}
npm run debtors:tag-check -- --debtor {CODE}
```

Intake is complete only when coverage is `CURRENT_COMPLETE` or exceptions are ratified in `config/ingest_exceptions.json`.

### 6.1 The statement TXT must include allocation detail

When exporting the debtor statement from ERP DEBENQ, **allocation detail must be included**. An export taken with the option off writes this line into the file header:

```text
"EXCLUDE:","ALLOCATION DETAIL"
```

That single line means the `INVNO` column is blank on every row, so no payment or credit note names the invoice it settles. The balance and ageing still work, but **no open-invoice list, statement of account, or payment allocation can be derived from that file at all** — and nothing downstream can compensate for tagging that was never exported.

`debtors:tag-check` reports `UNUSABLE_EXPORT / EXPORT_LACKS_ALLOCATION_DETAIL` when this happens. The only fix is to re-export. At the 2026-08-11 portfolio sweep, 8 of 10 debtor exports had this defect, so check it every time rather than assuming.

Quick check on any TXT you drop:

```bash
grep 'ALLOCATION DETAIL' analysis/debtors/{CODE}/raw/{FILE}.TXT   # must return nothing
```

## 7. Quality checklist (before marking DONE)

- [ ] File opens and is readable (not corrupt PDF)
- [ ] Correct debtor code folder
- [ ] Date in filename matches document date where possible
- [ ] No duplicate filename unless intentional variant `(1)`, `(2)`
- [ ] For TXT: header shows expected account code and export period
- [ ] **For TXT: header does NOT contain `EXCLUDE: ALLOCATION DETAIL`** (see §6.1 — re-export if it does)
- [ ] **DTRX headers + ITEMS exports uploaded same session as statement TXT**
- [ ] **`debtors:ingest-check` run; coverage report saved under `reports/`**
- [ ] **`debtors:tag-check` run; not `UNUSABLE_EXPORT`**

## 8. Handoff chain

```text
Sources Agent uploads raw file
  → Orchestrator dispatches worker (lane-specific)
  → Worker produces CSVs / reports / checklist
  → ERP Agent or Collections Agent queue opens
```

## 9. Task completion template

```text
Task: H-007
Account: TWK002
Uploaded: raw/TWK0022024.TXT (export 2026-07-13)
Global: [yes/no]
Ready for: worker balance verification turn
```
