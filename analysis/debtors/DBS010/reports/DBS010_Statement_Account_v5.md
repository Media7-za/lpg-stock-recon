# Statement of Account: DBS CHICKEN EMPTIES (DBS010) - Version 5 (Sub-Ledger Position Statement)
**Period:** Mar 2025 → Jul 2025 &nbsp;|&nbsp; **Account:** DBS010
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/DBS010/raw/DBS010_DERIVED_FROM_MASTER_DUMP.TXT` ASSUMED = 0.00 — no genuine ERP DEBENQ export exists for this debtor. Derived from master ledger dump (ERP RAW DATA/DETRANS.TXT), which itself only begins Mar 2025. True pre-Mar-2025 opening balance is UNKNOWN, not zero — treat this whole statement as ASSUMED basis pending a real ERP export (SKILL_Debtors_Orchestrator.md ERP freshness gate).)
**LPG Opening B/F (1A):** R0.00 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-08-25 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

> **DB unavailable this run** (DATABASE_URL not set in this environment). Part 2 custody and the Part 1A/1B LPG-vs-CYL doc-line split fall back to TXT-only heuristics — treat all figures below as ASSERTED/ASSUMED, not DB-verified.

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Mar 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 12 Mar 2025 | Invoice | 41427 | 1,725.00 | 1,725.00 |
| 12 Mar 2025 | Crd Note | 12054 | -1,207.50 | 517.50 |
| 12 Mar 2025 | Crd Note | 13712 | -517.50 | 0.00 |
| 29 Mar 2025 | Invoice | 41842 | 1,207.50 | 1,207.50 |
| 31 Mar 2025 | Crd Note | 12154 | -1,207.50 | 0.00 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 25 Apr 2025 | Invoice | 42534 | 560.00 | 560.00 |
| 25 Apr 2025 | Crd Note | 12342 | -560.00 | 0.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 21 Jul 2025 | Payment | 40097 | -598.00 | -598.00 |
| 21 Jul 2025 | Payment | 40097 | -402.00 | -1,000.00 |
| 21 Jul 2025 | Payment | 40097 | 598.00 | -402.00 |
| 21 Jul 2025 | Payment | 40097 | 402.00 | 0.00 |
| 21 Jul 2025 | Payment | 40097 | -1,000.00 | -1,000.00 |
| 21 Jul 2025 | Payment | 40107 | 1,000.00 | 0.00 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 10 Apr 2025 | Invoice | 42189 | 1,207.50 | 1,207.50 |
| 10 Apr 2025 | Crd Note | 12250 | -1,207.50 | 0.00 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **0.00** |
| 09 May 2025 | Invoice | 42939 | 1,035.00 | 1,035.00 |
| 09 May 2025 | Crd Note | 12449 | -1,035.00 | 0.00 |
| 16 May 2025 | Invoice | 43110 | 1,725.00 | 1,725.00 |
| 16 May 2025 | Crd Note | 12500 | -1,725.00 | 0.00 |
| 20 May 2025 | Invoice | 43215 | 1,207.50 | 1,207.50 |
| 20 May 2025 | Crd Note | 12526 | -1,207.50 | 0.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 0.00 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **0.00** |
| ERP `CURRENT BALANCE` (TXT header) | 0.00 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor DBS010` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

> **DB unavailable — Part 2 omitted.** Custody quantities require a live `vw_clean_transactions` connection (DATABASE_URL not set in this environment). No custody position can be stated for this run.

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R0.00 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Debtor Balance** | **R0.00** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R0.00 | — | R0.00 |

**ERP Combined Balance (TXT header):** R0.00  
**Reconstructed Balance (1A + 1B):** R0.00  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
