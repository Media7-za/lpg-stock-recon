# Lane 3: Reconciliation Engine Memory Document

This document defines the mathematical model, reconciliation rules, and variance analysis used in the **Reconciliation Engine** lane.

---

## 1. Ledger Balance Separation
The global debtor balance is divided into two separate sub-balances:
1.  **LPG Gas Balance:** The running balance of all gas charges (Suffix `01` SKU line totals) minus all generic monthly statement payments.
2.  **Cylinder Financial Balance:** The running balance of all cylinder deposit transactions (Suffix `.1` SKU line totals) minus quarantined cylinder payments.

$$\text{Total Debtor Balance (ERP)} = \text{LPG Gas Balance} + \text{Cylinder Financial Balance}$$

---

## 2. Custody Position & Exposure Math
The custody position tracks the physical quantities of outstanding cylinders held by the customer across five active SKUs. The net physical outstanding cylinders are valued at standard deposit rates to compute the **Cylinder Custody Exposure**:

$$\text{Cylinder Custody Exposure} = \sum (\text{Net Qty per SKU} \times \text{Standard Deposit Rate})$$

### Standard Deposit Rates (VAT incl.)
*   `14.1` (14kg): **R575.00**
*   `19.1` (19kg): **R690.00**
*   `9.1` (9kg): **R517.50**
*   `D.1` (48kg DV): **R1,150.00**
*   `S.1` (48kg SV): **R1,150.00**

---

## 3. Reconciliation & Cylinder Variance
The engine cross-checks the financial ledger and the custody ledger. Any difference is surfaced as the **Cylinder Variance**:

$$\text{Cylinder Variance} = \text{Cylinder Financial Balance} - \text{Cylinder Custody Exposure}$$

*   **R0.00 Variance:** Indicates that all outstanding cylinders in custody are financially accounted for at current standard rates (e.g. `JEN001`).
*   **Non-Zero Variance:** Surfaces historical price differences (e.g. `FAM000` variance of `+R7,532.50` due to historical deliveries recorded at R345.00 instead of standard R690.00/R517.50 rates).

---

## 4. Payment Segregation & Quarantine Rules
*   **Generic Payments:** Standard payments are assumed to clear LPG Gas debt and pool against the LPG running balance.
*   **Quarantined Payments:** Specific payments explicitly made for cylinder deposits (e.g. `00029693` and `00029694`) are quarantined and permanently deducted from the LPG pool.
*   **Asset Write-Off:** When a quarantined payment is applied to the cylinder ledger, it commercially settles the deposit. The equivalent quantity of cylinders is permanently subtracted from the "Physical Outstanding" balance of that SKU.
