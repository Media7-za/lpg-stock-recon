# LIN001 — Event Card: DN#21541

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21541
**Date:** 2026-02-13→16 (7-document reversal-and-reissue chain)
**Status:** Open, partially paid. **R349.02 residual** once the missing empties credit is posted — down from an initial "fully unpaid" read. *(Last corrected 2026-09-05.)*

---

## Correction log (2026-09-05, chronological)

This card went through several revisions the same day as evidence came in. Kept here so the reasoning isn't lost:

1. **"No payment ever received"** (original read) → **retracted**. A WhatsApp payment confirmation explicitly references "21541" — payment **44974** (R40,590.60) targets this event, not DN#22630 as previously force-matched.
2. **"No CN exists for the leaking-cylinder claim, entirely off-ledger"** → **retracted**. CN 14435 (-R3,082.00, gas-only, 134kg) is exactly that credit; missed earlier by a search filter.
3. **CN 14435 found to be under-rated** by R60.25 (posted at a rounded R20.00/kg ex-VAT instead of invoice 49265's own R20.391/kg).
4. **"Customer double-counted the empties in his own notebook"** → **retracted**. This assumed CN 14432's recorded return counts (21×19kg, 14×48kg) already included the 2×19kg + 2×48kg faulty units. **Operator confirmed these units were physically returned but never added to the delivery note's recorded totals** — so CN 14432 does *not* cover them, and the customer's own deduction for the empties was a legitimate claim, not an error. **A separate empties credit is owed and has not yet been posted.**

Net effect of all four corrections: the event is being paid down, mostly resolved, with a small (R349.02) genuinely-unexplained residual once the missing empties credit goes through — a very different picture from where this card started.

---

## Documents (chain)

| Doc | Type | Date | Gross |
|---|---|---|---:|
| 49252 | Invoice (original) | 2026-02-13 | R146,559.36 |
| 14430 | Crd Note (partial) | 2026-02-15 | -R96,600.00 |
| 14431 | Crd Note "REV DN#21541" (full reversal of 49252) | 2026-02-15 | -R146,559.36 |
| 49263 | Invoice "REV CRD NOTE#14430" (reverses 14430) | 2026-02-15 | R96,600.00 |
| 14432 | Crd Note (against reissue — quantity correction, unrelated to the leaking claim) | 2026-02-16 | -R96,600.00 |
| 14435 | Crd Note (leaking-cylinder gas credit) | 2026-02-16 | -R3,082.00 *(under-rated — should be -R3,142.25)* |
| 49265 | Invoice (final reissue) | 2026-02-16 | R144,476.87 |
| **Event net as posted in ERP** | | | **R44,794.87** |

Net effect of the chain: the original invoice+CN pair was fully reversed (14431 wipes 49252, 49263 wipes 14430), then cleanly reissued as 49265 − 14432 − 14435. The reversal legs net to zero — the event net equals the clean reissue alone.

## What the customer owes, fully corrected

Two things still need posting: a R60.25 top-up on CN 14435 (gas was under-rated) and a brand-new empties credit for the 2×19kg + 2×48kg-SV cylinders (never posted at all — see below).

```
R144,476.87  Invoice 49265 (final reissue)
− R96,600.00  CN 14432 (unrelated quantity correction)
− R3,142.25   CN 14435, corrected (gas — posted at R3,082.00, R60.25 short)
− R3,795.00   NEW credit needed — empties (2×19kg + 2×48kg-SV deposits, never posted)
──────────────
= R40,939.62  total owed, fully corrected
− R40,590.60  payment 44974 (2026-06-06, confirmed via WhatsApp remittance, ref "21541")
──────────────
= R349.02  residual — small, and explained below (not a mystery)
```

See `LIN001_ERP_correction_request_21541_cylinders.md` for the credit note to post (-R3,855.25 combined: -R3,795.00 empties + -R60.25 gas top-up).

---

## What changed between the original invoice and the reissue

Line-by-line comparison of invoice 49252 (original) vs 49265 (reissue), confirmed via exact `retail_price`/`qty` values:

- **Quantities: unchanged.** Every LPG category kept its exact original quantity (14K=14, 19K=14, 9KG=126, DV=4, SV=6).
- **Prices: uniformly cut by -4.10%.** 9KG 191.37→183.52, 14K 297.69→285.48, 19K 404.01→387.43, SV/DV 1020.65→978.78 — the same percentage cut across every category, to the cent.
- **CYL deposit lines: byte-identical**, never touched.

This is a deliberate, clean rate-table correction — not a quantity dispute, not a wrong-SKU fix, and not category-specific negotiation.

## Timing — not a routine month-boundary reset

Both the Feb 6 baseline (invoice 49115, event DN#21237) and the original Feb 13 invoice (49252) were billed at the same higher rate. The correction to the lower rate landed specifically on this delivery, two days after the original invoice — not on the Feb 4 first-Wednesday reset date. Reads as a customer-flagged correction ("we should already be on the lower rate"), applied to this delivery but **not retroactively to 49115**.

## Why this connects to DN#21237

Invoice 49115 (Feb 6) was never given the same correction 49252→49265 received, despite being billed at the identical stale rate. Re-rating 49115 at 49265's corrected prices explains 85.2% of DN#21237's payment shortfall — see `LIN001_event_DN21237.md` and `LIN001_ERP_correction_request_49115.md`.

---

## The leaking-cylinder claim: what happened, in order

A WhatsApp thread (driver "Jack Lin") includes: *"Hey boss, I returned 2 19kg gas cylinders and 2 48kg gas cylinders because they were leaking. Please refund all of these together."* The delivery note (DN#21541, dated 2026-02-14) shows RECEIVED counts of 21×19kg and 14×48kg-SV, each annotated "2 leaking"/"2 leaks", against dispatched counts of 14×19kg and 6×48kg-SV. TOTAL received: 161 (vs 164 dispatched).

### Only the gas was credited — CN 14435

CN 14435 (-R3,082.00) carries a single line: stock_no `LPG-01` "LPG BULK / TOPUP", qty -134 (exactly 2×19kg + 2×48kg), gas-only, at a rounded R20.00/kg ex-VAT — instead of invoice 49265's actual R20.391/kg. **R60.25 under-credited.**

### The empties were never credited

The recorded 21×19kg / 14×48kg on the delivery note (which CN 14432's -R96,600.00 is built from) are the **normal** return count — per operator confirmation, the 4 faulty cylinders were physically handed back but **not added on top of** that recorded total. So CN 14432 does not include their deposits, and no other document does either. **A fresh empties credit of R3,795.00 (2×19kg deposit R690 + 2×48kg-SV deposit R1,207.50, incl VAT) is owed and has not been posted.**

*(An earlier pass on this card concluded the customer had double-counted this same R3,795.00 in his own notebook — assuming the delivery note's 21/14 already included the 4 units. That assumption is retracted per the operator confirmation above: his deduction was correct, LIN001's posting was incomplete.)*

---

## The R349.02 residual — explained, not a mystery

Once both credits above are posted, R349.02 remains. This traces to a **rate mismatch across the whole invoice**, not the cylinders: the customer's own reconciliation notebook prices *all* gas (9kg, 14kg, 19kg, 48kg — not just the leaking units) at a flat **R23.27/kg incl VAT**, while invoice 49265 actually charged **R23.4497/kg incl VAT** (R20.391/kg ex-VAT). Reproducing his full notebook arithmetic line-by-line (GAS total at his rate, deposit-dispatched total, deposit-returned total, leaking-gas credit at his rate) lands on **R40,590.34** — matching his actual payment (R40,590.26 screenshot / R40,590.60 posted) to within a few cents. Substituting the correct invoice rate throughout his own formula shifts that by **+R349.25**, which is the residual above (R349.02, ~R0.23 apart from cents-level rounding across dozens of hand-multiplied lines).

In short: the customer computed his payment carefully and consistently, just off LIN001's actual rate by about 0.8% (R23.27 vs R23.4497/kg) — an honest, explainable gap, not an error worth chasing further.

## Read on payment status

Payment 44974 is a good-faith, carefully-computed partial payment. The shortfall versus the full corrected amount is fully accounted for by (a) the empties credit LIN001 still owes (R3,795.00, the largest component) and (b) the small rate-mismatch residual (R349.02). There is no unexplained gap once the empties credit is posted.

## Recommended action

1. Post the correction on invoice 49115 (see `LIN001_ERP_correction_request_49115.md`) — separate, unrelated matter.
2. Post the combined -R3,855.25 credit for DN#21541 (see `LIN001_ERP_correction_request_21541_cylinders.md`): -R3,795.00 empties (never posted) + -R60.25 gas top-up (CN 14435 under-rated).
3. Treat the remaining R349.02 as closed/immaterial — it's explained by a rate difference in the customer's own reconciliation, not a data or posting error.
4. Enter payment 44974 into `config/payment_pattern_overrides.json` (override_type `VERIFIED_EXPLICIT_REF`) once an operator formally signs off, per `SKILL_Payment_To_Invoice_Allocation.md` §7.

## Confidence

| Item | Confidence |
|---|---|
| Document chain and net (R44,794.87 as posted) | PROVEN (ERP) |
| Quantities unchanged, prices cut -4.10% | PROVEN (exact line data) |
| Payment 44974 → this event | **Confirmed** (WhatsApp remittance advice, explicit reference "21541") |
| CN 14435 under-rated by R60.25 | PROVEN (exact rate arithmetic vs invoice 49265) |
| Empties credit (R3,795.00) never posted, still owed | ASSERTED — operator-confirmed (delivery-note recording gap), not independently verifiable from ERP data alone |
| R349.02 residual = rate mismatch in customer's own reconciliation | PROVEN (reproduces his exact payment to within cents) |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21541.md` |
| DN#21237 card (connected event) | `LIN001_event_DN21237.md` |
| ERP correction request (49115 rate) | `LIN001_ERP_correction_request_49115.md` |
| ERP correction request (this event's cylinder credit) | `LIN001_ERP_correction_request_21541_cylinders.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
| Payment allocation ledger | `../reports/LIN001_Payment_Allocation_v1.md` |
