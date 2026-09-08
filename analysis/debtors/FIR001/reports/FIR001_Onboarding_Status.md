# FIR001 — Onboarding Status

**Updated:** 2026-09-08  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **locked from TXT**  
**reconState:** financial **closed from TXT** · custody **blocked** (ingest gate) · customer SoA **generated, not sent** (gate `REVIEW_REQUIRED` / `PATTERN_ONLY`)

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
| v5 statement | `reports/FIR001_Statement_Account_v5.md` | ✅ **R0.00 bridge** |
| Ingest coverage | `reports/FIR001_INGEST_COVERAGE_2026-09-07.json` | ✅ `CURRENT_PARTIAL` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/FIR001.v5.json` | ✅ `pending_review` (custody) |
| Customer SoA config | `config/statement_of_account.json` | ✅ `lpg_stripped` + FIFO STAT closes |
| Customer SoA (live) | `reports/FIR001_Statement_of_Account.md` | ✅ Amount due **R8,721.02** |
| Customer SoA snapshot | `snapshots/2026-09-05_v1/` | ✅ send candidate — cite manifest, not live draft |

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
| 2 | Customer Statement of Account (outstanding) | ✅ snapshot `2026-09-05_v1` — gate **REVIEW_REQUIRED** |
| 2 | Fresh DTRX + ITEMS (15488, 45779, 45995) | ⏳ Sources Agent (custody only — does not change Amount due) |

---

## Customer Statement of Account (2026-09-08)

Generated from `raw/FIR001CURRENT.TXT.TXT` via `npm run debtors:customer-statement -- --debtor FIR001 --as-at 2026-09-05`. INVNO tag-check is `NOT_DERIVABLE_FROM_TXT` (EXCLUDE ALLOCATION DETAIL) — expected; open list uses `openInvoiceModel: lpg_stripped` + FIFO STAT closes (`reports/FIR001_STAT_Payment_FIFO_2026-09-05.md`).

| Check | Result |
| :--- | :--- |
| Amount due | **R8,721.02** **PROVEN** — TXT `CURRENT BALANCE` |
| Open LPG | inv **52962** R7,606.09 (DN#24820, 5 Sep 2026) |
| Account-level | B/F R597.43 + CYL residual R517.50 (inv 52737 / CN 15535) |
| Generator gate | **REVIEW_REQUIRED** · `PATTERN_ONLY` (no remittance advices) |
| Send record | `snapshots/2026-09-05_v1/` + `manifest.json` sha256 |

**Do not send** until the operator reviews the PATTERN_ONLY open list (or a remittance lands). Custody ingest remains blocked; it does **not** change this financial Amount due.

---

## Next action

Operator: authorise send from **`snapshots/2026-09-05_v1/`** (Amount due **R8,721.02**), **or** hold until remittance / `allocationGate.status: RATIFIED`.

```bash
# Cite snapshot, not live draft:
# snapshots/2026-09-05_v1/FIR001_Statement_of_Account_2026-09-05_v1.pdf
# snapshots/2026-09-05_v1/manifest.json
```

Sources (custody only): re-export DTRX + ITEMS through **5 Sep 2026**, including CN **15488** and payments **45779** / **45995**.
