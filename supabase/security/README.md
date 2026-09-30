# Supabase security changes (project oqhpxnaadahohwkslive)

**Do not replay these files blindly.** Several are already applied to live via the Supabase
migrations API. Check `list_migrations` before running anything.

| File | Status | Live migration name / time (UTC) |
|---|---|---|
| (in PR #29) `prisma/migrations/20260930_delivery_cost_rls_lockdown` | **APPLIED** | `delivery_cost_rls_lockdown`, 2026-09-30 |
| `20260930_contain_security_definer_views.APPLIED.sql` | **APPLIED** | `contain_security_definer_views`, 2026-09-30 16:55 |
| `20260930_revoke_public_anon_rpc_execute.APPLIED.sql` | **APPLIED** | `revoke_public_anon_rpc_execute`, 2026-09-30 ~16:57 |
| `20260930_revoke_authenticated_sensitive_rpc.APPLIED.sql` | **APPLIED** | `revoke_authenticated_sensitive_rpc`, 2026-09-30 ~17:02 |
| `20260930_default_privileges_lockdown.sql` | PROPOSED, not applied (ADM-38) | — |
| `20260930_function_search_path.PROPOSED.sql` | PROPOSED, not applied (ADM-39) | — |

APPLIED files are records only. All statements are idempotent, but re-running them is unnecessary.
