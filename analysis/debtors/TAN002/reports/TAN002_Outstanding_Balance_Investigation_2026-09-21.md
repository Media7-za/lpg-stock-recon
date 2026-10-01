# TAN002 — What's Causing the R2,052.39 Outstanding Balance

**Date:** 2026-09-21
**Question:** the account's §2 anchor (R2,052.39 as at 20/08/2026, PROVEN —
see `TAN002_Statement_Chain_2026-09-21.md`) is not disputed. This asks what
it's *made of*: which invoices remain unpaid, and why.

**Method:** matched every `Payment`/`Crd Note` row in the three DEBENQ
exports to the `Invoice` row it names via the TXT's own `INVNO` field. This
account's exports carry **no `"EXCLUDE:","ALLOCATION DETAIL"` header**
(unlike `TAN001CURRENT.TXT`/`FIR001CURRENT.TXT.TXT`), so `INVNO` here is the
ERP's real system allocation, not a text heuristic I invented.

---

> **⚠ 2026-09-22 correction — `INVNO` is weaker evidence than this report
> originally treated it as.** "Not stripped from the export" only proves
> `INVNO` isn't an *export* artifact — it doesn't prove the value itself is
> reliable. Direct evidence found later this session: payments are tagged to
> invoices that don't exist yet at the payment's own date (e.g. a
> 20/01/2026-dated payment tagged to invoice `49360`, raised 21/02/2026 — a
> month later), and one payment batch (`00043562`) carries a header row with
> `ref_no = "Alloc"`, a literal system placeholder, not a human-entered
> reference. Together these indicate `INVNO`/`ref_no` is likely
> **backfilled by an automated allocation process after the fact**, not a
> real-time record of what the debtor's remittance actually said. It's
> useful as a working hypothesis for which document a payment relates to,
> but it is **not proof of actual payer intent** — downgrade every
> `INVNO`-based claim below accordingly. Only the balance-arithmetic finding
> in §1 (the `R2,052.39` identity itself) is unaffected; anything below
> naming *which specific invoice* is open or closed is not. See
> `TAN002_R739.87_Float_Deep_Dive_2026-09-22.md` for the full discussion.

---

## 1. Composition (PROVEN arithmetic)

Matching by `INVNO` across all 326 dated rows in `raw/TAN002CURRENT.TXT`
(covering 22/02/2025 → 20/08/2026) finds **3 invoices with zero matched
payment/credit-note applied**:

| Date | Doc # | Reference | Amount |
| :--- | :--- | :--- | ---: |
| 28/03/2026 | 00049971 | DN-22032 | R1,193.96 |
| 31/03/2026 | 00050035 | DN-21852 | R1,193.96 |
| 20/08/2026 | 00052693 | DN#22891 | R1,312.52 |
| **Total** | | | **R3,700.44** |

This overstates the true R2,052.39 balance by exactly **R1,648.05** — because
**2 `Payment` rows in the source have a blank `INVNO` field**: the ERP's own
export doesn't say which invoice they applied to.

| Date | Doc # | Batch ref | Amount |
| :--- | :--- | :--- | ---: |
| 06/03/2026 | 00043562 (1st line) | TRANSF \| STAT 124 | -R454.09 |
| 21/04/2026 | 00044064 | TRANSF \| STAT 125 | -R1,193.96 |
| **Total** | | | **-R1,648.05** |

`R3,700.44 − R1,648.05 = R2,052.39` exactly — the full R2,052.39 is
accounted for. **PROVEN** as an aggregate identity; attributing the two
blank payments to specific invoices below is **ASSERTED**, not proven.

---

## 2. Invoice 00052693 (R1,312.52) — unambiguously open

No payment or credit note in any of the three files references `INVNO
00052693` at all. It's the account's most recent invoice (20/08/2026,
32 days before this session), and 32 days is well within this debtor's
normal payment cadence (see §4). **This portion is not evidence of a
problem** — it simply hasn't reached its turn in the next bulk bank
transfer yet.

## 3. Invoices 00049971 / 00050035 (R1,193.96 each) — one is closed, ambiguously

Both are dated late March 2026 and happen to share the exact same amount.
Payment `00044064` (21/04/2026, "TRANSF | STAT 125", -R1,193.96, blank
`INVNO`) postdates both and matches the shared amount exactly — it almost
certainly closes one of them. **Which one is not recorded in the source.**

Every *other* multi-line payment batch in this ledger closes its invoices in
ascending doc-number/date order (e.g. batch `00043067` on 20/01/2026 closes
`048353→048538→048646→048693→048698→048722→048730`, strictly ascending).
Applying that same observed pattern here points to **00049971 (28/03)
closing and 00050035 (31/03) remaining open** — but per the correction
above, this is now read as a **weak, unverified guess about ERP-internal
bookkeeping, not a claim about what the debtor actually paid for**.
Confirming it needs the actual STAT 125 remittance advice or bank record —
DB access (obtained later this session) did not resolve it either, since
`ref_no` on that payment line is blank in the database too (see
`TAN002_DB_CN_Tax_Convention_Bug_2026-09-22.md` §5).

## 4. The recurring R454.09 / R739.87 checkpoint — the more interesting finding

The other blank payment (06/03/2026, -R454.09) **predates all three "open"
invoices** — it cannot be settling any of them. Tracing where else this
exact figure appears surfaced something not obvious from the balance alone:

`raw/TAN002CURRENT.TXT` returns to a running balance of **exactly -R454.09**
as the closing line of a payment batch **10 separate times**, starting
**18/11/2025** (batch `STAT 120`) and recurring through `STAT 121`, `123`,
and `124` (23/03/2026). From 13/03/2026 the account's resting point shifts
to **exactly R739.87** instead (`1193.96 - 454.09 = 739.87`), and that figure
recurs at line 312 (13/03), 314, 318, and again at the STAT 125 (21/04) and
STAT 128 (15/07/2026) payment closings — i.e. the same ~R454–740 residual
persists, under different signs, from **18 November 2025 to at least
15 July 2026** — over **300 days**.

This is also, notably, **exactly** the `aged_120_plus` figure
(R739.87) that `shared/data/portfolio_candidates.csv` recorded for TAN002.
My prior session's report (`TAN002_Statement_Chain_2026-09-21.md` §3) called
that a "stale mid-period snapshot" — that reading was **incomplete**. R739.87
isn't a random balance snapshot; it looks like this account's genuinely
**persistent, unresolved residual**, present continuously (in one sign or
the other) for ~10 months, that gets paid alongside each new invoice's
amount but never itself clears to zero.

**What it is not (established):** a single unpaid invoice sitting open for
300 days — every dated invoice in this ledger is either matched or is one of
the 3 named above, all recent. **What it plausibly is (ASSERTED, not
proven):** a recurring short-payment, standing credit/float, or a
periodically-invoiced amount whose `INVNO` tagging keeps landing blank —
consistent with the two blank-`INVNO` payments identified in §1 being part
of the *same* long-running pattern, not one-off data entry gaps.

This cannot be resolved further from the TXT alone. It needs either
DB-backed allocation detail or an operator/bookkeeper conversation about
what the R454.09 "TRANSF | STAT 12x" line items represent.

---

## 5. Answer

| Component of R2,052.39 | Amount | Status |
| :--- | ---: | :--- |
| Invoice 00052693 (20/08/2026, DN#22891) | R1,312.52 | Unambiguously open — recent, normal |
| Residual tied to invoice 00049971 or 00050035 (net of the recurring R454.09 float) | R739.87 | Open, but genuinely **~10 months old** in some form — needs investigation |
| **Total** | **R2,052.39** | |

**Revises my prior session's conclusion.** `project.json.financials.agedDebt180Plus`
was set to `0.00` on the assumption the whole balance traced to the 20/08/2026
invoice. That assumption doesn't survive this trace: at least R739.87 of the
balance is tied to a residual first observed 18/11/2025 (>180 days old).
Updating `project.json` accordingly (see its history) — not deleting the
earlier entry, per doctrine's amend-by-append rule.

---

## 6. Next steps

1. Get DB access (`DATABASE_URL`) and pull `vw_clean_transactions` for
   TAN002 to see the real `debt_group`/allocation for the two blank-`INVNO`
   payments and confirm which of 00049971/00050035 is actually closed.
2. Ask the operator/bookkeeper what the recurring "TRANSF | STAT 12x"
   R454.09-sized line items represent — a standing short-payment, a fee, or
   a data-entry gap in the ERP's own allocation.
3. Once resolved, regenerate `agedDebt180Plus` and reassess whether this
   warrants a `collections.blockers` entry (`UNRESOLVED_IDENTITY`) even
   though `status` stays `active` for now.

---

## 7. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| R1,312.52 (inv 00052693) unambiguously open | Any future payment/CN references `INVNO 00052693` |
| R739.87 tied to 00049971/00050035, split unresolved | DB allocation detail or remittance advice names the specific invoice |
| R739.87 treated as a ~300-day-old recurring residual, not fresh debt | The R454.09/R739.87 pattern is explained and shown to be a coincidence of amounts rather than one continuously-carried item |
