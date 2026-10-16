# ERP export request — COF002 (and COF001 at the same instant) — 16 Oct 2026

**POSTED 2026-10-16 as Linear ADM-138 (assigned to Sharmin, related to ADM-135) at the operator's request; sections 1 and 2 plus the missing-header re-ingest (30219, 29646). Section 3 (bank lines) stays with the operator.**
**To:** ERP agent / @Sharmin  **From:** Louis (operator), drafted by Claude Code (COF002 2024 analyst session)
**Why:** COF002 (COFFEEBERRY-HILTON) has only undated year-split and CURRENT enquiry files (branch `claude/exciting-lamport-rvb277`, commit `fd8a268`). Three of the four fail D21 intake, and none is dated (`docs/previews/2026-10-16_COF002_2024_analysis.md`, section 2). We need dated, verified exports so COF001 and COF002 can be compared at the same instant.

## 1. Statement exports (same DEBENQ report as the 8 Oct files; read-only)
| File name | Account | Content |
| :-- | :-- | :-- |
| `COF002_<YYYY-MM-DD>.TXT` | COF002 | Full history from the first transaction (March 2022) to the export date, **one file**, header block (B/F, CURRENT BALANCE, UD PAY/CHEQUES), running balance column |
| `COF001_<YYYY-MM-DD>.TXT` | COF001 | Same, **same date, same sitting** |

- **One file per account, not year splits.** The year-split COF002 files omit five payments that sit only in the CURRENT file (24733, 44819, 44825, 44826, 29691), so each year file's last balance differs from the header and fails D21.
- Statement posture: **`EXCLUDE: ALLOCATION DETAIL` is fine and expected.** We are not asking for allocation detail. ERP payment allocation is not used to settle anything (`business_rules.md` section 3 and 15).
- Include undeposited items (`INCLUDE: UD PAYMENTS, UD CHEQUES, CREDIT CLAIMS`) and state the header UD figure, even if it is 0.00. The first COF002 CURRENT export carried three `Ud Paymnt` rows (29493, 29503, 29505, -R9,537.82) that the later export shows as Payments 44826, 44825, 44819.
- State the export date and time for both files. Name them with the export date (D21: an undated file is never current).

## 2. Document header facts for eight documents (not allocation detail; read-only; only if the ERP document enquiry shows them)
For each document: **customer account code on the header, entered-by user, date and time entered, any "last changed" or audit entry, and the document's original date and STAT/bank reference.**

| Doc | Account (ledger) | Entry | Date | Amount |
| :-- | :-- | :-- | :-- | --: |
| 29492 | COF001 | Payment, STAT:102 | 2024-04-18 | -R7,628.30 |
| 30219 | COF001 | Payment, STAT:101 | 2024-03-12 | -R7,628.30 |
| 31096 | COF002 | Invoice DN#8770 | 2024-04-08 | R7,628.30 |
| 30276 | COF001 | Invoice | 2024-03-09 | R7,628.30 |
| 32598 | COF002 | Payment, STAT:106 | 2024-08-03 | -R8,512.36 |
| 37735 | COF002 | Payment, STAT:105 | 2024-07-31 | -R8,512.36 |
| 32615 | COF001 | Payment, STAT:106 and Bank UD, STAT:105 | 2024-08-03 | -R8,512.36 / +R8,512.36 |
| 34681 | COF002 | Invoice DN#9635 | 2024-07-29 | R8,512.36 |

Question to answer: was any of 29492, 32598, 32615 originally keyed to the other account, and was any re-dated or re-numbered? Do not change anything in the ERP.

## 3. Bank evidence (operator / finance, not the ERP agent)
Bank statement lines for **STAT 101, 102, 105 and 106**: the lines of R7,628.30 (101 and 102) and R8,512.36 (105 and 106), with payer name and reference. A remittance advice from COFFEEBERRY for either amount would outrank everything else (`business_rules.md` section 15, order A).

## Delivery and use
Drive folder ADM-79 or a direct upload. On receipt: D21 verification with `analysis/debtors/COF001/scripts/d21_intake_check.mjs`, then repoint the input paths in `docs/previews/2026-10-16_COF002_2024/cof002_2024_crosspost_search.mjs` at the dated files, re-run it and update the COF002 preview. No allocation detail is requested and nothing in the ERP is modified.
