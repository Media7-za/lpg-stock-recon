# Phase 3 Planning — Customer Commercial Context API

STATUS: **Planning only.** No SQL proposed here has been run. This is a data-reality
check against the live Supabase project (`oqhpxnaadahohwkslive`) to find out what
`PRD_SLICE_003_CUSTOMER_COMMERCIAL_CONTEXT_API.md` actually requires versus what
exists today, before writing a schema diff.

Source PRD: `lpg-intelligence/lpg/docs/pricing_desk/PRD_SLICE_003_CUSTOMER_COMMERCIAL_CONTEXT_API.md`.

---

## 1. Method

Read the PRD's required output contract field by field, then queried the live
database (`information_schema`, `item_classifications`, `transaction_headers`,
`transaction_items`) to check what each field would actually be computed from,
and validated the three named test customers (TAN002, LIN001, Impendle
Wholesale) exist in real data. No fixtures, no assumptions.

---

## 2. Data Availability, Field by Field

| PRD field | Source | Status |
|---|---|---|
| `customer.code` | `transaction_headers.account_no` | Available |
| `customer.name` | `transaction_headers.account_name` | **Needs a rule** — see Finding 1 |
| `customer.erp_accounts` | Manual/config mapping (multi-account consolidation) | **No source** — see Finding 2 |
| `customer.lane`, `customer.commercial_status` | — | **No source at all** — see Finding 3 |
| `purchase_history.*` | `transaction_headers` filtered to `entry_type = 'Invoice'`, joined to `transaction_items` | Available |
| `pricing.*` | `transaction_items.retail_price` / `qty`, filtered to `item_classifications.business_bucket = 'LPG_CONTENT'` | Available, but needs kg-per-unit — see Finding 4 |
| `average_order.*` | Same join as above | Available, contribution fields depend on Finding 4 and Trip Cost Engine (004B, not yet implemented) |
| `commercial_profile.*` (buying_cycle, expected_reorder_date, commercial_rating, lifetime_contribution) | Derived per `COMMERCIAL_ANALYTICS.md` from purchase_history | Available once purchase_history is built |
| `logistics_context.*` (delivery_distance_km, preferred_vehicle, historical_route) | — | **No source at all** — see Finding 5 |
| `risk.*` | Derived from purchase_history gaps | Available |
| `classification.lpg_skus_included` / `excluded_sku_classes` | `item_classifications` | Available |
| `data_freshness.*` | `max(transaction_headers.created_at)` / `now()` | Available |

---

## 3. Findings Requiring a Decision

### Finding 1 — `account_name` is not a stable customer name

Grouping `transaction_headers` by `(account_no, account_name)` for `BU0003` returns **seven different `account_name` values** for the same account: `"BULWER IMPENDILE"`, `"BULWER IMPENDILE-PAID CASH"`, `"BULWER SUPPLY STORE"`, `"IMPENDLE WHOLESALE"`, plus noise rows like `"DISCOUNT ALLOWED"` and `"FNB APP PAYMENT FROM..."`. The last two aren't customer names at all — they're payment/discount line descriptions that happen to share the account number.

**Needs a decision:** the canonical customer name should likely be the most frequent `account_name` where `entry_type = 'Invoice'`, excluding known non-customer patterns (`DISCOUNT ALLOWED`, `FNB APP PAYMENT...`). Proposing this as the rule, not applying it — confirm before it's load-bearing.

### Finding 2 — Multi-account consolidation has no source table

The PRD requires consolidating `BU0003` (historical), `BU0009` (active), `BU0031` (empties) into one "Impendle Wholesale" commercial customer. This mapping exists only in doctrine prose (`PRD_SLICE_003`'s example) — there is no table anywhere in `lpg-stock-recon` that says "these three ERP accounts are the same commercial customer." Every consolidated customer (Impendle confirmed; likely others) needs this mapping to exist somewhere before the function can group across accounts.

**Needs a decision:** new mapping table (e.g. `customer_account_groups(commercial_customer_id, account_no, account_role)`) versus a config file versus inferring it from name similarity (fragile — Finding 1 shows how noisy `account_name` already is).

### Finding 3 — `customer_lane` and `commercial_status` have no source at all

Confirmed by search: no table, view, or column anywhere in `lpg-stock-recon` stores customer lane (`commodity_wholesale` / `consuming_customer` / etc.) or commercial status (`win_back` / `active_customer` / etc.). `customer_intelligence.md` doctrine says "classify only from evidence" — but there's no evidence-based classification logic built yet, and no field to store a classification even if there were.

**Needs a decision, and it's the biggest open item in this plan:** either (a) build heuristic classification from purchase volume/frequency (risks silently wrong classifications — doctrine explicitly warns against guessing), or (b) add a manually-maintained classification table that a human populates and the function reads, returning `unknown` until classified (matches the PRD's own "missing fields are returned as null/unknown, not guessed" acceptance criterion). Leaning toward (b) for Phase 3, with (a) as a later suggestion-only assist a human confirms — but this is exactly the kind of call that shouldn't be made silently.

### Finding 4 — No kg-per-unit mapping in the database

`item_classifications` has `business_bucket` and `logical_group` but no size or kg value. The kg-per-unit mapping (9/14/19/48/48kg) exists only in `src/lib/skuConfig.ts` (TypeScript, client-side). A Postgres function computing `price_per_kg` or `total_lpg_kg` needs this in the database, not just in the frontend.

**Needs a decision:** add a `kg_per_unit` column to `item_classifications` (5 rows to update, all already identified in `sku_suffix_mapping.md`), or maintain the mapping twice (fragile — two sources of truth for the same 5 facts).

### Finding 5 — `logistics_context` has zero data source

Checked `transaction_items.location` (hoping for a delivery address or route) — it's a depot code (`"01"` for all 544 TAN002 rows), not a delivery location. No delivery/dispatch/route table exists anywhere in the schema that records round-trip distance, vehicle used, or delivery address per order. `invoice_dispatch_logs` (from LSR-3) tracks WhatsApp document delivery status, not physical delivery.

**This is a hard blocker, not a design decision.** `logistics_context.delivery_distance_km`, `preferred_vehicle`, and `historical_route` cannot be built from anything that exists today. They would need to come from a new data source entirely — either a delivery/dispatch table that doesn't exist yet, or manual entry per customer (defeating the Inference-First Rule's purpose for this specific field).

---

## 4. Test Case Validation Against Real Data

Confirmed real and substantial:

| Customer | Account(s) | Real transaction count | Range |
|---|---|---|---|
| TAN002 (Tandoor The Clay Oven) | `TAN002` | 676 | 2023-09-19 → 2026-04-21 |
| LIN001 (Slindokuhle Enterprises) | `LIN001` | 493 (+4 recent) | 2023-11-04 → 2026-06-18 |
| Impendle Wholesale | `BU0003` + `BU0009` + `BU0031` | 313 + 260 + 57 | 2016 → 2026, confirms the 3-account consolidation described in the PRD is real, not hypothetical |

**One discrepancy worth flagging:** `IMPLEMENTATION_HANDOVER.md`'s TAN002 test scenario states "Last purchase: 2026-02-24," but `transaction_headers` shows TAN002's last transaction (any `entry_type`) as 2026-04-21. This needs re-checking once `entry_type = 'Invoice'` and LPG-content-only filtering are applied — the doctrine figure may already be correctly LPG-only and the raw max date includes payments/credit notes, or the doctrine figure may be stale. Not resolved here; flagging for whoever builds the actual query.

---

## 5. Proposed Build Split

Following the same reasoning Architecture Review 001 used to split Vehicle Cost / Trip Cost / Delivery Economics into three slices instead of one: this should not be a single `get_customer_commercial_context()` function, because one part of its output (`logistics_context`) is fully blocked while the rest is buildable now.

- **Phase 3A — Customer Commercial Context** (buildable now, pending Findings 1–4 decisions): `customer`, `purchase_history`, `pricing`, `average_order`, `commercial_profile`, `risk`, `classification`, `data_freshness`.
- **Phase 3B — Logistics Context** (blocked on Finding 5): `logistics_context`. Cannot start until there's a decision on where delivery distance/vehicle/route data will come from.

Recommend proceeding with 3A planning and treating 3B as explicitly out of scope until Finding 5 has an answer — matching the PRD's own fallback ("ask the user only when it cannot be inferred") rather than blocking the whole slice on a field that has no data source yet.

---

## 6. Explicitly Not Done Here

No SQL proposed, no schema diff written, no function created. This document is the feasibility/data-reality pass that a schema diff (matching `CDR-Schema-Diff.md`'s format) would be written against next, once Findings 1–4 have decisions and Finding 5 has a path forward (or an explicit decision to defer `logistics_context` to a later phase).
