# MD0003 — Invoice tag coverage gate

**Generated:** 2026-09-17  
**Source:** `analysis/debtors/MD0003/raw/Enquiry/DEBENQ_CURRENT.TXT`  
**Gate:** **BLOCKED**

> The open-invoice list over-states the account, and/or lists an invoice the customer’s remittance advice says is paid. Releasing it would demand payment for settled debt. Resolve via closedInvoiceOverrides before release.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Export allocation detail | present |
| Settlement rows naming an invoice | 152 of 162 (93.8%) |
| — Crd Note rows tagged *(broadly canonical)* | 80 of 80 (100%) |
| — Payment rows tagged *(not authoritative)* | 72 of 82 (87.8%) |
| Evidence basis | **PATTERN_ONLY** |
| Open invoices assessed | 9 |
| — likely already paid | **0** |
| — stale open (marooned behind a payment gap) | 0 |
| — clear | 9 |
| Untagged credit rows | 10 |
| Untagged credit total | R-95,528.41 |
| Opening BALANCE B/F | R52,607.52 |
| Σ open invoices | R27,572.72 |
| ERP CURRENT BALANCE | R15,309.11 |
| Reconciliation gap (header − Σ open) | R-12,263.61 |
| Ratified closed (overrides) | 20 |

The two tagging rows are not equivalent. ERP tags Crd Notes to their originating invoice as a matter of course (CYL deposit / empty-return credits especially), so that percentage is meaningful evidence. ERP payment allocation is historically broken (`business_rules.md` §3) — a high payment percentage is not reassurance, and a low one is not necessarily an error. Authority over whether an invoice is settled rests with the allocation lane, never with this column.

### Checks that ran

**PATTERN_ONLY** — No extracted remittance lines for this account (data/remittance_lines_*.csv), so the remittance-contradiction check could not run. Settlement claims here rest on payment patterns, business rules and operator ratification — see business_rules.md §15, authority order B.

Concretely: the remittance-contradiction check did **not** run on this account, so a clean result below rests on arithmetic (the invariant) and an anomaly heuristic (staleness) alone. Neither can detect a settled invoice whose credit was untagged *and* whose absence does not break the account total. Establishing settlement here requires the pattern route — exact-sum month tests, the account’s established payment cadence, the business rules for that payer type, and operator ratification recorded in config.

---

## Invariant

**Σ(open invoices) ≤ ERP CURRENT BALANCE** — **BREACHED**

The itemised list totals **R12,263.61 more** than the account actually owes, which is proof that at least one listed invoice is settled in whole or part. Treat this as a lower bound: understatement elsewhere can mask most of the true error.

---

## Open invoices by risk

| Inv | Date | DN / ref | Due (R) | Risk | Basis |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 52421 | 08 Aug 2026 | DN#23948- ROSEDALE | 545.77 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52422 | 08 Aug 2026 | DN#23948-EMPTY | 517.50 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52542 | 14 Aug 2026 | DN#24270 - VICTORIA | 3,827.91 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52720 | 21 Aug 2026 | DN#24926-MKONDENI | 2,551.94 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52757 | 23 Aug 2026 | DN#228976 | 2,551.94 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52772 | 25 Aug 2026 | DN#22897- VICTORIA | 3,827.91 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 53004 | 07 Sept 2026 | DN#24826- ROSEDALE | 5,709.61 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 53019 | 07 Sept 2026 | DN#24972 | 4,440.15 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 53138 | 15 Sept 2026 | DN#24853 | 3,599.99 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |

---

## Untagged credit rows

These reduce the account balance but name no invoice — the reason the open-invoice list is a hypothesis rather than a fact.

| Doc | Entry | Date | Ref | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 00044785 | Payment | 02 Oct 2023 | TRANSF | STAT: 96 | -12,838.37 |
| 00037143 | Payment | 03 Feb 2025 | TRANSF | STAT:112 | -44.74 |
| 00037144 | Payment | 03 Feb 2025 | TRANSF | STAT:112 | -889.56 |
| 00042051 | Payment | 01 Nov 2025 | TRANSF | STAT:121 | -469.87 |
| 00042440 | Payment | 28 Nov 2025 | TRANSF | STAT:121 | -1,787.18 |
| 00042440 | Payment | 28 Nov 2025 | TRANSF | STAT:121 | -2,252.18 |
| 00044231 | Payment | 04 May 2026 | TRANSF | STAT:126 | -15,017.78 |
| 00044972 | Payment | 01 Jul 2026 | TRANSF | STAT:128 | -17,311.60 |
| 00045595 | Payment | 03 Aug 2026 | TRANSF | STAT:129 | -14,863.43 |
| 00046021 | Payment | 01 Sept 2026 | TRANSF | STAT:130 | -30,053.70 |

---

## Ratified closed invoices (excluded from open list)

| Doc | Reason |
| :--- | :--- |
| 49573 | Paid via STAT:126 (ERP doc 44231, 04/05/2026). Remittance 01.05.2026.pdf batch total R15,017.78 = exact sum of 49573+49796+49905+50004+50013. |
| 49796 | Paid via STAT:126 (ERP doc 44231, 04/05/2026). Remittance 01.05.2026.pdf batch total R15,017.78 = exact sum of 49573+49796+49905+50004+50013. |
| 49905 | Paid via STAT:126 (ERP doc 44231, 04/05/2026). Remittance 01.05.2026.pdf batch total R15,017.78 = exact sum of 49573+49796+49905+50004+50013. |
| 50004 | Paid via STAT:126 (ERP doc 44231, 04/05/2026). Remittance 01.05.2026.pdf batch total R15,017.78 = exact sum of 49573+49796+49905+50004+50013. |
| 50013 | Paid via STAT:126 (ERP doc 44231, 04/05/2026). Remittance 01.05.2026.pdf batch total R15,017.78 = exact sum of 49573+49796+49905+50004+50013. |
| 50100 | Paid via STAT:127 (ERP doc 44561, 01/06/2026). Remittance 01.06.2026.pdf names 50100 (R5,205.68) + 50234 + 50429 = R13,014.20 exact. ERP's own INVNO tagging on this payment mis-tagged the R5,205.68 slice as doc 50524 instead of 50100 — advice outranks ERP tagging (business_rules.md §15 Order A step 1 > step 4). Flagged for portfolio-wide mistag sweep, not just this account. |
| 50671 | Paid via STAT:128 (ERP doc 44972, 01/07/2026). Remittance 01.07.2026.pdf names 50524+50671+50867+50886 = R17,311.60 exact. 50524 already excluded from the open list by ERP's (mistagged, see doc 50100 override) INVNO tag on STAT:127 — not double-closed here. |
| 50867 | Paid via STAT:128 (ERP doc 44972, 01/07/2026). Remittance 01.07.2026.pdf names 50524+50671+50867+50886 = R17,311.60 exact. |
| 50886 | Paid via STAT:128 (ERP doc 44972, 01/07/2026). Remittance 01.07.2026.pdf names 50524+50671+50867+50886 = R17,311.60 exact. |
| 50996 | Paid via STAT:129 (ERP doc 45595, 03/08/2026). Remittance 01.08.2026.pdf names 50996+50998+51099+51398 = R14,863.43 exact. See MD0003_Remittance_Payment_45595.md. |
| 50998 | Paid via STAT:129 (ERP doc 45595, 03/08/2026). Remittance 01.08.2026.pdf names 50996+50998+51099+51398 = R14,863.43 exact. See MD0003_Remittance_Payment_45595.md. |
| 51099 | Paid via STAT:129 (ERP doc 45595, 03/08/2026). Remittance 01.08.2026.pdf names 50996+50998+51099+51398 = R14,863.43 exact. See MD0003_Remittance_Payment_45595.md. |
| 51398 | Paid via STAT:129 (ERP doc 45595, 03/08/2026). Remittance 01.08.2026.pdf names 50996+50998+51099+51398 = R14,863.43 exact. See MD0003_Remittance_Payment_45595.md. |
| 51470 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 51655 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 51839 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 51923 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 52102 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 52219 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |
| 52242 | Paid via STAT:130 (ERP doc 46021, 01/09/2026). Remittance 01.09.2026.pdf names 51470+51655+51839+51923+52102+52219+52242 = R30,053.70 exact. See MD0003_Remittance_Payment_46021.md. |

---

## What to do

The itemised list exceeds what the account owes, so settled debt is being carried as open. Identify which invoices the untagged credits cleared and ratify them into closedInvoiceOverrides. Route depends on what the account has: remittance-by-remittance where advices exist, otherwise the pattern route (exact-sum month tests, established payment cadence, operator ratification) per business_rules.md §15 authority order B. Until then the open-invoice list must not go to the customer; the ERP balance total is still safe to quote.

Until resolved, do **not** send an open-invoice list or statement to this customer. The ERP CURRENT BALANCE total remains valid and safe to quote.
