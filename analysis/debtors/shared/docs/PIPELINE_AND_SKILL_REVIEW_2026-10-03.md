# Pipeline and Skill Review: CAP000 session, 2026-10-03

**Status:** PROPOSED, NOT RATIFIED. Skill proposals need operator approval before any file is added under `.agents/skills/`.
**Scope:** what the CAP000 session actually ran, how it maps to the existing lanes and skills, what went wrong, and which skills the work supports.
**Companion:** `SCRIPT_REGISTRY.md` (per-script annotations and defects D-1 to D-5).

## 1. What was run, in order

| # | Stage | What happened | Maps to | Artifact |
| :-- | :--- | :--- | :--- | :--- |
| 1 | Intake | DEBENQ TXT for CAP000 (and DON001) placed in `raw/`; B/F chain verified, balance R70,773.28 | Lane 1 | `raw/CAP000.TXT`, `project.json` |
| 2 | Statements | v5 and customer-facing statements generated with `--force` (tag coverage `NOT_DERIVABLE_FROM_TXT`) | Lane 4, SKILL_Debtor_Statement_v5 / Customer_Statement | `reports/CAP000_Statement_*.md` |
| 3 | Recon scaffolding | invoices.csv, allocation_edges.csv, payments.csv built from the TXT; new settlement profiles registered; status generated | Lane 3, build_reconciliation_status (PDP-46) | `data/*.csv`, `reports/reconciliation_status.csv` |
| 4 | Gap analysis | 0 of 8 payments matched by heuristic; options A/B/C written | Lane 3 | `CAP000_Allocation_Gap_Analysis.md` |
| 5 | Branch triage | dazzling-brown landed as canonical; the side branch (Track B) harvested as PROPOSED | governance (§7) | `CAP000_Track_B_Harvest_2026-10-03.md` |
| 6 | Evidence discovery | Remittance folder found on Google Drive; 3 of 8 payments matched by filename and amount (ASSERTED) | Human Sources role | `raw/Remittances/CAP000_REMITTANCE_MAPPING.md` |
| 7 | Remittance ingest | operator uploaded files to a branch; 3 printouts parsed, each netted to its ERP payment; edges written; status re-run | Lane 3, SKILL_Payment_To_Invoice_Allocation (remittance tier) | `config/remittance_allocations.json`, `data/allocation_edges.csv` |
| 8 | Export | whole reconciliation put on one Google Sheet via CSV upload; read back to verify | Lane 4 | Google Sheet "CAP000 Reconciliation Workbook" |

Result: balance PROVEN; 7 in-window invoices PROVEN at tier 1; R51,321.29 of R184,013.63 payments remittance-linked; R132,692.34 across 5 payments still unallocated; `reconState` pending.

## 2. Workflow patterns that worked

1. **Config-driven evidence, generated edges.** Operator judgement lives in `config/remittance_allocations.json`; the edges CSV is regenerated, never hand-edited (AGENTS §5). The ingest refuses a remittance that does not net to the ERP payment.
2. **Verify-before-claim on every external artifact.** The Sheet was read back after upload; the generator was proven with `--check`; the sheet CSV was diffed against what was uploaded.
3. **Fail-loud profiles.** The status script's refusal to guess an unknown settlement mechanism forced an explicit, documented profile for CAP000.
4. **Canonical story plus bounded harvest.** One branch becomes the story; the other is mined for named findings (H-029, H-030) staged PROPOSED. This avoided inventing allocation closure.
5. **Operator in the loop for file transfer.** The Drive connector cannot save binaries to disk; a GitHub web upload to a branch was the clean path.

## 3. What went wrong (negative results to keep)

| Error | Found by | Fix | Lesson |
| :--- | :--- | :--- | :--- |
| Payment total misstated as R182,213.63 (true R184,013.63) | another session's row-sum | superseded in history | Sum from the CSV, never from prose. |
| Remittance "parser" was a stub that printed a message, reported as progress | review of the turn | S-03 written and tested | Do not describe an unrun parser as a step. |
| Status script reported 0 orphaned payments because `payments.csv` was missing | an unexpected count of 0 against 5 unallocated rows | added payments.csv | A zero from a reconciliation tool needs a cross-check. Defect D-2 still open. |
| Payment rows inside invoices.csv collided with invoice 42697 | a negative invoice amount in the output | removed payment rows | Different document types can share numbers. D-3 open. |
| CYL classification never fired (wrong column) | reading the generator while committing it | documented, not yet changed | Committing a script is a review. D-1 open, with a material impact on the 129-invoice headline. |
| Built a throwaway-output command that overwrote data, then stashed it | immediate `git status` | stash dropped, tree clean | Never run a writing mode to "inspect". Use a dry-run flag. |
| Compared the CAP000 ingest with TWK002's only after writing it | listing the repo | overlap recorded as D-4 | Search for an existing script before writing a new one. |

## 4. Gaps between this session and the repo's existing skills

- `SKILL_Payment_To_Invoice_Allocation.md` covers ERP ref-link payers and says to use a different skill for batch payers. It has no path for "remittance exists for some payments only", which is the CAP000 case.
- `SKILL_Debtor_Statement_v5_From_TXT.md` assumes `DATABASE_URL` for the LPG/CYL split. CAP000 had no DB rows; the CYL split fell back to a text heuristic that did not work (D-1). The skill does not say what to do then.
- There is no skill for DEBENQ-only onboarding, for Drive evidence discovery, or for exporting a recon to a Sheet. `export_workspace_to_sheets.py` exists but needs `DATABASE_URL` and a different workbook shape.

## 5. Skills that can be built (PROPOSED)

| Priority | Proposed skill | Built from | What it would contain | Depends on |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `debenq-only-account-onboarding` | steps 1-4 | Preconditions (B/F chain tie), S-02, profile choice, which gates are `NOT_DERIVABLE`, expected "pending" end state, the verify steps from section 2 | Fix D-1 and D-2 first, or the skill teaches a wrong headline |
| 2 | `remittance-evidence-ingest` | steps 6-7 | Drive discovery queries, filename-amount triage (ASSERTED only), S-03 dump, writing `remittance_allocations.json`, net-to-payment check, adjustment and CN-offset handling, status re-run. Generalise S-04 to `shared/` and fold TWK002's PDF flow in | D-4 |
| 3 | `recon-to-google-sheet` | step 8 | CSV-with-formulas pattern, why Drive upload converts, read-back verification, connector limits (no Sheets editor means no formatting), when to prefer the existing xlsx exporter | none |
| 4 | `canonical-branch-harvest` | step 5 | Choosing a canonical story, harvesting a side branch as PROPOSED, the "balance proven is not allocation proven" test, handoff routing | none |
| 5 | Update to `session_closer` | whole session | A line requiring the script registry to be updated when a session commits or retires a script | none |

Not proposed as skills: the one-off CAP000 open items (H-011a/b, H-029, H-030). They belong on `HUMAN_TASKS.md`.

## 6. Decisions needed from the operator

1. **D-1:** switch S-02 to classify CYL from the customer reference and regenerate? It would change CAP000 from 129 to about 72 LPG invoices and re-state the gap counts.
2. **Skills:** approve which of the five above to write, and whether skill 1 waits for D-1 and D-2.
3. **D-4:** move the config-driven remittance ingest to `shared/` and retire the hardcoded TWK002 version?
4. **Sheet:** the workbook is unformatted and has no tabs. Enable the Google Sheets connector, or accept the single-sheet form?
