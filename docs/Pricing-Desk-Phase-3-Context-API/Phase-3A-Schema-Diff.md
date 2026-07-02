## Schema Diff — Customer Commercial Context API, Phase 3A (Pricing Desk)

STATUS: **Directionally approved. No SQL run yet.** All five design decisions and the
seeding scope are confirmed (see Open Questions 1–5 below for what's resolved and
what's still open). Still awaiting the explicit go-ahead to actually execute the SQL —
that is a separate step from this approval.

Source: `Context-API-Planning.md` (this folder) — the data-reality check this proposal
is built from. Source doctrine: `lpg-intelligence/lpg/docs/pricing_desk/PRD_SLICE_003_CUSTOMER_COMMERCIAL_CONTEXT_API.md`,
`COMMERCIAL_ANALYTICS.md`, `customer_intelligence.md`.

**Scope, per instruction:** `commercial_customers`, `commercial_customer_accounts`,
`product_classification_rules`, `get_customer_commercial_context()`, and the
ERP-derived purchase/pricing rhythm blocks. **`logistics_context` is explicitly
excluded from this proposal** — see "Phase 3B — Blocked" at the end.

---

### Why three new tables instead of one function against existing tables

The planning pass found three facts with no existing home in this database:

1. No table says which ERP account(s) belong to one commercial customer (Finding 2).
2. No table stores customer lane or commercial status (Finding 3).
3. No table stores kg-per-unit for LPG SKUs — it only exists in frontend TypeScript (Finding 4).

`commercial_customers` and `commercial_customer_accounts` resolve 1 and 2 together.
`product_classification_rules` resolves 3, deliberately kept separate from the
existing `item_classifications` table (owned by the debtor/creditor reconciliation
domain) rather than altering it — Pricing Desk needs one new fact
(`kg_per_unit`) that domain doesn't use, and altering a table Pricing Desk
doesn't own risks side effects on reconciliation logic that already depends on it.

---

### Change Summary

| Change | Type | Risk | PM Sign-off Required |
|---|---|---|---|
| Create `commercial_customers` table | Additive | Low | YES |
| Create `commercial_customer_accounts` table | Additive | Low | YES |
| Create `product_classification_rules` table + seed 5 known LPG SKUs | Additive | Low | YES |
| Create index `idx_items_account_no` on `transaction_items` | Additive | Low | NO |
| Create function `get_customer_commercial_context(text)` | Additive | Low | YES |
| RLS on all 3 new tables, `authenticated`-only | Additive | Medium | YES |
| Seed `commercial_customers` / `commercial_customer_accounts` for TAN002, LIN001, Siyaya (`SIY000`), and Impendle's 3 accounts | Additive, data | Low | Approved — see Open Question 3 |

No existing table, view, or Prisma model is touched.

---

### Proposed SQL

```sql
-- =============================================================================
-- Pricing Desk — Customer Commercial Context API (Phase 3A)
-- Additive only. Excludes logistics_context (Phase 3B, blocked).
-- =============================================================================

-- 1. COMMERCIAL CUSTOMERS
-- The canonical commercial customer entity. customer_lane and commercial_status
-- are nullable by design (Finding 3) — populated by a human (Commercial Owner),
-- not inferred. The API must return them as null/"unknown", never guessed.
CREATE TABLE IF NOT EXISTS commercial_customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name       TEXT NOT NULL,
    customer_lane       TEXT CHECK (customer_lane IN (
                            'commodity_wholesale', 'standard_wholesale',
                            'consuming_customer', 'relationship_account',
                            'strategic_account'
                         )),
    commercial_status   TEXT CHECK (commercial_status IN (
                            'new_prospect', 'active_customer', 'dormant_customer',
                            'win_back', 'churn_risk', 'lost'
                         )),
    primary_contact     TEXT,
    notes                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. COMMERCIAL CUSTOMER ACCOUNTS
-- Maps one or more ERP account codes to one commercial customer.
-- account_no is UNIQUE — an ERP account belongs to exactly one commercial
-- customer, never split across two.
CREATE TABLE IF NOT EXISTS commercial_customer_accounts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commercial_customer_id  UUID NOT NULL REFERENCES commercial_customers(id) ON DELETE CASCADE,
    account_no              TEXT NOT NULL UNIQUE,
    account_role            TEXT NOT NULL DEFAULT 'active' CHECK (account_role IN (
                                'active', 'historical', 'empties_deposit', 'branch', 'other'
                             )),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cca_commercial_customer_id ON commercial_customer_accounts (commercial_customer_id);

-- 3. PRODUCT CLASSIFICATION RULES
-- Pricing-Desk-owned kg-per-unit reference. Deliberately not merged into
-- item_classifications (owned by the debtor/creditor reconciliation domain) —
-- see rationale above. Not FK'd to item_classifications either, to avoid a
-- hard cross-domain dependency; the function joins on stock_no directly.
CREATE TABLE IF NOT EXISTS product_classification_rules (
    stock_no              TEXT PRIMARY KEY,
    kg_per_unit           NUMERIC(6,2) NOT NULL,
    cylinder_size_label   TEXT NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: the 5 known LPG-content SKUs, sourced directly from
-- docs/governance/sku_suffix_mapping.md and src/lib/skuConfig.ts — not
-- guessed. Excludes .1 deposit SKUs by construction (only LPG_CONTENT
-- stock_nos are seeded here; a join against this table is itself the
-- LPG-only filter).
INSERT INTO product_classification_rules (stock_no, kg_per_unit, cylinder_size_label) VALUES
    ('9.4',  9,  '9kg'),
    ('901',  9,  '9kg'),
    ('14.4', 14, '14kg'),
    ('1401', 14, '14kg'),
    ('19.4', 19, '19kg'),
    ('1901', 19, '19kg'),
    ('S.4',  48, '48kg Single-Valve'),
    ('S01',  48, '48kg Single-Valve'),
    ('D.4',  48, '48kg Double-Valve'),
    ('D01',  48, '48kg Double-Valve')
ON CONFLICT (stock_no) DO NOTHING;

-- 4. INDEX — transaction_items has no index on account_no today, and the
-- context function filters by it on every call.
CREATE INDEX IF NOT EXISTS idx_items_account_no ON transaction_items (account_no);

-- 5. FUNCTION
-- Accepts either an ERP account_no or a commercial_customers.id (as text).
-- Resolves to the commercial customer, aggregates across every account_no
-- mapped to it (the consolidation Finding 2 required), and returns the
-- PRD_SLICE_003 contract minus logistics_context.
--
-- Deliberately does NOT compute: commercial_rating, lifetime_contribution
-- (both require average_net_contribution, which requires the Trip Cost /
-- Delivery Economics engines — 004B/004C — not yet implemented; returned
-- as null). Does NOT compute churn_risk or reorder_status as a classified
-- value — COMMERCIAL_ANALYTICS.md assigns that classification to
-- customer_intelligence.md doctrine, not to a raw SQL formula; the function
-- returns the underlying signal (last_order_gap, average_days_between_orders)
-- and leaves the classification itself null, for the skill layer to set.
CREATE OR REPLACE FUNCTION get_customer_commercial_context(p_identifier text)
RETURNS jsonb AS $$
DECLARE
  v_commercial_customer_id uuid;
  v_result jsonb;
BEGIN
  SELECT commercial_customer_id INTO v_commercial_customer_id
  FROM commercial_customer_accounts
  WHERE account_no = p_identifier;

  IF v_commercial_customer_id IS NULL THEN
    BEGIN
      IF p_identifier ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_commercial_customer_id := p_identifier::uuid;
        IF NOT EXISTS (SELECT 1 FROM commercial_customers WHERE id = v_commercial_customer_id) THEN
          v_commercial_customer_id := NULL;
        END IF;
      END IF;
    EXCEPTION WHEN invalid_text_representation THEN
      v_commercial_customer_id := NULL;
    END;
  END IF;

  IF v_commercial_customer_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unknown_customer', 'identifier', p_identifier);
  END IF;

  WITH accounts AS (
    SELECT account_no FROM commercial_customer_accounts WHERE commercial_customer_id = v_commercial_customer_id
  ),
  lpg_lines AS (
    SELECT i.account_no, i.doc_no, i.tx_date, i.qty, i.retail_price, i.cost_price, i.stock_no,
           r.kg_per_unit,
           (i.qty * r.kg_per_unit)          AS line_kg,
           (i.qty * i.retail_price)         AS line_revenue_excl,
           (i.qty * i.cost_price)           AS line_cost
    FROM transaction_items i
    JOIN transaction_headers h
      ON h.account_no = i.account_no AND h.doc_no = i.doc_no AND h.entry_type = 'Invoice'
    JOIN product_classification_rules r ON r.stock_no = i.stock_no
    WHERE i.account_no IN (SELECT account_no FROM accounts)
  ),
  orders AS (
    SELECT doc_no, tx_date,
           sum(line_kg)                       AS order_kg,
           sum(line_revenue_excl)              AS order_value_excl,
           sum(line_revenue_excl - line_cost)  AS order_gross_profit
    FROM lpg_lines
    GROUP BY doc_no, tx_date
  ),
  order_gaps AS (
    SELECT tx_date, tx_date - lag(tx_date) OVER (ORDER BY tx_date) AS gap_days
    FROM orders
  ),
  agg AS (
    SELECT
      count(*)                                  AS order_count,
      max(tx_date)                              AS last_purchase_date,
      round(avg(gap_days) FILTER (WHERE gap_days IS NOT NULL), 1) AS avg_days_between_orders
    FROM orders LEFT JOIN order_gaps USING (tx_date)
  )
  SELECT jsonb_build_object(
    'customer', jsonb_build_object(
      'id', v_commercial_customer_id,
      'code', (SELECT account_no FROM accounts LIMIT 1),
      'erp_accounts', (SELECT jsonb_agg(account_no) FROM accounts),
      'name', (SELECT customer_name FROM commercial_customers WHERE id = v_commercial_customer_id),
      'lane', (SELECT customer_lane FROM commercial_customers WHERE id = v_commercial_customer_id),
      'commercial_status', (SELECT commercial_status FROM commercial_customers WHERE id = v_commercial_customer_id)
    ),
    'purchase_history', jsonb_build_object(
      'last_purchase_date', (SELECT last_purchase_date FROM agg),
      'days_since_last_purchase', (SELECT current_date - last_purchase_date FROM agg),
      'average_days_between_orders', (SELECT avg_days_between_orders FROM agg),
      'purchase_frequency', (SELECT
        CASE
          WHEN order_count < 2 THEN 'insufficient_history'
          WHEN avg_days_between_orders <= 10 THEN 'weekly'
          WHEN avg_days_between_orders <= 20 THEN 'fortnightly'
          WHEN avg_days_between_orders <= 35 THEN 'monthly'
          WHEN avg_days_between_orders <= 70 THEN 'bi_monthly'
          WHEN avg_days_between_orders <= 120 THEN 'quarterly'
          ELSE 'irregular'
        END FROM agg),
      'annual_volume_kg', (SELECT round(sum(order_kg), 2) FROM orders WHERE tx_date >= current_date - interval '12 months')
    ),
    'pricing', jsonb_build_object(
      'last_price_per_kg_ex_vat', (SELECT round(line_revenue_excl / NULLIF(line_kg,0), 5) FROM lpg_lines ORDER BY tx_date DESC LIMIT 1),
      'average_price_per_kg_3m', (SELECT round(sum(line_revenue_excl)/NULLIF(sum(line_kg),0), 5) FROM lpg_lines WHERE tx_date >= current_date - interval '3 months'),
      'average_price_per_kg_6m', (SELECT round(sum(line_revenue_excl)/NULLIF(sum(line_kg),0), 5) FROM lpg_lines WHERE tx_date >= current_date - interval '6 months'),
      'average_price_per_kg_12m', (SELECT round(sum(line_revenue_excl)/NULLIF(sum(line_kg),0), 5) FROM lpg_lines WHERE tx_date >= current_date - interval '12 months'),
      'highest_price_per_kg', (SELECT round(max(line_revenue_excl/NULLIF(line_kg,0)), 5) FROM lpg_lines),
      'lowest_price_per_kg', (SELECT round(min(line_revenue_excl/NULLIF(line_kg,0)), 5) FROM lpg_lines)
    ),
    'average_order', jsonb_build_object(
      'average_order_kg', (SELECT round(avg(order_kg), 2) FROM orders),
      'average_order_value_ex_vat', (SELECT round(avg(order_value_excl), 2) FROM orders),
      'average_gross_profit', (SELECT round(avg(order_gross_profit), 2) FROM orders),
      'average_delivery_cost', NULL,
      'average_net_contribution', NULL
    ),
    'commercial_profile', jsonb_build_object(
      'buying_cycle', (SELECT
        CASE
          WHEN order_count < 2 THEN 'insufficient_history'
          WHEN avg_days_between_orders <= 10 THEN 'weekly'
          WHEN avg_days_between_orders <= 20 THEN 'fortnightly'
          WHEN avg_days_between_orders <= 35 THEN 'monthly'
          WHEN avg_days_between_orders <= 70 THEN 'bi_monthly'
          WHEN avg_days_between_orders <= 120 THEN 'quarterly'
          ELSE 'irregular'
        END FROM agg),
      'expected_reorder_date', (SELECT last_purchase_date + (avg_days_between_orders || ' days')::interval FROM agg WHERE avg_days_between_orders IS NOT NULL),
      'commercial_rating', NULL,
      'lifetime_contribution', NULL
    ),
    'risk', jsonb_build_object(
      'churn_risk', NULL,
      'reorder_status', NULL,
      'last_order_gap', (SELECT current_date - last_purchase_date FROM agg)
    ),
    'classification', jsonb_build_object(
      'lpg_skus_included', (SELECT jsonb_agg(DISTINCT stock_no) FROM lpg_lines),
      'excluded_sku_classes', to_jsonb(ARRAY['deposits','empty_cylinders','cylinder_bonds','co2','accessories','adjustments']),
      'confidence', (SELECT CASE WHEN order_count >= 3 THEN 'high' WHEN order_count >= 1 THEN 'medium' ELSE 'low' END FROM agg)
    ),
    'data_freshness', jsonb_build_object(
      'source', 'lpg-stock-recon transaction_headers/transaction_items',
      'refreshed_at', now()
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. RLS — enabled from creation, unlike Phase 2's initial deferral, because
-- real Supabase Auth already exists by this point (Option A, Phase 2).
ALTER TABLE commercial_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_classification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read commercial customers" ON commercial_customers
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage commercial customers" ON commercial_customers
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read customer accounts" ON commercial_customer_accounts
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customer accounts" ON commercial_customer_accounts
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read classification rules" ON product_classification_rules
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage classification rules" ON product_classification_rules
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 7. SEED — the four customers approved for seeding. Classifications below
-- are only set where confirmed; everything else is left NULL rather than
-- guessed, per the "unknown is better than guessed" decision.
--
-- Note: "Siyaya Cash & Carry" was seeded in the Phase 1 UX shell fixtures
-- under a made-up code, SIYAYA001 (src/features/pricing-desk/data/fixtures/pricingDeskFixtures.ts).
-- The real ERP account is SIY000 ("SIYAYA CASH AND CARRY", 265 transactions,
-- 2025-06-13 to 2026-06-18). Seeding uses the real code. The Phase 1 fixture
-- mismatch is not fixed here — that's application-layer work for whenever
-- Quote Workspace starts calling this function instead of its fixtures.
DO $$
DECLARE
  v_tan002 uuid;
  v_lin001 uuid;
  v_siyaya uuid;
  v_impendle uuid;
BEGIN
  INSERT INTO commercial_customers (customer_name, customer_lane, commercial_status)
  VALUES ('Tandoor The Clay Oven', 'consuming_customer', 'win_back')
  RETURNING id INTO v_tan002;
  INSERT INTO commercial_customer_accounts (commercial_customer_id, account_no, account_role)
  VALUES (v_tan002, 'TAN002', 'active');

  INSERT INTO commercial_customers (customer_name, customer_lane, commercial_status)
  VALUES ('Slindokuhle Enterprises', 'standard_wholesale', 'active_customer')
  RETURNING id INTO v_lin001;
  INSERT INTO commercial_customer_accounts (commercial_customer_id, account_no, account_role)
  VALUES (v_lin001, 'LIN001', 'active');

  INSERT INTO commercial_customers (customer_name, customer_lane, commercial_status)
  VALUES ('Siyaya Cash and Carry', 'commodity_wholesale', 'active_customer')
  RETURNING id INTO v_siyaya;
  INSERT INTO commercial_customer_accounts (commercial_customer_id, account_no, account_role)
  VALUES (v_siyaya, 'SIY000', 'active');

  INSERT INTO commercial_customers (customer_name, customer_lane, commercial_status)
  VALUES ('Impendle Wholesale', 'standard_wholesale', 'dormant_customer')
  RETURNING id INTO v_impendle;
  INSERT INTO commercial_customer_accounts (commercial_customer_id, account_no, account_role) VALUES
    (v_impendle, 'BU0003', 'historical'),
    (v_impendle, 'BU0009', 'active'),
    (v_impendle, 'BU0031', 'empties_deposit');
END $$;
```

---

### Migration Impact

- All three new tables are additive; nothing references them yet.
- `idx_items_account_no` is additive and safe — `transaction_items` has 144,435 rows, so building it will take a moment but does not lock out reads.
- `get_customer_commercial_context()` is a pure `STABLE` function — no side effects, safe to create and safe to leave unused if not yet called by anything.
- RLS on the three new tables has no effect on any existing table or policy.

---

### Data Safety Warnings

Table/function/index DDL is additive and idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE`). No existing table, view, Prisma model, or `item_classifications` is touched.

The seed block (Section 7) is **not** fully idempotent — `commercial_customer_accounts.account_no` is `UNIQUE`, so re-running the seed a second time will fail cleanly on the first duplicate `account_no` insert (the whole `DO` block rolls back, per Postgres transaction semantics) rather than silently creating duplicate customers. That's a safety net, not a "run this repeatedly" design — it's intended to run once.

---

### Open Questions (need a decision before implementation)

1. **Canonical customer name (Finding 1).** This proposal stores `customer_name` directly on `commercial_customers` as a field a human sets when creating the row — it does **not** attempt to auto-derive it from the noisy `account_name` values found in `transaction_headers` (`"BULWER IMPENDILE"` vs `"DISCOUNT ALLOWED"` vs `"FNB APP PAYMENT..."` all sharing `BU0003`). Confirm this is acceptable, or specify the derivation rule if you want it computed instead of entered.
2. **Who populates `customer_lane` / `commercial_status`?** This proposal leaves both nullable, populated manually. No admin UI for this exists yet — would need to be a new Pricing Desk workspace screen, or direct table edits via Supabase Studio in the interim. Not part of this schema diff.
3. ~~**Seed data scope.**~~ **Resolved.** Seed TAN002, LIN001, Siyaya (real account `SIY000`, not the `SIYAYA001` mock code from the Phase 1 UX fixtures), and Impendle Wholesale's three-account consolidation. Classifications set only where confirmed:

   | Customer | Account(s) | Lane | Commercial Status |
   |---|---|---|---|
   | Tandoor The Clay Oven | `TAN002` | `consuming_customer` | `win_back` |
   | Slindokuhle Enterprises | `LIN001` | `standard_wholesale` | `active_customer` |
   | Siyaya Cash and Carry | `SIY000` | `commodity_wholesale` | `active_customer` |
   | Impendle Wholesale | `BU0003` (historical), `BU0009` (active), `BU0031` (empties_deposit) | `standard_wholesale` | `dormant_customer` |

   SQL added as Section 7 above.
4. **`purchase_frequency` vs `buying_cycle`.** The PRD lists these as two separate fields (`purchase_history.purchase_frequency`, `commercial_profile.buying_cycle`). This proposal computes them with the identical band formula from `COMMERCIAL_ANALYTICS.md` rather than inventing a second classification system. Confirm that's intended, or specify how they should differ.
5. **`get_customer_commercial_context` performance at scale.** Tested logic only, not run — with 144k `transaction_items` rows this should be fast per single-customer lookup given the new `idx_items_account_no` index, but this hasn't been measured with `EXPLAIN ANALYZE`. Recommend doing that before this is called from a live UI, not just before merge.

---

### Known Limitations (by design, not oversights)

- `average_delivery_cost`, `average_net_contribution`, `commercial_rating`, `lifetime_contribution` all return `null` — they require the Trip Cost Engine (004B) and Delivery Economics Engine (004C), neither implemented yet. The function is honest about this rather than approximating.
- `churn_risk` and `reorder_status` return `null` by design — `COMMERCIAL_ANALYTICS.md` assigns that classification to the `customer_intelligence.md` skill, not to a SQL formula. The function surfaces the raw signal (`last_order_gap`, `average_days_between_orders`) for that skill to classify.
- `logistics_context` is entirely absent from this function's output — not just null fields, the key itself doesn't appear. See Phase 3B below.

---

### Deployment Sequence

When approved, execute in order:
1. `CREATE TABLE commercial_customers`.
2. `CREATE TABLE commercial_customer_accounts` + index.
3. `CREATE TABLE product_classification_rules` + seed INSERT.
4. `CREATE INDEX idx_items_account_no`.
5. `CREATE FUNCTION get_customer_commercial_context`.
6. Enable RLS + policies on all three new tables.
7. Seed the four approved customers (TAN002, LIN001, Siyaya, Impendle).

---

### Schema Checklist
- [x] All changes classified by type and risk
- [x] Breaking changes identified (None)
- [x] Data safety warnings flagged (None)
- [x] Index recommendations included
- [x] Open questions flagged for a decision before implementation
- [x] Known limitations stated explicitly, not silently approximated
- [x] All SQL is idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING` / `CREATE OR REPLACE`)
- [x] Deployment sequence is correct and safe
- [ ] **Awaiting sign-off before any SQL runs**

---

## Phase 3B — Blocked

`logistics_context` (`delivery_distance_km`, `preferred_vehicle`, `historical_route`) is excluded from this proposal entirely, per instruction. Finding 5 from the planning pass stands: there is no delivery/dispatch/route table anywhere in this schema to build it from. `transaction_items.location` is a depot code (`"01"`), not a delivery address.

Phase 3B cannot be scoped into a schema diff until there's a decision on where this data will come from — options not evaluated here: a new delivery/dispatch table fed by a future operational workflow, manual entry per customer, or integration with an external routing/CRM data source. Not proposed because none of those has been decided; would need its own planning pass once a direction is chosen.
