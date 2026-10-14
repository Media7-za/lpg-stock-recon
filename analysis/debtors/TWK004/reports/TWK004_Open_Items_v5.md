# Open Items Statement: TWK AGRI (TWK004) — Internal
**Period:** from 01 Mar 2025 to 10 Oct 2026 &nbsp;|&nbsp; **Balance due:** R61,000.00
**Status:** matcher v5 RATIFIED 2026-10-10 (`PROPOSED_Projection_Matching_Locks.md`); probable ties are proposals until approved · generated 2026-10-14 by `render_open_items.mjs`
**Sources:** `analysis/debtors/TWK004/data/v5_projection.json` (TXT sha256 `e3e46aca4947…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (3 confirmed / 0 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R0.00

## Part 1A: LPG + OTHER open items

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Sept 2026 | Invoice | 52948 | DN#24817 | OTHER | 9,000.00 | 9,000.00 |
| 10 Sept 2026 | Invoice | 53113 | DN#24985 | OTHER | 22,000.00 | 31,000.00 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 09 Oct 2026 | Invoice | 53536 | DN#24718 | OTHER | 30,000.00 | 61,000.00 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 0.00 | 0.00 | 0.00 |
| Open items listed above | 61,000.00 | 0.00 | 61,000.00 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| **Balance** | 61,000.00 | 0.00 | 61,000.00 |
| ERP `CURRENT BALANCE` (TXT header) | | | 61,000.00 |
| **Variance** | | | **0.00** |

## Operator notes on open rows

- **Invoice 53536:** Operator ruling 2026-10-12 (main session, answer "yes"): invoice 53536 (R30,000.00, DN#24718, 2026-10-09) REPLACES invoice 53535 (R32,500.00, same DN, same day), which CN 15781 (-R32,500.00, 2026-10-10) reverses in full. 53535 / CN 15781 is a settled pair (matcher CONFIRMED CN_DN_PAIR T0002, 2026-10-11 replay; no lock needed or possible) and 53536 is the open, correct invoice. Evidence: headers 53535/53536/15781 in DB (DTRX1010.TXT); lines show 53536 = 200 x stock 00000400 + 40 x 00000401 vs 53535 = 200 x 00000400 + 50 x 00000401. The R2,500.00 difference (10 x R250.00) is the correction; the reason for it is unverified. Tripwires: a delivery note or ERP statement that 53536 is NOT a replacement; any further credit or document on DN#24718; a DB re-sync that changes the 53535, 53536 or 15781 lines.

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| CN_DN_PAIR | 2 |
| EXACT_RUN | 1 |

Full tie list: `data/projection_matches.json`.

