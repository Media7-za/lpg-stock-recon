# JEN001: analysis of the nine unallocated payments (R-96,776.51)

**Status:** PROPOSED — NOT RATIFIED. This is an analysis for the operator's ruling on Linear ADM-92 (parent ADM-82). Nothing here changes config, locks, data or reports.
**Date:** 2026-10-08. **Branch:** `claude/payment-matching-mechanisms-4h34be`.
**Inputs:**
- `raw/JEN001_2026-10-08.TXT` (sha256 `5f6c5151…`): B/F R9,461.01, window from 2025-03-03, CURRENT BALANCE R25,332.00
- `data/v5_projection.json`
- `data/projection_matches.json` (matcher v4, 44 ties, L0001 applied)
- `config/payment_pattern_overrides.json`
- `project.json` history

All paths below are relative to `analysis/debtors/JEN001/` unless stated. "Line n" means the LINE column of the TXT.

**Method.** The figures were computed in a session scratchpad from the committed TXT and projection. No repository script was run, because `match_projection.mjs` has no `--dry-run` flag and would overwrite `data/projection_matches.json`. `git status` was clean before the report was written.

---

## 0. Summary

The customer's payment history falls into three regimes. The STAT number is the month-end statement being paid: STAT 119 is September 2025, and STAT n covers month n − 112 counted from February 2025 (0 = February).

| Regime | Payments | What the customer paid | Evidence |
| :--- | :--- | :--- | :--- |
| **I. Gas only** (STAT 112–117, Mar–Aug 2025) | 37238, 38808, **38928**, 39619, 40266, 40745 | The month's LPG invoices, cent-exact or within R0.12. Cylinder deposits were left to accumulate. | Matcher ties T0038–T0040 and T0044 already follow this. 38928 is the April 2025 gas total across 5 invoices, ~~which exceeds `maxSumInvoices` 3~~ *(superseded 2026-10-08, see §7.1: missed because R0.12 exceeds EXACT_RUN's ±R0.05)*. |
| **II. Statement balance** (STAT 118–125, Sep 2025–Apr 2026) | **41247, 41812, 42224, 42597**, 42917, 43367, 43638, **43927** | The full month-end closing balance (gas and cylinders, net of credit notes). | Each amount equals a TXT running balance at month-end (§2.1). The TXT running balance is exactly **R0.00** at line 107, after 42917. |
| **III. Round amounts** (STAT 127–130, Jun–Sep 2026) | **44878**, 45717 (L0001), **46098** | R10,000 or R15,000 on account | ADM-83 ("she is paying round amounts") |

Seven of the nine payments are statement settlements. They settle known documents, so they do not fall under the ADM-83 round-amount rule:
- **Proven exact (four):** 41812, 42224, 42597 and 43927.
- **Within R0.66 (one):** 41247.
- **Statement gas total (one):** 38928.
- **Pre-window statement (one):** 37238. It pays off the B/F.

Only **44878** and **46098** are round-amount payments on account. ADM-83's wording covers them directly.

**The key proven fact:** B/F + every document dated on or before 2026-03-31 + the 14 payments up to and including 43927 (paid 2026-04-08) = **R0.00**. Line 131 shows a balance of R6,131.00 after 43927. That is exactly lines 128–130, the three documents dated 2026-04-02. So whatever basis the operator picks for the first seven, everything up to March 2026 is settled. The only real choice left is **which April–October 2026 LPG invoices stay open**.

**A conflict surfaced:** L0001 ("oldest first") was decided against `raw/DEBENQ.TXT`. That export's B/F (R22,088.10) hid April–June 2026. In the wider window, strict oldest-first would have 45717 settle April–June 2026 invoices, not July ones. See §4.

---

## 1. Per-payment proposal

Abbreviations:
- **Stmt bal**: the payment equals a statement closing balance.
- **Stmt gas**: the payment equals the statement month's LPG invoices.
- **CYL rows**: the cylinder-lane invoices and credit notes the matcher left unpaired (`data/projection_matches.json` → `residual.openInvoicesCyl` / `unmatchedCredits`).

| Payment | Date | STAT | Amount | Proposed settled documents | Part-payment / residual | Basis | §6 tag |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- | :--- |
| 37238 | 2025-03-05 | 112 (Feb 2025) | -11,013.51 | **B/F R9,461.01**, the pre-window February 2025 statement (line 1) | **R1,552.50 surplus.** It cannot be anchored to any document in the window; it is carried in the running balance and absorbed by the August 2025 statement (41247). | Stmt bal (pre-window) | B/F settled: **ASSERTED** (date and STAT order). Surplus origin: **unverified**. Surplus absorption: PROVEN (line 65 balance). |
| 38928 | 2025-05-28 | 114 (Apr 2025) | -15,774.00 | April 2025 LPG invoices **41880, 41989, 42165, 42618, 42692** (R15,773.88). This needs T0044 re-pointed (§4.2). If T0044 stays, the same amount falls on 41880, 41989, 42165, 43026, 43311. | Overpaid **R0.12**, carried in the running balance | Stmt gas: STAT 114 also carries 38808 = March gas (T0038). 38808 + 38928 = March + April gas + R0.12. | Amount: **PROVEN** (sum of TXT lines 9, 12, 15, 21, 23). Document identity: **ASSERTED**. |
| 41247 | 2025-09-18 | 118 (Aug 2025) | -14,124.10 | Every remaining open row dated up to 2025-08-31:<br>- August LPG **45372, 45635, 45758** (R12,572.44)<br>- **17 CYL rows Apr–Aug 2025**, net R3,105.00: 41990, 12197, 43312, 12559, 43489, 44051, 12770, 44423, 12874, 44798, 12976, 45092, 13044, 45373, 13128, 45759, 13267<br>- less carried credits R1,552.68 (37238 R1,552.50 + 38928 R0.12 + T0044 R0.06)<br>= closing balance **R14,124.76** | **Short R0.66**, carried to STAT 119 | Stmt bal | **PROVEN** (line 65 running balance R14,124.76; difference R0.66) |
| 41812 | 2025-10-15 | 119 (Sep 2025) | -6,769.57 | September 2025:<br>- LPG **46057, 46459, 46626** (R9,356.41)<br>- CYL **46058, 13355, 13432, 46460, 13498** (net R-2,587.50)<br>- the R0.66 carried from 41247 | Nil | Stmt bal | **PROVEN** (line 76 = R6,769.57 exactly; line 83 = R6,118.00 = lines 77–82, all October) |
| 42224 | 2025-11-12 | 120 (Oct 2025) | -11,199.05 | October 2025:<br>- LPG **46904, 47082, 47273, 47341** (R10,681.55)<br>- CYL **46905, 13625, 47083, 13679, 47274, 13738** (net R517.50) | Nil | Stmt bal | **PROVEN** (line 89 = R11,199.05; line 93 = R3,017.99 = lines 90–92, November) |
| 42597 | 2025-12-10 | 121 (Nov 2025) | -6,192.32 | November 2025:<br>- LPG **47591, 47808** (R7,227.32)<br>- CYL **47809, 13918** (net R-1,035.00) | Nil | Stmt bal | **PROVEN** (line 96 = R6,192.32; line 100 = R3,017.99 = lines 97–99, December) |
| 43927 | 2026-04-08 | 125 (Mar 2026) | -6,703.96 | March 2026:<br>- LPG **49609, 49752** (R6,186.46)<br>- CYL **49753, 14601** (net R517.50) | Nil | Stmt bal | **PROVEN** (line 127 = R6,703.96; line 131 = R6,131.00 = lines 128–130, 2026-04-02) |
| 44878 | 2026-06-25 | 127 (May 2026) | -10,000.00 | Oldest first: **50051, 50146** in full; **50318** in part (R1,972.67) | **50318: R1,476.16 open** (until 45717 or 46098 takes it) | ADM-83 FIFO (round amount) | **ASSUMED** (ruling-based; kill condition: a remittance naming invoices) |
| 46098 | 2026-09-11 | 130 (Aug 2026) | -15,000.00 | **Option A** (recommended, L0001 re-sequenced): rest of **51154** (R3,670.67); **51387, 51564, 51691, 51823** in full; **52044** in part (R947.61).<br>**Option B** (L0001 kept): rest of **50318** (R1,476.16); **50536, 50753, 50970** in full; **51154** in part (R1,196.21). | A: **52044 R3,003.68 open**.<br>B: **51154 R3,670.67 open**. | ADM-83 FIFO (round amount) | **ASSUMED** (as above) |

The September 2025 to March 2026 statement payments that are already tied are 42917 (T0041), 43367 (T0042) and 43638 (T0043). They follow the same statement-balance pattern; for example line 107 = R0.00, line 114 = R3,052.49, line 124 = R2,589.05. In those months the cylinder rows are all CN/DN pairs netting R0.00, so the LPG-only ties already equal the statement. **This proposal is consistent with them; they need no change.**

---

## 2. Alternatives tested

### 2.1 Statement-balance match (chosen for 41247, 41812, 42224, 42597, 43927)

Each payment was compared with every earlier TXT running balance:

| Payment | Matches running balance | Δ |
| :--- | :--- | ---: |
| 41247 | line 65, 2025-08-31 closing | R0.66 short |
| 41812 | line 76, 2025-09-30 closing | 0.00 |
| 42224 | line 89, 2025-10-31 closing | 0.00 |
| 42597 | line 96, 2025-11-30 closing | 0.00 |
| 43927 | line 127, 2026-03-31 closing | 0.00 |
| (tied) 42917 / 43367 / 43638 | lines 106 / 110 / 120 | 0.00 |

No exact or near (< R1) running-balance match exists for 37238, 38928, 44878 or 46098. The round payments also do not equal any statement closing: STAT 127 May 2026 closed at R23,098.04, STAT 129 at R32,486.18 and STAT 130 at R27,045.32. **PROVEN** by the TXT.

**Why chosen.** A payment equal to a month-end balance pays that statement. Every document on it is settled, including cylinder deposits and credit notes. This is `ALLOCATION_DOCTRINE.md` §2.1 *Probable*: "cleared in full through general monthly statement payments (running balance pool)". In fact it is stronger, because the amount is cent-exact.

### 2.2 Statement-month gas sum (chosen for 38928)

38928 R15,774.00 equals April 2025's open LPG invoices (41880, 41989, 42165, 42618, 42692 = R15,773.88, Δ R0.12). The matcher missed it for two reasons:
- ~~five invoices exceed `maxSumInvoices` 3 and EXACT_RUN's R0.05;~~ *(superseded 2026-10-08, see §7.1)* the five-invoice run is R0.12 off, outside EXACT_RUN's ±R0.05, and NEAR_SUM (±R1.00) stops at 3 invoices;
- T0044 had already taken 42618 and 42692.

An exhaustive subset search (≤ 5 open LPG invoices dated before the payment, ±R1.00) finds only this set in its T0044-intact form (41880, 41989, 42165, 43026, 43311). 43026/43311 and 42618/42692 have identical amounts (R3,373.27 each).

### 2.3 Oldest-first (FIFO), LPG only, across all nine (rejected for the seven STAT payments; chosen for 44878 and 46098)

This is the ADM-83 rule run unbounded from the LPG B/F (R9,978.51, ASSUMED split, `data/v5_projection.json` `openings`). It produces artificial part-payments at the boundaries between statements:

| Payment | FIFO-LPG result |
| :--- | :--- |
| 37238 | B/F + **R1,035.00 of 41880** |
| 38928 | rest of 41880 … **R1,035.12 of 45372** |
| 41247 | … **R2,586.78 of 46057** |
| 41812 | … **R3,074.93 of 46626** (R0.06 left) |
| 42224 | … **R517.44 of 47591** |
| 42597 | … **R3,691.77 of 47808** |
| 43927 | … **R3,597.35 of 49752** (R0.06 left) |

These fragments are the cylinder-lane net of each month (R1,035.00, R517.50, R-2,587.50…) leaking into LPG invoices. The customer demonstrably paid each statement in full, so splitting invoices across statements misstates what happened. **Rejected** for the seven STAT-balance and STAT-gas payments.

From April 2026 FIFO is the right tool: no statement match exists, and ADM-83 names round amounts. For 44878 and 46098 the FIFO-LPG run agrees with §1 Option B to within R0.06. That R0.06 is T0044's rounding, which FIFO-LPG drags forward instead of leaving it in the statement block.

### 2.4 FIFO within 14 days (`fifoWindowDays`) — not applicable

This is the matcher's tie-break between equally exact candidates (ADM-86). It is not an allocation rule for unmatched payments.

Applied as a window anyway, the invoices within 14 days before 44878 are 51154 and 51387 (R8,801.81 ≠ R10,000.00); none fall within 14 days before 46098 except 53029 (R4,445.57). It also leaves older invoices open while settling newer ones, which is the LIFO pattern ADM-83 replaced. **Rejected.**

### 2.5 Exact sums — rejected except 38928

The subset search (≤ 5 invoices, ±R1.00, invoices dated before the payment) results:

| Payment(s) | Result |
| :--- | :--- |
| 37238, 41247, 41812, 42224, 42597, 43927, 44878 | No hits |
| 46098 | Only coincidental 5-invoice sets from 2025 (Δ R0.16 to R0.82). Those invoices are already settled by the 2025 statements. **Rejected** as spurious. |

### 2.6 Legacy LIFO pilot (rejected)

`config/payment_pattern_overrides.json` `overrides[0]` ("JEN-STAT127-44878", LIFO, PDP-33 corrected) puts 44878 on 51387 and 51154 in full plus R1,198.19 of 50970. L0001's reason states that ADM-83 "supersedes the LIFO pilot allocation … for the v5 statement". **Rejected** for consistency; the operator should confirm this covers 44878 too (Q4).

---

## 3. Effect on open items, and the proof

**Current** (`reports/JEN001_Open_Items_v5.md`, `data/projection_matches.json`):

| Rows | Count | Amount |
| :--- | ---: | ---: |
| Open LPG invoices | 32 | R116,731.98 |
| Open CYL invoices | 23 | R121,440.00 |
| Unmatched credits | 24 | R-120,922.50 |
| Unallocated payments | 9 | R-96,776.51 |
| **Internal rows** | **88** | |

Proof: B/F 9,461.01 + tie nets −4,601.98 + those rows = **R25,332.00**.

### 3.1 Step 1 — everything up to 2026-03-31 is settled (PROVEN)

| Item | Amount | Anchor |
| :--- | ---: | :--- |
| Running balance after 43927 (line 131) | 6,131.00 | TXT |
| less documents dated 2026-04-02 (lines 128–130: −5,692.50 + 4,578.50 + 7,245.00) | −6,131.00 | TXT |
| **B/F + all rows dated ≤ 2026-03-31 + the 14 payments to and including 43927** | **0.00** | **PROVEN** |

This holds whatever basis is chosen for the first seven payments, and whether T0044 is re-pointed or not.

### 3.2 Step 2 — what remains (rows dated ≥ 2026-04-01)

| Component | Amount | Tag |
| :--- | ---: | :--- |
| LPG invoices dated 2026-04-01 → 2026-10-05 (including the L0001 documents; 51669/15205 pair nets 0) | 65,332.00 | PROVEN (TXT) |
| CYL rows dated ≥ 2026-04-01 (all, paired and unpaired) | 0.00 | PROVEN (TXT) |
| Round payments 44878 + 45717 + 46098 (43927, dated 2026-04-08, belongs to Step 1) | −40,000.00 | PROVEN (TXT) |
| **Balance** | **25,332.00** | **= ERP CURRENT BALANCE, PROVEN** |

### 3.3 Open items after the proposal

| Doc | Date | Option A (re-sequenced FIFO) | Option B (L0001 kept) |
| :--- | :--- | ---: | ---: |
| 51154 | 2026-06-11 | — | 3,670.67 |
| 51387 | 2026-06-23 | — | 3,934.93 |
| 52044 | 2026-07-23 | 3,003.68 | — |
| 52305 | 2026-08-04 | 5,199.03 | 597.11 |
| 52648 | 2026-08-19 | 4,360.11 | 4,360.11 |
| 53029 | 2026-09-07 | 4,445.57 | 4,445.57 |
| 53224 | 2026-09-21 | 3,594.28 | 3,594.28 |
| 53468 | 2026-10-05 | 4,729.33 | 4,729.33 |
| **LPG open** | | **25,332.00** | **25,332.00** |
| 15 unpaired CYL rows ≥ 2026-04-01 (50052, 14698, 50537, 50939, 14864, 14994, 14995, 50971, 15007, 51388, 15114, 53225, 15682, 53469, 15766) | | 0.00 net | 0.00 net |
| **Total** | | **25,332.00 = ERP** | **25,332.00 = ERP** |

- **Rows:** 88 → **21** (6 LPG + 15 CYL) under A, or **22** under B. Both are PROVEN against the TXT.
- **Lane split:** CYL closes at R0.00 and LPG at R25,332.00. This agrees with `data/v5_projection.json` `closings` (lpg 25,332 / cyl 0). The ASSUMED CYL opening of −517.50 sits inside the settled block, where it offsets the +517.50 of pre-April 2026 CYL rows. The proposal neither proves nor disturbs that assumption.
- **Not settled:** the 15 unpaired CYL rows from April 2026 net to zero but are not pairwise matched. This proposal leaves them as they are.

---

## 4. Conflicts with existing ties and L0001

### 4.1 L0001 (45717) — conflicts with its own principle in the wider window

L0001 was recorded against `raw/DEBENQ.TXT`. Its B/F of R22,088.10 sits after 44878, which made 51564 (2026-07-03) the oldest itemised invoice (`project.json` history 2026-10-07/08).

In `raw/JEN001_2026-10-08.TXT`, the April–June 2026 invoices 50051 … 51387 are itemised and still open. Strict oldest-first in date order runs 44878 → 45717 → 46098, and would have 45717 settle:
- **50318** (rest, R1,476.16), **50536, 50753, 50970** in full;
- **R1,196.21 of 51154**.

That is not the July invoices L0001 locks. The lock does not raise a mechanical CONFLICT, because its member keys still match the rows. But it now contradicts "oldest first", the stated basis of ADM-83.

L0001's named tripwire was only "a remittance naming invoices". A wider window was not anticipated, so reopening is the operator's call. The total outstanding is the same either way; only *which* documents show as open differs (§3.3).

### 4.2 T0044 (39619, PROBABLE, unlocked) — mis-dated but harmless

| | Documents | Total |
| :--- | :--- | ---: |
| T0044 now | 43488 (May) + **42618, 42692 (April)** | R8,366.04 |
| STAT 115 = May statement (and also FIFO, since 38928 is the earlier payment) | **43026, 43311** + 43488 (all May) | R8,366.04 |

The amounts are identical, so nothing changes in §3. **Recommend** recording the re-point when the statement block is locked, so the record reads correctly. **ASSERTED.**

### 4.3 Other ties

- T0038–T0043 (EXACT_MONTH_SUM / EXACT_SINGLE): consistent.
- The 36 CN_DN_PAIR ties: consistent. Only T0008 (42693/12405) crosses a month boundary, and it nets R0.00.

### 4.4 `config/payment_pattern_overrides.json` legacy overrides

| Override | Status under this proposal |
| :--- | :--- |
| JEN-STAT127-44878 (LIFO) | Superseded |
| JEN-STAT129-45717 (LIFO; target 51669, which credit note 15205 now fully cancels) | Already superseded by L0001 |

Per "amendments append", the main session should mark them superseded, not delete them. This session did not edit config.

### 4.5 Tooling gap — the statement settlements cannot be recorded today

`approve_tie.mjs` / `locks.mjs planApproval` accept only LPG/OTHER invoices: CYL rows and credit notes are refused (`locks.mjs:180`). `close_period.mjs` locks only CONFIRMED matcher ties. The standing match target is "LPG + OTHER as default" (`PROPOSED_Projection_Matching_Locks.md` P4).

Recording §1's statement settlements, which include CYL rows and credit notes, therefore needs one of:
- **(a)** a new lock treatment, e.g. `statement_settlement`, whose members may include CYL rows and credit notes, valid only when the payment equals a TXT running balance;
- **(b)** a "balance-forward settled-through" record for 2026-03-31, anchored on line 131.

Both are **PROPOSED — NOT RATIFIED** tooling and doctrine changes. 44878 and 46098 (LPG-only FIFO) can be recorded with today's `approve_tie.mjs --treatment part_payment`.

---

## 5. Recommended operator ruling (paste-ready)

> **ADM-92 ruling — JEN001 unallocated payments.**
> 1. **Statement settlements.** A STAT-referenced payment that equals a statement's closing balance (TXT running balance at month-end, within R1.00), or that statement month's LPG invoices, settles every document on that statement, gas, cylinders and credit notes alike. This applies to **37238** (B/F, STAT 112), **38928** (April 2025 gas), **41247** (August 2025, R0.66 short carried to STAT 119), **41812** (September 2025), **42224** (October 2025), **42597** (November 2025) and **43927** (March 2026). This is a separate basis from ADM-83. Consequence: every document dated on or before 2026-03-31 is settled (TXT line 131).
> 2. **Round amounts on account.** ADM-83 (oldest first, LPG invoices) applies to **44878** and **46098**, in payment-date order with 45717.
> 3. **L0001 is re-sequenced (Option A).**
>    - 44878 settles 50051 and 50146 in full and R1,972.67 of 50318.
>    - 45717 settles the rest of 50318, plus 50536, 50753 and 50970 in full, and R1,196.21 of 51154.
>    - 46098 settles the rest of 51154, plus 51387, 51564, 51691 and 51823 in full, and R947.61 of 52044.
>    - Open: 52044 R3,003.68, 52305, 52648, 53029, 53224, 53468 = R25,332.00.
> 4. T0044 (39619) is re-pointed to 43026, 43311, 43488 (May 2025).
> 5. The legacy LIFO overrides for 44878 and 45717 are marked superseded.
>
> **Tripwires (reopen if any occur):**
> - a customer remittance naming invoices for any of these payments;
> - a new TXT with a different B/F or window start;
> - any added, changed or back-dated document dated on or before 2026-03-31, since the ERP agent has back-dated before;
> - a pre-window statement or TXT that explains 37238's R1,552.50.

If the operator prefers to keep L0001 as recorded, replace item 3 with **Option B**:
- 44878 is as above;
- 46098 settles the rest of 50318, plus 50536, 50753 and 50970 in full, and R1,196.21 of 51154;
- open: 51154 R3,670.67, 51387, 52305 R597.11, 52648, 53029, 53224, 53468 = R25,332.00.

## 6. Questions the operator must answer

1. **Basis.** Accept "statement settlement" for the seven STAT-balance and STAT-gas payments (item 1), rather than extending ADM-83 to all nine?
2. **Cylinder scope and tooling.** Item 1 settles CYL rows and credit notes. That departs from the "LPG + OTHER as default" match target, and needs a tooling change (§4.5 a or b) before the main session can lock it. Approve the change? Until then, the seven stay unallocated in the projection, though §3.1's proof holds regardless.
3. **L0001.** Option A (re-sequence; strict oldest-first in the wider window) or Option B (keep L0001 as decided on 2026-10-08)?
4. **Legacy LIFO.** Does ADM-83 supersede the approved LIFO override for 44878 (JEN-STAT127-44878) as well as 45717?
5. **37238's R1,552.50.** Is a February 2025 statement (STAT 112) or a pre-2025-03-03 TXT available? Without one the surplus stays `unverified`. It is absorbed by the August 2025 statement either way.
6. **T0044.** Re-point to the May invoices (recommended), or leave it? The amounts are identical.

---

## 7. Amendment (2026-10-08, same session)

### 7.1 Correction — why the matcher missed 38928

The earlier wording (§0 table, §2.2) said 38928 was missed because five invoices exceed `maxSumInvoices` 3. That was wrong; it is superseded but kept above.

The matcher's EXACT_RUN rule (ADM-85) does test runs of 4–12 consecutive open invoices (`analysis/debtors/shared/scripts/projection_matcher.mjs` lines 361–384, `maxRunInvoices` 12). It tested 38928 and found the run 41880 → 42692 (R15,773.88). It rejected that run because the difference, **R0.12**, exceeds the rule's **±R0.05** (`exactTolerance`). The probable pass has no run rule: NEAR_SUM allows ±R1.00 but only 2–3 invoices. So 38928 stayed unallocated.

39619's NEAR_SUM search ran in the same probable pass and could still see the April invoices. It found six equally good combinations of the four R3,373.27 invoices, and the oldest-first tie-break picked 42618/42692. That produced T0044. **PROVEN** by re-running the run search on the committed projection: the five April invoices form the only consecutive run of 4–12 within ±R1.00 of R15,774.00.

**Consequence.** A probable "near run" rule (4–12 consecutive invoices, small rounding allowance) would tie 38928 to the April invoices first, because payments are processed in date order. That would leave 39619 a single combination, 43026 + 43311 + 43488, so T0044 would move to the May invoices without a lock. This is a portfolio-wide matcher change and is **PROPOSED — NOT RATIFIED**:
- it touches ADM-85;
- the allowance should scale, e.g. R0.05 per invoice, rather than a flat R1.00;
- it should be tested first on accounts with many equal-value invoices, MOZ002 first.

### 7.2 Suggested answers to §6 (the analysis session's view; the operator decides)

| # | Question | Suggested answer | Reason |
| :--- | :--- | :--- | :--- |
| 1 | Basis for the seven | **Statement settlement.** Keep ADM-83 for 44878, 45717 and 46098. | Four cent-exact statement balances, one R0.66 short, and line 107 at R0.00. ADM-83 rests on "she is paying round amounts", and these seven are not round. Oldest-first would split invoices at cylinder-net amounts the customer never paid (§2.3). |
| 2 | Cylinder scope and tooling | **Yes, as a narrow exception** for payments that equal a statement balance. "LPG + OTHER" stays the default. Prefer §4.5(b): **one "settled through 2026-03-31" record anchored on TXT line 131.** | When a customer pays the whole statement, its cylinder rows and credit notes are paid too (`ALLOCATION_DOCTRINE.md` §2.1 *Probable*). One record rests on the strongest proven fact, needs no per-document cylinder allocation, and has a single tripwire: any document added or back-dated to on or before 2026-03-31. §1's per-payment table stays as the explanation, not as locks. |
| 3 | L0001 | **Option A (re-sequence).** Void L0001 with a stated reason; record 44878 → 45717 → 46098 oldest-first in date order. | L0001's basis ("oldest first") now points elsewhere (§4.1). Keeping it leaves July paid while April–June show open. The total is unchanged, the lock is hours old, and no customer statement has been issued on it. |
| 4 | Legacy LIFO for 44878 | **Yes, superseded.** Mark it superseded; do not delete it. | It comes from the pilot ADM-83 replaced. Leaving it "approved" gives one customer two contradictory methods. |
| 5 | 37238's R1,552.50 | **Request the Jan–Feb 2025 ERP export or the STAT 112 statement.** Meanwhile it stays `unverified` and blocks nothing. | Only ERP evidence can settle it. It sits inside the block that nets to R0.00 (§3.1), so it does not affect open items or the R25,332.00 tie. If new evidence contradicts it, only 37238 reopens. |
| 6 | T0044 | **Re-point through the matcher fix in §7.1, not a lock.** If the matcher is not changed now, leave T0044 alone. | With a near-run rule the re-point happens by itself. Under answer 2 the settled-through record covers these invoices anyway, so a separate re-point lock would only change the record. If one is wanted anyway, it needs `--treatment customer_credit` (R0.06), because `exact` allows only ±R0.05 (`locks.mjs:197`). |

**Suggested ruling in one line (PROPOSED — NOT RATIFIED):**

> Statement settlement for 37238, 38928, 41247, 41812, 42224, 42597 and 43927, recorded as one "settled through 2026-03-31" record (TXT line 131); ADM-83 oldest-first for 44878, 45717 and 46098 in date order, with L0001 voided and re-sequenced; legacy LIFO overrides marked superseded; Jan–Feb 2025 ERP export requested for 37238's R1,552.50; T0044 left to a near-run matcher fix.

---

## 8. Operator ruling (2026-10-09, ADM-92)

**Recorded from the operator's instruction in session, 2026-10-09: "I agree with your answers, record the ruling."** The answers are those in §7.2. This section records the decision. It does **not** write locks or config: that is for the main recon session (see "Not done yet").

> **ADM-92 ruling — JEN001 unallocated payments.**
> 1. **Statement settlement.** Payments 37238, 38928, 41247, 41812, 42224, 42597 and 43927 each pay a statement: the month-end closing balance, or for 38928 that month's LPG invoices. They settle every document on that statement, gas, cylinders and credit notes alike. Separate basis from ADM-83.
> 2. **Recording.** The seven are recorded as **one "settled through 2026-03-31" record**, anchored on TXT line 131 (`raw/JEN001_2026-10-08.TXT`). This is a narrow exception to "LPG + OTHER as default", limited to payments equal to a statement balance. §1's per-payment table is the explanation, not seven locks.
> 3. **Round amounts.** ADM-83 oldest-first applies to 44878, 45717 and 46098, in payment-date order.
> 4. **L0001 voided and re-sequenced (Option A).** 44878 settles 50051 and 50146 in full and R1,972.67 of 50318. 45717 settles the rest of 50318, 50536, 50753 and 50970 in full, and R1,196.21 of 51154. 46098 settles the rest of 51154, 51387, 51564, 51691 and 51823 in full, and R947.61 of 52044. Open: 52044 R3,003.68, 52305, 52648, 53029, 53224, 53468 = R25,332.00 (PROVEN, §3.3).
> 5. **Legacy LIFO overrides** for 44878 and 45717 are marked superseded, never deleted.
> 6. **37238's R1,552.50** stays `unverified`. The Jan–Feb 2025 ERP export, or the STAT 112 statement, is to be requested.
> 7. **T0044** (39619) is left as it is. It moves to the May 2025 invoices only if a near-run matcher rule is later approved.
>
> **Tripwires (reopen if any occur):**
> - a customer remittance naming invoices for any of these payments;
> - a new TXT with a different B/F or window start;
> - any document added, changed or back-dated to on or before 2026-03-31;
> - a statement or TXT that explains 37238's R1,552.50.

**Not done yet (for the main recon session):**
- **Tooling for item 2.** There is no way to record a "settled through" record today. `approve_tie.mjs` refuses CYL rows and credit notes (`locks.mjs:180`). The agreement covers recording it that way; the tool itself has to be built or extended.
- **Item 4 locks.** Void L0001 (`close_period.mjs --void-lock L0001 --reason …`) and record the three oldest-first locks.
- **Item 5.** Append a "superseded" note to the two legacy overrides in `config/payment_pattern_overrides.json`.
- **The near-run matcher rule behind item 7 is not approved.** It still needs its own decision and a test on MOZ002 first.

This section is the record of the operator's decision; the projection, locks and config are unchanged until the main session acts.
