# PRD/Tech Spec: Orders-Module Delivery Scheduling Migration

## 1. Problem

An external "Orders-Module" system already exists (real order-taking, vehicle/driver/route
management, and delivery tracking) but lives outside this codebase, disconnected from the real
customer/ERP data `lpg-stock-recon` already owns. A phased migration began 2026-08-23 to port its
domain code and UI into this repo, reusing `commercial_customers` as the canonical customer
anchor instead of standing up a second customer identity. This document consolidates that
migration's history — previously scattered across five branches' commit messages, not written
down anywhere as a single source of truth — and states what's actually live versus what's still
sitting unmerged.

**Written 2026-09-13, after the fact**, once a git/DB audit surfaced that the migration had
stalled mid-phase with no consolidated record of state. Everything under "History" below is
reconstructed from real branch/commit/DB inspection on that date, not from a plan written in
advance — this PRD is catching up to work already done, then taking over as the live doc going
forward.

## 2. Goals

- Bring order-taking, vehicle/driver/route assignment, and delivery tracking into this repo,
  sharing the same live customer and product data instead of maintaining a second system.
- Preserve the "portable business logic first, UI second" discipline the original port already
  used — pure functions (weight calculations, order-number generation) get ported directly;
  anything DB-dependent gets rebuilt against this project's real schema, not assumed compatible.
- Anchor every new table's customer relationship on `commercial_customers`, never inventing a
  second customer table — this was already done correctly in the work to date (see §4) and must
  stay true for anything still to come.

## Non-Goals (current phase)

- No changes to the existing LPG reconciliation, solicitation, or pricing-desk features — this is
  additive.
- No decision yet on whether Agri commodities (see the companion
  `agri-product-catalog-prd.md`) and LPG share one order-taking flow or two — that's scoped
  separately and only touches the `products`/order-form layer, not this document's Vehicle/
  Driver/Route/Trip/Delivery scope.

## 3. History — What Was Actually Built (2026-08-23)

Five sequential branches, each building on the last, none merged to `main`:

| Branch | Scope | Key artifacts |
|---|---|---|
| `claude/orders-module-migration-phase2` | DB schema (13 tables + 2 Postgres extensions) added directly to the live project; portable (non-DB-dependent) UI components and business logic ported | — |
| `claude/phase4-step1-vehicle-driver-route-area` | Vehicle, Driver, Route, Area domain code ported | `src/lib/api/vehicles.ts` (`listVehicles()`) |
| `claude/phase4-step2-product-customer` | Product and Customer domain code ported | maps onto the *existing* `products` table and `commercial_customers` — no new customer table created (confirmed live, §4) |
| `claude/phase4-step3-order-orderitem` | Order + OrderItem domain, scoped to "form only" per decision D-04x | `order-form.tsx` (900 LOC) at `/orders/new` and `/orders/:id/edit`; `upsert-order` Edge Function (atomic multi-table transaction, deployed but never verified — see §6) |
| `claude/phase4-step4-trip` | Trip domain, plus a narrow read-only Delivery slice pulled forward from Step 5 | `src/lib/api/trips.ts`, `src/lib/api/deliveries.ts` (`listUnassignedDeliveries()` only); `upsert-trip` Edge Function written but deliberately **not deployed** (held pending `upsert-order` verification) |

**The DB schema is live regardless of branch-merge state.** This project's established
convention (no `supabase/migrations/` folder is used anywhere in this repo) means schema changes
land directly on the Supabase project the moment they're applied, independent of when — or
whether — the application code that uses them gets merged to `main`. Verified live on
`oqhpxnaadahohwkslive` (2026-09-13):

```
routes, areas, vehicles, drivers, driver_auth_tokens,
orders, order_items, order_events,
trips,
deliveries, delivery_items, delivery_returns, delivery_proofs
```

All 13 tables exist with real columns and foreign keys. All currently have **0 rows** — nothing
has ever flowed through this pipeline for real.

**Unrelated same-named-concept warning:** a separate Pricing Desk feature (`Delivery Cost
Calculator`, branch `claude/delivery-cost-calculator-model-oly4q5`) needed its own `vehicles` /
`vehicle_cost_profiles` tables and had to rename them to `delivery_vehicles` /
`delivery_vehicle_cost_profiles` specifically to avoid colliding with *this* migration's real
`vehicles` table (Step 1). Two different "vehicle" concepts exist in the schema — this
migration's `vehicles` (real fleet vehicles used for trip assignment) and Pricing Desk's
`delivery_vehicles` (cost-modeling profiles, not a live fleet). Do not conflate them.

## 4. Data Model — Verified Live (2026-09-13)

The critical design question for any port like this is: does it reuse the real customer/product
entities this repo already has, or does it invent parallel ones? Checked directly against live
foreign keys:

```
orders.customer_id        -> commercial_customers.id
deliveries.customer_id    -> commercial_customers.id
order_items.product_id    -> products.id
deliveries.order_id       -> orders.id
deliveries.trip_id        -> trips.id
trips.driver_id           -> drivers.id
trips.route_id            -> routes.id
trips.vehicle_id          -> vehicles.id
areas.route_id            -> routes.id
```

**Confirmed correct:** the port anchors on `commercial_customers`, not the unrelated `customers`
table (which is a pre-existing, 2-row WhatsApp-dispatch feature table, explicitly out of scope
for every feature that touches real customer data — see the Solicitation PRD's rulebook table
scope map for the same exclusion). No second customer identity was introduced. Likewise,
`order_items.product_id` reuses the existing `products` table rather than creating a parallel
catalog.

`commercial_customers` also carries an `area_id` column (pre-existing on the live table, columns
verified: `id, customer_name, customer_lane, commercial_status, primary_contact, notes,
created_at, updated_at, avg_cycle_days, last_order_date, last_order_value, contact_phone,
address, lat, lng, google_maps_url, area_id, active`) — meaning customers can already be tied to
a Route/Area domain object, which the Trip/Route work above populates. Not yet exercised end to
end (routes/areas both have 0 rows), but the wiring exists.

**`products` schema** (pre-existing table, reused, not created by this migration):
`id, stockno, description, category, group, brand, weight, tare_weight, total_weight, sku,
createdAt, updatedAt` — note the last two columns are camelCase, a legacy artifact from wherever
this table originated (everything else in this schema is snake_case); flagged, not fixed, since
changing it isn't in scope here and nothing currently depends on the casing being wrong.

## 5. Known Gaps — Disclosed by the Original Work, Not Newly Found

Carried over verbatim from the Step 3/Step 4 commit messages, since these are exactly the kind of
thing this consolidated doc exists to stop from getting lost:

- **Creating an Order does not create a matching Delivery row.** Step 3's `upsert-order` function
  deliberately didn't replicate that companion-creation transaction (out of its "form only"
  scope). Until this is closed — either by extending `upsert-order` or by Step 5 — `deliveries`
  will stay empty even once real orders start flowing, and `listUnassignedDeliveries()` (Step 4)
  will keep correctly returning nothing.
- **Trip detail (`/trips/:id`) and edit (`/trips/:id/edit`) pages don't exist.** `TripsPage` links
  to them; those links 404 today.
- **Step 5 (the real Delivery domain) was never started** — `DeliveryItem` writes, `DeliveryReturn`,
  `DeliveryProof`, and the tracking/proof UI are all unbuilt. A thin read-only slice was pulled
  forward into Step 4 (`listUnassignedDeliveries()` only) specifically so Trip assignment had
  something real to query, but that's the full extent of what exists.
- **One UX detail didn't carry over 1:1 from the original system:** the vehicle-availability
  dropdown in `NewTripPage` is computed locally via `listTrips()` rather than via a
  server-enriched `activeTrip` field the original had. Same UX outcome, different implementation
  path — the server-side vehicle-conflict guard (`INV-010`, inside `upsert-trip`) still enforces
  the actual constraint regardless of what the dropdown shows.

## 6. Current Blocker — `upsert-order` Is Broken

**Diagnosed 2026-09-13.** `upsert-order` is deployed (`ACTIVE`, version 1) but has never
successfully run. Verified two ways:

1. **Live invocation test** (run from an unrestricted machine, since this project's cloud sandbox
   blocks direct HTTPS to `*.supabase.co` by network policy): `POST /functions/v1/upsert-order`
   with a real `commercial_customers.id` and a throwaway test product returned **HTTP 500**.
   Function logs (`function_logs`, not `function_edge_logs` — the latter only shows the
   gateway-level 500, not the actual thrown error) showed:
   ```
   UPSERT_ORDER_ERROR { message: "[upsert-order] DATABASE_URL secret is not configured", ... }
   ```
   This matches the function's own guard clause (`getDb()`, `index.ts:36`) exactly — it fails
   before opening any transaction.
2. **SQL-logic verification** (run separately, since the sandbox can't reach the HTTP endpoint):
   the exact transaction `upsert-order` executes — insert order → insert order_item → insert
   order_event, against a real `commercial_customers.id` — was run directly via SQL and succeeded
   cleanly against the live schema, then rolled back via explicit cleanup. This proves the SQL
   logic itself is sound; the failure is purely the missing secret, not a schema mismatch.

**Blast radius confirmed clean.** Because the function fails before its transaction opens, no
`orders`/`order_items`/`order_events` rows were ever created by any failed attempt — verified via
direct count (all zero) both before and after the diagnostic test.

**Update 2026-09-13: the other blocker is cleared.** `products` was empty when this was first
diagnosed, which meant `upsert-order`'s create mode couldn't have succeeded even with the secret
set (it requires a non-empty `items` array with valid `productId`s). The companion
`agri-product-catalog-prd.md` now has `products` populated (1,154 rows, derived from a real ERP
export) and kept in lockstep going forward — verified directly by running the same insert
transaction against a real product and customer. `DATABASE_URL` is now the *only* remaining
blocker.

**Fix requires a human with dashboard or CLI access** — no MCP tool in this project can read or
set Edge Function secrets, and constructing a database connection string with a real password is
not something an agent should do unprompted. Two paths, either works:

- **Dashboard:** Project Settings → Database → copy the connection string (reset the DB password
  there first if it isn't known) → Project Settings → Edge Functions → Secrets → add
  `DATABASE_URL`.
- **CLI:** `supabase login && supabase secrets set DATABASE_URL="postgresql://postgres.oqhpxnaadahohwkslive:[password]@[host]:5432/postgres" --project-ref oqhpxnaadahohwkslive`

Once set, re-run the same live-invocation test (throwaway product → real invoke → check for
`200` → clean up) before trusting the function for real use.

## 7. RLS — Open Security Item

**Flagged 2026-09-11, still open.** All 13 tables listed in §3 have Row Level Security disabled —
fully exposed to the `anon` key, readable and writable by anyone with it. This matches the same
pattern already accepted (deliberately, for now) on `solicitation_queue` and
`outstanding_payments` — access is meant to be mediated by a service-role Edge Function, not
direct client reads, **except that this migration's own client code contradicts that pattern**:
`getOrder()`, `listTrips()`, `getAvailableTrips()`, and `listUnassignedDeliveries()` are all
direct `supabase-js` reads using the authenticated client key, not the service role. This is a
real gap, not just a formality — the moment RLS gets enabled without matching policies, those
reads go dark.

**Do not enable RLS on these tables without also writing matching policies at the same time** (the
`erp_inventory` table added alongside the companion Agri PRD used a single `"Authenticated full
access"` policy — `for all to authenticated using (true) with check (true)` — matching
`transaction_headers`/`transaction_items`'s existing pattern; the same shape is the likely right
answer here, but confirm against each table's actual access needs before applying).

## 8. Phasing — Where This Picks Up

| Phase | Scope | Status |
|---|---|---|
| Phase 2 (DB schema + portable logic) | 13 tables, 2 extensions, pure-function ports | **Done**, live |
| Phase 4 Step 1 (Vehicle/Driver/Route/Area) | Domain code + `listVehicles()` | **Done**, unmerged branch |
| Phase 4 Step 2 (Product/Customer) | Confirmed reuse of `products`/`commercial_customers` | **Done**, unmerged branch |
| Phase 4 Step 3 (Order/OrderItem) | Form UI + `upsert-order` | **Done, but broken** (§6) |
| Phase 4 Step 4 (Trip) | Trip UI + `upsert-trip` (undeployed) + thin Delivery read slice | **Done**, `upsert-trip` deliberately held back |
| **Next: verify `upsert-order`** | Confirm `DATABASE_URL` secret, re-run live test | **Blocked on human action only** — `products` is populated (§6 update) |
| **Next: deploy `upsert-trip`** | Was held specifically pending `upsert-order` verification | Blocked on the above |
| **Next: close the Order→Delivery gap** | Either extend `upsert-order` or fold into Step 5 | Not started |
| Phase 5 (real Delivery domain) | `DeliveryItem` writes, `DeliveryReturn`, `DeliveryProof`, tracking/proof UI | Not started |
| RLS remediation | Matching policies for all 13 tables | Not started (§7) |

## 9. Risks

- **Merging any of the 5 branches to `main` right now would ship broken order-creation** —
  `upsert-order` 500s on every real call until the secret is set. Worth deciding explicitly
  whether to merge branches as their own PRs once each step is independently verified, or hold
  all of them until Step 5 closes the Delivery gap and the whole flow works end to end.
- **RLS exposure is live today**, not a future risk — anyone with the `anon` key can currently
  read or write all 13 tables. Low practical exposure while everything has 0 rows, but that stops
  being true the moment real data starts flowing.
- **This document itself can go stale the same way the migration's history did** — update it
  directly (dated entries, like the Solicitation PRD's convention) rather than letting future
  decisions live only in commit messages.
