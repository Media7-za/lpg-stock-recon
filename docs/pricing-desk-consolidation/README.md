# Pricing Desk session consolidation

Collection setup version: 1.0  
Created at: 2026-09-23T08:51:16Z  
Repository: Media7-za/lpg-stock-recon  
Working branch: main  
Status: collection ready; historical session review not started.

## Start here

1. In an original Pricing Desk conversation, run [the extraction prompt](prompts/session-harvest.md). It reads that conversation only.
2. Use [the saving prompt](prompts/save-handoff.md) in a session with GitHub write access, or relay the handoff to the consolidation session.
3. The saver reads this register, assigns the next unused ID, saves the handoff and updates this register in one commit.
4. In the consolidation session, run [the consolidation prompt](prompts/consolidate.md).
5. Revisions update the same handoff path and append revision history. Git retains earlier contents.

Shortcut to paste into an original session:

> Read and execute docs/pricing-desk-consolidation/prompts/session-harvest.md from Media7-za/lpg-stock-recon on main against this conversation. Return the handoff here. If GitHub reading is unavailable, tell me so; do not claim to have loaded the prompt.

Then, to save its output:

> Read and execute docs/pricing-desk-consolidation/prompts/save-handoff.md from Media7-za/lpg-stock-recon on main for the handoff above.

These are manual, user-triggered operations. They do not automatically read all GPT project conversations or synchronize chats.

## Publication boundary

This repository was verified public at setup. Branches and pull requests are public too.
The setup includes process documents only. Before uploading a handoff, check for private customer information, nonpublic prices/costs, account/payment details, personal contact details and private conversation links.
Do not interpret authorization to collect handoffs as authorization to disclose confidential contents publicly. If present, prepare a clearly marked redacted copy for review or use an explicitly authorized private destination. Record omissions; never imply a redacted copy is complete. Do not silently remove commercially material evidence from the authoritative source.

## Session register

No source-session handoffs have been collected yet. The full project session inventory and denominator are unknown.
Next candidate ID: PD-S001. Read the latest register before assigning; do not reserve IDs independently in multiple sessions.
Empty register means no collected evidence, not no prior work.

| Session ID | Session title | Source link/ID | Handoff | Version | Source date range | Extracted at | Coverage | Review status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Identity, evidence and revisions

- Canonical path: `session-handoffs/PD-SNNN_<stable-slug>.md`. IDs are collection identifiers, never invented ChatGPT conversation IDs.
- Preserve the original local handoff reference as an alias. Match source ID/link before assigning a new ID. For missing IDs, compare title, dates and content; do not merge uncertain matches.
- Retain stable item IDs, e.g. `PD-S001/D003`. Identify the handoff version and source Git commit in consolidation citations.
- Handoff version starts at 1.0; minor revisions add/correct evidence, major revisions restructure it. Unknown prior history is explicitly unverified.
- Timestamps use ISO 8601 with known offsets. Date-only remains date-only; unavailable is `unknown`. Recorded date, effective date, artifact date and extraction date are separate.
- Preserve superseded decisions and append revision history. Do not silently replace conflicting evidence.
- Git merge/commit time is publication time, not the original decision or effective date.
- Review statuses: `unreviewed`, `reviewed`, `needs-source`. Consolidation review is not approval of business terms.
- Topic relevance is not proof of GPT project membership. An inventory is complete only against an explicit source list with missing sessions accounted for.

## Outputs and authority

- [Session handoffs](session-handoffs/README.md): source-session evidence.
- [Findings](consolidation/findings.md): source-linked synthesis.
- [Conflicts and gaps](consolidation/conflicts-and-gaps.md): unresolved differences and missing evidence.
- [Workflow proposal](consolidation/workflow-proposal.md): proposed operating workflow.

Handoffs and synthesis do not amend governed doctrine, customer agreements, ERP prices or live database records. Proposals remain PROPOSED — NOT RATIFIED until explicit operator approval is recorded. Existing governance remains applicable.

## Safe Git updates

Read the target branch and files at a recorded commit before editing. Save a handoff and its register row atomically. Use a fast-forward update without force; if the branch advanced, reload and reconcile changes before retrying. Follow branch protection; if a pull request is required, report it as pending and name its branch. Never report a PR-only file as present on main.

Read the saved files back at the resulting commit and compare their contents before reporting success. Return the file link, branch, commit and handoff version. GitHub read/write access can differ between conversations.

## Setup revision history

| Version | Timestamp | Change |
| --- | --- | --- |
| 1.0 | 2026-09-23T08:51:16Z | Initial collection structure, extraction prompt 1.1, save and consolidation prompts. |
