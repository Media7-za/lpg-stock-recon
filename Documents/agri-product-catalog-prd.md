# PRD/Tech Spec: Agri Product Catalog

## 1. Problem

The Orders-Module migration (see the companion `orders-module-delivery-migration-prd.md`) ported
an order-taking UI that assumes a small, curated product list — appropriate for LPG, which has
roughly a dozen real SKUs. But the ERP's real stock master shows the business is **89% Agri
commodities by SKU count** (feed, seed, fertilizer, pesticides, animal health, pet food — 1,027 of
1,154 active stock items), a fact nobody had quantified until this thread. A dropdown-style
product picker cannot work at that scale, and the SKUs it would need to show had no real
classification anywhere in the system before this work started.

**Written 2026-09-13**, immediately after building the ERP sync pipeline described in §3 — this
document captures the design decisions made while building it and scopes what's left.

## 2. Goals

- Bring the ERP's real stock master into this project as the authoritative source for product
  classification — not a keyword-guessing pass over `transaction_items` descriptions, which was
  the original (and inferior) plan before a real inventory export became available.
- Populate Orders-Module's `products` table from that real data, so `order_items.product_id`
  resolves to genuine, priced, categorized products instead of nothing.
- Design an order-taking UI that scales to 1,000+ SKUs — a search-first flow, not a picker.

## Non-Goals (this pass)

- No decision yet on whether LPG and Agri share one order-taking form or get two separate ones —
  see §6, Open Question.
- No changes to the Vehicle/Driver/Route/Trip/Delivery side of the Orders-Module migration —
  that's the companion document's scope entirely.
- Weight-per-SKU backfill for Trip capacity math is flagged (§4) but not solved here.

## 3. What's Built — the ERP Sync Pipeline (2026-09-13, done)

**Source:** a real ERP Stock Master export, `STOCK.TXT` (committed to
`analysis/inventory/data/Raw/STOCK.TXT` on `main`, 2026-09-13) — a genuine header-row CSV (unlike
the headerless positional HEADERS/ITEMS transaction exports this project already parses), 264
columns, 1,404 total stock rows.

**Column scope, confirmed with the operator directly** rather than importing all 264: `STOCKNO`,
`DESCRIP`, `COST`, `RETAILA` (tier-1 retail price — **confirmed only tier 1 is used for AGR**,
the other five retail tiers `RETAILB`–`F` are not needed), `UNIT`, `GROUP`, `CATEGORY`, `BRAND`,
`WEIGHT`, `ACTIVE`, `SUPPCODE`. Everything else (roughly 200 columns of per-warehouse
`MIN`/`MAX`/`INSTOCK`/`PORDER` stock-level fields across 40 periods, plus `PRODBOM`, `LOADFAC`,
and the unused retail tiers) was deliberately excluded as noise for this purpose.

**`erp_inventory` table** — new, live on `oqhpxnaadahohwkslive`, RLS enabled (`"Authenticated full
access"` policy, matching `transaction_headers`/`transaction_items`). Keyed on `stockno` as
primary key rather than the fingerprint-delta pattern the transaction-log tables use — this is a
deliberate difference: the stock master is a **current-state snapshot** (one row per SKU,
re-exported whole each time it's refreshed), not an append-only ledger, so every sync **upserts
on conflict(stockno)**, always overwriting cost/price/category with the latest export rather than
filtering out "already seen" rows the way `syncHeaders`/`syncItems` do.

**Ingest filter:** `ACTIVE = 'Y'` only. The master carries dead/superseded stock codes — e.g.
`00000001` ("MULTI-BRAND COARSE CRUSH 50KG", active, R440 tier-1 price) sits alongside
`00000001050` ("COARSE CRUSH 50KG", inactive, R0 pricing) — the same product under an old,
discontinued code. Importing both would surface dead SKUs with zero pricing in any future search
UI.

**Code:** `ERPImportEngine.parseInventory()` (`src/lib/erpImportEngine.ts`) — uses PapaParse with
`header: true`, unlike `parseHeaders()`/`parseItems()` which parse fixed-position columns by
index on headerless files. `SyncService.syncInventory()` (`src/lib/syncService.ts`) — batched
upsert, logs to `sync_logs` with `file_type: 'INVENTORY'`. Wired into the existing Data Hub
upload screen (`src/components/dashboard/DataHub.tsx`) as a third card ("Stock Master"),
identical upload/progress/error/log UX to the existing Headers/Items cards.

**Loaded live:** all 1,154 active rows from the supplied export. Verified counts:

| | count |
|---|---|
| Total active SKUs | 1,154 |
| `CATEGORY = 'AGR'` | 1,027 |
| `CATEGORY` in `('LPG','CYL')` | 41 |
| `CATEGORY` blank (misc: delivery codes, labour, materials, etc.) | 43 |

`GROUP` further segments the 1,027 Agri rows into real operational categories, no inference
needed: `FEED` (174), `PESTIC` (149), `SEED` (80), `FERTIL` (41), `HERBIC` (38), `COMMOD` (33),
`HEALTH` (265, animal health), `PETFOO` (96), plus `LPG AC` (57 — LPG accessories: regulators,
hoses, couplers, sold as Agri-side stock despite being gas-related hardware) and the gas-side
`LPG`/`GAS`/`CYL` groups.

## 4. `products` Derivation — Done (2026-09-13)

**`products` is now populated** — 1,154 rows, mirroring `erp_inventory` exactly (1,027 `AGR`).
Mapping applied:

```
products.id          <- erp_inventory.stockno   (reused directly as id -- products.id has no
                                                   DB-side generator, and the Step 3 port already
                                                   treats product.id as an opaque string, not
                                                   numeric, so there's no format to collide with)
products.stockno     <- erp_inventory.stockno
products.description <- erp_inventory.description
products.category    <- erp_inventory.category
products.group       <- erp_inventory.group
products.brand       <- erp_inventory.brand
products.weight      <- erp_inventory.weight
```

**Kept in lockstep going forward, not a one-off script.** `SyncService.syncInventory()`
(`src/lib/syncService.ts`) now upserts into `products` immediately after each `erp_inventory`
batch succeeds, on every future Stock Master re-upload — avoiding two copies of
category/description/etc. that could silently drift apart.

**Verified end to end with real data**: ran the exact transaction `upsert-order` executes —
insert order → insert order_item referencing a real product (`00000030`, "WHOLE YELLOW MAIZE
50KGS") against a real `commercial_customers` row — directly via SQL. Succeeded cleanly; cleaned
up after. This closes the blocker noted in the companion delivery-migration PRD §6/§9: the
`upsert-order` function's remaining failure is now *only* the missing `DATABASE_URL` secret, not
also an empty product catalog.

**Still not mapped, deliberately: `cost`/`retail_tier1`.** `products` has no columns for pricing
today — if the order-taking UI needs to show price, that's a schema addition to `products` (or a
join back to `erp_inventory` at read time, avoiding duplicated pricing data that could drift).
Not decided yet; nothing currently needs it, since no UI reads from `products` yet.

**Not yet built:** weight backfill (still ~5% coverage on Agri SKUs) and the search-first
order-taking UI itself (§ below) — the data is ready, the UI isn't.

**Weight coverage is poor.** Only 45 of the 1,027 active `AGR` rows have a non-zero `WEIGHT` in
the source export — the rest are `0.0000`. This matters beyond display: the companion delivery
migration's Trip domain has a `calculateGrossWeight` utility for vehicle-capacity checks, and it
will silently under-report load weight for ~95% of Agri SKUs unless this gets addressed. Most bag
sizes are already legible from `DESCRIP` text (e.g. "50KG", "25KG", "10KG" appear directly in the
name) — a regex-based fallback extracting weight from the description is the likely fix, not
attempted here.

**Search-first order-taking UI — designed, not built.** Sketched during this thread:

1. **Typeahead search**, not a dropdown — debounced search-as-you-type against
   `description`/`stockno`, same pattern already built for Payment Collections' customer picker.
2. **Category filter chips** above the search box, sourced directly from `GROUP` (Feed, Pesticides,
   Seed, Fertilizer & Soil, Herbicides, Commodities, Animal Health, Pet Food, etc.) — real ERP
   categories, not invented ones.
3. **Per-customer "recently ordered" shortcuts** — since Agri and LPG customers are the same
   `commercial_customers` rows, the order form could show each customer's own top-N previously
   bought Agri items (from `transaction_items`) as quick-add chips before the operator even
   types, since most reorders repeat the same handful of SKUs.
4. Weight populated per SKU (§ above) feeds directly into Trip's existing capacity-check utility
   once available — not a separate feature, just closing the data gap that utility already
   expects to be filled.

## 5. Why the ERP Source Beats the Original Plan

Before `STOCK.TXT` was available, the fallback plan was to classify the ~1,237 unclassified stock
numbers already visible in `transaction_items` by keyword-matching their free-text descriptions
(the same technique `item_classifications`/`business_bucket` used for the 15 known LPG SKUs).
That would have worked, approximately, but every category would have been inferred and
maintained by hand. The real export makes this moot: `CATEGORY`/`GROUP` are already correct,
already maintained by whoever runs the ERP, and require zero guessing. The keyword-matching
approach is no longer needed and should not be revived unless the ERP source becomes unavailable.

## 6. Open Question — One Order Form or Two?

Not yet decided. LPG (a dozen SKUs, low search cardinality) and Agri (1,027 SKUs, search-first)
would hit the same `products`/`orders` tables either way, so there's no data-model reason they
must be split. The open question is purely UX: does one shared order-taking flow serve both well,
or does forcing a small, simple LPG picker and a large, search-heavy Agri catalog into one form
produce an awkward compromise for both? Needs a decision before the search UI (§4) gets built,
since the answer changes where the category-filter/search-bar work lives.

## 7. Phasing

| Phase | Scope | Status |
|---|---|---|
| ERP inventory sync pipeline | `erp_inventory` table, `parseInventory`/`syncInventory`, Data Hub UI card | **Done**, live, 1,154 rows loaded |
| `products` derivation | Map `erp_inventory` → `products`, kept in lockstep on every future sync | **Done** (2026-09-13), verified end to end with a real order/order_item |
| Weight backfill | Regex-extract bag size from `DESCRIP` where `WEIGHT = 0` | Not started |
| One-form-vs-two decision | UX call, needed before the next line | Open question (§6) |
| Search-first order UI | Typeahead + category chips + per-customer shortcuts | Designed, not built |
| Pricing display decision | New `products` columns vs. read-time join to `erp_inventory` | Not decided |

## 8. Risks

- **Re-running the STOCK.TXT import will silently correct anything wrong today** (upsert-on-
  `stockno` always takes the latest export as truth, for both `erp_inventory` and now
  `products`) — good for staying current, but means a bad export overwrites good data with no
  versioning or diff shown. Worth a "what changed" summary in the sync UI if this becomes a
  recurring operational concern, not built now.
- **`products.id` reusing `stockno` directly is a one-way door once real orders exist.** Fine
  today (`order_items` has 0 rows), but if a future ERP re-code ever changes a `stockno` for the
  same physical product, any historical `order_items.product_id` referencing the old code would
  need a real migration, not just an upsert. Not a problem yet — noted so it isn't a surprise
  later.
