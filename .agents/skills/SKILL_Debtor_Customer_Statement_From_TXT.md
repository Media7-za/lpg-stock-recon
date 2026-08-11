---
name: debtor-customer-statement-from-txt
description: >-
  Generate a customer-facing Statement of Account (opening balance,
  Current/30/60/90/120-day ageing, open invoices, optional PDF) for any
  debtor directly from ERP DEBENQ TXT exports — no DATABASE_URL required.
  Use when the operator asks for a customer statement, open-invoice list,
  or collections letter, as opposed to an internal v4/v5 sub-ledger recon.
  First built for TWK002 (TWK AGRI PTY LTD); generalised for reuse.
---

# Debtor Customer Statement (from TXT)

Produces the document a customer actually receives: business header,
account reference, opening balance, ageing buckets, open invoice table, and
a payment-remittance line. Pure TXT parsing — safe to run without
Supabase/`DATABASE_URL`.

**Not** the internal LPG/CYL sub-ledger recon — use
`SKILL_Debtor_Statement_v5_From_TXT.md` (or v4) for that. Run v5 first if you
need an ERP-variance-gated internal position; run this skill for the
external-facing document.

---

## 0. Session starter (paste this to open a new account / session)

```text
Role: CUSTOMER-STATEMENT-WORKER

Read and follow: .agents/skills/SKILL_Debtor_Customer_Statement_From_TXT.md

debtorCode: [DEBTOR_CODE]
customerName: [TRADING NAME FROM TXT HEADER]
asAt: [YYYY-MM-DD]                 # statement date, defaults to today
siteCodes: [comma-separated linked ERP site codes, or none]

Mandatory reads (in order):
1. analysis/debtors/[DEBTOR_CODE]/reports/[DEBTOR_CODE]_Onboarding_Status.md (if it exists)
2. analysis/debtors/[DEBTOR_CODE]/raw/DEBENQ_[DEBTOR_CODE].TXT (or operator-supplied TXT path)
3. analysis/debtors/shared/templates/statement_of_account_config.template.json

Steps:
1. If config missing, copy the template into
   analysis/debtors/[DEBTOR_CODE]/config/statement_of_account.json and fill
   in customerName / referenceLabel / referenceValue / primaryTxt / siteTxts.
2. Run the invoice-tag coverage gate FIRST:
   npm run debtors:tag-check -- --debtor [DEBTOR_CODE] --write
   Stop and report if it is UNUSABLE_EXPORT or BLOCKED (see §3.1). Do not
   work around it.
3. Run: npm run debtors:customer-statement -- --debtor [DEBTOR_CODE] --as-at [YYYY-MM-DD] --pdf
4. Sanity-check: Balance due printed to console must equal the ERP
   CURRENT BALANCE header (+ any linked site balances) in the TXT.
5. Hand back the .md and .pdf paths under reports/, and state the gate result
   so the operator knows whether the open-invoice table is customer-ready.

Do not commit unless the operator asks.
```

---

## 1. Prerequisites

1. Fresh `raw/DEBENQ_[CODE].TXT` **exported with allocation detail** — invoice
   / CN / payment rows must carry a populated `INVNO` column. If the file
   header contains `"EXCLUDE:","ALLOCATION DETAIL"` the export is unusable for
   this skill and must be re-pulled from ERP (`SKILL_Human_Sources_Agent.md`
   §6.1); at the 2026-08-11 sweep most exports in the repo had this defect, so
   verify rather than assume. If the customer has linked ERP site codes sharing
   a bank payment (e.g. one payment posted across multiple account codes),
   refresh those TXTs too — needed only for their `CURRENT BALANCE` header, not
   invoice-level detail.
2. `analysis/debtors/[CODE]/config/statement_of_account.json` — copy from
   `analysis/debtors/shared/templates/statement_of_account_config.template.json`
   and fill in:
   - `customerName`, `referenceLabel` / `referenceValue` (leave `referenceValue`
     empty to omit the reference line entirely)
   - `businessHeader` (letterhead lines — usually the same across accounts,
     copy from an existing config)
   - `primaryTxt` — path to the account's DEBENQ TXT
   - `siteTxts` — `{ "SITE_CODE": "path/to/DEBENQ_SITE.TXT" }` map, or `{}`
   - `outputDir` / `outputBaseName` — usually `analysis/debtors/[CODE]/reports`
     and `[CODE]_Statement_of_Account`
   - `pdfStylesheet` — reuse `analysis/debtors/shared/templates/statement_pdf.css`
     unless the account needs its own styling

## 2. Run

```bash
npm run debtors:customer-statement -- --debtor [CODE] --as-at YYYY-MM-DD --pdf
```

- `--as-at` (optional): statement date, defaults to today. Drives ageing and
  the "opening balance (1 <Month>)" line.
- `--pdf`: also renders `[CODE]_Statement_of_Account.pdf` via `md-to-pdf`
  using the configured stylesheet.

Outputs:
- `reports/[CODE]_Statement_of_Account.md`
- `reports/[CODE]_Statement_of_Account.pdf` (with `--pdf`)

## 3. Method (for verification / edits)

1. **Open invoices** — per invoice document: `Invoice` amount + any
   `Crd Note` / `Payment` / `Journal` rows tagged with that invoice's
   `INVNO`. Only invoices with a positive remaining balance are listed.
   This is a **reconstruction, not ground truth** — see §3.1.
2. **Site roll-up** — any linked site codes' `CURRENT BALANCE` headers are
   added to the primary account's as flat adjustment lines (credit/cleared,
   not itemised — only use this when a shared bank payment splits across
   ERP codes for one commercial customer).
3. **Ageing** — invoice date → `--as-at`, bucketed Current/30/60/90/120 days.
   The gap between Σ(open invoice due) and the reconciled **Balance due**
   (account-level journals with no invoice ref) is folded into the
   **120-day** bucket so the row always ties to the total.
4. **Opening balance** — ERP running balance as of the last TXT row
   strictly before the 1st of the statement month; "movement this month" is
   the difference to the current balance (invoices + payments + journals
   combined, not broken out by type).

## 3.1 Invoice-tag coverage gate (mandatory before release)

Only the ERP `CURRENT BALANCE` header is ground truth for what an account owes.
The open-invoice table is reconstructed from ERP's `INVNO` tagging, and that
tagging is unreliable — a payment posted with a blank `INVNO` still reduces the
balance correctly but names no invoice, so an already-paid invoice keeps showing
as open indefinitely. TWK002 billed a customer for invoices 42468 / 42470 for 15
months after they were paid because of exactly this.

```bash
npm run debtors:tag-check -- --debtor [CODE] --write   # writes reports/[CODE]_TAG_COVERAGE_[date].{json,md}
npm run debtors:tag-check:all                          # portfolio sweep
```

| Gate | Meaning | Action |
| :--- | :--- | :--- |
| `ALLOWED` | List ties within the ERP balance, no marooned invoices | Release |
| `REVIEW_REQUIRED` | An invoice is marooned behind a long payment gap and may be settled | Check it against the remittance advices covering the gap, then ratify or keep |
| `BLOCKED` | The list over-states the account, or bills an invoice a remittance says is paid | **Do not release.** Reconcile, then ratify into `closedInvoiceOverrides` |
| `UNUSABLE_EXPORT` | Export has no allocation detail — no invoice-level claim is derivable | **Do not release.** Re-export from ERP (Sources Agent) |

`generate_statement_of_account.mjs` runs this gate itself and **refuses to
write** on `BLOCKED` / `UNUSABLE_EXPORT`. `--force` exists for a recorded
operator decision; using it to make an inconvenient gate go away is how a
customer gets billed twice.

**Ratifying a settled invoice.** Confirm the remittance batch reconciles
(remittance cash = ERP payment total for that receipt), then add it to
`closedInvoiceOverrides` in `config/statement_of_account.json` with the evidence
reference:

```json
"closedInvoiceOverrides": [
  { "doc": "42468", "reason": "Paid via STAT 114 / BATCH-2025-05-31 remittance (31.05.2025.pdf), receipt 00039080. ERP never tagged the settling payment slice to this invno." }
]
```

Never hand-edit a generated statement — the next run resurrects the error.
Rule: `analysis/debtors/shared/docs/business_rules.md` §15.

## 4. Scripts

| Script | Role |
| :--- | :--- |
| `analysis/debtors/shared/scripts/generate_statement_of_account.mjs` | Statement generator — debtor-agnostic, no DB dependency, safe to re-run whenever a fresh DEBENQ export lands |
| `analysis/debtors/shared/scripts/debenq_open_invoices.mjs` | Shared open-invoice model + risk analysis. Single source of truth, so the gate always scores the exact list the statement prints |
| `analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs` | Gate CLI + portfolio sweep |
| `analysis/debtors/shared/scripts/debenq_open_invoices.test.mjs` | Contract tests (`npm run debtors:test`), including the TWK002 regression fixture |

Reference implementation / config: TWK002.

## 5. Related skills

| Skill | When |
| :--- | :--- |
| `SKILL_Debtor_Statement_v5_From_TXT.md` | Internal LPG/CYL sub-ledger recon with ERP-variance gates |
| `SKILL_Debtor_Statement_v4_From_TXT.md` | Legacy combined-ledger internal statement |
| `SKILL_Human_Sources_Agent.md` | Getting a fresh DEBENQ TXT export into `raw/` |
| `SKILL_Debtors_Project_Manager.md` | `project.json` / `npm run debtors:sync` after balance changes |
