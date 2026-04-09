# LPG Stock Recon — Domain API Documentation

This document describes the state-driven domain API implemented via Supabase Edge Functions. All write operations require a mandatory `idempotencyKey` and adhere to the system's formal state machines.

---

## 🏗️ Architecture Overview

The API acts as a thin, stateful layer between the Agent/Frontend and the Supabase PostgreSQL database. It enforces business logic, session locking, and audit logging.

### Base URL
`https://<supabase-project-id>.supabase.co/functions/v1`

### Authentication
All requests must include a Bearer JWT in the `Authorization` header.
`Authorization: Bearer <supabase-anon-or-user-jwt>`

---

## 🔹 Session Management (`/sessions`)

### Start Count Session
`POST /sessions`
- **Payload:** `{ "date": "YYYY-MM-DD", "idempotencyKey": "UUID" }`
- **Output:** `{ "sessionId": "UUID" }`
- **Behavior:** Initializes a session in `OPEN` state. Idempotent by key.

### Get Session Details
`GET /sessions?sessionId=<id>`
- **Output:** Returns session metadata, status, and lock status.

### Close Session
`PATCH /sessions?sessionId=<id>`
- **Payload:** `{ "idempotencyKey": "UUID" }`
- **Behavior:** Transitions session to `CLOSED`. Sessions in this state are immutable.

---

## 🔹 Inventory & Sync (`/inventory`)

### Fetch ERP Snapshot
`GET /inventory/snapshot?date=YYYY-MM-DD`
- **Output:** Returns the ERP snapshot for the given date.

### Submit Physical Counts
`POST /inventory/counts`
- **Payload:** `{ "sessionId": "ID", "payload": [...], "idempotencyKey": "UUID" }`
- **Behavior:** Appends counts to the session. Transitions state from `OPEN` to `COUNTING`. Rejects if session is `CLOSED` or `RECONCILING`.

### Submit ERP Snapshot / Movements
`POST /inventory/snapshot` | `POST /inventory/movements`
- **Payload:** `{ "snapshot/movement": {...}, "idempotencyKey": "UUID" }`
- **Behavior:** Syncs raw ERP data to the cloud.

---

## 🔹 Reconciliation Workflow (`/reconciliation`)

### Start Reconciliation
`POST /reconciliation/start`
- **Payload:** `{ "sessionId": "ID", "idempotencyKey": "UUID" }`
- **Behavior:** Transitions state to `RECONCILING`. Locks the session for length of processing.

### Get Pipeline Status
`GET /reconciliation/status?sessionId=<id>`
- **Output:** Returns `stage` (e.g., `T1_SOH`), `progress` (0-100), and `errors`.

---

## 🔹 Discrepancy Management (`/discrepancies`)

### Upsert Discrepancy Note
`POST /discrepancies/notes`
- **Payload:** `{ "sessionId": "ID", "sku": "SKU", "note": "Text", "idempotencyKey": "UUID" }`
- **Behavior:** Adds/updates investigation notes. Transitions state to `REVIEWED`.

---

## ⚠️ Error Codes

| Code | Meaning |
|---|---|
| `INVALID_TRANSITION` | Attempted to move to a state not allowed from current state. |
| `SESSION_LOCKED` | Session is currently processing or closed. |
| `SESSION_NOT_FOUND` | The provided session ID does not exist. |
| `IDEMPOTENCY_EXISTS` | (Internal) The request was already processed successfully. |
