# CAP000 — Onboarding Status

**Updated:** 2026-09-17 (Turn 002)  
**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)  
**Lane (locked):** `position_recon` — **LOCKED** (`settlement_discount` disconfirmed — see Turn 002 below)  
**reconState:** **v5_complete_custody_variance_open**

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

**Still open (at the time):** `DATABASE_URL` access for the LPG (1A) vs. CYL deposit (1B) financial split and the Part 2 physical cylinder custody tracker — tracked as **H-028**. Sibling **CAP002** (empties account) remains out of scope.

---

## Turn 002 continued (2026-09-17) — H-028 resolved via Supabase MCP, v5 statement generated

No local `DATABASE_URL`, but the Supabase MCP server exposed the same `lpg-stock-recon` Supabase project (`oqhpxnaadahohwkslive`, confirmed via `mcp__Supabase__list_projects` and table row counts matching this account: 1,364 `transaction_headers` rows for CAP000). Pulled the two DB queries `reconcile_debtor_v5_from_txt.mjs` needs (`fetchDocLineSplit`, `buildPart2` CYL qty) via `mcp__Supabase__execute_sql` and ran the canonical script's logic standalone against that data (parsing, splitting, markdown template, and fixture output are line-for-line identical to the shared script — only the DB transport differs).

**Config created:** `config/statement_v5.json` — `periodStart: 2026-01-01`, `combinedBf: R15,083.55` (DEBENQ.TXT line 191, last balance before the first 2026 row), `cylOpeningFinancial: -R9,683.00` (cumulative pre-2026 CYL debt_group invoice/CN net from DB), `cylOpeningQty` from cumulative pre-2026 CYL qty by SKU.

**Outputs:**

| Artifact | Path |
| :--- | :--- |
| v5 statement | `reports/CAP000_Statement_Account_v5.md` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/CAP000.v5.json` |

**Gates:**

| Check | Result |
| :--- | :--- |
| ERP variance (1A+1B vs TXT header) | **R0.00** — PASS |
| Sub-ledger tie (1A+1B vs combined running) | **R0.00** — PASS |
| Cylinder position (1B financial vs Part 2 custody) | **R8,245.50** — **OPEN exception**, tracked as **H-029** |

**H-029 finding:** Part 1B (CYL deposit sub-ledger) closes at **-R9,683.00**, but Part 2 physical custody as of Sep 2026 (19.1: -8, 9.1: -1, S.1: +4) values at only **-R1,437.50**. The negative physical quantities on 19.1/9.1 are themselves atypical for a returnable-deposit tracker (implies more units credited back than ever issued in the DB's history). This is a genuine data question — not an artifact of the MCP-based DB access, since it uses the identical `debt_group`/`stock_no`/`qty` fields the canonical script would read from a live connection.

H-028 is now **DONE**. Sibling **CAP002** (empties account) remains out of scope.

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
| 002 | Ingest TXT + lane lock + baseline statement + v5 sub-ledger split | ✅ **DONE** — see Turn 002 notes above |
| 003+ | Resolve H-029 CYL custody variance | ⏸ **NEXT** |

---

## Blockers

1. **H-029 OPEN** — R8,245.50 variance between Part 1B financial CYL balance and Part 2 physical custody valuation; negative 19.1/9.1 custody quantities need investigation.
2. **CAP002** — empties account not linked; confirm combined exposure policy with operator.
3. Aged-debt bucket breakdown (`agedDebt180Plus` etc.) still sourced from the stale 2025-07-13 global anchor — a fresh global aged-debt TXT would refresh this (not required for the balance itself, which is now TXT-verified).

---

## Next commands (Turn 003 — H-029 investigation)

```bash
# Re-run with a live DATABASE_URL (or via Supabase MCP execute_sql as done 2026-09-17) to
# inspect individual CYL debt_group/stock_no/qty rows behind the R8,245.50 variance, e.g.:
#   SELECT tx_date, doc_no, entry_type, stock_no, qty, line_total
#   FROM vw_clean_transactions WHERE account_no = 'CAP000' AND debt_group = 'CYL'
#   ORDER BY tx_date;
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor CAP000
```
