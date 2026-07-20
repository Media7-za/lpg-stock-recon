# PRD: Debtors Orchestration & Human Agent Model

**Slice:** Debtors Portfolio Management — Orchestration MVP  
**Status:** Approved / In delivery  
**Last updated:** 2026-07-13  
**Owner:** Debtors slice (AR / reconciliation)

---

## 1. Problem statement

The debtor portfolio spans **327 ERP accounts** (~R1.58M 120+ aged in global export), but operational focus is on **10 micro-projects** under `analysis/debtors/`. Reconciliation work is lane-specific (settlement discount, allocation, position recon) and requires **human ERP posting**, **evidence intake**, and **customer collection** — none of which Cursor agents may automate.

Without orchestration, work fragments across chat sessions, TWK002-style turn playbooks do not generalise, and collection action runs on unverified ledgers.

---

## 2. Goals

| Goal | Success metric |
| :--- | :--- |
| Single orchestrator triages portfolio and dispatches one bounded turn at a time | Dashboard KPIs + lane dispatch per session |
| Humans execute ERP, intake, and collections with clear queues | `HUMAN_TASKS.md` + `ACTION_PROMPTS.md` |
| Backlog parsed mechanically, not read line-by-line | `portfolio_candidates.csv` from global TXT |
| State machine enforced | No `status: collection` unless `reconState: complete` |
| Markdown-first MVP — no HTML portfolio UI | `DEBTORS_DASHBOARD.md` via `npm run debtors:sync` |

---

## 3. Non-goals (MVP)

- Autonomous ERP writeback or auto-email to customers
- HTML portfolio dashboard (per-account finance HTML e.g. TWK control panel **stays**)
- `KPI_SNAPSHOT.json`, event sourcing activation
- Onboarding all 68 backlog candidates in MVP
- Replacing `CURRENT_STATE.md` LSR-5 pre-implementation spec as operational truth

---

## 4. Actor model

```text
┌─────────────────────────────────────────────────────────────┐
│  Cursor Orchestrator  (SKILL_Debtors_Orchestrator.md)       │
│  Triage · dispatch · KPIs · queue humans                    │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │ Cursor Workers  │             │  Human Agents   │
    │ analysis/allocation/settlement│  ERP · Coll · Src│
    └────────┬────────┘             └────────┬────────┘
             │                               │
    ┌────────▼───────────────────────────────▼────────┐
    │  Repo artifacts: project.json, CSVs, reports  │
    │  DEBTORS_DASHBOARD.md, HUMAN_TASKS.md         │
    └───────────────────────────────────────────────┘
```

| Actor | Type | Skill / doc |
| :--- | :---: | :--- |
| Orchestrator | Cursor | `SKILL_Debtors_Orchestrator.md` |
| Project Manager | Cursor | `SKILL_Debtors_Project_Manager.md` |
| Worker (lane) | Cursor | `debtors-analysis`, allocation, TWK doctrine, etc. |
| ERP Agent | Human | `SKILL_Human_ERP_Agent.md` |
| Collections Agent | Human | `SKILL_Human_Collections_Agent.md` |
| Sources Agent | Human | `SKILL_Human_Sources_Agent.md` |
| PWA UI | Software | Review surface only — `.agent/AGENT_WORKFLOW.md` |

---

## 5. Decisions log

Decisions from Jul 2026 exploration (TWK002 branch + orchestrator sessions):

| # | Decision | Rationale | Rejected alternative |
| :---: | :--- | :--- | :--- |
| D1 | **Markdown dashboard**, not HTML portfolio | Ship ASAP; agent reads `DEBTORS_DASHBOARD.md` on "View dashboard" | Standalone HTML portfolio UI |
| D2 | **`portfolio_candidates.csv`** from parse script | Score 327 accounts mechanically | Line-by-line global TXT read in chat |
| D3 | **Three human agents** (ERP, Collections, Sources) | Maps to real staff; merges old 4-role split | Single "human ops" bucket |
| D4 | **Humans gather, workers parse** | TWK002 proved PDF→CSV pipeline | Manual remittance transcription |
| D5 | **`HUMAN_TASKS.md` vs `ACTION_PROMPTS.md`** | Internal ERP/intake separate from customer-facing copy | One combined queue |
| D6 | **Orchestrator plans; PM commits state** | Separation of triage vs `project.json` integrity | Orchestrator edits `project.json` directly |
| D7 | **TWK002 as turn template** | Onboarding_Status + Finance_Posting_Checklist pattern | Ad-hoc per-account playbooks |
| D8 | **Lane routing cheat sheet** | settlement_discount / allocation / position_recon / defer | One-size analysis skill |
| D9 | **Sync skips non-debtor folders** | `Global Reports/` has no `project.json` | Validate every subfolder |
| D10 | **Collection-blocked exposure KPI** | Surfaces **aggregate** blocked exposure (R200k portfolio KPI); e.g. WO0001 alone is R110k pending recon | Only collection-active count |
| D11 | **Chat transcripts not source of truth** | Repo artifacts survive branch switches | Rely on Cursor chat memory |
| D12 | **`reconState: in-progress` display** | TWK002 visible in priority queue | Binary pending/complete only |

---

## 6. Recon lanes

| Lane | Signal | Exemplar account | Worker playbook |
| :--- | :--- | :--- | :--- |
| `settlement_discount` | Remittance batches; missing `DISCOUNT ALLOWED` | TWK002 | Doctrine v2 + finance checklist |
| `allocation` | Payment `ref_no` / allocation edges | WO0001 | `SKILL_Payment_To_Invoice_Allocation.md` |
| `position_recon` | Standard ERP TXT + baseline / payment pattern | WES004, **JIM001** | `debtors-analysis_Skill.md` |
| `collections` | `reconState: complete` + 180+ aged | WES004, TAN001 | `ACTION_PROMPTS.md` |
| `defer` | COD micro-balance, empties, credit balance | INC002, JEN001 (scaffold) | No worker |

**JIM001 nuance:** Complete recon via **payment-pattern** analysis — not allocation skill.

---

## 7. Human agent responsibilities

### ERP Agent
- Post journals and payment corrections per worker checklist
- Does **not** interpret remittances or email customers

### Collections Agent
- **Governance:** prioritise queue, sign off recon (e.g. TWK Path B H-006)
- **Outbound:** send `ACTION_PROMPTS.md` messages manually
- Does **not** post ERP or gather raw files

### Sources Agent
- Upload remittances, TXT exports, global aged-debt, deposit screenshots to `raw/`
- Triggers `debtors:parse-backlog` for global reports
- Does **not** parse PDFs manually or post journals

---

## 8. Artifacts (MVP deliverables)

| Artifact | Path | Status |
| :--- | :--- | :---: |
| Orchestrator skill | `.agents/skills/SKILL_Debtors_Orchestrator.md` | ✅ |
| Human ERP skill | `.agents/skills/SKILL_Human_ERP_Agent.md` | ✅ |
| Human Collections skill | `.agents/skills/SKILL_Human_Collections_Agent.md` | ✅ |
| Human Sources skill | `.agents/skills/SKILL_Human_Sources_Agent.md` | ✅ |
| Backlog parser | `shared/scripts/parse_global_aged_debt.mjs` | ✅ |
| Backlog CSV | `shared/data/portfolio_candidates.csv` | ✅ |
| Human task queue | `shared/HUMAN_TASKS.md` | ✅ |
| Dashboard KPIs | `DEBTORS_DASHBOARD.md` (orchestrator block) | ✅ |
| PRD | `shared/docs/DEBTORS_ORCHESTRATION_PRD.md` | ✅ |
| Roadmap | `shared/docs/DEBTORS_ORCHESTRATION_ROADMAP.md` | ✅ |

---

## 9. Commands

```bash
npm run debtors:parse-backlog   # global TXT → portfolio_candidates.csv
npm run debtors:sync            # validate project.json + dashboard + ACTION_PROMPTS
```

---

## 10. Acceptance criteria

- [x] Orchestrator skill links Tier 1–4 authoritative docs
- [x] Dashboard shows orchestrator KPIs (recon in progress, collection-blocked exposure, open human tasks, Tier A backlog, recon complete %)
- [x] `portfolio_candidates.csv` generated with triage tiers
- [x] Three human agent skills + updated `HUMAN_TASKS.md` roles
- [x] TWK002 H-001–H-007 pre-filled as exemplar queue
- [x] `debtors:sync` passes with `Global Reports/` present
- [ ] TWK002 finance catch-up complete (H-003–H-005) — **in progress**
- [ ] WO0001 baseline recon complete — **pending**
- [ ] Tier A off-portfolio account onboarded — **deferred**

---

## 11. Portfolio snapshot (2026-07-13)

| Metric | Value |
| :--- | ---: |
| Micro-projects | 10 |
| Recon complete | 3 (30%) |
| Recon in progress | 1 (TWK002) |
| Collection active | 2 (WES004, TAN001) |
| Collection-blocked exposure | R200,333 |
| Open human tasks | 5 |
| Tier A backlog (not in portfolio) | 10 |
| Parsed backlog candidates | 68 |

---

## 12. References

- `analysis/debtors/shared/PROJECT_SCHEMA.md`
- `analysis/debtors/shared/DEBTOR_STATE_MACHINE.md`
- `.agent/AGENT_WORKFLOW.md`
- `analysis/debtors/TWK002/reports/TWK002_Onboarding_Status.md`
- `analysis/debtors/shared/docs/CURRENT_STATE.md` (LSR-5 context only — not live ops truth)
