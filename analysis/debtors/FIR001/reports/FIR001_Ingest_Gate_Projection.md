# FIR001 — Operator Ingest Gate Projection

**As at:** 2026-09-07 · **Source:** `FIR001_INGEST_COVERAGE_2026-09-07.json`

| Field | Value |
| :--- | :--- |
| Display status | `CURRENT_PARTIAL` |
| ingestFreshness | `current` (header sync **2026-09-06**; items sync **2026-09-07**; TXT as-at **2026-09-05**) |
| ingestCoverage | `partial` (**3** missing docs) |
| Financial balance from TXT | **ALLOWED** (running close R8,721.02) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

---

## Missing docs (Jul–Sep TXT window)

| Doc | Type | Date | Class | In TXT |
| :--- | :--- | :--- | :--- | :---: |
| 15488 | Crd Note | 15 Aug 2026 | MISSING_HEADER_AND_LINES | ✅ DN#24913-EMPTY −R6,555.00 |
| 45779 | Payment | 17 Aug 2026 | MISSING_HEADER | ✅ TRANSF STAT 129 −R14,379.90 |
| 45995 | Payment | 31 Aug 2026 | MISSING_HEADER | ✅ TRANSF STAT 129 −R7,189.95 |

CN **15488** is the custody-blocking gap: TXT reverses inv 52579 empties; DB still carries those shells into Part 2 (2× 9kg + 5× S.1 vs Part 1B R517.50).

---

## Collections eligibility

Financial position may be stated from TXT: **R8,721.02 PROVEN** (Part 1A R8,203.52 + Part 1B R517.50). Do **not** treat Part 2 physical custody or SKU projections as signed off until ingest passes or exceptions are ratified.

---

## Next Sources action

1. Re-export **same-session** DTRX + ITEMS including docs **15488**, **45779**, **45995**.
2. Re-run:

```bash
npm run debtors:ingest-check -- --debtor FIR001
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor FIR001
```

Target: `CURRENT_COMPLETE`, or narrow ratified exceptions in `config/ingest_exceptions.json` for genuine header-only payments.
