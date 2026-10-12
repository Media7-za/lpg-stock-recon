# JEN001 — Onboarding Status

**Updated:** 2026-08-25  
**Lane:** `position_recon` — stripped-gas payment pattern · v5 operator · customer SOA presentation

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP TXT (16 Jul 2026) | `raw/JEN00116JULY.TXT` | ✅ **ingested** |
| ERP TXT (stale) | `raw/JEN001.TXT` | ⚠️ superseded |
| Remittance PDFs | `raw/Remittances/` | ❌ **REQUEST** |
| Deposit detail | — | ❌ **REQUEST** |
| Operator spreadsheet | `raw/JEN001_Final_Recon_Export.xlsx` | ✅ |
| Doctrine | `docs/JEN001_Settlement_Discount_Doctrine_v1.md` | ✅ |
| v4 statement | `reports/JEN001_Statement_Account_v4.md` | ✅ **rebuilt from TXT** |
| TXT variance report | `reports/JEN001_TXT_Variance_16JULY.md` | ✅ |

---

## ERP TXT summary (`JEN00116JULY.TXT`)

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R28,534.89** |
| Period in export | Mar 2025 → 14 Jul 2026 |
| 2026 rows | 63 |
| Jan 2026 opening (pre-pay 42917) | R9,082.81 ✓ |
| Jun 25 balance (post-pay 44878) | R22,088.10 |

---

## TXT vs v4 statement

| Check | Result |
| :--- | :--- |
| Part 1 vs ERP header | **R0.00 variance** ✓ |
| Closing balance | **R28,534.89** |
| Cylinder financial vs custody | **R0.00 variance** ✓ |

**Open exceptions:** doc **50939** duplicate EMPTY (R7,245); **51154/51155** not in DB Part 2 qty (June CN 15066 orphaned in physical ledger until DB ingest).

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + doctrine | ✅ |
| 1b | ERP TXT ingest + v4 rebuild | ✅ |
| 2 | Pilot STAT 127 + STAT 129 LIFO allocation | ✅ **2026-08-25** |
| 3 | Bank deposit Tier-1 (STAT 129) | ⏳ REQUEST |

**Collections gate:** Presentation `ALLOWED` (PATTERN_ONLY) — `JEN001_Statement_of_Account.md` · 1 open invoice R597.11. Bank remittance still missing.

---

## Presentation vs operator layout (2026-08-25)

| Layer | Artifact | Role |
| :--- | :--- | :--- |
| Operator | `JEN001_Statement_Account_v5.md` | Sub-ledger position proof — internal only |
| Presentation | `JEN001_Statement_of_Account.md` (+ `.pdf`) | Customer/collections — open LPG invoices + collapsed B/F |
| Allocation | `JEN001_Payment_Allocation_v1.md` | Feeds presentation via `config/statement_of_account.json` |

**Current DEBENQ (`raw/DEBENQ.TXT`):** CURRENT BALANCE **R22,685.21** (PROVEN) · period Jul–Aug 2026 · B/F **R22,088.10** post STAT 127.

Regenerate presentation:
```bash
node analysis/debtors/JEN001/scripts/allocation_ingest_pilot.mjs
npm run debtors:customer-statement -- --debtor JEN001 --as-at 2026-08-25 --pdf
```
