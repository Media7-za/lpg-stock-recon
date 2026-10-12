# MON001 — Onboarding Status

**Updated:** 2026-07-28  
**Lane:** `position_recon` + v5 sub-ledger layout (Part 1A LPG / Part 1B CYL) — **locked from TXT**  
**reconState:** **in-progress** (financial bridge proven; custody ingest partial)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **MON001** |
| Trading name | **SHORTEN INTERNATIONAL 66 ON MONZALI** (`MON001CURRENT.TXT` `ACCOUNT:` header ✓) |
| Portfolio hint | Not in `portfolio_candidates.csv`; global aged-debt **R3,570.68** (13 Jul 2025) — **superseded by TXT** |
| Sibling accounts | None under `MON*` — **MOZ002** separate |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/MON001CURRENT.TXT` | ✅ **ingested** |
| v5 config | `config/statement_v5.json` | ✅ TXT-aligned (`combinedBf` R162.86) |
| v5 statement | `reports/MON001_Statement_Account_v5.md` | ✅ bridge **R0.00** |
| Ingest coverage | `reports/MON001_INGEST_COVERAGE_2026-07-28.json` | ✅ `CURRENT_PARTIAL` |
| Workspace fixture | `src/features/.../MON001.v5.json` | ✅ |
| `project.json` | — | ❌ not created |

---

## ERP TXT summary (`MON001CURRENT.TXT`)

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R2,717.79** |
| BALANCE B/F | R162.86 |
| Period in export | Jul 2024 → 22 Jul 2026 |
| Period rows | 61 |
| Terms | COD (global aged-debt) |

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Lock |
| :--- | :--- | :--- |
| Lane | v5 `position_recon` | ✅ |
| Payment pattern | STAT 104, 112–128; single payment **40894** −R5,222.16 (dual clear) | ✅ |
| Settlement discount | **NONE** | ✅ |
| EMPTY pattern | `-EMPTY`, `-EMPTIES`, `=EMPTIES` | Part 1B ✓ |
| `paymentLane` | **LPG** | ✅ |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + config | ✅ |
| 1 | ERP TXT ingest | ✅ |
| 1 | Ingest coverage check | ✅ `CURRENT_PARTIAL` |
| 1 | v5 statement + R0.00 bridge | ✅ |
| 1 | Part 2 custody sign-off | ❌ **BLOCKED** (2 ingest gaps) |

---

## Open exceptions

1. **INGEST_GAP:** Payment **45158** (11 Jul 2024) — missing header in Supabase.
2. **INGEST_GAP:** Invoice **52130** (27 Jan 2026, R960.00) — missing header + lines.
3. **Payment 45216** (−R5,430.30, 15 Jul 2026) — clears multiple invoices; review if operator needs allocation proof.
4. **Inv 50097** + CN **14792** — extra SV / faulty return; financial effect in pool (CN −R1,706.03).
5. **`project.json`:** Operator onboarding pending.

---

## Next commands

```bash
PGSSL_REJECT_UNAUTHORIZED=false npm run debtors:ingest-check -- --debtor MON001
PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor MON001
```
