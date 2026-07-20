# MOZ002 — Turn 7i: TXT Decomposition v2 (line-level lanes)

**Generated:** 2026-07-20 · Read-only · supersedes `MOZ002_TXT_Decomposition_v1.md` (doc-level lanes)

> **Doctrine:** Lane membership is a property of the **line**, not the document. Mixed documents are the norm; doc-level partitioning manufactured the −R1,207.50 phantom that consumed Turns 7g–7i.

---

## Step 1 — Shell-line hunt (Turn 7h LPG-classified documents)

**Hypothesis window:** Dec 2025 / DN#21716 / candidate **48347**.

| Finding | Result |
| :--- | :--- |
| Shell lines on LPG-classified docs | **14 lines** across **10 documents** |
| Σ net shell on LPG-classified docs | **R1 207,50** (unpaired — driven by **51078**/**15027**; paired typo-headers net R0 per cluster) |
| **48347** (DN#21716 LPG invoice) | **No shell lines** — LPG product only (9.4, S.4) |
| **48348** / **14113** (DN#21716-EMPTY) | Shell lines on **empty-classified** headers (not in this hunt) |
| Reverse contamination (LPG product on empty-header docs) | **0 lines** |

### Every shell hit on LPG-classified documents

| Doc | Date | Type | SKU | Qty | Value | TXT desc | Header desc |
| :--- | :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| 12710 | 12/06/2025 | Crd Note | S.1 | -2 | -R2 415,00 | DN#12560-E,MPTY | DN#12560-E,MPTY |
| 13069 | 29/07/2025 | Crd Note | 9.1 | -1 | -R517,50 | DN20020. | DN20020. |
| 13069 | 29/07/2025 | Crd Note | S.1 | -2 | -R2 415,00 | DN20020. | DN20020. |
| 13602 | 03/10/2025 | Crd Note | S.1 | -2 | -R2 415,00 | DN#21092-EPTY | DN#21092-EPTY |
| 14981 | 28/05/2026 | Crd Note | 9.1 | -1 | -R517,50 | DN#22603 | DN#22603 |
| 15027 | 06/06/2026 | Crd Note | 9.1 | -1 | -R517,50 | DN# 22786 | DN# 22786 |
| 15027 | 06/06/2026 | Crd Note | S.1 | -2 | -R2 415,00 | DN# 22786 | DN# 22786 |
| 43859 | 12/06/2025 | Invoice | S.1 | 2 | R2 415,00 | DN#12560-E,MPTY | DN#12560-E,MPTY |
| 45200 | 28/07/2025 | Invoice | 9.1 | 1 | R517,50 | DN20020. | DN20020. |
| 45200 | 28/07/2025 | Invoice | S.1 | 2 | R2 415,00 | DN20020. | DN20020. |
| 46826 | 01/10/2025 | Invoice | S.1 | 2 | R2 415,00 | DN#21092-EPTY | DN#21092-EPTY |
| 50917 | 28/05/2026 | Invoice | 9.1 | 1 | R517,50 | DN#22603 | DN#22603 |
| 51078 | 06/06/2026 | Invoice | 9.1 | 1 | R517,50 | — | — |
| 51078 | 06/06/2026 | Invoice | S.1 | 3 | R3 622,50 | — | — |

### Per-document shell subtotals (LPG-classified)

| Doc | Σ shell value | Lines |
| :--- | ---: | :--- |
| 12710 | -R2 415,00 | S.1 -R2 415,00 |
| 13069 | -R2 932,50 | 9.1 -R517,50; S.1 -R2 415,00 |
| 13602 | -R2 415,00 | S.1 -R2 415,00 |
| 14981 | -R517,50 | 9.1 -R517,50 |
| 15027 | -R2 932,50 | 9.1 -R517,50; S.1 -R2 415,00 |
| 43859 | R2 415,00 | S.1 R2 415,00 |
| 45200 | R2 932,50 | 9.1 R517,50; S.1 R2 415,00 |
| 46826 | R2 415,00 | S.1 R2 415,00 |
| 50917 | R517,50 | 9.1 R517,50 |
| 51078 | R4 140,00 | 9.1 R517,50; S.1 R3 622,50 |

**48347 neighbour check:** Inv **48347** (DN#21716, R3 770,39 LPG) has **zero** CYL/deposit lines. The DN#21716 shell activity lives on **48348** + **14113** (empty headers). The Turn 7h −R1,207.50 phantom was **not** a missing 48347 shell line — it was **doc-level lane assignment** aggregating asymmetric cluster financials while shell lines on typo-LPG headers (e.g. `DN#12560-E,MPTY`) sat in the LPG lane.

**Reverse contamination:** none.

---

## Step 2 — Four-lane identity (line-level partition)

| Lane | Doc-level (Turn 7h) | **Line-level (Turn 7i)** | Δ |
| :--- | ---: | ---: | ---: |
| LPG | R182 605,55 | **R181 398,05** | -R1 207,50 |
| Empty/CYL | -R1 207,50 | **R0,00** | R1 207,50 |
| Payments | -R168 383,55 | -R168 383,55 | R0,00 |
| **Four-lane total** | R13 014,50 | **R13 014,50** | R0,00 |

Expected: LPG **R181,398.05**, empty **R0.00** — **actual: LPG R181 398,05, empty R0,00**.

---

## Step 3 — Invariant re-test (line-level basis d)

Registry source: `config/cyl_residual_registry.json` (or proposed fallback) · mode: **unmerged S.1 + D.1**

| Class | Registry qty | Custody (d) | Match |
| :--- | ---: | ---: | :--- |
| 9.1 | 0 | 0 | ✓ |
| S.1 | 0 | 0 | ✓ |
| D.1 | 0 | 0 | ✓ |

**Invariant: PASS**


### Non-zero DN clusters

| DN cluster | Fin net | 9.1 | S.1/D.1 |
| :--- | ---: | ---: | ---: |
| DN-21528-EMPTY | R517,50 | 1 | — |
| DN-22161-EMPTY | R517,50 | 1 | — |
| DN# 22786 | R1 207,50 | — | 1 |
| DN#12106-EMPTY | R517,50 | 1 | — |
| DN#12137-EMPTY | -R1 035,00 | -2 | — |
| DN#12349-EMPTY | R1 207,50 | — | 1 |
| DN#13232-EMPTY | R517,50 | 1 | — |
| DN#20515-EMPTY | -R1 207,50 | — | -1 |
| DN#20815-EMPTY | R517,50 | 1 | — |
| DN#21716-EMPTY | -R1 725,00 | -1 | -1 |
| DN#22112-EMPTY | -R517,50 | -1 | — |
| DN#22222-EMPTY | -R1 035,00 | -2 | — |
| DN#22385-EMPTY | R517,50 | 1 | — |
| DN#22538=EMPTY | R1 207,50 | — | 1 |
| DN#22662=EMPTY | -R1 207,50 | — | -1 |
| DN#22810=EMPTY | -R1 207,50 | — | -1 |
| DN20893 EMPTY | R1 207,50 | — | 1 |
| **Σ** | **R0,00** | **0** | **0** |

---

## Step 4 — Bridge note

| Component | Amount |
| :--- | ---: |
| Open LPG pool | R17 993,42 |
| Less 44227 | -R4 978,91 |
| Reconstructed closing | R13 014,51 |
| TXT closing | R13 014,50 |
| Variance | -R0,01 |

Four-lane identity: **exact** at R13 014,50. Bridge Δ -R0,01 = **EX-0029** (43234 cent).

---

*Turn 7i. Read-only on edges, LPG registry, reconState, 44227.*
