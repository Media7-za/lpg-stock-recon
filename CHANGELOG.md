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
