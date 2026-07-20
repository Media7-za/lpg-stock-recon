# MOZ002 — Turn 7h: TXT Four-Lane Decomposition v1

**Generated:** 2026-07-19 · Read-only · bridge restatement only (not applied)

---

## Step 1 — Four-lane partition (225 lines)

| Lane | Docs | Sum |
| :--- | ---: | ---: |
| LPG | 75 | **R182 605,55** |
| Empty/CYL | 108 | **-R1 207,50** |
| Payments | 41 | **-R168 383,55** |
| Other | 1 | **R0,00** |
| **Four-lane total** | | **R13 014,50** |
| TXT CURRENT BALANCE | | **R13 014,50** |
| **Variance** | | **R0,00** |

Unclassified non-zero remainder: **none**.

### Bridge restatement

| Component | Amount |
| :--- | ---: |
| Open LPG pool (49143 + 50528 + 50657 + 51789) | R17 993,42 |
| Less unallocated credit 44227 | -R4 978,91 |
| **Reconstructed closing** | **R13 014,51** |
| TXT closing | R13 014,50 |
| Bridge variance | -R0,01 |

**51527 cluster** (DN#22538=EMPTY): Inv 51527 R3 622,50 + CN 15166 -R2 415,00 = **R1 207,50** cluster net — lives in **empty lane**, included in -R1 207,50.

```
R182 605,55 + (-R1 207,50) + (-R168 383,55) + R0,00 = R13 014,50
```

The R0.01 bridge tie uses the **open LPG subset**, not empty-lane net = 0. Full-history identity requires the -R1 207,50 empty-lane term.

**Bridge vs four-lane (operator hypothesis):** Open LPG R17 993,42 − 44227 R4 978,91 = R13 014,51 vs TXT R13 014,50 (Δ -R0,01). If empty lane were wrongly assumed R0, components would sum to R11 807,01 — off by R1 207,49 from TXT closing. The -R1 207,50 empty-lane figure **is** in the four-lane identity; the bridge is a **subset restatement** only. 51527/15166 cluster (DN#22538=EMPTY, +1×S.1 short) is **inside** the empty-lane sum, not outside it.

---

## Step 2 — Empty-lane clusters (all 50; 34 zero-net, 16 non-zero)

**Σ cluster nets = -R1 207,50** (= empty lane -R1 207,50)

| DN cluster | Docs | Net | 9.1 qty | S.1/D.1 qty | Shell decomposition | Documents |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| DN #20126- EMPTIES | 2 | R0,00 | — | — | — | CN 13102 -R1 725,00; Inv 45304 R1 725,00 |
| DN_21913-EMPTY | 2 | R0,00 | — | — | — | CN 14458 -R3 622,50; Inv 49329 R3 622,50 |
| DN-21336-EMPTY | 2 | R0,00 | — | — | — | CN 14773 -R3 622,50; Inv 50306 R3 622,50 |
| DN-21449-EMPTY | 2 | R0,00 | — | — | — | CN 14210 -R4 140,00; Inv 48614 R4 140,00 |
| DN-21528-EMPTY | 2 | R517,50 | 1 | — | +1×9.1 | CN 14395 -R3 622,50; Inv 49144 R4 140,00 |
| DN-21858-EMPTY | 2 | R0,00 | — | — | — | CN 14705 -R2 932,50; Inv 50067 R2 932,50 |
| DN-21985-EMPTY | 2 | R0,00 | — | — | — | CN 14666 -R2 415,00; Inv 49934 R2 415,00 |
| DN-22161-EMPTY | 2 | R517,50 | 1 | — | +1×9.1 | CN 14741 -R2 415,00; Inv 50174 R2 932,50 |
| DN#12058-EMPTY | 2 | R0,00 | — | — | — | CN 12423 -R2 932,50; Inv 42844 R2 932,50 |
| DN#12076-EMPTY | 2 | R0,00 | — | — | — | CN 12468 -R2 415,00; Inv 43007 R2 415,00 |
| DN#12106-EMPTY | 2 | R517,50 | 1 | — | +1×9.1 | CN 12535 -R2 415,00; Inv 43246 R2 932,50 |
| DN#12137-EMPTY | 2 | -R1 035,00 | -2 | — | −2×9.1 | CN 12599 -R3 450,00; Inv 43462 R2 415,00 |
| DN#12149-EMPTY | 4 | R0,00 | — | — | — | CN 12639 -R2 415,00; CN 12640 -R2 932,50; Inv 43649 R2 415,00; Inv 43669 R2 932,50 |
| DN#12325-EMPTY | 2 | R0,00 | — | — | — | CN 12812 -R2 415,00; Inv 44201 R2 415,00 |
| DN#12349-EMPTY | 2 | R1 207,50 | — | 1 | +1×S.1 | CN 12872 -R2 415,00; Inv 44404 R3 622,50 |
| DN#12412-EMPTY | 2 | R0,00 | — | — | — | CN 12763 -R2 932,50; Inv 44063 R2 932,50 |
| DN#12649-EMPTY | 2 | R0,00 | — | — | — | CN 13020 -R2 932,50; Inv 44950 R2 932,50 |
| DN#12686-EMPTY | 2 | R0,00 | — | — | — | CN 12962 -R2 932,50; Inv 44743 R2 932,50 |
| DN#12836-EMPTY | 2 | R0,00 | — | — | — | CN 12174 -R2 415,00; Inv 41895 R2 415,00 |
| DN#12977-EMPTY | 2 | R0,00 | — | — | — | CN 12123 -R2 932,50; Inv 41713 R2 932,50 |
| DN#13072-EMPTY | 2 | R0,00 | — | — | — | CN 12296 -R4 140,00; Inv 42307 R4 140,00 |
| DN#13110-EMPTY | 2 | R0,00 | — | — | — | CN 12369 -R2 415,00; Inv 42613 R2 415,00 |
| DN#13232-EMPTY | 1 | R517,50 | 1 | — | +1×9.1 | Inv 43082 R517,50 |
| DN#20072-- EMPTY | 2 | R0,00 | — | — | — | CN 13165 -R2 415,00; Inv 45489 R2 415,00 |
| DN#20277-EMPTY | 2 | R0,00 | — | — | — | CN 13552 -R2 932,50; Inv 46670 R2 932,50 |
| DN#20306-EMPTY | 2 | R0,00 | — | — | — | CN 13194 -R2 932,50; Inv 45578 R2 932,50 |
| DN#20439-EMPTY | 2 | R0,00 | — | — | — | CN 13301 -R2 932,50; Inv 45873 R2 932,50 |
| DN#20477-EMPTY | 2 | R0,00 | — | — | — | CN 13434 -R2 932,50; Inv 46268 R2 932,50 |
| DN#20515-EMPTY | 2 | -R1 207,50 | — | -1 | −1×S.1 | CN 13251 -R2 932,50; Inv 45721 R1 725,00 |
| DN#20566-EMPTY | 2 | R0,00 | — | — | — | CN 13349 -R3 622,50; Inv 46051 R3 622,50 |
| DN#20691-EMPTY | 2 | R0,00 | — | — | — | CN 13974 -R4 140,00; Inv 47980 R4 140,00 |
| DN#20704-EMPTY | 2 | R0,00 | — | — | — | CN 13651 -R2 932,50; Inv 46981 R2 932,50 |
| DN#20767-EMPTY | 2 | R0,00 | — | — | — | CN 13771 -R4 657,50; Inv 47402 R4 657,50 |
| DN#20815-EMPTY | 2 | R517,50 | 1 | — | +1×9.1 | CN 13838 -R3 622,50; Inv 47590 R4 140,00 |
| DN#20859-EMPTY | 2 | R0,00 | — | — | — | CN 13931 -R2 415,00; Inv 47858 R2 415,00 |
| DN#21051-EMPTY | 2 | R0,00 | — | — | — | CN 13523 -R2 932,50; Inv 46563 R2 932,50 |
| DN#21109-EMPTY | 2 | R0,00 | — | — | — | CN 13710 -R4 140,00; Inv 47171 R4 140,00 |
| DN#21481EMPTY | 2 | R0,00 | — | — | — | CN 14335 -R4 140,00; Inv 48941 R4 140,00 |
| DN#21640-EMPTY | 2 | R0,00 | — | — | — | CN 14276 -R4 140,00; Inv 48798 R4 140,00 |
| DN#21716-EMPTY | 2 | -R1 725,00 | -1 | -1 | −1×S.1+1×9.1 partial | CN 14113 -R5 865,00; Inv 48348 R4 140,00 |
| DN#21963-EMPTY | 2 | R0,00 | — | — | — | CN 14587 -R4 140,00; Inv 49711 R4 140,00 |
| DN#22112-EMPTY | 2 | -R517,50 | -1 | — | −1×9.1 | CN 14533 -R4 657,50; Inv 49551 R4 140,00 |
| DN#22222-EMPTY | 4 | -R1 035,00 | -2 | — | −2×9.1 | CN 14850 -R2 932,50; CN 14856 -R5 175,00; Inv 50519 R2 932,50; Inv 50529 R4 140,00 |
| DN#22385-EMPTY | 2 | R517,50 | 1 | — | +1×9.1 | CN 14904 -R3 622,50; Inv 50658 R4 140,00 |
| DN#22502-EMPTY | 2 | R0,00 | — | — | — | CN 15072 -R4 140,00; Inv 51236 R4 140,00 |
| DN#22538=EMPTY | 2 | R1 207,50 | — | 1 | +1×S.1 | CN 15166 -R2 415,00; Inv 51527 R3 622,50 |
| DN#22662=EMPTY | 2 | -R1 207,50 | — | -1 | −1×S.1 | CN 15128 -R4 140,00; Inv 51432 R2 932,50 |
| DN#22810=EMPTY | 2 | -R1 207,50 | — | -1 | −1×S.1 | CN 15254 -R5 347,50; Inv 51790 R4 140,00 |
| DN#4438-EMPTY | 7 | R0,00 | — | — | — | CN 12075 -R3 105,00; CN 12080 -R2 932,50; CN 12081 -R2 415,00; CN 12082 -R517,50; Inv 41504 R3 105,00; Inv 41523 R2 932,50; Inv 41535 R2 932,50 |
| DN20893 EMPTY | 2 | R1 207,50 | — | 1 | +1×S.1 | CN 14007 -R2 415,00; Inv 48096 R3 622,50 |

### Non-zero cluster roll-up (all 16 named — no prose summary)

| Sign / bucket | Cluster | Net |
| :--- | :--- | ---: |
| +R1,207.50 | DN#12349-EMPTY | R1 207,50 |
| +R1,207.50 | DN#22538=EMPTY | R1 207,50 |
| +R1,207.50 | DN20893 EMPTY | R1 207,50 |
| −R1,207.50 | DN#20515-EMPTY | -R1 207,50 |
| −R1,207.50 | DN#22662=EMPTY | -R1 207,50 |
| −R1,207.50 | DN#22810=EMPTY | -R1 207,50 |
| +R517.50 | DN-21528-EMPTY | R517,50 |
| +R517.50 | DN-22161-EMPTY | R517,50 |
| +R517.50 | DN#12106-EMPTY | R517,50 |
| +R517.50 | DN#13232-EMPTY | R517,50 |
| +R517.50 | DN#20815-EMPTY | R517,50 |
| +R517.50 | DN#22385-EMPTY | R517,50 |
| −R517.50 | DN#22112-EMPTY | -R517,50 |
| Other | DN#12137-EMPTY | -R1 035,00 |
| Other | DN#21716-EMPTY | -R1 725,00 |
| Other | DN#22222-EMPTY | -R1 035,00 |
| **Σ all non-zero** | **16 clusters** | **-R1 207,50** |
| Zero-net clusters | 34 clusters | R0,00 |
| **Empty lane total** | **50 clusters** | **-R1 207,50** |

### Bucket arithmetic (cent reconciliation)

| Bucket | Count | Sum |
| :--- | ---: | ---: |
| +R1,207.50 | 3 | R3 622,50 |
| −R1,207.50 | 3 | -R3 622,50 |
| +R517.50 | 6 | R3 105,00 |
| −R517.50 | 1 | -R517,50 |
| Other (mixed shells) | 3 | -R3 795,00 |
| **All non-zero** | **16** | **-R1 207,50** |

**Why "3 shorts / 3 over-credits" ≠ the empty-lane net:** the three +R1,207.50 and three −R1,207.50 buckets **net to R0.00** internally. The aggregate **-R1 207,50** comes from the **±R517.50 9.1-shell buckets** (R3 105,00 + -R517,50) plus **Other** mixed clusters (DN#12137-EMPTY -R1 035,00; DN#21716-EMPTY -R1 725,00; DN#22222-EMPTY -R1 035,00). Qty conservation confirms: Σ S.1/D.1 cluster qty = **-1** → **-R1 207,50** = empty-lane financial net.

---

## Step 3 — Duplicate-header blast radius (16 pairs)

| Doc | Type | Dup n | Header Σ | Single hdr | Lane | LPG doubled? |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
| 14705 | Crd Note | 2 | -R6 247,50 | -R3 315,00 | empty_cyl | No (CYL extract only) |
| 14773 | Crd Note | 2 | -R7 717,50 | -R4 095,00 | empty_cyl | No (CYL extract only) |
| 38227 | Payment | 2 | -R6 927,88 | -R4 227,89 | payments | No (slice consolidation) |
| 39589 | Payment | 13 | -R11 363,37 | -R11 363,37 | payments | No (slice consolidation) |
| 40729 | Payment | 4 | -R9 716,68 | -R2 810,61 | payments | No (slice consolidation) |
| 41529 | Payment | 13 | -R0,01 | -R1 207,50 | payments | No (slice consolidation) |
| 41654 | Payment | 6 | -R16 860,86 | -R3 768,44 | payments | No (slice consolidation) |
| 43234 | Payment | 2 | -R3 797,37 | -R3 797,36 | payments | No (slice consolidation) |
| 44147 | Payment | 2 | -R8 149,24 | -R4 074,62 | payments | No (slice consolidation) |
| 44881 | Payment | 2 | -R6 098,05 | -R4 798,04 | payments | No (slice consolidation) |
| 50066 | Invoice | 2 | R5 942,16 | R2 971,08 | lpg | No (vw GROUP BY dedupes) |
| 50067 | Invoice | 2 | R5 865,00 | R2 932,50 | empty_cyl | No (CYL extract only) |
| 50173 | Invoice | 2 | R5 942,16 | R2 971,08 | lpg | No (vw GROUP BY dedupes) |
| 50174 | Invoice | 2 | R5 865,00 | R2 932,50 | empty_cyl | No (CYL extract only) |
| 50305 | Invoice | 2 | R8 149,24 | R4 074,62 | lpg | No (vw GROUP BY dedupes) |
| 50306 | Invoice | 2 | R7 245,00 | R3 622,50 | empty_cyl | No (CYL extract only) |

**Verdict:** Open LPG pool / bridge **not doubled** — uses curated open invoices + TXT amounts; `vw_clean_transactions` GROUP BY doc for dup LPG invoices (50066, 50173, 50305) returns single-hdr amounts. CYL movement v1 JOIN **was** doubled on empty dup headers: **50174, 50067, 50306, 14705, 14773**.

*Read-only. edges / LPG registry / reconState untouched.*
