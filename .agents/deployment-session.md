# Deployment Session Template
## For use with Antigravity (AI Coding Agent) — Next.js + Supabase + Vercel

**Version:** 1.0  
**Last updated:** April 2026  
**Author:** Media Seven  

---

## How to use this template

1. Copy this file into your new project repo as `.agents/deployment-session.md`
2. Fill in all `[PLACEHOLDER]` values before starting the agent session
3. Hand the completed file to Antigravity as the first message of the session
4. Follow the Pre-flight checklist manually before the agent starts

---

## Pre-flight checklist (YOU do this before the agent session)

Complete every item manually before starting the agent session. Do not ask the agent to do these.

- [ ] GitHub repo created at `github.com/[your-org]/[repo-name]`
- [ ] Initial commit pushed to `main` branch (even if just a README)
- [ ] Vercel project created at vercel.com and linked to the GitHub repo
- [ ] Production branch set to `main` in Vercel Git settings
- [ ] Supabase project created — note the project reference ID
- [ ] Supabase database password saved securely
- [ ] GitHub PAT generated with `repo` scope — saved securely
- [ ] Vercel deploy hook created for `main` branch — URL saved
- [ ] All environment variables added to Vercel dashboard manually (see list below)

---

## Project Context Document
*(Fill this in and hand to the agent at session start)*

```
PROJECT NAME: LPG Stock Recon App
PURPOSE: PWA for LPG cylinder stock reconciliation with dual reconciliation tracking (deposit shells + gas content).

TECH STACK:
- Framework: React 18 + Vite [v5]
- Styling: Tailwind CSS v3
- ORM: Prisma v6
- Database: Supabase PostgreSQL
- Deployment: Vercel (Hobby plan)
- Auth: [None yet / NextAuth / Supabase Auth]

REPOSITORY:
- GitHub: github.com/Media7-za/lpg-stock-recon
- Production branch: main
- Feature branch pattern: feature/[description]
- Fix branch pattern: fix/[ticket-id]-[description]

VERCEL:
- Project name: [vercel-project-name]
- Team slug: [team_xxxxxxxxxxxxxxxx]
- Deploy hook URL: [PLACEHOLDER]
- Live URL: https://[project-name].vercel.app

SUPABASE:
- Project ref: [xxxxxxxxxxxxxxxx]
- Region: [e.g. ap-southeast-1]
- Database URL: [stored in .env — do not hardcode]

GIT IDENTITY (required for all commits):
- user.email: 56847p@gmail.com
- user.name: Media7-za
```

---

## Environment Variables

The following environment variables must be set in the Vercel dashboard AND in `.env.local` for local development. Never commit `.env.local` to git.

```
DATABASE_URL=[supabase-pooled-connection-string]
DIRECT_URL=[supabase-direct-connection-string]
NEXT_PUBLIC_SUPABASE_URL=[https://[ref].supabase.co]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[supabase-service-role-key]
```

Add any project-specific variables below:
```
[KEY]=[value]
```

---

## Agent Rules — Non-negotiable

Hand these rules to the agent at the start of every session:

### Git rules
- Always set git identity before first commit:
  ```bash
  git config user.email "56847p@gmail.com"
  git config user.name "Media7-za"
  ```
- Never push directly to `main` without PM approval
- All work goes on feature branches: `feature/[description]` or `fix/[ticket-id]`
- Always run `git status` before committing — check for unintended file changes
- Never truncate or partially overwrite files — always write complete file content
- Commit message format: `type(scope): description` e.g. `feat(orders): add bulk status dropdown`

### Build rules
- Before every push, run: `npm run build && npx tsc --noEmit && npm run lint`
- Never push if the build fails
- For Prisma: always use `prisma generate` after schema changes
- For Supabase migrations: use `prisma migrate deploy` (not `prisma migrate dev`) in production

### Deployment rules
- Deployment trigger: `git push origin main` (Vercel auto-deploys via GitHub integration)
- Manual trigger if needed: `curl -X POST "[deploy-hook-url]"`
- Never use `vercel deploy` CLI — it runs under the agent's git identity and will be blocked on Hobby plan
- After every deployment, verify the live URL returns 200 before declaring done

### Code quality rules
- Never hardcode secrets, API keys, or connection strings
- Never hardcode route names, status values, or IDs that exist in the database
- Always use optional chaining (`?.`) when accessing nested object properties
- Always handle API errors — never assume a fetch will succeed

---

## Deployment Workflow

### First deployment (new project)
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations against Supabase
npx prisma migrate deploy

# 4. Build locally to verify
npm run build

# 5. Push to main
git add .
git commit -m "feat: initial deployment"
git push origin main

# 6. Vercel auto-deploys — wait for Ready status
# 7. Verify live URL
curl -I https://[project-name].vercel.app
```

### Subsequent deployments
```bash
# 1. Verify build passes locally
npm run build

# 2. Commit and push
git add .
git commit -m "[type(scope): description]"
git push origin main

# 3. Monitor Vercel deployment
# Check: https://vercel.com/[team]/[project]/deployments
```

### If deployment fails
1. Check Vercel function logs — not the CLI output
2. Common causes:
   - `prisma generate` not running — check `postinstall` script in `package.json`
   - Missing environment variable — check Vercel dashboard
   - TypeScript errors — run `npx tsc --noEmit` locally first
   - Prisma schema syntax error — run `npx prisma validate` locally first

---

## Acceptance Checklist (verify after every deployment)

- [ ] Live URL returns 200 (not 500 or blank page)
- [ ] Database connection working — at least one API route returns data
- [ ] No console errors on first page load
- [ ] Environment variables all resolving correctly
- [ ] Prisma migrations applied — `npx prisma migrate status` shows no pending migrations

---

## Known Gotchas (learned from LPG project)

| Gotcha | Prevention |
|---|---|
| Agent deploys under its own git identity → blocked on Vercel Hobby | Use git push + GitHub auto-deploy, never `vercel deploy` CLI |
| `package.json` truncated mid-write → CssSyntaxError on build | After any file edit, validate JSON: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` |
| Prisma `where: raw()` syntax → fails on Vercel WASM parser | Never use `raw()` in schema partial indexes — use SQL migrations instead |
| CSS scoped to component → `body.scrolled` selectors don't apply in production | Use `pageRef` wrapper element for scroll state, not `document.body` |
| Status values written with wrong casing → filter bugs | Always normalise status values to lowercase in DB and map at the API layer |
| Agent redirects to hardcoded ID after save → shows wrong record | Always use the ID returned in the API response for redirects: `router.push(\`/resource/\${data.id}\`)` |
| `deliveries/unassigned` vs `orders?status=Unassigned` → wrong entity type | Always fetch from the correct entity — orders for order context, deliveries for delivery context |

---

## Session Start Prompt

Use this as the first message to Antigravity at the start of every session:

```
You are working on [PROJECT NAME]. 

Before doing anything else:
1. Read this entire document
2. Set your git identity:
   git config user.email "56847p@gmail.com"
   git config user.name "Media7-za"
3. Confirm the current branch: git branch
4. Run: npm run build — confirm it passes before making any changes

Rules:
- Never push to main without my approval
- Always run the build before pushing
- Never truncate files — write complete file content only
- Validate package.json after any changes to it
- Use prisma migrate deploy (not dev) for production migrations
- Never use vercel deploy CLI — use git push instead

Current task: [DESCRIBE WHAT YOU WANT DONE]

Acceptance criteria:
- [ ] [list your criteria here]
```

---

*Template v1.0 — Update this file as new patterns are discovered.*
