# Open Items Statement: SAKI - VICTORIA RD (SA0001) — Internal
**Period:** from 07 Feb 2023 to 02 Oct 2026 &nbsp;|&nbsp; **Balance due:** R16,002.86
**Status:** matcher v5 RATIFIED 2026-10-10 (`PROPOSED_Projection_Matching_Locks.md`); probable ties are proposals until approved · generated 2026-10-10 by `render_open_items.mjs`
**Sources:** `analysis/debtors/SA0001/data/v5_projection.json` (TXT sha256 `837cff982c0c…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (162 confirmed / 0 probable ties)
**Locks:** closed through 2026-09-30, 160 locks applied

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R4,945.93

## Part 1A: LPG + OTHER open items

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 20 Oct 2025 | Invoice | 47182 | DN#21113 | LPG | 255.65 | 5,201.58 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 12 Aug 2026 | Invoice | 52814 | DN#24904 | LPG | 5,981.61 | 11,183.19 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 25 Sept 2026 | Invoice | 53293 | DN#21379 | LPG | 258.75 | 11,441.94 |
| 29 Sept 2026 | Invoice | 53355 | DN#23818 | LPG | 258.75 | 11,700.69 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Oct 2026 | Invoice | 53436 | DN-21397 | LPG | 5,520.00 | 17,220.69 |
| 02 Oct 2026 | Invoice | 53446 | DN-23836 | LPG | 258.75 | 17,479.44 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 4,945.93 | 0.00 | 4,945.93 |
| Open items listed above | 12,533.51 | 0.00 | 12,533.51 |
| Rounding on matched items (tie nets) | -0.08 | 0.00 | -0.08 |
| Payments applied to opening B/F (operator rulings) | -1,409.77 | 0.00 | -1,409.77 |
| Overpayments held as customer credit (operator rulings) | -66.73 | 0.00 | -66.73 |
| **Balance** | 16,002.86 | 0.00 | 16,002.86 |
| ERP `CURRENT BALANCE` (TXT header) | | | 16,002.86 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 160 |
| CN_DN_PAIR | 1 |
| CYL_EXCHANGE | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0113 | customer_credit | Payment 45782, Invoice 52813, Invoice 52547 | -33.64 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): paid 594.42 = original DN#24252 R314.03 + 52547 R280.39; DN#24252 later credited (15556) and re-issued as 52813 at R280.39; R33.64 overpaid |
| L0114 | customer_credit | Payment 46237, Invoice 53214, Invoice 53215 | -27.09 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): paid 5,805.84 = 53214 R5,520.00 + original DN-25000 R285.84; DN-25000 credited (15680) and re-issued as 53215 at R258.75; R27.09 overpaid |
| L0115 | customer_credit | Payment 46092, Invoice 52893 | -6.00 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): DN#24805 delivered 01 Sep, paid 08 Sep; R6.00 over, unexplained; moderate confidence (alternative 52814+53011 rejected because 46160 pays 53011 exactly); leaves 52814 (DN#24904) open |
| L0116 | applied_to_bf | Payment 38837, Invoice 42123, Invoice 43083 | -136.62 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): paid R6,303.68 per delivery vs R6,235.37 invoiced; R136.62 excess reduced the customer's standing opening balance |
| L0117 | applied_to_bf | Payment 41012, Invoice 45829, Invoice 45990 | -251.47 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): paid 45829 + deposit line 45991 R517.50 (credited by 13334) instead of 45990; R251.47 excess reduced the opening balance |
| L0118 | applied_to_bf | Payment 42986, Invoice 48695 | -400.00 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): R400.00 over 48695 (round extra payment or keying of 252.29); excess reduced the opening balance |
| L0119 | applied_to_bf | Payment 44740 | -621.68 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): dated 07/02/2023, before every invoice in the TXT window (doc number fits a 2026 sequence, year likely mis-keyed); applied to the opening B/F |
| L0145 | exact | Invoice 42584, Crd Note 12361 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0146 | exact | Invoice 46653, Crd Note 13559 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0147 | exact | Invoice 47451, Crd Note 13805 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0148 | exact | Invoice 48825, Crd Note 14311 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0149 | exact | Invoice 49456, Crd Note 14516 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0150 | exact | Invoice 49457, Crd Note 14517 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0151 | exact | Invoice 50289, Crd Note 14780 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0152 | exact | Invoice 50982, Crd Note 15015 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0153 | exact | Invoice 52739, Crd Note 15536 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0154 | exact | Invoice 44988, Crd Note 13028 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0155 | exact | Invoice 45002, Crd Note 13264 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0156 | exact | Invoice 49904, Crd Note 14651 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0157 | exact | Invoice 53174, Crd Note 15661 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0158 | exact | Invoice 53437, Crd Note 15747 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0159 | exact | Payment 38531, Invoice 42816, Invoice 42583 | 0.06 | Operator decision 2026-10-10 (main session, "Yes, go ahead" on the recommendations in docs/previews/2026-10-10_remaining_probable_ties_recommendations.md). Tie 4: payment 38531 (R6,514.50, STAT 114) vs invoices 42816 + 42583 (R6,514.56), the only combination, short R0.06. Tie 5: cash payment 38878 (R283.00) vs invoice 43375 (R282.80), same day, R0.20 over; the other candidates within R5 are older and further away. Both inside closed period C0002; approved locks, the close is untouched. The differences are carried as rounding on matched items. Tripwires: a remittance or allocation export naming other invoices for these payments. |
| L0160 | exact | Payment 38878, Invoice 43375 | -0.20 | Operator decision 2026-10-10 (main session, "Yes, go ahead" on the recommendations in docs/previews/2026-10-10_remaining_probable_ties_recommendations.md). Tie 4: payment 38531 (R6,514.50, STAT 114) vs invoices 42816 + 42583 (R6,514.56), the only combination, short R0.06. Tie 5: cash payment 38878 (R283.00) vs invoice 43375 (R282.80), same day, R0.20 over; the other candidates within R5 are older and further away. Both inside closed period C0002; approved locks, the close is untouched. The differences are carried as rounding on matched items. Tripwires: a remittance or allocation export naming other invoices for these payments. |

