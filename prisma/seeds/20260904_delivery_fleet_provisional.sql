-- OPERATIONAL SEED DATA, not a migration.
--
-- On live (oqhpxnaadahohwkslive) these rows were inserted on 2026-09-04 via a separate
-- SQL statement (Supabase execute_sql). The migration `add_delivery_cost_calculator` did not
-- create them, and no migration history records them. They are kept here so fresh environments
-- (local, staging, acceptance tests) can reproduce the same provisional fleet data.
-- Idempotent (ON CONFLICT DO NOTHING). Apply AFTER `prisma migrate deploy`:
--   psql "$DATABASE_URL" -f prisma/seeds/20260904_delivery_fleet_provisional.sql
--
-- Governed seed data
--
-- These are the only two vehicles the Pricing Desk has historically priced
-- deliveries with. Their cost profiles are seeded as PROVISIONAL, sourced
-- from the pre-004A shadow rate the Pricing Desk app already used
-- (CS70HKZN = R3.66/km, CS70HMZN = R5.67/km). Labour hourly rates are left
-- NULL: they have never been formally governed, so the calculator falls
-- back to an explicitly-flagged assumption at calculation time rather than
-- this seed inventing a number. CS70HMZN's payload is left NULL for the
-- same reason — it has never been confirmed — so the recommendation engine
-- will not silently select it until that figure is governed and an
-- operator supplies it via vehicle.override_payload_kg or a data update.
-- ============================================================================

INSERT INTO "delivery_vehicles"
  ("id", "registration", "vehicle_type", "active_status", "recommended_payload_kg", "maximum_payload_kg", "driver_count", "assistant_count", "governed_status", "effective_from", "created_at", "updated_at")
VALUES
  ('veh_cs70hkzn', 'CS70HKZN', 'rigid_body_small', 'active', 500, NULL, 1, 1, 'governed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('veh_cs70hmzn', 'CS70HMZN', 'rigid_body_large', 'active', NULL, NULL, 1, 1, 'governed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("registration") DO NOTHING;

INSERT INTO "delivery_vehicle_cost_profiles"
  ("id", "vehicle_id", "profile_code", "status", "source", "total_running_cost_per_km", "driver_hourly_rate", "assistant_hourly_rate", "effective_from", "created_at", "updated_at")
VALUES
  ('vcp_cs70hkzn_prov_2026_09', 'veh_cs70hkzn', 'VCP-2026-09-CS70HKZN-PROV', 'PROVISIONAL', 'legacy_pricing_desk_rate', 3.66, NULL, NULL, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vcp_cs70hmzn_prov_2026_09', 'veh_cs70hmzn', 'VCP-2026-09-CS70HMZN-PROV', 'PROVISIONAL', 'legacy_pricing_desk_rate', 5.67, NULL, NULL, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("profile_code") DO NOTHING;
