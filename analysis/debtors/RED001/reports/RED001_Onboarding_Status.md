# RED001 — Onboarding Status

**Updated:** 2026-08-29 (session close)  
**Lane:** `allocation` (invoice-linked, WO0001 family)  
**reconState:** **`validation_pending`** — see `project.json`; do not set `complete` without operator sign-off

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **RED001** |
| Trading name | **REDLANDS HOTEL** (`RED001CURRENT.TXT` `ACCOUNT:` header ✓) |
| Portfolio hint | `portfolio_candidates.csv` — **R8,245.40** aged (13 Jul 2025 snapshot — superseded by TXT) |
| Sibling accounts | None under `RED*` |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT (source) | `raw/RED001.TXT` | ✅ operator supplied |
| ERP statement TXT (canonical) | `raw/RED001CURRENT.TXT` | ✅ copied from `RED001.TXT` |
| v5 config | `config/statement_v5.json` | ✅ TXT-aligned (`combinedBf` R0.00) |
| Ingest coverage | `reports/RED001_INGEST_COVERAGE_2026-07-29.json` | ✅ `CURRENT_PARTIAL` |
| Allocation doctrine | `docs/RED001_Allocation_Doctrine_v1.md` | ✅ Turn 1 |
| Allocation edges | `data/allocation_edges.csv` | ✅ Turn 2 pilot |
| Allocation report | `reports/RED001_Payment_Allocation_v1.md` | ✅ Turn 2 pilot |
| Stripped LIFO report | `reports/RED001_Payment_Allocation_Stripped_v1.md` | ✅ Turn 2 stripped pilot |
| Stripped LIFO edges | `data/allocation_edges_stripped_pilot.csv` | ✅ Turn 2 stripped pilot |
| Overrides registry | `config/payment_pattern_overrides.json` | ✅ empty |
| v5 statement | `reports/RED001_Statement_Account_v5.md` | ✅ bridge **R0.00** (CN 13687 → Part 1B) |
| Delivery event ledger | `reports/RED001_Delivery_Event_Ledger_v1.md` | ✅ DN-by-DN ratification (TXT + line split) |
| Ratification scenario | `config/ratification_scenarios.json` | ✅ `CN13687-6CYL-NOV2025` active |
| ERP agent note | `docs/RED001_ERP_Agent_Note_CN13687.md` | ✅ Invoice correction (not debit note) |
| `project.json` | `project.json` | ✅ `validation_pending` (2026-08-29) |

---

## ERP TXT summary (`RED001CURRENT.TXT`)

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R5,559.76** |
| BALANCE B/F | R0.00 |
| Period in export | 08 May 2025 → 25 Jul 2026 |
| Period rows | 109 |
| As-at (last row) | 2026-07-25 |

---

## Payer-class gate (Turn 1 — PASS)

| Metric | Value |
| :--- | ---: |
| Payments with invoice ref (excl Alloc/Recon) | 46 / 56 rows |
| Ref-linked payment value (non-mirror) | R257,017.12 |
| **Lane ruling** | **allocation** — not JIM001 |

---

## Ingest gate (`CURRENT_PARTIAL`)

| Gap | Type | Issue |
| :--- | :--- | :--- |
| **45328** | Payment | MISSING_HEADER (21 Jul 2026) |
| **52086** | Invoice | MISSING_LINES (24 Jul 2026) |
| **15325** | Crd Note | MISSING_LINES (25 Jul 2026) |
| **15327** | Crd Note | MISSING_LINES (25 Jul 2026) |

Allocation lane ingest gate: **BLOCKED** until tail gaps resolved or ratified.

---

## Turn 2 pilot result

| Field | Value |
| :--- | :--- |
| Pilot period | **2026-04-01 → 2026-07-05** |
| Payment documents | 10 |
| Allocation edges | 11 |
| Tier 1/2 confirmed | 10 (**90.91%**) |
| Tier 5 review | 1 (payment **44288** — blank ref R5,759.98) |
| **Pilot gate** | **PASS ✅** (≥90%) |
| ERP TXT closing | **R5,559.76** |

### Turn 2 stripped-gas LIFO pilot

| Field | Value |
| :--- | :--- |
| Script | `scripts/allocation_ingest_stripped_pilot.mjs` |
| Method | LPG-only TXT · EMPTY stripped · chronological LIFO (ref_no not authority) |
| Pilot window | **2026-04-01 → 2026-07-05** (STAT 125–128) |
| Pilot payment docs | 9 |
| LIFO confirmed edges | 9 |
| Review queue | 1 (**44288** — blank ref; LIFO vs TXT hint **50580**) |
| Open LPG (LIFO model) | **R17,439.40** (4 docs) |
| LPG stripped gate | **BLOCKED** (gap vs ERP **R-11,879.64** — CYL carry + CN 13687) |
| **Pilot gate** | **PASS ✅** |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + payer-class gate | ✅ |
| 1 | ERP TXT ingest | ✅ |
| 1 | Ingest coverage check | ✅ `CURRENT_PARTIAL` |
| 1 | `Allocation_Doctrine_v1.md` | ✅ |
| 1 | v5 statement + R0.00 bridge | ✅ Part 1A **R10,389.76** · Part 1B **R-4,830.00** |
| 2 | Pilot `allocation_edges.csv` | ✅ |
| 2 | `Payment_Allocation_v1.md` | ✅ |
| 2 | `Payment_Allocation_Stripped_v1.md` | ✅ |
| 2 | Pilot gate (≥90% T1/T2) | ✅ **PASS** |
| 3 | Full allocation graph | ⏳ next |
| 4 | Overrides | ⏳ |
| 5 | Statement bridge | ⏳ pending full graph + ingest PASS |

---

## Operator review queue (Tier 5)

| Payment | Date | Amount | Issue | TXT hint |
| :--- | :--- | ---: | :--- | :--- |
| **44288** | 2026-05-12 | R5,759.98 | Blank `ref_no` on STAT 126 | Likely **50580** (DN#22374, R5,759.98, 07 May 2026) |

**DN-lag pattern (May–Jun 2025):** Early STAT batches post payment 1 calendar day before invoice date with exact ref+LPG match → `REVIEW_DN_LAG`; operator may ratify via `payment_pattern_overrides.json`.

---

## Open blockers

1. **Ingest gaps** — docs 45328, 52086, 15325, 15327 missing in Supabase.
2. **CN 13687 ratification** — scenario `CN13687-6CYL-NOV2025` **proposed**; ERP Invoice +R7,245 not posted (`docs/RED001_ERP_Agent_Note_CN13687.md`).
3. **Tier 5 payment 44288** — blank ref; likely 50580 — not in `payment_pattern_overrides.json`.
4. **Duplicate invoice 52086** — DN#22974; operator review before collections cite.
5. **reconState** — `validation_pending`; do not set `complete` until operator sign-off.

---

## Session close — epistemic position (2026-08-29)

| Metric | Value | Tag | Source |
| :--- | ---: | :--- | :--- |
| ERP combined close | **R5,559.76** | **PROVEN** | `RED001CURRENT.TXT` header |
| v5 Part 1A close | **R10,389.76** | **PROVEN** | `RED001_Statement_Account_v5.md` |
| v5 Part 1B close (ratification active) | **R2,415.00** | **ASSERTED** | Synthetic **RAT13687** +R7,245 |
| v5 combined (ratification active) | **R12,804.76** | **ASSERTED** | Variance vs ERP **+R7,245.00** |
| Open LPG invoice doc | **52086** R4,434.42 | **PROVEN** | TXT unpaid LPG line |
| Part 1A carry (not invoice) | **R5,955.34** | **ASSERTED** | R7,245 floor − R1,289.66 CN 14885 |
| Turn 2 pilot T1/T2 rate | **90.91%** (10/11) | **PROVEN** | `allocation_edges.csv` |
| Stripped LIFO open LPG | **R17,439.40** | **ASSERTED** | **Not collections authority** — BLOCKED gate |

### Closed rulings (tripwires)

| Ruling | Tripwire |
| :--- | :--- |
| **Allocation lane** (not JIM001) | **>50% ref-linked** — if future TXT drops below 50%, re-run payer-class gate |
| **CN 13687 → Part 1B** (6 cyl error) | If ERP posts different correction amount/date/lane, invalidate `activeScenarioId` and re-run v5 |
| **Ref-linked pilot primary** | If stripped LIFO cited as collections balance, **STOP** — use ERP **R5,559.76** or ratified v5 |
| **Part 1A R7,245 carry ≠ CN 13687 posting** | If operator rejects 6-cyl error assumption, clear ratification + re-route v5 |

### Assumptions (kill conditions)

| Assumption | Kill condition |
| :--- | :--- |
| **6 of 7 cylinders on CN 13687 were posting error** (operator asserted 2026-07-29) | ERP shows valid deposit for 6 units OR operator rejects scenario → remove `CN13687-6CYL-NOV2025` |
| **Nov 2025 correction was Invoice +R7,245** (not posted) | ERP posts Debit Note instead → stock/qty mismatch; revise agent note |
| **Payment 44288 → invoice 50580** | Remittance or bank ref contradicts 50580 → do not add override |

### Dead ends (do not re-litigate without new evidence)

| Path | Why abandoned |
| :--- | :--- |
| Stripped LIFO as **authoritative** open balance | Gap **R−11,879.64** vs ERP — CYL carry + CN 13687 distortion; pilot PASS for payment matching only |
| “Missing LPG invoice” on ERP | **Ruled out** — every delivery has LPG doc; issues are mis-post (CN 13687), duplicate 52086, gas-only refills |
| Treat Part 1A R7,245 as open invoice | **Wrong** — mirror via `paymentLane: LPG`; only **52086** is open LPG invoice doc |

---

## Next commands

```bash
PGSSL_REJECT_UNAUTHORIZED=false npm run debtors:ingest-check -- --debtor RED001
PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/RED001/scripts/allocation_ingest_pilot.mjs
PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/RED001/scripts/allocation_ingest_stripped_pilot.mjs
PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor RED001
```
