# WO0001 Turn 9 — Worker Report

**Lane:** `allocation` · **Objective:** OTHER-lane unallocated pass + close LPG gap

---

## Outcome

| Metric | Turn 8 | Turn 9 |
| :--- | ---: | ---: |
| Gap vs LPG debt | R8 929.95 | **R314.52** (after bridge) |
| OTHER-lane matches staged | 0 | **7** |
| Bridge credits itemized | 0 | **2** (R8 615.43) |

**PROVEN:** Inv **41067** DN-lag instalment cluster — unallocated slices = engine open (R8 612.52 exact).

**PROVEN:** 7 OTHER-only explicit-ref matches cent-aligned (R54 310.00).

**STOP:** Residual gap **R314.52** ≠ ±R0,05. Do not set `reconState: complete`. `allocation_edges.csv` unchanged pending operator ratification.

---

## Deliverables

| Artifact | Path |
| :--- | :--- |
| OTHER-lane edges | `data/allocation_other_edges.csv` |
| Credit bridge register | `data/unallocated_credit_bridge.json` |
| Statement bridge v3 | `reports/WO0001_Statement_Bridge_v3.md` |
| Outstanding (updated) | `reports/WO0001_Allocation_Outstanding.md` |
| Overrides (extended) | `config/allocation_overrides_proposed.json` |

---

## Operator actions

1. Ratify truncation overrides (4) + OTHER edges (7)
2. Ratify `cn_dn_gate_proposed.json` (Turn 8)
3. Review residual **R314.52** — 39895 DN-lag, partial tails 11882/12112
