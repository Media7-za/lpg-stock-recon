# Statement of Account

**BELLA ENERGY SERVICES300 (PTY) LTD T/A GAZ EXPRESS**
50 WINSTON ROAD
PIETERMARITZBURG
3201

---

**To:** BLUFF MEAT SUPPLY(PTY) LTD
**Account:** MD0003
**Statement date:** 17 September 2026
**Ledger as at:** 15 September 2026 (`raw/Enquiry/DEBENQ_CURRENT.TXT`, refreshed 2026-09-17)

---

## Account summary

| | Amount (R) |
| :--- | ---: |
| **Balance due** | **15,309.11** |

**Balance due is PROVEN** — the ERP `CURRENT BALANCE` header, closed under identity to the raw ledger export. It is safe to quote as-is regardless of anything below.

*`MD0003_Statement_of_Account.pdf` in this folder is the 11 August 2026 snapshot and has not been regenerated (no `npx`/network access in this session) — do not send it; it predates R90,260.71 of confirmed payments above.*

---

## What changed since the 11 August 2026 statement

Five STAT batches totalling **R90,260.71** cash have posted since the last statement, closing **20 invoices**:

| STAT batch | ERP doc | Date | Amount (R) | Invoices settled | Evidence |
| :--- | :--- | :--- | ---: | :--- | :--- |
| STAT:126 | 44231 | 04/05/2026 | 15,017.78 | 49573, 49796, 49905, 50004, 50013 | `01.05.2026.pdf` — exact sum |
| STAT:127 | 44561 | 01/06/2026 | 13,014.20 | 50100, 50234, 50429 | `01.06.2026.pdf` — exact sum (see finding below) |
| STAT:128 | 44972 | 01/07/2026 | 17,311.60 | 50524, 50671, 50867, 50886 | `01.07.2026.pdf` — exact sum |
| STAT:129 | 45595 | 03/08/2026 | 14,863.43 | 50996, 50998, 51099, 51398 | `01.08.2026.pdf` — exact sum |
| STAT:130 | 46021 | 01/09/2026 | 30,053.70 | 51470, 51655, 51839, 51923, 52102, 52219, 52242 | `01.09.2026.pdf` — exact sum |

All five batch totals match the sum of their listed invoice gross amounts to the cent. Ratified in `config/statement_of_account.json` → `closedInvoiceOverrides` per `business_rules.md` §15 Order A (remittance-backed accounts).

---

## Data quality finding — flagged, not customer-facing

ERP's own payment tagging on doc **44561** (STAT:127) names invoice **50524** in its `INVNO` column for the R5,205.68 slice. The account's own remittance advice (`01.06.2026.pdf`) proves that slice actually settled invoice **50100** (same amount, invoiced 06/04/2026) — 50524 is separately and correctly settled a month later by the STAT:128 remittance. Net effect on this account's balance is nil (both invoices are genuinely paid), but taken at face value the ERP tag would have left 50100 open indefinitely. Recommended: a portfolio-wide sweep cross-checking payment `INVNO` tags against remittance advices where both exist (`lpg-recon-bug-fixer` skill, Pattern 2 methodology) — this is a mistagging, not a missing tag, so the standard "blank `INVNO`" untagged-credit check does not catch it.

---

## Unresolved — invoices dated 08 Aug – 15 Sep 2026 (gate BLOCKED)

| Inv | Date | DN / ref | Amount (R) |
| :--- | :--- | :--- | ---: |
| 52421 | 08 Aug 2026 | DN#23948-ROSEDALE | 545.77 |
| 52422 | 08 Aug 2026 | DN#23948-EMPTY (net of CN 15422) | 517.50 |
| 52542 | 14 Aug 2026 | DN#24270-VICTORIA | 3,827.91 |
| 52720 | 21 Aug 2026 | DN#24926-MKONDENI | 2,551.94 |
| 52757 | 23 Aug 2026 | DN#228976 | 2,551.94 |
| 52772 | 25 Aug 2026 | DN#22897-VICTORIA | 3,827.91 |
| 53004 | 07 Sep 2026 | DN#24826-ROSEDALE | 5,709.61 |
| 53019 | 07 Sep 2026 | DN#24972 | 4,440.15 |
| 53138 | 15 Sep 2026 | DN#24853 | 3,599.99 |
| **Sum** | | | **27,572.72** |

No STAT payment or remittance advice has posted for this window yet — the account's cadence pays each month's invoices roughly one month in arrears, so the next batch (covering August) would be expected around 01/10/2026.

Running `npm run debtors:tag-check -- --debtor MD0003` after the ratifications above still reports **BLOCKED**: Σ(open invoices) exceeds the ERP `CURRENT BALANCE` by **R12,263.61**. Per §2 of `DEBTORS_DOCTRINE.md`, that gap is mathematical proof some part of this R27,572.72 is already settled — but no remittance-backed or exact-sum evidence in hand identifies which part, so **no invoice in this table is ratified closed**. Guessing would violate `AGENTS.md` ("never invent a value to complete a table").

**Per `business_rules.md` §15 and the tag-coverage gate's own guidance: only the R15,309.11 balance total above may be quoted to this customer. This nine-invoice breakdown is internal-only — do not send it as an aged/open-invoice statement until the gate clears.**

**Tripwire:** resolves when the next remittance advice / STAT payment posts for this window, or an operator ratifies a pattern-based closure (exact-sum test, established cadence, or recorded judgement) into `config/statement_of_account.json`.

---

## Outstanding data gap

`analysis/debtors/MD0003/data/allocation_edges_2026.csv` predates this session's ratifications (e.g. it still marks STAT:126 as `UNALLOCATED`) and needs `analysis/debtors/MD0003/scripts/allocation_ingest.mjs` re-run against a live DB to catch up — not run here (no `DATABASE_URL` in this environment). Not hand-patched, per `AGENTS.md`.

See `MD0003_TAG_COVERAGE_2026-09-17.md` for the full gate detail.
