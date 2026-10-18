# Statement of Account: COFFEEBERRY-CASCADES (COF001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Apr 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** COF001
**Combined Opening B/F:** R-1,076.02 (ERP verified — source: `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` ERP running balance after the last March 2026 row (payment 43758, 24 Mar 2026), COF001_CURRENT.TXT line 157)
**LPG Opening B/F (1A):** R-853.72 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R7,406.00
**Quarantine adjustment:** opening 1A excludes quarantined payment 29492 (18 Apr 2024, R-7,628.30), dated before this period; the combined opening B/F above is the ERP figure.
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-18 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Apr 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`). Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-853.72** |
| 02 Apr 2026 | Invoice | 50062 | 8,493.21 | 7,639.49 |
| 09 Apr 2026 | Payment | 43966 | -8,493.21 | -853.72 |
| 17 Apr 2026 | Invoice | 50273 | 8,206.92 | 7,353.20 |
| 21 Apr 2026 | Payment | 44067 | -8,206.92 | -853.72 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-853.72** |
| 05 May 2026 | Invoice | 50513 | 9,493.71 | 8,639.99 |
| 11 May 2026 | Payment | 44300 | -9,493.71 | -853.72 |
| 21 May 2026 | Invoice | 50808 | 9,671.37 | 8,817.65 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **8,817.65** |
| 01 Jun 2026 | Payment | 44560 | -9,671.37 | -853.72 |
| 09 Jun 2026 | Invoice | 51107 | 9,311.22 | 8,457.50 |
| 15 Jun 2026 | Payment | 44753 | -9,311.22 | -853.72 |
| 23 Jun 2026 | Invoice | 51372 | 8,683.50 | 7,829.78 |
| 29 Jun 2026 | Payment | 44968 | -8,683.50 | -853.72 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-853.72** |
| 08 Jul 2026 | Invoice | 51705 | 9,034.40 | 8,180.68 |
| 15 Jul 2026 | Payment | 45209 | -9,034.40 | -853.72 |
| 22 Jul 2026 | Invoice | 52014 | 9,349.56 | 8,495.84 |
| 31 Jul 2026 | Payment | 45480 | -9,349.56 | -853.72 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-853.72** |
| 20 Aug 2026 | Invoice | 52691 | 3,284.35 | 2,430.63 |
| 24 Aug 2026 | Payment | 45896 | -3,284.35 | -853.72 |
| 26 Aug 2026 | Invoice | 53619 *(split of R18,700.33; lane assumed)* | 3,002.83 | 2,149.11 |
| 26 Aug 2026 | Crd Note | 15558 *(split of R-18,700.33)* | -3,002.83 | -853.72 |
| 26 Aug 2026 | Crd Note | 15803 *(lane assumed)* | -3,002.83 | -3,856.55 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **-3,856.55** |
| 09 Sept 2026 | Bank XFer | 7473 | 3,002.33 | -854.22 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries. Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **7,406.00** |
| 02 Apr 2026 | Invoice | 50063 | 7,590.00 | 14,996.00 |
| 02 Apr 2026 | Crd Note | 14703 | -7,590.00 | 7,406.00 |
| 17 Apr 2026 | Invoice | 50274 | 7,072.50 | 14,478.50 |
| 19 Apr 2026 | Crd Note | 14768 | -7,072.50 | 7,406.00 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **7,406.00** |
| 05 May 2026 | Invoice | 50515 | 7,590.00 | 14,996.00 |
| 05 May 2026 | Crd Note | 14854 | -7,590.00 | 7,406.00 |
| 21 May 2026 | Invoice | 50809 | 7,590.00 | 14,996.00 |
| 21 May 2026 | Crd Note | 14939 | -7,590.00 | 7,406.00 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **7,406.00** |
| 23 Jun 2026 | Invoice | 51373 | 6,555.00 | 13,961.00 |
| 24 Jun 2026 | Crd Note | 15113 | -6,555.00 | 7,406.00 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **7,406.00** |
| 08 Jul 2026 | Invoice | 51706 | 7,072.50 | 14,478.50 |
| 09 Jul 2026 | Crd Note | 15227 | -7,072.50 | 7,406.00 |
| 22 Jul 2026 | Invoice | 52015 | 7,590.00 | 14,996.00 |
| 23 Jul 2026 | Crd Note | 15312 | -7,590.00 | 7,406.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **7,406.00** |
| 20 Aug 2026 | Invoice | 52750 | 1,725.00 | 9,131.00 |
| 20 Aug 2026 | Invoice | 52751 | 2,932.50 | 12,063.50 |
| 20 Aug 2026 | Crd Note | 15531 | -1,725.00 | 10,338.50 |
| 20 Aug 2026 | Crd Note | 15532 | -2,415.00 | 7,923.50 |
| 26 Aug 2026 | Invoice | 53619 *(split of R18,700.33; lane assumed)* | 15,697.50 | 23,621.00 |
| 26 Aug 2026 | Crd Note | 15558 *(split of R-18,700.33)* | -15,697.50 | 7,923.50 |
| 26 Aug 2026 | Crd Note | 15804 *(lane assumed)* | -15,697.50 | -7,774.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | -854.22 |
| Part 1B — CYL Deposits | -7,774.00 |
| **Combined (1A + 1B)** | **-8,628.22** |
| ERP `CURRENT BALANCE` (TXT header) | -16,256.52 |
| Less: quarantined documents held aside | -7,628.30 |
| **ERP balance excluding quarantined documents** | **-8,628.22** |
| **Variance (Combined − ERP excl. quarantine)** | **0.00** |

---

## Quarantined Documents (held aside)

| Date | Entry Type | Doc # | Amount (R) | Would post to | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 18 Apr 2024 | Payment | 29492 | -7,628.30 | 1A | QUARANTINED (2026-10-18) |

*Held aside from Part 1A and 1B and the running balances above, pending review (documents dated before this period are excluded from the opening balances). They remain in the ERP balance, so the bridge shows them as a reconciling line. Record: `config/quarantine.json`.*

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF001` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-5** |
| 02 Apr 2026 | Invoice | 50063 | 0 | 0 | +3 | 0 | +5 |
| 02 Apr 2026 | Crd Note | 14703 | 0 | 0 | -3 | 0 | -5 |
| 17 Apr 2026 | Invoice | 50274 | 0 | 0 | +2 | 0 | +5 |
| 19 Apr 2026 | Crd Note | 14768 | 0 | 0 | -2 | 0 | -5 |
| **End Apr** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-5** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-5** |
| 05 May 2026 | Invoice | 50515 | 0 | 0 | +3 | 0 | +5 |
| 05 May 2026 | Crd Note | 14854 | 0 | 0 | -3 | 0 | -5 |
| 21 May 2026 | Invoice | 50809 | 0 | 0 | +3 | 0 | +5 |
| 21 May 2026 | Crd Note | 14939 | 0 | 0 | -3 | 0 | -5 |
| **End May** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-5** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-5** |
| 23 Jun 2026 | Invoice | 51373 | 0 | 0 | +1 | 0 | +5 |
| 24 Jun 2026 | Crd Note | 15113 | 0 | 0 | -1 | 0 | -5 |
| **End Jun** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-5** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-5** |
| 08 Jul 2026 | Invoice | 51706 | 0 | 0 | +2 | 0 | +5 |
| 09 Jul 2026 | Crd Note | 15227 | 0 | 0 | -2 | 0 | -5 |
| 22 Jul 2026 | Invoice | 52015 | 0 | 0 | +3 | 0 | +5 |
| 23 Jul 2026 | Crd Note | 15312 | 0 | 0 | -3 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-5** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-5** |
| 20 Aug 2026 | Invoice | 52750 | 0 | 0 | +1 | 0 | +1 |
| 20 Aug 2026 | Invoice | 52751 | 0 | 0 | +1 | 0 | +2 |
| 20 Aug 2026 | Crd Note | 15531 | 0 | 0 | -1 | 0 | -1 |
| 20 Aug 2026 | Crd Note | 15532 | 0 | 0 | 0 | 0 | -2 |
| 26 Aug 2026 | Crd Note | 15558 | 0 | 0 | -7 | 0 | -10 |
| **End Aug** | **Closing Balance** | — | **0** | **-1** | **-3** | **10** | **-15** |

---

<!-- INTERNAL_ONLY_START -->

## Review Notes (internal)

*Added by `COF001/scripts/run_v5_statement.mjs`; the tables above are shared-generator output.*

1. **Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line.
2. **Documents not yet in the database (lane ASSUMED).** The 2026-10-16 ERP extract adds 15803 (Crd Note -3,002.83), 15804 (Crd Note -15,697.50) and 53619 (Invoice +18,700.33). The database has no lines for them. 15803 and 15804 equal the gas and cylinder parts of 15558 exactly, so they are routed 1A and 1B. 53619 equals 15558 in total and is assumed to reverse it line for line (1A +3,002.83, 1B +15,697.50). If 53619 was wholly gas, 1A would be R15,697.50 higher and 1B R15,697.50 lower; the combined balance would not change. Replace with database lines once ingested.
3. **Net effect of the 15558 correction.** 15558 (-18,700.33) is reversed by 53619 (+18,700.33) and re-issued as 15803 + 15804 (-18,700.33). The ERP closing balance is unchanged at R-16,256.52.
4. **Custody (Part 2).** Quantities come from the database and have no lines for 53619 or 15804. If 53619 reverses 15558 and 15804 re-issues it, they cancel and the closing quantities are unchanged.
5. **Quarantined payment 29492 (2024-04-18, R-7,628.30).** Quarantined by the operator on 2026-10-18; reason not stated. Initial observation (partly superseded by the update below): ASSERTED from TXT: payment 30219 (12 Mar 2024, -7,628.30) was posted for the same amount against invoice 30276 (9 Mar 2024, 7,628.30). With 29492 also posted, the account is R7,628.28 in credit from 18 Apr 2024 until later invoices absorb it. Not confirmed as a duplicate. Held aside: excluded from Part 1A and 1B and from running balances. Still included in the ERP balance, so the bridge shows it as a reconciling line. Not treated as a cylinder-deposit payment (business_rules.md sections 3 and 4): no allocation to the cylinder ledger and no cylinder write-off. **Update 2026-10-18 (ASSERTED - database evidence (bank and ERP reconciliation tables), not confirmed against the ERP).** Payment 29492 appears to belong to COF002 (COFFEEBERRY-HILTON, bank name 'Coffeeberry Avenues'), not COF001. It was posted to COF001 against COF001 invoice 30276, which payment 30219 had already settled. Evidence: Bank credit 2024-04-18, R7,628.30, described 'Magtape Credit Coffeeberry Avenues 00031096' (bank_transactions, status MATCHED). 31096 is a COF002 invoice dated 2024-04-08 for R7,628.30. That bank credit is approved-matched (EXACT_AMOUNT_DATE) to ERP entry refDoc 00029492 (STAT:102), whose ERP description is 'MAGTAPE CREDIT COFFEEBERRY AVE'. The earlier bank credit 2024-03-12, R7,628.30, described 'Magtape Credit Coffeeberry Cascades 00030276', is the COF001 receipt that payment 30219 recorded for invoice 30276. In the database, transaction_headers shows 29492 with reference 00030276 (COF001's invoice). No payment of R7,628.30 exists on COF002, and every other COF002 invoice from 15 Feb to 15 Jun 2024 has a same-amount payment within days; 31096 does not. The 'observation' above (29492 as a second payment of the same invoice by COF001) is not supported by the bank data: the two R7,628.30 receipts came from two different payers. Not checked: COF002's ERP statement (no TXT in the repo): whether invoice 31096 is still open there, or was settled another way. Whether the ERP has since reposted or reversed 29492. The quarantine on COF001 stands as a hold-aside until the ERP reposts 29492 to COF002. COF002 would then show invoice 31096 paid. This statement is quarantine-adjusted (the payment is dated before this period, so the opening 1A balance excludes it); a statement whose config does not set `quarantineFile` is not adjusted. Reopen when: The ERP reverses, refunds or reallocates payment 29492. Bank statement evidence shows only one receipt of 7,628.30 for invoice 30276, or shows 29492 belongs to another invoice. The operator rules that 29492 is a cylinder-deposit payment (business_rules.md sections 3 and 4 then apply). Payment 30219 is itself reversed or reallocated.
6. **Database coverage.** All invoices and credit notes in the window were matched to the database by document and amount (see `reports/COF001_DB_COVERAGE_2026-10-16.md`). Three documents in May 2026 are dated one day later in the database (14854, 50513, 50515).
7. **Generator run.** The shared generator was run unchanged (except as noted) against `data/db_snapshot_2026.json` (rows pulled from Supabase on 2026-10-16) because `DATABASE_URL` is not set in cloud sessions. Fixes made to the shared generator: the TXT header balance regex accepts a minus sign, so credit balances no longer read as NaN; an optional `periodEnd` limits the window and takes the closing check from the ERP running balance on the last row inside it.
8. **Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).

<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R-854.22 |
| Cylinder Financial Balance (Part 1B close) | R-7,774.00 |
| **Total Debtor Balance** | **R-8,628.22** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg | -1 | R690.00 | R-690.00 |
| 9kg | -3 | R517.50 | R-1,552.50 |
| D.1 | 10 | R1,150.00 | R11,500.00 |
| S.1 | -15 | R1,150.00 | R-17,250.00 |
| **Total** | **-9** | — | **R-7,992.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-7,774.00 | R-7,992.50 | R218.50 |
| Sub-ledger tie (1A + 1B vs combined) | R-8,628.22 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-16,256.52  
**Quarantined documents (held aside):** R-7,628.30  
**ERP balance excluding quarantined documents:** R-8,628.22  
**Reconstructed Balance (1A + 1B):** R-8,628.22  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
