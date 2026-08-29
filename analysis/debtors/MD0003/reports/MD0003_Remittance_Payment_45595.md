# MD0003 — Remittance Cross-Check: Payment 45595 (STAT 129)

**Source:** COD Remittance Advice dated **01/08/2026**  
**File:** `raw/Remittance/01.08.2026.pdf`  
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003)  
**Payee:** GAZ EXPRESS  
**Bank reference:** `000000000090726105`  
**Generated:** 2026-08-11

---

## 1. Summary

| Field | Remittance | ERP Payment 45595 |
| :--- | ---: | ---: |
| Payment date | 2026-08-01 (advice) / 2026-08-03 (ERP post) | 2026-08-03 |
| STAT batch | — | STAT:129 |
| **Customer-stated total** | **R14,863.43** | **R14,863.43** ✓ |
| Status on advice | Posted | Present in `DEBENQ_CURRENT.TXT` |

**Verdict:** Remittance **confirms customer cash** R14,863.43 on doc **45595**. All four listed LPG invoices are **cent-exact** vs ERP gross. **July invoices (e.g. 51839) are not part-paid by this batch** — MD0003 settles whole remittance lines only.

---

## 2. Line-by-Line Match

| Doc | Inv Date | Remittance | ERP gross | Match |
| :--- | :--- | ---: | ---: | :---: |
| 50996 | 2026-06-08 | R5,822.54 | R5,822.54 | ✓ |
| 50998 | 2026-06-08 | R349.99 | R349.99 | ✓ |
| 51099 | 2026-06-09 | R4,345.45 | R4,345.45 | ✓ |
| 51398 | 2026-06-24 | R4,345.45 | R4,345.45 | ✓ |
| **Total** | | **R14,863.43** | **R14,863.43** | ✓ |

---

## 3. Not on Remittance (June residual)

| Doc | DN | LPG amount | Notes |
| :--- | :--- | ---: | :--- |
| **51470** | DN#22920=ROSEDALE | R5,039.52 | June delivery — **not** on COD advice; drives **R4,689.53** Pattern 2 variance vs full Jun-2026 billing month |

Other June `-EMPTY` deposit pairs net to R0.00 on the financial ledger.

---

## 4. Override registry

Registered in `config/payment_pattern_overrides.json` as **2026-06** / doc **45595**, `PATTERN_2_CANDIDATE_UNDERPAYMENT`, variance **R4,689.53**.
