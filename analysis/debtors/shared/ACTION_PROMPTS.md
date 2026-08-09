# Debtor Action Prompts

*Generated: 2026-08-09*

> **HUMAN EXECUTION QUEUE**: Agents must present these prompts to a human for approval and sending. Agents do NOT send these automatically. Once sent by the human, the agent must update the `history` array in the debtor's `project.json`.

## WES004 — West Coast Fish & Chips
- **Reason:** COLLECTIONS_BLOCKED — D17 gate not satisfied (2 unmet condition(s)).
- **Recommended Action:** Human review — resolve D17 conditions with evidence. No debtor contact.
- **⛔ COLLECTIONS_BLOCKED — no message may be drafted or sent.** Unmet D17 conditions:

  - D17(b): financials.collectable missing — collectable balance must be stated under Constitution §2 (ERP balance − Σ ratified holds); cannot be inferred from totalOutstanding or age
  - D17(c): collections.blockers missing or not an array — an empty array affirms "assessed and clear"; an absent field means not assessed

---

## TAN001 — Tanya Lehman
- **Reason:** COLLECTIONS_BLOCKED — D17 gate not satisfied (3 unmet condition(s)).
- **Recommended Action:** Human review — resolve D17 conditions with evidence. No debtor contact.
- **⛔ COLLECTIONS_BLOCKED — no message may be drafted or sent.** Unmet D17 conditions:

  - D17(b): financials.collectable.basis is STALE — only PROVEN closes under §2
  - D17(b): financials.collectable.operatorConfirmation is "pending" — source is stale/unconfirmed until "confirmed"
  - D17(c): 2 open blocker(s) — route to human review, not collections: OTHER (Part 1A+1B closing R92,177.12 does not tie ERP TXT header R87,697.12 (variance R4,480.00). See TAN001_Statement_Account_v5.md bridge.), OTHER (ERP TXT transaction total R86,392.10 differs from CURRENT BALANCE header R87,697.12 (UD pay/cheques R1,305.02) — confirm which figure is the §2 anchor before demand.)

---

