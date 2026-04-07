-- CreateTable
CREATE TABLE "ErpSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL,
    "exportTime" DATETIME NOT NULL,
    "data" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "CountSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL,
    "sessionType" TEXT NOT NULL,
    "erpSnapshotId" TEXT NOT NULL,
    "physicalCounts" JSONB NOT NULL,
    "reconciliation" JSONB NOT NULL,
    "counterName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    CONSTRAINT "CountSession_erpSnapshotId_fkey" FOREIGN KEY ("erpSnapshotId") REFERENCES "ErpSnapshot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ErpSnapshot_timestamp_idx" ON "ErpSnapshot"("timestamp");

-- CreateIndex
CREATE INDEX "ErpSnapshot_exportTime_idx" ON "ErpSnapshot"("exportTime");

-- CreateIndex
CREATE INDEX "CountSession_timestamp_idx" ON "CountSession"("timestamp");

-- CreateIndex
CREATE INDEX "CountSession_sessionType_idx" ON "CountSession"("sessionType");

-- CreateIndex
CREATE INDEX "CountSession_erpSnapshotId_idx" ON "CountSession"("erpSnapshotId");

-- CreateIndex
CREATE INDEX "CountSession_status_idx" ON "CountSession"("status");
