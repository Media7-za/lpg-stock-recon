# RED001 Delivery Event Ledger (v1)

**Account:** RED001 — REDLANDS HOTEL  
**Period:** May 2025 → Jul 2026  
**Sources:** `raw/RED001CURRENT.TXT` (manifest) + `vw_clean_transactions` (LPG/CYL line split)  
**Generated:** 2026-07-29  
**Purpose:** Operator ratification — one row per delivery note (DN), with gas invoice, cylinder invoice, and credit notes.

---

## Summary

| Metric | Count |
| :--- | ---: |
| Delivery notes (DN events) | **28** |
| LPG gas invoices | **29** |
| CYL deposit invoices | **25** |
| Paired events (gas + cyl) | **23** |
| Gas-only (refill — no cyl inv) | **4** |
| CYL-only orphan | **1** (DN 213454 — typo ref) |

### Pattern key

| Pattern | Meaning |
| :--- | :--- |
| **PAIRED** | Same-day LPG + CYL invoices on same DN |
| **GAS_ONLY** | LPG invoice only — refill on existing cylinders |
| **CYL_ONLY** | Deposit invoice without LPG on same DN |
| **PAIRED_CN_DISTORTED** | Paired but CN chain breaks deposit logic (DN 20157) |

---

## Event ledger (by delivery note)

### DN 13208 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 May 2025 | Crd Note | 12452 | CYL | DN#13208-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 09 May 2025 | Invoice | 42948 | LPG | DN#13208 | R5,399.99 | 4 | S01 SV ×4 |
| 09 May 2025 | Invoice | 42954 | CYL | DN#13208-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,399.99** | | Gas R5,399.99 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 12492 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jun 2025 | Invoice | 43614 | LPG | DN#12492 | R8,639.97 | 6 | S01 SV ×6 |
| 04 Jun 2025 | Invoice | 43615 | CYL | DN#12492-EMPTY | R7,245.00 | 6 | S.1 CYL ×6 |
| 06 Jun 2025 | Crd Note | 12638 | CYL | DN#12492-EMPTY | R-7,245.00 | 6 | S.1 CYL ×-6 |

| | **Net financial (DN)** | | | | **R8,639.97** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-7,245.00 |

### DN 12678 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jul 2025 | Crd Note | 12945 | CYL | DN#12678-EMPTY | R-3,622.50 | 3 | S.1 CYL ×-3 |
| 09 Jul 2025 | Invoice | 44674 | LPG | DN#12678 | R5,759.98 | 4 | S01 SV ×4 |
| 09 Jul 2025 | Invoice | 44675 | CYL | DN#12678-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R6,967.48** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-3,622.50 |

### DN 20157 — **PAIRED_CN_DISTORTED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Aug 2025 | Invoice | 45540 | LPG | DN#20157 | R8,639.97 | 6 | S.4 SV ×6 |
| 09 Aug 2025 | Invoice | 45541 | CYL | DN#20157 | R7,245.00 | 6 | S.1 CYL ×6 |
| 11 Aug 2025 | Crd Note | 13187 | CYL | DN#20157 | R-7,245.00 | 6 | S.1 CYL ×-6 |
| 15 Oct 2025 | Crd Note | 13687 | CYL | DN#20157 | R-8,452.50 | 7 | S.1 CYL ×-7 |

| | **Net financial (DN)** | | | | **R187.47** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-15,697.50 |

> **Ratification:** CN 13187 reverses same-day deposit (45541). CN 13687 (Oct) returns **7 cyl** (−R8,452.50) — only **1 cyl** valid; **6 cyl = posting error** (−R7,245). Scenario `CN13687-6CYL-NOV2025`: correct with **Invoice** +R7,245 · 30 Nov 2025 · `DN#20157-CORR`. See `docs/RED001_ERP_Agent_Note_CN13687.md`.

### DN 21176 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Nov 2025 | Crd Note | 13954 | LPG | DN#21176 | R-4,780.00 | -4 | S.4 SV ×-4 |
| 27 Nov 2025 | Crd Note | 13955 | CYL | DN#21176-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 27 Nov 2025 | Invoice | 47943 | LPG | DN#21176 | R4,780.00 | 4 | S.4 SV ×4 |
| 27 Nov 2025 | Invoice | 47944 | CYL | DN#21176-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R0.00** | | Gas R4,780.00 + Cyl R4,830.00 + CN R-9,610.00 |

### DN 20694 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Dec 2025 | Invoice | 48022 | LPG | DN#20694 | R4,780.00 | 4 | S.4 SV ×4 |
| 01 Dec 2025 | Invoice | 48023 | CYL | DN#20694-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |
| 02 Dec 2025 | Crd Note | 13987 | CYL | DN#20694-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |

| | **Net financial (DN)** | | | | **R4,780.00** | | Gas R4,780.00 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 21435 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Dec 2025 | Crd Note | 14140 | CYL | D/N 21435 - EMPTIES | R-7,245.00 | 6 | S.1 CYL ×-6 |
| 22 Dec 2025 | Invoice | 48430 | LPG | D/N 21435 | R8,639.97 | 6 | S.4 SV ×6 |
| 22 Dec 2025 | Invoice | 48431 | CYL | D/N 21435 - EMPTIES | R7,245.00 | 6 | S.1 CYL ×6 |

| | **Net financial (DN)** | | | | **R8,639.97** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-7,245.00 |

### DN 20962 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Dec 2025 | Crd Note | 14185 | CYL | DN#20962-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 30 Dec 2025 | Invoice | 48542 | LPG | DN#20962 | R5,759.98 | 4 | S.4 SV ×4 |
| 30 Dec 2025 | Invoice | 48543 | CYL | DN#20962-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 21632 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Jan 2026 | Crd Note | 14254 | CYL | DN#21632-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 13 Jan 2026 | Invoice | 48747 | LPG | DN#21632 | R5,759.98 | 4 | D01 DV ×4 |
| 13 Jan 2026 | Invoice | 48748 | CYL | DN#21632-EMPTY | R4,830.00 | 4 | D.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 21218 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Jan 2026 | Crd Note | 14341 | CYL | DN*21218-EMPTY | R-7,245.00 | 6 | S.1 CYL ×-6 |
| 28 Jan 2026 | Invoice | 48982 | LPG | DN*21218 | R8,639.97 | 6 | S01 SV ×6 |
| 28 Jan 2026 | Invoice | 48983 | CYL | DN*21218-EMPTY | R7,245.00 | 6 | S.1 CYL ×6 |

| | **Net financial (DN)** | | | | **R8,639.97** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-7,245.00 |

### DN 21243 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Feb 2026 | Crd Note | 14409 | CYL | DN#21243EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 10 Feb 2026 | Invoice | 49164 | LPG | DN#21243 | R5,759.98 | 4 | S01 SV ×4 |
| 10 Feb 2026 | Invoice | 49165 | CYL | DN#21243EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 21930 — **GAS_ONLY**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Feb 2026 | Invoice | 49409 | LPG | DN#21930 | R7,199.98 | 5 | S01 SV ×5 |

| | **Net financial (DN)** | | | | **R7,199.98** | | Gas R7,199.98 + Cyl R0.00 + CN R0.00 |

> **Ratification:** Gas-only refill — no `-EMPTY` deposit invoice expected.

### DN 21961 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Mar 2026 | Invoice | 49714 | LPG | DN#21961 | R5,759.98 | 4 | S.4 SV ×4 |
| 12 Mar 2026 | Invoice | 49715 | CYL | DN#21961-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |
| 13 Mar 2026 | Crd Note | 14585 | CYL | DN#21961-EMPTY | R-4,830.00 | 4 | D.1 CYL ×-1; S.1 CYL ×-3 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 21844 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Mar 2026 | Invoice | 49875 | LPG | DN-21844 | R8,639.97 | 6 | S01 SV ×6 |
| 24 Mar 2026 | Invoice | 49876 | CYL | DN-21844-EMPTY | R7,245.00 | 6 | S.1 CYL ×6 |
| 25 Mar 2026 | Crd Note | 14644 | CYL | DN-21844-EMPTY | R-7,245.00 | 6 | S.1 CYL ×-6 |

| | **Net financial (DN)** | | | | **R8,639.97** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-7,245.00 |

### DN 21857 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14704 | CYL | DN-21857-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 02 Apr 2026 | Invoice | 50064 | LPG | DN-21857 | R8,639.97 | 6 | S01 SV ×6 |
| 02 Apr 2026 | Invoice | 50065 | CYL | DN-21857-EMPTY | R7,245.00 | 6 | S.1 CYL ×6 |

| | **Net financial (DN)** | | | | **R11,054.97** | | Gas R8,639.97 + Cyl R7,245.00 + CN R-4,830.00 |

### DN 21345 — **GAS_ONLY**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Apr 2026 | Invoice | 50344 | LPG | DN-21345 | R5,759.98 | 4 | S01 SV ×4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R0.00 + CN R0.00 |

> **Ratification:** Gas-only refill — no `-EMPTY` deposit invoice expected.

### DN 213454 — **CYL_ORPHAN**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Apr 2026 | Invoice | 50346 | CYL | DN-213454-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |
| 23 Apr 2026 | Crd Note | 14798 | CYL | DN-213454-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |

| | **Net financial (DN)** | | | | **R0.00** | | Gas R0.00 + Cyl R4,830.00 + CN R-4,830.00 |

> **Ratification:** CYL invoice only; ref typo (`DN-213454`). CN 14798 reverses. No LPG delivery on this DN.

### DN 22349 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Apr 2026 | Crd Note | 14880 | CYL | DN-22349-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 28 Apr 2026 | Invoice | 50406 | LPG | DN-22349 | R5,759.98 | 4 | S.4 SV ×4 |
| 28 Apr 2026 | Invoice | 50407 | CYL | DN-22349-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 22374 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 May 2026 | Invoice | 50580 | LPG | DN#22374 | R5,759.98 | 4 | S01 SV ×4 |
| 07 May 2026 | Invoice | 50581 | CYL | DN#22374-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |
| 08 May 2026 | Crd Note | 15238 | CYL | DN#22374-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |

| | **Net financial (DN)** | | | | **R5,759.98** | | Gas R5,759.98 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 22741 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 May 2026 | Crd Note | 14926 | LPG | DN#22741 | R-6,143.99 | -4 | S.4 SV ×-4 |
| 20 May 2026 | Crd Note | 14927 | CYL | DN#22741-EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 20 May 2026 | Invoice | 50776 | LPG | DN#22741 | R6,143.99 | 4 | S.4 SV ×4 |
| 20 May 2026 | Invoice | 50777 | CYL | DN#22741-EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |
| 20 May 2026 | Invoice | 50780 | LPG | DN#22741 | R7,679.99 | 5 | S.4 SV ×5 |
| 20 May 2026 | Invoice | 50781 | CYL | DN#22741-EMPTY | R6,037.50 | 5 | S.1 CYL ×5 |
| 21 May 2026 | Crd Note | 14932 | CYL | DN#22741-EMPTY | R-6,037.50 | 5 | S.1 CYL ×-5 |

| | **Net financial (DN)** | | | | **R7,679.99** | | Gas R13,823.98 + Cyl R10,867.50 + CN R-17,011.49 |

> **Ratification:** Split delivery — 2 LPG + 2 CYL same day. Check qty match on 50780 (5 gas) vs 50777 (4 deposit).

### DN 22601 — **GAS_ONLY**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 May 2026 | Invoice | 50915 | LPG | DN#22601 | R6,143.99 | 4 | S.4 SV ×4 |

| | **Net financial (DN)** | | | | **R6,143.99** | | Gas R6,143.99 + Cyl R0.00 + CN R0.00 |

> **Ratification:** Gas-only refill — no `-EMPTY` deposit invoice expected.

### DN 22778 — **GAS_ONLY**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jun 2026 | Invoice | 51048 | LPG | DN#22778 | R5,885.01 | 4 | S.4 SV ×4 |

| | **Net financial (DN)** | | | | **R5,885.01** | | Gas R5,885.01 + Cyl R0.00 + CN R0.00 |

> **Ratification:** Gas-only refill — no `-EMPTY` deposit invoice expected.

### DN 22902 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Jun 2026 | Crd Note | 15069 | CYL | DN#22902-EMPTIES | R-6,037.50 | 5 | S.1 CYL ×-5 |
| 15 Jun 2026 | Invoice | 51221 | LPG | DN#22902 | R5,885.01 | 4 | D.4 DV ×4 |
| 15 Jun 2026 | Invoice | 51222 | CYL | DN#22902-EMPTIES | R4,830.00 | 4 | D.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R4,677.51** | | Gas R5,885.01 + Cyl R4,830.00 + CN R-6,037.50 |

### DN 22650 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Jun 2026 | Invoice | 51286 | LPG | DN#22650 | R5,885.01 | 4 | S.4 SV ×4 |
| 18 Jun 2026 | Invoice | 51287 | CYL | DN#22650-EMPTIES | R4,830.00 | 4 | S.1 CYL ×4 |
| 19 Jun 2026 | Crd Note | 15090 | CYL | DN#22650-EMPTIES | R-4,830.00 | 4 | S.1 CYL ×-4 |

| | **Net financial (DN)** | | | | **R5,885.01** | | Gas R5,885.01 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 22917 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Jun 2026 | Invoice | 51426 | LPG | DN#22917 | R7,356.26 | 5 | S.4 SV ×5 |
| 25 Jun 2026 | Invoice | 51427 | CYL | DN#22917_EMPTY | R6,037.50 | 5 | S.1 CYL ×5 |
| 26 Jun 2026 | Crd Note | 15125 | CYL | DN#22917_EMPTY | R-3,622.50 | 3 | S.1 CYL ×-3 |

| | **Net financial (DN)** | | | | **R9,771.26** | | Gas R7,356.26 + Cyl R6,037.50 + CN R-3,622.50 |

### DN 22541 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2026 | Crd Note | 15192 | CYL | DN#22541=EMPTY | R-4,830.00 | 4 | S.1 CYL ×-4 |
| 03 Jul 2026 | Invoice | 51557 | LPG | DN#22541 | R5,912.56 | 4 | S.4 SV ×4 |
| 03 Jul 2026 | Invoice | 51558 | CYL | DN#22541=EMPTY | R4,830.00 | 4 | S.1 CYL ×4 |

| | **Net financial (DN)** | | | | **R5,912.56** | | Gas R5,912.56 + Cyl R4,830.00 + CN R-4,830.00 |

### DN 22961 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Jul 2026 | Invoice | 51890 | LPG | DN#22961 | R7,390.70 | 5 | S.4 SV ×5 |
| 16 Jul 2026 | Invoice | 51891 | CYL | DN#22961- EMPTY | R6,037.50 | 5 | S.1 CYL ×5 |
| 17 Jul 2026 | Crd Note | 15274 | CYL | DN#22961- EMPTY | R-7,245.00 | 6 | S.1 CYL ×-6 |

| | **Net financial (DN)** | | | | **R6,183.20** | | Gas R7,390.70 + Cyl R6,037.50 + CN R-7,245.00 |

### DN 22974 — **PAIRED**

| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Jul 2026 | Invoice | 52042 | LPG | DN#22974 | R4,434.42 | 3 | S.4 SV ×3 |
| 24 Jul 2026 | Invoice | 52053 | CYL | DN#22974-EMPTY | R3,622.50 | 3 | S.1 CYL ×3 |
| 24 Jul 2026 | Invoice | 52086 | LPG | DN#22974 | R4,434.42 | 3 | S.4 SV ×3 |
| 25 Jul 2026 | Crd Note | 15325 | LPG | DN#22974 | R-4,434.42 | -3 | S.4 SV ×-3 |
| 25 Jul 2026 | Crd Note | 15327 | CYL | DN#22974-EMPTY | R-3,622.50 | 3 | S.1 CYL ×-3 |

| | **Net financial (DN)** | | | | **R4,434.42** | | Gas R8,868.84 + Cyl R3,622.50 + CN R-8,056.92 |

> **Ratification:** Duplicate LPG inv 52042 + 52086; CN 15325 reverses 52042. Net open LPG = 52086 (R4,434.42).

---

## Gas-only events (no CYL invoice)

| DN | Date | LPG doc | Amount | Operator sign-off |
| :--- | :--- | :--- | ---: | :--- |
| 21930 | 25 Feb 2026 | 49409 | R7,199.98 | ☐ Refill confirmed |
| 21345 | 22 Apr 2026 | 50344 | R5,759.98 | ☐ Refill confirmed |
| 22601 | 28 May 2026 | 50915 | R6,143.99 | ☐ Refill confirmed |
| 22778 | 05 Jun 2026 | 51048 | R5,885.01 | ☐ Refill confirmed |

---

## Ratification scenario — CN 13687 (active)

**Scenario ID:** `CN13687-6CYL-NOV2025` · **Config:** `config/ratification_scenarios.json`

| | Posted (actual) | Valid | Error (6 cyl) |
|---|---------------|------:|--------------:|
| CN 13687 | −R8,452.50 (7 cyl) | −R1,207.50 (1 cyl) | −R7,245.00 |
| **Correction (ERP)** | — | Keep as 1-cyl CN | **Invoice +R7,245** · 30 Nov 2025 · `DN#20157-CORR` · 6× S.1 |

> v5 synthetic row **RAT13687** applied until ERP posts live. Corrected combined close: **R12,804.76**.

---

## Operator ratification checklist

| # | Item | Status |
| :---: | :--- | :---: |
| 1 | All **PAIRED** events have same-day gas + deposit | ☐ |
| 2 | All **GAS_ONLY** events are refills (no new cylinders) | ☐ |
| 3 | DN **20157** / CN **13687** — scenario `CN13687-6CYL-NOV2025` (Invoice +R7,245 Nov 2025) | ☐ |
| 4 | DN **22974** duplicate inv **52086** resolved in ERP | ☐ |
| 5 | DN **213454** orphan **50346** accepted as typo/reversal | ☐ |
| 6 | DN **22741** qty mismatch reviewed | ☐ |

---

*Internal workspace artifact — `analysis/debtors/RED001/reports/RED001_Delivery_Event_Ledger_v1.md`*
