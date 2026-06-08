# Domain Glossary

> **Agent Rule:** Read this file before implementing any feature. The most common source of bugs in this codebase is confusing `Account.accountNo` with `Account.id`, or `TransactionHeader.doc_no` with `TransactionHeader.id`. These are separate identifiers with different types and different uses.

---

## Account

**Definition:** A debtor customer account. Represents a customer's financial relationship with the depot.

**Primary lookup key:** `Account.accountNo` (String) — referred to as `account_no` in all API calls, URL params, and foreign keys. e.g. `'JEN001'`, `'FAM000'`, `'TAN001'`.
**Internal DB key:** `Account.id` (String/cuid) — used only in Prisma relations, never in URLs or UI.
**Status field:** None — accounts are always active.

**Key relationships:**
- Has many `TransactionHeader` records
- Has many `ReconciliationSession` records

---

## TransactionHeader

**Definition:** A single ERP document — invoice, payment, credit note, journal, GRV, or bank UD. The primary ledger record.

**Primary display reference:** `TransactionHeader.doc_no` (String) — this is what operators see (e.g. `'00029693'`).
**Internal DB key:** `TransactionHeader.id` (BigInt) — used in allocation foreign keys. NOT shown to operators.
**NOT the same as `doc_no`.** A single `doc_no` may appear on multiple records (legitimate splits/offsets — never deduplicate).

**Entry types:** `'Invoice'` `'Payment'` `'Crd Note'` `'GRV'` `'STK_XFER'` `'Journal'` `'Bank UD'` `'Deb Note'`

---

## TransactionLineItem

**Definition:** A single SKU line within a `TransactionHeader`. Used to separate LPG gas charges from cylinder deposit charges.

**Primary key:** `TransactionLineItem.id` (String/cuid)
**NOT the same as `TransactionHeader.id`.** One header has many line items. Passing a line item id where a header id is expected is a silent bug.

---

## LPG Gas Debt

**Definition:** The monetary portion of a debtor's outstanding balance attributable to LPG gas product charges (exclusive of cylinder deposit charges).

**Source:** Sum of `TransactionLineItem` records where `category = 'LPG_CONTENT'`, net of payments and credits.

---

## Cylinder Financial Balance

**Definition:** The monetary value of cylinder deposit charges on the financial ledger that have not been settled or returned.

**Source:** Sum of `TransactionLineItem` records where `category = 'CYL_DEPOSIT'`, net of payments and credit notes.

**NOT the same as Cylinder Custody Exposure.** These values diverge when deposit rates change historically (see FAM000 — R7,532.50 variance).

---

## Cylinder Custody Exposure

**Definition:** The gross monetary liability representing the replacement/refund value of cylinders currently in the customer's physical possession, valued at current standard deposit rates.

**Formula:** `Σ (Net Returnable Qty per SKU × Deposit Rate per SKU)`

**Deposit rates (standard — always fetch from DB):**
| SKU | Label | Rate |
|---|---|---|
| `9.1` | 9kg | R517.50 |
| `14.1` | 14kg | R575.00 |
| `19.1` | 19kg | R690.00 |
| `D.1` | 48kg Double-Valve | R1,150.00 |
| `S.1` | 48kg Single-Valve | R1,150.00 |

---

## Cylinder Variance

**Definition:** The difference between the Cylinder Financial Balance (ledger) and the Cylinder Custody Exposure (physical). `cylinderVariance = cylinderFinancialBalance - totalCustodyExposure`.

A non-zero cylinder variance is a **disclosed operating outcome**, not an error. It arises from historical deposit rate changes. It must always be surfaced — never suppressed.

---

## ERP Variance

**Definition:** The difference between the ERP's stated account balance and the locally reconstructed balance. `erpVariance = erpStatedBalance - totalDebtorBalance`.

A non-zero ERP variance is **expected operating reality** for some accounts (e.g. TAN001 — R2,640.57 due to header-layer exceptions). It must always be surfaced — never suppressed (INV-008).

---

## Total Debtor Balance

**Definition:** The complete reconstructed financial obligation of the debtor. `totalDebtorBalance = lpgGasDebt + cylinderFinancialBalance`.

This is the **reconstructed** balance — derived from transaction-level data. The ERP's stated balance is a separate, informational figure.

---

## AllocationEvent

**Definition:** A single operator-confirmed action allocating a payment against an invoice. One payment → one invoice → one component. No splits. Remainder routes to Suspense-PMT.

**sourceId:** Must be a Payment `TransactionHeader.id`.
**targetId:** Must be an Invoice `TransactionHeader.id`.

---

## Suspense-PMT

**Definition:** An exception lane holding the unallocated remainder of a payment after a partial allocation. Requires a second, explicit operator action to resolve. Never auto-applied.

---

## UNCLASSIFIED_EXCEPTION

**Definition:** An exception lane for Bank UD and Journal entries that cannot be automatically classified. Blocks `ReconciliationSession` finalisation until the operator classifies each record. Bank UD is never assumed to be a cash receipt — it is always UNCLASSIFIED_EXCEPTION until classified.

---

## OPERATIONAL_EXCEPTION

**Definition:** A custody-only exception lane for zero-value credit notes that could not be auto-applied (ambiguous SKU match or no prior-dated invoice). Non-blocking. Separate from the financial exception lanes.

---

## Zero-Value CRN

**Definition:** A credit note with zero monetary value. These are cylinder deposit returns — they affect custody state only, not financial state. They must never enter the financial allocation engine.

---

## DebtorWorkspace

**Definition:** The structured state of a debtor account as produced by the agentic/script reconciliation workflow. Contains financial position, custody position, reconciliation position, allocation evidence, and artifact references.

**Status values:** `'clean'` `'cylinder_variance'` `'erp_exception'` `'pending_review'` `'approved_internal'` `'customer_ready'` `'sent'`

---

## Entity Hierarchy Summary

```
Account (accountNo: 'JEN001', currentName: 'Spoon Eatery')
  └── TransactionHeader[] (id: BigInt, doc_no: '00029693', entry_type: 'Payment')
        └── TransactionLineItem[] (id: cuid, stockNo: '19.1', quantity: -6)

ReconciliationSession (id: cuid, account_no: 'JEN001', status: 'OPEN')
  └── AllocationEvent[] (sourceId → Payment.id, targetId → Invoice.id)

PhysicalCountSession (id: cuid, sessionType: 'AM', status: 'in_progress')
  └── ZoneCount[] (zones: JSON)
        └── CountEntry[] (sku: '19.1', quantity: 14)
```

---

## ID Confusion Reference Card

| If you have | And you need | Do this |
|---|---|---|
| `Account.id` (cuid) | Account lookup key | Use `Account.accountNo` instead |
| `TransactionHeader.id` (BigInt) | Display reference for operator | Use `TransactionHeader.doc_no` instead |
| `TransactionLineItem.id` (cuid) | Parent transaction | Use `TransactionLineItem.transactionId` → `TransactionHeader.id` |
| Payment `TransactionHeader.id` | Allocation source | Use directly as `AllocationEvent.sourceId` |
| Invoice `TransactionHeader.id` | Allocation target | Use directly as `AllocationEvent.targetId` |
