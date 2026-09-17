# Statement of Account: CAPITOL CATERERS SELECT (PTY) (CAP000) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jan 2026 → Sept 2026 &nbsp;|&nbsp; **Account:** CAP000
**Combined Opening B/F:** R15,083.55 (ERP verified — source: `analysis/debtors/CAP000/raw/DEBENQ.TXT` DEBENQ.TXT line 191 — last running BALANCE before first 2026 row (18 Dec 2025 payment 00042697/STAT 121 close R15,083.55))
**LPG Opening B/F (1A):** R24,766.55 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R-9,683.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-17 from ERP TXT + Supabase MCP `execute_sql` (project `lpg-stock-recon`, `oqhpxnaadahohwkslive`) — no `DATABASE_URL` available this session, so DB inputs were pulled via MCP rather than the canonical script's live `pg.Client`; logic is otherwise identical to `reconcile_debtor_v5_from_txt.mjs`.

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jan 2026. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **24,766.55** |
| 21 Jan 2026 | Invoice | 48877 | 4,221.73 | 28,988.28 |
| 22 Jan 2026 | Invoice | 48898 | 1,114.07 | 30,102.35 |
| 29 Jan 2026 | Invoice | 49010 | 4,221.73 | 34,324.08 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **34,324.08** |
| 05 Feb 2026 | Payment | 43235 | -3,656.43 | 30,667.65 |
| 21 Feb 2026 | Invoice | 49358 | 4,261.58 | 34,929.23 |
| 26 Feb 2026 | Payment | 43472 | -3,367.38 | 31,561.85 |
| 26 Feb 2026 | Payment | 43472 | -560.79 | 31,001.06 |
| 26 Feb 2026 | Payment | 43472 | -565.30 | 30,435.76 |
| 26 Feb 2026 | Payment | 43472 | -1,114.07 | 29,321.69 |
| 26 Feb 2026 | Payment | 43472 | -2,835.92 | 26,485.77 |
| 26 Feb 2026 | Invoice | 49470 | 4,261.58 | 30,747.35 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **30,747.35** |
| 10 Mar 2026 | Invoice | 49655 | 566.09 | 31,313.44 |
| 13 Mar 2026 | Invoice | 49730 | 4,290.39 | 35,603.83 |
| 26 Mar 2026 | Invoice | 49935 | 4,290.39 | 39,894.22 |
| 31 Mar 2026 | Payment | 43872 | -1,385.81 | 38,508.41 |
| 31 Mar 2026 | Payment | 43872 | -4,261.58 | 34,246.83 |
| 31 Mar 2026 | Payment | 43872 | -4,261.58 | 29,985.25 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **29,985.25** |
| 19 Apr 2026 | Invoice | 50301 | 1,869.28 | 31,854.53 |
| 20 Apr 2026 | Crd Note | 14774 | -1,869.28 | 29,985.25 |
| 30 Apr 2026 | Invoice | 50443 | 4,722.39 | 34,707.64 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **34,707.64** |
| 04 May 2026 | Invoice | 50502 | 623.09 | 35,330.73 |
| 26 May 2026 | Invoice | 50875 | 4,551.00 | 39,881.73 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **39,881.73** |
| 12 Jun 2026 | Invoice | 51173 | 5,336.36 | 45,218.09 |
| 22 Jun 2026 | Invoice | 51356 | 5,336.36 | 50,554.45 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **50,554.45** |
| 07 Jul 2026 | Invoice | 51653 | 5,357.02 | 55,911.47 |
| 22 Jul 2026 | Invoice | 52003 | 5,357.02 | 61,268.49 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **61,268.49** |
| 03 Aug 2026 | Invoice | 52276 | 5,068.81 | 66,337.30 |
| 06 Aug 2026 | Invoice | 52364 | 1,337.61 | 67,674.91 |
| 13 Aug 2026 | Invoice | 52523 | 2,705.79 | 70,380.70 |
| 14 Aug 2026 | Crd Note | 15465 | -2,705.79 | 67,674.91 |
| 15 Aug 2026 | Invoice | 52588 | 4,530.61 | 72,205.52 |
| 18 Aug 2026 | Crd Note | 15490 | -984.88 | 71,220.64 |

---

### September 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **71,220.64** |
| 03 Sept 2026 | Invoice | 52933 | 4,617.82 | 75,838.46 |
| 17 Sept 2026 | Invoice | 53169 | 4,617.82 | 80,456.28 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **-9,683.00** |
| 21 Jan 2026 | Invoice | 48878 | 3,622.50 | -6,060.50 |
| 21 Jan 2026 | Crd Note | 14299 | -3,622.50 | -9,683.00 |
| 22 Jan 2026 | Invoice | 48899 | 1,380.00 | -8,303.00 |
| 22 Jan 2026 | Crd Note | 14309 | -1,380.00 | -9,683.00 |
| 29 Jan 2026 | Invoice | 49011 | 3,622.50 | -6,060.50 |
| 31 Jan 2026 | Crd Note | 14358 | -3,622.50 | -9,683.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-9,683.00** |
| 21 Feb 2026 | Invoice | 49359 | 3,622.50 | -6,060.50 |
| 23 Feb 2026 | Crd Note | 14469 | -3,622.50 | -9,683.00 |
| 26 Feb 2026 | Invoice | 49471 | 3,622.50 | -6,060.50 |
| 28 Feb 2026 | Crd Note | 14513 | -3,622.50 | -9,683.00 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-9,683.00** |
| 10 Mar 2026 | Invoice | 49656 | 690.00 | -8,993.00 |
| 10 Mar 2026 | Crd Note | 14569 | -690.00 | -9,683.00 |
| 26 Mar 2026 | Invoice | 49936 | 3,622.50 | -6,060.50 |
| 26 Mar 2026 | Crd Note | 14656 | -3,622.50 | -9,683.00 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-9,683.00** |
| 19 Apr 2026 | Invoice | 50302 | 2,070.00 | -7,613.00 |
| 20 Apr 2026 | Crd Note | 14775 | -2,070.00 | -9,683.00 |
| 30 Apr 2026 | Invoice | 50444 | 3,622.50 | -6,060.50 |
| 30 Apr 2026 | Crd Note | 14834 | -3,622.50 | -9,683.00 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-9,683.00** |
| 04 May 2026 | Invoice | 50503 | 690.00 | -8,993.00 |
| 05 May 2026 | Crd Note | 14846 | -690.00 | -9,683.00 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **-9,683.00** |
| 12 Jun 2026 | Invoice | 51174 | 3,622.50 | -6,060.50 |
| 12 Jun 2026 | Crd Note | 15053 | -3,622.50 | -9,683.00 |
| 22 Jun 2026 | Invoice | 51357 | 3,622.50 | -6,060.50 |
| 23 Jun 2026 | Crd Note | 15110 | -3,622.50 | -9,683.00 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-9,683.00** |
| 07 Jul 2026 | Invoice | 51654 | 3,622.50 | -6,060.50 |
| 07 Jul 2026 | Crd Note | 15213 | -3,622.50 | -9,683.00 |
| 22 Jul 2026 | Invoice | 52004 | 3,622.50 | -6,060.50 |
| 22 Jul 2026 | Crd Note | 15306 | -3,622.50 | -9,683.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-9,683.00** |
| 03 Aug 2026 | Invoice | 52277 | 3,622.50 | -6,060.50 |
| 03 Aug 2026 | Crd Note | 15376 | -3,622.50 | -9,683.00 |
| 06 Aug 2026 | Invoice | 52365 | 1,380.00 | -8,303.00 |
| 13 Aug 2026 | Invoice | 52523 | 690.00 | -7,613.00 |
| 13 Aug 2026 | Invoice | 52524 | 1,897.50 | -5,715.50 |
| 13 Aug 2026 | Crd Note | 15452 | -1,897.50 | -7,613.00 |
| 14 Aug 2026 | Crd Note | 15465 | -690.00 | -8,303.00 |
| 15 Aug 2026 | Invoice | 52589 | 2,415.00 | -5,888.00 |
| 18 Aug 2026 | Crd Note | 15487 | -2,415.00 | -8,303.00 |
| 18 Aug 2026 | Crd Note | 15491 | -1,380.00 | -9,683.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 80,456.28 |
| Part 1B — CYL Deposits | -9,683.00 |
| **Combined (1A + 1B)** | **70,773.28** |
| ERP `CURRENT BALANCE` (TXT header) | 70,773.28 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor CAP000` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 21 Jan 2026 | Invoice | 48878 | 0 | 0 | 0 | 0 | +3 |
| 21 Jan 2026 | Crd Note | 14299 | 0 | 0 | 0 | 0 | -3 |
| 22 Jan 2026 | Invoice | 48899 | 0 | +2 | 0 | 0 | 0 |
| 22 Jan 2026 | Crd Note | 14309 | 0 | -2 | 0 | 0 | 0 |
| 29 Jan 2026 | Invoice | 49011 | 0 | 0 | 0 | 0 | +3 |
| 31 Jan 2026 | Crd Note | 14358 | 0 | 0 | 0 | 0 | -3 |
| **End Jan** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 21 Feb 2026 | Invoice | 49359 | 0 | 0 | 0 | 0 | +3 |
| 23 Feb 2026 | Crd Note | 14469 | 0 | 0 | 0 | 0 | -3 |
| 26 Feb 2026 | Invoice | 49471 | 0 | 0 | 0 | 0 | +3 |
| 28 Feb 2026 | Crd Note | 14513 | 0 | 0 | 0 | 0 | -3 |
| **End Feb** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 10 Mar 2026 | Invoice | 49656 | 0 | +1 | 0 | 0 | 0 |
| 10 Mar 2026 | Crd Note | 14569 | 0 | -1 | 0 | 0 | 0 |
| 26 Mar 2026 | Invoice | 49936 | 0 | 0 | 0 | 0 | +3 |
| 26 Mar 2026 | Crd Note | 14656 | 0 | 0 | 0 | 0 | -3 |
| **End Mar** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 19 Apr 2026 | Invoice | 50302 | 0 | +3 | 0 | 0 | 0 |
| 20 Apr 2026 | Crd Note | 14775 | 0 | -3 | 0 | 0 | 0 |
| 30 Apr 2026 | Invoice | 50444 | 0 | 0 | 0 | 0 | +3 |
| 30 Apr 2026 | Crd Note | 14834 | 0 | 0 | 0 | 0 | -3 |
| **End Apr** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 04 May 2026 | Invoice | 50503 | 0 | +1 | 0 | 0 | 0 |
| 05 May 2026 | Crd Note | 14846 | 0 | -1 | 0 | 0 | 0 |
| **End May** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 12 Jun 2026 | Invoice | 51174 | 0 | 0 | 0 | 0 | +3 |
| 12 Jun 2026 | Crd Note | 15053 | 0 | 0 | 0 | 0 | -3 |
| 22 Jun 2026 | Invoice | 51357 | 0 | 0 | 0 | 0 | +3 |
| 23 Jun 2026 | Crd Note | 15110 | 0 | 0 | 0 | 0 | -3 |
| **End Jun** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 07 Jul 2026 | Invoice | 51654 | 0 | 0 | 0 | 0 | +3 |
| 07 Jul 2026 | Crd Note | 15213 | 0 | 0 | 0 | 0 | -3 |
| 22 Jul 2026 | Invoice | 52004 | 0 | 0 | 0 | 0 | +3 |
| 22 Jul 2026 | Crd Note | 15306 | 0 | 0 | 0 | 0 | -3 |
| **End Jul** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| 03 Aug 2026 | Invoice | 52277 | 0 | 0 | 0 | 0 | +3 |
| 03 Aug 2026 | Crd Note | 15376 | 0 | 0 | 0 | 0 | -3 |
| 06 Aug 2026 | Invoice | 52365 | 0 | +2 | 0 | 0 | 0 |
| 13 Aug 2026 | Invoice | 52523 | 0 | +1 | 0 | 0 | 0 |
| 13 Aug 2026 | Invoice | 52524 | 0 | +1 | 0 | 0 | +1 |
| 13 Aug 2026 | Crd Note | 15452 | 0 | -1 | 0 | 0 | -1 |
| 14 Aug 2026 | Crd Note | 15465 | 0 | -1 | 0 | 0 | 0 |
| 15 Aug 2026 | Invoice | 52589 | 0 | 0 | 0 | 0 | +2 |
| 18 Aug 2026 | Crd Note | 15487 | 0 | 0 | 0 | 0 | -2 |
| 18 Aug 2026 | Crd Note | 15491 | 0 | -2 | 0 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

### September 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **-8** | **-1** | **0** | **4** |
| **End Sep** | **Closing Balance** | — | **0** | **-8** | **-1** | **0** | **4** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R80,456.28 |
| Cylinder Financial Balance (Part 1B close) | R-9,683.00 |
| **Total Debtor Balance** | **R70,773.28** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg | -8 | R690.00 | R-5,520.00 |
| 9kg | -1 | R517.50 | R-517.50 |
| S.1 | 4 | R1,150.00 | R4,600.00 |
| **Total** | **-5** | — | **R-1,437.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-9,683.00 | R-1,437.50 | R-8,245.50 |
| Sub-ledger tie (1A + 1B vs combined) | R70,773.28 | — | R0.00 |

**ERP Combined Balance (TXT header):** R70,773.28
**Reconstructed Balance (1A + 1B):** R70,773.28
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
