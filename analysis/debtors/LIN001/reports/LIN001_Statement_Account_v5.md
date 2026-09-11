# Statement of Account: SLINDOKUHLE ENTERPRISES (PTY) LTD (LIN001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jan 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** LIN001
**Combined Opening B/F:** R132,098.48 (ERP verified — source: `analysis/debtors/LIN001/raw/DEBENQ (1).TXT` DEBENQ (1).TXT line 172 — running BALANCE after inv 48504 (26 Dec 2025), immediately before first 2026 row CN 14250 (10 Jan 2026))
**LPG Opening B/F (1A):** R132,098.48 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-02 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jan 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **132,098.48** |
| 10 Jan 2026 | Payment | 42975 | -1,510.76 | 130,587.72 |
| 10 Jan 2026 | Payment | 42975 | -51,681.74 | 78,905.98 |
| 10 Jan 2026 | Payment | 42976 | -1,511.19 | 77,394.79 |
| 10 Jan 2026 | Payment | 42976 | -41,005.31 | 36,389.48 |
| 10 Jan 2026 | Invoice | 48725 | 44,856.77 | 81,246.25 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **81,246.25** |
| 06 Feb 2026 | Payment | 43246 | -34,877.50 | 46,368.75 |
| 06 Feb 2026 | Payment | 43247 | -49,588.00 | -3,219.25 |
| 06 Feb 2026 | Invoice | 49115 | 51,106.81 | 47,887.56 |
| 11 Feb 2026 | Journal | 458 | -0.41 | 47,887.15 |
| 13 Feb 2026 | Invoice | 49252 | 50,764.36 | 98,651.51 |
| 15 Feb 2026 | Crd Note | 14431 | -50,764.36 | 47,887.15 |
| 16 Feb 2026 | Invoice | 49265 | 48,681.87 | 96,569.02 |
| 16 Feb 2026 | Crd Note | 14435 | -3,082.00 | 93,487.02 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **93,487.02** |
| 08 May 2026 | Payment | 44482 | -75,844.50 | 17,642.52 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **17,642.52** |
| 06 Jun 2026 | Payment | 44974 | -40,590.60 | -22,948.08 |
| 07 Jun 2026 | Payment | 44975 | -63,325.00 | -86,273.08 |
| 08 Jun 2026 | Invoice | 51132 | 52,768.19 | -33,504.89 |
| 18 Jun 2026 | Invoice | 51268 | 55,179.88 | 21,674.99 |
| 18 Jun 2026 | Crd Note | 15086 | -55,179.88 | -33,504.89 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-33,504.89** |
| 03 Jul 2026 | Payment | 44976 | -54,981.36 | -88,486.25 |
| 08 Jul 2026 | Invoice | 51681 | 54,584.19 | -33,902.06 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-33,902.06** |
| 22 Aug 2026 | Payment | 45840 | -34,721.00 | -68,623.06 |
| 24 Aug 2026 | Invoice | 52768 | 32,277.80 | -36,345.26 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **-36,345.26** |
| 02 Sept 2026 | Invoice | 52924 | 74,433.70 | 38,088.44 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **0.00** |
| 10 Jan 2026 | Invoice | 48725 | 103,442.50 | 103,442.50 |
| 10 Jan 2026 | Crd Note | 14250 | -95,392.50 | 8,050.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **8,050.00** |
| 06 Feb 2026 | Invoice | 49115 | 90,965.00 | 99,015.00 |
| 06 Feb 2026 | Crd Note | 14388 | -63,767.50 | 35,247.50 |
| 13 Feb 2026 | Invoice | 49252 | 95,795.00 | 131,042.50 |
| 15 Feb 2026 | Invoice | 49263 | 96,600.00 | 227,642.50 |
| 15 Feb 2026 | Crd Note | 14430 | -96,600.00 | 131,042.50 |
| 15 Feb 2026 | Crd Note | 14431 | -95,795.00 | 35,247.50 |
| 16 Feb 2026 | Invoice | 49265 | 95,795.00 | 131,042.50 |
| 16 Feb 2026 | Crd Note | 14432 | -96,600.00 | 34,442.50 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **34,442.50** |
| 08 Jun 2026 | Invoice | 51132 | 79,925.00 | 114,367.50 |
| 08 Jun 2026 | Crd Note | 15039 | -67,792.50 | 46,575.00 |
| 18 Jun 2026 | Invoice | 51268 | 77,682.50 | 124,257.50 |
| 18 Jun 2026 | Crd Note | 15086 | -77,682.50 | 46,575.00 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **46,575.00** |
| 08 Jul 2026 | Invoice | 51681 | 79,465.00 | 126,040.00 |
| 08 Jul 2026 | Crd Note | 15215 | -80,097.50 | 45,942.50 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **45,942.50** |
| 24 Aug 2026 | Invoice | 52768 | 37,375.00 | 83,317.50 |
| 24 Aug 2026 | Crd Note | 15543 | -39,445.00 | 43,872.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 38,088.44 |
| Part 1B — CYL Deposits | 43,872.50 |
| **Combined (1A + 1B)** | **81,960.94** |
| ERP `CURRENT BALANCE` (TXT header) | 81,960.94 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: stale` · `ingestCoverage: partial`)

| Check | Status |
| :--- | :--- |
| Display status | `STALE_PARTIAL` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **BLOCKED** |
| SKU analysis | **BLOCKED** |

> **Custody conclusions blocked.** DB qty may be incomplete or stale vs statement TXT (`analysis/debtors/LIN001/raw/DEBENQ (1).TXT`). See `LIN001_INGEST_COVERAGE_*.md`.

**INGEST_GAP documents (custody-blocking):**
- **44976** (Payment, 2026-07-03) — `MISSING_HEADER`
- **45840** (Payment, 2026-08-22) — `MISSING_HEADER`
- **52924** (Invoice, 2026-09-02) — `MISSING_HEADER_AND_LINES`

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **Gate: custody BLOCKED — see Ingest Gate above.***

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 10 Jan 2026 | Invoice | 48725 | +7 | +7 | +182 | 0 | 0 |
| 10 Jan 2026 | Crd Note | 14250 | -15 | -15 | -146 | 0 | 0 |
| **End Jan** | **Closing Balance** | — | **-8** | **-8** | **36** | **0** | **0** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **-8** | **-8** | **36** | **0** | **0** |
| 06 Feb 2026 | Invoice | 49115 | +14 | +28 | +98 | +5 | +5 |
| 06 Feb 2026 | Crd Note | 14388 | -19 | -19 | -56 | 0 | -8 |
| 13 Feb 2026 | Invoice | 49252 | +14 | +14 | +126 | +4 | +6 |
| 15 Feb 2026 | Invoice | 49263 | 0 | +21 | +126 | +5 | +9 |
| 15 Feb 2026 | Crd Note | 14430 | 0 | -21 | -126 | -5 | -9 |
| 15 Feb 2026 | Crd Note | 14431 | -14 | -14 | -126 | -4 | -6 |
| 16 Feb 2026 | Invoice | 49265 | +14 | +14 | +126 | +4 | +6 |
| 16 Feb 2026 | Crd Note | 14432 | 0 | -21 | -126 | -5 | -9 |
| **End Feb** | **Closing Balance** | — | **1** | **-6** | **78** | **4** | **-6** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **-6** | **78** | **4** | **-6** |
| 08 Jun 2026 | Invoice | 51132 | +20 | +20 | +80 | +10 | 0 |
| 08 Jun 2026 | Crd Note | 15039 | -15 | -20 | -86 | 0 | 0 |
| 18 Jun 2026 | Invoice | 51268 | +14 | +21 | +70 | +5 | +10 |
| 18 Jun 2026 | Crd Note | 15086 | -14 | -21 | -70 | -5 | -10 |
| **End Jun** | **Closing Balance** | — | **6** | **-6** | **72** | **14** | **-6** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **6** | **-6** | **72** | **14** | **-6** |
| 08 Jul 2026 | Invoice | 51681 | +13 | +14 | +84 | 0 | +15 |
| 08 Jul 2026 | Crd Note | 15215 | -14 | -14 | -84 | 0 | -15 |
| **End Jul** | **Closing Balance** | — | **5** | **-6** | **72** | **14** | **-6** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **5** | **-6** | **72** | **14** | **-6** |
| 24 Aug 2026 | Invoice | 52768 | +10 | +10 | 0 | 0 | +20 |
| 24 Aug 2026 | Crd Note | 15543 | -10 | -20 | -14 | 0 | -10 |
| **End Aug** | **Closing Balance** | — | **5** | **-16** | **58** | **14** | **4** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **5** | **-16** | **58** | **14** | **4** |
| **End Sep** | **Closing Balance** | — | **5** | **-16** | **58** | **14** | **4** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R38,088.44 |
| Cylinder Financial Balance (Part 1B close) | R43,872.50 |
| **Total Debtor Balance** | **R81,960.94** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | 5 | R632.50 | R3,162.50 |
| 19kg | -16 | R690.00 | R-11,040.00 |
| 9kg | 58 | R517.50 | R30,015.00 |
| D.1 | 14 | R1,207.50 | R16,905.00 |
| S.1 | 4 | R1,207.50 | R4,830.00 |
| **Total** | **65** | — | **R43,872.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R43,872.50 | R43,872.50 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R81,960.94 | — | R0.00 |

> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage `STALE_PARTIAL`. DB-backed qty may not reflect all TXT documents.

**ERP Combined Balance (TXT header):** R81,960.94  
**Reconstructed Balance (1A + 1B):** R81,960.94  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
