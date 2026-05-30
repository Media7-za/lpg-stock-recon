# Debtors Reconciliation Business Rules

The ERP data contains specific quirks and historical allocation issues. To successfully reconcile a debtor's account, especially regarding LPG Cylinders, the following business rules **must** be applied strictly when processing raw transaction data.

## 1. Tax Sign Correction Rule
**Problem:** The ERP stores the `line_tax` value as a positive number for Credit Notes (returns), even though the quantity (`qty`) and exclusive amount (`amount_ex`) are properly recorded as negative.
**Rule:** When calculating the total financial amount of a transaction line, you must explicitly enforce the negative sign on the tax if the quantity is negative.
**Formula:** `(qty * retail_price) + CASE WHEN qty < 0 THEN -line_tax ELSE line_tax END`

## 2. Intraday Ordering Rule
**Problem:** Drivers often drop off full cylinders and pick up empties simultaneously. If the ERP processes the Credit Note (return) before the Invoice (delivery) on the same day, the physical running balance will temporarily drop below zero, causing confusion in statements.
**Rule:** When calculating chronological running balances for physical cylinders, transactions on the same `tx_date` must **always** be ordered with `Invoice` records processing *before* `Crd Note` records.

## 3. Debt Partitioning Rule
**Problem:** The ERP's built-in payment allocation system is historically broken. Payments are not reliably matched to specific invoices, causing the aging analysis to fail. Furthermore, the ERP lumps LPG Gas debt and Cylinder Deposit debt into a single global balance.
**Rule:**
1.  **Global Pooling:** Unallocated payments must be pooled against the total gross debt.
2.  **Segregation:** The debt must be split into two ledgers: purely **LPG Gas Debt** and purely **Cylinder (CYL) Deposit Debt**.
3.  **Quarantined Payments:** Specific payments historically made explicitly for cylinder deposits (e.g., DOC 29693 and DOC 29694) must be manually quarantined and permanently subtracted from the global pool, and explicitly allocated against the CYL Deposit Debt ledger. All other payments are assumed to be for LPG Gas.

## 4. Asset Write-Off Rule
**Problem:** When a client pays for a cylinder deposit, they essentially purchase the cylinder from the supplier. The physical cylinder is no longer "outstanding" as a liability to be returned.
**Rule:** When a quarantined cylinder payment is identified (e.g., R3,588.00), the equivalent physical quantity of cylinders (e.g., R3,588.00 ÷ R598.00/cyl = 6 cylinders) must be permanently subtracted from the "Physical Outstanding" running balance for that SKU (e.g., 19.1). The statement must reflect the remaining unpaid cylinders as the true physical liability.

## 5. SKU Dual-Line Pattern (`.1` Deposit vs `01` Gas Fill)
**Discovered during:** JEN001 / FAM000 reconciliation (May 2026).

**Background:** Every cylinder delivery generates **two line items** on the same invoice — one for the gas fill, one for the physical cylinder deposit bond. These are encoded as separate SKUs with a naming convention:

| SKU suffix | Meaning | Category | `debt_group` | Statement section |
| :--- | :--- | :---: | :---: | :--- |
| `.1` (e.g. `9.1`, `19.1`, `S.1`, `D.1`, `14.1`) | **Cylinder deposit / bond** — refundable physical asset | `CYL` | `CYL` | Part 2: CYL Ledger |
| `01` (e.g. `901`, `1901`, `S01`, `D01`, `1401`) | **Packed gas fill** — revenue charge for LPG content | `9KG` / `19K` / `SV` / `DV` / `14K` | `LPG` | Part 1: Gas Statement |

**The full SKU inventory:**

| Gas-fill SKU | Description | Deposit SKU | Description |
| :--- | :--- | :--- | :--- |
| `901` | 9kg LPG Packed | `9.1` | 9kg Cylinder Deposit |
| `1401` | 14kg LPG Packed | `14.1` | 14kg Cylinder Deposit |
| `1901` | 19kg LPG Packed | `19.1` | 19kg Cylinder Deposit |
| `S01` | 48kg Single-Valve Packed | `S.1` | 48kg SV Cylinder Deposit |
| `D01` | 48kg Double-Valve Packed | `D.1` | 48kg DV Cylinder Deposit |

**The Bug (now fixed):** The original `vw_clean_transactions` view only mapped `19K`, `9KG`, and `LPG` categories to `debt_group = 'LPG'`. Categories `14K`, `SV`, and `DV` fell through to `debt_group = 'OTHER'`, silently excluding 14kg, 48kg SV, and 48kg DV gas revenue from all statement calculations.

**Fix applied to `vw_clean_transactions`:**
```sql
CASE
    WHEN category = 'CYL'                                   THEN 'CYL'
    WHEN category IN ('19K','9KG','LPG','14K','SV','DV')    THEN 'LPG'
    ELSE 'OTHER'
END AS debt_group
```

**Impact of fix:** All five cylinder size gas fills now correctly appear in Part 1 (LPG Gas Statement) of any debtor reconciliation. Accounts trading exclusively in 48kg (e.g. industrial clients using S01/D01) were previously showing zero gas debt in the statement despite having active invoices.

**Why this was not caught earlier:** JEN001 trades only 19kg and 9kg — both of which were already correctly mapped. The gap was only exposed during the FAM000 reconciliation when invoice `#49832` contained an S01 line of R13,819.59 that did not appear in the running gas balance.

## 6. ERP Header Cross-Check Rule
**Discovered during:** FAM000 / SKU audit (May 2026).

**Problem:** The reconciliation logic builds statements entirely from `transaction_items` line sums. It never validates that `SUM(line_total)` for a document equals the ERP header total (`transaction_headers.amount_excl + tax_amount`). Silent data gaps (e.g. missing line items, wrong `debt_group` routing) pass through undetected.

**Rule:** Every reconciliation run must include a cross-check query:
```sql
SELECT
    h.doc_no, h.entry_type, h.account_no,
    ROUND(h.amount_excl + h.tax_amount, 2)  AS erp_header_total,
    ROUND(SUM(v.line_total), 2)             AS our_line_total,
    ROUND((h.amount_excl + h.tax_amount) - SUM(v.line_total), 2) AS delta
FROM transaction_headers h
JOIN vw_clean_transactions v
    ON LTRIM(v.doc_no,'0') = LTRIM(h.doc_no,'0')
   AND v.account_no = h.account_no
WHERE h.account_no = :account
  AND h.entry_type IN ('Invoice','Crd Note')
GROUP BY h.doc_no, h.entry_type, h.account_no, h.amount_excl, h.tax_amount
HAVING ROUND((h.amount_excl + h.tax_amount) - SUM(v.line_total), 2) != 0
ORDER BY ABS(delta) DESC;
```
**Expected deltas (tolerated):** Credit Note tax-sign discrepancies (the double-taxation bug — documented in Rule 1). These are known and corrected by `vw_clean_transactions`.
**Unexpected deltas (must investigate):** Any Invoice where delta is large or where `our_line_total` is negative — indicates either missing line items or a doc_no collision (see Rule 7).

**Global baseline (as of May 2026):**
- 13,559 Credit Note docs with delta totalling R11,681,869 → entirely the tax bug (expected)
- 105 Invoice docs with delta totalling R381,302 → doc_no collision issue (see Rule 7)

## 7. Doc No Collision Rule
**Discovered during:** FAM000 / ERP cross-check (May 2026).

**Problem:** The ERP reuses document numbers across time. The same `doc_no` (e.g. `00011567`) can appear as an `Invoice` in 2021 and then as a `Crd Note` in 2024. When reconciliation JOINs `vw_clean_transactions` to `transaction_headers` on `doc_no` alone, both sets of line items collapse onto each other — producing nonsensical totals (e.g. an Invoice showing a negative line sum).

**Affected FAM000 docs (known):** `11567`, `11568`, `11984`, `12208`, `12889`, `14055`, `14363` — all show `item_entry_types = 'Crd Note, Invoice'` when joined.

**Rule:** All JOIN operations between headers and line items must add an `entry_type` filter on the items side, or use `(doc_no, account_no, entry_type, tx_date)` as the composite key — never `doc_no` alone:
```sql
-- Safe join pattern
JOIN vw_clean_transactions v
    ON LTRIM(v.doc_no,'0') = LTRIM(h.doc_no,'0')
   AND v.account_no  = h.account_no
   AND v.entry_type  = h.entry_type   -- prevents cross-type collision
```
**Impact on statements:** The current statement-building queries in `reconcile_fam.py` group by `(entry_type, tx_date, doc_no)` on the items side and do not JOIN back to headers, so they are **not affected** by this collision. The risk only materialises in cross-check or audit queries that JOIN the two tables.

## 8. ERP CSV Ground Truth Approach
**Problem:** For heavily broken accounts, calculating pure historical running balances from the database is often intractable due to the combination of payment allocations, doc recycling, and tax signs.
**Rule:** For such accounts, we export a literal text statement (`FAM000.TXT`) from the ERP and treat it as the absolute financial "Ground Truth".
*   **Sub-rule 8a (Cylinder DB Mapping):** When building the cylinder ledger, only `doc_no`s explicitly found inside the CSV Ground Truth file may be queried from the Supabase database. Any database entries absent from the CSV must be ignored to prevent the two ledgers from drifting.
*   **Sub-rule 8b (Sorting enforcement):** The ERP's text export frequently breaks **Rule 2** (Intraday Ordering), printing Credit Notes before Invoices on the same day. Scripts parsing the CSV must intercept the rows, sort them by Date and then ensure `Invoice` or `Payment` comes before `Crd Note`, and automatically recalculate the chronological `Running Balance` column to ensure mathematical consistency.

## 9. Database Schema Mapping (Payments vs Items)
**Problem:** Agents frequently fail to find Payment records because they exclusively query the `vw_clean_transactions` view, assuming it represents the entire debtor ledger. 
**Rule:** You must query the correct table depending on the data required:
*   `vw_clean_transactions`: Use this view ONLY when you need line-item granularity (e.g., tracking physical cylinder quantities or identifying specific SKU prices). It only contains itemized `Invoice` and `Crd Note` entry types.
*   `transaction_headers`: Use this table (which acts as the DTRX debtor ledger) to calculate absolute financial totals for a debtor. It contains ALL transaction types, including the `Payment` entry type, which is absolutely critical for calculating running and closing financial balances.

## 10. Zero-Value Cylinder Reporting (The "Stripped" Logic)
**Problem:** Cylinder deposits (`x.1` SKUs) historically fluctuated in price and cause massive financial distortion on the ledger. 
**Rule:** When producing a finalized reconciliation statement, cylinder deposits must be treated as having **R0.00** financial value.
*   **Part 1 (Financials):** You must dynamically subtract the financial value of all `x.1` SKUs from their parent document's total. If a document (e.g., an Invoice) is composed entirely of `x.1` SKUs, its remaining Gas Value will be exactly R0.00. This document must be **completely hidden** from the Part 1 financial ledger to prevent clutter.
*   **Part 2 (Cylinders):** This section must purely reflect physical asset movement (Quantities). No financial/Rand values should be assigned or displayed for cylinders.

## 11. CYL Document Stripping Rule (ERP CSV Ground Truth Layer)
**Discovered during:** JEN001 reconciliation (May 2026).

**Problem:** The ERP text export (`*.TXT`) produced by the CSV Ground Truth approach (Rule 8) includes both the gas-fill invoices **and** the paired cylinder-deposit invoices/credit notes in a single flat ledger. When computing the **LPG financial balance**, the cylinder rows must be identified and completely excluded before any running-balance calculation. Failure to strip them causes the financial totals to appear inflated (the deposit charge) and then deflated (the reversal), polluting the Gas ledger with noise.

**Observed pattern in JEN001.TXT:**

Every cylinder delivery generates **three** ERP rows on the statement:

| Row | `ENTRY` | `CUSTOMER/BANK REF` example | Purpose | Action |
| :--- | :--- | :--- | :--- | :--- |
| Main gas invoice | `Invoice` | `DN-21759` | LPG gas charge | **Keep** |
| Deposit charge | `Invoice` | `DN-21759-EMPTY` | Cylinder deposit bond | **Strip** |
| Deposit reversal | `Crd Note` | `DN-21759-EMPTY` | Automatic credit reversing the bond | **Strip** |

The deposit charge and its paired reversal always net to **R0.00**, so stripping both has zero impact on the closing financial balance — but it dramatically cleans the ledger for human readability and prevents double-counting bugs.

**Identification rule:** A document is a CYL document if and only if its `CUSTOMER/BANK REF` (column 7 in the CSV) ends with the suffix **`-EMPTY`** (case-insensitive) or contains an equivalent cylinder-deposit marker (e.g. `EMPTY` without a dash, as seen in `DN#22114EMPTY`).

**Formal stripping predicate (Python):**
```python
import re

CYL_PATTERN = re.compile(r'[-`#]?EMPTY$', re.IGNORECASE)

def is_cyl_row(customer_bank_ref: str) -> bool:
    """Returns True if this ERP row is a cylinder deposit document that must be stripped."""
    return bool(CYL_PATTERN.search(customer_bank_ref.strip()))
```

**Rule:**
1. **Parse** the raw ERP TXT file into rows, skipping header/footer lines.
2. **Classify** every `Invoice` and `Crd Note` row using `is_cyl_row()` on the `CUSTOMER/BANK REF` field.
3. **Strip** all rows where `is_cyl_row()` returns `True` before constructing the financial running balance.
4. **Retain** stripped rows in a separate `cyl_rows` collection — they are still needed by the cylinder ledger (Part 2) to track physical cylinder movements. Do **not** discard them entirely.
5. **Apply Rule 8b** (intraday sort) **after** stripping so the sort operates only on the clean gas rows.

**Relationship to Rule 10:** Rule 10 governs the Supabase / database layer (zeroing `x.1` SKU financials). Rule 11 governs the **CSV Ground Truth layer** (stripping entire `-EMPTY` documents from the flat text export). Both rules achieve the same business objective — isolating gas debt from cylinder deposit noise — but at different data layers. Both must be applied independently.
