# TAN001 — AR Reconciliation Workbench

**Debtor:** TAN001 — Tanya Lehman  
**Session date:** 2026-07-27  
**Operator:** Repository worker (session-led)  
**Companion recon state:** `project.json` → `reconState: complete` (unchanged this session)

---

## ERP Statement Generation

| Field | Value |
| :--- | :--- |
| **TXT source** | **MISSING** — no debtor statement TXT in `analysis/debtors/TAN001/raw/` |
| **Expected path** | `analysis/debtors/TAN001/raw/TAN001CURRENT.TXT` (per `config/statement_v5.json`) |
| **Source cutoff date** | Unknown — no TXT manifest |
| **Freshness status** | **FAIL** — ingest gate not evaluable |
| **Ingest coverage** | **BLOCKED** — `npm run debtors:ingest-check -- --debtor TAN001` exits: `Missing statement TXT for TAN001` |
| **Generated statement** | **NOT GENERATED** — v5 generator not run (TXT + gate prerequisite) |
| **ERP closing balance** | **Not current** — last authoritative ERP header in v4 disclosure: **R99,374.75** (Jun 2026 era); global aged-debt snapshot (13 Jul 2025): **R91,392.10** — neither is v5-gated |
| **ERP variance** | **N/A** — v5 pass gate not reached |
| **Sub-ledger tie variance** | **N/A** — v5 pass gate not reached |
| **Warnings** | No ERP statement TXT; v5 config seeded from template + v4 baseline pending operator TXT upload; do not cite balance as current |

### v4 reference position (informational — not v5-gated)

| Component | Amount | Source |
| :--- | ---: | :--- |
| LPG gas debt | R97,146.68 | `TAN001_Statement_Account_v4.md` |
| Cylinder financial | R-862.50 | `TAN001_Statement_Account_v4.md` |
| **Reconstructed total** | **R96,284.18** | DB line reconstruction (Jun 2026 cutoff) |
| ERP stated balance | R99,374.75 | v4 disclosure |
| ERP vs reconstructed variance | R3,090.57 | Header-layer / CN treatment (disclosed in v4) |

---

## Evidence Reviewed

### Available

| Artifact | Path | Role | Freshness |
| :--- | :--- | :--- | :--- |
| v4 statement (internal) | `reports/TAN001_Statement_Account_v4.md` | DB-reconstructed running ledger Jan–Jun 2026 | Jun 2026 cutoff |
| v4 baseline | `reports/TAN001_BASELINE_v4.md` | Opening balances, cylinder qty, variance analysis | Jun 2026 |
| v4 HTML exports | `reports/TAN001_Statement_Account_v4*.html` | Customer / internal views | Jun 2026 |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/TAN001.v4.json` | UI projection (`workspaceStatus: erp_exception`) | May 2026 era |
| Project tracker | `project.json` | Collections / recon metadata | `totalOutstanding: 96284.18` |
| Global aged-debt row | `Global Reports/130720251H45M.TXT` | Portfolio balance hint | **13 Jul 2025** — stale |
| DTRX fragments | `ERP RAW DATA/CURRENT.TXT`, `DETRANS.TXT`, `shared/raw/april_dump.TXT` | Line-level history — not statement manifest | Partial / not statement-shaped |
| v5 config (seeded) | `config/statement_v5.json` | Generator config — **TXT path unresolved** | Created 2026-07-27 |

### Missing (blocks current position)

| Item | Impact |
| :--- | :--- |
| **Debtor statement TXT** (CURRENT year, full manifest + running balance) | Blocks ingest gate, v5 generation, ERP variance R0.00 proof |
| **Same-session DTRX headers + ITEMS** through statement as-at date | Blocks ingest coverage classification |
| **Post-Jun 2026 ERP activity** | Balance may have moved since v4 cutoff |
| **Invoice-level allocation register** | Cannot prove per-invoice open/allocated without allocation lane |
| **LOD / collections correspondence** | `draft_lod` overdue (H-009); no `dateSent` |

---

## Open Invoice Review

> **Doctrine note:** TAN001 v4 uses **running-balance pool settlement**, not invoice-level allocation proofs. Per-invoice allocated/outstanding below reflects **pool status**, not ratified allocation.

### Pre-2026 aged exposure (bulk)

| Date | Original value | Allocated | Outstanding | Evidence basis | Status |
| :--- | ---: | ---: | ---: | :--- | :--- |
| Pre–1 Jan 2026 | R66,565.10 (LPG B/F) | Unknown (pool) | R66,565.10 | `SYSTEM_MIGRATION_CARRIED` — v4 baseline | **PARTIAL** — bulk aged; 180+ bucket R66,565.10 |

### Period 2026 invoices (Jan–Jun) — net open contribution

Period net LPG invoiced (after credits): **R68,081.58**. Period payments: **R37,500.00**. Net period increase to debt: **R30,581.58**. Individual invoices are not invoice-allocated; cumulative running balance at **30 Jun 2026: R96,284.18**.

| Date | Doc # | Original value | Allocated | Outstanding | Evidence basis | Status |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
| 01 Jun 2026 | 50973 | R4,035.26 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** — latest period invoice |
| 25 May 2026 | 50851 | R4,035.26 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 18 May 2026 | 50755 | R4,353.83 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 12 May 2026 | 50637 | R3,398.11 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 06 May 2026 | 50538 | R3,811.09 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 06 May 2026 | 50539 | R3,967.50 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 30 Apr 2026 | 50415 | R1,766.11 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 30 Apr 2026 | 50416 | R1,725.00 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 24 Apr 2026 | 50380 | R3,532.22 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 18 Apr 2026 | 50280 | R557.73 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 18 Apr 2026 | 50326 | R1,035.00 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 16 Apr 2026 | 50252 | R2,974.50 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 16 Apr 2026 | 50253 | R2,415.00 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 02 Apr 2026 | 50055 | R5,372.98 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| 02 Apr 2026 | 50056 | R4,830.00 | Pool-applied | Unknown | v4 running ledger | **PARTIAL** |
| *…remaining Jan–Mar 2026 invoices in v4 statement…* | | | | | v4 running ledger | **PARTIAL** |

**Summary:** Total reconstructed balance **R96,284.18** represents aggregate open AR. Invoice-level allocation is **UNPROVEN**.

---

## Payment and Credit Review

### Payments (period Jan–Jun 2026)

| Date | Doc # | Amount | Allocated | Unapplied | Evidence basis | Status |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
| 01 Jun 2026 | 00044460 | R2,000.00 | R2,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** — pool, not invoice-matched |
| 22 May 2026 | 00044381 | R3,500.00 | R3,500.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 07 May 2026 | 00044224 | R3,000.00 | R3,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 13 Apr 2026 | 00043976 | R5,000.00 | R5,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 12 Mar 2026 | 00043620 | R3,000.00 | R3,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 23 Feb 2026 | 00043432 | R3,000.00 | R3,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 10 Feb 2026 | 00043319 | R3,000.00 | R3,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 02 Feb 2026 | 00043228 | R3,000.00 | R3,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 21 Jan 2026 | 00043069 | R2,000.00 | R2,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 14 Jan 2026 | 00042988 | R5,000.00 | R5,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |
| 05 Jan 2026 | 00042860 | R5,000.00 | R5,000.00 (pool) | R0.00 | v4 running ledger | **PARTIAL** |

**Period payment total:** R37,500.00. No unapplied payment balance identified in v4 reconstruction.

### Credit notes (period sample — operational CYL pairs stripped in Part 1 view)

Period credits net **R3,190.21** (LPG gas credits per v4 monthly register). Credit notes are paired with deposit invoices in CYL ledger; financial effect embedded in running balance. No standalone unapplied credit balance identified.

---

## Allocation Exceptions

| Exception type | Finding |
| :--- | :--- |
| **Unmatched payments** | None identified at document level — all payments absorbed into running balance pool |
| **Unapplied credits** | None identified |
| **Disputed allocations** | ERP header double-taxation on inv 11632 / CN 14337 (historical, R1,764.08) — disclosed v4 |
| **Duplicate documents** | None identified in v4 period |
| **Missing documents** | **ERP statement TXT missing**; possible post-Jun 2026 activity not in DB slice |
| **Unsupported adjustments** | ERP vs reconstructed variance **R3,090.57** — partially explained by header bugs + 2026 CN polarity treatment (v4 disclosure) |

**Ratification:** No proposed allocations ratified this session.

---

## Financial Reconciliation

| Line | Value | Source evidence | Basis status | Operator approval required |
| :--- | ---: | :--- | :--- | :---: |
| ERP combined (v4 era) | R99,374.75 | v4 internal disclosure | **PARTIAL** — not TXT-gated | Yes — confirm current ERP header |
| DB reconstructed (Jun 2026) | R96,284.18 | `vw_clean_transactions` / v4 | **PARTIAL** — Jun cutoff | Yes — confirm still current |
| Header-layer adjustment (historical) | R1,764.08 | Invoices 11632, CN 14337 double-tax | **PARTIAL** — disclosed | Yes |
| 2026 CN polarity (do not apply historical correction) | R3,060.00 potential | v4 audit note | **PARTIAL** — doctrine decision | Yes |
| **Unexplained ERP variance remainder** | ~R266.49 | R3,090.57 − R1,764.08 − partial CN | **UNPROVEN** | Yes |
| LPG sub-ledger (v4) | R97,146.68 | v4 Part 1 | **PARTIAL** | No (pending v5) |
| CYL financial (v4) | R-862.50 | v4 Part 1 | **PARTIAL** | No (pending v5) |

**Evidence-backed position (best available, not current):** **R96,284.18** as at **30 Jun 2026** per v4 reconstruction.

---

## Cylinder-Custody Review

**Separate from financial settlement.** Financial cylinder balance **R-862.50** vs custody exposure **R1,667.50** → variance **R-2,530.00** (legacy rate shifts — v4 baseline).

### Net returnable qty (30 Jun 2026 — v4 Part 2)

| SKU | Qty | Deposit rate | Custody exposure |
| :--- | ---: | ---: | ---: |
| 19.1 (19kg) | -4 | R690.00 | R-2,760.00 |
| 9.1 (9kg) | 13 | R517.50 | R6,727.50 |
| D.1 (48kg DV) | 2 | R1,150.00 | R2,300.00 |
| S.1 (48kg SV) | -4 | R1,150.00 | R-4,600.00 |
| **Total** | **7 net units** | — | **R1,667.50** |

**Evidence basis:** v4 cylinder ledger (DB line qty). **Status:** **PARTIAL** — no physical yard confirmation; ingest gate blocked for Part 2 refresh.

**Operator note:** Negative qty on 19.1 and S.1 indicates customer holds fewer than ledger expects (or over-returned). Positive 9.1 and D.1 indicate cylinders owed by customer.

---

## Suspense and Evidence Gaps

1. **No ERP statement TXT** — cannot prove current combined balance or run v5.
2. **Post-Jun 2026 activity unknown** — balance may have changed.
3. **Invoice-level open/allocated** — pool model only; allocation lane not run.
4. **ERP R3,090.57 variance** — partially explained; remainder unresolved.
5. **Cylinder financial vs custody R-2,530.00** — legacy pricing; not resolved.
6. **Collections D17 gate** — `financials.collectable` and `collections.blockers` missing in `project.json`.
7. **LOD draft** — H-009 open; deadline 2026-06-16 passed; no `dateSent`.
8. **TAN010 empties account** — related account R2,507.00 (global report); not reconciled this session.

---

## Five Operational Answers

### 1. What is the current balance?

**Answer:** Best available reconstructed balance **R96,284.18** (LPG R97,146.68 + CYL financial R-862.50) as at **30 Jun 2026**. **Not current** — no v5-gated ERP TXT.

**Evidence basis:** `TAN001_Statement_Account_v4.md`, `TAN001_BASELINE_v4.md`, `project.json`

**Status:** **PARTIAL**

**Blocker:** Missing ERP statement TXT; unknown post-Jun 2026 activity

**Operator decision required:** Upload fresh ERP TXT and confirm whether Jun 2026 reconstruction remains authoritative

---

### 2. Which invoices remain open?

**Answer:** Aggregate open AR **R96,284.18** including pre-2026 aged pool **R66,565.10** and period net increase **R30,581.58**. Latest invoice: **50973** (01 Jun 2026, R4,035.26). Per-invoice allocation **not proven**.

**Evidence basis:** v4 running ledger (pool model)

**Status:** **PARTIAL**

**Blocker:** No invoice-level allocation register; no current TXT manifest

**Operator decision required:** Accept pool summary or run allocation lane for invoice-level open proof

---

### 3. Which payments or credits remain unapplied?

**Answer:** **None identified** in v4 reconstruction. Period payments **R37,500.00** fully absorbed into running balance. Period credits net **R3,190.21** embedded in ledger.

**Evidence basis:** v4 statement payment rows

**Status:** **PARTIAL** (pool-applied, not invoice-matched)

**Blocker:** Pool model — cannot prove zero unapplied without allocation lane + current ERP

**Operator decision required:** Confirm no orphan UD payments in ERP since Jun 2026

---

### 4. Which cylinders remain outstanding?

**Answer:** Net returnable position **7 units**; custody exposure **R1,667.50**. Customer-side outstanding: **13× 9kg**, **2× 48kg DV**. Over-return / short positions: **-4× 19kg**, **-4× 48kg SV**.

**Evidence basis:** v4 Part 2 cylinder ledger (30 Jun 2026)

**Status:** **PARTIAL**

**Blocker:** No physical yard audit; ingest gate blocked; financial settlement not proof of return

**Operator decision required:** Confirm physical cylinder count vs ledger; resolve R-2,530.00 financial/custody variance

---

### 5. What evidence, decision or action is still pending?

**Answer:**
- Upload ERP statement TXT + same-session DTRX through current date
- Run ingest check and v5 generator (target: ERP variance R0.00, sub-ledger tie R0.00)
- Resolve ERP R3,090.57 variance / confirm collectable balance (D17)
- LOD draft/send decision (H-009 overdue)
- Cylinder physical verification
- Post-Jun 2026 activity reconciliation

**Evidence basis:** Session gap analysis, `ACTION_PROMPTS.md`, `HUMAN_TASKS.md`

**Status:** **UNPROVEN** (position not current)

**Blocker:** Missing Tier-3 ERP TXT

**Operator decision required:** **Yes** — all items above

---

## Session Outcome

```text
Session status: COMPLETE
Reconciliation status: PARTIAL
```

`COMPLETE` = available work processed (gate run, evidence inventoried, workbench recorded).  
Does **not** mean debtor position proven.  
`reconState` in `project.json`: **unchanged** (`complete`).

---

## Operator Decisions Required

1. Provide **TAN001 ERP statement TXT** to `raw/TAN001CURRENT.TXT` (or update `txtPath`).
2. Confirm whether **Jun 2026 v4 balance** is still the working figure or superseded.
3. Approve **LOD** issuance (collections track; D17 blockers present).
4. Decide on **allocation lane** run for invoice-level open proof.
5. Authorize **cylinder yard check** for custody confirmation.

**Next action:** Sources operator uploads ERP statement TXT + DTRX; re-run `npm run debtors:ingest-check -- --debtor TAN001` then `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor TAN001`.
