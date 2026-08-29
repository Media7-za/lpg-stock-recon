# ORYX ENERGY (008ORY) — Supplier Ledger vs Our Ledger

**Generated:** 2026-08-26 · **Scope:** 2026-01-01 → 2026-08-31
**Their ledger:** `analysis/creditors/008ORY/raw/supplier_ledger/Oryx Recon - July 2026 - Sheet1.csv` — Oryx recon working paper, Jan 2026 → 17 Aug 2026. Advisory only.
**Our ledger:** `analysis/creditors/008ORY/raw/008ORYCURRENT.TXT` (Tier-3 authority)
**Join key:** supplier SO number, normalised to a bare integer from both sides

> **Advisory only.** Per `CREDITORS_DOCTRINE.md` the supplier ledger is a cross-check, never a balance authority. Discrepancies below are findings to pursue, not adjustments to post.

**Ratified decisions applied:** 7 from `analysis/creditors/008ORY/data/supplier_ledger_decisions.csv`

See `analysis/creditors/shared/docs/Supplier_Ledger_Ratification_Guide.md` for how to work the open items.

---

## 0. Balance headline

| Measure | As at 17 Aug 2026 |
| :--- | ---: |
| Their stated balance (we owe) | 32,067.15 |
| Our ERP running balance | -121,237.70 |
| **Gap (their balance − \|ours\|)** | **-89,170.55** |

> Their balance is **advisory**. Our ERP `CURRENT BALANCE` remains Tier-3 authority for the v5 statement; nothing in this report adjusts it.

---

## 1. Volume rebates

*Their credit notes for volume rebate against our computed entitlement (incl VAT). Our basis is the delivered-kg calculation; theirs is whatever they chose to pass.*

| Month | Our net kg | Our entitlement (incl VAT) | Their credit note | Their doc | Variance | Status |
| :--- | ---: | ---: | ---: | :--- | ---: | :--- |
| January 2026 | 11,370 | 13,075.50 | 13,075.50 | SC26ZA01001541 (17 Feb 2026) | 0.00 | Agrees |
| February 2026 | 2,210 | 2,541.50 | 7,123.10 | SC26ZA01004068 (24 Apr 2026) | -4,581.60 | Over-credited |
| March 2026 | 3,984 | 4,581.60 | — | — | 4,581.60 | **Not passed** |
| April 2026 | 21,448 | 24,665.20 | 27,006.60 | SC26ZA01005425 (25 May 2026) | -2,341.40 | Over-credited |
| May 2026 | 32,654 | 56,328.15 | 52,188.15 | SC26ZA01006457 (17 Jun 2026) | 4,140.00 | Short-paid |
| June 2026 | 32,353 | 55,808.93 | 55,807.20 | SC26ZA01008528 (29 Jul 2026) | 1.73 | Agrees |
| July 2026 | 36,400 | 62,790.00 | — | — | 62,790.00 | **Not passed** |
| August 2026 | 27,494 | 31,618.10 | — | — | 31,618.10 | **Not passed** |
| **Total** | — | **251,408.98** | **155,200.55** | — | **96,208.43** | — |

### Rows tagged "Rebate" on their sheet that are not rebate credit notes

| Date | Type | Doc # | Description | Amount | Treated as |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 06 May 2026 | APPAY | APP2605ZA101000137 | #031 | 54,420.00 | Payment (matched in section 3) |

*The tag is free text on their working paper. These rows carry no rebate month and their document type is not a credit note, so they are reconciled in their natural lane and excluded from the rebate entitlement comparison above.*

> **R98,989.70 of rebate entitlement has no matching credit note** on their ledger (March 2026, July 2026, August 2026).

---

## 2. Deliveries — their invoices/credit notes vs our GRVs/Deb Notes

*Joined on **month-scoped SO** (sequences restart each month). Their `SAINV` maps to our `GRV` (gross charge) and their `SACRN` to our `Deb Note` (cylinder deposit credit). Tolerance R2.00.*

| Outcome | SO count |
| :--- | ---: |
| Agree on both charge and credit | 43 |
| Same SO, amounts differ | 17 |
| Ratified link (human-confirmed same delivery) | 3 |
| Merged group (our one SO vs several of theirs) | 3 |
| Matched on adjacent month (boundary booking) | 0 |
| Closed by a ratified decision | 0 |
| Delivered after their cut-off — out of scope | 3 |
| **Open — on our ledger only** | **1** |
| **Open — on their ledger only** | **2** |
| **Total SO groups compared** | **69** |

### Same SO, amounts differ

| SO | Docs (ours/theirs) | Our GRV | Their invoice | Charge var | Our Deb Note | Their credit note | Credit var | Pattern |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 2026-01 / 010 | 2/4 | 196,902.00 | 97,739.12 | **99,162.88** | 128,225.00 | 128,225.00 | **0.00** | Charge only |
| 2026-01 / 021 | 2/1 | 97,739.42 | 0.00 | **97,739.42** | 58,650.00 | 58,650.00 | **0.00** | Charge only |
| 2026-03 / 076 | 2/2 | 109,261.65 | 113,286.90 | **-4,025.25** | 62,790.00 | 66,815.00 | **-4,025.00** | Deposit-driven |
| 2026-05 / 006 | 2/3 | 212,671.73 | 276,836.33 | **-64,164.60** | 133,975.00 | 133,975.00 | **0.00** | Charge only |
| 2026-05 / 020 | 2/1 | 60,061.17 | 0.00 | **60,061.17** | 37,950.00 | 37,950.00 | **0.00** | Charge only |
| 2026-05 / 038 | 2/2 | 130,311.34 | 139,886.84 | **-9,575.50** | 75,900.00 | 75,900.00 | **0.00** | Charge only |
| 2026-05 / 059 | 2/3 | 147,150.78 | 178,446.44 | **-31,295.66** | 85,560.00 | 85,560.00 | **0.00** | Charge only |
| 2026-05 / 087 | 2/1 | 31,295.64 | 0.00 | **31,295.64** | 16,215.00 | 16,215.00 | **0.00** | Charge only |
| 2026-06 / 011 | 2/2 | 109,782.73 | 109,542.89 | **239.84** | 66,960.52 | 66,953.38 | **7.14** | Both lanes |
| 2026-06 / 141 | 4/3 | 163,723.54 | 204,653.93 | **-40,930.39** | 87,285.00 | 75,210.00 | **12,075.00** | Both lanes |
| 2026-06 / 156 | 2/2 | 145,698.96 | 145,698.96 | **0.00** | 79,695.00 | 114,195.00 | **-34,500.00** | Deposit only |
| 2026-06 / 186 | 2/2 | 126,125.25 | 127,321.26 | **-1,196.01** | 69,000.00 | 69,000.00 | **0.00** | Charge only |
| 2026-07 / 002 | 2/2 | 209,688.74 | 210,161.67 | **-472.93** | 117,300.00 | 117,300.00 | **0.00** | Charge only |
| 2026-07 / 048 | 4/3 | 209,169.70 | 209,169.60 | **0.10** | 97,692.50 | 86,825.00 | **10,867.50** | Deposit only |
| 2026-07 / 147 | 2/2 | 165,083.73 | 165,083.72 | **0.01** | 96,600.00 | 97,635.00 | **-1,035.00** | Deposit only |
| 2026-07 / 291 | 4/2 | 39,540.84 | 38,298.42 | **1,242.42** | 27,117.43 | 25,875.00 | **1,242.43** | Deposit-driven |
| 2026-08 / 011 | 2/2 | 178,431.68 | 167,983.74 | **10,447.94** | 101,775.00 | 101,775.00 | **0.00** | Charge only |

*`Deposit only` means the gas charge agrees and only the cylinder deposit credit differs. `Deposit-driven` means the charge and credit variances are equal and opposite in effect, which usually points to a deposit line landing in a different lane rather than a price difference.*

### Ratified links (human-confirmed same delivery)

*A reviewer confirmed these two SO references are the same delivery. Variances below are the real difference once the reference mismatch is set aside.*

| SO | Docs (ours/theirs) | Our GRV | Their invoice | Charge var | Our Deb Note | Their credit note | Credit var | Pattern |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 2026-08 / 049 ↔ 2026-08 / 055 | 2/2 | 97,416.21 | 97,416.20 | **0.01** | 34,845.00 | 34,845.00 | **0.00** | Charge only |
| 2026-05 / 125 ↔ 2026-05 / 176 | 2/2 | 92,239.62 | 92,239.61 | **0.01** | 46,575.00 | 46,575.00 | **0.00** | Charge only |
| 2026-04 / 018 ↔ 2026-04 / 020 | 2/2 | 219,523.28 | 219,523.28 | **0.00** | 132,077.50 | 132,077.50 | **0.00** | Charge only |

*`Deposit only` means the gas charge agrees and only the cylinder deposit credit differs. `Deposit-driven` means the charge and credit variances are equal and opposite in effect, which usually points to a deposit line landing in a different lane rather than a price difference.*

### Delivered after their cut-off (17 Aug 2026) — out of scope

| SO | Our docs | Date | Our GRV | Our Deb Note |
| :--- | :--- | :--- | ---: | ---: |
| 2026-08 / 134 | 6822 3686 | 18 Aug 2026 | 156,458.86 | 79,752.50 |
| 2026-08 / 174 | 6827 3690 | 21 Aug 2026 | 179,508.61 | 125,005.00 |
| 2026-08 / 184 | 6831 3692 | 25 Aug 2026 | 167,983.74 | 101,775.00 |

*Expected to be absent from their ledger. Confirm they appear on the next statement.*

### On our ledger only (no matching SO on theirs)

| SO | Date | Docs | Charge | Credit |
| :--- | :--- | :--- | ---: | ---: |
| 2026-06 / 157 | 19 Jun 2026 | 3623, 6734 | 40,930.92 | 22,425.00 |

*Ranked fuzzy candidates for these rows are in the CSV for ratification.*

### On their ledger only (no matching SO on ours)

| SO | Date | Docs | Charge | Credit |
| :--- | :--- | :--- | ---: | ---: |
| 2026-01 / 005 | 02 Jan 2026 | SI26ZA01000587 | 196,901.31 | 0.00 |
| 2026-07 / 054 | 06 Jul 2026 | SC26ZA01007492 | 0.00 | 10,867.50 |

*Ranked fuzzy candidates for these rows are in the CSV for ratification.*

### Reversed deliveries excluded from the comparison

*Our ERP cancels a delivery by raising a Deb Note that credits back its linked GRV in full. These 4 pair(s) net to zero on our side and never reach the supplier's ledger, so both legs are excluded above. Leaving them in would overstate our charges **and** our deposit credits by R899,682.74 each and read as a variance.*

| Date | Our SO | GRV | Charge | Deb Note | Credit back | Residual |
| :--- | :--- | :--- | ---: | :--- | ---: | ---: |
| 02 Apr 2026 | SON#175 | 6608 | 216,091.56 | 3543 | 216,091.56 | 0.00 |
| 02 Apr 2026 | SON018 | 6609 | 216,091.56 | 3559 | 216,091.56 | 0.00 |
| 20 May 2026 | SON#111 | 6672 | 236,879.38 | 3579 | 236,879.36 | 0.02 |
| 27 May 2026 | SON#164 | 6694 | 230,620.24 | 3593 | 230,620.24 | 0.00 |
| | | | **899,682.74** | | | **0.02** |

*The residual of R0.02 is rounding on our own reversal, not a supplier difference.*

### Deposit credits close to the full value of their GRV

*Not treated as reversals, but a deposit credit this large relative to the load is unusual and may be a partial cancellation. Worth an eye.*

| Date | Our SO | GRV | Charge | Deb Note | Credit | Credit as % of charge |
| :--- | :--- | :--- | ---: | :--- | ---: | ---: |
| 29 Jun 2026 | SON#222 | 6745 | 25,533.75 | 3631 | 24,150.00 | 94.6% |
| 31 Jul 2026 | SON291 | 6783 | 27,117.42 | 3658 | 25,875.00 | 95.4% |

### Our SO references carrying more than one GRV

*A delivery is normally one GRV plus its deposit Deb Note. 3 of our SO references still carry several GRVs, which means the reference was reused across separate loads. Their side numbers those loads individually, so the comparison above comes out as a large variance against one fragment of their ledger rather than a real difference. Resolve with a `MERGE_GROUP` decision naming their SOs. A further 3 already resolved this way and are excluded from this queue.*

| Our SO | GRVs | Our GRV numbers and amounts |
| :--- | ---: | :--- |
| 2026-06 / 141 | 2 | 6730 138,189.74 · 6737 25,533.80 |
| 2026-07 / 048 | 2 | 6751 157,964.34 · 6753 51,205.36 |
| 2026-07 / 291 | 2 | 6785 12,423.42 · 6783 27,117.42 |

### Ratification mechanics

- **Merged:** our 2026-04 / 045 now compared against their 2026-04 / 045 + 2026-04 / 051 + 2026-04 / 048
- **Merged:** our 2026-05 / 139 now compared against their 2026-05 / 139 + 2026-05 / 141
- **Merged:** our 2026-05 / 164 now compared against their 2026-05 / 164 + 2026-05 / 172

---

## 3. Payments

*Their receipts (`ARPAY` / `APPAY`) against our payment rows. Their receipts carry no SO number, so matching is on amount within R2.00 and date within 5 days.*

| Measure | Ours | Theirs |
| :--- | ---: | ---: |
| Payment rows in scope | 70 | 62 |
| Total value | 4,373,208.65 | 3,836,501.76 |
| **Variance** | **536,706.89** | |

Matched 62 of 62 of their receipts. Open on their side: 0. Open on ours: 4. Closed by ratified decision: 2. Out of scope (paid after their cut-off): 2.

### Paid after their cut-off (17 Aug 2026) — out of scope

| Date | Doc # | Type | Amount |
| :--- | :--- | :--- | ---: |
| 20 Aug 2026 | 7462 | Ud XFer | 70,840.00 |
| 21 Aug 2026 | 7463 | Bank XFer | 66,208.74 |

*Expected to be absent from their ledger. Confirm they land on the next statement.*

### Closed by ratified decision

| Date | Doc # | Amount | Decision | Note |
| :--- | :--- | ---: | :--- | :--- |
| 09 Jun 2026 | 7394 | 89,444.63 | `INTERNAL_REVERSAL` | Duplicate capture of payment 7391 and its same-day reversal (+/-89444.63 on 09 Jun, both referenced ORYX XFER:7391). Doc 7391 already matched their APP2606ZA101000429. Nets to zero, nothing owed. |
| 09 Jun 2026 | 7394 | -89,444.63 | `INTERNAL_REVERSAL` | Duplicate capture of payment 7391 and its same-day reversal (+/-89444.63 on 09 Jun, both referenced ORYX XFER:7391). Doc 7391 already matched their APP2606ZA101000429. Nets to zero, nothing owed. |

### Our payments not reflected on their ledger

| Date | Entry Type | Doc # | Reference | Amount |
| :--- | :--- | :--- | :--- | ---: |
| 05 May 2026 | Ud XFer | 7360 | ORYX ENERGY | 54,411.34 |
| 24 Jun 2026 | Ud XFer | 7405 | ORYX ENERGY | 12,617.58 |
| 03 Jul 2026 | Ud XFer | 7413 | ORYX ENERGY | 92,157.11 |
| 17 Aug 2026 | Ud XFer | 7461 | ORYX ENERGY | 61,583.86 |

---

## 4. Cylinder deposit credits

*Deposit shell credits are the largest recurring credit lane and the most common source of drift when a return is booked one-for-one on one side but not the other.*

| Measure | Ours (Deb Note) | Theirs (SACRN) |
| :--- | ---: | ---: |
| Documents | 79 | 71 |
| Total value | 7,085,564.05 | 5,883,159.26 |
| **Variance** | **1,202,404.79** | |

---

## Epistemic status (session close 2026-08-29)

> Numbers below carry §6 tags. Variances explained in prose are not reconciled until recorded in `data/supplier_ledger_decisions.csv` or reflected in a regenerated run.

| Measure | Value | Tag | Source / kill condition |
| :--- | ---: | :--- | :--- |
| Document SO groups compared | 69 | PROVEN | §2 outcome table |
| Agreed (both lanes) | 43 | PROVEN | §2 outcome table |
| Open — ours only | 1 (`2026-06 / 157`) | PROVEN | §2 open table |
| Open — theirs only | 2 (`2026-01 / 005`, `2026-07 / 054`) | PROVEN | §2 open table |
| Reversed pairs excluded (gross) | 899,682.74 | PROVEN | §2 reversed table; nets to 0.02 |
| Genuine charge variance residual | 409,676.85 | ASSERTED | `data/supplier_ledger_matches.csv` — abs sum on `SO_AMOUNT_VARIANCE` rows minus pending merge SOs 141/048/291 (R42,172.91). **Kill:** merges applied or block-affinity reclassifies SO 006/020 |
| SO 006 charge variance (reported) | 64,164.60 | ASSUMED false | Block 41 analysis: SI7355 tagged SO 006 but belongs with SO 020 block; SO 006 true gap ≈ R0.27 vs SI7119. **Kill:** block-affinity implemented and SO 006 still shows variance > R2 |
| SO 020 true charge query | 4,103.70 | ASSERTED | GRV 6643 R60,061.17 vs their SI7355 R64,164.87; deposit credits agree R37,950. **Kill:** Oryx confirms SI7355 is not our 020 load or our GRV rebooked to match |
| Rebate entitlement vs passed | 96,208.43 gap | PROVEN | §1 rebate table |
| Balance headline gap (their − \|ours\|) | 89,170.55 | PROVEN | §0; advisory only |
| Open Ud XFer payments (ours) | 220,769.89 (4 docs) | PROVEN | §3; treasury/allocation — not supplier query |

**Tripwires armed:** see `docs/handoffs/2026-08-29.md` §7.

---

## Method notes

- **SO normalisation:** SO sequences restart every month, so the key is **month + sequence**. Their `SON2607ZA105000048` carries its own month (2026-07 / 048); our `SON#128`, `SON 174`, `#0093` carry only the sequence and take the month from the row date. Bank references (`FNB-…`, `STAT …`) and 8-digit delivery dates are rejected.
- **Block-level SO:** their file is a recon working paper where blank rows separate delivery cycles. The SO appears once per block and is applied block-wide, which is how their sheet is built.
- **Document mapping:** `SAINV` → our `GRV`; `SACRN` → our `Deb Note`; `ARPAY`/`APPAY` → our payment rows; `CAFOO` is their carry-forward and is excluded.
- **Tolerance:** R2.00 on amounts, 5 days on payment dates.
- **Fuzzy candidates:** open rows carry ranked suggestions in `data/supplier_ledger_matches.csv`, read as `theirDoc@date Δamount-gap (day-gap)`. That file is **regenerated on every run** — record conclusions in `data/supplier_ledger_decisions.csv` instead, which is never overwritten.
- **Rebate tag:** their sheet carries a free-text "Rebate" tag that sometimes lands on a payment row. Only a credit note whose description matches `/volume rebate/i` is treated as a rebate credit; tagged payments stay in the payment lane.
- **Rebate basis:** `analysis/creditors/008ORY/reports/008ORY_LPG_Volume_Monthly_2025-01_to_2026-08.json`.
