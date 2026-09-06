# LIN001 — Event Card: DN#21237

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#21237
**Date:** 2026-02-06
**Status:** **CLOSED** — payment confirmed; rate correction at the operator-confirmed agreed rate (R20.24/kg ex-VAT) closes the gap to R0.16 *(2026-09-06)*

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

## Investigation: pricing dispute — closed 2026-09-06

A background investigation compared this invoice's LPG price-per-kg against the immediately prior (48725, Jan 10) and following (49265, Feb 16) invoices, and found invoice 49115 was billed at the stale **R21.264/kg** rate. The first correction attempt re-rated it to invoice 49265's own posted rate (R20.391/kg), explaining 85.2% of the gap (R2,096.66 of R2,459.81) and leaving R362.85 open.

**Superseded 2026-09-06: the operator confirmed the actual agreed February rate was R20.24/kg ex-VAT** — different from (lower than) 49265's own posted rate, which apparently wasn't exactly the agreed rate either. Re-rating at R20.24/kg:

```
R78,304.31  original event net
− R2,459.97  LPG re-rate to the confirmed agreed rate (R20.24/kg ex-VAT)
────────────
= R75,844.34  corrected event net
− R75,844.50  actual payment (44482, Confirmed via remittance)
────────────
= R0.16  residual — immaterial
```

**Result: the confirmed agreed rate closes the gap to R0.16** — effectively fully explained, and strong independent confirmation that R20.24/kg is the correct rate (an arbitrary wrong rate would not have landed this close by chance).

## Recommended action

Post the correction detailed in `LIN001_ERP_correction_request_49115.md` — a **-R2,459.97** CN against invoice 49115 (supersedes the earlier -R2,096.66 figure). No further follow-up needed on this event; R0.16 is not worth chasing.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| Payment 44482 belongs to this event | **Confirmed** (2026-09-06, payment-app receipt explicitly referencing "21237", exact date+amount match) |
| Correction amount (R2,459.97, at the confirmed agreed R20.24/kg rate) | **PROVEN** (exact line-level re-rate; closes the gap to R0.16) |
| R0.16 remainder | Immaterial — normal VAT-rounding tolerance |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN21237.md` |
| ERP correction request | `LIN001_ERP_correction_request_49115.md` |
| DN#21541 card (source of corrected rate) | `LIN001_event_DN21541.md` |
| Allocation edge | `../data/allocation_edges.csv` |
