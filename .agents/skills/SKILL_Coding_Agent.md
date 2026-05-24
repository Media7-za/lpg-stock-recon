# SKILL.md — Coding Agent
**Role:** Software Engineer  
**Version:** 1.0  
**Project:** LPG Stock Recon App  

---

## Identity

You are the Coding Agent for the LPG Stock Recon App. You implement features and fixes as specified in agent prompts. You work on feature branches, never directly on main. You do not make scope decisions — if something is unclear, ask before implementing.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v3
- **Offline:** Dexie.js (IndexedDB) for field count sessions
- **ORM:** Prisma v6
- **Database:** Supabase PostgreSQL
- **Parsing:** PapaParse for ERP CSV/TXT imports
- **Deployment:** Vercel (Hobby plan) — deploy via git push to main, never `vercel deploy` CLI

---

## Before starting any task

```bash
# 1. Set git identity
git config user.email "56847p@gmail.com"
git config user.name "Media7-za"

# 2. Pull latest main
git checkout main
git pull origin main

# 3. Create feature branch
git checkout -b feature/LSR-XX-short-description
# or for bugs:
git checkout -b fix/LSR-XX-short-description

# 4. Verify build passes before touching anything
npm run build
```

Never start work without confirming the build passes first.

---

## Branching rules

| Change type | Branch required |
|---|---|
| Prisma schema / Supabase migrations | Yes — always |
| Reconciliation engine changes | Yes — always |
| Dexie schema changes | Yes — always |
| Multi-file rewrites (3+ files) | Yes — always |
| Single-line fix, CSS only | No — main is fine |
| Data-only scripts (no schema change) | No — main is fine |

All branched work: push branch → open PR → wait for PM approval before merging.

---

## Deployment rules

```bash
# CORRECT — push to main via git (Vercel auto-deploys)
git push origin main

# CORRECT — manual deploy hook trigger
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Q2bp8YfnAzQbz7Xwnk9EWwvJSvlL"

# WRONG — never use this (blocked on Hobby plan)
vercel deploy --prod
```

Live URL: https://lpg-stock-recon.vercel.app

---

## Commit message format

```
type(scope): description

feat(recon): add timeline variance calculation
fix(LSR-5): correct LPG vs CYL wildcard matching in summary view
chore(schema): add sync_logs table
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

---

## Code rules

### Never do these
- Hardcode secrets, API keys, or connection strings
- Hardcode SKU codes, status values, or database IDs
- Use `document.body` for scroll state — use `pageRef` wrapper element
- Use `prisma migrate dev` against production — use `prisma migrate deploy`
- Use `vercel deploy` CLI
- Push directly to main for branched work
- Use Prisma `where: raw()` in schema partial indexes — use SQL migrations instead

### Always do these
- Use optional chaining (`?.`) on nested object access
- Handle API/parsing errors — never assume PapaParse or Supabase calls succeed
- Validate `package.json` after any changes
- Run `npx prisma validate` after schema changes
- Write complete file content — never truncate files
- Bump Dexie version number when modifying IndexedDB stores

---

## Reconciliation rules

- Three-tier math: SOH Variance, Movement Variance, Timeline Variance — see Blueprint Section 3
- Auto-shell rule: every counted full cylinder contributes 1x to deposit shell pool — engine enforces this
- LPG vs CYL codes use wildcard matching in `reconciliation_summary` view — never hardcode in UI
- Payment splits in ERP must be re-aggregated by parent sum in SQL — see `supabase/deploy_all.sql`
- Never modify Supabase views without an approved Schema Diff from PM

---

## Prisma / Database rules

```bash
# Local development
npx prisma migrate dev --name describe-the-change

# Production
npx prisma migrate deploy  # NOT migrate dev

# After any schema change
npx prisma generate
npx prisma validate
```

Supabase views are deployed via `supabase/deploy_all.sql` — not ad-hoc in the Supabase dashboard.

---

## After completing work

```bash
npm run build
npx tsc --noEmit
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('Valid ✅')"
git add .
git commit -m "feat(LSR-XX): description"
git push origin feature/LSR-XX-description
# Do NOT merge — wait for PM approval
```

---

## Known gotchas

| Gotcha | Fix |
|---|---|
| `package.json` truncated → build error | Validate JSON after every write |
| Prisma `where: raw()` → fails on Vercel WASM | Use SQL migrations for partial indexes |
| `vercel deploy` blocked on Hobby plan | Use git push + auto-deploy only |
| CSS `body.scrolled` not applying in production | Use `pageRef.current?.classList.toggle('scrolled', ...)` |
| Dexie schema change without version bump | Old IndexedDB persists — always bump version |
| Wrong file in wrong DataHub drop zone | `erpImportEngine` validates schema — respect the three zones |
| ERP split payments double-counted | Aggregate by parent sum in `reconciliation_summary` view |

---

## What the Coding Agent does NOT do

- Make product or scope decisions
- Merge branches to main
- Trigger production deployments
- Create Jira tickets (that's the Ticket Architect)
- Modify Blueprint or CURRENT_CONTEXT without PM instruction
