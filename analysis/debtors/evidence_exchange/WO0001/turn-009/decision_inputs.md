# WO0001 Turn 9 — Operator Decision Inputs

**Generated:** 2026-07-20  
**Lane:** allocation  
**Outcome:** STOP · Residual R314.52 (tolerance ±R0.05)

---

## 1. Ratification queue (staged — not canonical)

### A. OTHER-lane overrides (7 edges · R54,310.00)

Staged in `allocation_overrides_proposed.json` and `allocation_other_edges.csv`.

| Payment | Target | Amount | Lane |
| :--- | :--- | ---: | :--- |
| 40110 | 44564 | R12,000.00 | OTHER |
| 40276 | 44977 | R12,000.00 | OTHER |
| 40452 | 45769 | R6,000.00 | OTHER |
| 41648 | 47092 | R910.00 | OTHER |
| 41963 | 44131 | R6,500.00 | OTHER |
| 41963 | 45589 | R11,400.00 | OTHER |
| 43139 | 48871 | R5,500.00 | OTHER |

**Decision:** Approve / reject / defer each OTHER-lane explicit-ref override.

### B. Truncation overrides (4 edges · R36,011.00 paid · R2.91 micro-open)

Payments 43237, 43323, 43398, 43881 — whole-Rand ERP truncation on 2026 invoices.

**Decision:** Approve truncation overrides to close R2.91 micro-open (ASSERTED, not cent-proven against ERP per invoice).

### C. CN DN-gate (Turn 8 carry · 5 offsets)

Staged in `cn_dn_gate_proposed.json`. DN-key matching for 2026 LPG credit notes.

**Decision:** Approve Tier 3b DN-gate rule and merged offsets in `cn_offsets_merged.json`.

---

## 2. Residual review (R314.52 — blocks completion)

Named drivers from statement bridge (not cent-closed):

| Driver | Estimate | Action |
| :--- | ---: | :--- |
| Inv 39895 DN-lag prepay tail | ~R2,070 | Review DN-lag credit bridge extension |
| Historic partial tails 11882/12112 | R2,760 | Confirm ERP open vs engine |
| Inv 39063 / Pmt 35691 cluster | review | Duplicate-overpay investigation |
| Inv 51007 post-anchor payment | R12,818 | Correct at portfolio anchor; paid 2026-06-18 post-anchor |

**Decision:** Do **not** set `reconState: complete` until residual ≤ ±R0.05.

---

## 3. Staleness — communications blocked

| Anchor | Amount | As-at | Source |
| :--- | ---: | :--- | :--- |
| Portfolio (allocation work) | R110,789.36 | 2026-06-03 | `dashboard_metrics.json` |
| ERP CURRENT (live) | R88,768.73 | 2026-07-01 | `erp_current_extract.txt` |
| Δ staleness | R−22,020.63 | | |

**Decision:** Any debtor communication or collection action drafted against R110,789.36 is **stale**. Regenerate against CURRENT anchor before sending.

---

## 4. Explicit non-decisions

- `allocation_edges.csv` — **unchanged** in Turn 9; do not ratify via edge mutation
- `payment_pattern_overrides.json` — empty; no approved overrides yet
- `reconState` — remains **`pending`**
