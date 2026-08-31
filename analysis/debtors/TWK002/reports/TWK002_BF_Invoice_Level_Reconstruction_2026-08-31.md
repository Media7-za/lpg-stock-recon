# TWK002 — invoice-level reconstruction of the pre-Mar-2025 B/F (R38,791.27)

**Generated:** 2026-08-31 · `scripts/build_bf_invoice_level_match.mjs`
**Method:** remittance-authoritative doc matching. Substitutes for the missing `INVNO`
column on `raw/TWK0022024.TXT` (`EXCLUDE: ALLOCATION DETAIL`).
**Authority:** remittance advices are Tier-1 (`business_rules.md` §15 order A).

---

## 1. Window chain — PROVEN

| Window | B/F | Rows | Closing |
| :--- | ---: | ---: | ---: |
| `2024 FEBRUARY` (inception → 26 Feb 2024) | 0.00 | 78 | 87,226.46 |
| `2025 MARCH` (27 Mar 2024 → 24 Feb 2025) | 87,226.46 | 65 | **38,791.27** |

The 2023 window opens at **0.00** (account inception), so these two windows are the
complete pre-Mar-2025 universe. Chain ties exactly and requires no re-export to establish.

---

## 2. Remittance coverage of every pre-Mar-2025 charge

Charges (Invoice + Crd Note) examined: **122**

| Class | Docs | Net (R) |
| :--- | ---: | ---: |
| Named on a remittance advice | 112 | 454,343.83 |
| **Not named on any advice** | **10** | **8,854.92** |
| — of which invoices | 5 | 80,247.30 |
| — of which credit notes | 5 | -71,392.38 |
| All charges | 122 | 463,198.75 |
| ERP settlements (Payment / Bank UD / Journal) | 21 | -424,407.48 |
| **Sum of all rows = B/F** | 143 | **38,791.27** |

Remittance batches touching these charges: 18

---

## 3. Charges with no remittance evidence — and whether anything cancels them

10 charges are not named on any advice. A charge is only a collectable-debt
candidate if **nothing cancels it** — cylinder-deposit invoices are routinely reversed in
full by an empty-return credit note, so each is tested against the whole charge universe
for a counterparty of equal magnitude and opposite sign (tolerance R0.10).

| Doc | Entry | Date | Ref | Amount (R) | Cancelled by | Ref match | Counterparty on advice? |
| :--- | :--- | :--- | :--- | ---: | :--- | :---: | :---: |
| 00004917 | Crd Note | 12/05/2023 | D/N 4172 | -12,731.05 | 00019977 (Invoice) | yes | no |
| 00004918 | Crd Note | 12/05/2023 | D/N 4172 EMPTIES | -19,734.00 | 00019985 (Invoice) | yes | no |
| 00006816 | Crd Note | 14/11/2023 | QTY | -7,532.33 | 00026553 (Invoice) | amount only | no |
| 00009158 | Crd Note | 04/07/2024 | EMPTIES | -12,075.00 | 00033801 (Invoice) | amount only | yes |
| 00010723 | Crd Note | 10/10/2024 | EMPTY 10168 | -19,320.00 | 00036927 (Invoice) | yes | no |
| 00019977 | Invoice | 06/05/2023 | D/N 4172 | 12,731.05 | 00004917 (Crd Note) | yes | no |
| 00019985 | Invoice | 06/05/2023 | D/N 4172 EMPTIES | 19,734.00 | 00004918 (Crd Note) | yes | no |
| 00026553 | Invoice | 14/11/2023 | D/N 6859 | 7,532.25 | 00006816 (Crd Note) | amount only | no |
| 00034285 | Invoice | 04/07/2024 | D/N 9760 | 20,930.00 | 00009393 (Crd Note) | yes | yes |
| 00036927 | Invoice | 03/10/2024 | EMPTY 10168 | 19,320.00 | 00010723 (Crd Note) | yes | no |

| Resolution | Docs | Net (R) |
| :--- | ---: | ---: |
| Cancelled by a counterparty | 10 | 8,854.92 |
| **True orphans (collectable-debt candidates)** | **0** | **0.00** |

**Finding: zero true orphans.** Every pre-Mar-2025 charge is either named on a remittance
advice or fully reversed by a credit note. **No unidentified collectable debt is hiding
inside the R38,791.27 B/F** — the question H-028 was raised to answer.

The R8,854.92 net is a **bucketing artefact**, not a component: some
cancelling pairs straddle the matched/unmatched split (one side named on an advice, the
other not), so the same amount appears with the opposite sign inside the matched bucket.

---

## 4. What the R38,791.27 B/F actually is

| Component | R | Basis |
| :--- | ---: | :--- |
| **STAT 112 timing carry** — charges invoiced pre-window, settled 31 Mar 2025 | 35,922.77 | **PROVEN** — 8 docs on `BATCH-2025-03-31` |
| **Settlement shortfall** — ERP cash applied vs charges cleared in-window | 2,868.50 | **PROVEN** — residual of the row partition |
| **Total** | **38,791.27** | ties to B/F |

### The carry is fully extinguished in the next window

`BATCH-2025-03-31` gross payable ties exactly to the STAT 112 receipt plus its discount
journal, both of which sit in the **current** export:

```
gross payable (8 docs on advice)      35,922.77
cash receipt 00037770 (STAT 112)     -35,693.84
discount journal 00000508             -228.93
                                     ─────────
                                          0.00
```

So the `bf_carry` bridge line of **+38,791.27** is **not** an independent residual component.
Only **2,868.50** of it survives into the current account; the
other R35,922.77 is matched by in-window cash and a posted discount journal. `bf_carry` and
`stat112_untagged` are two sides of one transaction spanning the export boundary.

---

## 5. Settlement rows in the pre-Mar-2025 universe

| Doc | Entry | Date | Reference | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 00000334 | Journal | 26/10/2024 | DISCOUNT ALLOWED | -385.04 |
| 00022182 | Payment | 03/07/2023 | TWK AGRI | -46,424.87 |
| 00023115 | Payment | 26/07/2023 | TWK AGRI | -8,145.79 |
| 00023836 | Payment | 01/09/2023 | TWK AGRI | -27,738.41 |
| 00024560 | Payment | 26/09/2023 | TWK AGRI | -14,684.27 |
| 00025906 | Payment | 08/11/2023 | TWK AGRI | -17,064.38 |
| 00026681 | Payment | 29/11/2023 | TWK AGRI | -31,872.29 |
| 00029684 | Payment | 27/03/2024 | TWK AGRI | -77,692.03 |
| 00030419 | Payment | 25/04/2024 | TWK AGRI | -28,428.84 |
| 00031365 | Payment | 27/05/2024 | TWK AGRI | -11,721.10 |
| 00031558 | Payment | 26/06/2024 | TWK AGRI | -39,057.53 |
| 00032332 | Payment | 30/07/2024 | TWK AGRI | -18,061.64 |
| 00033224 | Payment | 26/08/2024 | TWK AGRI | -22,338.84 |
| 00033921 | Payment | 26/09/2024 | TWK AGRI | -2,984.27 |
| 00034518 | Payment | 26/10/2024 | DISCOUNT ALLOWED | -385.04 |
| 00034518 | Payment | 26/10/2024 | TWK AGRI PTY LTD | -38,338.45 |
| 00035263 | Payment | 10/12/2024 | TWK AGRI PTY LTD | -22,581.72 |
| 00036195 | Payment | 27/12/2024 | TWK AGRI PTY LTD | -12,104.70 |
| 00036467 | Payment | 31/01/2025 | TWK AGRI PTY LTD | -4,398.27 |
| 00037732 | Bank UD | 23/07/2024 | REV FNB APP PAYMENT FROM 00033 | 10,430.79 |
| 00037732 | Payment | 23/07/2024 | TWK AGRI PTY LTD | -10,430.79 |

---

## 6. Consequences

| Question | Answer | Tag |
| :--- | :--- | :--- |
| Does the B/F hide collectable pre-Mar-2025 debt? | **No** — zero true orphans | **PROVEN** |
| Is the `2025 MARCH` re-export (H-028) still required? | **No** — remittance doc-matching substitutes for the missing `INVNO`; re-export is now optional corroboration | **PROVEN** |
| Is `bf_carry` +38,791.27 an independent residual component? | **No** — R35,922.77 is extinguished in-window; R2,868.50 survives | **PROVEN** |
| Does this support quarantining the residual (H-027)? | **Yes on substance** — the pre-window layer is artefact, not debt. The GL-desync framing remains falsified and the seven-line exhibit remains stale | **PROVEN** / **ASSERTED** |

**Method note:** amounts here are ERP row amounts and remittance `original_amount` (both
gross). Do **not** compare them against `allocation_edges.csv` `allocated_amount`, which is
net of settlement discount — mixing the two bases manufactures phantom variances.

---

## 7. Tripwires

| Ruling | Reopens if |
| :--- | :--- |
| Zero true orphans in the pre-Mar-2025 universe | A re-exported `2025 MARCH` window shows charges absent from both TXT files, or a remittance advice is withdrawn |
| B/F carry = R35,922.77 extinguished in-window | Receipt `00037770` or journal `00000508` is reversed |
| Settlement shortfall = R2,868.50 | Any pre-window batch is re-ingested with different gross/cash figures |

---

## 8. Related

| Asset | Path |
| :--- | :--- |
| Per-doc CSV | `data/bf_invoice_level_2025mar.csv` |
| H-027 challenge | `reports/TWK002_H027_Evidence_Challenge_2026-08-31.md` |
| B/F arithmetic provenance | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` |
| Human tasks | `analysis/debtors/shared/HUMAN_TASKS.md` H-027, H-028 |
