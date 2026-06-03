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
### Fixed
- Resolved HTML statement views frontend rendering, navigation, and accessibility issues from frontend audit:
  - Enabled raw HTML tag parsing (`html: True`) on Python's `markdown-it` to resolve dashboard grid/card escaping (E1–E4) and navigation anchor targets (N1–N2).
  - Updated cylinder ledger regex lookup to stop matching strictly on Part 1D or payment allocations, preventing early panel cuts (T1) and ensuring all 66 months of data render inside the cylinder tab.
  - Reordered DOM structure in HTML builder so `.side-control-panel-wrapper` precedes `.statement-container` for screen readers (L1).
  - Implemented desktop flex `flex-direction: row-reverse;` and responsive media overrides to stack side-nav correctly on mobile and keep sidebar on the right on wide viewports (L1).
  - Restricted total-row bolding CSS styles to a `.total-row` class dynamically scoped to non-metadata table rows (`table:not(.meta-table) tr`) in JavaScript, resolving metadata row bolding (L4).
  - Implemented roving tabindexes and keyboard navigation for tab button list using standard `tabindex="0"` / `-1` and arrow key roving focus without calling `.click()`, letting native Space/Enter clicks trigger activation (A1–A3).
  - Restored browser-native `:focus-visible` outline rings on interactive tab buttons.
  - Eliminated inline `onclick` script handlers from Print/Save button to align with strict CSP (J1).
  - Implemented client-side scroll-spy window event listener to dynamically update the active control panel link based on viewport scroll position (T2).
  - Added dynamic title tags to HTML outputs containing view context (Internal Audit View vs Customer View) and set `<html lang="en">` attribute (N3–N4).
  - Corrected `.brand-sub` indentation in CSS output.

### Changed
- Consolidated payment splits for Jim Gas (JIM001) across different ERP source files (`DRTX2025.TXT` and `DTRX2603.TXT`) and collapsed the hardcoded allocation split for payment Doc 00038481 in the Statement of Account and the generated Excel workbook.

### Added
- Implemented **Spreadsheet-First Insight Workspace** for Jim Gas (JIM001) under `analysis/debtors/JIM001/data/`:
  - Extracted 8 CSVs and 1 JSON file representing the normalized database layers (`invoices.csv`, `payments.csv`, `allocation_edges.csv`, `monthly_lpg_insights.csv`, `settlement_windows.csv`, `delivery_cycle_windows.csv`, `cylinder_transactions.csv`, `dashboard_metrics.json`, `human_review_schema.csv`).
  - Created pipeline script `export_workspace_to_sheets.py` to query Supabase or JSON files and compile these layers into a single styled Excel workbook `JIM001_Reconciliation_Workspace.xlsx` featuring frozen headers, auto-filters, zebra striping, currency/date cell formats, and support for optional Google Sheets sync modes.
  - Created pipeline script `import_human_review_from_sheets.py` to import manual annotations from the `Human_Review` sheet back into a version-controlled JSON format.
  - Created pipeline script `generate_statement_from_workspace.py` to construct statement markdown and compile customer and internal HTML reports (`JIM001_Statement_Account_v4_Customer.html` and `_Internal.html`) dynamically from the workspace tables.
- Generated a commercial account intelligence report for Impendle Wholesale (consolidating BU0003 and BU0009; excluding inactive BU0031) under `analysis/debtors/BU0009/reports/impendle_wholesale_intelligence.md`. Analyzed 9.6 years of purchase history, reconciled historical underpricing, assessed the May 2026 price hike's impact on volume drop-off, and provided retention-sensitive pricing scenarios balancing margin recovery with churn risk.
- Created styled Excel workbook for Jim Gas (JIM001) reconciliation containing chronological LPG ledger sheet (`LPG only Invoices`), consolidated database payments ledger sheet (`Payment unallocated (actual)`), and the exact invoice-to-payment monthly matches sheet (`Monthly Matches`).
- Implemented Phase 6 Monthly LPG Insights layer for the JIM001 statement and baseline reports:
  - Added a customer-safe `### LPG Monthly Insight Summary` block near the top of the statement showing reviewed months, status counts, oldest/largest unpaid months, most recent fully settled month, and Net LPG Gas Debt.
  - Added a `## Yearly LPG Invoice and Payment Summary` table presenting Year, Net LPG Invoiced, Payments Allocated, Gross Difference, Cumulative Gross Unpaid LPG Position, Unmatched/Overpayment Pool Applied, Net LPG Position, and reconciliation notes for each calendar year.
  - Added a detailed `## Monthly LPG Insight Register` (internal-only in the statement, fully present in the baseline) tracing LPG Invoiced, Credit Notes, Net Invoiced, Allocated Payments, allocated dates, difference, and month status.
  - Restricted the detailed monthly register to internal-only view via HTML comment blocks while presenting the yearly rollup to all views.
  - Flagged September 2025 to December 2025 in the notes as `[REVIEW_REQUIRED] Inferred from ERP ledger allocations` while preserving mathematical status.
  - Added side control panel link `Monthly LPG Insights` with scroll-spy highlighting and smooth scroll scroll-targeting.
- Implemented **Account position dashboard** and **sticky side control panel** layout for JIM001 statements:
  - Surfaces a customer-safe summary dashboard (Account Position, Payment Position, and Cylinder Position metrics) immediately after the header.
  - Adds an internal-only dashboard card (Internal Audit Snapshot) for internal analyst views.
  - Added a sticky, persistent side control panel on desktop that collapses into a top sticky horizontal navigation strip on mobile/tablet viewports.
  - Links side panel buttons to active ledger tabs (LPG Gas / Combined ERP / Cylinder) and section anchors (Dashboard, Payment Summary, Cylinder Custody, Internal Audit).
  - Toggles default active tab based on view context: Customer HTML defaults to the **LPG Gas Financial Ledger**, while Internal HTML defaults to the **Combined ERP Financial Ledger**.
  - Automatically hides the side control panel in print media layouts and exports, printing all tab panels sequentially.
- Refactored the **Part 1 Financial Ledger** structure in the statement markdown (`JIM001_Statement_Account_v4.md`) and HTML statements for Jim Gas (`JIM001`) to support five sub-ledgers/sections:
  - **Part 1A: Combined ERP Financial Ledger** (unstripped chronological transactions).
  - **Part 1B: LPG Gas Financial Ledger** (reconciling to LPG Gas Debt = `R146,857.72` with Payment `38481` split into `R14,287.13` LPG-applied and `R1,529.50` unallocated payment portions).
  - **Part 1C: Cylinder Financial Ledger** (CYL invoices/CNs, closing to `R-6.50` with no uncorroborated payments).
  - **Part 1D: Payment Allocation Split Summary** (high-level customer-safe split table).
  - **Part 1E: Payment-to-Invoice Allocation Detail** (detailed payment-to-invoice allocation edges, internal-only).
- Implemented **Interactive sub-ledger tabs** (Combined / LPG Gas / Cylinder) in the HTML statements with progressive enhancement, print styles, and keyboard accessibility.
- Added the **Payment-Batch Allocation Detail Register** to [JIM001_BASELINE_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JIM001/reports/JIM001_BASELINE_v4.md) below the prior-month intent matching register:
  - Details allocations from the payment-batch perspective (Payment Date → Payment Ref/Doc → Payment Amount → Intended LPG Month → LPG Month Net → Invoices Allocated/Partially Allocated → Amount Allocated → Residual Unpaid → Allocation Result → Evidence Source → Notes).
  - Groups split allocations across months (e.g. payments 38481, 40746) and labels them clearly as `SPLIT_PAYMENT_PORTION` instead of incorrect overpayments.
  - Explains complex splits (e.g., payment 38481 April/May split, payments 40063/40746 June/August split) with specific audit notes detailing Credit Note 12390 and Cylinder allocations.
  - Excludes unmatched payments (e.g. 13245, 38846, 39812) to keep the register focused strictly on allocated payment batches.
- Implemented **JIM001 v4 Phase 2 LPG Prior-Month Payment Intent Allocation**:
  - Shifts allocation from chronological FIFO to the LPG Prior-Month Payment Intent Matching doctrine starting from 1 March 2022.
  - Added LPG-only `LPG Prior-Month Payment Intent Matching Register` to [JIM001_BASELINE_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JIM001/reports/JIM001_BASELINE_v4.md) grouping payments and invoices into intent-based monthly matches, identifying 13 fully settled months, 10 partially settled / underpaid months, 16 overpaid months, and 12 completely unpaid months.
  - Added `LPG Unpaid / Partially Paid Invoice Register` tracking open LPG invoices, including the pre-March 2022 opening balance B/F of `R28,709.91` as a single summary row, totaling `R241,155.91` of unpaid invoices.
  - Added `Unmatched / Weakly Matched Payment Register` tracking unmatched payments and month-level overpayments, totaling `R94,298.19`.
  - Reconciles perfectly to the locked LPG Gas Debt of `R146,857.72` (`R241,155.91` unpaid invoices minus `R94,298.19` unmatched/overpayments).
  - Refined the credit note matching logic to check explicit `ref_no` references first before falling back to chronological monthly matching. This matches Credit Note `14198` directly to Invoice `48578` (dated 31 Dec 2025) instead of chronologically offsetting earlier December 2025 invoices (like `48098`), aligning precisely with commercial intent.
  - Added internal-only payment allocation position block to `Debtor Position Workspace` in [JIM001_Statement_Account_v4.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/JIM001/reports/JIM001_Statement_Account_v4.md).
  - Added a doctrine note:
    > Batch-paying debtors require LPG-only prior-month payment-intent matching where customer payment behaviour indicates month-based settlement. This allocation view is separate from FIFO/LIFO ledger consumption and separate from full ERP debtor reconstruction. Where the human worksheet conflicts with ERP ref_no matching, prefer ERP and disclose the worksheet discrepancy. Explicit ERP document references override chronological allocation and amount-proximity matching.
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
