# WO0001 — Payment-to-Invoice Allocation Report (v2)

**Turn:** WO0001-7 — Tier-5 review resolution  
**Period:** Full ledger (2016-11 → 2026-06-03) · 2026 Tier-5 focus  
**Account:** L3 Cash and Carry (WO0001)  
**Doctrine:** `SKILL_Payment_To_Invoice_Allocation.md` · LPG-primary · OTHER explicit-ref extension  
**Generated:** 2026-07-20

---

## Section 1 — Executive Summary

| Metric | Value | Tag |
| :--- | ---: | :--- |
| Allocation edges (full ledger) | 295 | PROVEN |
| 2026 Tier-5 pilot items reviewed | 6 | — |
| **Confirmed on trace** | 5 | PROVEN |
| **Operator ratification pending** | 1 (+ 4 trunc residuals) | ASSERTED |
| ERP stated balance (2026-06-03 anchor) | R110 789,36 | PROVEN |
| ERP CURRENT TXT (2026-07-01 export) | R88 768,73 | PROVEN |
| Full-ledger engine open (28 inv) | R161 214,89 | ASSERTED |
| Dashboard LPG gas debt | R92 844,18 | PROVEN |
| Allocation-lane → LPG debt gap | R68 370,71 | **DEFECT FLAG** |

> **STOP (Step 3):** Allocation-engine open pool does **not** close to dashboard LPG debt. Root cause: Tier-3 CN gate requires `CN.ref_no = invoice.doc_no`; 2026 CNs reference DN strings (e.g. CN 14595 → DN#21959, not inv 49682). Outstanding list incorrectly includes CN-voided invoices. **Do not ratify `reconState: complete` on allocation lane alone.**

---

## Section 2 — Tier-5 Disposition (2026 pilot items)

| Payment Doc | Date | STAT | Amount | v1 label | Turn-7 disposition | Confidence | review_required |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- | :---: |
| 43139 | 2026-01-26 | STAT 122 | R5 500,00 | No LPG target | **OTHER_LANE explicit ref** → Inv 48871 (DN*21657). CN 14296 voids 48869 only. Proposed override AL-P-005. | ASSERTED | yes |
| 43237 | 2026-02-06 | STAT 123 | R9 510,00 | LPG ΔR-0.36 | **TRUNCATION confirmed** → Inv 49021. Residual open R0.36. Proposed override AL-P-001. | ASSERTED | yes |
| 43323 | 2026-02-11 | STAT 123 | R9 410,00 | LPG ΔR-0.08 | **TRUNCATION confirmed** → Inv 49138. Residual open R0.08. Proposed override AL-P-002. | ASSERTED | yes |
| 43398 | 2026-02-19 | STAT 123 | R8 195,00 | LPG ΔR-0.12 | **TRUNCATION confirmed** → Inv 49213. Residual open R0.12. Proposed override AL-P-003. | ASSERTED | yes |
| 43757 | 2026-03-23 | STAT 124 | R16 628,00 | Blank ref | **CONFIRMED Tier-2 combination** → Inv 49813 (R6 664.56) + Inv 49747 (R9 963.40). ΔR0.04 rounding. v1 pilot was stale. | PROVEN | no |
| 43881 | 2026-04-03 | STAT 125 | R9 896,00 | LPG ΔR-0.53 | **TRUNCATION confirmed** → Inv 49973. Residual open R0.53. Proposed override AL-P-004. | ASSERTED | yes |

### Payment 43139 detail

| Slice | Target | Amount | Type | Notes |
| :--- | :--- | ---: | :--- | :--- |
| 48770 | LPG | R11 380,79 | OPEN_BALANCE_MATCH | Confirmed |
| 48871 | OTHER | R5 500,00 | UNALLOCATED (engine) | Engine skipped — zero LPG lines. Event net = OTHER R5 500. |
| (blank) | — | R0,21 | ROUNDING_RESIDUAL | Absorbed |

### Payment 43757 detail

| Target | Inv date | Open @ pmt | Allocated | Δ |
| :--- | :--- | ---: | ---: | ---: |
| 49813 | 2026-03-17 | R6 664,56 | R6 664,56 | R0,00 |
| 49747 | 2026-03-15 | R9 963,40 | R9 963,40 | R0,00 |
| **Total** | | R16 627,96 | R16 627,96 | **R0,04** vs bank R16 628,00 |

---

## Section 3 — Confirmed Allocations (2026 period summary)

From `WO0001_Allocation_PaymentDoc_2026.md`:

| Metric | Count | Amount |
| :--- | ---: | ---: |
| Edges in period | 24 | R168 562,81 |
| Confirmed | 23 | R163 062,81 |
| Tier-2 combination | 6 | R51 949,72 |
| Unallocated review (2026) | 1 | R5 500,00 |

---

## Section 4 — Truncation residual register (proposed)

| Invoice | Trunc residual | Source payments | Total residual |
| :--- | ---: | :--- | ---: |
| 49021 | R0,36 | 43237 | R0,36 |
| 49138 | R0,08 | 43323 | R0,08 |
| 49213 | R0,12 | 43398 | R0,12 |
| 49973 | R0,53 | 43881 | R0,53 |
| **Total** | | | **R1,09** |

Staged in `config/allocation_overrides_proposed.json` — **not ratified**.

---

## Section 5 — Unallocated / review pool (2026)

| Payment Doc | Date | Amount | Lane | Action |
| :--- | :--- | ---: | :--- | :--- |
| 43139 slice | 2026-01-26 | R5 500,00 | OTHER | Operator ratify OTHER-lane explicit ref (48871) |

All other 2026 material payments: **confirmed** (incl. 43757 combination).

---

## Section 6 — Reconciliation Bridge (2026-06-03 anchor)

| Component | Amount | Tag |
| :--- | ---: | :--- |
| ERP stated balance | R110 789,36 | PROVEN |
| └ LPG gas debt | R92 844,18 | PROVEN |
| └ Cylinder financial balance | R17 945,18 | PROVEN |
| **Two-lane sum** | **R110 789,36** | **PROVEN (ΔR0,00)** |

### Allocation-lane sub-bridge (ASSERTED — does not close)

| Component | Amount | Tag |
| :--- | ---: | :--- |
| Dashboard LPG gas debt | R92 844,18 | PROVEN |
| Allocation engine open (28 invoices) | R161 214,89 | ASSERTED |
| **Gap** | **R68 370,71** | DEFECT |
| Named defect | CN Tier-3 gate misses DN-linked CNs (e.g. 14595/49682) | — |
| Named defect | Historic OTHER-lane unallocated slices (pre-2026) | — |

---

## Section 7 — Operator decisions required

| # | Decision | Recommendation |
| :---: | :--- | :--- |
| 1 | Ratify 4 truncation overrides (AL-P-001–004) | **Approve** — ref+open align; residuals ≤R0.53 |
| 2 | Ratify OTHER-lane edge 43139→48871 (AL-P-005) | **Approve** — CN voids twin 48869 only |
| 3 | Extend Tier-3 CN gate to DN-ref pairing for 2026 | **Repo worker turn** — read-only CN map first |
| 4 | Refresh ERP TXT post-Jun-2026 | **Sources Agent** — CURRENT export shows R88 768,73 |

---

## Tripwires

- New ERP TXT slice changes closing balance (CURRENT already differs by R22 020,63 vs Jun anchor).
- Payment citing inv 49682 while CN 14595 stands.
- Operator rejection of truncation doctrine → reopen Tier-5 on 43237/43323/43398/43881.

---

*Prior report: `WO0001_Payment_Allocation_v1.md` (2026 pilot only). Edges: `data/allocation_edges.csv` (unchanged — writes gated on operator ratification).*
