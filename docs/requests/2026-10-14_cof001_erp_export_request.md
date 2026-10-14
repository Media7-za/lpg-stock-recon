# ERP export request — COF001 (14 Oct 2026)

**DRAFT for posting by the main session / operator. Not posted by the drafting session (analyst session, branch `claude/cof001-analysis`).**
**To:** ERP agent / @Sharmin  **From:** operator (Louis; confirm before it goes out), drafted by Claude Code
**Purpose:** onboard COF001 (COFFEEBERRY-CASCADES, terms 7) and prove its ERP balance with a v5 open-items statement (B/F + open documents = ERP CURRENT BALANCE, variance R0.00). The portfolio list shows R7,958.38 (ASSERTED, `analysis/debtors/shared/data/portfolio_candidates.csv`), but there is no per-account export for COF001 in the repo or on any origin branch, so the balance cannot be proven.

## What to export (same as the 8/10 Oct statement exports, model: `docs/requests/2026-10-10_erp_export_request.md`)
- Debtor enquiry report (DEBENQ), account **COF001 only**, full history from the first transaction to the date of export, **with the header block** (account, name, currency lines, **BALANCE B/F**, **CURRENT BALANCE**, UD PAY/CHEQUES, CREDIT CLAIMS, INCLUDE/EXCLUDE lines) and the running balance column.
- Statement version: allocation detail excluded is fine (that is the file the statement generator reads). Include UD payments/cheques and credit claims, as in the JIM001 header.
- Read-only. Do not change ERP data.
- **Do not combine with COF002** (COFFEEBERRY-HILTON). It is a different account; one file per account.

## File name and rules (DEBTORS_DOCTRINE D21)
- Name it **`COF001_<YYYY-MM-DD>.TXT`** (export date). An undated file is never current. Plain text, no edits. State the export date and time.
- Intake checks we run before filing: each running BALANCE equals the previous BALANCE plus AMOUNT; the last running balance equals the header CURRENT BALANCE and the TOTAL TRANSACTIONS line; where UD PAY/CHEQUES is non-zero, the gap between the last running balance and the header equals that figure exactly. A file that fails is returned, not filed.
- Remove markdown escape characters (`\#`, `\_`, `\~`, `\*`) if the connector adds any.

## Why the shared dumps are not enough (ASSUMED coverage, not proof)
- `ERP RAW DATA/DETRANS.TXT` holds 163 COF001 document rows, 2025-03-05 to 2026-02-18; no B/F and nothing after 18 Feb 2026.
- `analysis/debtors/shared/raw/april_dump.TXT` holds 8 COF001 rows (2 to 21 Apr 2026); nothing for Feb 19 to Mar 2026 or May to Oct 2026.
- The other dumps are stock-line files (no payments, no running balance).

## Delivery
ADM-79 Google Drive folder (https://drive.google.com/drive/folders/1Pdy9jg-HGFgHeSxzNsmtjvnCcW4uwKyW) or upload into the Claude Code session. Once received it is verified, filed under `analysis/debtors/COF001/raw/`, and the generator is run.

## Reference
`docs/previews/2026-10-14_COF001_onboarding.md`.
