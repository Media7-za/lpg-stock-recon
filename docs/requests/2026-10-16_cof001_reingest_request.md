> **SUPERSEDED 2026-10-17 by `2026-10-17_cof001_group_a_reingest_FOR_POSTING.md` (posting version).**

# Re-ingest request — COF001 payments missing from the database (16 Oct 2026)

**DRAFT for posting by the main session / operator. Not posted by the drafting (analyst) session.**
**To:** ERP agent / @Sharmin (or the data-ingest owner)  **From:** operator decision "re-ingest group A", drafted by Claude Code
**Context:** COF001 (COFFEEBERRY-CASCADES) ingest check (`analysis/debtors/COF001/reports/COF001_INGEST_COVERAGE_2026-10-16.md`) found the statement TXT has four Payment documents that have **no header row in the database** (last headers sync 2026-10-13). This blocks allocation, custody and SKU conclusions for the account. The statement balance is unaffected.

| Doc | Date | Ref | Amount (from the TXT) |
| :-- | :-- | :-- | --: |
| 24732 | 2023-09-29 | TRANSF STAT: 95 | -R6,625.90 |
| 30219 | 2024-03-12 | TRANSF STAT:101 | -R7,628.30 |
| 29646 | 2024-03-20 | TRANSF STAT:101 | -R8,390.33 |
| 29696 | 2024-03-25 | TRANSF STAT:101 | -R8,486.48 |
| | | **Total** | **-R31,131.01** |

**Please:** re-run the HEADERS (and ITEMS) sync so these four payments appear in `transaction_headers` for account COF001, or tell us why they cannot (for example, they are absent from the DTRX source file). Reply with the sync time. We then re-run `npm run debtors:ingest-check -- --debtor COF001` (needs the operator's connector-replay authorisation again).

**Also noted from the 16 Oct upload (ERP fix for credit note 15558):** the window extract shows 15558 (-R18,700.33) reversed by new invoice 53619 (+R18,700.33) and re-issued as credit notes 15803 (-R3,002.83, DN#22890) and 15804 (-R15,697.50, DN#22890); balance unchanged at -R16,256.52. We still need the **dated full-history export** (ADM-135) to rebuild; the window extract is undated and has no history.

Nothing in the ERP is modified by this request.

## Branch

Start your session from `claude/payment-matching-mechanisms-4h34be` and commit only dated raw exports (`<CODE>_<YYYY-MM-DD>.TXT`) to that branch, under `analysis/debtors/<CODE>/raw/`. Do not start from `main` or from another branch, and do not commit analysis or statement work there; analysis sessions use their own task branch and the PM merges it. If you cannot push to that branch, say so on the Linear ticket.
