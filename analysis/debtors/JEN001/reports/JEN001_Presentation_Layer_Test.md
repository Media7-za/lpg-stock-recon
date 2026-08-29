# JEN001 — Presentation Layer Test (2026-08-25)

**Hypothesis:** v5 is the operator sub-ledger; the default presentation layer is open invoices only (`customer.soa`).

**Status:** ✅ **PASS** — Turn 2 allocation complete, gate ALLOWED.

---

## Two artifacts

| Layer | File | Audience | Contents |
| :--- | :--- | :--- | :--- |
| **Operator** | `JEN001_Statement_Account_v5.md` | Internal recon | Part 1A/1B, bridge, Part 2 custody, position summary |
| **Presentation** | `JEN001_Statement_of_Account.md` (+ `.pdf`) | Customer / collections | Balance due, 1 open LPG invoice, collapsed B/F |
| **Allocation** | `JEN001_Payment_Allocation_v1.md` | Internal audit | STAT 127 + STAT 129 LIFO edges |

---

## Presentation output (post Turn 2 allocation)

| Field | Value |
| :--- | ---: |
| ERP balance due | **R22,685.21** |
| Open LPG invoices | **R597.11** (inv 51564 partial) |
| Account-level (collapsed B/F) | **R22,088.10** |
| Gate | **ALLOWED** (PATTERN_ONLY) |

### Open invoice

| Inv | Date | DN | Due (R) |
| :--- | :--- | :--- | ---: |
| 51564 | 03 Jul 2026 | DN#22673 | 597.11 |

STAT 129 cleared 51691, 51823, 52044, 52305 in full; 51564 partial (R26.77 of R623.88).

---

## STAT 129 allocation (45717 · R15,000 · 14 Aug 2026)

| Target | Allocated | Type |
| :--- | ---: | :--- |
| 52305 | R5,199.03 | LIFO_FULL |
| 52044 | R3,951.29 | LIFO_FULL |
| 51823 | R935.81 | LIFO_FULL |
| 51691 | R4,887.10 | LIFO_FULL |
| 51564 | R26.77 | LIFO_PARTIAL → **R597.11 open** |

Method: chronological LIFO across all STAT batches (validated on STAT 127 first).

---

## Ratified config

| File | Change |
| :--- | :--- |
| `config/statement_of_account.json` | `closedInvoiceOverrides` (4 docs), `openInvoiceAdjustments` (51564), `allocationGate: RATIFIED` |
| `config/payment_pattern_overrides.json` | STAT 127 + STAT 129 approved overrides |
| `data/allocation_edges.csv` | 58 edges (full history) |

Regenerate:
```bash
node analysis/debtors/JEN001/scripts/allocation_ingest_pilot.mjs
npm run debtors:customer-statement -- --debtor JEN001 --as-at 2026-08-25 --pdf
```

---

## Verdict

The two-layer model is proven on JEN001:

1. **v5** = operator position proof (internal).
2. **Presentation** = 1 open invoice + B/F bridge (customer-ready at PATTERN_ONLY basis).
3. **Allocation** feeds presentation via `closedInvoiceOverrides` + `openInvoiceAdjustments`.

**Caveat:** No remittance advices — ALLOWED rests on LIFO pattern + invariant only. Bank deposit confirmation for STAT 129 still on REQUEST list (Turn 1 gap).
