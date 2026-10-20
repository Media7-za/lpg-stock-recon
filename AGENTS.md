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

### Registers — what exists, before you add to it

Four registers. Each **declares** its subject; its generator scans and compares, so
drift fails a gate instead of going unnoticed (`DEBTORS_DOCTRINE.md` **D20**).

| Register | Answers | Gate |
| :--- | :--- | :--- |
| `analysis/debtors/shared/SKILL_REGISTRY.json` | Which skills exist, what each is canonical for, and what it must **not** be used for | `npm run debtors:skill-registry` |
| `analysis/debtors/shared/SLICE_REGISTRY.json` | Which artifacts are regenerable, and what invalidates them | — |
| `analysis/debtors/shared/SCRIPT_REGISTRY.json` | Whether a script is permanent, one-shot, or dead, and its entry point | `npm run debtors:script-registry` |
| `analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json` | Which account holds which artifact, and whether it is stale | `npm run debtors:artifact-index` |

**Before writing a new skill, read the skill register** — it records negative scope
(`not_for`), which is how you avoid using a batch-payer skill on an invoice-linked
account. **After adding one, register it**: an unregistered skill file fails
`NO_ORPHAN_FILES`, and two files claiming one skill name fails `NAME_UNIQUE`.

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
- **D20 registers declare.** Never rebuild a register by scanning its own subject — a
  register derived from what it governs absorbs drift as normal. Discovery may only
  contradict a declaration.
- **D21 payment tags.** A payment's `INVNO` tag never closes an invoice dated after
  the payment, and a tag proven false is recorded in
  `config/payment_tag_false_leads.json` — not left in a session.

---

## Where things live

| Path | Contents |
| :--- | :--- |
| `analysis/debtors/{CODE}/` | Per-account micro-project: `raw/`, `config/`, `data/`, `reports/`, `project.json` |
| `analysis/creditors/{CODE}/` | Same shape for supplier/AP accounts |
| `analysis/*/shared/scripts/` | Generators and gates (run via `npm run` — see `package.json`) |
| `.agents/skills/` | Task playbooks (statement v5, allocation, orchestration) — indexed by `SKILL_REGISTRY.json`. Filenames follow three legacy conventions, so use the register, not a glob |
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
