# IVE001 — Operator Ingest Gate Projection

**As at:** 2026-07-22 · **Status:** **PRE-TXT — gate not evaluable**

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

`npm run debtors:ingest-check -- --debtor IVE001` fails:

```text
Error: Missing statement TXT for IVE001
Expected path: analysis/debtors/IVE001/raw/IVE001CURRENT.TXT
```

Per ingest doctrine, the debtor statement TXT is Tier-3 authority for document manifest and combined running balance. DTRX/Supabase alone cannot open the financial or custody gates.

---

## Derived cache snapshot (informational only)

| Check | Observation |
| :--- | :--- |
| Supabase IVE001 headers | 101 docs, last tx **2026-06-24** |
| sync_logs HEADERS / ITEMS | **2026-07-01** |
| Global aged-debt (13 Jul 2026) | **R12,959.96** — implies post-Jun activity **not** in current DB slice |
| April DTRX fragment | 11 IVE001 rows in `shared/raw/april_dump.TXT` — not a statement manifest |

---

## Expected missing-doc class (once TXT arrives)

Based on global balance vs DB tail, anticipate **July 2026** invoice/CN rows (and possibly matching STAT payment) absent from Supabase. Exact doc numbers (51154-style gaps) **cannot be listed until TXT manifest is parsed**.

Do **not** infer missing invoice SKUs from paired credit note lines — flag `INGEST_GAP` per doctrine.

---

## Collections eligibility

**Do not** cite a reconciled position. Global aged-debt **R12,959.96** (13 Jul 2026) is indicative only until v5 Part 1 bridge passes at **R0.00**.

---

## Next Sources action

1. Pull ERP **debtor statement TXT** for IVE001 (CURRENT year, full manifest + running balance).
2. Export **same-session** DTRX headers + CURRENT/STTR items through statement as-at date.
3. Save TXT to `analysis/debtors/IVE001/raw/IVE001CURRENT.TXT` (or update `config/statement_v5.json` `txtPath`).
4. Re-run ingest check and v5 generator (see `IVE001_Onboarding_Status.md`).

Target after intake: `CURRENT_COMPLETE` or narrow ratified exceptions in `config/ingest_exceptions.json`.
