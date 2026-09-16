# WES004 / WES002 — West Coast Fish & Chips
## Statement of Account — Last 3 Months Movement

**Period:** 16 June 2026 → 16 September 2026
**Compiled:** 2026-09-16
**Source:** `raw/WES002CURRENT16092026.TXT`, `raw/WES004CURRENT16092026.TXT` (fresh ERP account enquiries, ingested this session)
**Accounts:** WES002 (historical) · WES004 (current active) — same customer, two ERP codes

---

## 1. Summary

| Account | Opening Balance (as at 15 Jun 2026) | Movement | Closing Balance (as at export) |
|---|---:|---:|---:|
| WES002 | R7,443.73 | R0.00 | R7,443.73 |
| WES004 | R17,593.12 | +R4,661.02 | R22,254.14 |
| **Combined** | **R25,036.85** | **+R4,661.02** | **R29,697.87** |

Closing balances tie exactly to each account's ERP `CURRENT BALANCE` header — zero variance.

---

## 2. WES002 — No Movement

No transactions posted in this period. Balance has been unchanged since the last payment on **10 April 2026** — this account remains unresponsive to the Letter of Demand sent 15 June 2026 (deadline 29 June 2026, R7,443.73).

---

## 3. WES004 — Transaction Movement (16 Jun 2026 – 16 Sep 2026)

| Date | Doc No | Type | Reference | Amount | Balance |
|---|---|---|---|---:|---:|
| 2026-07-02 | 00051544 | Invoice | DN#22540=TOWN BUSH | 3,255.08 | 20,848.20 |
| 2026-07-02 | 00051545 | Invoice | DN#22540=EMPTY | 2,415.00 | 23,263.20 |
| 2026-07-03 | 00015167 | Crd Note | DN#22540=EMPTY | -2,415.00 | 20,848.20 |
| 2026-07-15 | 00015266 | Crd Note | DN#22577=EMPTY= | -2,415.00 | 18,433.20 |
| 2026-07-15 | 00051858 | Invoice | — | 3,255.08 | 21,688.28 |
| 2026-07-15 | 00051859 | Invoice | DN#22577=EMPTY= | 2,415.00 | 24,103.28 |
| 2026-07-20 | 00045326 | Payment | TRANSF \| STAT 128 | -5,000.00 | 19,103.28 |
| 2026-07-21 | 00051994 | Invoice | DN#22837 | 3,255.08 | 22,358.36 |
| 2026-07-29 | 00045469 | Payment | TRANSF \| STAT 128 | -5,000.00 | 17,358.36 |
| 2026-07-30 | 00052199 | Invoice | DN#23925 | 3,255.08 | 20,613.44 |
| 2026-07-30 | 00052200 | Invoice | DN#23925:EMPTY | 2,415.00 | 23,028.44 |
| 2026-07-31 | 00015359 | Crd Note | DN#23925:EMPTY | -2,415.00 | 20,613.44 |
| 2026-08-19 | 00015502 | Crd Note | DN#22885-EMPTY | -1,207.50 | 19,405.94 |
| 2026-08-19 | 00052652 | Invoice | DN#24278 | 3,096.28 | 22,502.22 |
| 2026-08-19 | 00052667 | Invoice | DN#22885 | 1,448.14 | 23,950.36 |
| 2026-08-19 | 00052668 | Invoice | DN#22885-EMPTY | 1,207.50 | 25,157.86 |
| 2026-08-27 | 00045929 | Payment | TRANSF \| STAT 129 | -2,800.00 | 22,357.86 |
| 2026-08-31 | 00015577 | Crd Note | DN#23991-EMPTY | -2,415.00 | 19,942.86 |
| 2026-08-31 | 00052881 | Invoice | DN#23991 | 2,896.28 | 22,839.14 |
| 2026-08-31 | 00052882 | Invoice | DN#23991-EMPTY | 2,415.00 | 25,254.14 |
| 2026-09-04 | 00046010 | Payment | TRANSF \| STAT 130 | -3,000.00 | 22,254.14 |

### 3.1 Movement breakdown

| Category | Count | Amount |
|---|---:|---:|
| Invoices | 12 | R31,328.52 |
| Credit Notes | 5 | -R10,867.50 |
| Payments | 4 | -R15,800.00 |
| **Net Movement** | | **+R4,661.02** |

Pattern consistent with the account's established cycle: each gas delivery invoice is typically paired with a cylinder-deposit invoice (`-EMPTY` reference), with prompt-return credit notes reversing most deposit charges same-day or within days. Payments continue on the `TRANSF | STAT nnn` EFT series (STAT 128, 129, 130), same as prior periods.

---

## 4. Reconciliation Sign-off

| Check | Result |
|---|---|
| WES004 closing balance (TXT running total) | R22,254.14 |
| WES004 ERP stated balance (header) | R22,254.14 |
| WES002 closing balance | R7,443.73 |
| WES002 ERP stated balance (header) | R7,443.73 |
| **Combined variance** | **R0.00 ✓** |

---

*Document compiled from WES002CURRENT16092026.TXT and WES004CURRENT16092026.TXT ERP account-enquiry exports. Combined collectable balance R29,697.87 confirmed by operator 2026-09-16 (see `project.json`).*
