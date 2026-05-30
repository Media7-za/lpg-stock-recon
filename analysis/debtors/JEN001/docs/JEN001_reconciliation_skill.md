# Debtor Reconciliation Skill: Jennings Gas (JEN001 / JEN010)

**Account:** Jennings Gas — Jens Spoon Pty Ltd
**ERP Codes:** `JEN001` (active), `JEN010` (legacy — LPG-only, standard gas)
**Statement Script:** `src/features/debtors_recon/scripts/reconcile_jen_db_only_monthly_stripped.py`
**Export Path:** `src/features/debtors_recon/exports/JEN001_Statement_Account.md`
**Last Updated:** May 2026

---

## Account Overview

Jennings Gas is a recurring LPG cylinder customer that operates exclusively with **19kg** and **9kg** cylinders. The customer's account has two ERP codes due to a historical migration:

| Account Code | Status | Scope |
| :--- | :--- | :--- |
| `JEN001` | **Active** — primary account for all reconciliations | Gas + Cylinder deposits from ~Dec 2024 onwards |
| `JEN010` | **Legacy** — do not include unless explicitly requested | Standard gas-only, pre-migration (early cylinder deliveries 2024) |

> **IMPORTANT:** All reconciliations default to **`JEN001` only**. Never merge `JEN010` transactions unless the user explicitly requests a full historical combined view. Doing so will corrupt the physical cylinder opening balances.

---

## 1. Account Scope Rule

**Rule:** Query only `account_no = 'JEN001'` in all database queries.

**Why JEN010 is excluded:**
- The initial batch of 19kg cylinder deliveries in early 2024 were captured under `JEN010` before the customer migrated to `JEN001` in December 2024.
- Including `JEN010` changes the 9kg cylinder physical opening balance (as of 01 Mar 2026) from **-1** to **+5**, because those early deliveries were booked under the old code.
- The **financial** opening balance (Gas B/F) is unaffected, as all LPG revenue transactions were captured under `JEN001` from the start.
- The cylinder physical discrepancy of -1 (9kg, under JEN001-only) is a known and accepted artefact of the migration — not a reconciliation error.

---

## 2. The Stripped Gas Model

Jennings Gas uses the **Stripped Gas Model** for all statement production. This model separates the account ledger into two independent components:

### Part 1: LPG Gas Statement (Financial)
- Tracks all gas-fill revenue and payments as a running balance (VAT inclusive).
- Cylinder deposit invoices and their reversals are **completely excluded** (stripped) from this ledger.
- Only gas-fill `Invoice`, `Crd Note`, and `Payment` transactions appear here.

### Part 2: Cylinder Ledger (Physical — optional)
- Tracks the physical count of cylinders on loan to the customer by SKU.
- No Rand values are assigned. Movement is quantity-only.
- Can be omitted when the user requests "LPG only" output.

**Formula for Gas Opening Balance:**
```
Gas Opening B/F = Combined Ledger B/F (headers) − Cylinder Deposit B/F (line items)
```

---

## 3. Opening Balance Derivation

The opening balance for any statement period is calculated dynamically from the database — never hardcoded.

### SQL Pattern
```sql
-- Step 1: Combined account balance prior to statement start date
SELECT SUM(
    CASE WHEN entry_type = 'Crd Note'
         THEN amount_excl
         ELSE amount_excl + tax_amount
    END
) AS combined_bf
FROM transaction_headers
WHERE account_no = 'JEN001'
  AND tx_date < :start_date;

-- Step 2: Cylinder deposit value prior to statement start date
SELECT SUM(line_total) AS cyl_bf
FROM vw_clean_transactions
WHERE account_no = 'JEN001'
  AND debt_group = 'CYL'
  AND tx_date < :start_date;

-- Gas Opening Balance = combined_bf - cyl_bf
```

### Verified Opening Balances (JEN001 only)

| Statement Start | Combined B/F | Cylinder B/F | Gas Opening B/F |
| :--- | ---: | ---: | ---: |
| 01 Nov 2025 | calculated dynamically | calculated dynamically | **R3,505.55** |
| 01 Mar 2026 | R9,220.53 | R6,658.50 | **R2,562.03** |

> The March 2026 opening balance of **R2,562.03** can be independently verified from the raw ERP statement (JEN001.TXT): the last line in February 2026 (Crd Note 00014477, dated 24/02/2026) closes at balance 9220.53. Subtracting 6658.50 in cylinder deposits yields 2562.03.

---

## 4. Cylinder Tracking (SKUs)

Jennings Gas trades in two cylinder sizes:

| SKU | Description | Deposit Rate (VAT incl.) |
| :--- | :--- | ---: |
| `19.1` | 19kg Cylinder Deposit | **R690.00** |
| `9.1` | 9kg Cylinder Deposit | **R517.50** |

**Intraday sort rule (applies to cylinder ledger):** On the same `tx_date`, `Invoice` records must always be processed **before** `Crd Note` records. This prevents the physical running balance from displaying a false negative when the ERP logs returns before deliveries (see global Business Rule 2).

---

## 5. ERP Document Pattern (Three-Row Delivery Pattern)

Every cylinder delivery in the Jennings Gas ERP generates **three rows** in the flat statement export:

| Row | Entry | CUSTOMER/BANK REF | Financial Impact | Cylinder Impact |
| :--- | :--- | :--- | :--- | :--- |
| Gas fill | Invoice | DN-21759 | Keep in Gas Statement | None |
| Deposit bond | Invoice | DN-21759-EMPTY | Strip (deposit charge) | +qty cylinders |
| Bond reversal | Crd Note | DN-21759-EMPTY | Strip (net = R0.00) | -qty cylinders returned |

The deposit charge and reversal always net to **R0.00** financially, so stripping them has zero impact on closing gas balance.

**Stripping predicate (Python):**
```python
import re
CYL_PATTERN = re.compile(r'[-`#]?EMPTY$', re.IGNORECASE)

def is_cyl_row(customer_bank_ref: str) -> bool:
    """Returns True if this ERP row is a cylinder deposit row to be stripped."""
    return bool(CYL_PATTERN.search(customer_bank_ref.strip()))
```

**Known ERP reference variants observed in JEN001:**
- `DN-21759-EMPTY` — standard hyphen suffix
- `DN#22114EMPTY` — hash separator, no hyphen
- `` DN`21271-EMPTY `` — backtick separator

The CYL_PATTERN above handles all three variants.

---

## 6. Statement Generation Workflow (Step-by-Step)

### Step 1: Define the Statement Period
- Choose a start_date (e.g., 2025-11-01 for November 2025 onwards).
- The opening balance is dynamically derived for tx_date < start_date.

### Step 2: Calculate Opening Balance
- Run both SQL queries from Section 3.
- gas_opening_balance = combined_bf - cyl_bf

### Step 3: Fetch Statement Period Transactions
- **Line items** (Invoices + Credit Notes): query `vw_clean_transactions` where `tx_date >= start_date`, grouped by `(tx_date, doc_no, entry_type, debt_group)`.
- **Payments**: query `transaction_headers` where `tx_date >= start_date` and `entry_type IN ('Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep', 'Journal')`.

### Step 4: Partition Line Items
For each (doc_no, entry_type, tx_date):
- Sum all line_total where debt_group = 'LPG' → gas_amount
- Sum all line_total where debt_group = 'CYL' → cyl_amount (excluded from gas statement)
- If gas_amount == 0 and cyl_amount > 0 → the document is cylinder-only: hide entirely from Part 1 (Gas Statement).

### Step 5: Build Running Gas Balance
- Sort all gas rows chronologically: (ISO_Date ASC, Invoice before Crd Note, doc_no ASC).
- Apply running balance starting from gas_opening_balance.

### Step 6: Output Part 1 (Gas Statement)
- Group rows by month.
- For each month, show: Opening Balance, transaction rows, Closing Balance, and a summary block.

### Step 7: Output Part 2 (Cylinder Ledger) — optional
- Track physical qty changes per SKU (9.1, 19.1) month by month.
- Show opening count, per-transaction deltas, and closing count.
- Omit if the user requests "LPG only".

### Step 8: Regenerate Export Files
- Write JEN001_Statement_Account.md to src/features/debtors_recon/exports/.
- The statement is the source of truth; do not manually edit it.

---

## 7. Verified Statement Data (Nov 2025 – May 2026)

| Month | Gas Opening | Gas Invoices | Payments | Gas Closing |
| :--- | ---: | ---: | ---: | ---: |
| Nov 2025 | R3,505.55 | R7,227.32 | -R11,199.05 | **-R466.18** |
| Dec 2025 | -R466.18 | R9,082.81 | -R6,192.32 | **R2,424.31** |
| Jan 2026 | R2,424.31 | R3,032.41 | -R9,082.81 | **-R3,626.09** |
| Feb 2026 | -R3,626.09 | R9,220.53 | -R3,032.41 | **R2,562.03** |
| Mar 2026 | R2,562.03 | R6,186.46 | -R9,220.53 | **-R472.04** |
| Apr 2026 | -R472.04 | R11,476.16 | -R6,703.96 | **R4,300.16** |
| May 2026 | R4,300.16 | R9,034.38 | R0.00 | **R13,334.54** |

**ERP Reconciliation Check:** The ERP current balance (JEN001.TXT Line 4) shows **R23,443.04**.
- LPG Gas Balance: R13,334.54
- CYL Deposit Value: R10,108.50
- **Total: R23,443.04** matches ERP to the cent.

---

## 8. Known Edge Cases & Audit Notes

### 8a. November 2025 Payment Anomaly
The November 2025 payment (00042224, R11,199.05) exceeds the invoiced gas amount for that month (R7,227.32). This is expected — it is a catch-up payment covering prior period arrears. The negative closing balance of -R466.18 represents a credit in favour of the customer.

### 8b. January 2026 Payment Anomaly
Payment 00042917 (R9,082.81) was processed on 07 Jan 2026 but is dated in Period 11 in the ERP. This payment clears the December 2025 closing balance (R2,424.31) plus pre-existing arrears. The closing balance of -R3,626.09 represents an overpayment/credit position.

### 8c. 9kg Cylinder Physical Deficit (-1 unit as of 01 Mar 2026)
Under JEN001-only scope, the 9kg cylinder physical opening balance on 01 March 2026 is **-1**. This means one more 9kg cylinder was returned under JEN001 than was delivered under this account prior to March 2026. The missing delivery is traced to JEN010 (pre-migration). This is a known accounting artefact — not a stock loss. The financial balance is unaffected.

### 8d. February 2026 — Closing Balance as March Opening
The February 2026 closing gas balance of **R2,562.03** is also the March 2026 opening balance. This serves as a key internal cross-check: if the script is changed and the March opening drifts from R2,562.03, the statement start date or opening balance calculation must be investigated.

### 8e. Cylinder Deposit Rate History
| Rate Period | 19kg Rate (incl. VAT) | 9kg Rate (incl. VAT) |
| :--- | ---: | ---: |
| Early 2024 deliveries | R687.70 (R598.00 excl.) | R517.50 |
| Current (Dec 2024+) | **R690.00** (R600.00 excl.) | **R517.50** |

The vw_clean_transactions view stores actual line_total per transaction, so rate changes are automatically handled.

---

## 9. Cross-References to Global Business Rules

| Topic | Reference |
| :--- | :--- |
| Global tax sign correction | business_rules.md — Rule 1 |
| Intraday sort order | business_rules.md — Rule 2 |
| Gas vs Cylinder debt partitioning | business_rules.md — Rule 3, Rule 10 |
| SKU naming convention (.1 vs 01) | business_rules.md — Rule 5 |
| ERP CSV Ground Truth approach | business_rules.md — Rule 8 |
| CYL document stripping predicate | business_rules.md — Rule 11 |
| Database schema (headers vs items) | business_rules.md — Rule 9 |
