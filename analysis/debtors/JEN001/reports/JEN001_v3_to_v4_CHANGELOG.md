# JEN001 Reconciliation Changelog: Version 3 → Version 4

This document details the modifications, corrections, and alignment with the **CYL Settlement Allocation Doctrine** implemented in the transition from Statement Version 3 to Statement Version 4.

## Summary of Key Changes

1. **Payment Allocation Interpretation Shift**:
   - **V3 Model**: Assumed payments were generic, but did not analyze historical allocations before 2026. Set historical cylinder balance to R0.00 without tracing historical payment purposes.
   - **V4 Model**: Explicitly traces historical payment events. Identifies that payments `00029693` and `00029694` in March 2024 fully paid the cylinder deposit line items (6 cylinders each of `19.1` at R598.00 each, total R7,176.00). These are classified as **Confirmed CYL Settlement Allocations** via **invoiced-cleared inference** (since the generic payment cleared the parent invoice in full, we infer the cylinder line items within it were settled). This distinction is disclosed for future system engine design which will require explicit allocation events.

2. **Cylinder model separation**:
   - **Custody vs Financials**: V4 strictly separates physical custody (`Net Returnable Cylinders = Gross Delivered - Physical Returns - Commercialized Settlements`) from financial exposure (`Net Cylinder Exposure = Gross Exposure - Confirmed CYL Settlement Allocations`).
   - **Commercialized Cylinders**: The 12 cylinders of `19.1` paid for in March 2024 are removed from physical returnable custody outstanding, meaning they are no longer considered outstanding returnable cylinders.

3. **Dynamic B/F and Legacy Migration Credit**:
   - **V3 Model**: Forced a hardcoded R0.00 Cylinder B/F and R9,082.81 Gas B/F.
   - **V4 Model**: Dynamically computes B/F from Supabase. Correctly identifies a legacy migration balance of **-1** cylinder of `9.1` (value **-R517.50**) prior to 2026-01-01. This is included as a cylinder credit opening balance, shifting Gas B/F to R9,600.31 and Cylinder B/F to -R517.50.

4. **Allocation Evidence Register & Source Classification**:
   - **V4 Model**: Introduces an explicit Allocation Evidence Register mapping each cylinder settlement assumption to a structural classification framework. It separates direct matches from inferred cleared balances (`FULL_INVOICE_SETTLEMENT`, `SYSTEM_MIGRATION_CARRIED`) and assigns explicit confidence tiers.

## Balance Movements

| Balance Component | Version 3 | Version 4 | Shift | Explanation |
| :--- | :---: | :---: | :---: | :--- |
| **Gas B/F (01 Jan 2026)** | R9,082.81 | R9,600.31 | +R517.50 | Restatement of Gas ledger to exclude the opening cylinder credit of -R517.50. |
| **Cylinder B/F (01 Jan 2026)** | R0.00 | -R517.50 | -R517.50 | Inclusion of the dynamic database-derived opening cylinder credit of -1 cylinder of `9.1`. |
| **Gas Closing (31 May 2026)** | R19,993.04 | R20,510.54 | +R517.50 | Shifting of credit to the cylinder ledger increases the final gas debt of the customer. |
| **Cylinder Closing (31 May 2026)** | R3,450.00 | R2,932.50 | -R517.50 | Cylinder debt decreases because the customer starts the period with a credit of -1 cylinder (-R517.50). |
| **Combined Balance (31 May 2026)** | R23,443.04 | R23,443.04 | R0.00 | No change in overall customer debt. Perfect ERP alignment. |

## Assumptions Removed
- **Assumption Removed:** *"All historical cylinder balances were settled in full as of 1 January 2026."* (V3 assumption).
  - **Replacement logic:** The database is the source of truth; historical balances must be computed dynamically. The -1 cylinder deficit of `9.1` is a real, database-backed migration credit and must be reflected.
- **Assumption Removed:** *"Outstanding cylinders = Delivered - Returned."*
  - **Replacement logic:** Settled cylinders (commercialized) are subtracted from custody exposure. The 12 cylinders of `19.1` settled in March 2024 are excluded from returnable custody.

## Verification Trail
- **Calculations Verification:** Confirmed by running `simulate_v4.py` script. The final combined balance matches the ERP export current balance (`R23,443.04`) to the cent.
- **Credit Note Tax Check:** The double-taxation credit note sign correction has been successfully applied to all historical entries.
- **Changelog Author:** Debtor Reconstruction Specialist
- **Approved Doctrine Version:** v4 Canonical CYL Settlement Allocation Doctrine