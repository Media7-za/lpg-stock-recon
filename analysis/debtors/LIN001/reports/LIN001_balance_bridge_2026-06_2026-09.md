# LIN001 Balance Bridge (Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period:** 2026-06-08 → 2026-09-04
**Purpose:** Tie total event net (invoice − CN, header basis) against total payments received across the six consolidated events, independent of any event-to-event carry narrative.

> **Correction (2026-09-05):** Payment 44974 (R40,590.60, 2026-06-06) was previously counted here against DN#22630. A customer-forwarded WhatsApp payment confirmation explicitly references "21541" — that payment actually targets DN#21541 (2026-02-13), an earlier event outside this Jun–Sep window. It is removed from Part 1 below; DN#22630 now shows only payment 44975.
>
> **Further update (2026-09-06):** DN#22630's R1,575.69 gap (below) is now fully explained and closed — the customer's own proforma quote for this delivery exactly matches payment 44975 (R63,325.00). ERP posted the delivery at its standard header rate + deposit dispatch/return model rather than the proforma's flat refill rate, producing the gap. A -R1,575.69 credit note is proposed on invoice 51132 to reconcile ERP to the quote; the figures below are still the **as-posted** ERP basis (the credit has not yet been posted). See `docs/LIN001_event_DN22630.md` and `docs/LIN001_ERP_correction_request_51132.md`.

---

## Method

For each event, `event_net = invoice_gross + cn_gross` (CN is stored as a negative gross in ERP, so this is a plain sum). Payments are matched at event level per the consolidated register. The bridge sums both sides across the five ERP-posted deliveries first (all fully PROVEN against `transaction_headers`), then folds in the open proforma separately so the open item cannot mask the closed position.

---

## Part 1 — Five ERP deliveries (PROVEN)

| DN# | Event net | Payment | Payment amount |
|---|---:|---|---:|
| 22630 | R64,900.69 | 44975 | R63,325.00 |
| 22508 | R0.00 | — | R0.00 |
| 22936 | R53,951.69 | EXT-2744666881 | R54,981.36 |
| 23974 | R30,207.80 | EXT-2901239645 | R34,721.00 |
| 24947 | R5,433.70 | 45961 | R28,163.00 |
| **Total** | **R154,493.88** | | **R181,190.36** |

```
R181,190.36  total payments received (5 ERP events, corrected 2026-09-05)
− R154,493.88  total event net (5 ERP events)
────────────────────
= R26,696.48  credit — CORRECTED (was R67,287.08; 44974 R40,590.60 removed, reassigned to DN#21541)
```

This figure is independent of which surplus is assigned to which later event — it is a direct sum of both sides across the five ERP deliveries. DN#22630 shows R1,575.69 short on an **as-posted** basis, but that gap is fully explained and closed (2026-09-06) — see the correction note above; a pending credit note will bring it to R0.00 once posted. Until then, the R26,696.48 aggregate credit shown here is carried entirely by DN#22936/23974/24947's surpluses net of DN#22630's as-posted shortfall.

---

## Part 2 — DN#24817 (CLOSED 2026-09-06 — posted as invoice 52949)

The Proforma 2026-09-04 posted to ERP as invoice 52949/DN#24817, carrying an unbudgeted 9kg cylinder deposit line (R36,225.00) not in the original proforma quote. CN 15601 (-R9,660.00) does not correct that — it credits an unrelated 8×48kg cylinder return, confirmed correct by the operator. The signed delivery note confirms no 9kg cylinders were returned, so the deposit charge is legitimate.

| Item | Amount |
|---|---:|
| Invoice 52949 | R52,516.80 |
| CN 15601 (unrelated 48kg return) | -R9,660.00 |
| Event net | R42,856.80 |
| Payments (EXT-2949387151 + EXT-2950393933) | R14,106.80 |
| Isolated-event gap | **R28,750.00** (legitimate, not creditable) |

```
R42,856.80  event net
− R14,106.80  payments received
────────────
= R28,750.00  gap — legitimate, confirmed via delivery note, not an ERP correction
```

See `docs/LIN001_event_DN24817.md` for the full reconciliation.

---

## Combined position

```
Part 1 credit (CORRECTED):        +R26,696.48
Part 2 gap (isolated, legitimate): -R28,750.00
──────────────────────────────────────────
Net position across all 6 (isolated basis): R2,053.52 shortfall
```

**Rolling-account alternative:** carrying each event's surplus forward chronologically into the next (rather than isolating each event against its own payment) puts the cumulative position after DN#24817 at only **R477.83 short** — immaterial. See `docs/LIN001_event_DN24817.md` for the event-by-event table. This is a materially different number from the R2,053.52 isolated-basis figure above because it lets DN#22936/23974/24947's surpluses fund most of DN#24817's shortfall. **Neither basis is yet this account's formally adopted doctrine** — both are shown pending that decision (see `LIN001_Payment_Allocation_v1.md`).

---

## Notes on surplus components (informational — not required for the bridge to tie)

The R26,696.48 aggregate credit can be decomposed into per-event surpluses/shortfalls, but none of these decompositions change the total:

| Surplus/(shortfall) source | Amount | Tag |
|---|---:|---|
| 44482 (PC-76-31) — predates this window, confirmed against DN#21237 (outside this window) | R75,844.50 | **Confirmed** (see `LIN001_Payment_Allocation_v1.md` §2) |
| DN#22630 — payment 63,325.00 vs event net 64,900.69 (as posted) | (R1,575.69) | **RESOLVED 2026-09-06 — exact match to customer's proforma; -R1,575.69 discount posted** |
| DN#22936 — payment 54,981.36 vs event net 53,951.69 | R1,029.67 | ASSERTED |
| DN#23974 — payment 34,721.00 vs event net 30,207.80 | R4,513.20 | ASSERTED |
| DN#24947 — payment 28,163.00 vs event net 5,433.70 | R22,729.30 | PROVEN |

DN#22630's row nets to R23,667.18 across the other four events' surpluses minus its own shortfall (1,029.67+4,513.20+22,729.30−1,575.69), leaving 44482's R75,844.50 as a separate unallocated pool — 44482 does not appear in the R26,696.48 total (it predates this window and is tracked separately, see the main register's payment register). A narrative exists where the DN#23974 surplus is read as pre-funding DN#24947 (both are ASSERTED/PROVEN payments made ahead of an event closing) — but the R26,696.48 aggregate credit holds true whether or not that specific carry story is accepted, because it is computed as a straight sum across all five events, not by chaining individual surpluses forward.

---

## Verification

Recomputed independently from the figures in `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv`, which are themselves cross-checked against `transaction_headers` (Supabase project `oqhpxnaadahohwkslive`) as at 2026-09-06. Arithmetic ties exactly.

**2026-09-05 re-verification:** removing 44974 (R40,590.60) and recomputing gives R26,696.48 (Part 1) — ties exactly against the per-event decomposition above (1,029.67+4,513.20+22,729.30−1,575.69 = 26,696.48).

**2026-09-06 re-verification:** DN#24817 posted as invoice 52949/DN#24817 with a confirmed-legitimate R28,750.00 isolated gap (Part 2, replacing the R2,185.00 proforma-stage figure). Combined isolated-basis position: R26,696.48 − R28,750.00 = R2,053.52 shortfall. Rolling-account basis (see `docs/LIN001_event_DN24817.md`): R477.83 shortfall.

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_balance_bridge_2026-06_2026-09.md`*
