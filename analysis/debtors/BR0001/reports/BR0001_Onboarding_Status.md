# BR0001 — Onboarding Status

**Updated:** 2026-07-22  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL)  
**Terms:** 30 days (30T)  
**reconState:** financial **closed from TXT** · custody **blocked** (ingest gate)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **BR0001** |
| Trading name | **BRENELL  DESSERTS** |
| Portfolio hint | `settlement_discount` — **overridden by TXT** (STAT batches, no discount) |
| Sibling accounts | **BR0002 — BRENELL EMPTIES** (R598.00 global aged-debt) — not merged |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/BR0001P1TOP17.TXT` | ✅ ingested (P1–P17, as-at **20 Jul 2026**) |
| DTRX headers | Supabase | ⚠️ stale (sync **2026-07-01** vs TXT **2026-07-20**) |
| ITEMS lines | Supabase | ⚠️ stale (same) |
| v5 config | `config/statement_v5.json` | ✅ |
| v5 statement | `reports/BR0001_Statement_Account_v5.md` | ✅ **R0.00 bridge** |
| Ingest coverage | `reports/BR0001_INGEST_COVERAGE_2026-07-22.json` | ✅ `STALE_PARTIAL` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/BR0001.v5.json` | ✅ |

---

## ERP TXT summary (`BR0001P1TOP17.TXT`)

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R20,673.66** |
| Jan 2026 opening (pre-inv 48788) | R6,157.37 ✓ |
| Period in export | P1–P17 (2023 tail → 20 Jul 2026) |
| 2026 rows (period) | 40 |

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Conclusion |
| :--- | :--- | :--- |
| Payment pattern | STAT batches 122–126 (`TRANSF \| STAT:122` … `STAT:126`) | **`position_recon`** |
| Settlement discount | None | **NONE** |
| EMPTY ref pattern | `DN#21638-EMPTY`, `DN#22797-EMPTIES`, `DN#22530=EMPTY`, etc. | v5 Part 1B CYL strip |
| Allocation lane | EXCLUDE ALLOCATION DETAIL; no invoice splits | **Not** WO0001 |
| Terms | 30T (operator confirmed) | 30-day payment cycle aligns with month-end STAT batches |

---

## TXT vs v5 statement

| Check | Result |
| :--- | :--- |
| Part 1 bridge (1A + 1B = ERP) | **R0.00 variance** ✓ |
| Sub-ledger tie | **R0.00** ✓ |
| ERP CURRENT BALANCE | **R20,673.66** |
| Part 1A LPG close | R21,363.66 |
| Part 1B CYL close | **R−690.00** (CN 15140 over-reversal vs inv 51478) |
| Part 2 custody sign-off | **BLOCKED** — ingest gate |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + config | ✅ |
| 1 | ERP TXT ingest + v5 rebuild | ✅ |
| 1 | Ingest coverage check | ✅ `STALE_PARTIAL` |
| 1 | Part 2 custody sign-off | ❌ blocked |
| 2 | Fresh DTRX + ITEMS (Jul tail) | ⏳ **next — Sources Agent** |

---

## Open exceptions

1. **CN 15140** — R5,520 reversal on `DN#22530=EMPTY` vs inv 51478 R4,830 → Part 1B residual **R−690** (ERP-intentional; not a bridge error).
2. **INGEST_GAP (8 docs)** — June/July tail missing from DB: 51171, 51172, 15210, 51659, 51660, 15282, 51925, 51926.
3. **Sources Agent:** Upload same-session DTRX + ITEMS covering TXT as-at 2026-07-20; re-run ingest check.
4. **BR0002:** Confirm whether BRENELL EMPTIES (R598) stays separate from Part 1B.

---

## Next commands

```bash
npm run debtors:ingest-check -- --debtor BR0001
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor BR0001
```

Target: `CURRENT_COMPLETE` or ratified exceptions before custody sign-off.
