# WO0001 — Statement Bridge (v3)

**Turn:** WO0001-9  
**Generated:** 2026-07-20  
**Anchor:** 2026-06-03

---

## 1. Turn progression

| Metric | Turn 7 | Turn 8 | Turn 9 |
| :--- | ---: | ---: | ---: |
| CN offsets (DN gate) | 0 | 5 | 5 |
| Engine-open sum | R161 214.89 | R101 774.13 | R101 774.13 |
| Gap vs LPG debt | R68 370.71 | R8 929.95 | R8 929.95 |
| After bridge credits | — | — | R93 158.70 |
| **Residual gap** | — | — | **R314.52** |

---

## 2. Two-lane ERP (unchanged — PROVEN)

| Component | Amount |
| :--- | ---: |
| LPG gas debt | R92 844.18 |
| Cylinder financial | R17 945,18 |
| **ERP balance 2026-06-03** | **R110 789,36** |

---

## 3. OTHER-lane pass (Stage 7)

Explicit ref → **OTHER-only** invoices (zero LPG lines). Staged in `data/allocation_other_edges.csv`; does **not** alter LPG engine-open.

| Payment | Date | Ref | OTHER amt | Tag |
| :--- | :--- | :--- | ---: | :--- |
| 40110 | 2025-07-06 | 44564 | R12 000.00 | Confirmed |
| 40276 | 2025-07-27 | 44977 | R12 000.00 | Confirmed |
| 40452 | 2025-08-04 | 45769 | R6 000.00 | Confirmed |
| 41648 | 2025-10-13 | 47092 | R910.00 | Confirmed |
| 41963 | 2025-10-26 | 44131 | R6 500.00 | Confirmed |
| 41963 | 2025-10-26 | 45589 | R11 400.00 | Confirmed |
| 43139 | 2026-01-26 | 48871 | R5 500.00 | Confirmed |

**Count:** 7 · **Sum:** R54 310.00

"No LPG" unallocated pool (full ledger, informational): 35 edges · R131 509.20

---

## 4. Unallocated credit bridge (LPG-scoped)

| ID | Category | Invoice | Credit | Tag |
| :--- | :--- | :--- | ---: | :--- |
| BR-001 | DN_LAG_INSTALMENT | 41067 | R8 612.52 | PROVEN |
| BR-002 | TRUNCATION_MICRO_OPEN | (10 invoices) | R2.91 | ASSERTED |
| | **Bridge credit total** | | **R8 615.43** | |
| | Adjusted engine-open | | **R93 158.70** | |
| | Dashboard LPG debt | | R92 844.18 | |
| | **Residual gap** | | **R314.52** | DEFECT |

### BR-001 — Inv 41067 DN-lag instalment (PROVEN)

| Payment | Date | Amount | Note |
| :--- | :--- | ---: | :--- |
| 36494 | 2025-01-26 | R7 404.36 | DN-lag prepay |
| 36462 | 2025-02-03 | R747.89 | DN-lag prepay |
| 36787 | 2025-02-13 | R115.09 | DN-lag prepay |
| 36969 | 2025-02-21 | R345.18 | DN-lag prepay |
| **Sum** | | **R8 612.52** | = engine open R8 612.52 |

### BR-002 — Truncation micro-open (ASSERTED)

- Inv **10711** — R0.38
- Inv **13325** — R0.15
- Inv **15777** — R0.30
- Inv **25364** — R0.29
- Inv **27787** — R0.40
- Inv **47514** — R0.30
- Inv **49021** — R0.36
- Inv **49138** — R0.08
- Inv **49213** — R0.12
- Inv **49973** — R0.53

Proposed ratification: `config/allocation_overrides_proposed.json` (4 trunc + 1 OTHER entries).

---

## 5. Residual defect (R314.52)

Named drivers for operator review (not cent-closed):

| Driver | Estimate | Evidence |
| :--- | ---: | :--- |
| Inv 39895 DN-lag prepay tail | ~R2 070 | Pmt 35345 R8 056,64 prepay vs open R5 986,64 |
| Historic partial tails (11882/12112 × R1 380) | R2 760 | LPG partial; no unallocated ref match |
| Inv 39063 / Pmt 35691 duplicate cluster | review | 35691 UNALLOCATED ref 39164 (39164 closed via 36042) |
| Post-anchor Inv 51007 | R12 818 | Paid 2026-06-18 (post portfolio anchor) — correct at anchor |

**STOP:** Residual R314.52 ≠ ±R0,05. Do **not** set `reconState: complete`.

---

## 6. Next steps

1. **Operator:** Ratify `allocation_overrides_proposed.json` + `cn_dn_gate_proposed.json`
2. **Operator:** Review residual R314.52 — 39895 DN-lag + partial tails
3. **Sources:** ERP TXT refresh (CURRENT R88 768,73 vs anchor R110 789,36)
4. **Worker (conditional):** 39895 DN-lag disposition if operator approves credit bridge extension

---

*OTHER edges: `data/allocation_other_edges.csv` · Bridge register: `data/unallocated_credit_bridge.json`*
