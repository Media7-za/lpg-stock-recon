# AGENTS.md — LPG Stock Recon App

Instructions for AI agents working in this repository. Applies to Cursor, Claude
Code, and any other agent with repo access.

---

## Read this first

Session context is lost at close; **only files persist**. The repo is the memory.

1. **Resume before you work.** Read the latest dated handoff:
   `ls docs/handoffs/[0-9]*.md 2>/dev/null | sort | tail -1`
   (Other files in `docs/handoffs/` are templates, not session state. If none
   exists yet, read the account's `project.json` history instead.)
2. **Harvest before you finish.** Read `docs/roles/session_closer.md` and follow it
   when the session produced durable value, or when the operator signals wrap-up.

Skip both for trivial questions that touch no account state.

---

## Governance — read before writing conclusions

| Document | Authority |
| :--- | :--- |
| `analysis/debtors/shared/DEBTORS_DOCTRINE.md` | **Constitutional** — debtors portfolio recon |
| `analysis/creditors/shared/docs/CREDITORS_DOCTRINE.md` | Creditors / AP lane |
| `analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md` | Payment→invoice allocation |
| `analysis/debtors/shared/PROJECT_SCHEMA.md` | `project.json` field contract |
| `.agent/AGENT_WORKFLOW.md` | Agent vs UI boundary |
| `docs/session_prompts.md` | Role session starters |

### Non-negotiables

- **§7 authority.** Worker sessions **consume** doctrine; they do **not** author
  constitutional changes. Portfolio-wide rules are staged as
  `PROPOSED — NOT RATIFIED` with the operator's decision named. Never infer
  ratification from silence.
- **§6 epistemic tags.** Every material number carries `PROVEN`, `ASSERTED`, or
  `ASSUMED`, and cites an artifact path. A variance explained in prose is not
  reconciled.
- **§5 idempotency.** Operator overrides live in `config/*.json`. Never hand-patch
  generated CSVs — ingest applies overrides.
- **Amendments append.** Superseded text is marked, never deleted.
- **Tripwires.** Every closed ruling names the future events that reopen it.

---

## Where things live

| Path | Contents |
| :--- | :--- |
| `analysis/debtors/{CODE}/` | Per-account micro-project: `raw/`, `config/`, `data/`, `reports/`, `project.json` |
| `analysis/creditors/{CODE}/` | Same shape for supplier/AP accounts |
| `analysis/*/shared/scripts/` | Generators and gates (run via `npm run` — see `package.json`) |
| `.agents/skills/SKILL_*.md` | Task playbooks (statement v5, allocation, orchestration) |
| `docs/roles/` | Role definitions for pipeline sessions |
| `docs/handoffs/` | Session handoffs — dated |
| `src/features/*/data/fixtures/` | UI fixtures consumed by the React workspace |

Account state is `project.json`; `history[]` is the running log. Recorded operator
judgement in `config/*.json` is a decision, not a draft — do not "tidy" it away.

---

## Working rules

- Reports and figures are **derived** artifacts. Regenerate them with the owning
  script rather than editing numbers by hand.
- The React/Vite PWA is a **review surface**. It must not perform reconciliation.
- Prefer the existing generator and gate scripts over ad-hoc parsing.
- When a number cannot be anchored, mark it `unverified`. Never invent a value to
  complete a table.
