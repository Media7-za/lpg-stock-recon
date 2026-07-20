# MOZ002 — Onboarding Status

**Account:** MOZ002 — MOZAMBIK  
**reconState:** `complete` (closed 2026-07-20)  
**Lane:** Payment-to-invoice allocation (LPG-only)

---

## Turn 7 chain (7a–7j) — summary

| Turn | Focus | Outcome |
| :--- | :--- | :--- |
| **7a–7c** | Ghost closures, 44227 trace, 49143/49550 | 43640→49550 locked (EX-0037); 44227 stays unallocated pending |
| **7d–7f** | Bridge sign fix, CYL movement v1 | Doc-level empty lane −R1,207.50 surfaced |
| **7g** | JOIN-bug ruling, three-basis custody, registry v10 | Method accepted; v10 declined (conservation fail) |
| **7h** | Four-lane decomposition, invariant check | Doc-level phantom diagnosed; v10.1 INVARIANT FAIL |
| **7i** | Line-level lanes, shell-line hunt | LPG R181,398.05 / empty R0.00; invariant **PASS**; v10.2 staged |
| **7j** | Ratifications, reconState complete | Registry v10.2 live; 44227 VERIFIED_UNALLOCATED; skill fix |

---

## Closing basis (2026-07-20)

| Check | Result |
| :--- | :--- |
| Four-lane line-level identity | **R13,014.50** exact |
| Bridge subset Δ | **−R0.01** = EX-0029 (43234 cent) |
| CYL custody | **0 shells** — registry v10.2 invariant PASS |
| S.1/D.1 merge | Provisional — warehouse confirmation pending |
| Tier 5 review queue | **Empty** |
| Verified on-account 44227 | **R4,978.91** — credit on account, not review |

---

## Live artifacts

| File | Status |
| :--- | :--- |
| `config/cyl_residual_registry.json` | **v10.2 RATIFIED_PROVISIONAL_MERGE** |
| `config/payment_pattern_overrides.json` | registryVersion 10.2; v9 retired |
| `reports/MOZ002_TXT_Decomposition_v2.md` | Line-level lanes (canonical) |
| `reports/MOZ002_Payment_Allocation_v1.md` | Final tiers + bridge |
| `reports/MOZ002_Statement_Account_v1.md` | Turn 7j close-out |
| `reports/MOZ002_Statement_Account_v1_Customer.html` | Customer-facing export (INTERNAL_ONLY stripped) |

---

## Tripwires (active)

1. Payment citing **49550** → reopen 49143/49550 twin ruling  
2. Warehouse rules **S.1/D.1 distinct** → re-run invariant `--unmerged`  
3. Remittance for **44227** → convert to confirmed edge  

---

## Operator actions (optional)

- Rotate Supabase credential exposed in pre-7j script fallbacks (flagged 2026-07-20)  
- Confirm S.1/D.1 physical class when warehouse available  
- Refresh TXT export when portfolio catches ERP tail  

*Turn 7 complete — no further analysis turns scheduled.*

---

## Post-close portfolio update (2026-07-20)

**Source:** `raw/MOZ002P17.TXT` — see `reports/MOZ002_P17_TXT_Delta.md`

| Item | Detail |
| :--- | :--- |
| New payment | **45202** — 2026-07-16, −R5,004.42 (STAT 128) |
| Clears | Invoice **50657** (EX-0035 closed → EX-0038) |
| ERP closing | **R8,010.08** (was R13,014.50) |
| Open LPG | 49143, 50528, 51789 — **R12,989.00** |
| DB | 45202 not in `transaction_headers` yet — re-run ingest after sync |
