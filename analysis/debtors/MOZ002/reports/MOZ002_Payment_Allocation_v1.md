# MOZ002 — Payment Allocation v1

**Period:** 2025-03-15 → 2026-07-13
**Skill:** `SKILL_Payment_To_Invoice_Allocation.md`
**Method:** LPG-only ref_no match + lag-window fallback + operator overrides
**Generated:** 2026-07-20

---

## 1. Executive Summary

| Metric | Count | Amount |
| :--- | ---: | ---: |
| Payment documents analysed | 40 | — |
| Tier 1 & 2 Confirmed | 54 | R163 404.63 |
| Tier 4 Probable (lag/proximity) | 0 | R0.00 |
| Tier 5 Review queue | 0 | R0.00 |
| Verified on-account (44227) | 1 | R4 978.91 |
| Excluded (41529 ERP CYL splits) | 1 | R7,935.01 gross |
| ERP TXT closing balance | — | R13 014.50 |

---

## 2. Confirmed Allocations (Tier 1 & 2)

| Payment Doc | Date | Amount | Target Invoice | Inv Date | Match Target (LPG) | Allocated | Variance | Type |
| :--- | :--- | ---: | :--- | :--- | ---: | ---: | ---: | :--- |
| 37590 | 2025-03-19 | R2 980.00 | 41534 | 2025-03-16 | R2 980.00 | R2 980.00 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38035 | 2025-04-02 | R2 953.12 | 41712 | 2025-03-24 | R2 953.12 | R2 953.12 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38227 | 2025-04-23 | R6 927.88 | 42306 | 2025-04-15 | R4 227.89 | R4 227.89 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38227 | 2025-04-23 | R6 927.88 | 41894 | 2025-03-31 | R2 699.99 | R2 699.99 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38366 | 2025-05-01 | R2 901.50 | 42434 | 2025-04-21 | R2 901.50 | R2 901.50 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38812 | 2025-05-14 | R2 652.80 | 43005 | 2025-05-12 | R2 652.80 | R2 652.80 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 38838 | 2025-05-21 | R2 901.50 | 42843 | 2025-05-05 | R2 901.50 | R2 901.50 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39077 | 2025-05-28 | R2 943.51 | 43245 | 2025-05-20 | R2 943.51 | R2 943.51 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39589 | 2025-06-25 | R11 363.37 | 43905 | 2025-06-11 | R2 617.29 | R2 617.29 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39589 | 2025-06-25 | R11 363.37 | 44062 | 2025-06-18 | R2 862.66 | R2 862.66 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39589 | 2025-06-25 | R11 363.37 | 43648 | 2025-06-04 | R2 943.51 | R2 943.51 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39589 | 2025-06-25 | R11 363.37 | 43081 | 2025-05-14 | R248.70 | R248.70 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39589 | 2025-06-25 | R11 363.37 | 43461 | 2025-05-28 | R2 691.21 | R2 691.21 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 39764 | 2025-07-02 | R2 617.29 | 44200 | 2025-06-23 | R2 617.29 | R2 617.29 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40139 | 2025-07-09 | R3 925.93 | 44403 | 2025-06-30 | R3 925.93 | R3 925.93 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40271 | 2025-07-23 | R2 810.61 | 44742 | 2025-07-09 | R2 810.61 | R2 810.61 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40729 | 2025-08-13 | R9 716.68 | 45488 | 2025-08-06 | R2 569.70 | R2 569.70 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40729 | 2025-08-13 | R9 716.68 | 45199 | 2025-07-27 | R2 810.61 | R2 810.61 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40729 | 2025-08-13 | R9 716.68 | 45577 | 2025-08-10 | R2 810.61 | R2 810.61 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40729 | 2025-08-13 | R9 716.68 | 45303 | 2025-07-31 | R1 525.76 | R1 525.76 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 40891 | 2025-08-27 | R1 491.68 | 45720 | 2025-08-17 | R1 491.68 | R1 491.68 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41106 | 2025-09-03 | R2 747.82 | 45872 | 2025-08-24 | R2 747.82 | R2 747.82 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41441 | 2025-09-24 | R2 652.80 | 42612 | 2025-04-28 | R2 652.80 | R2 652.80 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 46669 | 2025-09-25 | R2 626.74 | R2 626.74 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 46050 | 2025-08-31 | R3 768.44 | R3 768.44 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 46825 | 2025-09-30 | R2 401.59 | R2 401.59 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 44949 | 2025-07-17 | R2 810.61 | R2 810.61 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 46562 | 2025-09-21 | R2 626.74 | R2 626.74 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41654 | 2025-10-08 | R16 860.86 | 46267 | 2025-09-09 | R2 626.74 | R2 626.74 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41857 | 2025-10-15 | R2 626.74 | 46980 | 2025-10-08 | R2 626.74 | R2 626.74 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 41946 | 2025-10-22 | R3 827.53 | 47170 | 2025-10-17 | R3 827.53 | R3 827.53 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42137 | 2025-11-05 | R4 052.68 | 47401 | 2025-10-29 | R4 052.68 | R4 052.68 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42306 | 2025-11-19 | R3 751.04 | 47589 | 2025-11-09 | R3 751.04 | R3 751.04 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42422 | 2025-11-26 | R2 353.59 | 47857 | 2025-11-21 | R2 353.59 | R2 353.59 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42529 | 2025-12-03 | R3 751.04 | 47979 | 2025-11-27 | R3 751.04 | R3 751.04 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42601 | 2025-12-10 | R3 530.39 | 48095 | 2025-12-03 | R3 530.39 | R3 530.39 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42769 | 2025-12-23 | R3 770.39 | 48347 | 2025-12-17 | R3 770.39 | R3 770.39 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 42992 | 2026-01-14 | R3 770.39 | 48613 | 2026-01-04 | R3 770.39 | R3 770.39 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43074 | 2026-01-21 | R3 797.37 | 48797 | 2026-01-14 | R3 797.37 | R3 797.37 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43234 | 2026-02-04 | R3 797.37 | 48940 | 2026-01-25 | R3 797.37 | R3 797.36 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43471 | 2026-02-25 | R3 613.84 | 49328 | 2026-02-18 | R3 613.84 | R3 613.84 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43640 | 2026-03-11 | R3 839.70 | 49550 | 2026-03-03 | R3 839.70 | R3 839.70 | R0.00 | CONFIRMED_LAG_PROXIMITY |
| 43716 | 2026-03-18 | R3 870.28 | 49710 | 2026-03-11 | R3 870.28 | R3 870.28 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43878 | 2026-04-01 | R2 428.41 | 49933 | 2026-03-25 | R2 428.41 | R2 428.41 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 43962 | 2026-04-08 | R2 971.08 | 50066 | 2026-04-01 | R2 971.08 | R2 971.08 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 44028 | 2026-04-15 | R2 971.08 | 50173 | 2026-04-09 | R2 971.08 | R2 971.08 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 44147 | 2026-04-29 | R4 074.62 | 50305 | 2026-04-19 | R4 074.62 | R4 074.62 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 44554 | 2026-06-03 | R3 434.41 | 50918 | 2026-05-27 | R3 434.41 | R3 434.41 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 44659 | 2026-06-11 | R4 798.04 | 51077 | 2026-06-05 | R4 798.04 | R4 798.04 | R0.00 | CONFIRMED_OPERATOR_OVERRIDE |
| 44881 | 2026-06-24 | R6 098.05 | 51235 | 2026-06-14 | R4 798.04 | R4 798.04 | R0.00 | CONFIRMED_REF_LPG_MATCH |
| 44881 | 2026-06-24 | R6 098.05 | 51337 | 2026-06-19 | R1 300.01 | R1 300.01 | R0.00 | CONFIRMED_REF_LINE_MATCH |
| 44963 | 2026-07-02 | R3 292.77 | 51431 | 2026-06-24 | R3 292.77 | R3 292.77 | R0.00 | CONFIRMED_OPERATOR_OVERRIDE |
| 45104 | 2026-07-09 | R4 536.47 | 51526 |  | R4 536.47 | R4 536.47 | R0.00 | CONFIRMED_OPERATOR_OVERRIDE |

---

## 3. Credit Note Offsets Applied

### Partial empty returns (v10.2 qty-closed — residual R0.00)

| CN doc | Date | DN ref | CN amount | Residual open |
| :--- | :--- | :--- | ---: | ---: |
| 00012081 | 2025-03-17 | DN#4438-EMPTY | R2 415.00 | R0.00 |
| 00012174 | 2025-04-02 | DN#12836-EMPTY | R2 415.00 | R0.00 |
| 00012369 | 2025-04-29 | DN#13110-EMPTY | R2 415.00 | R0.00 |
| 00012468 | 2025-05-13 | DN#12076-EMPTY | R2 415.00 | R0.00 |
| 00012535 | 2025-05-22 | DN#12106-EMPTY | R2 415.00 | R0.00 |
| 00012639 | 2025-06-06 | DN#12149-EMPTY | R2 415.00 | R0.00 |
| 00012710 | 2025-06-12 | DN#12560-E,MPTY | R2 415.00 | R0.00 |
| 00012812 | 2025-06-25 | DN#12325-EMPTY | R2 415.00 | R0.00 |
| 00012872 | 2025-07-01 | DN#12349-EMPTY | R2 415.00 | R0.00 |
| 00013165 | 2025-08-08 | DN#20072-- EMPTY | R2 415.00 | R0.00 |
| 00013602 | 2025-10-03 | DN#21092-EPTY | R2 415.00 | R0.00 |
| 00013931 | 2025-11-22 | DN#20859-EMPTY | R2 415.00 | R0.00 |
| 00014007 | 2025-12-04 | DN20893 EMPTY | R2 415.00 | R0.00 |
| 00014666 | 2026-03-26 | DN-21985-EMPTY | R2 415.00 | R0.00 |
| 00014741 | 2026-04-10 | DN-22161-EMPTY | R2 415.00 | R0.00 |
| 00015166 | 2026-07-03 | DN#22538=EMPTY | R2 415.00 | R0.00 |

### Empty invoice CN clearances (operator confirmed)

| Invoice | CN | DN ref | Invoice amt | CN amt |
| :--- | :--- | :--- | ---: | ---: |
| 00051432 | 00015128 | DN#22662=EMPTY | R2 932.50 | R4 140.00 |
| 00051790 | 00015254 | DN#22810=EMPTY | R4 140.00 | R5 347.50 |

---

## 4. Probable / Review Required (Tier 4)

*No Tier 4 probable allocations pending review.*

---

## 5. Unallocated / On-Account Pool (Tier 5)

### Verified on-account credit (operator-ratified — not a review item)

| Payment Doc | Date | Amount | Status | Notes |
| :--- | :--- | ---: | :--- | :--- |
| 44227 | 2026-05-07 | R4 978.91 | VERIFIED_UNALLOCATED | On-account credit R4,978.91 — ERP-mirrored (STAT 125, blank ref). Operator-ratified VERIFIED_UNALLOCATED; not invoice-linked. Does NOT clear 50657. |

### Review queue

*No payments in Tier 5 review queue.*

### Excluded from allocation (doctrine)

| Payment Doc | Date | Gross splits | TXT net | Notes |
| :--- | :--- | ---: | ---: | :--- |
| 41529 | 2025-10-06 | R7,935.01 | R0.01 | ERP deposit splits — payments not allocated to CYL for MOZ002 |

---

## 6. Reconciliation Bridge

*Open LPG invoices are debit exposure; unallocated payment 44227 is credit already netted in TXT closing.*

| Component | Amount |
| :--- | ---: |
| Open LPG **49143** | R3 839.70 |
| Open LPG **50528** | R4 329.29 |
| Open LPG **50657** | R5 004.42 |
| Open LPG **51789** | R4 820.01 |
| **Open LPG subtotal** | **R17 993.42** |
| Less: verified on-account credit **44227** | R-4 978.91 |
| **Reconstructed closing** | **R13 014.51** |
| ERP stated balance (TXT) | R13 014.50 |
| **Bridge variance** | **R-0.01** (= **EX-0029** / payment **43234** cent) |
| CYL registry v10.2 outstanding | R0.00 (invariant PASS, provisional merge) |

*Lifetime confirmed LPG allocations: R163 404.63 (54 edges) — informational, not part of closing bridge.*

> Bridge reconciles: open LPG − verified on-account 44227 = TXT closing ± EX-0029 (43234) cent.

---

## 7. Artifacts

| File | Rows |
| :--- | ---: |
| `data/allocation_edges.csv` | 55 |
| `data/allocation_edges_2025.csv` | 37 |
| `data/allocation_edges_2026.csv` | 18 |
| `config/payment_pattern_overrides.json` | 37 |

*Generated by `scripts/allocation_ingest.mjs` per SKILL_Payment_To_Invoice_Allocation.md*