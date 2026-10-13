---
name: family-rulings-and-holds
description: >
  How operator decisions are recorded for a payer-family consolidated statement (worked
  example TWK AGRI holds H1 to H5). Use when the operator rules on a lane, a price, a tie,
  a payment allocation or a release gate: evidence first, then dated rowNotes appended
  (never overwritten), locks only where the matcher left a PROBABLE tie, holds and
  customerQuarantine in config, and tripwires on every ruling. The agent never decides for
  the operator.
---

# Family Rulings and Holds

Governance: `DEBTORS_DOCTRINE.md` D20 (a family releases only with no open hold), `AGENTS.md` section 7 (workers consume doctrine; the operator decides), §5 (operator overrides live in `config/*.json`, never hand-patched generated CSVs), "amendments append", "every closed ruling names the events that reopen it". Re-run mechanics: `SKILL_Family_Statement_Refresh.md`.

## 1. The rule underneath

**Never decide a lane, a price, a tie or a release for the operator.** The agent produces evidence and a recommendation, asks, and then records the answer in the operator's words. "Yes" to a specific question is a ruling for that question only. An agent's reading of the *mechanics* of a ruling is labelled as such and confirmed against the posted documents.

## 2. Order of work

1. **Evidence first.** A short report under `docs/previews/` with PROVEN / ASSERTED / ASSUMED tags and artifact paths. Examples: the double-credit check (`docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md`), the child-account analysis (`docs/previews/2026-10-10_TWK_family_children.md`).
2. **Ask a closed question** with a recommendation.
3. **Record the ruling** (section 3), rebuild the member, run the tests.
4. **Update the preview note** with a dated "Update" section saying what was recorded, what was not (no lock, no snapshot), and what still blocks release.

## 3. Where a ruling is recorded

| Kind of ruling | Where | Mechanism |
| :--- | :--- | :--- |
| Lane, price, replacement, explanation of a row | `rowNotes` in the member's `config/statement_v5.json` | Dated entry `{ entry_type, doc, note }`. **Append**: add a new dated line to an existing entry, or a new entry; never overwrite or delete earlier text |
| Tie the matcher left **PROBABLE** | A lock via `approve_tie.mjs --ties …` | Operator "approve"; tie ids renumber after each recorded lock, so re-list per run |
| Tie the matcher already **CONFIRMED** | A `rowNotes` entry only | `approve_tie.mjs` refuses confirmed ties ("only probable ties need approval"). Example: TWK004 53535 / CN 15781 |
| Payment allocation the matcher did not make | A lock: `approve_tie.mjs --payment … --invoices … --treatment …` | Operator approval; state the evidence and the alternative. Example: TWK003 payment 43500 applied to 47991 (the advice names 47880, which CN 13966 reverses): lock L0001; 47880 / CN 13966 stays a separate unapproved PROBABLE tie |
| Credit note paired without a payment | `approve_tie.mjs --credit-notes … --invoices …` | Operator pairing |
| A payment settling the opening balance | `approve_tie.mjs --payment … --treatment applied_to_bf` | Proof run before recording |
| Hold on release | `familyReleaseHolds` (section 4) | Config |
| Row real in the ERP but not for the customer copy | `customerQuarantine` (section 5) | Config + ruling text |

Every `rowNotes` ruling states: the date and who ruled ("Operator ruling 2026-10-12 (main session)"), the basis, what it does *not* decide, and **tripwires** (the events that reopen it). Undo for a lock: `close_period.mjs --debtor <CODE> --void-lock <Lxxxx> --reason "…"`.

## 4. Holds: `familyReleaseHolds`

In the parent's `config/statement_of_account.json`: `[{ "id": "H1_CN15775_LANE", "text": "…" }]`.

- While any entry exists the family output is a **DRAFT** even if every member ties.
- Give each hold a stable id (`H<n>_<WHAT>`); replace a hold with a narrower one when the question changes (H2 became `H2_TWK003_ERP_CORRECTION`) rather than silently dropping it.
- **Only the operator clears a hold**, on an explicit instruction ("yes, remove H5"). The agent removes the entry then, records why in the preview note, and rebuilds. A hold whose evidence has arrived is *reported* as cleared in evidence, not removed.
- TWK AGRI worked example: H1 CN 15775 lane (ruled CYL), H2 TWK003 R-300.00 (credit, then ERP correction, then quarantine), H3 TWK004 tie and replacement 53536, H4 release gate, H5 TWK004 DB documents. All cleared on explicit operator instructions on 2026-10-12.
- **Release-gate hold:** where `debtors:tag-check` returns `NOT_DERIVABLE_FROM_TXT`, the question "does the v5 evidence path stand in for the tag gate" is the operator's. Give the basis: the matcher proof, the per-account tie-out, and a hand cross-check of every untied list item against the remittance advices. State what is not covered (a member with no `statement_of_account.json` has no tag-check of its own).

## 5. Customer quarantine: `customerQuarantine`

In a member's `config/statement_v5.json`:

```json
"customerQuarantine": [{
  "id": "Q1_PRICE_TYPO",
  "rows": [{ "entry_type": "Invoice", "doc": "47866" }, { "entry_type": "Crd Note", "doc": "13933" }],
  "expectedAmount": -300,
  "ruling": "Operator ruling 2026-10-12: … tripwires …"
}]
```

- The rows are real in the ERP but are taken off the customer list and total, reported on the internal view, and shown nowhere on the customer copy.
- **`expectedAmount` is required.** The generator aborts if the rows stop netting to exactly that amount (for example after the ERP correction posts). That abort is the point: a later change can never silently alter what the customer sees; the operator re-rules.
- The customer amount due then differs from the sum of ERP balances by the quarantined amount, deliberately. The internal view carries the reconciling line.
- It is not a write-off, not a credit and not a refund, and the agent must not describe it as one.

## 6. Checklist per ruling

- [ ] Evidence report exists, with tags and paths
- [ ] Question was closed and specific; answer quoted with date
- [ ] Right mechanism chosen (rowNotes / lock / hold / quarantine); earlier text kept
- [ ] Tripwires written
- [ ] Member rebuilt from existing captures, proof HOLDS, no lock conflicts
- [ ] `npm run debtors:test` green
- [ ] Preview note "Update" section and handoff updated; amount due before and after stated
- [ ] Nothing released, snapshotted or sent by the agent
