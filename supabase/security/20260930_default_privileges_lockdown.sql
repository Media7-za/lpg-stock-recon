-- Project-wide: stop NEW public-schema objects inheriting client (anon/authenticated) access.
-- STATUS: PROPOSED, NOT APPLIED. Dry-run verified on live inside a rolled-back
-- transaction (2026-09-30); see ADM-38. Affects only objects created AFTER it runs.
--
-- Scope limits, verified:
--  * Only role `postgres` is changeable by the migration role. Defaults owned by
--    `supabase_admin` (and other Supabase-internal roles) CANNOT be altered here
--    ("permission denied to change default privileges") -> residual risk; tables
--    created as supabase_admin in public still inherit. Raise with Supabase / avoid
--    creating app objects as that role.
--  * `service_role` is deliberately left untouched (server-side paths keep working).
--  * Existing objects are NOT changed by this file (separate audit: ADM-35/ADM-39).
--
-- Gotcha proven in dry-run: `... IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`
-- does NOT remove the built-in PUBLIC execute default; the GLOBAL form (no IN SCHEMA) is required.
-- The global form also applies to functions `postgres` creates in other schemas.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Convention for all future migrations: ENABLE ROW LEVEL SECURITY on every new table and
-- GRANT only the minimum explicit privileges (to specific roles) that the feature needs.

-- Post-apply verification (do not infer success from the ALTERs completing): in a
-- transaction, create a table, sequence and function as postgres in public and assert
-- anon/authenticated/PUBLIC have no privileges while service_role does; then roll back.
