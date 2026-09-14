# Statement of Account: FIRE AND VINE (FIR001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jul 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** FIR001
**Combined Opening B/F:** R597.43 (ERP verified — source: `analysis/debtors/FIR001/raw/FIR001CURRENT.TXT.TXT` FIR001CURRENT.TXT.TXT line 14 — BALANCE B/F R597.43 immediately before first CURRENT-year row inv 51530 (02 Jul 2026). TXT window is Jul–Sep 2026 (periods 17–19); not a Jan YTD export.)
**LPG Opening B/F (1A):** R597.43 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-11 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jul 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **597.43** |
| 02 Jul 2026 | Invoice | 51530 | 8,084.86 | 8,682.29 |
| 06 Jul 2026 | Payment | 45093 | -8,084.86 | 597.43 |
| 06 Jul 2026 | Invoice | 51628 | 7,827.07 | 8,424.50 |
| 09 Jul 2026 | Payment | 45103 | -7,827.07 | 597.43 |
| 13 Jul 2026 | Invoice | 51791 | 8,120.59 | 8,718.02 |
| 16 Jul 2026 | Invoice | 51877 | 8,120.59 | 16,838.61 |
| 17 Jul 2026 | Payment | 45205 | -16,241.18 | 597.43 |
| 23 Jul 2026 | Invoice | 52036 | 8,120.59 | 8,718.02 |
| 30 Jul 2026 | Invoice | 52195 | 8,120.59 | 16,838.61 |
| 31 Jul 2026 | Payment | 45474 | -8,120.59 | 8,718.02 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **8,718.02** |
| 03 Aug 2026 | Invoice | 52268 | 7,827.07 | 16,545.09 |
| 05 Aug 2026 | Payment | 45586 | -7,827.07 | 8,718.02 |
| 07 Aug 2026 | Payment | 45591 | -8,120.59 | 597.43 |
| 11 Aug 2026 | Invoice | 52463 | 7,189.95 | 7,787.38 |
| 14 Aug 2026 | Invoice | 52578 | 7,189.95 | 14,977.33 |
| 17 Aug 2026 | Payment | 45779 | -14,379.90 | 597.43 |
| 22 Aug 2026 | Invoice | 52736 | 7,189.95 | 7,787.38 |
| 26 Aug 2026 | Payment | 45891 | -7,189.95 | 597.43 |
| 28 Aug 2026 | Invoice | 52844 | 7,189.95 | 7,787.38 |
| 31 Aug 2026 | Payment | 45995 | -7,189.95 | 597.43 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **597.43** |
| 05 Sept 2026 | Invoice | 52962 | 7,606.09 | 8,203.52 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 02 Jul 2026 | Invoice | 51531 | 6,555.00 | 6,555.00 |
| 03 Jul 2026 | Crd Note | 15165 | -6,555.00 | 0.00 |
| 06 Jul 2026 | Invoice | 51629 | 6,037.50 | 6,037.50 |
| 06 Jul 2026 | Crd Note | 15181 | -6,037.50 | 0.00 |
| 13 Jul 2026 | Invoice | 51792 | 6,555.00 | 6,555.00 |
| 13 Jul 2026 | Crd Note | 15253 | -6,555.00 | 0.00 |
| 16 Jul 2026 | Invoice | 51878 | 6,555.00 | 6,555.00 |
| 16 Jul 2026 | Crd Note | 15269 | -6,555.00 | 0.00 |
| 23 Jul 2026 | Invoice | 52037 | 6,555.00 | 6,555.00 |
| 24 Jul 2026 | Crd Note | 15319 | -6,555.00 | 0.00 |
| 30 Jul 2026 | Invoice | 52196 | 6,555.00 | 6,555.00 |
| 31 Jul 2026 | Crd Note | 15361 | -6,555.00 | 0.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 03 Aug 2026 | Invoice | 52269 | 6,037.50 | 6,037.50 |
| 03 Aug 2026 | Crd Note | 15379 | -6,037.50 | 0.00 |
| 11 Aug 2026 | Invoice | 52464 | 6,555.00 | 6,555.00 |
| 11 Aug 2026 | Crd Note | 15439 | -6,555.00 | 0.00 |
| 14 Aug 2026 | Invoice | 52579 | 6,555.00 | 6,555.00 |
| 15 Aug 2026 | Crd Note | 15488 | -6,555.00 | 0.00 |
| 22 Aug 2026 | Invoice | 52737 | 6,555.00 | 6,555.00 |
| 24 Aug 2026 | Crd Note | 15535 | -6,037.50 | 517.50 |
| 28 Aug 2026 | Invoice | 52845 | 6,555.00 | 7,072.50 |
| 28 Aug 2026 | Crd Note | 15569 | -6,555.00 | 517.50 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **517.50** |
| 05 Sept 2026 | Invoice | 52963 | 7,072.50 | 7,590.00 |
| 05 Sept 2026 | Crd Note | 15604 | -7,072.50 | 517.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 8,203.52 |
| Part 1B — CYL Deposits | 517.50 |
| **Combined (1A + 1B)** | **8,721.02** |
| ERP `CURRENT BALANCE` (TXT header) | 8,721.02 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: current` · `ingestCoverage: partial`)

| Check | Status |
| :--- | :--- |
| Display status | `CURRENT_PARTIAL` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **BLOCKED** |
| SKU analysis | **BLOCKED** |

> **Custody conclusions blocked.** DB qty may be incomplete or stale vs statement TXT (`analysis/debtors/FIR001/raw/FIR001CURRENT.TXT.TXT`). See `FIR001_INGEST_COVERAGE_*.md`.

**INGEST_GAP documents (custody-blocking):**
- **15488** (Crd Note, 2026-08-15) — `MISSING_HEADER_AND_LINES`
- **45779** (Payment, 2026-08-17) — `MISSING_HEADER`
- **45995** (Payment, 2026-08-31) — `MISSING_HEADER`

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **Gate: custody BLOCKED — see Ingest Gate above.***

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 02 Jul 2026 | Invoice | 51531 | 0 | 0 | +1 | 0 | +5 |
| 03 Jul 2026 | Crd Note | 15165 | 0 | 0 | -1 | 0 | -5 |
| 06 Jul 2026 | Invoice | 51629 | 0 | 0 | 0 | 0 | +5 |
| 06 Jul 2026 | Crd Note | 15181 | 0 | 0 | 0 | 0 | -5 |
| 13 Jul 2026 | Invoice | 51792 | 0 | 0 | +1 | 0 | +5 |
| 13 Jul 2026 | Crd Note | 15253 | 0 | 0 | -1 | 0 | -5 |
| 16 Jul 2026 | Invoice | 51878 | 0 | 0 | +1 | 0 | +5 |
| 16 Jul 2026 | Crd Note | 15269 | 0 | 0 | -1 | 0 | -5 |
| 23 Jul 2026 | Invoice | 52037 | 0 | 0 | +1 | 0 | +5 |
| 24 Jul 2026 | Crd Note | 15319 | 0 | 0 | -1 | 0 | -5 |
| 30 Jul 2026 | Invoice | 52196 | 0 | 0 | +1 | 0 | +5 |
| 31 Jul 2026 | Crd Note | 15361 | 0 | 0 | -1 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 03 Aug 2026 | Invoice | 52269 | 0 | 0 | 0 | 0 | +5 |
| 03 Aug 2026 | Crd Note | 15379 | 0 | 0 | 0 | 0 | -5 |
| 11 Aug 2026 | Invoice | 52464 | 0 | 0 | +1 | 0 | +5 |
| 11 Aug 2026 | Crd Note | 15439 | 0 | 0 | -1 | 0 | -5 |
| 14 Aug 2026 | Invoice | 52579 | 0 | 0 | +1 | 0 | +5 |
| 22 Aug 2026 | Invoice | 52737 | 0 | 0 | +1 | 0 | +5 |
| 24 Aug 2026 | Crd Note | 15535 | 0 | 0 | 0 | 0 | -5 |
| 28 Aug 2026 | Invoice | 52845 | 0 | 0 | +1 | 0 | +5 |
| 28 Aug 2026 | Crd Note | 15569 | 0 | 0 | -1 | 0 | -5 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **2** | **0** | **5** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **2** | **0** | **5** |
| 05 Sept 2026 | Invoice | 52963 | 0 | 0 | +2 | 0 | +5 |
| 05 Sept 2026 | Crd Note | 15604 | 0 | 0 | -2 | 0 | -5 |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **2** | **0** | **5** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R8,203.52 |
| Cylinder Financial Balance (Part 1B close) | R517.50 |
| **Total Debtor Balance** | **R8,721.02** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 9kg | 2 | R517.50 | R1,035.00 |
| S.1 | 5 | R1,150.00 | R5,750.00 |
| **Total** | **7** | — | **R6,785.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R517.50 | R6,785.00 | R-6,267.50 |
| Sub-ledger tie (1A + 1B vs combined) | R8,721.02 | — | R0.00 |

> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage `CURRENT_PARTIAL`. DB-backed qty may not reflect all TXT documents.

**ERP Combined Balance (TXT header):** R8,721.02  
**Reconstructed Balance (1A + 1B):** R8,721.02  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
