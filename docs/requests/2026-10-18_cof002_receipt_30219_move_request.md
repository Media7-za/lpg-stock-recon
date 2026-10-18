# ERP agent request — move COF001 receipt 30219 to COF002 (DRAFT, NOT POSTED) — 18 Oct 2026

**DRAFT for the operator to post (suggested: a follow-up comment on Linear ADM-138). Not posted by the analyst session. Nothing here may be executed until the operator confirms in writing on the issue after the header facts and bank line below are in.**
**To:** ERP agent / @Sharmin  **From:** Louis (operator), drafted by Claude Code (COF002 2024 analyst session)
**Operator ruling (COF002-R001, `analysis/debtors/COF002/config/operator_rulings.json`):** the R7,628.30 receipt that moves is **COF001 payment 30219** (2024-03-12, TRANSF STAT:101), not 29492. It was keyed to COF001 and belongs to **COF002**, against the unpaid COF002 invoice **31096** (2024-04-08, DN#8770 SO#8135, R7,628.30). This is an operator ruling, not something the analysis proved.

## Step 1 (read-only, please do first)
For document 30219, and for 29492, 31096 and 30276: customer account code on the header, entered-by user, date and time entered, any last-changed entry, original date and STAT/bank reference. 30219 has no row in our database (the COF001 group A gap), so please also say whether it exists in the ERP under COF001 only, and re-run the HEADERS sync if you can. No allocation detail is needed.

## Step 2 (only after the operator confirms in writing on the issue)
1. Reverse receipt 30219 on COF001 (R7,628.30, 2024-03-12, STAT:101).
2. Re-post the same receipt to COF002 with the same amount and the same bank reference (date to be confirmed by the operator against the STAT:101 bank line; the original date is 2024-03-12).
3. **Nothing else changes.** In particular do not touch 29492, 32598, 32615 or 37735 (the R8,512.36 receipt is a separate open question), and do not allocate anything manually.

## Step 3
Dated, same-sitting COF001 and COF002 DEBENQ exports after the change (as already requested), so the corrected balances can be verified.

## What the operator expects (arithmetic, not a promise)
COF001 balance -16,256.52 becomes -8,628.22. COF002 balance 15,646.26 becomes 8,017.96. Both are review-only until verified on the new exports. No statement or message goes to the customer.

## Not part of this request
Bank statement lines for STAT:101 and STAT:102 (operator/finance), the COF001 quarantine of 29492, and the COF001 balance-of-record ruling are the operator's separate decisions.
