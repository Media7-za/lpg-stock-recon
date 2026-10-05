-- Isolated-test setup ONLY. Never run against a shared, staging or production database.
-- Marks a disposable database as safe for scripts/deliveryCostAcceptance.ts.
-- The script refuses to run unless this marker exists AND the database name matches
-- ^delivery_cost_acceptance_[a-z0-9_]+$ AND ACCEPTANCE_ISOLATED_DB=1.
--
--   createdb delivery_cost_acceptance_local
--   DATABASE_URL=…/delivery_cost_acceptance_local npx prisma migrate deploy
--   psql …/delivery_cost_acceptance_local -f scripts/acceptance/create_isolation_marker.sql
--   ACCEPTANCE_ISOLATED_DB=1 DATABASE_URL=… npx tsx scripts/deliveryCostAcceptance.ts
DO $$
BEGIN
  IF current_database() !~ '^delivery_cost_acceptance_[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Refusing to mark database "%" as isolated: name must match delivery_cost_acceptance_*', current_database();
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public._delivery_cost_acceptance_isolation_marker (
  marker text PRIMARY KEY CHECK (marker = 'delivery-cost-acceptance-isolated-v1'),
  database_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public._delivery_cost_acceptance_isolation_marker (marker, database_name)
VALUES ('delivery-cost-acceptance-isolated-v1', current_database())
ON CONFLICT (marker) DO NOTHING;
