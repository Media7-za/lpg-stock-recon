# ERP Agent Note — TWK002 H-027 current-period BS reclassification

**Account:** TWK002 — TWK AGRI PTY LTD · ref B226  
**Task:** **H-027**  
**Class:** Current-period **balance-sheet reclassification** — not DISCOUNT ALLOWED, not bad-debt write-off, not Path A restatement  
**Workspace:** `analysis/debtors/TWK002/`

**Do not post until** H-022, H-023, and H-026 are done **and** the post-tag bridge is rebuilt. Post the **rebuilt residual**, not a remembered number.

---

## Problem

AR Control (debtor header) is permanently higher than the remittance-authoritative open-invoice sub-ledger by **R8,084.67** (identity after STAT 129 + journal `00000510`).

**Root cause (operator-ratified 2026-08-30):** sub-ledger ↔ GL desynchronization — historical STAT batches posted at gross; Path B and cash saved with blank or phantom INVNOs. Those credits/journals sit in AR Control with no open-invoice line.

**Not billable.** Collections bills open invoices only (`customerDueBasis: open_invoices`).

**Cite:** `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` · `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` (7-line provenance).

---

## Prerequisites (ERP Agent)

| # | Task | Receipt | Authority |
| :---: | :--- | :--- | :--- |
| 1 | **H-022** STAT 112 tags | `00037770` | `allocation_edges.csv` AL-0109–0116 |
| 2 | **H-023** STAT 114 tags | `00039080` → inv **42468 / 42470** | STAT 114 remittance |
| 3 | **H-026** STAT 129 tags | `00045899` | AL-0171–AL-0191 |
| 4 | Fresh TXT + rebuild | — | `node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write` |

Tagging does **not** change the residual *total*. It clears the ERP open-invoice screen, lets `closedInvoiceOverrides` for 42468/42470 be removed after verification, and collapses override/untagged *composition* so the journal narrative is clean.

---

## Required ERP action — one current-period journal

**Open period only.** Do not reopen 2023–2024.

| Field | Value |
| :--- | :--- |
| **Account** | TWK002 |
| **Entry type** | Journal |
| **Date** | Current open period (posting date) |
| **INVNO** | **Blank** — this is account-level quarantine, not an invoice settlement |
| **Amount** | **Post-tag rebuilt residual** — expected **R8,084.67** CR on debtor. If the rebuilt bridge ≠ 8,084.67 ± R0.01, **stop and escalate** — do not force the old figure |
| **GL** | **CR** Accounts Receivable Control (TWK002) · **DR** dedicated BS account *AR Historical Reconciliation Suspense* |
| **GL code** | Finance assigns the suspense account — **do not use 240000 / DISCOUNT ALLOWED** |

### Lines

| Account | Debit (R) | Credit (R) | Narrative |
| :--- | ---: | ---: | :--- |
| AR Historical Reconciliation Suspense (BS) | *rebuilt residual* | | Reclass of proven historical posting artefacts. Provenance: `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` (7 lines). Root cause: `TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md`. |
| Accounts Receivable Control — TWK002 (BS) | | *rebuilt residual* | Remove non-billable residual so AR header equals open-invoice sub-ledger. |

Optional: split into the seven post-tag bridge line amounts instead of one net. Same GL pair; same total. Standard practice is **one net journal + attachment**.

### Narrative (minimum)

```
TWK002 H-027 BS reclass. Quarantine non-billable residual (header − open invoices).
Not discount. Not bad debt. See 7-line bridge + root-cause report 2026-08-30.
```

---

## Why this shape

| Constraint | How this journal meets it |
| :--- | :--- |
| No P&L | Pure BS: DR suspense / CR AR |
| No historical restatement | Current open period only |
| Root cause isolated | Noise leaves active AR; 7-line bridge is the suspense narrative |
| Not a write-off | Asset stays on the balance sheet, monitored |

---

## Forbidden

| Do not | Why |
| :--- | :--- |
| DISCOUNT ALLOWED / GL **240000** | Residual is not a settlement-discount shortfall |
| Bad-debt / P&L write-off | Artefact, not a credit-risk loss |
| Opening-balance edit that zeros B/F R38,791.27 | B/F is 11 STAT batches; accepted historical carry |
| Post before H-022 / H-023 / H-026 + rebuilt bridge | Composition not exhausted; overrides still required |
| Force R8,084.67 if rebuilt residual differs | Identity must be re-proven on the post-tag TXT |

---

## After post (Worker)

1. Fresh TXT (H-013).
2. Confirm **header = Σ statement open invoices** (expected header **R18,413.69** if open list unchanged: 52484 + 52803).
3. Confirm suspense = posted residual.
4. Remove **42468 / 42470** from `closedInvoiceOverrides` **only if** ERP now shows them closed.
5. Set `collapseAccountLevelAsOpeningBalance: false` when gap is **R0.00**.
6. Comment: account-level residual reclassified to BS suspense on [date]; active AR header matches open-invoice subtotal.
7. Phase 4: `reconState: complete` after finance sign-off.

---

## Related

| Asset | Path |
| :--- | :--- |
| Fix plan | `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` |
| Root cause | `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` |
| 7-line provenance | `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` |
| Human task | `analysis/debtors/shared/HUMAN_TASKS.md` H-027 |
