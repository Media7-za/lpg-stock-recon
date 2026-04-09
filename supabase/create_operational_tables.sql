-- =============================================================================
-- LPG Stock Recon App — Operational Tables
-- These tables are used by Supabase Edge Functions and are NOT in schema.prisma.
-- Run this in the Supabase SQL Editor ONCE after prisma migrate deploy.
-- Project: oqhpxnaadahohwkslive
-- =============================================================================

-- sessions: tracks count sessions and their state machine
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  current_state TEXT NOT NULL DEFAULT 'OPEN',
  locked        BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_date_idx          ON sessions (date);
CREATE INDEX IF NOT EXISTS sessions_current_state_idx ON sessions (current_state);

-- counts: physical count payloads submitted per session
CREATE TABLE IF NOT EXISTS counts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS counts_session_id_idx ON counts (session_id);

-- idempotency_keys: deduplication store for Edge Function calls
-- Automatically expires after 24 hours to prevent unbounded growth.
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key        TEXT PRIMARY KEY,
  response   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idempotency_keys_created_at_idx ON idempotency_keys (created_at);

-- audit_log: immutable event log for all state transitions
CREATE TABLE IF NOT EXISTS audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES sessions(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  from_state   TEXT,
  to_state     TEXT,
  performed_by TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_session_id_idx ON audit_log (session_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at);

-- reconciliation_pipeline: tracks reconciliation job progress per session
CREATE TABLE IF NOT EXISTS reconciliation_pipeline (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  stage      TEXT NOT NULL,
  progress   INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

-- Verify: list all newly created operational tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'sessions', 'counts', 'idempotency_keys', 'audit_log', 'reconciliation_pipeline'
  )
ORDER BY table_name;
