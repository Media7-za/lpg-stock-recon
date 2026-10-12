# MON001 — Commercial Model (Turn 1 preliminary)

**Status:** **Locked from TXT** (`MON001CURRENT.TXT`)  
**Date:** 2026-07-28

---

## Lane

| Field | Value |
| :--- | :--- |
| **Lane** | `position_recon` + v5 sub-ledger (Part 1A LPG / Part 1B CYL) |
| **Not** | Allocation lane (WO0001 / MOZ002 style) |
| **Not** | Settlement discount lane (TWK002) |

---

## Commercial signals (DETRANS fragment)

| Signal | Observation |
| :--- | :--- |
| Settlement discount | **NONE** — no discount journals or settlement refs |
| Payment unit | Invoice-level ERP settlement via STAT transfer batches |
| STAT batches observed | 112, 113, 114, 116, 117, 118, 120, 123, 125 |
| EMPTY pattern | Standard `-EMPTY` deposit invoices + same-day CNs |
| CYL strip | Deposit pairs net zero in combined view; visible in Part 1B |
| `paymentLane` | **LPG** (default) — payments post to Part 1A only |
| Terms | **COD** (global aged-debt) |

---

## Operator confirmation (from TXT — complete)

- [x] `ACCOUNT:` header — **SHORTEN INTERNATIONAL 66 ON MONZALI**
- [x] `CURRENT BALANCE:` **R2,717.79**
- [x] `BALANCE B/F:` **R162.86** → `combinedBf` updated; `cylOpeningFinancial` R0.00
- [x] Payment pattern — STAT 104, 112–128 batches
- [x] Settlement discount — **NONE**
- [x] Lane — **`position_recon`** (not allocation)
