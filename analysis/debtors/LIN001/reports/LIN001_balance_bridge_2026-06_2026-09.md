# LIN001 Balance Bridge (Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period:** 2026-06-08 → 2026-09-04
**Doctrine (adopted 2026-09-06):** rolling/cumulative account balance — each event's surplus or shortage carries forward chronologically into the next, the same way the ERP's own Debtor Account Enquiry running-balance column works. This **replaces** the per-event-isolated framing this bridge used earlier in the session as the account's standard way of judging whether a gap is a live concern. See `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2 for the full doctrine statement, including what does and doesn't change under it (individual-transaction evidence work is unchanged; only the final "is this worth chasing" judgment moves to the cumulative basis).

---

## Method

Walk events in date order. For each: `balance = event net (invoice gross + CN gross, header basis)`; `surplus_out = payment(s) received + surplus_in − balance`. That `surplus_out` becomes the next event's `surplus_in`. All six events below use **final, corrected** figures (i.e. reflecting postings made after the original delivery — see the per-event notes for what changed and when).

---

## Rolling balance — all six events, chronological

| Event | Date | Balance (event net) | Surplus in | Payment(s) | Surplus out |
|---|---|---:|---:|---:|---:|
| DN#22630 | 2026-06-08 | R63,325.00 *(corrected — see note 1)* | R0.00 | R63,325.00 (44975) | **R0.00** |
| DN#22508 | 2026-06-18 | R0.00 (zero-net) | R0.00 | R0.00 | **R0.00** |
| DN#22936 | 2026-07-08 | R53,951.69 | R0.00 | R54,981.36 (EXT-2744666881) | **R1,029.67** |
| DN#23974 | 2026-08-24 | R30,207.80 | R1,029.67 | R34,721.00 (EXT-2901239645) | **R5,542.87** |
| DN#24947 | 2026-09-02 | R5,433.70 | R5,542.87 | R28,163.00 (45961) | **R28,272.17** |
| DN#24817 | 2026-09-04 | R42,856.80 *(see note 2)* | R28,272.17 | R14,106.80 (EXT-2949387151 + EXT-2950393933) | **-R477.83** |

**Final cumulative position across the window: R477.83 short — immaterial.** Not worth chasing on this basis; see the per-event cards for the individual facts behind each line.

**Note 1 — DN#22630:** shown at its final corrected value (R63,325.00), reflecting the -R1,575.69 discount posted 2026-09-06 against invoice 51132 (originally posted at R64,900.69; the customer's own proforma quote for this delivery exactly matched payment 44975, and the gap was a header-rate-vs-quote mismatch, not a shortfall). See `docs/LIN001_event_DN22630.md`.

**Note 2 — DN#24817:** invoice 52949 (R52,516.80) less CN 15601 (-R9,660.00, an unrelated 8×48kg cylinder return, confirmed correct by the operator) = R42,856.80. The 9kg deposit charge within that invoice (R36,225.00) is confirmed legitimate — the signed delivery note shows no 9kg cylinders were returned on this delivery, so it is not a posting error. See `docs/LIN001_event_DN24817.md`.

**Note on 44974/44482:** payment 44974 (R40,590.60) and 44482 (R75,844.50) are excluded from this table — both target events outside the Jun–Sep window (DN#21541 and DN#21237 respectively, both Feb 2026) and are tracked in `LIN001_Payment_Allocation_v1.md` instead. Extending the rolling model back through that earlier window (Nov 2025–Sep 2026 in full) is a follow-up, not done here — see the skill doctrine note on this.

---

## Superseded: isolated-event framing (kept for the record, not the standard view)

Before adopting the rolling doctrine, this bridge computed each event's gap independently and summed the results — treating a per-event shortfall as a standalone concern regardless of surplus elsewhere on the account. That produced:

```
Total event net (6 events, as-corrected)   R195,774.99
Total payments received                    R195,297.16
──────────────────────────────────────────
Isolated-basis position: R477.83 shortfall
```

This happens to converge on the same R477.83 figure as the rolling table above (a straight sum and a chronological carry-forward reach the same total when nothing prevents later surplus from covering earlier shortage) — but the rolling table is the one to read event-by-event, since it shows *when* the account was actually short (only briefly, at DN#24817, and then only by an amount already covered by prior surplus) rather than treating DN#24817's R28,750.00 gap as a standalone R28,750.00 problem the way the old framing did. That per-event distinction is exactly why the doctrine changed.

---

## Verification

Recomputed independently from the figures in `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv` and the individual event cards (`docs/LIN001_event_DN*.md`), themselves cross-checked against `transaction_headers` (Supabase project `oqhpxnaadahohwkslive`) as at 2026-09-06. Arithmetic ties exactly: the six `surplus_out` values chain correctly, and the isolated-basis total (R477.83) matches the rolling table's final cumulative figure.

**History:** this bridge went through several corrections before reaching this state — 44974 was reassigned away from DN#22630 to DN#21541 (2026-09-05, WhatsApp remittance evidence); DN#22630's gap was resolved via the customer's proforma quote and the discount posted (2026-09-06); DN#24817 (originally an untied, short-paid proforma) posted to ERP with an unbudgeted deposit charge that a signed delivery note then confirmed as legitimate (2026-09-06). Each event's own card documents its history in full; this bridge reflects only the final state.

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_balance_bridge_2026-06_2026-09.md`*
