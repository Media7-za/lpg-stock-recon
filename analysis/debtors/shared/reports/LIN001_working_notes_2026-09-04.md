# LIN001 — Slindokuhle Enterprises
## Debtor reconciliation working notes (2026-09-04)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Lane (portfolio triage):** `position_recon` · Tier C  
**Source of truth for this note:** Supabase `transaction_headers` + operator manual allocation session

---

## 1. Scaffold status

- **No** micro-project scaffold at `analysis/debtors/LIN001/`
- **No** dedicated ERP account TXT export in repo
- Supabase holds ~732 header rows all-time; scoped work used **2025-03-01 → 2026-02-28**

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

**Open after automated pass:**
- **15 open invoices** (~R522.7k; 7 material)
- **4 payment docs** with unallocated/residual cash (~R164.7k)
- **0 unmatched credit notes**

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

Reconciliation proceeds **event-by-event**. A event is not closed until all four parts are named and the net balances.

**Event net** = invoice total − credit note total (header basis, LPG + CYL).

---

## 4. Events outside automated pass scope

### Event DN#23974 — proof: delivery note **DN#23974**

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **52768** | 2026-08-24 | R69,652.80 |
| Credit note | **15543** → 52768 | 2026-08-24 | R-39,445.00 |
| Delivery note | **DN#23974** | — | *(proof)* |
| Payment | **EXT-2901239645** | 2026-08-22 | R34,721.00 |
| **Event net** | | | **R30,207.80** |

**Payment source:** External bank receipt (not in Supabase). New Champion Supermarket → Bella Energy Services300.  
Ref **HAPPY 8.22** · Transaction ID **2901239645**.

**Line mix (52768):** LPG fills + cylinder deposits  
**CN 15543:** cylinder deposit credits only (empty returns)

#### Event closure

```
R34,721.00  payment EXT-2901239645
− R30,207.80  event net (52768 − 15543)
───────────
= R4,513.20  surplus → credit carry to next event
```

| # | Edge | Amount | Confidence |
|---|---|---:|---|
| 1 | CN 15543 → INV 52768 | R39,445.00 | PROVEN (ERP ref_no) |
| 2 | EXT-2901239645 → event DN#23974 | R30,207.80 | ASSERTED (operator + bank receipt) |

**Event DN#23974 → closed.** Surplus R4,513.20 carried forward.

**Receipt artifact:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

---

### Event DN#24947 — proof: delivery note **DN#24947**

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **52924** | 2026-09-02 | R74,433.70 |
| Credit note | **15592** → 52924 | 2026-09-02 | R-69,000.00 |
| Delivery note | **DN#24947** | — | *(proof)* |
| Payment | **45961** | 2026-09-01 | R28,163.00 |
| **Event net** | | | **R5,433.70** |

**Payment detail:** SPEEDP · **PC-76-35** (Supabase ERP payment row).

**Line mix (52924):** LPG fills + cylinder deposits  
**CN 15592:** cylinder deposit credits only (empty returns)

#### Event closure (operator; revised carry)

Payment 45961 settles event DN#24947 using current event net plus credit carried from event DN#23974.

```
R28,163.00  payment 45961
− R5,433.70  event net (52924 − 15592)
− R4,513.20  credit carry from event DN#23974
───────────
= R18,216.10  unallocated residual on 45961
```

| # | Edge | Amount | Confidence |
|---|---|---:|---|
| 1 | CN 15592 → INV 52924 | R69,000.00 | PROVEN (ERP ref_no) |
| 2 | PMT 45961 → event DN#24947 (current net) | R5,433.70 | ASSERTED (operator) |
| 3 | Credit carry DN#23974 → DN#24947 | R4,513.20 | ASSERTED |
| 4 | PMT 45961 residual | R18,216.10 | ASSUMED (target event TBD) |

**Event DN#24947 → closed** on net basis (R5,433.70 + R4,513.20 credit = R9,946.90 applied).

---

## 5. Ledger gaps

**PROVEN:** No ERP payment rows in Supabase between **2026-06-07** and **2026-09-01** for LIN001 except **45961** on 2026-09-01.  
**ASSERTED:** External bank payment **EXT-2901239645** is the payment leg of event DN#23974.  
**ASSUMED:** **R18,216.10** on payment 45961 still needs a target event.

> **Math note:** Prior session asserted **R22,729.30** credit carry from DN#23974.
> With EXT-2901239645 as the sole payment for that event, surplus is **R4,513.20** only.
> Gap of R18,216.10 **not reconciled** — may imply additional payment toward DN#23974
> or a different event-net basis.

---

## 6. Open questions

1. Does **R18,216.10** on 45961 belong to another event (another DN#), or is there a second payment toward DN#23974?
2. Should LIN001 get a full micro-project scaffold + canonical allocation lane rerun?
3. Re-run with LPG-only matching + tag-check gate vs continue event-by-event?

---

## 7. Artifacts

| Artifact | Path |
|---|---|
| Allocation CSV (Mar–Feb) | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Manual allocation CSV (Aug–Sep) | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-08_2026-09.csv` |
| Generator script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| Bank receipt (DN#23974 payment proof) | `LIN001_payment_receipt_34721_2026-08-22.jpg` |
| PR | #11 (branch `cursor/lin001-fresh-allocation-bb32`) |

**Epistemic tags used:** PROVEN (DB/CSV counts), ASSERTED (operator event closure), ASSUMED (residual / best-effort matcher).
