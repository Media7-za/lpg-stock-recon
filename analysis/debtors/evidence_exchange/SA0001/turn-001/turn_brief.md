# Turn Brief — SA0001 Turn 001

> **Written by:** Orchestrator · **Executed by:** Repo worker · **Approved by:** Operator

**Location:** `analysis/debtors/evidence_exchange/SA0001/turn-001/turn_brief.md`  
**Paired manifest:** `./manifest.json`

---

## 0. Header

| Field | Value |
| :--- | :--- |
| Debtor code | **SA0001** |
| Turn | **001** |
| Supersedes turn | none |
| Lane | `position_recon` + statement |
| Lane method (skill path) | `.agents/skills/SKILL_Debtor_Statement_v5_From_TXT.md` · `.agents/skills/debtors-analysis_Skill.md` |
| Turn class | investigation (read-only) |
| Brief written at | 2026-08-05T07:50:00Z |
| Operator approval to dispatch | granted 2026-08-05 |

## 1. ERP freshness gate — worker runs this first

Mandatory — this turn touches balance, statement, and financial bridge.

- [x] Identify newest ERP extract in repo — recorded below (no debtor statement TXT yet)
- [ ] Ask operator to confirm it is latest, or upload fresh TXT — **operator committed to upload**
- [ ] **STOP until explicit confirmation after upload** or confirmation that interim anchor stands

| Field | Value |
| :--- | :--- |
| Repository latest file | `130720251H45M.TXT` (global aged-debt row only; **no** `SA0001CURRENT.TXT`) |
| Balance / as-at | **R17 790,66** / **2025-07-13** |
| Operator confirmation | pending (upload in progress) |
| Balance classification | `ASSERTED_STALE_PENDING_OPERATOR_CONFIRMATION` |

While `pending`, blocked: live debtor communications, collection amounts, reconciliation closure, balance-dependent override ratification, and any "current statement" claim.

## 2. Objective

Onboard SA0001 (`position_recon` + v5): canonical TXT ingest, lane lock, ingest-check, v5 statement generation — **after** operator places `SA0001CURRENT.TXT` (+ DTRX) under `raw/`.

## 3. Method constraint

- Constitutional: `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §§1–3, D19 ingest gate
- Scoped-canonical: `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum (line-level lanes)
- May **not** decide: `ref_no` / clerk text globally; portfolio CSV without TXT header confirmation; ad-hoc DRTX reports in `reports/sa0001_*` as §2 ERP anchor

## 4. Steps

| # | Step | Mode |
| :--- | :--- | :--- |
| 1 | Inventory `analysis/debtors/SA0001/raw/`; if no `*CURRENT*.TXT`, **STOP** and record in `./worker_report.md` + onboarding status | read-only |
| 2 | Parse TXT header (ACCOUNT, CURRENT BALANCE, B/F, terms); update `reports/SA0001_Onboarding_Status.md` | read-only |
| 3 | `npm run debtors:ingest-check -- --debtor SA0001` | read-only |
| 4 | If EMPTY-pair / LPG+CYL pattern matches reference debtors → create `config/statement_v5.json` if missing; run `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor SA0001` | write-conditional-on-Step-3 |
| 5 | Bridge statement closing vs TXT CURRENT BALANCE; tag PROVEN/ASSERTED in worker report | read-only |
| 6 | Complete `./manifest.json` + acceptance gates where applicable | write-conditional-on-Step-5 |
| 7 | PM: update `project.json` financials from TXT header (not global aged-debt alone); `npm run debtors:sync` | write-conditional-on-Step-2 |

Write-gating: no `reconState: complete`, no registry ratification, no debtor contact.

## 5. STOP conditions

- No `*CURRENT*.TXT` in `raw/` (resume when H-012 complete)
- ERP freshness unconfirmed after upload
- Ingest gate FAIL for scopes needed for statement bridge
- v5 bridge residual outside R0.05 without itemized ASSERTED bucket
- Any UNCLASSIFIED_EXCEPTION requiring operator judgment

## 6. Outputs — exact artifact paths

| Artifact | Path |
| :--- | :--- |
| Worker report | `./worker_report.md` |
| Manifest | `./manifest.json` |
| Onboarding status | `analysis/debtors/SA0001/reports/SA0001_Onboarding_Status.md` |
| Ingest coverage | `analysis/debtors/SA0001/reports/SA0001_INGEST_COVERAGE_<date>.json` (if ingest-check emits) |
| v5 statement | `analysis/debtors/SA0001/reports/SA0001_Statement_Account_v5.md` (conditional) |
| v5 config | `analysis/debtors/SA0001/config/statement_v5.json` (conditional) |

## 7. Acceptance gates

- [ ] Derivation ran (when TXT present)
- [ ] Validated against ERP anchor from TXT CURRENT BALANCE
- [ ] Identity / conservation invariants PASS (named)
- [ ] Operator View generated and inspected (when v5 exists)
- [ ] `npm run debtors:sync` clean
- [ ] `manifest.json` complete in this turn folder

## 8. Tripwires

- Fresh global aged-debt or portfolio parse changes SA0001 exposure without matching TXT → reopen Step 2–5
- Payment citing settled EMPTY twin → reopen Part 1B pairing
- Operator upload supersedes 2025-07-13 global anchor → re-run ERP freshness gate

## 9. Out of scope

- `reconState: complete` or `status: collection`
- Allocation / settlement_discount lanes
- Debtor contact / ACTION_PROMPTS execution
- Doctrine amendments

## 10. Operator decisions required

| # | Decision | Blocking? |
| :--- | :--- | :--- |
| 1 | Confirm uploaded `SA0001CURRENT.TXT` is latest ERP export | yes |
| 2 | Ratify any bridge residual not closing to TXT within tolerance | yes (if residual) |
