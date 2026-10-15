# Statement of Account: COFFEEBERRY-HILTON (COF002) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jul 2026 → Oct 2026 &nbsp;|&nbsp; **Account:** COF002
**Combined Opening B/F:** R-2,032.92 (ERP verified — source: `analysis/debtors/COF002/raw/COF002_DEBENQ_CURRENT.TXT` Derived opening 2026-07-01 from COF002_DEBENQ_CURRENT.TXT: BALANCE B/F 23547.59 plus all pre-2026-07-01 non-UD rows (-25580.51; PROVEN by row sum). UD rows (-9537.82) excluded. Closing 2026-10-31 is checked against the ERP CURRENT BALANCE header (no rows after 14 Oct 2026). Derived opening - ratify.)
**LPG Opening B/F (1A):** R-2,032.92 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-15 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jul 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-2,032.92** |
| 02 Jul 2026 | Invoice | 51528 | 6,303.08 | 4,270.16 |
| 22 Jul 2026 | Invoice | 52012 | 9,979.87 | 14,250.03 |
| 31 Jul 2026 | Payment | 45479 | -9,979.87 | 4,270.16 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **4,270.16** |
| 21 Aug 2026 | Invoice | 52722 | 8,914.68 | 13,184.84 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **13,184.84** |
| 09 Sept 2026 | Payment | 46106 | -8,914.68 | 4,270.16 |
| 15 Sept 2026 | Invoice | 53144 | 9,514.48 | 13,784.64 |
| 29 Sept 2026 | Invoice | 53362 | 7,652.45 | 21,437.09 |

---

### October 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **21,437.09** |
| 06 Oct 2026 | Payment | 46419 | -9,514.48 | 11,922.61 |
| 07 Oct 2026 | Payment | 46420 | -4,016.60 | 7,906.01 |
| 14 Oct 2026 | Invoice | 53588 | 7,740.25 | 15,646.26 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 02 Jul 2026 | Invoice | 51529 | 5,692.50 | 5,692.50 |
| 03 Jul 2026 | Crd Note | 15176 | -5,692.50 | 0.00 |
| 22 Jul 2026 | Invoice | 52013 | 8,625.00 | 8,625.00 |
| 23 Jul 2026 | Crd Note | 15311 | -8,625.00 | 0.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 20 Aug 2026 | Invoice | 52692 | 2,932.50 | 2,932.50 |
| 20 Aug 2026 | Crd Note | 15515 | -2,415.00 | 517.50 |
| 21 Aug 2026 | Invoice | 52723 | 8,625.00 | 9,142.50 |
| 22 Aug 2026 | Crd Note | 15529 | -8,625.00 | 517.50 |
| 23 Aug 2026 | Crd Note | 15533 | -517.50 | 0.00 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **0.00** |
| 15 Sept 2026 | Invoice | 53143 | 8,107.50 | 8,107.50 |
| 15 Sept 2026 | Crd Note | 15659 | -8,107.50 | 0.00 |
| 29 Sept 2026 | Invoice | 53363 | 6,037.50 | 6,037.50 |

---

### October 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **6,037.50** |
| 02 Oct 2026 | Crd Note | 15748 | -6,037.50 | 0.00 |
| 14 Oct 2026 | Invoice | 53589 | 6,037.50 | 6,037.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 15,646.26 |
| Part 1B — CYL Deposits | 6,037.50 |
| **Combined (1A + 1B)** | **21,683.76** |
| ERP `CURRENT BALANCE` (TXT header) | 21,683.76 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF002` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 02 Jul 2026 | Invoice | 51529 | 0 | 0 | +4 | 0 | +3 |
| 03 Jul 2026 | Crd Note | 15176 | 0 | 0 | -4 | 0 | -3 |
| 22 Jul 2026 | Invoice | 52013 | 0 | 0 | +5 | 0 | +5 |
| 23 Jul 2026 | Crd Note | 15311 | 0 | 0 | -5 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 20 Aug 2026 | Invoice | 52692 | 0 | 0 | +1 | 0 | +2 |
| 20 Aug 2026 | Crd Note | 15515 | 0 | 0 | 0 | 0 | -2 |
| 21 Aug 2026 | Invoice | 52723 | 0 | 0 | +5 | 0 | +5 |
| 22 Aug 2026 | Crd Note | 15529 | 0 | 0 | -5 | 0 | -5 |
| 23 Aug 2026 | Crd Note | 15533 | 0 | 0 | -1 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 15 Sept 2026 | Invoice | 53143 | 0 | 0 | +4 | 0 | +5 |
| 15 Sept 2026 | Crd Note | 15659 | 0 | 0 | -4 | 0 | -5 |
| 29 Sept 2026 | Invoice | 53363 | 0 | 0 | 0 | 0 | +5 |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **20** |

---

### October 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **20** |
| 02 Oct 2026 | Crd Note | 15748 | 0 | 0 | 0 | 0 | -5 |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R15,646.26 |
| Cylinder Financial Balance (Part 1B close) | R6,037.50 |
| **Total Debtor Balance** | **R21,683.76** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 9kg | 4 | R517.50 | R2,070.00 |
| D.1 | 4 | R1,150.00 | R4,600.00 |
| S.1 | 15 | R1,150.00 | R17,250.00 |
| **Total** | **23** | — | **R23,920.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R6,037.50 | R23,920.00 | R-17,882.50 |
| Sub-ledger tie (1A + 1B vs combined) | R21,683.76 | — | R0.00 |

**ERP `CURRENT BALANCE` (TXT header):** R21,683.76  
**Reconstructed Balance (1A + 1B):** R21,683.76  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
