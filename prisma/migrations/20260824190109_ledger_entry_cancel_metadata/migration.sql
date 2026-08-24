-- Ledger Entry Cancel Metadata (follow-up to M0)
-- Found while implementing M4's Cancel Exception action: cancelException's
-- own service signature (Dev Plan Section 3) takes a targetType of
-- 'statementLine' | 'ledgerEntry', but card_ledger_entries never got the
-- cancel_reason/cancelled_by/cancelled_at columns card_statement_lines
-- already had -- Cancel Exception was only ever buildable for one side of
-- a match. Nullable, no default needed: additive, no backfill.
-- Docs: docs/Card-Recon/Dev_Plan.md Section 1

-- AlterTable
ALTER TABLE "card_ledger_entries" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMPTZ(6),
ADD COLUMN     "cancelled_by" TEXT;

