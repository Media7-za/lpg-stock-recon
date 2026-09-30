-- APPLIED to live 2026-09-30 ~16:57 UTC as migration `revoke_public_anon_rpc_execute`. ADM-39.
-- PWA callers are signed in (authenticated); the pg_cron job runs as postgres.
REVOKE EXECUTE ON FUNCTION public.recompute_solicitation_due_dates() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_available_balance(bigint, numeric) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_customer_commercial_context(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decrement_available_balance(bigint, numeric), public.get_customer_commercial_context(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_solicitation_due_dates(), public.decrement_available_balance(bigint, numeric), public.get_customer_commercial_context(text) TO service_role;
