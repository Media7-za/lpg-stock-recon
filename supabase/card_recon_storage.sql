-- =============================================================================
-- LPG Stock Recon App — Card Recon Storage Bucket
-- Run this in the Supabase SQL Editor ONCE after the card_recon_foundation
-- Prisma migration has been applied (prisma migrate deploy).
-- Docs: docs/Card-Recon/Slice_Brief.md, Dev_Plan.md
-- Deliberately DOES NOT mirror the invoice-documents bucket's public=true
-- setting (see supabase/deploy_all.sql section 6) — FR-CCR-RECEIPT-001
-- requires receipt evidence NOT be publicly accessible without
-- authorization. A public bucket serves objects by direct URL to anyone
-- who has the URL, regardless of the SELECT RLS policy below, so this
-- bucket is private: access requires either an authenticated Supabase
-- client session or a short-lived signed URL
-- (supabase.storage.from('card-receipts').createSignedUrl(path, ttl)).
-- The app must never store or display a permanent public URL for a
-- receipt — see cardReconService.ts's getReceiptSignedUrl() in the Dev
-- Plan's service layer section.
-- =============================================================================

-- Bucket for receipt evidence (processed JPEG images or PDFs) attached to
-- CardCaptureRequest and CardLedgerEntry. Private — see note above.
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-receipts', 'card-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Cardholders can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-receipts');

-- Authenticated read is still required even on a private bucket: it's
-- what makes an authenticated client session (not just a signed URL)
-- able to fetch the object. Signed URLs generated via createSignedUrl()
-- work independently of this policy — they carry their own time-limited
-- token and don't require the caller to be authenticated at all, which
-- is why the storage path itself must stay non-guessable (see the
-- unique-path requirement in the Dev Plan) rather than relying on RLS
-- alone for signed-URL access.
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'card-receipts');

CREATE POLICY "Managers can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'card-receipts' AND (auth.jwt() ->> 'role') = 'Depot Manager');
