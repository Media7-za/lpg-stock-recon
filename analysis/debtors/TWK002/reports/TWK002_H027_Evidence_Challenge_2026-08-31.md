# TWK002 — H-027 evidence challenge (2026-08-31)

**Status:** `PROPOSED — NOT RATIFIED`
**Class:** Tripwire fired on a ratified ruling. Worker session — §7 authority: this memo **stages** a reversal; it does not enact one.
**Operator decision required:** hold or proceed on H-027.

**Reopens:** `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` (root cause) ·
`docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` (posting instruction).

---

## 1. Trigger — the tripwire that fired

The root-cause report named this reopen condition:

> Residual = header − statement open (not a missing invoice) | **Reopens if** fresh TXT + config produce a gap that does not equal the (rebuilt) bridge-line sum…

and the H-027 note asserted:

> **Root cause (operator-ratified 2026-08-30):** sub-ledger ↔ GL desynchronization.

**Operator supplied 2026-08-31:** AR Control **GL** balance for TWK002 = **R26,498.36**.

That equals the debtor **sub-ledger** header on `raw/DEBENQ.TXT` to the cent. GL and sub-ledger
**agree**. The ratified root cause is **falsified**.

| Claim | Prior tag | Corrected tag |
| :--- | :--- | :--- |
| Header − Σ(statement open) = R8,084.67 | PROVEN | **PROVEN** (unchanged) |
| Root cause is sub-ledger ↔ GL desync | ASSERTED (ratified) | **FALSIFIED** — GL = sub-ledger |
| AR Control GL = R26,498.36 | — | **ASSERTED** — operator-supplied in session; no GL extract in `raw/`. See §7 action 1 |

The divergence is therefore **ERP (GL and sub-ledger, in agreement) vs. this repo's
remittance-authoritative reconstruction** — not an internal ERP inconsistency.

---

## 2. What R8,084.67 must now be

With GL agreeing, exactly three hypotheses remain, and the current artifacts **cannot
distinguish them**.

| # | Hypothesis | Consequence for H-027 |
| :---: | :--- | :--- |
| **a** | Real unpaid pre-Mar-2025 debt that the open-invoice model cannot see, because B/F is an unitemised lump | H-027 would **quarantine collectable debt** — must not post |
| **b** | Customer over-credited (empty-return CNs exceeding entitlement) | Wrong sign — a liability/refund, not a suspense asset |
| **c** | Genuine posting artefacts netting out | H-027 valid exactly as ratified |

Hypothesis (a) is **live, not theoretical** — see §3.

---

## 3. The B/F does not fully tie — two unexplained crumbs

> **AMENDMENT (same day) — §3 IS WITHDRAWN. The crumbs were my own comparison error.**
>
> R1,600.30 and R1,497.13 do not exist. They were produced by comparing ERP **gross** invoice
> amounts against `allocation_edges.csv` `allocated_amount`, which is **net of settlement
> discount**. Mixing the two bases manufactures phantom variances.
>
> On a consistent gross basis the tie is **exact**:
>
> ```
> BATCH-2025-03-31 gross payable (8 docs)   35,922.77
> cash receipt 00037770 (STAT 112)         -35,693.84
> discount journal 00000508                   -228.93
>                                          ─────────
>                                               0.00
> ```
>
> The correct CN figures are the ERP row amounts (−15,870.00, −10,350.00, −13,282.50,
> −15,352.50 = −54,855.00), not the discount-net allocations I used (−53,483.63).
>
> **Consequence: hypothesis (a) in §2 is DISPROVEN.** A full invoice-level reconstruction of the
> pre-Mar-2025 universe finds **zero true orphans** — every charge is either named on a
> remittance advice or fully reversed by a credit note. No collectable debt hides in the B/F.
> See `reports/TWK002_BF_Invoice_Level_Reconstruction_2026-08-31.md`.
>
> **H-028 is therefore no longer a blocker** — remittance doc-matching substitutes for the
> missing `INVNO` column, so the re-export is optional corroboration rather than a prerequisite.
>
> §1 (GL falsifies the desync root cause), §5.1 (stale exhibit), §5.2 (self-fulfilling identity),
> §5.4 (asset recognition), §5.5 (no clearing plan) and §6 (script defects) **all stand**.
> Superseded text retained below unaltered.

`raw/TWK0022024.TXT` (`YEAR: 2025 MARCH`) closes at exactly R38,791.27 and names four real
Jan–Feb 2025 invoices inside the B/F. Allocation edges **AL-0109–0116** map STAT 112 receipt
`00037770` onto those invoices and their empty-return CNs. The tie is close but **not exact**:

```
Jan–Feb 2025 invoices (39683, 40081, 40459, 40950)   90,777.77
their empty-return CNs (11648, 11743, 11821, 11953) −53,483.63
                                                    ─────────
net of CNs                                           37,294.14
STAT 112 cash 00037770                              −35,693.84
                                                    ─────────
unposted difference                                   1,600.30   ASSUMED
B/F 38,791.27 less that cluster                       1,497.13   ASSUMED
```

**PROVEN:** the four invoice amounts, the four CN amounts, and the R35,693.84 cash — all read
directly from `raw/TWK0022024.TXT`, `raw/DEBENQ.TXT`, and `data/allocation_edges.csv`.

**ASSUMED:** that R1,600.30 and R1,497.13 are artefacts rather than debt. STAT 112's Path B
discount journal was only **R228.93** (`00000508`), so neither crumb is explained by a posted
settlement discount. Both sit inside the B/F and **cannot be resolved from current artifacts**
— see §4.

---

## 4. Blocking artifact gap — allocation detail missing on the B/F window

The window that produces the B/F was exported with allocation detail **switched off**, so its
`INVNO` column is blank on every row. That single flag is why the B/F cannot be tied to invoices.

| ERP `YEAR` | Window | B/F | Closing | Allocation detail |
| :--- | :--- | ---: | ---: | :--- |
| `2024 FEBRUARY` | 28 Apr 2023 → 26 Feb 2024 | 0.00 | 87,226.46 | Included — `INVNO` populated |
| `2025 MARCH` | 27 Mar 2024 → 24 Feb 2025 | 87,226.46 | **38,791.27** | **`EXCLUDE: ALLOCATION DETAIL`** |
| `CURRENT` | Mar 2025 → Aug 2026 | 38,791.27 | 26,498.36 | Included |

The chain ties exactly (0.00 → 87,226.46 → 38,791.27 → 26,498.36), so **history coverage is
complete**. There is no `YEAR: ALL` to pull and no missing year. The defect is the flag.

**Required artifact:** re-export `YEAR: 2025 MARCH` with allocation detail **included** and
`SORT ORDER: DOCUMENT DATE`, matching how `raw/DEBENQ.TXT` was produced.

This is also the documented **kill condition** on the root-cause report — if B/F resolves into
named invoice rows, the plug may collapse without H-027.

---

## 5. Defects in the existing H-027 evidence base

### 5.1 The seven-line bridge is stale — it does not describe the current export

`config/balance_bridge_lines_detailed.json` is dated **2026-08-11**, computed against header
R118,131.54 / open R110,046.87. Re-running the same classification on `raw/DEBENQ.TXT`:

| Bucket | Aug-11 ratified | Recomputed on `raw/DEBENQ.TXT` |
| :--- | ---: | ---: |
| `bf_carry` | 38,791.27 | 38,791.27 |
| `override_*` | 8,950.44 | **116,480.10** |
| `phantom_cn_nets` | 9,894.01 | **11,187.77** |
| `untagged_settlements` | −49,551.05 | **−158,374.47** |
| **Sum** | **8,084.67** | **8,084.67** |

The **sum** is robust; the **composition** is not. The H-027 note instructs Finance to attach the
seven-line bridge as the suspense narrative — that exhibit describes a state that has not existed
since 11 August. Journal `00000511` (H-022) has since added nine rows referencing CN docs that
have no row in the current window.

### 5.2 The identity is self-fulfilling, so the bridge cannot evidence non-collectability

The buckets are a **complete partition** of every export row plus B/F. Therefore
`bf + override + phantom + closed + untagged = header − open` holds **by construction**, for any
partition, on any TXT. That is why the recomputation above still lands on 8,084.67 with entirely
different components.

`"ties": true` proves the parser is internally consistent. It does **not** prove the residual is
non-collectable. Non-collectability rests on remittance evidence plus the operator's
`customerDueBasis: open_invoices` decision (**ASSERTED**) — the bridge sum is not evidence for it.
The existing reports blur these two claims.

### 5.3 `bf_carry` and `stat112_untagged` are the same money seen from two sides

`+38,791.27` (invoices raised pre-window) and `−35,693.84` (the cash that settled them, posted
in-window with a blank INVNO) are **one timing artefact** across the export boundary, not two
independent strata. Journal `00000511` nets to exactly **R0.00** and tags precisely those
documents — confirming the pairing and confirming that allocation does not move the header.

Presenting them as separate archaeological buckets overstates how unexplained the residual is.

### 5.4 Asset-recognition problem

With GL confirming R26,498.36 receivable while we assert R18,413.69 collectable, R8,084.67 has no
identified future economic benefit. Reclassifying it to `AR Historical Reconciliation Suspense`
**relabels** the recognition question rather than answering it. The doctrinally clean outcomes are
impairment (P&L — operator-rejected) or recovery (hypothesis (a)). H-027 as written sits between
two positions already ruled out.

### 5.5 No clearing plan for the suspense account

The H-027 note says the asset "stays on the balance sheet, monitored" but names no monitoring
mechanism, review date, or clearing condition. A permanent unexplained suspense balance is itself
an audit finding — plausibly worse than a named residual in AR with a documented bridge.

---

## 6. Operational defects found while testing (independent of the ruling)

| # | Defect | Risk |
| :---: | :--- | :--- |
| 1 | `scripts/build_balance_bridge.mjs` is hardcoded to `raw/DEBENQ_TWK002.TXT`. With the expanded override list it reports `Sum open 0.00` and gap **R118,131.54**. `--write` **overwrites** `config/balance_bridge_lines.json` with those figures. | The H-027 note's stated prerequisite ("rebuild the bridge") **destroys the ratified artifact** and yields a nonsense residual |
| 2 | `scripts/investigate_balance_bridge_lines.mjs` is hardcoded to the same stale TXT | Cannot rebuild the seven lines as instructed |
| 3 | `analysis/debtors/TWK002/DEBENQ.TXT` (account root) is byte-identical to `raw/TWK0022023.TXT` — the `2024 FEBRUARY` window with B/F 0.00 — but shares a filename with the current export | Wrong-file trap: md5 `94cee8c2…` vs current export `72e0d112…` |

---

## 7. Proposed sequence — `PROPOSED — NOT RATIFIED`

> **AMENDMENT (same day):** action 2 is **complete by analysis** — see §3 amendment. The
> re-export is now optional corroboration, and the hold in action 3 rests on action 1 plus the
> stale-exhibit and asset-recognition points only.

| # | Action | Owner | Purpose |
| :---: | :--- | :--- | :--- |
| 1 | Land a **GL extract artifact** in `raw/` showing AR Control for TWK002 | Finance | Promotes the R26,498.36 datum from ASSERTED to PROVEN (§6 requires an artifact path) |
| 2 | ~~Re-export **`YEAR: 2025 MARCH` with allocation detail**~~ — **superseded**, resolved by remittance doc-matching | ERP Agent | ~~Resolves hypothesis (a) vs (c)~~ — **done**: zero true orphans |
| 3 | **HOLD H-027** until 1 lands | Operator | Substance now supports quarantine; framing and exhibit still need repair |
| 4 | Proceed with **H-023** and **H-026** | ERP Agent | Harmless hygiene; unaffected by this challenge |
| 5 | Fix `build_balance_bridge.mjs` — parameterise the TXT path; refuse to `--write` when open sum is 0 | Worker | Remove the config-destroying trap |
| 6 | Rebuild the seven lines on the post-H-022 export | Worker | Replace the stale exhibit |
| 7 | Remove or rename the stray root `DEBENQ.TXT` | Worker | Remove wrong-file trap |
| 8 | Re-tag the root-cause report per §1; append, do not delete | Worker | §6 compliance; amendments append |

**If the operator proceeds with H-027 regardless:** post the **rebuilt** residual, not R8,084.67
from memory, and record in the journal narrative that the GL agreed with the sub-ledger and that
the B/F was not itemised at posting date. That preserves the audit trail for a later reversal.

---

## 8. What is unchanged

| Ruling | Status |
| :--- | :--- |
| Customer bills **open invoices only** (R18,413.69) | **Unchanged** — collections posture not affected |
| Tagging (H-022/H-023/H-026) is hygiene, not a residual lever | **Unchanged** — confirmed by `00000511` netting to R0.00 |
| P&L / bad-debt write-off rejected | **Unchanged** |
| Snapshot `2026-08-11_v1` is STALE — do not send | **Unchanged** |
| Residual is not billable to TWK Agri **on the current open list** | **Unchanged** — but §2(a) means it may be billable pre-window debt |

---

## 9. Tripwires on this memo

| Ruling here | Reopens if |
| :--- | :--- |
| GL agrees with sub-ledger | A GL extract shows AR Control ≠ R26,498.36 |
| B/F contains possibly-collectable debt | `2025 MARCH` re-export with allocation detail resolves R1,600.30 and R1,497.13 to artefacts |
| Seven-line bridge is stale | Bridge rebuilt on a current export and re-ratified |
| H-027 held | Operator ratifies proceeding, or hypothesis (c) is proven |

---

## Related

| Asset | Path |
| :--- | :--- |
| Root cause (reopened) | `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` |
| H-027 instruction (on hold) | `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` |
| Seven-line provenance (stale) | `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` |
| B/F provenance | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` |
| Fix plan | `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` |
| Human tasks | `analysis/debtors/shared/HUMAN_TASKS.md` H-027, H-028 |
