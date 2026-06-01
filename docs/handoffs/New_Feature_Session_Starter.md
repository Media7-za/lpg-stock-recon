# New Feature Session Starter

Use this prompt when spinning up a fresh agent session to begin a new feature on the LPG Stock Recon project. Copy it in full, fill in the three placeholders, and paste it as your opening message.

---

## Prompt Template

```
## Session Setup

You are starting a new feature session on the LPG Stock Recon project.

Repo:    Media7-za/lpg-stock-recon
Ticket:  LSR-{NUMBER}
Feature: {ONE LINE DESCRIPTION}

---

### Step 1 — Clone the repo

```bash
git clone https://[PAT]@github.com/Media7-za/lpg-stock-recon.git /home/claude/lpg-stock-recon
cd /home/claude/lpg-stock-recon
git config user.email "56847p@gmail.com"
git config user.name "Media7-za"
npm install
```

Generate a fresh PAT at:
github.com → Settings → Developer settings → Personal access tokens
Scopes: Contents Read/Write, Pull requests Read/Write
Expiry: 1 day. Paste it in place of [PAT]. Rotate it after the session.

---

### Step 2 — Read these docs before doing anything else

Read them in this order. Do not skip any.

1. `docs/governance/authority_model.md`          — authority hierarchy; resolves all conflicts
2. `docs/governance/system_invariants.md`        — rules that are never violated
3. `docs/governance/domain_glossary.md`          — canonical definitions for all domain concepts
4. `docs/governance/entity_definitions.md`       — entity fields, types, and ID integrity rules
5. `docs/governance/state_machines.md`           — state transitions and side effects
6. `docs/governance/api_contracts.md`            — endpoint contracts and status casing
7. `docs/governance/validation_checklist.md`     — pre-completion checklist (Sections 1–10)
8. `docs/Pipelines/feature_pipeline.md`          — the pipeline you are now executing
9. `docs/roles/exploration_architect.md`         — your first role
10. `LPG-Stock-Recon-Blueprint.md`               — product requirements and epics

---

### Step 3 — Create your working branch

```bash
git checkout -b feature/LSR-{NUMBER}-{short-slug}
```

Example: `git checkout -b feature/LSR-42-debtor-export`

---

### Step 4 — Begin Phase 1, Stage 1: EXPLORATION-ARCHITECT

You are now operating as EXPLORATION-ARCHITECT for ticket LSR-{NUMBER}.

Your goal in this stage is to produce a Slice Brief that removes all ambiguity
before any code is written. Read `docs/roles/exploration_architect.md` and follow it.

Input you have:
- Feature description: {ONE LINE DESCRIPTION}
- Governance docs: read in Step 2
- Repo access: full read

Output you must produce (post to Jira ticket LSR-{NUMBER} or return here for PM review):
- Feature name and actor
- User outcome
- Scope: what is IN and OUT
- Events that enter the slice
- Outputs that leave the slice
- Systems/entities read and written
- Dependency map
- Open Questions Register
- Recommended vertical slice definition

Do not write any code until the Slice Brief is approved by the PM.
Do not move to Stage 2 until the PM explicitly says "Slice Brief approved."

---

### Non-negotiable rules for this session

- Never push directly to `main`
- Always run `npm run build` before any commit — never push a broken build
- Never truncate or partially overwrite a file — always write complete file content
- Use `prisma migrate deploy` (not `prisma migrate dev`) against production databases
- Never run `vercel deploy` CLI — deploy path is `git push origin main` only
- Validate `package.json` after any edits:
  `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`
- If you discover something in Phase 2 that requires a scope change:
  stop, surface it, wait for PM decision — never self-authorise

---

### Project quick reference

| Detail | Value |
|---|---|
| Live app | https://lpg-stock-recon.vercel.app |
| Jira project | LSR |
| Supabase ref | movixifclapeprdemgwk (eu-west-2) |
| Git email | 56847p@gmail.com |
| Deploy trigger | git push origin main (Vercel auto-deploys) |
| Framework | React 18 + Vite, Tailwind CSS v3, Prisma v6, Supabase |
| Active branch | feature/LSR-{NUMBER}-{short-slug} |
```

---

## Filling In the Placeholders

| Placeholder | What to put |
|---|---|
| `LSR-{NUMBER}` | The Jira ticket number, e.g. `LSR-42` |
| `{ONE LINE DESCRIPTION}` | One sentence describing the feature, e.g. `Export debtor statement as PDF from the workspace page` |
| `{short-slug}` | 2–4 word kebab-case branch slug, e.g. `debtor-pdf-export` |
| `[PAT]` | Your fresh GitHub PAT — generate just before sending, rotate after the session |

---

## What Happens After the Slice Brief

The agent will pause and return a Slice Brief for your review.

If approved, respond:

```
Slice Brief approved. Proceed to Stage 2: DOMAIN-PRD-AGENT.
Read docs/roles/domain_prd_agent.md and follow it.
```

If changes are needed, respond with the specific correction and say:

```
Revise the Slice Brief — [your correction]. Do not proceed to Stage 2 until I approve.
```

Continue through each stage in `docs/Pipelines/feature_pipeline.md` using the same
approval pattern. Phase 1 is not complete until all five artifacts are approved and
the Phase 1 Lock checklist is signed off.

---

## Simplified Variant Starters

### UI-Only Slice (no new backend or schema)
After Step 4, skip Stages 3 and 4. The pipeline sequence is:
`Stage 1 (Exploration) → Stage 2 (PRD) → Stage 5 (UX) → Phase Lock → Stage 7 (Frontend) → Stages 8–10`

Add this line after the Stage 4 instruction:
```
This is a UI-only slice. Skip ARCHITECT-AGENT and SCHEMA-AGENT.
After Stage 2, proceed directly to Stage 5: UX-DESIGN-AGENT.
```

### Backend-Only Slice (no new UI screens)
After Step 4, skip Stages 4 and 5. The pipeline sequence is:
`Stage 1 → Stage 2 → Stage 3 → Phase Lock → Stage 6 (Backend) → Stages 8–10`

Add this line after the Stage 4 instruction:
```
This is a backend-only slice. Skip SCHEMA-AGENT (unless schema changes are needed)
and UX-DESIGN-AGENT. After Stage 3, proceed directly to Phase Lock then Stage 6.
```
