# LIN001 — Slindokuhle Enterprises
## Debtor reconciliation working notes (2026-09-04)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Lane (portfolio triage):** `position_recon` · Tier C  
**Source of truth for this note:** Supabase `transaction_headers` + operator manual allocation session

---

## 1. Scaffold status

- **No** micro-project scaffold at `analysis/debtors/LIN001/`
- **No** dedicated ERP account TXT export in repo
- Supabase holds ~732 header rows all-time; scoped automated pass used **2025-03-01 → 2026-02-28**

---

## 2. Fresh allocation pass (automated, best-effort)

**Script:** `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs`  
**Output:** `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv`

| Metric | Result |
|---|---:|
| Invoices | 47 |
| Credit notes matched | 51 / 51 (`CN_REFNO`) |
| Payment docs | 37 |
| Payment→invoice edges | 48 |
| Fully unallocated payments | 2 |
| Partial payment residuals | 2 |
| Unverified residual total | R164,733.59 |

**Not canonical pipeline** — ignored header tags, used header totals (LPG+CYL), amount-only payment matching with FIFO partial fallback.

---

## 3. Event model (operator)

An **event** is a closed delivery cycle with **four parts**:

| Part | Role |
|---|---|
| **Invoice** | Charges for the delivery (LPG + cylinder deposits) |
| **Credit note** | Empty-cylinder returns credited against the invoice |
| **Delivery note (DN#)** | **Proof of the event** — ties invoice, CN, and payment to one physical delivery |
| **Payment** | Cash that settles the event net |

Reconciliation proceeds **event-by-event**. An event is not closed until all four parts are named and the net balances.

**Event net** = invoice total − credit note total (header basis, LPG + CYL).

---

## 4. Event register — Jun–Sep 2026 (PROVEN structure)

**Generator:** `analysis/debtors/shared/scripts/lin001_event_register.mjs`  
**Output:** `analysis/debtors/shared/reports/LIN001_event_register_2026-06_2026-09.csv`

| Event (DN#) | Date | Invoice | Credit note | Event net | Payment status |
|---|---:|---:|---:|---:|---|
| **22630** | 2026-06-08 | 51132 | 15039 | **R64,900.69** | ASSUMED — PC-76-32 batch |
| **22508** | 2026-06-18 | 51268 | 15086 | **R0.00** | Closed — zero-net (CN full offset) |
| **22936** | 2026-07-08 | 51681 | 15215 | **R53,951.69** | ASSUMED — PC-76-31 + carry |
| **23974** | 2026-08-24 | 52768 | 15543 | **R30,207.80** | ASSERTED — bank receipt + PC-76-31 slice |
| **24947** | 2026-09-02 | 52924 | 15592 | **R5,433.70** | ASSERTED — 45961 + carry from 23974 |

**Payment pool (Mar–Sep 2026, PROVEN in Supabase unless noted):**

| Doc | Date | Amount | Batch | Notes |
|---|---|---:|---|---|
| **44482** | 2026-05-08 | R75,844.50 | PC-76-31 | SPEEDP |
| **44974** | 2026-06-06 | R40,590.60 | PC-76-32 | SPEEDP |
| **44975** | 2026-06-07 | R63,325.00 | PC-76-32 | TRANSF |
| **EXT-2901239645** | 2026-08-22 | R34,721.00 | HAPPY 8.22 | External bank — not in Supabase |
| **45961** | 2026-09-01 | R28,163.00 | PC-76-35 | SPEEDP |

---

## 5. Manual event closure — Jun–Sep 2026

### Event DN#22630 — ASSUMED payment (PC-76-32)

```
44974  R40,590.60
44975  R24,310.09  (partial — completes event net)
──────────────────
       R64,900.69  event net

44974 + 44975 total R103,915.60 − R64,900.69 = R39,014.91 credit carry → DN#22936
```

### Event DN#22508 — PROVEN zero-net

Invoice and CN both **R132,862.38** — net **R0.00**. No payment leg required. **Closed.**

### Event DN#22936 — ASSUMED payment (carry + PC-76-31 slice)

```
Credit from DN#22630     R39,014.91
44482 partial (PC-76-31) R14,936.78
─────────────────────────────────
                         R53,951.69  event net → closed
```

### Event DN#23974 — ASSERTED payment (operator bank receipt + PC-76-31 slice)

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52768 | R69,652.80 |
| Credit note | 15543 | R-39,445.00 |
| Delivery note | **DN#23974** | *(proof)* |
| Payment | EXT-2901239645 | R34,721.00 |
| Payment | 44482 partial | R18,216.10 *(ASSUMED)* |

```
EXT-2901239645  R34,721.00
44482 partial   R18,216.10
──────────────────────────
                R52,937.10  total cash
− event net     R30,207.80
──────────────────────────
= credit carry  R22,729.30  → DN#24947
```

**Receipt:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

### Event DN#24947 — ASSERTED payment (operator)

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52924 | R74,433.70 |
| Credit note | 15592 | R-69,000.00 |
| Delivery note | **DN#24947** | *(proof)* |
| Payment | 45961 | R28,163.00 |

```
45961 current net          R5,433.70
Credit carry from DN#23974  R22,729.30
────────────────────────────────────
                           R28,163.00  → fully allocated, event closed
```

---

## 6. Payment remainder

**44482** (PC-76-31) after slices to DN#22936 and DN#23974:

```
R75,844.50  total
− R14,936.78  → DN#22936
− R18,216.10  → DN#23974
─────────────
= R42,691.62  unallocated (ASSUMED — may bridge Feb open items or next event)
```

---

## 7. Open questions

1. Confirm **44482 split** (R14,936.78 + R18,216.10) — proposed to reconcile operator carry math; not operator-confirmed.
2. Confirm **44974/44975 split** across DN#22630 — batch PC-76-32 timing fits, amounts ASSUMED.
3. Does **R42,691.62** on 44482 close Feb-2026 open events (DN#21237 / DN#21541) or prepay a future delivery?
4. Scaffold LIN001 micro-project + canonical allocation lane rerun?

---

## 8. Artifacts

| Artifact | Path |
|---|---|
| Allocation CSV (Mar–Feb) | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Event register (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_event_register_2026-06_2026-09.csv` |
| Manual event closure (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Event register script | `analysis/debtors/shared/scripts/lin001_event_register.mjs` |
| Fresh allocation script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| Bank receipt (DN#23974) | `LIN001_payment_receipt_34721_2026-08-22.jpg` |

**Epistemic tags:** PROVEN (Supabase event structure), ASSERTED (operator-confirmed closures), ASSUMED (payment splits / carry chain).
