-- Capture Request: description field + ledger account (follow-up to M0)
-- Found while building M3's Capture Request Form against the UX
-- Blueprint: merchant_note was optional and untyped as a real field,
-- but the UX spec calls for a required "Description" field (shared spec
-- with PurchaseIntent.description) and an editable ledger-account field
-- pre-filled from a linked intent -- neither of which card_capture_requests
-- had a column for. NOT NULL on description with no default is safe;
-- the table is still empty (no migration in this epic has been applied
-- to any database yet).
-- Docs: docs/Card-Recon/UX_Blueprint.md (Component Specification),
-- docs/Card-Recon/Dev_Plan.md Section 1

-- AlterTable
ALTER TABLE "card_capture_requests" DROP COLUMN "merchant_note",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "ledger_account_code" TEXT;

-- CreateIndex
CREATE INDEX "card_capture_requests_ledger_account_code_idx" ON "card_capture_requests"("ledger_account_code");

