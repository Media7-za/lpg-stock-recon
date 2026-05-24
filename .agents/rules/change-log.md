---
trigger: always_on
---

To maintain an accurate and up-to-date record, every AI agent working on this codebase must follow these steps:

* **Evaluation:** After completing a task (feature, bug fix, or major architectural change), assess if the change is "notable" for the global `CHANGELOG.md`. Generally, if it affects the user experience or the core developer workflow, it belongs here.
* **Timing:** Update the `[Unreleased]` section **immediately after** the implementation is verified and **before** notifying the user that the task is complete.
* **Completeness:** Ensure that no change is deployed to the Production Server without its corresponding entry in the `CHANGELOG.md` if it meets the criteria above.
