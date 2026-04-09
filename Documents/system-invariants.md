# LPG Stock Recon — System Invariants & Guardrails

These rules are **non-negotiable** and enforced across the system via API validation and database constraints.

## 🔐 Core Invariants

1. **Session Precedence:** A session MUST exist before any counts are recorded.
2. **Strict Ownership:** Every count MUST belong to exactly one session.
3. **Immutability:** A `CLOSED` session is immutable. No writes are allowed.
4. **Reconciliation Cycle:** Reconciliation can only run once per successful cycle (must finish or fail before restarting).
5. **Lock Timing:** Counts cannot be modified/submitted during `RECONCILING`.
6. **Mandatory Review:** A session must reach `REVIEWED` before `CLOSED` (unless manually overridden by a site manager).
7. **Audit Trail:** All state transitions MUST be logged in the `audit_log` with `from_state` and `to_state`.
8. **Idempotency:** Duplicate submissions MUST be prevented via mandatory `idempotencyKey`.
9. **Atomic Processing:** A session can only have one active reconciliation process at a time.
10. **Data Dependencies:** An ERP snapshot must exist before reconciliation can start.

## 🔒 Enforcement Behavior
- **Invalid Transitions:** Return `400 BAD REQUEST (INVALID_STATE_TRANSITION)`.
- **Locked Sessions:** Return `423 LOCKED (SESSION_LOCKED)`.
- **Duplicate Requests:** Return cached response via `idempotency_keys` table.
