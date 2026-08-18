# TWK002 — balance gap investigation (2026-08-11)

**Question:** The ERP CURRENT BALANCE is **R118,131.54** but the 11 open invoice lines sum to **R110,046.87**. What makes up the **R8,084.67** difference — and why does the aged balance dump it silently into the 120-day column?

**Sources:** `raw/DEBENQ_TWK002.TXT`, `config/statement_of_account.json`, `shared/scripts/debenq_open_invoices.mjs`. Reproduce: `node analysis/debtors/TWK002/scripts/decompose_balance_gap.mjs`.

---

## Headline

| Measure | R |
| :--- | ---: |
| ERP CURRENT BALANCE (TWK002) | 118,131.54 |
| Σ open invoice Due (11 lines) | 110,046.87 |
| **Unallocated balance (gap)** | **8,084.67** |
| TWK003 site adjustment (in combined Balance due) | −300.00 |
| **Statement 120-day recon adjustment** | **7,784.67** |

The aged balance **does** tie to **Balance due** (R117,831.54). It does **not** tie to the sum of open invoice Due lines because R7,784.67 of account-level debt is folded into 120-day without being named.

---

## The gap closes arithmetically in two steps

```
Σ positive invoice nets (ERP INVNO model)     129,499.52
  minus Σ open invoice Due                      −110,046.87
  = positive nets not on open list               +19,452.65

ERP CURRENT BALANCE                             118,131.54
  minus Σ positive invoice nets                 −129,499.52
  = header lower than raw positive nets          −11,367.98

Net gap (header − Σ open)                          8,084.67  ✓
```

So the R8,084.67 is not one mystery posting. It is the **net** of two opposing forces:

1. **+R19,452.65** — ERP still carries positive invoice nets that the open list deliberately excludes.
2. **−R11,367.98** — the account balance is lower than those raw positive nets because untagged settlements reduced the header without clearing invoice nets in the reconstruction.

---

## Component 1 — Override invoices removed from open list (+R8,950.44)

These invoices are **ratified paid** (`closedInvoiceOverrides`) but ERP never tagged a settling payment/CN to their `invno`, so they still carry a positive net in the ERP model:

| Inv | Date | Gross | Tagged credits | ERP net | Status |
| :--- | :--- | ---: | ---: | ---: | :--- |
| 42468 | 23 Apr 2025 | 7,713.58 | 0.00 | 7,713.58 | Paid — STAT 114 / BATCH-2025-05-31 |
| 42470 | 23 Apr 2025 | 1,236.86 | 0.00 | 1,236.86 | Paid — same batch |

**R8,950.44** gross. They are correctly **off** the customer open list but still inflate `Σ positive invoice nets`. They are **not** part of the R8,084.67 collectable gap — the customer does not owe this.

---

## Component 2 — Phantom CN-only nets (+R10,502.21)

Twelve `invno` values carry **positive net** in the ERP model even though there is **no Invoice row** for them in this export. Each is a **credit note tagged to a number that is not an open invoice**:

| Invno | ERP net (R) | Likely class |
| ---: | ---: | :--- |
| 29684 | 3,575.49 | CYL deposit / empty-return mirror |
| 22182 | 1,160.62 | CYL mirror |
| 26681 | 1,046.93 | CYL mirror |
| 32332 | 895.13 | CYL mirror |
| 31558 | 806.27 | CYL mirror |
| 23836 | 814.22 | CYL mirror |
| 33224 | 598.00 | CYL mirror |
| 35263 | 500.01 | CYL mirror |
| 25906 | 426.60 | CYL mirror |
| 24560 | 367.10 | CYL mirror |
| 23115 | 203.65 | CYL mirror |
| 33921 | 108.19 | CYL mirror |

**Total: R10,502.21.** These are ERP posting artefacts — not billable open invoices. They inflate `Σ positive invoice nets` but are never candidates for the open list (`computeOpenInvoices` requires an Invoice row).

**Check:** `Σ positive nets − phantoms − overrides = Σ open invoice Due`

```
129,499.52 − 10,502.21 − 8,950.44 = 110,046.87  ✓
```

After stripping phantoms and overrides, ERP's invoice-level model **matches the open list exactly**.

---

## Component 3 — Untagged settlements (−R50,836.20 gross credits, 17 rows)

These reduce the **account balance** but do not reduce any invoice's open due, because ERP posted them with a **blank `INVNO`**:

| Date | Doc | Entry | Ref | Amount (R) | Notes |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 28/03/2025 | 00037770 | Payment | STAT 112 | −35,693.84 | Untagged slice of STAT 112 receipt |
| 30/05/2025 | 00039080 | Payment | STAT 114 | −7,306.68 | Untagged slice — cleared 42468/42470 batch |
| 25/02/2026 | 00043500 | Payment | STAT 123 | −1,249.77 | Untagged slice of STAT 123 receipt |
| 12/07/2026 | 00000491 | Journal | (6 lines) | −3,329.12 | CYL / deposit mirror group |
| 23/07/2026 | 00000499–502 | Journal | (5 lines) | −2,521.09 | CYL / deposit mirror group |
| 09/08/2026 | 00000507 | Journal | | −112.78 | Path B discount — STAT 110 |
| 09/08/2026 | 00000508 | Journal | | −228.93 | Path B discount — STAT 112 |
| 09/08/2026 | 00000509 | Journal | | −393.99 | Path B discount — STAT 114 |

**Total untagged credits: −R50,836.20.**

Each receipt also has **tagged slices** on other rows (e.g. 00039080 also posts −R8,058.97 against inv 42050). Only the untagged portion is the problem class.

These explain why `header < Σ positive invoice nets` by **R11,367.98** — the account was reduced by settlements that the invoice netting model never absorbed.

---

## So what IS the R8,084.67?

After removing phantoms and overrides, real open invoice due per ERP tagging equals the open list:

```
Real open invoice due (ERP, adjusted)     110,046.87
ERP CURRENT BALANCE                       118,131.54
Unallocated balance                         8,084.67
```

The **R8,084.67 is account-level debt that is not represented on any of the 11 open invoice lines.** It is not the override invoices (paid). It is not the phantom CN nets (artefacts). It is the **residual running balance** after:

- **B/F carry** (R38,791.27 at export start Mar 2025) was partially settled by period activity including untagged STAT payments, but
- the **11 visible open invoices** (Feb–Jul 2026) do not re-state all debt still sitting in the account header.

In plain terms: the customer owes **R118,131.54** in total; **R110,046.87** of that is attributable to 11 named invoices; **R8,084.67** is debt the ledger shows at account level but cannot currently name to a specific invoice — almost certainly a mix of:

| Suspected source | Why |
| :--- | :--- |
| **B/F residual** | Export window starts Mar 2025 with R38,791.27 B/F. Untagged STAT 112 (−R35,693.84) and other settlements reduced it, but any remainder stays in the header without a current invoice line. |
| **Untagged settlement timing** | Payments that cleared old debt at account level without tagging left the header correct but did not create a visible invoice attribution for the residual. |
| **Partial CN tagging on open invoices** | The 11 lines already reflect tagged CNs (e.g. 50898 −R11,385; 51841 −R14,835). Any mismatch between CN posting and invoice attribution can leave a header residual. |

This is the **same failure mode** as 42468/42470, but at **account level** rather than on a specific named invoice: the total is right, the breakdown is incomplete.

---

## What to do next

### Immediate — make the statement honest

~~Do not leave R7,784.67 hidden in 120-day.~~ **Done 2026-08-11:** statement generator now shows an explicit **Account-level balance** section; aged table subtotal ties to Σ open invoices. See `TWK002_Statement_of_Account.md`.

### Investigation — name the R8,084.67

| Step | Action | Owner | Status |
| :---: | :--- | :--- | :---: |
| 1 | Build B/F → current bridge | Worker | **Done** — `reports/TWK002_Balance_Bridge_2026-08-11.md` |
| 2 | Cross-check residual against TWK002 recreated ledger / Phase 2 linkage | Worker | Optional — opening/residual line is still a net plug |
| 3 | Ratify named components into `config/statement_of_account.json` as `balanceBridgeLines` | Operator | **Done** |
| 4 | Update `generate_statement_of_account.mjs` to print bridge lines instead of silent 120-day dump | Dev | **Done** |

Regenerate after TXT refresh: `node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write`

---

## Ledger identity (sanity check)

| Component | R |
| :--- | ---: |
| BALANCE B/F | 38,791.27 |
| + Invoices raised in export | 845,581.17 |
| + Credits/payments/journals (all) | −766,240.90 |
| **= CURRENT BALANCE** | **118,131.54** |

---

## Related

- `TWK002_Stale_Open_Invoices_2026-08-11.md` — same untagged-slice failure mode on specific invoices
- `TWK002_Phase2_2025_Linkage.md` — STAT 114 / 42468 / 42470
- `business_rules.md` §3, §15 — payment tagging not authoritative; open list is a hypothesis
- `shared/scripts/debenq_open_invoices.mjs` — `reconciliation_gap` on tag coverage report = same R8,084.67
