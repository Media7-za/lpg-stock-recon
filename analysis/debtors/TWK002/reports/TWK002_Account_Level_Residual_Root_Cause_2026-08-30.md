# TWK002 — account-level residual root cause (2026-08-30)

> **AMENDMENT 2026-08-31 — root cause below is FALSIFIED. Ruling reopened.**
> Operator supplied AR Control **GL** = **R26,498.36**, equal to the debtor sub-ledger header on
> `raw/DEBENQ.TXT` to the cent. GL and sub-ledger **agree**, so the "sub-ledger ↔ GL
> desynchronization" root cause named in §Headline cannot stand. The divergence is between **ERP**
> and **this repo's remittance-authoritative reconstruction**.
> The **identity** (`header − Σ statement open = R8,084.67`) remains **PROVEN** and is unaffected.
> **H-027 is on hold.** See `reports/TWK002_H027_Evidence_Challenge_2026-08-31.md`.
> Superseded text is retained below unaltered per the amendments-append rule.

**Question:** What *is* the R8,084.67, and what posting action can change it?

**Authority (decomposition):** `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` — 7 lines sum to the gap (PROVEN).  
**Authority (execution):** `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` — Phase 2 tagging claim **superseded** by this finding.  
**Reproduce identity:** header − Σ(statement open) on any paired TXT + `config/statement_of_account.json`.

---

## Headline

There is **no missing invoice of R8,084.67**. The amount is a **header arithmetic plug**:

```
Account-level residual := ERP header − Σ(statement open invoices)
```

| As-at | Header | Statement open | Residual | Source |
| :--- | ---: | ---: | ---: | :--- |
| 2026-08-11 snapshot | 118,131.54 | 110,046.87 | **8,084.67** | `snapshots/2026-08-11_v1/manifest.json` **PROVEN** |
| 2026-08-30 TXT (pre H-025) | 27,721.81 | 18,413.69 | **9,308.12** | `raw/DEBENQTWK002CURRENT.TXT` + live SOA **PROVEN** |
| 2026-08-30 after journal `00000510` | 26,498.36 | 18,413.69 | **8,084.67** | export − H-025 **PROVEN** arithmetic (`project.json` history) |

STAT 129 settled the R110,046.87 billable cluster. Residual **survived**. Only the new Path B discount journal moved the plug (by exactly −R1,223.45), then restored **R8,084.67** against the post-journal header.

**Root cause (operator-ratified 2026-08-30 evening):** **sub-ledger ↔ GL desynchronization.**

1. **Historical gross posting** — 11 STAT batches (2023–2024) at gross instead of cash + discount, inflating B/F.
2. **Blank / phantom INVNOs** — Path B journals and cash saved with blank or non-existent invoice numbers.

Those unallocated credits and phantom journals sit in **AR Control** (header) with no open-invoice line. The seven bridge lines classify that leftover; they are not knobs tagging can turn to zero.

*(Afternoon wording — Path B leftover / header plug — still true as the identity. The evening wording names the ERP failure mode.)*

---

## Why tagging cannot move it

Allocation (H-022, H-023, H-026) assigns **already-posted** cash to invoice rows. It does not post new money.

| Action | Header | Statement open | Residual |
| :--- | :--- | :--- | :--- |
| Tag `00037770` (H-022) | unchanged | unchanged (targets already off the remittance open list) | **unchanged** |
| Tag `00039080` → 42468/42470 (H-023) | unchanged | unchanged (already in `closedInvoiceOverrides`) | **unchanged** |
| Tag `00045899` (H-026) | unchanged | unchanged (STAT 129 overrides already applied) | **unchanged** |
| Post journal `00000510` (H-025) | −1,223.45 | unchanged | **moves** |

Tagging is ERP **hygiene** (open-invoice screen, tag-check gate, audit trail). It is not a residual lever.

---

## The seven lines are a decomposition, not a to-do list

From `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` (PROVEN identity):

```
gap = B/F + override_invoices + phantom_cn_journals + untagged_settlements
    = 38,791.27 + 8,950.44 + 9,894.01 + (−49,551.05)
    = 8,084.67
```

| ID | Amount | What it is in ERP | Tagging effect on residual |
| :--- | ---: | :--- | :--- |
| `bf_carry` | +38,791.27 | Pre–Mar 2025 lump in the export — not restated as invoice rows | none |
| `override_42468_42470` | +8,950.44 | Paid on remittance; still positive ERP nets; stripped from statement open | none (override already removed them from billable) |
| `phantom_cn_nets` | +9,894.01 | Path B journals tagged to invnos with **no Invoice row** | none |
| `stat112_untagged` | −35,693.84 | Receipt `00037770` already in the header, blank INVNO | none (cash already posted) |
| `stat114_untagged` | −7,306.68 | Untagged slice of `00039080` already in the header | none |
| `stat123_orphan` | −1,249.77 | Untagged slice of `00043500` already in the header | none |
| `pathb_journals_untagged` | −5,300.76 | Path B discount journals, blank INVNO | none |

H-019 **already named** this mix. Searching for an eighth mystery posting repeats a closed investigation.

---

## What the leftover actually is

Two opposing forces (same report, §Headline finding / gap investigation):

1. **Header still carries** B/F + override invoice nets + phantom journal nets that the statement open list correctly excludes.
2. **Header was already reduced** by untagged STAT cash and blank-INVNO Path B journals that never attached to invoice rows.

Net of those two forces = **R8,084.67**. It is Model B **reconciliation archaeology** — Path B's price for fixing settlement totals in the open period without restating 2023–2024 invoice tags. It is **not** debt TWK Agri owes on top of the open invoices.

The 2023 Path B pair inside the soup (journals `00000490` / `00000491`) nets **+R690.00**, matching the documented 2023 remittance-vs-ERP closing variance. That is a *component*, not the whole residual.

---

## What can actually change the residual

| Route | Effect | Status |
| :--- | :--- | :--- |
| **1. Accept** — leave residual in AR Control | Header stays above billable | **SUPERSEDED 2026-08-30 (evening)** |
| **2. P&L / bad-debt write-off** | Hits expense | **Rejected** — not credit-risk |
| **3. Current-period BS reclass** — DR AR Historical Reconciliation Suspense / CR AR Control | Header = open invoices; artefact quarantined on BS | **Ratified** — **H-027**. Instruction: `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` |
| **4. Full Path A restatement** | Still would not zero B/F without rewriting pre–Mar 2025 history | **Rejected** |

**Quarantine sequence (operator):** H-022 → H-023 → H-026 → rebuild bridge → H-027 post **rebuilt** residual → fresh TXT → strip 42468/42470 overrides if ERP closed → `reconState: complete`.

Tagging is **required before** H-027 (exhaust allocations; cleaner composition). It is **not** a residual-total lever. Tagging a credit to a still-open invoice would **widen** the gap (header unchanged, open shrinks). H-022/H-023/H-026 targets are already off the remittance open list, so the net should stay R8,084.67.

---

## Dead ends (do not retry)

| Approach | Why it failed |
| :--- | :--- |
| Find the “missing invoice” of R8,084.67 | Identity is fully decomposed; no eighth doc |
| Tag STAT 112 / 114 / 129 to close the gap | Cash already in the header; statement open already remittance-filtered |
| Another Path B **discount** journal to close R8,084.67 | Discount maths is posted; this leftover is not a settlement-discount shortfall |
| P&L write-off / 240000 | Operator: artefact is BS quarantine, not expense |
| Treat residual as billable opening balance | Operator locked `customerDueBasis: open_invoices` |
| Path A restatement to zero B/F | Rejected; period-locked; would not zero the lump without rewriting history |

---

## Tripwires

| Closed ruling | Reopens if |
| :--- | :--- |
| Residual = header − statement open (not a missing invoice) | Fresh TXT + config produce a gap that does **not** equal the (rebuilt) bridge-line sum ± known new blank-INVNO journals |
| Tagging is not a residual lever | A tag post is observed to change **header** (that would mean a new journal was posted, not allocation) |
| R8,084.67 not billable | `customerDueBasis` set to `erp_header` without re-ratification |
| Accept residual in AR Control | **Superseded** — H-027 is BS reclass |
| H-027 = BS reclass (not write-off) | Journal posted to 240000 or bad-debt expense |

**Kill condition (ASSUMED):** if a fresh full-history export restates B/F as named invoice rows *and* Path B journals carry real INVNOs, rebuild the bridge — the plug identity may collapse to zero without H-027.
