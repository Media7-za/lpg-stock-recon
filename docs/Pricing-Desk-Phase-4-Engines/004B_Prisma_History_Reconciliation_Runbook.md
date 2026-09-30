# 004B: Prisma migration-history reconciliation runbook (live: oqhpxnaadahohwkslive)

**Status:** verified 2026-09-30 by read-only checks and a full local rehearsal (re-run after the service_role grant change). **Not yet run against live.** Run it during a controlled change window.
Needs `DATABASE_URL`/`DIRECT_URL` for live. The agent session has no DB credentials and no `*.supabase.co` egress,
so an operator runs it.

## 1. Enumeration (all directories, not just the calculator ones)
| prisma/migrations/ | repo sha256 (12) | live `_prisma_migrations` | action |
|---|---|---|---|
| 20260408180513_init_postgresql | 4acdc4e65094 | present, checksum 4acdc4e65094 ✔ | none |
| 20260904_add_delivery_cost_calculator | c787274bb390 | **absent** | resolve --applied |
| 20260930_delivery_cost_rls_lockdown | 7e612183c650 | **absent** | run its grant block, then resolve --applied |
Nothing else is pending. `main` has only the init migration.

## 2. Live state vs migration contents (verified identical)
Applied repo migrations (init + calculator DDL + lockdown) to a clean Postgres and fingerprinted the three
`delivery_*` tables with the same catalog query on both sides. All five fingerprints are identical:
| part | md5 |
|---|---|
| columns (type/precision/nullability/default) | 8e95623785eab8f0ef297a04620744f1 |
| indexes | 759bdbddac6a46bb1ed673833533d815 |
| constraints (PK/FK incl. ON DELETE/UPDATE) | 25b2bd7fba04bc35296d854b7dd51036 |
| enums | 8f5ed49e489d9cdd8e4aab5ce99fe0fe |
| RLS on, 0 policies, anon/authenticated no privileges | 24ad7cc0930b9bb0042a2205b2d2b9fb |
Only difference: live `service_role` got its table privileges from Supabase **default privileges** at creation time.
The lockdown migration now **encodes service_role access explicitly**: `GRANT SELECT, INSERT, UPDATE, DELETE … TO service_role`.
It is role-aware (skipped where no `service_role` exists, e.g. plain Postgres), so the intended permissions no longer depend on
defaults, which ADM-38 will change. Live `service_role` currently holds more than this: `arwdDxtm`, i.e. also TRUNCATE, REFERENCES
and TRIGGER, inherited from defaults. Tightening that is optional and out of scope here. Track it under ADM-38.

**Seed data:** the provisional fleet rows (2 vehicles, 2 PROVISIONAL cost profiles) were inserted on live by a
separate SQL statement. They are **operational seed data, not migration-created**. So they were moved out of the
migration into `prisma/seeds/20260904_delivery_fleet_provisional.sql`, and the migration file now contains exactly
what the live migration did. `scripts/deliveryCostAcceptance.ts` applies the seed idempotently.

## 3. Procedure (controlled change window; run in this order; stop on any surprise)
```bash
# a) capture before-state
psql "$DIRECT_URL" -Atc "select migration_name, checksum, finished_at, rolled_back_at from _prisma_migrations order by started_at" > prisma_history_before.txt
npx prisma migrate status            # expect exactly the 2 calculator migrations pending, nothing else
sha256sum prisma/migrations/2*/migration.sql   # expect c787274bb390… and 7e612183c650… for the two calculator migrations
# b) live ran the lockdown BEFORE the explicit grant was added. Execute that grant block now so the file's
#    content is literally true on live. Idempotent: service_role already holds these privileges, so there is no effect.
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -c 'DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '"'"'service_role'"'"') THEN GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "delivery_vehicles", "delivery_vehicle_cost_profiles", "delivery_cost_calculations" TO service_role; END IF; END $$;'
psql "$DIRECT_URL" -Atc "select bool_and(has_table_privilege('service_role',('public.'||t)::regclass,'SELECT,INSERT,UPDATE,DELETE')) from unnest(array['delivery_vehicles','delivery_vehicle_cost_profiles','delivery_cost_calculations']) t"   # expect t
# c) record without executing, chronological
npx prisma migrate resolve --applied 20260904_add_delivery_cost_calculator
npx prisma migrate resolve --applied 20260930_delivery_cost_rls_lockdown
# d) verify
npx prisma migrate status            # expect "Database schema is up to date!"
psql "$DIRECT_URL" -Atc "select migration_name, left(checksum,12), applied_steps_count from _prisma_migrations order by started_at"
#    expect c787274bb390 / 7e612183c650, applied_steps_count 0
```
**Do not run `prisma migrate deploy` until `status` shows no unexpected pending migrations.** If `status` lists anything
other than the two calculator migrations, stop. Do **not** run `scripts/deliveryCostAcceptance.ts` against live. It refuses
Supabase hosts, and it needs `ACCEPTANCE_ISOLATED_DB=1`.

## 4. Rehearsal evidence (local, 2026-09-30, re-run after the grant change)
Built a DB in live's exact state: Prisma history = init only; calculator DDL + the **as-applied (pre-grant)** lockdown +
operational seed + Supabase-style `service_role` ALL applied out of band. Then:
- status before: exactly the 2 calculator migrations pending
- service_role DML check: `t`
- resolve both: `marked as applied`, recorded checksums c787274bb390 / 7e612183c650, applied_steps_count 0 (nothing executed)
- status after: up to date. `migrate deploy`: "No pending migrations to apply". Data unchanged (2 vehicles).

Fresh-DB checks:
- plain Postgres **without** `service_role`: `migrate deploy` succeeds (the grant is skipped)
- Supabase-like DB **with** `service_role`: `migrate deploy` → service_role has SELECT/INSERT/UPDATE/DELETE, **no** TRUNCATE;
  anon has none; RLS on; 0 vehicles (seed not in migration)
- `ACCEPTANCE_ISOLATED_DB=1` acceptance → **32/32 passed** (29 scenarios + stored-row byte-identity, cleanup completeness,
  real-fleet fingerprint unchanged `d0b7e8ba…` → `d0b7e8ba…`)
- Guard: refuses without the flag (exit 2), and refuses `*.pooler.supabase.com`, `db.<ref>.supabase.co`, any Supabase
  `DIRECT_URL`, even with the flag
- Seed re-run over a governed value (4.10, PUBLISHED) left it unchanged: insert-only, `ON CONFLICT DO NOTHING`

## Caution
The checksums depend on the exact file bytes. Any edit to either migration file after this point changes the checksum.
Re-verify the sha256 values before resolving.
