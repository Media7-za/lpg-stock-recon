---
name: family-statement-refresh
description: >
  Re-run runbook for a payer-family consolidated customer statement (parent account plus
  child accounts, worked example TWK AGRI = TWK002 + TWK003 + TWK004). Use each time a
  member account gets a new ERP export, a missing DB document syncs, or a ruling changes a
  member's config: fetch, rebuild every member in order, read the generator's gates, and
  decide what may be released. Governed by DEBTORS_DOCTRINE D20 and D21.
---

# Family Statement Refresh

Governance: `analysis/debtors/shared/DEBTORS_DOCTRINE.md` **D20** (payer-family release rule) and **D21** (dated, verified exports). This skill is a runbook, not doctrine. Operator decisions are recorded as in `SKILL_Family_Rulings_And_Holds.md`.

Code: `analysis/debtors/shared/scripts/family_statement.mjs`, the `consolidatedFamily` branch of `generate_statement_of_account.mjs`. Config-driven, no account names in code. Worked example: `docs/previews/2026-10-10_TWK_consolidated_statement_preview.md`.

## 1. When to run

- A member account has a new ERP export (any of the family).
- A document missing from the DB has synced (ingest coverage gaps close).
- A ruling or lock changes a member's `statement_v5.json` or `payment_pattern_overrides.json`.
- Before any customer send.

Run the whole loop for **every** member each time. A re-export of one member makes its projection stale, and the generator refuses the family while any member is stale.

## 2. Family set-up (once)

| File | Content |
| :--- | :--- |
| Parent `config/statement_v5.json` | `payerGroup: { parent, children: [{ code, txtPath }] }`, plus any `remittanceDocAliases`, `namedResiduals`, `rowNotes` |
| Each child `config/statement_v5.json` | its own `txtPath`, `combinedBf`, `periodStart`, `skuRates`, `rowNotes`, optional `customerQuarantine` |
| Parent `config/statement_of_account.json` | `customerLayout: "open_items"`, `consolidatedFamily: true`, `primaryTxt`, `familyReleaseHolds: []` |

Children may keep their TXT in the parent's `raw/` (TWK003/TWK004 do).

## 3. The loop

1. **Fetch and verify the export (D21).** File name `<CODE>_<YYYY-MM-DD>.TXT`. Verify before filing: every running balance = previous + amount; last balance = header CURRENT BALANCE = TOTAL TRANSACTIONS; a UD gap equals the UD figure exactly. Failures go back to the ERP Agent, never filed. Update the member's `txtPath` (the child path in **both** the parent's `payerGroup` and the child's own config; the parent's in `statement_v5.json` **and** `statement_of_account.json` `primaryTxt`).
2. **Replay captures.** One directory per account per day: `analysis/debtors/<CODE>/data/db_replay/<YYYY-MM-DD>/`. Authority: the operator's in-session database authorisation, read-only, recorded as connector-sourced. Procedure and md5/length check: `analysis/debtors/shared/scripts/db_replay/README.md`. Do not edit SQL or re-serialise rows.
3. **Rebuild each member, in this order:**
   ```bash
   export DATABASE_URL=replay://supabase-connector
   export DB_REPLAY_DIR=analysis/debtors/<CODE>/data/db_replay/<YYYY-MM-DD>
   R="node --import ./analysis/debtors/shared/scripts/db_replay/register.mjs"
   $R analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs --debtor <CODE>
   $R analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor <CODE>
   node analysis/debtors/shared/scripts/match_projection.mjs --debtor <CODE>
   ```
4. **Generate (parent only):** `node analysis/debtors/shared/scripts/generate_statement_of_account.mjs --debtor <PARENT>`
5. **Test and record:** `npm run debtors:test`; commit the captures, projections, matches and reports; add an "Update <date>" section to the preview note; update the handoff.

## 4. Traps (learned 2026-10-10 to 2026-10-12)

| Trap | What to do |
| :--- | :--- |
| Large captures do not display inline; the connector saves the result to a file | Read the saved file with jq; take the single row's `rows_json`, unescape once, write it verbatim; never retype |
| `validate_txt_db_coverage.mjs` exits 1 when freshness is stale, even with 0 gaps (`STALE_COMPLETE`) | Read the coverage report, not the exit code. Exit 1 with 0 gaps is a result, not a failure |
| Documents dated today are often missing from the DB (not yet synced) and make the account review-only | Ask the ERP Agent to confirm the sync; re-capture; do not work around |
| `npx md-to-pdf` fails when running as root | Use `analysis/debtors/shared/scripts/md_to_pdf.mjs <in.md> <out.pdf>` |
| A pasted status may describe locks or files that are not on the remote | Check git and the remote before acting |
| Connector text carries markdown escapes (`\#`, `\_`, `\~`, `\*`) | Remove them when filing TXT; re-run the chain check |

## 5. The generator's gates (each aborts and writes nothing; `--force` does not override)

| Abort message contains | Gate | Meaning and action |
| :--- | :--- | :--- |
| `projection is stale: TXT fingerprint` / `matcher output was built from a different TXT` | **Fingerprint** | A member's TXT changed after its projection was built. Rebuild that member (loop step 3) |
| `projection was built for ERP R… , TXT header says R…` | Header | Projection built for an older export. Rebuild |
| `lock conflict(s) unresolved` | **Lock conflict** | A lock names a row that changed. Inspect `projection_matches.json` `lockConflicts`; void with `close_period.mjs --void-lock` only on operator instruction, then re-rule |
| `open items R… + named lines R… + quarantined R… ≠ ERP header` | Tie-out | A member does not tie. Find the missing or extra row; never plug the difference |
| `quarantine <id>: rows … net R…, config expects R…` | **Quarantine** | The quarantined rows no longer net to the ruled amount (for example the ERP correction posted). The ruling must be reviewed by the operator; do not edit `expectedAmount` yourself |
| family amount due ≠ sum of ERP headers (less quarantined) | Family total | A member is missing or double-counted |
| `--snapshot is not supported for a consolidated family statement` | Release | Intentional; release is the operator's act |
| `no PDF is produced for a DRAFT family statement` | Draft | Intentional; clear the reason first |

A **DRAFT** (not an abort) is produced when any member's matcher output is review-only or `familyReleaseHolds` lists an entry. The output is then `<PARENT>_Statement_of_Account_Consolidated_DRAFT_PREVIEW.md`, never the release name.

## 6. Release posture

- The live file `<PARENT>_Statement_of_Account.md` is written only when there is no draft reason. It overwrites the previous single-account live file by design.
- Never run `--snapshot` for a family. A PDF is made only for a non-draft statement, with `md_to_pdf.mjs`.
- Nothing is sent. Customer send is the operator's step, via `generate_statement_of_account.mjs` and `npm run debtors:tag-check`. Where `tag-check` returns `NOT_DERIVABLE_FROM_TXT` (the export excludes allocation detail), whether the v5 evidence path stands in for it is an operator ruling, not an agent call.
- The customer amount due can deliberately differ from the sum of the ERP headers by a quarantined amount; the internal view (`<PARENT>_Family_Internal_Reconciliation.md`) carries the reconciling line.

## 7. Re-open tripwires (a refresh is needed when)

A TXT re-export of any member (fingerprint gate); the ERP correction behind a quarantine posts (quarantine gate); a new document on any member; a lock conflict; a hold is added.

## 8. Worked example: TWK AGRI

TWK002 + TWK003 + TWK004, ERP 2026-10-10 exports. Family ERP sum R114,836.19; customer amount due R115,136.19 after the ruled R-300.00 quarantine. Sequence and numbers: `docs/previews/2026-10-10_TWK_consolidated_statement_preview.md` sections 7 to 16. Intake: `docs/requests/2026-10-10_erp_export_request.md`. Playbook: `docs/playbooks/family_account_reconciliation_workflow.md`.
