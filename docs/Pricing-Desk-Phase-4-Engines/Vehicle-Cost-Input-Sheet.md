# Vehicle Cost Input Sheet

Purpose: collect the real numbers `PRD_SLICE_004A_VEHICLE_COST_ENGINE.md` needs, before
any schema gets written. Fill in what you know. Leave the rest blank — a blank field
becomes `null` in the eventual schema, not a guessed number. See
`Phase-4A-Vehicle-Cost-Profile-Planning.md` for why each blank field currently has
no other source.

A CSV twin of this sheet (`Vehicle-Cost-Input-Sheet.csv`) is in this same folder if
a spreadsheet is easier to fill in than this file directly.

Pre-filled cells are already confirmed in doctrine — don't need re-entering unless
they're wrong. Rows with **need real number** are what's actually being asked for.

---

## Vehicle Identity

| | CS70HKZN | CS70HMZN |
|---|---|---|
| Registration | CS70HKZN | CS70HMZN |
| Label | Small vehicle | 4-ton truck |

---

## Payload (kg)

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Minimum economic payload |  | 1500 | CS70HKZN's minimum is **not stated anywhere** — need real number |
| Recommended payload | 500 | 4000 | |
| Maximum payload |  | 4000 | CS70HKZN's maximum is **not stated anywhere** — need real number. App code treats ~500kg as the cutover to CS70HMZN, but that's inferred from behaviour, not a confirmed fact |

---

## Fuel

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Fuel consumption (L/km) | 0.125 | 0.194 | |
| Fuel price basis (R/L) |  |  | **Need real number.** Reverse-engineered from the app's current shadow rates: ~R29.28/L implied for CS70HKZN, ~R29.23/L implied for CS70HMZN — close but not identical, so likely one shared diesel price was never applied consistently. If it's genuinely one shared price for both vehicles, one number here is enough — leave the second blank and note "same as CS70HKZN" |

---

## Tyres

_004A derives `tyre_cost_per_km` from these three — enter the raw numbers, not a pre-computed per-km figure, so the result is auditable rather than another opaque rate (see Finding 2 in the planning doc)._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Active tyres (excl. spare) |  |  | **Need real number** |
| Tyre unit cost (R) |  |  | **Need real number** |
| Tyre lifespan (km) |  |  | **Need real number** |

---

## Service

_Scheduled service only — distinct from Maintenance below, which covers unscheduled repair._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Service interval (km) |  |  | **Need real number** |
| Standard service cost (R) |  |  | **Need real number** |

---

## Maintenance

_Entered directly as a per-km rate per 004A's model — unscheduled repair/wear-and-tear, not derived from an interval the way Service is._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Maintenance cost per km (R/km) |  |  | **Need real number** |

---

## Insurance

_004A derives the per-km figure from this annual cost and the Utilisation figure below._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Annual insurance cost (R) |  |  | **Need real number** |

---

## Licensing

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Annual licensing cost (R) |  |  | **Need real number** |

---

## Depreciation

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Purchase value (R) |  |  | **Need real number** |
| Depreciation period (years) |  |  | **Need real number** |
| Residual value (R) |  |  | **Need real number** — enter `0` if the vehicle is expected to be worth nothing at end of life, not blank; blank means genuinely unknown |

---

## Utilisation

_Insurance, licensing, and depreciation per-km figures all divide by this — needed even if every other field above it is filled in._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Expected utilisation (km/month) |  |  | **Need real number**. If actual monthly km is tracked anywhere (even informally), that's a reasonable starting point for "expected" |

---

## Labour

_Likely shared across vehicles if the same driver/assistant pool serves both — fill in once and note "same" for the second column if so._

| | CS70HKZN | CS70HMZN | Notes |
|---|---|---|---|
| Driver hourly rate (R) |  |  | **Need real number** |
| Assistant hourly rate (R) |  |  | **Need real number** |

---

## What Happens Next

Once this is filled in (fully or partially — partial is fine, per-field), the next
step is the 004A schema diff, following the same reviewed-proposal pattern as every
other phase this release: a document proposing the exact `CREATE TABLE` /
`CREATE FUNCTION` SQL, reviewed before anything runs. Filling in this sheet doesn't
commit to running any SQL — it just means the schema diff won't have to guess.
