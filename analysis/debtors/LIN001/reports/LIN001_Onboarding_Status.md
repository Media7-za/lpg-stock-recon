# LIN001 — Onboarding Status

**Updated:** 2026-09-02  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **locked from TXT**  
**reconState:** financial **closed from TXT** · custody **blocked** (ingest gate)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **LIN001** |
| Trading name | **SLINDOKUHLE ENTERPRISES (PTY) LTD** (ERP `ACCOUNT:` header) |
| Portfolio hint | Tier **C**, `position_recon`, terms **COD** |
| Sibling accounts | **LIN000** (LINDO GAS), **LIN010** (LIN UMZIMKULU EMPTIES) — not merged |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/DEBENQ (1).TXT` | ✅ as-at **2 Sep 2026** |
| DTRX headers | Supabase | ⚠️ `STALE_PARTIAL` — 3 missing headers |
| ITEMS lines | Supabase | ⚠️ inv **52924** missing lines |
| v5 config | `config/statement_v5.json` | ✅ |
| v5 statement | `reports/LIN001_Statement_Account_v5.md` | ✅ **R0.00 bridge** |
| Ingest coverage | `reports/LIN001_INGEST_COVERAGE_2026-09-02.json` | ✅ `STALE_PARTIAL` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/LIN001.v5.json` | ✅ |

---

## ERP TXT summary (`raw/DEBENQ (1).TXT`)

| Field | Value |
| :--- | ---: |
| Header `CURRENT BALANCE` | **R81,960.94** |
| Running close (inv 52924, 2 Sep 2026) | **R81,960.94** ✓ |
| 2026 opening (config `combinedBf`) | **R132,098.48** (after inv 48504, 26 Dec 2025) |
| Last invoice | 2026-09-02 · **52924** · DN#24947 |
| Last payment | 2026-08-22 · **45840** · SPEEDP PC-76-34 |
| Period rows (v6, from 2026-01-01) | 30 |

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Lock |
| :--- | :--- | :---: |
| Lane | SPEEDP / TRANSF + `PC-76-xx` in 2026; STAT 112–118 in 2025 tail | **`position_recon`** |
| Settlement discount | Penny journals only (−R0.41, −R0.60, −R0.49) | **NONE** |
| EMPTY ref pattern | **None** in TXT — CYL via mixed-doc DB line split | v5 Part **1B** |
| Allocation lane | TXT includes **INVNO** on payment splits (not EXCLUDE ALLOCATION DETAIL) | **Not** WO0001 allocation skill |
| `paymentLane` | SPEEDP settles mixed gas+CYL invoices | **LPG** |
| Terms | COD (portfolio) | Cash / speed-point cadence |

---

## TXT vs v5 statement

| Check | Result |
| :--- | :--- |
| Part 1 bridge (1A + 1B = ERP) | **R0.00 variance** ✓ |
| Sub-ledger tie | **R0.00** ✓ |
| ERP CURRENT BALANCE | **R81,960.94** |
| Part 1A LPG close | R38,088.44 |
| Part 1B CYL close | R43,872.50 |
| Part 2 custody sign-off | **BLOCKED** — ingest `STALE_PARTIAL`; 1B vs custody **R0.00** internally (not signed off) |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + config | ✅ |
| 1 | ERP TXT ingest + v5 rebuild | ✅ |
| 1 | Ingest coverage check | ✅ `STALE_PARTIAL` |
| 1 | Part 2 custody sign-off | ❌ blocked |
| 2 | Fresh DTRX + ITEMS (44976, 45840, 52924) | ⏳ **next — Sources Agent** |

---

## Next action

Re-export DTRX + ITEMS through **2 Sep 2026**, then re-run ingest-check and v5. Do not send a customer statement until custody gate clears or exceptions are ratified.
