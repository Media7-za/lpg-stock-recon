# Cylinder deposit rates (`skuRates`): portfolio preview, 2026-10-13

Status: PREVIEW ONLY. No config, template or statement was changed. Nothing here is a ruling; whether to change the rates is the operator's decision.

## 1. The question

`skuRates` in each account's `config/statement_v5.json` values the cylinder custody exposure (Part 2) and feeds the "Cylinder Position (1B vs custody)" line. The operator confirmed on 2026-10-13 that **cylinder deposits are static** (gas fill prices change often; deposits do not), and that deposit prices **did change in the past and have since settled**. The MD0003 analysis found the 14kg deposit (`14.1`) configured at R575.00 while every 14kg deposit line since 2024-12-04 is R632.50.

## 2. What is configured today (PROVEN, configs)

All 19 accounts with a `statement_v5.json` carry the **same** default, copied from `analysis/debtors/shared/templates/statement_v5_config.template.json`:
`14.1: 575, 19.1: 690, 9.1: 517.5, D.1: 1150, S.1: 1150`.

## 3. What the ERP says (ASSERTED, from the MD0003 ruling pack's read-only SELECT of `public.erp_inventory`, `STOCK.TXT`, updated 2026-09-13; not re-queried here)

| Code | ERP deposit, ex VAT | Incl. 15% VAT | Config today | Differs |
| :-- | ---: | ---: | ---: | :-- |
| 14.1 | 550.00 | **632.50** | 575.00 | yes (R57.50) |
| 19.1 | 600.00 | 690.00 | 690.00 | no |
| 9.1 | 450.00 | 517.50 | 517.50 | no |
| D.1 | 1,050.00 | **1,207.50** | 1,150.00 | yes (R57.50) |
| S.1 | 1,050.00 | **1,207.50** | 1,150.00 | yes (R57.50) |

14.1 invoice lines across all accounts' `invoices.csv` (PROVEN, scan): R632.50 on 119 lines from 2024-12-04 to 2026-06-01; earlier rates R345.00 (2021-09-14 to 2024-10-09, 72 lines) and R598.00 (2022-08-04 to 2024-08-07, 26 lines). **No 14.1 line anywhere is R575.00.** So R575.00 is a template default with no price behind it; D.1/S.1 R1,150.00 likewise differs from the ERP list.

## 4. Scratch-run results (PROVEN, 13 onboarded accounts)

Method: a scratch copy of `analysis/` outside the repo (the real tree was untouched; `git status` clean afterwards). For each account I ran the real `reconcile_debtor_v5_from_txt.mjs` offline against the account's **latest committed replay capture** (no connector), three times: base config; **A** = 14.1 set to 632.50; **B** = A plus D.1 and S.1 set to 1,207.50. The table shows custody exposure and the gap (1B financial minus custody). ERP balances, ties and customer open items cannot change; only Part 2 custody figures move.

| Account | Capture used | Base: custody / gap | A (14.1 only): custody / gap | B (14.1 + D.1 + S.1): custody / gap |
| :-- | :-- | ---: | ---: | ---: |
| BU0009 | 2026-10-10 | R1,610.00 / R1,150.00 | R2,817.50 / R-57.50 | R2,760.00 / R0.00 |
| FIR001 | 2026-10-08c | R1,552.50 / R0.00 | R1,552.50 / R0.00 | R1,552.50 / R0.00 |
| JEN001 | 2026-10-08 | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |
| JIM001 | 2026-10-10 | R-632.50 / R954.50 | R-632.50 / R954.50 | R-690.00 / R1,012.00 |
| MD0003 | 2026-10-08 | R1,667.50 / R115.00 | R1,782.50 / R0.00 | R1,782.50 / R0.00 |
| MON001 | 2026-10-08b | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |
| MOZ002 | 2026-10-08b | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |
| RED001 | 2026-10-08b | R-3,450.00 / R-172.50 | R-3,450.00 / R-172.50 | R-3,622.50 / R0.00 |
| SA0001 | 2026-10-08 | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |
| TAN002 | 2026-10-08b | R2,990.00 / R-1,092.50 | R2,990.00 / R-1,092.50 | R3,105.00 / R-1,207.50 |
| TWK002 | 2026-10-11 | R8,912.50 / R-57.50 | R8,855.00 / R0.00 | R8,855.00 / R0.00 |
| TWK003 | 2026-10-10 | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |
| TWK004 | 2026-10-11 | R0.00 / R0.00 | R0.00 / R0.00 | R0.00 / R0.00 |

**Reading it (PROVEN arithmetic, ASSERTED cause):**
- **Gap closes exactly with the ERP rates in four accounts:** MD0003 (A: R115.00 to 0), TWK002 (A: R-57.50 to 0), RED001 (B: R-172.50 to 0), BU0009 (needs both: R1,150.00 to R-57.50 with A alone, to 0 with B). Landing on exactly R0.00 each time is strong evidence the ERP list rates are the right ones.
- **No effect:** FIR001, JEN001, MON001, MOZ002, SA0001, TWK003, TWK004 (no open custody in the affected SKUs).
- **Gaps that are not rate gaps:** TAN002 (R-1,092.50 base; widens to R-1,207.50 under B) and JIM001 (R954.50 base; R1,012.00 under B). The rate change moves their custody by exactly the rate delta times quantity, but the gap was already large for another reason (quantity or history: JIM001 starts 2022-05 with negative net custody, TAN002 has a different cylinder story). They need their own explanation either way; the rate change neither causes nor fixes them.

## 5. Not covered

- **Six accounts with no projection yet** (BR0001, BU0002, GAS004, IVE001, JAY000, TAN001): they would pick up the corrected rates when onboarded. TAN001 has an opening cylinder position (19.1 -3, 9.1 +13, D.1 +2, S.1 -9) and `cylOpeningFinancial` -6,210, so changing its D.1/S.1 rate changes its opening valuation and needs its own review.
- **Pre-December-2024 history.** A single static rate cannot value cylinders issued when the deposit was R345.00 or R598.00. Accounts whose windows start earlier (JIM001 2022-05, FIR001 2022-12, SA0001 2023-02, MON001 2024-07, BU0009 2024-12-21) may hold older cylinders at older deposits: whether that matters is `unverified`. A dated rate table (rate by effective date) would be the correct model; not proposed here.
- The ERP list rates are taken from the MD0003 session's report, not re-queried.

## 6. Options for the operator

| Option | Change | Effect |
| :-- | :-- | :-- |
| 0 | Nothing | R115.00-type gaps stay in MD0003, TWK002, RED001, BU0009 |
| A | `14.1` to 632.50 in the template and the 19 configs | Clears MD0003 and TWK002; BU0009 overshoots to R-57.50 |
| **B (recommended, ASSUMED)** | `14.1` 632.50, `D.1` and `S.1` 1,207.50 in the template and the 19 configs, then rebuild the 13 onboarded accounts offline from their committed captures and commit the regenerated projections and statements | Clears MD0003, TWK002, RED001, BU0009 exactly; TAN002 and JIM001 gaps stay (and are not rate-caused); no ERP balance or customer figure changes |
| C | B, plus per-account decisions for TAN001 and for the pre-Dec-2024 accounts, then a dated rate table | Correct long term, larger change |

If B is approved the work is mechanical: change the template (affects all future onboarding), update the 19 configs with a dated note in `bfSourceNote` style (old value kept in the text, never silently overwritten), rebuild each account offline, run `npm run debtors:test`, and record the ruling with its tripwires (an ERP deposit price change; a customer-specific deposit rate; a stock count that disagrees).
