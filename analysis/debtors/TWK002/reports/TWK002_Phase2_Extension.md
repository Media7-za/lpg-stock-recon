# TWK002 — Phase 2 extension (tranche 2)

**Date:** 2026-08-10  
**Prior tranche:** STAT **110 / 112 / 114** — linked, journals **posted** (R735.70)

---

## 1. What “extend again” covers

| Track | Scope | Status |
| :--- | :--- | :---: |
| **A** | STAT **123** · ERP `00043500` · `18.02.2026.pdf` | **REVIEW** — zero discount; ERP **R63,501.62** under remittance cash |
| **B** | STAT **111, 113, 115–122** | **No ERP payment** in any TWK002 TXT on file |
| **C** | New remittance PDFs not in `raw/Remittances/` | **None found** (only 2023–2025 + `18.02.2026.pdf`) |
| **D** | Full-history TXT after Phase 2 posts | **Recommended** (H-013) |

Machine register: `data/erp_stat_register_phase2.csv`

---

## 2. STAT numbering gaps (111 / 113 / 115–122)

All TWK002 exports searched for `TRANSF | STAT`:

| Present in ERP TXT | Missing |
| :--- | :--- |
| 100–110, **112**, **114**, **123** | **111**, **113**, **115–122** |

**Interpretation (working, not proof):** TWK’s STAT counter on the bank transfer does **not** always increment one-per-remittance. Missing numbers likely mean **no separate bank batch** was labelled with that STAT—not that remittances are “lost” in AR. The **Feb 2026** payment (**STAT 123**, **R176,824.24**) is large relative to prior batches and may consolidate **many months** of open items (May 2025–Feb 2026 activity appears in `TWK002CURRENT23072026.TXT` without intermediate STAT payments).

**Do not post discount journals for gap STATs** until both a **remittance PDF** and an **ERP payment** exist.

---

## 3. STAT 123 — next batch to reconcile

| Field | ERP (TXT) |
| :--- | ---: |
| Doc | `00043500` |
| Date | 25/02/2026 |
| Reference | `TRANSF \| STAT 123` |
| Amount | **R176,824.24** |

| Evidence | `raw/Remittances/18.02.2026.pdf` |
| Format | **InterForm400 text** (extractable; not image-only) |
| Report | `reports/TWK002_STAT123_Remittance_2026-02-18.md` |
| Checklist | `TASK-2026-0001` — **REVIEW** (cash mismatch) |

**Unblock:** Fill one row in `data/remittance_footer_capture_2026.csv`:

```text
electronic_paid_date, gross_payable, discount_amount, cash_amount, remittance_ref
```

Then we can classify **CASH_ONLY vs over-post**, build `remittance_lines_2026.csv`, proforma journal, and an ERP post pack.

---

## 4. Remittance folder inventory (2025+)

| PDF | Role |
| :--- | :--- |
| `31.01.2025.pdf` | STAT 110 ✅ posted |
| `31.03.2025(1).pdf` | STAT 112 ✅ (use text copy) |
| `31.05.2025.pdf` | STAT 114 ✅ posted |
| `18.02.2026.pdf` | STAT 123 — **needs footer capture** |

No PDFs on disk for STAT 111 / 113 / 115–122.

---

## 5. Artifacts added

| File | Purpose |
| :--- | :--- |
| `data/remittance_manifest_2026.json` | STAT 123 stub |
| `data/erp_stat_register_phase2.csv` | Full STAT 110–123 register |
| `data/remittance_footer_capture_2026.csv` | Human footer entry for image PDF |
| `data/finance_posting_checklist_2025_phase2.csv` | + extension tasks |

---

## 6. Human actions

1. **Type footer** from `18.02.2026.pdf` into `remittance_footer_capture_2026.csv` (or paste in chat).  
2. **Export fresh TWK002 CURRENT TXT** after Phase 2 journals — save to `raw/` for validation.  
3. If TWK can resend **text/remittance advice** for STAT 123, save alongside the scan.
