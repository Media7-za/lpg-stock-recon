# MOZ002 — CYL Movement v3 (Turn 7h)

**Supersedes:** `MOZ002_CYL_Movement_v2.md` (Step 5, custody, registry) · **Generated:** 2026-07-19

> Corrected movement ledger (186 lines) unchanged — see v2 §A.

---

## Executive summary

| Item | Result |
| :--- | :--- |
| Four-lane TXT identity | **R13 014,50** = TXT closing (variance R0,00) |
| Empty-lane sum | **-R1 207,50** — 50 DN clusters fully itemized in TXT Decomposition v1 |
| Registry v10.1 invariant | **FAIL** |
| LPG bridge | Restated in TXT Decomposition — **not applied** |

---

## Custody bases (a)–(d)

Provisional **S.1/D.1 merge** on basis (d) per operator.

| Basis | 9.1 | S.1 | D.1 | S.1/D.1 merged | Total value |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **(a)** lines-only DB | 0 | 0 | 2 | 2 | R2 415,00 |
| **(b)** + derived 14741 | 0 | -2 | 2 | — | R0,00 |
| **(c)** + TXT 51527/15166 | 0 | -1 | 2 | — | R1 207,50 |
| **(d)** full TXT empty (108 unique docs, **Σ DN cluster net qty**) | 0 | — | — | **-1** | **-R1 207,50** |

Basis (d) uses **per-DN cluster net quantity** (conservation unit), not raw line roll-up. Separate S.1/D.1 columns from line roll-up: -3 / 2 (ghost from Aug-11 code drift — merges to cluster basis above).

### Cluster qty nets (non-zero DN clusters)

| DN cluster | Fin net | 9.1 qty | S.1/D.1 qty |
| :--- | ---: | ---: | ---: |
| DN-21528-EMPTY | R517,50 | 1 | 0 |
| DN-22161-EMPTY | R517,50 | 1 | 0 |
| DN#12106-EMPTY | R517,50 | 1 | 0 |
| DN#12137-EMPTY | -R1 035,00 | -2 | 0 |
| DN#12349-EMPTY | R1 207,50 | 0 | 1 |
| DN#13232-EMPTY | R517,50 | 1 | 0 |
| DN#20515-EMPTY | -R1 207,50 | 0 | -1 |
| DN#20815-EMPTY | R517,50 | 1 | 0 |
| DN#21716-EMPTY | -R1 725,00 | -1 | -1 |
| DN#22112-EMPTY | -R517,50 | -1 | 0 |
| DN#22222-EMPTY | -R1 035,00 | -2 | 0 |
| DN#22385-EMPTY | R517,50 | 1 | 0 |
| DN#22538=EMPTY | R1 207,50 | 0 | 1 |
| DN#22662=EMPTY | -R1 207,50 | 0 | -1 |
| DN#22810=EMPTY | -R1 207,50 | 0 | -1 |
| DN20893 EMPTY | R1 207,50 | 0 | 1 |
| **Σ** | **-R1 207,50** | **0** | **-1** |

Basis (b) with S.1/D.1 merged = **R0.00** (conservation signature).

### EX-0015

**Yes** — net 9.1 = 0 on bases (a) and (d). Closed by **14856**.

---

## Step 5 — Empty-lane net

**-R1 207,50** · See TXT Decomposition v1 §Step 2 for all 50 clusters.

---

## Registry v10.1

**Invariant: INVARIANT FAIL — do not ratify**

> **INVARIANT FAIL** — Σ registry outstanding qty ≠ net custody qty (basis d). Artifact staged for revision only; no ratification request.
>
> Registry post-closure outstanding qty = 0 for S.1/D.1; custody basis (d) cluster sum = -1. Three +1×S.1 short clusters (DN#12349-EMPTY, DN#22538=EMPTY, DN20893 EMPTY) pair to three −1×S.1 over-credit clusters (20515, 22662, 22810). Remaining unmatched over-credit: DN#21716-EMPTY (-1×S.1, -R1 725,00). Financial empty-lane -R1 207,50 = -1×R1,207.50 shell module. Resolve before ratification.


| Class | Registry outstanding qty | Custody basis (d) merged | Match |
| :--- | ---: | ---: | :--- |
| 9.1 | 0 | 0 | ✓ |
| S.1/D.1 | 0 | -1 | ✗ |

**Conservation rule:** per SKU class, Σ registry outstanding qty must equal net custody qty. Financial empty-lane -R1 207,50 = -1×R1,207.50 when 9.1 qty net = 0.

### Closure map (symmetric float logic)

| ID | Short | Closed by | Mechanism |
| :--- | :--- | :--- | :--- |
| EX-0005 | CN 12535 1×9.1 | **14113** | 14113 2×9.1 double-return (2025-12-18) repays 12535 float |
| EX-0015 | CN 14741 1×9.1 | **14856** | 14856 3×9.1 over-return DN#22222-EMPTY (2026-05-06) |
| EX-0009 | CN 12872 1×S.1 | **13251** | 13251 vs 45721 over-credit R1,207.50 DN#20515-EMPTY (2025-08-18) |
| EX-0013 | CN 14007 1×S.1 | **15128** | 15128 vs 51432 over-credit R1,207.50 DN#22662=EMPTY (2026-06-26) |
| EX-0016 | CN 15166 1×S.1 | **15254** | 15254 vs 51790 over-credit; 51527/15166 cluster |
| EX-0034 | CN 51527 1×S.1 | **15254** | 51527/15166 cluster closed by 15254 |

| EX-0001…EX-0014 (11) | v9 R517.50 each | — | SUPERSEDED_VALUE_INFERRED (FULL_CLEAR at qty) |

### v9 → v10 → v10.1 diff

| Version | Outstanding total | Notes |
| :--- | ---: | :--- |
| v9 live | R8,280.00 | 16 × value-inferred R517.50 |
| v10 proposed | R4,140.00 | Failed conservation (ignored) |
| **v10.1 proposed** | **R0.00** | All floats closed; invariant FAIL |

Staged: `config/cyl_residual_registry_v10_1_proposed.json` — not applied.

---

*Turn 7h. Read-only on edges, LPG registry, reconState.*
