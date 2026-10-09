# TWK002 — How far can the 69 open rows be reduced? (ADM-94)

**Status: PROPOSED — NOT RATIFIED.** An analysis session proposes; the operator rules (AGENTS.md §7). Nothing here is a lock, a config change or a matcher change.
**Generated:** 2026-10-09 · **Brief:** Linear ADM-94 (parent ADM-82). The Linear connector worked; ADM-94 had no comments. `docs/handoffs/2026-10-08.md` ends at §9; there is no §10, so §8–§9 and the ADM-94 text were used.
**Inputs (all committed, read-only):** `raw/TWK002_2026-10-08.TXT` (ERP R54,136.19), `data/v5_projection.json`, `data/projection_matches.json`, `data/remittance_evidence.json`, `data/remittance_lines_2026.csv`, `data/allocation_edges.csv`, `raw/DEBENQ.TXT` (2026-08-31 export *with* allocation detail), `raw/DEBENQ_TWK003.TXT`, `raw/DEBENQ_TWK004.TXT`, `raw/TWK0022024.TXT`, `ERP RAW DATA/DETRANS.TXT`, `config/statement_of_account.json`, `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md`, `reports/TWK002_STAT123_Remittance_2026-02-18.md`, `reports/TWK002_H027_Collectibility_Challenge_2026-09-07.md`.
**Tags (doctrine §6):** PROVEN = reproduced from a cited artifact. ASSERTED = stated by a report or inferred, not independently reproduced. ASSUMED = working assumption. `unverified` = no anchor.

---

## 1. Bottom line

* **69 open rows can fall to 10 internal rows** (18 on the customer preview, 10 once the four remaining probable ties are approved). The 10 are the documents dated after STAT 129 (2026-08-12 to 2026-10-08), R46,051.52, which no payment has yet reached.
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

### 4.3 Payer group STAT 123 (TWK002 / TWK003 / TWK004)

* **One receipt, three postings (PROVEN):** 43500 on 2026-02-25 is TWK002 R176,824.24, TWK003 R38,501.31 (`raw/DEBENQ_TWK003.TXT` line 10), TWK004 R25,000.31 (`raw/DEBENQ_TWK004.TXT` line 8). Σ = **R240,325.86** = advice cash.
* **Documents per account:**
  * TWK003 holds 46857, 47076, 47523, 47880 = 3 × 11,000.44 + 5,499.99 = R38,501.31 (the whole TWK003 slice).
  * TWK004 holds 46858, 47176, 47297, 47584 = 9,000.36 + 3,000.12 + 7,000.28 + 5,999.55 = R25,000.31 (the whole TWK004 slice).
  * All other advice lines are TWK002 documents; each equals the whole-document ERP amount (LPG + CYL) to the cent, except CN 13716 (below). Their paid total is **R176,824.24 = payment 43500 on TWK002**.
* **Nothing must move in the ERP.** The ERP already splits the receipt by account. TWK002 already shows only its own slice. The gap is in the matcher, which refuses a batch when any line is not in this account's projection.
* **CN 13716:** the advice lists it as −9,315.00 and as "Crd Note 10" −6,900.00 (same date 23.10.2025). ERP CN 13716 is −16,215.00 = 9,315 + 6,900. The ERP allocation of 47196 (R20,416.64 = 36,631.64 − 16,215) confirms the full CN was applied (`raw/DEBENQ.TXT` LINE 81). The doc number "10" is a truncated parse of the second line. PROVEN for arithmetic; ASSERTED for the identity. Needs an alias (Q2).
* **TWK003 R−300.00** is a site-ledger difference (47866, CN 13933/13966, 47991), not a TWK002 item (`TWK002_STAT123_Remittance_2026-02-18.md`).

### 4.4 The 2026-07/08 invoices and STAT 129

* STAT 129 (payment 45899, R108,823.42) is tied (T0001) and covers documents up to 52241 (2026-07-31) and CN 15370 (2026-08-01). All July invoices are already settled. PROVEN.
* Of the 25 open rows dated 2026-07 to 2026-08, **19 are journals** (490–491 dated 07-12, 499–502 dated 07-23, 503–509 dated 08-09, 510 dated 08-26) and 6 are the CYL/CN rows of 52484 and 52803. Only the August documents 52484 and 52803, and the September/October documents, are genuinely unpaid.
* No payment exists after 2026-08-26 and the TXT header shows `UD PAY/CHEQUES 0.00`, so no unconfirmed receipt is hiding. PROVEN.
* **Pattern:** the customer pays in lumps: monthly to May 2025, then STAT 123 (Feb 2026, for May 2025–Jan 2026) and STAT 129 (Aug 2026, for Feb–Jul 2026). The expected next advice for the August documents is about R18,413.69 gross (52484 + 52803 less CNs 15443 and 15553), about R17,953 cash at the 2.5% discount STAT 129 applied to documents from June. ASSUMED; the discount rate is read from `remittance_evidence.json` lines 51226 onwards.

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

### 4.6 Probable ties and cylinder netting

* **Probable ties.** After M1–M3, four remain:

| Tie | Documents | Lag | Extra evidence | Recommendation |
| :--- | :--- | ---: | :--- | :--- |
| 44731 + CN 12958 | DN#12191 | 2 days | Both listed on STAT 123; ERP INVNO tag on CN (`raw/DEBENQ.TXT` LINE 34–35) | Becomes CONFIRMED by the STAT 123 tie; no approval needed |
| 51180 + CN 15063 (LPG and CYL, 2 ties) | DN#22798, order 00013935 | 3 days | Same order number; ERP INVNO tag on CN (`raw/DEBENQ.TXT` LINE 100–101); exact reversal of R29,721.98 | Approve |
| 53078 + CN 15646 | DN#24985, R22,000.00 | 4 days | Same DN, exact amount; no tag evidence (after 2026-08-31) | Approve (weakest; Q6) |
| 53351 + CN 15714 | ref "21388", R19,837.50 | 0 days | Identical bare reference and amount; matcher requires "DN" in the ref, so it fell to CN_AMOUNT_DATE | Approve |

* **Cylinder netting.** The five open CYL invoices (R84,007.50) against five CYL credit notes (−R76,072.50) net **R7,935.00** (PROVEN, `projection_matches.json` `residual`). It decomposes as:
  * 43294 / CN 12550: +172.50; 43909 / CN 12724: +345.00; 47196 / CN 13716: +7,072.50. Total **R7,590.00**, all settled **in cash** by STAT 123 (the advice pays the invoices gross and the credit notes at face; PROVEN, §4.3). Not an open item.
  * 52484 / CN 15443: +172.50; 52803 / CN 15553: +172.50. Total **R345.00**, genuinely open (in G6).
  * 7,590.00 + 345.00 = 7,935.00. ✔
* **Today's documents.** CN 15775 is −R7,935.00, equal to the gross CYL net above. Both 53507 and CN 15775 have no DB lines yet (HEADER_FALLBACK, ADM-93). If CN 15775 is a cylinder credit it may be an ERP-agent clean-up of that net rather than a delivery-specific credit. ASSUMED; Q5.

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

1. **Q1 (P8):** Adopt `payerGroup` for TWK002 so that sister-site lines on a remittance are out of scope, and tie 43500 on TWK002's R176,824.24 slice alone? (yes/no)
2. **Q2:** Is the STAT 123 advice line "Crd Note 10 −R6,900.00" the second line of CN 13716 (9,315 + 6,900 = 16,215)? (yes/no)
3. **Q3 (P-b):** Accept lane-aware split remittances, so 41747 is tied CYL to STAT 114 and LPG to STAT 123? (yes/no)
4. **Q4:** STAT 114 calls R12,226.63 of 41747 "already paid" before 2025-05-19, but only STAT 123 pays it. Do you accept STAT 123 as the sole payment, or should finance check the bank for an earlier R12,226.63? (accept / check)
5. **Q5:** Is CN 15775 (−R7,935.00, DN#23843, 2026-10-08) a cylinder credit or a gas credit? (cylinder / gas / unknown until ADM-93 syncs)
6. **Q6:** Approve the four probable ties (51180 + CN 15063 ×2 lanes, 53078 + CN 15646, 53351 + CN 15714)? (all four / list the exceptions)
7. **Q7 (P7):** Rule payment 37770 and journal 508 as `applied_to_bf` against the eight itemised B/F documents (R35,922.77)? (yes/no)
8. **Q8:** Report journals 490–507 (R+5,216.17) as one named opening-adjustment line, not 24 open rows, until H-027 is decided? (yes/no)
9. **Q9:** Is a September 2026 remittance advice for 52484 and 52803 (about R18,413.69 gross) on file or expected? (on file / expected on date / none)
10. **Q10:** Should the main session build M1–M3 into `projection_matcher.mjs` and rerun TWK002 only, after you rule on Q1–Q3? (yes/no)

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
