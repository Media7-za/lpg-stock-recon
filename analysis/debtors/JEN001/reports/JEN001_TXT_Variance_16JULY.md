# JEN001 — ERP TXT Variance Report (16 July 2026)

**Source:** `raw/JEN00116JULY.TXT`  
**Compared to:** `JEN001_Statement_Account_v4.md` (DB-regenerated 2026-07-16)  
**Status:** **FAIL** — DB statement not authoritative; ERP TXT is Tier-3 ground truth

---

## ERP header

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R28,534.89** |
| Export B/F (line 1) | R9,461.01 (Mar 2025 roll-forward anchor) |
| **01 Jan 2026 opening** (pre-payment 42917) | **R9,082.81** ✓ matches v4 |
| Last transaction | 14 Jul 2026 — invoice 51824 |
| 2026 transaction rows | 63 |

---

## Balance checkpoints (ERP running balance)

| Date | Event | ERP balance | v4 statement | Variance |
| :--- | :--- | ---: | ---: | ---: |
| 18 May 2026 | Invoice 50754 posted | R27,238.04 | R23,443.04 (50753 only) | +R3,795.00 |
| 19 May 2026 | CN 14922 | R23,098.04 | R23,443.04 | **-R345.00** |
| 25 Jun 2026 | Payment 44878 | **R22,088.10** | **R11,873.72** | **+R10,214.38** |
| 14 Jul 2026 | Invoice 51824 | **R28,534.89** | *(not extended)* | **+R16,661.17** vs v4 |

---

## Root causes

### 1. DB ingest gap — June invoices missing

| Doc | Date | Amount | In ERP TXT | In Supabase / v4 |
| :--- | :--- | ---: | :---: | :---: |
| 00051154 | 11 Jun 2026 | R4,866.88 | ✅ | ❌ |
| 00051155 | 11 Jun 2026 | R5,692.50 | ✅ | ❌ |

CN 00015066 (R-5,692.50) exists in both — pairs only with 51155, leaving **51154 gas R4,866.88** unmatched in DB.

### 2. May ERP complexity not in v4 Part 1

| Doc | Date | Amount | Notes |
| :--- | :--- | ---: | :--- |
| 00050939 | 05 May 2026 | R7,245.00 | Duplicate EMPTY invoice (same ref as 50537) — **investigate** |
| 00014994 | 06 May 2026 | -R1,380.00 | Partial CN on DN#22364-EMPTY |
| 00014995 | 06 May 2026 | -R6,210.00 | Partial CN on DN#22364-EMPTY |
| 00050754 | 18 May 2026 | R4,140.00 | Gas leg DN#22734 — stripped in v4 Part 1 (CYL pair with 14922) |
| 00014922 | 19 May 2026 | -R4,140.00 | CN leg — stripped |

Net May closing: ERP **R23,098.04** vs v4 **R23,443.04** → **R345.00** (matches portfolio_candidates.csv aged figure pattern).

### 3. July 2026 not extended

13 transaction docs (03–14 Jul 2026) in TXT, not in v4 statement. Adds **R6,446.79** movement after Jun payment (R22,088.10 → R28,534.89).

---

## Jan–Apr 2026

Part 1 rows **match ERP** after stripping matching EMPTY pairs (intentional v4 doctrine). No material variance through 21 Apr 2026 (balance R13,028.66).

---

## Ruling

| Source | Use for |
| :--- | :--- |
| **JEN00116JULY.TXT** | Authoritative ERP balance and transaction register |
| **Supabase / v4.md (16 Jul)** | **Do not use** for sign-off until DB ingest catches ERP |
| **Next action** | Sources ingest → rebuild v4 from TXT or sync missing docs to DB |

---

## REQUEST (remaining)

- [ ] Confirm whether doc **50939** is ERP duplicate or valid second posting
- [ ] Bank deposit for payment **44878** (STAT 127, R10,000, 25 Jun 2026)
- [ ] DB ingest of docs **51154**, **51155**, and all **Jul 2026** rows
