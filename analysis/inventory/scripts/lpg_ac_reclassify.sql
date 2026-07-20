-- =============================================================================
-- LPG AC Reclassification Migration
-- Moves 57 accessory SKUs from AGR/LPG AC → FIT/ACC
-- Generated: 2026-07-17
-- Run in Supabase SQL Editor. Review PREVIEW section before COMMIT.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. PREVIEW (run standalone first if desired)
-- -----------------------------------------------------------------------------
-- SELECT stock_no, MAX(description), COUNT(*)::int
-- FROM transaction_items
-- WHERE category = 'AGR' AND product_group = 'LPG AC'
-- GROUP BY stock_no
-- ORDER BY stock_no;

-- Expected: 57 distinct SKUs, 652 transaction lines

-- -----------------------------------------------------------------------------
-- 2. RECLASSIFY transaction_items
-- -----------------------------------------------------------------------------
UPDATE transaction_items
SET
  category      = 'FIT',
  product_group = 'ACC'
WHERE category = 'AGR'
  AND product_group = 'LPG AC';

-- -----------------------------------------------------------------------------
-- 3. REGISTER item_classifications (LPG_ACCESSORY / Accessory)
-- -----------------------------------------------------------------------------
INSERT INTO item_classifications (stock_no, business_bucket, logical_group)
VALUES
  ('00000304', 'LPG_ACCESSORY', 'Accessory'),
  ('00000236', 'LPG_ACCESSORY', 'Accessory'),
  ('00000266', 'LPG_ACCESSORY', 'Accessory'),
  ('00000306', 'LPG_ACCESSORY', 'Accessory'),
  ('00000245', 'LPG_ACCESSORY', 'Accessory'),
  ('00000274', 'LPG_ACCESSORY', 'Accessory'),
  ('00000267', 'LPG_ACCESSORY', 'Accessory'),
  ('00000246', 'LPG_ACCESSORY', 'Accessory'),
  ('00000305', 'LPG_ACCESSORY', 'Accessory'),
  ('00000251', 'LPG_ACCESSORY', 'Accessory'),
  ('00000277', 'LPG_ACCESSORY', 'Accessory'),
  ('00000243', 'LPG_ACCESSORY', 'Accessory'),
  ('00000263', 'LPG_ACCESSORY', 'Accessory'),
  ('00000271', 'LPG_ACCESSORY', 'Accessory'),
  ('00000264', 'LPG_ACCESSORY', 'Accessory'),
  ('00000262', 'LPG_ACCESSORY', 'Accessory'),
  ('00000242', 'LPG_ACCESSORY', 'Accessory'),
  ('00000249', 'LPG_ACCESSORY', 'Accessory'),
  ('00000237', 'LPG_ACCESSORY', 'Accessory'),
  ('00000268', 'LPG_ACCESSORY', 'Accessory'),
  ('00000269', 'LPG_ACCESSORY', 'Accessory'),
  ('00000252', 'LPG_ACCESSORY', 'Accessory'),
  ('00000239', 'LPG_ACCESSORY', 'Accessory'),
  ('00000253', 'LPG_ACCESSORY', 'Accessory'),
  ('00000270', 'LPG_ACCESSORY', 'Accessory'),
  ('00000244', 'LPG_ACCESSORY', 'Accessory'),
  ('00000260', 'LPG_ACCESSORY', 'Accessory'),
  ('00000240', 'LPG_ACCESSORY', 'Accessory'),
  ('00000238', 'LPG_ACCESSORY', 'Accessory'),
  ('00000265', 'LPG_ACCESSORY', 'Accessory'),
  ('00000232', 'LPG_ACCESSORY', 'Accessory'),
  ('00000256', 'LPG_ACCESSORY', 'Accessory'),
  ('00000247', 'LPG_ACCESSORY', 'Accessory'),
  ('00000233', 'LPG_ACCESSORY', 'Accessory'),
  ('00000278', 'LPG_ACCESSORY', 'Accessory'),
  ('00000259', 'LPG_ACCESSORY', 'Accessory'),
  ('00000255', 'LPG_ACCESSORY', 'Accessory'),
  ('00000235', 'LPG_ACCESSORY', 'Accessory'),
  ('00000276', 'LPG_ACCESSORY', 'Accessory'),
  ('00000317', 'LPG_ACCESSORY', 'Accessory'),
  ('00000248', 'LPG_ACCESSORY', 'Accessory'),
  ('00000241', 'LPG_ACCESSORY', 'Accessory'),
  ('00000129', 'LPG_ACCESSORY', 'Accessory'),
  ('00000257', 'LPG_ACCESSORY', 'Accessory'),
  ('00000300', 'LPG_ACCESSORY', 'Accessory'),
  ('00000258', 'LPG_ACCESSORY', 'Accessory'),
  ('00000113', 'LPG_ACCESSORY', 'Accessory'),
  ('00000234', 'LPG_ACCESSORY', 'Accessory'),
  ('00000254', 'LPG_ACCESSORY', 'Accessory'),
  ('00000279', 'LPG_ACCESSORY', 'Accessory'),
  ('00000299', 'LPG_ACCESSORY', 'Accessory'),
  ('00000250', 'LPG_ACCESSORY', 'Accessory'),
  ('00000301', 'LPG_ACCESSORY', 'Accessory'),
  ('00000272', 'LPG_ACCESSORY', 'Accessory'),
  ('00000273', 'LPG_ACCESSORY', 'Accessory'),
  ('00000261', 'LPG_ACCESSORY', 'Accessory'),
  ('00000275', 'LPG_ACCESSORY', 'Accessory')
ON CONFLICT (stock_no) DO UPDATE
SET
  business_bucket = EXCLUDED.business_bucket,
  logical_group   = EXCLUDED.logical_group;

-- -----------------------------------------------------------------------------
-- 4. VERIFY
-- -----------------------------------------------------------------------------
-- Should return 0 rows:
-- SELECT COUNT(*) FROM transaction_items WHERE category='AGR' AND product_group='LPG AC';

-- Should return 652:
-- SELECT COUNT(*) FROM transaction_items WHERE category='FIT' AND product_group='ACC'
--   AND stock_no IN ('00000304',    '00000236',    '00000266',);

-- Should return 57:
-- SELECT COUNT(*) FROM item_classifications WHERE business_bucket='LPG_ACCESSORY';

COMMIT;

-- -----------------------------------------------------------------------------
-- 5. ROLLBACK TEMPLATE (if needed)
-- -----------------------------------------------------------------------------
-- BEGIN;
-- UPDATE transaction_items SET category='AGR', product_group='LPG AC'
-- WHERE stock_no IN (
--     '00000304',
    '00000236',
    '00000266',
    '00000306',
    '00000245',
    '00000274',
    '00000267',
    '00000246',
    '00000305',
    '00000251',
    '00000277',
    '00000243',
    '00000263',
    '00000271',
    '00000264',
    '00000262',
    '00000242',
    '00000249',
    '00000237',
    '00000268',
    '00000269',
    '00000252',
    '00000239',
    '00000253',
    '00000270',
    '00000244',
    '00000260',
    '00000240',
    '00000238',
    '00000265',
    '00000232',
    '00000256',
    '00000247',
    '00000233',
    '00000278',
    '00000259',
    '00000255',
    '00000235',
    '00000276',
    '00000317',
    '00000248',
    '00000241',
    '00000129',
    '00000257',
    '00000300',
    '00000258',
    '00000113',
    '00000234',
    '00000254',
    '00000279',
    '00000299',
    '00000250',
    '00000301',
    '00000272',
    '00000273',
    '00000261',
    '00000275'
-- );
-- DELETE FROM item_classifications WHERE business_bucket='LPG_ACCESSORY';
-- COMMIT;
