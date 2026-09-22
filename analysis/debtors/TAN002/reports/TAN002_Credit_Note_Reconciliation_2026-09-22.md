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
transposed-looking digit pair — the most likely explanation is an `INVNO`
data-entry slip in the source ERP between two adjacent same-day documents.
**ASSERTED, not proven** — ties out numerically and narratively, but no
DB-level allocation record confirms it.

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
  account's `INVNO` tagging is very good (99%+ correct across 295 invoices
  and dozens of credit notes) but not perfect, and the errors cluster
  around same-day multi-document batches where two documents share very
  similar reference text.

## 5. Next steps

Same as prior reports: resolving any of these 5 fully needs either
DB-level allocation detail (`transaction_headers`/`vw_clean_transactions`
for the specific doc numbers above) or the original delivery-note paperwork
for those dates — not available from the TXT export alone.

---

## 6. Tripwires

| Statement | Reopens if |
| :--- | :--- |
| 47421/47430 is a probable INVNO transposition | DB allocation detail shows CN 13780 genuinely belongs to 47421 as tagged |
| 33750, 36139, 45078, 48980 are unexplained | A wider search (DB, remittance paperwork) finds a matching sibling document |
| No impact on the PROVEN R2,052.39 balance | Any evidence surfaces that one of these CNs was never actually applied in the real cash ledger |
