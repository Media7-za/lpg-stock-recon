# BU0005 — CHOBOZA - BULWER
## Account Baseline Report (v1)

**Compiled:** 2026-07-13  
**Account:** BU0005  
**Period:** Balance B/F → 1 June 2026 (CURRENT export)  
**Source:** `raw/BU0005.TXT`

---

## Account overview

| Field | Detail |
| :--- | :--- |
| **Customer** | CHOBOZA - BULWER |
| **ERP account** | BU0005 |
| **Terms** | COD |
| **Lane** | Allocation (invoice-linked, WO0001 family) |
| **Payment pattern** | EFT `TRANSF \| STAT 12x` — 3 batches in window |
| **Delivery pattern** | Dual-line DN (LPG + EMPTY); EMPTY cleared by CN |

---

## 1. ERP TXT summary

| Metric | Value |
| :--- | ---: |
| Export label | CURRENT |
| Transaction rows | 19 (excl. B/F) |
| Period covered | 2026-01-14 → 2026-06-01 |
| Opening balance B/F | R1,378.19 |
| ERP stated balance | **R3,450.17** |
| Reconstructed closing | **R3,450.17** |
| ERP vs reconstructed | **R0.00** ✓ |
| Last invoice date | 2026-05-29 |
| Last payment date | 2026-04-21 |

### Entry breakdown

| Entry type | Count |
| :--- | ---: |
| Invoice | 9 |
| Crd Note | 7 |
| Payment | 3 |

---

## 2. Payment batches (STAT)

| Payment doc | Date | STAT | Amount | Nearest LPG invoice | LPG amount | Variance |
| :--- | :--- | :--- | ---: | :--- | ---: | ---: |
| 00043092 | 2026-01-16 | STAT 122 | R1,030.00 | 00048766 | R1,027.87 | **+R2.13** |
| 00043648 | 2026-03-11 | STAT 124 | R2,700.00 | 00049566 | R2,697.51 | **+R2.49** |
| 00044065 | 2026-04-21 | STAT 125 | R1,170.00 | 00050193 | R1,159.38 | **+R10.62** |

All three payments carry **blank `ref_no`** in TXT (no explicit invoice link). Proximity + amount matching suggests each payment targets the preceding open LPG invoice in the same DN delivery window.

**Batch count estimate:** 3 STAT batches in CURRENT window (122, 124, 125). No remittance PDFs required.

---

## 3. Dual-line DN register

| DN ref | LPG doc | LPG amt | EMPTY doc | EMPTY amt | CN doc | Net EMPTY |
| :--- | :--- | ---: | :--- | ---: | :--- | ---: |
| DN#20985 | 00048766 | 1,027.87 | 00048767 | 2,070.00 | 00014278 | 0 |
| DN#22108 | 00049566 | 2,697.51 | 00049567 | 4,140.00 | 00014550 | 0 |
| DN-22310 | 00050193 | 1,159.38 | 00050194 | 2,070.00 | 00014749 | 0 |
| DN#22444 | 00050906 | 2,087.22 | 00050907 | 690.00 | 00014992/93 | 0 |
| DN#22609 | 00050949 | 2,087.22 | 00050950 | 2,070.00 | 00014999 | 0 |

**Exception:** DN#22444 LPG invoice `00050906` fully reversed by CN `00014992` (same DN ref on LPG line — not just EMPTY). Re-issued as `00050949` under DN#22609 two days later.

---

## 4. Closing balance bridge

| Component | Amount | Notes |
| :--- | ---: | :--- |
| Opening B/F | 1,378.19 | Pre-Jan 2026 carry |
| + LPG invoices (net of CNs) | 9,316.71 | Sum of 5 net LPG revenue events |
| − Payments | −6,900.00 | 3 × STAT batches |
| **ERP closing** | **3,450.17** | ✓ |

### Open items at export date

| Doc | DN | Amount | Status |
| :--- | :--- | ---: | :--- |
| — | (residual) | **1,362.95** | Under-allocation from 3 partial LPG settlements + B/F composition |
| 00050949 | DN#22609 | **2,087.22** | Unpaid LPG invoice |
| **Total outstanding** | | **3,450.17** | Matches global aged debt |

The R1,362.95 residual equals opening B/F (R1,378.19) minus net payment overages (R2.13 + R2.49 + R10.62 = R15.24) only if prior-period open items were partially cleared — **full B/F decomposition requires pre-2026 TXT or operator confirmation**.

---

## 5. Exception register (Turn 2)

| ID | Type | Detail | Tier |
| :--- | :--- | :--- | :--- |
| EXC-001 | BLANK_REF | All 3 payments lack invoice `ref_no` | Tier 5 |
| EXC-002 | LPG_CN_FULL | CN 00014992 reverses full LPG inv 00050906 | Review |
| EXC-003 | PAY_VARIANCE | STAT payments exceed LPG by R2.13 / R2.49 / R10.62 | Tier 5 |
| EXC-004 | B_F_UNKNOWN | R1,378.19 opening — no prior TXT | Blocker |

---

## 6. Next steps

1. Turn 3 — build full `allocation_edges.csv` with proximity/lag rules
2. Operator confirm: payment variances intentional or rounding?
3. Optional: pre-2026 TXT for B/F decomposition
4. Do **not** recommend collection until `reconState: complete`
