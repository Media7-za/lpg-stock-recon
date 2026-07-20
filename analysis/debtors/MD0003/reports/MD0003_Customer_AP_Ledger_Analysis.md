# MD0003 — Customer A/P Ledger Analysis

**Source:** `raw/Remittances/MD0003_DETAILED_LEDGER.xls`  
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD  
**Vendor:** GAZ001 — GAZ EXPRESS  
**Report:** APVTRN01 — A/P Vendor Transactions by Document Date  
**Session date:** 2025-09-08  
**Period:** 01/01/2024 → 31/07/2025  
**Parsed to:** `data/customer_ap_ledger_2024_2025.csv` (83 transactions)

---

## 1. Executive Summary

This file is **not a COD remittance advice** — it is the customer's own accounts-payable ledger export. It ranks as **Tier-1.5 evidence**: customer-confirmed invoice settlement status, but without payment-date or bank-reference detail per batch.

| Metric | Value |
| :--- | ---: |
| Invoice total (IN) | R327,955.08 |
| Credit notes (CR) | R−8,402.14 |
| Net vendor total | R319,552.94 |
| **Open balance (snapshot)** | **R13,651.45** |

At the **2025-09-08 snapshot**, only **four invoices** remained open — all dated Jun/Jul 2025. These cent-exact match ERP payments **40430** and **41044** already posted on our side (Aug/Sep 2025), confirming the customer had not yet cleared them when the export was run.

**Jan–May 2025** invoices all show **zero balance** on the customer's books — contradicting the "skipped month" flags in the 2025 payment pattern report for **2025-01**, and partially clarifying **2025-05** through **2025-07**.

---

## 2. Open Items at Snapshot (2025-09-08)

| Invoice | Doc Date | Amount | Customer Balance | ERP Payment | ERP Date | Match |
| :--- | :---: | ---: | ---: | :--- | :---: | :---: |
| 44136 | 29/06/2025 | R3,755.57 | R3,755.57 | 40430 (STAT:118) | 2025-08-01 | ✅ |
| 44439 | 07/07/2025 | R3,755.57 | R3,755.57 | 41044 (STAT:119) | 2025-09-01 | ✅ |
| 44634 | 07/07/2025 | R2,456.12 | R2,456.12 | 41044 (STAT:119) | 2025-09-01 | ✅ |
| 44937 | 17/07/2025 | R3,684.19 | R3,684.19 | 41044 (STAT:119) | 2025-09-01 | ✅ |
| **Total** | | **R13,651.45** | **R13,651.45** | | | ✅ |

> Timing note: Customer snapshot predates their clearance of Jun/Jul invoices. Our ERP already records the matching cash (40430 + 41044).

---

## 3. 2025 Monthly Status (Customer Ledger)

| Billing Month | Customer IN Total | Invoice Docs | Status on 2025-09-08 | ERP Payment Link |
| :--- | ---: | :--- | :--- | :--- |
| **2025-01** | R21,718.57 | 39842, 40016, 40112, 39784 | **PAID** (bal 0) | STAT:113 — 37262 + 37263 (2025-03-03) |
| **2025-02** | R15,633.20 | 40954, 41010, 40661, 40803 | **PAID** | 37817 (2025-04-01) — already matched |
| **2025-03** | R4,689.96 | 41324 | **PAID** | 38372 (2025-05-02) — already matched |
| **2025-04** | R24,122.60 | 42046, 42092, 42279, 42318, 42676 | **PAID** | 39145 (2025-06-02) — already matched |
| **2025-05** | R13,825.05 | 41409O–Q, 41422O–R, 43062, 43377, 43387 | **PAID** | Mixed LPG + CYL; LPG slice ≈ R10,252.91 via 39816 |
| **2025-06** | R3,755.57 | 44136 | **OPEN** → cleared by 40430 | Override registered |
| **2025-07** | R9,895.88 | 44439, 44634, 44937 | **OPEN** → cleared by 41044 | Override registered |

**Not in export scope** (period ends 31/07/2025 doc dates): Aug, Oct, Nov 2025 billing months remain unresolved — still need remittances or later ledger export.

---

## 4. May 2025 — LPG vs CYL Split

Customer May bucket totals **R13,825.05** across 10 lines:

| Doc Group | Amount | Lane |
| :--- | ---: | :--- |
| 41409O/Q, 41422O/R (8 lines) | R3,572.14 | CYL container debits |
| 43062, 43377, 43387 | R10,252.91 | LPG gas |
| **Total** | **R13,825.05** | |

Our LPG billing month **2025-05** = **R12,830.54**. The **R994.51 gap** vs customer gross likely reflects CYL lines booked in the May calendar window on the customer side but excluded from LPG billing pool. Payment **39816** (R10,252.91) aligns to the LPG-only slice — **R2,577.63 residual** vs our LPG month remains under investigation (doc 43387 = R2,577.63 may be timing boundary).

---

## 5. Overrides Applied from This Evidence

| Billing Month | Payment Doc | Amount | Evidence | Variance |
| :--- | :--- | ---: | :--- | ---: |
| 2025-01 | 37263 (STAT:113 batch) | R21,718.57 | Customer AP zero-balance + ERP batch sum | R0.00 |
| 2025-06 | 40430 | R3,755.57 | Customer open item = ERP payment cent-exact | R0.00 |
| 2025-07 | 41044 | R9,895.88 | Customer open items = ERP payment cent-exact | R0.00 |

---

## 6. Remaining Gaps

| Month | Billed (LPG) | Status | Next Action |
| :--- | ---: | :--- | :--- |
| 2025-05 | R12,830.54 | Partial — customer paid, LPG slice ≠ month total | Cross-check 39816 remittance or Aug STAT batch |
| 2025-08 | R14,743.25 | No customer ledger rows (post-period) | Source remittance / later AP export |
| 2025-10 | R16,016.28 | No customer ledger rows | Source remittance |
| 2025-11 | R14,560.26 | No customer ledger rows | Source remittance |

---

## 7. Source Hierarchy Placement

Per locked MD0003 doctrine:

1. COD remittance advice — highest
2. Gross payment doc total (bank EFT)
3. **Customer A/P ledger export** ← this file
4. Monthly LPG billing (`vw_clean_transactions`)
5. ERP `ref_no` / Alloc splits — cross-check only
