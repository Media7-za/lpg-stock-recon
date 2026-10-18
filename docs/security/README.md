# Security SQL: applied evidence (project oqhpxnaadahohwkslive)

Nothing in `docs/` is executed by any tool. This location is deliberate.

## How migrations reach this project (verified 2026-09-30)
- **No CI migration pipeline.** `.github/workflows/` contains only `deploy-pages.yml` (GitHub Pages).
- **No Supabase CLI project.** There is no `supabase/config.toml` and no `supabase/migrations/`, so `supabase db push` discovers nothing.
  Live changes were applied through the Supabase migrations API. That API records them in
  `supabase_migrations.schema_migrations` (the versions below).
- **Prisma** auto-discovers `prisma/migrations/*` only when someone runs `prisma migrate` manually.
  Live `_prisma_migrations` contains only `20260408180513_init_postgresql`. See the Prisma warning below.

## Applied to live (evidence only, do NOT re-run)
| Live version | Name | File |
|---|---|---|
| 20260904081421 | add_delivery_cost_calculator | PR #29 `prisma/migrations/20260904_add_delivery_cost_calculator` |
| 20260930151158 | delivery_cost_rls_lockdown | PR #29 `prisma/migrations/20260930_delivery_cost_rls_lockdown` |
| 20260930165542 | contain_security_definer_views | `incidents/2026-09-30-ADM-39/20260930165542_…` |
| 20260930165720 | revoke_public_anon_rpc_execute | `incidents/2026-09-30-ADM-39/20260930165720_…` |
| 20260930170154 | revoke_authenticated_sensitive_rpc | `incidents/2026-09-30-ADM-39/20260930170154_…` |

Incident files are named with their exact live version. If a Supabase CLI migrations directory is ever introduced,
baseline it with `supabase db pull`, or run `supabase migration repair --status applied <version>` for each version.
Do not copy these files in as new migrations.

## Prisma replay risk (belongs to PR #29, gate 4)
The two calculator migrations exist in `prisma/migrations/` but are **not** in live `_prisma_migrations`. Running
`prisma migrate deploy` against live would try to create objects that already exist. Before PR #29 is used against
live, record them as applied, without executing them: run `prisma migrate resolve --applied <migration_name>`.
This writes the correct checksum. Note: the live seed rows were inserted separately and are not part of any migration.

## Other security work
Later applied containment and any open hardening items are tracked privately (Linear), not in this repository.
Do not add descriptions of unremediated weaknesses here; commit SQL only once it is applied and the object is secured.
