-- Lock down the delivery-cost domain.
--
-- Found on the live project (oqhpxnaadahohwkslive): the three delivery_*
-- tables had RLS disabled and anon/authenticated held full DML incl.
-- TRUNCATE, so anyone with the public anon key could read, rewrite or wipe
-- governed cost data. These tables are only ever accessed server-side:
-- the pricing Edge Function uses the service role and Prisma connects as
-- the owner; both bypass RLS. So: RLS on, no policies (deny by default for
-- API roles), and revoke the API roles' direct table privileges.
-- Idempotent; safe to re-run.

ALTER TABLE "delivery_vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_vehicle_cost_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "delivery_cost_calculations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "delivery_vehicles", "delivery_vehicle_cost_profiles", "delivery_cost_calculations" FROM anon, authenticated;

-- Explicit server-side access. Do not rely on Supabase default privileges:
-- live currently inherits service_role access from them, and ADM-38 will
-- change defaults for future objects. The calculator (pricing Edge Function)
-- needs to read fleet/profiles and write calculations; nothing more.
-- Role-aware: plain Postgres test databases have no service_role.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE
      ON TABLE "delivery_vehicles", "delivery_vehicle_cost_profiles", "delivery_cost_calculations"
      TO service_role;
  END IF;
END
$$;
