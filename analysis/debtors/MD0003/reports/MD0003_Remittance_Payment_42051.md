# MD0003 — Remittance Cross-Check: Payment 42051 (STAT 121)

**Source:** COD Remittance Advice dated **01/11/2025**  
**File:** `raw/Remittances/01.11.2025.pdf`  
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003)  
**Payee:** GAZ EXPRESS  
**Bank reference:** `000000000110925210`  
**Generated:** 2026-07-16

> Note: All seven files supplied (`gaz.pdf` … `gaz (6).pdf`) are **identical copies** of this remittance. One canonical file is archived.

---

## 1. Summary

| Field | Remittance | ERP Payment 42051 |
| :--- | ---: | ---: |
| Payment date | 2025-11-01 | 2025-11-01 |
| STAT batch | — | STAT:121 |
| **Customer-stated total** | **R35,770.31** | Ref slices + blank: **R35,770.31** |
| ERP doc gross (incl Alloc mirrors) | — | R101,552.77 |
| LPG lines on remittance (excl 46445) | R32,665.31 | LPG ref slices: **R32,665.31** ✓ |
| CYL line 46445 | R3,105.00 | ERP ref slice: R57.50 ⚠ |

**Verdict:** Remittance **confirms customer intent** for R35,770.31 on payment doc **42051**. Nine LPG invoice refs are **cent-exact** vs remittance. CYL invoice 46445 is **fully paid on remittance** but ERP posts only R57.50 against that ref (deposit slice mismatch).

---

## 2. Line-by-Line Match

| Doc | Inv Date | Remittance | ERP ref slice | LPG target | Match |
| :--- | :--- | ---: | ---: | ---: | :--- |
| 43721 | 2025-09-30 | R3,866.45 | R3,866.45 | R3,866.45 | ✓ |
| 45437 | 2025-09-30 | R4,912.25 | R4,912.25 | R4,912.25 | ✓ |
| 45895 | 2025-09-30 | R3,598.07 | R3,598.07 | R3,598.07 | ✓ |
| 46055 | 2025-09-09 | R4,797.43 | R4,797.43 | R4,797.43 | ✓ |
| 46075 | 2025-09-09 | R3,598.07 | R3,598.07 | R3,598.07 | ✓ |
| 46334 | 2025-09-30 | R3,432.06 | R3,432.06 | R3,432.06 | ✓ |
| 46444 | 2025-09-30 | R2,740.88 | R2,740.88 | R2,740.88 | ✓ |
| 46445 | 2025-09-30 | R3,105.00 | R57.50 | CYL R3,105 | ⚠ partial ERP |
| 46724 | 2025-09-09 | R3,432.06 | R3,432.06 | R3,432.06 | ✓ |
| 46760 | 2025-09-09 | R2,288.04 | R2,288.04 | R2,288.04 | ✓ |

---

## 3. ERP Items Not on Remittance

| Item | Amount | Notes |
| :--- | ---: | :--- |
| Ref **43319** | R2,577.63 | ERP slice on same payment doc — arrears catch-up, not listed on this remittance |
| Blank ref | R469.87 | Rounding / unallocated micro-slice on payment doc |
| Alloc/Recon rows | R65,782.46 | Clerk mirror decomposition — nets within doc; not bank/remittance facts |

---

## 4. Commercial Model Insight

MD0003 operates as a **STAT batch payer** who also supplies **COD remittance advices** with explicit invoice lines. For this account:

- **Remittance advice** = highest-confidence allocation evidence (when present)
- **Gross payment doc total** = bank cash fact
- **ERP ref_no / Alloc splits** = clerk decomposition — cross-check only

This payment does **not** map to a single calendar billing month (Sep invoices paid in Nov STAT 121). Monthly pattern analysis should treat it as a **verified multi-invoice STAT batch**, not a skipped month.

---

## 5. Artifacts

| File | Role |
| :--- | :--- |
| `raw/Remittances/01.11.2025.pdf` | Source remittance |
| `data/remittance_manifest_2025.json` | Structured parse |
| `config/payment_pattern_overrides.json` | Override RM-42051 registered |
