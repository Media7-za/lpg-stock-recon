# TWK002 — Challenge to H-027 (BS reclassification of the R8,084.67 residual)

**Generated:** 2026-09-07
**Status:** OPEN CHALLENGE — blocks H-027 posting pending operator response
**Author:** Worker (independent re-derivation, not the original analyst chain)
**Targets:** `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md`, `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` §Phase 2.5, `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md`

---

## 1. What this is

A fresh, adversarial re-derivation of the R8,084.67 account-level residual, done by re-tracing the underlying journal and remittance data rather than accepting the prior narrative conclusions. The arithmetic identity behind R8,084.67 is confirmed correct (§2). The accounting conclusion drawn from it — quarantine the whole net figure to a balance-sheet suspense asset, no P&L, "monitored" indefinitely — is **not adequately supported** and should not be posted as scoped (§3–§5).

This does not reopen H-019 (naming the components) or dispute the 7-line decomposition's arithmetic. It disputes the **collectibility conclusion** attached to one of those seven lines, and the governance around parking the net figure on the balance sheet.

---

## 2. Independent verification (what checks out)

| Check | Method | Result |
| :--- | :--- | :--- |
| 7-line identity sums to R8,084.67 | Hand-traced each line against underlying journal/remittance amounts in `TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`, `TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` | **Confirmed** — 38,791.27 + 8,950.44 + 9,894.01 + (−49,551.05) = 8,084.67 |
| B/F R38,791.27 provenance | Traced 2023 ERP raw closing (R87,226.46) → 2024 B/F → 2024 closing (R38,791.27) → current export B/F, against `raw/TWK0022023.TXT` / `raw/TWK0022024.TXT` | **Confirmed exact tie**, both years |
| Apparent conflict: `Balance_Gap_Investigation` reports "phantom" bucket at R10,502.21 vs ratified bridge R9,894.01 (R608.20 gap) | Reconstructed both figures line-by-line from the 14 phantom-class journal entries | **Resolved, not an error** — R10,502.21 is a gross-positive-only count across 12 invno refs; R9,894.01 correctly nets in two offsetting negative-invno lines (`30419`: −375.10, `34518`: −233.10) from the same hygiene journal group. Same underlying data, different aggregation rule. Neither report states this reconciliation explicitly — worth a one-line fix so a future reader doesn't re-open it as a discrepancy. |
| Reproducibility of cited scripts | Ran `node analysis/debtors/TWK002/scripts/decompose_balance_gap.mjs` as documented | **Fails silently.** Script is hardcoded to `raw/DEBENQ_TWK002.TXT` (2026-08-11 vintage, 11-invoice R110,046.87 cluster). `config/statement_of_account.json` now carries 33 `closedInvoiceOverrides` extended through STAT 129 (2026-08-30). Running the "PROVEN, reproduce via" command today against current config + stale TXT returns **Σ open invoice Due = R0.00** — every invoice in the old TXT gets overridden away by today's override list, with no version guard and no error. See §4. |

**Conclusion on the arithmetic:** the R8,084.67 figure is real and its construction is sound. The challenge is entirely about what it means and what to do about it.

---

## 3. The core objection: "not billable" is asserted for the net, not derived for each component

`TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` and the H-027 instruction treat all seven bridge lines as equally "not billable... Model B reconciliation archaeology... not debt TWK Agri owes on top of the open invoices." That holds cleanly for two of the seven:

- **`override_42468_42470` (+R8,950.44)** — invoices 42468/42470 are demonstrably paid on remittance (`TWK002_Stale_Open_Invoices_2026-08-11.md`); ERP just never tagged the settling cash. Not owed. Solid.
- **The untagged-settlement lines (−R49,551.05 total)** — these are cash/discount journals that already reduced the header; by definition they can't represent additional amounts owed. Solid.

It does **not** hold cleanly for the third positive component:

### `phantom_cn_nets` (+R9,894.01) is not generic posting noise — it traces to the same mechanism the doctrine treats as real, collectible debt everywhere else

Per `Settlement_Discount_Doctrine_v2.md` §4, Path B's two-leg catch-up journal exists specifically because *"posting a discount journal without a matching payment correction over-credits AR"* — the **payment correction leg** restores AR that gross-posting had wrongly written off. The doctrine states plainly: *"Net AR movement = orphan_slice only"* — and orphan_slice is real: it's the difference between what ERP credited the customer for and what the remittance advice proves was actually paid.

Tracing the four journal groups inside `phantom_cn_nets`:

| Group | Journals | Net (R) | What it actually is |
| :--- | :--- | ---: | :--- |
| 2023 payment correction | `00000490` / `00000491` pair | +690.00 | **Exact match** to doctrine §3's documented "2023 orphan total: R690.00 (R345×2 gross-posted batches)" |
| 2026 Mar FIX | `00000492/493` on 29684 | +3,575.49 | **Exact match** to doctrine §7's `EXC-2024-0001`: ERP re-embedded an already-paid block, creating a real R3,575.49 orphan on this receipt |
| 2025 Mar discount mirrors | `00000494–496` | +2,299.40 | Same restorative shape (negative discount leg + larger positive correction leg) on three 2024 over-post batches |
| 2026 Aug hygiene | `00000503–506` | 0.00 net, but individual batches inside it carry real amounts (e.g. `00000503` alone: +500.01 on batch 35263) | Four unrelated batches' real per-batch corrections happen to cancel in aggregate — the R0.00 total is a coincidence of grouping by *posting date*, not evidence the underlying entries are void |

Two of these four groups are **exact, named matches** to orphan-slice amounts the doctrine documents elsewhere as real debt the customer owed and Path B restored. The other two share the identical restorative structure. There is no argument anywhere in the ratified chain for why this same mechanism, once it lands in the *account-level* bucket instead of a *named STAT-batch* journal, becomes something other than real debt. It is simply relabeled "artefact" by the root-cause report and carried through to H-027 without re-testing.

**This is the crux of the challenge:** roughly R9,894.01 of the R8,084.67 net (before netting against the admittedly-real untagged/override lines) may be genuine historical shortfall that the customer still owes, buried in aggregate journals with no invoice to attach it to — not a bookkeeping ghost.

---

## 4. Collectibility ≠ root cause — the plan answers the wrong question

The ratified logic (`ERP_Opening_Balance_Fix_Plan.md` §Root cause table, `ERP_Agent_Note_H027...md`) is:

> Not a customer credit-risk loss (true, re: **origin**) → therefore not P&L write-off → therefore BS reclass, asset stays on balance sheet, "monitored."

This skips the actual test. Whether something belongs on the balance sheet as an asset turns on **collectibility**, not on **why** the balance exists. An item with no realistic path to being invoiced, chased, or recovered is not an asset regardless of how sympathetic its origin is. "Not a credit-risk loss" tells you the customer didn't default — it says nothing about whether the money is coming in.

The H-027 instruction sets no resolution trigger, no review cadence, and no de-recognition test for "AR Historical Reconciliation Suspense." Absent those, a suspense account that nothing will ever clear is functionally a write-off with the P&L hit deferred indefinitely and hidden behind a different balance-sheet caption — which is a worse outcome than a disclosed write-off, not a better one, from an audit-quality standpoint. It also isn't small relative to what it sits next to: R8,084.67 is roughly 30–44% of this account's own currently-outstanding balance (R18–27K range across the recent exports) — material at the account level even if trivial company-wide, and the plan applies no materiality framing at all.

**Reject alternative checked and confirmed correctly rejected:** full Path A restatement (reopening 2023–2024 to re-tag everything at source) remains impractical and is rightly off the table — that is not what this challenge asks for.

---

## 5. What should happen before H-027 is posted

1. **Split the collectibility call by line, not by net.** `bf_carry` and `override_42468_42470` — accept as not owed, as already ratified. `phantom_cn_nets` — do not accept "not billable" as given; require the ERP/Finance sign-off to state explicitly, batch by batch, whether each of the four journal groups' restorative amount is (a) confirmed already collected through some other posting, (b) confirmed genuinely uncollectible/immaterial to chase, or (c) still open and should be invoiced.
2. **Route (b) through an actual write-off, not a relabeled reclass.** If finance's honest answer for part of `phantom_cn_nets` is "we're not going to chase 2-year-old R500–3,500 slices," that's a legitimate call — but it's a write-off decision (disclosed, P&L or prior-period retained-earnings correction as materiality dictates) with a controller signature, not a silent BS-to-BS move dressed as "quarantine."
3. **Reserve BS suspense only for the genuinely temporary piece** — amounts pending the H-022/H-023/H-026 tagging exercise that have an actual, near-term resolution path. That is a materially smaller number than R8,084.67.
4. **Fix the reproducibility gap before trusting any rebuilt number.** `decompose_balance_gap.mjs` (and likely its siblings — not independently checked) needs to read `primaryTxt` from `config/statement_of_account.json` rather than a hardcoded path, or it will keep silently misfiring as the config moves ahead of whichever TXT happens to be hardcoded. Do not post H-027's "rebuilt residual" without confirming the rebuild script was actually pointed at the fresh H-013 TXT.
5. **Add the one-line reconciliation** between `Balance_Gap_Investigation`'s R10,502.21 and the ratified R9,894.01 (§2) so a future reader doesn't re-litigate it as a live discrepancy.

---

## 6. What this challenge does not claim

- It does not claim the R8,084.67 figure is arithmetically wrong — it isn't (§2).
- It does not claim bf_carry or the override lines are collectible — they aren't.
- It does not argue for Path A / full restatement — rejected for good reason, unchanged.
- It does not claim fraud or deliberate misstatement — this reads as a case of root-cause analysis (H-019) being quietly repurposed as a collectibility determination (H-027) without anyone re-testing the second question.

---

## 7. Epistemic status

| Claim | Tag | Kill condition |
| :--- | :--- | :--- |
| R8,084.67 identity is arithmetically correct | **PROVEN** (independently re-derived) | A fresh rebuild post-H-013/H-022/H-023/H-026 produces a different 7-line sum |
| `phantom_cn_nets` substantially represents genuine historical orphan-slice debt, not pure artefact | **ASSERTED** (traced 2 of 4 journal groups to exact doctrine-documented orphan amounts; other 2 share the same structural shape) | Finance/ERP produces batch-level evidence that the "restorative" journal legs were not, in fact, restoring real shortfalls (e.g. proof the 2024 batches in question were cash-only, not over-post, per doctrine §3's 5-and-5 split) |
| H-027 as scoped conflates root cause with collectibility | **ASSERTED** | Operator produces an explicit collectibility determination (not root-cause narrative) for `phantom_cn_nets` specifically |
| Reproduction scripts are stale relative to current config | **PROVEN** (ran it; R0.00 output) | Script fixed to derive TXT path from config, or confirmed intentionally point-in-time and relabeled as such |

---

## 8. Companion invoice-level tie-out — complete, and it narrows the challenge rather than answering it

`reports/TWK002_2023_2024_Invoice_Tieout_2026-09-07.md` (independent line-by-line re-parse of both raw 2023/2024 exports, adversarial, not assuming the prior narrative) is now done. Result: **all 77 invoices raised in 2023–2024 tie out** — to a remittance-confirmed payment, an exact/near-zero credit-note reversal, or a registered exception whose numbers were independently re-verified, not just label-checked. Zero invoices found with an unexplained non-zero net.

This rules out one alternative explanation for the R38,791.27 `bf_carry`: it is **not** hiding a specific named, still-open 2023–2024 invoice. That possibility is closed.

It does **not** touch this challenge's actual claim. The R690.00 (2023) and R6,374.90 (2024) "orphan" amounts — and by extension the `phantom_cn_nets` journals in §3 above that restore them into the current window — live entirely on the **payment side** (gross STAT-batch posting vs. remittance cash for that batch), never on an invoice's own `INVNO`. The tie-out report itself flags this distinction explicitly (§4 of that report) so it isn't mistaken for a resolution here. **Net effect: the field of "where could real, still-collectible money be hiding" is now narrower and points more precisely at the payment-side orphan corrections (§3), not at an overlooked invoice.** The core objection in §3–§5 stands undiminished.

---

## Related

- Challenges: `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md`, `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` §Phase 2.5
- Built on: `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md`, `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`, `reports/TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`, `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md`, `reports/TWK002_Balance_Gap_Investigation_2026-08-11.md`
- Companion investigation (complete): `reports/TWK002_2023_2024_Invoice_Tieout_2026-09-07.md` — closes off the "hidden unpaid invoice" hypothesis; confirms the dispute is entirely payment-side
