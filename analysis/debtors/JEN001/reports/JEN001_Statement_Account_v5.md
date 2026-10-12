# Statement of Account: Spoon Eatery (JEN001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jul 2026 → Aug 2026 &nbsp;|&nbsp; **Account:** JEN001
**Combined Opening B/F:** R22,088.10 (ERP verified — source: `analysis/debtors/JEN001/raw/DEBENQ.TXT` DEBENQ.TXT line 14 — BALANCE B/F (post payment 44878, 25 Jun 2026))
**LPG Opening B/F (1A):** R22,605.60 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R-517.50
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-08-18 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jul 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **22,605.60** |
| 03 Jul 2026 | Invoice | 51564 | 623.88 | 23,229.48 |
| 07 Jul 2026 | Invoice | 51669 | 4,887.10 | 28,116.58 |
| 07 Jul 2026 | Crd Note | 15205 | -4,887.10 | 23,229.48 |
| 08 Jul 2026 | Invoice | 51691 | 4,887.10 | 28,116.58 |
| 14 Jul 2026 | Invoice | 51823 | 935.81 | 29,052.39 |
| 23 Jul 2026 | Invoice | 52044 | 3,951.29 | 33,003.68 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **33,003.68** |
| 04 Aug 2026 | Invoice | 52305 | 5,199.03 | 38,202.71 |
| 14 Aug 2026 | Payment | 45717 | -15,000.00 | 23,202.71 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-517.50** |
| 03 Jul 2026 | Invoice | 51565 | 1,035.00 | 517.50 |
| 03 Jul 2026 | Crd Note | 15193 | -1,035.00 | -517.50 |
| 07 Jul 2026 | Invoice | 51670 | 5,692.50 | 5,175.00 |
| 07 Jul 2026 | Crd Note | 15204 | -5,692.50 | -517.50 |
| 08 Jul 2026 | Invoice | 51692 | 5,692.50 | 5,175.00 |
| 08 Jul 2026 | Crd Note | 15220 | -5,692.50 | -517.50 |
| 14 Jul 2026 | Invoice | 51824 | 1,552.50 | 1,035.00 |
| 14 Jul 2026 | Crd Note | 15258 | -1,552.50 | -517.50 |
| 24 Jul 2026 | Invoice | 52050 | 690.00 | 172.50 |
| 24 Jul 2026 | Invoice | 52051 | 4,140.00 | 4,312.50 |
| 24 Jul 2026 | Crd Note | 15317 | -690.00 | 3,622.50 |
| 25 Jul 2026 | Crd Note | 15329 | -4,140.00 | -517.50 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-517.50** |
| 04 Aug 2026 | Invoice | 52306 | 6,210.00 | 5,692.50 |
| 05 Aug 2026 | Crd Note | 15392 | -6,210.00 | -517.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 23,202.71 |
| Part 1B — CYL Deposits | -517.50 |
| **Combined (1A + 1B)** | **22,685.21** |
| ERP `CURRENT BALANCE` (TXT header) | 22,685.21 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: current` · `ingestCoverage: complete`)

| Check | Status |
| :--- | :--- |
| Display status | `CURRENT_COMPLETE` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **ALLOWED** |
| SKU analysis | **ALLOWED** |

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **-1** | **0** | **0** |
| 03 Jul 2026 | Invoice | 51565 | 0 | 0 | +2 | 0 | 0 |
| 03 Jul 2026 | Crd Note | 15193 | 0 | 0 | -2 | 0 | 0 |
| 07 Jul 2026 | Invoice | 51670 | 0 | +6 | +3 | 0 | 0 |
| 07 Jul 2026 | Crd Note | 15204 | 0 | -6 | -3 | 0 | 0 |
| 08 Jul 2026 | Invoice | 51692 | 0 | +6 | +3 | 0 | 0 |
| 08 Jul 2026 | Crd Note | 15220 | 0 | -6 | -3 | 0 | 0 |
| 14 Jul 2026 | Invoice | 51824 | 0 | 0 | +3 | 0 | 0 |
| 14 Jul 2026 | Crd Note | 15258 | 0 | 0 | -3 | 0 | 0 |
| 24 Jul 2026 | Invoice | 52050 | 0 | +1 | 0 | 0 | 0 |
| 24 Jul 2026 | Invoice | 52051 | 0 | +6 | 0 | 0 | 0 |
| 24 Jul 2026 | Crd Note | 15317 | 0 | -1 | 0 | 0 | 0 |
| 25 Jul 2026 | Crd Note | 15329 | 0 | -6 | 0 | 0 | 0 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **-1** | **0** | **0** |
| 04 Aug 2026 | Invoice | 52306 | 0 | +6 | +4 | 0 | 0 |
| 05 Aug 2026 | Crd Note | 15392 | 0 | -6 | -4 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R23,202.71 |
| Cylinder Financial Balance (Part 1B close) | R-517.50 |
| **Total Debtor Balance** | **R22,685.21** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 9kg | -1 | R517.50 | R-517.50 |
| **Total** | **-1** | — | **R-517.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-517.50 | R-517.50 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R22,685.21 | — | R0.00 |

**ERP Combined Balance (TXT header):** R22,685.21  
**Reconstructed Balance (1A + 1B):** R22,685.21  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
