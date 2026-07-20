# JEN001 — Onboarding Status

**Updated:** 2026-07-16  
**Lane:** `position_recon` — stripped-gas + CYL Settlement Allocation v4

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
| 2 | Pilot payment 44878 / STAT 127 | ⏳ **next** |

**Collections gate:** `reconState: in-progress` — blocked on TXT-aligned statement.
