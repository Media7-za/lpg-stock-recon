# Changelog Policy

The **LPG Stock Recon App** maintains a single, global **`CHANGELOG.md`** file at the root of the repository.

### 1. Global App Changes (The `CHANGELOG.md`)

* Maintain your main changelog in the root directory.
* Group changes by version and date.
* Categorize updates: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, and **Security**.
* **Signal over Noise:** Focus on user-facing features (e.g., new reconciliation reports) and major architectural shifts.
* **Traceability:** Every entry should map to a ticket (e.g., `LSR-XX`).

### 2. Data Models
Do NOT maintain a manual changelog for data models.
* Use **Prisma Migrations** descriptively.
* Rely on `prisma/schema.prisma` as the current source of truth.

### 3. Features and Components
* Use disciplined Git commit messages.
* Link commits and PRs to Jira tickets.
* Summarize major feature changes in the global `CHANGELOG.md`.

### 4. Guidelines for AI Agents
* **Evaluation:** After completing a task, assess if it belongs in the global `CHANGELOG.md`.
* **Timing:** Update the `[Unreleased]` section immediately after implementation is verified.
* **Completeness:** No notable change should be deployed without a corresponding entry.
