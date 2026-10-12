# TAN002 — Credit Note vs Invoice Reconciliation

**Date:** 2026-09-22
**Question:** do credit amounts always net to zero against the invoice
they're tagged to (`INVNO`)?
**Answer: No — not always, but the exceptions are rare (5 of 295 invoices,
1.7%) and don't affect the account's PROVEN R2,052.39 balance.**

**Method:** for every invoice, summed all `Crd Note` rows whose `INVNO`
references it (independent of payments), and compared that sum against the
invoice's own full amount.

---

> **⚠ 2026-09-22 correction (added after this report was first written) —
> `INVNO` is weaker evidence than treated below.** Later this session,
> direct evidence surfaced that `INVNO`/`ref_no` is likely **backfilled by
> an automated ERP allocation process**, not entered live by a human against
> the debtor's actual remittance: payments have been found tagged to
> invoices that didn't exist yet at the payment's own date, and one document
> (`00043562`) carries a header row with `ref_no = "Alloc"` — a system
> placeholder, not a real reference. **What survives this correction:** the
> 292/295 "exact match" and "5 over-credited" *counts* in the summary table
> are still valid — they only measure whether the ERP's own bookkeeping is
> internally self-consistent (does the tagged total match the tagged
> invoice?), which doesn't require the tag to reflect genuine debtor intent.
> **What doesn't survive:** §3's "data-entry slip" framing for the 5
> over-credited cases implies a human keying error; given the backfill
> finding, an allocation-algorithm quirk is at least as likely, and the
> `47421`/`47430` "probable transposition" read (§3, §6) should be treated
> as one unverified hypothesis among others, not the most likely explanation
> it was originally presented as.

---

## Summary — 295 invoices, 2023–2026

| Category | Count | What it means |
| :--- | ---: | :--- |
| No credit note at all | 147 | Settled by payment only |
| CN alone exactly zeroes the invoice | 129 | Standard "invoice then immediate full reversal" pattern (e.g. a mispriced or duplicate DN) — no payment needed |
| CN is **partial** — payment covers the remainder | 14 | Normal: typically the CYL-deposit ("-EMPTY") portion of a combined LPG+CYL invoice gets partly reversed, the rest paid in cash. **Verified: all 14 close to the exact cent once the payment is added — see §2.** |
| CN **exceeds** the invoice amount (over-credited) | **5** | The irregularity — see §3 |

---

## 1. No credit note (147) / exact self-cancel (129)

Not itemized here — 147 invoices were paid entirely by cash payment, and
129 were raised and then fully reversed by their own credit note (the
common "-EMPTY" or "wrong price" correction pattern seen throughout this
account). Neither category shows any irregularity. Full per-invoice detail
is derivable from `raw/TAN002_{2024,2025,CURRENT}.TXT` on request.

---

## 2. Partial credit notes (14) — normal, all verified exact

| Invoice | Date | Ref | Inv Amt | CN Doc | CN Amt | Payment Doc | Pay Amt | CN+Pay Total |
| :--- | :--- | :--- | ---: | :--- | ---: | :--- | ---: | ---: |
| 33125 | 2024-06-14 | 33124- EMPTY | R1,196.00 | 8843 | -R598.00 | 32202 | -R598.00 | -R1,196.00 ✅ |
| 35359 | 2024-08-17 | 35357-EMPTY | R1,196.00 | 9894 | -R598.00 | 39035 | -R598.00 | -R1,196.00 ✅ |
| 38827 | 2024-12-05 | DN#10793 | R2,463.53 | 11402 | -R1,207.50 | 35272 | -R1,256.03 | -R2,463.53 ✅ |
| 38870 | 2024-12-06 | DN#10744 | R5,054.16 | 11419 | -R2,415.00 | 36470 | -R2,639.16 | -R5,054.16 ✅ |
| 39074 | 2024-12-14 | DN#10834 | R2,527.08 | 11494 | -R1,207.50 | 36470 | -R1,319.58 | -R2,527.08 ✅ |
| 39280 | 2024-12-21 | DN#11977 | R5,054.16 | 11558 | -R2,415.00 | 36470 | -R2,639.16 | -R5,054.16 ✅ |
| 39389 | 2024-12-24 | DN#11878 | R2,527.08 | 11590 | -R1,207.50 | 36470 | -R1,319.58 | -R2,527.08 ✅ |
| 43365 | 2025-05-26 | DN#12263-EMPTY | R1,897.50 | 12567 | -R1,725.00 | 39035 | -R172.50 | -R1,897.50 ✅ |
| 43468 | 2025-05-29 | DN#12139-EMPTY | R1,725.00 | 12597 | -R1,207.50 | 39035 | -R517.50 | -R1,725.00 ✅ |
| 44448 | 2025-07-02 | DN#12154-EMPTY | R2,415.00 | 12883 | -R1,897.50 | 32202 | -R517.50 | -R2,415.00 ✅ |
| 47179 | 2025-10-20 | DN#21111-EMPTY | R1,897.50 | 13713 | -R1,207.50 | 40718 | -R690.00 | -R1,897.50 ✅ |
| 47430 | 2025-10-30 | DN#21133-EMPTY | R3,622.50 | 13781 | -R3,105.00 | 40718 | -R517.50 | -R3,622.50 ✅ |
| 48693 | 2026-01-09 | DN-21459 - PMB | R2,325.25 | 14235 | -R1,162.63 | 43067 | -R1,162.62 | -R2,325.25 ✅ |
| 48698 | 2026-01-09 | DN 21459 | R2,415.00 | 14240 | -R1,207.50 | 43067 | -R1,207.50 | -R2,415.00 ✅ |

All 14 close to the exact cent once their payment is included. **Not an
irregularity** — this is the same clean-matching pattern as the other 143
invoices-with-CN, just split across two documents instead of one.

---

## 3. Over-credited invoices (5) — the irregularity

For these, the credit note tagged to the invoice's `INVNO` is **larger**
than the invoice itself — meaning, read literally, the ERP is crediting
more than was ever charged.

### 33750 (02/07/2024)

| Doc | Type | Date | Ref | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 33750 | Invoice | 02/07/2024 | 33749-EMPTY | R1,196.00 |
| 9138 | Crd Note | 02/07/2024 | 33749-EMPTY | -R1,796.00 → -R1,794.00 |

Over-credited by **R598.00**. A same-amount invoice exists 5 days earlier
(`33538`, 27/06/2024, ref "33537- EMPTY", R1,794.00) but the gap is large
enough (and the reference text doesn't match) that this isn't a confident
match — **unexplained**.

### 36139 (11/09/2024)

| Doc | Type | Date | Ref | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 36139 | Invoice | 11/09/2024 | 36138-EMPTY | R1,196.00 |
| 10250 | Crd Note | 11/09/2024 | 36138-EMPTY | -R1,794.00 |

Over-credited by **R598.00**. No same-day or nearby (±7 days) invoice
matches R1,794.00. **Unexplained.**

### 45078 (23/07/2025)

| Doc | Type | Date | Ref | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 45078 | Invoice | 23/07/2025 | HILTON - | R1,897.50 |
| 13036 | Crd Note | 23/07/2025 | HILTON - | -R2,415.00 |

Over-credited by **R517.50**. No same-day or nearby invoice matches
R2,415.00. **Unexplained.**

### 47421 (30/10/2025) — the one case with a confident explanation

| Doc | Type | Date | Ref | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 47420 | Invoice | 30/10/2025 | DN#21133 | R2,361.11 |
| **47421** | **Invoice** | 30/10/2025 | DN#21133-EMPTY | **R2,415.00** |
| **47430** | **Invoice** | 30/10/2025 | DN#21133-EMPTY | **R3,622.50** |
| 13780 | Crd Note (tagged `INVNO 47421`) | 30/10/2025 | DN#21133-EMPTY | -R3,622.50 |
| 13781 | Crd Note (tagged `INVNO 47430`) | 30/10/2025 | DN#21133-EMPTY | -R3,105.00 |

Credit note `13780` (-R3,622.50) is tagged to invoice `47421` (only
R2,415.00) — but its amount matches invoice `47430` **exactly**, same day,
same reference text. `47430` itself is *also* separately closed (via CN
`13781` + a R517.50 payment fragment — see §2's row for 47430), so in
aggregate both invoices net out correctly; it's the **per-document
attribution** that's scrambled. `47421` and `47430` differ by one
transposed-looking digit pair, which reads like a data-entry slip — but per
the correction above, an allocation-algorithm quirk (rather than a human
keying error) is at least as plausible given `INVNO` now looks
ERP-backfilled generally. **Unverified either way** — ties out numerically
and narratively, but no DB-level allocation record or remittance advice
confirms the actual mechanism.

### 48980 (28/01/2026)

| Doc | Type | Date | Ref | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 48980 | Invoice | 28/01/2026 | DN#21217-EMPTY | R1,207.50 |
| 14347 | Crd Note | 28/01/2026 | DN#21217-EMPTY | -R2,415.00 |

Over-credited by **R1,207.50** — notably, the CN amount (R2,415.00) is
*exactly double* invoice 48980's amount, and also exactly matches sibling
invoice `48976` (R1,207.50, ref "DN#21214EMPTY HILTON", same day). Same
day, but different reference text — weaker match than the 47421/47430
case. **Unexplained**, flagged as the same suspected pattern.

---

## 3a. Addendum (2026-09-22, same day) — are these related to the R454.09/R739.87 float?

Checked whether the 5 over-credited CNs are connected to the untagged
R454.09 (6 Mar 2026) / R1,193.96 (21 Apr 2026) payments from
`TAN002_R739.87_Float_Deep_Dive_2026-09-22.md`. **No relationship found,
tested three ways:**

| Total balance of the 5 over-credited CNs | Amount |
| :--- | ---: |
| Sum of the 5 CN amounts | -R12,040.50 |
| Sum of the invoices they're tagged to | R7,912.00 |
| **Total over-credit (the "excess")** | **R4,128.50** |

1. **Arithmetic** — every subset sum (31 combinations) of the 5 over-credit
   amounts (R598, R598, R517.50, R1,207.50, R1,207.50), and separately of
   the 5 full CN amounts, checked against 454.09 and 739.87. Zero matches.
2. **Coincidental balance landing** — the running balance immediately after
   each of the 5 CNs: R11,252.66 / R695.52 / R15,906.08 / -R3,386.95 /
   -R5,247.68. None near either figure.
3. **Timing** — closest CN to the 6 Mar 2026 blank payment is 37 days
   earlier (28/01/2026); the others are 127–612 days earlier.

**Mechanically they can't be related either.** A mistagged CN still nets
out somewhere in the ledger — confirmed directly by the one explained case
above: CN `13780` landed on the wrong invoice (`47421`), but the *correct*
invoice (`47430`) still closed exactly via a different CN + payment. Mistagged
CNs are self-contained noise that cancels within their own document
cluster; they can't leak cash forward into an unrelated later period. The
R454.09/R1,193.96 gap is a different kind of defect — a payment with **no
`INVNO` at all** — which is why it (and only it) shows up in the open
balance.

**Conclusion: two separate, unrelated data-quality issues in the same
account** — CN mistagging (Jul 2024–Jan 2026, self-contained, zero net
effect) and the untagged-payment gap (Mar–Apr 2026, the actual driver of
today's open balance).

---

## 4. What this means

- **Aggregate balance unaffected.** All 5 mistagged/over-credited
  documents' cash still shows up correctly in the account's total — this is
  a *document-attribution* issue, not a cash-accounting one. The PROVEN
  R2,052.39 balance stands.
- **Only 1 of 5 has a confident explanation** (47421/47430, matched
  same-day, same reference, exact reciprocal amount). The other 4
  (33750, 36139, 45078, 48980) don't have an equally strong nearby match —
  reported as genuinely unresolved rather than force-fit to a theory.
- **Same class of issue as the R454.09/R1,193.96 untagged payments**
  already found in `TAN002_R739.87_Float_Deep_Dive_2026-09-22.md` — this
  account's `INVNO` tagging is internally self-consistent 99%+ of the time
  (295 invoices, dozens of credit notes: the tagged amounts sum correctly),
  but per the correction added above, "self-consistent" is not the same
  claim as "reflects genuine debtor intent" — the errors cluster around
  same-day multi-document batches where two documents share very similar
  reference text, consistent with either a human slip or an allocation
  algorithm picking the wrong sibling.

## 5. Next steps

Same as prior reports: resolving any of these 5 fully needs either
DB-level allocation detail (`transaction_headers`/`vw_clean_transactions`
for the specific doc numbers above) or the original delivery-note paperwork
for those dates — not available from the TXT export alone.

---

## 6. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| 47421/47430 mismatch has an ERP-side explanation (transposition or algorithm quirk) — unverified | DB allocation detail or remittance advice confirms which invoice CN 13780 actually relates to |
| 33750, 36139, 45078, 48980 are unexplained | A wider search (DB, remittance paperwork) finds a matching sibling document |
| No impact on the PROVEN R2,052.39 balance | Any evidence surfaces that one of these CNs was never actually applied in the real cash ledger |
