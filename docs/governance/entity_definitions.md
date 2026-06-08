# Entity Definitions

> **Agent Rule:** Use this file as the ground truth for every field name, type, and relationship. Do not infer field names from UI labels or variable names in existing code — check here first. Pay special attention to the ID Integrity section.

---

## Account

A debtor customer account. Each account has a human-readable code (`accountNo`) used throughout the system as the primary lookup key.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Internal DB key — rarely exposed in UI |
| `accountNo` | String | **Primary lookup key** — e.g. `'JEN001'`, `'FAM000'`, `'TAN001'`. Used in all API calls and URL params. NEVER confused with `id`. |
| `currentName` | String | Display name of the account holder |
| `accountType` | String? | Optional classification |

**Relations:**
- Has many `TransactionHeader` records (via `account_no`)
- Has many `ReconciliationSession` records (via `account_no`)

---

## TransactionHeader

A single ERP document — invoice, payment, credit note, journal, GRV, or bank UD. The primary financial ledger record.

| Field | Type | Notes |
|---|---|---|
| `id` | BigInt (autoincrement) | Internal DB key. Do NOT use as display reference. |
| `doc_no` | String | ERP document number — use this as the display reference (e.g. `'00029693'`). Duplicate `doc_no` values are legitimate (receipt splits / adjustment offsets — do not deduplicate). |
| `entry_type` | String | One of: `'Invoice'` `'Payment'` `'Crd Note'` `'GRV'` `'STK_XFER'` `'Journal'` `'Bank UD'` `'Deb Note'` |
| `account_no` | String | FK to `Account.accountNo` |
| `date` | DateTime | Document date. Hard invariant: `invoice_date ≤ payment_date`. |
| `amount` | Decimal | Payment records: **negative** = cash receipt (credit). Positive = adjustment/reversal. |
| `isPaid` | Boolean | ERP-reported paid flag — informational only, not the canonical settlement state |

**Payment polarity rule:**
- Negative amounts = genuine cash payments (credits reducing AR balance)
- Positive amounts on payment records = system reversals or allocation adjustments

**Relations:**
- Has many `TransactionLineItem` records (via `doc_no`)
- Has many `AllocationEvent` records as source (payment) or target (invoice)

---

## TransactionLineItem

A single SKU line within a `TransactionHeader`. Used to split LPG gas value from cylinder deposit value.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Internal DB key |
| `transactionId` | String | FK to `TransactionHeader.id` — NOT `doc_no` |
| `docNo` | String | Mirrors parent `TransactionHeader.doc_no` |
| `stockNo` | String | SKU code — e.g. `'9.1'`, `'19.1'`, `'D.1'`, `'S.1'`, `'14.1'` |
| `quantity` | number | Positive = delivery, negative = return |
| `retailPrice` | number | Per-unit price |
| `category` | String? | Used to classify as `CYL_DEPOSIT` or `LPG_CONTENT` |

**NOT the same as `TransactionHeader.id`.** A single `TransactionHeader` has many `TransactionLineItem` records — one per SKU on the document.

---

## AllocationEvent

A single operator-confirmed allocation of a payment against an invoice component.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `sourceId` | String | FK to a **Payment** `TransactionHeader.id` — never an Invoice id |
| `targetId` | String | FK to an **Invoice** `TransactionHeader.id` — never a Payment id |
| `amount` | Decimal | Amount allocated (always positive) |
| `eventType` | `ALLOCATE` \| `DEALLOCATE` \| `ADJUST` | |
| `allocationType` | `FULL` \| `PARTIAL` \| `EXCESS` \| `ROUNDING` | |
| `matchMethod` | `AUTO_EXACT` \| `AUTO_PATTERN` \| `MANUAL` \| `ADJUSTED` | |

**One PMT → one invoice.** No proportional splits. Remainder routes to Suspense-PMT.

---

## ReconciliationSession

A single AR reconciliation workbench session for one account.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `account_no` | String | FK to `Account.accountNo` — one session per account at a time |
| `status` | String | `'OPEN'` `'DRAFT'` `'FINALIZED'` |
| `started_at` | String | ISO 8601 |
| `finalized_at` | String? | ISO 8601 — null until finalised |

**Session scope:** one account per session. Read-only workbench — ERP is never written back to.

---

## PhysicalCountSession

A physical yard count session (AM or PM).

| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `status` | String | `'in_progress'` `'completed'` |
| `current_state` | String? | `'OPEN'` `'COUNTING'` `'SYNCED'` `'RECONCILING'` `'RECONCILED'` `'REVIEWED'` `'FAILED'` `'CLOSED'` |
| `sessionType` | `'AM'` \| `'PM'` | |
| `zones` | Json | Array of zone counts |

---

## Product (SKU)

A cylinder SKU or LPG product tracked in inventory.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | |
| `stockNo` | String | SKU code — canonical identifier. e.g. `'9.1'`, `'14.1'`, `'19.1'`, `'D.1'`, `'S.1'` |
| `description` | String | Human label — e.g. `'9kg Cylinder'` |
| `category` | String? | `'CYL_DEPOSIT'` \| `'LPG_CONTENT'` \| `'ACCESSORIES'` |

**Standard deposit rates (reference — fetch from DB, do not hardcode):**
| SKU | Label | Deposit Rate |
|---|---|---|
| `9.1` | 9kg | R517.50 |
| `14.1` | 14kg | R575.00 |
| `19.1` | 19kg | R690.00 |
| `D.1` | 48kg Double-Valve | R1,150.00 |
| `S.1` | 48kg Single-Valve | R1,150.00 |

---

## ID Integrity Rules

```
✓ Use Account.accountNo    as account_no in all API calls and URL params
✓ Use TransactionHeader.id as sourceId/targetId in AllocationEvent
✓ Use TransactionHeader.doc_no as the display reference shown to operators

✗ Never use TransactionHeader.id as a display reference (use doc_no)
✗ Never use Account.id as account_no (use accountNo)
✗ Never use TransactionLineItem.id as transactionId (use TransactionHeader.id)
✗ Never pass an Invoice TransactionHeader.id as a Payment sourceId
✗ Never pass a Payment TransactionHeader.id as an Invoice targetId
```

---

## API Response Shapes (Key Patterns)

### GET /api/accounts/:accountNo/transactions
```typescript
{
  account: { accountNo: string; currentName: string }
  transactions: TransactionHeader[]
  session: ReconciliationSession | null
}
```

### POST /api/allocations
```typescript
// Request
{
  session_id: string
  credit_doc_id: number   // Payment TransactionHeader.id (BigInt → number)
  invoice_doc_id: number  // Invoice TransactionHeader.id
  amount: number
  is_auto_accepted: boolean
}
// Response: AllocationEvent
```
