# Turn Brief — CAP000 Turn 001

> **Written by:** Orchestrator · **Executed by:** Repo worker · **Approved by:** Operator 2026-08-05

**Location:** `analysis/debtors/evidence_exchange/CAP000/turn-001/turn_brief.md`
**Paired manifest:** `./manifest.json`

---

## 0. Header

| Field | Value |
| :--- | :--- |
| Debtor code | `CAP000` |
| Turn | `001` |
| Supersedes turn | none |
| Lane | `position_recon` (Turn 001 — lane lock; `settlement_discount` is triage-only until TXT proves Model B) |
| Lane method (skill path) | `.agents/skills/debtors-analysis_Skill.md` · `SKILL_Debtor_Statement_v4_From_TXT.md` (v5 if CYL/LPG split warranted after TXT review) |
| Turn class | `investigation (read-only)` |
| Brief written at | `2026-08-04T14:44:00Z` |
| Operator approval to dispatch | `granted 2026-08-05` |

## 1. ERP freshness gate — worker runs this first

- [x] Identify newest ERP extract in repo — record filename, dates, balance
- [x] Ask operator to confirm it is latest, or upload fresh TXT
- [x] **STOP until explicit confirmation or upload.** Label `LATEST_IN_REPOSITORY` until debtor TXT lands; global anchor **confirmed** by operator 2026-08-05

| Field | Value |
| :--- | :--- |
| Repository latest file | `130720251H45M.TXT` (global aged-debt row); **no** `CAP000*.TXT` |
| Balance / as-at | **R46,228.47** / **2025-07-13** (global BALANCE column; corrected 2026-08-05 self-review from an initial `2026-07-13` transcription error — filename `DDMMYYYYHMM` = 13/07/2025, ~13 months stale) |
| Operator confirmation | `confirmed 2026-08-05` |
| Balance classification | `ASSERTED_STALE` (global row, ~13 months old) — **not PROVEN** until full debtor TXT bridge |

While debtor TXT absent: financial bridge, statement generation, and lane lock from payments remain **blocked**.

## 2. Objective

Tier A off-portfolio onboarding for **Capitol Caterers Select (Pty)** — scaffold micro-project, record global anchor (operator-confirmed), inventory partial snippets, **STOP** before statement/lane lock until `raw/CAP000CURRENT.TXT` (H-011).

## 3. Method constraint

- Constitutional: `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §§1–3
- Scoped-canonical: `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum (when TXT available)
- May **not** decide: settlement-discount Model B, payment STAT pattern, or `reconState: complete` without authoritative debtor account TXT

## 4. Steps

| # | Step | Mode |
| :--- | :--- | :--- |
| 1 | Record ERP freshness + operator confirmation in manifest | `read-only` |
| 2 | Scaffold `analysis/debtors/CAP000/` (raw/, config/, reports/, docs/) | `write-conditional-on-Step-1` |
| 3 | Create `project.json` (pending, financials from global anchor) | `write-conditional-on-Step-1` |
| 4 | Write `reports/CAP000_Onboarding_Status.md` with input inventory + sibling **CAP002** note | `write-conditional-on-Step-2` |
| 5 | If `raw/CAP000*.TXT` present: parse header, lock lane, run v4/v5 or STOP on bridge fail | `write-conditional-on-TXT` |
| 6 | `npm run debtors:sync` | `write-conditional-on-Step-3` |

## 5. STOP conditions

- ERP freshness unconfirmed — **cleared** 2026-08-05
- **No debtor account TXT in `raw/`** — halt before statement / lane lock (Turn 001 ends PARTIAL)
- Bridge ≠ TXT closing when TXT is run
- Unclassified payment pattern without operator ruling

## 6. Outputs — exact artifact paths

| Artifact | Path |
| :--- | :--- |
| Worker report | `./worker_report.md` |
| Canonical worker report | `analysis/debtors/CAP000/reports/CAP000_Turn001_Worker_Report.md` |
| Manifest | `./manifest.json` |
| Onboarding status | `analysis/debtors/CAP000/reports/CAP000_Onboarding_Status.md` |
| Project metadata | `analysis/debtors/CAP000/project.json` |

## 7. Acceptance gates

- [x] Derivation ran (global row + april_dump snippet inventoried)
- [ ] Validated against ERP anchor — **deferred** until debtor TXT (H-011)
- [ ] Identity / conservation invariants PASS — **deferred**
- [ ] Operator View — **deferred**
- [x] `npm run debtors:sync` ran clean
- [x] `manifest.json` present in turn folder

## 8. Tripwires

- Fresh global aged-debt or CAP000 TXT supersedes R46,228.47 anchor
- **CAP002** (empties) balance movement may affect combined exposure
- Remittance intake may re-route lane from `settlement_discount` triage to confirmed Model B (TWK002 playbook)

## 9. Out of scope

- `reconState: complete`
- Collections / debtor contact
- ERP posting
- Registry ratification

## 10. Operator decisions required

| # | Decision | Blocking? |
| :--- | :--- | :---: |
| 1 | Sources completes H-011 (debtor TXT + remittances) | yes |
| 2 | Confirm whether **CAP002** empties account is in scope for same recon session | no |
