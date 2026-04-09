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
