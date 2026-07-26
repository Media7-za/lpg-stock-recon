# JEN001 — Operator Ingest Gate Projection

**As at:** 2026-07-22 · **Source:** `JEN001_INGEST_COVERAGE_2026-07-22.json`

| Field | Value |
| :--- | :--- |
| Display status | `STALE_PARTIAL` |
| ingestFreshness | `stale` (headers/items sync **1 Jul** vs TXT **14 Jul**) |
| ingestCoverage | `partial` (**18** missing docs) |
| Financial balance from TXT | **ALLOWED** (Part 1 bridge R0.00) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

## Priority missing docs (June delivery gap)

| Doc | Date | Classification | Note |
| :--- | :--- | :--- | :--- |
| **51154** | 11 Jun | MISSING_HEADER_AND_LINES | Gas leg `DN#22474` — not in Supabase |
| **51155** | 11 Jun | MISSING_HEADER_AND_LINES | Paired amount R5,692.50 — CN 15066 ingested without invoice |
| 50939 | 05 May | MISSING_HEADER_AND_LINES | Duplicate EMPTY — investigate |

## July tail (stale sync — expect pass after fresh DTRX+ITEMS)

51564, 51565, 51669, 51670, 51691, 51692, 51823, 51824 and paired CNs — all absent from DB feeds synced 1 Jul.

## Collections eligibility

Financial position may be stated from TXT. **Do not** treat Part 2 custody or inferred SKUs (e.g. 51155 from CN 15066) as sourced until ingest gate passes.

## Next Sources action

1. Export **same-session** bundle: statement TXT + DTRX headers + CURRENT/STTR items (see `INGEST_GATE_SCHEMA_STAGED.md`).
2. Upload via DataHub.
3. Re-run: `npm run debtors:ingest-check -- --debtor JEN001`
4. Target: `CURRENT_COMPLETE` or ratify narrow exceptions in `config/ingest_exceptions.json`.
