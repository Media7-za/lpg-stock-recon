# PROPOSED — NOT RATIFIED: credit-note tax handling in DB headers (2026-10-17)

**Status:** staged by the COF002 2024 analyst session on the operator's "yes" to drafting. Per `DEBTORS_DOCTRINE.md` section 7 a worker session does not edit skills or rules that bind other accounts. **Nothing below has been applied** to `business_rules.md` or `.agents/skills/`. Operator decision needed: apply, amend or drop.

## Evidence (connector-sourced, ASSERTED; COF001 + COF002 only)
Read-only classification of `transaction_headers` by `abs(tax_amount)/abs(amount_excl)`: credit notes 159 rows inclusive (tax = 15/115 of the stored amount, 2022-03-01 to 2026-05-07), 90 rows ex-tax (tax = 15%, 2025-03-05 on); invoices 587 ex-tax, 1 inclusive, 1 other. Later credit notes appear twice (inclusive row and ex-tax row). Worked case: CN 4076 stored -345 with tax -45 is ledger -345.00 (true ex-tax -300). Detail and SQL: `docs/previews/2026-10-16_COF002_2024_analysis.md` section 13. **Other accounts were not checked**: the rule below is unproven outside COF001/COF002 until the same query is run portfolio-wide.

## Edit 1 — `analysis/debtors/shared/docs/business_rules.md`, append to section 1 (Tax Sign Correction Rule)
> **Addendum (PROPOSED).** For `Crd Note` rows in `transaction_headers`, `amount_excl` may already be tax-inclusive. In COF001/COF002 this holds for headers dated before 2025-03 (tax = 15/115 of `amount_excl`); from 2025-03 a credit note appears as an ex-tax row (tax = 15% of `amount_excl`), often alongside an inclusive twin. Classify each header by `abs(tax_amount)/abs(amount_excl)` (0.15 = ex-tax, 0.1304 = inclusive) before adding tax. Never compute `amount_excl + tax_amount` for a credit note without that test. Compare against the statement ledger on the inclusive figure.

## Edit 2 — `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`, section 4.1 (VAT Handling) and the Tier 1 query
Replace the invoice bullet:
> - **Invoices:** Compare against VAT-inclusive totals: `amount_incl = SUM(line_total)` from `vw_clean_transactions`, or `amount_excl + tax_amount` from header when line detail is unavailable.

with (PROPOSED):
> - **Invoices:** as above (`amount_excl + tax_amount` from the header is safe for invoices, whose headers are ex-tax).
> - **Credit notes:** do not add `tax_amount` blindly. Use `amount_incl = CASE WHEN ABS(ABS(tax_amount)/NULLIF(ABS(amount_excl),0) - 15.0/115) < 0.002 THEN amount_excl ELSE amount_excl + tax_amount END`, and check the result against the statement ledger.

The Tier 1 snippet joins invoices only, so it needs no change.

## Tripwires
Reopen if a portfolio-wide classification shows credit-note headers in other accounts that fit neither class; if the ERP agent explains the twin rows differently; or if `ingest` changes how `amount_excl` is populated.

## Not in scope
The allocation-detail skill edits (`2026-10-16_allocation_detail_rule_skill_edits_PROPOSED.md`) are separate and untouched.
