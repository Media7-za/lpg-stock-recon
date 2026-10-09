# TWK002 — How far can the 69 open rows be reduced? (ADM-94)

**Status: PROPOSED — NOT RATIFIED.** An analysis session proposes; the operator rules (AGENTS.md §7). Nothing here is a lock, a config change or a matcher change.
**Generated:** 2026-10-09 · **Brief:** Linear ADM-94 (parent ADM-82). The Linear connector worked; ADM-94 had no comments. `docs/handoffs/2026-10-08.md` ends at §9; there is no §10, so §8–§9 and the ADM-94 text were used.
**Inputs (all committed, read-only):** `raw/TWK002_2026-10-08.TXT` (ERP R54,136.19), `data/v5_projection.json`, `data/projection_matches.json`, `data/remittance_evidence.json`, `data/remittance_lines_2026.csv`, `data/allocation_edges.csv`, `raw/DEBENQ.TXT` (2026-08-31 export *with* allocation detail), `raw/DEBENQ_TWK003.TXT`, `raw/DEBENQ_TWK004.TXT`, `raw/TWK0022024.TXT`, `ERP RAW DATA/DETRANS.TXT`, `config/statement_of_account.json`, `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md`, `reports/TWK002_STAT123_Remittance_2026-02-18.md`, `reports/TWK002_H027_Collectibility_Challenge_2026-09-07.md`.
**Tags (doctrine §6):** PROVEN = reproduced from a cited artifact. ASSERTED = stated by a report or inferred, not independently reproduced. ASSUMED = working assumption. `unverified` = no anchor.
**Amended 2026-10-09 after a doctrine review — see §8.** The first version did not read `DEBTORS_DOCTRINE.md`, `ALLOCATION_DOCTRINE.md` or the TWK002 doctrine in `docs/`. Superseded passages are marked in place and kept.

---

## 1. Bottom line

* **69 open rows can fall to 10 internal rows** (18 on the customer preview, 10 once the four remaining probable ties are approved). The 10 are the documents dated after STAT 129 (2026-08-12 to 2026-10-08), R46,051.52, which no payment has yet reached. **AMENDED (§8.7):** the customer preview stays at 14 until two of the four probable ties have Crd Note tag evidence.
* **The ERP tie is kept in every step:** R38,791.27 B/F + open rows + tie nets = **R54,136.19** (arithmetic in §3).
* **Evidence-backed, no pattern-guessing.** Three remittance batches (STAT 114 / payment 39080, STAT 123 / payment 43500, STAT 129 journal 510) settle 33 of the 69 rows with R0.00 net. Every document is settled whole, not in part. The matcher stops short only because of three gaps (split lines, sister-site lines, discount journal not paired). In a scratch copy of the matcher those three fixes take TWK002 from 69 open rows to 36 and change **no row on the other eight projected accounts** (§5).
* **The remaining 26 rows are all pre-window.** Payment 37770 (R35,693.84) plus journal 508 (R-228.93) settle eight documents that sit in the B/F (R35,922.77, PROVEN). The 24 other journals (490–507, net R+5,216.17) are Path B corrections to pre-window payments; they pair with no invoice or credit note. They need an operator ruling, not a matcher rule.
* **What cannot be reduced:** the unitemised pre-window residual R8,084.67 (= B/F R38,791.27 − R35,922.77 + R5,216.17). It is the same figure as the ratified 2026-08-11 bridge and is the subject of the open H-027 challenge. It stays a named line.

---

## 2. Open-row groups (the 69 rows, internal view)

| # | Group | Rows | Amount (R) | Proposed treatment | Evidence | §6 tag | Operator ruling needed |
| :-: | :--- | ---: | ---: | :--- | :--- | :--- | :--- |
| G1 | Payment 43500 (STAT 123) and the 25 TWK002 document rows it pays (19 invoices as 22 LPG/CYL rows, 3 credit notes) | 26 | 0.00 (−176,824.24 + 176,824.24) | Tie as one whole-batch REMITTANCE (CONFIRMED). Sister-site lines (8 invoices, R63,501.62) are out of scope for this account. | `data/remittance_evidence.json` BATCH-2026-STAT-123; `raw/DEBENQ_TWK003.TXT` line 10 and `raw/DEBENQ_TWK004.TXT` line 8 (slices R38,501.31 + R25,000.31); `raw/DEBENQ.TXT` LINE 65–84 (ERP allocation of 43500 to the same 20 invoices); `config/statement_of_account.json` `closedInvoiceOverrides` (ratified 2026-08-30) | PROVEN for sums and allocation; ASSERTED that advice line "Crd Note 10" is the second line of CN 13716 | **Yes** (adopt P8 `payerGroup`; confirm the "10" alias) |
| G2 | Payment 39080 (STAT 114), journal 509, and LPG rows of 42050, 42468, 42470 and CN 12215 | 6 | 0.00 (−15,365.65 − 393.99 + 15,759.64) | Tie as REMITTANCE with lane-aware split of 41747 (its CYL row belongs here, its LPG row to G1) | `data/remittance_evidence.json` BATCH-2025-05-31; `raw/DEBENQ.TXT` LINE 26–27 (ERP tagged 39080 → 42050 R8,058.97); `closedInvoiceOverrides` 42050/42468/42470 | PROVEN | **Yes** (split-remittance rule P-b) |
| G3 | Journal 510 `STAT 129 … PAID 31/08/2026` | 1 | −1,223.45 | Absorb into STAT 129 tie T0001 (net +1,223.45) so the discount shows as cleared | `data/projection_matches.json` `residual.tieNets` 1,223.45; `remittance_evidence.json` `discountJournal` 00000510; TXT LINE 111 | PROVEN | Yes (P9 completion) |
| G4 | Payment 37770 (STAT 112) and journal 508 (−228.93) | 2 | −35,922.77 | `applied_to_bf` against eight itemised B/F documents (39683, 40081, 40459, 40950; CN 11648, 11743, 11821, 11953) | `raw/TWK0022024.TXT` LINE 19–22 and 49–52; `remittance_evidence.json` BATCH-2025-03-31; `allocation_edges.csv` AL-0109…AL-0116; `raw/DEBENQ.TXT` journal 511 LINE 151–159 (ERP's own allocation of 37770 to those documents) | PROVEN | **Yes** (P7) |
| G5 | Path B correction journals 490–507 (24 rows: 490, 491×6, 492, 493, 494×2, 495×2, 496×2, 499–502, 503–506, 507) | 24 | +5,216.17 | Do not tie. Report as one named opening-adjustment line next to the B/F. | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` §3–§4 (Σ payment over-posts 13,381.38 − Σ discounts 8,165.21 = 5,216.17); `raw/DEBENQ.TXT` journals' INVNO column points at payments 22182…36195, never at an invoice | PROVEN for the total; ASSERTED for collectibility (H-027 open) | **Yes** |
| G6 | Documents after STAT 129: 52484 (LPG + CYL), CN 15443, 52803 (LPG + CYL), CN 15553, 53077, 53350, 53507, CN 15775 | 10 | +46,051.52 | Stay open. Await the next remittance. | TXT header `UD PAY/CHEQUES 0.00`; no payment row after 45899 (2026-08-26) | PROVEN | No |
| | **Total** | **69** | **14,121.47** | | `data/projection_matches.json` (69 open, R14,121.47) | PROVEN | |

Check: 26 + 6 + 1 + 2 + 24 + 10 = 69 rows; 0.00 + 0.00 − 1,223.45 − 35,922.77 + 5,216.17 + 46,051.52 = 14,121.47. ✔

> **AMENDED (§8.2):** per D15 the §6 tags above describe the sums and identities only. The ties themselves are edges (Confirmed / Probable), not PROVEN facts. ERP *payment* tagging cited above (`raw/DEBENQ.TXT` LINE 26–27, 65–84; journal 511) is corroboration only (`business_rules.md` §15 rule 3). G1–G4 rest on the remittance (order A rung 1) and `allocation_edges.csv` (rung 2). Evidence basis for G1–G4: `REMITTANCE_BACKED`.

**Ties already in place (not in the 69):** four probable ties remain after the changes — 51180 + CN 15063 (LPG and CYL, 2 ties), 53078 + CN 15646, 53351 + CN 15714 (8 rows). Recommendation in §4.6.

### G6 detail (stays open)

| Document | LPG (R) | CYL (R) | Date |
| :--- | ---: | ---: | :--- |
| 52484 / CN 15443 (DN#23954) | 6,926.34 | 11,212.50 − 11,040.00 | 2026-08-12 |
| 52803 / CN 15553 (DN#24938) | 11,142.35 | 17,250.00 − 17,077.50 | 2026-08-26 |
| 53077 (DN#24836; CYL paired with CN 15637) | 8,448.07 | — | 2026-09-10 |
| 53350 (DN-21388) | 12,748.90 | — | 2026-09-29 |
| 53507 / CN 15775 (DN#23843) | 14,375.86 − 7,935.00 | — (header fallback, lines not in the DB, ADM-93) | 2026-10-08 |
| **Total** | | | **46,051.52** |

---

## 3. Projected count and proof against the ERP

Three states, all tying to the ERP header R54,136.19 (`raw/TWK002_2026-10-08.TXT` line 4, PROVEN).

| State | Internal open rows | Open rows R | Other terms | Sum |
| :--- | ---: | ---: | :--- | ---: |
| Today (matcher v5, `data/projection_matches.json`) | 69 | 14,121.47 | B/F 38,791.27 + tie nets 1,223.45 | **54,136.19** |
| After matcher fixes M1–M3 (evidence only; §5) | 36 | 15,344.92 | B/F 38,791.27 + tie nets 0.00 | **54,136.19** |
| After rulings on G4 and G5 | 10 | 46,051.52 | Opening residual 8,084.67 (below) + tie nets 0.00 | **54,136.19** |

Arithmetic, state 3:

```
B/F (unitemised)                                        38,791.27   PROVEN  TXT line 14
 − payment 37770 applied to 8 B/F documents            −35,693.84   PROVEN  TXT line 10
 − discount journal 508 (same batch)                      −228.93   PROVEN  TXT line 107
 + Path B correction journals 490–507 (24 rows)         +5,216.17   PROVEN  Σ TXT lines 2–7, 65–66, 87–93, 96–99, 102–106
 = opening residual (named line)                         8,084.67
 + 10 open post-STAT-129 rows                           46,051.52
 + tie nets (all REMITTANCE and pair ties net 0.00)          0.00
 = ERP CURRENT BALANCE                                  54,136.19   variance R0.00
```

Cross-checks that make this more than a rearrangement:

* 38,791.27 + Σ69 rows 14,121.47 + T0001 net 1,223.45 = 54,136.19. ✔ (`residual.rebuiltClosing`)
* 2,868.50 (= 38,791.27 − 35,922.77) + 5,216.17 = **8,084.67**, the figure ratified in `config/statement_of_account.json` `balanceBridgeLines` and in `reports/TWK002_Balance_Bridge_2026-08-11.md`. Two independent decompositions give the same residual. PROVEN.
* Journals 490–507: 690.00 (490/491) + 3,575.49 (492/493) + 2,299.40 (494–496) − 1,235.94 (499–502) + 0.00 (503–506) − 112.78 (507) = 5,216.17. ✔
* Customer-preview count: 79 today; 44 after M1–M3 (36 + 8 probable-tie rows); 18 after G4/G5 rulings; **10** once the four probable ties are approved.

---

## 4. The seven investigation points

### 4.1 Pre-window evidence for the B/F and batch 37770 (P7)

* **Chain:** 2024 TXT closes at R38,791.27 = current B/F; 2023 closes at R87,226.46 = 2024 B/F (`TWK002_Pre_Mar2025_BF_Bridge` §1). PROVEN, so the P7 completeness test passes.
* **What can be itemised:** eight documents. In `raw/TWK0022024.TXT` invoices 39683 (26,765.92), 40081 (15,608.03), 40459 (22,945.95), 40950 (25,457.87) and credit notes 11648, 11743, 11821, 11953 are listed with no later settlement. Σ = **R35,922.77**. Payment 37770 R35,693.84 + discount R228.93 = R35,922.77 exactly. Remittance lines sum to cash, line by line (`remittance_evidence.json`). ERP's own journal 511 (31/08/2026, R0.00 net, `raw/DEBENQ.TXT` LINE 151–159) allocates 37770 to these eight documents. PROVEN.
  * Arithmetic: 90,777.77 invoices − 54,855.00 credit notes = 35,922.77.
* **What cannot:** R2,868.50 of the B/F is not tied to any named document. Its only anchor is the batch mechanics in the 2026-08-11 bridge (ASSERTED there). `unverified` at document level.
* **Why the matcher stops:** documents 39683… are outside the projection, so "documents not available". A P7 lookback (not built) would supply them.

### 4.2 Split remittance for invoice 41747

* 41747 = LPG R12,226.63 + CYL R19,837.50 = R32,064.13 (`v5_projection.json`).
* STAT 114 (payment 39080) pays R19,341.56 + discount R495.94 = **R19,837.50** (the CYL row), and flags R12,226.63 as "already paid" (`remittance_evidence.json`, BATCH-2025-05-31).
* STAT 123 (payment 43500) pays **R12,226.63** (the LPG row) and flags R19,837.50 as already paid (`data/remittance_lines_2026.csv` line 2, note `already_paid_col=19837.50`; `remittance_footer_capture_2026.csv`).
* The two advices are mirror images: 19,837.50 + 12,226.63 = 32,064.13. ERP agrees: 43500 was allocated 10,976.86 to 41747 and R1,249.77 unreferenced (= CN 12215), together R12,226.63 (`raw/DEBENQ.TXT` LINE 65–66). PROVEN.
* **Proposal:** a lane-aware split. Tie 41747 CYL (and CN 12131 CYL) into the 39080 batch, and 41747 LPG into the 43500 batch. Require that all batches together settle the document and that exactly one lane subset equals the advice's share.
* **Loose end (ASSERTED):** STAT 114 (advice dated 2025-05-19) calls R12,226.63 "already paid", yet the only cash that pays it is STAT 123 (Feb 2026). ERP first allocated R12,226.63 of 37770 to 41747 on 28/03/2025 and then reversed it (`ERP RAW DATA/DETRANS.TXT`). No other receipt of R12,226.63 exists in `ERP RAW DATA/DETRANS.TXT`, `CURRENT.TXT` or `2024.TXT` (searched; the only hits are the two 37770 allocation/reversal rows). 37770's cash is fully used by its eight documents, so no cash trace supports a second payment. Question Q4.
  > **SUPERSEDED (§8.3):** doctrine v2 §7 already rules that an advice's "already paid" amount is informational and never new settlement. `TASK-PH2-GAP-01` (`data/finance_posting_checklist_2025_phase2.csv`) closed STAT 111/113/115–122 as "not separate batches until evidence". Q4 is withdrawn: STAT 123 is the sole payment of 41747's LPG row.

### 4.3 Payer group STAT 123 (TWK002 / TWK003 / TWK004)

* **One receipt, three postings (PROVEN):** 43500 on 2026-02-25 is TWK002 R176,824.24, TWK003 R38,501.31 (`raw/DEBENQ_TWK003.TXT` line 10), TWK004 R25,000.31 (`raw/DEBENQ_TWK004.TXT` line 8). Σ = **R240,325.86** = advice cash.
* **Documents per account:**
  * TWK003 holds 46857, 47076, 47523, 47880 = 3 × 11,000.44 + 5,499.99 = R38,501.31 (the whole TWK003 slice).
  * TWK004 holds 46858, 47176, 47297, 47584 = 9,000.36 + 3,000.12 + 7,000.28 + 5,999.55 = R25,000.31 (the whole TWK004 slice).
  * All other advice lines are TWK002 documents; each equals the whole-document ERP amount (LPG + CYL) to the cent, except CN 13716 (below). Their paid total is **R176,824.24 = payment 43500 on TWK002**.
* **Nothing must move in the ERP.** The ERP already splits the receipt by account. TWK002 already shows only its own slice. The gap is in the matcher, which refuses a batch when any line is not in this account's projection.
  > **AMENDED (§8.4):** not a new finding. Doctrine v2 §1 already rules that TWK002/TWK003/TWK004 are posting buckets for one remittance ("Σ cash slices = remittance cash; not three separate batches"). `TASK-2026-0001` (DONE 2026-08-10) records the R176,824.24 slice. `shared/HUMAN_TASKS.md` H-014 ("resolve STAT 123 … R63,501.62 shortfall") is still listed OPEN although this answers it.
* **CN 13716:** the advice lists it as −9,315.00 and as "Crd Note 10" −6,900.00 (same date 23.10.2025). ERP CN 13716 is −16,215.00 = 9,315 + 6,900. The ERP allocation of 47196 (R20,416.64 = 36,631.64 − 16,215) confirms the full CN was applied (`raw/DEBENQ.TXT` LINE 81). The doc number "10" is a truncated parse of the second line. PROVEN for arithmetic; ASSERTED for the identity. Needs an alias (Q2).
* **TWK003 R−300.00** is a site-ledger difference (47866, CN 13933/13966, 47991), not a TWK002 item (`TWK002_STAT123_Remittance_2026-02-18.md`).

### 4.4 The 2026-07/08 invoices and STAT 129

* STAT 129 (payment 45899, R108,823.42) is tied (T0001) and covers documents up to 52241 (2026-07-31) and CN 15370 (2026-08-01). All July invoices are already settled. PROVEN.
* Of the 25 open rows dated 2026-07 to 2026-08, **19 are journals** (490–491 dated 07-12, 499–502 dated 07-23, 503–509 dated 08-09, 510 dated 08-26) and 6 are the CYL/CN rows of 52484 and 52803. Only the August documents 52484 and 52803, and the September/October documents, are genuinely unpaid.
* No payment exists after 2026-08-26 and the TXT header shows `UD PAY/CHEQUES 0.00`, so no unconfirmed receipt is hiding. PROVEN.
* **Pattern:** the customer pays in lumps: monthly to May 2025, then STAT 123 (Feb 2026, for May 2025–Jan 2026) and STAT 129 (Aug 2026, for Feb–Jul 2026). The expected next advice for the August documents is about R18,413.69 gross (52484 + 52803 less CNs 15443 and 15553), about R17,953 cash at the 2.5% discount STAT 129 applied to documents from June. ASSUMED; the discount rate is read from `remittance_evidence.json` lines 51226 onwards.
  > **SUPERSEDED (§8.5):** doctrine v2 §2 grants the 2.5% only if paid within 30 days of the invoice month-end. The August documents' deadline was 2026-09-30 and has passed, so the next advice should pay them at 100%: about **R18,413.69** cash (ASSUMED), not R17,953.

### 4.5 The 27 open journals (R3,369.80)

| Journal(s) | Date | Amount (R) | What it is | Pairs with an invoice/CN? |
| :--- | :--- | ---: | :--- | :--- |
| 490 (+4,019.12) and 491 (6 lines −3,329.12) | 2026-07-12 | +690.00 | 2023 payment corrections and discount mirrors (6 batches) | No. INVNO = payments 22182…26681 |
| 492 (−506.36) and 493 (+4,081.85) | 2026-03-01 | +3,575.49 | Batch 29684 (EXC-2024-0001) | No. INVNO = payment 29684 |
| 494, 495, 496 (6 lines) | 2025-03-01 | +2,299.40 | Batches 31558, 32332, 33224 | No |
| 499, 500, 501, 502 | 2026-07-23 | −1,235.94 | Discounts, batches 30419, 35263, 31365, 34518, 36195 | No |
| 503, 504, 505, 506 | 2026-08-09 | 0.00 | Tagged re-posts of the same batches | No |
| 507 | 2026-08-09 | −112.78 | Discount, batch 36467 (STAT 110, pre-window) | No |
| 508 | 2026-08-09 | −228.93 | Discount, batch 37770 (STAT 112) | Pairs with G4 |
| 509 | 2026-08-09 | −393.99 | Discount, batch 39080 (STAT 114) | Pairs with G2 |
| 510 | 2026-08-26 | −1,223.45 | Discount, STAT 129 | Pairs with G3 |

* Source of every row: TXT LINE 2–7, 65–66, 87–93, 96–99, 102–111; INVNO targets from `raw/DEBENQ.TXT` (the allocation-detail export). PROVEN.
* They are settlement-discount and Path B correction journals, not pending invoices. Journals 508–510 clear against their batches. Journals 490–507 relate only to pre-window payments.
* **Caution (ASSERTED, unverified):** −375.10, −552.04 and +1,052.05 appear in both journal 499 and journals 503/504 (net +124.91 twice); the block total still equals the bridge identity because a −124.91 offset sits in 501/505/506. So the block ties only in aggregate. Do not lock per batch. This echoes the H-027 challenge (`TWK002_H027_Collectibility_Challenge_2026-09-07.md` §3).

> **SUPERSEDED (§8.6):** the finance checklists explain this. Journals 490–509 total exactly what `data/finance_posting_checklist.csv` and `…_2025_phase2.csv` expect (2023 R690.00 + 2024 R4,638.95 − 2025 R735.70 = R4,593.25). Journals 499 (+124.91), 505 (+108.19) and 506 (−233.10) are not on the checklist and net R0.00. The Oct-24 partial (journal 334 and the ghost line on 34518, −R385.04 each, inside the B/F) has not been reversed as doctrine v2 §8 requires. That is the known "Sep/Oct" line-level gap in `docs/TWK002_Model_B_Position.md`.

### 4.6 Probable ties and cylinder netting

* **Probable ties.** After M1–M3, four remain:

| Tie | Documents | Lag | Extra evidence | Recommendation |
| :--- | :--- | ---: | :--- | :--- |
| 44731 + CN 12958 | DN#12191 | 2 days | Both listed on STAT 123; ERP INVNO tag on CN (`raw/DEBENQ.TXT` LINE 34–35) | Becomes CONFIRMED by the STAT 123 tie; no approval needed |
| 51180 + CN 15063 (LPG and CYL, 2 ties) | DN#22798, order 00013935 | 3 days | Same order number; ERP INVNO tag on CN (`raw/DEBENQ.TXT` LINE 100–101); exact reversal of R29,721.98 | Approve |
| 53078 + CN 15646 | DN#24985, R22,000.00 | 4 days | Same DN, exact amount; no tag evidence (after 2026-08-31) | Approve (weakest; Q6) — **SUPERSEDED (§8.7):** hold |
| 53351 + CN 15714 | ref "21388", R19,837.50 | 0 days | Identical bare reference and amount; matcher requires "DN" in the ref, so it fell to CN_AMOUNT_DATE | Approve |

> **AMENDED (§8.7):** `DEBTORS_DOCTRINE.md` §4 ranks DN references as structural ("groups; never settles") and `ref_no` as advisory. `business_rules.md` §15 makes ERP Crd Note tagging usable evidence (order A rung 3). So only 51180 + CN 15063 (CN tagged to 51180) is recommended for approval now. For 53078 + CN 15646 and 53351 + CN 15714, first obtain an allocation-detail export showing the CN's INVNO, or record operator judgement with its basis (§15 rule 7).

* **Cylinder netting.** The five open CYL invoices (R84,007.50) against five CYL credit notes (−R76,072.50) net **R7,935.00** (PROVEN, `projection_matches.json` `residual`). It decomposes as:
  * 43294 / CN 12550: +172.50; 43909 / CN 12724: +345.00; 47196 / CN 13716: +7,072.50. Total **R7,590.00**, all settled **in cash** by STAT 123 (the advice pays the invoices gross and the credit notes at face; PROVEN, §4.3). Not an open item.
  * 52484 / CN 15443: +172.50; 52803 / CN 15553: +172.50. Total **R345.00**, genuinely open (in G6).
  * 7,590.00 + 345.00 = 7,935.00. ✔
* **Today's documents.** CN 15775 is −R7,935.00, equal to the gross CYL net above. Both 53507 and CN 15775 have no DB lines yet (HEADER_FALLBACK, ADM-93). If CN 15775 is a cylinder credit it may be an ERP-agent clean-up of that net rather than a delivery-specific credit. ASSUMED; Q5.

> **AMENDED (§8.8):** under `ALLOCATION_DOCTRINE.md` §1.3, deposits the customer paid in cash convert those cylinders to customer-owned. The R7,590.00 paid on STAT 123 is therefore a custody conclusion, and D19 blocks it until the custody scope of `ingestGate` clears. `DEBTORS_DOCTRINE.md` §4 also requires CYL residuals to decompose to whole cylinders at a dated price. That check was not run: `unverified`.

### 4.7 Matcher gaps

See §5. Evidence-backed: M1, M2, M3, plus rulings on G4 and G5. Pattern-based: none recommended.

---

## 5. Matcher and tooling changes proposed

All PROPOSED — NOT RATIFIED. I prototyped M1–M3 in a scratch copy of the shared scripts (not committed) and ran it on all nine projected accounts against their committed `projection_matches.json`.

| # | Change | Kind | Pseudo-rule | Effect on TWK002 | Risk on other accounts |
| :-: | :--- | :--- | :--- | :--- | :--- |
| M1 | **Split lines in a remittance** (P-b) | Evidence | For a line where paid + discount < gross: find the lane subset of the document's free rows with Σ = paid + discount (±R0.05). Accept only if exactly one subset fits **and** the evidence batches together settle the whole document (Σ over batches of paid + discount = gross). Tie only that subset. | Resolves batch 39080 (41747 CYL here, LPG with 43500). | Unchanged open rows on 8/8 other accounts, incl. MD0003 (the only other account with remittance evidence). A wrong subset needs two lanes of equal amount; the uniqueness test refuses that. |
| M2 | **Payer group partition** (P8) | Evidence | Config `payerGroup`, sister TXTs, optional `remittanceDocAliases`. Lines whose document sits on a sister account's TXT are `OUT_OF_SCOPE_SITE`. Require Σ in-scope paid = payment (±max(R0.05, 0.1%)). Recommended extra check: Σ same-numbered payments across the group = advice cash (176,824.24 + 38,501.31 + 25,000.31 = 240,325.86). | Ties payment 43500 and 25 document rows. With M1 it absorbs 17 existing CN pair ties and the CYL exchange tie (see §6). | Opt-in by config, so no effect on accounts without `payerGroup`. Risk: a document missing from this account's projection because of an ingest gap could be mislabelled as a sister document. The Σ check and the sister-TXT lookup catch it. |
| M3 | **Discount journal clears pending discount** (P9) | Evidence | For a REMITTANCE tie with net ≠ 0 and a unique free Journal with amount = −net (±R0.05), dated on or after the payment date: add it to the tie. | Journals 509 and 510 join their ties. Journal 508 joins 37770 once G4 is ruled. | Needs a unique exact amount; no other account's open rows changed. Never matches a tie with net 0. |
| M4 | **Pre-window batch tie** (P7 lookback) | Ruling now, rule later | If a payment's batch names documents outside the projection that a prior TXT (chain-verified to the B/F) lists as open at the B/F, and Σ lines = payment, tie as `applied_to_bf` with the documents itemised. | G4 (2 rows, R35,922.77). | Needs a chain-verified older TXT; no-op elsewhere. Use `approve_tie.mjs --payment 37770 --treatment applied_to_bf`; the discount journal 508 needs `approve_tie` to accept journals (small tool change). |
| M5 | **Named opening adjustment for pre-window journals** | Ruling | Config list of journal documents (490–507) reported as one line next to the B/F, not as open rows. Not a heuristic. | G5 (24 rows). | None; explicit list. |
| M5′ | *(Amended, §8.9 — replaces M5)* **Reuse the ratified bridge lines** | Ruling | Do not create a new line. In the v5 open-items view, show G4/G5 under the ids already ratified in `config/statement_of_account.json` `balanceBridgeLines` (`bf_carry`, `stat112_untagged`, `phantom_cn_nets`, `pathb_journals_untagged`) as P7/P8 named residuals (P3 proof identity). | Same 26 rows. | None. |
| — | Widen `cnConfirmedMaxDays` from 1 to 5 | **Not recommended** | — | Would confirm T0011–T0016 type pairs | 45 probable CN pairs on seven accounts sit at 2–5 days (FIR001 5, JEN001 3, MD0003 5, MON001 2, SA0001 9, TAN002 17, TWK002 4). A blanket change confirms them all on a lag alone. Approve by evidence instead. |

**Prototype result (scratch, read-only):**

| Account | Committed open rows | Prototype open rows |
| :--- | ---: | ---: |
| FIR001 | 21 | 21 |
| JEN001 | 22 | 22 |
| MD0003 | 32 | 32 |
| MON001 | 8 | 8 |
| MOZ002 | 2 | 2 |
| RED001 | 6 | 6 |
| SA0001 | 6 | 6 |
| TAN002 | 41 | 41 |
| **TWK002** | **69** | **36** (REMITTANCE ties: 39080 R0.00, STAT 123 R0.00, STAT 129 R0.00) |

Proof holds on all nine. No lock exists on TWK002, so none was bypassed. Working tree untouched (`git status` clean).

**Evidence-backed vs pattern-based:** M1–M3 apply only where the customer's own advice names the documents and the totals reconcile (remittance evidence, rank 1). G4 rests on remittance plus ERP's own allocation journal. G5 is a ruling, not a pattern. **No pattern-based settlement is proposed.** G6 stays open for lack of any payment, in line with "a customer very rarely pays part of an invoice" and "UD is not a payment".

---

## 6. Conflicts with existing ties and locks

* **Locks:** none. `projectionLocks` is empty (`locksApplied 0`, `lockConflicts []`). Legacy `overrides` in `config/payment_pattern_overrides.json` are registry v1 (16 `VERIFIED_REMITTANCE_BATCH_MATCH` entries, 2023-06 to 2024-12, all pre-window); they are not read by the v5 matcher and do not conflict.
* **Ratified statement-side rulings agree.** `config/statement_of_account.json` `closedInvoiceOverrides` (33 documents, `allocationGate` RATIFIED 2026-08-30, method `remittance_explicit`) already marks every G1/G2 document paid (e.g. 41747 "Settled on STAT 114 remainder + STAT 123"). The v5 open-items view currently contradicts that ratified list; the proposal removes the contradiction.
* **Ties re-homed, not contradicted.** Because REMITTANCE runs before the pair rules, 18 of the 31 committed ties move into the remittance ties: 16 CONFIRMED CN pairs, 1 PROBABLE pair (T0011, 44731 + 12958, upgraded to CONFIRMED) and the CYL_EXCHANGE tie (T0031). Their nets were R0.00 and stay R0.00. Thirteen ties stay as they are.
* **Open tripwires on the proposal:** a remittance advice that contradicts a tie reopens it; TWK003/TWK004 slices that stop reconciling per batch reopen P8 (`PROPOSED_Projection_Matching_Locks.md` Tripwires). H-027 stays open for the R8,084.67 residual.

---

## 7. Questions for the operator (one-line answers)

1. **Q1 (P8):** Adopt `payerGroup` for TWK002 so that sister-site lines on a remittance are out of scope, and tie 43500 on TWK002's R176,824.24 slice alone? (yes/no) — **ANSWERED (§8.15):** no; consolidated parent instead.
2. **Q2:** Is the STAT 123 advice line "Crd Note 10 −R6,900.00" the second line of CN 13716 (9,315 + 6,900 = 16,215)? (yes/no) — **ANSWERED (§8.17):** yes; an advice-line identity only.
3. **Q3 (P-b):** Accept lane-aware split remittances, so 41747 is tied CYL to STAT 114 and LPG to STAT 123? (yes/no)
4. **Q4:** STAT 114 calls R12,226.63 of 41747 "already paid" before 2025-05-19, but only STAT 123 pays it. Do you accept STAT 123 as the sole payment, or should finance check the bank for an earlier R12,226.63? (accept / check) — **WITHDRAWN (§8.3):** answered by doctrine v2 §7.
5. **Q5:** Is CN 15775 (−R7,935.00, DN#23843, 2026-10-08) a cylinder credit or a gas credit? (cylinder / gas / unknown until ADM-93 syncs)
6. **Q6:** Approve the four probable ties (51180 + CN 15063 ×2 lanes, 53078 + CN 15646, 53351 + CN 15714)? (all four / list the exceptions) — **AMENDED (§8.7):** now Q6′ in §8.10.
7. **Q7 (P7):** Rule payment 37770 and journal 508 as `applied_to_bf` against the eight itemised B/F documents (R35,922.77)? (yes/no) — **ANSWERED (§8.18): yes.**
8. **Q8:** Report journals 490–507 (R+5,216.17) as one named opening-adjustment line, not 24 open rows, until H-027 is decided? (yes/no) — **AMENDED (§8.9):** now Q8′ in §8.10.
9. **Q9:** Is a September 2026 remittance advice for 52484 and 52803 (about R18,413.69 gross) on file or expected? (on file / expected on date / none)
10. **Q10:** Should the main session build M1–M3 into `projection_matcher.mjs` and rerun TWK002 only, after you rule on Q1–Q3? (yes/no) — **ANSWERED (§8.18): yes.**

---

## Appendix A — STAT 123 line mapping (TWK002 slice)

All figures from `data/remittance_evidence.json` BATCH-2026-STAT-123 and `data/v5_projection.json`; "whole" = advice gross equals the ERP document total (LPG + CYL).

| Document | Advice paid (R) | ERP document total (R) | Match |
| :--- | ---: | ---: | :--- |
| 41747 | 12,226.63 | 32,064.13 (LPG 12,226.63 + CYL 19,837.50) | LPG row only (CYL paid by STAT 114) |
| 12502, 43112, 12550, 43294 | −17,250.00; 27,899.34; −14,835.00; 24,433.21 | same | whole |
| 43909, 12724, 44235, 12825, 44542 | 27,762.26; −16,905.00; 27,762.26; −17,250.00; 27,762.26 | same | whole |
| 44731, 12958, 44816, 12908, 12982 | 7,687.52; −5,175.00; 7,687.52; −17,250.00; −5,175.00 | same | whole |
| 44967, 13019, 45148, 45302, 13101 | 22,515.01; −13,972.50; 3,768.78; 20,104.97; −11,730.00 | same | whole |
| 45666, 45986, 46470, 46762 | 25,831.19; 27,559.27; 32,866.71; 11,091.26 | same | whole |
| 13235, 13335, 13500, 13587 | −16,215.00; −16,905.00; −20,700.00 (two lines of −10,350); −7,245.00 | same | whole |
| 47196, 13716 (+ line "10") | 36,631.64; −9,315.00 + −6,900.00 | 36,631.64; −16,215.00 | whole (alias) |
| 47714, 13874, 48160, 48687, 14237, 14034 | 24,390.86; −15,870.00; 24,336.02; 35,150.03; −22,770.00; −15,180.00 | same | whole |
| Sister-site (8 invoices) | 63,501.62 | not in TWK002 | out of scope |
| **TWK002 total** | **176,824.24** | | **= payment 43500 (TWK002 slice)** |

Σ: 240,325.86 (advice cash) − 63,501.62 (sister lines) = 176,824.24. ✔

## Appendix B — what was not done

* No script wrote to the repository; the prototype ran from a scratch copy and its outputs were discarded. No `approve_tie`, `close_period` or reconcile was run. `config/`, `data/`, `project.json`, locks, doctrine and handoffs are untouched.
* Not verified: the composition of the R2,868.50 B/F residual at document level; whether journals 499/503/504 repeat amounts by error or design; whether TWK003/TWK004 TXTs are current (they carry no export date).

---

## 8. Amendment — doctrine review (2026-10-09)

The operator asked whether earlier doctrine on TWK002 had been read. It had not been, in full. These sources were read for this amendment:

* `analysis/debtors/shared/DEBTORS_DOCTRINE.md` (constitutional, ratified 2026-07-20; D14–D19);
* `analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md`;
* `analysis/debtors/shared/docs/business_rules.md` §15;
* `PROPOSED_Projection_Matching_Locks.md` P1–P3, P5–P6 (the first pass read P4, P7–P11);
* `docs/TWK002_Settlement_Discount_Doctrine_v2.md`, `docs/TWK002_Model_B_Position.md`, `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` (ratified 2026-08-29/30);
* `data/finance_posting_checklist.csv`, `data/finance_posting_checklist_2025_phase2.csv`;
* `reports/TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md` (summary), `reports/TWK002_Overpost_Investigation_2024.md` (summary);
* `shared/HUMAN_TASKS.md` H-013, H-014, H-022–H-027;
* `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` (scope only).

Not read: `TWK002_Settlement_Discount_Doctrine_v1.md` (superseded by v2), `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` beyond its headings, and `SKILL_Payment_To_Invoice_Allocation.md`, which doctrine v2 §13 rules "not applicable" to TWK002.

The headline does not change: 69 → 36 open rows on evidence, 10 after rulings, ERP tie R0.00. What changes is how it is framed, which rulings are new, and three of the questions.

### 8.1 What the doctrine already decides (the proposal must align with it)

| Topic | Already ruled | Source | Effect on this report |
| :--- | :--- | :--- | :--- |
| Multi-site remittance | One remittance across TWK002/3/4 reconciles as Σ cash slices = remittance cash | Doctrine v2 §1; `TASK-2026-0001` DONE | P8/M2 implements an existing account rule; it is not a new policy |
| "Already paid" on an advice | Informational; never new settlement | Doctrine v2 §7 | Q4 withdrawn |
| Remittance outranks ERP tagging | Advice plus a reconciling batch total wins; an advice naming an invoice still shown open reopens it | `DEBTORS_DOCTRINE.md` §5; `business_rules.md` §15 rule 6 | G1/G2 are mandatory under existing doctrine, not discretionary |
| Retiring paid invoices | Through `closedInvoiceOverrides` with the evidence reference | `business_rules.md` §15 rule 5 | All G1/G2 documents are already retired there (ratified 2026-08-30). v5 is the surface out of step. |
| Projection grain | Per document per lane; the LPG row may be retired while the CYL row stays | P2 (resolved 2026-10-05) | Lane-aware split (M1) is within the ratified grain |
| Proof identity | Open items + unallocated + journals pending + **named residuals** = ERP balance | P3 | G4/G5 belong in named residuals |
| B/F and residual | B/F R38,791.27 accepted as historical carry; R8,084.67 is not billable; lever is H-027 BS reclass (challenged 2026-09-07) | Fix Plan (ratified 2026-08-29/30); Model B Position | The residual is not new and not collectable; customer statement bills open invoices only |
| Discount eligibility | 2.5% only within 30 days of invoice month-end; late documents pay 100% | Doctrine v2 §2 | §4.4 expected-cash estimate corrected (§8.5) |
| CYL deposits paid in cash | Settle the deposit and convert custody | `ALLOCATION_DOCTRINE.md` §1.3 | §4.6 cylinder statement is a custody conclusion (§8.8) |
| 2025 scope | Phase 2 is forward scope; do not mix into the 2023–2024 sign-off | Model B Position | This report proposes v5 view changes only; no ERP posting |

### 8.2 Epistemic labels (D15) and evidence basis (§5)

Section 2 used PROVEN on groups that are ties. Corrected reading:
* the **sums** (each group's net, the batch totals, the ERP tie) are PROVEN;
* the **ties** are edges: Confirmed (G1–G3 by remittance) or a ruling (G4, G5);
* ERP payment tagging (the `raw/DEBENQ.TXT` allocation lines and journal 511) is corroboration only;
* every group carries evidence basis `REMITTANCE_BACKED` except G5 and G6, which are not settlements.

### 8.3 41747 "already paid"

Withdrawn as a question. Doctrine v2 §7 classes it as informational. The matching exception type is `CROSS_BATCH_RESIDUAL_NO_DISCOUNT` ("residual after prior batch slice → R0 discount"), which fits the STAT 123 line (paid R12,226.63, discount R0.00). **New finding:** `config/settlement_discount_overrides.json` has no entry for 41747 or for any 2025/2026 batch line, although v2 §7 says deviations are registered there. See Q11.

### 8.4 Payer group: status of the task register

The STAT 123 split is recorded as DONE in the Phase 2 checklist, yet H-014 in `shared/HUMAN_TASKS.md` is still OPEN. ASSERTED: journals 511–513 (R0.00, 2026-08-31, TXT LINE 115–117), and journal 511's allocation of 37770 in `raw/DEBENQ.TXT`, suggest H-022 tagging was carried out in the ERP on 2026-08-31. The register still shows H-022, H-023 and H-026 as OPEN. The contents of 512 and 513 are `unverified`, because no allocation-detail export after 2026-08-31 exists. See Q12.

### 8.5 Expected next remittance

Under doctrine v2 §2 the August documents (52484, 52803) were discount-eligible only if paid by 2026-09-30, and no payment has posted. Expected settlement is R18,413.69 at 100%, net of CNs 15443 and 15553 (ASSUMED; kill condition: an advice showing a discount on those lines).

### 8.6 The 24 pre-window journals reconcile to the finance checklist

| Source | Expected net (R) | Posted journals | Posted net (R) |
| :--- | ---: | :--- | ---: |
| 2023 (6 batches, Path C) | +690.00 | 490, 491 | +690.00 |
| 2024 over-posts (orphans 3,575.49 + 806.27 + 895.13 + 598.00 + 500.01) | +6,374.90 | 492–496, 503 | |
| 2024 cash-only discounts (30419, 31365, 33921, 34518, 36195) | −1,735.95 | 500, 501, 502, 504 | |
| 2024 subtotal | **+4,638.95** | 492–506 | **+4,638.95** |
| Unplanned (not on checklist) | 0.00 | 499 +124.91, 505 +108.19, 506 −233.10 | 0.00 |
| 2025 Phase 2 (STAT 110/112/114) | −735.70 | 507, 508, 509 | −735.70 |
| **Total 490–509** | **+4,593.25** | | **+4,593.25** |

PROVEN: checklist columns `orphan_strip` and `journal_amount`, against TXT LINE 2–7, 65–66, 87–93, 96–108. G5 (490–507) = 4,593.25 + 228.93 (508) + 393.99 (509) = **5,216.17**. ✔
The open gap the doctrine names is the Oct-24 partial journal (R385.04 ×2 inside the B/F, doctrine v2 §8). It has not been reversed. It sits inside the R8,084.67, not in the open rows.

### 8.7 Probable ties under the evidence hierarchy

| Tie | Evidence ranks available | Recommendation |
| :--- | :--- | :--- |
| 44731 + CN 12958 | Remittance (rank 1) via STAT 123 | Confirmed by G1; no approval |
| 51180 + CN 15063 (2 lanes) | ERP Crd Note tag to 51180 (order A rung 3); same order number; exact reversal | Approve |
| 53078 + CN 15646 | DN only (structural) + amount | Hold: get the CN's INVNO from an allocation-detail export, or record operator judgement |
| 53351 + CN 15714 | Bare ref "21388" (advisory) + amount + same date | Hold, as above. Deletion test (§3): with the ref deleted, only amount and date remain. |

Effect: the customer-preview count after rulings is 10 + 4 = **14** (the two held ties keep 4 rows open), not 10, until they are evidenced.

### 8.8 Cylinders

The R7,590.00 of CYL net paid by STAT 123 is, under `ALLOCATION_DOCTRINE.md` §1.3, a settlement of deposits: the customer now owns those cylinders. That is a custody conclusion. Under D19 it stays ASSERTED while `ingestGate` blocks custody. `DEBTORS_DOCTRINE.md` §4 requires residuals to decompose to whole cylinders at a dated price. The R172.50 / R345.00 / R7,072.50 nets were not decomposed by SKU from DB lines: `unverified`.

### 8.9 Named residual lines: reuse what is ratified

Crosswalk between the ratified 7-line bridge (`config/statement_of_account.json` `balanceBridgeLines`, 2026-08-11) and this report:

| Ratified line | R | This report |
| :--- | ---: | :--- |
| `bf_carry` | +38,791.27 | B/F |
| `stat112_untagged` | −35,693.84 | G4 (payment 37770) |
| `phantom_cn_nets` + `pathb_journals_untagged` | +9,894.01 − 5,300.76 = +4,593.25 | Journals 490–509: G5 (+5,216.17), J508 in G4 (−228.93), J509 in G2 (−393.99) |
| `override_42468_42470` + `stat114_untagged` + `stat123_orphan` | +8,950.44 − 7,306.68 − 1,249.77 = +393.99 | Inside the G1/G2 remittance ties; offsets J509 → R0.00 |
| **Total** | **8,084.67** | **8,084.67** ✔ |

So G4 and G5 need no new line or config list (M5 withdrawn). The v5 open-items view should show them under the ratified ids. That is a reporting change for the main session, plus a ruling that the 2026-08-11 bridge ratification extends to the v5 view.

### 8.10 Questions — amended set

Unchanged: Q1, Q2, Q3, Q5, Q7, Q9, Q10. Withdrawn: Q4. Replaced or new:

* **Q6′:** Approve 51180 + CN 15063 (both lanes) now, and hold 53078 + CN 15646 and 53351 + CN 15714 until a CN INVNO tag or your recorded judgement exists? (yes / approve all four / other)
* **Q8′:** Show G4 and G5 in the v5 open-items view under the ratified `balanceBridgeLines` ids, extending the 2026-08-11 bridge ratification to v5? (yes/no)
* **Q11:** Register 41747 (STAT 123, `CROSS_BATCH_RESIDUAL_NO_DISCOUNT`) and the STAT 123 late lines (`LATE_PAYMENT_NO_DISCOUNT`) in `config/settlement_discount_overrides.json`, as doctrine v2 §7 requires? (yes/no) — **SUPERSEDED (§8.12):** too narrow; restated as Q11′.
* **Q12:** Were H-014, H-022, H-023 and H-026 done in the ERP (journals 511–513 on 2026-08-31)? If so, may the main session mark them DONE in `shared/HUMAN_TASKS.md`? (done / not done / unknown)

### 8.11 Tripwires added

* An allocation-detail export after 2026-08-31 showing journals 512/513 with allocations other than 39080/45899 reopens §8.4.
* Any advice paying 52484/52803 with a discount reopens §8.5.
* A decision on the H-027 challenge that splits `phantom_cn_nets` reopens §8.9 (the crosswalk would need the split lines).

### 8.12 Q11 in detail: discount register for 2025–2026 batches (added 2026-10-09 at the operator's request)

**The register.** `config/settlement_discount_overrides.json` (doctrine `settlement-discount-v2`, `termsBasis: invoice_month_end_plus_30_days`) is where doctrine v2 §7 says each deviation from "2.5% × gross" is recorded. It holds 12 approved entries, all from 2023–2024 batches (EXC-0001…0007, EXC-2024-0001…0005). It has **no entry for STAT 110, 112, 114, 123 or 129**. PROVEN (file read).

**Precedent for 41747.** EXC-0005 records invoice 24011 as `CROSS_BATCH_RESIDUAL_NO_DISCOUNT` (BATCH-2023-11-27): a residual paid in a later batch at R0 discount. 41747 is the same pattern. STAT 114 paid the CYL slice with R495.94 discount; STAT 123 paid the R12,226.63 residual at R0.00.

**Terms rule vs advice, per batch.** The deadline is read as the end of the month after the invoice, as in EXC-0001 (May invoice → 2023-06-30). Payment date = electronic paid date.

| Batch (payment) | Lines | Late | Advice discount (R) | Terms-rule discount (R) | Advice − rule (R) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| STAT 110 (36467) | 2 | 0 | 112.78 | 112.78 | 0.00 |
| STAT 112 (37770) | 8 | 4 | 228.93 | 494.23 | −265.30 |
| STAT 114 (39080) | 8 | 1 | 393.99 | −101.95 | +495.94 |
| STAT 123 (43500, TWK002 slice) | 46 | 43 | 0.00 | −70.00 | +70.00 |
| STAT 129 (45899) | 21 | 14 | 1,223.45 | 911.66 | +311.79 |
| **Total** | | | | | **+612.43** |

> **SUPERSEDED (§8.13):** this table uses the end-of-following-month reading. The operator ruled the literal month-end + 30 days; see §8.13 for the recomputed figures (+R2,520.77, 27 lines).

PROVEN arithmetic from `data/remittance_evidence.json`. The customer took R612.43 more discount than the strict terms rule gives. The advice is canonical (v2 §2), and journals 507–510 already posted the advice amounts. **No balance, tie or open row changes.** The register is the audit record of the deviations.

**The eight lines that deviate from the terms rule:**

| Batch | Document | Date | Terms | Advice discount (R) | Rule (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| STAT 112 | Invoice 40081 | 2025-01-22 | late | 390.20 | 0.00 |
| STAT 112 | CN 11648 | 2025-01-23 | late | −396.75 | 0.00 |
| STAT 112 | CN 11743 | 2025-01-23 | late | −258.75 | 0.00 |
| STAT 114 | Invoice 41747 (CYL slice) | 2025-03-26 | late | 495.94 | 0.00 (offset by CN 12131 −495.94, in terms; pair nets 0) |
| STAT 123 | Invoice 48687 | 2026-01-09 | in terms | 0.00 | 878.75 |
| STAT 123 | CN 14237 | 2026-01-26 | in terms | 0.00 | −569.25 |
| STAT 123 | CN 14034 | 2026-02-09 | in terms | 0.00 | −379.50 |
| STAT 129 | Invoice 51226 | 2026-06-15 | late | 311.80 | 0.00 |

The other 40 late STAT 123 lines took R0 discount, as the rule says. The register's precedent for such a batch is one batch-level entry (EXC-2024-0005 `LATE_CATCHUP_BATCH`), not one entry per line.

**Why it may be unregistered on purpose.** Doctrine v2 is scoped to 2023–2024. `docs/TWK002_Model_B_Position.md` calls 2025+ forward scope, not to be mixed into the 2023–2024 sign-off. Phase 2 posted the 2025 journals (507–509) without extending the register. So this is a scope decision first.

**Sensitivity (ASSUMED reading).** The config literally says month-end + 30 days. Read that way, a further 19 lines (both STAT 110 lines, 4 of STAT 112, 7 of STAT 114, 6 of STAT 129) fall late by one day. The end-of-following-month reading above matches EXC-0001; confirm it. Kill condition: an operator or doctrine statement that the literal +30-day count applies.

* **ANSWERED (§8.13): yes.** **Q11′:** Extend the discount register to 2025–2026? (yes / no / wait for the 2023–2024 sign-off) If yes, the main session would add: one `CROSS_BATCH_RESIDUAL_NO_DISCOUNT` entry for 41747; one `LATE_CATCHUP_BATCH` entry for STAT 123; and entries for the eight lines above (net R612.43).
* **ANSWERED (§8.13): no — literal month-end + 30 days.** **Q13:** Is the terms deadline the end of the month after the invoice, as EXC-0001 implies, rather than a literal 30 days after month-end? (yes/no)

### 8.13 Operator rulings on Q11′ and Q13 (2026-10-09) and the resulting register draft

**Rulings (verbatim, operator in the analysis session, 2026-10-09):**
* Q13 → "month-end + 30 days". The terms deadline is the invoice month-end plus 30 calendar days, as `termsBasis: invoice_month_end_plus_30_days` says.
* Q11 → "yes". The discount register is extended to the 2025–2026 batches.

Recording these rulings in `config/settlement_discount_overrides.json` is for the main recon session (`AGENTS.md`; this session writes only this report). The draft below is what it would append. Everything stays PROPOSED until applied.

**Recomputed under the literal rule** (`data/remittance_evidence.json`; payment date = electronic paid date; PROVEN arithmetic):

| Batch (payment) | Lines | Late | Advice discount (R) | Terms-rule discount (R) | Advice − rule (R) | Deviating lines |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| STAT 110 (36467) | 2 | 2 | 112.78 | 0.00 | +112.78 | 2 |
| STAT 112 (37770) | 8 | 8 | 228.93 | 0.00 | +228.93 | 7 |
| STAT 114 (39080) | 8 | 8 | 393.99 | 0.00 | +393.99 | 8 |
| STAT 123 (43500, TWK002 slice) | 46 | 43 | 0.00 | −70.00 | +70.00 | 3 |
| STAT 129 (45899) | 21 | 20 | 1,223.45 | −491.62 | +1,715.07 | 7 |
| **Total** | | | | | **+2,520.77** | **27** |

* **24 lines were paid late but discounted.** Nineteen of them are late by exactly one day; the other five are 29–32 days late (40081, CN 11648, CN 11743, 41747, 51226). These batches were paid on the last day of a month, one day after "month-end + 30" when the invoice month has 31 days.
  * STAT 110: 39022, CN 11475.
  * STAT 112: 40081, CN 11648, CN 11743 (29 days); 40459, CN 11821, 40950, CN 11953 (1 day). Invoice 39683, late, took R0 and conforms.
  * STAT 114: all 8 lines (41747 31 days; the rest 1 day).
  * STAT 129: 51226 (32 days); 15155, 15262, 51496, 51841 ×2, 52241 (1 day).
* **3 lines were paid in terms but given no discount (STAT 123):** 48687 (+878.75), CN 14237 (−569.25), CN 14034 (−379.50); net −70.00.
* **Rounding:** STAT 129's seven deviating lines sum to R1,715.08 against the R1,715.07 batch difference; R0.01 is rounding on CN 15370 (rule −491.62, advice −491.63).
* **No balance effect.** The advice discount is canonical (doctrine v2 §2), and journals 507–510 already posted it. The register records why the advice departs from the rule.
* **2023–2024 register unaffected.** Under the literal reading no 2023–2024 line flips to late-but-discounted, because those batches were paid on the 26th–28th. All 12 existing entries stay valid. PROVEN (checked against `config/payment_pattern_overrides.json` `remittance_paid_date`).

**Type gap (needs Q14).** Doctrine v2 §7 lists exception types only for discounts *below* 2.5% (late, partial, residual and so on). It has no type for a discount granted on a late line, or for an in-terms line taken at R0. Adding a type amends the account doctrine, which a worker session may only propose (`DEBTORS_DOCTRINE.md` §7). The draft therefore uses existing types where they fit and marks two proposed types.

**Draft entries** (field shape copied from existing entries; `approval_status` stays `proposed` until the main session records the rulings):

```json
[
  { "override_id": "EXC-2025-0001", "batch_id": "BATCH-2025-01-31", "doc_no": "CONSOLIDATED",
    "override_type": "DISCOUNT_GRANTED_AFTER_TERMS (PROPOSED TYPE)",
    "remittance_discount": 112.78, "terms_rule_discount": 0.0, "payment_date": "2025-01-31",
    "lines": ["00039022", "00011475"], "days_past_terms": 1,
    "evidence_source": ["remittance_advice", "raw/Remittances/31.01.2025.pdf"],
    "reason": "Lines past month-end + 30 days (operator ruling 2026-10-09) but discounted on the advice; advice is canonical (v2 §2).",
    "approval_status": "proposed" },
  { "override_id": "EXC-2025-0002", "batch_id": "BATCH-2025-03-31", "doc_no": "CONSOLIDATED",
    "override_type": "DISCOUNT_GRANTED_AFTER_TERMS (PROPOSED TYPE)",
    "remittance_discount": 228.93, "terms_rule_discount": 0.0, "payment_date": "2025-03-31",
    "lines": ["00040081", "00011648", "00011743", "00040459", "00011821", "00040950", "00011953"],
    "notes": "00039683 late at R0 conforms; 40081/11648/11743 29 days late, rest 1 day.",
    "evidence_source": ["remittance_advice", "raw/Remittances/31.03.2025(1).pdf"], "approval_status": "proposed" },
  { "override_id": "EXC-2025-0003", "batch_id": "BATCH-2025-05-31", "doc_no": "CONSOLIDATED",
    "override_type": "DISCOUNT_GRANTED_AFTER_TERMS (PROPOSED TYPE)",
    "remittance_discount": 393.99, "terms_rule_discount": 0.0, "payment_date": "2025-05-31",
    "lines": ["00041747", "00012131", "00042050", "00012214", "00012215", "00042468", "00042470"],
    "notes": "41747 discount on the CYL slice only (R495.94 = 2.5% × 19,837.50); residual R12,226.63 paid on STAT 123 (EXC-2026-0001). 12131 listed on two advice lines.",
    "evidence_source": ["remittance_advice", "raw/Remittances/31.05.2025.pdf"], "approval_status": "proposed" },
  { "override_id": "EXC-2026-0001", "batch_id": "BATCH-2026-STAT-123", "doc_no": "00041747",
    "override_type": "CROSS_BATCH_RESIDUAL_NO_DISCOUNT",
    "gross_amount": 32064.13, "payable_amount": 12226.63, "remittance_discount": 0.0,
    "payment_date": "2026-02-28", "invoice_date": "2025-03-26", "terms_deadline": "2025-04-30", "days_past_terms": 304,
    "evidence_source": ["remittance_advice", "raw/Remittances/18.02.2026.pdf", "data/remittance_lines_2026.csv line 2"],
    "reason": "Residual after the STAT 114 CYL slice (already_paid_col 19,837.50); precedent EXC-0005.", "approval_status": "proposed" },
  { "override_id": "EXC-2026-0002", "batch_id": "BATCH-2026-STAT-123", "doc_no": "CATCHUP-2025",
    "override_type": "LATE_CATCHUP_BATCH",
    "remittance_discount": 0.0, "terms_rule_discount": -70.0, "payment_date": "2026-02-28",
    "notes": "TWK002 slice only (R176,824.24 of R240,325.86; TWK003/TWK004 slices out of scope). 43 late lines at R0 conform. 3 in-terms lines also at R0 (00048687 +878.75, 00014237 -569.25, 00014034 -379.50; net -70.00): IN_TERMS_NO_DISCOUNT (PROPOSED TYPE).",
    "evidence_source": ["remittance_advice", "raw/Remittances/18.02.2026.pdf"], "approval_status": "proposed" },
  { "override_id": "EXC-2026-0003", "batch_id": "BATCH-2026-STAT-129", "doc_no": "CONSOLIDATED",
    "override_type": "DISCOUNT_GRANTED_AFTER_TERMS (PROPOSED TYPE)",
    "remittance_discount": 1223.45, "terms_rule_discount": -491.62, "payment_date": "2026-08-31",
    "lines": ["00015155", "00015262", "00051226", "00051496", "00051841", "00052241"],
    "notes": "51226 32 days late; rest 1 day. 51841 on two advice lines. 13 late lines at R0 conform. CN 15370 in terms (R0.01 rounding). Journal 00000510.",
    "evidence_source": ["remittance_advice", "raw/Remittances/B226 - REMITTANCE.pdf"], "approval_status": "proposed" }
]
```

* **ANSWERED (§8.14): yes.** **Q14:** Add two exception types to doctrine v2 §7 — `DISCOUNT_GRANTED_AFTER_TERMS` (advice discounts a line past month-end + 30) and `IN_TERMS_NO_DISCOUNT` (advice takes an in-terms line at R0)? (yes / no / use other names)

**Tripwires.** A remittance or finance statement that the customer's terms count from statement date, or end of the following month, reopens the Q13 ruling. Any later advice discounting a line more than one day past the deadline should be registered at that batch.

### 8.14 Operator ruling on Q14 (2026-10-09)

**Ruling (verbatim, operator in the analysis session, 2026-10-09):** Q14 → "yes".

Doctrine v2 §7 gains two exception types:

| Type | Meaning | Journal impact |
| :--- | :--- | :--- |
| `DISCOUNT_GRANTED_AFTER_TERMS` | The advice discounts a line paid after month-end + 30 days | None. The advice discount stands (v2 §2) and is posted as advised; the entry records the deviation. |
| `IN_TERMS_NO_DISCOUNT` | The advice takes an in-terms line at R0 discount | Exclude the line from ref splits (as `LATE_PAYMENT_NO_DISCOUNT`) |

**Applying it (main recon session, by turn brief, not this session):**
1. Append both rows to the §7 table of `docs/TWK002_Settlement_Discount_Doctrine_v2.md`, as an amendment dated 2026-10-09 that cites this ruling. The existing text stays (amendments append).
2. In the §8.13 draft entries, drop the "(PROPOSED TYPE)" suffix.
3. Give the three STAT 123 in-terms lines their own `IN_TERMS_NO_DISCOUNT` entry (00048687, 00014237, 00014034; net −R70.00) instead of a note in EXC-2026-0002.
4. Append the entries to `config/settlement_discount_overrides.json` with `approval_status: approved`, citing the Q11, Q13 and Q14 rulings. Then add a `project.json` history line.

**Tripwire:** an advice discounting a line more than 32 days past the deadline is outside the observed pattern; register it individually and flag it to the operator, not under a batch entry.

### 8.15 Operator ruling on Q1: consolidated parent (2026-10-09)

**Ruling (verbatim, operator in the analysis session, 2026-10-09):**
* "TWK003 and TWK004 are child accounts of TWK002."
* Offered (1) child accounts reconciled separately, or (2) a consolidated parent; the operator answered "2".

This replaces the per-account `payerGroup` treatment proposed for Q1 (§5 M2, §4.3). TWK002 is reconciled as the **parent of a three-account family**. This is consistent with doctrine v2 §1 ("one commercial account … ERP debtor split only"). It reverses the TWK002-only posture recorded in `config/statement_of_account.json` (`_comment_siteTxts`: "TWK003/TWK004 temporarily excluded … until site roll-up is revisited").

**What changes:**

| Item | Per-account treatment (superseded) | Consolidated parent (ruled) |
| :--- | :--- | :--- |
| STAT 123 (payment 43500) | Tie TWK002's R176,824.24 slice; 8 child lines out of scope | Tie the whole advice, R240,325.86, against the three ERP postings of 43500 (TWK002 R176,824.24, TWK003 R38,501.31, TWK004 R25,000.31) |
| Family balance | TWK002 R54,136.19 | R54,136.19 + TWK003 R−300.00 + TWK004 R0.00 = **R53,836.19** (ASSERTED: the child TXTs carry no export date) |
| Open items after all rulings | 10 rows (TWK002) | 10 TWK002 rows + 2 TWK003 rows = **12** (see below) |
| Q2 ("Crd Note 10" alias) | Needed | Still needed: the advice must reconcile line by line |

**The children, from `raw/DEBENQ_TWK003.TXT` and `raw/DEBENQ_TWK004.TXT`** (ERP allocation detail in `ERP RAW DATA/DETRANS.TXT`; corroboration only):
* **TWK003:**
  * The advice paid 46857, 47076, 47523 and 47880. In the ERP, 47880 was credited by CN 13966 and re-issued as 47991 (same DN 21166, R5,499.99), and the payment was allocated to 47991. Net R0.00.
  * Invoice 47866 (R2,000.00) and CN 13933 (−R2,300.00), both DN 21166, are not on the advice. They net **−R300.00**: a customer credit and the only child item that stays open.
* **TWK004:**
  * The advice paid 46858, 47176, 47297 and 47584. 47297 was matched by CN 13744 (DN 20749), with 47303 (DN 20749) carrying the payment allocation; the re-issue nets to R0.00.
  * Balance R0.00; nothing stays open.

**Proof, consolidated (state after all rulings):** opening residual 8,084.67 + TWK002 open 46,051.52 + TWK003 open −300.00 + TWK004 0.00 = **53,836.19** = Σ of the three ERP `CURRENT BALANCE` headers (54,136.19 − 300.00 + 0.00). Arithmetic PROVEN; child balances ASSERTED until current child TXTs are on file.

**What the main session needs before this can run** (this session writes only the report):
1. **Current DEBENQ TXTs for TWK003 and TWK004.** The handoff `docs/handoffs/2026-10-08.md` §1, pending item 3, already requests them. The ones in `raw/` are undated and were committed 2026-10-07.
2. **Child configs:** `statement_v5.json` for TWK003 and TWK004 (B/F R0.00 on both TXTs), a v5 projection each, and DB coverage checks.
3. **Family relation in config:** fill `siteTxts` in `config/statement_of_account.json`, and add a parent/children (`payerGroup`) entry to `config/statement_v5.json`. Supersede the `_comment_siteTxts` note by marking it, not deleting it.
4. **Matcher:** a family-level REMITTANCE tie across the three projections. It accepts a line when its document is on any family account and requires Σ of the family's postings of the payment = advice cash. The re-issued documents (47880→47991, 47297→47303) need either a CN-pair step inside the tie or an alias.
5. **Proof:** the open-items proof sums the three ERP headers.

**Interim, until the child TXTs are current:** run TWK002 alone, with the child slices of 43500 (R63,501.62) shown as a named family line. That is the per-account mechanics of §5 M2, used as a stop-gap and labelled as such. ASSUMED acceptable; kill condition: the operator prefers to wait for the full family build.

**New question:**
* **ANSWERED (§8.16): yes, consolidated.** **Q15:** Should the customer statement also become one consolidated statement for TWK AGRI (TWK002 + TWK003 + TWK004), or stay per account with the parent proof internal only? (consolidated / per account)

**Tripwires:** a current TWK003 or TWK004 TXT whose header differs from the R−300.00 or R0.00 used here reopens the family proof. Any remittance naming a document on none of the three accounts reopens the family membership.

### 8.16 Operator ruling on Q15: one consolidated customer statement (2026-10-09)

**Ruling (verbatim, operator in the analysis session, 2026-10-09):** Q15 → "Yes", read as "one consolidated statement for TWK AGRI (TWK002 + TWK003 + TWK004)".

This supersedes the TWK002-only customer statement posture of 2026-08-29 (`docs/TWK002_Model_B_Position.md`; `config/statement_of_account.json` `_comment_siteTxts`). Those texts are to be marked superseded, not deleted.

**What stays as ratified:**
* `customerDueBasis: open_invoices` (2026-08-30): Amount due = open documents only; the R8,084.67 account-level residual stays internal (`hideAccountLevelSection: true`).
* The release gate: `npm run debtors:tag-check` before any customer copy (`business_rules.md` §15 rule 4). It now has to pass for all three codes.

**What the consolidated statement would show (state after all rulings; ASSERTED for the children until current TXTs are on file):**

| Source | Open documents | R |
| :--- | :--- | ---: |
| TWK002 | 52484, CN 15443, 52803, CN 15553, 53077, 53350, 53507, CN 15775 (the 10 rows of G6) | 46,051.52 |
| TWK003 | 47866 (R2,000.00) and CN 13933 (−R2,300.00), DN 21166 | −300.00 |
| TWK004 | none | 0.00 |
| **Amount due (open documents)** | | **45,751.52** |

Internal proof: 45,751.52 + 8,084.67 (residual, internal) = 53,836.19 = Σ of the three ERP headers.

**Implementation note for the main session:** `generate_statement_of_account.mjs` already reads `siteTxts` (lines 161 and 549–558). It rolls the child accounts up as **header balances** only, not as open documents. Under `customerDueBasis: open_invoices`, the child open documents (47866, CN 13933) must be listed and included in Amount due. Check that the generator does this before the first consolidated release, or extend it. Each child line on the statement should carry its account code.

**Customer-facing caution:** the consolidated copy would show the customer a R300.00 credit on TWK003. That is correct per the ERP header, but nothing has investigated whether CN 13933 over-credits invoice 47866 by error. Check before the first consolidated release. `unverified`.

**Tripwire:** a child TXT whose open documents differ from the above reopens the consolidated Amount due.

### 8.17 Operator ruling on Q2: the "Crd Note 10" line (2026-10-09)

**Ruling (verbatim, operator in the analysis session, 2026-10-09):** "Do not invent a CN 10 in ERP. Do not park −R6,900 on another invoice. The cash is already in receipt 00043500; this is an advice-line identity, not a missing credit."

**Meaning, as recorded:**
* The STAT 123 advice line "Crd Note 10, 23.10.2025, −R6,900.00" (`data/remittance_lines_2026.csv` line 37) is the second line of **CN 00013716** (−R9,315.00 + −R6,900.00 = −R16,215.00 = the ERP CN). It is a fact about how the customer printed the advice, not a document.
* **ERP:** no posting of any kind. No CN 10 is created. The −R6,900.00 is not allocated or parked on any invoice (47196 or another). Receipt 00043500 already carries the cash.
* **Evidence layer only:** the line is resolved where the advice is read, as an alias from advice line to ERP document. The main session records it in config, e.g. a `remittanceDocAliases` entry `{ "BATCH-2026-STAT-123": { "Crd Note|10": "13716" } }`, with this ruling as its `reason`. The generated `remittance_lines_2026.csv` and `remittance_evidence.json` are never hand-edited (§5 idempotency); the alias is applied when evidence is built.
* **Matcher:** the remittance tie aggregates both advice lines onto CN 13716 (it already sums several lines per document). The advice then reconciles line by line and the STAT 123 family tie closes at R0.00.

**Tripwire:** a document numbered 10 appearing on any family account, or a corrected advice from the customer, reopens this ruling.

### 8.18 Operator rulings on Q7 and Q10 (2026-10-09)

**Rulings (verbatim, operator in the analysis session, 2026-10-09):** "Q10 = YES", "Q7 = YES".

**Q7: payment 37770 against the B/F.**
* Payment 37770 (STAT 112, R35,693.84) and its discount journal 508 (−R228.93) are ruled `applied_to_bf`. Together they settle the eight pre-window documents inside the B/F: invoices 39683, 40081, 40459, 40950 and CNs 11648, 11743, 11821, 11953 (R35,922.77).
* Evidence: the STAT 112 advice, `data/allocation_edges.csv` AL-0109…AL-0116, and `raw/TWK0022024.TXT` LINE 19–22 and 49–52. This is the ratified bridge line `stat112_untagged`.
* **Recording (main session):** `node analysis/debtors/shared/scripts/approve_tie.mjs --debtor TWK002 --payment 37770 --treatment applied_to_bf --reason "<this ruling; documents and evidence above>"`. `approve_tie` cannot yet take a journal, so journal 508 needs either the small tool change (accept `--journals 508`) or M3 (discount journal clears pending discount, §5). Run `--dry-run` first.
* Effect: 2 open rows leave; the unitemised B/F falls from R38,791.27 to R2,868.50 (PROVEN arithmetic).

**Q10: build the matcher changes.** The main session builds into `analysis/debtors/shared/scripts/projection_matcher.mjs`, with tests, then reruns TWK002. Scope as now ruled:

| Change | Status after rulings | Notes |
| :--- | :--- | :--- |
| M1 lane-aware split remittance lines | **Waits on Q3** | Needed for 41747; without it both STAT 114 and STAT 123 stay unresolved |
| M2 payer group → **family remittance tie** (Q1 consolidated parent) | Approved | The full family tie needs current TWK003/TWK004 TXTs and projections (§8.15). Interim: TWK002-only tie of its R176,824.24 slice, with the child slice shown as a named family line. |
| Remittance doc alias (Q2) | Approved | Config `remittanceDocAliases`, applied when evidence is built (§8.17) |
| M3 discount journal joins its remittance tie | Approved | Journals 509 and 510; 508 once Q7 is recorded |

**Done means:**
* existing matcher tests still pass, plus new tests for each change;
* `matcher_preview.mjs` shows no row change on the other eight projected accounts (the scratch prototype showed none, §5);
* TWK002's proof still ties to R54,136.19, or the family's to R53,836.19 once the children are in.

**Tripwire:** the preview showing any row change on another account stops the build for review.

