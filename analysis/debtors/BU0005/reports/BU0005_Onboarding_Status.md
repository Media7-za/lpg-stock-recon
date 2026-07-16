# BU0005 — Onboarding Status

**Updated:** 2026-07-16  
**Account:** BU0005 — CHOBOZA - BULWER  
**Lane:** `allocation` (WO0001 pattern)  
**Worker skill:** `.agents/skills/SKILL_BU0005_Allocation_Worker.md` (cold-start)

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP TXT (CURRENT) | `raw/BU0005.TXT` | ✅ |
| ERP TXT (2023 / 2022 activity) | `raw/BU00052023.TXT` | ✅ |
| Remittance PDFs | `raw/Remittances/` | N/A (COD) |
| Global aged debt | `Global Reports/130720251H45M.TXT` | ✅ R3,450.17 |

---

## B/F bridge — resolved

| Link | Value |
| :--- | :--- |
| 2023 export close | R1,378.19 |
| CURRENT export B/F | R1,378.19 ✓ |
| Formula | R1,380.00 legacy − R1.81 D/N2406 rounding |
| Post-STAT125 residual | R1,362.95 = R1,378.19 − R15.24 (3× STAT rounding) |
| Current outstanding | R1,362.95 + R2,087.22 (inv 00050949) = **R3,450.17** ✓ |

Report: `reports/BU0005_BF_Bridge_v1.md`

---

## Turn status map

| Turn | Deliverable | Status |
| :--- | :--- | :---: |
| 1 | Scaffold + doctrine | ✅ |
| 2 | ERP ingest + pilot | ✅ |
| 2+ | B/F bridge | ✅ |
| 3 | Full allocation graph | ⏳ **NEXT** |
| 4 | Exceptions + overrides | ⏸ |
| 5 | Statement bridge | ⏸ |

---

## Finance handoff (rounding journals)

| Task | Amount | Status |
| :--- | ---: | :---: |
| TASK-BU0005-000 (D/N2406 2022) | R1.81 | OPEN |
| TASK-BU0005-001 (STAT 122) | R2.13 | OPEN |
| TASK-BU0005-002 (STAT 124) | R2.49 | OPEN |
| TASK-BU0005-003 (STAT 125) | R10.62 | OPEN |
| **Total** | **R17.05** | |

---

## Blockers

1. **Legacy R1,380.00** — no pre-2022 TXT
2. **2023–2025 gap** — no activity in exports (confirm dormant)
3. **Pilot sign-off** — STAT 125 11-day lag (pending operator)

---

## Next turn (Turn 3)

Full `allocation_edges.csv` + `BU0005_Payment_Allocation_v1.md` — all STAT batches + D/N2406 historical.

**Inputs:** Pilot sign-off on STAT 125; ERP Agent posts rounding journals (optional before Turn 3).
