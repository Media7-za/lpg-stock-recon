# Debtors Human Task Queue

This is the central execution queue for human agents (ERP Agent, Collections Agent, Sources Agent). 

## Operational Queue

| Task ID | Debtor | Role | Description | Status | Blocked by |
| :--- | :--- | :--- | :--- | :--- | :--- |
| H-001 | TWK002 | Sources Agent | Ingest 2023/2024 remittances & TXT exports | DONE | |
| H-002 | TWK002 | Worker | Run settlement discount reconciliation | DONE | |
| H-003 | TWK002 | ERP Agent | Correct payment headers and post missing 2023 journals | OPEN | H-006 |
| H-004 | TWK002 | ERP Agent | Correct payment headers and post missing 2024 journals | OPEN | H-006 |
| H-005 | TWK002 | ERP Agent | Reverse partial Oct journal and post full R-983.04 journal | OPEN | H-006 |
| H-006 | TWK002 | Collections Agent | Controller sign-off on Path B settlement discount catch-up | OPEN | |
| H-007 | TWK002 | Sources Agent | Pull fresh TWK002 TXT export from ERP after posting | OPEN | H-003, H-004, H-005 |
| H-008 | WES004 | Collections Agent | Follow up on WES004 Letter of Demand (deadline 2026-06-29 passed) | OPEN | |
| H-009 | TAN001 | Collections Agent | Prepare and send draft LOD (deadline 2026-06-16 passed) | OPEN | |
