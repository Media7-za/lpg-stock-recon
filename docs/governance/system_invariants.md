# System Invariants

> These rules are NEVER violated. Before marking any implementation task complete, verify every applicable invariant below. A task that violates an invariant is not done — it is a bug.

---

## INV-001 — No Hardcoded Domain Data

Dynamic data (accounts, SKUs, deposit rates, suppliers, depot locations) MUST be fetched from the API or database at runtime.

**Violation pattern:**
```typescript
const SKUS = ["9.1", "14.1", "19.1"] // ❌ BUG
const DEPOSIT_RATES = { "9.1": 517.50 } // ❌ BUG if used as authoritative source
```

**Correct pattern:**
```typescript
const skus = await supabase.from('products').select('*') // ✓
```

**Applies to:** Every screen that renders lists of SKUs, accounts, or deposit rates.
**Why it matters:** Hardcoded SKU names and rates will diverge from the database. Filters and balance calculations built on hardcoded data are silently incorrect.

---

## INV-002 — Single Date Format Standard

All user-facing dates use `dd MMM yyyy` (e.g. "28 Mar 2026").

| Context | Format | Example |
|---|---|---|
| All UI display | `dd MMM yyyy` | 28 Mar 2026 |
| `<input type="date">` value attribute only | `yyyy-MM-dd` | 2026-03-28 |
| API payloads / Supabase (send/receive) | ISO 8601 | 2026-03-28T00:00:00Z |
| Statement and baseline report headers | `dd MMM yyyy` | 31 May 2026 |

**Correct pattern:** Use the shared `formatDate(date)` utility.
Do NOT call `toLocaleDateString()`, `format()`, or `new Date().toString()` directly in components.

**Violation pattern:**
```typescript
new Date(record.date).toLocaleDateString('en-ZA') // ❌ inconsistent
format(date, 'dd MMMM yyyy') // ❌ wrong format
```

---

## INV-003 — Every UI Action Must Be Wired

No button, link, or interactive element may be rendered without a handler. Zero exceptions.

**If the target route or API endpoint is not yet implemented:**
- Either omit the element entirely, OR
- Render it with a visible "not yet implemented" label or `disabled` state with a `// TODO: LSR-{ticketNumber}` comment

**Violation pattern:**
```typescript
<button className="...">Approve Statement</button> // ❌ no onClick
```

**Correct patterns:**
```typescript
<button onClick={() => handleApprove(debtorCode)}>Approve Statement</button>

// If not yet implemented:
<button disabled title="Execution delegated to agent/script workflow">
  Regenerate {/* TODO: LSR-12 */}
</button>
```

---

## INV-004 — Consistent Component and Styling System

All UI uses the project's Tailwind dark theme token system. No external component library (shadcn, MUI, Chakra) is introduced without PM approval.

**Established token set (from `tailwind.config.js`):**
- Backgrounds: `bg-background` (#0f0f0f), `bg-surface` (#1a1a1a), `bg-surface-elevated` (#252525)
- Text: `text-text-primary` (#f5f5f5), `text-text-secondary` (#a3a3a3)
- Border: `border-border` (#333333)

**Icon library:** `lucide-react` (already installed — do not add alternatives).
**Class utility:** `clsx` (already installed).

**Migration rule:** When touching a file that uses ad-hoc inline colour values that duplicate the token set, migrate them to tokens in the same PR.

---

## INV-005 — ID Type Integrity

Every field that accepts an ID must receive the correct entity's ID.

Critical pairs:
- `TransactionHeader.id` (BigInt) ≠ `TransactionLineItem.id` (String/cuid)
- `Account.accountNo` (String, e.g. `'JEN001'`) ≠ `Account.id` (String/cuid)
- `AllocationEvent.sourceId` refers to a Payment `TransactionHeader.id` — never an Invoice `id`
- `AllocationEvent.targetId` refers to an Invoice `TransactionHeader.id` — never a Payment `id`

See `docs/governance/entity_definitions.md` for full ID contracts.

---

## INV-006 — Status Values Use Defined Casing

Status values use specific casing. Using wrong casing causes silent filter failures.

| Entity | Status values |
|---|---|
| `PhysicalCountSession.status` | `'in_progress'` `'completed'` |
| `PhysicalCountSession.current_state` | `'OPEN'` `'COUNTING'` `'SYNCED'` `'RECONCILING'` `'RECONCILED'` `'REVIEWED'` `'FAILED'` `'CLOSED'` |
| `ReconciliationSession.status` | `'OPEN'` `'DRAFT'` `'FINALIZED'` |
| `DebtorWorkspaceStatus` | `'clean'` `'cylinder_variance'` `'erp_exception'` `'pending_review'` `'approved_internal'` `'customer_ready'` `'sent'` |
| `EntryType` (ERP) | `'Invoice'` `'Payment'` `'Crd Note'` `'GRV'` `'STK_XFER'` `'Journal'` `'Bank UD'` `'Deb Note'` |

**Violation patterns:**
```typescript
status === 'Finalized'    // ❌ wrong case
status === 'in progress'  // ❌ wrong format
entryType === 'INVOICE'   // ❌ wrong case
```

---

## INV-007 — Reference Data Is Always Fetched, Never Seeded in Frontend

SKU/product data, account lists, and deposit rates are managed in the database.
The frontend always fetches them. Do not import, copy, or replicate seed data into any frontend file.

---

## INV-008 — ERP Balance Is Informational Only

The ERP stated balance is a health signal, not a session gate or a canonical truth.

- `erpVariance !== 0` is a **valid, disclosed operating state** — not a bug.
- No workflow step, validation, or completion gate may require `erpVariance === 0`.
- ERP balance mismatch must be **surfaced**, never suppressed, never corrected away silently.

**Violation pattern:**
```typescript
if (erpVariance !== 0) throw new Error('Cannot finalise') // ❌ BUG
if (erpVariance === 0) showApproveButton() // ❌ wrong gate
```

---

## INV-009 — Currency Displayed in ZAR Format

All monetary values in the UI display as: `R{value}` with two decimal places and comma thousands separator. Negative values use `R-{value}`.

| Value | Correct display |
|---|---|
| 23443.04 | `R23,443.04` |
| -5117.50 | `R-5,117.50` |
| 0 | `R0.00` |

**Correct pattern:** Use the shared `formatZAR(value: number)` utility.
Do NOT call `toLocaleString` or format currency inline in components.

---

## INV-010 — Financial Balance and Custody Exposure Are Always Separate

`Cylinder Financial Balance` and `Cylinder Custody Exposure` are independent values. They must never be collapsed into a single displayed figure.

`cylinderFinancialBalance === totalCustodyExposure` is not guaranteed (see FAM000 — variance of R7,532.50). Any component or calculation that assumes they are equal is a bug.

---

## Self-Check Before Marking Done

```
INV-001 □ No hardcoded SKUs, accounts, or deposit rates?
INV-002 □ All dates using formatDate() utility (dd MMM yyyy)?
INV-003 □ Every button/link has a wired handler or is explicitly disabled?
INV-004 □ Dark theme tokens used — no new component libraries introduced?
INV-005 □ IDs are the correct entity type — no cross-entity ID confusion?
INV-006 □ Status string values match exact casing in DB/types?
INV-007 □ Reference data fetched from API/DB, not hardcoded?
INV-008 □ ERP variance is surfaced, not gated or suppressed?
INV-009 □ All monetary values displayed as formatZAR(value)?
INV-010 □ Cylinder financial balance and custody exposure shown as separate fields?
```
