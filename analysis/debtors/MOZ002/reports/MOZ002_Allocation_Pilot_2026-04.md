# MOZ002 — Allocation Pilot (Apr 2026)

**Period:** 2026-04-01 → 2026-04-30  
**Method:** LPG-only payment matching — ERP `ref_no` cross-check + cent alignment  
**Sources:** `raw/MOZ002CURRENT.TXT`, Supabase `transaction_headers` / `vw_clean_transactions`  
**Generated:** 2026-07-16

---

## 1. Executive summary

| Metric | Value |
| :--- | ---: |
| Payments in period | **4** |
| Confirmed LPG allocations | **4** (100%) |
| Total payment cash | **R12,445.19** |
| Unallocated | **R0.00** |
| Partial empty CN exceptions | **1** (`00014741`) |

All four `STAT 125` payments in Apr 2026 allocate cleanly to LPG invoice targets via ERP `ref_no`. No settlement discount. No unallocated cash in this slice.

---

## 2. Payment → LPG invoice register

| Payment | Date | STAT | Amount | ref_no | Target invoice | LPG target | Variance | Lag (days) | Status |
| :--- | :--- | :--- | ---: | :--- | :--- | ---: | ---: | ---: | :--- |
| 00043878 | 2026-04-02 | STAT 125 | R2,428.41 | 00049933 | 00049933 | R2,428.41 | R0.00 | 7 | ✅ CONFIRMED |
| 00043962 | 2026-04-09 | STAT 125 | R2,971.08 | 00050066 | 00050066 | R2,971.08 | R0.00 | 7 | ✅ CONFIRMED |
| 00044028 | 2026-04-16 | STAT 125 | R2,971.08 | 00050173 | 00050173 | R2,971.08 | R0.00 | 6 | ✅ CONFIRMED |
| 00044147 | 2026-04-30 | STAT 125 | R4,074.62 | 00050305 | 00050305 | R4,074.62 | R0.00 | 10 | ✅ CONFIRMED |

### LPG line composition (DB)

| Invoice | DN ref | LPG lines | LPG total |
| :--- | :--- | :--- | ---: |
| 00049933 | DN-21985 | 2 × D01 | R2,428.41 |
| 00050066 | DN-21858 | 1 × 901 + 2 × S01 | R2,971.08 |
| 00050173 | DN-22161 | 1 × 9.4 + 2 × S.4 | R2,971.08 |
| 00050305 | DN-21336 | 3 × S.4 | R4,074.62 |

> Payment amounts match **LPG line totals**, not invoice header gross where CYL lines exist on paired empty invoices. In this slice, gas invoices are LPG-only documents — header = LPG.

---

## 3. Cylinder (empty) invoice handling

Each gas delivery has a paired `-EMPTY` invoice (CYL deposits). Payments clear **LPG only**; empties are reversed by credit notes.

| Delivery | Gas invoice | Payment | Empty invoice | Credit note | CN amount | Empty residual |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| DN-21858 | 00050066 | 00043962 | 00050067 (R2,932.50) | 00014705 | R2,932.50 | R0.00 |
| DN-22161 | 00050173 | 00044028 | 00050174 (R2,932.50) | 00014741 | R2,415.00 | **R517.50** |
| DN-21336 | 00050305 | 00044147 | 00050306 (R3,622.50) | 00014773 | R3,622.50 | R0.00 |

### Exception — CN 00014741 (registered)

| Field | Value |
| :--- | :--- |
| Empty invoice | 00050174 (R2,932.50 CYL) |
| CN posted | R2,415.00 |
| Residual | **R517.50** (= 1 × 9kg deposit R450 + 15% VAT) |
| Reason | Customer returned **1 × 9kg cylinder short** |
| Override | `config/payment_pattern_overrides.json` — `PARTIAL_EMPTY_RETURN` |

---

## 4. Allocation groups (Apr 2026)

```text
AG-000001  00043878 ──► 00049933 (LPG)
AG-000002  00043962 ──► 00050066 (LPG) ── CN 00014705 ──► 00050067 (EMPTY, full)
AG-000003  00044028 ──► 00050173 (LPG) ── CN 00014741 ──► 00050174 (EMPTY, partial R517.50 open)
AG-000004  00044147 ──► 00050305 (LPG) ── CN 00014773 ──► 00050306 (EMPTY, full)
```

---

## 5. Pilot conclusions

| Check | Result |
| :--- | :--- |
| LPG-only match doctrine | ✅ Validated — 4/4 cent-exact |
| ERP `ref_no` usable (DB) | ✅ Yes — matches LPG target in all cases |
| CURRENT TXT `ref_no` on payments | ❌ Blank INVNO — use DB or allocation-detail export for Turn 3 |
| Settlement discount | ✅ None observed |
| STAT 125 batch | Present — does not block per-invoice allocation |

**Turn 3 readiness:** Extend allocation across full 2025–2026 using DB `ref_no` + LPG targets. Lag-window fallback needed only where `ref_no` is blank.

---

## 6. Artifacts

| File | Description |
| :--- | :--- |
| `data/allocation_edges.csv` | Pilot slice — 4 confirmed edges |
| `config/payment_pattern_overrides.json` | CN 00014741 partial return |

*Generated for MOZ002 Turn 2 — allocation pilot.*
