# FOR POSTING (not posted by the drafting session): ADM-135 rewritten for a reader with no context

**Why:** cold-read review of ADM-135 and the group A draft found they would not let Sharmin act without help (see "Review findings" at the end). This version folds the group A re-ingest into ADM-135, so she has ONE ticket and ONE export sitting. Operator to confirm before posting (decision at the end).

**How to post:** replace the ADM-135 description with section A, then add section B as a comment (it withdraws the conflicting earlier comments). Do not delete anything. Section C is the old group A draft, superseded.

---

## A. New ADM-135 description (paste over the old one)

**@Sharmin: one request for COF001 (COFFEEBERRY-CASCADES), one sitting. Please read the whole ticket; earlier comments on it are superseded by this description.**

**What we need, in one line:** a fresh, dated set of three ERP exports for account COF001, all taken in the same sitting, so we can prove the account's balance and load its documents into our database.

**What each file is**
1. **Statement (DEBENQ)** for COF001. The plain version: *allocation detail OFF* (the header line `EXCLUDE: ALLOCATION DETAIL` is expected and fine; INVNO is blank on payment rows; that is what we want). **Full history from the first transaction (01/03/2022) to today, with the opening line `BALANCE B/F` and the running balance column.** Name it `COF001_<YYYY-MM-DD>.TXT` using today's date; plain text, unedited. Please tell us the export date **and time**.
2. **DTRX (document headers) export** for COF001 for the same period. This is the file DataHub loads into the database table `transaction_headers`.
3. **Items export** (CURRENT/STTR, document lines) for COF001 for the same period. It feeds `transaction_items`.

**Why we need them (so you can judge edge cases)**
- Four COF001 payments appear in the statement but have **no header row in the database**: 24732 (29/09/2023, R6,625.90), 30219 (12/03/2024, R7,628.30), 29646 (20/03/2024, R8,390.33), 29696 (25/03/2024, R8,486.48), together R31,131.01. The DTRX export should contain them. If a payment is **not** in the DTRX source file, tell us which file and period you used.
- The statement balance we are proving is **-R16,256.52** (customer in credit), the operator has confirmed it.
- The file `COF001_2026-10-14.TXT` you put in the Drive folder on 14 Oct is received. It is a partial (opens with B/F 15,939.43 and starts at 29/09/2023) and has allocation detail switched on, which we do not want. Thank you; it is not wrong, it is just not the full-history plain version.

**Please also confirm (one line is enough):** the correction of credit note 15558 (reversed by invoice 53619, re-issued as credit notes 15803 and 15804) is complete in the ERP, and these exports were taken after it.

**Do NOT**
- Switch allocation detail on. ERP payment allocation is not used as evidence; we rebuild it ourselves.
- Change anything in the ERP. These are read-only exports.
- Include COF002 (COFFEEBERRY-HILTON). It is a different account.

**Where to put the files:** the ADM-79 Drive folder https://drive.google.com/drive/folders/1Pdy9jg-HGFgHeSxzNsmtjvnCcW4uwKyW (all three, same day). If you can commit to the repo instead, only the dated statement goes to branch `claude/payment-matching-mechanisms-4h34be` as `analysis/debtors/COF001/raw/COF001_<YYYY-MM-DD>.TXT`; the other two follow your usual DataHub route. If you do not run DataHub uploads, say so in a comment and tell us who does.

**Done means:** all three files are in place, and you have commented here with: the export date and time, the statement's last transaction date and CURRENT BALANCE, and whether the four payments above are in the DTRX file. We then check the files (running balance adds up; last balance equals the header balance and TOTAL TRANSACTIONS line) and reply here. A file that fails the check comes back to you.

**Words used:** DEBENQ = the debtor enquiry statement report. DTRX = document header export. Items = document line export. B/F = balance brought forward. DataHub = the loader that feeds our database.

## B. Comment to add on ADM-135 (supersedes earlier comments)

> Update from the COF001 analyst. This replaces earlier guidance on this ticket.
> 1. **Withdrawn:** my comment of 14 Oct asking for allocation detail INCLUDED and INVNO filled is wrong. We do not want allocation detail. Please ignore it.
> 2. **Answered:** the question of 14 Oct about which balance is current is settled by the operator: **-R16,256.52** is correct (the R7,958.38 in the shared dump was not the balance). No reply needed.
> 3. **Received, thanks:** `COF001_2026-10-14.TXT` (Drive) and the 16 Oct window extract showing credit note 15558's reversal and re-issue.
> 4. **Still needed:** the three-file paired export described in the description above (plain statement with full history, DTRX headers, items), all from one sitting.

## C. Superseded
`docs/requests/2026-10-17_cof001_group_a_reingest_FOR_POSTING.md` (separate group A ticket) is replaced by section A above, unless the operator prefers a separate ticket.

---

## Review findings (why the old tickets were not enough)
| # | Gap a cold reader hits | Fix in this version |
| :-- | :-- | :-- |
| 1 | ADM-135 has two contradictory instructions: the description (allocation detail not needed) and my 14 Oct comment (allocation detail INCLUDED). Sharmin's 14 Oct file followed the comment (no EXCLUDE line, INVNO filled). | Section B withdraws the comment. |
| 2 | The ticket never says whether her 14 Oct delivery was accepted. Status is still Todo, so she cannot tell if anything remains. | Description says received, why it is not the file we need, and what remains. |
| 3 | A question to her (which balance is current) is unanswered and now moot. | Answered in B. |
| 4 | The first ask says "full history" but the delivered file is a partial (B/F 15,939.43). Nobody told her. | Stated explicitly. |
| 5 | The group A draft says "re-run the HEADERS sync", "DRTX/DTRX", `transaction_headers`, ITEMS. Those are our internal names; the real procedure is a paired export (statement + DTRX + items, same sitting) loaded by DataHub (`SKILL_Human_Sources_Agent.md` section 6). She may not run DataHub. | Plain description of each file; says to tell us who loads if not her. |
| 6 | Unknown who owns the credit note 15558 fix and whether the files include it. | One-line confirmation requested. |
| 7 | No definition of done, no jargon glossary. | Both added. |
| 8 | The ticket mixes two delivery routes (Drive and a git branch) and a 17 Oct branch note that needs git access. | Drive first; git optional. |

## Decision for the operator
Post this as the single ADM-135 (recommended), or keep the group A re-ingest as a separate ticket? Also confirm you want a **full-history plain re-export** at all, or whether the 14 Oct partial plus our undated interim files is acceptable (the partial lacks history before B/F 15,939.43, so the statement could not be rebuilt from it alone).

## New fact worth knowing (ASSERTED, first rows of `COF001_2026-10-14.TXT` in Drive, read 2026-10-17)
That file already shows the ERP's tag (INVNO) for three of the four group A payments: 24732 -> invoice 24815, 29646 -> 30007, 29696 -> 30576. **Payment 30219 (R7,628.30, 12/03/2024) has a blank INVNO.** Together with the DB header lookup (payment 29492 is tagged to invoice 30276), 30219 looks like the untagged duplicate rather than 29492. ERP tagging is corroboration only. The file is not yet filed in the repo.
