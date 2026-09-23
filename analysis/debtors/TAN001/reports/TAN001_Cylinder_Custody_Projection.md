# TAN001 — Cylinder custody projection (Part 2 collapsed)

**Account:** TAN001 — Tanya Lehman  
**As-at:** 31 Jul 2026 (Part 2 closing balance)  
**Scope:** Physical cylinder custody only — collapsed from `TAN001_Statement_Account_v5.md` Part 2  
**Opening source:** `config/statement_v5.json` → `cylOpeningQty`  
**Classification:** **PROVEN** (qty conservation from DB line items via v5 generator; ingest gate custody **ALLOWED** per v5 statement)

> Financial settlement and cylinder return are separate ledgers. This projection does not prove financial settlement.

---

## Opening balance (1 Jan 2026)

Per `config/statement_v5.json`:

| SKU | Label | Opening qty |
| :--- | :--- | ---: |
| 14.1 | 14kg | 0 |
| 19.1 | 19kg | **-3** |
| 9.1 | 9kg | **13** |
| D.1 | 48kg DV | **2** |
| S.1 | 48kg SV | **-9** |

---

## Monthly closing balances (collapsed)

| Month | 14kg | 19kg | 9kg | D.1 | S.1 | Net month Δ (units) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Opening** | 0 | -3 | 13 | 2 | -9 | — |
| Jan 2026 | 0 | -3 | 14 | 2 | -8 | +2 |
| Feb 2026 | 0 | -4 | 13 | 2 | -5 | -1 |
| Mar 2026 | 0 | -4 | 15 | 3 | -7 | +4 |
| Apr 2026 | 0 | -4 | 12 | 2 | -4 | -3 |
| May 2026 | 0 | -4 | 13 | 2 | -4 | +1 |
| Jun 2026 | 0 | -4 | 13 | 2 | -4 | 0 |
| **Jul 2026 (close)** | **0** | **-4** | **13** | **2** | **-4** | **0** |

**Period net change (opening → close):** 14kg 0 · 19kg -1 · 9kg 0 · D.1 0 · S.1 +5

---

## Closing custody position (31 Jul 2026)

| SKU | Label | Net returnable qty | Deposit rate | Custody exposure |
| :--- | :--- | ---: | ---: | ---: |
| 19.1 | 19kg | **-4** | R690.00 | R-2,760.00 |
| 9.1 | 9kg | **13** | R517.50 | R6,727.50 |
| D.1 | 48kg DV | **2** | R1,150.00 | R2,300.00 |
| S.1 | 48kg SV | **-4** | R1,150.00 | R-4,600.00 |
| **Total** | **7 units** | | | **R1,667.50** |

**Reading:** Positive qty = cylinders owed by customer. Negative qty = customer holds fewer than ledger expects (short/over-return position).

---

## Custody vs financial (cross-check)

| Check | Financial (Part 1B) | Custody (Part 2) | Variance |
| :--- | ---: | ---: | ---: |
| Cylinder position | R-862.50 | R1,667.50 | **R-2,530.00** |

Variance **ASSERTED** — legacy deposit rate shifts and price variations (see `TAN001_BASELINE_v4.md`). Not resolved in this projection.

---

## Evidence chain

| Artifact | Path | Role |
| :--- | :--- | :--- |
| Full Part 2 ledger | `reports/TAN001_Statement_Account_v5.md` § Part 2 | Line-level qty movements |
| Opening qty config | `config/statement_v5.json` | B/F per SKU |
| Deposit rates | `config/statement_v5.json` → `skuRates` | Exposure calculation |
| Ingest gate | `reports/TAN001_INGEST_COVERAGE_2026-07-30.md` | Custody **ALLOWED** |

---

## Operator actions (if any)

| Item | Status |
| :--- | :--- |
| Physical yard count vs ledger | **UNPROVEN** — no yard audit on file |
| Resolve R-2,530.00 financial/custody variance | **OPEN** — operator decision |
| Negative 19kg / S.1 positions | Review with customer — may indicate over-return or mis-posted empties |
