# CAP000 — Onboarding Status

**Updated:** 2026-08-05  
**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)  
**Lane (triage):** `settlement_discount` — **ASSUMED** (not TXT-locked)  
**reconState:** **pending** (Turn 001 PARTIAL — awaiting debtor TXT)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **CAP000** |
| Trading name | **CAPITOL CATERERS SELECT (PTY)** |
| Terms (global) | **30T** |
| Credit limit (global) | R215,000 |
| Sibling ERP code | **CAP002** — CAPITOL CATERERS EMPTIES (R-4,186.00 on global report) — **out of scope Turn 001** unless operator expands |

---

## Global aged-debt anchor (operator-confirmed 2026-08-05)

> **Correction (2026-08-05 self-review):** As-at was initially transcribed as `2026-07-13` during Turn 001 execution. Filename convention is `DDMMYYYYHMM` (see `SKILL_Human_Sources_Agent.md` §2) → `13072025` = **13/07/2025**. Corrected below. This makes the anchor **~13 months old**, not ~3 weeks — reclassified `ASSERTED_STALE`, not routine `ASSERTED`. Note: the same file has a repo-wide 2025-vs-2026 interpretation split across other accounts (RED001/MON001/TAN001/MOZ002 read 2025; BU0002/IVE001 read 2026) — unresolved, flagged separately, not fixed here.

| Field | Value |
| :--- | ---: |
| Source | `analysis/debtors/Global Reports/130720251H45M.TXT` |
| As-at | **2025-07-13** (corrected) |
| BALANCE | **R46,228.47** |
| CURRENT | R5,357.02 |
| 30 DAYS | R10,672.72 |
| 60 DAYS | R5,174.09 |
| 90 DAYS | R4,722.39 |
| 120+ DAYS | R20,302.25 |

Epistemic tag: **ASSERTED_STALE** (global row, ~13 months old) — not **PROVEN** until full debtor TXT bridge. Staleness materially raises the priority of H-011 relative to a routine 3-week-old figure.

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP debtor account TXT | `raw/CAP000CURRENT.TXT` (expected) | ❌ **missing** — **H-011** |
| Remittance PDFs | `raw/Remittances/` | ❌ not received |
| Global aged debt | `Global Reports/130720251H45M.TXT` | ✅ |
| Partial activity snippet | `shared/raw/april_dump.TXT` (7 CAP000 rows, Apr 2026) | ⚠️ advisory only |
| Item-level STTRANS | `ERP RAW DATA/STTRANS.TXT` | ⚠️ not canonical for AR |
| `project.json` | `project.json` | ✅ Turn 001 |
| Settlement override registry | `config/settlement_discount_overrides.json` | ⏸ empty scaffold |

### april_dump snippet (non-authoritative)

| Doc | Date | Amount | Note |
| :--- | :--- | ---: | :--- |
| 00050443 | 2026-04-30 | R4,722.39 | Open invoice (`N` paid flag in dump) |
| 00050301/302 + CNs | 2026-04-19/20 | net ~0 | DN-21334 pair cleared |
| 00050444 + CN | 2026-04-30 | net ~0 | EMPTY pair cleared |

Last invoice date in snippet: **2026-04-30** — advisory only; **not** written to `project.json.financials.lastInvoiceDate` (left `null` after self-review — an advisory-only snippet should not populate a schema field unqualified).

---

## Lane lock (pending TXT)

| Signal | Evidence | Lock |
| :--- | :--- | :---: |
| Backlog triage | `portfolio_candidates.csv` → `settlement_discount` | ASSUMED |
| Model B (2.5% / remittance batch) | — | ❌ not tested |
| Payment STAT pattern | — | ❌ |
| EMPTY / CYL pairing | april_dump `-EMPTY` headers | hint only |
| Alternative lane | `position_recon` + v4/v5 statement | fallback if no discount pattern |

Reference playbook if Model B confirmed: `analysis/debtors/TWK002/docs/TWK002_Settlement_Discount_Doctrine_v2.md`.

---

## Turn status map

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 001 | Scaffold + global anchor + H-011 | ✅ **PARTIAL** |
| 002 | Ingest TXT + lane lock + baseline statement | ⏳ **NEXT** (blocked on H-011) |
| 003+ | Settlement batches **or** position/custody per locked lane | ⏸ |

---

## Blockers

1. **H-011 OPEN** — no authoritative debtor account TXT in `raw/`.
2. **No remittance PDFs** — required if lane locks to `settlement_discount`.
3. **CAP002** — empties account not linked; confirm combined exposure policy with operator.

---

## Next commands (after H-011)

```bash
npm run debtors:sync
# When raw/CAP000CURRENT.TXT exists:
npm run debtors:ingest-check -- --debtor CAP000
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor CAP000
```

Dispatch **Turn 002** worker brief from orchestrator after TXT lands.
