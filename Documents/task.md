# LPG Stock Reconciliation Implementation Tasks

## Phase 1: Planning & Setup
- [x] Analyze user requirements (Physical vs System mapping).
- [x] Review existing React PWA codebase.
- [x] Finalize implementation plan and expected inputs.

## Phase 2: UI/UX Design & Mockups
- [x] Design multi-step wizard UI flow for reconciliation inputs.
- [x] Design expected output dashboard (Discrepancy overview).
- [x] Generate mockups using StitchMCP to validate with user.

## Phase 3: Core Logic Implementation
- [x] Create data models / types for Reconciliation context (Physical Counts, System Counts, Movement Data).
- [x] Phase 4: UI Enhancements
  - [x] Dynamic Row Labels
  - [x] Sticky Tabs
  - [x] Sequential Footer

- [x] Phase 5: End-to-End Reconciliation Flow
  - [x] Auto-navigate from Count Session to Results
  - [x] Pass `countId` via URL query parameters
  - [x] Auto-select most recent STKCOUNT and CURRENT files
  - [x] Provide Inline Upload Zones
  - [x] Split UI into Dual-Path Reconciliations
- [x] Implement parsing logic for `CURRENT.TXT` (Movement Data).
- [x] Implement parsing logic for `STKCOUNT.csv` (System Stock Snapshots).
- [x] Build mapping utility: Map physical brand inputs (Oryx, Easigas) into System SKUs to calculate total physical stock.
- [x] Build the core reconciliation math:
  - System Variance (Physical vs System) = `Physical Stock - System Stock`
  - Movement Variance = `(Afternoon Physical - Morning Physical) - Movement from ERP`
  - Physical Change Variance = `(Afternoon Physical - Morning Physical) - Movement from ERP`


### Phase 4: UI Implementation
- [x] Create multi-step reconciliation UI (`ReconciliationResults.tsx`)
  - [x] Input: Select Physical Count Session (AM - optional, PM - required)
  - [x] Input: Select ERP Snapshot (`STKCOUNT.csv`)
  - [x] Input: Upload/Select Movement Data (`CURRENT.TXT`)
  - [x] Output: Render 3-Tier Variance Results Table
- [x] Update Dashboard view to remove obsolete variance indicators and link to the new Engine Runner.
- [x] Refine Physical Count UI (`CounterControl.tsx`)
  - [x] Replace +/- steppers with a direct numeric input field for high-volume entry
  - [x] Add "quick-add" buttons (+10, +50) or a custom numpad wrapper for speed (optional)
  - [ ] Build "Review & Submit" summary UI based on Stitch Variant 2 before final submission

## Phase 4: Verification
- [ ] Test the pipeline end-to-end using the provided sample files in `@ERP RAW DATA`.
- [ ] Ensure formatting and design match the premium aesthetic required.
