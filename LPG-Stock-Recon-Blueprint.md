# 🛠️ LPG Stock Recon App: Project Blueprint & Epics

## 1. Executive Summary
The **LPG Stock Recon App** is a Progressive Web Application (PWA) designed to reconcile Expected ERP Inventory with Actual Physical Stock Counts for LPG cylinders. It seamlessly bridges the gap between what the system thinks is in the yard and what is actually there.

The workflow uses a **Dual-Snapshot approach**: taking a physical count + system snapshot in the Morning, and again in the Afternoon. By comparing the variance against the daily movement data (`CURRENT.TXT`), the app pinpoints missing paperwork (Invoices or GRVs/Credit Notes).

## 2. Architecture Stack
- **Frontend/Mobile**: React (Vite), Tailwind CSS, PWA configured for offline yard use.
- **Data Persistence**: Offline-first via Browser Storage API (Dexie) for field counts, with Prisma for backend synchronization and historical data storage.
- **Data Ingestion**: Robust CSV/TXT parsing via `papaparse` for ERP exports (`STKCOUNT.csv` and `CURRENT.TXT`).
- **UI Aesthetic**: Clean, high-contrast, thumb-friendly mobile interface for counters, and a sleek dark/light mode SaaS dashboard for managers.

---

## 3. The Core Reconciliation Logic

Instead of just checking raw stock, the system calculates discrepancies across time:
1. **SOH Variance**: `Physical Count - System SOH (STKCOUNT.csv)`
    - *Identifies immediate shrink or missing stock.*
2. **Movement Variance**: `Expected Afternoon Physical = Morning Physical + Net Movement (CURRENT.TXT)`
    - *Identifies missing documentation.*
    - If `Actual Afternoon < Expected Afternoon`, we are missing Invoices (stock left without billing).
    - If `Actual Afternoon > Expected Afternoon`, we are missing GRVs/Credits (stock entered without paperwork).
3. **Timeline Variance**
    *   Equation: `(Afternoon Physical Count - Morning Physical Count) - Net Movement per CURRENT.TXT`
    *   Interpretation: Identifies exactly *when* the entry was missed (e.g. system shows stock moved out today, but physical count hasn't changed since this morning).

### Special SKU Handling (Full vs Empty)
*   **"Fulls" (Gas Content):** Tracked physically mostly as **"Oryx" (`x.4`)** and **"Multibrand" (`x01`)**.
*   **"Empties" (Shells):** All shells are tracked as `.1` generic SKUs on the ERP.
    *   "Foreign" and "Top-Ups" are tracked exclusively as Empties, feeding into the `.1` generic pool.
*   **Automatic Shell Calculation:** For every 1x full cylinder physically counted (e.g. `9.4` Oryx Full), the engine will automatically count 1x corresponding empty shell (e.g., `9.1` Empty) towards the Empty reconciliation, because every content by definition sits inside a shell.

---

## 4. Project Epics & User Stories

### 📦 EPIC 1: System Data Ingestion & Mapping
*Goal: Securely parse and structure ERP data without requiring manual user mapping.*
- **Task 1.1**: Build upload zones for the `STKCOUNT.csv` (Morning/Afternoon snapshots) and `CURRENT.TXT` (Movement).
- **Task 1.2**: Implement `papaparse` utility to extract `ITEM NUMBER` and `TOTAL`.
- **Task 1.3**: Map specific brands (Oryx, Easigas) into their generic system equivalents (e.g., all 9kg empty brands -> `9.1`).
- **Task 1.4**: Parse `CURRENT.TXT` mapping Invoices (out) and GRVs/Credit Notes (in) to calculate net movement by SKU.

### 📱 EPIC 2: Mobile-First Count Workflow (PWA)
*Goal: Provide a high-contrast, thumb-friendly, offline-capable PWA for yard workers.*
- **Task 2.1**: Build the main UI layout: Top Segment Toggle [Fulls | Empties] and Size Tabs [9kg | 14kg | 19kg | SV | DV].
- **Task 2.2**: Implement the "Zone-Based" counting mechanism. Cylinders are grouped by Zone (e.g., Zone 1, Zone 2), allowing counters to scroll and tap `[ - 0 + ]` without navigating away.
- **Task 2.3**: Build UI components for "Running Totals" per zone and a persistent Sticky Footer tracking total items counted and progress.
- **Task 2.4**: Implement auto-save via Dexie.js so yard workers don't lose counts if the browser reloads.
- **Task 2.5**: Build the "Review & Submit" finalization screen that locks the count session with a precise timestamp.

### ⚖️ EPIC 3: The Reconciliation Engine & Dashboard
*Goal: Provide Depot Managers with an elegant desktop dashboard to run the math and view discrepancies.*
- **Task 3.1**: Build the Manager Dashboard featuring "Upload ERP" and "Select Saved Physical Count" actions.
- **Task 3.2**: Implement the reconciliation math algorithms (SOH Variance and Movement Variance).
- **Task 3.3**: Build the "Reconciliation Results" view, cleanly separating "Deposit (Shells)" and "Contents (Fulls)".
- **Task 3.4**: Calculate and display the financial impact (`Total Variance Value`) based on the cost/retail fields in the standard exports.
- **Task 3.5**: Tag rows with clear visual indicators (`MATCH`, `MINOR WARNING`, `CRITICAL ERROR`).

### 📊 EPIC 4: Reporting & Trends
*Goal: Allow managers to track shrinkage across days and count sessions.*
- **Task 4.1**: Build `TrendsDashboard.tsx` using Recharts to visualize variance lines over a 7-day or 30-day period.
- **Task 4.2**: Save finalized reconciliation reports to the Prisma database for historical auditing.
- **Task 4.3**: Create aggregated summary views on the Home Dashboard (Last AM vs PM trends).

---

## 5. Next Immediate Steps (Engineering Phase)
1. **Schema Definition**: Define the Prisma models and Dexie schemas for `CountSession`, `Zone`, `CountEntry`, and `ReconciliationReport`.
2. **PWA Setup Validation**: Ensure Vite PWA plugin is correctly configured for offline caching.
3. **Build Core Components**: Start by building the mobile `[ - 0 + ]` counter components and the Zone cards.
