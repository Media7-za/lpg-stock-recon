-- APPLIED to live (oqhpxnaadahohwkslive) 2026-09-30 ~16:55 UTC as migration
-- `contain_security_definer_views`. ADM-39. Dry-run verified in a rolled-back
-- transaction first. Definitions (md5) and row counts unchanged; see ADM-39.
ALTER VIEW public.vw_clean_transactions SET (security_invoker = true);
ALTER VIEW public.vw_cylinder_ledger SET (security_invoker = true);
ALTER VIEW public.unique_accounts SET (security_invoker = true);
ALTER VIEW public.reconciliation_summary SET (security_invoker = true);
ALTER VIEW public.dispatch_eligible_invoices SET (security_invoker = true);
ALTER VIEW public.commercial_customer_last_order SET (security_invoker = true);
REVOKE ALL ON public.vw_clean_transactions, public.vw_cylinder_ledger, public.unique_accounts, public.reconciliation_summary, public.dispatch_eligible_invoices, public.commercial_customer_last_order FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.vw_clean_transactions, public.vw_cylinder_ledger, public.unique_accounts, public.reconciliation_summary, public.dispatch_eligible_invoices, public.commercial_customer_last_order TO service_role;

-- ROLLBACK (emergency only; reopens the exposure — prefer a governed authenticated/server path):
--   ALTER VIEW ... RESET (security_invoker);
--   GRANT ALL ON <view> TO anon, authenticated;   -- original ACL was arwdDxtm for anon/authenticated/service_role
