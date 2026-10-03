# Debtors Script Registry (annotated)

**Status:** staged by a worker session, 2026-10-03. Scope: scripts and tools used in the CAP000 allocation and
workbook session. It is not yet a registry of every script in `analysis/debtors/shared/scripts/`; add rows as sessions use them.
**Evidence tags** follow DEBTORS_DOCTRINE §6: PROVEN (reproduced and cited), ASSERTED (read, not reproduced), ASSUMED.
**Rule:** a script that writes a data file must regenerate it identically from a clean checkout. `--check` or a diff
is the proof. If a script cannot, record it under Retired or Defects, not under Active.

## 1. Active, committed

| ID | Path | Run as | Reads | Writes | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| S-01 | `shared/scripts/build_reconciliation_status.mjs` | `npm run debtors:reconciliation-status -- --debtor CODE` | `data/invoices.csv`, `data/allocation_edges.csv`, `data/payments.csv` | `reports/reconciliation_status.csv` | PDP-46 8-step engine. Fails loud on an unknown allocation_type vocabulary. This session added profiles `UNALLOCATED_DEBENQ_ONLY` and `REMITTANCE_PARTIAL_COVERAGE` (CAP000 precedent). See D-2. |
| S-02 | `shared/scripts/debenq_to_data_csvs.mjs` | `node ... --debtor CODE [--check] [--classify-cyl]` | `raw/CODE.TXT` | `data/invoices.csv`, `data/payments.csv` | Builds one row per document for DEBENQ-only accounts. `--check` diffs against committed files (PROVEN: CAP000 matches). Amounts, VAT split, qty and stock_code are ASSUMED. See D-1. |
| S-03 | `shared/scripts/remittance_xlsx_dump.py` | `python3 ... file.xlsx [...] > dump.json` | customer remittance `.xlsx` | stdout JSON | Read-only extraction of Capitol-style "Accounts Payable Allocations" printouts, with a recomputed net. Makes no mapping decisions. Needs `openpyxl`. |
| S-04 | `CAP000/scripts/remittance_allocation_ingest.mjs` | `node analysis/debtors/CAP000/scripts/remittance_allocation_ingest.mjs` | `raw/CAP000.TXT`, `config/remittance_allocations.json` | `data/allocation_edges.csv` | Config-driven. Throws if a remittance does not net to the ERP payment (R113.75 `remittanceAdjustment` is declared in config, not hidden). Payments with no config entry become `UNALLOCATED`. Overlaps S-05 (see D-4). |
| S-05 | `TWK002/scripts/remittance_allocation_ingest.mjs` | `npm run debtors:twk002-allocation-ingest` | TWK002 remittance data (hardcoded) | TWK002 edges | Read this session, not run. The precedent S-04 should have been compared with first. |
| S-06 | `CAP000/scripts/build_sheet_csv.py` | `python3 ... --out file.csv` | TXT, edges, status CSV, remittance config | one CSV (429 rows) | Account-specific (open items, month range, remittance filenames hardcoded). Summary, payment status and monthly roll-forward are formulas. Output was uploaded through Drive and read back: variance 0.00, 19 monthly differences 0 (PROVEN). The script emits the single stacked sheet. The live Sheet was then split into 7 tabs (Summary, Payments, Monthly, Open items, Edges, Recon status, Ledger) with cut-and-paste and formatted through the Sheets connector; that step is not scripted, so regenerating the CSV does not reproduce the tabbed Sheet. Defect D-6 fixed 2026-10-03. |
| S-07 | `shared/scripts/generate_statement_of_account.mjs` | `npm run debtors:customer-statement -- --debtor CODE [--force]` | TXT, config | `reports/CODE_Statement_*.md` | Run earlier this session (per the session summary) with `--force` because tag coverage is `NOT_DERIVABLE_FROM_TXT`. Not re-run in the stretch covered here. |
| S-08 | `shared/scripts/debenq_open_invoices.mjs` | module import | n/a | n/a | Exports `parseCsvLine` (used by S-02) and the open-invoice model. Read, with its header doctrine: ERP payment tagging is not authoritative. |

## 2. Retired scratch scripts (not committed, kept here so the lesson survives)

| Script | Why retired |
| :--- | :--- |
| `generate_cap000_invoices.mjs` | Replaced by S-02. It wrote the 8 payment rows into `invoices.csv`, which merged payment 42697 with invoice 42697 (invoice shown at -R5,941.32). Fixed 2026-10-03, commit `147b4d5`. |
| `generate_cap000_allocations(_v2).mjs` | Replaced by S-04. The first version matched nothing because it parsed quoted CSV fields wrongly. |
| `match_cap000_payments.mjs` | Exact-sum, contiguous-run and proximity matching: 0 of 8. Valid negative result for the in-window invoices. It did not look at invoices from before the ledger window, which is where most of the first remittance's lines sit. |
| `parse_remittances.mjs` / `.py` | Stubs. They printed a message and parsed nothing. An earlier turn described this as progress; it was not. S-03 is the working replacement. |
| `build_xlsx.py` | Built a formatted workbook. Abandoned: Drive uploads carry the whole file in the tool call (57 KB of base64). Replaced by the CSV route in S-06. |

## 3. External tools used

| Tool | Use | Limits met |
| :--- | :--- | :--- |
| Google Drive connector: `search_files`, `download_file_content`, `read_file_content`, `create_file` | Found the CAP000 Remittances folder, created the workbook (CSV converts to a Sheet), read it back to verify | `download_file_content` returns xlsx as base64 into context and cannot save to disk. `create_file` reports `fileSize: 1` for a converted sheet while the content is intact. Formatting and tabs need the Sheets connector, which was not available. |
| `openpyxl` (pip) | Reading `.xlsx` | none |
| LibreOffice `soffice --headless` | Attempted formula recalculation | Failed to load any file in this container, including a trivial one. Not usable here. |
| `git` | Branching, merge to main, commits | n/a |

## 4. Known defects and open questions

| ID | Where | Defect | Tag | Impact | Suggested fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| D-1 | S-02 default | Classification tested the REFERENCE column (the customer name), so no document was ever CYL. `--classify-cyl` tests CUSTOMER/BANK REF. | PROVEN | CAP000: 57 of 129 "invoices" and 55 credit notes are EMPTY/deposit documents. The status script counts them as LPG invoices, so "129 invoices / 100 genuine gaps" is overstated; about 72 are LPG. The regex also misses the misspelling "MPTY" (docs 48004 and one credit note), so 57 is a lower bound (ASSERTED). | Operator decision: switch the default, regenerate `invoices.csv`, re-run S-01 together, refresh the Sheet. Not done here because it changes headline figures already reported. |
| D-2 | S-01 | When `data/payments.csv` is absent it reports "orphaned payments: 0" with no warning. | PROVEN (reproduced) | Silent undercount of unallocated cash. | Fail loud or warn when payments.csv is missing. |
| D-3 | S-01 | Documents are keyed by doc number alone, so a payment and an invoice sharing a number collide. | PROVEN (CAP000 42697) | Worked around in data (S-02 keeps payments out of invoices.csv). | Key on doc type and number. |
| D-4 | S-04 vs S-05 | Two remittance ingest scripts: TWK002 hardcoded, CAP000 config-driven with a net-to-payment check. | ASSERTED | Divergent behaviour and tolerances (TWK002 TOL 0.05, CAP000 0.005). | Move the config-driven form to `shared/` and retire hardcoding. |
| D-5 | S-04 config | Mapping of printout "CN 42146" R1,380 to ERP credit note 12245 is inferred from amount and date. | ASSERTED | Edge tagged Medium, `review_required`. | Confirm with Capitol. |

| D-6 | S-06 | The "sum of open invoices" note summed the Gross column (D) instead of Open (F), showing R419,914.21 instead of R387,308.21. | PROVEN | Wrong figure on the Open items tab for a short time. | Fixed in the script and in the live Sheet (cell C8, Open items). |

## 5. Tripwires

- Any change to S-01 profiles or S-02 classification reopens the CAP000 figures in `reports/reconciliation_status.csv`, the Sheet, and `project.json` history.
- A remittance arriving for any of the 5 unallocated CAP000 payments reopens H-011: add it to `config/remittance_allocations.json`, run S-04, then S-01.
