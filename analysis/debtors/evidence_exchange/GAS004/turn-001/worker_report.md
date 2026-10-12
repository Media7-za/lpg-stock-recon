# GAS004 Turn 001 — Worker Report

**Turn:** 001  
**Outcome:** **PARTIAL**  
**Executed:** 2026-08-17

## Steps executed

| Step | Result |
| :--- | :--- |
| 1 Copy DEBENQ | `raw/DEBENQ_2024.TXT`, `DEBENQ_2025.TXT`, `DEBENQ_CURRENT.TXT` |
| 2 Config | `periodStart` 2026-01-01 · `combinedBf` R20,121.57 · `paymentLane` LPG |
| 3 Ingest-check | `CURRENT_PARTIAL` · 10 MISSING_HEADER · custody BLOCKED |
| 4 v5 generate | Combined R20,061.51 vs running close **R0.00**; vs header CURRENT BALANCE **R-10,180.95** (UD) |
| 5 Reports | Onboarding, ingest projection, family combined exposure |
| 6 Sync | See console after this report |

## Lane lock

`position_recon` + v5. SPEEDP (no STAT). Settlement discount **NONE** (R-58.38 pennies/journal only). EMPTY pattern present (2025 refs; 2026 CYL via mixed-doc split). Not allocation.

## Evidence

- Running close **R20,061.51** (2026-08-03) **PROVEN**
- Header CURRENT BALANCE **R30,242.46** = running close excluding UD **R-10,180.95** **PROVEN**
- Sub-ledger tie **R0.00**
- Part 1B R2,817.50 vs custody R2,875.00 = **R-57.50** — **not signed off**
- TXT behind DB: invoices 52467, 52478, 52518, 52519, 52586 (10–14 Aug)

## Next

H-021 (fresh DEBENQ + DTRX/ITEMS) then Turn 002 rebuild. H-020 for sibling global snapshot. No customer send.
