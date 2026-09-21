# Statement of Account

**BLUFF MEAT SUPPLY(PTY) LTD**
Account: MD0003
Period: **1 January 2026 to 15 September 2026**

---

## Amount due

| | Amount |
| :--- | ---: |
| **Balance due (as at 15 September 2026)** | **R 15,309.11** |

Please remit payment at your earliest convenience. If you have made a recent payment not yet reflected below, contact us with your remittance advice.

---

## Summary

| Item | Detail |
| :--- | :--- |
| **Amount due** | **R 15,309.11** |
| Last payment | **1 Sep 2026** — R 30,053.70 (settled the outstanding June delivery plus the full July billing month) |

---

## Open Invoices

| Invoice | Date | DN / Reference | Amount (R) |
| :--- | :--- | :--- | ---: |
| 52421 | 08 Aug 2026 | DN#23948-ROSEDALE | 545.77 |
| 52422 | 08 Aug 2026 | DN#23948-EMPTY (net of credit note) | 517.50 |
| 52542 | 14 Aug 2026 | DN#24270-VICTORIA | 3,827.91 |
| 52720 | 21 Aug 2026 | DN#24926-MKONDENI | 2,551.94 |
| 52757 | 23 Aug 2026 | DN#228976 | 2,551.94 |
| 52772 | 25 Aug 2026 | DN#22897-VICTORIA | 3,827.91 |
| 53004 | 07 Sep 2026 | DN#24826-ROSEDALE | 5,709.61 |
| 53019 | 07 Sep 2026 | DN#24972 | 4,440.15 |
| 53138 | 15 Sep 2026 | DN#24853 | 3,599.99 |
| **Total open invoices** | | | **27,572.72** |

---

## Queries

If any line does not match your records, please send your remittance advice or AP ledger to **accounts** so we can align allocations promptly.

---

*GAZ EXPRESS · Customer statement · Generated 21 September 2026*

---

> **⚠ INTERNAL DOCUMENT — DO NOT SEND TO THE CUSTOMER AS-IS.** Per operator request, an "Open Invoices" section has been added above listing the 9 currently-open 2026 invoices, totalling **R27,572.72**. This does **not** reconcile with the **Amount due (R15,309.11)** stated at the top of this same statement — a **R12,263.61 gap**, currently under active investigation (`MD0003_Lifetime_Balance_Investigation_2026-09-17.md` §Addendum, `MD0003_TAG_COVERAGE_2026-09-21.md`, `MD0003_2026_Open_Invoices_Working.md`).
>
> This account's `debtors:tag-check` gate is `BLOCKED` for exactly this reason (`OPEN_LIST_OVERSTATES_ACCOUNT`). Per `business_rules.md` §15: *"the open-invoice list must not go to the customer; the ERP balance total is still safe to quote"* until the gate clears. Sending this document as it now stands would show the customer two different, unreconciled totals on one statement — worse than sending neither. The **R15,309.11 balance-due figure remains PROVEN and safe on its own** (verified against the raw TXT running balance with zero divergence — see the full activity ledger in git history of this file, or regenerate via the account activity section removed in this revision); it is only the **Open Invoices section that is not yet safe to release**. Strip that section (or wait for the gap to close) before this goes out.
