# MOZ002 — Turn 7: Ghost Closure Trace & 44227 Investigation

**Generated:** 2026-07-19  
**Scope:** Read-only · fixes viz snapshot logic · no registry/edge changes  
**Trigger:** Pattern read on `MOZ002_viz_extract.md` — metronomic payer, 44227 anomaly, alleged “ghost closures”

---

## Executive summary

| Finding | Verdict |
| :--- | :--- |
| Six “ghost closures” on 44227 date | **Refuted (4)** · **Mis-allocation (1)** · **Genuinely open (1)** |
| Viz snapshot bug (50066/50173/50305 false open) | **Confirmed & fixed** — omitted confirmed edges + wrong CN sign |
| 44227 invisible ERP settlement | **Partially supported** — R4,978.91 = R4,329.29 + **R649.62**; no CN at R649.62; **50528 still open on TXT** |
| 49143 / 43640 edge | **Turn 7b:** 43640→49550 locked (EX-0037); 49143 genuinely open |
| Debtor query needed now? | **Not yet** — Turn 7d ERP trace on 44227 first |

---

## 1. Snapshot bug (Turn 7a query)

The Turn 7a `LPG-open on 44227 date` block had **two defects**:

1. **CN offset sign** — subtracted `|cn_lpg|` instead of adding signed `cn_lpg` (CN amounts are negative).
2. **Missing edge deductions** — did not subtract `allocated_amount` from confirmed edges with `payment_date ≤ 2026-05-07`.

### False positives removed

| Invoice | Paid by (edge) | Payment date | Was wrongly “open” |
| :--- | :--- | :--- | ---: |
| 50066 | 43962 | 2026-04-08 | R2,971.08 |
| 50173 | 44028 | 2026-04-15 | R2,971.08 |
| 50305 | 44147 | 2026-04-29 | R4,074.62 |

### Corrected LPG-open on 2026-05-07

After CN offsets + confirmed edges + ERP payment refs:

| doc_no | invoice_date | lpg_open |
| :--- | :--- | ---: |
| **49143** | 2026-02-06 | **R3,839.70** |
| **50528** | 2026-05-05 | **R4,329.29** |
| | **Total** | **R8,169.99** |

*(Not R39,120.15 / six ghosts from Turn 7a.)*

---

## 2. Ghost closure trace (six invoices)

| Doc | LPG | Inv date | Open @ 44227 | Open today | Closure path | Evidence |
| :--- | ---: | :--- | ---: | ---: | :--- | :--- |
| 41503 | R3,234.35 | 2025-03-14 | R0 | R0 | **Same-day CN full void** | CN **12074** (−R3,234.35) ref 41503 |
| 41522 | R2,953.12 | 2025-03-14 | R0 | R0 | **Same-day CN full void** | CN **12079** (−R2,953.12) ref 41522 |
| 43858 | R1,308.64 | 2025-06-11 | R0 | R0 | **Same-day CN full void** | CN **12717** (−R1,308.64) ref 43858 |
| 50518 | R2,971.08 | 2026-05-05 | R0 | R0 | **Same-day CN full void** | CN **14849** (−R2,971.08) ref 50518 · DN#22222 |
| **49143** | R3,839.70 | 2026-02-06 | **R3,839.70** | **R3,839.70** | **Edge mis-route (not closed)** | Pmt **43640** R3,839.70 blank ref · edge → **49550** not 49143 |
| **50528** | R4,329.29 | 2026-05-05 | **R4,329.29** | **R4,329.29** | **Still open — no edge, no ref** | Only R4,978.91 pmt in window is **44227** (blank ref) |

**Four of six were never collectible LPG open items** — Tier 3 CN-voided on posting date. They appeared in Turn 7a only because the snapshot query was wrong.

---

## 3. DN#22222 — May 2026 delivery correction cluster

Same-day event (2026-05-05):

| Doc | Type | Amount | Effect |
| :--- | :--- | ---: | :--- |
| 50518 | LPG invoice | R2,971.08 | Posted |
| 50519 | Empty invoice | R2,932.50 | Posted |
| 50528 | LPG invoice | R4,329.29 | **Remains open** |
| 50529 | Empty invoice | R4,140.00 | Posted |
| 14849 | CN | −R2,971.08 | Voids 50518 LPG |
| 14850 | CN | −R2,932.50 | Empty return |
| 14856 | CN | −R5,175.00 | Empty return |

This is a **delivery correction / split LPG** pattern, not a silent payment closure. 50528 is the surviving LPG leg.

---

## 4. Payment 44227 — template violation

| Check | Result |
| :--- | :--- |
| Amount in history | **No** cent-exact LPG invoice match |
| ERP ref_no | **Blank** (STAT 125) |
| Calendar position | Only May-2026 EFT between **44147** (2026-04-29) and **44554** (2026-06-03) — behavioural “silence” is the **anomalous** May payment itself |
| Arithmetic hook | R4,978.91 − R4,329.29 (**50528**) = **R649.62** exact |
| CN at R649.62 | **None** in DB |
| 50528 closed on TXT? | **No** — invoice row still present at export; no payment ref to 50528 |

### Settlement hypothesis scorecard

| Hypothesis | Status |
| :--- | :--- |
| ERP manually applied 44227 → 50528 + R649.62 credit | **Plausible arithmetic**, **not confirmed on ledger** (50528 still open) |
| 44227 → 49143 (R3,839.70) + partial | **No** — leaves R1,139.21 unmatched |
| 44227 → sum of open pool (49143+50528) | **No** — R8,169.99 ≠ R4,978.91 |

**44227 remains Tier 5 UNALLOCATED** in the edge file. Cash is real; target link is either missing from ERP refs or applied via a path we have not ingested (manual allocation / unposted slice).

---

## 5. Secondary find — 49143 / 43640 mis-allocation

> **⚠️ SUPERSEDED by Turn 7b** (`MOZ002_49143_49550_ruling.md`). This section incorrectly recommended re-routing 43640→49143. Turn 7b ruling: **43640→49550** (EX-0037); **49143 remains open**.

| Layer | Detail |
| :--- | :--- |
| Invoice 49143 | LPG R3,839.70 (225.86 + 3,613.84) · posted 2026-02-06 |
| Payment 43640 | R3,839.70 · 2026-03-11 · **blank ref** |
| Current edge | `CONFIRMED_OPERATOR_OVERRIDE` → **49550** (inv 2026-03-03) |
| ~~Correct target (amount + lag)~~ | ~~**49143** cent-exact · 33-day lag~~ **Rejected** — lag-only tie-break |

~~This is a **false open** caused by lag-window tie-break, not a customer ghost closure. Fixing this edge removes 49143 from the open pool without a debtor query.~~

---

## 6. Recommended Turn 7 order (unchanged intent, updated evidence)

> **§6 step 7b superseded** — see `MOZ002_49143_49550_ruling.md` Step 2.

| Step | Action | Owner |
| :---: | :--- | :--- |
| ~~**7b**~~ | ~~Re-route edge **43640 → 49143**~~ | ~~Agent~~ **Done:** 43640→49550 locked (EX-0037) |
| **7c** | Re-run open-at-date snapshot; confirm only **50528** (+ **49143**) in May open pool | Agent ✓ |
| **7d** | Trace **44227** in ERP: clerk allocation screen / remittance / STAT 125 batch note | Human or ERP export |
| **7e** | Debtor query **only if** 7d finds no manual link to 50528 or R649.62 credit | Human |

**Do not send debtor query before 7b–7d** — one mis-allocated edge and four CN-void false ghosts explain most of the Turn 7a noise.

---

## 7. Corrected viz snapshot (44227 date)

```csv
doc_no,invoice_date,lpg_open_on_2026-05-07,notes
49143,2026-02-06,3839.70,mis-routed payment 43640 in edge file
50528,2026-05-05,4329.29,candidate for 44227 settlement arithmetic
```

---

## Artifacts

| File | Role |
| :--- | :--- |
| `reports/MOZ002_viz_extract.md` | Turn 7a (contains pre-fix snapshot — superseded §7 above) |
| `data/allocation_edges.csv` | 44227 UNALLOCATED · 43640→49550 lag edge |
| `config/payment_pattern_overrides.json` | 44227 UNALLOCATED_NO_TARGET · 50657 outstanding |

*Trace queries: Supabase `transaction_headers` + `vw_clean_transactions` · TXT cross-check `MOZ002CURRENT.TXT`*
