# LIN001 Payment Allocation (v1) — Forked Ledger

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period covered:** 2025-11-06 → 2026-09-02
**Doctrine:** `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`
**Status:** Exploratory — forked from the main event register (`LIN001_events_consolidated_2026-06_2026-09.md` / `docs/LIN001_event_DN*.md`). Nothing here overwrites that register; it adds the payment-matching dimension with formal confidence tags, since most of what follows is `Probable`, not `Confirmed`.

**Full-history scripted pass (2026-09-05):** `../data/dn_event_payment_allocation_candidates.json` extends this beyond the Nov 2025 – Sep 2026 window covered by `allocation_edges.csv` — 99 DN#-labeled events across the account's full 2023–2026 history (52 matched + 46 unmatched + 1 zero-net), run through the new `analysis/debtors/shared/scripts/dn_event_payment_allocation.mjs`.

**Note on script naming:** `analysis/debtors/shared/scripts/payment_doc_allocation.mjs` already existed as a real, working implementation (not a placeholder — `payment_doc_allocation_2025.mjs`, the file `SKILL_Payment_To_Invoice_Allocation.md` Sec 12 references, is a deprecated shim that calls it with WO0001 defaults). That script is built for the WO0001 archetype: LPG-only match targets via `vw_clean_transactions`, ref_no-linked CNs, no DN#-grouping, no reversal-chain netting. LIN001 doesn't fit that shape — this session proved LIN001 settles on the **header-combined** net (LPG + CYL together), not LPG-only, and its events span multi-document reversal-and-reissue chains that script doesn't net. `dn_event_payment_allocation.mjs` is a separate algorithm for accounts like LIN001, not a replacement — both scripts should stay, matched to the account's actual behavior rather than assumed to be interchangeable.

52 events got a candidate match (mostly `EXACT`, sub-cent), 46 remain unmatched, 1 is zero-net. Every hand-derived match found earlier in this session reproduced exactly under the script; ~30 additional exact/tight matches surfaced from 2023–2024 data nobody had manually checked before. These are candidates only — same confidence ceiling as everything else in this ledger (`Probable`/`Exception`, no `ref_no` evidence) — not yet promoted into `allocation_edges.csv`.

---

## 0. Payer-class note (gap in existing skill mapping)

LIN001 does not cleanly fit either named payer class in the skill's §13 table:

- **Not WO0001-style (ref-linked):** every LIN001 payment row has `ref_no = ''` (blank) — there is no `payment.ref_no → invoice.doc_no` link anywhere in the data pulled this session. Tier 1/2 (ref-based) therefore never fire.
- **Not JIM001-style (flat monthly batch):** payments track individual DN#-keyed events, just with a variable, often large lag — not a pooled monthly total against gross debt.

LIN001 runs closest to **§4.8 "Open Event Balance (primary — ref optional)"**: commercial event = invoice + CN by DN#, payment slices matched to open event balance by amount, no ref to lean on. This ledger applies that approach and tags every edge `PROXIMITY_INFERENCE` or `UNALLOCATED` accordingly — nothing here clears Tier 1/2, and nothing should be read as more certain than `Probable` without an operator override.

**Known doctrine deviation:** `target_lane` here is **HEADER (LPG+CYL combined)**, not the LPG-only lane §4.2 requires — we haven't pulled `vw_clean_transactions` line-level splits for the 2025 events yet. Every event net in this ledger is invoice-gross + CN-gross at the header level. This should be corrected before any edge here is promoted past `Probable`.

---

## 1. Executive Summary

| Metric | Count | Amount |
|---|---:|---:|
| Events considered (Nov 2025 → Sep 2026) | 15 | R608,631.45 |
| Edges matched (`PROXIMITY_INFERENCE`) | 12 | R432,622.59 allocated |
| Payments fully unallocated (`UNALLOCATED`, no candidate) | 2 (43247, 44482) | R125,432.50 |
| Events with no matched payment | 3 (DN-21627, DN#21237, DN#21541) | R176,005.95 |
| Tier 1/2 (ref-based, `Confirmed`) matches | **0** | — |
| Edges exceeding Tier 4's 3–14 day window but kept as `Probable` on amount strength | 4 (AL-0001, 0005, 0006, 0007) | — |

No edge in this ledger reaches `Confirmed` — LIN001 has no `ref_no` tagging and no remittance advice on file, so `commercially_confirmed = false` throughout. Every edge carries `review_required: true`.

---

## 2. Confirmed Allocations (Tier 1 & 2)

None. LIN001 has no populated `ref_no`, so ref-based Tier 1/2 matching is structurally unavailable for this account.

---

## 3. Credit Note Offsets Applied

Applied inline as part of each event's header-level net (invoice + CN), not as a separate pre-match step — see the event detail in `docs/LIN001_event_DN*.md` and the notes column in `allocation_edges.csv`. Two events (DN20897, DN#20898) are same/next-day full-reversal-and-reissue chains; the reversal legs net to zero and are already folded into the event net shown.

---

## 4. Probable / Review Required (Tier 4-equivalent)

| Payment Doc | Date | Amount | Candidate Event | Event Date | Lag | Diff | Notes |
|---|---|---:|---|---|---:|---:|---|
| 42499 (slice) | 2025-12-05 | -R30,554.71 | DN#21147 | 2025-11-06 | 29d | R0.00 | Exact-cent, embedded line in multi-slice doc |
| 42708 | 2025-12-17 | -R27,890.50 | DN20897 | 2025-12-05 | 12d | R0.38 | Within Tier 4 window |
| 42716 | 2025-12-21 | -R50,237.00 | DN#20898 | 2025-12-06 | 15d | R0.46 | At edge of Tier 4 window |
| 42717 | 2025-12-21 | -R38,860.00 | DN#21711 | 2025-12-16 | 5d | R0.85 | Within Tier 4 window |
| 42975 (slice) | 2026-01-10 | -R53,192.50 | DN#21432 | 2025-12-20 | 21d | R0.43 | Exceeds window |
| 42976 | 2026-01-10 | -R42,516.50 | DN#21732 | 2025-12-23 | 18d | R0.38 | Exceeds window |
| 43246 | 2026-02-06 | -R34,877.50 | DN#21739 | 2025-12-26 | 42d | R0.41 | Well beyond window — recommend override registry entry, not silent acceptance |
| 44974 | 2026-06-06 | -R40,590.60 | DN#22630 | 2026-06-08 | -2d (**prepayment**) | — | §4.6 default is UNALLOCATED; ASSUMED split with 44975 |
| 44975 | 2026-06-07 | -R63,325.00 | DN#22630 | 2026-06-08 | -1d (**prepayment**) | — | Remainder after 44974; R39,014.91 surplus |
| EXT-2744666881 | 2026-07-03 | -R54,981.36 | DN#22936 | 2026-07-08 | -5d (**prepayment**) | — | Bank ref matches invoice `order_no` 13991 exactly (PROVEN) — stronger than plain proximity |
| EXT-2901239645 | 2026-08-22 | -R34,721.00 | DN#23974 | 2026-08-24 | -2d (**prepayment**) | — | Amount+date proximity only |
| 45961 | 2026-09-01 | -R28,163.00 | DN#24947 | 2026-09-02 | -1d (**prepayment**) | — | ERP-posted (PROVEN as a doc); allocation itself still Probable |

**Prepayment note:** per §4.6, `payment_date < invoice_date` defaults to `UNALLOCATED` + `review_required: true` — it does not auto-confirm even with a tight amount match. The four 2026 events (22630, 22936, 23974, 24947) are all prepayment cases by this rule. They're kept in this ledger as `Probable`/`UNALLOCATED`-flagged rather than silently treated as settled, even though the main event register calls them "Closed" — that register's "Closed" reflects the invoice+CN math balancing against a payment amount, not a doctrine-cleared allocation. The two states aren't contradictory, just answering different questions (event math vs. allocation confidence).

---

## 5. Unallocated Pool (Tier 5)

| Payment Doc | Date | Batch | Amount | Notes |
|---|---|---|---:|---|
| 43247 | 2026-02-06 | PC-76-28 | -R49,588.00 | No candidate event within any tolerance |
| 44482 | 2026-05-08 | PC-76-31 | -R75,844.50 | Operator-asserted late/arrears payment (customer purchasing elsewhere) for prior invoices; no exact tie found against the DN-21627/21237/21541 backlog |

**Unmatched events** (no payment edge at all yet):

| DN# | Date | Event net |
|---|---|---:|
| DN-21627 | 2026-01-10 | R52,906.77 |
| DN#21237 | 2026-02-06 | R78,304.31 |
| DN#21541 | 2026-02-13→16 | R44,794.87 |
| **Total open** | | **R176,005.95** |

---

## 6. Reconciliation Bridge (partial — not yet closed)

```
Total event net (15 events, Nov 2025 - Sep 2026)     R608,631.45
Total allocated (12 matched edges)                   R432,622.59
Total open events (3 unmatched)                      R176,005.95
                                                       -----------
Events accounted for                                 R608,628.54  (vs R608,631.45 — R2.91 rounding across matched edges)

Payments fully unallocated (43247 + 44482)            R125,432.50
```

**Bridge variance: NOT R0.00.** Two threads remain open: (a) 43247 and 44482 have no confirmed target, (b) DN-21627/21237/21541 have no confirmed payment. The R2.91 aggregate rounding across the 7 sub-14/42-day proximity matches is immaterial and expected (VAT-cent rounding per event, not a data error).

**Working hypothesis, not a conclusion:** 43247 (R49,588.00) and 44482 (R75,844.50) sum to R125,432.50 — not a clean match to the R176,005.95 open-events total, so they don't jointly close the backlog either. This needs either a third open payment we haven't located, a partial-payment scenario, or the remittance/paper evidence the operator mentioned.

---

## 7. Artifacts

| Artifact | Path |
|---|---|
| Allocation edges | `analysis/debtors/LIN001/data/allocation_edges.csv` |
| This report | `analysis/debtors/LIN001/reports/LIN001_Payment_Allocation_v1.md` |
| Main event register (unchanged) | `analysis/debtors/LIN001/reports/LIN001_events_consolidated_2026-06_2026-09.md` |
| Event cards (unchanged) | `analysis/debtors/LIN001/docs/LIN001_event_DN*.md` |

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_Payment_Allocation_v1.md`*
