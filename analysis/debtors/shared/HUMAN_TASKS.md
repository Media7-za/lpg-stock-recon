# Debtors Human Task Queue

This is the central execution queue for human agents (ERP Agent, Collections Agent, Sources Agent). 

## Operational Queue

| Task ID | Debtor | Role | Description | Status | Blocked by |
| :--- | :--- | :--- | :--- | :--- | :--- |
| H-001 | TWK002 | Sources Agent | Ingest 2023/2024 remittances & TXT exports | DONE | |
| H-002 | TWK002 | Worker | Run settlement discount reconciliation | DONE | |
| H-003 | TWK002 | ERP Agent | Correct payment headers and post missing 2023 journals | DONE | |
| H-004 | TWK002 | ERP Agent | Correct payment headers and post missing 2024 journals | DONE | |
| H-005 | TWK002 | ERP Agent | Reverse partial Oct journal and post full R-983.04 journal | DONE | |
| H-006 | TWK002 | Collections Agent | Controller sign-off on Path B settlement discount catch-up | DONE | |
| H-007 | TWK002 | Sources Agent | Pull fresh TWK002 TXT export from ERP after posting | DONE | |
| H-013 | TWK002 | Sources Agent | Fresh full-history TWK002 TXT after Phase 2 posts; optional text PDF for STAT 123 | OPEN | |
| H-014 | TWK002 | Sources Agent | ~~Type footer 18.02.2026.pdf~~ DONE — resolve STAT 123 ERP vs cash R63,501.62 shortfall | OPEN | H-013 |
| H-008 | WES004 | Collections Agent | Follow up on WES004 Letter of Demand (deadline 2026-06-29 passed) | OPEN | |
| H-009 | TAN001 | Collections Agent | Prepare and send draft LOD (deadline 2026-06-16 passed) | OPEN | |
| H-010 | IVE001 | Sources Agent | Pull fresh IVE001 statement TXT + same-session DTRX + ITEMS (through Jul 2026 global balance date) | OPEN | |
| H-011 | CAP000 | Sources Agent | Export full CAP000 debtor account TXT to `analysis/debtors/CAP000/raw/` (e.g. `CAP000CURRENT.TXT`); gather remittance advices (30T / 2.5% batches if applicable) to `raw/Remittances/`; optional fresh global aged-debt TXT | OPEN | |
| H-012 | SA0001 | Sources Agent | Export full SA0001 debtor account TXT to `analysis/debtors/SA0001/raw/` (e.g. `SA0001CURRENT.TXT`); same-session DTRX to `raw/`; note export date and CURRENT BALANCE for orchestrator ERP gate | DONE | |
| H-015 | TWK002 | Sources Agent | Customer called 2026-08-11 requesting CN copies for empty-cylinder returns against inv **50898** (DN#22761) and inv **51841** (DN#22576). Both CNs already posted in ERP — pull/print **CN 00014982** (−R11,385.00, 28/05/2026) and **CN 00015262** (−R14,835.00, 15/07/2026) and email to customer. No new posting required. | OPEN | |
| H-016 | BR0001, IVE001, JEN001, MON001, MOZ002, RED001, SA0001, TAN001 | Sources Agent | **Re-export all eight debtor statement TXTs from ERP DEBENQ with ALLOCATION DETAIL INCLUDED.** Current exports carry `"EXCLUDE:","ALLOCATION DETAIL"`, so the `INVNO` column is blank on every row — no open-invoice list, statement of account, or payment allocation can be derived from them (balance + ageing remain valid). Verify each new file with `grep 'ALLOCATION DETAIL' <file>` returning nothing, then `npm run debtors:tag-check -- --debtor [CODE]`. See `shared/reports/PORTFOLIO_Invoice_Tag_Coverage_2026-08-11.md`. | OPEN | |
| H-017 | MD0003 | Worker | Open-invoice list over-states the account by **R59,456.42** (Σ open R78,309.78 vs ERP balance R18,853.36) — settled debt is being carried as open. Export has 94.2% tagging, so this is untagged settlement slices, not an export defect. Reconcile remittance-by-remittance to identify which invoices the R65,474.71 of untagged credits cleared, then ratify into `closedInvoiceOverrides`. Do not send MD0003 an open-invoice list until resolved. | OPEN | |
