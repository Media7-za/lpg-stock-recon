# FAM000 Debtor Reconstruction Baseline - Version 4 (Extended)

## Metadata
- **Date:** 15 June 2026
- **Analyst:** Reconciliation Analyst & Debtor Reconstruction Specialist
- **Source Files Reviewed:**
  - `analysis/debtors/FAM000/raw/FAM000.TXT` (Raw ERP statement export)
  - Supabase database schema (`transaction_headers`, `vw_clean_transactions`, `vw_cylinder_ledger`)
- **Doctrine Version:** CYL Settlement Allocation Doctrine (v4 Canonical)

## Statement Scope
- **Period:** 1 March 2026 to 9 June 2026
- **Included Accounts:** `account_no IN ('FAM000', 'FAM002')` consolidated.

## Opening Balance Analysis (as of 1 March 2026) — Informative, Not Canonical
- **Method Used:** `openingBalanceStrategy: dynamic_db`
- **Supporting Evidence:**
  - **Combined B/F Balance:** R77,151.77
  - **Raw Cylinder B/F Value:** R15,525.00
  - **LPG Gas Opening B/F:** R61,626.77

## Cylinder Analysis
- **Outstanding Quantities (as of 1 March 2026 B/F):**
  - `14.1` (14kg): **24 cylinders**
  - `19.1` (19kg): **-75 cylinders** (Credit)
  - `9.1` (9kg): **90 cylinders**
  - `D.1` (48kg DV): **-2 cylinders** (Credit)
  - `S.1` (48kg SV): **8 cylinders**
- **Period Net Qty Changes (March–June 2026):**
  - `14.1` (14kg): Deliveries: +27 | Returns: -28 | Net: **-1 cylinder**
  - `19.1` (19kg): Deliveries: +45 | Returns: -53 | Net: **-8 cylinders**
  - `9.1` (9kg): Deliveries: +178 | Returns: -194 | Net: **-16 cylinders**
  - `D.1` (48kg DV): Deliveries: +0 | Returns: -5 | Net: **-5 cylinders**
  - `S.1` (48kg SV): Deliveries: +157 | Returns: -164 | Net: **-7 cylinders**
- **Net Returnable Cylinder Position (Custody outstanding as of 9 June 2026):**
  - `14.1` (14kg) Outstanding: **23 cylinders**
  - `19.1` (19kg) Outstanding: **-83 cylinders** (Credit)
  - `9.1` (9kg) Outstanding: **74 cylinders**
  - `D.1` (48kg DV) Outstanding: **-7 cylinders** (Credit)
  - `S.1` (48kg SV) Outstanding: **1 cylinder**

## Cylinder Financial Analysis
- **Gross Custody Exposure (outstanding value at standard rates):**
  - `14.1`: 23 cylinders @ R575.00 = R13,225.00
  - `19.1`: -83 cylinders @ R690.00 = -R57,270.00
  - `9.1`: 74 cylinders @ R517.50 = R38,295.00
  - `D.1`: -7 cylinders @ R1,150.00 = -R8,050.00
  - `S.1`: 1 cylinder @ R1,150.00 = R1,150.00
  - **Net Cylinder Custody Exposure:** **-R12,650.00** (Credit)
- **Cylinder Financial Balance:** **R-4,600.00**
- **Cylinder Variance:** **R-575.00**

## LPG Analysis
- **LPG Balance:** R39,211.97
- **LPG Supporting Calculations:**
  - **LPG Gas Opening B/F:** R61,626.77
  - **LPG Gas Billed (Period):** R422,180.85
  - **LPG Payments & Reversals (Period):** R-444,595.65
  - **LPG Gas Closing Balance:** **R39,211.97** (Debit)

## Final Reconciliation

```
Cylinder Financial Balance:      R-4,600.00
Plus LPG Gas Balance:            R39,211.97
========================================
Total Reconciled Balance:        R34,611.97
ERP Statement Current Balance:   R34,611.97
Variance:                         R0.00
```
