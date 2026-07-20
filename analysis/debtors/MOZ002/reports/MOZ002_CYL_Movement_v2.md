> **⛔ SUPERSEDED** (Step 5, custody, registry) by `MOZ002_CYL_Movement_v3.md` + `MOZ002_TXT_Decomposition_v1.md` — Turn 7h.

# MOZ002 — Turn 7g: CYL Movement v2 (data-defect resolution)

**Generated:** 2026-07-19 · **Supersedes:** `MOZ002_CYL_Movement_v1.md` · **Scope:** Read-only except staged registry v10 (not applied)
**Source:** Supabase `transaction_items` (canonical qty) + `transaction_headers` (secondary) + `MOZ002CURRENT.TXT` (external cross-check)

> **v1 defect:** Section A ledger doubled qty on five April/May docs because `transaction_headers` carries **duplicate header rows** per doc; v1 JOIN multiplied lines. **Lines are not duplicated** — header dedupe required.

---

## Executive summary

| Finding | v1 | v2 ruling |
| :--- | :--- | :--- |
| **50174 line doubling** | §A 2×9.1+4×S.1 vs §B 1×9.1+2×S.1 | **§B correct.** Lines = 1×9.1 + 2×S.1 (R2,932.50). Duplicate **headers**, not lines. |
| **50067/14705, 50306/14773** | Same doubled pattern in §A | **GENUINE 1+2 / 3×S.1 pairs** — lines match single header; duplicate header row is ingest artefact. |
| **14741 line-less CN** | Inconclusive | **Genuinely no `transaction_items` rows** (not view drop). Header −R2,415 → derived **2×S.1** (flagged). |
| **15166 / 51527** | TXT only | **Absent from DB** (coverage ends **2026-06-25**). TXT: inv R3,622.50 / CN −R2,415. |
| **Closing custody (basis a)** | R5,347.50 (inflated) | **R2,415.00** — 2×D.1 only; 9.1 net **0** at DB cutoff. |
| **EX-0015 / 14741 9.1 short** | Outstanding | **Physically extinguished** — net 9.1 = 0; May-6 over-return (14856) repays float. |
| **Registry R8,280** | 16×R517.50 | **Mostly value-inferred fiction** — 11 DN clusters FULL_CLEAR at qty. |
| **Step 5 TXT empty-lane net** | Assumed R0.00 | **−R1,207.50** — **STOP:** LPG bridge untouched (non-zero). |

---

## Step 1 — 50174 line-doubling audit

### Root cause

| Doc | Line rows | Line sum | Header rows | Header sum (duped) | Header matching lines | Verdict |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| **50174** | 2 | R2,932.50 | 2 | R5,865.00 | R2,932.50 | **DUPLICATE_HEADER_ROWS** — v1 extract bug |
| **50067** | 2 | R2,932.50 | 2 | R5,865.00 | R2,932.50 | **GENUINE_LARGE_DELIVERY** — 1×9.1 + 2×S.1; TXT agrees |
| **14705** | 2 | −R2,932.50 | 2 | −R6,247.50 | −R2,932.50 | **GENUINE_LARGE_DELIVERY** — mirror of 50067 |
| **50306** | 1 | R3,622.50 | 2 | R7,245.00 | R3,622.50 | **GENUINE_LARGE_DELIVERY** — 3×S.1; TXT agrees |
| **14773** | 1 | −R3,622.50 | 2 | −R7,717.50 | −R3,622.50 | **GENUINE_LARGE_DELIVERY** — mirror of 50306 |

**50174 raw lines (authoritative):**

| id | SKU | Qty | Value |
| :--- | :--- | ---: | ---: |
| 70306 | 9.1 | +1 | R517.50 |
| 70429 | S.1 | +2 | R2,415.00 |

Duplicate header on 50174: two identical `transaction_headers` rows (same `tx_date`, `entry_type`, `doc_no`). v1 grouped `transaction_items` ⋈ `transaction_headers` without dedupe → **exact 2× multiplication** on Section A only.

**April window pairs** (50067/14705, 50306/14773): quantum jump from 1+2 rhythm is **real posted qty**, not line duplication. Pairs self-balance at **cluster** level (custody-neutral).

---

## Step 2 — Line-less CNs (raw ERP)

### CN 14741

| Field | Value |
| :--- | :--- |
| `transaction_items` rows | **0** (also absent from `vw_clean_transactions`) |
| Header | excl −R2,100.00 + tax −R315.00 = **−R2,415.00** |
| TXT | −R2,415.00 on 10/04/2026 |
| Paired invoice 50174 lines | +1×9.1, +2×S.1 |

**Interpretation (derived, flagged):** Header value decomposes to **2×S.1** return only. No 9.1 credit line → **1×9.1 physically short** on DN-22161 until repaid elsewhere.

### CN 15166 / Invoice 51527

| Doc | In DB? | TXT amount | Notes |
| :--- | :---: | ---: | :--- |
| **51527** | **No** | +R3,622.50 (02/07/2026) | 3×S.1 empty invoice |
| **15166** | **No** | −R2,415.00 (03/07/2026) | Partial CN — no header, no lines |

**DB coverage boundary:** last `transaction_headers` / `transaction_items` date = **2026-06-25**. Jul-2026 empties (51527, 15166, 51790, 15254) exist on TXT only.

15166 DB header R0.00 from v1 was **doc absent**, not void/unposted.

---

## Step 3 — Custody restatement (three bases)

Deposit loads: 9.1 = R517.50 · S.1/D.1 = R1,207.50 · D.1 same price as S.1.

### Basis (a) — `transaction_items` lines only (DB through 2026-06-25)

| SKU | Net qty | Value |
| :--- | ---: | ---: |
| 9.1 | 0 | R0.00 |
| S.1 | 0 | R0.00 |
| D.1 | **2** | **R2,415.00** |
| **Total** | | **R2,415.00** |

**Merged S.1/D.1 (if operator rules one physical class):** 2 shells · R1,207.50 = **R2,415.00** (D.1-only posting from 2025-08-11 cross-return — see operator question below).

### Basis (b) — lines + **DERIVED_FROM_VALUE** row for 14741

| Row | SKU | Qty | Basis |
| :--- | :--- | ---: | :--- |
| 14741 (derived) | S.1 | −2 | Header −R2,415 → 2×S.1 pattern |

| SKU | Net qty | Value |
| :--- | ---: | ---: |
| 9.1 | 0 | R0.00 |
| S.1 | −2 | −R2,415.00 |
| D.1 | 2 | R2,415.00 |
| **Total** | | **R0.00** |

> **Tension (do not silently resolve):** Global lines-only already shows S.1 net 0 before derived row. Adding derived −2 S.1 yields **negative S.1 custody** — likely **double-counting** the financial credit against a ledger that never booked 50174's +2 S.1 as outstanding. Basis (b) is shown for assumption visibility; **pair-level custody** is cleaner (50174/14741 → 1×9.1 short until May-6 repayment).

### Basis (c) — lines + derived 14741 + **TXT-only** 51527/15166

| Row | SKU | Qty | Basis |
| :--- | :--- | ---: | :--- |
| 51527 | S.1 | +3 | TXT-only |
| 15166 | S.1 | −2 | TXT-only |

| SKU | Net qty | Value |
| :--- | ---: | ---: |
| 9.1 | 0 | R0.00 |
| S.1 | −1 | −R1,207.50 |
| D.1 | 2 | R2,415.00 |
| **Total** | | **R1,207.50** |

**Merged S.1/D.1 on basis (c):** 1 net shell at R1,207.50 = **R1,207.50** (if S.1/D.1 merged and TXT pair included).

---

### EX-0015 extinguishment — DN#22222 / 14856

**Question:** After DN#22222 empty-lane cluster (2026-05-06), is net 9.1 custody zero — i.e. is EX-0015 physically extinguished?

**Answer: Yes** (on basis a, DB lines through cutoff).

**9.1 arithmetic from 50174 (2026-04-10):**

| Date | Doc | Event | Δ9.1 | Run |
| :--- | :--- | :--- | ---: | ---: |
| 2026-04-10 | 50174 | Invoice out | +1 | **1** ← EX-0015 short arises |
| 2026-05-06 | 50519 | Invoice out | +1 | 2 |
| 2026-05-06 | 14850 | CN return | −1 | 1 |
| 2026-05-06 | 50529 | Invoice out | +1 | 2 |
| 2026-05-06 | **14856** | CN return | **−3** | **−1** |
| 2026-05-13 | 50658 | Invoice out | +1 | 0 |
| … | … | subsequent pairs | … | **0** |

May-6 empty lane: **4×9.1 in** (14850+14856) vs **2×9.1 out** (50519+50529) → **net −2** that day. The extra **−1×9.1** after 14856 (run −1) is consistent with **14856 repaying the 50174 float** plus same-day over-return. Closing run **9.1 = 0**.

**14856** is the likely physical companion to the line-less 14741 short — not a separate missing CN doc.

---

## Step 4 — Registry v10 (STAGED — see `config/cyl_residual_registry_v10_proposed.json`)

**Not applied.** `payment_pattern_overrides.json` v9 remains live.

| Metric | v9 (live) | v10 (proposed, qty-only) |
| :--- | ---: | ---: |
| Residual entries | 16 × PARTIAL_EMPTY @ R517.50 | 4 outstanding + 11 superseded |
| **Rand total** | **R8,280.00** | **R4,140.00** |

See **Registry diff** section at end of this file.

---

## Step 5 — TXT empty-lane netting test

**Scope:** All Invoice + Crd Note rows on `MOZ002CURRENT.TXT` where description matches `EMPTY|EMPT` (108 documents).

### Result: **−R1,207.50** (not R0.00)

**⛔ STOP — LPG bridge not touched.** Non-zero empty-lane net reopens the forgiveness question; no bridge adjustment applied.

### Residual DN clusters (TXT value net ≠ 0) — 16 clusters

| DN cluster | TXT net | Composition |
| :--- | ---: | :--- |
| DN#22538=EMPTY | **+R1,207.50** | 51527 +R3,622.50 · 15166 −R2,415.00 |
| DN#12349-EMPTY | +R1,207.50 | 12872 partial |
| DN20893 EMPTY | +R1,207.50 | 14007 partial |
| DN-22161-EMPTY | +R517.50 | 50174 +R2,932.50 · 14741 −R2,415.00 |
| DN#12106-EMPTY | +R517.50 | 12535 partial (9.1 short) |
| DN#13232-EMPTY | +R517.50 | 43082 orphan invoice |
| … | ±517.50 / ±1,207.50 | 10 further offsetting partial clusters |
| DN#22810=EMPTY | −R1,207.50 | 51790 +R4,140 · 15254 −R5,347.50 |
| DN#22662=EMPTY | −R1,207.50 | 51432 +R2,932.50 · 15128 −R4,140 |
| DN#22222-EMPTY | −R1,035.00 | May-6 correction cluster |
| DN#21716-EMPTY | −R1,725.00 | 14113 double-return |
| DN#20515-EMPTY | −R1,207.50 | 13251 vs 45721 mismatch |

**Aggregate of all 108 empty-lane TXT docs: −R1,207.50.**

### Forgiveness test (operator question — not concluded)

| Test | Result |
| :--- | :--- |
| Does empty lane sum to R0.00 on TXT including 50174/14741/51527? | **No — net −R1,207.50** |
| Implied LPG bridge impact | **Do not adjust** until operator resolves value-side tension (shorts credited at full invoice value on TXT while physical custody persists) |

**Defined follow-up test:** Reconcile the −R1,207.50 as (i) sum of **outstanding qty-short clusters** at loaded deposit values vs (ii) genuine AR mismatch — the three +R1,207.50 clusters (12872, 14007, 22538) minus three −R1,207.50 clusters (22662, 22810, 20515) may net mechanically.

---

## A. Corrected movement ledger (186 lines)

| Date | Doc | Type | DN ref | SKU | Unit excl | Qty out | Qty in | Line value | Run qty | Run value |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fri, 14 Mar 2025 | 41504 | Invoice | DN#4438-EMPTY | 19.1 | R600,00 | 1 |  | R690,00 | 1 | R690,00 |
| Fri, 14 Mar 2025 | 12075 | Crd Note | DN#4438-EMPTY | 19.1 | R600,00 |  | 1 | -R690,00 | 0 | R0,00 |
| Fri, 14 Mar 2025 | 41523 | Invoice | DN#4438-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri, 14 Mar 2025 | 41504 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Fri, 14 Mar 2025 | 12075 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Fri, 14 Mar 2025 | 41523 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Sun, 16 Mar 2025 | 12080 | Crd Note | DN#4438-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 16 Mar 2025 | 41535 | Invoice | DN#4438-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 16 Mar 2025 | 12082 | Crd Note | DN#4438-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 16 Mar 2025 | 12080 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Sun, 16 Mar 2025 | 41535 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Sun, 16 Mar 2025 | 12081 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 24 Mar 2025 | 41713 | Invoice | DN#12977-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Mon, 24 Mar 2025 | 12123 | Crd Note | DN#12977-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Mon, 24 Mar 2025 | 41713 | Invoice | DN#12977-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon, 24 Mar 2025 | 12123 | Crd Note | DN#12977-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 31 Mar 2025 | 41895 | Invoice | DN#12836-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Tue, 01 Apr 2025 | 12174 | Crd Note | DN#12836-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Tue, 15 Apr 2025 | 42307 | Invoice | DN#13072-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Tue, 15 Apr 2025 | 42307 | Invoice | DN#13072-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Wed, 16 Apr 2025 | 12296 | Crd Note | DN#13072-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Wed, 16 Apr 2025 | 12296 | Crd Note | DN#13072-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 0 | R0,00 |
| Mon, 28 Apr 2025 | 42613 | Invoice | DN#13110-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon, 28 Apr 2025 | 12369 | Crd Note | DN#13110-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 05 May 2025 | 42844 | Invoice | DN#12058-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Mon, 05 May 2025 | 12423 | Crd Note | DN#12058-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Mon, 05 May 2025 | 42844 | Invoice | DN#12058-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon, 05 May 2025 | 12423 | Crd Note | DN#12058-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 12 May 2025 | 43007 | Invoice | DN#12076-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon, 12 May 2025 | 12468 | Crd Note | DN#12076-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Wed, 14 May 2025 | 43082 | Invoice | DN#13232-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Tue, 20 May 2025 | 43246 | Invoice | DN#12106-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Tue, 20 May 2025 | 43246 | Invoice | DN#12106-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Wed, 21 May 2025 | 12535 | Crd Note | DN#12106-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Wed, 28 May 2025 | 43462 | Invoice | DN#12137-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Thu, 29 May 2025 | 12599 | Crd Note | DN#12137-EMPTY | 9.1 | R450,00 |  | 2 | -R1 035,00 | 0 | R0,00 |
| Thu, 29 May 2025 | 12599 | Crd Note | DN#12137-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Wed, 04 Jun 2025 | 43649 | Invoice | DN#12149-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Thu, 05 Jun 2025 | 43669 | Invoice | DN#12149-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 05 Jun 2025 | 12640 | Crd Note | DN#12149-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Thu, 05 Jun 2025 | 12639 | Crd Note | DN#12149-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Thu, 05 Jun 2025 | 43669 | Invoice | DN#12149-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Thu, 05 Jun 2025 | 12640 | Crd Note | DN#12149-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Wed, 11 Jun 2025 | 43859 | Invoice | DN#12560-E,MPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Wed, 11 Jun 2025 | 12710 | Crd Note | DN#12560-E,MPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Wed, 18 Jun 2025 | 44063 | Invoice | DN#12412-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 18 Jun 2025 | 12763 | Crd Note | DN#12412-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Wed, 18 Jun 2025 | 44063 | Invoice | DN#12412-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Wed, 18 Jun 2025 | 12763 | Crd Note | DN#12412-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 23 Jun 2025 | 44201 | Invoice | DN#12325-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Tue, 24 Jun 2025 | 12812 | Crd Note | DN#12325-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Mon, 30 Jun 2025 | 44404 | Invoice | DN#12349-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Mon, 30 Jun 2025 | 12872 | Crd Note | DN#12349-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Thu, 10 Jul 2025 | 44743 | Invoice | DN#12686-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 10 Jul 2025 | 44743 | Invoice | DN#12686-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Fri, 11 Jul 2025 | 12962 | Crd Note | DN#12686-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Fri, 11 Jul 2025 | 12962 | Crd Note | DN#12686-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Thu, 17 Jul 2025 | 44950 | Invoice | DN#12649-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 17 Jul 2025 | 44950 | Invoice | DN#12649-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Fri, 18 Jul 2025 | 13020 | Crd Note | DN#12649-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Fri, 18 Jul 2025 | 13020 | Crd Note | DN#12649-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Sun, 27 Jul 2025 | 45200 | Invoice | DN20020. | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 27 Jul 2025 | 45200 | Invoice | DN20020. | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Mon, 28 Jul 2025 | 13069 | Crd Note | DN20020. | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Mon, 28 Jul 2025 | 13069 | Crd Note | DN20020. | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Thu, 31 Jul 2025 | 45304 | Invoice | DN #20126- EMPTIES | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 31 Jul 2025 | 13102 | Crd Note | DN #20126- EMPTIES | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Thu, 31 Jul 2025 | 45304 | Invoice | DN #20126- EMPTIES | S.1 | R1 050,00 | 1 |  | R1 207,50 | 2 | R2 415,00 |
| Thu, 31 Jul 2025 | 13102 | Crd Note | DN #20126- EMPTIES | S.1 | R1 050,00 |  | 1 | -R1 207,50 | 1 | R1 207,50 |
| Wed, 06 Aug 2025 | 45489 | Invoice | DN#20072-- EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Thu, 07 Aug 2025 | 13165 | Crd Note | DN#20072-- EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Sun, 10 Aug 2025 | 45578 | Invoice | DN#20306-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 10 Aug 2025 | 13194 | Crd Note | DN#20306-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 10 Aug 2025 | 45578 | Invoice | DN#20306-EMPTY | D.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Sun, 10 Aug 2025 | 13194 | Crd Note | DN#20306-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -1 | -R1 207,50 |
| Sun, 17 Aug 2025 | 45721 | Invoice | DN#20515-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 17 Aug 2025 | 13251 | Crd Note | DN#20515-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 17 Aug 2025 | 45721 | Invoice | DN#20515-EMPTY | S.1 | R1 050,00 | 1 |  | R1 207,50 | 0 | R0,00 |
| Sun, 17 Aug 2025 | 13251 | Crd Note | DN#20515-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Sun, 24 Aug 2025 | 45873 | Invoice | DN#20439-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 24 Aug 2025 | 13301 | Crd Note | DN#20439-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 24 Aug 2025 | 45873 | Invoice | DN#20439-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Sun, 24 Aug 2025 | 13301 | Crd Note | DN#20439-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Sun, 31 Aug 2025 | 46051 | Invoice | DN#20566-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Sun, 31 Aug 2025 | 13349 | Crd Note | DN#20566-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Tue, 09 Sept 2025 | 46268 | Invoice | DN#20477-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Tue, 09 Sept 2025 | 13434 | Crd Note | DN#20477-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Tue, 09 Sept 2025 | 46268 | Invoice | DN#20477-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue, 09 Sept 2025 | 13434 | Crd Note | DN#20477-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Sun, 21 Sept 2025 | 46563 | Invoice | DN#21051-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 21 Sept 2025 | 13523 | Crd Note | DN#21051-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 21 Sept 2025 | 46563 | Invoice | DN#21051-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Sun, 21 Sept 2025 | 13523 | Crd Note | DN#21051-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Thu, 25 Sept 2025 | 46670 | Invoice | DN#20277-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 25 Sept 2025 | 13552 | Crd Note | DN#20277-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Thu, 25 Sept 2025 | 46670 | Invoice | DN#20277-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Thu, 25 Sept 2025 | 13552 | Crd Note | DN#20277-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Tue, 30 Sept 2025 | 46826 | Invoice | DN#21092-EPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Thu, 02 Oct 2025 | 13602 | Crd Note | DN#21092-EPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Wed, 08 Oct 2025 | 46981 | Invoice | DN#20704-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 08 Oct 2025 | 13651 | Crd Note | DN#20704-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Wed, 08 Oct 2025 | 46981 | Invoice | DN#20704-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Wed, 08 Oct 2025 | 13651 | Crd Note | DN#20704-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Fri, 17 Oct 2025 | 47171 | Invoice | DN#21109-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri, 17 Oct 2025 | 13710 | Crd Note | DN#21109-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Fri, 17 Oct 2025 | 47171 | Invoice | DN#21109-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Fri, 17 Oct 2025 | 13710 | Crd Note | DN#21109-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 29 Oct 2025 | 47402 | Invoice | DN#20767-EMPTY | 9.1 | R450,00 | 2 |  | R1 035,00 | 2 | R1 035,00 |
| Wed, 29 Oct 2025 | 13771 | Crd Note | DN#20767-EMPTY | 9.1 | R450,00 |  | 2 | -R1 035,00 | 0 | R0,00 |
| Wed, 29 Oct 2025 | 47402 | Invoice | DN#20767-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Wed, 29 Oct 2025 | 13771 | Crd Note | DN#20767-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Sun, 09 Nov 2025 | 47590 | Invoice | DN#20815-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 09 Nov 2025 | 47590 | Invoice | DN#20815-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Mon, 10 Nov 2025 | 13838 | Crd Note | DN#20815-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Fri, 21 Nov 2025 | 47858 | Invoice | DN#20859-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Fri, 21 Nov 2025 | 13931 | Crd Note | DN#20859-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Thu, 27 Nov 2025 | 47980 | Invoice | DN#20691-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Thu, 27 Nov 2025 | 13974 | Crd Note | DN#20691-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 1 | R517,50 |
| Thu, 27 Nov 2025 | 47980 | Invoice | DN#20691-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Thu, 27 Nov 2025 | 13974 | Crd Note | DN#20691-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 03 Dec 2025 | 48096 | Invoice | DN20893 EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Wed, 03 Dec 2025 | 14007 | Crd Note | DN20893 EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -1 | -R1 207,50 |
| Wed, 17 Dec 2025 | 48348 | Invoice | DN#21716-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Wed, 17 Dec 2025 | 14113 | Crd Note | DN#21716-EMPTY | 9.1 | R450,00 |  | 2 | -R1 035,00 | 0 | R0,00 |
| Wed, 17 Dec 2025 | 48348 | Invoice | DN#21716-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 2 | R2 415,00 |
| Wed, 17 Dec 2025 | 14113 | Crd Note | DN#21716-EMPTY | S.1 | R1 050,00 |  | 4 | -R4 830,00 | -2 | -R2 415,00 |
| Sun, 04 Jan 2026 | 48614 | Invoice | DN-21449-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 04 Jan 2026 | 14210 | Crd Note | DN-21449-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 04 Jan 2026 | 48614 | Invoice | DN-21449-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Sun, 04 Jan 2026 | 14210 | Crd Note | DN-21449-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 14 Jan 2026 | 48798 | Invoice | DN#21640-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 14 Jan 2026 | 14276 | Crd Note | DN#21640-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Wed, 14 Jan 2026 | 48798 | Invoice | DN#21640-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Wed, 14 Jan 2026 | 14276 | Crd Note | DN#21640-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Sun, 25 Jan 2026 | 48941 | Invoice | DN#21481EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 25 Jan 2026 | 14335 | Crd Note | DN#21481EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 25 Jan 2026 | 48941 | Invoice | DN#21481EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Sun, 25 Jan 2026 | 14335 | Crd Note | DN#21481EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Fri, 06 Feb 2026 | 49144 | Invoice | DN-21528-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri, 06 Feb 2026 | 49144 | Invoice | DN-21528-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Sun, 08 Feb 2026 | 14395 | Crd Note | DN-21528-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 18 Feb 2026 | 49329 | Invoice | DN_21913-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Wed, 18 Feb 2026 | 14458 | Crd Note | DN_21913-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Tue, 03 Mar 2026 | 49551 | Invoice | DN#22112-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Tue, 03 Mar 2026 | 14533 | Crd Note | DN#22112-EMPTY | 9.1 | R450,00 |  | 2 | -R1 035,00 | 0 | R0,00 |
| Tue, 03 Mar 2026 | 49551 | Invoice | DN#22112-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Tue, 03 Mar 2026 | 14533 | Crd Note | DN#22112-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 11 Mar 2026 | 49711 | Invoice | DN#21963-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 11 Mar 2026 | 49711 | Invoice | DN#21963-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Thu, 12 Mar 2026 | 14587 | Crd Note | DN#21963-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Thu, 12 Mar 2026 | 14587 | Crd Note | DN#21963-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | -2 | -R2 415,00 |
| Wed, 25 Mar 2026 | 49934 | Invoice | DN-21985-EMPTY | D.1 | R1 050,00 | 2 |  | R2 415,00 | 4 | R4 830,00 |
| Wed, 25 Mar 2026 | 14666 | Crd Note | DN-21985-EMPTY | D.1 | R1 050,00 |  | 2 | -R2 415,00 | 2 | R2 415,00 |
| Wed, 01 Apr 2026 | 50067 | Invoice | DN-21858-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 01 Apr 2026 | 14705 | Crd Note | DN-21858-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Wed, 01 Apr 2026 | 50067 | Invoice | DN-21858-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Wed, 01 Apr 2026 | 14705 | Crd Note | DN-21858-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | -2 | -R2 415,00 |
| Thu, 09 Apr 2026 | 50174 | Invoice | DN-22161-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu, 09 Apr 2026 | 50174 | Invoice | DN-22161-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Sun, 19 Apr 2026 | 50306 | Invoice | DN-21336-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Sun, 19 Apr 2026 | 14773 | Crd Note | DN-21336-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 0 | R0,00 |
| Tue, 05 May 2026 | 50519 | Invoice | DN#22222-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Tue, 05 May 2026 | 14850 | Crd Note | DN#22222-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 1 | R517,50 |
| Tue, 05 May 2026 | 50529 | Invoice | DN#22222-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Tue, 05 May 2026 | 14856 | Crd Note | DN#22222-EMPTY | 9.1 | R450,00 |  | 3 | -R1 552,50 | -1 | -R517,50 |
| Tue, 05 May 2026 | 50519 | Invoice | DN#22222-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Tue, 05 May 2026 | 14850 | Crd Note | DN#22222-EMPTY | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 0 | R0,00 |
| Tue, 05 May 2026 | 50529 | Invoice | DN#22222-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Tue, 05 May 2026 | 14856 | Crd Note | DN#22222-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 0 | R0,00 |
| Tue, 12 May 2026 | 50658 | Invoice | DN#22385-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Tue, 12 May 2026 | 50658 | Invoice | DN#22385-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Wed, 13 May 2026 | 14904 | Crd Note | DN#22385-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 0 | R0,00 |
| Wed, 27 May 2026 | 50917 | Invoice | DN#22603 | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 27 May 2026 | 14981 | Crd Note | DN#22603 | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Fri, 05 Jun 2026 | 51078 | Invoice |  | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri, 05 Jun 2026 | 15027 | Crd Note | DN# 22786 | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Fri, 05 Jun 2026 | 51078 | Invoice |  | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Fri, 05 Jun 2026 | 15027 | Crd Note | DN# 22786 | S.1 | R1 050,00 |  | 2 | -R2 415,00 | 1 | R1 207,50 |
| Sun, 14 Jun 2026 | 51236 | Invoice | DN#22502-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sun, 14 Jun 2026 | 15072 | Crd Note | DN#22502-EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Sun, 14 Jun 2026 | 51236 | Invoice | DN#22502-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 4 | R4 830,00 |
| Sun, 14 Jun 2026 | 15072 | Crd Note | DN#22502-EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 1 | R1 207,50 |
| Wed, 24 Jun 2026 | 51432 | Invoice | DN#22662=EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed, 24 Jun 2026 | 51432 | Invoice | DN#22662=EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Thu, 25 Jun 2026 | 15128 | Crd Note | DN#22662=EMPTY | 9.1 | R450,00 |  | 1 | -R517,50 | 0 | R0,00 |
| Thu, 25 Jun 2026 | 15128 | Crd Note | DN#22662=EMPTY | S.1 | R1 050,00 |  | 3 | -R3 622,50 | 0 | R0,00 |

### Closing run (basis a)

| SKU | Net qty | Value |
| :--- | ---: | ---: |
| 9.1 | 0 | R0.00 |
| S.1 | 0 | R0.00 |
| D.1 | 2 | R2,415.00 |

---

## Operator decisions returned with this report

1. **S.1 vs D.1 physical class** — identical R1,050 deposit; 2025-08-11 returns S.1 against D.1 invoice. Merge for custody or keep separate?
2. **Registry v10 ratification** — 11 entries superseded; staged diff below. v9 stays live until approved.

---

## Registry diff — v9 vs v10 proposed (one page)

| ID | CN | v9 residual | v10 classification | v10 qty residual | v10 amount |
| :--- | :--- | ---: | :--- | :--- | ---: |
| EX-0001 | 12081 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 (FULL_CLEAR w/ 12082) | R0.00 |
| EX-0002 | 12174 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0003 | 12369 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0004 | 12468 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0005 | 12535 | R517.50 | **QTY_SHORT** | 1×9.1 | **R517.50** |
| EX-0006 | 12639 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 (w/ 12640) | R0.00 |
| EX-0007 | 12710 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0008 | 12812 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0009 | 12872 | R517.50 | **QTY_SHORT** | 1×S.1 | **R1,207.50** |
| EX-0010 | 13165 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0011 | 13602 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0012 | 13931 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0013 | 14007 | R517.50 | **QTY_SHORT** | 1×S.1 | **R1,207.50** |
| EX-0014 | 14666 | R517.50 | **SUPERSEDED_VALUE_INFERRED** | 0 | R0.00 |
| EX-0015 | 14741 | R517.50 | **CLOSED_BY_14856** | 0 (9.1 repaid May-6) | R0.00 |
| EX-0016 | 15166 | R517.50 | **QTY_SHORT (TXT)** | 1×S.1 w/ 51527 | **R1,207.50** |
| EX-0034 | 51527 | R517.50 | **QTY_SHORT (TXT)** | paired w/ 15166 | **R1,207.50** |

| | v9 total | v10 outstanding |
| :--- | ---: | ---: |
| Partial-empty residuals | R8,280.00 | **R4,140.00** |

---

*Turn 7g complete. Read-only against edges, LPG registry, reconState. LPG bridge unchanged (Step 5 non-zero).*
