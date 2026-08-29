# Supplier Ledger Ratification — Operator Guide

**Audience:** the person (or agent) working the open items produced by `npm run creditors:supplier-recon`.
**Scope:** creditor supplier-ledger comparison. Pilot account **008ORY** (Oryx Energy).

---

## 1. What this task is, and what it is not

The comparison puts the supplier's own ledger next to ours and lists everything that does not agree. Your job is to decide **what each disagreement actually is**, and record that decision so it sticks.

> **You are not adjusting our ledger.** The ERP creditor enquiry TXT is Tier-3 authority for the account balance (`CREDITORS_DOCTRINE.md`). The supplier's ledger is advisory. Nothing you write here changes the v5 statement, the ERP variance, or the pass gates. What it changes is which items stay on the open list and what we put in front of the supplier.

Two outcomes matter:

1. **Our data is wrong** (usually a mis-keyed SO reference). Record the link so the item stops re-appearing.
2. **Their data is wrong or something is genuinely owed** (missing credit note, unpassed rebate, payment not reflected). Record it so it can be claimed.

---

## 2. Files you will touch

| File | Role | Edit it? |
| :--- | :--- | :--- |
| `reports/[CODE]_Supplier_Ledger_Recon_[YEAR].md` | The readable report | No — generated |
| `data/supplier_ledger_matches.csv` | Work queue with fuzzy candidates | **No — overwritten every run** |
| `data/supplier_ledger_decisions.csv` | Your durable decisions | **Yes — this is your file** |
| `raw/supplier_ledger/*.csv` | Their ledger as received | No — source evidence |

> **The single most important rule:** never type your conclusions into `supplier_ledger_matches.csv`. That file is regenerated from scratch on every run and your work will vanish. Conclusions go in `supplier_ledger_decisions.csv`, which the script only ever reads.

Start each session by regenerating, so you are working the current position:

```bash
npm run creditors:supplier-recon -- --creditor 008ORY
```

---

## 3. How to read an open item

Open items appear in the report and carry `ONLY_OURS`, `ONLY_THEIRS`, or `UNMATCHED_OURS` in the `match_tier` column of the queue CSV.

**SO labels** are `YYYY-MM / NNN`, for example `2026-08 / 049`. The month matters: **SO sequences restart every month**, so `049` on its own is meaningless. Their ledger writes the full form (`SON2608ZA105000055`); our ERP writes only the sequence (`SON049`, `SON#128`) and takes its month from the row date.

**Fuzzy candidates** are ranked suggestions from the other side, formatted:

```
2026-08 / 055@2026-08-07 Δ0.01 (0d)
└─ their SO ──┘ └─ date ─┘ └ amount gap ┘ └ day gap ┘
```

Read the two gaps together. `Δ0.01 (0d)` is the same delivery with a reference typo. `Δ82,092.41 (14d)` is noise the ranking had to put somewhere — ignore it.

**A candidate marked `[already matched]` is a trap.** It means that row is already paired with something else on a confirmed match, so it cannot also be your counterpart. A near-perfect but already-matched candidate is in fact evidence of the opposite conclusion: if the only good fit for your item is spoken for, your item probably has no counterpart at all, and the honest answer is a missing document or a duplicate on our side. This is exactly how the R89,444.63 duplicate on payment `7394` was identified.

**`AFTER_LEDGER_ASAT` is not a discrepancy.** Their ledger is a snapshot with a stated cut-off date. Anything we delivered or paid after that date cannot appear on it, so these rows are listed for completeness and need no decision, in both the document and payment lanes. Just confirm they appear on the next statement you receive.

**Amount columns** are absolute values. `our_charge` is our GRV gross, `their_charge` their invoice; `our_credit` is our Deb Note, `their_credit` their credit note.

---

## 4. Decision vocabulary

Write exactly one of these in the `decision` column. Anything else is ignored, and the report will warn you that a row was dropped.

| Decision | Use when | Effect on next run |
| :--- | :--- | :--- |
| `SAME_DELIVERY` | Two SO references are the same delivery, one on each side. Requires **both** keys. | The pair is joined and re-compared; the real variance appears under "Ratified links" |
| `MERGE_GROUP` | **One** of our SO references covers **several** of theirs, because we reused the reference across separate loads | Their groups are combined and compared against ours as a whole, before matching runs |
| `SAME_PAYMENT` | Their receipt and our payment are the same money | Closed |
| `INTERNAL_REVERSAL` | A self-cancelling pair on our side (a posting and its reversal) | Removed from open payments |
| `GENUINELY_MISSING_THEIRS` | We have the document, they never billed or credited it | Closed, kept visible as a claim |
| `GENUINELY_MISSING_OURS` | They have it, we never booked it — **flag for ERP capture** | Closed, kept visible |
| `TIMING` | Correct on both sides, will land in the next period | Closed |
| `QUERY_RAISED` | Sent to the supplier, awaiting their answer | Closed pending reply |
| `ACCEPTED_VARIANCE` | Difference is real but agreed or immaterial | Closed |

### File format

```csv
lane,our_key,their_key,decision,note
DOCUMENT,2026-08 / 049,2026-08 / 055,SAME_DELIVERY,Our GRV 6798 keyed SON049; their SO is 055. Same load 07 Aug.
DOCUMENT,2026-04 / 045,2026-04 / 045 + 2026-04 / 051 + 2026-04 / 048,MERGE_GROUP,"Three loads keyed SON045 on our side; Oryx numbered them separately."
PAYMENT,7394,,INTERNAL_REVERSAL,Posting and reversal of the same R89444.63 on 09 Jun.
```

Rules for the keys:

- `lane` is `DOCUMENT` or `PAYMENT`
- For `DOCUMENT`, keys are SO labels **exactly as printed**, including the space either side of the slash
- For `PAYMENT`, keys are document numbers (`7394`, `C-COUNT`)
- `SAME_DELIVERY` and `MERGE_GROUP` need both keys; every other decision needs only the side that has the item
- For `MERGE_GROUP`, list their SOs `+`-separated in `their_key`, and **include their SO that shares our number** if one exists. You may also split them across several rows sharing the same `our_key`
- If a note contains a comma, wrap the note in double quotes

Nothing is applied silently. Every decision that could not be honoured is listed under **Ratification mechanics** in the report and printed to the console, so if you name a group that already matched on its own SO key you will be told to use `MERGE_GROUP` instead rather than have the counterpart quietly retired.

---

## 5. Work the list in this order

Triage cheapest-and-most-certain first. Later steps get easier as earlier ones remove noise.

### Step 1 — Near-exact pairs (minutes, high confidence)

Look for candidates with a tiny amount gap and a small day gap. A cent of difference is rounding between their VAT calculation and ours, not a real variance.

Confirm before recording: open the report's ours-only and theirs-only tables and check the **credit** amounts also line up, not just the charge. If the deposit credits match too, it is the same delivery.

Record as `SAME_DELIVERY`. Then note in the `note` column **which side is wrong**, because that is what tells the ERP team whether to correct our capture.

### Step 2 — Deposit-only variances

In the variance table, rows labelled **`Deposit only`** have a gas charge agreeing to the cent and only the cylinder credit differing. These are the cleanest items to take to the supplier because there is nothing to argue about on price.

For each one, establish the physical fact: how many shells went back on that load, and at what deposit rate. Cross-check against Part 2 of the v5 statement, which is the physical shell tracker. Then either `QUERY_RAISED` (their credit is short) or `GENUINELY_MISSING_OURS` (we did not book a return they did credit).

### Step 3 — Charge-only variances where the credit agrees exactly

A credit variance of exactly `0.00` alongside a large charge variance almost always means the **same delivery sits under different SO references on the two sides**, so the totals are being compared against the wrong partner. Do not treat these as price disputes until the references are sorted out.

Resolve the reference first, then re-run. The variance that remains afterwards is the real one.

### Step 4 — Reversed deliveries (automatic, just read it)

Our ERP cancels a delivery by raising a Deb Note that credits back its linked GRV in full. Both legs are now excluded from the comparison automatically, because the pair nets to zero on our side and never reaches the supplier's ledger — left in, it inflates our charges *and* our deposit credits by the same amount and reads as a variance in both lanes at once.

You do not need to record a decision for these. Read the **"Reversed deliveries excluded from the comparison"** table to confirm the residual column is zero or a few cents, and check the accompanying watch list of deposit credits that come close to the full value of their GRV without quite matching, since those may be partial cancellations the rule cannot safely classify.

Detection is by amount, not by wording: a genuine deposit credit is a fraction of the load — on 008ORY they run from 5% to 72% of the gross — so a credit equal to its GRV within tolerance is unambiguous. The SO reference is not reliable for this, since some reversals are labelled `REV GRV #6216` and others carry an ordinary `SON###`.

### Step 5 — Reused SO references (highest value per hour)

Start from the report's table **"Our SO references carrying more than one GRV"**. A delivery is normally one GRV plus its deposit Deb Note, so a second GRV under the same reference means our capture reused it across separate loads. Their side numbered those loads individually, so the comparison lands our combined total against one fragment of theirs and reports a huge variance that is not real money. On 008ORY these references account for roughly 69% of the total charge variance.

Work this table *after* the reversal step, because a reversed GRV is a common reason a reference looks reused when it is not. To resolve one:

1. Take our GRV numbers and amounts from that table.
2. Find their orphaned SOs of the same amounts in the ours-only and theirs-only lists. They match closely, usually to the cent or within a few cents of VAT rounding.
3. Confirm the pairing with the Deb Note link: our ERP records each Deb Note against its GRV, so you can tell which deposit credit belongs to which load.
4. Record one `MERGE_GROUP` naming all of their SOs, and re-run.

The variance should collapse to rounding. If it does not, you have found something real — and now you have found it against clean totals rather than against a fragment.

Two cautions. Their SO numbering is authoritative because the sales order is theirs, so a reused reference is our capture error and worth feeding back to whoever captures GRVs. And the supplier may attach a deposit credit to a different invoice than we do within the same cluster; that nets to zero across the group, so those SOs will never agree line by line, only in aggregate.

### Step 6 — Payments

Check the entry type on our side first, because it changes the expected answer:

- **`Ud XFer` / `Bank UD`** are un-deposited or unallocated transfers. These legitimately may not have reached the supplier's account, so `TIMING` is often right — but do not assume it. Confirm against the bank that the money actually moved, and confirm it clears on the following statement. On 008ORY every open payment is of this type, which points at an allocation problem on our side rather than a supplier failure.
- **`Bank XFer`** left the bank. If it is not on their ledger and it predates their cut-off, that is a real query, not a timing difference.
- **The same amount appearing twice on our side** with only one receipt on theirs needs care: it is either a duplicate payment we should recover, or a receipt they have not posted. Do not close it as `TIMING` without checking the bank.

A payment appearing twice with equal and opposite signs on the same date is a posting and its reversal: `INTERNAL_REVERSAL`. Record one decision row against the document number and both legs close together.

When their side shows **zero** unmatched receipts but ours shows several, the direction of the problem is established: they have posted everything they received, so each open item is money we recorded that never arrived, or recorded twice. That is a treasury question, not a supplier query.

### Step 7 — Rebates

The rebate table is a separate exercise from document matching — see section 6.

---

## 6. The rebate claim

The rebate section compares **our computed entitlement** (delivered kg × tier rate, plus VAT) against **their credit notes actually issued**. Because the supplier settles by credit note, the incl-VAT figure is the credit note face value and the ex-VAT figure is the real margin recovery.

Three things to check before claiming anything:

**Is a "missing" month actually missing?** Check whether an adjacent month's credit covers two months. On 008ORY, their February credit of R7,123.10 is exactly our February plus March combined, so March was never withheld. Combine before you conclude.

**Is a month simply not due yet?** Their pattern is to issue month *M*'s rebate in late month *M+1*. A rebate for last month is not yet a claim; it is a receivable in waiting. Only chase months that are past that cycle.

**Does a disputed month come down to volume or to rate?** Divide the variance by 1.15 to get ex VAT, then by the tier rate. If the result is a round number of kilograms, the disagreement is about which month a delivery fell in, not about the rate — and the fix is a cut-off discussion, not a rate dispute.

What to send: the month, our net kg, the tier and rate applied, the ex-VAT and incl-VAT amounts, and the delivery-level kg backing from the LPG volume report. The report at `reports/[CODE]_LPG_Volume_Monthly_*.md` has kg per GRV, which is the evidence they will ask for.

Do **not** record rebate conclusions in the decisions file. Rebate status is derived from the volume report and their credit notes on every run, and it updates itself as new credit notes arrive.

---

## 7. When to stop and escalate

Stop and hand up rather than guessing when any of these is true:

- A `SAME_DELIVERY` link would need an amount gap larger than a rounding difference and you have no document to prove it
- The same amount appears on both sides more than once in a month and you cannot tell which pairs with which
- Their ledger shows a document type we have never seen (anything outside `SAINV`, `SACRN`, `ARPAY`, `APPAY`, `CAFOO`)
- Our ledger is missing something they billed — this needs ERP capture, which is not your call to make silently
- The balance headline gap moves materially between runs without new decisions being added

Never invent a link to make a number tie. An honest open item is more useful than a false match, because a false match hides the real problem permanently.

---

## 8. Finishing a session

```bash
npm run creditors:supplier-recon -- --creditor 008ORY
```

Then confirm three things in the console output:

1. `decisions applied` equals the number of rows in your decisions file — if it is lower, a `decision` value was misspelled and the report will say how many were dropped
2. Open counts have fallen by what you closed
3. The rebate line is unchanged unless a new credit note arrived

Commit the decisions file with the regenerated report and queue so the audit trail stays together:

```bash
git add analysis/creditors/008ORY/data analysis/creditors/008ORY/reports
```

Keep the note text specific enough that someone reading it in six months knows what you saw. `"Our GRV 6798 keyed SON049; their SO is 055; same load 07 Aug, R0.01 VAT rounding"` is useful. `"matched"` is not.

---

## 9. Related

- [`CREDITORS_DOCTRINE.md`](CREDITORS_DOCTRINE.md) — evidence hierarchy, rebate memo lane, SO join rule
- [`AP_Recon_Workflow.md`](AP_Recon_Workflow.md) — ingest → reconcile lifecycle
- `raw/supplier_ledger/README.md` — how to drop a new supplier ledger export
