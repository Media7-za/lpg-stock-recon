# Internal ledger: Spoon Eatery (JEN001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 17 confirmed / 0 probable ties · 6 rows open · ERP `CURRENT BALANCE` R25,332.00 · PROPOSED — NOT RATIFIED

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

**ERP balance returns to ~R0.00** after: 07 Jan 2026 (Pmt 42917, line 107, R0.00).

---

### March 2025

Opening balance (ERP running): **R9,461.01**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Mar 2025 | Invoice | 41158 | DN#12898 | LPG | 3,680.67 | 13,141.68 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41159, Crd Note 11995, Pmt 37238, Inv 41615 +122 |
| 03 Mar 2025 | Invoice | 41159 | DN#12898-EMPTY | CYL | 4,140.00 | 17,281.68 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Crd Note 11995, Pmt 37238, Inv 41615 +122 |
| 04 Mar 2025 | Crd Note | 11995 | DN#12898-EMPTY | CYL | -4,140.00 | 13,141.68 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Pmt 37238, Inv 41615 +122 |
| 05 Mar 2025 | Payment | 37238 | TRANSF \| STAT 112 | LPG | -11,013.51 | 2,128.17 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Inv 41615 +122 |
| 19 Mar 2025 | Invoice | 41615 | DN#10531 | LPG | 3,680.67 | 5,808.84 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 19 Mar 2025 | Invoice | 41617 | DN#10531-EMPTY | CYL | 4,140.00 | 9,948.84 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 20 Mar 2025 | Crd Note | 12102 | DN#10531-EMPTY | CYL | -4,140.00 | 5,808.84 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### April 2025

Opening balance (ERP running): **R5,808.84**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2025 | Invoice | 41880 | DN#4460 | LPG | 3,680.67 | 9,489.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 01 Apr 2025 | Invoice | 41881 | DN#4460-EMPTY | CYL | 4,140.00 | 13,629.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 02 Apr 2025 | Crd Note | 12172 | DN#4460-EMPTY | CYL | -4,140.00 | 9,489.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 04 Apr 2025 | Invoice | 41989 | DN#12944 | LPG | 1,743.49 | 11,233.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 04 Apr 2025 | Invoice | 41990 | DN#12944-EMPTY | CYL | 3,105.00 | 14,338.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 05 Apr 2025 | Crd Note | 12197 | DN#12944-EMPTY | CYL | -1,035.00 | 13,303.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 10 Apr 2025 | Invoice | 42165 | DN#4485 | LPG | 3,603.18 | 16,906.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 10 Apr 2025 | Invoice | 42166 | DN#4485-EMPTY | CYL | 4,140.00 | 21,046.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 12 Apr 2025 | Crd Note | 12259 | DN#4485-EMPTY | CYL | -4,140.00 | 16,906.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Apr 2025 | Crd Note | 12366 | DN#13098 | LPG | -3,603.18 | 13,303.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Apr 2025 | Invoice | 42551 | DN#13098 | LPG | 3,603.18 | 16,906.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Apr 2025 | Invoice | 42552 | DN#13098-EMPTY | CYL | 4,140.00 | 21,046.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Apr 2025 | Invoice | 42618 | — | LPG | 3,373.27 | 24,419.45 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 26 Apr 2025 | Crd Note | 12353 | DN#13098-EMPTY | CYL | -4,140.00 | 20,279.45 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 30 Apr 2025 | Invoice | 42692 | DN#13117 | LPG | 3,373.27 | 23,652.72 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 30 Apr 2025 | Invoice | 42693 | DN#13117-EMPTY | CYL | 4,140.00 | 27,792.72 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### May 2025

Opening balance (ERP running): **R27,792.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2025 | Crd Note | 12405 | DN#13117-EMPTY | CYL | -4,140.00 | 23,652.72 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 13 May 2025 | Crd Note | 12465 | DN#13218-EMPTY | CYL | -4,140.00 | 19,512.72 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 13 May 2025 | Invoice | 43026 | DN#13218 | LPG | 3,373.27 | 22,885.99 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 13 May 2025 | Invoice | 43027 | DN#13218-EMPTY | CYL | 4,140.00 | 27,025.99 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 May 2025 | Payment | 38808 | TRANSF \| STAT 114 | LPG | -7,361.34 | 19,664.65 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 May 2025 | Invoice | 43311 | DN#12463 | LPG | 3,373.27 | 23,037.92 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 May 2025 | Invoice | 43312 | DN#12463- EMPTY | CYL | 4,140.00 | 27,177.92 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 26 May 2025 | Crd Note | 12559 | DN#12463- EMPTY | CYL | -6,210.00 | 20,967.92 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 28 May 2025 | Payment | 38928 | TRANSF \| STAT 114 | LPG | -15,774.00 | 5,193.92 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 30 May 2025 | Invoice | 43488 | DN#12277 | LPG | 1,619.50 | 6,813.42 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 30 May 2025 | Invoice | 43489 | DN#12277- EMPTY | CYL | 3,105.00 | 9,918.42 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### June 2025

Opening balance (ERP running): **R9,918.42**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jun 2025 | Invoice | 43579 | DN#12293 | LPG | 4,498.55 | 14,416.97 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Jun 2025 | Invoice | 43580 | DN#12293-EMPTY | CYL | 6,210.00 | 20,626.97 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 06 Jun 2025 | Crd Note | 12648 | DN#12293-EMPTY | CYL | -6,210.00 | 14,416.97 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 18 Jun 2025 | Invoice | 44050 | DN#12407 | LPG | 4,909.01 | 19,325.98 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 18 Jun 2025 | Invoice | 44051 | DN#12407-EMPTY | CYL | 7,245.00 | 26,570.98 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 20 Jun 2025 | Crd Note | 12770 | DN#12407-EMPTY | CYL | -6,727.50 | 19,843.48 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Jun 2025 | Invoice | 44182 | DN#12589 | LPG | 3,331.11 | 23,174.59 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Jun 2025 | Invoice | 44183 | DN#12589-EMPTY | CYL | 4,140.00 | 27,314.59 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Jun 2025 | Crd Note | 12801 | DN#12589-EMPTY | CYL | -4,140.00 | 23,174.59 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 27 Jun 2025 | Payment | 39619 | TRANSF \| STAT 115 | LPG | -8,366.10 | 14,808.49 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### July 2025

Opening balance (ERP running): **R14,808.49**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2025 | Crd Note | 12874 | DN#12448-EMPTY | CYL | -6,727.50 | 8,080.99 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 01 Jul 2025 | Invoice | 44422 | DN#12448 | LPG | 4,909.01 | 12,990.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 01 Jul 2025 | Invoice | 44423 | DN#12448-EMPTY | CYL | 7,245.00 | 20,235.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Jul 2025 | Crd Note | 12976 | DN#12693-EMPTY | CYL | -6,727.50 | 13,507.50 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Jul 2025 | Invoice | 44797 | DN#12693 | LPG | 4,825.72 | 18,333.22 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Jul 2025 | Invoice | 44798 | DN#12693-EMPTY | CYL | 7,245.00 | 25,578.22 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 23 Jul 2025 | Payment | 40266 | TRANSF \| STAT 116 | LPG | -12,738.70 | 12,839.52 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Jul 2025 | Crd Note | 13044 | D/N 12723 | CYL | -6,727.50 | 6,112.02 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Jul 2025 | Invoice | 45088 | D/N 12723 | LPG | 3,274.60 | 9,386.62 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Jul 2025 | Invoice | 45092 | D/N 12723 | CYL | 4,140.00 | 13,526.62 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### August 2025

Opening balance (ERP running): **R13,526.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Aug 2025 | Invoice | 45372 | DN#20061 | LPG | 4,825.72 | 18,352.34 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 04 Aug 2025 | Invoice | 45373 | DN#20061-EMPTY | CYL | 7,245.00 | 25,597.34 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 05 Aug 2025 | Crd Note | 13128 | DN#20061-EMPTY | CYL | -6,727.50 | 18,869.84 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Aug 2025 | Crd Note | 13226 | DN#20316-EMPTY | CYL | -4,140.00 | 14,729.84 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Aug 2025 | Invoice | 45635 | DN#20316 | LPG | 3,274.60 | 18,004.44 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Aug 2025 | Invoice | 45636 | DN#20316-EMPTY | CYL | 4,140.00 | 22,144.44 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 19 Aug 2025 | Invoice | 45758 | DN#20521 | LPG | 4,472.12 | 26,616.56 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 19 Aug 2025 | Invoice | 45759 | DN#20521-EMPTY | CYL | 6,727.50 | 33,344.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 20 Aug 2025 | Crd Note | 13267 | DN#20521-EMPTY | CYL | -6,210.00 | 27,134.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 21 Aug 2025 | Payment | 40745 | TRANSF \| STAT 117 | LPG | -13,009.30 | 14,124.76 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### September 2025

Opening balance (ERP running): **R14,124.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2025 | Invoice | 46057 | DN#20458 | LPG | 3,206.43 | 17,331.19 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 01 Sept 2025 | Invoice | 46058 | DN#20458-EMPTY | CYL | 4,140.00 | 21,471.19 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Sept 2025 | Crd Note | 13355 | DN#20458-EMPTY | CYL | -4,657.50 | 16,813.69 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Sept 2025 | Crd Note | 13432 | DN#20458-EMPTY | CYL | -517.50 | 16,296.19 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Sept 2025 | Invoice | 46459 | DN#21039 | LPG | 3,074.99 | 19,371.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Sept 2025 | Invoice | 46460 | DN#21039-EMPTY | CYL | 4,140.00 | 23,511.18 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 18 Sept 2025 | Crd Note | 13498 | DN#21039-EMPTY | CYL | -5,692.50 | 17,818.68 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 18 Sept 2025 | Payment | 41247 | TRANSF \| STAT 118 | LPG | -14,124.10 | 3,694.58 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 23 Sept 2025 | Invoice | 46626 | DN#20400 | LPG | 3,074.99 | 6,769.57 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 23 Sept 2025 | Invoice | 46627 | DN#20400-EMPTY | CYL | 4,140.00 | 10,909.57 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 25 Sept 2025 | Crd Note | 13541 | DN#20400-EMPTY | CYL | -4,140.00 | 6,769.57 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### October 2025

Opening balance (ERP running): **R6,769.57**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Oct 2025 | Crd Note | 13625 | DN-20168-EMPTY | CYL | -5,692.50 | 1,077.07 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 06 Oct 2025 | Invoice | 46904 | DN-20168 | LPG | 3,074.99 | 4,152.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 06 Oct 2025 | Invoice | 46905 | DN-20168-EMPTY | CYL | 4,140.00 | 8,292.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Oct 2025 | Crd Note | 13679 | DN#20720-EMPTY | CYL | -4,140.00 | 4,152.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Oct 2025 | Invoice | 47082 | DN#20720 | LPG | 3,560.51 | 7,712.57 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 14 Oct 2025 | Invoice | 47083 | DN#20720-EMPTY | CYL | 5,175.00 | 12,887.57 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 15 Oct 2025 | Payment | 41812 | TRANSF \| STAT 119 | LPG | -6,769.57 | 6,118.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Oct 2025 | Crd Note | 13738 | DN#20619-EMPTY | CYL | -1,035.00 | 5,083.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Oct 2025 | Invoice | 47273 | DN#20619 | LPG | 971.06 | 6,054.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Oct 2025 | Invoice | 47274 | DN#20619-EMPTY | CYL | 2,070.00 | 8,124.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 27 Oct 2025 | Crd Note | 13756 | DN#20630-EMPTY | CYL | -4,140.00 | 3,984.06 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 27 Oct 2025 | Invoice | 47341 | DN#20630 | LPG | 3,074.99 | 7,059.05 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 27 Oct 2025 | Invoice | 47342 | DN#20630-EMPTY | CYL | 4,140.00 | 11,199.05 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### November 2025

Opening balance (ERP running): **R11,199.05**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Nov 2025 | Invoice | 47591 | DN#20816 | LPG | 3,017.99 | 14,217.04 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 10 Nov 2025 | Invoice | 47592 | DN#20816-EMPTY | CYL | 4,140.00 | 18,357.04 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 11 Nov 2025 | Crd Note | 13839 | DN#20816-EMPTY | CYL | -4,140.00 | 14,217.04 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 12 Nov 2025 | Payment | 42224 | TRANSF \| STAT 120 | LPG | -11,199.05 | 3,017.99 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 20 Nov 2025 | Invoice | 47808 | DN#20849 | LPG | 4,209.33 | 7,227.32 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 20 Nov 2025 | Invoice | 47809 | DN#20849-EMPTY | CYL | 6,727.50 | 13,954.82 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 21 Nov 2025 | Crd Note | 13918 | DN#20849-EMPTY | CYL | -7,762.50 | 6,192.32 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### December 2025

Opening balance (ERP running): **R6,192.32**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Dec 2025 | Invoice | 48073 | DN#21185 | LPG | 3,017.99 | 9,210.31 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Dec 2025 | Invoice | 48074 | DN#21185-EMPTY | CYL | 4,140.00 | 13,350.31 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 04 Dec 2025 | Crd Note | 14000 | DN#21185-EMPTY | CYL | -4,140.00 | 9,210.31 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 10 Dec 2025 | Payment | 42597 | TRANSF \| STAT 121 | LPG | -6,192.32 | 3,017.99 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Dec 2025 | Invoice | 48328 | DN#21426 | LPG | 3,032.41 | 6,050.40 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Dec 2025 | Invoice | 48329 | DN#21426-EMPTY | CYL | 4,140.00 | 10,190.40 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 18 Dec 2025 | Crd Note | 14101 | DN#21426-EMPTY | CYL | -4,140.00 | 6,050.40 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Dec 2025 | Crd Note | 14163 | DN-20951-EMPTY | CYL | -4,140.00 | 1,910.40 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Dec 2025 | Invoice | 48471 | DN-20951 | LPG | 3,032.41 | 4,942.81 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Dec 2025 | Invoice | 48473 | DN-20951-EMPTY | CYL | 4,140.00 | 9,082.81 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### January 2026

Opening balance (ERP running): **R9,082.81**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Jan 2026 | Payment | 42917 | TRANSF \| STAT 122 | LPG | -9,082.81 | 0.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 ◀ ZERO |
| 08 Jan 2026 | Crd Note | 14231 | DN-21759-EMPTY | CYL | -4,140.00 | -4,140.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 08 Jan 2026 | Invoice | 48675 | DN-21759 | LPG | 3,032.41 | -1,107.59 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 08 Jan 2026 | Invoice | 48676 | DN-21759-EMPTY | CYL | 4,140.00 | 3,032.41 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### February 2026

Opening balance (ERP running): **R3,032.41**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2026 | Invoice | 49067 | DN#21517 | LPG | 3,052.49 | 6,084.90 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Feb 2026 | Crd Note | 14374 | DN#21517-EMPTY | CYL | -4,140.00 | 1,944.90 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 03 Feb 2026 | Invoice | 49068 | DN#21517-EMPTY | CYL | 4,140.00 | 6,084.90 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Feb 2026 | Payment | 43367 | TRANSF \| STAT 123 | LPG | -3,032.41 | 3,052.49 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Feb 2026 | Invoice | 49287 | DN-21902 | LPG | 3,084.02 | 6,136.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Feb 2026 | Invoice | 49288 | DN-21902-EMPTY | CYL | 4,140.00 | 10,276.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 19 Feb 2026 | Crd Note | 14445 | DN-21902-EMPTY | CYL | -4,140.00 | 6,136.51 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 23 Feb 2026 | Invoice | 49379 | DN`21271 | LPG | 3,084.02 | 9,220.53 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 23 Feb 2026 | Invoice | 49380 | DN`21271-EMPTY | CYL | 4,140.00 | 13,360.53 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 24 Feb 2026 | Crd Note | 14477 | DN`21271-EMPTY | CYL | -4,140.00 | 9,220.53 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### March 2026

Opening balance (ERP running): **R9,220.53**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Mar 2026 | Invoice | 49609 | DN#22114 | LPG | 2,589.05 | 11,809.58 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 06 Mar 2026 | Invoice | 49610 | DN#22114EMPTY | CYL | 3,450.00 | 15,259.58 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 09 Mar 2026 | Crd Note | 14556 | DN#22114EMPTY | CYL | -3,450.00 | 11,809.58 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 12 Mar 2026 | Payment | 43638 | TRANSF \| STAT 124 | LPG | -9,220.53 | 2,589.05 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 16 Mar 2026 | Invoice | 49752 | DN#22130 | LPG | 3,597.41 | 6,186.46 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 16 Mar 2026 | Invoice | 49753 | DN#22130-EMPTY | CYL | 5,175.00 | 11,361.46 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 17 Mar 2026 | Crd Note | 14601 | DN#22130-EMPTY | CYL | -4,657.50 | 6,703.96 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |

### April 2026

Opening balance (ERP running): **R6,703.96**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14698 | DN-22040-EMPTY | CYL | -5,692.50 | 1,011.46 | T0017 CYL_EXCHANGE ✓ ↔ Inv 50052, Inv 50537, Inv 50939, Crd Note 14864 +10 |
| 02 Apr 2026 | Invoice | 50051 | DN-22040 | LPG | 4,578.50 | 5,589.96 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50146 +9 |
| 02 Apr 2026 | Invoice | 50052 | DN-22040-EMPTY | CYL | 7,245.00 | 12,834.96 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50537, Inv 50939, Crd Note 14864 +10 |
| 08 Apr 2026 | Payment | 43927 | TRANSF \| STAT 125 | LPG | -6,703.96 | 6,131.00 | T0003 SETTLED_THROUGH ✓ ↔ Inv 41158, Inv 41159, Crd Note 11995, Pmt 37238 +122 |
| 09 Apr 2026 | Crd Note | 14729 | DN-22304-EMPTY | CYL | -4,140.00 | 1,991.00 | T0004 CN_DN_PAIR ✓ ↔ Inv 50147 |
| 09 Apr 2026 | Invoice | 50146 | DN-22304 | LPG | 3,448.83 | 5,439.83 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 09 Apr 2026 | Invoice | 50147 | DN-22304-EMPTY | CYL | 4,140.00 | 9,579.83 | T0004 CN_DN_PAIR ✓ ↔ Crd Note 14729 |
| 20 Apr 2026 | Invoice | 50318 | DN-22337 | LPG | 3,448.83 | 13,028.66 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 21 Apr 2026 | Crd Note | 14784 | DN-22337-EMPTY | CYL | -4,140.00 | 8,888.66 | T0005 CN_DN_PAIR ✓ ↔ Inv 50319 |
| 21 Apr 2026 | Invoice | 50319 | DN-22337-EMPTY | CYL | 4,140.00 | 13,028.66 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 14784 |

### May 2026

Opening balance (ERP running): **R13,028.66**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2026 | Invoice | 50536 | DN#22364 | LPG | 5,082.47 | 18,111.13 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 05 May 2026 | Invoice | 50537 | DN#22364-EMPTY | CYL | 7,245.00 | 25,356.13 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50939, Crd Note 14864 +10 |
| 05 May 2026 | Invoice | 50939 | DN#22364-EMPTY | CYL | 7,245.00 | 32,601.13 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Crd Note 14864 +10 |
| 06 May 2026 | Crd Note | 14864 | DN#22364-EMPTY | CYL | -5,865.00 | 26,736.13 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 06 May 2026 | Crd Note | 14994 | DN#22364-EMPTY | CYL | -1,380.00 | 25,356.13 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 06 May 2026 | Crd Note | 14995 | DN#22364-EMPTY | CYL | -6,210.00 | 19,146.13 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 18 May 2026 | Invoice | 50753 | DN#22734 | LPG | 3,951.91 | 23,098.04 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 18 May 2026 | Invoice | 50754 | DN#22734 | CYL | 4,140.00 | 27,238.04 | T0006 CN_DN_PAIR ✓ ↔ Crd Note 14922 |
| 19 May 2026 | Crd Note | 14922 | DN#22734 | CYL | -4,140.00 | 23,098.04 | T0006 CN_DN_PAIR ✓ ↔ Inv 50754 |

### June 2026

Opening balance (ERP running): **R23,098.04**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jun 2026 | Invoice | 50970 | DN#22452 | LPG | 3,293.25 | 26,391.29 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 01 Jun 2026 | Invoice | 50971 | DN#22452-EMPTY | CYL | 3,450.00 | 29,841.29 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 02 Jun 2026 | Crd Note | 15007 | DN#22452-EMPTY | CYL | -5,520.00 | 24,321.29 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 11 Jun 2026 | Invoice | 51154 | DN#22474 | LPG | 4,866.88 | 29,188.17 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 11 Jun 2026 | Invoice | 51155 | DN#22474 | CYL | 5,692.50 | 34,880.67 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15066 |
| 15 Jun 2026 | Crd Note | 15066 | DN#22474 | CYL | -5,692.50 | 29,188.17 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 51155 |
| 23 Jun 2026 | Invoice | 51387 | DN#22914 | LPG | 3,934.93 | 33,123.10 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 23 Jun 2026 | Invoice | 51388 | DN#22914 EMPTIES | CYL | 4,140.00 | 37,263.10 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 24 Jun 2026 | Crd Note | 15114 | DN#22914 EMPTIES | CYL | -5,175.00 | 32,088.10 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 25 Jun 2026 | Payment | 44878 | TRANSF \| STAT 127 | LPG | -10,000.00 | 22,088.10 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 45717, Pmt 46098, Inv 50051, Inv 50146 +9 |

### July 2026

Opening balance (ERP running): **R22,088.10**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2026 | Crd Note | 15193 | DN#22673=EMPTY | CYL | -1,035.00 | 21,053.10 | T0007 CN_DN_PAIR ✓ ↔ Inv 51565 |
| 03 Jul 2026 | Invoice | 51564 | DN#22673 | LPG | 623.88 | 21,676.98 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 03 Jul 2026 | Invoice | 51565 | DN#22673=EMPTY | CYL | 1,035.00 | 22,711.98 | T0007 CN_DN_PAIR ✓ ↔ Crd Note 15193 |
| 07 Jul 2026 | Crd Note | 15204 | DN#22679=EMPTY | CYL | -5,692.50 | 17,019.48 | T0008 CN_DN_PAIR ✓ ↔ Inv 51670 |
| 07 Jul 2026 | Crd Note | 15205 | DN#22679 | LPG | -4,887.10 | 12,132.38 | T0009 CN_DN_PAIR ✓ ↔ Inv 51669 |
| 07 Jul 2026 | Invoice | 51669 | DN#22679 | LPG | 4,887.10 | 17,019.48 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 15205 |
| 07 Jul 2026 | Invoice | 51670 | DN#22679=EMPTY | CYL | 5,692.50 | 22,711.98 | T0008 CN_DN_PAIR ✓ ↔ Crd Note 15204 |
| 08 Jul 2026 | Crd Note | 15220 | DN#22679=EMPTY | CYL | -5,692.50 | 17,019.48 | T0010 CN_DN_PAIR ✓ ↔ Inv 51692 |
| 08 Jul 2026 | Invoice | 51691 | DN#22679 | LPG | 4,887.10 | 21,906.58 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 08 Jul 2026 | Invoice | 51692 | DN#22679=EMPTY | CYL | 5,692.50 | 27,599.08 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 15220 |
| 14 Jul 2026 | Crd Note | 15258 | DN#22816=EMPTY | CYL | -1,552.50 | 26,046.58 | T0011 CN_DN_PAIR ✓ ↔ Inv 51824 |
| 14 Jul 2026 | Invoice | 51823 | DN#22816 | LPG | 935.81 | 26,982.39 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Pmt 46098, Inv 50051 +9 |
| 14 Jul 2026 | Invoice | 51824 | DN#22816=EMPTY | CYL | 1,552.50 | 28,534.89 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 15258 |
| 23 Jul 2026 | Invoice | 52044 | DN#22976 | LPG | 3,951.29 | 32,486.18 | OPEN |
| 24 Jul 2026 | Crd Note | 15317 | DN#22976-EMPTY | CYL | -690.00 | 31,796.18 | T0012 CN_DN_PAIR ✓ ↔ Inv 52050 |
| 24 Jul 2026 | Invoice | 52050 | DN#22976-EMPTY | CYL | 690.00 | 32,486.18 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 15317 |
| 24 Jul 2026 | Invoice | 52051 | DN#52044-EMPTY | CYL | 4,140.00 | 36,626.18 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 15329 |
| 25 Jul 2026 | Crd Note | 15329 | DN#52044-EMPTY | CYL | -4,140.00 | 32,486.18 | T0013 CN_DN_PAIR ✓ ↔ Inv 52051 |

### August 2026

Opening balance (ERP running): **R32,486.18**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Aug 2026 | Invoice | 52305 | DN#23940 | LPG | 5,199.03 | 37,685.21 | OPEN |
| 04 Aug 2026 | Invoice | 52306 | DN#23940-EMPTY | CYL | 6,210.00 | 43,895.21 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 15392 |
| 05 Aug 2026 | Crd Note | 15392 | DN#23940-EMPTY | CYL | -6,210.00 | 37,685.21 | T0014 CN_DN_PAIR ✓ ↔ Inv 52306 |
| 14 Aug 2026 | Payment | 45717 | TRANSF \| STAT 129 | LPG | -15,000.00 | 22,685.21 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 46098, Inv 50051, Inv 50146 +9 |
| 19 Aug 2026 | Crd Note | 15506 | DN#24281-EMPTY | CYL | -5,692.50 | 16,992.71 | T0015 CN_DN_PAIR ✓ ↔ Inv 52649 |
| 19 Aug 2026 | Invoice | 52648 | DN#24281 | LPG | 4,360.11 | 21,352.82 | OPEN |
| 19 Aug 2026 | Invoice | 52649 | DN#24281-EMPTY | CYL | 5,692.50 | 27,045.32 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 15506 |

### September 2026

Opening balance (ERP running): **R27,045.32**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Sept 2026 | Invoice | 53029 | DN#24977 | LPG | 4,445.57 | 31,490.89 | OPEN |
| 07 Sept 2026 | Invoice | 53030 | DN#24977=EMPTY | CYL | 5,692.50 | 37,183.39 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 15627 |
| 08 Sept 2026 | Crd Note | 15627 | DN#24977=EMPTY | CYL | -5,692.50 | 31,490.89 | T0016 CN_DN_PAIR ✓ ↔ Inv 53030 |
| 11 Sept 2026 | Payment | 46098 | TRANSF \| STAT 130 | LPG | -15,000.00 | 16,490.89 | T0001 LOCKED:OPERATOR_RULING [part_payment] ↔ Pmt 44878, Pmt 45717, Inv 50051, Inv 50146 +9 |
| 21 Sept 2026 | Crd Note | 15682 | DN#23802-EMPTY | CYL | -4,657.50 | 11,833.39 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 21 Sept 2026 | Invoice | 53224 | DN#23802 | LPG | 3,594.28 | 15,427.67 | OPEN |
| 21 Sept 2026 | Invoice | 53225 | DN#23802-EMPTY | CYL | 4,140.00 | 19,567.67 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |

### October 2026

Opening balance (ERP running): **R19,567.67**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Oct 2026 | Invoice | 53468 | DN#24702 | LPG | 4,729.33 | 24,297.00 | OPEN |
| 05 Oct 2026 | Invoice | 53469 | DN#24702-EMPTY | CYL | 6,210.00 | 30,507.00 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |
| 06 Oct 2026 | Crd Note | 15766 | DN#24702-EMPTY | CYL | -5,175.00 | 25,332.00 | T0017 CYL_EXCHANGE ✓ ↔ Crd Note 14698, Inv 50052, Inv 50537, Inv 50939 +10 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 2 | 0 |
| SETTLED_THROUGH | 1 | 0 |
| CN_DN_PAIR | 13 | 0 |
| CYL_EXCHANGE | 1 | 0 |

Proof: holds (rebuilt R25,332.00 vs closing R25,332.00; ERP R25,332.00).

