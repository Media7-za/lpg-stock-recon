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

---

## Amendment 2026-10-17: portfolio-wide classification (operator "yes, run it across all accounts"; connector-sourced read-only SELECT, ASSERTED; supersedes the "COF001/COF002 only, unproven elsewhere" caveat above)

Class by `abs(tax_amount)/abs(amount_excl)`: ex-tax = 0.15, inclusive = 15/115, zero = no tax or amount, other = anything else. All accounts in `transaction_headers`.

| Entry | Class | Rows | Accounts | Dated before 2025-03 | From 2025-03 |
| :-- | :-- | --: | --: | --: | --: |
| Crd Note | inclusive | 13,114 | 445 | 10,262 | 2,852 |
| Crd Note | ex-tax | 3,982 | 226 | **3** | 3,979 |
| Crd Note | other | 460 | 78 | 429 | 31 |
| Crd Note | zero | 1,370 | 136 | 1,295 | 75 |
| Invoice | ex-tax | 59,745 | 637 | 37,892 | 21,853 |
| Invoice | inclusive | 75 | 29 | 59 | 16 |
| Invoice | other | 3,094 | 140 | 2,953 | 141 |
| Invoice | zero | 866 | 111 | 199 | 667 |

What it supports:
- **Edit 1 holds portfolio-wide for credit notes dated before 2025-03**: 10,262 inclusive against 3 ex-tax. The COF001/COF002 observation is the portfolio pattern, not a quirk of those accounts.
- **The 2025-03 boundary is not clean.** After it, ex-tax rows dominate (3,979) but 2,852 credit notes are still inclusive (the inclusive twin of a pair, or an unpaired inclusive row). Edit 1's wording "from 2025-03 a credit note appears as an ex-tax row" should read: "from 2025-03 ex-tax rows are the majority and inclusive rows still occur, so the ratio test always applies."
- **Invoices are ex-tax in 59,745 of ~63,800 rows; 75 inclusive**, so Edit 2's `amount_excl + tax_amount` for invoices is safe in most cases but not guaranteed (the 75, plus 3,094 `other`).
- **The ratio test falls through on 460 credit notes and 3,094 invoices (`other`)**, likely mixed or zero-rated VAT lines. **Edit 2's CASE as drafted would add tax to those**, which may be wrong. Until their nature is known, the CASE should return "unclassified, check line totals / ledger" for `other` instead of guessing. Not investigated: one more query by account would be needed.
- Zero-tax rows (1,370 credit notes, 866 invoices): nothing to compensate.

**Revised Edit 2 clause (PROPOSED, replaces the CASE above):** `CASE WHEN class = inclusive THEN amount_excl WHEN class = ex-tax THEN amount_excl + tax_amount WHEN class = zero THEN amount_excl ELSE NULL /* unclassified: use SUM(line_total) from vw_clean_transactions or the ledger */ END`.

Operator decision still needed on both edits; nothing applied.

---

## Amendment 2026-10-17 (second): what the "other" class is (operator "sure"; connector-sourced read-only SELECTs, ASSERTED; refines the revised Edit 2 clause above)

Rows with non-zero tax that fit neither 15% nor 15/115 (3,554 rows: 460 credit notes, 3,094 invoices).

| Entry | Pattern | Rows | Accounts | Amount range |
| :-- | :-- | --: | --: | :-- |
| Invoice | tax 13.25% to 14.78% of the amount (just under 15%) | 2,908 | 129 | 35.09 to 27,486.50; only 12 under R100, so **not small-amount rounding** |
| Invoice | tax 0.48% to 12.83% | 185 | 25 | 91.52 to 34,896.89 |
| Invoice | within 2c of 15% | 1 | 1 | 0.09 |
| Credit note | tax 1.43% to 12.28% (below 13.04%) | 458 | 77 | 140.00 to 14,817.39 |
| Credit note | tax 14.48% | 2 | 1 | 1,729.56 |

Biggest accounts in the class: CS0035 (809 rows), PMB001 (421), CS0027 (194), UC0000 (157), NT0001 (134), MD0003 (100), EL0001 (97), BU0002 (97). Recent examples: BU0002 invoice 53567 (34,896.89 + 3,616.40 = 10.4%), SHW001 invoice 50805 (7.8%), KYL001 invoice 51024 (2.1%).

**Reading (inference, not verified against the line items):**
- These look like documents with **mixed VAT rates** (part zero-rated lines), not a third storage convention. Invoices in this class are ex-tax headers with partial VAT, so `amount_excl + tax_amount` stays right for them.
- **For credit notes below 13.04% the ratio cannot tell inclusive from ex-tax**: a mixed credit note stored inclusive and one stored ex-tax both land under the pure-rate ratios. 429 of the 460 are dated before 2025-03, where the portfolio default is inclusive (10,262 against 3 ex-tax), but that is a default, not proof.
- 2,908 invoices sitting just under 15% need an explanation we do not have (mostly standard-rated with a small zero-rated part is the likeliest).

**Revised Edit 2 clause (PROPOSED, supersedes the previous one):** for invoices use `amount_excl + tax_amount` (verify against `SUM(line_total)` where line detail exists; 75 invoices are inclusive-ratio). For credit notes classify: ratio 15/115 = inclusive (use `amount_excl`); ratio 0.15 = ex-tax (add tax); **any other ratio = unclassified, take the figure from `vw_clean_transactions` line totals or the statement ledger, never from the header.** Nothing applied.

**Still open / unfinished:** verify the mixed-VAT reading on 5 to 10 documents from CS0035, MD0003 and BU0002 against `vw_clean_transactions` line tax codes (one more read-only query, needs your go-ahead as it widens beyond header rows); then decide Edits 1 and 2. This does not affect COF001/COF002, whose credit notes classify cleanly.

---

## Amendment 2026-10-17 (third): the "other" class is mostly the 14% VAT era; the "mixed VAT" reading in the second amendment is withdrawn for those rows (operator authorised Supabase reads; line-level check on CS0035, MD0003, BU0002; connector-sourced, ASSERTED)

South African VAT was 14% until 31 March 2018 and 15% after. Sample of 15 credit notes and 15 invoices from CS0035, MD0003 and BU0002 against `transaction_items` (line tax code and line tax):
- Every sampled 2016-2018 document has **all lines tax code 1 (taxed)** and line tax equal to the header tax. Invoices: header tax = 14% of the ex-tax amount, line net = header amount (e.g. BU0002 invoice 238: 5,158.40 + 722.18). Credit notes: header `amount_excl` is the **inclusive** figure and tax = 14/114 of it (e.g. MD0003 CN 224: header -342.00, tax -42.00, line net -300.00).
- One sample was genuinely different: BU0002 invoice 46951 (2025-10-08): header 20,128.98 + 2,756.85 but line net 40,257.96 and line tax 5,513.70 (exactly 2x the header, i.e. duplicated item rows), with both tax-0 and taxed lines (a real mixed-rate document).

Rate-aware classification of all headers (all accounts):

| Entry | Class | Rows | Accounts |
| :-- | :-- | --: | --: |
| Crd Note | inclusive 15% | 13,114 | 445 |
| Crd Note | ex-tax 15% | 3,982 | 226 |
| Crd Note | inclusive 14% | 429 (427 before 2018-04) | 73 |
| Crd Note | **other** | **31** | 8 |
| Crd Note | zero tax | 1,370 | 136 |
| Invoice | ex-tax 15% | 59,745 | 637 |
| Invoice | ex-tax 14% | 2,886 (2,868 before 2018-04) | 126 |
| Invoice | inclusive 15% / 14% | 75 / 37 | 29 / 10 |
| Invoice | **other** | **171** | 25 |
| Invoice | zero tax | 866 | 111 |

So the truly unclassified class is **31 credit notes and 171 invoices** (was 460 and 3,094), most dated 2025-07 to 2026-10 and likely genuinely mixed-rate or duplicated-item documents. The 2,908 "just under 15%" invoices are 14% VAT documents.

**Revised rule (PROPOSED, supersedes the previous clauses; nothing applied):** classify a header by `abs(tax_amount)/abs(amount_excl)` against four values: 0.15 and 0.14 = ex-tax (add the tax), 15/115 and 14/114 = inclusive (use `amount_excl`, do not add tax), tolerance 0.002. Anything else (31 credit notes, 171 invoices) = unclassified: use line totals from `vw_clean_transactions` or the statement ledger, never the header. Invoices remain overwhelmingly ex-tax; credit notes are inclusive before 2025-03 and mixed afterwards.

**Not yet done:** the 202 unclassified rows were not checked line by line beyond BU0002 invoice 46951; the duplicated-item pattern (line totals exactly 2x the header) is a possible ingest finding for the ERP/data agent, unverified beyond one document.
