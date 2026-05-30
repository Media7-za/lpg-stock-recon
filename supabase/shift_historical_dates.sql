-- shift_historical_dates.sql
-- Corrects the timezone offset bug by shifting existing transaction dates forward by 1 day.

BEGIN;

-- 1. Update transaction_headers
UPDATE transaction_headers 
SET tx_date = tx_date + INTERVAL '1 day';

-- 2. Update transaction_items
UPDATE transaction_items 
SET tx_date = tx_date + INTERVAL '1 day';

COMMIT;
