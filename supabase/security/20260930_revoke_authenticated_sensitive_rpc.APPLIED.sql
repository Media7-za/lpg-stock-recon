-- APPLIED to live 2026-09-30 ~17:02 UTC as `revoke_authenticated_sensitive_rpc`. ADM-39.
-- No staff-role model exists (no app_metadata roles; 1 auth user). Until secured server endpoints
-- replace them: PWA allocation (decrement) and Pricing Desk customer context are disabled for clients.
REVOKE EXECUTE ON FUNCTION public.decrement_available_balance(bigint, numeric) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_customer_commercial_context(text) FROM authenticated;
