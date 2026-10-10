# Statement of Account: TWK AGRI (TWK004) - Version 5 (Sub-Ledger Position Statement)
**Period:** Mar 2025 → Oct 2026 &nbsp;|&nbsp; **Account:** TWK004
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/TWK002/raw/TWK004_2026-10-10.TXT` TWK004_2026-10-10.TXT line 1 BALANCE B/F 0.00 (fresh ERP export dated 2026-10-10, verified by operator: header = running balance chain = totals). Child account of TWK002 (ADM-94 Q1/Q15, consolidated family).)
**LPG Opening B/F (1A):** R0.00 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-10 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Mar 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **0.00** |
| 03 Oct 2025 | Invoice | 46858 | 9,000.36 | 9,000.36 |
| 18 Oct 2025 | Invoice | 47176 | 3,000.12 | 12,000.48 |
| 24 Oct 2025 | Invoice | 47297 | 7,000.28 | 19,000.76 |
| 24 Oct 2025 | Invoice | 47303 | 7,000.28 | 26,001.04 |
| 24 Oct 2025 | Crd Note | 13744 | -7,000.28 | 19,000.76 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **19,000.76** |
| 10 Nov 2025 | Invoice | 47584 | 5,999.55 | 25,000.31 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **25,000.31** |
| 25 Feb 2026 | Payment | 43500 | -25,000.31 | 0.00 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **0.00** |
| 04 Sept 2026 | Invoice | 52948 | 9,000.00 | 9,000.00 |
| 10 Sept 2026 | Invoice | 53113 | 22,000.00 | 31,000.00 |

---

### October 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **31,000.00** |
| 09 Oct 2026 | Invoice | 53535 | 32,500.00 | 63,500.00 |
| 09 Oct 2026 | Invoice | 53536 | 30,000.00 | 93,500.00 |
| 10 Oct 2026 | Crd Note | 15781 | -32,500.00 | 61,000.00 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

_No CYL deposit activity in period._

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 61,000.00 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **61,000.00** |
| ERP `CURRENT BALANCE` (TXT header) | 61,000.00 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: stale` · `ingestCoverage: partial`)

| Check | Status |
| :--- | :--- |
| Display status | `STALE_PARTIAL` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **BLOCKED** |
| SKU analysis | **BLOCKED** |

> **Custody conclusions blocked.** DB qty may be incomplete or stale vs statement TXT (`analysis/debtors/TWK002/raw/TWK004_2026-10-10.TXT`). See `TWK004_INGEST_COVERAGE_*.md`.

**INGEST_GAP documents (custody-blocking):**
- **53535** (Invoice, 2026-10-09) — `MISSING_HEADER_AND_LINES`
- **53536** (Invoice, 2026-10-09) — `MISSING_HEADER_AND_LINES`
- **15781** (Crd Note, 2026-10-10) — `MISSING_HEADER_AND_LINES`

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **Gate: custody BLOCKED — see Ingest Gate above.***

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Nov** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### October 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R61,000.00 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Debtor Balance** | **R61,000.00** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R61,000.00 | — | R0.00 |

> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage `STALE_PARTIAL`. DB-backed qty may not reflect all TXT documents.

**ERP Combined Balance (TXT header):** R61,000.00  
**Reconstructed Balance (1A + 1B):** R61,000.00  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
