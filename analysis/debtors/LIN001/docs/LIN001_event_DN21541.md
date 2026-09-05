# LIN001 — Event Card: DN#21541

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21541
**Date:** 2026-02-13→16 (7-document reversal-and-reissue chain)
**Status:** Open — no payment received. Likely resolved-on-paper, unpaid-in-cash.

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

**No payment ever received for this event.**

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

## Read on payment status

Leans **resolved on the ERP side, not settled in cash**. The correction moved price in the customer's favor with no further correction cycle after it, and normal pricing resumed by DN#22630 (June 8, ~R24.67/kg) — this isn't an ongoing rate fight. The most likely explanation for zero payment: the customer may be withholding payment until they see the same correction applied to 49115 (and possibly other invoices from the same window), rather than continuing to dispute 49265 itself.

**Also notable:** no further LIN001 activity in ERP for nearly 4 months after this event (next event is DN#22630, June 8) — consistent with deliveries being paused during the dispute.

## Recommended action

1. Post the DN#21541-consistent correction on invoice 49115 (see `LIN001_ERP_correction_request_49115.md`).
2. Once posted, follow up with the customer on this event's R44,794.87 — if the only blocker was seeing 49115 corrected, payment may follow once that's visibly resolved.
3. Confirm with the customer whether any other invoices in this window (before the correction) also need the retroactive rate applied — this analysis only checked 49115.

## Confidence

| Item | Confidence |
|---|---|
| Document chain and net (R44,794.87) | PROVEN (ERP) |
| Quantities unchanged, prices cut -4.10% | PROVEN (exact line data) |
| "Resolved on paper" read | ASSERTED — inferred from no further correction cycle and resumed normal pricing later |
| Reason for zero payment | GAP — plausible hypothesis, not confirmed with the customer |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21541.md` |
| DN#21237 card (connected event) | `LIN001_event_DN21237.md` |
| ERP correction request | `LIN001_ERP_correction_request_49115.md` |
