# LIN001 — Historical Aggregate Tie-Out (2023–2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Date:** 2026-09-06
**Purpose:** Decide whether the 39 remaining "unmatched" historical events represent real uncollected debt (justifying an event-by-event walk-back) or a data artefact.
**Answer: a data artefact. Do not walk them back on this dataset — the records needed aren't in it, and ERP's own balance proves the money isn't owed.**

---

## The test

Rather than investigate 39 events individually, reconstruct the account's entire balance from `transaction_headers` and compare it to the ERP's authoritative `Current Bal`.

| Source | Balance |
|---|---:|
| **ERP Debtor Account Enquiry — `Current Bal`** (authoritative) | **R21,823.33** |
| Reconstructed from the Supabase mirror (deduped, VAT-corrected) | R232,083.72 |
| **Unexplained** | **~R210,260** |

## Where the gap lives — 2024, and only 2024

| Year | Invoices | Credit notes | Payments | Year net |
|---|---:|---:|---:|---:|
| 2023 | 246,822.77 | -54,019.65 | -192,796.50 | **+6.62** ✓ |
| **2024** | 3,504,019.04 | -1,541,309.92 | -1,703,298.11 | **+259,411.01** ✗ |
| 2025 | 6,696,542.61 | -4,550,838.71 | -2,158,296.43 | -12,592.53 ✓ |
| 2026 | 1,274,215.37 | -900,858.74 | -388,098.01 | -14,741.38 ✓ |

2023 ties to **R6.62** on a R247k year. 2025 and 2026 each land within ~R15k on much larger volumes — ordinary trading noise. 2024 alone throws +R259k.

Payment rows are present in **every** 2024 month (3–13 rows each), so this is not a wholesale missing export batch. Month-level swings (Nov 2024 +R148k, May 2024 -R55k) are credit-note timing across month boundaries and wash out within the year — the annual figure is the real signal.

## Why this settles the question

**If R210k had genuinely gone unpaid in 2024, it would still be sitting in today's balance.** ERP says the balance is R21,823.33. So the debt was settled — the mirror simply cannot show how. The missing or corrupted records are on the mirror side, not the customer's.

That makes an event-by-event walk-back of the 39 unmatched events **unable to succeed on this dataset**: it would mean hunting for payment records that either aren't present or are mis-captured. No amount of analytical care recovers data that isn't there.

## Byproduct: the precise mechanism of DK-593 at header level

While building the dedup, the credit-note corruption pattern was characterised exactly — it is deterministic, not random:

| Source file | CN rows | `amount_excl` correct (ex-VAT) | `amount_excl` actually holds **gross** |
|---|---:|---:|---:|
| DETRANS2307.TXT | 53 | **53** ✓ | 0 |
| DTRX2603.TXT | 55 | 0 | **55** ✗ |
| DRTX2025.TXT | 30 | 0 | **30** ✗ |
| DRTX2024.TXT | 4 | 0 | **4** ✗ |
| Dated DTRX*.TXT (6 files) | 6 | **6** ✓ | 0 |

**Invoices are correct in every file (137/137 VAT-consistent).** The defect is confined to **Credit Note rows in the three older export batches**, where `amount_excl` was populated with the VAT-*inclusive* figure while `tax_amount` stayed correct. Computing `amount_excl + tax_amount` on those rows therefore double-counts VAT.

**Detection rule (deterministic):** a row is correctly ex-VAT when `ABS(amount_excl × 0.15 − tax_amount) ≤ 0.02`. If instead `ABS((amount_excl / 1.15) × 0.15 − tax_amount) ≤ 0.02`, the column holds gross and the correct gross is `amount_excl` alone.

This is directly reusable portfolio-wide (~300 accounts) and should feed DK-593.

**Second defect, same area:** deduping by `(doc_no, entry_type)` and keeping one row silently destroys multi-slice payment documents — LIN001 payment docs legitimately carry several rows (e.g. 42975 = -53,192.50 reversed +53,192.50, reissued as -1,510.76 + -51,681.74). A naive dedup collapsed 270 real payment rows to 99 and understated payments by ~R2.3M. Correct approach: pick one `source_file` per document, then take **all** its rows.

## Prior art — this has partially surfaced before

Found while scanning the repo for prior occurrences (2026-09-06):

- **`CHANGELOG.md`** — TAN001's `erpStatedBalance` query hit exactly Defect 2 above (dedup collapsing distinct rows); fixed by adding `amount_excl`+`tax_amount` to the `DISTINCT ON` clause. The same changelog entry also notes **JIM001 needed payment-split consolidation across `DRTX2025.TXT` and `DTRX2603.TXT`** — the exact two files found conflicting here. Neither fix was generalized into a shared script or `DK-593` at the time.
- **`analysis/debtors/shared/docs/business_rules.md` Rule 1** (Tax Sign Correction) is a *different*, item-level CN bug (`line_tax` sign, not `amount_excl` scale) — don't conflate with Defect 1 above, even though both concern CN VAT handling.
- **Same doc, Rule 6** (ERP Header Cross-Check): a May 2026 portfolio baseline attributes 13,559 CN docs / R11,681,869 of header-vs-line delta *entirely* to Rule 1's tax bug. That may be conflating two distinct mechanisms — worth re-running Rule 6's query with this doc's detection rule to check.

Posted to `DK-593` 2026-09-06.

## Recommendation

1. **Do not** walk back the 39 unmatched events against this data.
2. **Re-export 2024** from ERP and reload it, applying the VAT rule above. Then re-run this tie-out — if 2024 closes to within trading noise like the other three years, the whole pool closes with it. **Raised as DK-598** (operator action, 2026-09-06).
3. Treat the two defects above as concrete, actionable scope for **DK-593** — posted there 2026-09-06, and cross-linked from DK-598 so the fix rules get applied on reload.
4. The account's live exposure remains what the rolling balance says (`LIN001_rolling_balance_2025-11_2026-09.md`): R10,463.59 as-posted, R2,278.60 once DK-590/591/592/596 post. Nothing here changes that.

---

## Method note

Reconstruction used: one `source_file` per `(doc_no, entry_type)` ranked newest-batch-first (DETRANS2307 + dated DTRX* > DTRX2603 > DRTX2025 > DRTX2024), taking **all** rows from the chosen file, with gross computed by the VAT-consistency rule above. Payments carry `tax_amount = 0` and are taken at `amount_excl`. Zero-net and reversal legs are included as-is, since they net correctly in aggregate.

This method is sound for the aggregate question asked here. It is **not** a substitute for the per-event verification used in `allocation_edges.csv` — individual events still need their reversal chains resolved by hand, as done throughout this session.

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_historical_tieout_2023_2026.md`*
