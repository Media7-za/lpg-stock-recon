# FIR001 — Onboarding Status

**Updated:** 2026-09-08  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **locked from TXT**  
**reconState:** financial **closed from TXT** · custody **blocked** (ingest gate) · two-layer **v5 operator / customer SOA** (JEN001 pattern) · gate `REVIEW_REQUIRED` / `PATTERN_ONLY`

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **FIR001** |
| Trading name | **FIRE AND VINE** (ERP `ACCOUNT:` header) |
| Portfolio hint | Tier **B**, `position_recon`, terms **7** |
| Sibling accounts | **None identified** |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/FIR001CURRENT.TXT.TXT` | ✅ as-at **5 Sep 2026** (Jul–Sep window) |
| DTRX headers | Supabase | ⚠️ `CURRENT_PARTIAL` — 2 missing payment headers |
| ITEMS lines | Supabase | ⚠️ CN **15488** missing header + lines |
| v5 config | `config/statement_v5.json` | ✅ |
| v5 statement | `reports/FIR001_Statement_Account_v5.md` | ✅ operator layer · **R0.00 bridge** |
| Ingest coverage | `reports/FIR001_INGEST_COVERAGE_2026-09-07.json` | ✅ `CURRENT_PARTIAL` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/FIR001.v5.json` | ✅ `pending_review` (custody) |
| Presentation layer | `reports/FIR001_Presentation_Layer.md` | ✅ JEN001 two-layer map |
| Customer SoA config | `config/statement_of_account.json` | ✅ collapsed opening (JEN001) |
| Customer SoA (live) | `reports/FIR001_Statement_of_Account.md` | ✅ Amount due **R8,721.02** |
| Customer SoA snapshot | `snapshots/2026-09-05_v2/` | ✅ send candidate — cite manifest, not live draft / not v1 |

---

## ERP TXT summary (`raw/FIR001CURRENT.TXT.TXT`)

| Field | Value |
| :--- | ---: |
| Header `CURRENT BALANCE` | **R8,721.02** |
| Running close (inv 52963 / CN 15604, 5 Sep 2026) | **R8,721.02** ✓ |
| Combined opening B/F | **R597.43** (BALANCE B/F before inv 51530, 2 Jul 2026) |
| Last invoice | 2026-09-05 · **52963** · DN#24820-EMPTY |
| Last LPG invoice | 2026-09-05 · **52962** · DN#24820 · R7,606.09 |
| Last payment | 2026-08-31 · **45995** · TRANSF STAT 129 |
| Period rows | 45 (from 2026-07-01) |
| Allocation detail | **EXCLUDE** |

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Lock |
| :--- | :--- | :---: |
| Lane | `TRANSF \| STAT 128` (Jul) then `STAT 129` (Aug) | **`position_recon`** |
| Settlement discount | None | **NONE** |
| EMPTY ref pattern | `DN#…=EMPTY` / `-EMPTY` / `:EMPTY` | v5 Part **1B** |
| Allocation lane | `"EXCLUDE:","ALLOCATION DETAIL"` — no INVNO on payments | **Not** WO0001 allocation skill |
| `paymentLane` | TRANSF settles LPG invoices; empties via paired CNs | **LPG** |
| Terms | 7 (portfolio) | Weekly STAT cadence |

---

## TXT vs v5 statement

| Check | Result |
| :--- | :--- |
| Part 1 bridge (1A + 1B = ERP) | **R0.00 variance** ✓ |
| Sub-ledger tie | **R0.00** ✓ |
| ERP CURRENT BALANCE | **R8,721.02** |
| Part 1A LPG close | R8,203.52 (= sticky B/F R597.43 + open inv 52962 R7,606.09) |
| Part 1B CYL close | R517.50 (1× 9kg short — CN 15535 −R6,037.50 vs inv 52737 R6,555.00) |
| Part 2 custody sign-off | **BLOCKED** — ingest `CURRENT_PARTIAL`; 1B vs custody **R−6,267.50** (not signed off) |

The Part 2 qty inflation (2× 9kg + 5× S.1) is explained by missing CN **15488** in DB (TXT reverses inv 52579). Do not treat custody qty as signed off.

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + config | ✅ |
| 1 | ERP TXT ingest + v5 rebuild | ✅ |
| 1 | Ingest coverage check | ✅ `CURRENT_PARTIAL` |
| 1 | Part 2 custody sign-off | ❌ blocked |
| 2 | Customer Statement of Account (JEN001 presentation) | ✅ snapshot `2026-09-05_v2` — gate **REVIEW_REQUIRED** |
| 2 | Fresh DTRX + ITEMS (15488, 45779, 45995) | ⏳ Sources Agent (custody only — does not change Amount due) |

---

## Customer Statement of Account (2026-09-08)

JEN001 two-layer: **v5 is operator-only**; customer document is `reports/FIR001_Statement_of_Account.md`. Map: `reports/FIR001_Presentation_Layer.md`.

| Check | Result |
| :--- | :--- |
| Amount due | **R8,721.02** **PROVEN** — v5 combined = TXT `CURRENT BALANCE` |
| Open LPG | inv **52962** R7,606.09 (v5 Part 1A Sep close minus B/F) |
| Collapsed opening | R1,114.93 (v5 B/F R597.43 + Part 1B R517.50) — **not itemised** on customer face |
| Generator gate | **REVIEW_REQUIRED** · `PATTERN_ONLY` |
| Send record | `snapshots/2026-09-05_v2/` |
| Superseded | `snapshots/2026-09-05_v1/` itemised CYL on customer face — **do not send** |

**Do not send** the v5 composed sub-ledger. **Do not send** until the operator reviews the PATTERN_ONLY open list.

---

## Next action

Operator: authorise send from **`snapshots/2026-09-05_v2/`** (Amount due **R8,721.02**), **or** hold until remittance / `allocationGate.status: RATIFIED`.

```bash
# Cite snapshot v2, not live draft, not v1, not v5:
# snapshots/2026-09-05_v2/FIR001_Statement_of_Account_2026-09-05_v2.pdf
# snapshots/2026-09-05_v2/manifest.json
```

Sources (custody only): re-export DTRX + ITEMS through **5 Sep 2026**, including CN **15488** and payments **45779** / **45995**.
