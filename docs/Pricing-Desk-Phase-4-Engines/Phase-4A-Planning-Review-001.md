# Phase 4A Planning Review 001 — Fleet Operational Data Discovery

STATUS: **Proposed. No schema, no SQL, no code.** Captures the architecture
requirements exposed by a real fuel workbook discovery. Contains one
proposed renumbering of the existing 004A/B/C engine slices, flagged
explicitly as a breaking change requiring confirmation before any file is
renamed — same discipline as the 004B rename in Architecture Review 001.

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

## 5. Proposed Revised Phase 4 Sequence

**Proposed only — not applied.** This renumbers the three existing engine
PRDs. Flagging as a breaking change per Section 6 before any file is
touched.

| Slice | Owns | Status |
|---|---|---|
| 004A — Vehicle Registry & Fuel Supplier | Governed vehicle list, supplier list | 🟢 Ready to plan — no missing data |
| 004B — Fuel Transaction Import | Import from supplier statements, registration normalization, exception queue | 🟢 Ready to plan — real data exists (Midlands Petroleum), pending Decision 5's multi-supplier question |
| 004C — Fuel Consumption Engine | Distance, L/100km, cost/km, anomaly detection | 🟢 Ready to plan — derived entirely from 004B, no assumptions |
| 004D — Vehicle Cost Profile _(currently `PRD_SLICE_004A_VEHICLE_COST_ENGINE.md`)_ | Full per-vehicle cost profile | 🟡 Still blocked — tyres, service, maintenance, insurance, licensing, depreciation have no source (see `Vehicle-Cost-Input-Sheet.md`). Fuel cost input now comes from 004C instead of a manual assumption. |
| 004E — Trip Cost Engine _(currently `PRD_SLICE_004B_TRIP_COST_ENGINE.md`)_ | Per-trip running/labour cost | ⏳ Depends on 004D |
| 004F — Delivery Economics Engine _(currently `PRD_SLICE_004C_DELIVERY_ECONOMICS_ENGINE.md`)_ | Net contribution | ⏳ Depends on 004E |
| Phase 5 — Pricing Strategy | Recommendation | ⏳ Depends on 004F |
| Phase 6 — Mobile Proforma Generator _(currently Phase 5)_ | Document generation | Not started |

---

## 6. Breaking Change — Needs Confirmation Before Execution

Renumbering 004A/004B/004C to 004D/004E/004F means renaming three existing,
already-cross-referenced files:

```
PRD_SLICE_004A_VEHICLE_COST_ENGINE.md         -> PRD_SLICE_004D_VEHICLE_COST_ENGINE.md
PRD_SLICE_004B_TRIP_COST_ENGINE.md            -> PRD_SLICE_004E_TRIP_COST_ENGINE.md
PRD_SLICE_004C_DELIVERY_ECONOMICS_ENGINE.md   -> PRD_SLICE_004F_DELIVERY_ECONOMICS_ENGINE.md
```

Documents that reference these by name and would need updating:
`README.md`'s document index, `IMPLEMENTATION_HANDOVER.md`'s Status table
and Recommended Build Order (already amended once this release to fix the
stale Phase 4 numbering — this would be a second amendment), `RELEASE_v0.3.md`,
`COMMERCIAL_ANALYTICS.md` (references 004C's contribution assessment),
`pricing_strategy.md` (references 004C by old name), `STATE_MACHINES.md`
(if it references these slices — needs checking), and this repo's own
`CDR-Schema-Diff.md` (references `delivery_economics_snapshot` conceptually
tied to 004C).

This mirrors exactly how Architecture Review 001 renamed 004B →
"Trip Cost Engine" — flagged first, executed only after confirmation, cross-
references updated in the same pass. Not done here. Awaiting the same kind
of explicit go-ahead before any file moves.

---

## 7. What This Review Does Not Do

- No schema, no `CREATE TABLE`, no SQL of any kind.
- No file renames — the breaking change in Section 6 is proposed, not executed.
- No expansion of the governed fleet — `NP186678`, `NPS79356`, `BV56VMGP`, `ND4222` remain unclassified pending a human decision (Decision 1), not silently added to `VehicleCostProfile` scope.
- No import of the workbook's data into any table.
- No change to `PRD_SLICE_004A/B/C`'s existing content — only a renumbering is proposed, and only as a name/position change, not a content change.
- 004D (renumbered Vehicle Cost Profile) remains exactly as blocked as it was in `Phase-4A-Vehicle-Cost-Profile-Planning.md` — this review does not supply any of the missing tyre/service/insurance/licensing/depreciation numbers.

---

## 8. Open Items Carried Forward

1. **Fleet classification** — what are `NP186678`, `NPS79356`, `BV56VMGP`, and `ND4222`? Needs a human answer before 004A (Vehicle Registry) can be seeded with anything beyond the two already-governed vehicles.
2. **Multi-supplier scope** — is Midlands Petroleum the only fuel account for this fleet, or does `Kondeni Fuels Sales 2026.xlsx`'s other tabs (e.g. the other petroleum-named sheet) also need importing for a complete picture? Affects whether 004B's first import is complete or partial.
3. **Renumbering confirmation** — Section 6, above.
4. **Vehicle Cost Profile inputs** — unchanged from `Vehicle-Cost-Input-Sheet.md`; still waiting on real tyre/service/insurance/licensing/depreciation figures.
