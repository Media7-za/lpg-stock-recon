# LIN001 — Event Card: DN#21237

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21237
**Date:** 2026-02-06
**Status:** Payment **confirmed** via remittance advice (2026-09-06); pricing dispute mostly explained, R362.85 residual open

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 49115 | 2026-02-06 | R142,071.81 |
| Credit note | 14388 | 2026-02-06 | R-63,767.50 |
| **Event net** | | | **R78,304.31** |
| Payment | 44482 | 2026-05-08 | R75,844.50 |

91-day lag between invoice and payment — well outside this account's normal range (5–42 days seen elsewhere), itself a signal something was being disputed rather than simply delayed.

---

## Payment confirmed, gap open

**Corrected 2026-09-06:** payment 44482 was previously a forced/ASSERTED match (smallest-difference candidate among the three open 2026 events). A customer payment-app receipt (New Champion Supermarket → Bella Energy Services300, 2026-05-08 08:46, Transaction ID 2574462828, R75,844.50) explicitly references **"No: 21237"** — exact date and amount match. The target is now **Confirmed** via genuine remittance advice, not inference. This also explains the unusual 91-day lag: not proximity-guessing an unrelated event, but a genuinely late payment against the correct one.

```
R78,304.31  event net
− R75,844.50  payment 44482
────────────
= R2,459.81  gap
```

## Investigation: pricing dispute (mostly confirmed)

A background investigation compared this invoice's LPG price-per-kg against the immediately prior (48725, Jan 10) and following (49265, Feb 16) invoices. Findings, cross-verified with exact line-level `retail_price`/`line_tax` data (see `LIN001_ERP_correction_request_49115.md` for the full verification):

- Invoice 49115 was billed at **R21.264/kg** across every LPG category.
- Invoice 49265 (Feb 16, event DN#21541) shows a **corrected rate of R20.391/kg** — a uniform -4.10% cut applied days later on an unrelated delivery, at unchanged quantities (see `LIN001_event_DN21541.md`).
- 49115 never received the same correction.

**Precise re-rate calculation** (49115's actual quantities at 49265's corrected prices):

```
R78,304.31  original event net
− R2,096.66  LPG re-rate to corrected price (49115 → 49265 rate)
────────────
= R76,207.65  corrected event net
− R75,844.50  actual payment (44482)
────────────
= R362.85  residual — still unexplained
```

**Result: 85.2% of the gap (R2,096.66 of R2,459.81) is explained by pricing.** R362.85 remains genuinely open — small enough that it isn't obviously a second issue, but too large (>350x our established rounding ceiling of ~R1) to write off as noise.

## Recommended action

Post the correction detailed in `LIN001_ERP_correction_request_49115.md` (a -R2,096.66 CN against invoice 49115). This does not fully close the event — R362.85 would remain — but it resolves the large majority of the gap on a documented, verifiable basis rather than leaving the whole R2,459.81 unexplained.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| Price-per-kg discrepancy (49115 vs 49265) | PROVEN (exact `retail_price` values) |
| R2,096.66 correction amount | PROVEN (computed from actual line data) |
| Payment 44482 belongs to this event | **Confirmed** (2026-09-06, payment-app receipt explicitly referencing "21237", exact date+amount match) |
| R362.85 residual cause | GAP — unexplained |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21237.md` |
| ERP correction request | `LIN001_ERP_correction_request_49115.md` |
| DN#21541 card (source of corrected rate) | `LIN001_event_DN21541.md` |
| Allocation edge | `../data/allocation_edges.csv` |
