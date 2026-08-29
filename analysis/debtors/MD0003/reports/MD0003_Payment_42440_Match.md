# MD0003 — Payment 42440 Catch-Up Batch (STAT 121)

**Payment doc:** 42440 · **Date:** 2025-11-28 · **Gross:** R47,511.17 · **STAT:** 121  
**Generated:** 2026-08-11  
**Sources:** `raw/Enquiry/DEBENQ_CURRENT.TXT` (allocation detail), `raw/Remittance/10.10.2025.pdf` (customer AP snapshot — see §4)

---

## 1. Summary

| Slice type | Amount | Role |
| :--- | ---: | :--- |
| Oct-2025 LPG pool (refs 46861, 47094, 47101, 47333) | R16,016.28 | **Override 2025-10** — cent-exact to Oct invoice refs |
| Nov-2025 LPG pool (refs 47558, 47622, 47827, 47828) | R14,560.26 | **Override 2025-11** — cent-exact to Nov invoice refs |
| Jul-2025 arrears (refs 44872, 45160) | R9,824.50 | Catch-up — not a calendar-month override |
| Blank-ref slices | R4,039.36 | ERP clerical decomposition |
| Dec prepay slice (ref 48372) | R3,070.77 | Prepayment / DN-lag — invoice posts Dec-2025 |
| **Total** | **R47,511.17** | ✓ |

**Verdict:** Oct and Nov **2025 billing months are not skipped** at cash level — settled via **42440** ref-linked slices. Overrides registered in `payment_pattern_overrides.json` (registry v7).

---

## 2. Oct 2025 ref slices (R16,016.28)

| Target doc | ERP slice | LPG line |
| :--- | ---: | ---: |
| 46861 | R3,432.06 | R3,432.06 |
| 47094 | R3,432.06 | R3,432.06 |
| 47101 | R5,720.10 | R5,720.10 |
| 47333 | R3,432.06 | R3,432.06 |

---

## 3. Nov 2025 ref slices (R14,560.26)

| Target doc | ERP slice | LPG line |
| :--- | ---: | ---: |
| 47558 | R3,360.06 | R3,360.06 |
| 47622 | R2,240.04 | R2,240.04 |
| 47827 | R5,600.10 | R5,600.10 |
| 47828 | R3,360.06 | R3,360.06 |

---

## 4. `10.10.2025.pdf` — not a payment remittance

This file is a **customer A/P vendor transaction report** (APVTRN01), session **10/10/2025**, vendor **GAZ001**, period **01/01/2025–30/09/2025**.

| Field | Value |
| :--- | ---: |
| Report total (transaction value) | R110,417.22 |
| **Open balance on customer books** | **R20,348.53** |
| Open Aug items at snapshot | 45435 (R3,684.19), 45778 (R2,398.72), 45787 (R150.02) |
| Open Sep/Oct items at snapshot | 46055, 46075, 46724, 46760 (balances shown) |

**Use:** Pre–42440 **open-item cross-check** — confirms Aug/Sep invoices still open on customer side before the Nov-28 ERP payment posted. **Not** COD remittance advice for doc 42440.

Archived copy: `raw/Remittance/LEDER 2020-2023.xls` and prior `MD0003_DETAILED_LEDGER.xls` cover earlier AP windows.

---

## 5. Remaining 2025 gaps (unchanged)

| Month | Status |
| :--- | :--- |
| 2025-05 | Still flagged skipped in pattern report — no override |
| 2025-08 | Partial STAT:120 (41501 R6,232.93); **Aug remainder not in 42440** ref slices |
