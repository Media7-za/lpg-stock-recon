# Debtor Position Workspace Doctrine (Version 1)

This specification defines the core principles, structures, and policies of the **Debtor Position Workspace**. In a stock and financial reconciliation context, a debtor clerk does not merely view a static statement; they must manage three independent operational dimensions of an account simultaneously.

---

## 1. Core Positions

A Debtor Position Workspace tracks and balances three different categories of truth:

### 1.1 Financial Position (Money)
*   **Core Question:** How much money does the customer legally/contractually owe us?
*   **Constituent Metrics:**
    *   `LPG Gas Debt`: The monetary portion of unpaid gas invoices (exclusive of cylinder deposit charges).
    *   `Cylinder Financial Balance`: The monetary value of cylinder deposit charges that have not been paid/settled.
    *   `Total Debtor Balance`: The sum of all financial transactions (`LPG Gas Debt + Cylinder Financial Balance`). This must match the ERP statement's final balance.

### 1.2 Custody Position (Stock)
*   **Core Question:** How many physical cylinder assets are currently outstanding in the customer's possession?
*   **Constituent Metrics:**
    *   `netReturnableQtyBySku`: The net physical count of cylinders held by the customer for each SKU (e.g. 19kg, 9kg), computed from historical deliveries and returns, adjusted for commercialized custody settlements.
    *   `depositRates`: The standardized refundable deposit rate per SKU (e.g. R690.00 for 19.1, R517.50 for 9.1).
    *   `cylinderCustodyExposure`: The gross monetary liability representing the replacement/refund value of the outstanding cylinder custody position.
*   **Formula:**
    $$\text{Cylinder Custody Exposure} = \sum (\text{Net Returnable Qty per SKU} \times \text{Deposit Rate per SKU})$$

### 1.3 Reconciliation Position (Balancing)
*   **Core Question:** Do our financial ledger and our physical custody ledger agree?
*   **Constituent Metrics:**
    *   `cylinderVariance`: The difference between the financial ledger and custody ledger for cylinders (`Cylinder Financial Balance - Cylinder Custody Exposure`).
    *   `erpBalance` vs `reconstructedBalance`: The comparison between the ERP's stated combined balance and our locally reconstructed ledger total.
    *   `erpVariance`: The variance between the ERP and local ledger totals (which should always be R0.00).

---

## 2. TypeScript Model

The workspace features are represented in the codebase by the following data structures:

```typescript
export interface SKUPosition {
  sku: string;
  netQty: number;
  rate: number;
  exposure: number;
}

export interface DebtorPosition {
  // Section 1 - Financial Position
  gasDebt: number;
  cylinderFinancialBalance: number;
  totalDebtorBalance: number;

  // Section 2 - Custody Position
  outstandingCylinders: SKUPosition[];
  cylinderCustodyExposure: number;

  // Section 3 - Reconciliation Position
  cylinderVariance: number; // cylinderFinancialBalance - cylinderCustodyExposure
  erpBalance: number;
  reconstructedBalance: number;
  erpVariance: number; // erpBalance - reconstructedBalance
}
```

---

## 3. Containment & Security Policies

Reconciliation machinery is an internal operational tool, not a customer communication layout. Exposing details of internal audit calculations or variances to customers triggers unnecessary disputes.

*   **Internal Audit View (Full Workspace):** Displays all three sections (Financial, Custody, and Reconciliation) and full transaction rows (including cylinder-only charges and paired reversals).
*   **Customer View (Simpler Statement):** Displays the LPG Gas Statement and a simplified cylinder holding summary (quantities and rates only). **Strictly hides** the Reconciliation Position section, financial cylinder balances, and variance cells.
*   **Marker Convention:** To ensure clean automated generation, internal-only workspace blocks in markdown reports must be enclosed in the following comments:
    ```markdown
    <!-- INTERNAL_ONLY_START -->
    <!-- DEBTOR_POSITION_WORKSPACE_START -->
    ## Debtor Position Summary
    ...
    <!-- DEBTOR_POSITION_WORKSPACE_END -->
    <!-- INTERNAL_ONLY_END -->
    ```
    The HTML generation script strips everything between these tags to create the customer-facing output.

---

## 4. Database Mapping — Informative, Not Canonical

*Note: The database mappings outlined below are for illustrative conceptual guidance and do not represent a final, canonical schema contract.*

*   **Header Layer (`transaction_headers`):** Acts as the cash-ledger and primary source for calculating the `totalDebtorBalance`. This contains combined invoice totals, credit note totals, and payment transactions.
*   **Itemized Component Layer (`vw_clean_transactions`):** Acts as the line-item detail view. The script queries this to separate LPG gas line totals from CYL deposit line totals (filtering by `stock_no` or `category`), which calculates the `gasDebt` and `cylinderFinancialBalance` splits.
*   **Meaning/Allocation Layer (Future `allocation_events`):** A proposed table that maps a payment document to its allocation targets (e.g. allocating R3,588.00 of payment R7,045.87 to settle 6 cylinders of 19.1).

---

## 5. Reference Implementation (JEN001 - v4)

As of May 2026, Spoon Eatery (JEN001) reconciles with the following canonical workspace metrics:

```text
Financial Position:
  LPG Gas Debt:                  R20,510.54
  Cylinder Financial Balance:    R2,932.50
  Total Debtor Balance:          R23,443.04 (Matches ERP)

Custody Position:
  Outstanding 19kg:              2 cylinders @ R690.00 = R1,380.00
  Outstanding 9kg:               3 cylinders @ R517.50 = R1,552.50
  Cylinder Custody Exposure:     R2,932.50

Reconciliation Position:
  Cylinder Variance:             R0.00 (Financial R2,932.50 - Custody R2,932.50)
  ERP Combined Balance:          R23,443.04
  Reconstructed Balance:         R23,443.04
  ERP Variance:                  R0.00
```
