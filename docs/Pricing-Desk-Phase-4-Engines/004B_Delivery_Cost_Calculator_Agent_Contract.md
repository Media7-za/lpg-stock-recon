# 004B — Delivery Cost Calculator: Agent Tool Contract

**Status:** v0. Schema, seed data, and Edge Function deployed to the live
`lpg-stock-recon` Supabase project (`oqhpxnaadahohwkslive`). Verified so
far by direct database queries and 29/29 assertions from a full local
Postgres acceptance run (`scripts/deliveryCostAcceptance.ts`). **Not yet
verified over live HTTP** — the deploying session's network egress policy
blocks direct connections to `*.supabase.co`, so the final POST→GET smoke
test has to run from a machine that isn't sandboxed that way. Treat this
contract as frozen in shape, but do not rely on it in production until that
smoke test has actually passed once.

This is the only interface Pricing Desk agents should use to price a
delivery. It hides 004A (Vehicle Cost Profile) and 004B (Trip Cost Engine)
entirely: an agent supplies a load and a route, and gets back a governed
execution cost and a delivery cost per kg — never the other way around.

## Why this exists

Before this tool, Pricing Desk used a fixed, undocumented R/km figure per
vehicle with no visibility into what made up that number, no record of
which vehicle a quote assumed, and no way to tell a governed cost from a
guess. This tool doesn't yet have the full cost breakdown either (see
**Governance status** below) — but every number it returns says exactly
how confident to be in it, and every calculation is stored immutably so a
quote from last month can always be reconstructed exactly as it was priced.

## Tool 1: `calculate_delivery_cost`

**Call it whenever a delivery scenario needs an execution cost or a
delivery cost per kg.** Never compute `required_trips`, an R/km rate,
labour cost, or delivery cost/kg by hand — this tool owns that logic, and
its ranking/governance rules will keep changing underneath the same
contract as 004A fleet data improves.

### Input

```json
{
  "customer_id": "SHOPLINE001",
  "order": {
    "total_lpg_kg": 480
  },
  "route": {
    "round_trip_km": 98,
    "estimated_trip_hours": 2.5,
    "tolls_per_trip": 0
  },
  "vehicle": {
    "mode": "recommend"
  },
  "calculation_date": "2026-09-04"
}
```

- `order.total_lpg_kg` — required, > 0.
- `route.round_trip_km`, `route.estimated_trip_hours` — required, > 0. The
  agent (or a separate route/distance tool) is responsible for producing
  these; this tool does no geocoding or routing itself.
- `route.tolls_per_trip` — optional, defaults to 0. **Per single round
  trip**, not the total — the tool multiplies it by `required_trips`
  itself. Don't pre-multiply.
- `vehicle.mode` — `"recommend"` (default path) or `"override"`.
  - `"override"` requires `vehicle.vehicle_id` and should carry
    `vehicle.override_reason` for the audit trail.
  - If the overridden vehicle has no confirmed payload at all, also pass
    `vehicle.override_payload_kg` — otherwise the call fails rather than
    guessing a capacity.
- `calculation_date` — optional, defaults to today. Selects which
  `VehicleCostProfile` is effective (see **Effective-dated profiles**
  below); pass a real date when pricing something other than "right now"
  (e.g. reconstructing a past quote, or pricing an agreement starting on a
  future date).

### Output

```json
{
  "calculation_id": "...",
  "status": "partial",
  "vehicle": {
    "vehicle_id": "...",
    "selection": "recommend",
    "registration": "CS70HKZN",
    "maximum_payload_kg": 500,
    "payload_governed": false,
    "reason": "lowest total execution cost among governed, active vehicles",
    "alternatives_considered": []
  },
  "load": { "total_lpg_kg": 480, "required_trips": 1 },
  "route": { "round_trip_km": 98, "trip_hours": 2.5 },
  "costs": {
    "running_cost": 358.68,
    "labour_cost": 625.00,
    "toll_cost": 0,
    "total_execution_cost": 983.68,
    "labour_rates_governed": false
  },
  "allocation": { "delivery_cost_per_kg": 2.0493 },
  "snapshot": {
    "vehicle_cost_profile_id": "...",
    "calculated_at": "2026-09-04T09:20:00.000Z",
    "cost_profile_status": "provisional",
    "cost_profile_source": "legacy_pricing_desk_rate"
  },
  "warnings": [
    "Cost profile ... is provisional (source: legacy_pricing_desk_rate); full 004A cost decomposition pending.",
    "CS70HKZN maximum payload is not formally confirmed; using its recommended payload (500kg) as a conservative proxy.",
    "Driver/assistant hourly rates are not governed for this vehicle; used unconfirmed assumed rates (driver R150/h, assistant R100/h)."
  ]
}
```

### Governance status — always surface this to the human

`status` is `"calculated"` only when every governance dimension is met:
the chosen vehicle's cost profile is `PUBLISHED` (not `PROVISIONAL`), its
payload is a confirmed `maximum_payload_kg` (not a `recommended_payload_kg`
proxy), and its driver/assistant hourly rates are set (not the fallback
assumption). Otherwise `status` is `"partial"` and `warnings` names exactly
which dimension is unconfirmed, in plain language.

As of this contract's v0 seed, **both fleet vehicles return `"partial"`**
(provisional R/km rate, unconfirmed payload, unconfirmed labour rates) —
that is expected, not a bug. **Always relay material warnings to the human**
when quoting off a `"partial"` result; don't silently present
`delivery_cost_per_kg` as a settled number.

### Vehicle recommendation

`mode: "recommend"` prices every active vehicle with a resolvable payload
and an effective cost profile against the given load/route, and returns
whichever has the lowest `total_execution_cost` — not the smallest vehicle,
not a fixed default. `alternatives_considered` lists every other candidate
it scored, so a human can see why (e.g. a large load might make a
higher-R/km vehicle cheaper overall because it needs fewer trips). A
vehicle with no confirmed payload is silently excluded from
`"recommend"` — it has to be reached via `"override"` with
`override_payload_kg` instead, never guessed into the running.

### Effective-dated profiles

Cost profiles are calendar-dated (`effective_from`/`effective_to`), and the
tool resolves whichever profile actually covers `calculation_date` —
preferring `PUBLISHED` over `PROVISIONAL` when both apply — rather than
always taking "whatever is newest right now". Pricing a historical deal
with `calculation_date` in the past will not pick up a rate published
since then.

### Snapshots are immutable

Every result is stored as a `delivery_cost_calculations` row with the full
input and result captured as JSON, plus the specific rates used
(`running_cost_per_km_snapshot`, `driver_hourly_rate_snapshot`, etc.).
Editing the live `VehicleCostProfile` later — because real fuel/tyre/labour
data lands — never changes a past calculation's stored numbers. Use
`get_delivery_cost_calculation` to retrieve exactly what was quoted, ever.

## Tool 2: `get_delivery_cost_calculation`

Retrieves a previously stored calculation by `calculation_id`, in the same
shape `calculate_delivery_cost` returned it. Use this to answer "why did we
quote this delivery at R2.05/kg" — the answer is always reconstructable
from what's stored, not from re-running the calculation against today's
rates.

## What the agent must never do

- Never compute `required_trips`, R/km, labour cost, or delivery cost/kg
  itself — always call `calculate_delivery_cost`.
- Never pick a vehicle by assumption ("the small one is usually cheaper") —
  let the tool's ranking decide, or pass an explicit, reasoned override.
- Never present a `"partial"` result's numbers without surfacing the
  warnings that explain why they're provisional.
- Never invent a payload or hourly rate to force `status: "calculated"` —
  if a governance gap blocks the calculation entirely (see **Failure
  modes**), that's 004A's job to close, not the caller's.

## Failure modes

The tool throws rather than fabricating a number when:
- No active vehicle has both a confirmed payload and an effective cost
  profile (recommend mode).
- The overridden vehicle has no confirmed payload and no
  `override_payload_kg` was supplied.
- The overridden vehicle has no cost profile effective on
  `calculation_date` at all.

Surface these as "this can't be priced yet — needs [X] governed" rather
than retrying with different inputs or falling back to a guessed number.

## Underlying data model

See `prisma/schema.prisma` (`Vehicle` → `delivery_vehicles`,
`VehicleCostProfile` → `delivery_vehicle_cost_profiles`,
`DeliveryCostCalculation` → `delivery_cost_calculations`) and
`supabase/functions/_shared/deliveryCostMath.ts` for the actual trip math,
shared byte-for-byte between the Prisma/TypeScript engine
(`src/features/pricing-desk/lib/deliveryCostCalculator.ts`) and the Deno
Edge Function (`supabase/functions/pricing/index.ts`).

Table names are prefixed `delivery_*` rather than the more obvious
`vehicles`/`vehicle_cost_profiles` because the live Supabase project
already has an unrelated `vehicles` table (with a `trips` table FK'd to
it) belonging to the sibling `Orders-Module` (dispatch) repo referenced in
`.agents/skills/SKILL_PM_Agent.md`. Do not reuse or repurpose that table —
it is out of this repo's scope.
