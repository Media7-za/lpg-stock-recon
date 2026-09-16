# WES004 — Invoice tag coverage gate

**Generated:** 2026-09-16  
**Source:** `analysis/debtors/WES004/raw/WES004CURRENT16092026.TXT`  
**Gate:** **BLOCKED**

> The open-invoice list over-states the account, and/or lists an invoice the customer’s remittance advice says is paid. Releasing it would demand payment for settled debt. Resolve via closedInvoiceOverrides before release.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Export allocation detail | present |
| Settlement rows naming an invoice | 44 of 54 (81.5%) |
| — Crd Note rows tagged *(broadly canonical)* | 25 of 25 (100%) |
| — Payment rows tagged *(not authoritative)* | 19 of 29 (65.5%) |
| Evidence basis | **PATTERN_ONLY** |
| Open invoices assessed | 26 |
| — likely already paid | **0** |
| — stale open (marooned behind a payment gap) | 0 |
| — clear | 26 |
| Untagged credit rows | 10 |
| Untagged credit total | R-35,978.00 |
| Opening BALANCE B/F | R0.00 |
| Σ open invoices | R58,232.14 |
| ERP CURRENT BALANCE | R22,254.14 |
| Reconciliation gap (header − Σ open) | R-35,978.00 |
| Ratified closed (overrides) | 0 |

The two tagging rows are not equivalent. ERP tags Crd Notes to their originating invoice as a matter of course (CYL deposit / empty-return credits especially), so that percentage is meaningful evidence. ERP payment allocation is historically broken (`business_rules.md` §3) — a high payment percentage is not reassurance, and a low one is not necessarily an error. Authority over whether an invoice is settled rests with the allocation lane, never with this column.

### Checks that ran

**PATTERN_ONLY** — No extracted remittance lines for this account (data/remittance_lines_*.csv), so the remittance-contradiction check could not run. Settlement claims here rest on payment patterns, business rules and operator ratification — see business_rules.md §15, authority order B.

Concretely: the remittance-contradiction check did **not** run on this account, so a clean result below rests on arithmetic (the invariant) and an anomaly heuristic (staleness) alone. Neither can detect a settled invoice whose credit was untagged *and* whose absence does not break the account total. Establishing settlement here requires the pattern route — exact-sum month tests, the account’s established payment cadence, the business rules for that payer type, and operator ratification recorded in config.

---

## Invariant

**Σ(open invoices) ≤ ERP CURRENT BALANCE** — **BREACHED**

The itemised list totals **R35,978.00 more** than the account actually owes, which is proof that at least one listed invoice is settled in whole or part. Treat this as a lower bound: understatement elsewhere can mask most of the true error.

---

## Open invoices by risk

| Inv | Date | DN / ref | Due (R) | Risk | Basis |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 48580 | 31 Dec 2025 | DN#21444 | 89.92 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 48754 | 13 Jan 2026 | DN-21634 | 1,890.00 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49024 | 30 Jan 2026 | D/N 20997 | 1,875.00 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49025 | 30 Jan 2026 | D/N 20998 HILTON | 1,875.00 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49036 | 31 Jan 2026 | DN#21233 | 1,320.00 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49038 | 31 Jan 2026 | DN#21234- TOWNBUSH | 2,640.01 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49075 | 03 Feb 2026 | DN-21675 | 1,750.00 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49819 | 18 Mar 2026 | DN-21974 | 1,329.60 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49891 | 24 Mar 2026 | DN-22151-HILTON | 1,329.60 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 49896 | 24 Mar 2026 | DN-22154-TOWNBUSH | 1,329.60 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50225 | 14 Apr 2026 | DN-22169.-TOWNBUSH | 2,947.20 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50238 | 15 Apr 2026 | DN-22319-HILTON | 1,473.60 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50484 | 02 May 2026 | DN#22362- TOWNBUSH | 2,947.20 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50689 | 15 May 2026 | DN#22712- | 1,685.41 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50700 | 15 May 2026 | DN#22422- TOWNBUSH | 3,370.81 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50873 | 26 May 2026 | DN#2243- TOWNBUSH | 3,370.81 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 50874 | 26 May 2026 | DN#22434-HILTON | 1,685.41 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51164 | 11 Jun 2026 | DN#22639 | 3,241.30 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51241 | 15 Jun 2026 | DN# 22503 | 1,620.65 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51544 | 02 Jul 2026 | DN#22540=TOWN BUSH | 3,255.08 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51858 | 15 Jul 2026 |  | 3,255.08 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 51994 | 21 Jul 2026 | DN#22837 | 3,255.08 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52199 | 30 Jul 2026 | DN#23925 | 3,255.08 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52652 | 19 Aug 2026 | DN#24278 | 3,096.28 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52667 | 19 Aug 2026 | DN#22885 | 1,448.14 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |
| 52881 | 31 Aug 2026 | DN#23991 | 2,896.28 | CLEAR | Postdates the last long payment gap; consistent with the account’s live debt cluster. |

---

## Untagged credit rows

These reduce the account balance but name no invoice — the reason the open-invoice list is a hypothesis rather than a fact.

| Doc | Entry | Date | Ref | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 00000444 | Journal | 03 Feb 2026 |  | -600.00 |
| 00043750 | Payment | 23 Mar 2026 | TRANSF | STAT 124 | -1,320.00 |
| 00043953 | Payment | 10 Apr 2026 | TRANSF | STAT 125 | -2,658.00 |
| 00044313 | Payment | 14 May 2026 | TRANSF | STAT 126 | -2,800.00 |
| 00044684 | Payment | 10 Jun 2026 | TRANSF | STAT 127 | -2,800.00 |
| 00044679 | Payment | 15 Jun 2026 | CASH | T2000422 | -10,000.00 |
| 00045326 | Payment | 20 Jul 2026 | TRANSF | STAT 128 | -5,000.00 |
| 00045469 | Payment | 29 Jul 2026 | TRANSF | STAT 128 | -5,000.00 |
| 00045929 | Payment | 27 Aug 2026 | TRANSF | STAT 129 | -2,800.00 |
| 00046010 | Payment | 04 Sept 2026 | TRANSF | STAT 130 | -3,000.00 |

---

## What to do

The itemised list exceeds what the account owes, so settled debt is being carried as open. Identify which invoices the untagged credits cleared and ratify them into closedInvoiceOverrides. Route depends on what the account has: remittance-by-remittance where advices exist, otherwise the pattern route (exact-sum month tests, established payment cadence, operator ratification) per business_rules.md §15 authority order B. Until then the open-invoice list must not go to the customer; the ERP balance total is still safe to quote.

Until resolved, do **not** send an open-invoice list or statement to this customer. The ERP CURRENT BALANCE total remains valid and safe to quote.
