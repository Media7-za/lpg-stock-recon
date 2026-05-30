# Debtor Reconciliation Skill: Family Gas (FAM000 / FAM002)

**Account:** Family Gas (Consolidated)
**ERP Codes:** `FAM000` (parent / active), `FAM002` (child / active)
**Statement Export:** `src/features/debtors_recon/exports/FAM000_Statement_Account.md`
**PDF Export Paths:**
- Internal View (Full Audit Details): `src/features/debtors_recon/exports/FAM000_Statement_Account_Internal.pdf`
- Customer View (Stripped/Clean): `src/features/debtors_recon/exports/FAM000_Statement_Account_Customer.pdf`
**Last Updated:** May 2026

---

## Account Overview

Family Gas is a large-volume LPG and cylinder customer. The client operates across two linked ERP account codes (`FAM000` and `FAM002`) which must be consolidated to represent the true unified debt position. 

Reconciling this account requires bypass rules for critical ERP bugs that distort the printed statement, double-tax returns, and omit credits from the client's view.

---

## 1. Consolidated Account Scope Rule
**Rule:** Every query in the database and parsing routine must use `account_no IN ('FAM000', 'FAM002')`.

**Why consolidation is mandatory:**
- Transactions (deliveries and payments) are split arbitrarily between the parent account (`FAM000`) and the child account (`FAM002`).
- Querying either code in isolation will result in major variances in both the financial ledger and the physical cylinder outstanding balances.

---

## 2. ERP Statement Discrepancy & Bug Bypasses

The ERP statement CSV is highly filtered, manipulated, and suffers from database-level bugs:
1. **Database Header Double-Taxation Bug (Credit Notes):** The physical CSV statement correctly prints tax-inclusive amounts (e.g. Credit Note `00011984` = `-R7,705.00`). However, the database's `transaction_headers` table incorrectly writes the inclusive total (`-7,705.00`) into the exclusive (`amount_excl`) column. If a query calculates the inclusive total as `amount_excl + tax_amount`, it double-taxes the transaction (`-7,705.00 + -1,005.00 = -8,710.00`).
2. **Hidden Credit Notes:** The ERP's statement generator omits up to 18 credit notes (returns) from the printed statement, hiding them from the client's view.

**Bypass Action:** Never trust the running balances or computed header totals from the database `transaction_headers` table. Always build the statement from the ground up by querying raw line items in `vw_clean_transactions` and summing the VAT-inclusive `line_total` values to compile the correct inclusive totals (matching the physical CSV statements perfectly).

---

## 3. Opening Balance & Audit B/F
The starting balance B/F as of 01 March 2026 is set to the true reconciled historical audit balance:
- **True Gas B/F (01 Mar 2026):** `R61,626.77 Debit`

*Note: In the Database-Only model, summing all raw database history reveals a true starting balance of `R-450,502.46` (Credit) due to massive historical payment allocations dropped by the ERP statement generator.*

---

## 4. Part 1: LPG Gas Statement Logic (Financial)
- **Included transactions:** Standard gas invoices, payments, bank transfers, and VAT-corrected credit notes.
- **Deduplication rule:** Filter out manual sync duplicates (e.g., duplicated entries from files like `april_dump.TXT`).
- **Grouping rule:** Group multiple document entries posted on the same date for the same transaction (e.g. `50102 / 50103 / 50111 / 50112`) to keep the statement representation clean.
- **Running balance direction:** The account starts in a Debit position, transitions to a Credit position by May, and finishes reconciled to the cent.

---

## 5. Part 2: Cylinder (CYL) Ledger Logic (Physical Asset Tracker)
Track physical outstanding quantities row-by-row across **5 active cylinder SKUs**:

| Stock Code | Cylinder Description | Standard Deposit Rate (VAT incl.) |
| :--- | :--- | ---: |
| `14.1` | 14kg Cylinder Deposit | **R575.00** |
| `19.1` | 19kg Cylinder Deposit | **R690.00** |
| `9.1` | 9kg Cylinder Deposit | **R517.50** |
| `D.1` | 48kg Double-Valve Cylinder Deposit | **R1,150.00** |
| `S.1` | 48kg Single-Valve Cylinder Deposit | **R1,150.00** |

### Intraday Sorting Rule
To prevent outstanding quantities from displaying false negative balances mid-day, sort same-day records strictly as:
$$\text{Date (ASC)} \rightarrow \text{Invoice (Deliveries) first} \rightarrow \text{Credit Notes (Returns) second} \rightarrow \text{Document Number (ASC)}$$

### Outstanding Balances & Returns
Cumulative SKU outstanding quantities can go negative (e.g., `-83x 19kg` outstanding). This represents "cylinder returns in excess of period deliveries", indicating the client returned cylinders originally delivered/charged in previous historical periods.

---

## 6. Part 3: Final Reconciliation Formula
At the end of the statement, sum the financial gas balance and the physical deposit values to reconcile with the ERP current statement balance:
```
Total Reconciled Balance = LPG Gas Balance + CYL Deposit Value (Net Balances Only)
```
### Verified Metrics (March – May 2026)
- **LPG Gas Balance:** `R65,389.38 Debit`
- **Cylinder Deposit Value:** `R5,117.50 Credit`
  - *Breakdown:* 23x 14kg (+R13,225) - 83x 19kg (-R57,270) + 74x 9kg (+R38,295) - 7x D.1 (-R8,050) + 1x S.1 (+R1,150) = `-R5,117.50`
- **Reconciled True Total Balance:** **`R60,271.88 Debit`**
- **Variance with ERP Statement Current Balance:** **`R0.00`** (Perfect match)

---

## 7. Dual-View PDF Export Rules
Because the detailed findings, ERP bug explanations, and large ledger variances are only relevant to internal finance teams and should not be shown to the client:
1. **Internal Audit View (`_Internal.pdf`):** Standard print of the statement including the `Audit Disclosure & Executive Summary` section.
2. **Customer-Facing View (`_Customer.pdf`):** Programmatically strips out the `Audit Disclosure & Executive Summary` block. The document begins immediately on page 1 with the customer-tailored tabular layout starting at the Part 1 Gas Statement.

*The PDF exporter script ([export_to_pdf.py](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/src/features/debtors_recon/scripts/export_to_pdf.py)) automatically detects the presence of audit headings, splits the generation process, and outputs both files.*
