# TWK002 — Invoice tag coverage gate

**Generated:** 2026-08-11  
**Source:** `analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT`  
**Gate:** **ALLOWED**

> Open-invoice list ties within the ERP balance and shows no marooned invoices. Safe for customer-facing use.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Export allocation detail | present |
| Settlement rows naming an invoice | 76 of 95 (80%) |
| Open invoices assessed | 11 |
| — likely already paid | **0** |
| — stale open (marooned behind a payment gap) | 0 |
| — clear | 11 |
| Untagged credit rows | 17 |
| Untagged credit total | R-50,836.20 |
| Opening BALANCE B/F | R38,791.27 |
| Σ open invoices | R110,046.87 |
| ERP CURRENT BALANCE | R118,131.54 |
| Reconciliation gap (header − Σ open) | R8,084.67 |
| Ratified closed (overrides) | 2 |

---

## Invariant

**Σ(open invoices) ≤ ERP CURRENT BALANCE** — PASS

The itemised list does not exceed the ERP balance, so it is not over-stating the account in aggregate. This does not prove every individual line is correct — offsetting errors can still net out.

---

## Open invoices by risk

| Inv | Date | DN / ref | Due (R) | Risk | Basis |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 49208 | 12 Feb 2026 | DN#21535 | 13,468.47 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49606 | 06 Mar 2026 | DN#21950 | 8,277.21 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49882 | 24 Mar 2026 | DN-21976 | 8,858.97 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50099 | 06 Apr 2026 | DN-22046 | 9,010.16 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50439 | 29 Apr 2026 | DN-21880 | 5,300.12 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50680 | 14 May 2026 | DN#22709 | 7,245.45 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50898 | 27 May 2026 | DN#22761 | 8,947.95 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51226 | 15 Jun 2026 | DN#22904 | 12,471.98 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51496 | 01 Jul 2026 | DN#22534 | 12,471.98 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51841 | 15 Jul 2026 | DN#22576 | 9,607.49 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52241 | 31 Jul 2026 | DN#24229 | 14,387.09 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |

---

## Untagged credit rows

These reduce the account balance but name no invoice — the reason the open-invoice list is a hypothesis rather than a fact.

| Doc | Entry | Date | Ref | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 00037770 | Payment | 28 Mar 2025 | TRANSF | STAT 112 | -35,693.84 |
| 00039080 | Payment | 30 May 2025 | TRANSF | STAT 114 | -7,306.68 |
| 00043500 | Payment | 25 Feb 2026 | TRANSF | STAT 123 | -1,249.77 |
| 00000491 | Journal | 12 Jul 2026 |  | -203.65 |
| 00000491 | Journal | 12 Jul 2026 |  | -367.10 |
| 00000491 | Journal | 12 Jul 2026 |  | -426.60 |
| 00000491 | Journal | 12 Jul 2026 |  | -469.22 |
| 00000491 | Journal | 12 Jul 2026 |  | -701.93 |
| 00000491 | Journal | 12 Jul 2026 |  | -1,160.62 |
| 00000499 | Journal | 23 Jul 2026 |  | -375.10 |
| 00000499 | Journal | 23 Jul 2026 |  | -552.04 |
| 00000500 | Journal | 23 Jul 2026 |  | -300.54 |
| 00000501 | Journal | 23 Jul 2026 |  | -983.04 |
| 00000502 | Journal | 23 Jul 2026 |  | -310.37 |
| 00000507 | Journal | 09 Aug 2026 |  | -112.78 |
| 00000508 | Journal | 09 Aug 2026 |  | -228.93 |
| 00000509 | Journal | 09 Aug 2026 |  | -393.99 |

---

## Ratified closed invoices (excluded from open list)

| Doc | Reason |
| :--- | :--- |
| 42468 | Paid via STAT 114 / BATCH-2025-05-31 remittance (31.05.2025.pdf), receipt 00039080 (30/05/2025). ERP never tagged a CN/payment row to this invno (untagged payment slice); Path B discount journal 00000509 (-R393.99) already posted for the batch on 2026-08-09. See TWK002_Phase2_2025_Linkage.md. |
| 42470 | Paid via STAT 114 / BATCH-2025-05-31 remittance (31.05.2025.pdf), receipt 00039080 (30/05/2025). Same untagged-payment cause as invoice 42468 — see reason there. |

---

## What to do

No action. The list ties within the ERP balance and no open invoice is marooned behind a payment gap.
