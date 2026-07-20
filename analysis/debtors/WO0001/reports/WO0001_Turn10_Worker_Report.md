# WO0001 Turn 10 — Worker Report

**Lane:** `allocation` · **Objective:** Close residual R314.52 → ≤ ±R0.05  
**Mode:** Read-only analysis · `allocation_edges.csv` unchanged

---

## Outcome: **STOP**

| Metric | Turn 9 | Turn 10 (recomputed) |
| :--- | ---: | ---: |
| Gap before bridge | R8 929,95 | **R8 929.95** |
| Bridge credit | R8 615,43 | **R8 615.43** |
| Residual gap | R314,52 | **R314.52** |

**STOP condition met:** No further evidence-supported decomposition to ±R0.05. Residual unchanged.

---

## Step 1 — Bridge arithmetic · PROVEN

Recomputed from `invoices.csv`, `cn_offsets_merged.json`, `allocation_edges.csv`, `dashboard_metrics.json`:

```
R8 929.95 − R8 615.43 = R314.52
```

Partition: R8 612.52 + R2.91 + R314.52 = R8 929.95 = gap before bridge.

BR-001 identity: lag41067Sum (R8 612.52) = inv41067.engineOpen (R8 612.52) — **PROVEN**.

---

## Step 2 — Hypothesis tests · all REJECTED

| ID | Hypothesis | Test quantity | vs R314.52 | Verdict |
| :--- | :--- | ---: | :--- | :--- |
| H-A | 39895 DN-lag | prepay R8 056.64 / over-LPG R42.72 | ≠ | REJECTED |
| H-B | 11882+12112 tails | R2 760.00 | ≠ (ΔR2 445.48) | REJECTED |
| H-C | 39063/35691 duplicate | Pmt 35691 R13 089.82; distinct DNs | ≠ | REJECTED |

No subset of unallocated slices (excl. 41067) sums to R314.52 (exhaustive cent search).

---

## Step 3 — Residual register

23 invoices in outstanding pool. Adjusted-open sum **R93 158.70** − dashboard **R92 844.18** = **R314.52**.

Full register: `reports/WO0001_Residual_Decomposition.md`

---

## Deliverables

| Artifact | Path |
| :--- | :--- |
| Residual decomposition | `reports/WO0001_Residual_Decomposition.md` |
| Register JSON | `data/residual_decomposition_register.json` |
| Bridge register (tags updated) | `data/unallocated_credit_bridge.json` |

---

## Operator / next turn

1. Residual **R314.52** requires new evidence (ERP per-invoice LPG open, or remittance) — not available in current CSV set.
2. Do **not** ratify ASSERTED bridge closes as PROVEN without ERP cent-match per invoice.
3. `reconState` remains `pending`.
