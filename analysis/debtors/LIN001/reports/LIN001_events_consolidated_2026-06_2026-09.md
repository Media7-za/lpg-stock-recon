# LIN001 — Consolidated Delivery Events (Jun–Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**As at:** 2026-09-04
**Scope:** Manual event-by-event closure · DN# proof model
**Verification:** All ERP-sourced figures cross-checked against `transaction_headers` (Supabase project `lpg-stock-recon`) 2026-09-04 — see [Verification](#verification-against-erp) below.

> **Correction (2026-09-05):** DN#22630 was previously shown "ASSUMED closed" on a forced split of payments 44974+44975. WhatsApp remittance evidence for 44974 explicitly references DN#21541, not DN#22630. The split-covering assumption is retired; 44975 alone leaves a R1,575.69 gap. This drops the register's aggregate credit by R40,590.60 (see the balance-bridge section below).
>
> **Further update (2026-09-06):** the R1,575.69 gap is now **fully explained and closed** — it exactly matches the difference between ERP's posted invoice (header rate) and the customer's own proforma quote (flat refill rate), which payment 44975 fully honors. Operator has since posted the correction (-R1,575.69 discount) against invoice 51132. See `docs/LIN001_event_DN22630.md` and `docs/LIN001_ERP_correction_request_51132.md`.
>
> **Proforma 2026-09-04 update (2026-09-06):** posted to ERP as invoice 52949 with DN#24817 attached, carrying an unbudgeted 9kg cylinder deposit line not in the original proforma. Signed delivery note confirms no 9kg cylinders were returned — the deposit charge is legitimate, not a posting error. Isolated-event gap is R28,750.00 (was R2,185.00 at the proforma stage), though a rolling-account view puts the cumulative position at only R477.83 short. See `docs/LIN001_event_DN24817.md` (supersedes `docs/LIN001_event_2026-09-04_proforma.md`).

---

## Event model

Each event = **invoice** + **credit note** + **delivery note (DN# proof)** + **payment**.

**Event net** = invoice − credit note (header basis, LPG + CYL).

---

## Summary

| DN# | Date | Invoice | CN | Event net | Payment | Status |
|---:|---|---:|---:|---:|---|---|
| **22630** | 2026-06-08 | 51132 | 15039 | **R63,325.00** *(corrected; R64,900.69 as posted)* | 44975 (PC-76-32) | **CLOSED — -R1,575.69 discount posted 2026-09-06** |
| **22508** | 2026-06-18 | 51268 | 15086 | **R0.00** | — | **Closed** (zero-net) |
| **22936** | 2026-07-08 | 51681 | 15215 | **R53,951.69** | EXT-2744666881 | **Closed** |
| **23974** | 2026-08-24 | 52768 | 15543 | **R30,207.80** | EXT-2901239645 | **Closed** |
| **24947** | 2026-09-02 | 52924 | 15592 | **R5,433.70** | 45961 (PC-76-35) | **Closed** |
| **24817** | 2026-09-04 | 52949 | 15601 | **R42,856.80** | EXT-2949387151 + EXT-2950393933 | **CLOSED — deposit charge confirmed legitimate; R28,750.00 isolated gap, R477.83 on a rolling-account basis** |

**Total event net (5 ERP deliveries, DN#22630-24947, corrected basis):** **R152,918.19** (R154,493.88 on an as-posted basis, before DN#22630's discount)
**Total event net (all 6, incl. DN#24817, corrected basis):** **R195,774.99**

---

## Event detail

### DN#22630 — CLOSED *(corrected 2026-09-06)*

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 51132 | R132,693.19 |
| Credit note | 15039 → 51132 | R-67,792.50 |
| Delivery note | **DN#22630** | *(proof)* |
| Payment | 44975 | R63,325.00 |

```
R64,900.69  event net
− R63,325.00  payment 44975 (2026-06-07, PC-76-32)
────────────
= R1,575.69  short-paid — event open
```

**Correction log (2026-09-05):** This event was previously shown "ASSUMED closed" on a forced split of payments 44974+44975 across it (R39,014.91 "surplus"). A customer-forwarded WhatsApp payment confirmation for 44974 (2026-06-06, R40,590.26 per screenshot vs R40,590.60 posted — R0.34 variance, same payment) explicitly references **"21541"**, not DN#22630. Per the operator's observation that customers don't typically part-pay a single invoice across two payment docs, the split-covering assumption is retired: 44974 is reassigned to DN#21541 (2026-02-13, outside this register's Jun–Sep window — see `docs/LIN001_event_DN21541.md`), leaving 44975 alone against DN#22630. Full detail and the allocation-edge correction: `allocation_edges.csv` (AL-0010/AL-0011) and `reports/LIN001_Payment_Allocation_v1.md`.

---

### DN#22508 — closed (zero-net)

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 51268 | R132,862.38 |
| Credit note | 15086 → 51268 | R-132,862.38 |
| Delivery note | **DN#22508** | *(proof)* |
| Payment | — | R0.00 |

Full CN offset — **no payment leg required.**

---

### DN#22936 — closed

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 51681 | R134,049.19 |
| Credit note | 15215 → 51681 | R-80,097.50 |
| Delivery note | **DN#22936** | *(proof)* |
| Payment | **EXT-2744666881** | R54,981.36 |

Bank receipt **Lin001 7.3 13991** (2026-07-03). Ref matches invoice **order_no 13991** (PROVEN). Surplus **R1,029.67**.

Detail: [`docs/LIN001_event_DN22936.md`](../docs/LIN001_event_DN22936.md)

---

### DN#23974 — closed

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52768 | R69,652.80 |
| Credit note | 15543 → 52768 | R-39,445.00 |
| Delivery note | **DN#23974** | *(proof)* |
| Payment | **EXT-2901239645** | R34,721.00 |

Bank receipt **HAPPY 8.22** (2026-08-22). Surplus **R4,513.20** on this event alone; see balance bridge for aggregate tie-out across all events.

Detail: [`docs/LIN001_event_DN23974.md`](../docs/LIN001_event_DN23974.md)

---

### DN#24947 — closed

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52924 | R74,433.70 |
| Credit note | 15592 → 52924 | R-69,000.00 |
| Delivery note | **DN#24947** | *(proof)* |
| Payment | **45961** | R28,163.00 |

```
R28,163.00  payment 45961 (2026-09-01, PC-76-35)
− R5,433.70  event net
───────────
= R22,729.30  surplus — payment 45961 alone funds this in full
```

Detail: [`docs/LIN001_event_DN24947.md`](../docs/LIN001_event_DN24947.md)

---

### DN#24817 — CLOSED *(posted 2026-09-06, resolved same day)*

| Part | Ref | Amount |
|---|---|---:|
| Invoice | 52949 | R52,516.80 |
| Credit note | 15601 → 52949 | R-9,660.00 |
| Delivery note | **DN#24817** | *(proof)* |
| Payment | EXT-2949387151 + EXT-2950393933 | R14,106.80 |

```
R42,856.80  event net (52,516.80 invoice − 9,660.00 CN)
− R14,106.80  payments received
────────────
= R28,750.00  isolated-event gap
```

**Started as an untied proforma** (70×9kg LPG refill, R16,291.80, no deposit line) — posted to ERP on 2026-09-04 as invoice 52949/DN#24817, now carrying an unbudgeted 9kg cylinder deposit line (70×R450 ex-VAT = R36,225.00) that wasn't in the original proforma. **CN 15601 (-R9,660.00) does not correct that deposit** — it credits an unrelated 8×48kg cylinder return, confirmed correct by the operator against the same delivery note. **Resolved 2026-09-06: the signed delivery note confirms no 9kg cylinders were returned** — the deposit charge is legitimate, not a posting error. R28,750.00 is a real, currently-uncollected amount in isolation, though a rolling-account view (carrying forward the surplus from DN#22936/23974/24947) puts the cumulative position at only R477.83 short — immaterial, not worth chasing.

Detail: [`docs/LIN001_event_DN24817.md`](../docs/LIN001_event_DN24817.md) (supersedes [`docs/LIN001_event_2026-09-04_proforma.md`](../docs/LIN001_event_2026-09-04_proforma.md))

---

## Payment register

| Doc | Date | Amount | Batch / ref | Assigned to |
|---|---|---:|---|---|
| 44482 | 2026-05-08 | R75,844.50 | PC-76-31 | **Unallocated** |
| 44974 | 2026-06-06 | R40,590.60 | PC-76-32 | **Reassigned to DN#21541** *(2026-02-13, outside this window — corrected 2026-09-05, see WhatsApp remittance evidence)* — excluded from this register's totals below |
| 44975 | 2026-06-07 | R63,325.00 | PC-76-32 | DN#22630 *(CLOSED — exact match to customer's proforma quote, corrected 2026-09-06)* |
| EXT-2744666881 | 2026-07-03 | R54,981.36 | Lin001 7.3 13991 | DN#22936 |
| EXT-2901239645 | 2026-08-22 | R34,721.00 | HAPPY 8.22 | DN#23974 |
| 45961 | 2026-09-01 | R28,163.00 | PC-76-35 | DN#24947 |
| EXT-2949387151 | 2026-09-04 | R13,416.80 | happy 9.4 | DN#24817 *(CLOSED — deposit charge confirmed legitimate, corrected 2026-09-06)* |
| EXT-2950393933 | 2026-09-04 | R690.00 | happy | DN#24817 *(CLOSED — see above)* |

Docs 44482, 44974, 44975 and 45961 are posted ERP `Payment` entries (`transaction_headers`, PROVEN). The `EXT-` references are bank-receipt evidence not yet posted as ERP Payment docs — confirmed absent from `transaction_headers` for LIN001 as at 2026-09-06.

---

## Unallocated / open items

| Item | Amount | Tag |
|---|---:|---|
| 44482 (PC-76-31) | R75,844.50 | Confirmed — see `LIN001_Payment_Allocation_v1.md` §2 |
~~DN#22630 shortfall~~ | ~~(R1,575.69)~~ | **RESOLVED 2026-09-06 — closed, correction posted, see event card** |
| DN#22936 surplus | R1,029.67 | ASSERTED |
~~DN#24817 shortfall~~ | ~~(R28,750.00 isolated)~~ | **RESOLVED 2026-09-06 — deposit charge confirmed legitimate via delivery note; immaterial (R477.83) on a rolling-account basis, see event card** |

**44974 (R40,590.60)** no longer appears in this list — it is reassigned to DN#21541 (2026-02-13), a separate event outside this register's Jun–Sep window. See `docs/LIN001_event_DN21541.md`.

---

## Balance bridge tie-out (see [`LIN001_balance_bridge_2026-06_2026-09.md`](LIN001_balance_bridge_2026-06_2026-09.md))

**Doctrine (adopted 2026-09-06): rolling/cumulative account balance** — each event's surplus or shortage carries forward chronologically into the next, matching how the ERP's own running-balance account statement works. See `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2 for the full doctrine.

```
DN#22630 → DN#22508 → DN#22936 → DN#23974 → DN#24947 → DN#24817
(chronological, each event's surplus/shortage carried into the next)
────────────────────────────────────────────────────────────────
Final cumulative position across all 6 events: R477.83 short — immaterial
```

Full event-by-event table in `LIN001_balance_bridge_2026-06_2026-09.md`. This replaces the earlier isolated-event framing (each event's gap treated as a standalone figure) as this account's standard way of judging whether a residual is a live concern — individual-transaction evidence work (payment targets, CN linkage, delivery-note fact-finding) is unaffected by this change.

**Corrected 2026-09-05:** previously R67,287.08 / R65,102.08 net, computed with payment 44974 (R40,590.60) counted against DN#22630. WhatsApp remittance evidence shows 44974 actually targets DN#21541 (a separate, earlier event outside this Jun–Sep window) — removing it from this window's payment total drops the aggregate credit by exactly R40,590.60. See `LIN001_balance_bridge_2026-06_2026-09.md` and `docs/LIN001_event_DN21541.md` for the full correction.

**Updated 2026-09-06:** the Proforma 2026-09-04 line above posted to ERP as invoice 52949/DN#24817, carrying an unbudgeted 9kg deposit charge confirmed legitimate via signed delivery note — see `docs/LIN001_event_DN24817.md`.

---

## Epistemic summary

| Tag | Meaning in this register |
|---|---|
| **PROVEN** | Supabase headers / CN ref_no / zero-net math / aggregate bridge tie-out |
| **ASSERTED** | Operator-confirmed bank receipts, 45961 allocation, proforma amounts |
| **ASSUMED** | Unallocated pools (44482) |
| **RETIRED (2026-09-05)** | PC-76-32 batch split for DN#22630 (44974+44975 both applied) — contradicted by WhatsApp remittance evidence naming DN#21541 for 44974 |
| **GAP** | (none remaining — the Proforma 09-04's missing DN# was resolved 2026-09-06, see DN#24817) |

---

## Verification against ERP

Cross-checked 2026-09-04 against `transaction_headers` (Supabase project `lpg-stock-recon`, account_no `LIN001`):

| Check | Result |
|---|---|
| Invoice/CN gross (`amount_excl + tax_amount`) for 51132, 15039, 51268, 15086, 51681, 15215, 52768, 15543, 52924, 15592 | Matches this register exactly, incl. DN#22508 full offset to R0.00 |
| CN `ref_no` → invoice `doc_no` linkage (15039→51132, 15086→51268, 15215→51681, 15543→52768, 15592→52924) | Confirmed |
| Invoice/CN `description` carries the literal `DN#` tag (e.g. `DN# 22630`, `DN#22936`, `DN#24947`) | Confirmed |
| Invoice 51681 `order_no` = `00013991` | Confirmed — matches bank receipt ref "Lin001 7.3 13991" |
| Payments 44482, 44974, 44975, 45961 posted as ERP `Payment` entries with stated batch_ref (PC-76-31/32/35) and gross amounts | Confirmed |
| 44974 target reassigned DN#22630 → DN#21541 (2026-09-05 correction, WhatsApp remittance evidence) | ASSERTED — customer-supplied evidence, not ERP-tagged; DN#21541 residual (R4,204.27) still open |
| `EXT-2744666881`, `EXT-2901239645`, `EXT-2949387151`, `EXT-2950393933` | **Not present** in `transaction_headers` for LIN001 — bank-side evidence only, not yet posted to ERP |
| Invoice 52949 / CN 15601 (DN#24817) | Confirmed — CN 15601 posted 2026-09-05, synced into the mirror 2026-09-06 (`transaction_items`: stock S.1, 48KG SV CYLINDER DEPOSIT, qty -8, -R9,660.00 gross) |
| Payment/event-net arithmetic (event totals, R221,780.96 payments, R67,287.08 credit, R65,102.08 net position) | Recomputed independently — ties |

No discrepancies found. The PROVEN tags above reflect this cross-check; ASSERTED/ASSUMED/GAP tags are unchanged since they concern evidence outside the ERP (bank receipts, operator allocation calls, missing proforma DN#).

---

## Artifacts

| Artifact | Path |
|---|---|
| **This register (CSV)** | `LIN001_events_consolidated_2026-06_2026-09.csv` |
| **This register (MD)** | `LIN001_events_consolidated_2026-06_2026-09.md` |
| Balance bridge | `LIN001_balance_bridge_2026-06_2026-09.md` |
| Events config | `analysis/debtors/LIN001/config/events.json` |
| Manual allocation detail | `LIN001_manual_allocation_2026-06_2026-09.csv` |
| Event cards | `LIN001_event_DN22936.md`, `LIN001_event_DN23974.md`, `LIN001_event_DN24947.md`, `LIN001_event_DN24817.md` (in `../docs/`; `LIN001_event_2026-09-04_proforma.md` superseded by the DN#24817 card) |
| Bank receipts | `LIN001_payment_receipt_DN22936_2026-07-03.jpg`, `LIN001_payment_receipt_34721_2026-08-22.jpg`, `LIN001_payment_receipt_13416.80_2026-09-04.jpg`, `LIN001_payment_receipt_690_2026-09-04.jpg` — **GAP: not yet uploaded to repo, referenced only** |
| Proforma invoice | `LIN001_proforma_invoice_2026-09-04.jpg` — **GAP: not yet uploaded to repo, referenced only** |

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_events_consolidated_2026-06_2026-09.md`*
