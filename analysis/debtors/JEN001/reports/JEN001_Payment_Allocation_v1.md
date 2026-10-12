# JEN001 — Payment Allocation v1 (Turn 2 Pilot — Stripped Gas LIFO)

**Account:** JENS SPOON PTY LTD (Spoon Eatery)
**Pilot payments:** STAT 127 (44878) + STAT 129 (45717)
**Method:** LPG-only TXT · EMPTY stripped · chronological LIFO across all STAT batches
**Generated:** 2026-09-12

---

## 1. Executive Summary

| Metric | Value |
| :--- | :--- |
| ERP CURRENT BALANCE | R22,685.21 |
| Total allocation edges | 57 |
| STAT 127 validation | PASS (R10,000.00 on 3 targets) |
| STAT 129 allocated | R15,000.00 |
| Open LPG invoices (post all payments) | 10 lines, R29,047.32 |

---

## 2. STAT 129 — 45717 (14 Aug 2026, R15,000.00)

| Target | Inv date | DN | Open before | Allocated | Type |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 52305 | 04 Aug 2026 | DN#23940 | R5,199.03 | R5,199.03 | LIFO_FULL |
| 52044 | 23 Jul 2026 | DN#22976 | R3,951.29 | R3,951.29 | LIFO_FULL |
| 51823 | 14 Jul 2026 | DN#22816 | R935.81 | R935.81 | LIFO_FULL |
| 51691 | 08 Jul 2026 | DN#22679 | R4,887.10 | R4,887.10 | LIFO_FULL |
| 51669 | 07 Jul 2026 | DN#22679 | R4,887.10 | R26.77 | LIFO_PARTIAL |

**Remaining open LPG (Jul–Aug 2026 window relevant to presentation):**

| Inv | Inv date | DN | Due (R) |
| :--- | :--- | :--- | ---: |
| 51564 | 03 Jul 2026 | DN#22673 | R623.88 |
| 51669 | 07 Jul 2026 | DN#22679 | R4,860.33 |

---

## 3. STAT 127 — 44878 (25 Jun 2026, R10,000.00)

| Target | Inv date | DN | Open before | Allocated | Type |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 51387 | 23 Jun 2026 | DN#22914 | R3,934.93 | R3,934.93 | LIFO_FULL |
| 51154 | 11 Jun 2026 | DN#22474 | R4,866.88 | R4,866.88 | LIFO_FULL |
| 50970 | 01 Jun 2026 | DN#22452 | R3,293.25 | R1,198.19 | LIFO_PARTIAL |

---

## 4. Reconciliation bridge

| Component | Amount |
| :--- | ---: |
| Σ open LPG (allocation model) | R29,047.32 |
| ERP CURRENT BALANCE | R22,685.21 |
| Gap (pre-window B/F + CYL, not on open list) | R-6,362.11 |

*Expected: open list covers Jul–Aug 2026 window only; pre-Jul LPG B/F sits in account-level bridge on customer SOA.*

## 5. Artifacts

| File | Rows |
| :--- | ---: |
| `data/allocation_edges.csv` | 58 |
