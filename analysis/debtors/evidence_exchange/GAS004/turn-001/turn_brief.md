# Turn Brief — GAS004 Turn 001

> **Written by:** Orchestrator · **Executed by:** Repo worker · **Approved by:** Operator (v5 session start + DEBENQ drop 2026-08-17)

**Location:** `analysis/debtors/evidence_exchange/GAS004/turn-001/turn_brief.md`  
**Paired manifest:** `./manifest.json`

---

## 0. Header

| Field | Value |
| :--- | :--- |
| Debtor code | `GAS004` |
| Turn | `001` |
| Supersedes turn | none |
| Lane | `position_recon` + v5 sub-ledger |
| Lane method (skill path) | `.agents/skills/SKILL_Debtor_Statement_v5_From_TXT.md` |
| Turn class | `write-conditional` (scaffold + generate) |
| Brief written at | `2026-08-17T10:50:00Z` |
| Operator approval to dispatch | `granted 2026-08-17` (DEBENQ upload + v5 session start) |

## 1. ERP freshness gate — worker runs this first

- [x] Identify newest ERP extract — `DEBENQ_CURRENT.TXT`
- [x] Operator uploaded the extract (this is the upload path of the gate)
- [ ] Re-export still required — TXT as-at **2026-08-03**; DB has 10–14 Aug invoices

| Field | Value |
| :--- | :--- |
| Repository latest file | `DEBENQ_CURRENT.TXT` |
| Balance / as-at | running close **R20,061.51** / **2026-08-03**; header CURRENT BALANCE **R30,242.46** |
| Operator confirmation | upload 2026-08-17 — file is `LATEST_IN_REPOSITORY`, not live-ERP current |
| Balance classification | running close **PROVEN** vs TXT; header figure **PROVEN** as running close excluding UD |

## 2. Objective

Onboard GAS004: copy DEBENQ into workspace, lock `position_recon` + v5 from TXT, ingest-check, generate statement. Family combined exposure noted; siblings not merged.

## 3. Method constraint

- Constitutional: `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §§1–3, D19
- Scoped-canonical: `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum (line-level lanes)
- May **not** decide: allocation from `INVNO`; settlement_discount from penny `DISCOUNT ALLOWED`; `reconState: complete`; family merge

## 4. Steps

| # | Step | Mode |
| :--- | :--- | :--- |
| 1 | Copy DEBENQ files to `analysis/debtors/GAS004/raw/` | write-conditional-on-upload |
| 2 | Parse header; write `config/statement_v5.json` from TXT (2026-01-01 B/F) | write-conditional-on-Step-1 |
| 3 | `npm run debtors:ingest-check -- --debtor GAS004` | read-only |
| 4 | `node …/reconcile_debtor_v5_from_txt.mjs --debtor GAS004` | write-conditional-on-Step-2 |
| 5 | Onboarding + ingest projection + family combined exposure | write-conditional-on-Step-4 |
| 6 | `npm run debtors:sync` | write-conditional-on-Step-5 |

## 5. STOP conditions

- No DEBENQ in `raw/` — cleared
- Allocation or settlement_discount pattern that would change lane — not found
- Sign off custody while ingest BLOCKED — must not
- Sign off Part 1 vs header CURRENT BALANCE without naming the UD identity — must not

## 6. Outputs — exact artifact paths

| Artifact | Path |
| :--- | :--- |
| Worker report | `./worker_report.md` |
| Manifest | `./manifest.json` |
| v5 config | `analysis/debtors/GAS004/config/statement_v5.json` |
| v5 statement | `analysis/debtors/GAS004/reports/GAS004_Statement_Account_v5.md` |
| Coverage | `analysis/debtors/GAS004/reports/GAS004_INGEST_COVERAGE_2026-08-17.json` |
| Ingest projection | `analysis/debtors/GAS004/reports/GAS004_Ingest_Gate_Projection.md` |
| Onboarding | `analysis/debtors/GAS004/reports/GAS004_Onboarding_Status.md` |
| Family exposure | `analysis/debtors/GAS004/reports/GAS004_Family_Combined_Exposure.md` |
| Fixture | `src/features/debtor-position-workspace/data/fixtures/GAS004.v5.json` |

## 7. Acceptance gates

- [x] Derivation ran
- [x] Validated against TXT running close (R20,061.51) — **not** header CURRENT BALANCE
- [x] Sub-ledger tie R0.00
- [x] Operator View generated (v5 markdown + fixture) and inspected
- [ ] `npm run debtors:sync` — pending this write
- [x] `manifest.json` in this turn folder

## 8. Tripwires

- Fresh DEBENQ including 10–14 Aug invoices → reopen v5 + ingest
- UD allocation / presentation ruling → reopen header vs running-close identity
- Sibling TXT that is not Gas2Go → kill family combined-exposure hypothesis

## 9. Out of scope

- `reconState: complete` / `status: collection`
- Merging GAS002/GAS003/GAS010 in ERP
- Debtor contact
- v4 artifacts
- Auto-allocation

## 10. Operator decisions required

| # | Decision | Blocking? |
| :--- | :--- | :--- |
| 1 | Complete H-021 — fresh DEBENQ + DTRX/ITEMS through today | yes |
| 2 | Complete H-020 — fresh global for sibling snapshot | no (family only) |
| 3 | How to present CURRENT BALANCE vs UD vs running close on a customer statement | yes before send |
