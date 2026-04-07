# LPG Stock Reconciliation Workflow Plan

The goal is to build an automated workflow (e.g., a Python script or a small web utility) that takes your physical count, your system stock (`STKCOUNT.csv`), and your movement data (`CURRENT.TXT`) to generate a reconciliation report that pinpoints missing invoices or credit notes.

## 1. Data Mapping Strategy

### Physical Count Input (Via PWA App)
Instead of a manual data grid, physical stock counts will be captured via a new **mobile-first PWA module** within the application.
- Yard workers use a tablet/phone to enter counts as they walk the yard.
- The UI handles the complexity: Users select specific brands (Oryx, Easigas) and dimensions, and the application automatically maps these inputs to the generic System SKUs (e.g., all 9kg empty brands map to `9.1`).
- The application stores these discrete counting sessions (e.g., "Morning Count", "Afternoon Count") in the local Dexie database or remote Prisma backend.
- During Reconciliation, the manager simply selects the appropriate saved Physical Count session from a dropdown, completely eliminating manual grid entry on the desktop dashboard.

### System Stock Input (`STKCOUNT.csv`)
The workflow requires **two snapshots** of the system stock:
- **Morning Snapshot**: Provides the baseline system SOH at the start of the day.
- **Afternoon Snapshot**: Provides the ending system SOH.

The tool will parse these files to extract `ITEM NUMBER` and `TOTAL` columns.

### Movement Data Input (`CURRENT.TXT`)
- Parse the `CURRENT.TXT` file filtering by LPG/Cylinder SKUs.
- Aggregate transactions (Invoices, GRVs, Credit Notes) by `STOCKNO` to calculate the net `System Movement` for the period between the two counts.

## 2. Reconciliation Logic

The workflow will perform two key reconciliations per SKU:

1. **System vs. Physical SOH Variance:**
   - At any snapshot point (Morning or Afternoon):
   - `Variance = Physical Count - System SOH`
   - *This highlights immediate stock loss or system mismatches.*

2. **Movement Variance (Finding Missing Docs):**
   - Calculates if the physical change matches the recorded system movement:
   - `Expected Afternoon Physical = Morning Physical Count + Net Movement (from CURRENT.TXT)`
   - `Missing Documents / Unexplained Variance = Actual Afternoon Physical - Expected Afternoon Physical`
   - *If positive, we are missing Credit Notes/GRVs (stock entered the yard without documentation). If negative, we are missing Invoices (stock left without billing).*

3. **Physical vs. Physical Variance (Timing/Entry Check):**
   - Compares the actual physical change against expected system movement.
   - `Physical Change = Afternoon Physical - Morning Physical`
   - If `Physical Change != Net Movement (CURRENT.TXT)`, it strongly indicates either a timing gap issue (transactions occurred between count and export) or missing entries in the ERP.
   - *This helps separate "genuine shrink" from "paperwork lag".*

### Multi-Day Windowing
As requested, the tool will allow specifying a "date window" (e.g., Date: `28/02/2026`, include `27/02/2026` credit notes/invoices in transit). We will provide a flag or parameter to look +/- 1 day for unmatched movements to help explain the variance.

## 3. Output / Report
The tool will generate a clear report (e.g., a `reconciliation_report.csv` or an HTML dashboard) showing:
1. **SKU & Description**
2. **System SOH**
3. **Physical SOH**
4. **Discrepancy (Physical - System)**
5. **Logged Movement (CURRENT.TXT)**
6. **Unexplained Variance (Missing Invoices/Credits)**

*(Update: Confirmed workflow requires Morning and Afternoon snapshots for complete reconciliation.)*

## 4. UI/UX Enhancements for Counting
To address cognitive load and context blindness during physical counting:
1. **Dynamic Row Labels:** Display the active size and category directly on the counting row (e.g., "Oryx 14kg Fulls" instead of just "Oryx").
2. **Sticky Category/Size Tabs:** Keep the category and size selectors visible when scrolling down a long list of zones/brands.
3. **Cylinder Silhouettes:** Add subtle SVG silhouettes next to brand names that visually represent the selected size (9kg vs 48kg DV) as a persistent visual anchor.
4. **Tap Micro-animations:** Add subtle visual feedback (e.g., a quick flash or scale effect) to the row when a count is incremented via quick-add or numpad, ensuring the user knows the input registered.
5. **Sequential Footer Navigation:** Replace the static "Review & Submit" footer button with a context-aware "Next: [Size]" button. It should cycle the user through 9kg -> 14kg -> 19kg -> SV -> DV. Only on the final size (DV) should the button change to "Review & Submit".

## 5. End-to-End User Flow (Counting to Reconciliation)
**Problem:** The current flow dumps the user on the dashboard after counting, and then forces a rigid Tier 1/2/3 calculation that mandates an AM Count, PM Count, and ERP snapshot all at once.
**Proposed Solution: Dual-Path Engine**
When the user clicks "Confirm & Submit" on a physical count, navigate them to the Reconciliation Setup wizard (`/results`). The engine will ask them what they want to reconcile.

**Option A: Physical vs System SOH**
- **Inputs:** Select 1 Physical Count (e.g., PM) + 1 ERP Snapshot (`STKCOUNT.csv`).
- **Goal:** Compare reality against the system at a specific point in time to uncover immediate shrinkage or missing stock.

**Option B: Physical vs Physical (Timeline Check)**
- **Inputs:** Select Start Physical Count (e.g., AM) + Select End Physical Count (e.g., PM) + Upload Movement Data (`CURRENT.TXT`).
- **Goal:** Compare the physical change across the day against the expected system movement to identify missing invoices or credit notes over that period.

**Integrated Uploads:**
Regardless of the chosen path, if the required `STKCOUNT.csv` or `CURRENT.TXT` files have not been uploaded for the day, display inline drag-and-drop zones directly within the wizard so the user does not have to leave the page.
