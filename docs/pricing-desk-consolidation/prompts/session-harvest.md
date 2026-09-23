# Pricing Desk session extraction prompt

Copy the prompt below into the source conversation, or ask a connected session to execute this file.

---

Review this conversation and produce a structured handoff for consolidating my Pricing Desk work into one cohesive CRM-style operating workflow.

PROMPT ID: PD-SESSION-HARVEST
PROMPT VERSION: 1.1
CHANGE FROM 1.0: Added timestamps, evidence chronology, handoff versioning and revision tracking.

I have developed pieces across many sessions. Extract this session’s contribution faithfully so a consolidation session can connect them without losing decisions, duplicating work or treating proposals as implemented features.

Use only this conversation and artifacts whose contents are available here. Do not search other sessions, modify files, update systems or create a new architecture.

Review all accessible messages, including corrections and later changes. State any truncation or unavailable attachments. Do not claim complete coverage unless justified.

TIMESTAMP AND VERSION RULES

- Use ISO 8601 timestamps with timezone offsets when available. Preserve the source timezone; do not assume one.
- If only a date is known, use YYYY-MM-DD. If unavailable, write “unknown.” Never invent a time or use extraction time as the original event time.
- Distinguish message/decision recorded time, business effective date, artifact creation/update time and handoff extraction time.
- Where timestamps are missing, preserve relative order using evidence references such as E001, E002 and a short quotation.
- Initial handoff version: 1.0. If a prior handoff is visible, retain its identifier and increment the minor version for additions or corrections. Increment the major version only for a substantive restructuring.
- If a previous version is mentioned but unavailable, mark version continuity “unverified”; do not invent its contents or revision number.
- Preserve existing item identifiers across revisions. Add new identifiers for new items; mark superseded or withdrawn items instead of silently removing them.
- Handoff versions do not change the approval status of the underlying business decisions.
- A later statement supersedes an earlier one only where its scope and evidence support that conclusion.

Return the following:

1. HANDOFF METADATA AND COVERAGE
- Session title and conversation link/ID, if available.
- Handoff ID: use the conversation ID if available; otherwise create a clearly labelled local reference and retain it in later revisions.
- Handoff version and previous version/reference.
- Prompt ID and version.
- Extraction timestamp.
- Earliest and latest accessible source timestamps.
- Coverage limitations and review status: “unreviewed by consolidation session.”
- Main purpose and topics.

2. CONTRIBUTION TO THE OVERALL SYSTEM
Explain briefly what this session adds to Pricing Desk operations.
Identify relevant activities such as lead capture, customer intelligence, pricing, approval, quotes/proformas, follow-up, orders, fulfilment, payment, repeat sales or governance. Include other activities where present; do not force evidence into this list.

3. DECISIONS AND RULES
Assign each material decision a stable local ID: D001, D002, etc.
Record:
- Decision or rule and its scope.
- Status: explicitly approved, proposed, rejected, superseded or unresolved.
- Who made or approved it.
- Recorded timestamp and business effective date/period, separately.
- Supporting evidence reference and short quotation or artifact reference.
- Conditions and exceptions.
- Any decision it supersedes, with the reason.

Distinguish user instructions from assistant recommendations. Silence is not approval. “Latest in this session” does not mean latest across all sessions.

4. WORKFLOW REVEALED
For each workflow discussed or demonstrated, capture:
- Trigger and required information.
- Actions in sequence.
- Responsible person, agent, skill or system, where stated.
- Readiness checks and approval points.
- Output or record created and where it is saved.
- Handoff, next action and completion condition.
- Exceptions or events that reopen the work.
- Relevant evidence references and dates.

Mark missing elements “not established here.” Preserve distinctions between customer status, deal stage, pricing decision, offer, quote, agreement and order.

5. RECORDS AND COMMERCIAL FACTS
List records, identifiers and relationships actually used or discussed.
Preserve material customer codes, prices, quantities, units, VAT basis, delivery/collection basis, effective dates and validity.
Distinguish facts, assumptions and calculated values.
Retain corrections and identify what they supersede.
Separate one-off deal prices from ongoing agreements and ERP master-price changes.
Do not apply a later price retrospectively without explicit evidence.

6. ARTIFACTS AND IMPLEMENTATION
Assign artifact references A001, A002, etc.
List relevant documents, skills, repositories, paths, branches, commits, tables, APIs, tools and generated outputs.
For each, record:
- Exact reference and artifact version/commit, if available.
- Creation/update timestamp, where evidenced.
- Status: proposed, drafted in conversation, reported saved/built, confirmed by visible evidence, or tested.
- Actual test result and timestamp, if available.
- What another session must inspect.

An assistant saying “done” is not proof. A branch name alone does not prove that work was merged or deployed.

7. UNFINISHED WORK AND CONFLICTS
Assign stable IDs to open items: O001, O002, etc.
Capture:
- Where work stopped.
- Missing inputs, blockers and pending decisions.
- Unresolved contradictions, retaining both positions and their dates.
- Abandoned approaches and reasons.
- Dependencies on other sessions or systems.
- Previously agreed next action, owner and due date, if stated.
- First raised and last updated timestamps where available.

8. CONSOLIDATION NOTES
State:
- What must be preserved.
- What appears reusable across customers.
- What remains customer/deal-specific.
- What needs reconciliation with other sessions.
- Missing connections explicitly identified here.

9. REVISION HISTORY
Include:
Version | Extraction timestamp | Changes | Affected item IDs | Reason/source

For an initial extraction, state “Initial extraction.”
For a revision, identify additions, corrections, supersessions and unresolved changes since the previous visible handoff. Distinguish newly discovered historical evidence from genuinely new business decisions.

Be concise but preserve material details. Omit repetition and unrelated discussion. Do not fill gaps with generic CRM advice or new recommendations. Label inferences clearly.

Start with “PRICING DESK — SESSION HANDOFF” and return the handoff only.
