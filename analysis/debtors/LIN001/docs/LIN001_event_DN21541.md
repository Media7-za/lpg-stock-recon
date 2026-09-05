# LIN001 — Event Card: DN#21541

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21541
**Date:** 2026-02-13→16 (7-document reversal-and-reissue chain)
**Status:** Open — partially paid, **R4,144.02 residual unexplained** (corrected event total, see below). *(Corrected 2026-09-05 — previously shown as "no payment received.")*

---

## Correction log (2026-09-05)

This card previously read "no payment ever received for this event" and inferred the event was "resolved on paper, unpaid in cash." That conclusion is **retracted**. A customer-forwarded WhatsApp payment confirmation, dated 2026-06-06, explicitly references **"21541"** — the payment is **44974** (R40,590.60 posted in ERP; the screenshot itself reads R40,590.26, a R0.34 variance most likely from the capture/OCR, same payment on date+reference match). This payment was previously force-matched to DN#22630 as an ASSUMED split with 44975; that split is retired (see `LIN001_event_DN22630`-equivalent detail in the main Jun–Sep register and `allocation_edges.csv` AL-0010/AL-0011) because customers don't typically part-pay one invoice across two payment docs, and the remittance evidence directly contradicts it.

This is the one edge in the whole LIN001 payment ledger with genuine remittance advice (`commercially_confirmed: true`) rather than plain amount/date proximity.

**Second correction, same day:** the leaking-cylinder claim (see below) was previously reported as having no corresponding CN in ERP — "entirely off-ledger." That was wrong: **CN 14435 (-R3,082.00) is exactly that credit**, missed by a search filter, and it's already inside the R44,794.87 event net as posted. The R4,204.27 residual (on that as-posted total) is therefore unrelated to the cylinder claim — see the rewritten section below.

**Third correction, same day:** CN 14435 itself was under-credited by R60.25 (posted at a rounded R20.00/kg ex-VAT rate instead of invoice 49265's own R20.391/kg rate — see below). Correcting that puts the **actual event total at R44,734.62** and the **residual at R4,144.02**, not R44,794.87 / R4,204.27. All figures below use the corrected R4,144.02.

---

## Documents (chain)

| Doc | Type | Date | Gross |
|---|---|---|---:|
| 49252 | Invoice (original) | 2026-02-13 | R146,559.36 |
| 14430 | Crd Note (partial) | 2026-02-15 | -R96,600.00 |
| 14431 | Crd Note "REV DN#21541" (full reversal of 49252) | 2026-02-15 | -R146,559.36 |
| 49263 | Invoice "REV CRD NOTE#14430" (reverses 14430) | 2026-02-15 | R96,600.00 |
| 14432 | Crd Note (against reissue) | 2026-02-16 | -R96,600.00 |
| 14435 | Crd Note (small, against reissue) | 2026-02-16 | -R3,082.00 *(as posted — should be -R3,142.25, see below)* |
| 49265 | Invoice (final reissue) | 2026-02-16 | R144,476.87 |
| **Event net (as posted in ERP)** | | | **R44,794.87** |
| **Event total (corrected — CN 14435 at 49265's own rate)** | | | **R44,734.62** |

Net effect: the original invoice+CN pair was fully reversed (14431 wipes 49252, 49263 wipes 14430), then cleanly reissued as 49265 − 14432 − 14435. The reversal legs net to zero — the event net equals the clean reissue alone. CN 14435 itself is R60.25 under-credited relative to invoice 49265's own rate (see "The leaking-cylinder claim" below) — the corrected event total accounts for that.

## Payment status

```
R44,734.62  actual event total (corrected — see "The leaking-cylinder claim" below)
− R40,590.60  payment 44974 (2026-06-06, confirmed via WhatsApp remittance, ref "21541")
────────────
= R4,144.02  residual — open, unexplained
```

(As posted in ERP, before the R60.25 CN 14435 correction: R44,794.87 − R40,590.60 = R4,204.27. The R4,144.02 figure above is the corrected basis and is what's tracked going forward, incl. in DK-591.)

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

## The leaking-cylinder claim — RESOLVED (2026-09-05): already credited in ERP as CN 14435

A second WhatsApp thread (driver conversation, "Jack Lin") includes the message: *"Hey boss, I returned 2 19kg gas cylinders and 2 48kg gas cylinders because they were leaking. Please refund all of these together."* Earlier passes on this card concluded no ERP record existed for this claim. **That conclusion was wrong** — the search that reached it filtered `transaction_items.description` for "19" or "48", which missed a credit posted under a generic bulk-gas stock code.

### The credit note

**CN 14435** (2026-02-16, -R3,082.00, posted same-day as the final reissue 49265 and CN 14432) carries a single line:

| doc_no | stock_no | description | qty | retail_price (ex-VAT) | Gross (incl VAT) |
|---|---|---|---:|---:|---:|
| 14435 | LPG-01 | LPG BULK / TOPUP | -134 | R20.00 | -R3,082.00 |

**134kg is exactly 2×19kg + 2×48kg** — the precise weight of the customer's leaking-cylinder claim. This is gas-only (no deposit line reversed — consistent with a cylinder exchange rather than a full return) and posted as an extra credit alongside the normal reversal-and-reissue restructuring, not part of it.

**This credit is already inside the R44,794.87 event net as posted** at the top of this card: `49265 (R144,476.87) − 14432 (R96,600.00) − 14435 (R3,082.00) = R44,794.87`. It was already netted in before payment 44974 was ever tested against this event. The leaking-cylinder claim was resolved on the ERP side, on the same day the pricing correction landed — not left off-ledger as previously stated.

**Rate used vs. alternatives — CN 14435 is itself under-credited:**

| Basis | Rate (incl VAT) | Value for 134kg |
|---|---:|---:|
| **Posted (CN 14435)** | **R23.00/kg** | **R3,082.00** |
| **Correct basis — precise SKU rate on 49265** (R20.391/kg ex-VAT, what the customer was actually charged) | **R23.45/kg** | **R3,142.25** |
| Customer's own notebook rate (R23.27/kg incl VAT, confirmed below) | R23.27/kg | R3,118.18 |

A credit for returned/defective goods should refund what was actually charged — invoice 49265's own rate — not a rounded bulk-topup rate. **CN 14435 should have been -R3,142.25, not -R3,082.00: a R60.25 under-credit.** (The customer's own R23.27/kg rate is a secondary reference point, not the correct basis — it's R0.18/kg different from the invoice's actual rate.)

**Corrected event total, applying the R60.25 fix:**

```
R144,476.87  Invoice 49265 (final reissue)
− R96,600.00  CN 14432
− R3,142.25   CN 14435, corrected (posted as R3,082.00)
──────────────
= R44,734.62  actual event total (vs R44,794.87 as posted in ERP)
```

### Conclusion: the residual is unrelated to the leaking-cylinder claim, and is R4,144.02 on the corrected basis

**The residual is a genuinely separate, unexplained shortfall — not connected to the leaking cylinders, which are already substantially accounted for** (modulo the R60.25 under-credit above). The earlier extensive testing of gas-only/deposit-only/combined refund scenarios (against both this event's and DN#21237's rates) was based on the incorrect premise that no credit existed; that analysis is retracted as moot, not as still-relevant-but-inconclusive.

```
R44,734.62  actual event total (corrected)
− R40,590.60  payment 44974
──────────────
= R4,144.02  residual — open, unexplained (was R4,204.27 on the as-posted ERP total)
```

What remains open is finding the actual cause of this R4,144.02 gap — a fresh question, not a continuation of the cylinder investigation.

### The notebook rate — still a genuine finding, now a side note

The customer's handwritten notebook prices 19kg gas at **R442.13**, which is exactly **19kg × R23.27/kg incl VAT** — the customer's own flat per-kg rate, distinct from both LIN001's rate table (R20.391/kg post-correction) and the R20.00/kg ex-VAT rate actually used on CN 14435. This confirms the customer's rate basis differs slightly from what was credited (R23.27 vs R23.00/kg incl VAT, a 1.2% gap) — worth flagging if they push back on the amount, but not large enough to explain R4,144.02 on its own.

This needs the customer's actual documentation (their notebook page in full, ideally photographed alongside the WhatsApp thread) or a direct conversation, not further internal recomputation — the analysis has exhausted the combinations the available data supports.

## Read on payment status

Payment 44974 confirms the customer intended this event as a target and made a real, if partial, payment against it. The leaking-cylinder claim is already resolved on the ERP side (CN 14435, see above, modulo the R60.25 under-credit) — so the R4,144.02 gap is **not** that dispute resurfacing. The pricing correction (49252→49265) also landed cleanly with no further correction cycle, and normal pricing resumed by DN#22630 (June 8). The residual's actual cause is currently unknown.

**Also notable:** no further LIN001 activity in ERP for nearly 4 months after this event (next event is DN#22630, June 8) — the cause of that gap, and of the R4,144.02 shortfall, may be the same underlying issue, but there's no evidence yet linking them.

## Recommended action

1. Post the DN#21541-consistent correction on invoice 49115 (see `LIN001_ERP_correction_request_49115.md`).
2. Ask the customer directly what the R4,144.02 residual represents — it is not the leaking-cylinder claim (already credited via CN 14435) and cannot be reverse-engineered from ERP data alone.
3. Post a supplementary R60.25 credit to correct CN 14435's under-credit (R3,082.00 posted vs R3,142.25 at invoice 49265's own rate) if/when this account is next corrected, so the leaking-cylinder matter is fully closed rather than just close.
4. Enter payment 44974 into `config/payment_pattern_overrides.json` (override_type `VERIFIED_EXPLICIT_REF`) once an operator formally signs off, per `SKILL_Payment_To_Invoice_Allocation.md` §7.

## Confidence

| Item | Confidence |
|---|---|
| Document chain and net (R44,794.87 as posted / R44,734.62 corrected) | PROVEN (ERP) |
| Quantities unchanged, prices cut -4.10% | PROVEN (exact line data) |
| Payment 44974 → this event | **Confirmed** (WhatsApp remittance advice, explicit reference "21541") |
| Leaking-cylinder claim → CN 14435 (-R3,082.00 posted, should be -R3,142.25, 134kg) | **PROVEN** (ERP line data, exact weight match) — already inside the event total; R60.25 under-credited |
| R4,144.02 residual and its cause (corrected basis; R4,204.27 as-posted) | GAP — confirmed unrelated to the leaking-cylinder claim; actual cause not yet identified |
| Notebook 19kg rate (R442.13) | **RESOLVED** (2026-09-05) — exactly 19kg × R23.27/kg incl VAT, the customer's own flat per-kg rate; R0.27/kg above the R23.00/kg actually credited |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21541.md` |
| DN#21237 card (connected event) | `LIN001_event_DN21237.md` |
| ERP correction request | `LIN001_ERP_correction_request_49115.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
| Payment allocation ledger | `../reports/LIN001_Payment_Allocation_v1.md` |
