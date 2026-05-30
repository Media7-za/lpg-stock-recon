# 📝 LPG Supplier, Costing, and Walk-in Debtor Business Rules

This document outlines the authoritative business rules and technical specifications deduced from the Supabase ledger database and raw ERP transaction data. These rules govern the calculation of LPG unit costing, supplier transactions, and the classification of generic walk-in debtor accounts.

---

## 1. LPG Supplier & SKU Mapping Rules

The system interacts with two primary suppliers for LPG cylinder products. Their account numbers and SKU structures are defined as follows:

### 🔹 Supplier Account Codes
* **Oryx Energy**:
  * **`008ORY`** — **Active primary account code** (from March 2025 onwards).
  * **`007ORY`** — **Historical/Legacy account code** (active up to February 2025).
* **MZM Distribution (PTY) LTD**:
  * **`002MZM`** — **Active primary account code** for GRVs (from March 2025 onwards).
  * **`001MZM`** — **Historical/Legacy account code** (active up to March 2025).
  * *(Note: `003MZM` also exists as an adjustment code with very few records from July 2025).*

### 🔹 Stock Number (SKU) Conventions
Brand-specific and size-specific SKUs are separated by suffix to distinguish actual gas fuel content (Fulls) from cylinder shell deposits (Empties):

| Brand / Supplier | Product Category | SKU Suffix / Pattern | Examples |
| :--- | :--- | :--- | :--- |
| **Oryx Energy (`008ORY` / `007ORY`)** | **LPG Gas (Fulls)** | `.4` | `9.4` (9kg), `14.4` (14kg), `19.4` (19kg), `S.4` (48kg SV), `D.4` (48kg DV) |
| **Oryx Energy (`008ORY` / `007ORY`)** | **Cylinder Deposit (Empties)** | `.1` | `9.1` (9kg), `14.1` (14kg), `19.1` (19kg), `S.1` (48kg SV), `D.1` (48kg DV) |
| **MZM Distribution (`002MZM` / `001MZM`)** | **LPG Gas (Fulls)** | `01` | `901` (9kg), `1401` (14kg), `1901` (19kg), `S01` (48kg SV), `D01` (48kg DV) |
| **Bulk LPG** | **Gas Top-ups** | `LPG-01` | `LPG-01` (Bulk LPG top-up / Conversion) |

---

## 2. LPG Cost & price-per-kg Calculation Engine Rules

To compute the true cost and average price per kilogram of LPG for a given period, the calculation engine must apply the following computational filters and rules:

### 🔹 Rule 1: ERP Signage Inversion (GRV vs Debit Notes)
* **Goods Received Vouchers (GRVs)**: Represent stock additions but are recorded in raw ERP imports with **negative quantities** (e.g. `qty: -50`, `line_tax: -1395.53`). The calculation engine **MUST** use the absolute values of these quantities and taxes when aggregating incoming stock.
* **Debit Notes (Supplier Returns/Credits)**: Represent stock reductions/credits and are recorded with **positive quantities** (e.g. `qty: 10`, `line_tax: 270.00`).
* **Net Value Formulation**:
  $$\text{Net Quantity} = \sum |\text{GRV Qty}| - \sum |\text{DebNote Qty}|$$
  $$\text{Net Cost (Excl. Tax)} = \sum (|\text{GRV Qty}| \times \text{cost\_price}) - \sum (|\text{DebNote Qty}| \times \text{cost\_price})$$
  $$\text{Net Cost (Incl. Tax)} = \text{Net Cost (Excl.)} + \left( \sum |\text{GRV Tax}| - \sum |\text{DebNote Tax}| \right)$$

### 🔹 Rule 2: Cylinder Deposit Exclusion
> [!IMPORTANT]
> Cylinder deposits (`.1` SKUs) represent capitalized container shell assets rather than consumable LPG fuel. 
> Under normal operation, deposit charges on GRVs are offset by returns on Debit Notes of matching quantities, netting to zero. **The calculation engine MUST exclude cylinder deposits from the LPG fuel cost-per-kg analysis.**

### 🔹 Rule 3: Non-LPG Stock Filtering
Raw supplier GRV lines often contain non-LPG agricultural stock items (e.g. `00320047` Efekto weedkiller, `00910006` Meadow animal feed, `00000383` LAN fertilizer, `00000381` Mondial potatoes). **The calculation engine MUST filter out non-LPG stock items by checking category, stock group, or SKU codes prior to LPG costing calculations.**

---

## 3. Walk-in / COD Debtor Account Rules (`INC001` / `001UNA`)

> [!CAUTION]
> **Refutation of Bank-Staging Theory**: `INC001` is NOT a bank statement clearing account where raw payment imports are staged. 
> It is an active walk-in COD/Immediate Deposit debtor ledger account.

### 🔹 Behavioral Specifications
* **Normal Customer Document Types**: `INC001` actively processes all typical debtor entries, including:
  * `Invoice` (positives — debits to the account)
  * `Payment` (negatives — credits to the account)
  * `Crd Note` (negatives — credits to the account)
  * `Journal` / `Bank UD` (adjustments)
* **Variable Customer Details**: In `transaction_headers`, the `account_name` column is overridden on a per-document basis to reflect the specific walk-in customer (e.g. `MRS DLAMINI`, `BOSS DLAMINI`) or deposit transaction references (e.g. `ADT CASH DEPOSIT HILLCRES MSDL`). 
* **Scoring Rules Application**: Since `INC001` is a standard ledger customer account, the **Payment (PMT) Lane Scoring Engine** applies to it identically to individual customer accounts, matching unallocated payments against invoices based on temporal decay, amount proximity, and overridden references.
* **Unallocated Payments (`001UNA`)**: Similarly, `001UNA` represents the customer account for "UNALLOCATED PAYMENTS", which holds payments that could not be mapped to any customer or COD account on entry.

---

## 4. Linked / Consolidated Account Rules

Some debtors exist under more than one ERP account code. These accounts must be treated as a **single consolidated entity** for all AR, reconciliation, and reporting purposes.

### 🔹 JEN001 ↔ JEN010 (Same Debtor — Cylinder Deposit Sub-Account)

> [!IMPORTANT]
> `JEN001` is the **primary trading account** for the Jende debtor (gas sales + all payment receipts).
> `JEN010` was a **dedicated cylinder deposit sub-account** — created solely to invoice outgoing cylinder deposits and credit returning cylinders. It is now **inactive**.

#### Account Purpose Split

| Account | Purpose | Entry Types Expected |
| :--- | :--- | :--- |
| **`JEN001`** | Main trading account — LPG gas sales, all payment receipts | `Invoice`, `Payment`, `Crd Note`, `Journal` |
| **`JEN010`** | Cylinder deposit only — outgoing CYL charges and return credits | `Invoice` (CYL out), `Crd Note` (CYL return) **only** |

#### Business Rules

> [!CAUTION]
> **No payments should ever appear on `JEN010`.** Any `Payment` or `Bank UD` entry found on `JEN010` is a **posting error** and must be flagged for manual review and reallocation to `JEN001`.

- **AR Balance**: True Jende balance = `JEN001.balance + JEN010.balance` combined. The `JEN010` balance represents outstanding cylinder deposit charges not yet credited back by cylinder returns.
- **Age Analysis**: Both codes must consolidate under a single **"Jende"** debtor row. Do not report separately.
- **Payment Matching**: The allocation engine must **never** attempt to match payments against `JEN010` invoices directly. Cylinder deposit invoices on `JEN010` are cleared by cylinder return credit notes, not by cash payments.
- **Inactive Status**: `JEN010` is inactive — no new transactions should be posting to this account. Any new `JEN010` entries are a data entry error.
- **Cylinder Deposit Mirror**: The `JEN010` AR pattern is the debtor-side equivalent of the `.1` SKU cylinder deposit pattern on the stock/supplier side — both track cylinder shell assets separately from fuel value.

---

### 🔹 Adding Further Linked Accounts

When additional linked account pairs are identified, follow this pattern:
- Document the pair and the business reason for the split
- Add them to the allocation engine's `LINKED_ACCOUNTS` config/constant
- Ensure age analysis and statement queries use a `GROUP BY consolidated_name` approach
