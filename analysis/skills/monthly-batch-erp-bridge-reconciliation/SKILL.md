---
name: monthly-batch-erp-bridge-reconciliation
description: >-
  Build and verify a reconciliation bridge between a commercial open-invoice
  schedule and the ERP running balance for monthly-batch (STAT) payers, and
  generate the customer-facing statement from the verified schedule. Covers
  exact-sum payment-to-month verification (avoiding false chronological/FIFO
  attribution), standing-credit detection via constant-gap testing, CYL
  deposit-pair netting, calendar-month ageing, and a "remit amounts prior to
  current" remittance line. Also covers detecting linked/duplicate ERP
  account codes for the same customer. First built for MD0003 (Bluff Meat
  Supply); generalize for other STAT batch payers (e.g. JIM001).
---

# Monthly-Batch ERP Bridge & Customer Statement

> **Scope:** specific to the **LPG Stock Recon App** repo (`~/Documents/LPG Stock Recon App`). All paths, report templates, and doctrine references (`analysis/debtors/[DEBTOR]/...`, `business_rules.md`, sibling skills) assume this project's debtor-workspace layout. Not portable as-is to other repos without re-mapping those paths.

## 0. Applicability

- Use when a debtor pays in **monthly consolidated batches** (STAT-style) against pooled gas billing, not per-invoice `ref_no`.
- Do **NOT** use for invoice-linked payers → `SKILL_Payment_To_Invoice_Allocation.md`.
- Companion to `lpg-payment-pattern-analysis` (annual variance report) — this skill covers a different artifact: a **point-in-time bridge** (schedule → ERP balance) and the **customer statement**, not the annual pattern report.

---

## 1. Build the commercial open-invoice schedule

- **Full invoice gross only** — no partial-invoice payment. An invoice is either fully settled (listed on a verified remittance/month batch) or fully open.
- Strip CYL `-EMPTY` deposit/credit-note pairs that net to R0; carry forward any residual (non-zero) pair as a separate CYL line.
- Group by month, note whether that month has a matching remittance/STAT payment yet.
- **Gate the schedule before using it:** `npm run debtors:tag-check -- --debtor [CODE]`. ERP tags settlement rows to invoices unreliably, so a schedule built from the ledger alone can carry already-paid invoices as open. The invariant Σ(open invoices) ≤ ERP `CURRENT BALANCE` must hold; `UNUSABLE_EXPORT` means the TXT has no allocation detail and the schedule cannot be built from it at all. Rule: `analysis/debtors/shared/docs/business_rules.md` §15.
- **Remittance advices outrank ERP tagging.** For a STAT payer the advice is the better authority on which invoices a batch settled — that is the whole premise of §2. Where the two disagree and the batch total reconciles, believe the advice and ratify the invoice into `closedInvoiceOverrides`.

---

## 2. Verify each STAT payment BEFORE building the bridge — exact-sum test first

> **Critical / most common mistake:** do not assume a STAT payment applies chronologically/FIFO into the ERP running balance. Always test whether the payment gross equals a whole calendar month's net LPG billing to the cent, *before* constructing any chronological-application theory.

1. Compute **net LPG billing per calendar month** (invoices + same-doc credit notes, gas lane only).
2. For every STAT/batch payment, check `ABS(payment_gross - net_month_billing[M]) <= 0.02` across a small window of candidate months.
3. If it matches a month exactly, that payment **settles that month in full** — regardless of where the ERP's running balance chronologically applied the cash internally.
4. Only fall back to FIFO/chronological slicing if no exact month match exists (rare for disciplined STAT payers).

**Worked fix (MD0003):** payment 45595 (R14,863.43) exactly equals June's four remittance-listed invoices — not a chronological credit consumed against July. The first bridge attempt without this test wrongly attributed R12,263.61 to "July invoices cleared early."

---

## 3. Detect a standing ledger credit (vs a real variance)

- After matching each payment to its month, compute `gap = commercial_open_position − ERP_balance` at each STAT cycle end.
- **Constant gap across ≥3 consecutive cycles** → a **standing credit** sitting on the account, not a chronological/FIFO effect.
- **Moving gap** → a genuine variance (missed remittance line, wrong month match, etc.) — do not label it a standing credit.
- **Trace the origin:** find the one batch payment whose gross **exceeds** its matched month's net billing — the overshoot is the credit's source. Flag for ERP-side verification; don't assume it's correct just because it's old.

---

## 4. Assemble the bridge report

| Bridge line | Basis |
| :--- | :--- |
| A. Open commercial gas schedule | Step 1 |
| B. CYL net residual | Any non-zero `-EMPTY` pairs |
| = Commercial open position | A + B |
| C. Standing ledger credit | Step 3 — flag as under investigation if newly discovered |
| = ERP `CURRENT BALANCE` | A + B − C |

Always publish the month-by-month payment-to-billing match table (Step 2) as evidence — it's what makes the bridge auditable and prevents re-litigating a chronological-FIFO mistake.

---

## 5. Customer-facing statement (from the verified schedule only)

Deviates from the generic `SKILL_Debtor_Customer_Statement_From_TXT.md` script output in three ways for this payer class:

1. **Balance due = commercial open schedule total (Step 1), not the ERP running balance.** The customer owes on invoices; internal ERP credits/timing questions aren't theirs to carry until resolved.
2. **Calendar-month ageing**, not rolling 30-day windows: Current = current calendar month, 30-day = prior calendar month, 60-day = two months prior, etc.
3. **Remittance line requests only "amounts prior to current"** — total minus the Current-month bucket, since current-month invoices aren't yet due for collection action:

   > Please remit **R{total − current_bucket}** (all amounts prior to current month) on payment.

---

## 6. Related check — linked/duplicate ERP accounts

Before finalizing any bridge, check whether the debtor has a second ERP account code for the same entity:

- Search for the customer's **current trading name** appearing as a *historical* name on another account (ERP renames happen).
- Search that other account's credit notes/refs for explicit transfer language (`XFER TO {code}`, `{name} TO {code}`).
- If no per-account ledger export exists for the second code, reconstruct what you can from shared, all-customer raw dumps (stock-transaction or global exports) — but flag any reconstructed balance as **stale/unverified** until a proper ledger export is pulled.

Worked example: MD0003/MD0004 (`MD0003_MD0004_Combined_Exposure.md`).

---

## 7. Anti-patterns

| Anti-pattern | Why |
| :--- | :--- |
| Assuming chronological/FIFO application of a STAT payment without first testing exact-month-sum match | Produces a false "chronological credit" theory |
| Calling a moving gap a "standing credit" | Only a **constant** gap across cycles qualifies — a moving gap is a real variance needing investigation |
| Using the ERP balance as the customer-facing "balance due" for a no-partial-payment payer | Customer owes on full invoices; ERP timing/credit questions are internal |
| Rolling 30-day ageing for calendar-month billing cycles | Misstates which invoices are "current" vs "overdue" for a monthly biller |
| Treating a reconstructed (no ledger export) balance as verified | Stock-transaction dumps have no payment rows — can't confirm a real balance |
| Sending an open-invoice schedule without running `debtors:tag-check` | ERP leaves settlement rows untagged, so paid invoices stay on the schedule. TWK002 billed a customer for 15 months this way |
| Building a schedule from a TXT exported with `EXCLUDE: ALLOCATION DETAIL` | No row names the invoice it settles, so every invoice looks open. Re-export instead |

---

## 8. Related skills

| Skill | When |
| :--- | :--- |
| `lpg-payment-pattern-analysis` | Annual payment-pattern variance report for the same payer class |
| `SKILL_Debtor_Customer_Statement_From_TXT.md` | Algorithmic statement generation from raw TXT (invoice-linked or simple payers) |
| `SKILL_Payment_To_Invoice_Allocation.md` | Invoice-linked (ref_no) payers — different payer class entirely |

---

**Worked example:** MD0003 — `analysis/debtors/MD0003/reports/MD0003_Open_Invoices.md`, `MD0003_Statement_of_Account.md`, `MD0003_MD0004_Combined_Exposure.md`.
