# TAN002 — Database Credit Note Tax-Convention Bug (portfolio-wide)

**Date:** 2026-09-22
**Access:** Supabase MCP, project `oqhpxnaadahohwkslive` (real DB, first
direct access this session — see project.json history)
**Triggered by:** checking whether the 5 over-credited CNs found in
`TAN002_Credit_Note_Reconciliation_2026-09-22.md` relate to the R454.09/
R739.87 float. **Answer to that specific question: no relation** — see §5.
What follows is a separate, more significant finding surfaced along the way.

---

## 1. Summary

`transaction_headers.amount_excl` for Credit Notes imported **before**
2026-07-26 already includes tax (a data-import bug), while the field name
and every later import say it should be tax-*exclusive*. The bug was
partially fixed on 2026-07-26 via a corrective re-import (`DETRANS2307.TXT`)
— but that re-import only covered a subset of historically-affected
documents. The rest remain silently wrong to this day if queried naively
(`amount_excl + tax_amount`), overstating each affected credit by its own
tax amount.

**For TAN002 specifically:** confirmed and fully corrected — the properly
deduped, convention-corrected total ties **exactly** to the PROVEN ERP TXT
figure (-R242,134.29, 148 documents, to the cent). No blast radius on
TAN002's own recon: `TAN002_Statement_Chain_2026-09-21.md`'s R2,052.39
anchor already came from the TXT, not the DB, so it was never at risk.

**Portfolio-wide, this is much bigger:** up to 228 accounts and 11,421
Credit Note rows are sourced from the same `DRTX20xx.TXT` pre-fix import
family; only 3,199 rows (214 accounts) were corrected by the 2026-07-26
re-import. The remaining scope needs a proper account-by-account,
document-by-document check before any number is quoted as final — see §4.

---

## 2. How it was found

Investigating whether the 5 over-credited CNs (Jul 2024–Jan 2026,
`TAN002_Credit_Note_Reconciliation_2026-09-22.md`) related to the untagged
R454.09/R1,193.96 payments, I got real DB access this turn (Supabase MCP)
and — per this repo's ground-truth hierarchy and the lpg-recon-bug-fixer
skill's rule ("never trust a value without deduping first") — checked
TAN002 for the known portfolio-wide duplication bug (Pattern 1) before
trusting any DB sum.

**Found immediately:** 469 duplicate groups in `vw_clean_transactions` for
TAN002 (938 of 1,019 line-item rows duplicated, exactly 2x each) — TAN002
is on the already-documented affected-accounts list (this repo's own prior
count was 434 accounts; TAN002 is one of them, consistent with that
finding, not a new discovery on its own).

**Checking the same thing at the `transaction_headers` (financial-header)
level surfaced something different and previously undocumented:**

```
select id, doc_no, ref_no, tx_date, amount_excl, tax_amount, source_file, created_at
from transaction_headers
where account_no='TAN002' and entry_type='Crd Note' and doc_no = '00012022';
```

| id | source_file | created_at | amount_excl | tax_amount |
| :--- | :--- | :--- | ---: | ---: |
| 117027 | DTRX2603.TXT | 2026-04-12 18:23 | -1,207.50 | -157.50 |
| 223433 | DETRANS2307.TXT | 2026-07-26 09:46 | -1,050.00 | -157.50 |

The ERP TXT (proven ground truth) shows this credit note as **-R1,207.50**.
The *newer* row (`DETRANS2307.TXT`) computes that correctly:
`-1,050.00 + -157.50 = -1,207.50`. The *older* row (`DTRX2603.TXT`) is
already at -1,207.50 in `amount_excl` alone — adding `tax_amount` again
would give -1,365.00, wrong. **`amount_excl` in the older row already
includes tax; in the newer row it correctly excludes it.**

## 3. TAN002's own numbers, fully resolved

| Check | Naive query (`sum(amount_excl+tax_amount)`, all rows) | Deduped, convention-corrected | TXT (proven) |
| :--- | ---: | ---: | ---: |
| Invoice total | — (simple rounding-dedup already worked) | R545,855.94 (295 docs) | R545,855.94 (295 docs) ✅ |
| Crd Note total | -R411,760.05 (222 rows — **98% too high**) | **-R242,134.29 (148 docs)** | -R242,134.29 (148 docs) ✅ |
| Payment total | -R301,669.26 (240 rows, extra rows are self-cancelling suspense pairs) | -R301,669.26 | -R301,669.26 ✅ |
| **Combined (Inv − CN − Pay... i.e. Inv+CN+Pay)** | wildly off | **R2,052.39** | **R2,052.39** ✅ |

**The exact rule that reproduces the proven total:**
```sql
with ranked as (
  select *, row_number() over (partition by doc_no order by created_at desc) as rn
  from transaction_headers
  where account_no='TAN002' and entry_type='Crd Note'
)
select sum(case when created_at >= '2026-07-26' then amount_excl+tax_amount else amount_excl end)
from ranked where rn=1;
-- → -242134.29, exact match
```
i.e.: take the newest row per document; if it postdates the 2026-07-26
fix, add tax; if it predates the fix, don't.

**Root cause of the 74 "extra" DB rows (222 vs 148 documents):** every one
of TAN002's 148 CN documents already existed in the TXT set — zero missing
documents. The extra 74 rows are exactly the 74 documents (out of 75 in
`DTRX2603.TXT`) that got a second, corrected copy via `DETRANS2307.TXT`.
The other 74 documents (from `DRTX2025.TXT` and `DRTX2024.TXT`, imported
the same day as `DTRX2603.TXT` — 2026-04-12) never got a corrective
re-import at all, and are **still carrying the bug today** if queried
naively.

## 4. Portfolio-wide scope (flagged, not fully resolved)

```sql
select source_file, count(*) rows, count(distinct account_no) accounts
from transaction_headers
where entry_type='Crd Note' and source_file ~ '^DRTX20[0-9]{2}\.TXT$'
group by source_file order by source_file;
```

| source_file | rows | accounts |
| :--- | ---: | ---: |
| DRTX2017.TXT | 45 | 25 |
| DRTX2018.TXT | 356 | 63 |
| DRTX2019.TXT | 260 | 59 |
| DRTX2020.TXT | 165 | 42 |
| DRTX2021.TXT | 125 | 42 |
| DRTX2022.TXT | 2,326 | 120 |
| DRTX2023.TXT | 1,289 | 114 |
| DRTX2024.TXT | 3,005 | 168 |
| DRTX2025.TXT | 3,850 | 228 |
| **Total** | **11,421** | **up to 228 distinct** |

Corrective re-import coverage found so far:

| source_file | rows | accounts | created |
| :--- | ---: | ---: | :--- |
| DETRANS2307.TXT | 3,199 | 214 | 2026-07-26 |
| DETRANS.TXT | 6 | 6 | 2026-08-26 (looks like ongoing normal daily import, correct convention) |

**This does not mean 11,421 − 3,199 ≈ 8,222 rows are definitely still
broken** — for TAN002, the correction targeted the `DTRX2603.TXT`-sourced
documents specifically, not the `DRTX2025.TXT`/`DRTX2024.TXT` ones, even
though all three were imported the same day. Whether `DETRANS2307.TXT`'s
3,199-row correction, portfolio-wide, systematically targets one import
family over another (and therefore which of the 11,421 DRTX rows are truly
still stale) needs a proper per-account, per-document join — not attempted
here; flagged as the next step, not asserted as a number.

## 5. Does this relate to R454.09 / R739.87? No.

Checked directly: `transaction_headers` rows for doc `00043562` (the
6 Mar 2026 blank-INVNO -R454.09 payment) and doc `00044064` (the
21 Apr 2026 blank-INVNO -R1,193.96 payment) both show **`ref_no = ''`** in
the database — confirming these are genuinely unallocated at the source
ERP system, not merely omitted from the TXT export. This CN tax-convention
bug only affects `entry_type = 'Crd Note'` header rows' `amount_excl`/
`tax_amount` fields; it has no mechanism to touch `Payment` rows or their
allocation (`ref_no`) at all. Two separate, unrelated issues, confirmed
independently.

## 6. What's NOT done here, on purpose

No write was made to the database. This is read-only investigation via
Supabase MCP (`execute_sql`), consistent with `DEBTORS_DOCTRINE.md` §3
(repo agents read freely, write only downstream of evidence or operator
ratification). A fix (re-running the corrective import for the remaining
`DRTX20xx.TXT`-sourced documents, or patching the ingest logic itself) is
an infrastructure change affecting up to 228 accounts and needs explicit
operator sign-off and its own scoping — not something to do inside a
single-account investigation.

## 7. Also flagged (unrelated, surfaced incidentally)

`list_tables` on this project reported **20 tables with Row Level Security
disabled** (`solicitation_queue`, `cycle_compare`, `outstanding_payments`,
`routes`, `areas`, `vehicles`, `drivers`, `driver_auth_tokens`, `orders`,
`order_items`, `order_events`, `trips`, `deliveries`, `delivery_items`,
`delivery_returns`, `delivery_proofs`, `delivery_vehicles`,
`delivery_vehicle_cost_profiles`, `delivery_cost_calculations`,
`receipt_extractions`) — fully exposed to the `anon`/`authenticated`
Supabase client roles. Unrelated to TAN002 or this bug; surfaced because
the tool's own advisory required it. No remediation applied (enabling RLS
without policies would just break access) — this needs an operator
decision on what policies these tables need.

---

## 8. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| TAN002's own CN total is fully resolved (-R242,134.29, exact) | A newer import changes any of TAN002's 148 CN documents again |
| Portfolio scope is "up to 228 accounts, 11,421 rows, exact still-broken count unresolved" | A per-account/per-document join is run and gives an exact affected count |
| No relation to R454.09/R739.87 | Some other mechanism linking Crd Note header rows to Payment allocation is found |
