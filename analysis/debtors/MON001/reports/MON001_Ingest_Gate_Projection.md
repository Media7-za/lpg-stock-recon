# MON001 — Operator Ingest Gate Projection

**As at:** 2026-07-28 · **Source:** `MON001_INGEST_COVERAGE_2026-07-28.json`

| Field | Value |
| :--- | :--- |
| Display status | **`CURRENT_PARTIAL`** |
| ingestFreshness | `current` (headers/items sync **26 Jul 2026** vs TXT **22 Jul 2026**) |
| ingestCoverage | `partial` (**2** custody-blocking gaps / **61** TXT docs) |
| Financial balance from TXT | **ALLOWED** (Part 1 bridge R0.00) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

---

## v5 pass gates (Turn 1)

| Gate | Result |
| :--- | :--- |
| ERP `CURRENT BALANCE` | **R2,717.79** |
| Part 1A + 1B combined | **R2,717.79** |
| ERP variance | **R0.00** ✓ |
| Sub-ledger tie variance | **R0.00** ✓ |

---

## Custody-blocking gaps (TXT manifest)

| Doc | Type | Date | Classification | Note |
| :--- | :--- | :--- | :--- | :--- |
| **45158** | Payment | 11 Jul 2024 | `MISSING_HEADER` | STAT 104 — first period row after B/F |
| **52130** | Invoice | 27 Jan 2026 | `MISSING_HEADER_AND_LINES` | R960.00 — in TXT manifest, not in Supabase |

> **42 DB-only documents** predate or fall outside CURRENT-year TXT window — expected; do not merge into v5 bridge.

---

## Collections eligibility

Financial position **may be stated from TXT:** combined balance **R2,717.79** (as at **22 Jul 2026**).  
**Do not** sign off Part 2 custody until gaps **45158** and **52130** resolve or are ratified in `config/ingest_exceptions.json`.

---

## Next Sources action

1. Re-sync DTRX headers for docs **45158**, **52130** (+ ITEMS lines for 52130).
2. Re-run: `npm run debtors:ingest-check -- --debtor MON001`
3. Target: `CURRENT_COMPLETE` or ratify narrow exceptions.
4. Re-run v5 if config/qty changes: `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor MON001`
