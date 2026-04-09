-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'REVIEWER', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('Invoice', 'Payment', 'Crd Note', 'GRV', 'STK_XFER', 'Journal', 'Deb Note');

-- CreateEnum
CREATE TYPE "AllocationEventType" AS ENUM ('ALLOCATE', 'DEALLOCATE', 'ADJUST');

-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('FULL', 'PARTIAL', 'EXCESS', 'ROUNDING');

-- CreateEnum
CREATE TYPE "MatchMethod" AS ENUM ('AUTO_EXACT', 'AUTO_PATTERN', 'MANUAL', 'ADJUSTED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'CONFLICT', 'DELETED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('ACCEPT', 'REJECT', 'MODIFY', 'ESCALATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accno" TEXT NOT NULL,
    "currentName" TEXT NOT NULL,
    "account_type" TEXT,
    "typical_return_days" INTEGER,
    "partial_return_prob" DOUBLE PRECISION,
    "common_patterns" TEXT[],
    "special_rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "stockno" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "group" TEXT,
    "brand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_reps" (
    "id" TEXT NOT NULL,
    "rep" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "sales_reps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_headers" (
    "id" TEXT NOT NULL,
    "entry" "EntryType" NOT NULL,
    "period" INTEGER NOT NULL,
    "account_id" TEXT,
    "accno" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "docno" TEXT NOT NULL,
    "invno" TEXT,
    "deb_oder" TEXT,
    "orderno" TEXT,
    "dep_ref" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "ref" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "tax" DECIMAL(18,2) NOT NULL,
    "excode" TEXT,
    "famount" DECIMAL(18,2) NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "rep_id" TEXT,
    "rep" TEXT,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "sync_version" INTEGER NOT NULL DEFAULT 1,
    "last_synced_at" TIMESTAMP(3),

    CONSTRAINT "transaction_headers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_line_items" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "docno" TEXT NOT NULL,
    "accno" TEXT NOT NULL,
    "entry" "EntryType" NOT NULL,
    "period" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "product_id" TEXT,
    "stockno" TEXT,
    "description" TEXT,
    "category" TEXT,
    "group" TEXT,
    "brand" TEXT,
    "quantity" DECIMAL(18,3) NOT NULL,
    "retail" DECIMAL(18,4) NOT NULL,
    "cost" DECIMAL(18,4) NOT NULL,
    "orderno" TEXT,
    "rep_id" TEXT,
    "rep" TEXT,
    "ref" TEXT,
    "user" TEXT,
    "location" TEXT,
    "contract" TEXT,
    "comms" DECIMAL(18,4) NOT NULL,
    "linecomms" DECIMAL(18,4) NOT NULL,
    "taxcode" INTEGER NOT NULL,
    "linetax" DECIMAL(18,2) NOT NULL,
    "projno" TEXT,
    "department" TEXT,
    "sretail1" DECIMAL(18,4),
    "sretail2" DECIMAL(18,4),
    "sretail3" DECIMAL(18,4),
    "sretail4" DECIMAL(18,4),
    "sretail5" DECIMAL(18,4),
    "sretail6" DECIMAL(18,4),

    CONSTRAINT "transaction_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_events" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "event_type" "AllocationEventType" NOT NULL,
    "allocation_type" "AllocationType" NOT NULL,
    "match_method" "MatchMethod" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_decisions" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "system_confidence" INTEGER NOT NULL,
    "human_confidence" INTEGER,
    "reason_codes" TEXT[],
    "notes" TEXT,
    "created_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_library" (
    "id" TEXT NOT NULL,
    "pattern_key" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "acceptRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pattern_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reason_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reason_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_snapshots" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "exportTime" TIMESTAMP(3) NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "erp_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_count_sessions" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "zones" JSONB NOT NULL,
    "counterName" TEXT,
    "notes" TEXT,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "physical_count_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_data" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "movements" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "movement_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_reports" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "pmPhysicalId" TEXT NOT NULL,
    "amPhysicalId" TEXT,
    "pmErpId" TEXT NOT NULL,
    "movementDataId" TEXT,
    "results" JSONB NOT NULL,

    CONSTRAINT "reconciliation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancy_notes" (
    "id" TEXT NOT NULL,
    "reconciliationReportId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "resolutionStatus" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discrepancy_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accno_key" ON "accounts"("accno");

-- CreateIndex
CREATE UNIQUE INDEX "products_stockno_key" ON "products"("stockno");

-- CreateIndex
CREATE UNIQUE INDEX "sales_reps_rep_key" ON "sales_reps"("rep");

-- CreateIndex
CREATE INDEX "transaction_headers_accno_idx" ON "transaction_headers"("accno");

-- CreateIndex
CREATE INDEX "transaction_headers_date_idx" ON "transaction_headers"("date");

-- CreateIndex
CREATE INDEX "transaction_headers_docno_idx" ON "transaction_headers"("docno");

-- CreateIndex
CREATE INDEX "transaction_headers_sync_status_idx" ON "transaction_headers"("sync_status");

-- CreateIndex
CREATE INDEX "transaction_line_items_transaction_id_idx" ON "transaction_line_items"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_line_items_docno_idx" ON "transaction_line_items"("docno");

-- CreateIndex
CREATE INDEX "transaction_line_items_stockno_idx" ON "transaction_line_items"("stockno");

-- CreateIndex
CREATE INDEX "allocation_events_source_id_idx" ON "allocation_events"("source_id");

-- CreateIndex
CREATE INDEX "allocation_events_target_id_idx" ON "allocation_events"("target_id");

-- CreateIndex
CREATE INDEX "allocation_events_createdAt_idx" ON "allocation_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pattern_library_pattern_key_key" ON "pattern_library"("pattern_key");

-- CreateIndex
CREATE UNIQUE INDEX "reason_codes_code_key" ON "reason_codes"("code");

-- CreateIndex
CREATE INDEX "erp_snapshots_timestamp_idx" ON "erp_snapshots"("timestamp");

-- CreateIndex
CREATE INDEX "physical_count_sessions_timestamp_idx" ON "physical_count_sessions"("timestamp");

-- CreateIndex
CREATE INDEX "movement_data_timestamp_idx" ON "movement_data"("timestamp");

-- CreateIndex
CREATE INDEX "reconciliation_reports_timestamp_idx" ON "reconciliation_reports"("timestamp");

-- CreateIndex
CREATE INDEX "discrepancy_notes_reconciliationReportId_idx" ON "discrepancy_notes"("reconciliationReportId");

-- CreateIndex
CREATE INDEX "discrepancy_notes_sku_idx" ON "discrepancy_notes"("sku");

-- AddForeignKey
ALTER TABLE "transaction_headers" ADD CONSTRAINT "transaction_headers_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_headers" ADD CONSTRAINT "transaction_headers_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "sales_reps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_line_items" ADD CONSTRAINT "transaction_line_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_line_items" ADD CONSTRAINT "transaction_line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_line_items" ADD CONSTRAINT "transaction_line_items_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "sales_reps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_events" ADD CONSTRAINT "allocation_events_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "transaction_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_events" ADD CONSTRAINT "allocation_events_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "transaction_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_events" ADD CONSTRAINT "allocation_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_decisions" ADD CONSTRAINT "match_decisions_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "transaction_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_decisions" ADD CONSTRAINT "match_decisions_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "transaction_headers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_decisions" ADD CONSTRAINT "match_decisions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_reports" ADD CONSTRAINT "reconciliation_reports_pmPhysicalId_fkey" FOREIGN KEY ("pmPhysicalId") REFERENCES "physical_count_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_notes" ADD CONSTRAINT "discrepancy_notes_reconciliationReportId_fkey" FOREIGN KEY ("reconciliationReportId") REFERENCES "reconciliation_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
