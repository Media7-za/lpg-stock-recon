# LIN001 — Event Card: DN#21541

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21541
**Date:** 2026-02-13→16 (7-document reversal-and-reissue chain)
**Status:** Open — partially paid, **R4,204.27 residual unexplained**. *(Corrected 2026-09-05 — previously shown as "no payment received.")*

---

## Correction log (2026-09-05)

This card previously read "no payment ever received for this event" and inferred the event was "resolved on paper, unpaid in cash." That conclusion is **retracted**. A customer-forwarded WhatsApp payment confirmation, dated 2026-06-06, explicitly references **"21541"** — the payment is **44974** (R40,590.60 posted in ERP; the screenshot itself reads R40,590.26, a R0.34 variance most likely from the capture/OCR, same payment on date+reference match). This payment was previously force-matched to DN#22630 as an ASSUMED split with 44975; that split is retired (see `LIN001_event_DN22630`-equivalent detail in the main Jun–Sep register and `allocation_edges.csv` AL-0010/AL-0011) because customers don't typically part-pay one invoice across two payment docs, and the remittance evidence directly contradicts it.

This is the one edge in the whole LIN001 payment ledger with genuine remittance advice (`commercially_confirmed: true`) rather than plain amount/date proximity.

---

## Documents (chain)

| Doc | Type | Date | Gross |
|---|---|---|---:|
| 49252 | Invoice (original) | 2026-02-13 | R146,559.36 |
| 14430 | Crd Note (partial) | 2026-02-15 | -R96,600.00 |
| 14431 | Crd Note "REV DN#21541" (full reversal of 49252) | 2026-02-15 | -R146,559.36 |
| 49263 | Invoice "REV CRD NOTE#14430" (reverses 14430) | 2026-02-15 | R96,600.00 |
| 14432 | Crd Note (against reissue) | 2026-02-16 | -R96,600.00 |
| 14435 | Crd Note (small, against reissue) | 2026-02-16 | -R3,082.00 |
| 49265 | Invoice (final reissue) | 2026-02-16 | R144,476.87 |
| **Event net** | | | **R44,794.87** |

Net effect: the original invoice+CN pair was fully reversed (14431 wipes 49252, 49263 wipes 14430), then cleanly reissued as 49265 − 14432 − 14435. The reversal legs net to zero — the event net equals the clean reissue alone.

## Payment status

```
R44,794.87  event net
− R40,590.60  payment 44974 (2026-06-06, confirmed via WhatsApp remittance, ref "21541")
────────────
= R4,204.27  residual — open, unexplained
```

---

## What changed between the original and the reissue

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

## The R4,204.27 residual — leaking-cylinder claim investigated, not closed

A second WhatsApp thread (driver conversation, "Jack Lin") includes the message: *"Hey boss, I returned 2 19kg gas cylinders and 2 48kg gas cylinders because they were leaking. Please refund all of these together."* This is a candidate explanation for the residual, but it does not close cleanly:

### No ERP record exists for this claim, under either event

Checked `transaction_items` for LIN001, 2026-02-06 → 2026-03-31 (all 19kg/48kg line activity): every line in that window carries `reference` = `DN#21237`, `DN#21541`, or `REV DN#21541` / `REV CRD NOTE#14430` — i.e. it's fully accounted for by the two events' own reversal-and-reissue chains, already reflected in the event nets above and in `LIN001_event_DN21237.md`. **No separate credit note or return document exists for a 2×19kg + 2×48kg leaking-cylinder claim.** Whatever happened with these cylinders physically, it was never posted to the ledger — this is an off-book claim, evidenced only by the WhatsApp message.

### Which delivery did the leaking cylinders come from?

Raised directly by the operator: the cylinders reported leaking on the Feb 14 visit may have been dispatched on an **earlier** delivery, not this one — the customer could simply have been carrying them in stock and handed them back to the driver on this visit. Checked the immediately preceding LIN001 deliveries:

| Event | Date | 19kg dispatched | 48kg dispatched | 19kg gas rate (ex-VAT) | 48kg gas rate (ex-VAT) |
|---|---|---:|---:|---:|---:|
| DN-21627 | 2026-01-10 | 7 | 0 | R396.52 | — |
| **DN#21237** | **2026-02-06** | **28** | **10 (5 SV + 5 DV)** | **R404.01** | **R1,020.65** |
| DN#21541 (this event, final reissue 49265) | 2026-02-13→16 | 14 | 10 (6 SV + 4 DV) | R387.43 | R978.78 |

DN#21237 (Feb 6, **8 days before** the Feb 14 visit) is the only prior event that dispatched both 19kg and 48kg cylinders in this window, and is the most plausible physical source if the leaking units were already in the customer's hands rather than part of this delivery's own load.

### Rate/component combinations tested — none tie exactly to R4,204.27

The **deposit** rates (19kg R600, 48kg R1,050 ex-VAT) never change between events, so a deposit-only estimate is rate-invariant regardless of which event supplied the cylinders. Only the **gas** rate depends on the source event. Four combinations tested, incl. VAT:

| Scenario | Using DN#21541's own rates (49265) | Using DN#21237's rates (49115) |
|---|---:|---:|
| Gas only (2×19kg + 2×48kg gas) | R3,142.28 | R3,276.72 |
| Deposit only (2×19kg + 2×48kg deposit) | R3,795.00 | R3,795.00 *(rate-invariant)* |
| Combined (gas + deposit) | R6,937.28 | R7,071.72 |

**None of these six values equals R4,204.27.** Switching to DN#21237's rates (per the "previous event" hypothesis) does not change the deposit-only figure at all, and moves the gas-only/combined figures further from the target, not closer. The "previous event" question doesn't resolve the gap either way — it changes which invoice's gas rate would apply if a refund were computed cleanly, but no clean computation ties to the actual residual under either event.

### The notebook rate — resolved (2026-09-05)

The customer's handwritten reconciliation notebook prices 19kg gas at **R442.13**. This does not match any LIN001-invoiced rate (checked across the full 2023–2026 history), but it is exactly explained by a flat customer-side rate: **R442.13 = 19kg × R23.27/kg incl VAT**, to the cent. The customer appears to price gas on their own flat per-kg basis (R23.27/kg incl VAT, applied uniformly regardless of cylinder size) rather than LIN001's rate table (R20.391/kg post-correction, R21.264/kg pre-correction). This is a real, internally-consistent customer rate, not a data error or mis-transcription — the earlier "does not match any invoiced rate" framing is retracted.

**Testing this rate against the R4,204.27 residual:** at R23.27/kg, the 2×19kg + 2×48kg claim (134kg) values at:

| Component | Amount |
|---|---:|
| Gas only, 134kg × R23.27/kg | R3,118.18 |
| Deposit only (rate-invariant regardless of gas rate used) | R3,795.00 |
| Gas + deposit | R6,913.18 |

**None of these tie to R4,204.27** — gas-only is R1,086.09 short; gas+deposit overshoots by R2,708.91. So while the customer's rate basis is now confirmed and understood, it does not on its own explain the residual under a plain gas-only or gas+deposit reading of the leaking-cylinder claim.

### Conclusion on the residual

R4,204.27 stays **open**, narrower than before. The leaking-cylinder claim is a real, evidenced customer request, priced on a real, now-understood customer rate basis (R23.27/kg incl VAT) — but:
1. It was never posted as a CN in ERP under either candidate source event,
2. No tested rate/component combination — LIN001's own rates, the prior event's rates, or the customer's own R23.27/kg rate, gas-only or combined with deposit — ties to the residual amount exactly.

This needs the customer's actual documentation (their notebook page in full, ideally photographed alongside the WhatsApp thread) or a direct conversation, not further internal recomputation — the analysis has exhausted the combinations the available data supports.

## Read on payment status

Payment 44974 confirms the customer intended this event as a target and made a real, if partial, payment against it. The R4,204.27 gap is most plausibly the leaking-cylinder claim (self-reported by the customer, unresolved amount) rather than an ongoing pricing dispute — the pricing correction (49252→49265) already landed cleanly with no further correction cycle, and normal pricing resumed by DN#22630 (June 8).

**Also notable:** no further LIN001 activity in ERP for nearly 4 months after this event (next event is DN#22630, June 8) — consistent with the leaking-cylinder issue (or something else) delaying full settlement, with the June payment resuming things at the same time it partially covers this event.

## Recommended action

1. Post the DN#21541-consistent correction on invoice 49115 (see `LIN001_ERP_correction_request_49115.md`).
2. Ask the customer directly for the exact amount and basis of the leaking-cylinder refund they expected — the R4,204.27 residual cannot be reverse-engineered from ERP data alone.
3. Clarify with the customer which delivery the 2×19kg + 2×48kg leaking units were originally received on (DN#21237 is the strongest candidate by timing, but this remains unconfirmed).
4. ~~Reconcile the notebook's R442.13 19kg rate against actual invoiced history~~ — RESOLVED: it's the customer's own R23.27/kg incl-VAT rate, not an ERP rate. Worth confirming with the customer whether they expect LIN001 to honor R23.27/kg on this refund, since it doesn't match LIN001's own R20.391/kg corrected rate.
5. Enter payment 44974 into `config/payment_pattern_overrides.json` (override_type `VERIFIED_EXPLICIT_REF`) once an operator formally signs off, per `SKILL_Payment_To_Invoice_Allocation.md` §7.

## Confidence

| Item | Confidence |
|---|---|
| Document chain and net (R44,794.87) | PROVEN (ERP) |
| Quantities unchanged, prices cut -4.10% | PROVEN (exact line data) |
| Payment 44974 → this event | **Confirmed** (WhatsApp remittance advice, explicit reference "21541") |
| R4,204.27 residual and its cause | GAP — leaking-cylinder claim investigated, does not tie exactly under any tested rate/component combination (LIN001's rates, either candidate event, or the customer's own R23.27/kg rate); source event (DN#21237 vs this event) unresolved |
| Notebook 19kg rate (R442.13) | **RESOLVED** (2026-09-05) — exactly 19kg × R23.27/kg incl VAT, the customer's own flat per-kg rate |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21541.md` |
| DN#21237 card (connected event, candidate source of leaking cylinders) | `LIN001_event_DN21237.md` |
| ERP correction request | `LIN001_ERP_correction_request_49115.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
| Payment allocation ledger | `../reports/LIN001_Payment_Allocation_v1.md` |
