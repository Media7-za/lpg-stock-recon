# IVE001 — Onboarding Status

**Updated:** 2026-07-22  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **preliminary** (TXT not yet ingested)  
**reconState:** **blocked** — no authoritative statement TXT

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **IVE001** |
| Trading name | **ST IVES** (portfolio + DTRX; confirm from ERP `ACCOUNT:` header in statement TXT) |
| Portfolio hint | Tier **C**, `defer`, balance **R12,959.96** (`portfolio_candidates.csv`) |
| Sibling accounts | **None identified** — do not merge unless operator confirms |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/IVE001CURRENT.TXT` | ❌ **REQUEST — Sources Agent** |
| DTRX headers (Supabase) | `transaction_headers` | ⚠️ partial — 101 distinct docs through **24 Jun 2026** |
| ITEMS lines (Supabase) | `vw_clean_transactions` | ⚠️ sync **2026-07-01** — no Jul 2026 docs for IVE001 |
| Global aged-debt snapshot | `Global Reports/130720251H45M.TXT` | ✅ R12,959.96 as-at **13 Jul 2026** (not a statement manifest) |
| DTRX fragment | `shared/raw/april_dump.TXT` | ⚠️ Apr 2026 rows only — not Tier-3 authority |
| v5 config | `config/statement_v5.json` | ✅ scaffolded — opening balances **pending TXT** |
| v5 statement | `reports/IVE001_Statement_Account_v5.md` | ❌ blocked on TXT |
| Ingest coverage | `reports/IVE001_INGEST_COVERAGE_*.json` | ❌ blocked on TXT |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/IVE001.v5.json` | ❌ blocked on TXT |

---

## Lane lock (preliminary — confirm from statement TXT)

| Signal | DTRX / dump evidence | Preliminary conclusion |
| :--- | :--- | :--- |
| Payment pattern | `TRANSF` + **STAT 125** on pays 43880, 44142 (`april_dump.TXT`) | **`position_recon`** (STAT batches) |
| Settlement discount | No `DISCOUNT ALLOWED` or settlement refs in DTRX sample | **NONE** |
| EMPTY ref pattern | `DN-22321-EMPTY`, `DN#22358-EMPTY`, `DN#22912-EMPTIES`, etc. | v5 Part **1B** CYL strip |
| Allocation lane | DTRX shows `Alloc` split rows on some payment docs; statement format expected **EXCLUDE ALLOCATION DETAIL** | **Not** WO0001 — pending TXT header confirmation |
| Mixed gas + CYL docs | Paired inv/CN + EMPTY legs | Standard v5 routing |

> **Do not treat lane as locked until fresh statement TXT header is parsed.**

---

## ERP balance reference (global aged-debt — not sign-off)

| Field | Value | Source |
| :--- | ---: | :--- |
| TOTAL BALANCE | **R12,959.96** | `130720251H45M.TXT` (13 Jul 2026) |
| CURRENT | R7,199.98 | same |
| 30 DAYS | R5,759.98 | same |

Part 1 bridge variance: **not computed** — statement TXT required.

---

## Supabase footprint (derived cache only)

| Metric | Value |
| :--- | :--- |
| Distinct header docs | 101 |
| Date range | 2025-04-07 → 2026-06-24 |
| July 2026 docs in DB | **0** |
| Header/items sync | **2026-07-01** |
| Payment description pattern | `TRANSF` only (STAT detail in `batch_ref` on some exports) |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + config | ✅ |
| 1 | Fresh ERP statement TXT in `raw/` | ❌ **blocked** |
| 1 | Ingest coverage check | ❌ blocked |
| 1 | v5 statement + R0.00 bridge | ❌ blocked |
| 1 | Part 2 custody sign-off | ❌ blocked |

---

## Open exceptions

1. **Sources Agent (H-010):** Export same-session bundle — statement TXT + DTRX headers + CURRENT/STTR items through at least **13 Jul 2026** (global balance date).
2. **Config:** Set `combinedBf`, `cylOpeningFinancial`, and `cylOpeningQty` from TXT opening lines — do not copy from JEN001 or global report.
3. **July gap:** DB ends 24 Jun 2026; global report shows R12,959.96 on 13 Jul — expect missing doc manifest once TXT lands.
4. **DTRX duplicate rows:** Several docs appear in multiple source files with conflicting dates/amounts (e.g. 50432, 50434, 14824) — TXT running balance is tie-breaker.

---

## Next commands (after TXT intake)

```bash
npm run debtors:ingest-check -- --debtor IVE001
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor IVE001
```

Target: Part 1 bridge **R0.00**, then `CURRENT_COMPLETE` or ratified ingest exceptions before custody sign-off.
