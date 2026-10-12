# Playbook: reconciling a payer family (TWK AGRI, 2026-10-08 to 2026-10-12)

Status: PROCEDURE NOTE from the main session. Not doctrine. Every proposed change in section 4 is **PROPOSED, NOT RATIFIED** (AGENTS.md section 7): the operator decides. Nothing here edits DEBTORS_DOCTRINE.md, the skills or AGENTS.md.

## 1. Result (what "win" means, and what it does not)

- TWK002 + TWK003 + TWK004 reconcile as one family: R54,136.19 - R300.00 + R61,000.00 = **R114,836.19**, variance R0.00 on every account and on the family (PROVEN, `docs/previews/2026-10-10_TWK_consolidated_statement_preview.md`).
- A consolidated customer statement exists as a **DRAFT PREVIEW**. It is **not released**: five operator holds remain (`familyReleaseHolds` in `TWK002/config/statement_of_account.json`): CN 15775 lane, TWK003 R-300.00 credit treatment, TWK004 tie 53535/CN 15781 approval, release gate (`debtors:tag-check` returns NOT_DERIVABLE_FROM_TXT for the family), confirm the cleared DB-sync hold.
- 168 tests pass; no lock, tie approval, snapshot or release was made by an agent.

## 2. The workflow, in order (repeat for the next payer family)

| # | Step | Who | Gate / artifact |
| -: | :-- | :-- | :-- |
| 1 | **Rule the shape**: parent + children, one receipt posted across them (here STAT 123 payment 43500). Record as operator ruling and in `payerGroup` of the parent's `statement_v5.json`. | Operator | ADM-94 Q1/Q15 |
| 2 | **Request dated exports** for every member: `<CODE>_<YYYY-MM-DD>.TXT`, same DEBENQ report, header block, running balance. Undated files are never "current". Post as a Linear task for the human ERP agent with the repo path and the Drive folder. | Main session to ERP human | `docs/requests/...`; ADM-96 |
| 3 | **Verify on intake**: header balance = every running balance step = TOTAL TRANSACTIONS (UD figure allowed to explain a header gap, exactly). File under `raw/`. | Main session / subagents | chain check; commit raw files only |
| 4 | **DB coverage**: read-only connector replay, ingest-coverage report per member. Documents missing from the DB make a member review-only. | Subagent (connector-sourced) | `data/db_replay/<date>/`, `*_INGEST_COVERAGE_*` |
| 5 | **Per-member projection + matcher** (no locks). One shared engine; differences only via config. | Subagent | `v5_projection.json`, `projection_matches.json` |
| 6 | **Evidence reports, not rulings**: explain every residual (price-differential credit, lane, double-credit test by SKU decomposition). Tag PROVEN/ASSERTED/ASSUMED with paths. | Subagent / analyst session | `docs/previews/*` |
| 7 | **Generator**: family builder aggregates per-account open items with an Account column; aborts unless each member ties to its ERP header, fingerprints match, no lock conflicts, and the family total equals the sum of ERP balances. Any review-only member or open hold => DRAFT marker, never the release file name, no snapshot/PDF. | Build session on its own branch | tests + preview note |
| 8 | **Decide, then lock**: the operator rules each hold; each ruling becomes a lock or config with a tripwire. | Operator, then main session | `approve_tie.mjs` / `settle_through.mjs` |
| 9 | **Release**: only via `generate_statement_of_account.mjs` + `npm run debtors:tag-check`; clear the holds in config. | Main session | release copy |
| 10 | **Close**: handoff section, project.json history, Linear comments (status, never Done unless every question is answered). | Main session | `docs/handoffs/<date>.md` |

## 3. What we learned

1. **Evidence order matters.** Dated, chain-verified exports first, DB coverage second, matching third. Most "open rows" were stale data or late-synced documents, not real differences: after the 11 Oct sync TWK004's pair 53535/CN 15781 confirmed itself under the matcher's own rule, and CN 15775 became a CYL document.
2. **A family is one receipt across several ledgers.** A child projection alone cannot tie its slice of a family payment; the family needs the parent's `payerGroup` evidence and a family-level tie gate.
3. **Not every residual is a defect.** TWK003's R-300.00 is a customer credit (invoice 47866 20 units at R100 vs CN 13933 20 units at R115). The STAT 123 cash decomposes into whole cylinders, so the CN 15775 double-credit worry was testable and came back negative (ASSERTED, quantities PROVEN).
4. **Review-only must propagate.** One review-only member makes the whole family statement a draft; operator holds in config keep it a draft even when everything is green. That prevented a premature release.
5. **Parallel agents work when scoped.** Build one subagent per independent account or file group, forbid locks/commits/shared-script edits, verify centrally, commit centrally. Keep shared-code edits (the generator) off the critical path of agents that run those scripts, and put code work on its own branch.
6. **Verify claims against the repo.** A pasted report described locks and files that did not exist (a divergent cloud-agent branch). Check `git`/the remote before acting on any relayed status.
7. **Connector hygiene.** Linear's file host and drive.google.com downloads are blocked here; use the Drive connector. Connector text carries markdown escapes (`\#`, `\_`, `\~`, `\*`) that must be removed, and big files should be decoded mechanically (jq) from the saved tool output rather than retyped.
8. **Open things we did not resolve:** credit notes in DB headers sit at 1.1304 times the TXT values on TWK (unexplained); DON001's old file disagreed with its own chain by R140.00; `debtors:tag-check` cannot yet judge a family; TWK003/TWK004 have no `project.json`.

## 4. Proposed updates (all PROPOSED, NOT RATIFIED; operator decides)

| Document | Proposed change |
| :-- | :-- |
| `analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md` | Add "family statements" as a staged proposal: a family releases only when every member is current, ties, and has no open hold; the aggregate must equal the sum of ERP balances. (Today this lives only in code and the preview note.) |
| `DEBTORS_DOCTRINE.md` (constitutional, operator only) | Generalise the TWK002 v2 section 7 amendment into a payer-group principle; add the intake rule "an export without a date in its file name is never current". |
| `ALLOCATION_DOCTRINE.md` | Add how a price-differential credit is carried (customer credit, treatment per operator), and the SKU-decomposition double-credit test as the standard check for deposit credit notes. |
| `.agents/skills/SKILL_Debtor_Statement_v5_From_TXT.md` | Add a "payer family / consolidated" section: `payerGroup`, `consolidatedFamily`, `familyReleaseHolds`, the DRAFT rule. |
| `.agents/skills/SKILL_Debtors_Orchestrator.md` | Add the subagent fan-out rules from lesson 5 and "verify relayed claims against the remote". |
| `.agents/skills/SKILL_Human_ERP_Agent.md` + new `SKILL_ERP_Export_Intake.md` | One intake procedure: request template, file naming, chain-check gate, UD handling, Drive-to-repo path, comment template. |
| `db_replay/README.md` | Add the jq/sed decode path for large saved connector outputs. |
| `docs/roles/session_closer.md` | Add: record held decisions (`familyReleaseHolds`) in the handoff's resume section. |
| Code | Make `debtors:tag-check` family-aware; keep `/tmp` helper `chain.mjs` as a committed script (`analysis/debtors/shared/scripts/check_erp_export.mjs`) so intake verification is repeatable. |
