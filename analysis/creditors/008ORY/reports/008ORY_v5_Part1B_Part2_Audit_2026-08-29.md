# 008ORY — v5 Part 1B vs Part 2 Audit

**Generated:** 2026-08-29  
**Account:** 008ORY — ORYX ENERGY (linked 007ORY)  
**Statement:** `reports/008ORY_Statement_Account_v5.md` (regenerated 2026-08-17)  
**Verdict:** **Part 1B and Part 2 are genuinely inconsistent** — statement correctly surfaces variance; custody **not signed off**.

---

## Summary

| Lane | Closing | Tag | Source |
| :--- | ---: | :--- | :--- |
| Part 1B — CYL deposit financial | **R0.01** | **PROVEN** — running ledger in v5 | `008ORY_Statement_Account_v5.md` §Part 1B |
| Part 2 — custody exposure (qty × rate) | **R−45,195.00** | **ASSERTED** — qty from DB lines; rates from config | Creditor Position Summary §2 |
| **1B vs custody variance** | **R45,195.01** | **PROVEN** — arithmetic in summary §3 | Same report |

Part 1A + Part 1B → TXT line export (**R−121,237.70**) and ERP header bridge (**R0.00** adjusted variance) **tie correctly**. The defect is **deposit financial (1B) ≠ physical custody (Part 2)**, not ERP header math.

---

## Root causes (ranked)

### 1. Dual source of truth under partial ingest

| Part | Authority | When ingest partial |
| :--- | :--- | :--- |
| **1B** | ERP TXT **headers** + `GRVNO` pairing fallback | Full deposit amounts from header pairing |
| **Part 2** | DB **`vw_clean_transactions` CYL lines** | Only rows where CYL lines exist |

**PROVEN:** `008ORY_INGEST_COVERAGE_2026-08-17.json` — **74/74** Jul–Aug 2026 docs `MISSING_HEADER`; gate `custody=BLOCKED`.

### 2. Doc **3659** — LPG deb note forced into Part 1B

| Field | Value | Tag |
| :--- | :--- | :--- |
| TXT header | Deb Note **3659** → GRVNO **6783**, **R1,242.43** | **PROVEN** — `008ORYCURRENT.TXT` |
| DB lines | **LPG only** (9.4 × 50 = R162.06) — no CYL | **PROVEN** — `vw_clean_transactions` |
| Part 1B | Full **R1,242.43** to deposit ledger | **PROVEN** — generator TXT pairing rule |
| Part 2 | **No row** for 3659 | **PROVEN** — no CYL lines |

**Generator defect (ASSERTED):** `splitTxtGrvPairing` routes all Deb Notes with `GRVNO` to Part 1B without checking DB line class.

### 3. Doc **6783** — header pairing vs sparse CYL lines

| | Part 1B (TXT pairing) | Part 2 (DB CYL) |
| :--- | ---: | :--- |
| GRV **6783** | **−R27,117.42** (full header to CYL) | 9.1 **−50** shells only |
| Deb **3658** | +R25,875.00 | 9.1 **+50** |
| Deb **3659** | +R1,242.43 | *(none)* |

**~R23.7k** of Part 1B movement has no Part 2 qty counterpart beyond the 50-shell swap on 9.1.

### 4. Within-pair SKU mix mismatch (financial nets; qty accumulates)

Examples where Part 1B pair nets **~R0** but Part 2 retains shell imbalance:

| Pair | Issue | Part 2 residual |
| :--- | :--- | :--- |
| **6811 / 3678** | Deb credits D.1/S.1 mix ≠ GRV charge | +10 D.1, −10 S.1 |
| **6798 / 3670** | Deb 3670 credits 44×9.1 vs GRV 6798 −100×9.1 | **−56** on 9.1 |

---

## Tripwires

| Ruling | Reopens if |
| :--- | :--- |
| Part 1B close **R0.01** treated as deposit ledger truth | Jul–Aug headers ingested and DB line split replaces TXT pairing |
| Part 2 custody blocked | Ingest gate → `CURRENT_COMPLETE` and custody **ALLOWED** |
| Variance **R45,195.01** accepted as known | Generator fixed for 3659 routing + pairing reconciled to DB lines |

**Kill conditions (ASSUMED):**

| Assumption | Kill condition |
| :--- | :--- |
| ASSUMED: variance is ingest/pairing artefact only | After header ingest, 1B vs custody variance still **> R1.00** without doc-level exceptions |
| ASSUMED: 3659 is deposit not LPG | DB reclassifies 3659 to CYL lines matching R1,242.43 |

---

## Recommended actions

| Priority | Action | Owner |
| :---: | :--- | :--- |
| 1 | Ingest Jul–Aug **008ORY/007ORY** transaction headers (clear 74× `MISSING_HEADER`) | Sources Agent |
| 2 | Fix `reconcile_creditor_v5_from_txt.mjs`: Deb Note with `GRVNO` → Part 1B **only if** DB CYL lines exist (else LPG/header split) | Repo agent |
| 3 | Pair audit **6798↔3670**, **6811↔3678** in ERP | Operator / finance |
| 4 | Do **not** use Part 2 custody conclusions until gate **ALLOWED** | Operator |

---

## Related artifacts

| Path | Role |
| :--- | :--- |
| `config/statement_v5.json` | v5 config |
| `reports/008ORY_INGEST_COVERAGE_2026-08-17.md` | Ingest gate |
| `shared/scripts/reconcile_creditor_v5_from_txt.mjs` | Generator (`splitTxtGrvPairing`, `buildPart2`) |
