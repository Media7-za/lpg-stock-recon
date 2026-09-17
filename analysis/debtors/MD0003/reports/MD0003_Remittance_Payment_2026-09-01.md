# MD0003 — Remittance Cross-Check: Batch RM-2026-09-01 (ERP payment not yet posted)

**Source:** COD Remittance Advice dated **01/09/2026**
**File:** `raw/Remittances/01.09.2026.pdf`
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003)
**Payee:** GAZ EXPRESS
**Bank reference:** `000000000020726413`
**Generated:** 2026-09-17

---

## 1. Summary

| Field | Remittance | ERP |
| :--- | ---: | ---: |
| Payment date (advice) | 2026-09-01 | — not yet posted |
| STAT batch | — | unknown (STAT:130 expected, unconfirmed) |
| **Customer-stated total** | **R30,053.70** | no matching `Payment` row |
| Status on advice | Posted | **Absent** from `DEBENQ_CURRENT.TXT` (raw pull ends 09/08/2026, running balance R18,853.36) |

**Verdict:** All 7 line items are **cent-exact** against `DEBENQ_CURRENT.TXT` invoice gross amounts. This confirms the remittance correctly enumerates real, open MD0003 invoices — but **no ERP `Payment` entry exists yet to anchor it**. Per the ground-truth hierarchy, the raw ERP export is the actual source of truth and it has not been re-pulled since this payment's advice date. This batch is **ASSERTED** (customer advice only), not **PROVEN**, until the next ERP TXT pull shows it posted.

---

## 2. Line-by-Line Match (vs `DEBENQ_CURRENT.TXT`)

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

All 7 docs carry `"False"` in the deposit-flag column (i.e. LPG gas lines, not `-EMPTY` cylinder-deposit pairs) — consistent with this account's usual COD advice shape.

---

## 3. Gap vs prior posted batches

The last confirmed ERP payment on this account is doc **45595** / **STAT:129**, posted **2026-08-03** for **R14,863.43** (see `MD0003_Remittance_Payment_45595.md`), which settled June docs 50996/50998/51099/51398. The July docs invoiced 29/06–31/07/2026 (the 7 lines above) remained open in the last raw pull. This remittance is the natural next batch in the sequence but the raw ERP TXT export in this repo (`raw/Enquiry/DEBENQ_CURRENT.TXT`, `raw/MD0003CURRENT.TXT`) has not been refreshed past **09/08/2026**, so it cannot yet show a payment dated 01/09/2026.

---

## 4. Tripwire

This ruling reopens — and the manifest/`erpPaymentDoc`/`erpBatchRef`/`status` fields must be re-anchored — the moment a fresh ERP TXT pull is ingested that shows:

- A `Payment` row on/after 2026-09-01 whose amount is `-30053.70` (or a set of split lines summing to it), **or**
- Any of docs 51470, 51655, 51839, 51923, 52102, 52219, 52242 individually tagged as paid/closed.

Until then, do **not** treat this R30,053.70 as part of the account's collectable-balance bridge (§2 Collectable Rule) — it is a real cash event per the customer, but unposted ERP cash is not yet a ratified hold or a balance reduction.

---

## 5. Registry

Registered in `analysis/debtors/MD0003/data/remittance_manifest_2026.json` as batch **RM-2026-09-01**, `status: "AWAITING_ERP_POST"`. No entry added to `payment_pattern_overrides.json` — that registry locks in *verified* patterns, and this one isn't ERP-anchored yet.
