# TAN002 — Payment Pattern Analysis: Run Result + Bug Diagnosis

**Date:** 2026-09-22
**Command:** `python3 analysis/debtors/shared/scripts/payment_pattern_analysis.py --debtor TAN002`
**Ground truth used:** `DEBTORS_DOCTRINE.md` ground-truth hierarchy — the ERP raw `.TXT`/`CURRENT BALANCE`
export outranks any reconstruction, including this script's own output.

---

## 1. How it was actually run

No `DATABASE_URL` and no `node_modules`/Python deps were available this
session (as established in earlier reports). Two things were needed to run
the *real* script, not a reproduction of it:

1. `pip install pandas sqlalchemy psycopg2-binary` — network access worked,
   confirmed by running it.
2. A dummy `DATABASE_URL` env var, **only** to satisfy the module-level
   `os.environ['DATABASE_URL']` read at import time (line 9) — this doesn't
   supply real credentials; the script's own `try/except` around
   `engine.connect()` inside `main()` fails immediately on an unreachable
   host and falls through to its own designed **local CSV fallback**
   (`analysis/debtors/TAN002/data/invoices.csv` / `payments.csv`), which I
   generated from `raw/TAN002_{2024,2025,CURRENT}.TXT` — same LPG/CYL
   classification (REFERENCE-regex fallback) already validated in the v5
   statement work. This is the script's own documented fallback path, not a
   modification of it.

The script ran to completion and wrote 4 reports (2023–2026) to
`reports/TAN002_{year}_Payment_Pattern_Analysis.md`.

---

## 2. Top-line result — ties correctly

```
Total LPG Invoiced  : R303,721.65
Total Payments Paid : R301,669.26
Net LPG Outstanding : R2,052.39
Net CYL Outstanding : R0.00
Total Outstanding   : R2,052.39
```

This matches the PROVEN §2 anchor exactly
(`TAN002_Statement_Chain_2026-09-21.md`). The script's lifetime cumulative
audit is sound.

---

## 3. But the per-year "Permanent Outstanding Anomalies" are false positives

Each year's report flags **nearly every calendar month** as a "Statement
Skip — completely skipped," summing to implausible totals:

| Year | "Permanent Outstanding Anomalies" claimed |
| :--- | ---: |
| 2023 | R28,757.20 |
| 2024 | R120,071.47 |
| 2025 | R111,674.10 (report says R111,672.04 for the itemized sum — R2.06 internal rounding gap in the script itself) |
| 2026 | R27,054.06 |
| **Sum** | **~R287,556.83** |

This cannot be reconciled with the true outstanding balance of R2,052.39 —
and per the ground-truth hierarchy, the raw TXT / INVNO-level match (already
independently built and verified in
`TAN002_Outstanding_Balance_Investigation_2026-09-21.md`) wins.

### Disprove-before-conclude test

Picked the largest flagged month, **2026-01** ("Billed R9,362.81, completely
skipped, R0.00 paid"), and checked its invoices against the true
`INVNO`-based match built earlier this session:

```
Jan 2026 invoices in raw/TAN002CURRENT.TXT: 00048645, 00048646, 00048680,
00048693, 00048698, 00048722, 00048730, 00048731, 00048971, 00048972,
00048975, 00048976, 00048979, 00048980 (14 documents)

Open (unmatched) invoices per INVNO-matching, whole account, all time:
00049971, 00050035, 00052693 — none dated January 2026.
```

**Every single January 2026 invoice is matched to a specific payment via
the ERP's own `INVNO` allocation field.** January was not skipped. This
falsifies the script's "completely skipped" claim for this month directly,
not just by plausibility.

---

## 4. Root cause

`payment_pattern_analysis.py`'s **Generic Fallback Value Matcher** (lines
~330–380, used whenever no `config/payment_pattern_overrides.json` exists
for the debtor/month — TAN002 has none, only `config/statement_v5.json`)
tries, for each calendar month's net LPG-billed total `amt`:

1. a single payment within R5 of `amt`, or
2. a single payment within R5 of `amt + R5,000` ("arrears" pattern), or
3. a single payment dated the following month within R5 of `amt`.

If none hit, it's flagged "completely skipped." **This assumes a
one-payment-per-billing-month cash flow.** TAN002's actual behavior is bulk
multi-invoice bank transfers ("TRANSF | STAT nnn") that each settle several
invoices spanning multiple months in one lump sum — e.g. payment `00043067`
(20/01/2026, -R10,923.84) alone closes 7 separate invoices dated December
2025 through January 2026. No single payment ever equals a single month's
net total, so the matcher can essentially never succeed for this debtor,
regardless of whether the invoices were actually paid.

**This is a script-logic limitation, not a data-integrity defect** — the
underlying `transaction_items`-equivalent data (here, the DEBENQ TXT lines)
and the ERP's own `INVNO` allocation are correct and already tie exactly.
Per `business_rules.md`-style triage in the bug-fixer skill: this is not a
known documented quirk (nothing in `business_rules.md` covers this script),
so it's being reported as a new finding rather than force-fit into an
existing rule.

### Corroborating evidence the script was authored for a different debtor

The hardcoded per-year narrative overrides inside the same function (`elif
y == 2022: ... "STAT:199 missing from sequence"`, `elif y == 2023: ...
"STAT:91 underpayment"`, specific figures like R14,943.48, R15,337.50,
STAT:199, STAT:206) **appear nowhere in any of TAN002's three DEBENQ
exports** — grepped, zero matches. `config/payment_pattern_overrides.json`
does not exist for TAN002. The script was evidently written bespoke for one
specific debtor's known payment quirks and generalized into
`shared/scripts/` without the fallback matcher being adapted for accounts
whose payment behavior differs (batch/multi-invoice transfers, TAN002's
actual pattern, vs. one-payment-per-month).

---

## 5. What this means for TAN002

- **Ignore the "Permanent Outstanding Anomalies" figures** in
  `TAN002_{2023,2024,2025,2026}_Payment_Pattern_Analysis.md` — they are
  script false positives, not real underpayments.
- **Section 4 ("Payment Flow & Sequence Reconciliation")** of the 2026
  report and the top-line Cumulative Balance Audit **are** reliable — they
  don't depend on the broken monthly matcher.
- The real open-item picture for TAN002 remains what
  `TAN002_Outstanding_Balance_Investigation_2026-09-21.md` already
  established: R1,312.52 (invoice 00052693, unambiguously open) + R739.87
  (tied to one of two identical R1,193.96 invoices, still ambiguous which).

## 6. What's NOT done here, on purpose

Per the bug-fixer skill's guidance, this is reported as a diagnosis, not
silently patched. No change was made to
`analysis/debtors/shared/scripts/payment_pattern_analysis.py` — it's shared
infrastructure used across the portfolio, and:

- the fix design isn't obvious (does the matcher need multi-invoice/batch
  attribution added, or should it defer to `INVNO`/allocation-edge ground
  truth the way `reconcile_debtor_v5_from_txt.mjs` does when DB is
  available?), and
- other accounts using this script's generic fallback path may or may not
  share TAN002's batch-payment behavior — that needs checking before any
  fix's blast radius is known, per the skill's "check for cross-account
  recurrence before treating any bug as account-specific."

## 7. Next steps

1. If this script's monthly output is going to be relied on for TAN002 (or
   other debtors with similar batch-payment behavior), it needs a matcher
   that can attribute one payment across multiple invoices/months — the
   same problem `reconcile_debtor_v5_from_txt.mjs`'s `docSplit`/`INVNO`
   approach already solves for the v5 statement, just not wired into this
   script.
2. Check which other onboarded accounts hit the Generic Fallback path (no
   `config/payment_pattern_overrides.json`) and whether they show the same
   near-universal false "Skipped Month" pattern — needed before scoping any
   fix, not assumed.
3. File as a PDP ticket if this is to be tracked/fixed: implicated
   file/function is `analysis/debtors/shared/scripts/payment_pattern_analysis.py`,
   the Generic Fallback Value Matcher (~lines 330–380); reproducible via the
   January 2026 test in §3 above.

---

## 8. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| Per-year "Permanent Outstanding Anomalies" are false positives for TAN002 | A specific flagged month is shown to have a genuinely unmatched invoice under INVNO/DB-backed allocation, not just an unmatched-by-this-script one |
| Root cause is the matcher's 1-payment-per-month assumption | The matcher is shown to correctly handle batch payments elsewhere and TAN002 has some other, unrelated cause |
