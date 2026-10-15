# Statement of Account: COFFEEBERRY-HILTON (COF002) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jul 2025 → Oct 2025 &nbsp;|&nbsp; **Account:** COF002
**Combined Opening B/F:** R10,970.26 (ERP verified — source: `analysis/debtors/COF002/raw/COF002_DEBENQ_CURRENT.TXT` Derived opening 2025-07-01 from COF002_DEBENQ_CURRENT.TXT: BALANCE B/F 23547.59 plus pre-2025-07-01 non-UD rows (-12577.33; PROVEN by row sum). UD rows (-9537.82) are excluded. Derived, not an ERP B/F at 2025-07-01 - ratify.)
**LPG Opening B/F (1A):** R9,970.26 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R1,000.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-15 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jul 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **9,970.26** |
| 02 Jul 2025 | Invoice | 44445 | 8,217.47 | 18,187.73 |
| 16 Jul 2025 | Invoice | 44884 | 8,357.69 | 26,545.42 |
| 17 Jul 2025 | Crd Note | 13003 | -272.54 | 26,272.88 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **26,272.88** |
| 07 Aug 2025 | Invoice | 45486 | 8,630.23 | 34,903.11 |
| 11 Aug 2025 | Payment | 40749 | -8,630.23 | 26,272.88 |
| 11 Aug 2025 | Payment | 40750 | -8,085.15 | 18,187.73 |
| 12 Aug 2025 | Payment | 40754 | -8,217.47 | 9,970.26 |
| 25 Aug 2025 | Invoice | 45876 | 4,274.41 | 14,244.67 |
| 25 Aug 2025 | Crd Note | 13302 | -4,274.41 | 9,970.26 |
| 30 Aug 2025 | Payment | 40954 | -9,157.23 | 813.03 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **813.03** |
| 01 Sept 2025 | Invoice | 46039 | 8,459.80 | 9,272.83 |
| 08 Sept 2025 | Payment | 41163 | -8,459.80 | 813.03 |
| 22 Sept 2025 | Invoice | 46567 | 7,874.36 | 8,687.39 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **8,687.39** |
| 01 Oct 2025 | Payment | 41576 | -7,874.36 | 813.03 |
| 16 Oct 2025 | Invoice | 47111 | 7,617.59 | 8,430.62 |
| 21 Oct 2025 | Payment | 41951 | -7,617.50 | 813.12 |
| 29 Oct 2025 | Invoice | 47379 | 7,617.59 | 8,430.71 |
| 29 Oct 2025 | Invoice | 47387 | 7,360.82 | 15,791.53 |
| 29 Oct 2025 | Crd Note | 13764 | -7,617.59 | 8,173.94 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **1,000.00** |
| 02 Jul 2025 | Invoice | 44446 | 7,590.00 | 8,590.00 |
| 02 Jul 2025 | Crd Note | 12882 | -7,590.00 | 1,000.00 |
| 16 Jul 2025 | Invoice | 44885 | 8,107.50 | 9,107.50 |
| 17 Jul 2025 | Crd Note | 13002 | -8,107.50 | 1,000.00 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **1,000.00** |
| 07 Aug 2025 | Invoice | 45487 | 8,625.00 | 9,625.00 |
| 08 Aug 2025 | Crd Note | 13164 | -8,625.00 | 1,000.00 |
| 25 Aug 2025 | Invoice | 45877 | 3,622.50 | 4,622.50 |
| 25 Aug 2025 | Crd Note | 13303 | -3,622.50 | 1,000.00 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **1,000.00** |
| 01 Sept 2025 | Invoice | 46040 | 8,625.00 | 9,625.00 |
| 01 Sept 2025 | Crd Note | 13346 | -8,625.00 | 1,000.00 |
| 22 Sept 2025 | Invoice | 46568 | 8,107.50 | 9,107.50 |
| 22 Sept 2025 | Crd Note | 13526 | -8,107.50 | 1,000.00 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **1,000.00** |
| 16 Oct 2025 | Invoice | 47112 | 7,590.00 | 8,590.00 |
| 16 Oct 2025 | Crd Note | 13691 | -7,590.00 | 1,000.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 8,173.94 |
| Part 1B — CYL Deposits | 1,000.00 |
| **Combined (1A + 1B)** | **9,173.94** |
| TXT-derived closing reference | 9,173.94 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF002` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 02 Jul 2025 | Invoice | 44446 | 0 | 0 | +3 | 0 | +5 |
| 02 Jul 2025 | Crd Note | 12882 | 0 | 0 | -3 | 0 | -5 |
| 16 Jul 2025 | Invoice | 44885 | 0 | 0 | +4 | 0 | +5 |
| 17 Jul 2025 | Crd Note | 13002 | 0 | 0 | -4 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 07 Aug 2025 | Invoice | 45487 | 0 | 0 | +5 | 0 | +5 |
| 08 Aug 2025 | Crd Note | 13164 | 0 | 0 | -5 | 0 | -5 |
| 25 Aug 2025 | Invoice | 45877 | 0 | 0 | 0 | 0 | +3 |
| 25 Aug 2025 | Crd Note | 13303 | 0 | 0 | 0 | 0 | -3 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

### September 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 01 Sept 2025 | Invoice | 46040 | 0 | 0 | +5 | 0 | +5 |
| 01 Sept 2025 | Crd Note | 13346 | 0 | 0 | -5 | 0 | -5 |
| 22 Sept 2025 | Invoice | 46568 | 0 | 0 | +4 | 0 | +5 |
| 22 Sept 2025 | Crd Note | 13526 | 0 | 0 | -4 | 0 | -5 |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **4** | **4** | **15** |
| 16 Oct 2025 | Invoice | 47112 | 0 | 0 | +3 | 0 | +5 |
| 16 Oct 2025 | Crd Note | 13691 | 0 | 0 | -3 | 0 | -5 |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **4** | **4** | **15** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R8,173.94 |
| Cylinder Financial Balance (Part 1B close) | R1,000.00 |
| **Total Debtor Balance** | **R9,173.94** |

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
| Cylinder Position (1B vs custody) | R1,000.00 | R23,920.00 | R-22,920.00 |
| Sub-ledger tie (1A + 1B vs combined) | R9,173.94 | — | R-0.00 |

**TXT-derived closing reference:** R9,173.94  
**Reconstructed Balance (1A + 1B):** R9,173.94  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
