# LIN001 — Slindokuhle Enterprises
## Debtor reconciliation working notes (2026-09-04)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Lane (portfolio triage):** `position_recon` · Tier C  
**Source of truth for this note:** Supabase `transaction_headers` + operator manual allocation session

---

## 1. Scaffold status

- **No** dedicated ERP account TXT export in repo
- **Scaffold opened** `analysis/debtors/LIN001/` (2026-09-04) — events config + `project.json`
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
| **22936** | 2026-07-08 | 51681 | 15215 | **R53,951.69** | **Closed** — EXT-2744666881 ([detail](LIN001_event_DN22936.md)) |
| **23974** | 2026-08-24 | 52768 | 15543 | **R30,207.80** | **Closed** — EXT-2901239645 ([detail](LIN001_event_DN23974.md)) |
| **24947** | 2026-09-02 | 52924 | 15592 | **R5,433.70** | Partial — 45961 + R4,513.20 carry; **R18,216.10 open** |

**Payment pool (Mar–Sep 2026, PROVEN in Supabase unless noted):**

| Doc | Date | Amount | Batch | Notes |
|---|---|---:|---|---|
| **44482** | 2026-05-08 | R75,844.50 | PC-76-31 | SPEEDP |
| **44974** | 2026-06-06 | R40,590.60 | PC-76-32 | SPEEDP |
| **44975** | 2026-06-07 | R63,325.00 | PC-76-32 | TRANSF |
| **EXT-2744666881** | 2026-07-03 | R54,981.36 | Lin001 7.3 13991 | External bank — DN#22936 |
| **EXT-2901239645** | 2026-08-22 | R34,721.00 | HAPPY 8.22 | External bank — DN#23974 |
| **45961** | 2026-09-01 | R28,163.00 | PC-76-35 | SPEEDP |

---

## 5. Manual event closure — Jun–Sep 2026

### Event DN#22936 — closed (operator bank receipt)

**Detail:** `LIN001_event_DN22936.md` · **Config:** `analysis/debtors/LIN001/config/events.json`

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **51681** | 2026-07-08 | R134,049.19 |
| Credit note | **15215** → 51681 | 2026-07-08 | R-80,097.50 |
| Delivery note | **DN#22936** | — | *(proof)* |
| Payment | **EXT-2744666881** | 2026-07-03 | R54,981.36 |
| **Event net** | | | **R53,951.69** |

**Receipt ref `Lin001 7.3 13991`** matches invoice **order_no 13991** (PROVEN link).

```
R54,981.36  external payment EXT-2744666881
− R53,951.69  event net (51681 − 15215)
───────────
= R1,029.67  surplus → credit carry (target TBD)
```

**Event DN#22936 → closed.**

**Receipt:** `/opt/cursor/artifacts/LIN001_payment_receipt_DN22936_2026-07-03.jpg`

Prior ASSUMED split (44482 + carry from DN#22630) **withdrawn**.

### Event DN#22630 — ASSUMED payment (PC-76-32)

```
44974  R40,590.60
44975  R24,310.09  (partial — completes event net)
──────────────────
       R64,900.69  event net

44974 + 44975 total R103,915.60 − R64,900.69 = R39,014.91 credit surplus (unallocated — DN#22936 paid separately)
```

### Event DN#22508 — PROVEN zero-net

Invoice and CN both **R132,862.38** — net **R0.00**. No payment leg required. **Closed.**

### Event DN#23974 — closed (operator bank receipt)

**Detail:** `LIN001_event_DN23974.md` · **Config:** `analysis/debtors/LIN001/config/events.json`

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **52768** | 2026-08-24 | R69,652.80 |
| Credit note | **15543** → 52768 | 2026-08-24 | R-39,445.00 |
| Delivery note | **DN#23974** | — | *(proof)* |
| Payment | **EXT-2901239645** | 2026-08-22 | R34,721.00 |
| **Event net** | | | **R30,207.80** |

```
R34,721.00  external payment EXT-2901239645
− R30,207.80  event net (52768 − 15543)
───────────
= R4,513.20  surplus → credit carry to DN#24947
```

**Line mix (PROVEN):** 10×14kg, 10×19kg, 20×48kg SV + 3×48kg SV single — LPG + deposits.

**Event DN#23974 → closed.**

**Receipt:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

### Event DN#24947 — partial (45961 + revised carry)

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52924 | R74,433.70 |
| Credit note | 15592 | R-69,000.00 |
| Delivery note | **DN#24947** | *(proof)* |
| Payment | 45961 | R28,163.00 |

```
45961 current net           R5,433.70
Credit carry from DN#23974   R4,513.20  (revised — from bank receipt surplus)
────────────────────────────────────
                             R9,946.90  applied to event net

45961 residual              R18,216.10  (ASSUMED — target TBD)
```

Event net **R5,433.70** is covered; **R18,216.10** on payment 45961 remains unallocated unless a second payment toward DN#23974 is named (would restore R22,729.30 carry story).

---

## 6. Unallocated cash / credit

| Pool | Amount | Status |
|---|---:|---|
| **44482** (PC-76-31) | R75,844.50 | ASSUMED — fully unallocated |
| **DN#22630** surplus (PC-76-32) | R39,014.91 | ASSUMED |
| **DN#22936** surplus (EXT-2744666881) | R1,029.67 | ASSERTED |
| **45961** residual | R18,216.10 | ASSUMED |

---

## 7. Open questions

1. Confirm **44974/44975** allocation to DN#22630 — batch PC-76-32 timing fits, amounts ASSUMED.
2. **DN#24947:** where does **R18,216.10** on 45961 land, or is there a second payment toward DN#23974?
3. Target for **R39,014.91** PC-76-32 surplus and **R1,029.67** DN#22936 surplus.
4. Canonical allocation lane rerun for Mar–Feb open items?

---

## 8. Artifacts

| Artifact | Path |
|---|---|
| Allocation CSV (Mar–Feb) | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Event register (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_event_register_2026-06_2026-09.csv` |
| Manual event closure (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Event register script | `analysis/debtors/shared/scripts/lin001_event_register.mjs` |
| Fresh allocation script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| **Event DN#22936 card** | `analysis/debtors/shared/reports/LIN001_event_DN22936.md` |
| **Event DN#23974 card** | `analysis/debtors/shared/reports/LIN001_event_DN23974.md` |
| **LIN001 events config** | `analysis/debtors/LIN001/config/events.json` |
| Bank receipt (DN#22936) | `LIN001_payment_receipt_DN22936_2026-07-03.jpg` |
| Bank receipt (DN#23974) | `LIN001_payment_receipt_34721_2026-08-22.jpg` |

**Epistemic tags:** PROVEN (Supabase event structure), ASSERTED (operator-confirmed closures), ASSUMED (payment splits / carry chain).
