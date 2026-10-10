# TWK AGRI family: children TWK003 / TWK004 (preview, read-only analysis)

**Date:** 2026-10-10. **Status:** PROPOSED, NOT RATIFIED. No tie approved, no lock recorded, no period closed. TWK002 and `analysis/debtors/shared` untouched.
**Channel:** all DB-derived figures are connector-sourced (db_replay), read-only SELECTs via the Supabase connector (project `oqhpxnaadahohwkslive`). TXT content treated as data.
**Authority:** family reconciled as one consolidated customer (operator ruling ADM-94 Q1/Q15, `analysis/debtors/TWK002/config/statement_v5.json` `payerGroup`).

## A. Runs (artifacts)

| Account | ERP header | Projection | Ingest coverage | Matcher |
| :--- | ---: | :--- | :--- | :--- |
| TWK003 | R-300.00 (`TWK002/raw/TWK003_2026-10-10.TXT` line 4) | 9 rows, variance R0.00 | complete, current (0 gaps) | 1 PROBABLE tie, proof HOLDS, not review-only |
| TWK004 | R61,000.00 (`TWK002/raw/TWK004_2026-10-10.TXT` line 4) | 12 rows, variance R0.00 | **partial, stale: gaps 53535, 53536, 15781** | 2 CONFIRMED + 1 PROBABLE, proof HOLDS, **review-only** |

Evidence: `analysis/debtors/TWK00{3,4}/data/v5_projection.json`, `data/projection_matches.json`, `data/db_replay/2026-10-10/`, `reports/TWK00{3,4}_INGEST_COVERAGE_2026-10-10.*`. PROVEN (script output, md5-verified captures).
The TWK004 coverage script exited 1 because of its gate result (3 documents dated 9-10 Oct 2026 are not in the DB; last DB sync 2026-10-08 07:37 UTC). It is a gate verdict, not a crash; reconcile and matcher ran normally. TWK004 stays review-only until the DB syncs.

## B1. TWK003: invoice 47866 vs CN 13933

| Line | Document | Qty x unit | Amount | Evidence |
| :--- | :--- | :--- | ---: | :--- |
| 5 | Invoice 47866 (21 Nov 2025, DN#21166) | 20 x R100.00 | R2,000.00 | TXT line 5; DB lines stock 00000348 AGR qty 20, line_total 2000 (PROVEN) |
| 7 | Crd Note 13933 (24 Nov 2025, DN#21166) | -20 x R115.00 | R-2,300.00 | TXT line 7; DB lines qty -20, line_total -2300 (PROVEN) |

* **Yes, R300.00 is the whole reason TWK003 ends at R-300.00 (PROVEN).** Payment 43500 (-R38,501.31, TXT line 10) equals 46857 + 47076 + 47523 (3 x R11,000.44 = R33,001.32) + one R5,499.99 invoice. Everything else nets: 47880 R5,499.99 / CN 13966 -R5,499.99 (PROBABLE CN_DN_PAIR T0001, same DN#21166, 6 days) leaves 47991 R5,499.99 as the one paid. Remaining open: 47866 R2,000.00 + CN 13933 -R2,300.00 = **R-300.00**.
* **Same SKU, same quantity, same DN, price differs:** the credit reverses 20 units at R115 against an invoice of 20 units at R100, so the credit exceeds the charge by R15 x 20 = R300.00 (PROVEN arithmetic). Whether R115 or R100 was the correct price is `unverified` (no price list in evidence).
* **STAT 123 remittance (`TWK002/data/remittance_evidence.json` family.postings, `remittance_lines_2026.csv`):** the advice lists 46857, 47076, 47523 and 47880 for TWK003 (R38,501.31 = the 43500 slice on TWK003, PROVEN). It lists **neither 47866 nor CN 13933**, so the customer neither paid nor claimed the pair. The advice names 47880, not 47991 (equal amount; 47880 is reversed by CN 13966). The cash is the same R38,501.31 either way; only which R5,499.99 document it is credited to differs (ASSERTED, matcher tie not approved).
* Payment 43500 appears on TWK003 (R38,501.31), TWK004 (R25,000.31) and TWK002 (R176,824.24): sum R240,325.86 = advice cash (PROVEN, `TWK002/reports/TWK002_open_rows_analysis.md` section 4.3, TXT lines).
* **Conclusion:** a R300.00 credit balance on the customer (overcredit, or price correction not rebilled), a consolidated item to carry, not a payment error: the customer paid exactly the advice. Nothing was overpaid by cash. ASSERTED that it is a price difference; cause `unverified`.
* Data-quality note (ASSERTED, `data/db_replay/2026-10-10/dcc98812*` file DTRX2603.TXT): DB headers from DTRX2603 show CN 13933 -R2,600.00 and CN 13966 -R6,217.38 while DETRANS2307 headers, DB lines and the TXT show -R2,300.00 / -R5,499.99. Ratio is 1.1304 on all three CN headers incl. TWK004 CN 13744 (-7,913.36 vs -7,000.28). Lines and TXT agree, so the figures here use them. The matcher left payment 43500 unallocated on TWK003 (-R38,501.31); it is not a variance.
* **Tripwire (reopens):** a customer remittance or ERP price correction touching 47866/13933; a new document on DN#21166; a credit/refund of the R300.00.

## B2. CN 15775

* **Account:** TWK002 (`TWK002/raw/TWK002_2026-10-08.TXT` line 138; Crd Note, 08 Oct 2026, DN#23843, -R7,935.00). Not on TWK003/TWK004. Not in the DB: connector query of `vw_clean_transactions` (account TWK002/3/4, docs 15775, 53507) returned no rows (PROVEN, 2026-10-10).
* **Lane in projection:** LPG, `split_basis HEADER_FALLBACK`, `confirmable false` (`TWK002/data/v5_projection.json` row 15775|Crd Note|LPG|L125). Reported as an unmatched credit in `TWK002/data/projection_matches.json` residual.
* **Lane its reference implies:** the reference DN#23843 carries no lane marker. The operator ruling (ADM-94 Q5, `statement_v5.json` rowNotes) says it is a CYLINDER credit (CYL). So it sits in the **wrong lane** for now, pending DB lines; the ruling is "reopen if any part lands in LPG". Amount R-7,935.00 equals the gross CYL net per the analysis report; ASSUMED, `unverified` until lines exist.
* **Paired with:** nothing tied. Same DN#23843: invoice 53507 (8 Oct 2026, R14,375.86, also HEADER_FALLBACK, open). Net DN#23843 = R6,440.86. No tie exists (the matcher has none). Also check against the R7,590 cylinder deposits paid in cash on STAT 123 for a double credit (`unverified`, per rowNotes).

## B3. Family open documents

TWK002 (ERP R54,136.19, `TWK002_2026-10-08.TXT`; open documents per `TWK002/data/projection_matches.json`, proof HOLDS):

| Doc | Date | Amount |
| :--- | :--- | ---: |
| 52484 LPG / CYL | 2026-08-12 | 6,926.34 / 11,212.50 |
| CN 15443 (CYL) | 2026-08-12 | -11,040.00 |
| 52803 LPG / CYL | 2026-08-26 | 11,142.35 / 17,250.00 |
| CN 15553 (CYL) | 2026-08-26 | -17,077.50 |
| 53077 | 2026-09-10 | 8,448.07 |
| 53350 | 2026-09-29 | 12,748.90 |
| 53507 | 2026-10-08 | 14,375.86 |
| CN 15775 | 2026-10-08 | -7,935.00 |
| **Open documents (10)** | | **46,051.52** |
| Named pre-window residuals (B/F R2,868.50 unitemised + 24 journals R5,216.17) | | 8,084.67 |
| **TWK002 total** | | **54,136.19** |

TWK003: 47866 R2,000.00 and CN 13933 R-2,300.00 = **R-300.00**. (Matcher view, before the PROBABLE 47880/13966 tie and before payment allocation: 5 open invoices R40,501.31, CN 13933 R-2,300.00, unallocated payment R-38,501.31.)

TWK004: 52948 (4 Sep) R9,000.00, 53113 (10 Sep) R22,000.00, 53536 (9 Oct) R30,000.00 = **R61,000.00**.
CN 15781 (-R32,500.00, 10 Oct, DN#24718) reverses invoice 53535 (R32,500.00, 9 Oct, DN#24718): exact amount, same DN, 1 day (PROBABLE CN_DN_PAIR T0002, net 0, not approved; review-only because the three documents are not yet in the DB). **What remains open from DN#24718 is invoice 53536, R30,000.00.** CN 15781 reverses 53535 only; whether 53536 is a replacement is `unverified`. Payment 43500 R25,000.31 is CONFIRMED against 46858, 47176, 47303, 47584 (EXACT_RUN T0003, with CN 13744/47297 pair T0001).

**Consolidated:** R54,136.19 + R-300.00 + R61,000.00 = **R114,836.19** (PROVEN arithmetic; each term from its ERP header and projection). Ties to open documents: R46,051.52 + R-300.00 + R61,000.00 = R106,751.52, plus the TWK002 named pre-window residual R8,084.67 = R114,836.19. Variance R0.00.

## Caveats and next steps

* Children's `project.json` was not created and no history entry written (not in scope); the handoff must say "connector-sourced (db_replay)".
* TWK004 needs a DB sync (53535, 53536, 15781) and rerun before approving T0002.
* Operator decisions open: treat the R300.00 as customer credit to carry (and whether to request a price correction); CN 15775 lane after ADM-93 sync.
* Generated UI fixtures also written: `src/features/debtor-position-workspace/data/fixtures/TWK00{3,4}.v5.json`.
