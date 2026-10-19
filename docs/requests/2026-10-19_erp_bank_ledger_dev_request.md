# Dev team request: ERP bank ledger table and bank-narrative evidence for the payment matcher (2026-10-19)

**DRAFT for the operator to approve and post.** Not posted. From: debtor reconciliation PM session, at the operator's direction ("Dev Team can very well set up a database of bank ledger transactions dumped from ERP; this mirrors the bank statements").

## 1. Why

The payment matcher allocates payments to invoices by inference from the ERP ledger (amounts, dates, delivery-note numbers, credit-note pairs). That proves balances, not what the customer meant. The customer's own words are on the bank credit narrative, for example `Magtape Credit Coffeeberry Cascades 00039311`. Where the narrative names an invoice and the customer, it is stronger evidence of intent than any amount match. For Coffeeberry, 130 of 133 bank rows carry an 8-digit document number (ASSERTED, connector-sourced, 2026-10-19).

The COF001 and COF002 sessions solved their hardest items by hand with exactly this source: payment 35877 (R9,649.56, narrative names invoice 39311), payment 29492 (R7,628.30, narrative says "Avenues 00031096", COF002's invoice, so it was posted to the wrong account), and two R8,512.36 credits naming the same invoice 34681.

## 2. What exists today (read-only inspection, Supabase project `lpg-stock-recon`)

| Table | Content |
| :-- | :-- |
| `bank_statements` | 30 rows: period, bank account, opening/closing balance, credit/debit totals, transaction count, source file name and hash |
| `bank_transactions` | 2,306 rows, 2021-01-01 to 2026-03-30, **credits only**, `reference` empty on every row, text in `description`; status MATCHED 1,624 / UNMATCHED 379 / EXCEPTION 303 |
| `match_bank_transactions` | base table written by the existing bank reconciliation run |

Gaps seen: no debits; no link from a bank line to the ERP receipt document; no ERP-side data (STAT number, who keyed it, entered date); 30 statements for about 63 months, so period coverage needs a check. Example of a missing credit: payment 40757 (R7,400.19, Aug 2025) has no bank credit in `bank_transactions`.

## 3. What we are asking for

### 3.1 A new table `erp_bank_ledger`, dumped from the ERP bank ledger

| Column | Meaning |
| :-- | :-- |
| `erp_receipt_doc` | ERP receipt/payment document number (the number on the debtor statement) |
| `stat_no` | ERP bank statement batch reference (the `STAT:102` shown on debtor statements) |
| `bank_account` | bank account identifier, matching `bank_statements.bank_account_identifier` |
| `receipt_date` | date on the ERP document |
| `entered_at` | date and time the receipt was keyed (so back-dated or late-posted receipts are visible) |
| `entered_by` | user who keyed it, if the ERP holds it |
| `amount` | signed amount as posted |
| `debtor_code` | account the receipt was posted to |
| `narrative` | bank text as keyed in the ERP |
| `bank_line_ref` | statement line or sequence reference, if the ERP keeps one |
| `source_file`, `source_sha256`, `ingest_run_id` | provenance, same pattern as the other uploads |

Include debits and bank-side adjustments if the ledger holds them. Keep unallocated and UD (unconfirmed deposit) receipts and mark them.

### 3.2 A link between ERP receipts and bank lines

A view `bank_erp_link` joining `erp_bank_ledger` to `bank_transactions` on (bank account, STAT number or statement line where available, otherwise exact amount and date within 3 days), with a `link_basis` column and a count of candidate matches, so ambiguous links are visible and never guessed.

### 3.3 Load path and coverage report

Load through the existing DataHub path. Produce a coverage report per period and bank account (statements present, ERP ledger rows present, bank lines present), written in the style of the existing ingest coverage reports, so a missing period is reported, not silently empty.

## 4. Questions for the dev team

1. Does FINCON expose the bank ledger with the STAT number, receipt entered date and user, and a statement line reference?
2. Can the export include debits, adjustments and UD items, and what is the earliest date available?
3. Can it be exported by receipt number or date range, and on what schedule (daily with the other loads, or on request)?
4. Why does `bank_transactions` hold credits only, and why is `reference` empty? Is the full bank statement text in `raw_row`?
5. Which bank statement periods are missing from `bank_statements` (30 statements against about 63 months)?
6. Can the bank reconciliation run write its UNMATCHED and EXCEPTION reasons somewhere readable?

## 5. Acceptance cases (all COF001/COF002; ASSERTED until the dev team's data reproduces them)

| Case | Bank row (bank_transactions) | Expected from the new data |
| :-- | :-- | :-- |
| 35877 | 2024-12-30, R9,649.56, "Coffeeberry Cascades 00039311", UNMATCHED | ERP receipt 35877 linked to this bank line; narrative names invoice 39311 (gas R8,390.92 + deposits R7,590.00); difference to the invoice visible |
| 29492 | 2024-04-18, R7,628.30, "Coffeeberry Avenues 00031096", MATCHED | ERP receipt 29492 shown posted to COF001 while the narrative names COF002's invoice 31096 |
| 30219 | 2024-03-12, R7,628.30, "Coffeeberry Cascades 00030276", EXCEPTION | ERP receipt 30219 (not in the database today) linked to this bank line |
| 34681 | 2024-07-31 and 2024-08-03, R8,512.36 each, both "Avenues 00034681" | Both bank credits visible with their ERP receipts (32598, 37735, 32615) and entered dates, to tell a double payment from a duplicated bank line |
| 40757 | none found for R7,400.19 | The ERP receipt's STAT number and bank account, to see whether it was a bank transfer at all |

## 6. How the matcher will use it (for the dev team's context)

A bank-narrative evidence source ranked below remittance advices and customer ledgers and above ERP tags and patterns. It will propose PROBABLE ties and review flags only; an account opts in by config; a missing bank row never blocks a tie; a narrative that contradicts an exact ledger match is raised as a flag and does not override it. The matcher reads the tables through the existing connector-replay captures (md5-verified), so no credentials are stored in the repo.

## 7. Constraints

Read-only on the ERP. No credentials or connection strings in any file or ticket. Do not change `bank_transactions`, `bank_statements` or `match_bank_transactions`; add new objects only.

## 8. Delivery

Reply on the ticket with the table and view definitions, the load date, and the coverage report. Repo branch for any committed files: start from `claude/payment-matching-mechanisms-4h34be`.
