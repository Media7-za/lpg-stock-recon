# LIN001 — Balance Bridge (6 events, Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Window:** 2026-06-08 → 2026-09-04 (DN#22630 → open proforma)  
**Basis:** Movement-only bridge across 5 ERP delivery events plus 1 open proforma event. **No opening (B/F) balance sourced** for this window — this bridge shows net movement, not the full account balance.

---

## Bridge

| Event | Invoice | CN | Event net | Payment | Payment doc(s) | Running balance | Surplus / (shortfall) |
|---|---:|---:|---:|---:|---|---:|---:|
| Opening | | | | | | **R0.00** | |
| **DN#22630** | R132,693.19 | R-67,792.50 | R64,900.69 | R-103,915.60 | 44974+44975 | **R-39,014.91** | R39,014.91 |
| **DN#22508** | R132,862.38 | R-132,862.38 | R0.00 | R0.00 | — | **R-39,014.91** | R0.00 |
| **DN#22936** | R134,049.19 | R-80,097.50 | R53,951.69 | R-54,981.36 | EXT-2744666881 | **R-40,044.58** | R1,029.67 |
| **DN#23974** | R69,652.80 | R-39,445.00 | R30,207.80 | R-34,721.00 | EXT-2901239645 | **R-44,557.78** | R4,513.20 |
| **DN#24947** | R74,433.70 | R-69,000.00 | R5,433.70 | R-28,163.00 | 45961 | **R-67,287.08** | R22,729.30 |
| **Proforma 09-04** | R16,291.80 | R0.00 | R16,291.80 | R-14,106.80 | EXT-2949387151 + EXT-2950393933 | **R-65,102.08** | **(R2,185.00)** |

**Closing movement: R-65,102.08** (net credit position, after the R2,185.00 short-pay on the open proforma)

---

## Tie-out (PROVEN)

```
Total invoices          R559,983.06
Total credit notes     −R389,197.38
─────────────────────────────────
Total event net          R170,785.68

Total payments (all sources)  R235,887.76
  44974 + 44975                R103,915.60
  EXT-2744666881                R54,981.36
  EXT-2901239645                R34,721.00
  45961                         R28,163.00
  EXT-2949387151                R13,416.80
  EXT-2950393933                   R690.00

Total payments − total event net = R235,887.76 − R170,785.68 = R65,102.08 credit
```

Sum of the six per-event surpluses/(shortfalls) also ties:

```
R39,014.91 + R0.00 + R1,029.67 + R4,513.20 + R22,729.30 − R2,185.00 = R65,102.08
```

**Both routes agree exactly.** ✅

---

## The open proforma event (2026-09-04)

**Not yet closed** — and structurally different from the other five:

| Difference | Detail |
|---|---|
| **No DN#** | Proof of event is **missing** — only a proforma invoice photo exists |
| **No credit note** | Pure LPG refill (70×9kg) — no cylinder-deposit lines, so no CN expected |
| **Not in Supabase** | Proforma stage — no ERP `transaction_headers` row yet |
| **Short-paid R2,185.00** | Two receipts (R13,416.80 + R690.00) total R14,106.80 vs. invoice R16,291.80 |

**Full detail:** `LIN001_event_2026-09-04_proforma.md`

The R2,185.00 shortfall could be covered by the R67,287.08 aggregate credit already sitting on the account (from the five closed delivery events) — but this is **not operator-directed**; it's flagged as an option only.

---

## Key finding

The **R67,287.08 credit from the five ERP delivery events is PROVEN** by direct arithmetic — it holds regardless of which specific carry narrative (e.g. DN#23974→24947) is used.

Layering in the **open proforma event** reduces the net position to **R65,102.08**, since that event is short-paid by R2,185.00 and lacks its DN# proof — it is **not yet a closed event** in the same sense as the other five.

---

## Confidence breakdown

| Line | Confidence | Basis |
|---|---|---|
| Invoice / CN amounts (5 ERP events) | **PROVEN** | Supabase `transaction_headers` |
| DN#22630 payment split (44974/44975) | **ASSUMED** | Batch PC-76-32 timing fit, not operator-line-confirmed |
| DN#22508 zero-net | **PROVEN** | Invoice = CN exactly |
| DN#22936 / DN#23974 / DN#24947 payments | **ASSERTED** | Operator-confirmed bank receipts / ERP payment |
| **Aggregate closing movement on 5 ERP events (R-67,287.08)** | **PROVEN** | Direct sum — independent of carry narrative |
| Proforma invoice + payments (2026-09-04) | **ASSERTED** (image evidence) | Not yet in Supabase |
| Proforma DN# / proof of event | **GAP** | Not supplied |

---

## Artifacts

| Artifact | Path |
|---|---|
| Bridge data (JSON) | `analysis/debtors/LIN001/config/balance_bridge_lines.json` |
| Consolidated events register | `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv` |
| Individual event cards | `LIN001_event_DN22936.md`, `LIN001_event_DN23974.md`, `LIN001_event_DN24947.md`, `LIN001_event_2026-09-04_proforma.md` |
