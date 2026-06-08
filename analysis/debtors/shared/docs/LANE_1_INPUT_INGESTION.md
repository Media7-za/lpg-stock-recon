# Lane 1: Input Ingestion Memory Document

This document defines the constraints, rules, and logic used during the **Input Ingestion** lane of the LPG Stock Reconciliation process. 

---

## 1. Raw Data Formats
The system ingests raw ledger statements exported from the ERP in two formats:
*   **TXT Files (e.g. `FAM000.TXT`):** Structured comma-separated files containing flat rows with columns for Date, Entry Type, Document Number, Customer Reference, Amount, and Running Balance.
*   **CSV Files (e.g. `erp_statement_fam000.csv`):** Excel-compatible CSV exports mirroring the same structure as the TXT statement.

---

## 2. Rules and Constraints

### 2.1 Intraday Ordering Rule
Drivers often deliver full cylinders (generating an Invoice) and return empty cylinders (generating a Credit Note) on the same delivery trip. If these are processed chronologically in the wrong order:
*   **Problem:** The running physical balance of outstanding cylinders temporarily drops below zero, showing artificial deficits mid-day.
*   **Rule:** When calculating chronological running balances, transactions occurring on the same `tx_date` must always be processed in the following order:
    $$\text{Date (ASC)} \rightarrow \text{Invoice (Deliveries) / Payments first} \rightarrow \text{Credit Notes (Returns) second} \rightarrow \text{Document Number (ASC)}$$

### 2.2 Doc No Collision Rule
The ERP reuses document numbers across different financial years. For example, Invoice `00011567` from 2021 can collide with Credit Note `00011567` from 2024.
*   **Problem:** JOINing the lines table (`vw_clean_transactions`) and headers table (`transaction_headers`) on `doc_no` alone causes lines from different years to collapse together, distorting document totals.
*   **Rule:** All JOIN operations must utilize a composite key or filter by account and entry type:
    ```sql
    JOIN vw_clean_transactions v
      ON LTRIM(v.doc_no,'0') = LTRIM(h.doc_no,'0')
     AND v.account_no = h.account_no
     AND v.entry_type = h.entry_type -- Prevents cross-type collision
    ```

### 2.3 Cylinder Document Stripping Rule (CSV Ground Truth Layer)
Every cylinder delivery generates three rows in the raw statement:
1.  **LPG Gas Invoice:** Gas content charge (Keep).
2.  **Cylinder Deposit Invoice:** Cylinder container deposit charge (Strip from financial statement).
3.  **Cylinder Deposit Credit Note:** Reversal of the deposit charge (Strip from financial statement).

*   **Rule:** Cylinder-only rows on the flat statement have a reference suffix ending with `EMPTY` (e.g., `DN-21759-EMPTY` or `DN#22114EMPTY`). 
*   **Logic:**
    *   Identify and strip all `-EMPTY` rows from **Part 1 (Financial Statement)**.
    *   Retain the stripped rows in a separate collection for **Part 2 (Cylinder Tracker)** to count physical movements.
