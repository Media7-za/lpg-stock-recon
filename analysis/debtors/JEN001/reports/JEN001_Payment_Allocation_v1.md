# JEN001 — Payment Allocation v1 (Turn 2 Pilot — Stripped Gas LIFO)

**Account:** JENS SPOON PTY LTD (Spoon Eatery)
**Pilot payments:** STAT 127 (44878) + STAT 129 (45717)
**Method:** LPG-only TXT · EMPTY stripped · chronological LIFO across all STAT batches
**Generated:** 2026-08-25

---

## 1. Executive Summary

| Metric | Value |
| :--- | :--- |
| ERP CURRENT BALANCE | R22,685.21 |
| Total allocation edges | 56 |
| STAT 127 validation | PASS (R10,000.00 on 3 targets) |
| STAT 129 allocated | R15,000.00 |
| Open LPG invoices (post all payments) | 8 lines, R23,698.92 |

---

## 2. STAT 129 — 45717 (14 Aug 2026, R15,000.00)

| Target | Inv date | DN | Open before | Allocated | Type |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 52305 | 04 Aug 2026 | DN#23940 | R5,199.03 | R5,199.03 | LIFO_FULL |
| 52044 | 23 Jul 2026 | DN#22976 | R3,951.29 | R3,951.29 | LIFO_FULL |
| 51823 | 14 Jul 2026 | DN#22816 | R935.81 | R935.81 | LIFO_FULL |
| 51691 | 08 Jul 2026 | DN#22679 | R4,887.10 | R4,887.10 | LIFO_FULL |
| 51564 | 03 Jul 2026 | DN#22673 | R623.88 | R26.77 | LIFO_PARTIAL |

**Remaining open LPG (Jul–Aug 2026 window relevant to presentation):**

| Inv | Inv date | DN | Due (R) |
| :--- | :--- | :--- | ---: |
| 51564 | 03 Jul 2026 | DN#22673 | R597.11 |

---

## 3. STAT 127 — 44878 (25 Jun 2026, R10,000.00)

| Target | Inv date | DN | Open before | Allocated | Type |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 51387 | 23 Jun 2026 | DN#22914 | R3,934.93 | R3,934.93 | LIFO_FULL |
| 51155 | 11 Jun 2026 | DN#22474 | R5,692.50 | R5,692.50 | LIFO_FULL |
| 50970 | 01 Jun 2026 | DN#22452 | R3,293.25 | R372.57 | LIFO_PARTIAL |

---

## 4. Reconciliation bridge

| Component | Amount |
| :--- | ---: |
| Σ open LPG (allocation model) | R23,698.92 |
| ERP CURRENT BALANCE | R22,685.21 |
| Gap (pre-window B/F + CYL, not on open list) | R-1,013.71 |

*Expected: open list covers Jul–Aug 2026 window only; pre-Jul LPG B/F sits in account-level bridge on customer SOA.*

## 5. Artifacts

| File | Rows |
| :--- | ---: |
| `data/allocation_edges.csv` | 58 |

---

## Epistemic status (session close 2026-08-29)

| Claim | Tag | Anchor | Tripwire — reopens if |
| :--- | :--- | :--- | :--- |
| ERP CURRENT BALANCE **R22,685.21** | **PROVEN** | `raw/DEBENQ.TXT` header line 4 | Fresh DEBENQ supersedes file; header changes |
| STAT 129 allocated **R15,000.00** to 5 targets (4 full + 51564 partial) | **ASSERTED** | `data/allocation_edges.csv` AL-0054–0058; LIFO method not remittance-backed | Bank deposit contradicts targets; operator ratifies different subset |
| Presentation open invoice **R597.11** (51564) | **PROVEN** | `reports/JEN001_Statement_of_Account.md` ties to ERP header − bridge | `closedInvoiceOverrides` / `openInvoiceAdjustments` removed; DEBENQ refresh changes Jul rows |
| Account-level bridge **R22,088.10** on customer SOA | **PROVEN** | Equals DEBENQ B/F line 14 post-STAT 127; arithmetic 22685.21 − 597.11 | DEBENQ B/F line changes |
| STAT 127 validation PASS | **ASSERTED** | LIFO reproduces R10,000 on Jun pool — pattern consistency, not bank proof | Chronological replay with fresh TXT assigns different Jun targets |
| Full-history Σ open LPG **R23,698.92** vs header | **ASSUMED** | §4 bridge — deposit doc 51155 may be misclassified as LPG (no `-EMPTY` suffix) | DB line split confirms 51155 is CYL-only → re-run allocator with DB partition |

**Kill condition (ASSUMED 51155):** If `vw_clean_transactions` shows 51155 as CYL-only, remove from LPG pool and replay chronological LIFO; Jun STAT 127 edges may change but Jul–Aug presentation window should be unchanged if 51155 is pre-window for DEBENQ export.

**Collections posture:** Presentation gate `ALLOWED` with `PATTERN_ONLY` basis — **does not** satisfy Tier-1 bank confirmation (Turn 3 REQUEST). Do not treat as customer-send authority without operator decision.
