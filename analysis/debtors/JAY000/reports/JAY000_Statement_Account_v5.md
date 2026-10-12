# Statement of Account: JAYZ GRILL (JAY000) - Version 5 (Sub-Ledger Position Statement)
**Period:** Aug 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** JAY000
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/JAY000/raw/JAY000CURRENT.TXT.TXT` JAY000CURRENT.TXT.TXT line 13 — BALANCE B/F R0.00. Brand-new account; first row is CN 15509 on 18 Aug 2026. No prior-year carry.)
**LPG Opening B/F (1A):** R0.00 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-14 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Aug 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 18 Aug 2026 | Invoice | 52631 | 6,930.07 | 6,930.07 |
| 18 Aug 2026 | Invoice | 52688 | 6,930.07 | 13,860.14 |
| 18 Aug 2026 | Crd Note | 15509 | -6,930.07 | 6,930.07 |
| 25 Aug 2026 | Invoice | 52793 | 6,930.07 | 13,860.14 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 18 Aug 2026 | Invoice | 52632 | 6,037.50 | 6,037.50 |
| 18 Aug 2026 | Invoice | 52688 | 6,037.50 | 12,075.00 |
| 18 Aug 2026 | Crd Note | 15510 | -6,037.50 | 6,037.50 |
| 25 Aug 2026 | Invoice | 52794 | 6,037.50 | 12,075.00 |
| 26 Aug 2026 | Crd Note | 15552 | -6,037.50 | 6,037.50 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **6,037.50** |
| 03 Sept 2026 | Crd Note | 15594 | -6,037.50 | 0.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 13,860.14 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **13,860.14** |
| ERP `CURRENT BALANCE` (TXT header) | 13,860.14 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor JAY000` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 18 Aug 2026 | Invoice | 52632 | 0 | 0 | 0 | 0 | +5 |
| 18 Aug 2026 | Invoice | 52688 | 0 | 0 | 0 | 0 | +5 |
| 18 Aug 2026 | Crd Note | 15510 | 0 | 0 | 0 | 0 | -5 |
| 25 Aug 2026 | Invoice | 52794 | 0 | 0 | 0 | 0 | +5 |
| 26 Aug 2026 | Crd Note | 15552 | 0 | 0 | 0 | 0 | -5 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **5** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **5** |
| 03 Sept 2026 | Crd Note | 15594 | 0 | 0 | 0 | 0 | -5 |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R13,860.14 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Debtor Balance** | **R13,860.14** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R13,860.14 | — | R0.00 |

**ERP Combined Balance (TXT header):** R13,860.14  
**Reconstructed Balance (1A + 1B):** R13,860.14  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
