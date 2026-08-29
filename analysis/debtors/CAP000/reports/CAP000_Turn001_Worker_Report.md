# CAP000 Turn 001 — Worker Report

**Turn:** 001  
**Outcome:** **PARTIAL** (STOP at Step 5 — no debtor TXT)  
**Executed:** 2026-08-05

## Steps executed

| Step | Result |
| :--- | :--- |
| 1 ERP freshness | Operator confirmation **2026-08-05** recorded in manifest |
| 2 Scaffold | `analysis/debtors/CAP000/` created (raw/, config/, reports/) |
| 3 `project.json` | Created — `reconState: pending`, global financials |
| 4 Onboarding status | `reports/CAP000_Onboarding_Status.md` |
| 5 TXT parse / lane lock | **STOP** — no `raw/CAP000*.TXT` |
| 6 Sync | See below |

## Evidence recorded

- Global anchor: **R46,228.47** (`130720251H45M.TXT`, **2025-07-13** — corrected from an initial `2026-07-13` transcription error; filename convention is `DDMMYYYYHMM`, i.e. 13/07/2025. This anchor is ~13 months old, not ~3 weeks — see `CAP000_Onboarding_Status.md` staleness note)
- Triage lane `settlement_discount`: **ASSUMED** — not proven
- Sibling **CAP002** noted (empties) — not in scope
- H-011 remains **OPEN**

## Artifacts touched

- `analysis/debtors/CAP000/project.json`
- `analysis/debtors/CAP000/reports/CAP000_Onboarding_Status.md`
- `analysis/debtors/CAP000/config/settlement_discount_overrides.json`
- `analysis/debtors/CAP000/raw/README.md`
- `analysis/debtors/evidence_exchange/CAP000/turn-001/` (brief, manifest, this report)
- `analysis/debtors/shared/HUMAN_TASKS.md` (H-011)
- `analysis/debtors/shared/data/portfolio_candidates.csv` (`in_portfolio: yes`)

## Next

Sources completes **H-011** → orchestrator drafts **Turn 002** brief (TXT ingest, lane lock, v4/v5 or settlement path).
