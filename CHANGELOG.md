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
- Added **Rule 13 (Gross Flow Overpayment & Surplus Allocation Rule)** to the global business rules (`analysis/debtors/shared/docs/business_rules.md`) to govern how payment surpluses are documented and carried forward.
- Added **Payment Pattern Analysis & Cumulative Balance Audit** CLI automation script (`payment_pattern_analysis.py`), which queries transaction data directly from Supabase (or falls back to local CSVs) with configurable discrepancy tolerance (`--tolerance`, default R5.00).
- Generated full 2018–2026 annual payment pattern analysis reports for debtor **JIM001** (`analysis/debtors/JIM001/reports/JIM001_YYYY_Payment_Pattern_Analysis.md`).

### Changed
- Reconciled August 2022 for debtor **JIM001** using the gross flow methodology, registering the full payment of R15,885.27 against the month, resulting in a variance of -R547.77 (representing the unallocated surplus paid) and correcting the payment pattern analysis table and totals.
- Consolidated Section 4 of JIM001's 2022 report into a unified STAT Sequence & Payment Flow table, and added a detailed mathematical reconciliation between the payment settlement pool (R179,774.00) and calendar-year ERP headers (R160,782.02).
- Added Section 5 (Unallocated Payment Pool) to JIM001's 2022 report listing genuine, non-pattern payment surpluses (STAT196 and STAT204) for 2022.
- Added Section 2.1 (Candidate Invoice Details) to JIM001's 2022 report, mapping underpaid month shortfalls to specific candidate invoice numbers, dates, and itemized gas-fill line totals (Invoices 13332, 13359, and 14788) with investigation notes below the table clarifying that only 1 of 2 candidates is unpaid for May.
- Overhauled the **LPG Payment Pattern Analysis** agent skill (`skills/lpg-payment-pattern-analysis/SKILL.md`) to focus strictly on generating the standardized `Payment_Pattern_Analysis.md` report, adding guidelines for Rule 13, Section 4 consolidation, mathematical reconciliation, and Section 5 unallocated pool.
- Added **Section 4.1 (Ledger-Wide Historical Balance Reconciliation)** and **Section 4.2 (Reconciling Calendar Year Activity vs. Invoice Settlement Pool)** to JIM001's 2022 report, presenting cumulative ledger components (View A/B) and timing-boundary cash comparisons (View C) dynamically.
- Automated the calculation and formatting of **Section 4 (STAT Sequence Table)**, **Section 4.1 (Ledger-Wide historical roll-forward proof)**, and **Section 4.2 (View C vs. Settlement Pool comparison)** directly within the report generation script (`payment_pattern_analysis.py`).
- Extended **Family Gas** (`FAM000` and `FAM002` consolidated) statement and baseline reports up to **09 June 2026** (incorporating all May and June transactions recently loaded into Supabase).
- Applied payment deduplication for `FAM000` / `FAM002` consolidated, dropping the duplicate payment `00044102` (R30,000.00) on 29 April 2026.
- Updated the consolidated Excel workbook `FAM000_Final_Recon_Export.xlsx` and generated dual-view browser statement reports (Internal vs Customer views).
- Updated the `FAM000.v4.json` data fixture with the extended June 9th reconciliation metrics, custody quantities, and financial balances.

### Added
- Added local git-based tracking for debtor accounts as micro-projects:
  - Created a structured `project.json` schema in each debtor directory under `analysis/debtors/` to track client metadata, recon status, outstanding/aged balances, and active collection action details.
  - Formalized **Slice 005: Debtors Portfolio Management**, introducing an architectural Operating System.
    - Added `PROJECT_SCHEMA.md` to govern schema requirements.
    - Added `DEBTOR_STATE_MACHINE.md` to map valid reconciliation and collection lifecycle transitions.
    - Added an AI training manual (`SKILL_Debtors_Project_Manager.md`) to guide future agent interactions.
    - Added an `events/` folder scaffold and `EVENT_SCHEMA.md` as reserved architecture for future event-sourcing.
  - Formalized **Slice 005A: Collections Intelligence** & **Slice 005B: Portfolio Metrics**, upgrading the system into a decision-support Priority Queue.
    - Added `COLLECTIONS_INTELLIGENCE.md` to define the heuristic risk-scoring weight matrix.
    - Expanded the `project.json` schema to support `nextAction` and `nextActionDate` fields.
    - Overhauled `debtors_dashboard.mjs` to calculate a dynamic `riskScore` and `daysSinceLastContact` entirely in-memory to prevent stale state.
    - Upgraded the CLI output and `DEBTORS_DASHBOARD.md` to sort accounts by Risk Score (Priority Queue) rather than alphabetically.
  - Formalized **Slice 005C: Human Action Prompting**, establishing the dashboard as a Collections Command Centre.
    - Integrated a dynamic Action Prompting Engine into `debtors_dashboard.mjs` that evaluates `totalOutstanding`, `agedDebt180Plus`, and `status`.
    - Automatically outputs generated "Human Prompt Cards" (including firm payment reminders and strict legal notices) to a dedicated `ACTION_PROMPTS.md` execution queue.
    - Updated `SKILL_Debtors_Project_Manager.md` to enforce human-in-the-loop workflows: Agents prompt the human using the generated messages, and only mutate the `project.json` history log *after* the human manually sends the communication.
    - Added comprehensive portfolio-wide Summary Metrics to the dashboard output.
  - Implemented `analysis/debtors/shared/scripts/debtors_sync.mjs`, a robust CLI validator that enforces schema and state machine rules, separating validation logic from rendering.
  - Retained `debtors_dashboard.mjs` exclusively for rendering terminal output and auto-generating the `DEBTORS_DASHBOARD.md` overview.
  - Added the `npm run debtors:sync` command to `package.json`.
- Onboarded new debtor account **WES004** (West Coast Fish & Chips — also trading as WES002) as a full account reconstruction:
  - Ingested and parsed `WES002.TXT` (Jul 2025 – Apr 2026, 84 transactions) and `WES004.TXT` (Dec 2025 – Jun 2026, 92 transactions) ERP statement exports.
  - Identified split-account structure: customer trades across two ERP codes (WES002 historical, WES004 active); payments flow across both codes from Jan 2026 onwards.
  - Confirmed **zero ERP variance** — combined TXT reconstruction closes at R36,216.20 matching ERP stated combined balance (WES002: R7,443.73 + WES004: R28,772.47).
  - Flagged 3 June 2026 transactions (net R3,241.30) not yet ingested into Supabase, and WES002's 84-transaction history as a Supabase gap.
  - Documented February 2026 DN-21909 triple-invoice/CRN correction pattern and Jan 2026 `00043011` ERP allocation adjustment pair.
  - Created [WES004_BASELINE_v1.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/WES004/reports/WES004_BASELINE_v1.md) covering full payment register, monthly ledger summary, cylinder empties pattern, and reconciliation sign-off.
  - Created [WES004_Statement_Account_v1.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/WES004/reports/WES004_Statement_Account_v1.md) with full chronological Part 1A (WES002) and Part 1B (WES004) ledger tables, Debtor Position Workspace, and payment behaviour assessment.
  - Generated dual-view HTML statements (`WES004_Statement_Account_v1_Internal.html` and `_Customer.html`) using the shared `export_to_html.py` converter.
  - Created investigation scripts `investigate-wes004.mjs` and `reconstruct-wes004.mjs` in `scratch/`.

### Fixed
- Updated `export_workspace_to_sheets.py` matches loading logic to merge exact matches from `JIM001_LPG_Reconciliation_v4.xlsx` (sheet `Monthly Matches`) with the published CSV allocations, and refined heuristic fallback matching with a 180-day post-invoice-only date constraint (`payment_date >= invoice_month_start` and `payment_date <= invoice_month_end + 180 days`) to prevent past months from stealing future payments.
- Fixed a date parsing format bug in `export_workspace_to_sheets.py` that caused published allocation matches to be dropped, resulting in incorrect empty allocations for several months (e.g. April to November 2024).
- **Fixed a year-collision bug in `export_workspace_to_sheets.py`** where `m_key` generation was reading from the `Invoice Year` column in the `Monthly Matches` Excel sheet, which is hardcoded to `2025` for all rows in `JIM001_LPG_Reconciliation_v4.xlsx`. This caused all historical monthly matches (2021–2025) to collide into a single set of 12 keys (e.g. `2025-03`, `2025-04`...), with later rows silently overwriting earlier ones of the same month. The fix now derives the year from `Payment Date` (the ground-truth column) and falls back to `Invoice Year` only when no valid payment date is present. This raised the loaded Excel match count from ~12 collapsed entries to the correct **26 distinct keys**, and the final merged total (Excel + CSV) to **52 unique `YYYY-MM` month keys**.
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
- Updated `JIM001` (Jim Gas) debtor statement, baseline reports, Excel worksheets, and HTML statements to extend the period scope to **30 June 2026**, incorporating May 28 Invoice `50920` for `R5,056.22` and June 4 Payment `00044555` for `R11,666.12`.
- Updated `TAN001` (Tanya Lehman) statement and baseline reports to extend the period scope to 30 June 2026, incorporating new June transactions (Payment `00044460`, Invoices `00050973`/`00050974`, and Credit Note `00015006`).
- Fixed a SQL deduplication logic bug in the `erpStatedBalance` query in `scratch/generate-tan001-reports.js` by including `amount_excl` and `tax_amount` in the `DISTINCT ON` clause, preventing duplicate document collapses from inflating the ERP variance.
- Consolidated payment splits for Jim Gas (JIM001) across different ERP source files (`DRTX2025.TXT` and `DTRX2603.TXT`) and collapsed the hardcoded allocation split for payment Doc 00038481 in the Statement of Account and the generated Excel workbook.

### Added
- Created four operational Lane Memory Documents under `analysis/debtors/shared/docs/` to document the end-to-end data flow:
  - [LANE_1_INPUT_INGESTION.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/LANE_1_INPUT_INGESTION.md) detailing the ingestion pipeline for raw CSV data sources.
  - [LANE_2_DATABASE_SCHEMA.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/LANE_2_DATABASE_SCHEMA.md) documenting the Supabase relational database schema and table constraints.
  - [LANE_3_RECONCILIATION_ENGINE.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/LANE_3_RECONCILIATION_ENGINE.md) detailing the matching, intent, and allocation algorithms.
  - [LANE_4_PRESENTATION_EXPORTS.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/LANE_4_PRESENTATION_EXPORTS.md) documenting the statement, baseline, and interactive HTML export layouts.
- Documented and integrated the multi-month settlement window detection for the Apr–Nov 2024 period (`JIM001-BATCH-2024-APR-NOV`), identifying six payments totaling `R118,638.47` mapping to LPG invoices totaling `R121,032.82`, and implemented **residual subset matching** (supporting single/combination unpaid invoice search within ±1 invoice month) to dynamically isolate Invoice `36945` (amounting to `R2,394.34`) as the single unpaid target with a `R0.01` variance (HIGH confidence).
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
