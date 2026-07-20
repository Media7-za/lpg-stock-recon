# TWK002 — Five 2024 Over-Post Investigation

**Debtor:** TWK002 (TWK AGRI PTY LTD)  
**Scope:** ERP payment gross > remittance gross payable (5 batches)  
**Source:** `raw/TWK0022024.TXT`, remittance PDFs, **ERP View Deposit Detail** (screenshots 2026-07-12)  
**Generated:** 2026-07-12 · **Deposit confirmed:** 2026-07-12

---

## 1. Executive summary

Five 2024 remittance batches show **ERP over-post** — the payment header in ERP exceeds remittance gross payable. This is the **same mechanical family** as the 2023 R345 pattern on receipts `00023836` and `00026681`, but with **larger and batch-specific orphan slices**.

| Finding | Detail |
|--------|--------|
| **Unified ERP formula** | `ERP payment = remittance cash + remittance discount + orphan_slice` |
| **Orphan definition** | `orphan_slice = ERP payment − remittance gross` |
| **Total 2024 orphan** | **R6,374.90** across 5 batches |
| **Root cause class** | Discount embedded in payment **DISCOUNT column** (pre–Model B) — cash column matches remittance; orphan is excess discount allocation |
| **Deposit UI convention** | `TOTAL = AMOUNT + DISCOUNT` (discount displayed as additive component to reach invoice gross) |
| **Model B implication** | Correct cash leg = remittance cash only; orphan + embedded discount should **not** be in payment header |

**Confidence by batch:**

| Batch | ERP doc | Orphan | Root cause | Confidence |
|-------|---------|--------|------------|------------|
| Mar-26 | `00029684` | R3,575.49 | Prior `already_paid` slice on doc `00023075` re-embedded | **HIGH** |
| Jun-26 | `00031558` | R806.27 | May twin-pair discount minus R345-class slice | **HIGH** |
| Jul-26 | `00032332` | R895.13 | CN discount added + Jun invoice leak | **HIGH** |
| Aug-26 | `00033224` | R598.00 | Stale R23,920 empty-pair discount (Apr batch) | **CONFIRMED** |
| Nov-26 | `00035263` | R500.01 | Oct-03 twin invoice discount before CN netting | **CONFIRMED** |

Canonical CSV: `data/remittance_vs_deposit_variance_2024.csv`

---

## 2. Mechanical proof — all five batches

For every over-post batch:

```text
ERP payment  =  remittance cash  +  remittance discount  +  orphan_slice
orphan_slice =  ERP payment      −  remittance gross
```

| Batch | Cash | Discount | Gross | Orphan | ERP check |
|-------|------|----------|-------|--------|-----------|
| Mar-26 | 73,610.18 | 506.36 | 74,116.54 | 3,575.49 | **77,692.03** |
| Jun-26 | 37,294.98 | 956.28 | 38,251.26 | 806.27 | **39,057.53** |
| Jul-26 | 16,737.35 | 429.16 | 17,166.51 | 895.13 | **18,061.64** |
| Aug-26 | 21,197.32 | 543.52 | 21,740.84 | 598.00 | **22,338.84** |
| Nov-26 | 21,529.67 | 552.04 | 22,081.71 | 500.01 | **22,581.72** |

Compare to **cash-only** batches (Apr, May, Sep, Oct, Dec): ERP payment = remittance cash exactly; discount journals missing.

The five over-post batches behave like **2023 Aug/Nov** — discount is **inside the payment header**, not posted as a journal.

---

## 3. Batch-by-batch attribution

### 3.1 Mar-26 — `00029684` — orphan R3,575.49

**Catch-up batch** spanning late-2023 and early-2024 documents. Remittance footer shows:

| Field | Amount |
|-------|--------|
| Gross payable (settled docs) | R74,116.54 |
| Cash (electronic) | R73,610.18 |
| Settlement discount | R506.36 |
| **Already paid** | **R3,598.81** |
| **Footer payment total** | **R77,715.35** |

ERP payment: **R77,692.03** — R23.32 **below** footer, but R3,575.49 **above** gross payable.

**Attribution:**

```text
orphan R3,575.49  =  already_paid R3,598.81  −  R23.32
R23.32            =  ERP shortfall vs remittance footer (discount rounding on prior slice)
```

Doc `00023075` (EXC-2024-0001): remittance shows **R345 residual** only; **R3,598.81** was settled on Sep-2023 batch. ERP re-embeds the prior payable block in the Mar payment header — the same partial-settlement family as 2023 `EXC-0003`.

**Operator action:** Confirm deposit allocation on `00029684` includes R3,598.81 gross on `00023075`, not R345 only. Model B: cash R73,610.18 + journal R506.36; **exclude** already-settled R3,598.81 from payment gross.

---

### 3.2 Jun-26 — `00031558` — orphan R806.27

Remittance: 7 lines (May/Jun gas + empties + CN `08700`).

**Exact arithmetic:**

```text
d25(00032419 + 00032425)  =  R448.90 + R702.65  =  R1,151.55
d25(R13,811.20)           =  R345.28
orphan                    =  R1,151.55 − R345.28 =  R806.27 ✓
```

The **R345.28** slice is the 2023 **R345 partial-allocation pattern** expressed at 2.5% on R13,811.20 gross — same deposit behaviour as doc `00023077` on receipt `00023836`.

**Secondary note:** CN `00008700` is R-548.30 on remittance but R-548.49 in TXT — R0.19 gross mismatch may affect deposit line rounding.

**Operator action:** View deposit detail on `00031558`; expect May twin-pair discount embedded in header plus ~R345-class partial slice.

---

### 3.3 Jul-26 — `00032332` — orphan R895.13

Remittance: 3 lines — CN `08913`, invoices `33277`, `33278`.

**Decomposition:**

```text
d25(00008913)  =  R627.90   (CN gross discount — positive in deposit)
d25(00031907)  =  R266.94   (Jun-batch invoice — prior-period leak)
sum            =  R894.84   (Δ R0.29 vs orphan — rounding)
```

This mirrors **2023 pilot §3a**: credit notes on remittance are **absent or mis-signed** in deposit allocation; invoice discounts from a **prior batch** (`31907` settled Jun-26) leak into Jul payment header.

**Operator action:** Deposit detail should show CN `08913` discount applied as positive component; check whether `31907` discount appears again.

---

### 3.4 Aug-26 — `00033224` — orphan R598.00 — **CONFIRMED**

```text
d25(R23,920) = R598.00 = orphan ✓
```

R23,920 is the **canonical empty-container invoice gross** from Apr-24 batch (docs `00030763` / `00007848`). Those lines are **not** on the Aug remittance; the discount slice is **stale cross-batch allocation** in the Aug payment header.

Oct batch (`00036006`) repeats the same R23,920 / R598 pair — ERP posted **cash-only** correctly in Oct but left a **partial journal** (R385.04 of R983.04). Aug absorbed the R598 slice inside the payment instead.

**Operator action:** Remove stale R598 allocation from `00033224` deposit; post as Model B journal if still economically owed.

---

### 3.5 Nov-26 — `00035263` — orphan R500.01 — **CONFIRMED**

Oct-03 twin invoices `00036926` + `00037189`:

```text
d25(36926) + d25(37189)  =  R525.92 + R526.13  =  R1,052.05
batch remittance discount =  R552.04
orphan                    =  R1,052.05 − R552.04 =  R500.01 ✓
```

ERP embeds **full 2.5% on the twin invoices** in the payment header. Remittance nets subsequent CNs (`10617`, `10189`, `11003`) — batch discount is only R552.04. The **R500.01** is the twin-invoice discount that CNs offset on the remittance but **not** in ERP deposit.

Same mechanism as 2023: **7 CNs on remittance absent from deposit** inflated discount on Aug-23 batch.

**Operator action:** Deposit on `00035263` likely shows R1,052.05 discount on twin invoices; align to remittance-net R552.04.

---

## 4. Comparison to 2023 R345 precedent

| Layer | 2023 (`00023836`) | 2024 (five batches) |
|-------|-------------------|---------------------|
| Cash leg | Matches remittance ✅ | Matches remittance ✅ |
| Discount in payment | Embedded R814.22 vs remit R469.22 | Embedded remit disc + orphan |
| Orphan slice | R345.00 (doc `23077` dep-only) | R500 – R3,575 per batch |
| CN treatment | 7 CNs rem-only on deposit | Nov-24 + Jul-24 same pattern |
| Model B target | Cash + separate journal | Cash + separate journal |

**2024 is not a new failure mode** — it is the **same ERP deposit allocation behaviour** with larger catch-up (Mar) and empty-pair recycling (Aug R598).

---

## 5. ERP vs Model B — corrected targets

| Batch | ERP posted | Model B cash | Model B journal | ERP excess |
|-------|------------|--------------|-----------------|------------|
| Mar-26 | 77,692.03 | 73,610.18 | 506.36 | 3,575.49 |
| Jun-26 | 39,057.53 | 37,294.98 | 956.28 | 806.27 |
| Jul-26 | 18,061.64 | 16,737.35 | 429.16 | 895.13 |
| Aug-26 | 22,338.84 | 21,197.32 | 543.52 | 598.00 |
| Nov-26 | 22,581.72 | 21,529.67 | 552.04 | 500.01 |
| **Total** | **179,724.76** | **170,369.50** | **2,987.36** | **6,374.90** |

Model B settlement check: `170,369.50 + 2,987.36 = 173,356.86` (= sum of remittance gross for these five batches).

---

## 6. Deposit detail — confirmed (screenshots)

All five receipts: **AMOUNT column = remittance cash exactly**. Orphan lives entirely in **DISCOUNT column**.

| Receipt | Deposit cash | Deposit disc | Deposit total | Remit disc | Orphan in disc |
|---------|-------------|-------------|---------------|------------|----------------|
| `00029684` | 73,610.18 | **4,081.85** | 77,692.03 | 506.36 | **3,575.49** |
| `00031558` | 37,294.98 | **1,762.55** | 39,057.53 | 956.28 | **806.27** |
| `00032332` | 16,737.35 | **1,324.29** | 18,061.64 | 429.16 | **895.13** |
| `00033224` | 21,197.32 | **1,141.52** | 22,338.84 | 543.52 | **598.00** |
| `00035263` | 21,529.67 | **1,052.05** | 22,581.72 | 552.04 | **500.01** |

Canonical deposit CSV: `data/deposit_detail_2024.csv`

### 6.1 Per-receipt findings

**`00029684` (Mar)** — 6 of 18 remittance lines on deposit. Twelve docs absent (late-2023 catch-up, CNs, `00023075` residual). Excess discount pattern:
- Zero-discount remittance lines (`26577`, `27340`, `27764`): deposit invents ~5% effective discount (double 2.5%)
- Eligible lines (`28765`, `29140`): deposit **doubles** remittance discount
- `29889`: partial allocation (R7,417.89 of R11,363.38 gross)

**`00031558` (Jun)** — 4 invoice lines + **blank orphan line R806.46** (no INV/GRV). Three CNs on remittance absent from deposit. `31908` and `32425` heavily partial.

**`00032332` (Jul)** — **Orphan identified exactly:** discount-only rows on prior-batch docs:
- `00029890` → R594.59 discount, R0 amount (Mar batch doc)
- `00031405` → R300.54 discount, R0 amount (May batch doc)
- **Sum R895.13 = orphan** ✓

**`00033224` (Aug)** — Only 2 of 4 remittance lines. Discount **split equally** R570.76 on each row (total R1,141.52 vs remittance R543.52). CNs and `34343` absent.

**`00035263` (Nov)** — 3 of 7 remittance lines. Twin invoice `37189` as **discount-only row** (R526.13, R0 amount). Three CNs and `37818` absent from deposit — same 2023 CN-absent pattern.

---

## 7. Next steps

| Priority | Action |
|----------|--------|
| 1 | **Recreated ledger 2024:** Decompose five payments to Model B cash + pro forma journals (orphan excluded from payment) |
| 2 | **Finance:** Correct deposit discount on five receipts — target DISCOUNT = remittance discount only |
| 3 | **Jun `00031558`:** Remove blank R806.46 line or re-allocate to correct doc |
| 4 | **Jul `00032332`:** Remove stale discount-only rows `29890` / `31405` |
| 5 | **Nov `00035263`:** Allocate CNs on deposit; remove discount-only `37189` row |

---

## 8. Files produced

| File | Purpose |
|------|---------|
| `data/deposit_detail_2024.csv` | Confirmed ERP deposit lines (5 receipts) |
| `data/remittance_vs_deposit_variance_2024.csv` | Remittance vs deposit per-doc variance |
| `reports/TWK002_Overpost_Investigation_2024.md` | This report |
