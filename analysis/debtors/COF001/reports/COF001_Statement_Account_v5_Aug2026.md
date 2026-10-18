# Statement of Account: COFFEEBERRY-CASCADES (COF001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Aug 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** COF001
**Combined Opening B/F:** R-1,076.02 (ERP verified — source: `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` ERP running balance after the last July 2026 row (payment 45480, 31 Jul 2026), COF001_CURRENT.TXT line 187 and COF001_LATEST.TXT B/F)
**LPG Opening B/F (1A):** R5,183.78 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R1,368.50
**Quarantine adjustment:** opening 1A excludes quarantined payment 29492 (18 Apr 2024, R-7,628.30), dated before this period; the combined opening B/F above is the ERP figure.
**Lane override adjustment:** opening 1B is R7,406.00 per config, adjusted for invoice 45528 S.1 ×5 (09 Aug 2025, R6,037.50) moved to 1A (ASSUMED); opening 1A moves by the same amount. Record: `config/lane_overrides.json`.
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-18 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Aug 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`). Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **5,183.78** |
| 20 Aug 2026 | Invoice | 52691 | 3,284.35 | 8,468.13 |
| 24 Aug 2026 | Payment | 45896 | -3,284.35 | 5,183.78 |
| 26 Aug 2026 | Invoice | 53619 *(split of R18,700.33; lane assumed)* | 3,002.83 | 8,186.61 |
| 26 Aug 2026 | Crd Note | 15558 *(split of R-18,700.33)* | -3,002.83 | 5,183.78 |
| 26 Aug 2026 | Crd Note | 15803 *(lane assumed)* | -3,002.83 | 2,180.95 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **2,180.95** |
| 09 Sept 2026 | Bank XFer | 7473 | 3,002.33 | 5,183.28 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries. Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **1,368.50** |
| 20 Aug 2026 | Invoice | 52750 | 1,725.00 | 3,093.50 |
| 20 Aug 2026 | Invoice | 52751 | 2,932.50 | 6,026.00 |
| 20 Aug 2026 | Crd Note | 15531 | -1,725.00 | 4,301.00 |
| 20 Aug 2026 | Crd Note | 15532 | -2,415.00 | 1,886.00 |
| 26 Aug 2026 | Invoice | 53619 *(split of R18,700.33; lane assumed)* | 15,697.50 | 17,583.50 |
| 26 Aug 2026 | Crd Note | 15558 *(split of R-18,700.33)* | -15,697.50 | 1,886.00 |
| 26 Aug 2026 | Crd Note | 15804 *(lane assumed)* | -15,697.50 | -13,811.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 5,183.28 |
| Part 1B — CYL Deposits | -13,811.50 |
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

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-10** |
| 20 Aug 2026 | Invoice | 52750 | 0 | 0 | +1 | 0 | +1 |
| 20 Aug 2026 | Invoice | 52751 | 0 | 0 | +1 | 0 | +2 |
| 20 Aug 2026 | Crd Note | 15531 | 0 | 0 | -1 | 0 | -1 |
| 20 Aug 2026 | Crd Note | 15532 | 0 | 0 | 0 | 0 | -2 |
| 26 Aug 2026 | Crd Note | 15558 | 0 | 0 | -7 | 0 | -10 |
| **End Aug** | **Closing Balance** | — | **0** | **-1** | **-3** | **10** | **-20** |

---

<!-- INTERNAL_ONLY_START -->

## Review Notes (internal)

*Added by `COF001/scripts/run_v5_statement.mjs`; the tables above are shared-generator output.*

1. **Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line.
2. **Documents not yet in the database (lane ASSUMED).** The 2026-10-16 ERP extract adds 15803 (Crd Note -3,002.83), 15804 (Crd Note -15,697.50) and 53619 (Invoice +18,700.33). The database has no lines for them. 15803 and 15804 equal the gas and cylinder parts of 15558 exactly, so they are routed 1A and 1B. 53619 equals 15558 in total and is assumed to reverse it line for line (1A +3,002.83, 1B +15,697.50). If 53619 was wholly gas, 1A would be R15,697.50 higher and 1B R15,697.50 lower; the combined balance would not change. Replace with database lines once ingested.
3. **Net effect of the 15558 correction.** 15558 (-18,700.33) is reversed by 53619 (+18,700.33) and re-issued as 15803 + 15804 (-18,700.33). The ERP closing balance is unchanged at R-16,256.52.
4. **Custody (Part 2).** Quantities come from the database and have no lines for 53619 or 15804. If 53619 reverses 15558 and 15804 re-issues it, they cancel and the closing quantities are unchanged.
5. **Quarantined payment 29492 (2024-04-18, R-7,628.30).** Quarantined by the operator on 2026-10-18; reason not stated. Initial observation (partly superseded by the update below): ASSERTED from TXT: payment 30219 (12 Mar 2024, -7,628.30) was posted for the same amount against invoice 30276 (9 Mar 2024, 7,628.30). With 29492 also posted, the account is R7,628.28 in credit from 18 Apr 2024 until later invoices absorb it. Not confirmed as a duplicate. Held aside: excluded from Part 1A and 1B and from running balances. Still included in the ERP balance, so the bridge shows it as a reconciling line. Not treated as a cylinder-deposit payment (business_rules.md sections 3 and 4): no allocation to the cylinder ledger and no cylinder write-off. **Update 2026-10-18 (ASSERTED - database evidence (bank and ERP reconciliation tables), not confirmed against the ERP).** Payment 29492 appears to belong to COF002 (COFFEEBERRY-HILTON, bank name 'Coffeeberry Avenues'), not COF001. It was posted to COF001 against COF001 invoice 30276, which payment 30219 had already settled. Evidence: Bank credit 2024-04-18, R7,628.30, described 'Magtape Credit Coffeeberry Avenues 00031096' (bank_transactions, status MATCHED). 31096 is a COF002 invoice dated 2024-04-08 for R7,628.30. That bank credit is approved-matched (EXACT_AMOUNT_DATE) to ERP entry refDoc 00029492 (STAT:102), whose ERP description is 'MAGTAPE CREDIT COFFEEBERRY AVE'. The earlier bank credit 2024-03-12, R7,628.30, described 'Magtape Credit Coffeeberry Cascades 00030276', is the COF001 receipt that payment 30219 recorded for invoice 30276. In the database, transaction_headers shows 29492 with reference 00030276 (COF001's invoice). No payment of R7,628.30 exists on COF002, and every other COF002 invoice from 15 Feb to 15 Jun 2024 has a same-amount payment within days; 31096 does not. The 'observation' above (29492 as a second payment of the same invoice by COF001) is not supported by the bank data: the two R7,628.30 receipts came from two different payers. Not checked: COF002's ERP statement (no TXT in the repo): whether invoice 31096 is still open there, or was settled another way. Whether the ERP has since reposted or reversed 29492. The quarantine on COF001 stands as a hold-aside until the ERP reposts 29492 to COF002. COF002 would then show invoice 31096 paid. This statement is quarantine-adjusted (the payment is dated before this period, so the opening 1A balance excludes it); a statement whose config does not set `quarantineFile` is not adjusted. Reopen when: The ERP reverses, refunds or reallocates payment 29492. Bank statement evidence shows only one receipt of 7,628.30 for invoice 30276, or shows 29492 belongs to another invoice. The operator rules that 29492 is a cylinder-deposit payment (business_rules.md sections 3 and 4 then apply). Payment 30219 is itself reversed or reallocated.
6. **Lane override: invoice 45528 S.1 ×5 (2025-08-09, R6,037.50) treated as gas (1A), ASSUMED.** TREAT AS GAS (wrong stock code); operator, 2026-10-18. Basis: ASSERTED (database lines, ADM-149 report analysis/debtors/COF001/reports/COF001_ADM-149_45528_Deposit_Investigation.md on branch claude/adm-149-cof001-45528, rechecked by the parent session 2026-10-18): every other COF001 48kg delivery Jun-Sep 2025 bills S01 x5 (48kg gas) on the main invoice, while DN#20080 bills none; the -EMPTY pair 45529/13191 records 5 x 48kg empties swapped; COF002 invoice 45486 (7 Aug 2025) billed the same 9kg line R1,362.69 plus 5 x S.4 48kg gas. Not confirmed by the ERP. Effect: Moves R6,037.50 from Part 1B to Part 1A and removes S.1 +5 from Part 2 custody. Combined balance unchanged. Payment 40757 (R7,400.19) then pays a gas-only invoice in full. No credit note or rebill is assumed: the possible R1,086.52 to R1,230.04 undercharge on 48kg gas is not added to any statement. The line is dated before this period, so the opening 1B balance and the Part 2 opening quantity are adjusted; the combined opening B/F is unchanged. Pending: Linear ADM-152 (FINCON line audit of 45528, signed DN#20080, stock movements 9 Aug 2025). Reopen when: The FINCON line audit shows S.1 was keyed on purpose on 45528 (for example a sale of cylinders). Signed DN#20080 shows no 48kg fulls delivered. A site count shows five 48kg cylinders above the agreed float. The ERP issues any credit note or invoice against 45528 or DN#20080 (then remove this override so the correction is not counted twice). A dated full export (ADM-135) shows different lines for 45528.
7. **Database coverage.** All invoices and credit notes in the window were matched to the database by document and amount (see `reports/COF001_DB_COVERAGE_2026-10-16.md`).
8. **Generator run.** The shared generator was run unchanged (except as noted) against `data/db_snapshot_2026.json` (rows pulled from Supabase on 2026-10-16) because `DATABASE_URL` is not set in cloud sessions. Fixes made to the shared generator: the TXT header balance regex accepts a minus sign, so credit balances no longer read as NaN; an optional `periodEnd` limits the window and takes the closing check from the ERP running balance on the last row inside it.
9. **Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).

<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R5,183.28 |
| Cylinder Financial Balance (Part 1B close) | R-13,811.50 |
| **Total Debtor Balance** | **R-8,628.22** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg | -1 | R690.00 | R-690.00 |
| 9kg | -3 | R517.50 | R-1,552.50 |
| D.1 | 10 | R1,150.00 | R11,500.00 |
| S.1 | -20 | R1,150.00 | R-23,000.00 |
| **Total** | **-14** | — | **R-13,742.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-13,811.50 | R-13,742.50 | R-69.00 |
| Sub-ledger tie (1A + 1B vs combined) | R-8,628.22 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-16,256.52  
**Quarantined documents (held aside):** R-7,628.30  
**ERP balance excluding quarantined documents:** R-8,628.22  
**Reconstructed Balance (1A + 1B):** R-8,628.22  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
