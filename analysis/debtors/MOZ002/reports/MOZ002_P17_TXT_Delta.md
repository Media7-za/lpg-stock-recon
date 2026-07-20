# MOZ002 — Period 17 TXT delta (MOZ002P17.TXT)

**Received:** 2026-07-20  
**Source:** `raw/MOZ002P17.TXT` (period slice, sort by document date)  
**Prior snapshot:** `raw/MOZ002CURRENT.TXT` (full ledger, cut off 2026-07-13)

---

## Summary

| Metric | MOZ002CURRENT | MOZ002P17 | Δ |
| :--- | ---: | ---: | ---: |
| ERP closing | R13,014.50 | **R8,010.08** | **−R5,004.42** |
| Last payment date | 2026-07-09 (45104) | **2026-07-16** | +7 days |
| Open LPG pool | R17,993.42 | **R12,989.00** | −R5,004.42 |

**One new transaction** — everything else in P17 reconciles to the Jul-2026 tail already present in CURRENT.

---

## New transaction

| Field | Value |
| :--- | :--- |
| Doc | **45202** |
| Entry | Payment |
| Date | **2026-07-16** |
| Ref | TRANSF \| STAT 128 (blank invoice ref) |
| Amount | **−R5,004.42** |
| Running balance | R8,010.08 |

**Allocation read:** cent-exact match to LPG invoice **50657** (2026-05-13, DN#22385, R5,004.42) — previously operator-confirmed outstanding (EX-0035). 64-day lag → `CONFIRMED_EXPANDED_PROXIMITY` once DB syncs.

Registered as **EX-0038** (`CONFIRMED_PAYMENT_ALLOCATION` 45202→50657). EX-0035 closed.

---

## P17 period roll-forward (lines 2–9, B/F R11,487.26)

All nine rows match CURRENT period-17 activity; P17 adds line 10 (45202):

| Doc | Entry | Date | Amount | Balance |
| :--- | :--- | :--- | ---: | ---: |
| B/F | | | R11,487.26 | R11,487.26 |
| 51526 | Invoice | 01/07/2026 | R4,536.47 | R16,023.73 |
| 44963 | Payment | 02/07/2026 | −R3,292.77 | R12,730.96 |
| 51527 | Invoice | 02/07/2026 | R3,622.50 | R16,353.46 |
| 15166 | Crd Note | 03/07/2026 | −R2,415.00 | R13,938.46 |
| 45104 | Payment | 09/07/2026 | −R4,536.47 | R9,401.99 |
| 15254 | Crd Note | 13/07/2026 | −R5,347.50 | R4,054.49 |
| 51789 | Invoice | 13/07/2026 | R4,820.01 | R8,874.50 |
| 51790 | Invoice | 13/07/2026 | R4,140.00 | R13,014.50 |
| **45202** | **Payment** | **16/07/2026** | **−R5,004.42** | **R8,010.08** |

---

## Bridge (post-P17)

| Component | Amount |
| :--- | ---: |
| Open LPG (49143 + 50528 + 51789) | R12,989.00 |
| Less verified on-account 44227 | −R4,978.91 |
| Reconstructed closing | R8,010.09 |
| ERP TXT closing (P17) | R8,010.08 |
| Variance | **−R0.01** (= EX-0029 / 43234 cent — unchanged) |

Turn 7 four-lane identity and CYL registry v10.2 are **unchanged** — this is portfolio catch-up only.

---

## DB status (2026-07-20)

Payment **45202** is **not yet** in `transaction_headers`. Invoice **50657** is present. Re-run `allocation_ingest.mjs` after ERP sync (extend `TO` to ≥ 2026-07-16) to emit the confirmed edge.

---

## Open LPG after P17

| Doc | Amount | Notes |
| :--- | ---: | :--- |
| 49143 | R3,839.70 | 43640→49550 (EX-0037); 49143 stays open |
| 50528 | R4,329.29 | Open |
| ~~50657~~ | ~~R5,004.42~~ | **Cleared by 45202** |
| 51789 | R4,820.01 | Open (TXT tail) |

*reconState remains `complete`; closing basis methodology unchanged — ERP closing figure updates to R8,010.08.*
