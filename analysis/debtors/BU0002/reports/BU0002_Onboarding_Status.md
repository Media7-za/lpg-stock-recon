# BU0002 — Onboarding Status

**Updated:** 2026-07-25  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **preliminary** (TXT not yet ingested)  
**reconState:** **blocked** — no authoritative statement TXT

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **BU0002** |
| Trading name | **BULWER CASH STORE** (DTRX + global aged-debt; confirm from ERP `ACCOUNT:` header in statement TXT) |
| Portfolio hint | Tier **B**, `defer`, terms **COD**, balance **R−18,913.50** (`portfolio_candidates.csv`) — not in active portfolio |
| Sibling accounts | **BU0005** (CHOBOZA - BULWER — allocation lane, separate), **BU0003** (IMPENDLE WHOLESALE), **BU0009** (IMPENDLE WHOLESALE 2025), **HN0001** (HNO - BULWER) — **do not merge** unless operator requests |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/BU0002CURRENT.TXT` | ❌ **REQUEST — Sources Agent** |
| DTRX headers (Supabase) | `transaction_headers` | ⚠️ partial — **1,394** docs through **27 Jun 2026** |
| ITEMS lines (Supabase) | `vw_clean_transactions` | ⚠️ sync **2026-07-01** |
| Global aged-debt snapshot | `Global Reports/130720251H45M.TXT` | ✅ R−18,913.50 as-at **13 Jul 2026** (not a statement manifest) |
| DTRX fragment | `shared/raw/april_dump.TXT` | ⚠️ Apr 2026 rows only — not Tier-3 authority |
| DETRANS reference | `ERP RAW DATA/DETRANS.TXT` | ⚠️ 100 BU0002 rows — derived cache only |
| v5 config | `config/statement_v5.json` | ✅ scaffolded — opening balances **pending TXT** |
| v5 statement | `reports/BU0002_Statement_Account_v5.md` | ❌ blocked on TXT |
| Ingest coverage | `reports/BU0002_INGEST_COVERAGE_*.json` | ❌ blocked on TXT |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/BU0002.v5.json` | ❌ blocked on TXT |

---

## Lane lock (preliminary — confirm from statement TXT)

| Signal | DTRX / dump evidence | Preliminary conclusion |
| :--- | :--- | :--- |
| Payment pattern | `TRANSF` + **STAT:122–127** (e.g. pays 43000, 43240, 43980, 44781) | **`position_recon`** |
| Settlement discount | No `DISCOUNT ALLOWED` or settlement refs in DTRX sample | **NONE** |
| EMPTY ref pattern | `DN#20981-EMPTY`, `DN#21230-EMPTY`, `DN/EMPTY`, `DN#22101-EMPTY`, `DN-22312-EMPTY` | v5 Part **1B** CYL strip |
| Allocation lane | BU0005 doctrine notes BU0002 posts pays with **explicit invoice `ref_no`**; DETRANS has `Alloc` split rows but statement format expected **EXCLUDE ALLOCATION DETAIL** | **Not** WO0001 / BU0005 allocation lane |
| Mixed gas + CYL docs | Paired inv/CN + EMPTY legs (standard Bulwer-family DN pairs) | Standard v5 routing |
| Terms | **COD** (portfolio + global aged-debt) | Cash-on-delivery; STAT batch settlement pattern |

> **Do not treat lane as locked until fresh statement TXT header is parsed.**

---

## ERP balance reference (global aged-debt — not sign-off)

| Field | Value | Source |
| :--- | ---: | :--- |
| TOTAL BALANCE | **R−18,913.50** | `130720251H45M.TXT` (13 Jul 2026) |
| CURRENT | R−18,913.50 | same |
| Aged buckets | R0.00 all | same |

Part 1 bridge variance: **not computed** — statement TXT required.

---

## Supabase footprint (derived cache only)

| Metric | Value |
| :--- | :--- |
| Distinct header docs | 1,394 |
| Date range | 2016-11-17 → 2026-06-27 |
| July 2026 docs in DB | **0** |
| Header/items sync | **2026-07-01** |
| Recent tail | CN 15134 (−R26,392.50), inv 51445/51446 (Jun 2026), pay 44781 STAT:127 |

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

1. **Sources Agent:** Export same-session bundle — statement TXT + DTRX headers + CURRENT/STTR items through at least **13 Jul 2026** (global balance date).
2. **Config:** Set `combinedBf`, `cylOpeningFinancial`, and `cylOpeningQty` from TXT opening lines — do not copy from JEN001 or global report.
3. **July gap:** DB ends 27 Jun 2026; global report shows R−18,913.50 on 13 Jul — expect missing doc manifest once TXT lands.
4. **CN 14422 anomaly (Feb 2026):** DETRANS shows CN **−R49,852.50** on `DN/EMPTY` vs inv 49216 **R28,865.00** — flag for operator review once TXT manifest available; do not infer SKU from CN alone.
5. **Sibling BU0005:** Allocation lane account under same Bulwer operator — keep separate ledgers; cross-reference STAT batch timing only.

---

## Next commands (after TXT intake)

```bash
npm run debtors:ingest-check -- --debtor BU0002
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor BU0002
```

Target: Part 1 bridge **R0.00**, then `CURRENT_COMPLETE` or ratified ingest exceptions before custody sign-off.
