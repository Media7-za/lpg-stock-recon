# TDR-001: Platform Architecture — ERPNext & Medusa Integration Strategy

**Status:** Accepted  
**Date:** 2026-05-24  
**Author:** PM  
**Project:** LPG Stock Recon App (LSR)  
**Supersedes:** None  

---

## Context

Media Seven operates multiple business systems. The LPG Stock Recon App is one slice in a multi-module platform. It ingests raw FINCON ERP exports (`.TXT`, `.CSV`) to reconcile physical cylinder counts against system stock. It does not replace ERPNext, Medusa, or the Orders dispatch module.

---

## Decision

### 1. LSR is a read-only ERP consumer

The Stock Recon App **reads** ERP data via file upload — it does not write back to FINCON/ERPNext.

**LSR ingests:**
- `STKCOUNT.csv` — system on-hand snapshots
- `CURRENT.TXT` — daily movement (invoices, GRVs)
- Transaction headers/items/balances — via DataHub drop zones

**LSR must NOT build:**
- Live ERPNext API integration (unless explicitly scoped in a future LSR epic)
- Invoice or GRV creation
- Debtors ledger management (see `docs/debtors-recon/` for the dedicated debtors slice)
- Medusa e-commerce integration

### 2. Sibling modules — separate repos, shared business domain

| Module | Repo | Relationship to LSR |
|---|---|---|
| Stock Recon | `Media7-za/lpg-stock-recon` | This repo |
| Orders & Dispatch | `Media7-za/Orders-Module` | Sibling — operational delivery, separate scope |
| ERPNext / FINCON | External | Source of truth for financial/stock ledger |
| Medusa | External | E-commerce — no LSR integration |

Do not merge dispatch logic into LSR or vice versa. Cross-module features require PM scope decision on both projects.

### 3. Data flow pattern

```
FINCON ERP (export .TXT / .CSV)
        │
        │  Manual upload or scheduled export
        ▼
DataHub (browser — PapaParse)
        │
        │  Validated + logged to sync_logs
        ▼
Supabase PostgreSQL
        │
        ├── transaction_headers / transaction_items
        ├── unique_accounts (view)
        └── reconciliation_summary (view)
        │
        ▼
AuditDashboard (variance reports, CSV export)

Field Counter PWA (Dexie offline)
        │
        │  Background sync when online
        ▼
Supabase (physical count sessions)
```

### 4. Reconciliation is deterministic, not narrative

All variance calculations must be reproducible from the same inputs. Agents must not add heuristic or AI-based reconciliation — math only. Three tiers: SOH, Movement, Timeline (see Blueprint Section 3).

### 5. Agent enforcement

- No live ERP API clients unless a Jira ticket explicitly scopes an integration epic
- No billing, invoicing, or Medusa logic in LSR
- Schema/view changes require approved Schema Diff before coding
- Debtors analysis follows `.agents/skills/debtors-analysis_Skill.md` — separate from stock recon math

---

## Consequences

### Positive
- LSR stays focused on reconciliation — clear agent boundaries
- ERP export format changes are isolated to `erpImportEngine.ts` and DataHub
- Offline PWA works independently of ERP connectivity

### Tradeoffs
- Manual file upload required — no real-time ERP sync
- SKU mapping must be maintained when ERP introduces new codes
- Cross-module reporting (dispatch + recon) requires future integration work

---

## Related documents

| Document | Relationship |
|---|---|
| `LPG-Stock-Recon-Blueprint.md` | Product epics and reconciliation logic |
| `docs/CURRENT_CONTEXT.md` | Current architecture state |
| `docs/agent_prompt_template.md` | Coding agent wrapper with context blocks |
| `.agents/skills/debtors-analysis_Skill.md` | Debtors slice (financial, not stock recon) |
| `Media7-za/Orders-Module` | Sibling dispatch module |

---

## Revision history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-24 | Initial — LSR as read-only ERP consumer, sibling module boundaries |
