# PRD: Debtors Orchestration & Human Agent Model

**Slice:** Debtors Portfolio Management — Orchestration MVP  
**Status:** Approved / In delivery  
**Last updated:** 2026-07-21  
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
| D13 | **Projection primary operator artifact; doctrine consolidated** | Single constitutional file `DEBTORS_DOCTRINE.md`; governance §7; projections max 5 questions | Ad-hoc doctrine in skills/docs |

**Ruling (2026-07-20, operator-ratified — Turn 10):** Projection is the primary operator artifact; doctrine consolidated to `DEBTORS_DOCTRINE.md`; governance per constitutional §7.

| # | Decision | Rationale | Rejected alternative |
| :---: | :--- | :--- | :--- |
| D14 | **`ref_no` advisory globally; payer-class exception in allocation lane** | Customer-authored bank-import refs may corroborate/close when candidate set already constrained; clerk-keyed/mixed provenance never elevated; conflicting evidence → STOP; Turn 8b Step 1 activation | Global elevation of ref_no (Turn 8b C1 open) |
| D15 | **Edge labels ≠ epistemic tags** | `Confirmed` edge is not `PROVEN` until closed identity/conservation; glossary separates allocation confidence from fact tags | Using Confirmed and PROVEN interchangeably |

**Ratified 2026-07-22 (Turn 11C — operator):** D14 and D15 committed to `DEBTORS_DOCTRINE.md` §4; supersede pending C1 status in Operator View and orchestrator conflict notes.

| # | Decision | Rationale | Rejected alternative |
| :---: | :--- | :--- | :--- |
| D16 | **Evidence refresh (TXT/DB) is an implicit root invalidator for the allocation cluster** (`allocation.edges`, `allocation.report`, `settlement.discount`, `payment.pattern`, `balance.bridge`, `event.ledger`) — already stated by `DEBTORS_DOCTRINE.md` §3 ("material evidence change invalidates stale projections until re-run"); no new mechanism needed | Enumerating a separate "TXT changed" trigger edge on each of the six slices individually — six copies of the same rule, easy to let drift out of sync |
| D17 | **`settlement.discount` and `allocation.edges` are siblings sharing one trigger** ("remittance batch ingested"), not a causal chain — a discount recompute does not invalidate payment→invoice edges; they're two independent decompositions of the same batch (cash/discount split vs. which invoices it cleared) | `settlement.discount → invalidates → allocation.edges` (asserted without a demonstrated dependency in the six-slice cluster table) |
| D18 | **`payment.pattern` and `allocation.edges` are not parallel per-debtor slices** — they are the outputs of the two recon lanes already defined in §6 / `SKILL_Debtors_Orchestrator.md` §4 (`allocation` vs `position_recon` payment-pattern). An account is on one lane or the other. Lane membership is **derived** from which artifacts already exist for that account (`payment_pattern_overrides.json` vs. allocation edges/report presence) — per `DEBTORS_DOCTRINE.md` §2, "state is derived," not stored as new authoritative input | A new `project.json` field (e.g. `accountClass` / `operatorLayout`) to encode lane choice as fresh authoritative state |

**Ratified 2026-08-26 (operator, this session — allocation-cluster dependency graph review):** D16–D18 apply to any future `allocation.edges` / `allocation.report` / `settlement.discount` / `payment.pattern` / `balance.bridge` / `event.ledger` regeneration tooling. Corrects a proposed six-slice "regenerate when… / invalidates…" table that (a) omitted the evidence root, (b) asserted an unverified settlement→allocation causal edge, and (c) modeled the two payment-matching lanes as always-parallel instead of mutually exclusive.

> ⚠️ **D18 is superseded in part by D18-A below.** Its clause "an account is on one lane or the other" was ratified on doctrine text without an artifact audit, and the folders contradict it. Retained verbatim per `DEBTORS_DOCTRINE.md` §5 (history immutable; supersession explicit, not erasure). The rest of D18 — lane membership is *derived*, not a new `project.json` field — stands unchanged.

| # | Decision | Rationale | Rejected alternative |
| :---: | :--- | :--- | :--- |
| **D18-A** | **AMENDS D18 — lanes are cumulative layers, not mutually exclusive.** `position_recon` is the always-present base; `allocation` and `settlement_discount` are **capabilities layered on top** when evidence supports them. An account may carry two or three simultaneously | Artifact audit (2026-09-14) contradicts D18's exclusivity clause. **100% overlap**: all 5 accounts holding `data/allocation_edges.csv` also hold `config/payment_pattern_overrides.json`. **JIM001** — PRD §6's explicit "payment-pattern, **not** allocation skill" exemplar — holds the portfolio's *largest* edge set (393 rows, full `evidence_source`/`confidence`/`allocation_type` schema) **and** 36 pattern overrides (22.6 KB). **TWK002** runs all three layers at once (pattern 12.1 KB + `settlement_discount_overrides.json` + 170 edges). **MOZ002**: pattern 27.2 KB + settlement + 55 edges | Keeping D18's exclusivity clause and treating JIM001/TWK002/MOZ002 as exceptions — would make the rule describe no account in the portfolio |
| **D19** | **`position_recon` (payment-pattern) is the DEFAULT lane.** An account starts here; it *adds* `allocation` or `settlement_discount` only when remittance evidence actually lands. Never the reverse assumption | Remittance evidence — the qualifier for the allocation/settlement layers — exists for only **3 accounts portfolio-wide** (`HUMAN_TASKS.md` H-018; TWK002, MD0003, +1 unconfirmed). H-016 already rules this way for 8 named accounts: *"None of these eight has remittance advices and none is expected to… the route is the **pattern lane**."* §6's own signal for `position_recon` — "Standard ERP TXT + baseline / payment pattern" — is already worded as the no-extra-evidence baseline | Leaving the default implicit, forcing each onboarding turn to re-derive routing from scratch (and re-litigate H-016) |
| **D20** | **Lane taxonomy: 3 lanes + 1 modifier + 2 non-lane states.** Lanes: `position_recon` (default), `allocation`, `settlement_discount`. Modifier: `+statement` (v4\|v5) — attaches to `position_recon` only. Non-lane states: `defer` (triage hint, no worker, revisable, requires recorded basis/as-at/reopening condition) and `collections` (human queue, downstream of `reconState: complete` + D17) | Both §6 and orchestrator §4 list `position_recon` **twice** (plain and "+ statement"); the second is a deliverable modifier, not a routing decision — orchestrator §4 says so itself: *"Statement layout skills are `position_recon`-only."* Artifact audit confirms `collections` generates **zero** recon components (WES004, TAN001 have no `config/`, `data/` or `scripts/`) and `defer` accounts (BU0002, IVE001) have **no folder at all** — neither is a lane | Keeping six flat rows, which double-counts `position_recon` and lets a human queue and a null state read as peers of real worker lanes |

**PROPOSED 2026-09-14 — pending operator ratification.** Basis: empirical artifact audit of all 15 `analysis/debtors/*` folders (config/data/scripts/docs inventory), not doctrine text alone. **On ratification, three follow-on edits are required in the same commit:** (1) restructure §6 below and `SKILL_Debtors_Orchestrator.md` §4 to the D20 shape; (2) reconcile the two files' wording drift — §6 says `allocation` signal is "allocation edges" while §4 says "deposit allocation mismatch", and §6 says `defer` covers "credit balance" while §4 says "unallocated" — §6's own rule ("disagreement between the two is a validation failure") makes this a defect regardless of D20; (3) record that `JEN001/config/payment_pattern_overrides.json` declares `"lane": "stripped_gas_payment_pattern"`, a vocabulary appearing in no doctrine table and on no other account — either promote it or retire it.

---

## 6. Recon lanes

> **Canonical routing:** `.agents/skills/SKILL_Debtors_Orchestrator.md` §4. This table states the *product requirement* that lanes exist and what each is for; it is **not** a second source of routing truth. Any change to §4 must be reflected here in the same commit — disagreement between the two is a validation failure.

| Lane | Signal | Exemplar account | Worker playbook |
| :--- | :--- | :--- | :--- |
| `settlement_discount` | Remittance batches; missing `DISCOUNT ALLOWED` | TWK002 | Doctrine v2 + finance checklist |
| `allocation` | Payment `ref_no` / allocation edges | WO0001, BU0005 | `SKILL_Payment_To_Invoice_Allocation.md` · `SKILL_BU0005_Allocation_Worker.md` |
| `position_recon` | Standard ERP TXT + baseline / payment pattern | WES004, **JIM001** | `debtors-analysis_Skill.md` |
| `position_recon` + statement | Full Statement of Account required | MOZ002 (v4) · **JEN001** — ratified record is **v4**; v5 generated but uncommitted, migration unconfirmed | `SKILL_Debtor_Statement_v4_From_TXT.md` · `SKILL_Debtor_Statement_v5_From_TXT.md` |
| `collections` | `reconState: complete` + 180+ aged | WES004, TAN001 | `ACTION_PROMPTS.md` |
| `defer` | COD micro-balance, empties, credit balance | BU0002, IVE001 | No worker dispatched — **not a disposal.** Requires recorded basis, as-at date, threshold/reason, reopening condition |

**JIM001 nuance:** Complete recon via **payment-pattern** analysis — not allocation skill.

**`defer` is revisable.** MOZ002 was triaged `defer`/tier B and later reconciled to `complete`. Treat the tier hint in `portfolio_candidates.csv` as triage input, never as a decision to stop.

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
