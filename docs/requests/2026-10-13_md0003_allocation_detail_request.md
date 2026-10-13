# ERP export request — MD0003 allocation detail (13 Oct 2026)

**DRAFT for posting by the main session. Not posted by the drafting session.**
**To:** ERP agent / @Sharmin  **From:** operator (request to be confirmed by the operator before it goes out), drafted by Claude Code
**Purpose:** MD0003 (BLUFF MEAT SUPPLY(PTY) LTD) has 7 payments the matcher cannot tie to invoices (R114,330.23) and the only allocation detail on file is `DEBENQ_CURRENT.TXT`, which ends on 2026-08-09 (CURRENT BALANCE R18,853.36). A fresh export with allocation detail shows which invoices the ERP applied each payment to, so the operator can rule on payments 37143, 37144, 37262, 37263, 37817, 42440 and 42858 and can check the later 2026 payments. The statement balance itself is already proven (ERP R16,547.81 from `MD0003_2026-10-08.TXT`, variance R0.00); this request does not replace that file.

## What to export
- The **same debtor enquiry report (DEBENQ)** used for `DEBENQ_CURRENT.TXT` (columns `LINE, PERIOD, DOCNO, ENTRY, DATE, INVNO, CUSTOMER/BANK REF, ORDER, REFERENCE, AMOUNT, BALANCE`), account **MD0003**.
- **Allocation detail INCLUDED.** In the header block the line `EXCLUDE: ALLOCATION DETAIL` must not appear (the 8 Oct statement export had it; the allocation-detail file shows the target invoice number in the `INVNO` column of each payment line, with one line per slice).
- **With the header block** (account, name, currency lines, B/F, CURRENT BALANCE, UD PAY/CHEQUES, CREDIT CLAIMS, INCLUDE/EXCLUDE lines) and the running balance column, as in `DEBENQ_CURRENT.TXT`.
- **Period:** full history from the first transaction in the report window (at least from 2025-01-01) to the date of export. If the report limits the range, it must at least cover **every payment dated 2025-11-28 or later** (42440 onward) **and all 2026 payments** (43239, 43494, 43854, 44231, 44561, 44972, 45595, 46021, 46344, and any later payment), plus the two payments of 31 Dec 2025 and 28 Nov 2025 (42858, 42440). Earlier payments (37143, 37144, 37262, 37263, 37817 of Feb to Apr 2025) are wanted too if the report allows it.
- Read-only export. Do not change ERP data.

## File name and rules (DEBTORS_DOCTRINE D21)
- Name the file **`MD0003_<YYYY-MM-DD>.TXT`** with the **export date**. A file without its export date is never current. Plain text, one file, no edits.
- State the export date and time. If a statement export (allocation detail excluded) is also produced the same day, deliver it as a **separate file** and say which is which; two different reports must not share one file name. Filing note for us: this file is filed under `analysis/debtors/MD0003/raw/Enquiry/`, not as the account's statement TXT, so the statement configuration is not repointed by it.
- **Intake checks we will run before filing:** every running `BALANCE` equals the previous `BALANCE` plus `AMOUNT`; the last running balance equals the header `CURRENT BALANCE` and the `TOTAL TRANSACTIONS` line; where the header shows a non-zero `UD PAY/CHEQUES`, the gap between the last running balance and the header equals that figure exactly. A file that fails is returned, not filed.
- Remove markdown escape characters if the connector adds any (`\#`, `\_`, `\~`, `\*`) before delivery, or tell us so we do.

## What we need to know about the contents
- For each payment, whether the allocation lines add up to the payment amount (blank-`INVNO` lines are fine, we want to see them).
- Whether the ERP has re-allocated or corrected anything since 2026-08-09, in particular payments **42440** (R47,511.17), **42858** (R9,730.26), **42051** (R35,770.31; the R3,047.50 CYL posting gap on invoice 46445 / credit note 13494, ticket MD3-CYL-001) and invoice **48372**.

## Delivery
Put the file in the ADM-79 Google Drive folder (https://drive.google.com/drive/folders/1Pdy9jg-HGFgHeSxzNsmtjvnCcW4uwKyW) or upload it directly into the Claude Code session. Once received it is verified (header, running-balance chain, totals) and filed; nothing in the ERP is modified.

## Why it matters (for the reviewer)
- The ruling pack `docs/previews/2026-10-13_MD0003_ruling_pack.md` holds Q1 (42440 / 42858) on this file.
- Reference: `docs/requests/2026-10-10_erp_export_request.md` (format), `docs/previews/2026-10-13_MD0003_analysis.md` (findings).
