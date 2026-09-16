# WES004 — West Coast Fish & Chips
## Statement of Account — Last 3 Months Movement (Combined Account)

**Period:** 16 June 2026 → 16 September 2026
**Compiled:** 2026-09-16
**Source:** `raw/WES004_WES002_COMBINED16092026.TXT` — single merged ledger (built by `scripts/build_combined_ledger.mjs` from the fresh `WES002CURRENT16092026.TXT` + `WES004CURRENT16092026.TXT` ERP account enquiries)
**Accounts:** WES002 (historical, migrated ~Dec 2025) + WES004 (current active) — same customer, presented as one continuous account

---

## 1. Summary

| | Amount |
|---|---:|
| Opening balance (15 Jun 2026 close) | R25,036.85 |
| Movement this period | +R4,661.02 |
| **Closing balance (as at export)** | **R29,697.87** |

Closing balance ties exactly to the combined ERP position (WES002 R7,443.73 + WES004 R22,254.14) — zero variance. WES002's R7,443.73 contributed zero movement in this window (unchanged since 10 Apr 2026); all activity below originates on the WES004 code.

---

## 2. Transaction Movement (16 Jun 2026 – 16 Sep 2026)

| Date | Doc No | Type | Reference | Amount | Balance |
|---|---|---|---|---:|---:|
| 2026-07-02 | 00051544 | Invoice | DN#22540=TOWN BUSH | 3,255.08 | 28,291.93 |
| 2026-07-02 | 00051545 | Invoice | DN#22540=EMPTY | 2,415.00 | 30,706.93 |
| 2026-07-03 | 00015167 | Crd Note | DN#22540=EMPTY | -2,415.00 | 28,291.93 |
| 2026-07-15 | 00051858 | Invoice | — | 3,255.08 | 31,547.01 |
| 2026-07-15 | 00051859 | Invoice | DN#22577=EMPTY= | 2,415.00 | 33,962.01 |
| 2026-07-15 | 00015266 | Crd Note | DN#22577=EMPTY= | -2,415.00 | 31,547.01 |
| 2026-07-20 | 00045326 | Payment | TRANSF \| STAT 128 | -5,000.00 | 26,547.01 |
| 2026-07-21 | 00051994 | Invoice | DN#22837 | 3,255.08 | 29,802.09 |
| 2026-07-29 | 00045469 | Payment | TRANSF \| STAT 128 | -5,000.00 | 24,802.09 |
| 2026-07-30 | 00052199 | Invoice | DN#23925 | 3,255.08 | 28,057.17 |
| 2026-07-30 | 00052200 | Invoice | DN#23925:EMPTY | 2,415.00 | 30,472.17 |
| 2026-07-31 | 00015359 | Crd Note | DN#23925:EMPTY | -2,415.00 | 28,057.17 |
| 2026-08-19 | 00052652 | Invoice | DN#24278 | 3,096.28 | 31,153.45 |
| 2026-08-19 | 00052667 | Invoice | DN#22885 | 1,448.14 | 32,601.59 |
| 2026-08-19 | 00052668 | Invoice | DN#22885-EMPTY | 1,207.50 | 33,809.09 |
| 2026-08-19 | 00015502 | Crd Note | DN#22885-EMPTY | -1,207.50 | 32,601.59 |
| 2026-08-27 | 00045929 | Payment | TRANSF \| STAT 129 | -2,800.00 | 29,801.59 |
| 2026-08-31 | 00052881 | Invoice | DN#23991 | 2,896.28 | 32,697.87 |
| 2026-08-31 | 00052882 | Invoice | DN#23991-EMPTY | 2,415.00 | 35,112.87 |
| 2026-08-31 | 00015577 | Crd Note | DN#23991-EMPTY | -2,415.00 | 32,697.87 |
| 2026-09-04 | 00046010 | Payment | TRANSF \| STAT 130 | -3,000.00 | 29,697.87 |

### 2.1 Movement breakdown

| Category | Count | Amount |
|---|---:|---:|
| Invoices | 12 | R31,328.52 |
| Credit Notes | 5 | -R10,867.50 |
| Payments | 4 | -R15,800.00 |
| **Net Movement** | | **+R4,661.02** |

Pattern consistent with the account's established cycle: each gas delivery invoice is typically paired with a cylinder-deposit invoice (`-EMPTY` reference), with prompt-return credit notes reversing most deposit charges same-day or within days. Payments continue on the `TRANSF | STAT nnn` EFT series (STAT 128, 129, 130).

---

## 3. Outstanding WES002 legacy debt (no movement, carried in the balance above)

R7,443.73 (Nov–Dec 2025 invoices) remains unpaid since the last payment on **10 April 2026** — unresponsive to the Letter of Demand sent 15 June 2026 (deadline 29 June 2026). Included in the R29,697.87 closing balance above but had zero transaction activity this period.

---

## 4. Reconciliation Sign-off

| Check | Result |
|---|---:|
| Combined closing balance (merged ledger running total) | R29,697.87 |
| Combined ERP stated balance (WES002 R7,443.73 + WES004 R22,254.14) | R29,697.87 |
| **Variance** | **R0.00 ✓** |
| Doc-number collisions between WES002/WES004 | None |

---

*Document compiled from `WES004_WES002_COMBINED16092026.TXT`, itself built from WES002CURRENT16092026.TXT and WES004CURRENT16092026.TXT ERP account-enquiry exports. Combined collectable balance R29,697.87 confirmed by operator 2026-09-16 (see `project.json`). Note: the open-invoice/ageing breakdown for this account is separately gated BLOCKED by invoice-tag coverage (see `WES004_TAG_COVERAGE_2026-09-16.md`) — this movement statement is a raw transaction ledger, not an open-invoice list, and is unaffected by that gate.*
