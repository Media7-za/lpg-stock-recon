# DON001 Account Setup Summary

**Date:** 2026-09-29  
**Account Code:** DON001  
**Account Name:** DONNYBROOK  
**Status:** Onboarding in Progress

---

## Files Received & Ingested

| File | Period | Rows | Status |
|------|--------|------|--------|
| DON001CURRENT.TXT | Jan 2022 – Feb 2025 | 138 transactions | ✓ Ingested |
| DON001_FEB2022.TXT | Feb 2022 (historical) | 46 transactions | ✓ Reference |
| DON001_FEB2023.TXT | Feb 2023 (historical) | 146 transactions | ✓ Reference |
| DON001_FEB2024.TXT | Feb 2024 (historical) | 150 transactions | ✓ Reference |
| DON001CURRENT_FROM202203.TXT | Mar 2025 (latest extract) | 94 transactions | ✓ Reference |

---

## Account Position (from ERP Extract)

| Metric | Value | Source |
|--------|-------|--------|
| **Current Balance** | R97,976.63 | DON001CURRENT.TXT header |
| **Opening B/F (1 Jan 2022)** | R103,562.40 | DON001CURRENT.TXT B/F line |
| **Transaction Range** | 20 Jan 2022 → 23 Feb 2025 | Dated entries |
| **Account Currency** | Local | (RSA Rand implied) |

---

## Data Integrity Notes

**ASSERTED (not yet verified against full ERP export):**
- Opening balance: R103,562.40
- Current balance: R97,976.63
- All transaction dates and amounts as extracted

**PROVEN items once v5 statement generates:**
- Transaction sequence integrity
- Running balance accuracy
- LPG gas vs. cylinder deposit split (Part 1A vs 1B)
- Payment allocation routing

---

## Next Steps

1. **Database sync**: Run `npm run debtors:sync` to pull DON001 transaction headers + line items into Supabase (if configured)
2. **Generate v5 statement**: 
   ```bash
   node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor DON001
   ```
   Output: `analysis/debtors/DON001/reports/DON001_Statement_Account_v5.md`

3. **Ingest gate check**: Run `npm run debtors:ingest-check -- --debtor DON001` to verify coverage

4. **Review v5 statement** for:
   - Balance tie-out (opening + transactions = closing)
   - Part 1A / 1B split correctness
   - Cylinder deposit pairings (inv + credit notes)

---

## Configuration Files Ready

- ✓ `config/statement_v5.json` — v5 generator config
- ✓ `project.json` — Account metadata
- ✓ `raw/DON001CURRENT.TXT` — Primary data source
- ✓ `raw/DON001CURRENT_FROM202203.TXT` — Latest extract for reference

---

## Blockers / Open Questions

| Item | Impact | Status |
|------|--------|--------|
| Full ERP export (Jan 2022+) | Verify opening balance | **BLOCKED** — awaiting full ERP extract |
| Database sync (if Supabase enabled) | Enable allocation workflow | **PENDING** — depends on sync script |
| Custody data (cylinder counts) | Part 2 of v5 statement | **BLOCKED** — no physical count provided |

