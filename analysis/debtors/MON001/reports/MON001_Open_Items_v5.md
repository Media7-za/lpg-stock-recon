# Open Items Statement: SHORTEN INTERNATIONAL 66 ON MONZALI (MON001) — Internal
**Period:** from 11 Jul 2024 to 02 Oct 2026 &nbsp;|&nbsp; **Balance due:** R2,417.24
**Status:** matcher v5 RATIFIED 2026-10-10 (`PROPOSED_Projection_Matching_Locks.md`); probable ties are proposals until approved · generated 2026-10-10 by `render_open_items.mjs`
**Sources:** `analysis/debtors/MON001/data/v5_projection.json` (TXT sha256 `3b289b8d9d76…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (30 confirmed / 0 probable ties) · **REVIEW ONLY:** ingestCoverage partial
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R162.86

## Part 1A: LPG + OTHER open items

### July 2024

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 11 Jul 2024 | Payment | 45158 | TRANSF \| STAT 104 | LPG | -2,628.79 | -2,465.93 |

### March 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Mar 2025 | Payment | 37379 | TRANSF \| STAT 112 | LPG | -2,816.83 | -5,282.76 |

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 09 Oct 2025 | Invoice | 46978 | DN#20703 | LPG | 2,500.38 | -2,782.38 |

### January 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 27 Jan 2026 | Invoice | 52130 | — | OTHER | 960.00 | -1,822.38 |

### April 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | LPG | -498.53 | -2,320.91 |

### July 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 20 Jul 2026 | Invoice | 51952 | DN#22696 | LPG | 3,123.10 | 802.19 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Oct 2026 | Invoice | 53432 | DN#23829 | LPG | 2,822.45 | 3,624.64 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### April 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | CYL | -1,207.50 | -1,207.50 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 162.86 | 0.00 | 162.86 |
| Open items listed above | 3,461.78 | -1,207.50 | 2,254.28 |
| Rounding on matched items (tie nets) | 0.10 | 0.00 | 0.10 |
| **Balance** | 3,624.74 | -1,207.50 | 2,417.24 |
| ERP `CURRENT BALANCE` (TXT header) | | | 2,417.24 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 4 |
| CN_DN_PAIR | 15 |
| EXACT_SINGLE | 10 |
| EXACT_MONTH_SUM | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | exact | Invoice 49461, Crd Note 14512 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0002 | exact | Invoice 51953, Crd Note 15303 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0003 | exact | Payment 45589, Invoice 51846 | 0.10 | Operator decision 2026-10-10 (main session, "Yes, go ahead" on the recommendations in docs/previews/2026-10-10_remaining_probable_ties_recommendations.md). Tie 6: payment 45589 (R3,123.00, STAT 129) vs invoice 51846 (R3,123.10), short R0.10; a twin, 51952 (R3,123.10), is equally close and the oldest-first pick of 51846 is the ratified tie-break, so 51952 stays open unless another payment covers it. Tie 7 (medium confidence): payment 45216 (R5,430.30, STAT 128) = invoice 50363 (R2,815.20) + invoice 50097 (R1,407.60 gas + R1,207.50 deposit lane, 'EXTRA SV'), exact to the cent across two deliveries (DN 22341 and DN 21861), no alternative combination; invoices dated April, payment July. Tripwires: a remittance or allocation export naming different invoices for 45216 or 45589. |
| L0004 | exact | Payment 45216, Invoice 50363, Invoice 50097 | 0.00 | Operator decision 2026-10-10 (main session, "Yes, go ahead" on the recommendations in docs/previews/2026-10-10_remaining_probable_ties_recommendations.md). Tie 6: payment 45589 (R3,123.00, STAT 129) vs invoice 51846 (R3,123.10), short R0.10; a twin, 51952 (R3,123.10), is equally close and the oldest-first pick of 51846 is the ratified tie-break, so 51952 stays open unless another payment covers it. Tie 7 (medium confidence): payment 45216 (R5,430.30, STAT 128) = invoice 50363 (R2,815.20) + invoice 50097 (R1,407.60 gas + R1,207.50 deposit lane, 'EXTRA SV'), exact to the cent across two deliveries (DN 22341 and DN 21861), no alternative combination; invoices dated April, payment July. Tripwires: a remittance or allocation export naming different invoices for 45216 or 45589. |

