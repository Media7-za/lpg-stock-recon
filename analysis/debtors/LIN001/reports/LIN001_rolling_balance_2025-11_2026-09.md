# LIN001 Rolling Balance — Full History (Nov 2025 – Sep 2026)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Doctrine:** rolling/cumulative account balance (adopted 2026-09-06, see `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2) — each event's surplus or shortage carries forward chronologically into the next, matching the ERP's own Debtor Account Enquiry running-balance column.
**Scope:** the 16 events in `analysis/debtors/LIN001/data/allocation_edges.csv` (AL-0001 through AL-0014, plus AL-0020/AL-0021) and the two register-only zero-payment/closed events (DN#22508, and DN#24817's full detail) — i.e. this account's fully-vetted, individually-verified Nov 2025–Sep 2026 event set. This is **not** a raw dump of `transaction_headers` — see "Why not a raw SQL rebuild" below.

---

## Two positions, not one — because four corrections are proposed but not yet posted

This account currently has **four unposted corrections** sitting in Jira (DK-590, DK-591, DK-592, DK-596). The rolling balance is materially different depending on whether you read it against what's *actually in ERP today* or what it *will be once those post*. Both are shown below — conflating them would misstate the account's real current exposure.

### Position 1 — AS-POSTED (ERP today, 2026-09-06, before DK-590/591/592/596 post)

| # | Event | Date | Balance (event net) | Surplus in | Payment(s) | Surplus out |
|---:|---|---|---:|---:|---:|---:|
| 1 | DN#21147 | 2025-11-06 | 30,554.71 | 0.00 | 30,554.71 | 0.00 |
| 2 | DN20897 | 2025-12-05 | 27,890.88 | 0.00 | 27,890.50 | -0.38 |
| 3 | DN#20898 | 2025-12-06 | 50,237.46 | -0.38 | 50,237.00 | -0.84 |
| 4 | DN#21711 | 2025-12-16 | 38,860.85 | -0.84 | 38,860.00 | -1.69 |
| 5 | DN#21432 | 2025-12-20 | 53,192.93 | -1.69 | 53,192.50 | -2.12 |
| 6 | DN#21732 | 2025-12-23 | 42,516.88 | -2.12 | 42,516.50 | -2.50 |
| 7 | DN#21739 | 2025-12-26 | 34,877.91 | -2.50 | 34,877.50 | -2.91 |
| 8 | DN-21627 | 2026-01-10 | 52,906.77 *(as posted — rate correction not yet posted)* | -2.91 | 49,588.00 | -3,321.68 |
| 9 | DN#21237 | 2026-02-06 | 78,304.31 *(as posted — DK-590 not yet posted)* | -3,321.68 | 75,844.50 | -5,781.49 |
| 10 | DN#21541 | 2026-02-13 | 44,794.87 *(as posted — DK-591/596 not yet posted)* | -5,781.49 | 40,590.60 | -9,985.76 |
| 11 | DN#22630 | 2026-06-08 | 63,325.00 *(corrected — discount posted 2026-09-06)* | -9,985.76 | 63,325.00 | -9,985.76 |
| 12 | DN#22508 | 2026-06-18 | 0.00 (zero-net) | -9,985.76 | 0.00 | -9,985.76 |
| 13 | DN#22936 | 2026-07-08 | 53,951.69 | -9,985.76 | 54,981.36 | -8,956.09 |
| 14 | DN#23974 | 2026-08-24 | 30,207.80 | -8,956.09 | 34,721.00 | -4,442.89 |
| 15 | DN#24947 | 2026-09-02 | 5,433.70 | -4,442.89 | 28,163.00 | 18,286.41 |
| 16 | DN#24817 | 2026-09-04 | 42,856.80 *(confirmed legitimate — see event card)* | 18,286.41 | 14,106.80 | **-10,463.59** |

**As things actually stand in ERP right now: R10,463.59 short across the full window.** This is a meaningfully different picture from the Jun–Sep-only view (R477.83 short) — the account was already carrying a real, mostly-explained shortfall from the Jan/Feb 2026 events (DN-21627, DN#21237, DN#21541) *before* the Jun–Sep window even starts, and that carries through the whole trajectory. The small negative drift through events 1–7 (down to -R2.91) is ordinary VAT-rounding noise on Tier-4 proximity matches — immaterial on its own, but it's real and it compounds.

### Position 2 — FULLY CORRECTED (once DK-590/591/592/596 all post; DN-21627's R1,449.00 customer-owed portion assumed to remain outstanding, since it's a real debt, not a correction)

| # | Event | Balance (corrected) | Surplus in | Payment(s) | Surplus out |
|---:|---|---:|---:|---:|---:|
| 1–7 | *(unchanged — no corrections apply)* | | | | -2.91 |
| 8 | DN-21627 | 51,037.00 *(-R1,869.77 rate credit posted)* | -2.91 | 49,588.00 | -1,451.91 |
| 9 | DN#21237 | 75,844.34 *(-R2,459.97 posted)* | -1,451.91 | 75,844.50 | -1,451.75 |
| 10 | DN#21541 | 40,939.62 *(-R60.25 and -R3,795.00 both posted)* | -1,451.75 | 40,590.60 | -1,800.77 |
| 11–12 | DN#22630 / DN#22508 | 63,325.00 / 0.00 | -1,800.77 | 63,325.00 / 0.00 | -1,800.77 |
| 13 | DN#22936 | 53,951.69 | -1,800.77 | 54,981.36 | -771.10 |
| 14 | DN#23974 | 30,207.80 | -771.10 | 34,721.00 | 3,742.10 |
| 15 | DN#24947 | 5,433.70 | 3,742.10 | 28,163.00 | 26,471.40 |
| 16 | DN#24817 | 42,856.80 | 26,471.40 | 14,106.80 | **-2,278.60** |

**Once the four pending corrections post: R2,278.60 short** — small relative to ~R600K+ of volume over the period (about 0.4%), but not zero, and worth being precise about rather than rounding it away.

**The R8,184.99 gap between these two positions (10,463.59 − 2,278.60) is exactly the sum of the four unposted corrections:** 1,869.77 (DK-592) + 2,459.97 (DK-590) + 60.25 (DK-591) + 3,795.00 (DK-596) = 8,184.99. This is exactly why getting DK-590/591/592/596 posted matters — until they are, the account's true rolling exposure is **R10,463.59**, not the smaller number.

---

## Why not a raw SQL rebuild of `transaction_headers`

Before building this table from `allocation_edges.csv`, a raw full-history query against `transaction_headers` (all entry types, deduped by `doc_no`+`entry_type`, latest `created_at` wins) was attempted and discarded — it produced a cumulative net of **+R2,233,450.43**, wildly inconsistent with the account's actual ~R21,823.33 current balance (per the ERP Debtor Account Enquiry screen). The account has **10 overlapping `source_file` batches** spanning 2023–2026 (e.g. `DETRANS2307.TXT` and `DTRX2603.TXT` both cover Dec 2024–Feb 2026 with different row counts and, for at least one document, different amounts), and simple dedup heuristics don't resolve it safely — this is the **transaction_headers-level manifestation of DK-593** (previously only confirmed at the `transaction_items` level). Solving that properly is a separate, larger task, not something to paper over here.

The 16-event set used above avoids this trap because every event in it was individually verified against ERP earlier in this session (cross-checking `ref_no` linkage, `description` DN# tags, and — where source-file conflicts were found, e.g. DN#21541's CN 14430/14432/14435 — resolving them by hand). It should not be treated as complete beyond this specific set: the "46 unmatched historical events" from the full-history scripted pass (2023–2024, `data/dn_event_payment_allocation_candidates.json`) and anything before 2025-11-06 are out of scope here.

---

## What this means for the account

1. **Get DK-590, DK-591, DK-592, and DK-596 posted.** Until they are, the account's real rolling exposure is R10,463.59, not R477.83 or R2,278.60 — this is the single biggest lever on the number.
2. **DN-21627's R1,449.00 remains a genuine outstanding collections item** in both positions above — it's a customer-acknowledged debt, not something the rolling view resolves or should resolve.
3. **R2,278.60 (the fully-corrected position) is the number to judge future events against** — not R477.83. Treating the Jun–Sep window in isolation understated the account's actual carried-forward exposure by exactly the unposted Jan/Feb corrections.

---

## Artifacts

| Artifact | Path |
|---|---|
| This table | `LIN001_rolling_balance_2025-11_2026-09.md` |
| Jun–Sep-only rolling bridge (superseded in scope by this file, kept for its per-event detail) | `LIN001_balance_bridge_2026-06_2026-09.md` |
| Source data | `../data/allocation_edges.csv` |
| Doctrine | `.agents/skills/SKILL_LIN001_Debtor_Reconciliation.md` §2 |

---

*Internal workspace artifact — `analysis/debtors/LIN001/reports/LIN001_rolling_balance_2025-11_2026-09.md`*
