# MD0003 — ERP CURRENT.TXT Analysis

**Source:** `raw/MD0003CURRENT.TXT`  
**Account:** MD0003 — BLUFF MEAT SUPPLY(PTY) LTD  
**Parsed to:** `data/erp_current_ledger.csv` (232 lines)  
**Authority tier:** ERP statement export (Tier 3 — ground truth for balances and payment docs)

---

## 1. Header Summary

| Field | Value |
| :--- | ---: |
| **Current balance** | **R16,371.56** |
| Sort order | Document date |
| Year filter | CURRENT |
| Allocation detail | Excluded |
| Transaction lines | 232 (21 payments, 81 LPG invoices, 11 LPG credits) |

> Portfolio dashboard previously showed R12,005.45 — that figure matches the running balance **immediately after** payment **44972** (line 227, R7,639.34) before Jul-2026 invoices **51655–51840** were posted. The header **R16,371.56** is the authoritative closing position.

---

## 2. STAT Batch Payment Register (2025–2026)

| STAT | Payment Date | Doc(s) | Gross Cash | Notes |
| :---: | :---: | :--- | ---: | :--- |
| 112 | 2025-02-03 | 37143, 37144 | R19,737.03 | Pre-2025 arrears catch-up |
| 113 | 2025-03-03 | 37262, 37263 | R21,718.57 | **2025-01** billing month — override v5 |
| 114 | 2025-04-07 | 37817 | R15,633.20 | **2025-02** — matched |
| 115 | 2025-05-02 | 38372 | R4,689.96 | **2025-03** — matched |
| 116 | 2025-06-02 | 39145 | R24,122.60 | **2025-04** — matched |
| 117 | 2025-07-01 | 39816 | R10,252.91 | **2025-05** partial — R2,577.63 residual |
| 118 | 2025-08-01 | 40430 | R3,755.57 | **2025-06** slice — override v5 |
| 119 | 2025-09-01 | 41044 | R9,895.88 | **2025-07** slice — override v5 |
| 120 | 2025-10-01 | 41501 | R6,232.93 | **2025-08** partial — R8,510.32 residual |
| 121 | 2025-11-01 | 42051 | R35,770.31 | **2025-09** — remittance confirmed |
| 121 | 2025-11-28 | 42440 | R47,511.17 | Catch-up batch — Oct/Nov/Aug gap candidate |
| 122 | 2025-12-31 | 42858 | R9,730.26 | Dec pool / timing boundary |
| 123 | 2026-02-02 | 43239 | R17,999.24 | **2025-12** — remittance confirmed |
| 124 | 2026-03-02 | 43494 | R13,845.67 | **2026-01** — remittance confirmed |
| 125 | 2026-04-01 | 43854 | R13,773.92 | **2026-02** — remittance confirmed |
| 126 | 2026-05-04 | 44231 | R15,017.78 | **2026-03** — remittance confirmed |
| 127 | 2026-06-01 | 44561 | R13,014.20 | **2026-04** — remittance confirmed |
| 128 | 2026-07-01 | **44972** | **R17,311.60** | **2026-05** — remittance + TXT confirmed |

---

## 3. 2025 Open Gaps vs TXT Cash

| Billing Month | LPG Billed | TXT Payment(s) | Cash Applied | Residual | Status |
| :--- | ---: | :--- | ---: | ---: | :--- |
| 2025-01 | R21,718.57 | 37262+37263 | R21,718.57 | R0.00 | ✅ Override v5 |
| 2025-02 | R15,633.20 | 37817 | R15,633.20 | R0.00 | ✅ Matched |
| 2025-03 | R4,689.96 | 38372 | R4,689.96 | R0.00 | ✅ Matched |
| 2025-04 | R24,122.60 | 39145 | R24,122.60 | R0.00 | ✅ Matched |
| 2025-05 | R12,830.54 | 39816 | R10,252.91 | **R2,577.63** | Partial — doc 43387 amount |
| 2025-06 | R15,884.95 | 40430 | R3,755.57 | — | Override v5 (invoice-cluster match) |
| 2025-07 | R19,720.38 | 41044 | R9,895.88 | — | Override v5 (invoice-cluster match) |
| 2025-08 | R14,743.25 | 41501 | R6,232.93 | **R8,510.32** | Partial |
| 2025-09 | R20,288.54 | 42051 | R35,770.31 | R0.00 | ✅ Remittance |
| 2025-10 | R16,016.28 | 42440 (share) | TBC | TBC | Needs remittance / batch split |
| 2025-11 | R14,560.26 | 42440 (share) | TBC | TBC | Needs remittance / batch split |
| 2025-12 | R17,999.24 | 43239 | R17,999.24 | R0.00 | ✅ Remittance |

**42440 investigation:** Gross R47,511.17 on 2025-11-28. If allocated to Aug remainder (R8,510.32) + Oct (R16,016.28) + Nov (R14,560.26) = R39,086.86, surplus **R8,424.31** remains — likely CYL or cross-month float. **COD remittance for Nov-28 batch not on file.**

---

## 4. 2026 Position (from TXT)

| Billing Month | LPG Billed | Payment | Amount | Status |
| :--- | ---: | :--- | ---: | :--- |
| 2026-01 | R13,903.17 | 43494 | R13,845.67 | R57.50 residual (CYL) |
| 2026-02 | R13,773.92 | 43854 | R13,773.92 | ✅ |
| 2026-03 | R15,017.78 | 44231 | R15,017.78 | ✅ |
| 2026-04 | R13,014.20 | 44561 | R13,014.20 | ✅ |
| 2026-05 | R12,771.88 | **44972** | R17,311.60 | Remittance 01.07.2026 — **R4,539.72 overpay** (Rule 13) |
| 2026-06 | R19,552.96 | — | — | **Open** — no STAT:129 yet |

---

## 5. Balance Walk (Closing)

```
After payment 44972 (2026-07-01):     R  7,639.34
+ Jul-2026 invoices (51655–51840):    R  8,732.22
= Current balance (header):           R 16,371.56  ✅
```

---

## 6. Source Hierarchy

| Priority | Source | This file |
| :---: | :--- | :--- |
| 1 | COD remittance advice | — |
| 2 | Gross payment doc (bank) | Confirms doc numbers and STAT refs |
| 3 | Customer A/P ledger | Cross-check |
| **4** | **ERP CURRENT.TXT** | **Authoritative balance and chronology** |
| 5 | Monthly LPG billing (DB) | SKU split |

---

## 7. Next Actions

1. Source **COD remittance for payment 42440** (2025-11-28, R47,511.17) to close Oct/Nov/Aug gaps.
2. Register **2026-05 override** for payment **44972** (remittance + TXT posted).
3. Optional: scaffold `config/statement_v4.json` for full CYL v4 layout rebuild.
