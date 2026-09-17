# CAP000 — Onboarding Status

**Updated:** 2026-09-17 (Turn 002)  
**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)  
**Lane (locked):** `position_recon` — **LOCKED** (`settlement_discount` disconfirmed — see Turn 002 below)  
**reconState:** **part1_complete_pending_db_split**

---

## Turn 002 (2026-09-17) — H-011 resolved, Part 1 statement generated

Operator supplied 4 chronological ERP account-enquiry TXT exports (`DEBENQ23.TXT`, `DEBENQ24.TXT`, `DEBENQ25.TXT`, `DEBENQ.TXT`), covering the full account history **23 Jul 2022 → 17 Sep 2026**, B/F-chained with **zero variance** at every slice boundary:

R0.00 → R48,267.34 → R60,437.64 → R43,865.94 → **R70,773.28 (current)**

All four carry allocation detail (`INVNO` populated) — this account is **not** one of the `H-016` EXCLUDE-flagged accounts, so payment→invoice matching is trustworthy here.

**No `DATABASE_URL` was available this session**, so `reconcile_debtor_v4/v5_from_txt.mjs` (both DB-dependent for Part 2/sub-ledger split) could not be run. Built **Part 1 only** (combined financial ledger) with a standalone TXT-only script, consistent with repo doctrine that ERP TXT is Tier-3 authority for the combined balance:

- **Reconciliation gate:** ERP variance **R0.00** (computed final balance vs. `DEBENQ.TXT` CURRENT BALANCE) — PASS
- 105 EMPTY-pair deposit invoice/CN pairs stripped for readability (v4 doctrine)
- Output: `reports/CAP000_Statement_Account.md`

**Lane-lock finding:** of 226 payment rows, 181 matched their invoice's INVNO for the exact invoice value and only 42 were short — and those short payments show no consistent discount ratio (samples ranged ~3%–75% of invoice value), inconsistent with a fixed early-settlement discount. This **disconfirms** the Turn 001 `settlement_discount` ASSUMPTION. Lane re-locked to **`position_recon`**.

**Still open:** `DATABASE_URL` access for the LPG (1A) vs. CYL deposit (1B) financial split and the Part 2 physical cylinder custody tracker — tracked as **H-028**. Sibling **CAP002** (empties account) remains out of scope.

---

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
| ERP debtor account TXT (full history, 4 slices) | `raw/DEBENQ23/24/25/.TXT` | ✅ **received 2026-09-17** — H-011 DONE |
| Remittance PDFs | `raw/Remittances/` | ⏸ not required (lane locked `position_recon`) |
| Global aged debt | `Global Reports/130720251H45M.TXT` | ⚠️ superseded for balance; only source for aging buckets |
| Partial activity snippet | `shared/raw/april_dump.TXT` (7 CAP000 rows, Apr 2026) | ⏸ superseded by full TXT |
| Item-level STTRANS | `ERP RAW DATA/STTRANS.TXT` | ⚠️ not canonical for AR |
| `project.json` | `project.json` | ✅ Turn 002 |
| Settlement override registry | `config/settlement_discount_overrides.json` | ⏸ empty scaffold — not needed (lane not `settlement_discount`) |
| Statement of Account (Part 1) | `reports/CAP000_Statement_Account.md` | ✅ **generated 2026-09-17**, ERP variance R0.00 |

### april_dump snippet (non-authoritative)

| Doc | Date | Amount | Note |
| :--- | :--- | ---: | :--- |
| 00050443 | 2026-04-30 | R4,722.39 | Open invoice (`N` paid flag in dump) |
| 00050301/302 + CNs | 2026-04-19/20 | net ~0 | DN-21334 pair cleared |
| 00050444 + CN | 2026-04-30 | net ~0 | EMPTY pair cleared |

Last invoice date in snippet: **2026-04-30** — advisory only; **not** written to `project.json.financials.lastInvoiceDate` (left `null` after self-review — an advisory-only snippet should not populate a schema field unqualified).

---

## Lane lock (Turn 002 — LOCKED)

| Signal | Evidence | Lock |
| :--- | :--- | :---: |
| Backlog triage | `portfolio_candidates.csv` → `settlement_discount` | ASSUMED (Turn 001) |
| Payment/invoice value matching | 181/226 payments = exact invoice value; 42 short with no consistent ratio (~3%–75%) | ❌ **disconfirms** `settlement_discount` |
| EMPTY / CYL pairing | 105 exact invoice+CN reversal pairs confirmed in full TXT | consistent with normal deposit handling |
| Locked lane | `position_recon` + Part 1 combined statement (Part 2 pending DB) | ✅ **LOCKED 2026-09-17** |

Reference playbook (not applicable here — retained for contrast): `analysis/debtors/TWK002/docs/TWK002_Settlement_Discount_Doctrine_v2.md`.

---

## Turn status map

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 001 | Scaffold + global anchor + H-011 | ✅ **PARTIAL** |
| 002 | Ingest TXT + lane lock + baseline statement | ✅ **DONE (Part 1)** — see Turn 002 note above |
| 003+ | DB-dependent v4/v5 sub-ledger split + Part 2 custody (H-028) | ⏸ **NEXT** (blocked on `DATABASE_URL`) |

---

## Blockers

1. **H-028 OPEN** — no `DATABASE_URL` available; LPG/CYL sub-ledger split and Part 2 custody tracker cannot be built.
2. **CAP002** — empties account not linked; confirm combined exposure policy with operator.
3. Aged-debt bucket breakdown (`agedDebt180Plus` etc.) still sourced from the stale 2025-07-13 global anchor — a fresh global aged-debt TXT would refresh this (not required for the balance itself, which is now TXT-verified).

---

## Next commands (Turn 003, after DATABASE_URL is available)

```bash
cp analysis/debtors/shared/templates/statement_v5_config.template.json analysis/debtors/CAP000/config/statement_v5.json
# Edit: debtorCode CAP000, debtorName CAPITOL CATERERS SELECT (PTY), txtPath raw/DEBENQ.TXT,
# periodStart 2022-07-23, combinedBf 0.00, paymentLane LPG, cylOpeningQty/skuRates per template.
npm run debtors:ingest-check -- --debtor CAP000
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor CAP000
```
