# Event Schema (`EVENT_SCHEMA.md`)

> **RESERVED ARCHITECTURE**: This folder and schema are placeholders for the future Event Sourcing implementation of the Debtors Portfolio Management slice. Currently, the `project.json` inside each debtor folder remains the authoritative source of truth. Do NOT migrate operational logic to events yet.

> **Constitutional note (ALIGNED):** `DEBTORS_DOCTRINE.md` §1 — state is derived; §7 — event activation **parked**, explicit operator decision required (see `DEBTORS_ORCHESTRATION_ROADMAP.md` Phase 2b §9.5).

When the event sourcing architecture is activated, state changes will no longer be direct mutations of `project.json`. Instead, discrete event JSON files will be appended to a debtor's `events/` folder, and the `project.json` will become a *derived projection* (current state) of those events.

## Proposed Event Structure

```json
{
  "eventId": "uuid",
  "debtorCode": "WES004",
  "timestamp": "2026-06-15T14:30:00Z",
  "eventType": "DEBTOR_ONBOARDED",
  "payload": {
    "clientName": "West Coast Fish & Chips",
    "initialOutstanding": 36216.20
  },
  "metadata": {
    "agent": "lsr-debtors-pm",
    "source": "cli"
  }
}
```

## Example Event Types (Future)
- `DEBTOR_ONBOARDED`
- `RECON_STARTED`
- `RECON_COMPLETED`
- `COLLECTION_ACTION_LOGGED` (e.g. Letter of demand sent)
- `PAYMENT_RECEIVED`
- `STATUS_CHANGED`
