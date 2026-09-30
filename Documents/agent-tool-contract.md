# LPG Stock Recon — Agent Tool Contract

This document defines the behavior expected of the AI Agent when interacting with the LPG Stock Recon system.

## 🧠 Agent Behavior Rules

1. **Check Before Action:** Always call `getSession()` to check for an active session and its current state before performing any writes.
2. **Respect Immutability:** NEVER attempt to operate on `CLOSED` sessions.
3. **Respect Locks:** Do not submit counts or update notes during `RECONCILING`.
4. **Failure Handling:** Only retry reconciliation if the state is explicitly `FAILED`.
5. **Observability:** Always request reconciliation status via `getReconciliationPipelineStatus()` before reporting completion to the user.

## 🔧 Available Tools (Final Blueprint)

### Session Management
- `startCountSession(date)`
- `getSession(sessionId)`
- `closeSession(sessionId)`

### Inventory & Sync
- `fetchInventorySnapshot(date)`
- `submitPhysicalCount(sessionId, payload, idempotencyKey)`
- `getSessionCounts(sessionId)`

### Reconciliation
- `startReconciliation(sessionId)`
- `getReconciliationPipelineStatus(sessionId)`
- `getReconciliationReport(sessionId)`

### Discrepancies
- `upsertDiscrepancyNote(sessionId, note)`

### System
- `getSyncStatus()`

### Pricing / Delivery Economics (004B — Trip Cost Engine)
- `calculate_delivery_cost(input)` — `calculateDeliveryCost()` in `src/features/pricing-desk`, or `POST /functions/v1/pricing/delivery-cost-calculate`
- `get_delivery_cost_calculation(calculation_id)` — `getDeliveryCostCalculation()` in `src/features/pricing-desk`, or `GET /functions/v1/pricing/delivery-cost?calculationId=...`

Full input/output schema, governance-flag semantics, and worked examples:
`docs/Pricing-Desk-Phase-4-Engines/004B_Delivery_Cost_Calculator_Agent_Contract.md`.
Routing rule for when a Pricing Desk agent must call these tools instead of
computing delivery economics itself: `.agents/skills/SKILL_Pricing_Desk_Agent.md`.

**Status:** deployed to the live `lpg-stock-recon` Supabase project (schema
+ seed confirmed via direct query; `pricing` Edge Function `ACTIVE`) but not
yet confirmed reachable over HTTP from an agent session — the final smoke
test needs to run from a machine with network access to `*.supabase.co`.
Do not treat this tool as verified until that smoke test (POST then GET,
values compared) has actually passed.
