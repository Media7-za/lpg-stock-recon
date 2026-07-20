# WO0001 — Statement Bridge (v2)

**Turn:** WO0001-8  
**Generated:** 2026-07-20

---

## 1. CN gate fix — PROVEN partial close

| Identity | Result |
| :--- | :--- |
| Turn 7 open − Turn 8 open | **R59 440.76 closed** |
| Invoices dropped from outstanding | 5 (net count 23) |
| DN-gate additions | 5 (incl. CN 14595→49682 defect) |

---

## 2. Two-lane ERP (unchanged)

| Component | Amount |
| :--- | ---: |
| LPG gas debt | R92 844,18 |
| Cylinder financial | R17 945,18 |
| **ERP balance 2026-06-03** | **R110 789,36** |

---

## 3. Allocation-lane residual

| Line | Amount |
| :--- | ---: |
| Engine-open (Turn 8) | R101 774.13 |
| Dashboard LPG debt | R92 844,18 |
| **Gap** | **R8 929.95** |

**STOP:** Gap still ≠ R0.05. Residual drivers: OTHER-lane unallocated slices, truncation micro-open (R1,09), historic partial-pay invoices, CYL overlap.

---

## 4. Next steps

1. Ratify `allocation_overrides_proposed.json` + `cn_dn_gate_proposed.json`
2. Worker Turn 9: OTHER-lane pass on unallocated edges (pre-2026)
3. Sources: ERP TXT refresh (CURRENT R88 768,73)

*Audit: `WO0001_CN_DN_Ref_Audit_2026Q1Q2.md`*
