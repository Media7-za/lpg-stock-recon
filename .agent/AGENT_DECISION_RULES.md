# Agent Decision Rules

## Locked Rules

1. Payment entry type = Payment.
2. Standard payments are negative values.
3. Positive payment entries are ERP reversals.
4. Allocation splits sharing a document number are preserved.
5. Reconciliation consists of financial position, custody position, and reconciliation outcome.
6. Internal and customer outputs may differ.
7. Allocation evidence is first-class evidence.
8. Exceptions are preserved and surfaced, never silently discarded.

## Doctrine

Business rules live here and not inside UI components.