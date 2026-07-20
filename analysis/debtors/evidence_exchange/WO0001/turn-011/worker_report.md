# WO0001 Turn 11 — Worker Report

**Lane:** `erp_freshness` · **Mode:** Read-only intake and classification  
**Objective:** Ingest operator-confirmed partial ERP export; structural header/slice decomposition; downstream stale/current classification

---

## Outcome: **STOP**

Scope validation incomplete. Live debtor communications remain **blocked**. Reconciliation closure remains **blocked**. Turn 9 historical record preserved immutably.

---

## 1. Source artifact intake

| Field | Value |
| :--- | :--- |
| Original filename | `WO0001P16TOP17.TXT` |
| Original upload path | `analysis/debtors/WO0001/data/WO0001P16TOP17.TXT` |
| Committed canonical path | `analysis/debtors/WO0001/raw/WO0001P16TOP17.TXT` |
| SHA-256 | `57199c801af6083b210fe760eb74f9bc7130a990c00b84140b922c51710ffb83` |
| Received date | 2026-07-20 |
| Operator confirmation | Fresh file uploaded; **partial P16–P17 export intentional** ("partial is fine") |
| Contents altered | **No** — byte-identical move to `raw/` |

Full intake record: `source_intake.json`

---

## 2. Turn 9 historical preservation

`evidence_exchange/WO0001/turn-009/manifest.json` restored to immutable Turn 9 evidence:

| Field | Turn 9 historical value |
| :--- | :--- |
| ERP extract | `WO001CURRENT.TXT` |
| ERP anchor | R88,768.73 @ 2026-07-01 |
| ERP status | `LATEST_IN_REPOSITORY` (gate pending at Turn 9 close) |
| Residual | R314.52 |
| Outcome | STOP |
| recon_state | pending |

Added **only** supersession pointer:

```json
"subsequently_superseded_by": {
  "file": "WO0001P16TOP17.TXT",
  "evidence_as_at": "2026-07-13",
  "recorded_in_turn": 11
}
```

Turn 9 bundle artifacts, proven identities, and allocation arithmetic are unchanged and historically reproducible.

---

## 3. Epistemic classification

| Amount | Label | Status |
| ---: | :--- | :--- |
| R56,743.98 | `ASSERTED_CURRENT_HEADER_BALANCE` | Not PROVEN as full account position |
| R20,375.35 | `ASSERTED_PERIOD_SLICE_CLOSING` | Not PROVEN as communication amount |

---

## 4. Header versus slice — structural decomposition

**Computed difference (PROVEN arithmetic):**

```text
R56,743.98 − R20,375.35 = R36,368.63
```

Full identity chain in `header_slice_decomposition.json`. Summary:

| Step | Identity | Holds |
| :---: | :--- | :---: |
| 1 | Header − slice = R36,368.63 | ✓ |
| 2 | Difference = \|UD PAY/CHEQUES\| (−36,368.63) | ✓ |
| 3 | UD header = sum of 3 Ud Paymnt rows (2023/2024) | ✓ |
| 4 | Slice close = B/F R60,329.29 + UD (−36,368.63) + period txns (−3,585.31) | ✓ |
| 5 | Header = slice close + \|UD pool\| = 20,375.35 + 36,368.63 | ✓ |

**Structural interpretation:** The ERP `CURRENT BALANCE` header field equals the **period-slice running balance after all listed rows** plus the **undeducted payment/cheque pool** (`UD PAY/CHEQUES`). The slice closing balance (R20,375.35) is the running balance after Payment 45195 on 2026-07-13; it is **not** equal to the header `CURRENT BALANCE`.

**Field label note:** `TOTAL EXCLUDING UD/CLAIMS` (R36,368.63) equals \|UD PAY/CHEQUES\|, not the slice closing balance. Do not read this field as slice close.

---

## 5. Export scope

| Attribute | Value |
| :--- | :--- |
| Periods | P16–P17 (partial) |
| B/F | R60,329.29 |
| Includes | UD payments, UD cheques, credit claims |
| Excludes | Allocation detail |
| Last transaction | Pmt 45195, 2026-07-13 |
| Supersedes (freshness) | `WO001CURRENT.TXT` (R88,768.73 @ 2026-07-01) |

The two extracts are **not directly comparable** as like-for-like balances: `WO001CURRENT.TXT` is a full CURRENT-year ledger; `WO0001P16TOP17.TXT` is a partial period slice with B/F and historical UD rows.

---

## 6. Communication gate

Live debtor communications: **`blocked_pending_scope_validation`**

Blocked until:

- [ ] Debtor account identity verified against export
- [ ] Header `CURRENT BALANCE` confirmed as full account position
- [ ] Header-versus-slice difference structurally explained ✓ (this turn)
- [ ] Post-13 July payments/credits ruled out or captured
- [ ] Debtor-facing statement regenerated from new evidence
- [ ] Statement total matches approved communication amount to the cent

Partial export confirmation does **not** unblock live communications.

---

## 7. Downstream effects (read-only)

See `downstream_effects.md` for full classification.

| Artifact | Classification |
| :--- | :--- |
| Turn 9 bundle | **CURRENT** (historical, immutable) |
| `allocation_edges.csv` | **UNAFFECTED** (unchanged) |
| Residual R314.52 | **NOT PROVEN UNAFFECTED** — requires recomputation against new ERP |
| ERP anchor (`WO001CURRENT`) | **STALE** — superseded for freshness |
| LPG/CYL partition | **STALE** — not recomputed from partial extract |
| Engine-open R101,774.13 | **UNAFFECTED** (canonical CSV basis unchanged) |
| Bridge register / Turn 10 decomposition | **UNAFFECTED** (historical Turn 9/10) |
| Proposed overrides | **UNAFFECTED** (staged, not ratified) |
| Debtor statements / comms drafts | **STALE** |

No canonical allocation files edited in this turn.

---

## 8. Next steps (operator)

1. Confirm whether R56,743.98 header balance is the authoritative full-account figure for collection.
2. If not, upload full CURRENT ledger or clarify B/F and excluded periods.
3. Recompute allocation residual and LPG open pool against validated ERP scope before any communication or ratification.
