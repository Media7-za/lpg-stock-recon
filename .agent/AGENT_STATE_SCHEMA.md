# Agent State Schema

## Purpose

Defines the canonical debtor state emitted by the agent and consumed by the UI.

## Debtor State

```yaml
debtor:
  code:
  name:

financial_position:
  balance:
  credits:
  payments:
  invoices:

custody_position:
  expected:
  actual:
  variance:

reconciliation:
  status:
  explanation:

exceptions:
  - id:
    type:
    severity:
    description:

outputs:
  internal_statement:
  customer_statement:
  baseline_report:

review:
  state:
  reviewed_by:
  reviewed_at:

audit:
  last_action:
  last_updated:
```

## Design Rule

React components must bind to this schema rather than deriving independent business state.