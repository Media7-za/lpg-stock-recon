# MON001 — AR Reconciliation Workbench

**Debtor:** MON001 — SHORTEN INTERNATIONAL 66 ON MONZALI  
**Session date:** 2026-07-28  
**Operator:** Repository worker (session-led)  
**Companion recon state:** `project.json` **absent** — debtor not onboarded; `reconState` unchanged this session

---

## ERP Statement Generation

| Field | Value |
| :--- | :--- |
| **TXT source** | **MISSING** — no debtor statement TXT in `analysis/debtors/MON001/raw/` |
| **Expected path** | `analysis/debtors/MON001/raw/MON001CURRENT.TXT` (per `config/statement_v5.json`) |
| **Source cutoff date** | Unknown — no TXT manifest |
| **Freshness status** | **FAIL** — ingest gate not evaluable |
| **Ingest coverage** | **BLOCKED** — `npm run debtors:ingest-check -- --debtor MON001` exits: `Missing statement TXT for MON001` |
| **Generated statement** | **NOT GENERATED** — v5 generator not run (TXT + gate prerequisite) |
| **ERP closing balance** | **Not current** — no v5-gated ERP header |
| **ERP variance** | **N/A** — v5 pass gate not reached |
| **Sub-ledger tie variance** | **N/A** — v5 pass gate not reached |
| **Warnings** | Debtor folder created this session; `statement_v5.json` seeded from template with DETRANS-inferred B/F; do not cite balance as current |

### DETRANS fragment reference (informational — not v5-gated)

Reconstructed from `ERP RAW DATA/DETRANS.TXT` + `analysis/debtors/shared/raw/april_dump.TXT` (header-level, LPG lane, deposit pairs net zero):

| Component | Amount | Source |
| :--- | ---: | :--- |
| Inferred opening B/F (pre 06 Mar 2025) | R2,816.83 | Payment 00037379 clears doc 00040628 |
| Open LPG invoices (4 docs) | R8,732.66 | DETRANS/april_dump ERP allocation refs |
| Global aged-debt snapshot (13 Jul 2025) | R3,570.68 | `Global Reports/130720251H45M.TXT` — **stale** |

> **Do not treat R8,732.66 as current.** Fragment reconstruction lacks ERP statement manifest, ingest coverage, and post-Apr-2026 activity confirmation.

---

## Evidence Reviewed

### Available

| Artifact | Path | Role | Freshness |
| :--- | :--- | :--- | :--- |
| DETRANS header extract | `ERP RAW DATA/DETRANS.TXT` | Document-level AR history Mar 2025–Feb 2026 | Partial — not statement-shaped |
| April 2026 dump | `analysis/debtors/shared/raw/april_dump.TXT` | Apr 2026 tail (incl. N-flag docs) | Partial |
| STTRANS line extract | `ERP RAW DATA/STTRANS.TXT` | Line-level SKU/qty for deliveries | Partial |
| Global aged-debt row | `analysis/debtors/Global Reports/130720251H45M.TXT` | Portfolio balance hint R3,570.68 | **13 Jul 2025** — stale |
| v5 config (seeded) | `config/statement_v5.json` | Generator config — **TXT path unresolved** | Created 2026-07-28 |

### Missing (blocks current position)

| Item | Impact |
| :--- | :--- |
| **Debtor statement TXT** (CURRENT year, full manifest + running balance) | Blocks ingest gate, v5 generation, ERP variance R0.00 proof |
| **`project.json`** | No portfolio tracker, ingestGate, or reconState metadata |
| **Same-session DTRX headers + ITEMS** through statement as-at date | Blocks ingest coverage classification |
| **DATABASE_URL / Supabase slice** | DB line split and Part 2 qty unavailable this session |
| **Invoice-level allocation register** | ERP pays by ref_no only; no ratified allocation lane |
| **Physical cylinder yard audit** | Custody not independently verified |

---

## Open Invoice Review

> **Doctrine note:** MON001 uses **ERP ref_no payment allocation** (STAT transfers applied to invoice doc). Open status below reflects **unpaid LPG invoices** per DETRANS `refdoc` linkage. Deposit invoices (`-EMPTY`) paired with same-day CNs — net zero; excluded from open LPG list.

| Date | Doc # | Original value | Allocated | Outstanding | Evidence basis | Status |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
| 09/10/2025 | 46978 | R2,500.38 | R0.00 | R2,500.38 | DETRANS — no payment ref | **PARTIAL** |
| 26/02/2026 | 49460 | R2,508.01 | R0.00 | R2,508.01 | DETRANS — no payment ref | **PARTIAL** |
| 02/04/2026 | 50097 | R2,615.10 | R1,706.03 | R909.07 | april_dump — CN 14792 FAULTY RETURN | **PARTIAL** — N-flag doc |
| 24/04/2026 | 50363 | R2,815.20 | R0.00 | R2,815.20 | april_dump — no payment ref | **PARTIAL** — N-flag doc |

**Summary:** Four open LPG documents; aggregate **R8,732.66** per DETRANS fragment. Not v5-gated; post-Apr-2026 activity may exist outside dump.

### Cleared invoices (period sample — paid per ERP ref)

| Date | Doc # | Original value | Payment doc | Evidence basis | Status |
| :--- | :--- | ---: | :--- | :--- | :--- |
| 07/04/2025 | 42053 | R2,751.58 | 38126 | DETRANS STAT 113 | **PARTIAL** |
| 14/04/2025 | 42251 | R2,751.58 | 38667 | DETRANS STAT 114 | **PARTIAL** |
| 09/06/2025 | 43719 | R5,579.98 | 40111 | DETRANS STAT 116 | **PARTIAL** |
| 08/07/2025 | 44648 | R2,668.48 | 41246 | DETRANS STAT 118 | **PARTIAL** |
| 25/08/2025 | 45879 | R2,611.08 | 40894 | DETRANS STAT 117 | **PARTIAL** |
| 26/08/2025 | 45915 | R2,611.08 | 40894 | DETRANS STAT 117 | **PARTIAL** |
| 10/11/2025 | 47587 | R2,452.38 | 42302 | DETRANS STAT 120 | **PARTIAL** |
| 30/12/2025 | 48540 | R2,464.52 | 43248 | DETRANS STAT 123 | **PARTIAL** |
| 02/04/2026 | 50072 | R2,527.19 | 43928 | april_dump STAT 125 | **PARTIAL** |

---

## Payment and Credit Review

### Payments (Mar 2025–Apr 2026)

| Date | Doc # | Amount | Allocated | Unapplied | Evidence basis | Status |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
| 06/03/2025 | 37379 | R2,816.83 | R2,816.83 | R0.00 | DETRANS STAT 112 → 40628 (B/F clear) | **PARTIAL** |
| 14/04/2025 | 38126 | R2,751.58 | R2,751.58 | R0.00 | DETRANS STAT 113 → 42053 | **PARTIAL** |
| 13/05/2025 | 38667 | R2,751.58 | R2,751.58 | R0.00 | DETRANS STAT 114 → 42251 | **PARTIAL** |
| 07/07/2025 | 40111 | R5,579.98 | R5,579.98 | R0.00 | DETRANS STAT 116 → 43719 | **PARTIAL** |
| 29/08/2025 | 40894 | R2,611.08 | R2,611.08 | R0.00 | DETRANS STAT 117 → 45879 | **PARTIAL** |
| 29/08/2025 | 40894 | R2,611.08 | R2,611.08 | R0.00 | DETRANS STAT 117 → 45915 | **PARTIAL** |
| 17/09/2025 | 41246 | R2,668.48 | R2,668.48 | R0.00 | DETRANS STAT 118 → 44648 | **PARTIAL** |
| 19/11/2025 | 42302 | R2,452.38 | R2,452.38 | R0.00 | DETRANS STAT 120 → 47587 | **PARTIAL** |
| 03/02/2026 | 43248 | R2,464.52 | R2,464.52 | R0.00 | DETRANS STAT 123 → 48540 | **PARTIAL** |
| 08/04/2026 | 43928 | R2,527.19 | R2,527.19 | R0.00 | april_dump STAT 125 → 50072 | **PARTIAL** |

**Summary:** Ten payment rows observed; all show ERP invoice ref allocation. **No unapplied payment balance** identified in available extracts.

### Credit notes (non-EMPTY — financial)

| Date | Doc # | Amount | Target | Unapplied | Evidence basis | Status |
| :--- | :--- | ---: | :--- | ---: | :--- | :--- |
| 16/04/2026 | 14792 | R1,706.03 | 50097 (FAULTY RETURN) | R0.00 (partial) | april_dump | **PARTIAL** — N-flag |

Operational EMPTY-pair CNs (same-day deposit reversals) net zero — listed under allocation exceptions, not unapplied credits.

---

## Allocation Exceptions

| Exception type | Finding |
| :--- | :--- |
| **Unmatched payments** | None identified in DETRANS/april_dump extracts |
| **Unapplied credits** | None standalone — CN 14792 partially applied to inv 50097 |
| **Disputed allocations** | None identified |
| **Duplicate documents** | Payment 40894 appears twice (split allocation to 45879 + 45915) — **expected** ERP behaviour |
| **Missing documents** | **ERP statement TXT missing**; `project.json` absent; post-Apr-2026 activity unknown |
| **Unsupported adjustments** | Inferred B/F R2,816.83 not TXT-confirmed |
| **N-flag documents** | Inv 50097, CN 14792, Inv 50363 in april_dump flagged `"N"` — may not be in Supabase ingest |

**Ratification:** No proposed allocations ratified this session.

---

## Financial Reconciliation

| Line | Value | Source evidence | Basis status | Operator approval required |
| :--- | ---: | :--- | :--- | :---: |
| ERP combined (v5-gated) | Unknown | — | **UNPROVEN** | Yes |
| DETRANS fragment closing (LPG open) | R8,732.66 | DETRANS + april_dump | **PARTIAL** — not TXT-gated | Yes |
| Global aged-debt (Jul 2025) | R3,570.68 | `130720251H45M.TXT` | **STALE** | Yes — superseded |
| Inferred opening B/F | R2,816.83 | Payment 37379 / doc 40628 | **PARTIAL** | Yes — confirm from TXT |

**Evidence-backed position (best available, not current):** Open LPG **R8,732.66** across four documents as at last row in april_dump (**24 Apr 2026**). Not v5-gated.

---

## Cylinder-Custody Review

**Separate from financial settlement.** Standard delivery pattern: deposit invoice (`-EMPTY`) + same-day CN → **net zero** financial and custody for paired rows (Mar 2025–Feb 2026 sample verified in DETRANS).

### Exception — extra cylinder invoice

| Date | Doc | Detail | Custody implication |
| :--- | :--- | :--- | :--- |
| 02/04/2026 | 50097 | DN#21861- EXTRA SV — R2,615.10 | Extra 48kg SV cylinder charge beyond standard pair |
| 16/04/2026 | 14792 | FAULTY RETURN CN — R1,706.03 | Partial credit; **residual R909.07** financial; cylinder disposition unclear |

**Net custody (standard pairs):** **0 shells** outstanding from paired deposit/CN cycles in available extract.

**Exception qty:** **UNPROVEN** — inv 50097 may indicate 1× extra S.1 cylinder; partial CN suggests faulty unit returned but not fully credited. Requires operator + yard confirmation.

**Evidence basis:** DETRANS/STTRANS line pattern (no DB Part 2 qty — DATABASE_URL unavailable).  
**Status:** **PARTIAL**

---

## Suspense and Evidence Gaps

1. **No ERP statement TXT** — cannot prove current combined balance or run v5.
2. **No `project.json`** — debtor not onboarded in portfolio tracker.
3. **DATABASE_URL unavailable** — Supabase line split and Part 2 qty blocked.
4. **N-flag Apr 2026 docs** (50097, 14792, 50363) — ingest/sync status unknown.
5. **Post-Apr 2026 activity unknown** — balance may have moved.
6. **Global report R3,570.68 (Jul 2025)** inconsistent with DETRANS reconstruction at same era — do not reconcile without TXT.
7. **Invoice 45915** — blank DN ref in DETRANS; paid via STAT 117; no separate custody concern identified.

---

## Five Operational Answers

### 1. What is the current balance?

**Answer:** **Unknown (not current).** Best fragment reconstruction: **R8,732.66** open LPG across four invoices as at **24 Apr 2026** (april_dump tail). Stale global hint: **R3,570.68** (13 Jul 2025).

**Evidence basis:** DETRANS, april_dump, global aged-debt row

**Status:** **UNPROVEN**

**Blocker:** Missing ERP statement TXT; no v5 pass gate

**Operator decision required:** Upload fresh ERP TXT and confirm whether fragment reconstruction matches ERP header

---

### 2. Which invoices remain open?

**Answer:** Four LPG invoices — **46978** (R2,500.38), **49460** (R2,508.01), **50097** (R909.07 net after CN 14792), **50363** (R2,815.20). Total **R8,732.66**.

**Evidence basis:** DETRANS/april_dump ERP payment ref linkage

**Status:** **PARTIAL**

**Blocker:** No TXT manifest; N-flag docs may not be ingested; post-Apr 2026 unknown

**Operator decision required:** Confirm open list against ERP statement TXT

---

### 3. Which payments or credits remain unapplied?

**Answer:** **None identified** in available extracts. All ten payments show invoice-level ERP allocation. CN 14792 partially applied to inv 50097 (residual R909.07 on invoice, not floating credit).

**Evidence basis:** DETRANS/april_dump payment rows

**Status:** **PARTIAL**

**Blocker:** Fragment only; no UD payment / on-account sweep proof

**Operator decision required:** Confirm no orphan UD payments in current ERP

---

### 4. Which cylinders remain outstanding?

**Answer:** Standard `-EMPTY`/CN pairs net **0** custody from available history. **Exception:** inv **50097** (EXTRA SV) + CN **14792** (FAULTY RETURN) — possible **1× 48kg SV** custody matter unresolved; financial residual R909.07.

**Evidence basis:** DETRANS deposit/CN pairing; april_dump exception docs

**Status:** **PARTIAL**

**Blocker:** No DB Part 2 qty; no physical yard audit

**Operator decision required:** Confirm cylinder count vs inv 50097 / CN 14792 disposition

---

### 5. What evidence, decision or action is still pending?

**Answer:**
- Upload **MON001 ERP statement TXT** to `raw/MON001CURRENT.TXT`
- Create **`project.json`** (operator onboarding)
- Run ingest check + v5 generator (target: ERP variance R0.00, sub-ledger tie R0.00)
- Confirm **N-flag** Apr 2026 docs in Supabase ingest
- Resolve **50097 / 14792** extra-cylinder exception
- Confirm no post-Apr 2026 activity

**Evidence basis:** Session gap analysis

**Status:** **UNPROVEN** (position not current)

**Blocker:** Missing Tier-3 ERP TXT

**Operator decision required:** **Yes** — all items above

---

## Session Outcome

```text
Session status: COMPLETE
Reconciliation status: UNPROVEN
```

`COMPLETE` = available work processed (gate attempted, evidence inventoried, workbench recorded, config seeded).  
Does **not** mean debtor position proven.  
`reconState`: **unchanged** — no `project.json` present.

---

## Operator Decisions Required

1. Provide **MON001 ERP statement TXT** to `raw/MON001CURRENT.TXT` (or update `txtPath` in config).
2. Create **`project.json`** for portfolio onboarding.
3. Confirm **open invoice list** (46978, 49460, 50097 net, 50363) against ERP.
4. Resolve **50097 EXTRA SV / CN 14792 FAULTY RETURN** — cylinder + financial.
5. Sync **N-flag** Apr 2026 documents to Supabase and re-run ingest gate.

**Next action:** Operator uploads ERP statement TXT + DTRX; re-run `npm run debtors:ingest-check -- --debtor MON001` then `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor MON001`.
