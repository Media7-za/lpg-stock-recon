# Portfolio — `transaction_headers` duplication and value conflict

**Date:** 2026-09-22
**Status:** 🔴 OPEN — blocks any DB-anchored balance
**Found during:** attempt to re-run DBS001/DBS010 v5 against the DB after the TXT-derived statement was found unreliable
**Doctrine:** `SKILL_lpg-recon-bug-fixer` Pattern 1 (variant) · `DEBTORS_DOCTRINE.md` §1 (evidence is canonical)

---

## Summary

`transaction_headers` cannot currently anchor a debtor balance. The same ERP document is
present multiple times from different source exports, and in 9,249 cases **the copies
disagree on the amount**. There is no source-precedence rule at ingest, so every
`SUM(amount_excl + tax_amount)` silently mixes restated and superseded values.

This is **not** account-specific and **not** a new-data problem — it spans the whole
portfolio and 2+ years of history.

| Measure | Value |
| :--- | ---: |
| Distinct document identities (`account_no` + `doc_no` + `entry_type` + `tx_date`) | 106,817 |
| …with more than one physical row | **23,410** (22%) |
| …with **conflicting amounts** between copies | **9,249** |
| Accounts affected by conflicting amounts | **354** |

## Worked example — DBS001 doc `00014719`

One Credit Note, 2026-04-07, three rows, two different values:

| `amount_excl` | `tax_amount` | `source_file` | ingested |
| ---: | ---: | :--- | :--- |
| **−1035.00** | −135.00 | `DTRX2603.TXT` | 2026-04-12 |
| −900.00 | −135.00 | `april_dump.TXT` | 2026-05-27 |
| −900.00 | −135.00 | `DETRANS2307.TXT` | 2026-07-26 |

Summing as stored counts this document three times, at two different values.

## Mechanism

Several **overlapping full-history exports** were ingested, not just incremental daily ones:

| `source_file` | rows | tx_date coverage | ingested |
| :--- | ---: | :--- | :--- |
| `DTRX2603.TXT` | 25,517 | 2024-04-11 → 2026-04-11 | 2026-04-12 |
| `DETRANS2307.TXT` | 25,106 | 2024-10-30 → 2026-07-25 | 2026-07-26 |
| `DRTX2024.TXT` | 26,589 | 2021-03-01 → 2024-12-22 | 2026-04-12 |
| `DRTX2025.TXT` | 22,420 | 2021-05-24 → 2025-03-02 | 2026-04-12 |
| `april_dump.TXT` | 787 | 2026-04-01 → 2026-04-30 | 2026-05-27 |

`DTRX2603` and `DETRANS2307` alone overlap across ~18 months. The daily `DTRX*` files
after 2026-04 are incremental and are not the problem.

The `fingerprint` unique constraint (`erpImportEngine.ts` → `computeFingerprint()`,
applied via `syncService.ts` `onConflict: 'fingerprint'`) does not stop this: when a later
export **restates** a value, the row hashes differently and is inserted alongside the
original rather than superseding it. This differs from the classic PDP-31 whitespace
variant — here the divergence is visible in the values themselves, so it is an absence of
**source precedence**, not a hashing defect.

**Ruled out:** not `business_rules.md` Rule 7 (doc-number reuse across years) — the
conflicting rows share an identical `tx_date` and `entry_type`. Not Rule 1 (Credit Note
tax-sign) — the disagreement is in `amount_excl`, not the tax sign.

## Why no corrected balance is stated here

Resolving this requires a decision that is **not derivable from the data**: when two
exports disagree about a document, which one governs? Plausible rules (latest ingest wins /
latest export-date wins / DTRX outranks DETRANS / restatements are real and both are
wrong to sum) produce materially different portfolio totals — the aggregate swings by tens
of millions of rand depending purely on that choice. Until an operator sets the rule, any
single figure quoted from this table is arbitrary.

## Blocked by this

| Work | Status |
| :--- | :--- |
| DBS001/DBS010 v5 re-run against DB | **Blocked** — DB cannot anchor the opening balance |
| DBS001/DBS010 `project.json` onboarding ("option C") | **Blocked** — would encode an arbitrary figure into the portfolio register |
| **H-022** (Sources Agent DN check, 1 outstanding cylinder) | **Hold** — built on TXT figures already known to be unreliable; DB cannot currently adjudicate |
| Any D17 `financials.collectable` claim sourced from the DB | **Blocked** — §2 requires a PROVEN anchor; this is not one |

## Reproduce

```sql
-- conflict scope
select count(*) filter (where variants > 1) as conflicting_docs,
       count(distinct account_no) filter (where variants > 1) as accounts
from (select account_no, doc_no, entry_type, tx_date,
             count(distinct (amount_excl, tax_amount)) as variants
      from transaction_headers group by 1,2,3,4) g;

-- inspect one conflict
select doc_no, entry_type, tx_date, amount_excl, tax_amount, source_file, created_at
from transaction_headers
where account_no = 'DBS001' and doc_no = '00014719' order by created_at;
```

## Next actions (operator)

1. **Set the source-precedence rule** for overlapping exports — the blocking decision.
2. Decide whether superseded rows are deleted, or retained and excluded by a view
   (`DEBTORS_DOCTRINE.md` §5 favours retention with explicit supersession over erasure).
3. Re-audit `transaction_items` for the same pattern — **not yet checked**; it holds
   169,969 rows and feeds all custody/SKU work.
4. Only then: re-run DBS001/DBS010, complete option C, and resolve H-022.
