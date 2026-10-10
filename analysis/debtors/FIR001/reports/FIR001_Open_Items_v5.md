# Open Items Statement: FIRE AND VINE (FIR001) — Internal
**Period:** from 29 Dec 2022 to 07 Oct 2026 &nbsp;|&nbsp; **Balance due:** R9,469.77
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-10 by `render_open_items.mjs`
**Sources:** `analysis/debtors/FIR001/data/v5_projection.json` (TXT sha256 `1cf1b6f9c63e…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (163 confirmed / 0 probable ties) · **REVIEW ONLY:** ingestCoverage partial
**Locks:** closed through 2026-08-31, 28 locks applied

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R25,752.41

## Part 1A: LPG + OTHER open items

### December 2022

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 29 Dec 2022 | Payment | 17570 | TRANSF \| STAT90 | LPG | -6,316.11 | 19,436.30 |

### January 2023

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Jan 2023 | Payment | 17655 | TRANSF \| STAT90 | LPG | -6,087.81 | 13,348.49 |
| 18 Jan 2023 | Payment | 17786 | TRANSF \| STAT90 | LPG | -6,258.19 | 7,090.30 |
| 24 Jan 2023 | Payment | 17849 | TRANSF \| STAT90 | LPG | -6,492.87 | 597.43 |

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Oct 2025 | Payment | 41506 | CASH \| T2000222 | LPG | -0.02 | 597.41 |
| 18 Oct 2025 | Crd Note | 13709 | DN#21108-EMPTY | LPG | -235.14 | 362.27 |
| 18 Oct 2025 | Invoice | 47166 | DN#21108 | LPG | 6,505.40 | 6,867.67 |
| 20 Oct 2025 | Payment | 41939 | TRANSF \| STAT 119 | LPG | -6,270.26 | 597.41 |

### February 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 26 Feb 2026 | Invoice | 49458 | DN#21802 | LPG | 6,289.35 | 6,886.76 |

### March 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Mar 2026 | Payment | 43546 | TRANSF \| STAT 124 | LPG | -6,525.20 | 361.56 |
| 12 Mar 2026 | Payment | 43639 | TRANSF \| STAT 124 | LPG | -6,101.45 | -5,739.89 |
| 25 Mar 2026 | Invoice | 49931 | DN-21984 | LPG | 6,337.30 | 597.41 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 18 Sept 2026 | Invoice | 53213 | DN#21366 | LPG | 7,319.84 | 7,917.25 |
| 28 Sept 2026 | Payment | 46328 | TRANSF \| STAT 130 | LPG | -6,536.23 | 1,381.02 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Oct 2026 | Invoice | 53480 | DN#24706 | LPG | 6,536.23 | 7,917.25 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 22 Aug 2026 | Invoice | 52737 | DN#24929-EMPTY | CYL | 6,555.00 | 6,555.00 |
| 24 Aug 2026 | Crd Note | 15535 | DN#24929-EMPTY | CYL | -6,037.50 | 517.50 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 18 Sept 2026 | Invoice | 53193 | DN#21366-EMPTY | CYL | 7,072.50 | 7,590.00 |
| 19 Sept 2026 | Crd Note | 15675 | DN#21366-EMPTY | CYL | -6,555.00 | 1,035.00 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Oct 2026 | Invoice | 53481 | DN#24706-EMPTY | CYL | 6,555.00 | 7,590.00 |
| 07 Oct 2026 | Crd Note | 15770 | DN#24706-EMPTY | CYL | -6,037.50 | 1,552.50 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 25,752.41 | 0.00 | 25,752.41 |
| Open items listed above | -17,835.16 | 1,552.50 | -16,282.66 |
| Rounding on matched items (tie nets) | 0.02 | 0.00 | 0.02 |
| **Balance** | 7,917.27 | 1,552.50 | 9,469.77 |
| ERP `CURRENT BALANCE` (TXT header) | | | 9,469.77 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 28 |
| CN_DN_PAIR | 64 |
| EXACT_SINGLE | 65 |
| EXACT_SUM | 3 |
| EXACT_MONTH_SUM | 1 |
| CYL_EXCHANGE | 2 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0020 | exact | Payment 45474, Invoice 52036 | 0.00 | Operator correction 2026-10-08 (ADM-86): "45591 should have been 52195" (FIFO pairing); replaces closest-date pairing locked at close C0001: 45474 (31 Jul) pays 52036 (23 Jul) |
| L0021 | exact | Payment 45591, Invoice 52195 | 0.00 | Operator correction 2026-10-08 (ADM-86): "45591 should have been 52195" (FIFO pairing); replaces closest-date pairing locked at close C0001: 45591 (07 Aug) pays 52195 (30 Jul) |
| L0022 | exact | Invoice 42699, Crd Note 12410 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0023 | exact | Invoice 46902, Crd Note 13638 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0024 | exact | Invoice 49035, Crd Note 14367 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0025 | exact | Invoice 49146, Crd Note 14396 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0026 | exact | Invoice 49459, Crd Note 14521 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0027 | exact | Invoice 44987, Crd Note 13027 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0028 | exact | Invoice 47067, Crd Note 13677 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0029 | exact | Invoice 51146, Crd Note 15044 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |
| L0030 | exact | Invoice 53277, Crd Note 15694 | 0.00 | Operator ruling 2026-10-10 (main session, "We can approve them in groups"): approved as groups CN-DN-1 and CN-AD of docs/previews/2026-10-10_probable_ties_by_group.md. CN-DN-1 = credit note and invoice of the same delivery-note number and lane, exact opposite amount, credit note 2-5 days after the invoice. CN-AD = exact opposite amount and lane, credit note 0-1 day after the invoice, a single candidate. In both groups no other invoice or credit note of the same lane, amount and delivery note exists (a rival would make the pairing arbitrary). Group-level judgement, not a document-by-document review. Tripwires: an allocation-detail export tagging a credit note of this group to a different invoice; a re-issue of either document. |

