# Turn Brief — <DEBTOR_CODE> Turn <NNN>

> **Field structure is canonical in `.agents/skills/SKILL_Debtors_Orchestrator.md` §5.5.** This file is the fillable instance of that skeleton — do not add or rename sections here without amending §5.5 first.
>
> **Written by:** Orchestrator (planning layer) · **Executed by:** Repo worker (Cursor) · **Approved by:** Operator
>
> **Why this is a file and not a chat paste:** the worker opener states *"chat is not source of truth — cite repo paths only."* The brief is the most authority-bearing object in a turn; it lives in the same versioned turn folder as the evidence it produces, so instruction and result are diffable together.

**Location:** `analysis/debtors/evidence_exchange/<DEBTOR_CODE>/turn-<NNN>/turn_brief.md`
**Paired manifest:** `./manifest.json` (from `TURN_MANIFEST.template.json`)
**Bundle checklist:** `../../templates/TURN_BUNDLE_CHECKLIST.md`

---

## 0. Header

| Field | Value |
| :--- | :--- |
| Debtor code | `<DEBTOR_CODE>` |
| Turn | `<NNN>` |
| Supersedes turn | `<NNN or none>` |
| Lane | `<settlement_discount \| allocation \| position_recon \| position_recon + statement \| defer \| collections>` |
| Lane method (skill path) | `<path — must match SKILL_Debtors_Orchestrator.md §4>` |
| Turn class | `investigation (read-only)` \| `closing` \| `write-conditional` |
| Brief written at | `<ISO-8601-UTC>` |
| Operator approval to dispatch | `pending \| granted <YYYY-MM-DD>` |

**Closing turns close; they do not open.** Investigation turns are read-only by default (§5.5).

## 1. ERP freshness gate — worker runs this first

Mandatory if this turn touches balance, allocation, statement, comms, payment position, ratification, or closure.

- [ ] Identify newest ERP extract in repo — record filename, dates, balance
- [ ] Ask operator to confirm it is latest, or upload fresh TXT
- [ ] **STOP until explicit confirmation or upload.** Label `LATEST_IN_REPOSITORY` until then

| Field | Value |
| :--- | :--- |
| Repository latest file | `<FILENAME>.TXT` |
| Balance / as-at | `<amount>` / `<YYYY-MM-DD>` |
| Operator confirmation | `pending \| confirmed <YYYY-MM-DD>` |
| Balance classification | `ASSERTED_STALE_PENDING_OPERATOR_CONFIRMATION` until confirmed |

While `pending`, the following stay **blocked**: live debtor communications, collection amounts, reconciliation closure, balance-dependent override ratification, and any "current statement" claim.

## 2. Objective

One line. Include what is currently pending with the operator.

## 3. Method constraint

State the governing evidence-doctrine line and **what may not decide**. Cite the doctrine, don't restate it.

- Constitutional: `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §§ `<n>` · rulings `<D14 / D15 as applicable>`
- Scoped-canonical evidence doctrine: `<e.g. SKILL_Debtor_Statement_v4_From_TXT.md § Doctrine addendum>`
- May **not** decide: `<e.g. ref_no is advisory — corroborates, never decides globally (D14)>`

## 4. Steps

Number each. Mark every step `read-only` or `write-conditional-on-Step-<k>`.

| # | Step | Mode |
| :--- | :--- | :--- |
| 1 | `<step>` | `read-only` |
| 2 | `<step>` | `write-conditional-on-Step-1` |

Write-gating rule: the repo agent may write **only** downstream of ledger evidence or operator ratification. Never infer-then-write.

## 5. STOP conditions

Where the worker halts and reports instead of improvising.

- ERP freshness unconfirmed and the turn touches a gated item (§1)
- `<invariant> FAIL` or residual outside tolerance
- Any `UNCLASSIFIED_EXCEPTION` that would need a judgment call
- Evidence contradicts a ratified registry entry
- `<turn-specific>`

## 6. Outputs — exact artifact paths

| Artifact | Path |
| :--- | :--- |
| Worker report | `./worker_report.md` |
| Manifest | `./manifest.json` |
| `<derived artifact>` | `<path>` |

## 7. Acceptance gates

A turn is not closed until all of these pass. Do not collapse them into "ran the generator."

- [ ] Derivation ran
- [ ] **Validated against the ERP anchor** — residual within tolerance, stated in the manifest
- [ ] **Identity / conservation invariants PASS** — named, with results
- [ ] Operator View generated **and inspected**
- [ ] `npm run debtors:sync` ran clean
- [ ] `manifest.json` present and complete in this turn folder

**Epistemic note:** an artifact is not `PROVEN` until it closes under an identity or conservation law against an external anchor. Per **D15**, a `Confirmed` allocation edge is not `PROVEN` on that basis alone.

## 8. Tripwires

Conditions that reopen this turn's conclusions. Record in registry / override notes.

- `<e.g. residual recomputation required if portfolio anchor changes>`

## 9. Out of scope

What this turn must not touch.

- `reconState` changes — defer to PM skill if material
- Allocation edges not named in §4
- Debtor contact / comms of any kind
- Portfolio replanning
- Doctrine text — amendable only by operator-ratified D-numbered ruling
- `<turn-specific>`

## 10. Operator decisions required

Carry into `manifest.json → operator_decisions_required` and, where a human action is needed, append a row to `analysis/debtors/shared/HUMAN_TASKS.md`.

| # | Decision | Blocking? |
| :--- | :--- | :--- |
| 1 | `<decision>` | `yes \| no` |
