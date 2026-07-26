# Debtor Project Schema (`project.json`)

---

> **Constitutional doctrine:** Portfolio recon rules live in `analysis/debtors/shared/DEBTORS_DOCTRINE.md`. This file is the **`project.json` field contract** only (ALIGNED — not superseded).

This document is the authoritative API contract for the `project.json` file stored in each debtor's micro-project directory. It outlines required fields, optional fields, valid enumerations, and validation rules.

## Core Schema Structure

Every `project.json` must adhere strictly to this JSON structure:

```json
{
  "debtorCode": "string",
  "clientName": "string",
  "status": "string",
  "reconState": "string",
  "financials": {
    "totalOutstanding": 0.0,
    "lastInvoiceDate": "YYYY-MM-DD" | null,
    "lastPaymentDate": "YYYY-MM-DD" | null,
    "agedDebt180Plus": 0.0,
    "collectable": {
      "amount": 0.0,
      "erpBalance": 0.0,
      "ratifiedHoldsTotal": 0.0,
      "asAt": "YYYY-MM-DD",
      "source": "string",
      "basis": "PROVEN | ASSERTED | STALE",
      "operatorConfirmation": "pending | confirmed"
    }
  },
  "collections": {
    "actionRequired": false,
    "actionType": "string" | null,
    "dateSent": "YYYY-MM-DD" | null,
    "deadlineDate": "YYYY-MM-DD" | null,
    "nextAction": "string" | null,
    "nextActionDate": "YYYY-MM-DD" | null,
    "notes": "string",
    "blockers": [
      {
        "type": "DISPUTE | STALE_SOURCE | UNRESOLVED_IDENTITY | HOLD | OTHER",
        "status": "open | resolved",
        "description": "string",
        "source": "string",
        "asAt": "YYYY-MM-DD"
      }
    ]
  },
  "history": [
    {
      "date": "YYYY-MM-DD",
      "event": "string"
    }
  ]
}
```

## Validation Rules & Requirements

### 1. Root Level
- **`debtorCode`** *(Required)*: String. Must match the exact ERP code (e.g., `"WES004"`).
- **`clientName`** *(Required)*: String. The trading name or registered name of the customer.
- **`status`** *(Required)*: String. Represents the macro workflow status.
  - **Valid Enums:** `"active"`, `"collection"`, `"on-hold"`, `"resolved"`
- **`reconState`** *(Required)*: String. Represents the current state of the ledger reconciliation.
  - **Valid Enums:** `"pending"`, `"in-progress"`, `"complete"`

### 2. Financials Object *(Required)*
- **`totalOutstanding`** *(Required)*: Number (Float). Multi-code exposure aggregate across associated ERP codes. **Not** the §2 ERP anchor — never used for collections-eligibility identity (**D18**).
- **`lastInvoiceDate`** *(Optional)*: String (ISO 8601 Date `YYYY-MM-DD`) or `null`.
- **`lastPaymentDate`** *(Optional)*: String (ISO 8601 Date `YYYY-MM-DD`) or `null`.
- **`agedDebt180Plus`** *(Required)*: Number (Float). Portion of exposure strictly > 180 days overdue. Priority signal only — does **not** establish collectable balance (**D17**).
- **`collectable`** *(Required when `status: collection`)*: Object. Inspectable §2 identity — **D18**.
  - **`amount`** *(Required)*: Collectable balance = `erpBalance − ratifiedHoldsTotal`.
  - **`erpBalance`** *(Required)*: Anchored ERP figure (**PROVEN** anchor).
  - **`ratifiedHoldsTotal`** *(Required)*: Sum of ratified holds deducted from ERP balance.
  - **`asAt`** *(Required)*: ISO date of the anchor.
  - **`source`** *(Required)*: Path or artifact reference for the anchor.
  - **`basis`** *(Required)*: `"PROVEN"` | `"ASSERTED"` | `"STALE"` — only `"PROVEN"` closes collections eligibility.
  - **`operatorConfirmation`** *(Required)*: `"pending"` | `"confirmed"` — must be `"confirmed"` to close.

### 3. Collections Object *(Required)*
- **`actionRequired`** *(Required)*: Boolean. If `true`, the account requires active follow-up.
- **`actionType`** *(Optional)*: String or `null`. Examples: `"letter-of-demand"`, `"call"`, `"legal-summons"`.
- **`dateSent`** *(Optional)*: String (ISO 8601 Date `YYYY-MM-DD`) or `null`.
- **`deadlineDate`** *(Optional)*: String (ISO 8601 Date `YYYY-MM-DD`) or `null`.
- **`nextAction`** *(Optional)*: String or `null`. Defines the next operational step (e.g., `"follow_up_call"`, `"hand_to_legal"`).
- **`nextActionDate`** *(Optional)*: String (ISO 8601 Date `YYYY-MM-DD`) or `null`. The scheduled date for the next action.
- **`notes`** *(Optional)*: String. Free text context for the collector. Can be empty string.
- **`blockers`** *(Required when `status: collection`)*: Array — **D18**. Explicit `[]` = assessed and clear; **absent** = not assessed (fails closed). Only entries with `status: "open"` gate eligibility; `resolved` entries are retained as history.
  - **`type`**: `"DISPUTE"` | `"STALE_SOURCE"` | `"UNRESOLVED_IDENTITY"` | `"HOLD"` | `"OTHER"`
  - **`status`**: `"open"` | `"resolved"`
  - **`description`**, **`source`**, **`asAt`**: Audit fields for the blocker.

### 4. History Array *(Required)*
- Must be an array containing at least one object (initialization event).
- **`date`** *(Required)*: String (ISO 8601 Date `YYYY-MM-DD`).
- **`event`** *(Required)*: String. A concise description of the state change or action taken.

---
> **Note on Validation Strictness:**
> The `debtors:sync` pipeline enforces this schema.
> - **FAIL (Exit 1):** Missing required fields, invalid enums, invalid JSON syntax, or invalid state transitions.
> - **WARN (Stdout):** Missing optional fields, generic placeholder values, or suspiciously empty history arrays.
> - **COLLECTIONS_BLOCKED (Exit 2):** Projection valid but D17/D18 collections eligibility not met — dashboard still generated; demand drafting suppressed (**D18**).
