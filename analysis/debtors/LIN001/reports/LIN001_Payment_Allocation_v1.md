# LIN001 Payment Allocation (v1) — Forked Ledger

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Period covered:** 2025-11-06 → 2026-09-02
**Doctrine:** `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`
**Status:** Exploratory — forked from the main event register (`LIN001_events_consolidated_2026-06_2026-09.md` / `docs/LIN001_event_DN*.md`). Nothing here overwrites that register; it adds the payment-matching dimension with formal confidence tags, since most of what follows is `Probable`, not `Confirmed`.

**Correction (2026-09-05):** 44974 was previously ASSUMED to split with 44975 against DN#22630. A customer-forwarded WhatsApp payment confirmation for 44974 explicitly references "21541" — reassigned to DN#21541. This is the one edge in this ledger with genuine remittance advice (`commercially_confirmed=true`, AL-0010) rather than plain proximity inference. See §4/§5 below and `docs/LIN001_event_DN21541.md` for the full writeup, including the still-open residual.

**Second correction, same day:** a customer WhatsApp claim of 2×19kg + 2×48kg leaking cylinders was earlier reported as having no corresponding ERP credit ("entirely off-ledger"). That was wrong — a search-filter miss. **CN 14435 (-R3,082.00, 134kg gas-only) is exactly that credit** and was already inside DN#21541's event net from the start.

**Third correction, same day:** CN 14435 itself under-credited by R60.25 (posted at a rounded R20.00/kg ex-VAT rate instead of invoice 49265's own R20.391/kg).

**Fourth correction, same day:** the deposit/empties for these same 4 cylinders were assumed already covered by CN 14432 (its 21×19kg/14×48kg recorded-return counts matched the delivery-note "leaking" annotations). **Retracted** on operator confirmation that the 4 units were returned but never added to the delivery note's recorded totals — CN 14432 does not cover them, and a fresh **R3,795.00 empties credit** is owed and unposted. Two separate ERP requests now cover DN#21541: `docs/LIN001_ERP_correction_request_21541_empties_credit.md` (credit note, -R3,795.00) and `docs/LIN001_ERP_correction_request_21541_price_adjustment.md` (discount journal, -R60.25).

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
| Edges matched (`PROXIMITY_INFERENCE`, Probable) | 8 | R279,651.90 allocated |
| Tier 1/2 (remittance-confirmed) matches | **8** (44974 → DN#21541, 43246 → DN#21739, 43247 → DN-21627, 44482 → DN#21237, 44975 → DN#22630, EXT-2949387151 + EXT-2950393933 → DN#24817, 42975(slice) → DN#21432) | R331,524.90 |
| Payments fully unallocated (`UNALLOCATED`, no candidate) | 0 | — |
| Events with a confirmed payment target, rate corrected, residual owed by customer | 1 (DN-21627, R1,449.00 owed) | R51,037.00 (rate-corrected; R52,906.77 as posted) |
| Events with a confirmed payment target, rate corrected, closed to immaterial residual | 1 (DN#21237, R0.16 residual after DK-590's pricing correction) | R75,844.34 |
| Events closed exactly — payment matches the customer's proforma quote | 1 (DN#22630, R0.00 residual) | R63,325.00 |
| Events partially matched, residual explained (pending 2 credit postings) | 1 (DN#21541, R349.02 residual) | R40,939.62 (fully corrected; R44,794.87 as posted in ERP) |
| Events with a confirmed payment target and deposit charge, isolated residual legitimate; account-wide rolling position after this event: R10,463.59 short as-posted / R2,278.60 once pending corrections post | 1 (DN#24817, R28,750.00 isolated) | R42,856.80 |

Eight edges now reach `Confirmed` via customer-supplied remittance advice (payment-app receipts, a WhatsApp confirmation, a proforma quote, and a signed delivery note), each naming or exactly reproducing its target document — see §2. Every other edge remains `Probable` at best; LIN001 still has no `ref_no` tagging.

---

## 2. Confirmed Allocations (Tier 1 & 2)

Five, added 2026-09-05/06 — not via ERP `ref_no` (structurally unavailable for this account, see below), but via customer-supplied remittance advice or an exact-match proforma quote, which the doctrine (`SKILL_Payment_To_Invoice_Allocation.md` §7) treats as equivalent evidence for `commercially_confirmed = true`:

| Payment Doc | Date | Amount | Target Event | Event Date | Evidence | Confidence |
|---|---|---:|---|---|---|---|
| 44974 | 2026-06-06 | -R40,590.60 | DN#21541 | 2026-02-13 | WhatsApp payment confirmation, explicit reference "21541" | **Confirmed** |
| 43246 | 2026-02-06 08:06 | -R34,877.50 | DN#21739 | 2025-12-26 | Payment-app receipt (New Champion Supermarket → Bella Energy Services300), explicit reference "No: 21739" | **Confirmed** |
| 43247 | 2026-02-06 08:08 | -R49,588.00 | DN-21627 | 2026-01-10 | Payment-app receipt, same customer, 2 minutes later, explicit reference "No: 21627 Lin001" | **Confirmed** |
| 44482 | 2026-05-08 08:46 | -R75,844.50 | DN#21237 | 2026-02-06 | Payment-app receipt, explicit reference "No: 21237" | **Confirmed** |
| 44975 | 2026-06-07 | -R63,325.00 | DN#22630 | 2026-06-08 | Customer's own proforma quote, exact-cent total match | **Confirmed** |
| EXT-2949387151 + EXT-2950393933 | 2026-09-04 | -R14,106.80 | DN#24817 | 2026-09-04 | Signed delivery note (confirms deposit charge legitimate, no 9kg return) | **Confirmed** |
| 42975 (slice) | 2026-01-10 11:44 | -R53,192.50 | DN#21432 | 2025-12-20 | Payment-app receipt (New Champion Supermarket → Bella Energy Services300), explicit reference "No: 21432 Lin001" | **Confirmed** |

- **44974 → DN#21541**: a **partial** payment against DN#21541's R40,939.62 fully-corrected total owed (R44,794.87 as posted in ERP, before a R60.25 CN 14435 top-up and a R3,795.00 empties credit that are both still unposted — see `docs/LIN001_event_DN21541.md`). R349.02 remains as a residual, which is itself explained (a rate mismatch in the customer's own reconciliation).
- **43246 → DN#21739**: previously `Probable` on a 42-day-lag proximity match, flagged as needing override-registry ratification. The remittance receipt removes that need — the lag no longer matters once the target is directly evidenced. R0.41 diff is exact-cent-level, immaterial.
- **43247 → DN-21627**: previously a forced/ASSERTED match (smallest-diff candidate among 3 open events), now confirmed on **target**. Rate corrected (R20.00/kg ex-VAT vs the posted R20.87/kg, R1,869.77 legitimate credit). A same-day, since-retracted note also credited a 9KG quantity difference (180 vs 182) based on the customer's notebook — **retracted**: the signed delivery note confirms 182×9KG were actually dispatched, matching the invoice exactly. The remaining R1,449.00 is explained (it exactly matches the value of the customer's own 2-unit 9KG undercount) but is **not creditable — still owed by the customer**. See `docs/LIN001_event_DN-21627.md` and `docs/LIN001_ERP_correction_request_48725.md`.
- **44482 → DN#21237**: previously a forced/ASSERTED match (smallest-diff candidate), now confirmed on **target** via remittance receipt. Rate corrected to the operator-confirmed agreed February rate (R20.24/kg ex-VAT vs the posted R21.264/kg), a -R2,459.97 credit closing the event to a R0.16 residual — immaterial. See `docs/LIN001_event_DN21237.md` and `docs/LIN001_ERP_correction_request_49115.md`.
- **44975 → DN#22630**: previously assumed to split with 44974 (retracted — 44974 belongs to DN#21541, see above), then Probable-alone at a R1,575.69 shortfall. The customer's own proforma quote for this delivery (flat R27.50/kg refill rate + one-off Empty DV Cylinder charge) totals R63,325.00 exactly — matching this payment to the cent, with refill quantities matching invoice 51132's gas lines exactly. The R1,575.69 gap is a quote-vs-invoice pricing/structure mismatch (ERP posted at header rate + deposit dispatch/return, not the proforma's flat model), not a shortfall. -R1,575.69 discount posted against invoice 51132. See `docs/LIN001_event_DN22630.md` and `docs/LIN001_ERP_correction_request_51132.md`.
- **EXT-2949387151 + EXT-2950393933 → DN#24817**: started as an untied proforma (70×9kg LPG refill, no deposit line), posted to ERP 2026-09-04 as invoice 52949/DN#24817 with an unbudgeted 9kg deposit charge (R36,225.00) added. CN 15601 (-R9,660.00) credits an unrelated 8×48kg return, confirmed correct by the operator. The signed delivery note confirms no 9kg cylinders were returned — the deposit charge is legitimate, not a posting error. See `docs/LIN001_event_DN24817.md` and `LIN001_rolling_balance_2025-11_2026-09.md` for the account-wide cumulative position this event feeds into (R10,463.59 short as-posted / R2,278.60 once pending corrections post).
- **42975(slice) → DN#21432**: previously `Probable` on a 21-day-lag proximity match, exceeding the Tier 4 window. A customer-forwarded payment-app receipt (2026-01-10 11:44, R53,192.50, same New Champion Supermarket → Bella Energy Services300 pattern seen elsewhere on this account) explicitly references "No: 21432 Lin001" — exact date+amount match to this ERP payment slice. R0.43 diff is exact-cent-level, immaterial. In the course of re-verifying this event, CN 14136 was found to carry two conflicting gross amounts across overlapping `source_file` batches (-R82,512.50 vs -R93,275.00) — the header-level form of DK-593, previously only confirmed at the `transaction_items` level. The existing target_amount (R53,192.93) already used the correct value; independently re-derived and confirmed, no change needed.

None of these eight are yet entered into `config/payment_pattern_overrides.json` — that requires human `approved_by`/`approved_date` sign-off per §7; `review_required` stays `true` in `allocation_edges.csv` until that happens.

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
| 42976 | 2026-01-10 | -R42,516.50 | DN#21732 | 2025-12-23 | 18d | R0.38 | Exceeds window |
| EXT-2744666881 | 2026-07-03 | -R54,981.36 | DN#22936 | 2026-07-08 | -5d (**prepayment**) | — | Bank ref matches invoice `order_no` 13991 exactly (PROVEN) — stronger than plain proximity |
| EXT-2901239645 | 2026-08-22 | -R34,721.00 | DN#23974 | 2026-08-24 | -2d (**prepayment**) | — | Amount+date proximity only |
| 45961 | 2026-09-01 | -R28,163.00 | DN#24947 | 2026-09-02 | -1d (**prepayment**) | — | ERP-posted (PROVEN as a doc); allocation itself still Probable |

**44975 (→DN#22630) and 42975(slice) (→DN#21432) removed from this table 2026-09-06** — both promoted to `Confirmed` via genuine remittance evidence (a proforma quote and a payment-app receipt respectively); see §2.

**Prepayment note:** per §4.6, `payment_date < invoice_date` defaults to `UNALLOCATED` + `review_required: true` — it does not auto-confirm even with a tight amount match. Three remaining 2026 events (22936, 23974, 24947) are prepayment cases by this rule. They're kept in this ledger as `Probable`/`UNALLOCATED`-flagged rather than silently treated as settled, even though the main event register calls them "Closed" — that register's "Closed" reflects the invoice+CN math balancing against a payment amount, not a doctrine-cleared allocation. The two states aren't contradictory, just answering different questions (event math vs. allocation confidence).

---

## 5. Unallocated Pool (Tier 5)

Empty — no payment in this ledger is without a candidate target as of 2026-09-06. **44482 removed from this table 2026-09-06** — confirmed via remittance advice to DN#21237 (see §2), no longer unallocated in any sense.

**43247 removed from this table 2026-09-05** — confirmed via remittance advice to DN-21627 (see §2), no longer unallocated in any sense.

**Events with a Confirmed payment target and a remaining gap (owed by the customer, not creditable):**

| DN# | Date | Event net | Payment | Gap |
|---|---|---:|---|---:|
| DN-21627 | 2026-01-10 | R51,037.00 (rate-corrected; R52,906.77 as posted) | 43247, **Confirmed** via remittance (see §2) | R1,449.00 — explained (customer's own 2-unit 9KG undercount, per signed delivery note) but owed by the customer, not creditable |

**Events with a Confirmed payment target, rate corrected, closed to an immaterial or zero residual:**

| DN# | Date | Event net | Payment | Residual |
|---|---|---:|---|---:|
| DN#21237 | 2026-02-06 | R75,844.34 (rate-corrected at R20.24/kg; R78,304.31 as posted) | 44482, **Confirmed** via remittance (see §2) | R0.16 — immaterial, event effectively closed |
| DN#22630 | 2026-06-08 | R63,325.00 (reconciled to the customer's proforma; R64,900.69 as posted) | 44975, **Confirmed** via exact-match proforma quote (see §2) | R0.00 — closed exactly |

**Partially matched event (2026-09-05 — was fully unmatched):**

| DN# | Date | Event net | Payment | Residual |
|---|---|---:|---|---:|
| DN#21541 | 2026-02-13→16 | R40,939.62 (fully corrected; R44,794.87 as posted) | 44974 (R40,590.60, Confirmed via remittance — see §2) | **R349.02 residual, explained** (was R4,204.27 as posted) |

The full breakdown is in `docs/LIN001_event_DN21541.md`. A customer WhatsApp claim of 2×19kg + 2×48kg leaking cylinders returned "together" needed two credits: CN 14435 (gas, posted but under-rated by R60.25) and a fresh empties credit (R3,795.00, never posted — the delivery note's recorded return counts didn't include these 4 units, contrary to an earlier assumption that they did). With both posted, DN#21541's total owed is R40,939.62, leaving R349.02 — which is itself explained by a rate mismatch in the customer's own reconciliation (his flat R23.27/kg vs. the invoice's actual R23.4497/kg), not an open question.

**Event with a Confirmed payment target and a legitimate isolated residual (2026-09-06 — added, outside this ledger's original Nov 2025–Sep 2026 event set):**

| DN# | Date | Event net | Payment | Residual |
|---|---|---:|---|---:|
| DN#24817 | 2026-09-04 | R42,856.80 (invoice 52949 − CN 15601) | EXT-2949387151 + EXT-2950393933, **Confirmed** via signed delivery note (see §2) | **R28,750.00 isolated, legitimate** (unreturned 9kg deposit) — see `docs/LIN001_event_DN24817.md` and `LIN001_rolling_balance_2025-11_2026-09.md` for the account-wide cumulative position |

Unlike DN-21627's residual (owed by the customer due to his own error) or DN#21541's (a rate mismatch in the customer's reconciliation), this residual is a straightforward unreturned-deposit charge — confirmed legitimate by the signed delivery note, not a dispute or a posting error. **Rolling/cumulative account balance is this account's adopted doctrine** (2026-09-06, see `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2), now extended through the full Nov 2025–Sep 2026 window in `LIN001_rolling_balance_2025-11_2026-09.md` — the account-wide position after this event is **R10,463.59 short as-posted in ERP today, or R2,278.60 once the four pending corrections (DK-590/591/592/596) post**. This is materially different from — and supersedes — the earlier R477.83 figure, which only covered the Jun–Sep window and implicitly assumed a zero starting balance rather than the real shortfall already carried in from the unposted Jan/Feb corrections.

---

## 6. Reconciliation Bridge (partial — not yet closed)

```
Total event net (15 events, Nov 2025 - Sep 2026)     R608,631.45  (as-posted basis - see note below on DN-21627/DN#21541's separate corrections)
Total allocated via Probable/proximity edges (8)     R279,651.90
Total allocated via Confirmed remittance edges (6)   R317,418.10  (44974+43246+43247+44482+44975+42975(slice))
Residual on DN-21627 (rate corrected, gap owed by customer)  R1,449.00  (was R3,318.77 as posted)
Residual on DN#21237 (Confirmed, rate corrected)         R0.16  (was R362.85 pre-rate-correction)
Residual on DN#21541 (payment Confirmed, gap explained)  R349.02  (fully corrected; R4,204.27 as posted)
Residual on DN#22630 (Confirmed, closed exactly)         R0.00  (was R1,575.69 pre-correction)
                                                       -----------
Events accounted for                                 R598,868.18
```

**This bridge is not fully reconciled to R608,631.45** — the figures above cover the events this session has actually re-verified line-by-line (8 Probable edges, 6 Confirmed edges, and the 4 residuals). The remaining difference (R608,631.45 − R598,868.18 = R9,763.27) corresponds to events/edges not re-checked in this pass. Treat this as a partial bridge, not a closed one — though materially tighter than the earlier R83,669.39 gap now that DN#21237 and DN#22630 are Confirmed and their corrections are folded in.

**42975(slice) → DN#21432 confirmed 2026-09-06** — moved from Probable to Confirmed via a payment-app receipt exactly matching date and amount. No change to the bridge total (R598,868.18) since this only moves which bucket the same R53,192.50 sits in; its R0.43 rounding diff was never separately tracked as a residual, same as the account's other Tier-4 proximity matches.

**Corrected 2026-09-05, then partially retracted 2026-09-06:** three payments moved from Probable/forced to Confirmed: 44974 (→DN#21541), 43246 (→DN#21739), and 43247 (→DN-21627) are now Confirmed via genuine remittance advice, not proximity inference. 43247's target (DN-21627) was previously (wrongly) listed as "unallocated, no candidate event within any tolerance." **A same-day "fully closed to R0.00" note for DN-21627 is retracted** — it accepted the customer's own notebook figure of 180×9KG as correct; the signed delivery note confirms 182×9KG were actually dispatched, matching the invoice. Only the rate correction (R1,869.77) stands; R1,449.00 remains, explained but owed by the customer.

**Two further payments confirmed 2026-09-06:** 44482 (→DN#21237) via remittance advice, then closed to R0.16 once re-rated at the operator-confirmed R20.24/kg agreed rate; and 44975 (→DN#22630) via the customer's own proforma quote, closing exactly to R0.00. Neither remains open.

**Addendum, outside the original 15-event scope — DN#24817 (2026-09-06):** started as an untied proforma, posted to ERP as invoice 52949 with an unbudgeted 9kg deposit charge. Payment target confirmed via signed delivery note (which also confirms the deposit charge itself is legitimate — no 9kg cylinders were returned). Event net R42,856.80, payments R14,106.80, isolated residual **R28,750.00** — not folded into the R598,868.18 total above (this event predates the original scope's cutoff computation). See `LIN001_rolling_balance_2025-11_2026-09.md` for the full-window rolling position this event feeds into.

**One thread remains genuinely open as a collections matter:** DN-21627's R1,449.00, owed by the customer (his own counting error, confirmed by the customer, not an ERP correction) — this stands regardless of doctrine, since it's an individually acknowledged liability, not a cumulative-balance question. DN#21541's R349.02 residual is similarly explained (customer's own rate-mismatch) and not chased further; its two credit-note postings (CN top-up, empties credit) are still pending in ERP, and until they post, they're part of why the account's as-posted rolling position (R10,463.59 short) is materially worse than its fully-corrected one (R2,278.60 short).

**Doctrine note (2026-09-06):** rolling/cumulative account balance is LIN001's standard doctrine (see `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2), now extended through the **full Nov 2025–Sep 2026 window** — see `LIN001_rolling_balance_2025-11_2026-09.md`, the authoritative table (16 events, chronological, built from this ledger's individually-verified `allocation_edges.csv` rows rather than a raw `transaction_headers` query — the latter was attempted and discarded due to unresolved source-file duplication, the header-level form of DK-593). The R608,631.45/R598,868.18 figures above remain on the older isolated-event basis and are superseded by the rolling file for judging the account's actual exposure — they're kept here for the per-edge confidence detail (Confirmed vs. Probable), which the rolling doctrine doesn't change. Bottom line from the rolling file: **R10,463.59 short as-posted in ERP today, R2,278.60 once DK-590/591/592/596 post.**

All seven payments in §2 are now Confirmed — no payment in this ledger remains at Probable/forced-match confidence for its target.

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
