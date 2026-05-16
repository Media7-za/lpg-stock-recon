# Changelog Policy

In app development, the industry standard is to maintain a single, global **`CHANGELOG.md`** file at the root of your repository, rather than scattering changelogs across individual features or data models.

Here is how you should handle change tracking across different levels of your application to ensure your documentation remains useful and maintainable.

### 1. Global App Changes (The `CHANGELOG.md`)

A global changelog is meant for human readability. It provides a chronological timeline of what has been added, changed, fixed, or removed in each release. This is essential for both your development team and stakeholders to understand the current state of the app.

* Maintain your main changelog in the root directory of your project.
* Group changes by version number and date (e.g., `## [1.6.0] - 2026-03-10`).
* Categorize the updates within each version using standard tags: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, and **Security**.
* **Signal over Noise:** Focus on user-facing features and major architectural shifts (e.g., rolling out the new Driver PWA offline mode).
* **Do NOT include:** Tooling installation, local environment setup, minor internal housekeeping, or low-signal refactors with no release significance.
* **Traceability:** Every changelog entry should map to a ticket (e.g., `CRM-XX`) or a documented architecture/governance decision.

### 2. Data Models (Use Migrations, Not Markdown)

You should absolutely avoid maintaining a text-based changelog for your data models. Manual documents inevitably fall out of sync with the actual database, creating dangerous single points of failure.

* Name your migrations descriptively when running `npx prisma migrate dev` (e.g., `add_vehicle_capacity_to_trips`).
* Rely on the `schema.prisma` file as the source of truth for the *current* state.
* Rely on the generated SQL migration files as the strict, historical timeline of *how* the data models have changed over time.

### 3. Features and Components (Use Git History)

Creating a separate changelog file for individual features (like the Dispatcher interface vs. the Customers list) creates too much administrative overhead.

* Use disciplined Git commit messages to track the evolution of specific features.
* Link commits and Pull Requests to your ticketing system (or user stories, like those in your Driver PWA Epic).
* If a feature drastically changes how the app works, summarize that change in the global `CHANGELOG.md` rather than documenting it in the feature's specific folder.

The only exception to this rule is if your Next.js application evolves into a massive monorepo where the Dispatcher web app and the Driver mobile PWA are entirely separate, independent packages. In that specific architecture, you might maintain one global changelog per app package, but still avoid per-feature logs.

### 4. Internal Guidelines for AI Agents

To maintain an accurate and up-to-date record, every AI agent working on this codebase must follow these steps:

* **Evaluation:** After completing a task (feature, bug fix, or major architectural change), assess if the change is "notable" for the global `CHANGELOG.md`. Generally, if it affects the user experience or the core developer workflow, it belongs here.
* **Timing:** Update the `[Unreleased]` section **immediately after** the implementation is verified and **before** notifying the user that the task is complete.
* **Completeness:** Ensure that no change is deployed to the Production Server without its corresponding entry in the `CHANGELOG.md` if it meets the criteria above.
