# Roadmap: Debtors Orchestration

**Last updated:** 2026-07-13  
**PRD:** [DEBTORS_ORCHESTRATION_PRD.md](./DEBTORS_ORCHESTRATION_PRD.md)

---

## Phase 0 — Foundations (complete)

Work predating orchestrator MVP that this slice builds on.

| Item | Status |
| :--- | :---: |
| `project.json` schema + state machine | ✅ |
| PM skill + `debtors:sync` | ✅ |
| Collections intelligence + `ACTION_PROMPTS.md` | ✅ |
| TWK002 turns 1–6 (settlement discount lane) | ✅ |
| WO0001 allocation pilot + investigation workspace | ✅ |
| JIM001 / WES004 / TAN001 complete or collection-active recon | ✅ |

---

## Phase 1 — Orchestrator MVP (complete 2026-07-13)

| Deliverable | Status |
| :--- | :---: |
| `SKILL_Debtors_Orchestrator.md` | ✅ |
| `parse_global_aged_debt.mjs` + `portfolio_candidates.csv` | ✅ |
| Orchestrator KPIs in `DEBTORS_DASHBOARD.md` | ✅ |
| `HUMAN_TASKS.md` queue (TWK002 H-001–H-007) | ✅ |
| `debtors:parse-backlog` npm script | ✅ |
| Sync skip for `Global Reports/` | ✅ |
| Three human agent skills | ✅ |
| PRD + Roadmap (this doc) | ✅ |

**Operator commands:**

```bash
npm run debtors:parse-backlog
npm run debtors:sync
# Then: "View dashboard"
```

---

## Phase 2 — Active work (now)

Priority order — one bounded turn at a time; do not parallelise finance-dependent lanes. Respect **Blocked by** in `HUMAN_TASKS.md`.

| # | Account / work | Lane | Owner | Exit criteria |
| :---: | :--- | :--- | :--- | :--- |
| 2.1 | **TWK002** controller sign-off | governance | Collections Agent (**H-006**) | Path B approved — **gates** H-003–H-005 |
| 2.2 | **TWK002** finance catch-up | settlement_discount | ERP Agent (**H-003–H-005**) | Checklist rows DONE; recreated ledger ≈ ERP |
| 2.3 | **TWK002** fresh TXT + verify | sources + worker | Sources Agent (**H-007**) | Balance drift resolved; PM sets recon progress |
| 2.4 | **WES004** LOD follow-up | collections | Collections Agent | Response logged or escalated |
| 2.5 | **TAN001** draft LOD | collections | Collections Agent | LOD sent; `dateSent` in `project.json` |
| 2.6 | **WO0001** baseline recon | allocation | Worker → PM | `reconState: complete` or documented exceptions |

---

## Phase 3 — Portfolio expansion (next)

| # | Item | Trigger |
| :---: | :--- | :--- |
| 3.1 | Onboard **Tier A off-portfolio** account (e.g. DON001, TOP000, CAP000) | Creditor controller prioritises from `portfolio_candidates.csv` |
| 3.2 | **JIM001** collection assessment | Recon complete; R73k 180+ — governance decision |
| 3.3 | **BU0009** / **FAM000** scaffold → real ingest | Sources Agent TXT + remittances if applicable |
| 3.4 | **FAM000** ERP balance drift | Global report R103k vs project placeholder R0 |
| 3.5 | Lane auto-suggest refinement | Tune `suggested_lane` in parse script from TWK/WO learnings |

---

## Phase 4 — Human ops maturity (deferred)

| Item | Notes |
| :--- | :--- |
| `Owner` column populated in `HUMAN_TASKS.md` | Named staff per role |
| `SOURCES_INTAKE.md` per account | Only if intake volume exceeds shared queue |
| Human agent onboarding one-pagers | Printable checklists for new clerks |
| SLA / due-date alerts | Dashboard WARN when H-* overdue |

> **Note:** `Blocked by` column added in Phase 1.1 (2026-07-13) — not deferred.

---

## Phase 5 — UI & automation (deferred / out of MVP)

| Item | Notes |
| :--- | :--- |
| HTML portfolio dashboard | Markdown sufficient for MVP |
| `KPI_SNAPSHOT.json` time series | Trend charts for management |
| Event sourcing (`shared/events/`) | Architecture reserved, inactive |
| Autonomous ERP integration | Explicitly rejected — human ERP Agent only |
| Auto-send collection email | Explicitly rejected — Collections Agent manual send |
| Investigation workspace for all accounts | WO0001 pattern; expand after allocation lane stable |

---

## Decision reminders

Quick reference so future sessions do not re-debate settled choices:

1. **Markdown dashboard** — not HTML portfolio (D1)
2. **Parse backlog** — not chat-read global TXT (D2)
3. **Three human agents** — ERP, Collections, Sources (D3)
4. **Gather vs parse** — Sources uploads; workers parse (D4)
5. **Repo > chat** — `project.json` and CSVs are truth; transcripts are context only (D11)
6. **No collection without recon** — WO0001 R110k blocked (state machine)

---

## Milestone targets

| Milestone | Target | Indicator |
| :--- | :--- | :--- |
| M1: TWK002 finance complete | Jul 2026 | H-006 → H-003–H-005 → H-007 all DONE; balance verified |
| M2: WO0001 recon complete | Aug 2026 | `reconState: complete` |
| M3: Recon complete rate ≥ 50% | Q3 2026 | 5/10 accounts |
| M4: First Tier A onboarding | Q3 2026 | New `project.json` from backlog parser |
| M5: Collection-blocked exposure < R100k | Q4 2026 | Dashboard KPI |

---

## Related skills index

| Skill | Path |
| :--- | :--- |
| Orchestrator | `.agents/skills/SKILL_Debtors_Orchestrator.md` |
| Project Manager | `.agents/skills/SKILL_Debtors_Project_Manager.md` |
| Human ERP | `.agents/skills/SKILL_Human_ERP_Agent.md` |
| Human Collections | `.agents/skills/SKILL_Human_Collections_Agent.md` |
| Human Sources | `.agents/skills/SKILL_Human_Sources_Agent.md` |
