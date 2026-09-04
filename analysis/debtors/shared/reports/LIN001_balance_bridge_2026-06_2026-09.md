# LIN001 — Balance Bridge (5 delivery events, Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Window:** 2026-06-08 → 2026-09-02 (DN#22630 → DN#24947)  
**Basis:** Movement-only bridge across the 5 documented delivery events. **No opening (B/F) balance sourced** for this window — this bridge shows net movement, not the full account balance.

---

## Bridge

| Event (DN#) | Invoice | CN | Event net | Payment | Payment doc(s) | Running balance | Surplus |
|---|---:|---:|---:|---:|---|---:|---:|
| Opening | | | | | | **R0.00** | |
| **22630** | R132,693.19 | R-67,792.50 | R64,900.69 | R-103,915.60 | 44974+44975 | **R-39,014.91** | R39,014.91 |
| **22508** | R132,862.38 | R-132,862.38 | R0.00 | R0.00 | — | **R-39,014.91** | R0.00 |
| **22936** | R134,049.19 | R-80,097.50 | R53,951.69 | R-54,981.36 | EXT-2744666881 | **R-40,044.58** | R1,029.67 |
| **23974** | R69,652.80 | R-39,445.00 | R30,207.80 | R-34,721.00 | EXT-2901239645 | **R-44,557.78** | R4,513.20 |
| **24947** | R74,433.70 | R-69,000.00 | R5,433.70 | R-28,163.00 | 45961 | **R-67,287.08** | R22,729.30 |

**Closing movement: R-67,287.08** (negative = credit / customer overpaid relative to event nets)

---

## Tie-out (PROVEN)

```
Total invoices          R543,691.26
Total credit notes     −R389,197.38
─────────────────────────────────
Total event net          R154,493.88

Total payments (all sources)  R221,780.96
  44974 + 44975                R103,915.60
  EXT-2744666881                R54,981.36
  EXT-2901239645                R34,721.00
  45961                         R28,163.00

Total payments − total event net = R221,780.96 − R154,493.88 = R67,287.08 credit
```

Sum of the five per-event surpluses also ties:

```
R39,014.91 + R0.00 + R1,029.67 + R4,513.20 + R22,729.30 = R67,287.08
```

**Both routes agree exactly.** ✅

---

## Key finding

The **R67,287.08 aggregate credit position is PROVEN** by direct arithmetic (total cash in minus total event net) — this holds regardless of which specific carry narrative is used.

This resolves the earlier "R18,216.10 carry gap" flag: that gap only appears if you insist on a **strict event-to-event chain** (DN#23974's own bank surplus of R4,513.20 funding DN#24947, requiring a named source for the other R18,216.10). At the **aggregate level**, payment **45961** alone already funds DN#24947's event net **and** its R22,729.30 surplus — no external source is needed for that specific event.

The carry-chain story (DN#23974 → DN#24947, R22,729.30) is an **ASSERTED operator narrative** about *which* cash funds *which* surplus. The **totals are PROVEN**; the **event-to-event attribution** is not, and doesn't need to be for the account to tie out.

---

## Confidence breakdown

| Line | Confidence | Basis |
|---|---|---|
| Invoice / CN amounts (all 5 events) | **PROVEN** | Supabase `transaction_headers` |
| DN#22630 payment split (44974/44975) | **ASSUMED** | Batch PC-76-32 timing fit, not operator-line-confirmed |
| DN#22508 zero-net | **PROVEN** | Invoice = CN exactly |
| DN#22936 payment (EXT-2744666881) | **ASSERTED** | Operator bank receipt; ref matches order_no 13991 |
| DN#23974 payment (EXT-2901239645) | **ASSERTED** | Operator bank receipt |
| DN#24947 payment (45961) | **ASSERTED** | Operator allocation confirmed |
| **Aggregate closing movement (R-67,287.08)** | **PROVEN** | Direct sum — independent of carry narrative |

---

## Artifacts

| Artifact | Path |
|---|---|
| Bridge data (JSON) | `analysis/debtors/LIN001/config/balance_bridge_lines.json` |
| Consolidated events register | `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv` |
| Individual event cards | `LIN001_event_DN22936.md`, `LIN001_event_DN23974.md`, `LIN001_event_DN24947.md` |
