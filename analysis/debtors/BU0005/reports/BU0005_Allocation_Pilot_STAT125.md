# BU0005 — Pilot Allocation: STAT 125 / Payment 00044065

**Date:** 2026-07-13  
**Pilot scope:** Single payment batch (Turn 2)  
**Doctrine:** `docs/BU0005_Allocation_Doctrine_v1.md`

---

## Payment facts

| Field | Value |
| :--- | :--- |
| Payment doc | 00044065 |
| Date | 2026-04-21 |
| Batch | TRANSF \| STAT 125 |
| Header amount | **R1,170.00** |
| TXT `ref_no` | *(blank)* |
| Discount column | R0.00 — cash-only |

---

## Target invoice (proximity match)

| Field | Value |
| :--- | :--- |
| Invoice doc | 00050193 |
| DN ref | DN-22310 |
| Invoice date | 2026-04-10 |
| LPG header amount | **R1,159.38** |
| EMPTY pair | 00050194 R2,070.00 → CN 00014749 −R2,070.00 (cleared 2026-04-13) |
| Days payment after invoice | 11 |
| Days payment after EMPTY CN | 8 |

**Match hypothesis:** Payment clears LPG portion of DN-22310 delivery after EMPTY credit note posted.

---

## Variance analysis

| Measure | Amount |
| :--- | ---: |
| Payment received | 1,170.00 |
| LPG invoice target | 1,159.38 |
| **Variance** | **+10.62** |
| WO0001 rounding band | ≤ R1.00 |
| Tier | **Tier 5 — review required** |

### Comparison with sibling payments

| STAT | Payment | LPG target | Variance |
| :--- | ---: | ---: | ---: |
| 122 | 1,030.00 | 1,027.87 | +2.13 |
| 124 | 2,700.00 | 2,697.51 | +2.49 |
| **125** | **1,170.00** | **1,159.38** | **+10.62** |

All three batches show payment **exceeding** LPG-only target. Pattern is consistent but none qualify for Tier-1 auto-confirm under WO0001 doctrine (R0.05 threshold).

---

## Allocation verdict (pilot)

| Field | Ruling |
| :--- | :--- |
| Proposed target | Invoice 00050193 (LPG) |
| Allocated LPG amount | R1,159.38 |
| Residual on payment | R10.62 unallocated |
| Residual on invoice | R0.00 if R10.62 accepted as overpay; else R10.62 still owing on LPG |
| ERP running balance after payment | R1,362.95 — implies **partial settlement** model (payment did not fully clear all open balance) |
| `review_required` | **true** |
| Override needed | Yes — before promoting to confirmed edge |

---

## Recommended override (pending approval)

```json
{
  "payment_doc": "00044065",
  "payment_date": "2026-04-21",
  "target_doc": "00050193",
  "allocated_amount": 1159.38,
  "override_type": "PROBABLE_PROXIMITY_BLANK_REF",
  "approval_status": "pending",
  "reason": "STAT 125 payment R1,170 vs LPG inv 00050193 R1,159.38; blank ref_no; +R10.62 variance",
  "evidence_source": "raw/BU0005.TXT",
  "reconciled_month": "2026-04"
}
```

---

## Operator questions

1. Is R10.62 a deliberate rounding / fee, or should invoice 00050193 remain R10.62 open?
2. Can finance confirm STAT 125 deposit amount R1,170.00 on bank statement?
3. Should the R2.13 / R2.49 variances on STAT 122/124 follow the same rule?

---

## Turn 3 entry criteria

- [ ] Operator approves or adjusts pilot override
- [ ] Rule for payment-vs-LPG variance documented in doctrine v1.1
- [ ] Full allocation graph for all 3 STAT batches
