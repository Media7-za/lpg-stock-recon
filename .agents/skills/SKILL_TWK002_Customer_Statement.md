---
name: twk002-customer-statement
description: >-
  Generate the TWK002 (TWK AGRI PTY LTD) customer-facing Statement of Account
  — opening balance, ageing buckets, open invoices — from ERP DEBENQ TXT
  exports and roll up linked site codes TWK003/TWK004. Use when asked for a
  TWK002 statement, open invoice list, or collections letter for TWK AGRI.
  Not for internal sub-ledger recon (use SKILL_Debtor_Statement_v5_From_TXT.md
  for the LPG/CYL 1A/1B position statement instead).
---

# TWK002 Customer Statement of Account

Produces the customer-facing document (Gaz Express header, TWK reference
B226, opening balance, Current/30/60/90/120-day ageing, open invoice table)
directly from `raw/DEBENQ_TWK002.TXT` plus site balances on
`DEBENQ_TWK003.TXT` / `DEBENQ_TWK004.TXT`. **No `DATABASE_URL` required** —
this is a pure TXT-parsing script, unlike v5.

## When to use

| Use this skill | Use instead |
| :--- | :--- |
| Customer statement / collections letter for TWK AGRI | `SKILL_Debtor_Statement_v5_From_TXT.md` for internal LPG/CYL sub-ledger recon |
| Quick open-invoice list with ageing | Settlement-discount posting work (see `TWK002_Settlement_Discount_Doctrine_v2.md`) |

## Prerequisites

1. Fresh `raw/DEBENQ_TWK002.TXT` (with allocation detail — invoice/CN/payment
   rows carrying `INVNO` refs). Refresh `DEBENQ_TWK003.TXT` /
   `DEBENQ_TWK004.TXT` only if that site had activity (same STAT payment batch
   as TWK002, e.g. STAT 123 `00043500`).
2. `analysis/debtors/TWK002/config/statement_of_account.json` — business
   header, TWK reference, TXT paths, output names. Edit once; reuse.

## Run

```bash
npm run twk002:statement -- --as-at 2026-08-10 --pdf
```

- `--as-at` (optional): statement date, defaults to today. Drives ageing and
  the "opening balance (1 <Month>)" line (TXT running balance strictly before
  the 1st of that month).
- `--pdf`: also renders `TWK002_Statement_of_Account.pdf` via `md-to-pdf`
  using `reports/statement_pdf.css`.

Outputs:
- `reports/TWK002_Statement_of_Account.md`
- `reports/TWK002_Statement_of_Account.pdf` (with `--pdf`)

## Method (for verification / edits)

1. **Open invoices** — per invoice document: `Invoice` amount + any `Crd Note`
   / `Payment` / `Journal` rows tagged with that invoice's `INVNO`. Only
   invoices with a positive remaining balance are listed.
2. **Site roll-up** — TWK003/TWK004 `CURRENT BALANCE` headers are added to
   TWK002's as flat adjustment lines (credit/cleared, not itemised — these
   sites don't carry open invoices once a shared STAT payment clears them).
3. **Ageing** — invoice date → `--as-at`, bucketed Current/30/60/90/120 days.
   The gap between Σ(open invoice due) and the reconciled **Balance due**
   (account-level discount journals with no invoice ref, e.g. `00000507–509`)
   is folded into the **120-day** bucket so the row always ties to the total.
4. **Opening balance** — ERP running balance as of the last row strictly
   before the 1st of the statement month; "movement this month" is the
   difference to the current TWK002 balance (invoices + payments + journals
   combined, not broken out by type).

## Script

`analysis/debtors/TWK002/scripts/generate_statement_of_account.mjs` — no DB
dependency, safe to re-run any time a fresh DEBENQ export lands.
