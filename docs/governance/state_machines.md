# State Machines

> **Agent Rule:** Before implementing any feature that creates or updates a stateful entity, check the relevant state machine below. Every transition has side effects. A transition is not complete until ALL side effects are implemented.

---

## Operational Surface Rule

This app has three operational surfaces:
- **Depot Manager Web** — full access to all workflows
- **Invoice Clerk Web** — AR reconciliation, dispatch
- **Yard Counter PWA** — physical count sessions only

These surfaces:
- DO NOT own separate lifecycle states
- DO NOT create parallel state machines
- OPERATE on the same canonical state machines defined below

### Ownership Rule

| Transition | Owner |
|---|---|
| PhysicalCountSession: `in_progress` → `completed` | Yard Counter / Depot Manager |
| ReconciliationSession: `OPEN` → `DRAFT` | Invoice Clerk / Depot Manager |
| ReconciliationSession: `DRAFT` → `FINALIZED` | Depot Manager ONLY |
| DebtorWorkspace: any status → `approved_internal` | Depot Manager ONLY |
| DebtorWorkspace: `approved_internal` → `customer_ready` | Depot Manager ONLY |

---

## ReconciliationSession State Machine

**Entity:** `ReconciliationSession`
**Field:** `status` (string, ALL CAPS)

```
[OPEN] ──► [DRAFT] ──► [FINALIZED]
```

### Transitions

| From | To | Trigger | Side Effects |
|---|---|---|---|
| — | `OPEN` | Session created for account | Lock account to single active session |
| `OPEN` | `DRAFT` | Operator saves partial work | Persist current allocation state |
| `DRAFT` | `FINALIZED` | Operator finalises session | Write `finalized_at`; mark session closed; prevent further allocations |

### Rules
- One active session per `account_no` at a time
- `FINALIZED` is terminal — no transitions out
- ERP balance convergence is NOT required for finalisation (INV-008)
- `UNCLASSIFIED_EXCEPTION` records block finalisation until operator classifies them
- `DEBIT_ADJUSTMENT` requires a danger-class confirmation modal before any transition

---

## PhysicalCountSession State Machine

**Entity:** `PhysicalCountSession`
**Fields:** `status` (string, snake_case) + `current_state` (string, ALL CAPS)

```
status:        in_progress ──────────────────────► completed
current_state: OPEN ► COUNTING ► SYNCED ► RECONCILING ► RECONCILED ► REVIEWED ► CLOSED
                                                                              └► FAILED
```

### Transitions (current_state)

| From | To | Trigger | Side Effects |
|---|---|---|---|
| — | `OPEN` | Session created | Initialise zones |
| `OPEN` | `COUNTING` | Counter starts entering quantities | — |
| `COUNTING` | `SYNCED` | Count submitted and synced to server | Set `syncedAt`; set `status = completed` |
| `SYNCED` | `RECONCILING` | Depot Manager opens reconciliation view | — |
| `RECONCILING` | `RECONCILED` | Reconciliation calculation run | Write variance records |
| `RECONCILED` | `REVIEWED` | Depot Manager reviews and acknowledges | — |
| `REVIEWED` | `CLOSED` | Session closed | — |
| Any | `FAILED` | Sync or reconciliation error | Log error; allow retry |

---

## DebtorWorkspace Status Machine

**Entity:** `DebtorWorkspaceState` (fixture/agent-produced)
**Field:** `status` (string, snake_case)

```
[pending_review]
      │
      ├──► [clean] ──────────────────────► [approved_internal] ──► [customer_ready] ──► [sent]
      │
      ├──► [cylinder_variance] ──────────► [approved_internal] ──► [customer_ready] ──► [sent]
      │
      └──► [erp_exception] ─────────────► [approved_internal] ──► (customer_ready blocked — see rule)
```

### Transitions

| From | To | Trigger | Side Effects |
|---|---|---|---|
| — | `pending_review` | Agent/script generates workspace state | Create workspace artifact |
| `pending_review` | `clean` \| `cylinder_variance` \| `erp_exception` | Agent classifies account | Update status badge |
| Any | `approved_internal` | Depot Manager approves internal view | Lock internal HTML artifact |
| `approved_internal` | `customer_ready` | Depot Manager approves customer view | Lock customer HTML artifact |
| `customer_ready` | `sent` | Statement dispatched to customer | Log send event |

### Rules
- `erp_exception` accounts may reach `approved_internal` but require explicit PM decision before `customer_ready`
- `sent` is terminal for a given period — new period requires a new workspace generation
- React surfaces status transitions as placeholder actions only — agent/script workflow executes them (INV-003)

---

## Exception Lane State Machine

**Entity:** `ExceptionRecord` (within ReconciliationSession)

| Lane | Blocking? | Resolution |
|---|---|---|
| `Suspense-PMT` | No | Second operator allocation action |
| `UNCLASSIFIED_EXCEPTION` | **Yes — blocks FINALIZED** | Operator classifies Bank UD or Journal |
| `DEBIT_ADJUSTMENT` | No | Operator confirms danger modal |
| `ROUNDING_WRITE_OFF` | No | One-click operator approval (≤ R1.00) |
| `OPERATIONAL_EXCEPTION` | No — custody lane only | Operator reviews unmatched zero-value CRNs |

---

## Validation Rules

The backend must enforce the following before processing any state transition:

- **Authorization:** Actor must have the correct `UserRole` for the transition.
- **Entity State:** Entity must be in an eligible `From` state — reject with `409 Conflict` if not.
- **Blocking Exceptions:** `UNCLASSIFIED_EXCEPTION` records must be resolved before `FINALIZED`.
- **Idempotency:** Duplicate allocation requests with the same `sourceId`/`targetId` pair must not create duplicate `AllocationEvent` records.
- **Date Invariant:** `invoice_date ≤ payment_date` must hold — reject future-dated allocations with `400 Bad Request`.

Invalid actions return:
- `409 Conflict` — state machine violation
- `400 Bad Request` — validation or date invariant error
- `403 Forbidden` — role not authorised for this transition

---

## Offline / PWA Rules

| Action | Allowed offline | Sync rule |
|---|---|---|
| PhysicalCount zone entry | Yes — queued locally in Dexie | Sync on reconnect via `syncService` |
| Count submission | Yes — queued | Conflict resolution: server state wins |
| Allocation event | **No** — requires server confirmation | Must be online |
| Session finalisation | **No** — requires server confirmation | Must be online |
