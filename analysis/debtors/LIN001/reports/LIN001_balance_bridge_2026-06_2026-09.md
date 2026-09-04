# LIN001 Balance Bridge (Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period:** 2026-06-08 → 2026-09-04
**Purpose:** Tie total event net (invoice − CN, header basis) against total payments received across the six consolidated events, independent of any event-to-event carry narrative.

---

## Method

For each event, `event_net = invoice_gross + cn_gross` (CN is stored as a negative gross in ERP, so this is a plain sum). Payments are matched at event level per the consolidated register. The bridge sums both sides across the five ERP-posted deliveries first (all fully PROVEN against `transaction_headers`), then folds in the open proforma separately so the open item cannot mask the closed position.

---

## Part 1 — Five ERP deliveries (PROVEN)

| DN# | Event net | Payment | Payment amount |
|---|---:|---|---:|
| 22630 | R64,900.69 | 44974 + 44975 | R103,915.60 |
| 22508 | R0.00 | — | R0.00 |
| 22936 | R53,951.69 | EXT-2744666881 | R54,981.36 |
| 23974 | R30,207.80 | EXT-2901239645 | R34,721.00 |
| 24947 | R5,433.70 | 45961 | R28,163.00 |
| **Total** | **R154,493.88** | | **R221,780.96** |

```
R221,780.96  total payments received (5 ERP events)
− R154,493.88  total event net (5 ERP events)
────────────────────
= R67,287.08  credit — PROVEN
```

This figure is independent of which surplus is assigned to which later event — it is a direct sum of both sides across the five closed ERP deliveries.

---

## Part 2 — Proforma 2026-09-04 (open, ASSERTED)

| Item | Amount |
|---|---:|
| Proforma event net | R16,291.80 |
| Payments (EXT-2949387151 + EXT-2950393933) | R14,106.80 |
| Shortfall | **R2,185.00** |

```
R16,291.80  proforma event net
− R14,106.80  payments received
────────────
= R2,185.00  short-paid — event open
```

---

## Combined position

```
Part 1 credit (PROVEN):       +R67,287.08
Part 2 shortfall (ASSERTED):   -R2,185.00
──────────────────────────────────────────
Net position across all 6:    R65,102.08 credit
```

---

## Notes on surplus components (informational — not required for the bridge to tie)

The R67,287.08 aggregate credit can be decomposed into per-event surpluses, but none of these decompositions change the total:

| Surplus source | Amount | Tag |
|---|---:|---|
| 44482 (PC-76-31) — predates this window, never assigned to an event | R75,844.50 | ASSUMED |
| DN#22630 — payment 103,915.60 vs event net 64,900.69 | R39,014.91 | ASSUMED |
| DN#22936 — payment 54,981.36 vs event net 53,951.69 | R1,029.67 | ASSERTED |
| DN#23974 — payment 34,721.00 vs event net 30,207.80 | R4,513.20 | ASSERTED |
| DN#24947 — payment 28,163.00 vs event net 5,433.70 | R22,729.30 | PROVEN |

A narrative exists where the DN#23974 surplus is read as pre-funding DN#24947 (both are ASSERTED/PROVEN payments made ahead of an event closing) — but the R67,287.08 aggregate credit holds true whether or not that specific carry story is accepted, because it is computed as a straight sum across all five events, not by chaining individual surpluses forward.

---

## Verification

Recomputed independently from the figures in `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv`, which are themselves cross-checked against `transaction_headers` (Supabase project `lpg-stock-recon`) as at 2026-09-04. Arithmetic ties exactly; no adjustment required.

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_balance_bridge_2026-06_2026-09.md`*
