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

## 3. Last ledger event (outside automated pass scope)

### DN#24947 — 2026-09-02

| Doc | Type | Amount |
|---|---|---:|
| **52924** | Invoice | R74,433.70 |
| **15592** | Crd Note → 52924 | R-69,000.00 |
| **Net after CN** | | **R5,433.70** |

**Line mix (52924):** LPG fills + cylinder deposits  
**CN 15592:** cylinder deposit credits only (empty returns)

### Prior event — DN#23974 — 2026-08-24

| Doc | Type | Amount |
|---|---|---:|
| **52768** | Invoice | R69,652.80 |
| **15543** | Crd Note → 52768 | R-39,445.00 |
| **Net after CN** | | **R30,207.80** |

---

## 4. Manual allocation — DN#24947 (operator confirmed)

**Payment 45961** · 2026-09-01 · **R28,163.00** · SPEEDP · **PC-76-35**  
Related to DN#24947. Short-paid because of **overpayment credit from prior event**.

```
R28,163.00  payment 45961
− R5,433.70  current event net (after CN 15592)
───────────
= R22,729.30  overpayment credit applied from prior event
```

### Proposed manual edges

| # | Edge | Amount | Confidence |
|---|---|---:|---|
| 1 | CN 15592 → INV 52924 | R69,000.00 | CONFIRMED (ERP ref_no) |
| 2 | PMT 45961 → INV 52924 (current cash) | R5,433.70 | CONFIRMED (operator) |
| 3 | Overpayment credit → INV 52924 | R22,729.30 | ASSERTED (carry from DN#23974) |

**DN#24947 / Invoice 52924 → closed** (pending overpayment source doc named).

Implied prior settlement: R30,207.80 + R22,729.30 = **R52,937.10** applied to DN#23974.

### Ledger gap

**PROVEN:** No payment rows in Supabase between **2026-06-07** and **2026-09-01** for LIN001.  
The **R22,729.30** overpayment source payment doc is **not yet named** in ledger.

---

## 5. Open questions

1. Which payment/batch created the **R22,729.30** overpayment on DN#23974?
2. Should LIN001 get a full micro-project scaffold + canonical allocation lane rerun?
3. Re-run with LPG-only matching + tag-check gate vs continue manual event-by-event?

---

## 6. Artifacts

| Artifact | Path |
|---|---|
| Allocation CSV | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Generator script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| PR | #11 (branch `cursor/lin001-fresh-allocation-bb32`) |

**Epistemic tags used:** PROVEN (DB/CSV counts), ASSERTED (operator carry-forward), ASSUMED (best-effort matcher).
