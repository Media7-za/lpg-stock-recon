-- Card Recon Foundation (M0)
-- Adds 7 new tables for the credit card purchase intent, capture, and
-- statement reconciliation epic. Entirely additive -- no changes to any
-- existing table. Docs: docs/Card-Recon/Slice_Brief.md, Dev_Plan.md
-- Generated via: prisma migrate diff --from-schema-datamodel (pre-change
-- schema snapshot) --to-schema-datamodel prisma/schema.prisma --script
-- NOT yet applied against any database -- no live Supabase connection
-- available in this session. Run `prisma migrate deploy` (or `dev`)
-- against a real DATABASE_URL/DIRECT_URL to apply.

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_intents" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ledger_account_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "requested_by" TEXT NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_capture_requests" (
    "id" TEXT NOT NULL,
    "intent_id" TEXT,
    "submitted_by" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(18,2) NOT NULL,
    "purchase_date" DATE NOT NULL,
    "merchant_note" TEXT,
    "receipt_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "rejection_reason" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMPTZ(6),

    CONSTRAINT "card_capture_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_ledger_entries" (
    "id" TEXT NOT NULL,
    "capture_request_id" TEXT NOT NULL,
    "captured_by" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "ledger_account_code" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "receipt_url" TEXT NOT NULL,
    "reconciliation_status" TEXT NOT NULL DEFAULT 'UNRECONCILED',
    "posted_by" TEXT NOT NULL,
    "posted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_statement_lines" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "cancel_reason" TEXT,
    "cancelled_by" TEXT,
    "cancelled_at" TIMESTAMPTZ(6),

    CONSTRAINT "card_statement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_recon_matches" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "statement_line_id" TEXT NOT NULL,
    "ledger_entry_id" TEXT NOT NULL,
    "match_method" TEXT NOT NULL,
    "matched_by" TEXT,
    "matched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_recon_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_recon_sessions" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "statement_filename" TEXT NOT NULL,
    "imported_by" TEXT NOT NULL,
    "imported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_by" TEXT,
    "finalized_at" TIMESTAMPTZ(6),

    CONSTRAINT "card_recon_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_code_key" ON "ledger_accounts"("code");

-- CreateIndex
CREATE INDEX "purchase_intents_ledger_account_code_idx" ON "purchase_intents"("ledger_account_code");

-- CreateIndex
CREATE INDEX "purchase_intents_status_idx" ON "purchase_intents"("status");

-- CreateIndex
CREATE INDEX "purchase_intents_requested_by_idx" ON "purchase_intents"("requested_by");

-- CreateIndex
CREATE INDEX "card_capture_requests_intent_id_idx" ON "card_capture_requests"("intent_id");

-- CreateIndex
CREATE INDEX "card_capture_requests_status_idx" ON "card_capture_requests"("status");

-- CreateIndex
CREATE INDEX "card_capture_requests_submitted_by_idx" ON "card_capture_requests"("submitted_by");

-- CreateIndex
CREATE INDEX "card_ledger_entries_capture_request_id_idx" ON "card_ledger_entries"("capture_request_id");

-- CreateIndex
CREATE INDEX "card_ledger_entries_reconciliation_status_idx" ON "card_ledger_entries"("reconciliation_status");

-- CreateIndex
CREATE INDEX "card_ledger_entries_captured_by_idx" ON "card_ledger_entries"("captured_by");

-- CreateIndex
CREATE INDEX "card_ledger_entries_ledger_account_code_idx" ON "card_ledger_entries"("ledger_account_code");

-- CreateIndex
CREATE INDEX "card_statement_lines_session_id_idx" ON "card_statement_lines"("session_id");

-- CreateIndex
CREATE INDEX "card_statement_lines_status_idx" ON "card_statement_lines"("status");

-- CreateIndex
CREATE INDEX "card_recon_matches_session_id_idx" ON "card_recon_matches"("session_id");

-- CreateIndex
CREATE INDEX "card_recon_matches_statement_line_id_idx" ON "card_recon_matches"("statement_line_id");

-- CreateIndex
CREATE INDEX "card_recon_matches_ledger_entry_id_idx" ON "card_recon_matches"("ledger_entry_id");

-- CreateIndex
CREATE INDEX "card_recon_sessions_status_idx" ON "card_recon_sessions"("status");

