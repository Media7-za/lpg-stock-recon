# PRD Slice 004A.1 — Vehicle Registry

Status: Draft for review  
Domain: Fleet Master Data  
Parent Slice: 004A Vehicle Cost Profile

## Purpose

The Vehicle Registry is the governed list of vehicles that Pricing Desk and Fleet Intelligence may treat as part of the LPG operating fleet.

It answers:

> Is this vehicle a known, governed fleet asset, and how should the system treat it?

The Vehicle Registry is master data. It is not a fuel transaction log, not a trip log, and not a cost calculator.

## Background

Phase 4A planning found that the Midlands Petroleum fuel workbook contains real fuel transactions for multiple registrations.

Confirmed governed LPG fleet vehicles:

| Registration | Classification | Notes |
|---|---|---|
| CS70HMZN | 4-ton truck | Bulk LPG delivery vehicle |
| CS70HKZN | Smaller delivery vehicle | Medium/smaller LPG delivery vehicle |
| NPS79356 | Micro delivery vehicle | Capable of carrying 150kg LPG plus 100kg cylinder tare |

Observed registrations to exclude for now:

| Registration | Treatment |
|---|---|
| NP186678 | Not part of fleet anymore |
| BV56VMGP | Not part of fleet anymore |
| ND4222 | Not part of fleet anymore |

Midlands Petroleum is confirmed as the only current fuel account.

## Scope

This slice defines:

- the governed vehicle registry entity
- registration normalization rules
- vehicle status and classification
- how observed but ungoverned registrations are handled
- seed data for known fleet vehicles
- acceptance criteria for implementation

Out of scope:

- fuel transaction import
- fuel consumption calculations
- trip cost calculations
- delivery contribution calculations
- customer pricing decisions

## Authority

Fuel transactions may reveal a registration, but they do not automatically make that registration part of the governed LPG fleet.

Rules:

1. A vehicle may appear in fuel transactions before it is governed.
2. A vehicle must be explicitly registered before it may feed Vehicle Cost Profile calculations.
3. Unknown or excluded registrations must not silently enter delivery economics.
4. Original registration text from source files must be retained for audit.
5. Canonical registration is derived deterministically from the original registration.

## Registration Normalization

Canonical registration is calculated as:

```text
uppercase
remove spaces
remove hyphens
trim whitespace
```

Examples:

| Source value | Canonical value |
|---|---|
| cs70hkzn | CS70HKZN |
| CS70HKZN | CS70HKZN |
| cs 70 hk zn | CS70HKZN |
| CS-70-HK-ZN | CS70HKZN |

The system must store both the observed source value and the canonical value.

## Entity: Vehicle Registry

Recommended fields:

```yaml
id:
canonical_registration:
display_registration:
vehicle_class:
vehicle_role:
governed_status:
active_status:
fuel_type:
payload_lpg_kg_min:
payload_lpg_kg_recommended:
payload_lpg_kg_max:
payload_tare_kg_capacity:
notes:
effective_from:
effective_to:
created_at:
updated_at:
```

Suggested `governed_status` values:

- governed
- observed_only
- excluded

Suggested `active_status` values:

- active
- inactive
- retired
- unknown

Suggested `vehicle_class` values:

- 4_ton_truck
- small_delivery_vehicle
- micro_delivery_vehicle

## Seed Data

Initial governed vehicles:

```yaml
- canonical_registration: CS70HMZN
  vehicle_class: 4_ton_truck
  vehicle_role: bulk_lpg_delivery
  governed_status: governed
  active_status: active
  fuel_type: diesel

- canonical_registration: CS70HKZN
  vehicle_class: small_delivery_vehicle
  vehicle_role: local_delivery
  governed_status: governed
  active_status: active
  fuel_type: diesel

- canonical_registration: NPS79356
  vehicle_class: micro_delivery_vehicle
  vehicle_role: micro_delivery
  governed_status: governed
  active_status: active
  payload_lpg_kg_recommended: 150
  payload_tare_kg_capacity: 100
```

Initial excluded registrations:

```yaml
- canonical_registration: NP186678
  governed_status: excluded
  active_status: inactive

- canonical_registration: BV56VMGP
  governed_status: excluded
  active_status: inactive

- canonical_registration: ND4222
  governed_status: excluded
  active_status: inactive
```

Excluded registrations may remain in the registry to prevent repeated import exceptions.

## Relationship to Fuel Transactions

Fuel Transaction Import should match each transaction to the Vehicle Registry using canonical registration.

If matched to governed:

- import normally
- allow use by Fuel Consumption Engine

If matched to excluded:

- retain transaction for audit if imported
- exclude from fleet analytics and vehicle cost profiles

If no registry match:

- import the transaction
- create a Fleet Import Exception
- exclude from governed calculations until classified

## Relationship to Vehicle Cost Profile

Vehicle Registry identifies the vehicle and its operating classification.

Vehicle Cost Profile owns the cost model for governed vehicles only.

A governed vehicle may exist before all cost profile fields are known. Missing cost inputs must remain null, not guessed.

## Invariants

1. Canonical registration must be deterministic.
2. Source registration must never be discarded from imported transactions.
3. Observed registrations do not automatically become governed vehicles.
4. Excluded vehicles must not feed delivery economics.
5. Vehicle Registry owns fleet identity, not fuel performance.
6. Fuel Consumption Engine owns measured fuel performance.
7. Vehicle Cost Profile owns operating cost assumptions.
8. Trip Cost Engine owns journey costing.

## Acceptance Criteria

Implementation is complete when:

- a governed Vehicle Registry store exists
- CS70HMZN, CS70HKZN, and NPS79356 are seeded as governed vehicles
- NP186678, BV56VMGP, and ND4222 are excluded or otherwise prevented from entering fleet costing
- registration normalization is implemented and tested
- future fuel transactions can retain observed and canonical registration values
- unknown registrations can be flagged for classification
- governed vehicles can later join to Vehicle Cost Profiles
- no excluded or unknown registration is used in delivery economics

## Open Questions

1. Confirm fuel type for NPS79356.
2. Confirm whether excluded registrations should be stored permanently as excluded records or handled only through an exception table.
3. Confirm whether Vehicle Registry should include ownership metadata such as owned, leased, or third-party.
4. Confirm whether vehicle class should be a controlled enum or text in v1.

## Implementation Guidance

Recommended next step is a schema-diff proposal only.

No SQL should be applied until the schema proposal is reviewed and accepted.
