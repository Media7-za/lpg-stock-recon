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

## 3. Delivery events (outside automated pass scope)

**Convention (operator):** An **event** is a **delivery**, keyed by **DN# ref**.
Each delivery bundles invoice + same-day cylinder credits + the cash that settles it.
Invoice doc numbers are ledger anchors; **DN# is the reconciliation unit**.

### Delivery DN#23974 — 2026-08-24

| Doc | Type | Amount |
|---|---|---:|
| **52768** | Invoice | R69,652.80 |
| **15543** | Crd Note → 52768 | R-39,445.00 |
| **Delivery net after CN** | | **R30,207.80** |

**Line mix (52768):** LPG fills + cylinder deposits  
**CN 15543:** cylinder deposit credits only (empty returns)

### Delivery DN#24947 — 2026-09-02

| Doc | Type | Amount |
|---|---|---:|
| **52924** | Invoice | R74,433.70 |
| **15592** | Crd Note → 52924 | R-69,000.00 |
| **Delivery net after CN** | | **R5,433.70** |

**Line mix (52924):** LPG fills + cylinder deposits  
**CN 15592:** cylinder deposit credits only (empty returns)

---

## 4. External bank payment — delivery DN#23974 (operator confirmed)

**Not in Supabase.** Recorded from mobile banking receipt (New Champion Supermarket → Bella Energy Services300).

| Field | Value |
|---|---|
| **Amount** | **R34,721.00** |
| **Date** | 2026-08-22 20:56 |
| **Reference** | HAPPY 8.22 |
| **Transaction ID** | 2901239645 |
| **Synthetic doc id** | `EXT-2901239645` |

### Allocation to delivery DN#23974

```
R34,721.00  external payment EXT-2901239645
− R30,207.80  delivery net after CN 15543
───────────
= R4,513.20  delivery credit → carry to next delivery
```

| # | Edge | DN# | Amount | Confidence |
|---|---|---|---:|---|
| 1 | CN 15543 → INV 52768 | 23974 | R39,445.00 | PROVEN (ERP ref_no) |
| 2 | EXT-2901239645 → delivery | 23974 | R30,207.80 | ASSERTED (operator + bank receipt) |
| 3 | Delivery credit carry | 23974→24947 | R4,513.20 | ASSERTED |

**Delivery DN#23974 → closed** on net basis.

**Receipt artifact:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

> **Math revision:** Prior session asserted **R22,729.30** delivery credit from DN#23974 into DN#24947.
> With this single external payment as the sole DN#23974 cash source, surplus is **R4,513.20** only.
> The R18,216.10 gap (22,729.30 − 4,513.20) implies **additional unrecorded cash** toward delivery DN#23974,
> or a different allocation basis — **not reconciled** here.

---

## 5. Manual allocation — delivery DN#24947 (operator confirmed; revised carry)

**Payment 45961** · 2026-09-01 · **R28,163.00** · SPEEDP · **PC-76-35**  
Settles delivery DN#24947 using current delivery net plus **delivery credit from DN#23974** (revised).

```
R28,163.00  payment 45961
− R5,433.70  delivery DN#24947 net (after CN 15592)
− R4,513.20  delivery credit from DN#23974 (revised)
───────────
= R18,216.10  unallocated residual on 45961
```

### Manual edges (revised)

| # | Edge | DN# | Amount | Confidence |
|---|---|---|---:|---|
| 1 | CN 15592 → INV 52924 | 24947 | R69,000.00 | PROVEN (ERP ref_no) |
| 2 | PMT 45961 → delivery | 24947 | R5,433.70 | ASSERTED (operator) |
| 3 | Delivery credit carry | 23974→24947 | R4,513.20 | ASSERTED |
| 4 | PMT 45961 residual | 24947 | R18,216.10 | ASSUMED (target delivery TBD) |

**Delivery DN#24947 → closed** on net basis (R5,433.70 cash + R4,513.20 credit = R9,946.90 applied).

### Ledger gap

**PROVEN:** No ERP payment rows in Supabase between **2026-06-07** and **2026-09-01** for LIN001.  
**ASSERTED:** External bank payment **EXT-2901239645** (R34,721, 2026-08-22) closes delivery DN#23974 net.  
**ASSUMED:** **R18,216.10** on payment 45961 still needs a target delivery or batch.

---

## 6. Open questions

1. Does **R18,216.10** on payment 45961 apply to another delivery (DN#), or is there a second external payment toward DN#23974 that would restore the earlier **R22,729.30** delivery-credit story?
2. Should LIN001 get a full micro-project scaffold + canonical allocation lane rerun?
3. Re-run with LPG-only matching + tag-check gate vs continue manual delivery-by-delivery?

---

## 7. Artifacts

| Artifact | Path |
|---|---|
| Allocation CSV (Mar–Feb) | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Manual allocation CSV (Aug–Sep) | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-08_2026-09.csv` |
| Generator script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| Bank receipt | `LIN001_payment_receipt_34721_2026-08-22.jpg` |
| PR | #11 (branch `cursor/lin001-fresh-allocation-bb32`) |

**Epistemic tags used:** PROVEN (DB/CSV counts), ASSERTED (operator carry-forward), ASSUMED (best-effort matcher).
