# Architecture: Independent Recalculation Engine (IRE)

## Purpose
The IRE is a standalone, stateless utility designed to prove financial correctness. It recomputes balances, VAT, and recon totals directly from raw ERP ingestion tables, ignoring all intermediate application state or cached views.

Correctness in the **LPG Stock Recon App** depends on **repeatable recomputation**, not stored conclusions.

---

## Core Principles

1. **Statelessness:** The IRE does not store data. It only reads and computes.
2. **Independence:** It must not use `reconciliation_summary` or any other application-level view that could contain the very logic bug it is trying to detect.
3. **Reproducibility:** Given the same raw `transaction_items` and `transaction_headers`, it must always produce the same result.

---

## Computation Logic

### 1. Ledger Balance (Net/VAT/Gross)
- **Source:** `transaction_headers`
- **Method:** Group by `account_no`, `period`, and `entry_type`. Sum `amount_excl` and `tax_amount`.
- **Constraint:** Must match the ERP snapshot totals provided in Phase 1.

### 2. Operational Recon (LPG/CYL)
- **Source:** `transaction_items`
- **Method:** 
  - Filter by `category` or `stock_no` patterns defined in `Documents/recon-engine-spec.md`.
  - Sum `qty` and calculate `line_total` (Retail * Qty + LineTax).
  - Compare the sum of line totals against the corresponding Header's `amount_excl + tax_amount`.

### 3. Allocation Integrity
- **Source:** `allocation_events`
- **Method:** 
  - Sum all `amount` values for a given `source_id` (Invoice).
  - Verify that `SUM(amount) <= Invoice.amount_inc`.
  - Identify any "Over-allocated" or "Dangling" events.

---

## Output — Truth Report
The IRE produces a structured JSON output that is used by the `FINANCIAL-VALIDATOR` to populate the **Financial Truth Delta Report**.

```json
{
  "ledger": {
    "total_excl": 150000.00,
    "total_tax": 22500.00,
    "total_inc": 172500.00
  },
  "operational": {
    "lpg_total": 120000.00,
    "cyl_total": 52500.00,
    "unclassified": 0.00
  },
  "integrity": {
    "vat_score": 100,
    "allocation_errors": 0,
    "period_alignment_score": 100
  }
}
```

---

## Implementation Strategy

### Stage 1: SQL-Based IRE (Current)
Currently, the `FINANCIAL-VALIDATOR` executes the IRE manually using raw SQL queries that bypass the `reconciliation_summary` view.

### Stage 2: Automated IRE (Future)
A standalone TypeScript utility `src/lib/ire.ts` that runs in the CI/CD pipeline or as a background job to continuously monitor for drift.
