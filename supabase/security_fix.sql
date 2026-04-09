-- =============================================================================
-- LPG Stock Recon App — Supabase Security Fix
-- Addresses: rls_disabled_in_public | sensitive_columns_exposed
-- Project: wctctyawxuaqdlsmplbj
-- Date: 2026-04-08
-- =============================================================================
--
-- ARCHITECTURE NOTE:
--   All writes/reads from the app go through Supabase Edge Functions, which use
--   SUPABASE_SERVICE_ROLE_KEY. The service_role key bypasses RLS entirely.
--
--   These policies therefore do NOT affect Edge Functions. Their purpose is to
--   block direct PostgREST API access using the anon key — which is what
--   Supabase is flagging as the vulnerability.
--
-- TABLES IN THIS DATABASE:
--   Operational (Edge Functions):
--     sessions, counts, erp_snapshots, movement_data, reconciliation_pipeline,
--     reconciliation_reports, discrepancy_notes, idempotency_keys, audit_log
--   Prisma schema (if migrated to this project):
--     users, accounts, products, sales_reps, transaction_headers,
--     transaction_line_items, allocation_events, match_decisions,
--     pattern_library, reason_codes, physical_count_sessions, movement_data,
--     erp_snapshots, reconciliation_reports, discrepancy_notes
-- =============================================================================


-- -----------------------------------------------------------------------------
-- STEP 1: Enable Row-Level Security on ALL tables in the public schema
-- This is the primary fix for "rls_disabled_in_public".
-- Safe to run multiple times (ALTER TABLE ... ENABLE RLS is idempotent).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    RAISE NOTICE 'RLS enabled on table: %', t;
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- STEP 2: Revoke all privileges from the anon role on every table.
-- This ensures the public PostgREST endpoint cannot read/write any table,
-- even if RLS is accidentally disabled in the future.
-- Fixes "sensitive_columns_exposed".
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon', t);
    RAISE NOTICE 'Revoked anon access on table: %', t;
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- STEP 3: Grant full access to the authenticated role on all tables.
-- This preserves the ability to use direct Supabase client queries
-- (with a user JWT) for future auth-gated features without breaking writes.
-- Note: service_role bypasses this entirely (no change needed there).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', t);
    RAISE NOTICE 'Granted authenticated access on table: %', t;
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- STEP 4: Drop any stale policies from the previous script run (cleanup).
-- Uses exception handling so it is safe even if a table does not exist yet
-- (e.g. Prisma tables that have not been migrated to this Supabase project).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  stale_policies text[][] := ARRAY[
    ARRAY['users',               'Users can view their own data'],
    ARRAY['users',               'Users can update their own data'],
    ARRAY['accounts',            'Authenticated users can view accounts'],
    ARRAY['transaction_headers', 'Authenticated users can view transactions'],
    ARRAY['transaction_headers', 'Authenticated users can insert transactions']
  ];
  t text;
  pol text[];
BEGIN
  -- Drop named stale policies, but only if the table actually exists
  FOREACH pol SLICE 1 IN ARRAY stale_policies
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = pol[1]
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol[2], pol[1]);
      RAISE NOTICE 'Dropped stale policy "%" on table "%"', pol[2], pol[1];
    ELSE
      RAISE NOTICE 'Skipped stale policy "%" — table "%" does not exist yet', pol[2], pol[1];
    END IF;
  END LOOP;

  -- Drop the old generic catch-all on every table that exists
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON public.%I', t);
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- STEP 5: Create a blanket RLS policy for all tables.
--
-- Policy: authenticated users can do anything; anon gets nothing.
-- This is correct for this app's architecture where:
--   - Edge Functions use service_role (bypasses RLS, no policy needed)
--   - Direct client access (if ever added) requires a logged-in user JWT
--   - Public/anonymous access is never needed for any table
--
-- Both USING and WITH CHECK are set explicitly to avoid implicit defaults.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format(
      'CREATE POLICY "Authenticated full access" ON public.%I
       FOR ALL
       TO authenticated
       USING (true)
       WITH CHECK (true)',
      t
    );
    RAISE NOTICE 'Policy created on table: %', t;
  END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- STEP 6: Verify — list all tables with their RLS status.
-- Run this after the script to confirm everything is correctly configured.
-- Expected: relrowsecurity = true for all rows.
-- -----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
