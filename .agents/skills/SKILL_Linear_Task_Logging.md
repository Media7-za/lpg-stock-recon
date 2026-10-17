---
name: linear-task-logging
description: >
  How agents on the debtor reconciliation pipeline create, link and log Linear
  work: which project an issue goes in, what links it must carry, and how to
  keep one Agent Work Log entry per chat or session. Use whenever you are about
  to create or update a Linear issue or comment for debtor/creditor recon work,
  raise an ERP or data request for Sharmin, or finish a session.
---

# Linear task logging (debtor reconciliation)

Created 2026-10-17 at the operator's request. Rules for tickets only; they do not change doctrine.

## 1. Two places, two jobs

| Where | Holds | Who creates it |
| :--- | :--- | :--- |
| Project **Debtor reconciliation** (`P-ADM-15`, team Admin) | Real work items: ERP/data requests to Sharmin, operator ruling requests, account onboarding tasks | PM session, or an analyst session when the PM asks |
| Project **Agent Work Log** (`P-ADM-11`, team Admin) | One entry per agent chat or session | Each agent logs itself (PM may log analyst sessions it started) |

The two are linked in the text: the work-log entry names the issue(s) it served, and the issue links the session.

## 2. Creating a work issue (Debtor reconciliation)

1. `team: Admin`, `project: Debtor reconciliation`. Add the parent issue when there is one (e.g. ADM-76 for ERP exports).
2. Title says what is wanted from whom (e.g. `ERP export needed: ...`).
3. Assign the person; for Sharmin tag the user in the first line.
4. **Links** (use the `links` field): the session that asked for it (`https://claude.ai/code/<session_id>`) and the branch or commit holding the evidence. Put the file path in the text too.
5. ERP export requests also carry the branch line: *start from `claude/payment-matching-mechanisms-4h34be` and commit only dated raw exports `<CODE>_<YYYY-MM-DD>.TXT` under `analysis/debtors/<CODE>/raw/`; no analysis or statement work on that branch.*
6. Never ask the ERP for allocation detail to tie payments (`SKILL_Human_Sources_Agent.md` §6.1; allocation is the matcher's job). Allowed only when the operator asks for credit-note or cylinder detail.
7. No secrets. No customer messages are sent from Linear.
8. A request that Sharmin must act on gets a short, self-contained body: why, exactly what, file naming, where to put it, what to report back. Say "request to check and report" if nothing should be changed.

## 3. Agent Work Log entry (one per chat or session)

Follow the rules in the project description itself. In short:

1. Search the project for your session ID first (`list_issues` with `project: "Agent Work Log"`, `query: "<session-id>"`). If an entry exists, update it or comment; never create a duplicate.
2. Create the entry when real work starts: title `[Claude Code] short description`, label `Claude Code` (exactly one Agent label), state In Progress.
3. Description uses the entry template (Agent, date and time in SAST, related project or issue, chat ID, chat link, what was done, outputs, logged by).
4. Attach the session link with `links`, and name the related Debtor reconciliation issues in the text.
5. Progress goes in comments at milestones. Set Done when finished or Canceled if abandoned.
6. If you do not know a value, write `unknown`; do not guess. Session IDs of other sessions are known only if you saw them; MD0003's session ID was not available to the PM on 2026-10-17, so it has no entry yet.

## 4. Checklist before you end a session

- [ ] Every issue you created is in a project and links this session.
- [ ] Your Work Log entry exists, is current, and lists branch and commit outputs.
- [ ] Any ERP export request carries the branch line.
- [ ] No secrets in any issue, comment or link title.
