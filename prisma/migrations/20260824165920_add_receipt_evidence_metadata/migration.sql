-- Receipt Evidence Metadata (follow-up to M0)
-- Adds the fields FR-CCR-RECEIPT-001 requires alongside receipt_url:
-- MIME type, processed file size, and (on card_ledger_entries only) the
-- original upload timestamp, carried forward from the capture request
-- since posted_at reflects the later Capture Clerk review action, not
-- when the file was actually uploaded.
-- Docs: docs/Card-Recon/Slice_Brief.md, Dev_Plan.md (FR-CCR-RECEIPT-001)
-- NOT NULL with no default because both M0 tables are still empty (M0's
-- migration itself has not been applied to any database yet) -- this is
-- safe now, would need a backfill if data already existed.
-- NOT yet applied against any database -- see M0's migration.sql for the
-- same caveat and how to apply both together.

-- AlterTable
ALTER TABLE "card_capture_requests" ADD COLUMN     "receipt_mime_type" TEXT NOT NULL,
ADD COLUMN     "receipt_size_bytes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "card_ledger_entries" ADD COLUMN     "receipt_mime_type" TEXT NOT NULL,
ADD COLUMN     "receipt_size_bytes" INTEGER NOT NULL,
ADD COLUMN     "receipt_uploaded_at" TIMESTAMPTZ(6) NOT NULL;

