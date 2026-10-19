# Statement of Account: COFFEEBERRY-CASCADES (COF001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jan 2026 → Oct 2026 &nbsp;|&nbsp; **Account:** COF001
**Combined Opening B/F:** R-771.56 (ERP verified — source: `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` ERP running balance after the last 2025 row (doc 48423, 22 Dec 2025), COF001_CURRENT.TXT line 129)
**LPG Opening B/F (1A):** R-549.26 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R7,955.26
**Quarantine adjustment:** opening 1A excludes quarantined payment 29492 (18 Apr 2024, R-7,628.30), dated before this period; the combined opening B/F above is the ERP figure.
**Projection adjustment:** opening balances include projected invoice PROJ-INV-19.1-2025-03 (01 Mar 2025, R549.26, 1B), dated before this period; combined opening with projection R-222.30.
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-19 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`) · **Ratification scenario active**

---

## Projection Scenario (active)

**ID:** `ADM158-PROJECTION` · **Status:** PROJECTED - not posted (Linear ADM-158, assigned to the ERP agent)

Projection requested by the operator on 2026-10-19: the statement as if ADM-158 were done. Starting point: the ERP as it stands (no lane override, so 45528's S.1 line is back in 1B; the R-1,776.24 gas credit is not held aside). The ERP then posts a credit note for 45528's S.1 x5 (R-6,037.50, 1B) and an invoice for 5 x 48kg gas (R+7,267.54, 1A, at the July / 7 Aug 2025 price; ASSUMED, the ERP sets the price). Writing the R1,776.24 credit off against the R1,230.04 shortfall is an allocation, not a new document, so it does not move any balance: the gas lane simply nets the new invoice against the credit, leaving R546.20 of credit for the operator to decide. Projected posting date 19 Oct 2026 (ASSUMED). Added 2026-10-19 by the operator: an invoice for 1 x 19.1 (19kg cylinder deposit) at R549.26, dated 1 Mar 2025, also to be passed to the ERP under ADM-158. It is dated before this statement window, so it moves the opening 1B balance (+549.26) and the opening 19kg quantity (+1).

| Projected document | Date | Amount (R) | Lane | Basis |
| :--- | :--- | ---: | :--- | :--- |
| Invoice PROJ-INV-19.1-2025-03 | 2025-03-01 | 549.26 | 1B | Operator instruction 2026-10-19: invoice 1 x 19.1 (19kg cylinder deposit) @ R549.26, dated 1 Mar 2025. Price taken as incl VAT, as FINCON prints unit prices (ASSUMED). |
| Crd Note PROJ-CN-45528 | 2026-10-19 | -6,037.50 | 1B | Reverses 45528 line 2 (S.1 x5 @ R1,207.50 incl VAT), PROVEN amount from the FINCON print |
| Invoice PROJ-INV-45528 | 2026-10-19 | 7,267.54 | 1A | 5 x 48kg gas @ R1,263.92 ex VAT (price on 44729, 10 Jul 2025, and COF002 45486, 7 Aug 2025); ASSUMED price |

> **ERP variance expected:** the projected documents are not in the ERP TXT, so the combined balance differs from the ERP by **R1,779.30** until they are posted. The expected ERP variance is the sum of the projected documents (19.1 invoice R549.26 + 45528 shortfall R1,230.04 = R1,779.30). At the 25 Aug 2025 price (R7,124.02) the projected gas invoice, the shortfall and the closing 1A and combined balances would all be R143.52 lower, and the remaining credit R689.72.

---


## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jan 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`). `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **-549.26** |
| 05 Jan 2026 | Payment | 42889 | -7,264.46 | -7,813.72 |
| 07 Jan 2026 | Invoice | 48651 | 1,734.29 | -6,079.43 |
| 12 Jan 2026 | Payment | 42997 | -1,734.29 | -7,813.72 |
| 12 Jan 2026 | Invoice | 48739 | 6,757.63 | -1,056.09 |
| 12 Jan 2026 | Invoice | 48745 | 838.35 | -217.74 |
| 16 Jan 2026 | Payment | 43003 | -6,757.63 | -6,975.37 |
| 16 Jan 2026 | Payment | 43004 | -838.35 | -7,813.72 |
| 26 Jan 2026 | Invoice | 48936 | 7,054.95 | -758.77 |
| 28 Jan 2026 | Payment | 43162 | -7,054.95 | -7,813.72 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-7,813.72** |
| 11 Feb 2026 | Invoice | 49193 | 7,381.33 | -432.39 |
| 11 Feb 2026 | Invoice | 49204 | 6,960.00 | 6,527.61 |
| 18 Feb 2026 | Payment | 43374 | -7,381.33 | -853.72 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-853.72** |
| 04 Mar 2026 | Invoice | 49554 | 7,381.33 | 6,527.61 |
| 11 Mar 2026 | Payment | 43653 | -7,381.33 | -853.72 |
| 18 Mar 2026 | Invoice | 49794 | 7,432.90 | 6,579.18 |
| 24 Mar 2026 | Payment | 43758 | -7,432.90 | -853.72 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-853.72** |
| 02 Apr 2026 | Invoice | 50062 | 8,493.21 | 7,639.49 |
| 09 Apr 2026 | Payment | 43966 | -8,493.21 | -853.72 |
| 17 Apr 2026 | Invoice | 50273 | 8,206.92 | 7,353.20 |
| 21 Apr 2026 | Payment | 44067 | -8,206.92 | -853.72 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-853.72** |
| 05 May 2026 | Invoice | 50513 | 9,493.71 | 8,639.99 |
| 11 May 2026 | Payment | 44300 | -9,493.71 | -853.72 |
| 21 May 2026 | Invoice | 50808 | 9,671.37 | 8,817.65 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **8,817.65** |
| 01 Jun 2026 | Payment | 44560 | -9,671.37 | -853.72 |
| 09 Jun 2026 | Invoice | 51107 | 9,311.22 | 8,457.50 |
| 15 Jun 2026 | Payment | 44753 | -9,311.22 | -853.72 |
| 23 Jun 2026 | Invoice | 51372 | 8,683.50 | 7,829.78 |
| 29 Jun 2026 | Payment | 44968 | -8,683.50 | -853.72 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-853.72** |
| 08 Jul 2026 | Invoice | 51705 | 9,034.40 | 8,180.68 |
| 15 Jul 2026 | Payment | 45209 | -9,034.40 | -853.72 |
| 22 Jul 2026 | Invoice | 52014 | 9,349.56 | 8,495.84 |
| 31 Jul 2026 | Payment | 45480 | -9,349.56 | -853.72 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-853.72** |
| 20 Aug 2026 | Invoice | 52691 | 3,284.35 | 2,430.63 |
| 24 Aug 2026 | Payment | 45896 | -3,284.35 | -853.72 |
| 26 Aug 2026 | Crd Note | 15803 *(lane assumed)* | -3,002.83 | -3,856.55 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **-3,856.55** |
| 09 Sept 2026 | Bank XFer | 7473 | 3,002.33 | -854.22 |

---

### October 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **-854.22** |
| 19 Oct 2026 | Invoice | PROJ-INV-45528 *(projected)* | 7,267.54 | 6,413.32 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries. `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **7,955.26** |
| 08 Jan 2026 | Invoice | 48682 | 1,552.50 | 9,507.76 |
| 08 Jan 2026 | Crd Note | 14221 | -1,552.50 | 7,955.26 |
| 12 Jan 2026 | Invoice | 48740 | 6,037.50 | 13,992.76 |
| 13 Jan 2026 | Crd Note | 14252 | -6,037.50 | 7,955.26 |
| 26 Jan 2026 | Invoice | 48939 | 6,555.00 | 14,510.26 |
| 26 Jan 2026 | Crd Note | 14331 | -6,555.00 | 7,955.26 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **7,955.26** |
| 11 Feb 2026 | Invoice | 49194 | 7,072.50 | 15,027.76 |
| 11 Feb 2026 | Crd Note | 14412 | -7,072.50 | 7,955.26 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **7,955.26** |
| 04 Mar 2026 | Invoice | 49555 | 7,072.50 | 15,027.76 |
| 04 Mar 2026 | Crd Note | 14531 | -7,072.50 | 7,955.26 |
| 18 Mar 2026 | Invoice | 49795 | 7,072.50 | 15,027.76 |
| 18 Mar 2026 | Crd Note | 14613 | -7,072.50 | 7,955.26 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **7,955.26** |
| 02 Apr 2026 | Invoice | 50063 | 7,590.00 | 15,545.26 |
| 02 Apr 2026 | Crd Note | 14703 | -7,590.00 | 7,955.26 |
| 17 Apr 2026 | Invoice | 50274 | 7,072.50 | 15,027.76 |
| 19 Apr 2026 | Crd Note | 14768 | -7,072.50 | 7,955.26 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **7,955.26** |
| 05 May 2026 | Invoice | 50515 | 7,590.00 | 15,545.26 |
| 05 May 2026 | Crd Note | 14854 | -7,590.00 | 7,955.26 |
| 21 May 2026 | Invoice | 50809 | 7,590.00 | 15,545.26 |
| 21 May 2026 | Crd Note | 14939 | -7,590.00 | 7,955.26 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **7,955.26** |
| 23 Jun 2026 | Invoice | 51373 | 6,555.00 | 14,510.26 |
| 24 Jun 2026 | Crd Note | 15113 | -6,555.00 | 7,955.26 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **7,955.26** |
| 08 Jul 2026 | Invoice | 51706 | 7,072.50 | 15,027.76 |
| 09 Jul 2026 | Crd Note | 15227 | -7,072.50 | 7,955.26 |
| 22 Jul 2026 | Invoice | 52015 | 7,590.00 | 15,545.26 |
| 23 Jul 2026 | Crd Note | 15312 | -7,590.00 | 7,955.26 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **7,955.26** |
| 20 Aug 2026 | Invoice | 52750 | 1,725.00 | 9,680.26 |
| 20 Aug 2026 | Invoice | 52751 | 2,932.50 | 12,612.76 |
| 20 Aug 2026 | Crd Note | 15531 | -1,725.00 | 10,887.76 |
| 20 Aug 2026 | Crd Note | 15532 | -2,415.00 | 8,472.76 |
| 26 Aug 2026 | Crd Note | 15804 *(lane assumed)* | -15,697.50 | -7,224.74 |

---

### October 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **-7,224.74** |
| 19 Oct 2026 | Crd Note | PROJ-CN-45528 *(projected)* | -6,037.50 | -13,262.24 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 6,413.32 |
| Part 1B — CYL Deposits | -13,262.24 |
| **Combined (1A + 1B)** | **-6,848.92** |
| ERP `CURRENT BALANCE` (TXT header) | -16,256.52 |
| Less: quarantined documents held aside | -7,628.30 |
| **ERP balance excluding quarantined documents** | **-8,628.22** |
| **Variance (Combined − ERP excl. quarantine)** | **1,779.30** |

---

## Quarantined Documents (held aside)

| Date | Entry Type | Doc # | Amount (R) | Would post to | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 18 Apr 2024 | Payment | 29492 | -7,628.30 | 1A | QUARANTINED (2026-10-18) |

*Held aside from Part 1A and 1B and the running balances above, pending review (documents dated before this period are excluded from the opening balances). They remain in the ERP balance, so the bridge shows them as a reconciling line. Record: `config/quarantine.json`.*

---

## Cancelled Documents (removed from this statement)

| Date | Entry Type | Doc # | Amount (R) | Pair | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 26 Aug 2026 | Invoice | 53619 | 18,700.33 | CANCEL-2026-08-15558 | CANCELLATION PAIR - removed from statement (operator, 2026-10-19) |
| 26 Aug 2026 | Crd Note | 15558 | -18,700.33 | CANCEL-2026-08-15558 | CANCELLATION PAIR - removed from statement (operator, 2026-10-19) |

*Each pair cancels exactly (net R0.00), so it is left out of Part 1A, 1B and Part 2; the ERP balance is unchanged. Record: `config/cancellations.json`.*

---
## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF001` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 08 Jan 2026 | Invoice | 48682 | 0 | 0 | +3 | 0 | 0 |
| 08 Jan 2026 | Crd Note | 14221 | 0 | 0 | -3 | 0 | 0 |
| 12 Jan 2026 | Invoice | 48740 | 0 | 0 | 0 | +5 | 0 |
| 13 Jan 2026 | Crd Note | 14252 | 0 | 0 | 0 | -5 | 0 |
| 26 Jan 2026 | Invoice | 48939 | 0 | 0 | +1 | 0 | +5 |
| 26 Jan 2026 | Crd Note | 14331 | 0 | 0 | -1 | 0 | -5 |
| **End Jan** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 11 Feb 2026 | Invoice | 49194 | 0 | 0 | +2 | 0 | +5 |
| 11 Feb 2026 | Crd Note | 14412 | 0 | 0 | -2 | 0 | -5 |
| **End Feb** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 04 Mar 2026 | Invoice | 49555 | 0 | 0 | +2 | 0 | +5 |
| 04 Mar 2026 | Crd Note | 14531 | 0 | 0 | -2 | 0 | -5 |
| 18 Mar 2026 | Invoice | 49795 | 0 | 0 | +2 | 0 | +5 |
| 18 Mar 2026 | Crd Note | 14613 | 0 | 0 | -2 | 0 | -5 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 02 Apr 2026 | Invoice | 50063 | 0 | 0 | +3 | 0 | +5 |
| 02 Apr 2026 | Crd Note | 14703 | 0 | 0 | -3 | 0 | -5 |
| 17 Apr 2026 | Invoice | 50274 | 0 | 0 | +2 | 0 | +5 |
| 19 Apr 2026 | Crd Note | 14768 | 0 | 0 | -2 | 0 | -5 |
| **End Apr** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 05 May 2026 | Invoice | 50515 | 0 | 0 | +3 | 0 | +5 |
| 05 May 2026 | Crd Note | 14854 | 0 | 0 | -3 | 0 | -5 |
| 21 May 2026 | Invoice | 50809 | 0 | 0 | +3 | 0 | +5 |
| 21 May 2026 | Crd Note | 14939 | 0 | 0 | -3 | 0 | -5 |
| **End May** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 23 Jun 2026 | Invoice | 51373 | 0 | 0 | +1 | 0 | +5 |
| 24 Jun 2026 | Crd Note | 15113 | 0 | 0 | -1 | 0 | -5 |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 08 Jul 2026 | Invoice | 51706 | 0 | 0 | +2 | 0 | +5 |
| 09 Jul 2026 | Crd Note | 15227 | 0 | 0 | -2 | 0 | -5 |
| 22 Jul 2026 | Invoice | 52015 | 0 | 0 | +3 | 0 | +5 |
| 23 Jul 2026 | Crd Note | 15312 | 0 | 0 | -3 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **3** | **10** | **-5** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **3** | **10** | **-5** |
| 20 Aug 2026 | Invoice | 52750 | 0 | 0 | +1 | 0 | +1 |
| 20 Aug 2026 | Invoice | 52751 | 0 | 0 | +1 | 0 | +2 |
| 20 Aug 2026 | Crd Note | 15531 | 0 | 0 | -1 | 0 | -1 |
| 20 Aug 2026 | Crd Note | 15532 | 0 | 0 | 0 | 0 | -2 |
| 26 Aug 2026 | Crd Note | 15804 | 0 | 0 | -7 | 0 | -10 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **-3** | **10** | **-15** |

---

### October 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **-3** | **10** | **-15** |
| 19 Oct 2026 | Crd Note | PROJ-CN-45528 *(projected)* | 0 | 0 | 0 | 0 | -5 |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **-3** | **10** | **-20** |

---

<!-- INTERNAL_ONLY_START -->

## Review Notes (internal)

*Added by `COF001/scripts/run_v5_statement.mjs`; the tables above are shared-generator output.*

1. **PROJECTION ONLY: as if Linear ADM-158 were posted. Not a live statement.** The projected documents are listed under "Projection Scenario" at the top; the bridge variance equals their net amount until the ERP posts them. Source: `analysis/debtors/COF001/config/projection_ADM158.json`.
2. **Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line. This differs from the database view's `debt_group` for rental-only lines: 49204 (`SM CYL RENTAL`, R6,960.00, Feb 2026) has no cylinder SKU, so it sits in 1A. Under the view's grouping it would be in 1B. Please confirm.
3. **Cancellation pair CANCEL-2026-08-15558 (invoice 53619 R18,700.33 / crd note 15558 R-18,700.33) removed from this statement.** CANCELLATION PAIR - removed from statement; operator, 2026-10-19. Basis: PROVEN (ERP TXT raw/COF001_COMBINED.TXT): 53619 +18,700.33 and 15558 -18,700.33, both dated 26/08/2026, net 0.00. 15558's lines are in the database (CYL 9.1 x7 + S.1 x10 = -15,697.50; LPG S.4 x2 = -3,002.83). 53619 has no database lines; the operator rules it cancels 15558. 15558 is re-issued as 15803 (gas, -3,002.83) and 15804 (cylinder, -15,697.50), which stay on the statement. 15558's Part 2 quantities (9.1 -7, S.1 -10) leave with it. 15804 has no database lines, so its quantities are ASSUMED equal to 15558's cylinder part (same amount, R15,697.50) in data/db_snapshot_2026.json assumedDocs.cylQty; closing custody is unchanged. Reopen when: 53619's lines are ingested and do not mirror 15558 line for line. The ERP reverses 53619 or 15558 individually, or either amount changes in a later extract. 15804's lines are ingested (replace the assumed custody quantities).
4. **Documents not yet in the database (lane ASSUMED).** 15803 (Crd Note -3,002.83) and 15804 (Crd Note -15,697.50) re-issue the gas and cylinder parts of 15558 exactly, so they are routed 1A and 1B. The database has no lines for them (nor for 53619, now removed as a cancellation). Replace with database lines once ingested.
5. **Quarantined payment 29492 (2024-04-18, R-7,628.30).** Quarantined by the operator on 2026-10-18; reason not stated. Initial observation (partly superseded by the update below): ASSERTED from TXT: payment 30219 (12 Mar 2024, -7,628.30) was posted for the same amount against invoice 30276 (9 Mar 2024, 7,628.30). With 29492 also posted, the account is R7,628.28 in credit from 18 Apr 2024 until later invoices absorb it. Not confirmed as a duplicate. Held aside: excluded from Part 1A and 1B and from running balances. Still included in the ERP balance, so the bridge shows it as a reconciling line. Not treated as a cylinder-deposit payment (business_rules.md sections 3 and 4): no allocation to the cylinder ledger and no cylinder write-off. **Update 2026-10-18 (ASSERTED - database evidence (bank and ERP reconciliation tables), not confirmed against the ERP).** Payment 29492 appears to belong to COF002 (COFFEEBERRY-HILTON, bank name 'Coffeeberry Avenues'), not COF001. It was posted to COF001 against COF001 invoice 30276, which payment 30219 had already settled. Evidence: Bank credit 2024-04-18, R7,628.30, described 'Magtape Credit Coffeeberry Avenues 00031096' (bank_transactions, status MATCHED). 31096 is a COF002 invoice dated 2024-04-08 for R7,628.30. That bank credit is approved-matched (EXACT_AMOUNT_DATE) to ERP entry refDoc 00029492 (STAT:102), whose ERP description is 'MAGTAPE CREDIT COFFEEBERRY AVE'. The earlier bank credit 2024-03-12, R7,628.30, described 'Magtape Credit Coffeeberry Cascades 00030276', is the COF001 receipt that payment 30219 recorded for invoice 30276. In the database, transaction_headers shows 29492 with reference 00030276 (COF001's invoice). No payment of R7,628.30 exists on COF002, and every other COF002 invoice from 15 Feb to 15 Jun 2024 has a same-amount payment within days; 31096 does not. The 'observation' above (29492 as a second payment of the same invoice by COF001) is not supported by the bank data: the two R7,628.30 receipts came from two different payers. Not checked: COF002's ERP statement (no TXT in the repo): whether invoice 31096 is still open there, or was settled another way. Whether the ERP has since reposted or reversed 29492. The quarantine on COF001 stands as a hold-aside until the ERP reposts 29492 to COF002. COF002 would then show invoice 31096 paid. This statement is quarantine-adjusted (the item is dated before this period, so the opening 1A balance excludes it); a statement whose config does not set `quarantineFile` is not adjusted. Reopen when: The ERP reverses, refunds or reallocates payment 29492. Bank statement evidence shows only one receipt of 7,628.30 for invoice 30276, or shows 29492 belongs to another invoice. The operator rules that 29492 is a cylinder-deposit payment (business_rules.md sections 3 and 4 then apply). Payment 30219 is itself reversed or reallocated.
6. **Database coverage.** All invoices and credit notes in the window were matched to the database by document and amount (see `reports/COF001_DB_COVERAGE_2026-10-16.md`). Three documents in May 2026 are dated one day later in the database (14854, 50513, 50515).
7. **Generator run.** The shared generator was run unchanged (except as noted) against `data/db_snapshot_2026.json` (rows pulled from Supabase on 2026-10-16) because `DATABASE_URL` is not set in cloud sessions. Fixes made to the shared generator: the TXT header balance regex accepts a minus sign, so credit balances no longer read as NaN; an optional `periodEnd` limits the window and takes the closing check from the ERP running balance on the last row inside it.
8. **Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).

<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R6,413.32 |
| Cylinder Financial Balance (Part 1B close) | R-13,262.24 |
| **Total Debtor Balance** | **R-6,848.92** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 9kg | -3 | R517.50 | R-1,552.50 |
| D.1 | 10 | R1,150.00 | R11,500.00 |
| S.1 | -20 | R1,150.00 | R-23,000.00 |
| **Total** | **-13** | — | **R-13,052.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-13,262.24 | R-13,052.50 | R-209.74 |
| Sub-ledger tie (1A + 1B vs combined) | R-6,848.92 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-16,256.52  
**Quarantined documents (held aside):** R-7,628.30  
**ERP balance excluding quarantined documents:** R-8,628.22  
**Reconstructed Balance (1A + 1B):** R-6,848.92  
**Variance:** R1,779.30

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
