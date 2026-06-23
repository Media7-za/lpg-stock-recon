# WO0001 — L3 CASH AND CARRY
## Account Baseline Report (v1 — Onboarding)
**Compiled:** 2026-06-23  
**Account:** WO0001  
**Period:** 2 November 2016 → 3 June 2026 *(~9.5 years)*  
**Document:** Internal Audit Baseline — Onboarding

---

## Account Overview

| Field | Detail |
|---|---|
| **Customer** | L3 Cash and Carry |
| **ERP Account** | WO0001 |
| **Account Type** | Trade debtor — recurring LPG gas & cylinder deposits |
| **Delivery References** | DN series (wholesale cash-and-carry) |
| **Payment Pattern** | Monthly EFT batch transfers — `TRANSF \| STAT 1xx` |
| **Data Source** | Supabase `transaction_headers` + `vw_clean_transactions` |

---

## 1. Supabase Discovery Summary

| Metric | Value |
|---|---|
| Transaction count | 962 |
| Date range | 2016-11-02 → 2026-06-03 |
| ERP stated balance | **R110,789.36** |
| Net reconstructed balance (excl Alloc/Recon) | **R110,789.36** |
| ERP vs reconstructed variance | **R0.00** ✓ |
| Last invoice date | 2026-06-02 |
| Last payment date | 2026-06-03 |
| Aged debt 180+ (balance at 2025-12-26 cutoff) | **R51,628.92** |

### Entry Type Breakdown

| Entry Type | Count |
|---|---|
| Payment | 416 |
| Invoice | 377 |
| Crd Note | 165 |
| Journal | 4 |

---

## 2. Debtor Position Workspace

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

### 2A. Financial Position

| Component | Amount |
|---|---|
| LPG Gas Debt | R92,844.18 |
| Cylinder Financial Balance | R17,945.18 |
| **Total Debtor Balance** | **R110,789.36** |
| ERP Stated Balance | R110,789.36 |
| **ERP Variance** | **R0.00** ✓ |

*LPG gas debt derived as ERP total minus net CYL line balance (R17,945.18). Full payment-to-invoice allocation not yet performed — figures are onboarding estimates.*

### 2B. Custody Position

| SKU | Net Qty | Rate | Custody Exposure |
|---|---|---|---|
| 14.1 (14kg) | +35 | R575.00 | R20,125.00 |
| 19.1 (19kg) | −8 | R690.00 | R−5,520.00 |
| 9.1 (9kg) | +118 | R517.50 | R61,065.00 |
| 9.2 (9kg legacy) | +6 | R517.50 | R3,105.00 |
| D.1 (48kg DV) | −2 | R1,150.00 | R−2,300.00 |
| S.1 (48kg SV) | −1 | R1,150.00 | R−1,150.00 |
| **Total Custody Exposure** | | | **R75,325.00** |

### 2C. Reconciliation Position

| Metric | Value |
|---|---|
| Cylinder Financial Balance | R17,945.18 |
| Cylinder Custody Exposure | R75,325.00 |
| **Cylinder Variance** | **R−57,379.82** ⚠️ |

> ⚠️ **Large cylinder variance** — financial CYL ledger (R17,945.18) diverges significantly from custody exposure (R75,325.00). Likely causes: (1) legacy 9.2 SKU deposits predating Dual-Line Pattern, (2) unallocated cylinder settlements via monthly STAT batch payments, (3) negative 19.1/D.1/S.1 net positions indicating returns exceeding deliveries or allocation gaps. Requires full reconciliation before advancing `reconState`.

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->

---

## 3. LPG vs CYL Separation (Dual-Line Pattern)

Applied per business Rule 5 — stock numbers ending `01` = LPG gas fill; ending `.1` = cylinder deposit bond.

| Debt Group | Line Items | Cumulative Line Total |
|---|---|---|
| LPG | 789 | R2,000,162.06 |
| CYL | 711 | R17,945.18 |
| OTHER (AGR misc) | — | R67,244.67 |

> **OTHER group:** Seven AGR-category SKUs (R67,244.67 cumulative) — agricultural/miscellaneous charges outside LPG/CYL lanes. Included in ERP header balance but excluded from LPG payment matching scope.

---

## 4. Alloc / Recon Noise Check

| Metric | Value |
|---|---|
| Alloc/Recon payment rows | 108 |
| Distinct doc_no groups | 23 |
| Groups netting to zero | 23 (100%) |
| **Leaky groups (non-zero residual)** | **0** ✓ |

All 108 `ref_no IN ('Alloc','Recon')` payment rows collapse into 23 mirror-pair document groups, each netting to **R0.00**. No leaky allocation groups detected. These rows are excluded from reconstructed balance and payment matching.

---

## 5. Payment Behaviour Summary

### 5A. Payment Reference Patterns

| ref_no Category | Count | Total |
|---|---|---|
| Alloc (excluded) | 108 | R0.00 |
| (blank) | 24 | R−16,636.78 |
| Invoice-linked (exact ref) | ~150+ | Majority of cash flow |

### 5B. Match Types Observed

| Pattern | Evidence | Examples |
|---|---|---|
| **Exact invoice match** | Payment `ref_no` = invoice `doc_no`, cent-aligned | Pmt 00044553 → Inv 00051006 (R13,833.00); Pmt 00044459 → Inv 00050760 (R13,603.52) |
| **Split payment (multi-invoice STAT batch)** | Single payment doc, multiple `ref_no` segments | Doc 00044295 (STAT 126): clears Inv 00050470 + 00050506 in one EFT |
| **Rounding residuals** | Blank `ref_no` micro-amounts (≤R0.65) | Doc 00044295 (−R0.15), 00044096 (−R0.05) — ERP rounding on split allocations |
| **Monthly STAT batch** | `batch_ref` = `STAT 1xx` | STAT 125–127 (Apr–Jun 2026); recurring wholesale pattern |
| **Unallocated (blank ref, material)** | Blank ref, non-trivial amount | Doc 00043757 (STAT 124): R−16,628.00 — requires allocation investigation |

### 5C. Recent Payment Activity (2026)

| Date | Doc No | Amount | STAT Ref | Invoice Ref |
|---|---|---|---|---|
| 2026-06-03 | 00044553 | R−13,833.00 | STAT 127 | 00051006 |
| 2026-05-30 | 00044459 | R−13,603.52 | STAT 126 | 00050760 |
| 2026-05-16 | 00044295 | R−20,256.85 | STAT 126 | 00050470, 00050506 |
| 2026-04-25 | 00044096 | R−11,355.00 | STAT 125 | 00050232 |
| 2026-04-14 | 00044002 | R−10,774.00 | STAT 125 | 00050120 |
| 2026-04-04 | 00043881 | R−9,896.00 | STAT 125 | 00049973 |

### 5D. Arrear Cycle & Boundary Notes

- Customer pays via **monthly STAT statement batches**, typically 1–3 weeks after invoice month-end.
- **Split-payment pattern** is dominant: one EFT clears 2–3 invoices from the same delivery cycle.
- **April 2026 DN-22357 anomaly:** Invoice 00050459 credited same-day (CN 00014829), replacement invoice 00050470 issued — net LPG charge R11,127.37 settled by payment 00044295 on 2026-05-16.
- No human-approved payment pattern overrides registered at onboarding.

---

## 6. Exception Analysis

| # | Exception | Severity | Action |
|---|---|---|---|
| 1 | Cylinder variance R−57,379.82 | High | Full CYL allocation reconciliation required |
| 2 | Blank-ref payment R16,628 (doc 00043757) | Medium | Trace STAT 124 batch to target invoices |
| 3 | AGR/OTHER lines R67,244.67 cumulative | Low | Confirm non-LPG charges; exclude from gas matching |
| 4 | Negative net qty on 19.1 (−8), D.1 (−2), S.1 (−1) | Medium | Verify return/credit note pairing |
| 5 | Legacy 9.2 SKU (6 units) | Low | Map to 9.1 custody group for reporting |

---

## 7. Reconciliation State

| Field | Value |
|---|---|
| `reconState` | **pending** |
| `status` | active |
| Override registry | Not created (no human-approved overrides) |

**Next steps to advance reconciliation:**
1. Run monthly LPG payment pattern analysis (STAT batch matching)
2. Resolve cylinder variance via allocation evidence register
3. Investigate blank-ref payment 00043757 (R16,628)
4. Cross-check header totals vs line sums (Rule 6 ERP Header Cross-Check)

---

## 8. Workspace Files Generated

| File | Records |
|---|---|
| `data/invoices.csv` | 1,500 |
| `data/payments.csv` | 198 |
| `data/cylinder_transactions.csv` | 711 |
| `data/dashboard_metrics.json` | — |

---

*Report generated during WO0001 onboarding session. `reconState` remains `pending` until workspace verification is complete.*
