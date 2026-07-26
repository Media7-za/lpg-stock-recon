# Operator Projection Schema (Staged — Turn 9)

**Status:** Staged — not yet enforced by `debtors:sync`  
**Constitutional basis:** `DEBTORS_DOCTRINE.md` §§1–2 (Projection Rule, Collectable Rule)  
**Companion:** `DEBTOR_PROJECTION_TEMPLATE.md`

---

## Purpose

An **operator projection** is the primary operator-facing artifact: at most **five operational questions**, regenerated from evidence, with ERP balance as the PROVEN anchor.

This schema defines the projection object. It is **derived state** — never an input to reconciliation.

---

## Projection object (per debtor)

```json
{
  "debtorCode": "MOZ002",
  "generatedAt": "2026-07-21",
  "evidenceAsAt": {
    "erpTxtFile": "raw/MOZ002P17.TXT",
    "erpTxtDate": "2026-07-16",
    "erpBalance": 8010.08,
    "provenance": "PROVEN"
  },
  "operationalQuestions": [
    { "id": "Q1", "question": "...", "answer": "...", "tag": "PROVEN|ASSERTED|ASSUMED" }
  ],
  "collectable": {
    "amount": 8010.08,
    "erpBalance": 8010.08,
    "ratifiedHoldsTotal": 0,
    "asAt": "2026-07-16",
    "source": "raw/MOZ002P17.TXT",
    "basis": "PROVEN",
    "operatorConfirmation": "confirmed",
    "ratifiedHolds": [],
    "bridgeLines": [],
    "bridgeVariance": 0
  },
  "stalenessGate": {
    "commsSafe": false,
    "reason": "Portfolio delta since last customer HTML"
  }
}
```

---

## `collectable` — derivation rule (binding, DEBTORS_DOCTRINE.md D18)

**`projection.collectable` is a read-through of `project.json.financials.collectable`. It must never be independently derived.**

Concretely, a generator producing this projection object:

- **must** copy `amount`, `erpBalance`, `ratifiedHoldsTotal`, `asAt`, `source`, `basis`, `operatorConfirmation` verbatim from the debtor's persisted `project.json.financials.collectable` — field names are aligned 1:1 with D18 specifically so a copy is a copy, not a translation;
- **must not** compute `amount` or `erpBalance` from ERP TXT rows, `financials.totalOutstanding`, `financials.agedDebt180Plus`, or statement sub-ledger arithmetic (LPG gas debt, cylinder financial balance, custody exposure, or any other Statement of Account computation);
- **must** omit the `collectable` block entirely if `project.json.financials.collectable` is absent — an omitted block is honest; a computed substitute is not;
- **may** add `ratifiedHolds` (itemized detail), `bridgeLines`, and `bridgeVariance` as projection-only explanatory elaboration, provided any itemization sums to the copied `ratifiedHoldsTotal` / `amount` and never overrides them.

This is the same boundary as D17/D18's collections gate, one layer up: a statement generator computing its own view of "what's collectable" — even one that happens to agree with `project.json` today — is exactly the kind of independently-authored duplicate this rule exists to prevent before it drifts.

---

## Validation rules (when enforced)

| Rule | Enforcement |
| :--- | :--- |
| Max 5 questions | FAIL if `operationalQuestions.length > 5` |
| ERP anchor required | FAIL if `evidenceAsAt.provenance` missing or balance unset |
| Collectable is read-through | FAIL if `collectable.amount`, `.erpBalance`, `.ratifiedHoldsTotal`, `.asAt`, `.source`, `.basis`, or `.operatorConfirmation` diverge from `project.json.financials.collectable` |
| Collectable identity | FAIL if `amount ≠ erpBalance − ratifiedHoldsTotal` beyond 0.05 tolerance |
| Bridge itemized | WARN if `amount ≠ erpBalance` and `bridgeLines` empty |
| Staleness | `commsSafe: false` if ERP extract superseded since projection `generatedAt` |

---

## Relationship to `project.json`

| Field | Role |
| :--- | :--- |
| `project.json` | Portfolio state machine + financials summary (PM-owned) |
| `closingBasis` (optional) | Recon closure record — not a projection |
| `project.json.financials.collectable` (D18) | Sole source for `projection.collectable` — read-through only, see rule above |
| Projection file | Ephemeral operator view — regenerate; do not treat as canonical |

Future: projections may live under `analysis/debtors/{CODE}/projections/` or evidence exchange bundles — path TBD at activation.

---

## Activation gate

Projection schema enforcement in `debtors:sync` requires explicit operator decision (see `DEBTORS_ORCHESTRATION_ROADMAP.md` — Turn 9 milestone).

Event sourcing / digital-twin activation remains **parked** — separate operator decision.
