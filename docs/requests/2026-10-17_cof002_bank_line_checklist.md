# Bank-line checklist for COF002 suspects A and B (operator / finance), 2026-10-17

Not an ERP request. No allocation detail needed. For each line record: **value date, amount, payer name, bank reference, statement number and line**. A customer remittance advice naming the invoice outranks everything here (`business_rules.md` section 15, order A).

| # | Statement | Look for | Why it matters |
| :-- | :-- | :-- | :-- |
| 1 | STAT 101 (ERP dates 2024-03-05 to 2024-03-25) | A credit of **R7,628.30** around 2024-03-12 (COF001 payment 30219). Payer name and reference | Was there a R7,628.30 receipt on 101, and from which payer (Cascades or Hilton)? |
| 2 | STAT 102 (ERP dates 2024-04-03 to 2024-04-26) | A credit of **R7,628.30** around 2024-04-18 (COF001 payment 29492). Payer name and reference | Two R7,628.30 receipts (101 and 102) or one? Which payer paid on 102? COF002 invoice 31096 (2024-04-08, R7,628.30) is unpaid in the ledger |
| 3 | STAT 105 (ERP dates 2024-07-09 to 2024-07-31) | A credit of **R8,512.36** around 2024-07-31 (COF002 payment 37735, Bank UD 32615 "MAGTAPE CREDIT COFFEEBERRY AVE") | Payer and reference of the 105 receipt |
| 4 | STAT 106 (ERP dates 2024-08-03 to 2024-08-22) | A credit of **R8,512.36** around 2024-08-03 (COF002 payment 32598, COF001 payment 32615) | One receipt of R8,512.36 across 105 and 106 or two? A single receipt means COF002 holds an extra R8,512.36 |
| 5 | Both statements | Any other credit of R7,628.30 or R8,512.36 from COFFEEBERRY accounts in 2024-03 to 2024-08 | Rules out a third receipt |

Answers to bring back: number of bank receipts for each amount, payer name on each, and the reference text (does it say Cascades, Hilton, a delivery note or an invoice number). Operator decision only after that; nothing is ruled from the ledger alone.
