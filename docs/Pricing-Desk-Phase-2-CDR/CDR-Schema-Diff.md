## Schema Diff — Commercial Decision Records (Pricing Desk Phase 2)

STATUS: **Approved and applied, including RLS (Option A).** Storage model decided in `lpg-intelligence` (`lpg/docs/pricing_desk/COMMERCIAL_DECISION_DOCTRINE.md` — Option A, Postgres first). `state` CHECK and `decision_type` default updated to match the CDR terminology/lifecycle standardization done after this proposal was first written. RLS was initially deferred (see the superseded note below) because real Supabase Auth wasn't wired up — it now is (`src/hooks/useAuth.ts`, `src/components/auth/LoginScreen.tsx`), so RLS is enabled with `authenticated`-only SELECT/INSERT/UPDATE policies, applied via migration `enable_rls_commercial_decision_records`. Verified: anonymous SELECT returns zero rows, anonymous INSERT is rejected with an RLS violation, authenticated access works, and the `cdr_enforce_immutability` trigger is untouched.

Source doctrine: `lpg-intelligence/lpg/docs/pricing_desk/PRD_SLICE_002_COMMERCIAL_DECISION_RECORDS.md`,
`lpg-intelligence/lpg/docs/pricing_desk/COMMERCIAL_DECISION_DOCTRINE.md`, and
`lpg-intelligence/docs/architecture/STATE_MACHINES.md`. Phase 1 UX shell that this persists: commit `5a8b05e` (`src/features/pricing-desk/`).

---

### Why this is needed

Phase 1 shipped the Pricing Desk UX shell with an in-memory decision store
(`src/features/pricing-desk/state/PricingDeskProvider.tsx`). It resets on
every page reload and every browser tab is its own universe. That's fine for
a UX shell but it means:

- No approved price actually survives past the session.
- "Today's Pricing Decisions" on Home only ever shows what happened in *this* tab.
- There is no permanent audit trail of what was quoted, why, and what happened after —
  which is the entire point of the CDR per the architecture doctrine
  (`ERP records what happened financially. The Commercial Decision Record records why.`).

Phase 2 replaces the in-memory store with a real table so decisions persist,
can be queried across sessions/users, and satisfy the PRD_SLICE_002 invariants
(immutable once approved, VAT-basis explicit, revisions link to a prior decision).

---

### Change Summary

| Change | Type | Risk | PM Sign-off Required |
|---|---|---|---|
| Create `commercial_decision_records` table | Additive | Low | YES |
| Create `commercial_decision_seq` sequence (for human-readable decision codes) | Additive | Low | NO |
| Create trigger `set_cdr_decision_code` (assigns `CDR-<year>-<seq>` on insert) | Additive | Low | NO |
| Create trigger `enforce_cdr_immutability` (blocks edits to approved/snapshot fields post-approval) | Additive | Medium | YES |
| Create indexes on customer_code, state, outcome, created_at | Additive | Low | NO |
| Defer `mobile_proformas` table and `proforma_id` FK to Phase 4 | Deferred | — | NO |
| RLS policy | Deferred to a future phase (real auth not wired up yet) | — | NO |

---

### Proposed SQL Changes

(Would be added to `supabase/create_pricing_desk_tables.sql`, run manually in the
Supabase SQL Editor per this repo's existing convention — see
`supabase/create_operational_tables.sql`.)

```sql
-- =============================================================================
-- Pricing Desk — Commercial Decision Records (Phase 2)
-- Run in the Supabase SQL Editor. Additive only, no existing tables touched.
-- =============================================================================

-- 1. SEQUENCE + HUMAN-READABLE DECISION CODE
-- Doctrine example format: CDR-2026-00017
CREATE SEQUENCE IF NOT EXISTS commercial_decision_seq;

-- 2. COMMERCIAL DECISION RECORDS TABLE
CREATE TABLE IF NOT EXISTS commercial_decision_records (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_code               TEXT UNIQUE,                -- e.g. CDR-2026-00017, set by trigger
    previous_decision_id        UUID REFERENCES commercial_decision_records(id),

    customer_code               TEXT NOT NULL,
    customer_name               TEXT NOT NULL,
    customer_lane               TEXT NOT NULL CHECK (customer_lane IN (
                                    'commodity_wholesale', 'standard_wholesale',
                                    'consuming_customer', 'relationship_account',
                                    'strategic_account'
                                 )),
    commercial_status           TEXT NOT NULL CHECK (commercial_status IN (
                                    'new_prospect', 'active_customer', 'dormant_customer',
                                    'win_back', 'churn_risk', 'lost'
                                 )),
    decision_type               TEXT NOT NULL DEFAULT 'pricing_decision',  -- "pricing decision" is a UI/business term for a CDR use case, see COMMERCIAL_DECISION_DOCTRINE.md

    state                       TEXT NOT NULL DEFAULT 'draft' CHECK (state IN (
                                    'draft', 'recommended', 'approved', 'quoted',
                                    'won', 'lost', 'expired', 'superseded', 'withdrawn'
                                 )),  -- see STATE_MACHINES.md § Commercial Decision Record (CDR) Lifecycle

    -- Snapshots: frozen context at time of decision (doctrine invariant #4, #5)
    pricing_intake_snapshot     JSONB NOT NULL,
    customer_context_snapshot   JSONB,
    delivery_economics_snapshot JSONB,
    supplier_cost_snapshot      JSONB NOT NULL,
    market_context_snapshot     JSONB,

    floor_price_per_kg          NUMERIC(10,5),
    target_price_per_kg         NUMERIC(10,5),
    stretch_price_per_kg        NUMERIC(10,5),
    recommended_price_per_kg    NUMERIC(10,5),
    approved_price_per_kg       NUMERIC(10,5),
    price_basis                 TEXT NOT NULL DEFAULT 'excl_vat' CHECK (price_basis IN ('excl_vat', 'incl_vat')),

    approved_by                 TEXT,
    decision_reason             TEXT,
    confidence                  TEXT,

    proforma_id                 UUID,        -- FK deferred to Phase 4 (mobile_proformas table doesn't exist yet)
    erp_order_id                TEXT,

    outcome                     TEXT CHECK (outcome IN (
                                    'won', 'lost_price', 'lost_service', 'lost_stock_availability',
                                    'lost_relationship', 'expired_no_response',
                                    'superseded_by_new_offer', 'cancelled_by_user'
                                 )),
    outcome_reason               TEXT,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_at                 TIMESTAMPTZ,
    quoted_at                   TIMESTAMPTZ,
    closed_at                   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cdr_customer_code_idx ON commercial_decision_records (customer_code);
CREATE INDEX IF NOT EXISTS cdr_customer_lane_idx ON commercial_decision_records (customer_lane);
CREATE INDEX IF NOT EXISTS cdr_state_idx         ON commercial_decision_records (state);
CREATE INDEX IF NOT EXISTS cdr_outcome_idx        ON commercial_decision_records (outcome);
CREATE INDEX IF NOT EXISTS cdr_created_at_idx     ON commercial_decision_records (created_at);

-- 3. DECISION CODE TRIGGER
-- Assigns CDR-<year>-<5-digit-seq> on insert. Kept server-side so codes are
-- guaranteed unique and sequential even under concurrent inserts.
CREATE OR REPLACE FUNCTION set_cdr_decision_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.decision_code IS NULL THEN
    NEW.decision_code := 'CDR-' || to_char(now(), 'YYYY') || '-' ||
                          lpad(nextval('commercial_decision_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cdr_set_decision_code
  BEFORE INSERT ON commercial_decision_records
  FOR EACH ROW EXECUTE FUNCTION set_cdr_decision_code();

-- 4. IMMUTABILITY TRIGGER
-- Doctrine invariant: "Approved decisions are immutable."
-- Acceptance criterion: "The CDR can be updated only for lifecycle state and outcome fields."
-- Once a row has passed 'approved', block edits to anything except state/outcome/
-- outcome_reason/proforma_id/erp_order_id/quoted_at/closed_at.
CREATE OR REPLACE FUNCTION enforce_cdr_immutability() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state NOT IN ('draft', 'recommended') THEN
    IF NEW.customer_code               IS DISTINCT FROM OLD.customer_code
    OR NEW.customer_name               IS DISTINCT FROM OLD.customer_name
    OR NEW.customer_lane               IS DISTINCT FROM OLD.customer_lane
    OR NEW.commercial_status           IS DISTINCT FROM OLD.commercial_status
    OR NEW.pricing_intake_snapshot     IS DISTINCT FROM OLD.pricing_intake_snapshot
    OR NEW.customer_context_snapshot   IS DISTINCT FROM OLD.customer_context_snapshot
    OR NEW.delivery_economics_snapshot IS DISTINCT FROM OLD.delivery_economics_snapshot
    OR NEW.supplier_cost_snapshot      IS DISTINCT FROM OLD.supplier_cost_snapshot
    OR NEW.market_context_snapshot     IS DISTINCT FROM OLD.market_context_snapshot
    OR NEW.floor_price_per_kg          IS DISTINCT FROM OLD.floor_price_per_kg
    OR NEW.target_price_per_kg         IS DISTINCT FROM OLD.target_price_per_kg
    OR NEW.stretch_price_per_kg        IS DISTINCT FROM OLD.stretch_price_per_kg
    OR NEW.recommended_price_per_kg    IS DISTINCT FROM OLD.recommended_price_per_kg
    OR NEW.approved_price_per_kg       IS DISTINCT FROM OLD.approved_price_per_kg
    OR NEW.price_basis                 IS DISTINCT FROM OLD.price_basis
    OR NEW.approved_by                 IS DISTINCT FROM OLD.approved_by
    OR NEW.decision_reason             IS DISTINCT FROM OLD.decision_reason
    THEN
      RAISE EXCEPTION 'commercial_decision_records: decision % is approved and immutable outside state/outcome fields', OLD.decision_code;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cdr_enforce_immutability
  BEFORE UPDATE ON commercial_decision_records
  FOR EACH ROW EXECUTE FUNCTION enforce_cdr_immutability();

-- 5. RLS — initially deferred in this migration (superseded, see below).
```

**Superseded.** RLS was deferred here because `src/hooks/useAuth.ts` stubbed a role locally with no real Supabase session, so `auth.role() = 'authenticated'` policies would have blocked the app outright — same reasoning as the pre-existing `sessions`/`counts` tables. Once real Supabase Auth login was added (`src/hooks/useAuth.ts`, `src/components/auth/LoginScreen.tsx`), that reasoning no longer applied. RLS was enabled via a follow-up migration, `enable_rls_commercial_decision_records`:

```sql
ALTER TABLE commercial_decision_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read CDRs" ON commercial_decision_records
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create CDRs" ON commercial_decision_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update CDR state/outcome" ON commercial_decision_records
    FOR UPDATE USING (auth.role() = 'authenticated');
-- No DELETE policy — CDRs are never deleted, only superseded.
```

`commercial_decision_records` no longer appears in Supabase's RLS-disabled advisory. The other 15 pre-existing tables (`sessions`, `counts`, `transaction_headers`, etc.) are unaffected and remain a separate, pre-existing gap — not addressed by this change.

---

### Migration Impact

**`commercial_decision_records` table**
- Breaking change: NO. New table, nothing references it yet.
- Backfill needed: NO. Phase 1 never persisted anything to back-fill from.

**Triggers**
- `enforce_cdr_immutability` changes write behavior going forward (rejects certain
  UPDATEs) but has zero effect until rows exist and reach `approved` state.

**`proforma_id` column**
- Stored as a bare `UUID` with **no foreign key** for now. `mobile_proformas` doesn't
  exist yet (Phase 4). Adding the FK later is additive and non-breaking.

**Migration Sequence**
1. Create `commercial_decision_seq`.
2. Create `commercial_decision_records` table + indexes.
3. Create and attach `set_cdr_decision_code` trigger.
4. Create and attach `enforce_cdr_immutability` trigger.
5. Enable RLS and attach policies.

---

### Data Safety Warnings

None — additive only, idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE`). No existing
table, view, or Prisma model is touched. `commercial_decision_records` is intentionally
kept outside `prisma/schema.prisma`, matching the existing convention for operational
tables (see comment header in `supabase/create_operational_tables.sql`).

---

### Application Integration Plan (not implemented yet)

1. Replace `src/features/pricing-desk/state/PricingDeskProvider.tsx`'s in-memory
   `useState<CommercialDecisionRecord[]>` with a Supabase-backed hook
   (`useCommercialDecisions()`) that reads/writes `commercial_decision_records`.
2. `RecommendationCard`'s `onApprove` currently calls `addDecision()` synchronously;
   it would become an `INSERT ... state='approved', approved_at=now()`.
3. `QuoteWorkspace`'s "Generate Mobile Proforma" step would `UPDATE` the row's
   `state` to `'quoted'` and `quoted_at`, staying within the immutability trigger's
   allowed fields.
4. `ActivityFeed` on Home would query the latest N rows instead of reading
   session-local context state.
5. The `CustomerRecord` / `CustomerCommercialContext` fixtures in
   `data/fixtures/pricingDeskFixtures.ts` stay as-is until Phase 3 (Customer
   Commercial Context API) replaces them — Phase 2 only persists decisions, it
   does not change where intake/context data comes from.

---

### Open Questions (need a decision before implementation)

1. **Auth — fully resolved.** `useAuth.ts` now calls real `supabase.auth.getSession()` /
   `onAuthStateChange`, gated by `src/components/auth/LoginScreen.tsx`. RLS is enabled
   with `authenticated`-only policies (see "Superseded" note above). One shared
   default credential: **`56847p@gmail.com`** (Supabase Auth user with
   `user_metadata.role = "Depot Manager"`). Password is the project Postgres password
   stored in `.env` / operator password manager — not committed to git. Per-user
   accounts (`approved_by` tied to a real identity) remain future work.
2. **`approved_by`**: still free-text, matching current `RecommendationCard` UX
   (now has an "Approved by" field). Not yet `auth.uid()`-derived — the app has one
   shared credential, not per-user identity, so free-text remains the only option
   that actually identifies *who* approved something. Revisit once per-user accounts
   exist.
3. **Decision code format**: proposed `CDR-<year>-<seq>` resets numbering only by
   calendar year via `to_char(now(), 'YYYY')`, but the sequence itself never resets
   (Postgres sequences don't reset automatically) — numbers will just keep climbing
   past 99999 within a year if volume is high. Fine for expected volume, flagging
   in case that assumption is wrong.
4. **Superseded decisions**: `previous_decision_id` models "a revised quote creates
   a new decision linked to the previous decision," but nothing here enforces that
   the *previous* row's state actually gets flipped to `superseded` when a new one
   is created referencing it. That would need to be enforced in application code
   or a second trigger — deferring the choice to implementation time.

---

### Index / Query Implications

Indexes cover the PRD_SLICE_002 acceptance criterion: "Historical CDRs can be
queried by customer, lane, status, approved price, and outcome." `approved_price_per_kg`
has no dedicated index — flagging as low priority since it's more likely to be
a filter *range* (e.g. "quotes under R28/kg") than an equality lookup; can add
`cdr_approved_price_idx` later if a real query pattern needs it.

---

### Deployment Sequence

Applied via Supabase migration `create_commercial_decision_records`, in order:
1. `CREATE SEQUENCE`.
2. `CREATE TABLE` + indexes.
3. `CREATE FUNCTION` + `CREATE TRIGGER` (decision code).
4. `CREATE FUNCTION` + `CREATE TRIGGER` (immutability).
5. RLS initially deferred, then applied via follow-up migration `enable_rls_commercial_decision_records` once real auth landed.

---

### Schema Checklist
- [x] All changes classified by type and risk
- [x] Breaking changes identified (None)
- [x] Backfill SQL provided (N/A — new table)
- [x] Data safety warnings flagged (None)
- [x] Index recommendations included
- [x] Application integration plan outlined
- [x] Open questions flagged, decided where needed for this phase
- [x] All SQL is idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE`)
- [x] Deployment sequence is correct and safe
- [x] **Applied to project `oqhpxnaadahohwkslive` via migration `create_commercial_decision_records`**
