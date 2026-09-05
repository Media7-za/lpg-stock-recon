# LIN001 Payment Allocation (v1) — Forked Ledger

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period covered:** 2025-11-06 → 2026-09-02
**Doctrine:** `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`
**Status:** Exploratory — forked from the main event register (`LIN001_events_consolidated_2026-06_2026-09.md` / `docs/LIN001_event_DN*.md`). Nothing here overwrites that register; it adds the payment-matching dimension with formal confidence tags, since most of what follows is `Probable`, not `Confirmed`.

**Correction (2026-09-05):** 44974 was previously ASSUMED to split with 44975 against DN#22630. A customer-forwarded WhatsApp payment confirmation for 44974 explicitly references "21541" — reassigned to DN#21541. This is the one edge in this ledger with genuine remittance advice (`commercially_confirmed=true`, AL-0010) rather than plain proximity inference. See §4/§5 below and `docs/LIN001_event_DN21541.md` for the full writeup, including the still-open residual.

**Second correction, same day:** a customer WhatsApp claim of 2×19kg + 2×48kg leaking cylinders was earlier reported as having no corresponding ERP credit ("entirely off-ledger"). That was wrong — a search-filter miss. **CN 14435 (-R3,082.00, 134kg gas-only) is exactly that credit** and was already inside DN#21541's event net from the start.

**Third correction, same day:** CN 14435 itself under-credited by R60.25 (posted at a rounded R20.00/kg ex-VAT rate instead of invoice 49265's own R20.391/kg).

**Fourth correction, same day:** the deposit/empties for these same 4 cylinders were assumed already covered by CN 14432 (its 21×19kg/14×48kg recorded-return counts matched the delivery-note "leaking" annotations). **Retracted** on operator confirmation that the 4 units were returned but never added to the delivery note's recorded totals — CN 14432 does not cover them, and a fresh **R3,795.00 empties credit** is owed and unposted (see `docs/LIN001_ERP_correction_request_21541_cylinders.md`).

Fully corrected, DN#21541's total owed is **R40,939.62** (not R44,794.87 as posted), leaving a residual of **R349.02** (not R4,204.27) — and that residual is itself explained: it's a systematic rate mismatch in the customer's own reconciliation (his flat R23.27/kg vs. the actual R23.4497/kg incl VAT charged), reproducing his exact payment to within cents. See `docs/LIN001_event_DN21541.md` for the full walkthrough.

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
| Events with no matched payment | 2 (DN-21627, DN#21237) | R131,211.08 |
| Events partially matched (residual explained, pending 2 credit postings) | 1 (DN#21541, R349.02 residual) | R40,939.62 (fully corrected; R44,794.87 as posted in ERP) |
| Tier 1/2 (remittance-confirmed) matches | **1** (44974 → DN#21541, added 2026-09-05) | R40,590.60 |
| Edges exceeding Tier 4's 3–14 day window but kept as `Probable` on amount strength | 4 (AL-0001, 0005, 0006, 0007) | — |

No edge in this ledger reaches `Confirmed` — LIN001 has no `ref_no` tagging and no remittance advice on file, so `commercially_confirmed = false` throughout. Every edge carries `review_required: true`.

---

## 2. Confirmed Allocations (Tier 1 & 2)

One, added 2026-09-05 — not via ERP `ref_no` (structurally unavailable for this account, see below), but via customer-supplied remittance advice, which the doctrine (`SKILL_Payment_To_Invoice_Allocation.md` §7) treats as equivalent evidence for `commercially_confirmed = true`:

| Payment Doc | Date | Amount | Target Event | Event Date | Evidence | Confidence |
|---|---|---:|---|---|---|---|
| 44974 | 2026-06-06 | -R40,590.60 | DN#21541 | 2026-02-13 | WhatsApp payment confirmation, explicit reference "21541" | **Confirmed** (`commercially_confirmed: true`) |

This is a **partial** payment against DN#21541's R40,939.62 fully-corrected total owed (R44,794.87 as posted in ERP, before a R60.25 CN 14435 top-up and a R3,795.00 empties credit that are both still unposted — see `docs/LIN001_event_DN21541.md`) — target identification is confirmed by the reference, and R349.02 remains as a residual, which is itself explained (a rate mismatch in the customer's own reconciliation, not an open question). Not yet entered into `config/payment_pattern_overrides.json` — that requires human `approved_by`/`approved_date` sign-off per §7; `review_required` stays `true` in `allocation_edges.csv` (AL-0010) until that happens and until the two outstanding credits are actually posted.

Every other edge below remains ref-less and `Probable` at best.

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
| 44975 | 2026-06-07 | -R63,325.00 | DN#22630 | 2026-06-08 | -1d (**prepayment**) | — | CORRECTED 2026-09-05: 44974 no longer splits here (see §2, reassigned to DN#21541 via remittance evidence) — 44975 alone leaves DN#22630 R1,575.69 SHORT, not surplus |
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
| **Total fully unmatched** | | **R131,211.08** |

**Partially matched event (2026-09-05 — was fully unmatched):**

| DN# | Date | Event net | Payment | Residual |
|---|---|---:|---|---:|
| DN#21541 | 2026-02-13→16 | R40,939.62 (fully corrected; R44,794.87 as posted) | 44974 (R40,590.60, Confirmed via remittance — see §2) | **R349.02 residual, explained** (was R4,204.27 as posted) |

The full breakdown is in `docs/LIN001_event_DN21541.md`. A customer WhatsApp claim of 2×19kg + 2×48kg leaking cylinders returned "together" needed two credits: CN 14435 (gas, posted but under-rated by R60.25) and a fresh empties credit (R3,795.00, never posted — the delivery note's recorded return counts didn't include these 4 units, contrary to an earlier assumption that they did). With both posted, DN#21541's total owed is R40,939.62, leaving R349.02 — which is itself explained by a rate mismatch in the customer's own reconciliation (his flat R23.27/kg vs. the invoice's actual R23.4497/kg), not an open question.

---

## 6. Reconciliation Bridge (partial — not yet closed)

```
Total event net (15 events, Nov 2025 - Sep 2026)     R604,776.20  (fully corrected; R608,631.45 as posted, -R60.25 gas top-up -R3,795.00 empties credit)
Total allocated (12 matched edges)                   R432,622.59
Confirmed remittance match (44974 -> DN#21541)         R40,590.60
Total open events (2 fully unmatched)                R131,211.08
Residual on DN#21541 (partially matched, explained)     R349.02  (fully corrected; R4,204.27 as posted)
                                                       -----------
Events accounted for                                 R604,773.29  (vs R604,776.20 — R2.91 rounding across matched edges, unchanged)

Payments fully unallocated (43247 + 44482)            R125,432.50
```

**Note:** the R60.25 + R3,795.00 DN#21541 corrections have only been applied here — they have not been propagated through the wider Nov 2025–Sep 2026 portfolio total shown elsewhere (e.g. the R608,631.45 figure in §1's executive summary still uses the as-posted basis), since no other event in this window has had the same line-level re-check. Treat the two totals as using slightly different bases until a full re-check is done.

**Bridge variance: NOT R0.00.** Two threads remain genuinely open: (a) 43247 and 44482 have no confirmed target, (b) DN-21627/21237 have no matched payment at all. DN#21541's former "open, unexplained" status is resolved — its R349.02 residual is explained (customer's own rate-mismatch, not a data gap), pending only the two credit notes (R60.25 + R3,795.00) actually being posted in ERP. The R2.91 aggregate rounding across the 7 sub-14/42-day proximity matches is immaterial and expected (VAT-cent rounding per event, not a data error).

**Working hypothesis, not a conclusion:** 43247 (R49,588.00) and 44482 (R75,844.50) sum to R125,432.50 — not a clean match to the R131,211.08 DN-21627/21237 total, so they don't jointly close that backlog either. This needs either a third open payment we haven't located, a partial-payment scenario, or further remittance/paper evidence. (DN#21541's residual is no longer part of this open question — it's explained, see §5.)

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
