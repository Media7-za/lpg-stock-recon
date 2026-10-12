# BR0001 — Operator Ingest Gate Projection

**As at:** 2026-07-22 · **Source:** `BR0001_INGEST_COVERAGE_2026-07-22.json`

| Field | Value |
| :--- | :--- |
| Display status | `STALE_PARTIAL` |
| ingestFreshness | `stale` (headers/items sync **1 Jul** vs TXT **20 Jul**) |
| ingestCoverage | `partial` (**8** missing docs) |
| Financial balance from TXT | **ALLOWED** (Part 1 bridge R0.00) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

---

## Financial position (signed off from TXT)

| Component | Amount |
| :--- | ---: |
| ERP CURRENT BALANCE | R20,673.66 |
| Part 1A LPG | R21,363.66 |
| Part 1B CYL | R−690.00 |
| Bridge variance | **R0.00** |

Collections may cite combined balance from TXT. Do **not** sign off custody or SKU until ingest gate passes.

---

## Missing docs (custody-blocking)

| Doc | Type | Date | Ref | Note |
| :--- | :--- | :--- | :--- | :--- |
| **51171** | Invoice | 11 Jun | `DN#22797` | Gas leg — not in Supabase |
| **51172** | Invoice | 11 Jun | `DN#22797-EMPTIES` | EMPTY leg — not in Supabase |
| **51659** | Invoice | 07 Jul | `DN#22940` | Gas leg — not in Supabase |
| **51660** | Invoice | 07 Jul | `DN#22940=EMPTY` | EMPTY leg — not in Supabase |
| **15210** | Crd Note | 07 Jul | `DN#22940=EMPTY` | CN — not in Supabase |
| **51925** | Invoice | 20 Jul | `DN#22831` | Gas leg — not in Supabase |
| **51926** | Invoice | 20 Jul | `DN#22831-EMPTY` | EMPTY leg — not in Supabase |
| **15282** | Crd Note | 20 Jul | `DN#22831-EMPTY` | CN — not in Supabase |

> CN **15140** (30 Jun, R−5,520) and paired inv **51478** are **HEALTHY** in DB — Part 1B residual R−690 is an ERP amount mismatch, not an ingest gap.

---

## Collections eligibility

Financial position may be stated from TXT (**R20,673.66**). **Do not** treat Part 2 custody (currently R−5,290 exposure vs Part 1B R−690) as sourced until ingest gate passes.

---

## Next Sources action

1. Export **same-session** bundle: statement TXT (current) + DTRX headers + CURRENT/STTR items through **20 Jul 2026**.
2. Upload via DataHub.
3. Re-run: `npm run debtors:ingest-check -- --debtor BR0001`
4. Target: `CURRENT_COMPLETE` or ratify narrow exceptions in `config/ingest_exceptions.json`.
