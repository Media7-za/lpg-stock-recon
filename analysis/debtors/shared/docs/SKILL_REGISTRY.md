# Skill Registry (v1.1.0)

> **Status:** `RATIFIED`  
> **Canonical machine-readable registry:** `analysis/debtors/shared/SKILL_REGISTRY.json`  
> **Audit:** `analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json`  
> **Plan:** `analysis/debtors/shared/docs/REGISTERS_PLAN.md`  
> **Authority:** `analysis/debtors/shared/DEBTORS_DOCTRINE.md`  
> **Generated — do not edit.** Regenerate: `npm run debtors:skill-registry:write`

27 skill files across 4 roots. 20 carry frontmatter and are auto-loadable by an agent runtime; 7 do not and are reachable only by explicit path.

**Kinds:** `worker` · `generator` · `orchestrator` · `gate` · `human-role` · `role-prompt` · `reference` · `account-local`  
**Statuses:** `active` · `unregistered` · `superseded`

---

## Lane: debtors

_Accounts receivable recon._

| ID | Name | Kind | Status | Canonical for |
| :--- | :--- | :--- | :--- | :--- |
| `debtors.orchestrator` | `debtors-orchestrator` | orchestrator | active | Portfolio triage, worker dispatch per recon lane, payer class taxonomy (§4), human task queueing, evidence-doctrine write gating. |
| `debtors.pm` | `lsr-debtors-pm` | orchestrator | active | Debtor micro-project lifecycle — status updates, collection event logging, project.json curation. |
| `debtors.analysis` | `debtors-analysis` | worker | active | Deterministic transaction classification, allocation graphing, timing variance analysis. |
| `statement.v5` | `debtor-statement-v5-from-txt` | generator | active | Debtor Statement of Account v5 — Part 1A (LPG) / 1B (CYL) sub-ledger split with the 1A + 1B = ERP reconciliation bridge, Part 2 cylinder tracker, position summary. |
| `statement.v4` | `debtor-statement-v4-from-txt` | generator | active | Debtor Statement of Account v4 — combined Part 1 ledger (CYL Settlement Allocation layout), Part 2 tracker, position summary. |
| `customer.statement` | `debtor-customer-statement-from-txt` | generator | active | Customer-facing Statement of Account from DEBENQ TXT — ageing buckets, open invoice list, collections letter. No DATABASE_URL required. |
| `payment.to.invoice` | `payment-to-invoice-allocation` | worker | active | Allocation doctrine for invoice-linked payers whose payments carry ref_no to invoice doc_no (e.g. WO0001) — exact ref matching, split STAT batches, rounding residuals, LPG-only comparison. |
| `allocation.worker` | `allocation-worker` | worker | active | Cold-start session protocol for the invoice-linked allocation lane (WO0001 family) — Turn 2 pilot, building allocation_edges.csv. |
| `bu0005.allocation.worker` | `bu0005-allocation-worker` | worker | active | BU0005 (CHOBOZA - BULWER) allocation lane, Turns 3-5, including STAT-batch rounding journals. |
| `payment.pattern.analysis` | `lpg-payment-pattern-analysis` | generator | active | The YYYY_Payment_Pattern_Analysis.md annual variance report for consolidated monthly-batch payers — amount-proximity matching, Pattern 2/3 offsets, Rule 13 surplus tracking. |
| `monthly.batch.bridge` | `monthly-batch-erp-bridge-reconciliation` | generator | active | Point-in-time bridge between a commercial open-invoice schedule and the ERP running balance for monthly-batch (STAT) payers — exact-sum payment-to-month verification, standing-credit detection by constant-gap testing, CYL deposit-pair netting, calendar-month ageing, linked/duplicate ERP account detection. |
| `human.sources` | `human-sources-agent` | human-role | active | Human intake role — gathering remittance PDFs, ERP TXT exports, aged-debt reports, deposit screenshots into the correct raw/ folders. |
| `human.erp` | `human-erp-agent` | human-role | active | Human ERP/finance clerk role — posting journals, correcting payments, exporting fresh TXT, executing HUMAN_TASKS.md rows scoped to Role ERP Agent. |
| `human.collections` | `human-collections-agent` | human-role | active | Human collections / creditor-controller role — payment reminders and LOD, portfolio queue prioritisation, recon sign-off before collection, ACTION_PROMPTS.md execution. |
| `fam000.recon` | `fam000-reconciliation` | account-local | active | Family Gas consolidated recon across ERP codes FAM000 (parent) and FAM002 (child). Owns two mandatory ERP bug bypasses: header double-taxation on credit notes, and up to 18 credit notes omitted from the printed statement. |
| `jen001.recon` | `jen001-reconciliation` | account-local | active | Jennings Gas recon under the Stripped Gas Model — Part 1 LPG-only financial ledger with deposits stripped, Part 2 quantity-only cylinder ledger. Owns the JEN010 exclusion rule. |

## Lane: creditors

_Accounts payable / supplier recon._

| ID | Name | Kind | Status | Canonical for |
| :--- | :--- | :--- | :--- | :--- |
| `creditor.statement.v5` | `creditor-statement-v5-from-txt` | generator | active | Creditor Statement of Account v5 — Part 1A (LPG purchases) / 1B (CYL deposit shells) with bridge, Part 2 shell qty tracker, GRV/Deb Note routing. |

## Lane: cross-cutting

_Applies across lanes._

| ID | Name | Kind | Status | Canonical for |
| :--- | :--- | :--- | :--- | :--- |
| `tag.verification` | `erp-payment-tag-verification` | gate | active | Verifying ERP INVNO payment tags before an invoice is treated as settled. Owns the INVNO_TAG_CHRONOLOGY reject (invoice.tx_date > payment.tx_date) and TAG_EVIDENCE_PROVENANCE circularity reject. |
| `bug.fixer` | `lpg-recon-bug-fixer` | gate | active | Root-causing data-integrity bugs — ERP import duplication, payment-allocation mistargeting, header/line-item mismatch, ERP-vs-computed balance discrepancies. |

## Lane: platform

_The React/Vite app and its architecture._

| ID | Name | Kind | Status | Canonical for |
| :--- | :--- | :--- | :--- | :--- |
| `role.erp.price` | _(no frontmatter)_ | role-prompt | **unregistered** | Updating ERP/customer price records after a commercial price is approved. |
| `reference.tdr001` | _(no frontmatter)_ | reference | **unregistered** | Platform architecture decision — ERPNext and Medusa integration boundary. Status Accepted, 2026-05-24. |

## Lane: pipeline

_Feature delivery pipeline (Jira, PRD, QA)._

| ID | Name | Kind | Status | Canonical for |
| :--- | :--- | :--- | :--- | :--- |
| `pipeline.pm.full` | `lsr-pm` | orchestrator | active | The two-phase Feature Pipeline — feature kickoff, LSR ticket creation, pipeline status, stage artifact approval. |
| `pipeline.pm.short` | _(no frontmatter)_ | orchestrator | **superseded** | Nothing — superseded. Retained only so the supersession is discoverable. |
| `role.pm` | _(no frontmatter)_ | role-prompt | **unregistered** | Product Manager role — backlog, scope decisions, PRDs, Jira. Writes no code, merges no branches. |
| `role.qa` | _(no frontmatter)_ | role-prompt | **unregistered** | QA role — verifying implemented features against acceptance criteria pre-merge. Reports pass/fail; the PM decides the merge. |
| `role.coding` | _(no frontmatter)_ | role-prompt | **unregistered** | Coding role — implementing to spec on feature branches, never on main. Makes no scope decisions. |
| `role.ticket.architect` | _(no frontmatter)_ | role-prompt | **unregistered** | Translating requirements and bug reports into Jira tickets and Coding Agent prompts. |

---

## Negative scope

What each skill must **not** be used for. Carried from skill frontmatter — the wrong-lane mistake is the expensive one.

| ID | Not for |
| :--- | :--- |
| `debtors.orchestrator` | Executing a single account's recon — dispatch a worker instead. |
| `debtors.pm` | Reconciliation arithmetic. |
| `debtors.analysis` | Customer-facing output — it produces internal analysis only. |
| `statement.v5` | Combined-ledger v4 layout, or creditor statements. |
| `statement.v4` | Accounts routed to the v5 sub-ledger lane. |
| `customer.statement` | Internal v4/v5 sub-ledger recon. |
| `tag.verification` | Deciding allocations. It rejects unsafe linkages; it never creates one. |
| `payment.to.invoice` | Monthly batch payers — route to payment.pattern.analysis or monthly.batch.bridge instead. |
| `allocation.worker` | Monthly batch payers (JIM001) or settlement-discount accounts (TWK002). |
| `bu0005.allocation.worker` | Other accounts, and not settlement discount — BU0005's residuals are rounding journals. |
| `payment.pattern.analysis` | Invoice-linked payers, and not the point-in-time bridge — that is monthly.batch.bridge. |
| `monthly.batch.bridge` | Invoice-linked payers. Also not the annual pattern report — that is payment.pattern.analysis. |
| `creditor.statement.v5` | Debtor accounts. |
| `human.sources` | Interpreting the evidence it collects. |
| `human.erp` | Deciding what the correction should be — that comes from a worker checklist. |
| `human.collections` | Contacting a customer before recon sign-off. |
| `fam000.recon` | Any other account. Never query FAM000 or FAM002 in isolation, and never trust transaction_headers running balances for this account. |
| `jen001.recon` | Any other account. Never merge legacy JEN010 — it shifts the 9kg physical opening balance from -1 to +5. Settlement discount for this account lives in JEN001_Settlement_Discount_Doctrine_v1.md. |
| `bug.fixer` | Feature work. |
| `pipeline.pm.full` | Debtor recon — that is debtors.pm. |
| `pipeline.pm.short` | Loading. It is marked SUPERSEDED in-file and its name: key was removed. |
| `role.pm` | Pipeline stage orchestration — defers to pipeline.pm.full. |
| `role.qa` | Writing features or merging branches. |
| `role.coding` | Scope decisions. |
| `role.ticket.architect` | Production code or product decisions. |
| `role.erp.price` | Deciding prices. |
| `reference.tdr001` | Execution. It is a decision record, not a skill. |

---

## Paths and owned entry points

| ID | Path | Owns `npm run` | Produces slices |
| :--- | :--- | :--- | :--- |
| `debtors.orchestrator` | `.agents/skills/SKILL_Debtors_Orchestrator.md` | `debtors:parse-backlog` `debtors:sync` | `portfolio.register` `portfolio.dashboard` `portfolio.action_prompts` `turn.brief` `turn.manifest` |
| `debtors.pm` | `.agents/skills/SKILL_Debtors_Project_Manager.md` | `debtors:sync` | `portfolio.register` `event.ledger` |
| `debtors.analysis` | `.agents/skills/debtors-analysis_Skill.md` | — | `allocation.edges` `allocation.report` |
| `statement.v5` | `.agents/skills/SKILL_Debtor_Statement_v5_From_TXT.md` | `debtors:ingest-check` | `txt.parse` `v5.part1a.lpg` `v5.part1b.cyl` `v5.bridge` `v5.part2.custody` `v5.position.summary` `v5.ratification` `statement.v5.composed` `fixture.v5` |
| `statement.v4` | `.agents/skills/SKILL_Debtor_Statement_v4_From_TXT.md` | `debtors:sync` | `txt.parse` `v4.header` `v4.part1.financial` `v4.part2.custody` `v4.position.summary` `statement.v4.composed` `fixture.v4` |
| `customer.statement` | `.agents/skills/SKILL_Debtor_Customer_Statement_From_TXT.md` | `debtors:customer-statement` `debtors:sync` `debtors:tag-check` `debtors:tag-check:all` `debtors:test` | `tag.coverage` `customer.soa.open_invoices` `balance.bridge` `customer.soa` |
| `tag.verification` | `.agents/skills/SKILL_ERP_Payment_Tag_Verification.md` | `debtors:tag-check` | `tag.coverage` |
| `payment.to.invoice` | `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md` | `debtors:sync` `debtors:tag-check` | `allocation.edges` `allocation.report` |
| `allocation.worker` | `.agents/skills/SKILL_Allocation_Worker.md` | `debtors:ingest-check` `debtors:sync` | `allocation.edges` `allocation.report` |
| `bu0005.allocation.worker` | `.agents/skills/SKILL_BU0005_Allocation_Worker.md` | `debtors:sync` | `allocation.edges` `allocation.report` |
| `payment.pattern.analysis` | `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` | `debtors:sync` | `payment.pattern` |
| `monthly.batch.bridge` | `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md` | `debtors:tag-check` | `balance.bridge` `customer.soa.open_invoices` `customer.soa` |
| `creditor.statement.v5` | `.agents/skills/SKILL_Creditor_Statement_v5_From_TXT.md` | `creditors:ingest-check` `creditors:statement-v5` | `creditor.v5.statement` `creditor.ingest.coverage` |
| `human.sources` | `.agents/skills/SKILL_Human_Sources_Agent.md` | `debtors:ingest-check` `debtors:parse-backlog` `debtors:sync` `debtors:tag-check` | `erp.freshness` |
| `human.erp` | `.agents/skills/SKILL_Human_ERP_Agent.md` | `debtors:sync` | `erp.freshness` |
| `human.collections` | `.agents/skills/SKILL_Human_Collections_Agent.md` | `debtors:sync` | `portfolio.action_prompts` `d17.collections` |
| `fam000.recon` | `.agents/skills/SKILL_FAM000_Reconciliation.md` | — | `statement.v4.composed` |
| `jen001.recon` | `.agents/skills/SKILL_JEN001_Reconciliation.md` | — | `statement.v4.composed` |
| `bug.fixer` | `.claude/skills/lpg-recon-bug-fixer/SKILL.md` | — | — |
| `pipeline.pm.full` | `.agents/skills/New_Feature_PM_Skill.md` | — | — |
| `pipeline.pm.short` | `.agents/skills/lsr-pm_SKILL.md` | — | — |
| `role.pm` | `.agents/skills/SKILL_PM_Agent.md` | — | — |
| `role.qa` | `.agents/skills/SKILL_QA_Agent.md` | — | — |
| `role.coding` | `.agents/skills/SKILL_Coding_Agent.md` | `build` | — |
| `role.ticket.architect` | `.agents/skills/SKILL_Ticket_Architect.md` | `build` | — |
| `role.erp.price` | `docs/skills/erp_price_maintenance_agent.md` | — | — |
| `reference.tdr001` | `.agents/skills/TDR-001_Platform_Architecture_ERPNext.md` | — | — |

---

## Flagged records

Records that are not `active`. Each states why.

| ID | Status | Note |
| :--- | :--- | :--- |
| `pipeline.pm.short` | **superseded** | Superseded by pipeline.pm.full on 2026-09-29 (operator decision D2). Both files declared name 'lsr-pm', so which loaded depended on load order. The name: key is removed rather than the file deleted — amendments append, superseded text is marked. See DEBTORS_DOCTRINE.md D20. |
| `role.pm` | **unregistered** | No frontmatter — not auto-loadable. Staged as D3. |
| `role.qa` | **unregistered** | No frontmatter — not auto-loadable. Staged as D3. |
| `role.coding` | **unregistered** | No frontmatter — not auto-loadable. Staged as D3. |
| `role.ticket.architect` | **unregistered** | No frontmatter — not auto-loadable. Staged as D3. |
| `role.erp.price` | **unregistered** | Sole occupant of the docs/skills root. No frontmatter. Staged as D3. |
| `reference.tdr001` | **unregistered** | A TDR filed in a skills directory. Misfiled rather than defective. Staged as D3. |

---

## Gate results

| Gate | Failures | Warnings |
| :--- | ---: | ---: |
| `PATH_EXISTS` | 0 | 0 |
| `NO_ORPHAN_FILES` | 0 | 0 |
| `NAME_UNIQUE` | 0 | 0 |
| `FRONTMATTER_MATCH` | 0 | 0 |
| `SLICE_IDS_VALID` | 0 | 0 |
| `SCRIPT_TARGETS_VALID` | 0 | 0 |

_All gates clean._

---

## Slices with no owning skill

Declared in `SLICE_REGISTRY.json` but no registered skill claims to produce them. Not necessarily a defect — some slices are produced by scripts invoked directly.

`ingest.coverage` · `onboarding.status` · `settlement.discount` · `v4.part1.financial.month` · `v4.part2.custody.month`

