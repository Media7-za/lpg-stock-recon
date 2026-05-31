# Cylinder Allocation Doctrine (Version 1)

This specification defines the principles and evidence-based matching logic of the **Cylinder Allocation Doctrine**. It provides a standard framework for classifying how payments and credits are allocated against cylinder deposit liabilities.

---

## 1. Core Principles

1.  **Payments are Generic:** A payment transaction received from a debtor is merely a financial inflow (cash). It has no inherent classification (such as "LPG payment" or "Cylinder deposit payment") when it is recorded on the debtor ledger.
2.  **Allocations Create Meaning:** A payment only acquires classification meaning when it is mapped (allocated) to a specific document or component.
3.  **CYL Settlement Rule:** Confirmed cylinder settlements reduce both financial cylinder exposure and returnable cylinder custody exposure. When a customer pays for a cylinder deposit, they commercially settle the liability, converting the cylinder's operational status from "outstanding asset to be returned" to "commercially settled/owned cylinder."

---

## 2. Allocation Evidence Framework

When reconstructing historical accounts, explicit payment allocation mapping data is frequently missing or corrupted. The system infers allocations based on transactional evidence, classifying matches into specific strength tiers:

### 2.1 Evidence Strength Tiers
*   **Confirmed:** An explicit, cent-matching payment clearing a specific parent invoice (or invoice group). High confidence.
*   **Probable:** An invoice containing cylinder deposit exposure is cleared in full through general monthly statement payments (running balance pool) rather than a direct transaction match. High/Medium confidence.
*   **Assumed:** No direct transactional payment match, but assumed based on historical system migration boundaries (e.g. legacy balance forward credit carries). Medium/Low confidence.

### 2.2 Evidence Source Types
*   `EXPLICIT_ALLOCATION`: Direct operator-entered database mapping linking a payment to a cylinder ledger line.
*   `FULL_INVOICE_SETTLEMENT`: The system infers allocation because a payment (or pool of payments) cleared the parent invoice (containing both LPG and CYL components) in full.
*   `PARTIAL_INVOICE_INFERENCE`: The system infers allocation for a partially cleared invoice (requires operator review).
*   `SYSTEM_MIGRATION_CARRIED`: Carried balance from legacy system migrations, treated as a historical baseline boundary.

---

## 3. Allocation Evidence Register

To maintain auditability, every cylinder settlement assumption must be tracked in an **Allocation Evidence Register** using the following tabular schema:

| Column | Description | Example |
| :--- | :--- | :--- |
| **Event / Doc** | The parent document containing the cylinder deposit. | Invoice 30227 |
| **Date** | Document date. | 08 Mar 2024 |
| **SKU** | Cylinder SKU size. | `19.1` |
| **Qty** | Cylinder quantity. | +6 |
| **Amount** | Financial deposit value. | R3,588.00 |
| **Match Target** | The payment document or target clearing the invoice. | Payment `00029693` |
| **Classification** | The strength tier classification. | Confirmed |
| **Evidence Source** | The source type mapping. | `FULL_INVOICE_SETTLEMENT` |
| **Confidence** | Audit confidence rating. | High |
| **Evidence Trail** | Human-readable reasoning and audit trail. | Payment of R7,045.87 cleared Invoice 30227. |

---

## 4. Database Mapping — Informative, Not Canonical

*Note: The database mappings outlined below are for illustrative conceptual guidance and do not represent a final, canonical schema contract.*

*   **Cash Flow Layer (`transaction_headers`):** Documents cash receipts (`entry_type = 'Payment'`) and combined invoice totals.
*   **Component Layer (`vw_clean_transactions`):** Contains lines detailing `LPG` vs `CYL` values. The system groups by `doc_no` to identify invoices where gas and cylinder values were combined.
*   **Relationship Layer (Future `payment_allocations`):** A proposed linking table to store explicit, operator-verified or system-inferred payment splits:
    ```typescript
    interface PaymentAllocation {
      id: string;
      paymentHeaderId: string;
      invoiceHeaderId: string;
      allocatedLpgAmount: number;
      allocatedCylAmount: number;
      evidenceSource: string;
      confidence: 'High' | 'Medium' | 'Low';
    }
    ```

---

## 5. Reference Verification (JEN001)

Spoon Eatery (JEN001) v4 baseline features R7,176.00 in historical cylinder settlements based on two confirmed payments:
1.  **Payment `00029693` (07 March 2024):** Cleared Invoice `30227` in full (contained 6 x 19.1 cylinder deposits worth R3,588.00). Strength: *Confirmed* via `FULL_INVOICE_SETTLEMENT`.
2.  **Payment `00029694` (22 March 2024):** Cleared Invoice `30652` in full (contained 6 x 19.1 cylinder deposits worth R3,588.00). Strength: *Confirmed* via `FULL_INVOICE_SETTLEMENT`.

These settlements reduce the outstanding 19kg custody position from a gross delivered total of 59 cylinders to a net outstanding of **2 cylinders** (after subtracting 45 returned and 12 settled).
