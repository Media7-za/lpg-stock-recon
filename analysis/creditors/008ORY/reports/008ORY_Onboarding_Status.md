# 008ORY Onboarding Status

**Supplier:** ORYX ENERGY  
**Account:** `008ORY` (linked legacy: `007ORY`)  
**Last updated:** 2026-08-20

---

## Pipeline status

| Step | Status | Notes |
| :--- | :--- | :--- |
| Micro-project scaffold | Done | `config/`, `raw/`, `reports/`, `docs/` |
| ERP TXT ingested | **Done** | Official CREDENQ → `raw/008ORYCURRENT.TXT` (690 lines, Mar 2025 → 14 Aug 2026). Downloads copy unchanged. |
| Ingest gate | **PARTIAL** | 74/74 Jul–Aug 2026 period docs `MISSING_HEADER` in Supabase |
| Statement v5 | **PASS** | Line export **R0.00** · ERP header **R0.00** (after UD bridge) · Sub-ledger **R0.00** |
| Part 1B pairing | **PASS** | TXT `GRVNO` fallback — 23/24 GRVs net R0.00 in 1B; R0.01 residual on 6783 |
| Part 2 custody | **BLOCKED** | Incomplete DB item lines; 1A/1B vs Part 2 does **not** tie |

---

## CREDENQ header (authoritative)

| Field | Value |
| :--- | :--- |
| `CURRENT BALANCE` | **R-437,114.03** |
| `UD CHEQUES/PAY` | R315,876.33 (in header, not in line export) |
| TXT line export close | R-121,237.70 |
| Bridge | Combined − UD = header → **R0.00** |

---

## Config snapshot (v5 regenerated 2026-08-20)

| Field | Value |
| :--- | :--- |
| `periodStart` | 2026-07-01 |
| `combinedBf` | R-60,547.41 (CREDENQ line 603) |
| `paymentLane` | LPG |
| Part 1A close | **R-121,237.71** |
| Part 1B close | **R0.01** |
| Combined 1A+1B | **R-121,237.70** |

CYL split: DB line split when header-tied; else TXT `GRVNO` pairing (Deb Note header → 1B credit; linked GRV → 1B charge; remainder → 1A).

---

## Three-way check (1A vs 1B vs Part 2)

| Check | Result |
| :--- | :--- |
| 1A + 1B vs CREDENQ header (per GRV) | **24/24** |
| 1B GRV + DN vs R0 | **24/24** (R0.01 on 6783) |
| 1A vs DB LPG lines | **0/24** |
| 1B vs DB CYL lines | **1/24** |
| Part 2 GRV+DN qty net zero | **7/23** paired GRVs |

Do not sign custody until full item ingest. Typical DN header ~R86k CYL vs DB lines ~R11k.

---

## Open exceptions

| Item | Lane | Note |
| :--- | :--- | :--- |
| GRV 6783 / DN 3659+3658 | 1B | Two DNs; header 27,117.43 vs GRV 27,117.42 → R0.01 |
| GRV 6785 | 1A | No Deb Note; R-12,423.42 LPG; same-day STAT 128 pays it |
| 17 GRV/DN pairs | Part 2 | SKU qty mismatch on partial DB lines (S.1 / D.1 dominate) |

---

## Commands

```bash
export DATABASE_URL="postgresql://..."   # Supabase pooler
export PGSSL_REJECT_UNAUTHORIZED=false # if TLS chain issues locally

npm run creditors:ingest-check -- --creditor 008ORY
npm run creditors:statement-v5 -- --creditor 008ORY
```

---

## Next steps (operator)

1. Ingest `008ORY` / `007ORY` transaction **headers + full item lines** for Jul–Aug 2026
2. Re-run ingest gate until `ingestCoverage: complete` and custody **ALLOWED**
3. Re-check 1A/1B vs Part 2 — expect DB CYL totals to match TXT `GRVNO` 1B amounts
4. Optional: drop a newer CREDENQ if ERP has post–14 Aug activity; re-derive `combinedBf` only if `periodStart` changes

---

## Artifacts

| Report | Path |
| :--- | :--- |
| Statement v5 | [`008ORY_Statement_Account_v5.md`](008ORY_Statement_Account_v5.md) |
| Ingest coverage | [`008ORY_INGEST_COVERAGE_2026-08-20.md`](008ORY_INGEST_COVERAGE_2026-08-20.md) |
| Workspace fixture | `src/features/creditor-position-workspace/data/fixtures/008ORY.v5.json` |
