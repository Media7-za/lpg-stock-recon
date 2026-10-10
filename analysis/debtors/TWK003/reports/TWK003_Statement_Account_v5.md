# Statement of Account: TWK AGRI (TWK003) - Version 5 (Sub-Ledger Position Statement)
**Period:** Mar 2025 → Feb 2026 &nbsp;|&nbsp; **Account:** TWK003
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/TWK002/raw/TWK003_2026-10-10.TXT` TWK003_2026-10-10.TXT line 1 BALANCE B/F 0.00 (fresh ERP export dated 2026-10-10, verified by operator: header = running balance chain = totals). Child account of TWK002 (ADM-94 Q1/Q15, consolidated family).)
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
| 03 Oct 2025 | Invoice | 46857 | 11,000.44 | 11,000.44 |
| 10 Oct 2025 | Invoice | 47076 | 11,000.44 | 22,000.88 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **22,000.88** |
| 04 Nov 2025 | Invoice | 47523 | 11,000.44 | 33,001.32 |
| 21 Nov 2025 | Invoice | 47866 | 2,000.00 | 35,001.32 |
| 22 Nov 2025 | Invoice | 47880 | 5,499.99 | 40,501.31 |
| 24 Nov 2025 | Crd Note | 13933 | -2,300.00 | 38,201.31 |
| 28 Nov 2025 | Invoice | 47991 | 5,499.99 | 43,701.30 |
| 28 Nov 2025 | Crd Note | 13966 | -5,499.99 | 38,201.31 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **38,201.31** |
| 25 Feb 2026 | Payment | 43500 | -38,501.31 | -300.00 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

_No CYL deposit activity in period._

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | -300.00 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **-300.00** |
| ERP `CURRENT BALANCE` (TXT header) | -300.00 |
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

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R-300.00 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Debtor Balance** | **R-300.00** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R-300.00 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-300.00  
**Reconstructed Balance (1A + 1B):** R-300.00  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
