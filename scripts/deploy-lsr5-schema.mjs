import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Step 1: Create Tables
    console.log('Running Step 1: Create Tables...');
    const step1 = `
-- Configuration for scoring weights
CREATE TABLE IF NOT EXISTS app_config (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key  TEXT UNIQUE NOT NULL,
    config_data JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Master mapping of SKUs to business buckets
CREATE TABLE IF NOT EXISTS item_classifications (
    stock_no        TEXT PRIMARY KEY,
    business_bucket TEXT NOT NULL,
    logical_group   TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Debtors Reconciliation Sessions
CREATE TABLE IF NOT EXISTS reconciliation_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_no    TEXT NOT NULL REFERENCES customers(account_code),
    status        TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'DRAFT', 'FINALIZED')),
    started_by    UUID,
    finalized_by  UUID,
    started_at    TIMESTAMPTZ DEFAULT now(),
    finalized_at  TIMESTAMPTZ,
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Partial unique index to prevent multiple active sessions per account
CREATE UNIQUE INDEX IF NOT EXISTS one_active_recon_per_account 
ON reconciliation_sessions (account_no) 
WHERE (status != 'FINALIZED');

-- Individual document allocations
CREATE TABLE IF NOT EXISTS allocations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id        UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
    credit_doc_id     BIGINT NOT NULL REFERENCES transaction_headers(id),
    invoice_doc_id    BIGINT NOT NULL REFERENCES transaction_headers(id),
    amount            NUMERIC NOT NULL CHECK (amount > 0),
    is_auto_accepted  BOOLEAN DEFAULT false,
    actor_id          UUID,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- Item-level audit of allocation coverage
CREATE TABLE IF NOT EXISTS allocation_item_impact (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id UUID NOT NULL REFERENCES allocations(id) ON DELETE CASCADE,
    stock_no      TEXT NOT NULL,
    qty_covered   NUMERIC NOT NULL,
    amount_covered NUMERIC NOT NULL
);

-- User feedback for manual overrides (Training Data)
CREATE TABLE IF NOT EXISTS training_records (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    allocation_id     UUID REFERENCES allocations(id) ON DELETE CASCADE,
    reason_code       TEXT NOT NULL,
    score_at_time     INTEGER,
    recommended_doc_id BIGINT REFERENCES transaction_headers(id),
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- Pool for persistent unallocated credits
CREATE TABLE IF NOT EXISTS unmatched_credits (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_no     TEXT NOT NULL REFERENCES customers(account_code),
    credit_doc_id  BIGINT NOT NULL REFERENCES transaction_headers(id),
    available_balance NUMERIC NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ DEFAULT now()
);
    `;
    await client.query(step1);
    console.log('Step 1 successful.');

    // Step 2: Alter Headers
    console.log('Running Step 2: Alter Headers...');
    const step2 = `ALTER TABLE transaction_headers ADD COLUMN IF NOT EXISTS available_balance NUMERIC;`;
    await client.query(step2);
    console.log('Step 2 successful.');

    // Step 3: Backfill
    console.log('Running Step 3: Backfill...');
    const step3 = `UPDATE transaction_headers SET available_balance = (amount_excl + tax_amount) WHERE available_balance IS NULL;`;
    const res3 = await client.query(step3);
    console.log('Step 3 successful. Updated ' + res3.rowCount + ' rows.');

    // Step 4: Create Indexes
    console.log('Running Step 4: Create Indexes...');
    const step4 = `
CREATE INDEX IF NOT EXISTS idx_allocations_session_id ON allocations(session_id);
CREATE INDEX IF NOT EXISTS idx_allocations_credit_doc ON allocations(credit_doc_id);
CREATE INDEX IF NOT EXISTS idx_allocations_invoice_doc ON allocations(invoice_doc_id);
CREATE INDEX IF NOT EXISTS idx_unmatched_credits_acc ON unmatched_credits(account_no);
    `;
    await client.query(step4);
    console.log('Step 4 successful.');

    console.log('LSR-5 Schema Deployment Complete!');
    
  } catch (err) {
    console.error('Error during deployment:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
