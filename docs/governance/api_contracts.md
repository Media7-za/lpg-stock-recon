# API Contracts

> **Agent Rule:** Before calling any endpoint or implementing any handler, read the full contract for that endpoint here. Pay particular attention to:
> 1. The ID type required (`account_no` String vs `TransactionHeader.id` BigInt vs cuid — they are NOT interchangeable)
> 2. The side effects — what else changes when this endpoint is called
> 3. The exact status string values and casing — wrong casing causes silent failures
> 4. Payment polarity — negative amounts are credits (cash received), positive are adjustments

---

## Accounts

### GET /api/accounts
**Purpose:** List all debtor accounts.

**Response shape:**
```typescript
Account[]
// { id: string; accountNo: string; currentName: string; accountType?: string }
```

---

### GET /api/accounts/:accountNo
**Purpose:** Fetch a single account with its current reconciliation session.

**Path param:** `accountNo` — String, e.g. `'JEN001'` (NOT the cuid `id`)

**Response shape:**
```typescript
{
  account: Account
  session: ReconciliationSession | null
}
```

---

## Transactions

### GET /api/accounts/:accountNo/transactions
**Purpose:** Fetch all ERP transactions for an account, normalised for the allocation workbench.

**Path param:** `accountNo` — String

**Query params:**
| Param | Type | Values | Notes |
|---|---|---|---|
| `entry_type` | string | `'Invoice'` `'Payment'` `'Crd Note'` | Exact casing required |
| `period` | number | e.g. `202605` | YYYYMM format |

**Response shape:**
```typescript
{
  headers: TransactionHeader[]
  lineItems: TransactionLineItem[]
}
```

**Payment polarity note:** Payment `amount` values are negative (credits). Positive payment `amount` = adjustment/reversal. Do not negate before display without understanding the context.

---

## Reconciliation Sessions

### POST /api/sessions
**Purpose:** Create a new reconciliation session for an account.

**Request body:**
```typescript
{ account_no: string }
```

**Side effects:**
- Creates `ReconciliationSession` with `status: 'OPEN'`
- Only one active session per `account_no` — returns `409 Conflict` if one already exists

---

### PATCH /api/sessions/:id
**Purpose:** Update session status.

**Request body:**
```typescript
{ status: 'DRAFT' | 'FINALIZED' }
```

**Side effects when `status: 'FINALIZED'`:**
- Sets `finalized_at` to current timestamp
- Blocks further `AllocationEvent` creation for this session
- Returns `409 Conflict` if any `UNCLASSIFIED_EXCEPTION` records remain unresolved

---

## Allocations

### POST /api/allocations
**Purpose:** Create a single operator-confirmed allocation of a payment against an invoice.

**Request body:**
```typescript
{
  session_id: string            // ReconciliationSession.id (cuid)
  credit_doc_id: number         // Payment TransactionHeader.id (BigInt → number)
  invoice_doc_id: number        // Invoice TransactionHeader.id (BigInt → number)
  amount: number                // Amount to allocate (always positive)
  is_auto_accepted: boolean
  actor_id?: string             // User.id if authenticated
}
```

**Side effects:**
- Creates `AllocationEvent` with `eventType: 'ALLOCATE'`
- Updates `available_balance` on both source and target `TransactionHeader`
- If payment remainder > 0 → creates `Suspense-PMT` exception record

**Constraints:**
- One PMT → one invoice. Returns `400` if `credit_doc_id` already has a full allocation.
- `invoice_date ≤ payment_date` must hold. Returns `400` if violated.
- `amount` must not exceed the lesser of source and target `available_balance`.

---

### DELETE /api/allocations/:id
**Purpose:** Deallocate a previously confirmed allocation.

**Side effects:**
- Creates `AllocationEvent` with `eventType: 'DEALLOCATE'`
- Restores `available_balance` on both source and target
- Removes associated `Suspense-PMT` if present

---

## Physical Count Sessions

### POST /api/counts
**Purpose:** Create a new physical count session.

**Request body:**
```typescript
{
  sessionType: 'AM' | 'PM'
  counterName?: string
}
```

**Side effects:** Creates `PhysicalCountSession` with `status: 'in_progress'`, `current_state: 'OPEN'`

---

### PATCH /api/counts/:id
**Purpose:** Update count session state.

**Request body:**
```typescript
{ current_state: 'COUNTING' | 'SYNCED' | 'RECONCILING' | 'RECONCILED' | 'REVIEWED' | 'CLOSED' | 'FAILED' }
```

**Side effects when `current_state: 'SYNCED'`:**
- Sets `status: 'completed'`
- Sets `syncedAt` timestamp

---

## Reference Data (Always fetch — never hardcode)

| Endpoint | Returns | Notes |
|---|---|---|
| `GET /api/products` | `Product[]` | SKUs with stock numbers, descriptions, categories |
| `GET /api/products/skus` | Cylinder SKUs only | Filter: `category = 'CYL_DEPOSIT'` |

---

## Status Value Quick Reference

| Entity | Valid Status Values | Casing |
|---|---|---|
| `ReconciliationSession.status` | `'OPEN'` `'DRAFT'` `'FINALIZED'` | ALL CAPS |
| `PhysicalCountSession.status` | `'in_progress'` `'completed'` | snake_case |
| `PhysicalCountSession.current_state` | `'OPEN'` `'COUNTING'` `'SYNCED'` `'RECONCILING'` `'RECONCILED'` `'REVIEWED'` `'FAILED'` `'CLOSED'` | ALL CAPS |
| `DebtorWorkspaceStatus` | `'clean'` `'cylinder_variance'` `'erp_exception'` `'pending_review'` `'approved_internal'` `'customer_ready'` `'sent'` | snake_case |
| `EntryType` | `'Invoice'` `'Payment'` `'Crd Note'` `'GRV'` `'STK_XFER'` `'Journal'` `'Bank UD'` `'Deb Note'` | Title Case with spaces |

**All status comparisons must use exact casing. No normalisation. No `.toLowerCase()` before comparison.**
