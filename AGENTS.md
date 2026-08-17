# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`lpg-stock-recon-app` is a React 18 + TypeScript PWA (Vite) for LPG cylinder stock
reconciliation. The core app runs **fully standalone against in-browser IndexedDB
(Dexie)** — no backend is required to run, develop, or test the primary flows. Sample
ERP data and a count session are seeded automatically on first load.

### Running / testing (standard commands live in `package.json` + `README.md`)
- Dev server: `npm run dev` → http://localhost:5173 (this is the only service needed for core flows).
- Unit tests: `npm test` (Vitest, jsdom).
- E2E tests: `npm run test:e2e` (Playwright, Mobile Chrome; auto-starts the dev server on 5173).
- Lint: `npm run lint`.
- Build (prod check): `npm run build`.

### Non-obvious gotchas
- **Login without a backend:** The login screen (`src/components/auth/LoginScreen.tsx`) has a
  "Dev Bypass Options" panel — click a role (e.g. `Depot Manager`) to log in locally. This
  stores `bypass_auth_role` in `localStorage`; no Supabase/email login is needed.
- **`npm run lint` currently reports pre-existing errors** (mostly `@typescript-eslint/no-explicit-any`)
  and fails under `--max-warnings 0`. These are not caused by env setup; the lint tooling itself works.
- **Supabase / Prisma / Whapi are optional cloud layers**, only needed for cloud sync, server-side
  reconciliation, the audit dashboard, and WhatsApp invoice dispatch. `src/lib/supabase.ts` disables
  cloud sync gracefully when `VITE_SUPABASE_*` env vars are absent (`isCloudEnabled = false`).
  Copy `.env.example` → `.env` and fill values only if you need those features (requires a remote
  Supabase project; there is no local `supabase start` config).
- **`postinstall` runs `prisma generate`** against `prisma/schema.prisma` (PostgreSQL provider). It
  does not need a live DB connection to generate the client, so `npm install` succeeds with no `.env`.
- **`analysis/debtors/**` `debtors:*` scripts** are file-based Node CLIs (analyst tooling), not a web
  service; a few report scripts under `analysis/` use Python.
