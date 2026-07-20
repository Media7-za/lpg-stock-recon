# WO0001 — Residual Decomposition Register

**Turn:** WO0001-10  
**Generated:** 2026-07-20  
**Anchor:** 2026-06-03

---

## 1. Bridge arithmetic (recomputed from source)

| Line | Source | Amount | Tag |
| :--- | :--- | ---: | :--- |
| Engine-open sum | `invoices.csv` + CN offsets + `allocation_edges.csv` paid | R101 774.13 | PROVEN |
| Dashboard LPG debt | `dashboard_metrics.json` | R92 844.18 | PROVEN |
| **Gap before bridge** | engine − dashboard | **R8 929.95** | PROVEN |
| BR-001 Inv 41067 DN-lag | 4 UNALLOCATED slices → ref 41067 | R8 612.52 | PROVEN |
| BR-001 = inv 41067 engine-open | identity check | R8 612.52 | PROVEN |
| BR-002 truncation micro-open | 10 invoices, engineOpen ≤ R1 | R2.91 | PROVEN (sum) |
| **Bridge credit total** | BR-001 + BR-002 | **R8 615.43** | PROVEN |
| Adjusted engine-open | R101 774.13 − R8 615.43 | R93 158.70 | PROVEN |
| **Residual gap** | adjusted − dashboard | **R314.52** | DEFECT |

### Partition identity

```
R8 929.95 − R8 615.43 = R314.52
R8 612.52 + R2.91 + R314.52 = R8 929.95  (gap before bridge)
```

---

## 2. Invoice-level decomposition (23 outstanding)

| Invoice | Date | LPG | Paid | Engine open | Bridge credit | Adjusted open |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 10711 | 2021-10-15 | R10 977.38 | R10 977.00 | R0.38 | R0.38 | R0.00 |
| 11838 | 2021-12-29 | R9 519.99 | R0.00 | R9 519.99 | — | R9 519.99 |
| 11882 | 2022-01-04 | R9 744.87 | R8 364.87 | R1 380.00 | — | R1 380.00 |
| 12112 | 2022-01-31 | R7 924.94 | R6 544.94 | R1 380.00 | — | R1 380.00 |
| 13325 | 2022-05-06 | R12 957.15 | R12 957.00 | R0.15 | R0.15 | R0.00 |
| 15370 | 2022-08-29 | R16 859.92 | R16 677.06 | R182.86 | — | R182.86 |
| 15777 | 2022-09-22 | R12 330.30 | R12 330.00 | R0.30 | R0.30 | R0.00 |
| 17163 | 2023-01-03 | R11 635.81 | R0.00 | R11 635.81 | — | R11 635.81 |
| 17312 | 2023-01-17 | R12 219.27 | R0.00 | R12 219.27 | — | R12 219.27 |
| 25364 | 2023-10-10 | R12 537.29 | R12 537.00 | R0.29 | R0.29 | R0.00 |
| 27787 | 2023-12-18 | R11 334.40 | R11 334.00 | R0.40 | R0.40 | R0.00 |
| 30255 | 2024-03-08 | R11 662.30 | R3 552.33 | R8 109.97 | — | R8 109.97 |
| 38727 | 2024-11-29 | R12 513.55 | R0.00 | R12 513.55 | — | R12 513.55 |
| 39063 | 2024-12-13 | R13 089.82 | R0.00 | R13 089.82 | — | R13 089.82 |
| 39491 | 2024-12-30 | R14 645.25 | R10 322.57 | R4 322.68 | — | R4 322.68 |
| 39895 | 2025-01-14 | R8 013.92 | R2 027.28 | R5 986.64 | — | R5 986.64 |
| 41067 | 2025-02-27 | R15 306.73 | R6 694.21 | R8 612.52 | R8 612.52 | R0.00 |
| 47514 | 2025-11-04 | R10 068.30 | R10 068.00 | R0.30 | R0.30 | R0.00 |
| 49021 | 2026-01-29 | R9 510.36 | R9 510.00 | R0.36 | R0.36 | R0.00 |
| 49138 | 2026-02-06 | R9 410.08 | R9 410.00 | R0.08 | R0.08 | R0.00 |
| 49213 | 2026-02-11 | R8 195.12 | R8 195.00 | R0.12 | R0.12 | R0.00 |
| 49973 | 2026-03-27 | R9 896.53 | R9 896.00 | R0.53 | R0.53 | R0.00 |
| 51007 | 2026-06-01 | R12 818.11 | R0.00 | R12 818.11 | — | R12 818.11 |
| **Sum** | | | | **R101 774.13** | **R8 615.43** | **R93 158.70** |

Check: adjusted sum − dashboard = **R314.52**

---

## 3. BR-002 truncation detail

| Invoice | Micro-open |
| :--- | ---: |
| 10711 | R0.38 |
| 13325 | R0.15 |
| 15777 | R0.30 |
| 25364 | R0.29 |
| 27787 | R0.40 |
| 47514 | R0.30 |
| 49021 | R0.36 |
| 49138 | R0.08 |
| 49213 | R0.12 |
| 49973 | R0.53 |
| **Sum** | **R2.91** |

---

## 4. Hypothesis tests

### H-A — Inv 39895 DN-lag prepay · **REJECTED**

| Quantity | Value |
| :--- | ---: |
| Invoice LPG | R8 013.92 |
| Engine open | R5 986.64 |
| DN-lag unalloc (Pmt 35345) | R8 056.64 |
| Allocated after invoice | R2 027.28 |
| Prepay over LPG invoice | R42.72 |
| Excess prepay over engine-open | R2 070.00 |

No tested quantity equals R314.52 (prepay R8056.64, over-LPG R42.72, excess-over-open R2070, engine-open R5986.64).

### H-B — Inv 11882 / 12112 partial tails · **REJECTED**

| Invoice | Engine open (tail) |
| :--- | ---: |
| 11882 | R1 380.00 |
| 12112 | R1 380.00 |
| **Sum** | **R2 760.00** |

Sum R2760 ≠ R314.52 (ΔR2445.48).

### H-C — Inv 39063 / Pmt 35691 duplicate-header · **REJECTED**

| Check | Result |
| :--- | :--- |
| 39063 LPG | R13 089.82 (DN#11143) |
| 39164 LPG | R13 089.82 (DN#0840) |
| Same DN key | **no** |
| 39164 open at 35691 date | R0.00 |
| 35691 UNALLOCATED | R13 089.82 |
| 39063 engine open | R13 089.82 |

Distinct DN keys (11143 vs 0840); 39164 closed via Pmt 36042 before 35691; 35691 UNALLOCATED R13089.82 is duplicate-overpay, not R314.52.

---

## 5. STOP

No single hypothesis explains **R314.52** to ±R0.05. Residual remains **R314.52**.

*Register JSON: `data/residual_decomposition_register.json`*
