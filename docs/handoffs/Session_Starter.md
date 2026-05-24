# Session Starter Guide

Welcome! Use this guide to quickly start a new agent session when running in the Claude.ai browser interface (or any non-local workspace environment).

## Repository Clone Command

Run the following command in your terminal to clone the repository with a GitHub Personal Access Token (PAT):

```bash
git clone https://[PAT]@github.com/Media7-za/lpg-stock-recon.git /home/claude/lpg-stock-recon
```

Generate a fresh PAT at: github.com → Settings → Developer settings →
Personal access tokens → Contents: Read only → Expiry: 1 day
Paste it in place of `[PAT]`. Rotate it after the session.

## Post-Clone Steps

1. **Navigate to the Repository:**
   ```bash
   cd /home/claude/lpg-stock-recon
   ```
2. **Set Git Identity:**
   ```bash
   git config user.email "56847p@gmail.com"
   git config user.name "Media7-za"
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Access Role Prompts:**
   Read `docs/session_prompts.md` to locate the relevant starter prompt for your role.
5. **Verify Environment Configuration:**
   Ensure `.env` (database) and Vercel environment variables are confirmed before making any changes.

## Project Quick Reference

| Detail | Value |
|---|---|
| **Live App** | https://lpg-stock-recon.vercel.app |
| **Jira Project** | LSR |
| **Supabase Ref** | movixifclapeprdemgwk (eu-west-2) |
| **Git Email** | 56847p@gmail.com |
| **Deploy Trigger** | git push origin main (Vercel auto-deploys) |
| **Framework** | React 18 + Vite, Tailwind CSS v3, Prisma v6 |

## Non-Negotiable Rules for Every Session

- Never push directly to `main` without PM approval
- Always run `npm run build` before pushing — never push a broken build
- Never truncate or partially overwrite files — always write complete file content
- Use `prisma migrate deploy` (not `prisma migrate dev`) against production
- Never use `vercel deploy` CLI — use `git push origin main` only
- Validate `package.json` after any edits: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"`

