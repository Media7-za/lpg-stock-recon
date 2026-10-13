# Skill update drafts (2026-10-13) — for operator review, NOT APPLIED

Status: APPLIED 2026-10-13 (blocks 2 to 5; block 1 superseded by the family skills). Originally a draft; nothing in `.agents/skills/` had been edited when written. These implement the rules ratified on 2026-10-13: D20 (payer-family release rule) and D21 (ERP export intake) in `DEBTORS_DOCTRINE.md`, and ALLOCATION_DOCTRINE section 6 (price-differential credit, double-credit test). Say "apply" and I will paste each block verbatim, as appended sections (no existing text changed or deleted).

**Design choice.** I did not create a new `SKILL_ERP_Export_Intake.md`. The repo already has the right homes: `SKILL_Human_Sources_Agent.md` (intake, section 6 "Paired ERP export rule"), `SKILL_Human_ERP_Agent.md` (who exports) and the orchestrator's "ERP freshness gate". A fourth document would duplicate them. If you prefer a standalone skill, the same text in blocks 3 and 4 can be moved.

## Block 1 (SUPERSEDED 2026-10-13 by the new `SKILL_Family_Statement_Refresh.md` and `SKILL_Family_Rulings_And_Holds.md`; do not apply): `SKILL_Debtor_Statement_v5_From_TXT.md` — append after "Config fields" (before "Layout produced")

```markdown
### Payer family (consolidated) statements — DEBTORS_DOCTRINE D20

For a parent account whose receipts are posted across child accounts (TWK AGRI: TWK002 + TWK003 + TWK004), add to the parent's `statement_v5.json`:

| Field | Role |
| :--- | :--- |
| `payerGroup.children[]` | `{ code, txtPath }` for each child; each child has its own `statement_v5.json`, projection and matches |
| `remittanceDocAliases`, `namedResiduals`, `rowNotes` | Optional evidence/display config (config only, no account names in code) |
| `consolidatedFamily: true` and `customerLayout: open_items` in `statement_of_account.json` | Selects the family statement |
| `familyReleaseHolds[]` in `statement_of_account.json` | Open operator decisions; while any entry is listed the output stays a DRAFT PREVIEW |

Build each member first (dated TXT, ingest check, `reconcile_debtor_v5_from_txt.mjs`, `match_projection.mjs`), then `generate_statement_of_account.mjs --debtor <PARENT>`. The generator aborts unless every member ties to its ERP header, every projection fingerprint matches its TXT, there are no lock conflicts, and the family total equals the sum of the members' ERP balances. Any review-only member or open hold gives `..._Consolidated_DRAFT_PREVIEW.md`; `--snapshot` and `--pdf` are refused for a draft. Release is only via the generator plus `npm run debtors:tag-check`. Clearing a hold is the operator's act, recorded with the ruling.
```

## Block 2: `SKILL_Debtors_Orchestrator.md`

(a) Append to "### 7. Failure modes observed" table:

```markdown
| Relayed status taken as fact | A pasted or forwarded report describes locks, files or commits that are not on the remote branch (a divergent cloud-agent branch did this on 2026-10-10). Verify against `git` and the remote before acting. |
| Stale or undated export | A TXT without its export date in the file name, or whose header disagrees with its own running balance, treated as current (D21). |
| Premature family release | A consolidated statement released while a member is review-only or an operator hold is open (D20). |
```

(b) Append to "### 8. Sequencing doctrine":

```markdown
6. Fan-out is for independent, read-only work. One orchestrator plan step ("pick one account") still holds for finance-dependent lanes; but independent accounts may be built in parallel by scoped subagents (one account or file group each). Brief each with: the exact files, connector-sourced replay only, **no locks / approvals / period closes**, no edits to `analysis/debtors/shared`, no commits. The main session verifies each result, then commits. Shared-code changes (generators, matcher) go on their own branch and wait until agents that run those scripts have finished.
7. Payer families (D20): reconcile every member to its own ERP header first; only then build the family view. Evidence reports come before rulings; rulings come before locks.
```

## Block 3: `SKILL_Human_Sources_Agent.md` — append as new "### 6.2 Dated, verified statement exports (DEBTORS_DOCTRINE D21)"

```markdown
### 6.2 Dated, verified statement exports (DEBTORS_DOCTRINE D21)

- **Name:** `analysis/debtors/{CODE}/raw/{CODE}_{YYYY-MM-DD}.TXT` (creditors under `analysis/creditors/{CODE}/raw/`). Child accounts of a payer family may live in the parent's `raw/` until they have their own folder. An undated file is never treated as current.
- **Report:** same DEBENQ report as the previous export (same window start, header block, running balance column, allocation detail excluded). Export all requested accounts in one sitting and record the export date and time in the task comment.
- **Verify before filing** (worker or Sources Agent): every running balance = previous balance + amount; the last balance = header CURRENT BALANCE = TOTAL TRANSACTIONS line; if the header has a UD figure, header minus last balance = that figure exactly. Anything else is returned to the ERP Agent, not filed.
- **Large files:** the Drive connector escapes `#`, `_`, `~`, `*`; remove those backslashes. For files too big to display, decode the connector's saved JSON output mechanically (jq/sed), never retype, then re-run the check.
- **Hand-off:** comment on the Linear task with each account's balance, row count and last transaction date; mark DONE only when every file is filed and verified.
```

## Block 4: `SKILL_Human_ERP_Agent.md` — append to "## 4. Operational loop" as step 7 and to "## 7. Task completion template"

```markdown
7. For an export task: use the same DEBENQ report as the previous export, name each file `{CODE}_{YYYY-MM-DD}.TXT`, export all accounts in one sitting, and note the export time. If an account named in the request does not exist (as FAM001 did), say so in the task comment instead of exporting. Do not change ERP data without an operator ruling.
```

```text
Task: ADM-96
Files: BU0005_2026-10-10.TXT ... (13), exported 2026-10-10 hh:mm
Not exported: FAM001 (no such account)
Open questions for the operator: none
```

## Block 5: `SKILL_Payment_To_Invoice_Allocation.md` — append (links to ALLOCATION_DOCTRINE section 6)

```markdown
### Deposit credit notes (ALLOCATION_DOCTRINE section 6)

- A price-only difference between an invoice and a credit note on one delivery is carried as a customer credit (negative balance), not a cash overpayment; correction or refund is an operator ruling.
- Before calling a cylinder credit note a double credit, decompose the cash deposit into whole cylinders per SKU from DB line quantities and compare the credit note with its own delivery invoice. Same value with a different SKU mix is not a reversal.
```

## Not drafted (code, separate decision)
Committing the export-verification script (`check_erp_export.mjs`, today a temp helper) and making `debtors:tag-check` family-aware.
