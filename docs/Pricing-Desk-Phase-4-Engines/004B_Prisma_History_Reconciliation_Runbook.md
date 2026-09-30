# 004B: Prisma migration-history reconciliation runbook (live: oqhpxnaadahohwkslive)

**Status:** verified 2026-09-30 by read-only checks and a full local rehearsal. **Not yet run against live.**
Needs `DATABASE_URL`/`DIRECT_URL` for live. The agent session has no DB credentials and no `*.supabase.co` egress,
so an operator runs it.

## 1. Enumeration (all directories, not just the calculator ones)
| prisma/migrations/ | repo sha256 (12) | live `_prisma_migrations` | action |
|---|---|---|---|
| 20260408180513_init_postgresql | 4acdc4e65094 | present, checksum 4acdc4e65094 ✔ | none |
| 20260904_add_delivery_cost_calculator | c787274bb390 | **absent** | resolve --applied |
| 20260930_delivery_cost_rls_lockdown | 4f5d0a968f17 | **absent** | resolve --applied |
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
Only difference: live `service_role` has table privileges from Supabase **default privileges**, not from these migrations.

**Seed data:** the provisional fleet rows (2 vehicles, 2 PROVISIONAL cost profiles) were inserted on live by a
separate SQL statement. They are **operational seed data, not migration-created**. So they were moved out of the
migration into `prisma/seeds/20260904_delivery_fleet_provisional.sql`, and the migration file now contains exactly
what the live migration did. `scripts/deliveryCostAcceptance.ts` applies the seed idempotently.

## 3. Procedure (run in this order; stop on any surprise)
```bash
# a) capture before-state
psql "$DIRECT_URL" -Atc "select migration_name, checksum, finished_at, rolled_back_at from _prisma_migrations order by started_at" > prisma_history_before.txt
npx prisma migrate status            # expect exactly the 2 calculator migrations pending
# b) record without executing, chronological
npx prisma migrate resolve --applied 20260904_add_delivery_cost_calculator
npx prisma migrate resolve --applied 20260930_delivery_cost_rls_lockdown
# c) verify
npx prisma migrate status            # expect "Database schema is up to date!"
psql "$DIRECT_URL" -Atc "select migration_name, left(checksum,12) from _prisma_migrations order by started_at"
#    expect checksums c787274bb390 / 4f5d0a968f17 (= sha256 of the files in this PR)
```
**Do not run `prisma migrate deploy` until `status` shows no unexpected pending migrations.** If `status` lists anything
other than the two calculator migrations, stop.

## 4. Rehearsal evidence (local, 2026-09-30)
Built a DB in live's state (Prisma history = init only; calculator DDL + lockdown + seed applied out of band), then:
- status before: 2 pending (exactly the calculator migrations)
- resolve both: `marked as applied`, recorded checksums c787274bb390 / 4f5d0a968f17, applied_steps_count 0 (nothing executed)
- status after: up to date. `migrate deploy`: "No pending migrations to apply". Data unchanged (2 vehicles).
- Separately: fresh DB → `migrate deploy` (0 vehicles, seed not in migration) → acceptance script (seeds) → **29/29 passed**.

## Caution
The checksums depend on the exact file bytes. Any edit to either migration file after this point changes the checksum.
Re-verify the sha256 values before resolving.
