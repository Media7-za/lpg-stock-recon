# Cylinder Allocation Doctrine (Version 1)

> **Scoped-canonical** for cylinder deposit allocation evidence tiers. Constitutional epistemic tags and evidence ranks: `DEBTORS_DOCTRINE.md` §§4–6 (ALIGNED — edit matching tiers here for CYL allocation scope).

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

---

## 6. Deposit credit notes: price-differential credit and double-credit test (ratified 2026-10-13)

Source and evidence: `PROPOSED_Projection_Matching_Locks.md` amendments (e) and (f); `docs/previews/2026-10-10_TWK_family_children.md`; `docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md`. Appended; no earlier text is superseded.

**6.1 Price-differential credit.** When an invoice and a credit note on the same delivery differ only in unit price, the difference stays on the account as a **customer credit** (negative balance). It is not a cash overpayment and not a write-off. It is shown as a negative amount, and any correction or refund treatment is an operator ruling. Example: TWK003 invoice 47866 (20 units at R100) against CN 13933 (20 units at R115) leaves R-300.00; which price was correct is unverified.

**6.2 Double-credit test.** To test whether a cylinder credit note repeats cylinders already paid for in cash, decompose the cash deposit into whole cylinders per SKU from the DB line quantities, then compare the credit note per SKU with its own delivery invoice. A credit note is a double credit only if it credits more of a SKU than its own delivery invoiced **and** the excess equals the cash-paid cylinders. The same total value with a different SKU mix is not a reversal. Custody conclusions remain the operator's.

**Tripwires:** 6.1 reopens if the ERP confirms the credit note price was intended and the invoice price wrong, or the reverse. 6.2 reopens if a later credit note credits more of a SKU than its own delivery.

**Note 2026-10-13 (appended; the 6.1 example above is superseded, not deleted).** The TWK003 R-300.00 used as the 6.1 example was ruled by the operator on 2026-10-12 to be an ERP price typo on CN 13933 (R115.00 entered instead of R100.00), not a customer credit. The ERP correction was pending and the R-300.00 is held off the customer copy by a `customerQuarantine` (see `docs/previews/2026-10-10_TWK_consolidated_statement_preview.md` sections 11 and 12). Rule 6.1 itself still applies where a price difference is a genuine credit; whether a given difference is a typo or a credit remains an operator ruling.

