# MD0003 — Remittance Cross-Check: Payment 46021 (STAT 130) — CONFIRMED

**Source:** COD Remittance Advice dated **01/09/2026**
**File:** `raw/Remittances/01.09.2026.pdf`
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003)
**Payee:** GAZ EXPRESS
**Bank reference:** `000000000020726413`
**Generated:** 2026-09-17 (supersedes `MD0003_Remittance_Payment_2026-09-01.md`, the pre-ERP-post analysis)

---

## 1. Summary

| Field | Remittance | ERP Payment 46021 |
| :--- | ---: | ---: |
| Payment date | 2026-09-01 (advice) | 2026-09-01 |
| STAT batch | — | STAT:130 |
| **Customer-stated total** | **R30,053.70** | **R30,053.70** ✓ |
| Status on advice | Posted | Present in `DEBENQ_CURRENT.TXT` (refreshed 2026-09-17 pull) |

**Verdict:** Remittance **confirms customer cash** R30,053.70 on doc **46021**. All 7 listed LPG invoices are **cent-exact** vs ERP gross. This batch was previously registered `AWAITING_ERP_POST` (ASSERTED); it is now **PROVEN** — closed under identity to the ERP raw export per DEBTORS_DOCTRINE.md §6.

---

## 2. Line-by-Line Match

| Doc | Inv Date | Remittance | ERP gross | Match |
| :--- | :--- | ---: | ---: | :---: |
| 51470 | 2026-06-29 | R5,039.52 | R5,039.52 | ✓ |
| 51655 | 2026-07-07 | R4,366.11 | R4,366.11 | ✓ |
| 51839 | 2026-07-15 | R4,366.11 | R4,366.11 | ✓ |
| 51923 | 2026-07-20 | R2,910.74 | R2,910.74 | ✓ |
| 52102 | 2026-07-27 | R4,366.11 | R4,366.11 | ✓ |
| 52219 | 2026-07-31 | R4,366.11 | R4,366.11 | ✓ |
| 52242 | 2026-07-31 | R4,639.00 | R4,639.00 | ✓ |
| **Total** | | **R30,053.70** | **R30,053.70** | ✓ |

ERP posted this payment as a single lump line (`INVNO` blank on doc 46021 in the raw TXT) — same shape as STAT:126 and STAT:128. The per-invoice attribution above rests entirely on the remittance advice, not on ERP tagging, per business_rules.md §15 Order A step 1.

---

## 3. Registry

Registered in `analysis/debtors/MD0003/data/remittance_manifest_2026.json` batch **RM-2026-09-01** (`status: "Posted"`, `erpPaymentDoc: "46021"`, `erpBatchRef: "STAT:130"`, `erpPaymentDate: "2026-09-01"`) and in `analysis/debtors/MD0003/config/statement_of_account.json` `closedInvoiceOverrides` (7 entries) so the statement generator's invoice-tag coverage gate treats these 7 docs as settled.
