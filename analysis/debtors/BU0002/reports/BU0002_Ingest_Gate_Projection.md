# BU0002 — Operator Ingest Gate Projection

**As at:** 2026-07-25 · **Status:** **PRE-TXT — gate not evaluable**

| Field | Value |
| :--- | :--- |
| Display status | `UNVERIFIED` (no statement TXT) |
| ingestFreshness | `unverified` |
| ingestCoverage | `unverified` |
| Financial balance from TXT | **BLOCKED** |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

---

## Why blocked

`npm run debtors:ingest-check -- --debtor BU0002` fails:

```text
Error: Missing statement TXT for BU0002
Expected path: analysis/debtors/BU0002/raw/BU0002CURRENT.TXT
```

Per ingest doctrine, the debtor statement TXT is Tier-3 authority for document manifest and combined running balance. DTRX/Supabase alone cannot open the financial or custody gates.

---

## Derived cache snapshot (informational only)

| Check | Observation |
| :--- | :--- |
| Supabase BU0002 headers | **1,394** docs, last tx **2026-06-27** |
| sync_logs HEADERS / ITEMS | **2026-07-01** |
| Global aged-debt (13 Jul 2026) | **R−18,913.50** — credit balance; implies post-Jun activity **not** fully reflected in current DB slice vs global snapshot |
| DETRANS tail (Feb 2026) | Through period 12 — inv 49472/49473, pays STAT:123 |
| April DTRX fragment | 4 BU0002 rows in `shared/raw/april_dump.TXT` (DN-22312 pair + STAT:125 pay) — not a statement manifest |

---

## Expected missing-doc class (once TXT arrives)

Based on global balance **R−18,913.50** (13 Jul 2026) vs DB tail ending **27 Jun 2026**, anticipate **July 2026** invoice/CN/payment rows absent from Supabase. Exact doc numbers (51154-style gaps) **cannot be listed until TXT manifest is parsed**.

Do **not** infer missing invoice SKUs from paired credit note lines — flag `INGEST_GAP` per doctrine.

---

## Preliminary lane signals (DTRX — confirm from TXT header)

| Signal | DTRX evidence | Preliminary |
| :--- | :--- | :--- |
| Payment pattern | `TRANSF` + **STAT:122–127** batches | **`position_recon`** |
| Payment `ref_no` | Explicit invoice refs on header pays (e.g. 00048746, 00049015) — contrast BU0005 blank ref | **Not** allocation lane |
| Settlement discount | No settlement refs in DTRX sample | **NONE** |
| EMPTY ref pattern | `DN#20981-EMPTY`, `DN#21230-EMPTY`, `DN/EMPTY`, `DN#22101-EMPTY` | v5 Part **1B** CYL strip |

> **Do not treat lane as locked until fresh statement TXT header is parsed** (`EXCLUDE ALLOCATION DETAIL` expected).

---

## Collections eligibility

**Do not** cite a reconciled position. Global aged-debt **R−18,913.50** (13 Jul 2026) is indicative only until v5 Part 1 bridge passes at **R0.00**.

---

## Next Sources action

1. Pull ERP **debtor statement TXT** for BU0002 (CURRENT year, full manifest + running balance).
2. Export **same-session** DTRX headers + CURRENT/STTR items through statement as-at date.
3. Save TXT to `analysis/debtors/BU0002/raw/BU0002CURRENT.TXT` (or update `config/statement_v5.json` `txtPath`).
4. Set `combinedBf`, `cylOpeningFinancial`, and `cylOpeningQty` from TXT opening lines.
5. Re-run ingest check and v5 generator (see `BU0002_Onboarding_Status.md`).

Target after intake: `CURRENT_COMPLETE` or narrow ratified exceptions in `config/ingest_exceptions.json`.
