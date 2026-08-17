# Creditor Analysis: ORYX ENERGY (008ORY) - Version 5 (Sub-Ledger Position Statement)
**Type:** Accounts Payable (supplier) &nbsp;|&nbsp; **Period:** Jul 2026 → Jul 2026
**Account:** 008ORY (linked: 007ORY)
**Combined Opening B/F:** R115,550.83 (ERP verified — source: `analysis/creditors/008ORY/raw/008ORYCURRENT.TXT` 008ORYCURRENT.TXT line 1 — BALANCE B/F before first July 2026 period row (INTERIM: derived from Oryx supplier-ledger opening totals Debit 6,525,913.48 / Credit 6,641,464.31; replace with authoritative ERP creditor-enquiry export))
**LPG Opening B/F (1A):** R115,550.83 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Direction:** GRV increases payable (+); Deb Note & Payment reduce it (−)
**Last regenerated:** 2026-08-17 from ERP TXT (`reconcile_creditor_v5_from_txt.mjs`)

---

## Part 1A: LPG Gas Purchases Financial Statement
*Gas fill GRVs, supplier Deb Notes, and payments since Jul 2026. Payments route to this sub-ledger per creditor config (`paymentLane: LPG`).*

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **115,550.83** |
| 01 Jul 2026 | GRV | 58291 | 210,161.67 | 325,712.50 |
| 01 Jul 2026 | Payment | 72010 | -41,006.68 | 284,705.82 |
| 01 Jul 2026 | Deb Note | 31810 | -117,300.00 | 167,405.82 |
| 02 Jul 2026 | GRV | 58292 | 95,343.18 | 262,749.00 |
| 02 Jul 2026 | Payment | 72011 | -32,129.03 | 230,619.97 |
| 02 Jul 2026 | Payment | 72012 | -31,000.00 | 199,619.97 |
| 02 Jul 2026 | Deb Note | 31811 | -54,337.50 | 145,282.47 |
| 03 Jul 2026 | GRV | 58293 | 152,829.03 | 298,111.50 |
| 03 Jul 2026 | Deb Note | 31812 | -86,077.50 | 212,034.00 |
| 04 Jul 2026 | GRV | 58294 | 157,964.30 | 369,998.30 |
| 04 Jul 2026 | Deb Note | 31813 | -86,825.00 | 283,173.30 |
| 06 Jul 2026 | GRV | 58295 | 51,205.30 | 334,378.60 |
| 06 Jul 2026 | Deb Note | 31814 | -10,867.50 | 323,511.10 |
| 07 Jul 2026 | Payment | 72013 | -84,547.81 | 238,963.29 |
| 08 Jul 2026 | GRV | 58296 | 198,972.80 | 437,936.09 |
| 08 Jul 2026 | Payment | 72014 | -12,677.29 | 425,258.80 |
| 08 Jul 2026 | Payment | 72015 | -53,270.00 | 371,988.80 |
| 08 Jul 2026 | Deb Note | 31815 | -114,425.00 | 257,563.80 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`.1` SKUs / `-EMPTY` refs). Populated from the DB line-split; empty when DATABASE_URL is not wired.*

_No CYL deposit activity in period._

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas Purchases | 257,563.80 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **257,563.80** |
| ERP `CURRENT BALANCE` (TXT header) | 257,563.80 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: unverified` · `ingestCoverage: unverified`)

| Check | Status |
| :--- | :--- |
| Display status | `UNVERIFIED` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **UNVERIFIED** |
| SKU analysis | **UNVERIFIED** |

> **Custody conclusions unverified.** DB qty may be incomplete, stale, or unavailable vs statement TXT (`analysis/creditors/008ORY/raw/008ORYCURRENT.TXT`). See `008ORY_INGEST_COVERAGE_*.md`.

**Custody-blocking documents:**
- **31810** (Deb Note, 2026-07-01) — `DB_UNVERIFIED`
- **58291** (GRV, 2026-07-01) — `DB_UNVERIFIED`
- **31811** (Deb Note, 2026-07-02) — `DB_UNVERIFIED`
- **58292** (GRV, 2026-07-02) — `DB_UNVERIFIED`
- **31812** (Deb Note, 2026-07-03) — `DB_UNVERIFIED`
- **58293** (GRV, 2026-07-03) — `DB_UNVERIFIED`
- **31813** (Deb Note, 2026-07-04) — `DB_UNVERIFIED`
- **58294** (GRV, 2026-07-04) — `DB_UNVERIFIED`
- **31814** (Deb Note, 2026-07-06) — `DB_UNVERIFIED`
- **58295** (GRV, 2026-07-06) — `DB_UNVERIFIED`
- **31815** (Deb Note, 2026-07-08) — `DB_UNVERIFIED`
- **58296** (GRV, 2026-07-08) — `DB_UNVERIFIED`

---


## Part 2: Cylinder (CYL) Shell Movement Tracker
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **No DB-backed custody rows — see Ingest Gate above.***

_No custody movement available (DB not wired or no CYL lines in period)._

---

<!-- INTERNAL_ONLY_START -->
<!-- CREDITOR_POSITION_WORKSPACE_START -->

## Creditor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Payable (Part 1A close) | R257,563.80 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Creditor Balance (payable)** | **R257,563.80** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R257,563.80 | — | R0.00 |

> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage `UNVERIFIED`. DB-backed qty may not reflect all TXT documents.

**ERP Combined Balance (TXT header):** R257,563.80  
**Reconstructed Balance (1A + 1B):** R257,563.80  
**Variance:** R0.00

<!-- CREDITOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
