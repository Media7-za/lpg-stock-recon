# Lane 2: Database Schema Memory Document

This document defines the schema, table roles, and query correction logic used in the **Database Schema** lane.

> [!NOTE]
> **Informative, Not Canonical Disclaimer**
> The database tables, views, and schemas described below are for illustrative conceptual guidance and do not represent a final, canonical schema contract.

---

## 1. Table Roles

*   **`transaction_headers` (Cash-Ledger Layer):** 
    *   Primary source for calculating the combined `totalDebtorBalance`.
    *   Contains cash receipts (`entry_type = 'Payment'`), bank transfers, and combined document-level totals.
*   **`vw_clean_transactions` (Itemized Line Layer):** 
    *   Acts as the line-item detail view.
    *   Contains itemized line totals for `Invoice` and `Crd Note` entry types.
    *   Used to isolate LPG gas totals from cylinder deposit lines (using `debt_group = 'CYL'`).

---

## 2. Correction Formulas & Views

### 2.1 Credit Note Double-Taxation Bug
*   **Problem:** The ERP writes the tax-inclusive amount (e.g. `-R7,705.00`) inside the `amount_excl` field for Credit Notes, while correctly recording the negative VAT inside `tax_amount`. Summing `amount_excl + tax_amount` double-taxes the VAT component (`-R7,705.00 + -R1,005.00 = -R8,710.00`).
*   **Correction Rule:** When calculating line totals for Credit Notes, VAT inclusive amounts must be corrected based on quantity sign:
    $$\text{Line Total} = (\text{qty} \times \text{retail\_price}) + \text{CASE WHEN qty < 0 THEN -line\_tax ELSE line\_tax END}$$
*   **Database View:** The view `vw_clean_transactions` incorporates this fix in its `line_total` field.

### 2.2 Debt Partitioning & SKU Dual-Line Mapping
Line items are routed to their respective ledger statements based on the category mapping in the database:

```sql
CASE
    WHEN category = 'CYL'                                   THEN 'CYL'
    WHEN category IN ('19K','9KG','LPG','14K','SV','DV')    THEN 'LPG'
    ELSE 'OTHER'
END AS debt_group
```

*   **LPG Suffix `01` (Gas fills):** Suffixes like `901`, `1901`, `S01`, `D01`, `1401` fall under category codes mapped to `debt_group = 'LPG'`.
*   **CYL Suffix `.1` (Deposits):** Suffixes like `9.1`, `19.1`, `S.1`, `D.1`, `14.1` fall under category `CYL` mapped to `debt_group = 'CYL'`.
