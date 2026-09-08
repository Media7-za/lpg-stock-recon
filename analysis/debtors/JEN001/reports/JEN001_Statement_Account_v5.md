# Statement of Account: Spoon Eatery (JEN001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jan 2026 → Aug 2026 &nbsp;|&nbsp; **Account:** JEN001
**Combined Opening B/F:** R9,082.81 (ERP verified — source: `analysis/debtors/JEN001/raw/JEN001.TXT` JEN001.TXT line 119 — balance before payment 42917 (STAT 122, 07 Jan 2026))
**LPG Opening B/F (1A):** R9,600.31 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R-517.50
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-07 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jan 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **9,600.31** |
| 07 Jan 2026 | Payment | 42917 | -9,082.81 | 517.50 |
| 08 Jan 2026 | Invoice | 48675 | 3,032.41 | 3,549.91 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **3,549.91** |
| 02 Feb 2026 | Invoice | 49067 | 3,052.49 | 6,602.40 |
| 17 Feb 2026 | Payment | 43367 | -3,032.41 | 3,569.99 |
| 17 Feb 2026 | Invoice | 49287 | 3,084.02 | 6,654.01 |
| 23 Feb 2026 | Invoice | 49379 | 3,084.02 | 9,738.03 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **9,738.03** |
| 06 Mar 2026 | Invoice | 49609 | 2,589.05 | 12,327.08 |
| 12 Mar 2026 | Payment | 43638 | -9,220.53 | 3,106.55 |
| 16 Mar 2026 | Invoice | 49752 | 3,597.41 | 6,703.96 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **6,703.96** |
| 02 Apr 2026 | Invoice | 50051 | 4,578.50 | 11,282.46 |
| 08 Apr 2026 | Payment | 43927 | -6,703.96 | 4,578.50 |
| 09 Apr 2026 | Invoice | 50146 | 3,448.83 | 8,027.33 |
| 20 Apr 2026 | Invoice | 50318 | 3,448.83 | 11,476.16 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **11,476.16** |
| 05 May 2026 | Invoice | 50536 | 5,082.47 | 16,558.63 |
| 18 May 2026 | Invoice | 50753 | 3,951.91 | 20,510.54 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **20,510.54** |
| 01 Jun 2026 | Invoice | 50970 | 3,293.25 | 23,803.79 |
| 11 Jun 2026 | Invoice | 51154 | 4,866.88 | 28,670.67 |
| 23 Jun 2026 | Invoice | 51387 | 3,934.93 | 32,605.60 |
| 25 Jun 2026 | Payment | 44878 | -10,000.00 | 22,605.60 |

---

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
| 19 Aug 2026 | Invoice | 52648 | 4,360.11 | 27,562.82 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **-517.50** |
| 08 Jan 2026 | Invoice | 48676 | 4,140.00 | 3,622.50 |
| 08 Jan 2026 | Crd Note | 14231 | -4,140.00 | -517.50 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-517.50** |
| 03 Feb 2026 | Invoice | 49068 | 4,140.00 | 3,622.50 |
| 03 Feb 2026 | Crd Note | 14374 | -4,140.00 | -517.50 |
| 17 Feb 2026 | Invoice | 49288 | 4,140.00 | 3,622.50 |
| 19 Feb 2026 | Crd Note | 14445 | -4,140.00 | -517.50 |
| 23 Feb 2026 | Invoice | 49380 | 4,140.00 | 3,622.50 |
| 24 Feb 2026 | Crd Note | 14477 | -4,140.00 | -517.50 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-517.50** |
| 06 Mar 2026 | Invoice | 49610 | 3,450.00 | 2,932.50 |
| 09 Mar 2026 | Crd Note | 14556 | -3,450.00 | -517.50 |
| 16 Mar 2026 | Invoice | 49753 | 5,175.00 | 4,657.50 |
| 17 Mar 2026 | Crd Note | 14601 | -4,657.50 | 0.00 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 02 Apr 2026 | Invoice | 50052 | 7,245.00 | 7,245.00 |
| 02 Apr 2026 | Crd Note | 14698 | -5,692.50 | 1,552.50 |
| 09 Apr 2026 | Invoice | 50147 | 4,140.00 | 5,692.50 |
| 09 Apr 2026 | Crd Note | 14729 | -4,140.00 | 1,552.50 |
| 21 Apr 2026 | Invoice | 50319 | 4,140.00 | 5,692.50 |
| 21 Apr 2026 | Crd Note | 14784 | -4,140.00 | 1,552.50 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **1,552.50** |
| 05 May 2026 | Invoice | 50537 | 7,245.00 | 8,797.50 |
| 05 May 2026 | Invoice | 50939 | 7,245.00 | 16,042.50 |
| 06 May 2026 | Crd Note | 14864 | -5,865.00 | 10,177.50 |
| 06 May 2026 | Crd Note | 14994 | -1,380.00 | 8,797.50 |
| 06 May 2026 | Crd Note | 14995 | -6,210.00 | 2,587.50 |
| 18 May 2026 | Invoice | 50754 | 4,140.00 | 6,727.50 |
| 19 May 2026 | Crd Note | 14922 | -4,140.00 | 2,587.50 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **2,587.50** |
| 01 Jun 2026 | Invoice | 50971 | 3,450.00 | 6,037.50 |
| 02 Jun 2026 | Crd Note | 15007 | -5,520.00 | 517.50 |
| 11 Jun 2026 | Invoice | 51155 | 5,692.50 | 6,210.00 |
| 15 Jun 2026 | Crd Note | 15066 | -5,692.50 | 517.50 |
| 23 Jun 2026 | Invoice | 51388 | 4,140.00 | 4,657.50 |
| 24 Jun 2026 | Crd Note | 15114 | -5,175.00 | -517.50 |

---

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
| 19 Aug 2026 | Invoice | 52649 | 5,692.50 | 5,175.00 |
| 19 Aug 2026 | Crd Note | 15506 | -5,692.50 | -517.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 27,562.82 |
| Part 1B — CYL Deposits | -517.50 |
| **Combined (1A + 1B)** | **27,045.32** |
| ERP `CURRENT BALANCE` (TXT header) | 27,045.32 |
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

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **-1** | **0** | **0** |
| 08 Jan 2026 | Invoice | 48676 | 0 | +6 | 0 | 0 | 0 |
| 08 Jan 2026 | Crd Note | 14231 | 0 | -6 | 0 | 0 | 0 |
| **End Jan** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **0** | **-1** | **0** | **0** |
| 03 Feb 2026 | Invoice | 49068 | 0 | +6 | 0 | 0 | 0 |
| 03 Feb 2026 | Crd Note | 14374 | 0 | -6 | 0 | 0 | 0 |
| 17 Feb 2026 | Invoice | 49288 | 0 | +6 | 0 | 0 | 0 |
| 19 Feb 2026 | Crd Note | 14445 | 0 | -6 | 0 | 0 | 0 |
| 23 Feb 2026 | Invoice | 49380 | 0 | +6 | 0 | 0 | 0 |
| 24 Feb 2026 | Crd Note | 14477 | 0 | -6 | 0 | 0 | 0 |
| **End Feb** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **-1** | **0** | **0** |
| 06 Mar 2026 | Invoice | 49610 | 0 | +5 | 0 | 0 | 0 |
| 09 Mar 2026 | Crd Note | 14556 | 0 | -5 | 0 | 0 | 0 |
| 16 Mar 2026 | Invoice | 49753 | 0 | +6 | +2 | 0 | 0 |
| 17 Mar 2026 | Crd Note | 14601 | 0 | -6 | -1 | 0 | 0 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 02 Apr 2026 | Invoice | 50052 | 0 | +6 | +6 | 0 | 0 |
| 02 Apr 2026 | Crd Note | 14698 | 0 | -6 | -3 | 0 | 0 |
| 09 Apr 2026 | Invoice | 50147 | 0 | +6 | 0 | 0 | 0 |
| 09 Apr 2026 | Crd Note | 14729 | 0 | -6 | 0 | 0 | 0 |
| 21 Apr 2026 | Invoice | 50319 | 0 | +6 | 0 | 0 | 0 |
| 21 Apr 2026 | Crd Note | 14784 | 0 | -6 | 0 | 0 | 0 |
| **End Apr** | **Closing Balance** | — | **0** | **0** | **3** | **0** | **0** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **3** | **0** | **0** |
| 05 May 2026 | Invoice | 50537 | 0 | +6 | +6 | 0 | 0 |
| 05 May 2026 | Invoice | 50939 | 0 | +6 | +6 | 0 | 0 |
| 06 May 2026 | Crd Note | 14864 | 0 | -4 | -6 | 0 | 0 |
| 06 May 2026 | Crd Note | 14994 | 0 | -2 | 0 | 0 | 0 |
| 06 May 2026 | Crd Note | 14995 | 0 | -6 | -4 | 0 | 0 |
| 18 May 2026 | Invoice | 50754 | 0 | +6 | 0 | 0 | 0 |
| 19 May 2026 | Crd Note | 14922 | 0 | -6 | 0 | 0 | 0 |
| **End May** | **Closing Balance** | — | **0** | **0** | **5** | **0** | **0** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **5** | **0** | **0** |
| 01 Jun 2026 | Invoice | 50971 | 0 | +5 | 0 | 0 | 0 |
| 02 Jun 2026 | Crd Note | 15007 | 0 | -5 | -4 | 0 | 0 |
| 11 Jun 2026 | Invoice | 51155 | 0 | +6 | +3 | 0 | 0 |
| 15 Jun 2026 | Crd Note | 15066 | 0 | -6 | -3 | 0 | 0 |
| 23 Jun 2026 | Invoice | 51388 | 0 | +6 | 0 | 0 | 0 |
| 24 Jun 2026 | Crd Note | 15114 | 0 | -6 | -2 | 0 | 0 |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

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
| 19 Aug 2026 | Invoice | 52649 | 0 | +6 | +3 | 0 | 0 |
| 19 Aug 2026 | Crd Note | 15506 | 0 | -6 | -3 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **-1** | **0** | **0** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R27,562.82 |
| Cylinder Financial Balance (Part 1B close) | R-517.50 |
| **Total Debtor Balance** | **R27,045.32** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 9kg | -1 | R517.50 | R-517.50 |
| **Total** | **-1** | — | **R-517.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-517.50 | R-517.50 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R27,045.32 | — | R0.00 |

**ERP Combined Balance (TXT header):** R27,045.32  
**Reconstructed Balance (1A + 1B):** R27,045.32  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
