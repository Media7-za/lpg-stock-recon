# DTRX Supabase Schema & Payment Lane Mapping Spec

This document details the precise mapping between the raw FINCON ERP Debtor Transactions (`DETRANS.TXT` / statement formats like `INC002.TXT`) and the Supabase **`transaction_headers`** database schema. 

Knowing exactly how these fields map is critical for the **Payment (PMT) Lane Scoring Engine**, as temporal decay, exact amount matching, and name/reference similarities rely on retrieving correct data columns.

---

## 1. Schema Mapping Overview

The raw transaction data is parsed by the browser-side ingestion logic in `src/lib/erpImportEngine.ts` and loaded into the `transaction_headers` table. Below is the authoritative column-by-column mapping to the variables used by the scoring engine:

| Scoring Variable | Raw Column Name (Statement Format) | Raw CSV Index (`DETRANS.TXT`) | Supabase Column (`transaction_headers`) | Data Type | Description / Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`PMT_ID`** | `DOCNO` | `row[4]` | **`doc_no`** | `TEXT` | Unique transaction document number (e.g. `00037145`). Represents the primary identifier of the payment. |
| **`AMOUNT`** | `AMOUNT` | `row[11]` (derive `excl`) & `row[12]` (`tax`) | **`amount_excl`** + **`tax_amount`** | `NUMERIC` | Gross ZAR transaction total (tax inclusive). Derived by summing the net amount and tax. |
| **`DATE`** | `DATE` | `row[9]` | **`tx_date`** | `DATE` | Transaction execution date (parsed to ISO `YYYY-MM-DD` format). |
| **`BANK_REF`** | `CUSTOMER/BANK REF` | `row[6]` | **`description`** | `TEXT` | Stores the payment method and bank reference (e.g. `SPEEDP \| PC-76-17`, `CASH \| T2000090`, `TRANSF \| STAT 113`). |
| **`CUSTOMER_REF`** | `REFERENCE` | `row[8]` | **`batch_ref`** | `TEXT` | Stores the customer reference/name associated with the transaction (e.g. `MRS DLAMINI`). |

---

## 2. In-Depth Column Mapping Details

### 🔹 1. `PMT_ID` $\rightarrow$ `doc_no`
* **Raw Column Origin:** `DOCNO` (`row[4]`)
* **Scoring Context:** The unique primary key identifier used to record and link allocations. In the `reconciliation_summary` view and the `useAllocationEngine` hook, payment documents are separated from invoices by selecting headers where `entry_type != 'Invoice'` (e.g. `entry_type = 'Payment'`).
* **Example:** `00037844`

### 🔹 2. `AMOUNT` $\rightarrow$ `amount_excl` + `tax_amount`
* **Raw Column Origin:** `AMOUNT` / Total Inclusive (`row[11]` in raw parser, `row[9]` in statement)
* **Scoring Context:** The absolute value of this sum determines financial match capability.
* **Integrity Guard:** The parser separates this into `amount_excl` (net) and `tax_amount` (tax) during ingestion to support ERP sanity checks, but the scoring engine aggregates them back to represent the true ZAR amount:
  $$\text{Total Amount} = \text{amount\_excl} + \text{tax\_amount}$$
* **Rule Enforcement (BR-2):** An allocation amount MUST NOT exceed the available balance of the payment card.

### 🔹 3. `DATE` $\rightarrow$ `tx_date`
* **Raw Column Origin:** `DATE` (`row[9]`)
* **Scoring Context:** Critical for the **Temporal Decay (Date Proximity)** scoring signal. The allocation engine calculates the difference in days between the invoice's `tx_date` and the candidate payment's `tx_date`.
* **Proximity decay function:**
  $$\text{Score Contribution} = \text{Weight}_{\text{DATE}} \times \left(1 - \frac{\text{diffDays}}{14}\right) \quad (\text{for } \text{diffDays} \le 14)$$

### 🔹 4. `BANK_REF` $\rightarrow$ `description`
* **Raw Column Origin:** `CUSTOMER/BANK REF` (`row[6]`)
* **Scoring Context:** This field carries system references for bank deposits, speed points, or direct electronic funds transfers.
* **Pattern Mapping:** The scoring engine extracts the bank reference prefixes (e.g., `SPEEDP`, `TRANSF`, `CASH`, `BANK 1`) and the numerical tail identifiers (e.g., `PC-76-19`) to evaluate direct payment matches.

### 🔹 5. `CUSTOMER_REF` $\rightarrow$ `batch_ref`
* **Raw Column Origin:** `REFERENCE` (`row[8]`)
* **Scoring Context:** Stores the client's internal name / allocation label.
* **Name Similarity Score:** Used by the string-similarity parser to map payments to the correct customer accounts, filtering out generic flags (e.g., `DISCOUNT ALLOWED`) from true debtor matches.

---

## 3. Supplementary Header Fields

For complete context, here are the other adjacent fields stored in `transaction_headers` that the engine uses to manage state and query bounds:

* **`entry_type`** (`row[0]`): Identifies transaction category. Filters out `Invoice` (target) vs. `Payment`/`Crd Note` (candidates).
* **`account_no`** (`row[2]`): Filters the unmatched credit pool by specific customer accounts (e.g., `INC002`).
* **`ref_no`** (`row[5]`): Mapped from raw `INVNO`. Used to check if the payment was already prepopulated with a target invoice number.
* **`order_no`** (`row[7]`): Matches shared order numbers (used for `SAME_ORDERNO` override reason codes).
* **`available_balance`**: Dynamic field added during LSR-5 migrations, tracking the remaining unallocated ZAR amount for the document (initialized as `amount_excl + tax_amount`).
