# Collections Intelligence (Slice 005A)

> **Scoped-canonical** for dashboard `riskScore` heuristics. Constitutional state derivation: `DEBTORS_DOCTRINE.md` §1 (state is derived; scores not persisted to `project.json`) — ALIGNED.

This document is the authoritative scoring contract for the **Collections Intelligence Engine**. It defines the heuristic weightings used to derive a `riskScore` for each debtor account. 

## Architectural Principle
The `riskScore` and `daysSinceLastContact` are **derived, time-dependent states**.
- They are **NOT** persisted to the `project.json` files.
- They are calculated **in-memory** by the dashboard generator (`debtors_dashboard.mjs`) to guarantee real-time accuracy and prevent data staleness.

## Scoring Matrix (v1)

The system calculates a cumulative risk score out of 100 based on the following signals:

| Signal Condition | Schema Rule Evaluation | Weight |
| --- | --- | --- |
| **180+ aged debt present** | `financials.agedDebt180Plus > 0` | **+30** |
| **No payment in 90 days** | `daysSince(financials.lastPaymentDate) > 90` | **+25** |
| **No response after 14 days** | `daysSince(collections.dateSent) > 14` | **+20** |
| **LOD issued** | `collections.actionType === "letter-of-demand"` & `dateSent != null` | **+15** |
| **Recon complete** | `reconState === "complete"` | **+10** |

> **Score Cap:** The maximum possible `riskScore` is strictly capped at `100`.

## Implementation Logic

- `daysSinceLastContact` is evaluated as the delta between the system's current date and `financials.lastPaymentDate` or `collections.dateSent` (whichever is more recent, or specific context as per script rules). For v1 scoring, "No response after 14 days" specifically looks at `collections.dateSent` delta.
- The dashboard sorts accounts descending by `riskScore`, effectively creating a **Priority Queue** for operational management.
