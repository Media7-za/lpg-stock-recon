-- PROPOSED — NOT APPLIED. ADM-39 follow-up: fixed search_path on all 8 public/private functions.
-- Audit (2026-09-30):
--   already fully qualified / no object refs -> ALTER only:
--     private.enforce_one_active_bank_statement, private.enforce_recon_run_bank_statement_uniqueness,
--     private.prevent_source_hash_update, public.enforce_cdr_immutability
--   unqualified refs -> rewritten with public.* qualification, then search_path = '':
--     public.decrement_available_balance      (transaction_headers)
--     public.get_customer_commercial_context  (commercial_customer_accounts, commercial_customers,
--                                              transaction_items, transaction_headers, product_classification_rules)
--     public.recompute_solicitation_due_dates (solicitation_queue, commercial_customers, commercial_customer_last_order)
--     public.set_cdr_decision_code            (nextval('commercial_decision_seq'))
-- CREATE OR REPLACE preserves owner and grants. Bodies otherwise byte-for-byte identical in logic.
-- Tested in a forced-rollback transaction (see ADM-39) before any apply.

ALTER FUNCTION private.enforce_one_active_bank_statement() SET search_path = '';
ALTER FUNCTION private.enforce_recon_run_bank_statement_uniqueness() SET search_path = '';
ALTER FUNCTION private.prevent_source_hash_update() SET search_path = '';
ALTER FUNCTION public.enforce_cdr_immutability() SET search_path = '';

CREATE OR REPLACE FUNCTION public.decrement_available_balance(doc_id bigint, amount_to_dec numeric)
 RETURNS void LANGUAGE plpgsql SET search_path = ''
AS $function$
BEGIN
    UPDATE public.transaction_headers
    SET available_balance = available_balance - amount_to_dec
    WHERE id = doc_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_cdr_decision_code()
 RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $function$
BEGIN
  IF NEW.decision_code IS NULL THEN
    NEW.decision_code := 'CDR-' || to_char(now(), 'YYYY') || '-' ||
                          lpad(nextval('public.commercial_decision_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recompute_solicitation_due_dates()
 RETURNS integer LANGUAGE plpgsql SET search_path = ''
AS $function$
declare
  affected integer;
begin
  with drifted as (
    update public.solicitation_queue sq
    set predicted_due_date = (ccl.last_lpg_order_date + (cc.avg_cycle_days || ' days')::interval)::date,
        updated_at = now()
    from public.commercial_customers cc
    join public.commercial_customer_last_order ccl on ccl.commercial_customer_id = cc.id
    where sq.commercial_customer_id = cc.id
      and sq.status = 'PENDING'
      and ccl.last_lpg_order_date > sq.updated_at::date
    returning sq.id
  )
  select count(*) into affected from drifted;
  return affected;
end;
$function$;

-- get_customer_commercial_context: identical body to live except the 9 FROM/JOIN table
-- references are qualified with public. and SET search_path = '' is added. Generated from
-- the live definition (pg_get_functiondef) with:
--   regexp_replace(def, '\m(FROM|JOIN)(\s+)(commercial_customer_accounts|commercial_customers|
--     transaction_items|transaction_headers|product_classification_rules)\M', '\1\2public.\3', 'g')
-- Apply by running that transformation on the live definition at apply time (the body is
-- ~150 lines; kept out of this file to avoid a hand-copied divergence).
--
-- Dry-run 2026-09-30 (forced rollback, live): grants preserved; 8/8 fixed search_path;
-- customer_context JSON identical before/after for a real account (excluding refreshed_at)
-- under a hostile caller search_path; decrement, recompute OK; bank_statements and
-- recon_runs triggers fired OK on real rows. NOT exercised: enforce_cdr_immutability and
-- set_cdr_decision_code (commercial_decision_records has 0 rows; set_cdr runs on INSERT and
-- would consume a non-transactional sequence value) -> test those on a branch/staging DB.
