# JEN001 Payment Reconciliation Doctrine (v1)

**Account:** JEN001 — JENS SPOON PTY LTD (Spoon Eatery)  
**Status:** Turn 1 — scaffold locked 2026-07-16  
**Lane:** `position_recon` — **stripped-gas payment pattern** (settlement discount **not applicable**)

> This file follows the TWK002 turn scaffold naming convention. Settlement discount sections are explicitly ruled **N/A** per locked commercial model.

---

## 0. Lane ruling (Turn 1 lock)

| Question | Ruling |
| :--- | :--- |
| Settlement pattern | **NONE** — customer pays **100% cash** of settled LPG gas amounts |
| Unit of work | **Invoice `doc_no`** — payments clear one or more LPG gas invoice slices per STAT batch |
| Discount terms | **NONE** — no `DISCOUNT ALLOWED` journals expected |
| ERP behaviour observed | **Cash-only gross** — `TRANSF \| STAT 1xx` payments; amounts align to **LPG gas lines** (CYL deposit rows stripped) |
| CYL/EMPTIES in comparison base | **No** — strip all `-EMPTY` / `EMPTY` suffix rows (JIM001 LPG-only rule; unlike TWK002) |

**Orchestrator lane:** `position_recon` + stripped-gas payment pattern (`docs/JEN001_reconciliation_skill.md`).  
**Not applicable:** `settlement_discount` (TWK002), `allocation` (WO0001 ref_no-linked).

---

## 1. Commercial model (Model A — cash gross)

| Element | Ruling |
| :--- | :--- |
| Cash received | Customer pays **100%** of eligible **LPG gas** document total (VAT inclusive) |
| ERP journal | **Payment document only** — no settlement discount journal |
| Settlement identity | `payment_amount ≈ Σ(lpg_invoice_amounts)` for the cleared invoice set |
| Tolerance | **0.1%** of payment gross unless override registered |
| CYL handling | Deposit invoice + CN pairs stripped — **zero financial impact** on gas ledger |

---

## 2. Stripped gas comparison

Every cylinder delivery produces a three-row ERP pattern (gas + deposit + deposit CN). Only the **gas fill row** enters the payment match base:

| Row | CUSTOMER/BANK REF | In match base? |
| :--- | :--- | :--- |
| Gas fill | `DN-21759` | **Yes** |
| Deposit bond | `DN-21759-EMPTY` | **No** |
| Bond reversal | `DN-21759-EMPTY` (Crd Note) | **No** |

**Predicate:** `CYL_PATTERN = /[-`#]?EMPTY$/i` on `CUSTOMER/BANK REF`.

**Known ref variants:** `DN-21759-EMPTY`, `DN#22114EMPTY`, `` DN`21271-EMPTY ``.

---

## 3. Payment-batch rules

| Rule | Ruling |
| :--- | :--- |
| Batch identifier | ERP `TRANSF \| STAT nnn` on payment row |
| Payment `ref_no` | **Non-canonical** — payment rows carry blank invoice ref; match by **amount + date window** |
| Multi-invoice batches | One EFT may clear **multiple LPG invoices** (e.g. STAT 124 = R9,220.53 = 3× Feb gas) |
| Catch-up payments | Allowed — payment may exceed current-month gas (Nov 2025 R11,199.05 precedent in prior recon) |
| Exceptions | Per invoice / per payment — `config/payment_pattern_overrides.json` |

---

## 4. Evidence hierarchy

| Tier | Source | Role |
| :--- | :--- | :--- |
| **1** | **Bank deposit / remittance advice** (if available) | Canonical **cash** sign-off |
| **2** | **Operator analysis** (`raw/JEN001_Final_Recon_Export.xlsx`) | Allocation hints — *not* substitute for Tier 1 |
| **3** | **TXT export** (`raw/JEN001.TXT`) | ERP document headers, payments, running balance |
| **4** | **Stripped gas statement** (`docs/JEN001_reconciliation_skill.md`) | LPG-only running balance cross-check |

> **Gap (Turn 1):** No `raw/Remittances/` folder. Tier 1 evidence **missing** — Turn 2 pilot requires bank deposit detail or remittance PDF.

---

## 5. Settlement discount registry (N/A)

`config/settlement_discount_overrides.json` is scaffolded with `"applicable": false`.  
Do **not** populate discount overrides unless commercial terms change.

---

## 6. Deliverables & turn map (adapted from TWK002)

| Turn | Deliverable | Artifacts |
| :--- | :--- | :--- |
| 1 | Scaffold + doctrine | `project.json`, this doctrine, empty override registries |
| 2 | Pilot batch | One STAT payment → LPG invoice decomposition → variance report |
| 3 | Full payment register | Payment-to-invoice bridge CSV, exception tasks |
| 4 | Invoice exceptions | Populated `payment_pattern_overrides.json` |
| 5 | Recreated ledger | Target-state gas ledger CSV + narrative |
| 6 | Payment pattern analysis | Batch match report; annual overrides if multi-year TXT supplied |
| + | Finance handoff | N/A unless journal gaps found |

---

## 7. Skill relationship

| Skill | Applicability |
| :--- | :--- |
| `docs/JEN001_reconciliation_skill.md` | **Primary** — stripped gas statement, CYL ledger |
| `debtors-analysis_Skill.md` | Graph states, exception taxonomy |
| `lpg-payment-pattern-analysis` | Monthly/batch payment matching on **LPG-only** totals |
| `SKILL_Payment_To_Invoice_Allocation.md` | **Partial** — amount-to-invoice matching; not ref_no-canonical |
| TWK002 settlement discount | **Not applicable** |

---

## 8. Account scope

- **Default scope:** `JEN001` only.  
- **Exclude `JEN010`** unless user explicitly requests combined historical view (cylinder opening balance impact).
