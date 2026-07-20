# WO0001 — Payment-to-Invoice Allocation Report (v1)
**Period:** 2026-01-01 → 2026-06-03  
**Account:** L3 Cash and Carry (WO0001)  
**Doctrine:** LPG-only · Tier 1 tolerance R0.05 · Confirmed without remittance when ref+LPG align

---

## Section 1 — Executive Summary

| Metric | Value |
| :--- | ---: |
| Payment segments (excl Alloc/Recon) | 23 · R168 562,92 |
| **Tier 1 Confirmed** | 11 · R109 422,43 |
| Rounding residuals (≤R1, blank ref) | 6 · R1,49 |
| **Tier 4 Probable** | 0 · R0,00 |
| **Tier 5 Review / mismatch** | 6 · R59 139,00 |
| Split STAT batches | 2 |
| Alloc/Recon leaky groups | 0 |
| ERP stated balance | R110 789,36 |

---

## Section 2 — Confirmed Allocations (Tier 1 & 2)

| Payment Doc | Date | STAT | Ref | Paid | Invoice | LPG Target | Δ | Type |
| :--- | :--- | :--- | :--- | ---: | :--- | ---: | ---: | :--- |
| 42852 | 2026-01-01 | STAT 122 | 48511 | R3 894,59 | 48511 | R3 894,59 | R0.00 | EXPLICIT_REF |
| 42923 | 2026-01-09 | STAT 122 | 48582 | R9 260,40 | 48582 | R9 260,42 | R-0.02 | EXPLICIT_REF |
| 43139 | 2026-01-26 | STAT 122 | 48770 | R11 380,79 | 48770 | R11 380,79 | R0.00 | EXPLICIT_REF |
| 43563 | 2026-03-05 | STAT 124 | 49468 | R5 654,90 | 49468 | R5 654,90 | R0.00 | EXPLICIT_REF |
| 43563 | 2026-03-05 | STAT 124 | 49138 | R9 410,08 | 49138 | R9 410,08 | R0.00 | SPLIT |
| 44002 | 2026-04-13 | STAT 125 | 50120 | R10 773,35 | 50120 | R10 773,35 | R0.00 | EXPLICIT_REF |
| 44096 | 2026-04-24 | STAT 125 | 50232 | R11 354,95 | 50232 | R11 354,95 | R0.00 | EXPLICIT_REF |
| 44295 | 2026-05-15 | STAT 126 | 50506 | R9 129,48 | 50506 | R9 129,48 | R0.00 | EXPLICIT_REF |
| 44295 | 2026-05-15 | STAT 126 | 50470 | R11 127,37 | 50470 | R11 127,37 | R0.00 | SPLIT |
| 44459 | 2026-05-29 | STAT 126 | 50760 | R13 603,52 | 50760 | R13 603,52 | R0.00 | EXPLICIT_REF |
| 44553 | 2026-06-02 | STAT 127 | 51006 | R13 833,00 | 51006 | R13 833,03 | R-0.03 | EXPLICIT_REF |

---

## Section 3 — Credit Note LPG Offsets

- CN **14595** (2026-03-15) → ref Inv **49682** · LPG R13 895,01
- CN **14608** (2026-03-16) → ref Inv **49778** · LPG R6 664,56
- CN **14670** (2026-03-26) → ref Inv **49968** · LPG R8 759,77
- CN **14829** (2026-04-28) → ref Inv **50459** · LPG R11 835,47
- CN **14829** (2026-04-29) → ref Inv **50459** · LPG R11 835,47
- CN **15010** (2026-06-01) → ref Inv **50937** · LPG R14 167,87
- CN **15011** (2026-06-01) → ref Inv **50988** · LPG R13 128,29

---

## Section 4 — Probable (Tier 4)

_None_

---

## Section 5 — Review Required (Tier 5)

| Payment Doc | Date | STAT | Amount | Notes |
| :--- | :--- | :--- | ---: | :--- |
| 43139 | 2026-01-26 | STAT 122 | R5 500,00 | No LPG target for ref_no |
| 43237 | 2026-02-06 | STAT 123 | R9 510,00 | LPG ΔR-0.36 on ref 49021 (LPG R9 510,36) |
| 43323 | 2026-02-11 | STAT 123 | R9 410,00 | LPG ΔR-0.08 on ref 49138 (LPG R9 410,08) |
| 43398 | 2026-02-19 | STAT 123 | R8 195,00 | LPG ΔR-0.12 on ref 49213 (LPG R8 195,12) |
| 43757 | 2026-03-23 | STAT 124 | R16 628,00 | Blank ref — no LPG proximity match |
| 43881 | 2026-04-03 | STAT 125 | R9 896,00 | LPG ΔR-0.53 on ref 49973 (LPG R9 896,53) |

---

## Section 6 — Bridge

| Component | Amount |
| :--- | ---: |
| Period payments | R168 562,92 |
| Tier 1 confirmed | R109 422,43 |
| Rounding | R1,49 |
| Tier 4 | R0,00 |
| Tier 5 | R59 139,00 |
| **Pool check** | R168 562,92 |

---

*Generated 2026-06-23 · 23 edges in allocation_edges.csv*
