# WO0001 Turn 11 — Downstream Effects (Read-Only)

**Basis:** New ERP extract `WO0001P16TOP17.TXT` ingested @ 2026-07-13 (partial P16–P17).  
**Prior freshness anchor:** `WO001CURRENT.TXT` @ 2026-07-01 (R88,768.73).  
**Allocation anchor (Turn 9/10):** Portfolio 2026-06-03 — unchanged.

Classification key: **CURRENT** = still valid for its stated purpose · **STALE** = invalidated by new evidence · **UNAFFECTED** = not dependent on superseded ERP anchor · **NOT PROVEN UNAFFECTED** = may change; recomputation required.

---

## ERP and anchors

| Item | Prior value | New extract | Classification | Notes |
| :--- | ---: | ---: | :--- | :--- |
| ERP freshness file | WO001CURRENT.TXT | WO0001P16TOP17.TXT | **STALE → SUPERSEDED** | Freshness pointer moves to new file |
| Header CURRENT BALANCE | R88,768.73 | R56,743.98 | **STALE** (prior) / **ASSERTED** (new) | Not like-for-like — different export scope |
| Slice closing | n/a (full ledger) | R20,375.35 | **ASSERTED** | Period-scoped only |
| Portfolio anchor | R110,789.36 @ 2026-06-03 | — | **UNAFFECTED** | Turn 9/10 allocation basis |
| ERP account identity | WO0001 - L3 CASH AND CARRY | Same | **CURRENT** | Account code unchanged |

---

## Partition and allocation engine

| Item | Value | Classification | Notes |
| :--- | ---: | :--- | :--- |
| LPG dashboard debt | R92,844.18 | **UNAFFECTED** | `dashboard_metrics.json` unchanged |
| CYL component | R17,945.18 | **UNAFFECTED** | Portfolio partition unchanged |
| Engine-open sum | R101,774.13 | **UNAFFECTED** | `allocation_edges.csv` unchanged |
| Adjusted engine-open | R93,158.70 | **UNAFFECTED** | Turn 10 register unchanged |
| **Residual R314.52** | R314.52 | **NOT PROVEN UNAFFECTED** | Turn 10 value valid at portfolio anchor; new partial ERP does not prove residual unchanged. Recomputation deferred pending scope validation. |
| `allocation_edges.csv` | unchanged since Turn 7 | **UNAFFECTED** | No edits this turn |
| Bridge credits R8,615.43 | Turn 9/10 | **UNAFFECTED** | Historical bridge arithmetic |
| Gap before bridge R8,929.95 | Turn 9/10 | **UNAFFECTED** | Historical |

---

## Open documents, credits, payments

| Item | Classification | Notes |
| :--- | :--- | :--- |
| Open document pool (23 invoices) | **STALE for ERP cross-check** | Turn 10 register from CSV; not revalidated against partial TXT |
| Post-2026-07-01 activity in new extract | **REQUIRES REVIEW** | New extract shows P16–P17 activity through 2026-07-13; 12 days beyond WO001CURRENT last txn (2026-07-01) |
| Post-2026-07-13 payments/credits | **UNKNOWN** | Not in extract; must be ruled out before comms |
| Ud Paymnt rows (2023/2024) | **IN SCOPE of new extract** | R36,368.63 pool explains header/slice gap |
| Payment allocation status | **UNAFFECTED** | Canonical edges unchanged |

---

## Overrides and ratification

| Item | Classification | Notes |
| :--- | :--- | :--- |
| `allocation_overrides_proposed.json` | **UNAFFECTED** | Staged; not ratified |
| `cn_dn_gate_proposed.json` | **UNAFFECTED** | Turn 8 carry; pending |
| Balance-dependent ratification | **BLOCKED** | `balance_dependent_ratification: blocked` |

---

## Statements and communications

| Item | Classification | Notes |
| :--- | :--- | :--- |
| `WO0001_Statement_Bridge_v3.md` | **STALE** | Anchored to Turn 9 portfolio/ERP context |
| `WO0001_Statement_Bridge_v2.md` | **STALE** | Pre-Turn 9 |
| Any debtor-facing statement | **STALE** | Must regenerate from validated ERP scope |
| Drafted collection communications | **STALE + BLOCKED** | Gate: `blocked_pending_scope_validation` |
| Decision board / `decision_inputs.md` | **STALE** | Turn 9 queue; ERP freshness items supersede |

---

## Evidence Exchange bundles

| Bundle | Classification | Notes |
| :--- | :--- | :--- |
| turn-009 | **CURRENT (historical)** | Immutable Turn 9 record; supersession note only |
| turn-011 | **CURRENT** | This intake turn |

---

## Summary

- **0** canonical allocation or override files modified.
- **1** new raw source committed (`raw/WO0001P16TOP17.TXT`).
- Residual **R314.52 must not be assumed unchanged** — recomputation blocked until ERP scope is validated.
- All live communications and balance-dependent ratification remain blocked.
