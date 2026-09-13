# FIR001 — Presentation layer (v5 operator → customer SOA)

**Pattern:** JEN001 two-layer (`reports/JEN001_Presentation_Layer_Test.md`)  
**As-at:** 2026-09-05  
**Status:** customer SOA generated — gate **REVIEW_REQUIRED** / **PATTERN_ONLY** (not sent)

---

## Two artifacts

| Layer | File | Audience | Contents |
| :--- | :--- | :--- | :--- |
| **Operator** | `FIR001_Statement_Account_v5.md` | Internal recon | Part 1A LPG, Part 1B CYL, bridge R0.00, Part 2 custody (blocked) |
| **Presentation** | `FIR001_Statement_of_Account.md` (+ `.pdf`) | Customer / collections | Balance due, 1 open LPG invoice, collapsed opening |
| **Allocation** | `FIR001_STAT_Payment_FIFO_2026-09-05.md` | Internal audit | STAT 128/129 FIFO closes feeding `closedInvoiceOverrides` |

Do **not** email the v5 composed sub-ledger. Same dead end as JEN001.

---

## v5 → customer mapping (PROVEN)

Source: `reports/FIR001_Statement_Account_v5.md` bridge + Part 1A Sep close.

| v5 component | Customer SOA | Amount (R) |
| :--- | :--- | ---: |
| Part 1A remaining LPG (inv **52962**, DN#24820, 5 Sep 2026) | Open invoices | 7,606.09 |
| Combined B/F R597.43 + Part 1B close R517.50 | Collapsed opening (not itemised) | 1,114.93 |
| Combined 1A + 1B = ERP `CURRENT BALANCE` | **Balance due** | **8,721.02** |
| Part 1 variance | — | **0.00** |

Identity: `7,606.09 + 1,114.93 = 8,721.02`.

Part 1B cylinder residual (inv 52737 / CN 15535) stays on **v5 only**. Customer document does not name that pair — JEN001 collapsed B/F the same way.

---

## Presentation output

| Field | Value |
| :--- | ---: |
| ERP / v5 balance due | **R8,721.02** |
| Open LPG invoices | **R7,606.09** (inv 52962) |
| Account-level (collapsed) | **R1,114.93** |
| Gate | **REVIEW_REQUIRED** · `PATTERN_ONLY` |

STAT 128/129 FIFO cleared every earlier Part 1A LPG invoice; v5 running balance returns to B/F R597.43 after each STAT. LIFO is rejected (would leave inv 51530 open).

---

## Config

| File | Role |
| :--- | :--- |
| `config/statement_v5.json` | Operator sub-ledger |
| `config/statement_of_account.json` | Presentation: `lpg_stripped`, `collapseAccountLevelAsOpeningBalance`, FIFO `closedInvoiceOverrides` |

Regenerate:

```bash
npm run debtors:customer-statement -- --debtor FIR001 --as-at 2026-09-05 --pdf
npm run debtors:customer-statement -- --debtor FIR001 --as-at 2026-09-05 --snapshot --pdf
```

Send record: `snapshots/2026-09-05_v2/` (v1 itemised CYL on the customer doc — **superseded** presentation).

---

## Tripwires

| Closed ruling | Reopens if |
| :--- | :--- |
| Open inv 52962 R7,606.09 from v5 Part 1A | Fresh TXT posts a payment; v5 regenerated with a different 1A close |
| Collapsed opening R1,114.93 | v5 Part 1B close changes; B/F line restated |
| v5 internal / SOA presentation split | v5 composed emailed as customer document |
| Snapshot `2026-09-05_v1` | Must not be sent — itemised CYL residual on customer face |
