# WO0001 — Statement Bridge (v1)

**Turn:** WO0001-7  
**Account:** WO0001 — L3 Cash and Carry  
**Generated:** 2026-07-20

---

## 1. Anchor selection

| Anchor | Source | Closing balance | As-of |
| :--- | :--- | ---: | :--- |
| **A — Portfolio** | `project.json` / `dashboard_metrics.json` / `WO0001_Statement_Account_v1.md` | **R110 789,36** | 2026-06-03 |
| **B — ERP CURRENT TXT** | `reports/WO001CURRENT.TXT` | **R88 768,73** | 2026-07-01 |
| Δ (staleness) | B − A | **R−22 020,63** | New activity Jun 18 – Jul 1 |

All identity proofs below use **Anchor A** unless noted. Anchor B invalidates any customer comms drafted against Jun closing.

---

## 2. Two-lane ERP identity (PROVEN)

From `data/dashboard_metrics.json` and `WO0001_BASELINE_v1.md`:

| Lane | Component | Amount | Tag |
| :--- | :--- | ---: | :--- |
| LPG | Gas debt (VAT-incl line sums, excl Alloc/Recon) | R92 844,18 | PROVEN |
| CYL | Cylinder financial balance | R17 945,18 | PROVEN |
| **Total** | **ERP stated balance** | **R110 789,36** | **PROVEN** |
| Check | R92 844,18 + R17 945,18 | R110 789,36 | **ΔR0,00** |

Custody exposure (parallel, non-financial): R72 220,00 · Cylinder variance: R−57 379,82 ⚠️ — **position_recon lane**, out of scope for allocation turn.

---

## 3. Allocation-lane bridge (2026 Tier-5 scope)

### 3.1 Tier-5 cash disposition

| Bucket | Amount | Tag |
| :--- | ---: | :--- |
| 2026 payments in pilot scope | R168 562,92 | PROVEN |
| Confirmed allocations (excl. review slices) | R163 062,81 | PROVEN |
| Truncation slices (pending ratification) | R36 011,00 | ASSERTED |
| OTHER unallocated (43139→48871) | R5 500,00 | ASSERTED |
| Rounding residuals | R1,49 | PROVEN |
| **Pool check** | **R168 562,92** | **PROVEN** |

### 3.2 Tier-5 item closure status

| Item | Status | Open after |
| :--- | :--- | ---: |
| 43757 combination | **Closed** | R0,04 rounding (immaterial) |
| 43237/43323/43398/43881 trunc | **Asserted** | R1,09 micro-open on 4 invoices |
| 43139 OTHER slice | **Asserted** | R5 500,00 until override ratified |

---

## 4. Full-ledger open pool vs LPG debt (DEFECT)

| Line | Amount | Tag |
| :--- | ---: | :--- |
| Dashboard LPG gas debt (Anchor A) | R92 844,18 | PROVEN |
| Sum engine-open on 28 invoices (`WO0001_Allocation_Outstanding.md`) | R161 214,89 | ASSERTED |
| **Unexplained gap** | **R68 370,71** | **DEFECT** |

### 4.1 Named decomposition (ASSERTED — not cent-closed)

| Defect | Estimate | Evidence |
| :--- | ---: | :--- |
| CN Tier-3 gate miss (DN ref vs invoice doc) | ≥ R13 895 (inv 49682 alone) | CN 14595 lines sum to −R13 895,01; engine lists inv 49682 fully open |
| OTHER-lane historic unallocated slices | ≥ R5 500 (2026) + pre-2026 pool | 49 UNALLOCATED edges totalling R175 473,84 full ledger |
| Truncation micro-residuals | R1,09 | Four 2026 invoices |
| **Remaining** | **Unitemized** | Requires CN gate fix + OTHER-lane pass |

**STOP:** Allocation lane alone cannot prove LPG debt. Next worker turn: CN DN-ref map (read-only), then re-run outstanding.

---

## 5. Anchor B bridge (CURRENT TXT — informational)

Post–Jun-2026 ERP activity (from `WO001CURRENT.TXT`):

| Doc | Date | Entry | Amount | Running bal |
| :--- | :--- | :--- | ---: | ---: |
| 44747 | 2026-06-18 | Payment STAT 127 | R−12 818,00 | R45 931,56 |
| 51342–51497 | 2026-06-22 – 07-01 | Invoices + CNs | (net) | R88 768,73 |

Portfolio `project.json` financials are **stale** vs Anchor B. Run Sources Agent TXT refresh before collection or `reconState` advance.

---

## 6. Identity summary

| Identity | Result |
| :--- | :--- |
| LPG + CYL = ERP (Anchor A) | **PROVEN — R0,00** |
| 2026 Tier-5 payment pool | **PROVEN — R0,00** |
| Allocation open = LPG debt | **FAIL — R68 370,71 gap** |
| Allocation edges → ERP total | **Not attempted** (cross-lane) |

---

## 7. Recommended next turns

1. **Worker (read-only):** CN DN-ref pairing audit for Mar–Jun 2026 — fix Tier-3 gate hypothesis.  
2. **Operator:** Ratify `allocation_overrides_proposed.json` (5 entries).  
3. **Sources:** Ingest post-Jun-2026 TXT; PM sync updates `project.json` financials.  
4. **Worker (conditional):** Re-run outstanding after CN fix; target LPG open = R92 844,18 ±R0,05.

---

*Edges unchanged: `data/allocation_edges.csv`. Proposed overrides: `config/allocation_overrides_proposed.json`.*
