# Phase 4A Planning — Vehicle Cost Profile

STATUS: **Planning only. No schema written, no contribution math touched.** Data-reality
check against `lpg-stock-recon` before any schema-diff proposal — same method as
`Context-API-Planning.md` (Phase 3A). Scoped to 004A only, per instruction; 004B
(Trip Cost Engine) and 004C (Delivery Economics Engine) are explicitly held until
004A is grounded.

Source PRD: `lpg-intelligence/lpg/docs/pricing_desk/PRD_SLICE_004A_VEHICLE_COST_ENGINE.md`.

---

## 1. Method

Read 004A's required entities (`OperatingCostSnapshot`, `VehicleCostProfile`,
`PublishedVehicleCostProfile`) field by field, then searched `lpg-stock-recon`
end to end — `information_schema` for any vehicle/fleet/fuel/trip/dispatch
table, the full codebase for every existing reference to the two known
vehicles or any cost-per-km figure, `lpg-intelligence`'s governance docs for
any explicit fuel price, and the raw ERP data exports — for anything that
could ground this engine in something real, the same way TAN002/LIN001/SIY000
grounded Phase 3A.

---

## 2. Data Availability, Field by Field

| 004A field | Source | Status |
|---|---|---|
| `vehicle_registration` | `CS70HKZN`, `CS70HMZN` — read as real South African plate-format registrations, not placeholder codes | Available (2 vehicles, names only) |
| `fuel_consumption_l_per_km` | `PRD_SLICE_004A` § 5, `docs/governance/delivery_vehicle_defaults.md` | Available for both vehicles (0.125, 0.194) |
| `minimum_economic_payload_kg` / `recommended_payload_kg` / `maximum_payload_kg` | Same sources | Available, but incomplete — CS70HKZN has no stated minimum/maximum, only recommended (500kg) |
| `fuel_price_per_litre` | — | **No governed value exists anywhere** — see Finding 2 |
| `active_tyres`, `tyre_lifespan_km`, `tyre_unit_cost` | — | **No source** |
| `service_interval_km`, `standard_service_cost` | — | **No source** |
| `maintenance_cost_per_km` | — | **No source** |
| `annual_insurance_cost`, `annual_licensing_cost` | — | **No source** |
| `purchase_value`, `depreciation_period_years`, `residual_value` | — | **No source** |
| `expected_utilisation_km_per_month` | — | **No source** |
| `driver_hourly_rate`, `assistant_hourly_rate` | `delivery_vehicle_defaults.md` states crew *count* (1 driver, 1 assistant) but not their *rates* | Crew count available; rates **not available** — see Finding 4 |

Roughly a third of what `VehicleCostProfile` needs is available (vehicle identity, fuel consumption, payload). Everything cost-related — the actual point of the engine — is missing.

---

## 3. Findings Requiring a Decision

### Finding 1 — No vehicle/fleet table exists anywhere

Confirmed via `information_schema.tables`: no table with "vehicle," "fleet," "fuel," "trip," or "dispatch" in the name except `invoice_dispatch_logs`/`dispatch_eligible_invoices` (LSR-3 — WhatsApp document delivery tracking, unrelated to physical vehicles). No codebase reference to either vehicle registration outside Pricing Desk's own code. No vehicle/fuel records in the raw ERP data exports (`ERP RAW DATA/`) either — this genuinely isn't tracked in the ERP, which makes sense: an ERP tracks sales and stock, not fleet operating cost. This is expected, not a gap in the search.

**Not a decision point** — there is nothing to reconcile against, unlike Phase 3A's account-name-drift problem. This is greenfield.

### Finding 2 — The app already has a "shadow" vehicle cost model, and it doesn't match 004A's shape

Two flat per-km rates are hardcoded, duplicated in two places:

```
src/features/pricing-desk/data/fixtures/pricingDeskFixtures.ts  — recommendedVehicleFor()
src/features/pricing-desk/hooks/usePricingDeskData.ts           — computeDeliveryEconomics()

CS70HKZN: R3.66/km
CS70HMZN: R5.67/km
```

Both match `lpg-intelligence`'s `delivery_economics.md` skill's "Fleet Baseline" table exactly — so this isn't an app-side invention, it's already doctrine, just never decomposed. 004A's model produces `total_running_cost_per_km` as a *sum* of seven components (fuel + tyre + service + maintenance + insurance + licensing + depreciation). The current R3.66/R5.67 figures are single opaque numbers with no stated breakdown.

**Needs a decision:** once 004A is built with real component costs, `total_running_cost_per_km` will almost certainly not equal R3.66/R5.67 exactly. Is the intent to (a) treat R3.66/R5.67 as an approximate placeholder to be superseded once real numbers are entered (most likely correct, matches how `average_net_contribution` etc. are already openly `null` pending real engines), or (b) calibrate the new component-based model to reproduce these two numbers as closely as possible, on the theory that they were set by someone with real knowledge of actual costs? Recommend (a) — but this is a real business-facing number that currently drives every delivery cost estimate in the shell, so flagging rather than assuming.

Also worth noting as a minor, separate cleanup item: the same `{ vehicle, ratePerKm }` selection logic is duplicated verbatim in two files. Not urgent, not part of this planning pass, but will need reconciling once 004A/004B replace it — noting so it isn't rediscovered as a surprise later.

### Finding 3 — No governed `fuel_price_per_litre`

Reverse-engineering the two current rates: `3.66 / 0.125 = R29.28/L` (CS70HKZN) and `5.67 / 0.194 = R29.23/L` (CS70HMZN) — close but not identical, meaning the two figures weren't derived from one single shared fuel price applied consistently. (Ruled out R29.00–29.27/kg figures appearing elsewhere in doctrine as a false-positive match — those are LPG selling prices, unrelated to diesel/fuel cost.)

**Needs a decision:** what is the actual current fuel price the business pays, and is it one province-wide diesel price for both vehicles (most likely) or does it vary? This is a real number someone needs to supply — not inferable from any data source found.

### Finding 4 — `delivery_vehicle_defaults.md` explicitly defers cost rates to a source that doesn't exist yet

That governance document states: *"The applicable fuel price, driver hourly rate, assistant hourly rate, tyre cost per kilometre, service cost per kilometre, drop-off time, and delivery markup are maintained by the Delivery Cost Skill or its governed rate source."* No such source currently holds any of these — `delivery_economics.md` (the skill referenced) only has the flat Fleet Baseline table, not a decomposition. This is a pre-existing doctrine promise that 004A is the first real attempt to fulfil, not a new gap introduced by this planning pass.

### Finding 5 — CS70HKZN's payload thresholds are incomplete

`PRD_SLICE_004A` § 5 states only `recommended_payload_kg: 500` for CS70HKZN — no `minimum_economic_payload_kg` or `maximum_payload_kg`, unlike CS70HMZN which has all three. Existing app logic (`usePricingDeskData.ts`) treats 500kg as a hard cutover point to the larger vehicle, implying CS70HKZN's *maximum* is close to 500kg, but that's an inference from code behaviour, not a stated fact.

**Needs a decision:** confirm CS70HKZN's actual minimum/maximum payload, or explicitly mark it as unknown the same way Phase 3A returns `null` rather than guessing.

---

## 4. What Should Be Seeded Manually

Everything in the "No source" rows of the table in Section 2 has no data anywhere to derive it from — it isn't computable from ERP transactions the way Phase 3A's customer purchase history was. All of it would need to come from someone who knows the business's actual fleet costs:

- Current diesel price per litre.
- Per-vehicle: active tyre count, tyre unit cost, tyre lifespan (km), service interval (km), standard service cost, maintenance cost per km, annual insurance cost, annual licensing cost, purchase value, depreciation period, residual value, expected monthly utilisation.
- Driver and assistant hourly rates.
- CS70HKZN's missing minimum/maximum payload figures.

This is real-world business data, not something to fabricate or approximate for the sake of having numbers. Recommend treating this the same way Phase 3A treated `customer_lane`/`commercial_status`: fields that exist in the schema and are legitimately `null`/unset until a human supplies them, rather than seeded with invented placeholder values.

---

## 5. Scope Boundary (per instruction)

This planning pass covers 004A only. It does not:

- Propose a schema (that's the next, separate step, mirroring `Phase-3A-Schema-Diff.md` — only after these findings are reviewed).
- Touch 004B (Trip Cost Engine) or 004C (Delivery Economics Engine) — both remain held until 004A is grounded in real numbers, per instruction.
- Calculate or reference customer contribution in any form — `average_net_contribution` and related fields stay exactly as they are (`null`) until 004C, which is out of scope here entirely.
- Change the existing R3.66/R5.67 shadow rates in the app — Finding 2 is surfaced as a decision to make later, not resolved now.

---

## 6. What This Means for Scoping the Schema Diff (when that step comes)

Not a proposal — just naming what the next step will need to resolve, based on what this pass found:

1. A decision on Finding 2 (supersede vs. calibrate to the current shadow rates).
2. A real fuel price and the full per-vehicle cost breakdown for both CS70HKZN and CS70HMZN — without at least one vehicle's numbers, there's nothing to seed and the engine would ship with two `null`-cost vehicles, which defeats the purpose.
3. Confirmation of CS70HKZN's payload thresholds.

None of these block writing the schema itself (the schema doesn't care whether the values are known yet), but they do block the seed step — same shape of issue as Phase 3A's `customer_lane`/`commercial_status`, where the table can exist and be correct before every row is fully classified.
