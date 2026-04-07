# EPIC: PWA Physical Stock Count

## Overview
Currently, physical stock counts are performed manually on paper clipboards and later transcribed or manually mapped to system SKUs for reconciliation. This process is prone to human error, delays reconciliation, and requires complex mapping logic.

**Goal**: Build an intuitive, mobile-friendly (PWA) Stock Count feature within the existing LPG application. This allows yard workers or managers to input physical counts directly into the system using a tablet or smartphone, automatically mapping inputs to the correct SKUs in the backend.

## Business Value
- **Eliminate Double-Entry**: Data is entered once at the source.
- **Reduce Mapping Complexity**: The UI abstracts away the SKU mapping. The user selects "Oryx 9kg Empty" and the system knows it's SKU `9.1`.
- **Faster Reconciliation**: Counts are immediately available for the core reconciliation engine to compare against ERP data.
- **Data Validation**: Prevent illegible handwriting or math errors that happen on paper.

## User Roles
*   **Yard Counter**: The physical worker in the yard doing the counting on a mobile device.
*   **Depot Manager**: The person reviewing the counts and running the reconciliation.

---

## User Stories

### 1. Mobile-Optimized Counting Interface
**As a** Yard Counter,
**I want** to use a mobile-friendly, touch-optimized interface to enter stock counts,
**So that** I don't need to carry paper or struggle with small inputs while walking the yard.

**Acceptance Criteria:**
- The UI is responsive and designed for "thumb use" (large tap targets).
- Support for offline data entry (if PWA service workers are enabled) or robust local state to prevent data loss if the connection drops in the yard.
- The interface categorizes stock logically (e.g., Full Cylinders by Size, Empty Cylinders by Brand & Size), mirroring the physical yard layout rather than a flat list of SKUs.

### 2. Grouped Entry by Location or Zone (The "Columns 1-6" replacement)
**As a** Yard Counter,
**I want** to enter counts by specific yard locations or zones (e.g., Zone 1, Truck A),
**So that** I can keep track of where I have already counted and easily sum up totals across the depot.

**Acceptance Criteria:**
- The UI allows creating or selecting "Count Locations".
- The system automatically aggregates counts from all locations into a single physical total per SKU for reconciliation.

### 3. Rapid Quantity Adjustment
**As a** Yard Counter,
**I want** to quickly increment or decrement counts using `+` and `-` buttons alongside a manual number pad input,
**So that** I can count quickly without constantly bringing up the device keyboard.

**Acceptance Criteria:**
- Each item has prominent `+` and `-` buttons.
- Tapping the number directly opens a number-pad for bulk entry.

### 4. Direct SKU Mapping (Under the Hood)
**As a** Depot Manager,
**I want** the physical count data to automatically map to the system SKUs (e.g., Oryx 9kg Empty maps to `9.1`),
**So that** I don't have to translate brands into generic system SKUs during the reconciliation process.

**Acceptance Criteria:**
- The frontend UI displays friendly names ("9kg Oryx Empty").
- The database/backend saves the data against the mapped System Item Number (`9.1`, `1401`, etc.).

### 5. Review and Submit Flow
**As a** Yard Counter,
**I want** to see a summary of all my counts before submitting,
**So that** I can verify accuracy and ensure no categories were missed.

**Acceptance Criteria:**
- A final "Review" screen showing aggregated totals per item.
- A clear "Submit Count" action that locks the session and tags it with a timestamp (e.g., "Morning Count" or "Afternoon Count").

### 6. Integration with Reconciliation Dashboard
**As a** Depot Manager,
**I want** to pull the submitted physical counts directly into the reconciliation wizard,
**So that** I only need to upload the ERP snapshots and movement files, completely eliminating manual text entry during reconciliation.

**Acceptance Criteria:**
- The Reconciliation UI has an option to "Select Physical Count" from a list of completed PWA sessions (e.g., "Select Morning Count" / "Select Afternoon Count").
