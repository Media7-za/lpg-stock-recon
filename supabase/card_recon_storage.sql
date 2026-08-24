-- =============================================================================
-- LPG Stock Recon App — Card Recon Storage Bucket
-- Run this in the Supabase SQL Editor ONCE after the card_recon_foundation
-- Prisma migration has been applied (prisma migrate deploy).
-- Docs: docs/Card-Recon/Slice_Brief.md, Dev_Plan.md
-- Mirrors the existing invoice-documents bucket pattern (see
-- supabase/deploy_all.sql section 6) — same RLS shape, new bucket id.
-- =============================================================================

-- Bucket for receipt images/scans attached to CardCaptureRequest and
-- CardLedgerEntry. Public read (receipt images are referenced by URL in
-- the app UI, same as invoice-documents), authenticated write.
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-receipts', 'card-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Cardholders can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-receipts');

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'card-receipts');

CREATE POLICY "Managers can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-receipts' AND (auth.jwt() ->> 'role') = 'Depot Manager');
