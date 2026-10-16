# Statement of Account: COFFEEBERRY-CASCADES (COF001) - Version 5 (Sub-Ledger Position Statement)
**Period:** May 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** COF001
**Combined Opening B/F:** R-1,076.02 (ERP verified — source: `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` ERP running balance after the last April 2026 row (payment 44067, 21 Apr 2026), COF001_CURRENT.TXT line 165)
**LPG Opening B/F (1A):** R-8,482.02 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R7,406.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-16 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since May 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-8,482.02** |
| 05 May 2026 | Invoice | 50513 | 9,493.71 | 1,011.69 |
| 11 May 2026 | Payment | 44300 | -9,493.71 | -8,482.02 |
| 21 May 2026 | Invoice | 50808 | 9,671.37 | 1,189.35 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **1,189.35** |
| 01 Jun 2026 | Payment | 44560 | -9,671.37 | -8,482.02 |
| 09 Jun 2026 | Invoice | 51107 | 9,311.22 | 829.20 |
| 15 Jun 2026 | Payment | 44753 | -9,311.22 | -8,482.02 |
| 23 Jun 2026 | Invoice | 51372 | 8,683.50 | 201.48 |
| 29 Jun 2026 | Payment | 44968 | -8,683.50 | -8,482.02 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-8,482.02** |
| 08 Jul 2026 | Invoice | 51705 | 9,034.40 | 552.38 |
| 15 Jul 2026 | Payment | 45209 | -9,034.40 | -8,482.02 |
| 22 Jul 2026 | Invoice | 52014 | 9,349.56 | 867.54 |
| 31 Jul 2026 | Payment | 45480 | -9,349.56 | -8,482.02 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-8,482.02** |
| 20 Aug 2026 | Invoice | 52691 | 3,284.35 | -5,197.67 |
| 24 Aug 2026 | Payment | 45896 | -3,284.35 | -8,482.02 |
| 26 Aug 2026 | Invoice | 53619 | 3,002.83 | -5,479.19 |
| 26 Aug 2026 | Crd Note | 15558 | -3,002.83 | -8,482.02 |
| 26 Aug 2026 | Crd Note | 15803 | -3,002.83 | -11,484.85 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **-11,484.85** |
| 09 Sept 2026 | Bank XFer | 7473 | 3,002.33 | -8,482.52 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

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
| 26 Aug 2026 | Invoice | 53619 | 15,697.50 | 23,621.00 |
| 26 Aug 2026 | Crd Note | 15558 | -15,697.50 | 7,923.50 |
| 26 Aug 2026 | Crd Note | 15804 | -15,697.50 | -7,774.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | -8,482.52 |
| Part 1B — CYL Deposits | -7,774.00 |
| **Combined (1A + 1B)** | **-16,256.52** |
| ERP `CURRENT BALANCE` (TXT header) | -16,256.52 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF001` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

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

1. **Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line. This differs from the database view's `debt_group` for rental-only lines: 49204 (`SM CYL RENTAL`, R6,960.00, Feb 2026) has no cylinder SKU, so it sits in 1A. Under the view's grouping it would be in 1B. Please confirm.
2. **Documents not yet in the database (lane ASSUMED).** The 2026-10-16 ERP extract adds 15803 (Crd Note -3,002.83), 15804 (Crd Note -15,697.50) and 53619 (Invoice +18,700.33). The database has no lines for them. 15803 and 15804 equal the gas and cylinder parts of 15558 exactly, so they are routed 1A and 1B. 53619 equals 15558 in total and is assumed to reverse it line for line (1A +3,002.83, 1B +15,697.50). If 53619 was wholly gas, 1A would be R15,697.50 higher and 1B R15,697.50 lower; the combined balance would not change. Replace with database lines once ingested.
3. **Net effect of the 15558 correction.** 15558 (-18,700.33) is reversed by 53619 (+18,700.33) and re-issued as 15803 + 15804 (-18,700.33). The ERP closing balance is unchanged at R-16,256.52.
4. **Custody (Part 2).** Quantities come from the database and have no lines for 53619 or 15804. If 53619 reverses 15558 and 15804 re-issues it, they cancel and the closing quantities are unchanged.
5. **Database coverage.** All 2026 invoices and credit notes were matched to the database by document and amount (see `reports/COF001_DB_COVERAGE_2026-10-16.md`). Three documents are dated one day later in the database (14854, 50513, 50515).
6. **Generator run.** The shared generator was run unchanged against `data/db_snapshot_2026.json` (rows pulled from Supabase on 2026-10-16) because `DATABASE_URL` is not set in cloud sessions. One fix was made to the shared generator: the TXT header balance regex now accepts a minus sign, so credit balances no longer read as NaN.
7. **Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).

<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R-8,482.52 |
| Cylinder Financial Balance (Part 1B close) | R-7,774.00 |
| **Total Debtor Balance** | **R-16,256.52** |

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
| Sub-ledger tie (1A + 1B vs combined) | R-16,256.52 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-16,256.52  
**Reconstructed Balance (1A + 1B):** R-16,256.52  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
