# CHANGELOG Guidelines

In app development, the industry standard is to maintain a single, global **`CHANGELOG.md`** file at the root of your repository, rather than scattering changelogs across individual features or data models.

### 1. Global App Changes (The `CHANGELOG.md`)

A global changelog is meant for human readability. It provides a chronological timeline of what has been added, changed, fixed, or removed in each release. This is essential for both your development team and stakeholders to understand the current state of the app.

* Maintain your main changelog in the root directory of your project.
* Group changes by version number and date (e.g., `## [1.2.0] - 2026-03-03`).
* Categorize the updates within each version using standard tags: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, and **Security**.
* Focus on user-facing features and major architectural shifts (e.g., rolling out the new Driver PWA offline mode).

### 2. Data Models (Use Migrations, Not Markdown)

You should absolutely avoid maintaining a text-based changelog for your data models. Manual documents inevitably fall out of sync with the actual database, creating dangerous single points of failure.

Since your system relies on Prisma and SQLite, your `prisma/migrations/` folder acts as the definitive, executable changelog for your schema.

* Name your migrations descriptively when running `npx prisma migrate dev` (e.g., `add_vehicle_capacity_to_trips`).
* Rely on the `schema.prisma` file as the source of truth for the *current* state.
* Rely on the generated SQL migration files as the strict, historical timeline of *how* the data models have changed over time.

### 3. Features and Components (Use Git History)

Creating a separate changelog file for individual features (like the Dispatcher interface vs. the Customers list) creates too much administrative overhead.

* Use disciplined Git commit messages to track the evolution of specific features.
* Link commits and Pull Requests to your ticketing system (or user stories, like those in your Driver PWA Epic).
* If a feature drastically changes how the app works, summarize that change in the global `CHANGELOG.md` rather than documenting it in the feature's specific folder.

---

# Changelog

All notable changes to the LPG Delivery Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Implemented **JIM001 v4 Phase 2 LPG-only payment allocation**:
  - Added LPG-only `Calendar-Month Batch Payment Allocation Register` to [JIM001_BASELINE_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JIM001/reports/JIM001_BASELINE_v4.md) identifying 68 fully settled months, 1 partially settled month (July 2025: R5,400.84 allocated, R13,379.29 unpaid), and 10 completely unpaid months (August 2025 – May 2026).
  - Added `Unallocated Invoice Register (Remaining Unpaid LPG Invoices)` tracking the 38 open LPG invoices totaling `R146,857.72` remaining unpaid.
  - Added `Unallocated Payment Register` showing all payments were fully matched chronologically (`R0.00` unallocated payments).
  - Added internal-only payment allocation position block to `Debtor Position Workspace` in [JIM001_Statement_Account_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JIM001/reports/JIM001_Statement_Account_v4.md).
  - Added a doctrine note:
    > Batch-paying debtors require calendar-month payment allocation analysis in addition to invoice/payment ledger reconstruction.
- Rebuilt `JIM001` statement baseline (v4) under Cylinder Allocation and Debtor Position Workspace doctrines as a complete lifetime reconstruction (3 December 2018 to 31 May 2026) starting from a clean R0.00 opening balance, using corrected split payment consolidation and CN double-taxation corrections (reconstructed balance R146,851.22, corrected ERP Stated Balance R146,907.13, residual unexplained ERP variance of R55.91).
- Disclosed the original `R284,760.09` database deduplication defect as an ERP exception in `JIM001_BASELINE_v4.md` and `JIM001_Statement_Account_v4.md`.
- Surfaced Cylinder Custody Exposure of `R26,220.00` and Cylinder Variance of `-R26,226.50` separately in the Debtor Position Workspace.
- Created `JIM001_BASELINE_v4.md` and `JIM001_Statement_Account_v4.md` reports.
- Generated dual-view browser statement reports for `JIM001` v4 (`JIM001_Statement_Account_v4.html`, `JIM001_Statement_Account_v4_Internal.html`, and `JIM001_Statement_Account_v4_Customer.html`) using the shared `export_to_html.py` converter.
- Rebuilt `TAN001` statement baseline (v4) under Cylinder Allocation and Debtor Position Workspace doctrines as a reconciled reconstruction with disclosed ERP exceptions (preserving ERP variance of `R2,640.57`).
- Created `TAN001_BASELINE_v4.md` and `TAN001_Statement_Account_v4.md` reports.
- Generated dual-view browser statement reports for `TAN001` v4 (`TAN001_Statement_Account_v4.html`, `TAN001_Statement_Account_v4_Internal.html`, and `TAN001_Statement_Account_v4_Customer.html`) using the shared `export_to_html.py` converter.
- Rebuilt `FAM000` consolidated statement baseline (v4) under Cylinder Allocation and Debtor Position Workspace doctrines.
- Created `FAM000_BASELINE_v4.md` and `FAM000_Statement_Account_v4.md` reports.
- Corrected the cylinder custody exposure and variance metrics in the Debtor Position Workspace (surfacing Cylinder Variance of `+R7,532.50` separately from the ERP reconciled balance).
- Generated dual-view browser statement reports for `FAM000` v4 (`FAM000_Statement_Account_v4.html`, `FAM000_Statement_Account_v4_Internal.html`, and `FAM000_Statement_Account_v4_Customer.html`) using the shared `export_to_html.py` converter.
- Rebuilt `JEN001` statement baseline (v4) under CYL Settlement Allocation Doctrine.
- Created `JEN001_BASELINE_v4.md`, `JEN001_Statement_Account_v4.md`, and `JEN001_v3_to_v4_CHANGELOG.md` reports.
- Corrected opening custody and financial balances for `9.1` and `19.1` cylinders based on historical payments/settlements.
- Implemented the 3-section **Debtor Position Workspace** (Financial, Custody, and Reconciliation Positions) in [JEN001_Statement_Account_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JEN001/reports/JEN001_Statement_Account_v4.md).
- Created shared markdown-to-HTML statement generator utility [export_to_html.py](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/scripts/export_to_html.py).
- Generated dual-view browser statement reports for `JEN001` v4 (`JEN001_Statement_Account_v4.html`, `JEN001_Statement_Account_v4_Internal.html`, and `JEN001_Statement_Account_v4_Customer.html`) using explicit comment-based stripping (`<!-- INTERNAL_ONLY_START -->` / `<!-- INTERNAL_ONLY_END -->` and `<!-- DEBTOR_POSITION_WORKSPACE_START -->` / `<!-- DEBTOR_POSITION_WORKSPACE_END -->`).
- Created shared doctrine documents [DEBTOR_POSITION_WORKSPACE.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/DEBTOR_POSITION_WORKSPACE.md) and [ALLOCATION_DOCTRINE.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md) to define standard debtor positions, models, and payment allocation evidence rules.



### Added (Invoice Dispatch Module - LSR-3)
- **Dispatch Dashboard**: New interface for Invoice Clerks to track and manage outbound invoices by date.
- **POD Integration**: Added capability to upload hand-signed Proof of Delivery (POD) notes (JPG/PNG/PDF).
- **Automated PDF Merging**: Implemented browser-side logic to merge system-generated invoices with uploaded PODs.
- **WhatsApp Dispatch**: Integrated Whapi.Cloud via Supabase Edge Functions for secure document delivery.
- **Audit Logging**: Added persistent tracking of dispatch attempts in `invoice_dispatch_logs` with actor attribution.
- **Customer Management**: Added `CustomerImport` utility to seed and update WhatsApp contact data.

### Added (Stock Recon Cloud Engine)
- **Upload History Tracking**: Implemented persistent database logging (`sync_logs`) to track data ingestion events in real-time.
- **Data Hub Integration**: Added a "Recent Uploads" widget to surface recent ingestion events directly in the UI.

### Changed (Stock Recon Cloud Engine)
- **Account Dropdown UI**: Implemented strict ascending sort on `unique_accounts` to fix randomized account ordering.
- **Database Architecture**: Altered `reconciliation_summary` View to safely sum payment allocation splits so they match the legacy ERP expectation of exactly 1 summary row per document.
- **Database Architecture**: Altered `unique_accounts` View to group by `account_no`, masking thousands of duplicate accounts caused by legacy corrupted CSV references.

### Fixed (Stock Recon Cloud Engine)
- **Ingestion Engine**: Fixed a critical parser bug in `erpImportEngine.ts` where the `account_name` was mapping to legacy CSV Column 10 (Reference strings) instead of Column 3 (Actual Names).

---

*Legacy Project (Dispatcher App) changes slated for the next minor release:*

### Added
- **Dispatcher PWA:** New mobile-responsive layout for the Trips overview, replacing the desktop table with a touch-friendly card layout.
- **Customer Management:** Added a WhatsApp number input field to the New Customer creation flow.
- **Trip Planning:** Added a sticky capacity header to track "Total Load vs. Max Vehicle Capacity" in real-time during route assembly.
- **Trip Planning:** Introduced a dedicated "Reorder" toggle to activate drag-and-drop handles for sequence sorting on mobile devices.

### Changed
- **UI Architecture:** Transitioned the main navigation from a left sidebar to a persistent Bottom Navigation Bar for mobile viewports.
- **Customer Form:** Refactored the New Customer form to stack all input fields vertically at 100% width to prevent text truncation on smaller screens.
- **Database (Prisma):** Updated `schema.prisma` and generated migrations to support the new WhatsApp contact field and vehicle weight capacity limits. 

### Fixed
- **Routing:** Removed inline text links next to dropdowns (e.g., "Manage Routes") to prevent accidental misclicks on touch screens.

## [1.0.0] - 2026-02-19
### Added
- Initial release of the Dispatcher Web App.
- Core Next.js and Tailwind CSS frontend architecture.
- SQLite and Prisma backend configuration for Master Data (Customers, Products, Vehicles, Drivers).
- Desktop interface for creating, viewing, and managing daily LPG delivery routes.
