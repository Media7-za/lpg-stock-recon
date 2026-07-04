# Phase 4A Planning Review 001 — Fleet Operational Data Discovery

STATUS: **Accepted. No schema, no SQL, no code.** Captures the architecture
requirements exposed by a real fuel workbook discovery. `004A`, `004B`, and
`004C` are explicitly **not** renumbered — they remain stable identifiers.
The new work is introduced as decimal sub-slices (`004A.1`–`004A.4`)
beneath `004A`, per decision (Section 5). No existing file is renamed.

**Trigger:** a real fuel account workbook (`Book14.xlsx`, "Midlands
Petroleum" fuel statement) was reviewed as part of Phase 4A data collection.
It proved substantial enough to change the shape of Phase 4, the same way
the LIN001 walkthrough changed Phase 3 — this review captures that, rather
than folding it quietly into a schema diff.

---

## 1. Why This Is a Review, Not Just a Data Point

`Phase-4A-Vehicle-Cost-Profile-Planning.md` and the `Vehicle-Cost-Input-Sheet`
assumed the only path forward was: wait for a human to supply tyre, service,
insurance, licensing, and depreciation numbers, then build `VehicleCostProfile`
whole. The workbook proves that assumption was only partly right. There is a
second, already-existing data domain — real, dated, per-vehicle fuel
transactions — that doesn't need to wait for anything. But using it correctly
surfaced requirements the original 004A plan didn't anticipate at all:
a governed vehicle list, multi-supplier support, import exception handling,
and odometer data-quality validation as a first-class engine responsibility.
None of that was in scope before this workbook was reviewed.

---

## 2. What The Workbook Actually Contains

145 real transaction rows, 03/12/25 → 02/07/26 (approximately 8 months),
sourced from a Midlands Petroleum fuel account statement. Columns: Month,
invoice number, Vehicle Reg, fuel reference, voucher number, date, odometer,
fuel grade, litres, cumulative litres, unit cost, value, cumulative value,
balance, paid status.

| Registration (as observed) | Fills | Fuel Grade | Date Range | Odometer Quality |
|---|---:|---|---|---|
| `CS70HMZN` (+ 2 spelling variants) | 72 | Diesel 50 | 04/12/25 – 27/06/26 | 4% blank/zero, one sequence break |
| `CS70HKZN` (+ 2 spelling variants) | 47 | Diesel 50 | 21/01/26 – 02/07/26 | 13% blank/zero, one likely typo (`43816` out of sequence) |
| `NP186678` (+ 2 spelling variants) | 14 | Diesel 50 | 03/12/25 – 19/01/26 | Clean, monotonic |
| `BV56VMGP` | 6 | **Unleaded 95** | 30/12/25 – 09/02/26 | Clean, monotonic |
| `NPS79356` (+ 1 spelling variant) | 4 | Diesel 50 | 05/12/25 – 27/06/26 | 25% blank/zero |
| `ND4222` | 2 | Diesel 50 | 02/02/26 – 20/02/26 | No usable odometer data |

Unit cost (price per litre) ranges R17.85–R32.22 across the period — a real,
moving figure, not a constant.

The file's metadata references an external link to a larger master workbook
(`Kondeni Fuels Sales 2026.xlsx`) with dozens of other account tabs,
including at least one other fuel-supplier-looking name. Not fetched or
needed for this review — noted because it means this one sheet may not be
the complete fuel picture for these vehicles, and that question is carried
into Decision 5 below.

---

## 3. Decisions

### Decision 1 — Do not expand the known fleet automatically

Two vehicles (`CS70HKZN`, `CS70HMZN`) are governed today — documented in
`PRD_SLICE_004A_VEHICLE_COST_ENGINE.md` § 5, with confirmed fuel consumption
and payload figures. The other four registrations found in the workbook are
**observed, not governed** — nothing yet confirms `NP186678`, `NPS79356`,
`BV56VMGP`, or `ND4222` are LPG delivery vehicles rather than other
equipment, other vehicles sharing the account, or data-entry noise.

Resolution: introduce a **Vehicle Registry** as the governed reference list.
Fuel import accepts every observed registration unconditionally; only
registrations that match an active Vehicle Registry entry are treated as
part of the delivery fleet for costing purposes. Everything else becomes an
**exception**, not an assumption.

### Decision 2 — Registration normalization (approved as a deterministic rule)

```text
Canonical Registration = UPPERCASE, remove spaces, remove hyphens, trim.

  cs70hkzn      → CS70HKZN
  cs 70 hk zn   → CS70HKZN
  CS-70-HK-ZN   → CS70HKZN
```

The original observed string is retained alongside the canonical form on
every Fuel Transaction record — never discarded, since it's the audit trail
back to the source document.

### Decision 3 — Odometer anomaly handling is an engine responsibility, not a data-cleaning step

Missing-odometer detection, backwards-odometer detection, unrealistic-jump
detection, and probable-typo detection are owned by the Fuel Consumption
Engine itself, as first-class output (flagged fills), not silently
discarded or estimated around. This matches what the real data actually
needs — `CS70HKZN`'s data has a clear example (`43816` breaking an otherwise
clean ascending sequence) that a real engine has to handle, not idealize
away.

### Decision 4 — Fuel price is never a stored constant

There is no `current_fuel_price` field anywhere in this design. Fuel price
only ever exists as `unit_cost_per_litre` on a dated Fuel Transaction. Cost
per km, average cost per litre, and moving averages are all derived from
the transaction history, not from an assumption. This validates
`OperatingCostSnapshot`'s existing "immutable snapshot with an
`effective_date`" design from `PRD_SLICE_004A` — that model was already
correct; it simply had no real data to snapshot until now. Going forward,
`OperatingCostSnapshot.fuel_price_per_litre` should be understood as a
derived figure computed from recent Fuel Transactions at the time the
snapshot is taken, not a manually-entered number.

### Decision 5 — Do not assume a single fuel supplier

Midlands Petroleum is one supplier, not *the* supplier. The domain model
introduces **Fuel Supplier** as a first-class entity so that other accounts
(the workbook's own metadata hints at more — see Section 2) can be
imported the same way, without restructuring anything. The Fuel Consumption
Engine consumes Fuel Transactions regardless of which supplier they came
from.

---

## 4. New Entities

### Vehicle Registry

The governed answer to "what vehicles do we know about?" Sits upstream of
`VehicleCostProfile` — a registration must exist here, active and governed,
before it is treated as part of the delivery fleet for costing.

```yaml
registration:      # canonical form
status:            # registered | exception_pending | excluded
governed:          # true once formally scoped into VehicleCostProfile
vehicle_type:      # delivery_truck | bakkie | forklift | passenger_vehicle | unknown
purpose:           # free text, e.g. "LPG delivery", "sales rep vehicle"
active:
notes:
created_at:
updated_at:
```

### Fuel Supplier

```yaml
id:
name:              # e.g. "Midlands Petroleum"
contact:           # optional
active:
notes:
```

### Fuel Transaction

The dynamic, operational record. One row per fill. Imports unconditionally
— every observed registration, governed or not.

```yaml
id:
fuel_supplier_id:            # FK -> Fuel Supplier
observed_registration:       # exactly as it appeared in the source
canonical_registration:      # normalized, per Decision 2
vehicle_registry_id:         # FK -> Vehicle Registry, null if unmatched
transaction_date:
odometer_km:                 # nullable — real data has gaps
fuel_grade:                  # e.g. "Diesel 50", "Unleaded 95"
litres:
unit_cost_per_litre:
value:
source_reference:            # invoice/voucher number from the source document
source_file:                 # which import batch this came from
imported_at:
```

### Fleet Import Exception

Created automatically whenever a Fuel Transaction's `canonical_registration`
doesn't match an active Vehicle Registry entry.

```yaml
id:
fuel_transaction_id:      # FK
observed_registration:
reason:                   # e.g. unregistered_vehicle
status:                   # open | resolved_registered | resolved_excluded | ignored
resolution_notes:
created_at:
resolved_at:
```

### Fuel Consumption Engine (responsibilities, not schema yet)

Derives, per vehicle, from Fuel Transactions:

- Distance since last fill (using `odometer_km`, where present and trustworthy)
- L/100km and running average
- Cost per km
- Fuel spend and litres, lifetime and windowed
- Anomaly flags: missing odometer, backwards odometer, unrealistic jump, probable typo (Decision 3)

Does not decide whether an anomalous fill should be excluded from costing —
that remains a human decision via the Fleet Import Exception queue or a
future review step, not something the engine resolves silently.

---

## 5. Slice Numbering — Decision: Sub-Slices, Not Renumbering

**Decided.** `004A`, `004B`, and `004C` keep their existing identity as
stable identifiers. Nothing is renamed. The new work discovered by this
review is introduced as decimal sub-slices beneath `004A`, since all four
new capabilities are prerequisites of `PRD_SLICE_004A_VEHICLE_COST_ENGINE.md`
specifically, not peers of it:

| Slice | Owns | Status |
|---|---|---|
| `004A.1` — Vehicle Registry | Governed vehicle list | 🟢 Ready to plan — no missing data |
| `004A.2` — Fuel Suppliers | Supplier list (Midlands Petroleum, and others as they're imported) | 🟢 Ready to plan |
| `004A.3` — Fuel Transaction Import | Import from supplier statements, registration normalization, exception queue | 🟢 Ready to plan — real data exists, pending Decision 5's multi-supplier question |
| `004A.4` — Fuel Consumption Engine | Distance, L/100km, cost/km, anomaly detection | 🟢 Ready to plan — derived entirely from `004A.3`, no assumptions |
| `004A` — Vehicle Cost Profile (unchanged) | Full per-vehicle cost profile | 🟡 Still blocked — tyres, service, maintenance, insurance, licensing, depreciation have no source (see `Vehicle-Cost-Input-Sheet.md`). Fuel cost input now comes from `004A.4` instead of a manual assumption. |
| `004B` — Trip Cost Engine (unchanged) | Per-trip running/labour cost | ⏳ Depends on `004A` |
| `004C` — Delivery Economics Engine (unchanged) | Net contribution | ⏳ Depends on `004B` |

No document that already links `004A`, `004B`, or `004C` by name needs to
change — `PRD_SLICE_004A_VEHICLE_COST_ENGINE.md` still means the same file
it always has. The four new capabilities get their own PRD documents
(`PRD_SLICE_004A.1_VEHICLE_REGISTRY.md` etc.) as a later step, once this
review is confirmed — not created here.

**Why not renumber:** slice numbers are stable identifiers that this
project has already linked from multiple documents, release notes, and
architecture reviews. Renumbering rewrites that history for no functional
gain. The meaning of `004A` has grown — that's normal — and the correct
response is to add supporting slices underneath it, not move it.

### Domain Hierarchy

This is the same static/dynamic, master-data/transaction pattern already
used elsewhere in Pricing Desk — Customer Commercial Context (master data)
derived from ERP transactions (Phase 3A), Commercial Decision Records as
business decisions anchored on both. Fleet costing follows the identical
shape:

```text
Fleet Master Data
├── Vehicle Registry        (004A.1)
├── Fuel Suppliers          (004A.2)
└── Vehicle Cost Profiles   (004A)

Operational Data
└── Fuel Transactions       (004A.3)

Engines
└── Fuel Consumption Engine (004A.4)

Commercial Engines
└── Trip Cost Engine (004B)
      ↓
    Delivery Economics (004C)
```

---

## 6. What This Review Does Not Do

- No schema, no `CREATE TABLE`, no SQL of any kind.
- No renumbering, no file renames — `004A`, `004B`, `004C` are unchanged. The new sub-slices (`004A.1`–`004A.4`) don't have PRD documents yet either; this review only establishes the numbering and responsibilities.
- No expansion of the governed fleet — `NP186678`, `NPS79356`, `BV56VMGP`, `ND4222` remain unclassified pending a human decision (Decision 1), not silently added to `VehicleCostProfile` scope.
- No import of the workbook's data into any table.
- No change to `PRD_SLICE_004A/B/C`'s existing content at all.
- `004A` (Vehicle Cost Profile) remains exactly as blocked as it was in `Phase-4A-Vehicle-Cost-Profile-Planning.md` — this review does not supply any of the missing tyre/service/insurance/licensing/depreciation numbers.

---

## 7. Open Items Carried Forward

1. **Fleet classification** — what are `NP186678`, `NPS79356`, `BV56VMGP`, and `ND4222`? Needs a human answer before `004A.1` (Vehicle Registry) can be seeded with anything beyond the two already-governed vehicles.
2. **Multi-supplier scope** — is Midlands Petroleum the only fuel account for this fleet, or does `Kondeni Fuels Sales 2026.xlsx`'s other tabs (e.g. the other petroleum-named sheet) also need importing for a complete picture? Affects whether `004A.3`'s first import is complete or partial.
3. **Vehicle Cost Profile inputs** — unchanged from `Vehicle-Cost-Input-Sheet.md`; still waiting on real tyre/service/insurance/licensing/depreciation figures.
