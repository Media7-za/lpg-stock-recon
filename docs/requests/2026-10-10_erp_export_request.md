# ERP export request — debtor statements (10 Oct 2026)

**To:** ERP agent / @Sharmin  **From:** Louis (operator), drafted by Claude Code
**Purpose:** prove each account's ERP balance with an open-items statement (B/F + open documents = ERP CURRENT BALANCE, variance R0.00). Matcher v5 is ratified; accounts below have no current export, so their balances cannot be proven.

## How to export (same as the 8 Oct files)
- Same debtor enquiry report (DEBENQ) used for the 8 Oct exports: full history from the first transaction to the date of export, **with the header block (account, name, B/F, CURRENT BALANCE)** and running balance column.
- Name each file `<CODE>_<YYYY-MM-DD>.TXT` (export date). Plain text, one file per account, no edits.
- State the export date/time for each file. Export all files in one sitting so balances are as at the same moment.
- Read-only exports only. Do not change ERP data.

## Priority 1 — needed to finish current work
| Account | Why | Folder |
| :-- | :-- | :-- |
| BU0009 | No export in repo; ruling pending (ADM-89) | `analysis/debtors/BU0009/raw/` |
| JIM001 | No export in repo; batch payer without remittances (ADM-89) | `analysis/debtors/JIM001/raw/` |
| TWK003 | Child of TWK AGRI; existing file undated (assumed R-300.00) | `analysis/debtors/TWK002/raw/` |
| TWK004 | Child of TWK AGRI; existing file undated (assumed R0.00) | `analysis/debtors/TWK002/raw/` |

These four were attached to ADM-79 on 8 Oct, but this environment cannot download Linear's file host. Either re-upload them to the ADM-79 Drive folder or confirm they are the 8 Oct exports and place them there.

## Priority 2 — active accounts with no recent export
BU0005, CAP000 (newest file dated 2025-03), DON001, FAM000, FAM001 (no export at all), GAS004, JAY000, WO0001.

## Priority 3 — confirm if still needed
- TAN001, WES004 (status "collection")
- BR0001, BU0002, IVE001 (export dated 22 Jul 2026)
- Creditor 008ORY (`008ORYCURRENT.TXT`, `CREDENQ008ORY.TXT`; undated)

## Delivery
Put the files in the ADM-79 Google Drive folder (https://drive.google.com/drive/folders/1Pdy9jg-HGFgHeSxzNsmtjvnCcW4uwKyW) or upload them directly into the Claude Code session. Once received they are verified (header, B/F, running balance chain, totals) and filed under each account's `raw/`; nothing in the ERP is modified.
