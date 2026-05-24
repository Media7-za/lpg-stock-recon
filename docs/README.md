# System Index — LPG Stock Recon App

**Version:** 1.0
**Last updated:** 2026-05-24
**Status:** Active
**Repo:** Media7-za/lpg-stock-recon
**Live app:** https://lpg-stock-recon.vercel.app
**Jira:** Project LSR

---

## What This System Is

A Progressive Web App (PWA) for LPG cylinder stock reconciliation with dual
reconciliation tracking across deposit shells and gas content.

The system bridges two operational surfaces:

- **Field Counter PWA** — a mobile-first offline-capable PWA used by yard workers
  to capture physical cylinder counts by zone, size, and brand
- **Manager Dashboard** — a desktop interface for depot managers to ingest ERP
  data, run reconciliation math, investigate variances, and export reports

Both surfaces operate on the same SKU structure and reconciliation model.
Neither invents its own stock codes or variance types.

---

## Document Map

Read documents in this order when starting a new session.
Authority flows from top to bottom — higher documents win on conflict.

### 1. Governance (read first — always)

| Document | Purpose | Authority |
|---|---|---|
| `docs/governance/authority_model.md` | Which document wins when two conflict. 5-level hierarchy. | Level 0 — above all |
| `docs/governance/changelog_policy.md` | How to document changes to governance docs | Level 1 |

### 2. System Context (what the system currently is)

| Document | Purpose |
|---|---|
| `docs/CURRENT_CONTEXT.md` | Current architecture — DataHub, Supabase views, AuditDashboard |
| `docs/USER_FLOW.md` | End-to-end user flows: Field Counter and Depot Manager |
| `LPG-Stock-Recon-Blueprint.md` | Project blueprint: epics, reconciliation logic, SKU structure |

### 3. Architecture

| Document | Purpose |
|---|---|
| `docs/architecture/` | Architecture notes produced by ARCHITECT-AGENT |
| `docs/domain-api.md` | Domain API contracts |
| `prisma/schema.prisma` | Database schema (source of truth for data structure) |
| `supabase/deploy_all.sql` | Supabase views and functions |

### 4. Feature Slices

| Document | Purpose |
|---|---|
| `docs/LSR-3-Invoice-Dispatch/` | Invoice dispatch slice docs |
| `docs/LSR-5-Item-Aware-Recon/` | Item-aware reconciliation slice docs |
| `docs/debtors-recon/` | Debtors reconciliation slice docs |

### 5. Agent Operating Docs

| Document | Purpose |
|---|---|
| `docs/session_prompts.md` | Entry points for every agent role |
| `docs/agent_prompt_template.md` | How to wrap a Jira ticket before handing it to a coding agent |
| `docs/Pipelines/feature_pipeline.md` | How to run a feature build end to end |
| `docs/Pipelines/financial_control_pipeline.md` | Financial control pipeline |
| `docs/roles/` | 13 role docs — one per agent type |
| `docs/handoffs/` | Session handoff docs — read the latest before starting |

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│              LPG Stock Recon App                     │
│                                                      │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │   Field Counter     │  │   Manager Dashboard    │ │
│  │   PWA (mobile)      │  │   (desktop)            │ │
│  │   Offline-first     │  │   AuditDashboard.tsx   │ │
│  └──────────┬──────────┘  └──────────┬─────────────┘ │
│             │ Dexie (offline)        │               │
│             │ useSync (online)       │ Supabase SDK  │
│             ▼                        ▼               │
│  ┌──────────────────────────────────────────────┐    │
│  │          Supabase / PostgreSQL               │    │
│  │  transaction_headers  transaction_items      │    │
│  │  sync_logs            unique_accounts (view) │    │
│  │  reconciliation_summary (view)               │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS v3, Prisma v6
**Offline layer:** Dexie.js (IndexedDB)
**Backend:** Supabase PostgreSQL + Supabase views
**Deployment:** Vercel (Hobby plan) via git push → auto-deploy
**ERP parsing:** PapaParse (CSV/TXT)

---

## Core Reconciliation Model

### SKU Structure

| Type | SKU pattern | Tracks |
|---|---|---|
| Deposit (shells) | `.1` variants (9.1, 14.1, 19.1) | Total cylinders |
| Content (gas) | `.3/.4/.01` variants (9.3, 9.4, 901) | Gas content by brand |

### Three-Tier Reconciliation Math

```
Tier 1 — SOH Variance:
  Physical Count − System SOH (STKCOUNT.csv)
  → Identifies immediate shrink or missing stock

Tier 2 — Movement Variance:
  Expected Afternoon = Morning Physical + Net Movement (CURRENT.TXT)
  → Identifies missing paperwork (Invoices or GRVs)

Tier 3 — Timeline Variance:
  (Afternoon Physical − Morning Physical) − Net Movement per CURRENT.TXT
  → Pinpoints when the entry was missed
```

**Auto-shell rule:** Every counted full cylinder (content SKU) automatically
contributes 1x to the deposit shell pool. This is enforced by the engine —
never manually added by a user.

---

## User Roles

| Role | Surface | What they do |
|---|---|---|
| **Field Counter** | Mobile PWA | Capture physical cylinder counts by zone, size, brand |
| **Depot Manager** | Desktop Dashboard | Ingest ERP data, run reconciliation, investigate variances |
| **Admin** | Both | All above + manage master data |

---

## Known Gotchas (Engineering)

| Gotcha | Prevention |
|---|---|
| Prisma `where: raw()` syntax → fails on Vercel WASM parser | Use SQL migrations for partial indexes — never `raw()` in schema |
| `package.json` truncated mid-write → build error | Validate JSON after every edit: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` |
| `vercel deploy` CLI → blocked on Hobby plan under agent git identity | Always use `git push origin main` — Vercel auto-deploys via GitHub |
| CSS scoped to component → `body.scrolled` selectors don't apply | Use `pageRef` wrapper for scroll state, not `document.body` |
| Agent deploys stale Dexie schema → old IndexedDB persists in browser | Always bump the Dexie version number when modifying stores |
| Supabase split payments → double-counted in reconciliation | Aggregate by parent sum using `GROUP BY` — see `reconciliation_summary` view |

---

## Agent Reading Order (New Session)

```
1. docs/handoffs/{latest date}.md        — what's in flight
2. docs/governance/authority_model.md   — which doc wins conflicts
3. docs/CURRENT_CONTEXT.md              — current architecture state
4. LPG-Stock-Recon-Blueprint.md         — domain logic and epics
5. Relevant slice doc (LSR-3/, LSR-5/, debtors-recon/ as applicable)
6. docs/roles/{your-role}.md            — your specific instructions
```

Never skip steps 1–3. The most common source of bugs is an agent that
skipped the governance docs and invented behaviour.
