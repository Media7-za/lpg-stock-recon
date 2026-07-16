# BU0005 — Balance B/F Bridge (v1)

**Compiled:** 2026-07-16  
**Sources:** `raw/BU00052023.TXT` → `raw/BU0005.TXT`  
**Chain:** 2023 export close **R1,378.19** = CURRENT export B/F **R1,378.19** ✓

---

## 1. 2023 export summary (`BU00052023.TXT`)

| Metric | Value |
| :--- | ---: |
| Export label | 2023 FEBRUARY |
| Period in file | 2022-04-16 → 2022-11-15 |
| Opening B/F | **R1,380.00** |
| Closing balance | **R1,378.19** |
| Transaction rows | 9 |

> **Gap note:** No ERP activity between 2022-11-15 and 2026-01-14 in available exports. Account appears dormant ~3 years, or intermediate year TXTs not yet ingested.

---

## 2. Period activity (2022)

### Apr 2022 — net zero

| Doc | Type | Date | Amount | Notes |
| :--- | :--- | :--- | ---: | :--- |
| 00012969 | Invoice | 2022-04-16 | 1,980.00 | No DN ref |
| 00012979 | Invoice | 2022-04-16 | 1,725.00 | Paired |
| 00013353 | Payment | 2022-04-16 | −1,980.00 | CASH — clears 00012969 |
| 00003397 | Crd Note | 2022-04-19 | −1,725.00 | Reverses 00012979 |

**Net effect on balance:** R0.00

### Oct–Nov 2022 — D/N2406 (dual-line + partial cash)

| Doc | Type | Date | Amount | Notes |
| :--- | :--- | :--- | ---: | :--- |
| 00016195 | Invoice (LPG) | 2022-10-27 | 1,493.19 | D/N2406 |
| 00016209 | Invoice (EMPTY) | 2022-10-27 | 1,794.00 | D/N2406 EMPTIES |
| 00016579 | Payment | 2022-10-27 | −1,200.00 | CASH — same day |
| 00004234 | Crd Note | 2022-10-28 | −1,794.00 | EMPTY cleared |
| 00016837 | Payment | 2022-11-15 | −295.00 | CASH |

**LPG settlement:**

| Component | Amount |
| :--- | ---: |
| LPG invoice 00016195 | 1,493.19 |
| Cash payments (1200 + 295) | 1,495.00 |
| **Rounding slice** | **+1.81** |

---

## 3. B/F composition formula

```text
Closing (2023 export)  =  Opening B/F  −  D/N2406 rounding
     R1,378.19         =   R1,380.00  −      R1.81
```

| Component | Amount | Status |
| :--- | ---: | :--- |
| Legacy carry (pre-Apr 2022) | 1,380.00 | **Open** — no prior TXT to decompose further |
| D/N2406 LPG 00016195 | 1,493.19 | Settled (cash R1,495.00) |
| D/N2406 rounding | 1.81 | **DISCOUNT ALLOWED journal pending** |
| **Net at 2023 close** | **1,378.19** | Pure legacy minus unjournaled rounding |

---

## 4. Bridge into CURRENT (2026)

CURRENT opens at **R1,378.19** (matches 2023 close).

### STAT batch rounding cascade

Each STAT payment header = LPG invoice + rounding slice. Rounding reduces balance below B/F without clearing a document:

| STAT | Payment | Rounding | Balance after |
| :--- | ---: | ---: | ---: |
| B/F | | | 1,378.19 |
| 122 | −1,030.00 | −2.13 | 1,376.06 |
| 124 | −2,700.00 | −2.49 | 1,373.57 |
| 125 | −1,170.00 | −10.62 | **1,362.95** |

```text
R1,362.95  =  R1,378.19  −  (2.13 + 2.49 + 10.62)
             =  R1,378.19  −  R15.24
```

**The post-STAT125 residual R1,362.95 is entirely legacy B/F minus cumulative unjournaled rounding — not unexplained partial LPG.**

### Current outstanding (R3,450.17)

| Component | Amount |
| :--- | ---: |
| Legacy residual (post STAT 125) | 1,362.95 |
| Open LPG invoice 00050949 (DN#22609) | 2,087.22 |
| **Total** | **3,450.17** ✓ |

---

## 5. Finance tasks — historical rounding

| Task | Payment | Date | Rounding | Status |
| :--- | :--- | :--- | ---: | :--- |
| TASK-BU0005-000 | 00016579+00016837 | 2022-10-27 / 11-15 | 1.81 | OPEN |
| TASK-BU0005-001 | 00043092 | 2026-01-16 | 2.13 | OPEN |
| TASK-BU0005-002 | 00043648 | 2026-03-11 | 2.49 | OPEN |
| TASK-BU0005-003 | 00044065 | 2026-04-21 | 10.62 | OPEN |
| | | **Total rounding** | **17.05** | |

See `data/finance_posting_checklist.csv` (append TASK-BU0005-000).

---

## 6. Open items

1. **Legacy R1,380.00** — no TXT before 2022 in workspace; composition unknown (pre-Apr 2022 invoices/payments).
2. **2023–2025 gap** — confirm account dormant or supply intermediate exports.
3. **Apr 2022 invoices** — header-only (no DN ref); purpose unclear but nets to zero.
