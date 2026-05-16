-- 8. ITEM-AWARE RECONCILIATION TABLES (LSR-5)

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
    updated_at    TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT one_active_recon_per_account UNIQUE (account_no) WHERE (status != 'FINALIZED')
);

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
