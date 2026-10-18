# COF001 / COF002 header lookup for the 2024 cross-posting question, 2026-10-17

**Connector-sourced (read-only SELECT on `transaction_headers`), authorised by the operator in the COF001 session on 2026-10-17 ("Authorise the connector replay for COF002 headers").** Not a script replay: a direct header query (`query.sql`), so no md5 capture; the COF rows are saved in `COF_rows.csv` (hand-saved from the connector output, ASSERTED; re-run `query.sql` to verify). The DB is a copy of ERP exports (DRTX2025.TXT etc.), so this is header-level corroboration of the TXT, not independent proof. ERP payment tagging (`ref_no` = the invoice a payment was applied to) is corroboration at best (`business_rules.md` §3, §15). Nothing was decided or changed.

Answers the COF002 session's Q1 (its list: 29492, 30219, 31096, 32598, 32615, 37735, 29493, 29503, 29505, 44819, 44825, 44826).

## Findings

| # | Finding | Tag |
| :-- | :-- | :-- |
| 1 | **Receipts and invoices have separate number series.** The same number appears as an invoice under unrelated accounts (e.g. 29493 THOKOZA, 29503/29505 BARNYARD, 29646 PIGGL, 29691 SIBA, 29696 KNOX, 44819 FIRE AND VINE, 44825/44826 BIRD & CO) and as a receipt under COF001/COF002. The COF002 session's "adjacent document numbers" and "inverted against dates" reasoning is about the receipt series; invoice numbers are irrelevant to it. Receipts 29493, 29503, 29505 (COF002 `Ud Paymnt`), 44819/44825/44826 and COF001 30219/29646/29696 have **no header row** in the DB (UD payments are not synced; group A is the open ingest gap). | ASSERTED (`COF_rows.csv`, `query.sql`) |
| 2 | **Payment 29492 (COF001, 2024-04-18, STAT:102, -R7,628.30): the ERP applied it to COF001 invoice 30276** (`ref_no 00030276`, flag Y). Candidate A (29492 belongs to COF002 invoice 31096) is therefore **contradicted by the ERP's own tag**, though tagging alone proves nothing. | ASSERTED |
| 3 | **Invoice 31096 (COF002, R7,628.30, 2024-04-08): ERP flag N** (not paid). Invoice 30276 (COF001) flag Y. Consistent with the ledger: 31096 is unpaid. | ASSERTED |
| 4 | **The second R7,628.30 receipt is 30219 (COF001, 2024-03-12, STAT:101), which has no DB header** (group A). Its ERP tag is unknown from the DB. So the question "which of 29492 and 30219 is the extra receipt" cannot be answered from headers: 29492 is tagged to 30276; 30219's header is missing. The group A re-ingest (H-029) would show it. | ASSERTED |
| 5 | **R8,512.36, 2024-07-31 to 08-03.** COF002 receipt **32598** (STAT:106) is applied to COF002 invoice **34681** (`ref_no 00034681`). COF002 receipt **37735** (STAT:105, back-dated 2024-07-31) is a split receipt whose non-Alloc slices sum to -R8,512.36 but are applied to **older invoices** (22838, 15919, 16394, 17260, 15669, 40384, 16179), **not** to 34681. So the ERP does **not** show invoice 34681 paid twice; the COF002 session's "paid twice" reading rests on the amounts only. | ASSERTED |
| 6 | COF001 receipt **32615** (STAT:106) has slices summing -R8,512.36 flagged `Recon` and is matched to Bank UD 32615 (+R8,512.36), whose account name is **"MAGTAPE CREDIT COFFEEBERRY AVE"**. That is the bank statement text, so **this R8,512.36 is bank-reconciled to COF001**. The COF002 receipts 37735 and 32598 carry no `Recon` row in this data. | ASSERTED |

## What this does to the COF002 candidates
- **Candidate A (29492 -> 31096):** weakened (finding 2). Not ruled out: the ERP tag is a clerk's choice and the earlier-dated twin 30219 is invisible (finding 4).
- **Candidate B (R8,512.36 three times):** the "paid twice" part is **not supported** by ERP tags (finding 5). What remains open is whether one bank credit of R8,512.36 (finding 6, matched to COF001) was the cash behind one, two or three ledger receipts. That needs the bank statement lines for STAT 105/106 and a COF002 export.
- Neither is proven. No COF001 balance changes. COF001 Q1 (-R16,256.52) stays closed.

## Still needed to settle it
Bank statement lines STAT 101, 102, 105, 106 (payer name and amount); the headers of 30219, 29646, 29696 (group A re-ingest, H-029, gives the ERP tag as a by-product, no allocation-detail export); dated COF001 and COF002 exports from the same sitting.
