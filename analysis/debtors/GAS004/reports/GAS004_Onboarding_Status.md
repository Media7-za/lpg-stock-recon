# GAS004 — Onboarding Status

**Updated:** 2026-08-17  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **locked from TXT**  
**reconState:** **in-progress** (running-close identity PROVEN; header CURRENT BALANCE is a different figure; custody BLOCKED)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **GAS004** |
| Trading name | **GAS 2 GO HILTIN NEW ACCOUNT** (ERP `ACCOUNT:` header) |
| Portfolio hint | CSV was `defer` / Tier A — **overridden by TXT** to `position_recon` |
| Terms (global, stale) | blank |
| Credit limit (global, stale) | R48,000 |
| Sibling ERP codes | **GAS002**, **GAS003**, **GAS010** — combined exposure documented; **not merged** |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP enquiry CURRENT | `raw/DEBENQ_CURRENT.TXT` | ✅ last row **2026-08-03** |
| ERP enquiry 2025 | `raw/DEBENQ_2025.TXT` | ✅ archival (B/F chains into CURRENT) |
| ERP enquiry 2024 | `raw/DEBENQ_2024.TXT` | ✅ archival |
| DTRX / ITEMS | Supabase | ⚠️ `CURRENT_PARTIAL` — 10 missing headers; DB also has **post-3 Aug** invoices |
| v5 config | `config/statement_v5.json` | ✅ |
| v5 statement | `reports/GAS004_Statement_Account_v5.md` | ✅ generated |
| Ingest coverage | `reports/GAS004_INGEST_COVERAGE_2026-08-17.json` | ✅ `CURRENT_PARTIAL` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/GAS004.v5.json` | ✅ `pending_review` |
| Fresh global aged-debt | `Global Reports/` | ❌ still `130720251H45M.TXT` only — **H-020** |

---

## ERP TXT summary (`raw/DEBENQ_CURRENT.TXT`)

| Field | Value |
| :--- | ---: |
| Header `CURRENT BALANCE` | **R30,242.46** (excludes UD) |
| `UD PAY/CHEQUES` | **R-10,180.95** |
| `TOTAL EXCLUDING UD/CLAIMS` | R30,242.46 |
| TXT running close (last BALANCE) | **R20,061.51** (2026-08-03 inv 52262) |
| BALANCE B/F (full extract) | R58,339.60 |
| 2026 opening (config `combinedBf`) | **R20,121.57** |
| Last invoice | 2026-08-03 · 52262 |
| Last SPEEDP payment | 2026-07-23 · 45282 |
| Period rows (v5) | 99 from 2026-01-01 |

**PROVEN identity:** running close − UD header = CURRENT BALANCE  
`20,061.51 − (−10,180.95) = 30,242.46`. Ten `Ud Paymnt` rows in CURRENT sum to **R-10,180.95** exactly.

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Lock |
| :--- | :--- | :---: |
| Lane | SPEEDP `PC-76-xx` payments; no STAT batches | **`position_recon`** |
| Settlement discount | Five `DISCOUNT ALLOWED` rows totalling **R-58.38** (pennies + one R-57.50 journal) | **NONE** — not Model B |
| EMPTY ref pattern | 57 `-EMPTY` / `EMPTIES` rows in CURRENT (2025); 2026 CYL via mixed-doc DB split | v5 Part **1B** |
| Allocation lane | DEBENQ carries `INVNO`; not WO0001 | **Not** allocation |
| `paymentLane` | SPEEDP settles gas invoices same-day / next-day | **LPG** |

---

## TXT vs v5 statement

| Check | Result |
| :--- | :--- |
| Combined 1A+1B vs TXT running close | **R20,061.51 — R0.00** ✓ |
| Sub-ledger tie | **R0.00** ✓ |
| Combined vs header `CURRENT BALANCE` | **R-10,180.95** — UD identity, **do not sign off as ERP variance** |
| Part 1A LPG close | R17,244.01 |
| Part 1B CYL close | R2,817.50 |
| Part 2 custody sign-off | **BLOCKED** — ingest `CURRENT_PARTIAL`; 1B vs custody **R-57.50** not signed off |

---

## ERP freshness

Operator uploaded DEBENQ files on **2026-08-17**. File status: `LATEST_IN_REPOSITORY`. Last TXT row is **2026-08-03**. Supabase already has invoices **52467, 52478, 52518, 52519, 52586** dated **10–14 Aug 2026** (DB-only). Treat the extract as **behind live ERP**. Live comms / closure remain blocked until a re-export through today (**H-021**).

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + v5 config from TXT | ✅ |
| 1 | Ingest coverage | ✅ `CURRENT_PARTIAL` |
| 1 | v5 statement | ✅ generated — running-close PROVEN |
| 1 | Part 2 custody sign-off | ❌ blocked |
| 2 | Fresh DEBENQ + DTRX/ITEMS through today | ⏳ **H-021** |
| 2 | Fresh global aged-debt (family snapshot) | ⏳ **H-020** |

---

## Next action

1. Sources: **H-021** — re-export `DEBENQ_CURRENT` (or statement TXT) through **2026-08-17**, same-session DTRX + ITEMS.  
2. Sources: **H-020** — fresh global aged-debt for GAS002 / GAS003 / GAS010 combined exposure.  
3. Do not send a customer statement until the header/UD presentation is decided and the TXT catches the Aug 10–14 invoices.
