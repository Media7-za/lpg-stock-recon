# Script Registry (v1.0.0)

> **Status:** `RATIFIED`  
> **Canonical machine-readable registry:** `analysis/debtors/shared/SCRIPT_REGISTRY.json`  
> **Audit:** `analysis/debtors/shared/docs/SCRIPT_REGISTRY_AUDIT.json`  
> **Plan:** `analysis/debtors/shared/docs/REGISTERS_PLAN.md`  
> **Authority:** `analysis/debtors/shared/DEBTORS_DOCTRINE.md`  
> **Generated — do not edit.** Regenerate: `npm run debtors:script-registry:write`

105 governed scripts. 44 are proven load-bearing (registered entry point, test suite, or imported by one). 58 are `unclassified`: durability is unproven, which is not the same as dead. Each needs a read to classify, and that backlog is the point of counting it.

**Durability** is never inferred from a filename. **Scope** and **lane** are read from the path and so are always known.

---

## Hollow entry points

Documented `npm run` commands whose script is **absent from the repo**. These fail only when someone tries to run them, so they survive indefinitely in docs that claim them as done.

| Target | Missing script | Status | Reopens when |
| :--- | :--- | :--- | :--- |
| `debtors:parse-backlog` | `analysis/debtors/shared/scripts/parse_global_aged_debt.mjs` | ABSENT — no such file, and git log shows it has never existed on any branch. The npm target, two skills, the PRD, the roadmap and CHANGELOG all describe it as delivered. | parse_global_aged_debt.mjs is written, or debtors:parse-backlog is removed from package.json. Either event must also update the PRD, roadmap, both skills, and the dashboard prompt. |

---

## Durability

| Durability | Count | Meaning |
| :--- | ---: | :--- |
| `permanent` | 44 | Load-bearing. Deleting it breaks a registered entry point, a test, or a caller. |
| `one-shot` | 0 | Ran once for a specific investigation and is not expected to run again. |
| `deprecated` | 2 | Superseded but retained; a replacement is named. |
| `superseded` | 1 | Replaced. Kept only for provenance. |
| `unclassified` | 58 | Durability unproven. NOT a claim that the script is dead — it means nobody has read it and recorded a verdict. |

| Evidence | Count | Meaning |
| :--- | ---: | :--- |
| `npm-entrypoint` | 21 | A package.json script names this file. |
| `test-suite` | 10 | Matches the *.test.mjs convention run by debtors:test. |
| `imported-by-permanent` | 12 | Static import from a script reachable from an entry point. |
| `invoked-by-permanent` | 1 | Subprocess call from a script reachable from an entry point. |
| `docblock-deprecated` | 2 | The file carries an @deprecated tag naming its replacement. |
| `backup-directory` | 1 | Lives under scripts/backups/. |
| `operator-declared` | 0 | Classified by the operator against reasoning recorded in notes. |
| `none` | 58 | No evidence either way. Pairs only with unclassified. |

---

## Registered entry points

| `npm run` | Script | Lane | Owns slices |
| :--- | :--- | :--- | :--- |
| `creditors:export-txt` | `analysis/creditors/shared/scripts/export_creditor_txt_from_db.mjs` | creditors | — |
| `creditors:lpg-volume` | `analysis/creditors/shared/scripts/oryx_lpg_volume_monthly_report.mjs` | creditors | — |
| `creditors:statement-v5` | `analysis/creditors/shared/scripts/reconcile_creditor_v5_from_txt.mjs` | creditors | `creditor.v5.statement` |
| `creditors:supplier-recon` | `analysis/creditors/shared/scripts/supplier_ledger_recon.mjs` | creditors | — |
| `creditors:ingest-check` | `analysis/creditors/shared/scripts/validate_txt_db_coverage.mjs` | creditors | `creditor.ingest.coverage` |
| `debtors:knowledge-compile` | `analysis/debtors/shared/scripts/allocation_knowledge_compile.mjs` | debtors | — |
| `debtors:reconciliation-status` | `analysis/debtors/shared/scripts/build_reconciliation_status.mjs` | debtors | — |
| `debtors:tag-check` `debtors:tag-check:all` | `analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs` | debtors | `tag.coverage` |
| `debtors:test` | `analysis/debtors/shared/scripts/check_invoice_tag_coverage.test.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/debenq_open_invoices.test.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/debtors_sync.d17.test.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/debtors_sync.d19.test.mjs` | debtors | — |
| `debtors:sync` | `analysis/debtors/shared/scripts/debtors_sync.mjs` | debtors | `d17.collections` |
| `debtors:customer-statement` `debtors:twk002-statement-snapshot` | `analysis/debtors/shared/scripts/generate_statement_of_account.mjs` | debtors | `customer.soa` |
| `debtors:test` | `analysis/debtors/shared/scripts/ingest_coverage_classifier.test.mjs` | debtors | — |
| `debtors:artifact-index` `debtors:artifact-index:write` | `analysis/debtors/shared/scripts/portfolio_artifact_index.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/portfolio_artifact_index.test.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/projection_collectable_derivation.test.mjs` | debtors | — |
| `debtors:pull-db` | `analysis/debtors/shared/scripts/pull_debtor_transactions_from_db.mjs` | debtors | — |
| `debtors:statement-v4` | `analysis/debtors/shared/scripts/reconcile_debtor_v4_from_txt.mjs` | debtors | `statement.v4.composed` `fixture.v4` |
| `debtors:statement-v5` | `analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs` | debtors | `statement.v5.composed` `fixture.v5` |
| `debtors:script-registry` `debtors:script-registry:write` | `analysis/debtors/shared/scripts/render_script_registry.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/render_script_registry.test.mjs` | debtors | — |
| `debtors:skill-registry` `debtors:skill-registry:write` | `analysis/debtors/shared/scripts/render_skill_registry.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/render_skill_registry.test.mjs` | debtors | — |
| `debtors:scaffold` | `analysis/debtors/shared/scripts/scaffold.mjs` | debtors | — |
| `debtors:test` | `analysis/debtors/shared/scripts/scaffold.test.mjs` | debtors | — |
| `debtors:ingest-check` | `analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs` | debtors | `ingest.coverage` |
| `debtors:twk002-phantom-cn-report` | `analysis/debtors/TWK002/scripts/build_phantom_cn_report.mjs` | debtors | — |
| `debtors:twk002-bf-bridge` | `analysis/debtors/TWK002/scripts/build_pre_mar2025_bf_bridge.mjs` | debtors | — |
| `debtors:twk002-allocation-ingest` | `analysis/debtors/TWK002/scripts/remittance_allocation_ingest.mjs` | debtors | — |

---

## Shared modules (imported, not run)

Proven load-bearing by import reachability. Deleting one of these breaks a registered entry point.

| Script | Lane |
| :--- | :--- |
| `analysis/creditors/shared/scripts/ingest_coverage_classifier.mjs` | creditors |
| `analysis/creditors/shared/scripts/require_database_url.mjs` | creditors |
| `analysis/debtors/shared/scripts/debenq_open_invoices.mjs` | debtors |
| `analysis/debtors/shared/scripts/ingest_coverage_classifier.mjs` | debtors |
| `analysis/debtors/shared/scripts/require_database_url.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/buildCases.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/buildRelationships.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/buildSearchIndex.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/computeDashboard.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/csvUtils.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/docUtils.mjs` | debtors |
| `analysis/debtors/shared/scripts/stages/normalize.mjs` | debtors |

---

## Deprecated and superseded

Retained, not deleted — amendments append. Each names what replaced it.

| Script | Durability | Why |
| :--- | :--- | :--- |
| `analysis/debtors/JEN001/scripts/reconcile_jen_v4_from_txt.mjs` | **deprecated** | @deprecated in-file in favour of the shared v4 generator with --debtor JEN001. |
| `analysis/debtors/shared/scripts/backups/payment_pattern_analysis.pre_override_registry_20260616.py` | **superseded** | Pre-override-registry snapshot of payment_pattern_analysis.py, retained for provenance. Superseded by the live script. |
| `analysis/debtors/shared/scripts/payment_doc_allocation_2025.mjs` | **deprecated** | Thin wrapper that shells out to payment_doc_allocation.mjs with a fixed 2025 window. @deprecated in-file. |

---

## Unclassified — triage backlog

No registered entry point, not a test, not imported by anything that runs. That makes them **unproven, not proven dead** — several are account forensics kept deliberately. Classifying one means reading it and recording `one-shot`, `permanent`, or `superseded` with evidence.

| Scope | Count | Scripts |
| :--- | ---: | :--- |
| `universal` | 13 | `check-may-grv-items-details.mjs` `check-may-grv.mjs` `dn_pair_reconcile.mjs` `export_to_html.py` `export_to_pdf.py` `export_workspace_to_sheets.py` `generate_statement_from_workspace.py` `import_human_review_from_sheets.py` `payment_doc_allocation.mjs` `payment_pattern_analysis.py` `pdp31_dedup_transaction_items.sql` `render_slice_registry_html.mjs` `lpg_ac_reclassify.sql` |
| `account:FAM000` | 10 | `reconcile_csv_ground_truth.py` `reconcile_csv_ground_truth_mar_may.py` `reconcile_csv_ground_truth_monthly.py` `reconcile_csv_ground_truth_monthly_split.py` `reconcile_csv_ground_truth_monthly_stripped.py` `reconcile_csv_ground_truth_scenario_zero_cyl.py` `reconcile_db_only_monthly_stripped.py` `reconcile_fam.py` `reconcile_fam_v3.py` `reconcile_fam_v4_extended.py` |
| `account:JEN001` | 8 | `allocation_ingest_pilot.mjs` `export_to_excel.py` `export_to_excel_v2.py` `reconcile_jen_db_only_monthly_stripped.py` `reconcile_jen_db_only_monthly_stripped_v2.py` `reconcile_jen_db_only_monthly_stripped_v3.py` `reconcile_jen_v4_extended.mjs` `reconcile_jen_v5_from_txt.mjs` |
| `account:TWK002` | 8 | `build_balance_bridge.mjs` `build_knowledge_prep.mjs` `build_recreated_ledger_2024.py` `build_remittance_2024.mjs` `decompose_balance_gap.mjs` `discount_payment_pattern_analysis.py` `investigate_balance_bridge_lines.mjs` `parse_remittance_pdfs.mjs` |
| `account:MOZ002` | 6 | `allocation_ingest.mjs` `build_exception_audit.mjs` `build_operator_view.mjs` `build_statement_account.mjs` `turn_7h_decomposition.mjs` `turn_7i_line_partition.mjs` |
| `account:JIM001` | 4 | `analyse_alloc_pairs.py` `analyse_blank_refs.py` `analyse_payment_patterns.py` `build_lpg_reconciliation_v41.py` |
| `account:RED001` | 3 | `allocation_ingest_pilot.mjs` `allocation_ingest_stripped_pilot.mjs` `build_event_ledger.mjs` |
| `account:WO0001` | 3 | `cn_dn_gate_rebuild.mjs` `other_lane_pass.mjs` `turn10_residual_analysis.mjs` |
| `account:MON001` | 2 | `allocation_ingest_pilot.mjs` `allocation_ingest_stripped_pilot.mjs` |
| `account:MD0003` | 1 | `allocation_ingest.mjs` |

---

## Gate results

| Gate | Failures | Warnings |
| :--- | ---: | ---: |
| `PATH_EXISTS` | 0 | 0 |
| `NO_ORPHAN_FILES` | 0 | 0 |
| `ENTRYPOINT_RESOLVES` | 0 | 1 |
| `DOCBLOCK_MATCH` | 0 | 0 |
| `SLICE_IDS_VALID` | 0 | 0 |
| `REACHABLE_IS_PERMANENT` | 0 | 0 |
| `EVIDENCE_REQUIRED` | 0 | 1 |

- **WARN** `ENTRYPOINT_RESOLVES` — debtors:parse-backlog -> analysis/debtors/shared/scripts/parse_global_aged_debt.mjs is absent; acknowledged: ABSENT — no such file, and git log shows it has never existed on any branch. The npm target, two skills, the PRD, the roadmap and CHANGELOG all describe it as delivered.
- **WARN** `EVIDENCE_REQUIRED` — 58 of 105 scripts are unclassified — durability unproven, not assumed dead

