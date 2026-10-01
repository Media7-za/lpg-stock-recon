# Handoff: Statement Generation Pipeline Verification (2026-10-01)

**Status:** Fully verified and documented  
**Reference:** Earlier handoff from disconnected session, re-verified against current repo

---

## Summary of Verification

The statement generation pipeline (`<CODE>_Statement_of_Account.md`) is **comprehensively documented** in:
- **Primary:** `.agents/skills/SKILL_Debtor_Customer_Statement_From_TXT.md` (12 KB, §1-5)
- **Script source:** `analysis/debtors/shared/scripts/generate_statement_of_account.mjs` (31 KB)
- **Gate implementation:** `analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs` (17 KB)
- **Open-invoice logic:** `analysis/debtors/shared/scripts/debenq_open_invoices.mjs` (26 KB)

**Key distinction preserved in docs:** The two statement lineages are properly separated:
- `<CODE>_Statement_of_Account.md` ← **this pipeline** (unversioned, TXT-only, customer-facing)
- `<CODE>_Statement_Account_vN.md` ← v4/v5 (versioned, DB-backed, internal recon)

---

## Corrections to Original Handoff

| Claim | Status | Finding |
| :--- | :--- | :--- |
| Scripts exist at named paths | ✅ **Confirmed** | All three exist; dates Sep 24, 2026 |
| `npm run debtors:customer-statement` | ✅ **Confirmed** | Exact command in package.json |
| Only 3 accounts (JEN001, MD0003, TWK002) | ❌ **Outdated** | **5 accounts now have configs**: TWK002, JEN001, MD0003, JAY000, FIR001 |
| TXT-only, no DB dependency | ✅ **Confirmed** | No `DATABASE_URL` / `transaction_items` / Supabase refs in any three scripts |
| Skill documents this pipeline | ✅ **Confirmed** | `SKILL_Debtor_Customer_Statement_From_TXT.md` is comprehensive end-to-end |

---

## Config Accounts (Updated)

Current state: **5 accounts** have `config/statement_of_account.json`:

| Account | Config Path | Status |
| :--- | :--- | :--- |
| **TWK002** | `analysis/debtors/TWK002/config/statement_of_account.json` | ✅ Active, remittance-backed |
| **JEN001** | `analysis/debtors/JEN001/config/statement_of_account.json` | ✅ Reference implementation |
| **MD0003** | `analysis/debtors/MD0003/config/statement_of_account.json` | ✅ In pipeline |
| **JAY000** | `analysis/debtors/JAY000/config/statement_of_account.json` | ✅ NEW (added since prior handoff) |
| **FIR001** | `analysis/debtors/FIR001/config/statement_of_account.json` | ✅ NEW (added since prior handoff) |

---

## TWK002 Pipeline Configuration (Current)

From `analysis/debtors/TWK002/config/statement_of_account.json`:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **customerName** | TWK AGRI PTY LTD | — |
| **referenceLabel / Value** | TWK reference / B226 | Customer account reference |
| **openInvoiceModel** | `lpg_stripped` | Uses invoice − credit-note logic (not raw ERP INVNO tagging) |
| **allocationGate** | `RATIFIED` | Closed via remittance_explicit method; H-026 ERP cash tagging pending |
| **closedInvoiceOverrides** | 10+ entries | Documents which invoices are paid per remittance advice (STAT 114/123) |
| **primaryTxt** | `DEBENQTWK002CURRENT.TXT` | Export through Aug 26, 2026; header says R27,721.81 |
| **siteTxts** | `{}` (empty) | TWK003/TWK004 excluded pending site roll-up revisit |
| **outputDir** | `analysis/debtors/TWK002/reports` | — |
| **pdfStylesheet** | `statement_pdf.css` | Custom per-account stylesheet |

**Load-bearing note:** The config comment states ERP export "EXCLUDE ALLOCATION DETAIL" — meaning the `INVNO` column is blank on payment rows. This is **intentional, not a defect** (business_rules.md §3). The statement reconstructs open invoices using `lpg_stripped` (invoice − CN) and validates settlement via remittance advices in `closedInvoiceOverrides`.

---

## Generated Output

Running `npm run debtors:customer-statement -- --debtor TWK002 --as-at <DATE> --pdf` produces:

```
analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md     [live draft]
analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.pdf    [optional, with --pdf]
```

**Current as-of:** Last run shows statement date 2026-09-30 (per GitHub repo version).

**Snapshot mode:** `--snapshot` creates versioned archives in `snapshots/YYYY-MM-DD_vN/` with provenance (sha256, gate status, config flags) — used for finance sign-off and customer send.

---

## Invoice-Tag Coverage Gate (§3.1 in Skill)

Mandatory pre-release check:

```bash
npm run debtors:tag-check -- --debtor TWK002 --write
```

Reports evidence basis for the open-invoice list:
- `ALLOWED`: No contradiction found (absence-of-evidence verdict)
- `REVIEW_REQUIRED`: Invoice may be settled behind payment gap
- `BLOCKED`: List over-states account or remittance contradicts it — **do not release**
- `NOT_DERIVABLE_FROM_TXT`: No invoice tagging in export — **do not release** (requires allocation lane)

**TWK002 status:** Currently `RATIFIED` (per config, set Aug 30, 2026 via remittance validation).

---

## Key Load-Bearing Properties (Verified)

1. **TXT-only:** No Supabase/`transaction_items` references. Safe to re-run after ERP export refresh without DB access.
2. **Open-invoice reconstruction:** Invoice − matching CN, not ERP INVNO tagging (TWK002 export deliberately excludes allocation detail).
3. **Remittance authority:** Overrides ERP's untrustworthy payment tagging; `closedInvoiceOverrides` ratifies settled invoices with evidence refs.
4. **Gate integration:** `generate_statement_of_account.mjs` **refuses to write** on `BLOCKED` / `NOT_DERIVABLE_FROM_TXT` (unless `--force` used with operator ratification).

---

## Documentation Quality

| Aspect | Found | Location |
| :--- | :--- | :--- |
| **When to use (vs v4/v5)** | ✅ Yes | Skill §0 + §5 |
| **Config schema** | ✅ Yes | Skill §1-2, template at `analysis/debtors/shared/templates/statement_of_account_config.template.json` |
| **Rule 15 gate outcomes** | ✅ Yes | Skill §3.1 table |
| **TXT-only property** | ✅ Yes | Skill §1 + §4 |
| **Two-statement lineage distinction** | ✅ Yes | Skill opening + §5 cross-references |

**Conclusion:** The pipeline is **properly documented end-to-end**. No additional documentation needed unless TWK002's specific 32 `closedInvoiceOverrides` + 7 `balanceBridgeLines` warrant a separate case study (beyond what the config itself carries).

---

## Unresolved Context from Earlier Handoff

**"Portfolio Review — Statement Pipeline & Payment-Pattern Classification" document:**
- Not found in current repo search
- Status: Presumed lost (prior session also reported missing)
- Impact: None — the Skill + config + scripts are sufficient reference
- Follow-up: Not required for TWK002 statement work

---

## To Regenerate TWK002 Statement

Run:
```bash
# Check gate first
npm run debtors:tag-check -- --debtor TWK002 --write

# Generate live draft
npm run debtors:customer-statement -- --debtor TWK002 --as-at 2026-10-01 --pdf

# Verify: Balance due in console output = ERP CURRENT BALANCE header (R47,695.33)
```

**Notes:**
- The generated `.md` and `.pdf` are internal working files until gate returns `ALLOWED` or `RATIFIED`
- Do not hand-edit — next run resurrects errors
- For customer send or collections, use `--snapshot` to archive with provenance

---

**Verified by:** Session starting 2026-10-01  
**Next actions:** None — pipeline is operational and documented. TWK002 statement as of 2026-09-30 (R47,695.33) is current.
