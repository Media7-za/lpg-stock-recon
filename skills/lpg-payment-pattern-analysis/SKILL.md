---
name: lpg-payment-pattern-analysis
description: >-
  Strict guide to generate the YYYY_Payment_Pattern_Analysis.md report
  for debtors who pay in consolidated monthly batches (e.g., JIM001). Enforces
  amount-proximity matching, Pattern 2/3 offsets, and Rule 13 surplus tracking.
---

# LPG Payment Pattern Analysis Report Generator Skill

> [!IMPORTANT]
> **Applicability & Scope:**
> This skill is **strictly** for debtor accounts who pay in consolidated monthly batches (e.g., using monthly statement allocations like `STAT196`, `STAT197`, etc.). 
> Do **NOT** apply this methodology to debtors who pay on a per-delivery/per-invoice basis or make arbitrary payments, as their ledgers require a different chronological allocation model.

## 1. Objective
This skill defines the strict methodology and layout requirements for generating the annual `[DEBTOR]_[YEAR]_Payment_Pattern_Analysis.md` report. The report isolates LPG gas billing from cylinder deposit noise, tracks actual cash flows, and applies mathematically consistent payment-to-month patterns.

---

## 2. Source-of-Truth Hierarchy

To maintain audit integrity, you must adhere to the following data classifications:

| Canonical Truths (System/Bank Verified) | Non-Truths (Clerical Allocations / Labels) |
| :--- | :--- |
| • Invoice amounts, dates, and SKU items | • Payment `ref_no` allocations (clerk splits) |
| • Credit note amounts and dates | • `batch_ref` / STAT numbers (internal bank labels) |
| • Gross payment amounts (bank statements) | • ERP payment split lines (clerk decisions) |
| • `vw_clean_transactions` SKU groupings | • Indicative system allocations (without remittance) |

> [!IMPORTANT]
> Never claim a payment was intended for a specific invoice unless a customer remittance advice is present. Reconcile at the gross monthly/annual level.

---

## 3. Core Pattern & Business Rules

### Rule 13: Gross Flow Overpayment & Surplus Allocation Rule
* **Concept:** When a gross payment exceeds the target month's net invoices, do not trim the payment to fit.
* **Action:** Log the full cash payment in Section 2, record the resulting negative variance (e.g. `-R547.77`) representing the surplus, and track this surplus in the **Section 5 Unallocated Pool**.

### Pattern 3: Exact Mirror Carry (Timing Correction)
* **Concept:** When Month A is short by amount `X` and Month B's payment has an unallocated residual of exactly `X` (within ±R0.05), treat both months as `FULLY SETTLED`.
* **Action:** Log the actual payments in Section 2, record the individual variances, but mark both months as fully settled via Timing Correction in the notes and summary.

### Pattern 2: Cross-Batch Carry (Indicative Flag)
* **Concept:** When a monthly shortfall corresponds to one or two specific invoice lines, the payment may have split across batches.
* **Action:** Log as `PARTIALLY_SETTLED` and flag as "Possible cross-batch carry — verify remittance." Do not treat as a formal claim.

---

## 4. Required Report Template & Structure

The file **must** be named `[DEBTOR]_[YEAR]_Payment_Pattern_Analysis.md` and saved under `analysis/debtors/[DEBTOR]/reports/`. It must contain these exact sections:

### Section 1: Executive Summary
Summarize the net balance changes, outstanding anomalies, and timing corrections.
* **Net LPG Gas Balance Change:** Sum of all Section 2 variances.
* **Permanent Outstanding Anomalies:** Listing of actual unpaid gaps (e.g., STAT gaps or Pattern 2 shortfalls).
* **Pattern 3 Timing Corrections:** Bullet points detailing self-cancelling mirror offsets.

### Section 2: Monthly LPG Invoices vs. Payments Table
Use these exact columns and vocabulary:
| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Arrears Catch-Up | LPG Variance | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |

**Notes Vocabulary:**
* Fully settled: `Paid in full.`
* Underpaid: `Underpaid. R{X} remaining unpaid.`
* Missing Payment: `**STAT:{N} Gap:** No payment matched. Bank recon investigation pending.`
* Pattern 3 Shortfall: `**Pattern 3 — Mirror carry:** R{X} residual covered by {STAT_B}. Treated as fully settled.`
* Pattern 3 Surplus: `**Pattern 3 — Mirror carry:** {STAT_B} payment includes R{X} residual for {Month_A}. Treated as fully settled.`
* Pattern 2 Carry: `Underpaid R{X}. Possible cross-batch carry — see Section 2.1 for candidates.`
* Rule 13 Surplus: `**Overpaid R{X}:** Gross payment of R{Y} logged against net billed LPG. (Net after credits R{Z}.)`

### Section 2.1: Candidate Invoice Details for Underpayments
To prevent cluttering Section 2, any underpaid months with potential candidate invoices must be listed in a separate table containing:
`| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |`

* **Footnotes/Investigation Notes:** Place investigation notes directly below this table to stipulate exactly how many candidate invoices are actually unpaid (e.g., *"Only 1 of these 2 May candidates is unpaid (not both)"*). This prevents over-claiming.

### Section 3: Cylinder (CYL) Transactions Analysis
State the net cylinder ledger impact (e.g., `-R1,541.00`). Include the disclaimer:
*"Cylinder container transactions were strictly ledger-only loop of returns and were excluded from cash payments. CYL credits may not be netted against LPG payment obligations per Baseline Statement Rules."*

### Section 4: STAT Sequence & Payment Flow Reconciliation
Consolidate STAT batch numbers with payment details and include a mathematical reconciliation block comparing **Payment Settlement Pool** (payments allocated to 2022 billing) against **Calendar-Year ERP Headers** (payments physically posted in that year).

**Example Reconciliation Block:**
* **Total Calendar-Year Payments:** sum of payments posted in that year.
  * *Less:* payments posted in target year but settling prior year's invoices.
  * *Plus:* payments posted in next year but settling target year's invoices.
* **Total Payments Settling Invoices:** sum of Section 2 payment column.

### Section 5: Unallocated Payment Pool
List all genuine, non-pattern payment surpluses (under **Rule 13**) received in that year. Exclude Pattern 3 timing mirrors.

---

## 5. Execution Checklist

1. **Calculate Net Invoices:** Extract all invoices and credit notes for the year from `vw_clean_transactions` (LPG gas only).
2. **Retrieve Payments:** Extract all payments posted to the account for that year from `transaction_headers`.
3. **Run Pattern Matching:** Run `payment_pattern_analysis.py` with standard tolerance.
4. **Apply Mirror Corrections:** Pair and resolve Pattern 3 offsets.
5. **Reconcile Totals:** Verify that the sum of Section 2 variances matches the net balance change and resolves cleanly to the calendar-year totals.
6. **Generate & Sync:** Save the report and execute `npm run debtors:sync` to ensure it passes layout and metadata validation.
