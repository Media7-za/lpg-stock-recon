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
   Stop and report if it is NOT_DERIVABLE_FROM_TXT or BLOCKED (see §3.1). Do
   not work around it, and do not ask for a re-export to escape it.
3. Run: npm run debtors:customer-statement -- --debtor [DEBTOR_CODE] --as-at [YYYY-MM-DD] --pdf
4. Sanity-check: Balance due printed to console must equal the ERP
   CURRENT BALANCE header (+ any linked site balances) in the TXT.
5. Hand back the .md and .pdf paths under reports/, and state the gate result
   so the operator knows whether the open-invoice table is customer-ready.

Do not commit unless the operator asks.
```

---

## 1. Prerequisites

1. Fresh `raw/DEBENQ_[CODE].TXT` carrying a populated `INVNO` column on invoice
   / CN / payment rows. If the header contains `"EXCLUDE:","ALLOCATION DETAIL"`
   this skill cannot run on that file — but note that is the deliberate default
   posture, not a defect, because the omitted column is ERP's untrustworthy
   payment allocation (`business_rules.md` §3). At the 2026-08-11 sweep 8 of 10
   exports were in that state, so verify rather than assume. **The answer is not
   automatically a re-export:** an account in that state needs its invoice-level
   view built through the allocation lane
   (`SKILL_Payment_To_Invoice_Allocation.md`), and even a re-exported TXT only
   restores Crd Note tagging — its payment tags carry no authority either way.
   Escalate the choice to the operator (`H-016` is the standing instance of this
   decision). If the customer has linked ERP site codes sharing
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
3. **Ageing** — invoice date → `--as-at`, bucketed Current/30/60/90/120+ days on
   **open invoices only**. The aged subtotal equals Σ open invoice Due.
4. **Account-level balance** — the gap between Balance due and Σ open invoices,
   shown explicitly (not hidden in 120-day). Ratified lines live in
   `balanceBridgeLines` in config; regenerate via account-specific bridge script
   (TWK002: `scripts/build_balance_bridge.mjs --write`). Site adjustments from
   `siteTxts` are appended automatically when not already in config.
5. **Opening balance** — ERP running balance as of the last TXT row
   strictly before the 1st of the statement month; "movement this month" is
   the difference to the current balance (invoices + payments + journals
   combined, not broken out by type).

## 3.1 Invoice-tag coverage gate (mandatory before release)

Only the ERP `CURRENT BALANCE` header is ground truth for what an account owes.
The open-invoice table is reconstructed from ERP's `INVNO` tagging, and payment
tagging is not trustworthy (`business_rules.md` §3) — a payment posted with a
blank or wrong `INVNO` still reduces the balance correctly but names no invoice,
so an already-paid invoice keeps showing as open indefinitely. TWK002 billed a
customer for invoices 42468 / 42470 for 15 months because of exactly this, and
it was the customer's remittance advice that caught it, not the ledger.

So this table is a **screening hypothesis**. Where the account has remittance
advices, they are the authority — the gate reads them, and where they contradict
the reconstruction the advice wins.

**Most accounts have no advices** (they exist for 3), so the gate reports an
evidence basis alongside the verdict. `PATTERN_ONLY` means the
remittance-contradiction check did not run and the result rests on the invariant
plus a staleness heuristic. Neither can catch a settled invoice whose credit was
untagged *and* whose omission does not break the account total, so on those
accounts an `ALLOWED` is a genuinely weaker statement. Say which basis applied
when you hand the statement back — the operator needs it to decide whether to
send the itemised table or only the balance. Establishing settlement without an
advice follows `business_rules.md` §15 authority order B.

```bash
npm run debtors:tag-check -- --debtor [CODE] --write   # writes reports/[CODE]_TAG_COVERAGE_[date].{json,md}
npm run debtors:tag-check:all                          # portfolio sweep
```

| Gate | Meaning | Action |
| :--- | :--- | :--- |
| `ALLOWED` | No contradiction found: list ties within the ERP balance, no marooned invoices | Release — but this is absence of evidence against the list, not verification. Report the evidence basis with it |
| `REVIEW_REQUIRED` | An invoice is marooned behind a long payment gap and may be settled | Check it against the remittance advices covering the gap, then ratify or keep |
| `BLOCKED` | The list over-states the account, or bills an invoice a remittance says is paid | **Do not release.** Reconcile, then ratify into `closedInvoiceOverrides` |
| `NOT_DERIVABLE_FROM_TXT` | Export carries no invoice tagging — normally deliberate, not a defect | **Do not release.** Build the invoice-level view via the allocation lane; a re-export alone does not fix it (§1) |

`generate_statement_of_account.mjs` runs this gate itself and **refuses to
write** on `BLOCKED` / `NOT_DERIVABLE_FROM_TXT`. `--force` exists for a recorded
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

## 3.2 Live draft vs immutable snapshot

| Mode | Flag | Output | When |
| :--- | :--- | :--- | :--- |
| **Live draft** | (default) | `reports/[CODE]_Statement_of_Account.md` (+ optional PDF) | Internal reconciliation, what-if, active Model B work |
| **Snapshot** | `--snapshot` | `snapshots/[YYYY-MM-DD]_vN/` | Finance sign-off, collections gate, customer send, dispute defence |

Snapshot mode **archives** the exact TXT + `statement_of_account.json` used, writes versioned
`[CODE]_Statement_of_Account_[YYYY-MM-DD]_vN.md/.pdf`, embeds a **Record provenance**
section (sha256, gate, config flags), and writes `manifest.json` with artifact checksums.
It does **not** overwrite the live draft unless `--also-live` is passed.

```bash
# Internal working draft (safe to re-run after TXT refresh)
npm run debtors:customer-statement -- --debtor TWK002 --as-at 2026-08-11 --pdf

# Immutable sign-off / customer artifact
npm run debtors:customer-statement -- --debtor TWK002 --as-at 2026-08-11 --snapshot --pdf
```

Auto-versioning: if `2026-08-11_v1` exists, the next run creates `_v2`, etc. Override with
`--snapshot-version v1` only when re-capturing deliberately.

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
