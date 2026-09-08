# LIN001 — Operator Ingest Gate Projection

**As at:** 2026-09-02 · **Source:** `LIN001_INGEST_COVERAGE_2026-09-02.json`

| Field | Value |
| :--- | :--- |
| Display status | `STALE_PARTIAL` |
| ingestFreshness | `stale` (header sync **2026-09-01**; TXT as-at **2026-09-02**) |
| ingestCoverage | `partial` (**3** missing headers) |
| Financial balance from TXT | **ALLOWED** (running close R81,960.94) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

---

## Missing headers (2026 period)

| Doc | Type | Date | Class | In TXT |
| :--- | :--- | :--- | :--- | :---: |
| 44976 | Payment | 3 Jul 2026 | MISSING_HEADER | ✅ SPEEDP PC-76-33 |
| 45840 | Payment | 22 Aug 2026 | MISSING_HEADER | ✅ SPEEDP PC-76-34 |
| 52924 | Invoice | 2 Sep 2026 | MISSING_HEADER_AND_LINES | ✅ DN#24947 — **closing doc** |

52924 is the TXT running-close invoice (R74,433.70 → combined R81,960.94). Financial bridge closes from TXT; custody qty for that doc is not DB-backed.

---

## Collections eligibility

Financial position may be stated from TXT: **R81,960.94 PROVEN** (Part 1A R38,088.44 + Part 1B R43,872.50). Do **not** treat Part 2 physical custody or SKU projections as signed off until ingest passes or exceptions are ratified.

---

## Next Sources action

1. Re-export **same-session** DTRX + ITEMS including docs **44976**, **45840**, **52924** (header sync is one day behind TXT as-at).
2. Re-run:

```bash
npm run debtors:ingest-check -- --debtor LIN001
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor LIN001
```

Target: `CURRENT_COMPLETE`, or narrow ratified exceptions in `config/ingest_exceptions.json` for genuine header-only payments.
