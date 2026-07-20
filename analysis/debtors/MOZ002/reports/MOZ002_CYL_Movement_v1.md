# MOZ002 — Turn 7f: CYL Lane Movement & Residual Decomposition v1

> **⛔ SUPERSEDED by `MOZ002_CYL_Movement_v2.md` (Turn 7g, 2026-07-19).** Section A ledger qty doubling on docs 50174/50067/14705/50306/14773 was a duplicate-header JOIN defect; closing custody R5,347.50 is not authoritative. Use v2 three-basis custody and staged registry v10.

**Generated:** 2026-07-19 · **Scope:** Read-only · first CYL lane entry · no edge/registry/reconState changes
**Source:** Supabase `transaction_items` + `transaction_headers`

---

## Executive summary

| Finding | Verdict |
| :--- | :--- |
| **14741 / DN#22161 (EX-0015)** | CN has **no line items** in DB — qty forensics **inconclusive** |
| **Registry bulk “1×9kg short → R517.50”** | **Over-generalised** — 11/16 FULL_CLEAR at qty; 2/16 are 1×S.1 short (R1,207.50) |
| **PRICE_VARIANCE R483/R586.50** | **Refuted** — CYL deposits use R450 (9.1) and R1,050 (S.1/D.1) only |
| **Companion 12082** | **Quantity return** −1×9.1 — not price adjustment |
| **Closing custody** | 1×9.1, 2×D.1, 2×S.1 → **R5 347,50** |

> Registry `PARTIAL_EMPTY_RETURN` framing disagrees with line qty on **most** deliveries.

---

## A. Movement ledger

| Date | Doc | Type | DN ref | SKU | Unit excl | Qty out | Qty in | Line value | Run qty | Run value |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Sat Mar 15 | 12075 | Crd Note | DN#4438-EMPTY | 19.1 | R600,00 |  | 1 | R-690,00 | -1 | R-690,00 |
| Sat Mar 15 | 12075 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Sat Mar 15 | 41504 | Invoice | DN#4438-EMPTY | 19.1 | R600,00 | 1 |  | R690,00 | 0 | R0,00 |
| Sat Mar 15 | 41504 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Sat Mar 15 | 41523 | Invoice | DN#4438-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sat Mar 15 | 41523 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon Mar 17 | 12080 | Crd Note | DN#4438-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Mon Mar 17 | 12080 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Mon Mar 17 | 12081 | Crd Note | DN#4438-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Mon Mar 17 | 12082 | Crd Note | DN#4438-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Mar 17 | 41535 | Invoice | DN#4438-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Mar 17 | 41535 | Invoice | DN#4438-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue Mar 25 | 12123 | Crd Note | DN#12977-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Tue Mar 25 | 12123 | Crd Note | DN#12977-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Tue Mar 25 | 41713 | Invoice | DN#12977-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Tue Mar 25 | 41713 | Invoice | DN#12977-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue Apr 01 | 41895 | Invoice | DN#12836-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Wed Apr 02 | 12174 | Crd Note | DN#12836-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Wed Apr 16 | 42307 | Invoice | DN#13072-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed Apr 16 | 42307 | Invoice | DN#13072-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Thu Apr 17 | 12296 | Crd Note | DN#13072-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Thu Apr 17 | 12296 | Crd Note | DN#13072-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | 0 | R0,00 |
| Tue Apr 29 | 12369 | Crd Note | DN#13110-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Tue Apr 29 | 42613 | Invoice | DN#13110-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue May 06 | 12423 | Crd Note | DN#12058-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Tue May 06 | 12423 | Crd Note | DN#12058-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Tue May 06 | 42844 | Invoice | DN#12058-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Tue May 06 | 42844 | Invoice | DN#12058-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue May 13 | 12468 | Crd Note | DN#12076-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Tue May 13 | 43007 | Invoice | DN#12076-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Thu May 15 | 43082 | Invoice | DN#13232-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed May 21 | 43246 | Invoice | DN#12106-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Wed May 21 | 43246 | Invoice | DN#12106-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Thu May 22 | 12535 | Crd Note | DN#12106-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Thu May 29 | 43462 | Invoice | DN#12137-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Fri May 30 | 12599 | Crd Note | DN#12137-EMPTY | 9.1 | R450,00 |  | 2 | R-1 035,00 | 0 | R0,00 |
| Fri May 30 | 12599 | Crd Note | DN#12137-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Thu Jun 05 | 43649 | Invoice | DN#12149-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Fri Jun 06 | 12639 | Crd Note | DN#12149-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Fri Jun 06 | 12640 | Crd Note | DN#12149-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Fri Jun 06 | 12640 | Crd Note | DN#12149-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Fri Jun 06 | 43669 | Invoice | DN#12149-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Fri Jun 06 | 43669 | Invoice | DN#12149-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Thu Jun 12 | 12710 | Crd Note | DN#12560-E,MPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Thu Jun 12 | 43859 | Invoice | DN#12560-E,MPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Thu Jun 19 | 12763 | Crd Note | DN#12412-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Thu Jun 19 | 12763 | Crd Note | DN#12412-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Thu Jun 19 | 44063 | Invoice | DN#12412-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Thu Jun 19 | 44063 | Invoice | DN#12412-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Tue Jun 24 | 44201 | Invoice | DN#12325-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Wed Jun 25 | 12812 | Crd Note | DN#12325-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Tue Jul 01 | 12872 | Crd Note | DN#12349-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Tue Jul 01 | 44404 | Invoice | DN#12349-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Fri Jul 11 | 44743 | Invoice | DN#12686-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri Jul 11 | 44743 | Invoice | DN#12686-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Sat Jul 12 | 12962 | Crd Note | DN#12686-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Sat Jul 12 | 12962 | Crd Note | DN#12686-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 1 | R1 207,50 |
| Fri Jul 18 | 44950 | Invoice | DN#12649-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri Jul 18 | 44950 | Invoice | DN#12649-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Sat Jul 19 | 13020 | Crd Note | DN#12649-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Sat Jul 19 | 13020 | Crd Note | DN#12649-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 1 | R1 207,50 |
| Mon Jul 28 | 45200 | Invoice | DN20020. | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Mon Jul 28 | 45200 | Invoice | DN20020. | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Tue Jul 29 | 13069 | Crd Note | DN20020. | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Tue Jul 29 | 13069 | Crd Note | DN20020. | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 1 | R1 207,50 |
| Fri Aug 01 | 13102 | Crd Note | DN #20126- EMPTIES | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Fri Aug 01 | 13102 | Crd Note | DN #20126- EMPTIES | S.1 | R1 050,00 |  | 1 | R-1 207,50 | 0 | R0,00 |
| Fri Aug 01 | 45304 | Invoice | DN #20126- EMPTIES | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Fri Aug 01 | 45304 | Invoice | DN #20126- EMPTIES | S.1 | R1 050,00 | 1 |  | R1 207,50 | 1 | R1 207,50 |
| Thu Aug 07 | 45489 | Invoice | DN#20072-- EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 3 | R3 622,50 |
| Fri Aug 08 | 13165 | Crd Note | DN#20072-- EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 1 | R1 207,50 |
| Mon Aug 11 | 13194 | Crd Note | DN#20306-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Aug 11 | 13194 | Crd Note | DN#20306-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -1 | R-1 207,50 |
| Mon Aug 11 | 45578 | Invoice | DN#20306-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Aug 11 | 45578 | Invoice | DN#20306-EMPTY | D.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Mon Aug 18 | 13251 | Crd Note | DN#20515-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Aug 18 | 13251 | Crd Note | DN#20515-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -3 | R-3 622,50 |
| Mon Aug 18 | 45721 | Invoice | DN#20515-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Aug 18 | 45721 | Invoice | DN#20515-EMPTY | S.1 | R1 050,00 | 1 |  | R1 207,50 | -2 | R-2 415,00 |
| Mon Aug 25 | 13301 | Crd Note | DN#20439-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Aug 25 | 13301 | Crd Note | DN#20439-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Mon Aug 25 | 45873 | Invoice | DN#20439-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Aug 25 | 45873 | Invoice | DN#20439-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Mon Sep 01 | 13349 | Crd Note | DN#20566-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Mon Sep 01 | 46051 | Invoice | DN#20566-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Wed Sep 10 | 13434 | Crd Note | DN#20477-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Wed Sep 10 | 13434 | Crd Note | DN#20477-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Wed Sep 10 | 46268 | Invoice | DN#20477-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Wed Sep 10 | 46268 | Invoice | DN#20477-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Mon Sep 22 | 13523 | Crd Note | DN#21051-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Sep 22 | 13523 | Crd Note | DN#21051-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Mon Sep 22 | 46563 | Invoice | DN#21051-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Sep 22 | 46563 | Invoice | DN#21051-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Fri Sep 26 | 13552 | Crd Note | DN#20277-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Fri Sep 26 | 13552 | Crd Note | DN#20277-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Fri Sep 26 | 46670 | Invoice | DN#20277-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Fri Sep 26 | 46670 | Invoice | DN#20277-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Wed Oct 01 | 46826 | Invoice | DN#21092-EPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 0 | R0,00 |
| Fri Oct 03 | 13602 | Crd Note | DN#21092-EPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -2 | R-2 415,00 |
| Thu Oct 09 | 13651 | Crd Note | DN#20704-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Thu Oct 09 | 13651 | Crd Note | DN#20704-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Thu Oct 09 | 46981 | Invoice | DN#20704-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Thu Oct 09 | 46981 | Invoice | DN#20704-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Sat Oct 18 | 13710 | Crd Note | DN#21109-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Sat Oct 18 | 13710 | Crd Note | DN#21109-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Sat Oct 18 | 47171 | Invoice | DN#21109-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Sat Oct 18 | 47171 | Invoice | DN#21109-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Thu Oct 30 | 13771 | Crd Note | DN#20767-EMPTY | 9.1 | R450,00 |  | 2 | R-1 035,00 | -2 | R-1 035,00 |
| Thu Oct 30 | 13771 | Crd Note | DN#20767-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Thu Oct 30 | 47402 | Invoice | DN#20767-EMPTY | 9.1 | R450,00 | 2 |  | R1 035,00 | 0 | R0,00 |
| Thu Oct 30 | 47402 | Invoice | DN#20767-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Mon Nov 10 | 47590 | Invoice | DN#20815-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Mon Nov 10 | 47590 | Invoice | DN#20815-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Tue Nov 11 | 13838 | Crd Note | DN#20815-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -2 | R-2 415,00 |
| Sat Nov 22 | 13931 | Crd Note | DN#20859-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Sat Nov 22 | 47858 | Invoice | DN#20859-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -2 | R-2 415,00 |
| Fri Nov 28 | 13974 | Crd Note | DN#20691-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Fri Nov 28 | 13974 | Crd Note | DN#20691-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Fri Nov 28 | 47980 | Invoice | DN#20691-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Fri Nov 28 | 47980 | Invoice | DN#20691-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Thu Dec 04 | 14007 | Crd Note | DN20893 EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | -4 | R-4 830,00 |
| Thu Dec 04 | 48096 | Invoice | DN20893 EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -1 | R-1 207,50 |
| Thu Dec 18 | 14113 | Crd Note | DN#21716-EMPTY | 9.1 | R450,00 |  | 2 | R-1 035,00 | -1 | R-517,50 |
| Thu Dec 18 | 14113 | Crd Note | DN#21716-EMPTY | S.1 | R1 050,00 |  | 4 | R-4 830,00 | -5 | R-6 037,50 |
| Thu Dec 18 | 48348 | Invoice | DN#21716-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Thu Dec 18 | 48348 | Invoice | DN#21716-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Mon Jan 05 | 14210 | Crd Note | DN-21449-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Jan 05 | 14210 | Crd Note | DN-21449-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Mon Jan 05 | 48614 | Invoice | DN-21449-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Jan 05 | 48614 | Invoice | DN-21449-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Thu Jan 15 | 14276 | Crd Note | DN#21640-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Thu Jan 15 | 14276 | Crd Note | DN#21640-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Thu Jan 15 | 48798 | Invoice | DN#21640-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Thu Jan 15 | 48798 | Invoice | DN#21640-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Mon Jan 26 | 14335 | Crd Note | DN#21481EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | -1 | R-517,50 |
| Mon Jan 26 | 14335 | Crd Note | DN#21481EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Mon Jan 26 | 48941 | Invoice | DN#21481EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Mon Jan 26 | 48941 | Invoice | DN#21481EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Sat Feb 07 | 49144 | Invoice | DN-21528-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sat Feb 07 | 49144 | Invoice | DN-21528-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Mon Feb 09 | 14395 | Crd Note | DN-21528-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -2 | R-2 415,00 |
| Thu Feb 19 | 14458 | Crd Note | DN_21913-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Thu Feb 19 | 49329 | Invoice | DN_21913-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Wed Mar 04 | 14533 | Crd Note | DN#22112-EMPTY | 9.1 | R450,00 |  | 2 | R-1 035,00 | -1 | R-517,50 |
| Wed Mar 04 | 14533 | Crd Note | DN#22112-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -5 | R-6 037,50 |
| Wed Mar 04 | 49551 | Invoice | DN#22112-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Wed Mar 04 | 49551 | Invoice | DN#22112-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | -2 | R-2 415,00 |
| Thu Mar 12 | 49711 | Invoice | DN#21963-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Thu Mar 12 | 49711 | Invoice | DN#21963-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 1 | R1 207,50 |
| Fri Mar 13 | 14587 | Crd Note | DN#21963-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Fri Mar 13 | 14587 | Crd Note | DN#21963-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -2 | R-2 415,00 |
| Thu Mar 26 | 14666 | Crd Note | DN-21985-EMPTY | D.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Thu Mar 26 | 49934 | Invoice | DN-21985-EMPTY | D.1 | R1 050,00 | 2 |  | R2 415,00 | 2 | R2 415,00 |
| Thu Apr 02 | 14705 | Crd Note | DN-21858-EMPTY | 9.1 | R450,00 |  | 2 | R-1 035,00 | -2 | R-1 035,00 |
| Thu Apr 02 | 14705 | Crd Note | DN-21858-EMPTY | S.1 | R1 050,00 |  | 4 | R-4 830,00 | -6 | R-7 245,00 |
| Thu Apr 02 | 50067 | Invoice | DN-21858-EMPTY | 9.1 | R450,00 | 2 |  | R1 035,00 | 0 | R0,00 |
| Thu Apr 02 | 50067 | Invoice | DN-21858-EMPTY | S.1 | R1 050,00 | 4 |  | R4 830,00 | -2 | R-2 415,00 |
| Fri Apr 10 | 50174 | Invoice | DN-22161-EMPTY | 9.1 | R450,00 | 2 |  | R1 035,00 | 2 | R1 035,00 |
| Fri Apr 10 | 50174 | Invoice | DN-22161-EMPTY | S.1 | R1 050,00 | 4 |  | R4 830,00 | 2 | R2 415,00 |
| Mon Apr 20 | 14773 | Crd Note | DN-21336-EMPTY | S.1 | R1 050,00 |  | 6 | R-7 245,00 | -4 | R-4 830,00 |
| Mon Apr 20 | 50306 | Invoice | DN-21336-EMPTY | S.1 | R1 050,00 | 6 |  | R7 245,00 | 2 | R2 415,00 |
| Wed May 06 | 14850 | Crd Note | DN#22222-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 1 | R517,50 |
| Wed May 06 | 14850 | Crd Note | DN#22222-EMPTY | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Wed May 06 | 14856 | Crd Note | DN#22222-EMPTY | 9.1 | R450,00 |  | 3 | R-1 552,50 | -2 | R-1 035,00 |
| Wed May 06 | 14856 | Crd Note | DN#22222-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | -3 | R-3 622,50 |
| Wed May 06 | 50519 | Invoice | DN#22222-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | -1 | R-517,50 |
| Wed May 06 | 50519 | Invoice | DN#22222-EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | -1 | R-1 207,50 |
| Wed May 06 | 50529 | Invoice | DN#22222-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 0 | R0,00 |
| Wed May 06 | 50529 | Invoice | DN#22222-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 2 | R2 415,00 |
| Wed May 13 | 50658 | Invoice | DN#22385-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Wed May 13 | 50658 | Invoice | DN#22385-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 5 | R6 037,50 |
| Thu May 14 | 14904 | Crd Note | DN#22385-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | 2 | R2 415,00 |
| Thu May 28 | 14981 | Crd Note | DN#22603 | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Thu May 28 | 50917 | Invoice | DN#22603 | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sat Jun 06 | 15027 | Crd Note | DN# 22786 | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Sat Jun 06 | 15027 | Crd Note | DN# 22786 | S.1 | R1 050,00 |  | 2 | R-2 415,00 | 0 | R0,00 |
| Sat Jun 06 | 51078 | Invoice |  | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Sat Jun 06 | 51078 | Invoice |  | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Mon Jun 15 | 15072 | Crd Note | DN#22502-EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 0 | R0,00 |
| Mon Jun 15 | 15072 | Crd Note | DN#22502-EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | 0 | R0,00 |
| Mon Jun 15 | 51236 | Invoice | DN#22502-EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 1 | R517,50 |
| Mon Jun 15 | 51236 | Invoice | DN#22502-EMPTY | S.1 | R1 050,00 | 3 |  | R3 622,50 | 3 | R3 622,50 |
| Thu Jun 25 | 51432 | Invoice | DN#22662=EMPTY | 9.1 | R450,00 | 1 |  | R517,50 | 2 | R1 035,00 |
| Thu Jun 25 | 51432 | Invoice | DN#22662=EMPTY | S.1 | R1 050,00 | 2 |  | R2 415,00 | 5 | R6 037,50 |
| Fri Jun 26 | 15128 | Crd Note | DN#22662=EMPTY | 9.1 | R450,00 |  | 1 | R-517,50 | 1 | R517,50 |
| Fri Jun 26 | 15128 | Crd Note | DN#22662=EMPTY | S.1 | R1 050,00 |  | 3 | R-3 622,50 | 2 | R2 415,00 |

### Unit price changes

- **19.1**: R600,00 from Sat Mar 15 (doc 12075)
- **9.1**: R450,00 from Sat Mar 15 (doc 41523)
- **D.1**: R1 050,00 from Mon Aug 11 (doc 45578)
- **S.1**: R1 050,00 from Sat Mar 15 (doc 12075)

---

## B. DN#22161 forensics

### Invoice 50174 (out)

| SKU | Qty | Unit excl | Value |
| :--- | ---: | ---: | ---: |
| 9.1 | 1 | R450,00 | R517,50 |
| S.1 | 2 | R1 050,00 | R2 415,00 |

### CN 14741 (in)

- **Line items:** none in `transaction_items`
- **Header:** excl R-2 100,00 + tax R-315,00 = **R-2 415,00**

**Ruling:** Cannot state qty_out − qty_in at line level. Header −R2,415 matches **2×S.1** return only; **if** CN follows standard partial pattern, **1×9.1 remains** → **inferred QTY_SHORT R517.50**, not proven. **Not qty-equal with price delta.**

---

## C. Residual decomposition (17 items)

| Delivery | CN | Empty | Class | Line net | Registry | Match |
| :--- | :--- | :--- | :--- | ---: | ---: | :---: |
| DN#4438-EMPTY | 12081 | 41535 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12836-EMPTY | 12174 | 41895 | **FULL_CLEAR** | — | R517,50 | No |
| DN#13110-EMPTY | 12369 | 42613 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12076-EMPTY | 12468 | 43007 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12106-EMPTY | 12535 | 43246 | **QTY_SHORT** | R517,50 | R517,50 | Yes |
| DN#12149-EMPTY | 12639 | 43649 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12560-E,MPTY | 12710 | 43859 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12325-EMPTY | 12812 | 44201 | **FULL_CLEAR** | — | R517,50 | No |
| DN#12349-EMPTY | 12872 | 44404 | **QTY_SHORT** | R1 207,50 | R517,50 | No |
| DN#20072-- EMPTY | 13165 | 45489 | **FULL_CLEAR** | — | R517,50 | No |
| DN#21092-EPTY | 13602 | 46826 | **FULL_CLEAR** | — | R517,50 | No |
| DN#20859-EMPTY | 13931 | 47858 | **FULL_CLEAR** | — | R517,50 | No |
| DN20893 EMPTY | 14007 | 48096 | **QTY_SHORT** | R1 207,50 | R517,50 | No |
| DN-21985-EMPTY | 14666 | 49934 | **FULL_CLEAR** | — | R517,50 | No |
| DN-22161-EMPTY | 14741 | 50174 | **LINE_DATA_UNAVAILABLE** | — (CN lines missing; inv R2,932.50) | R517,50 | No |
| DN#22538=EMPTY | 15166 | — | **LINE_DATA_UNAVAILABLE** | — | R517,50 | No |
| 51527 EX-0034 | 15166 | 51527 | **LINE_DATA_UNAVAILABLE** | — | R517,50 | No |

- **12081** (FULL_CLEAR): Closed by companion 12082
  - Out: 1×9.1, 2×S.1
  - CN: -2×S.1
  - Companion: 12082 -1×9.1
- **12174** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12369** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12468** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12535** (QTY_SHORT): 1x9.1 not returned.
  - Out: 1×9.1, 2×S.1
  - CN: -2×S.1
- **12639** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12710** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12812** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **12872** (QTY_SHORT): 1xS.1/D.1 short — R1207.50 not R517.50.
  - Out: 3×S.1
  - CN: -2×S.1
- **13165** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **13602** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **13931** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×S.1
  - CN: -2×S.1
- **14007** (QTY_SHORT): 1xS.1/D.1 short — R1207.50 not R517.50.
  - Out: 3×S.1
  - CN: -2×S.1
- **14666** (FULL_CLEAR): Qty balanced — registry R517.50 unsupported.
  - Out: 2×D.1
  - CN: -2×D.1
- **14741** (LINE_DATA_UNAVAILABLE): CN 14741: no transaction_items lines (header excl R-2 100,00 + tax R-315,00).
  - Out: 1×9.1, 2×S.1
- **15166** (LINE_DATA_UNAVAILABLE): CN 15166: no transaction_items lines (header excl R0,00 + tax R0,00).
- **15166** (LINE_DATA_UNAVAILABLE): 51527/15166 not in DB. TXT: inv R3622.50, CN -R2415 — likely 1xS.1 short R1207.50.

**PRICE_VARIANCE test:** No R483/R586.50 on CYL lines. No same-DN opposite unit prices.

---

## D. Companion-CN precedent

| CN | SKU | Qty | Value |
| :--- | :--- | ---: | ---: |
| 12081 | S.1 | −2 | −R2,415 |
| 12082 | **9.1** | **−1** | **−R517.50** |

12082 is a **quantity return** of the missing 9kg shell. 14741 has **no** companion CN for 50174.

---

## E. Closing custody

| SKU | Net qty | Unit excl | Loaded/unit | Value |
| :--- | ---: | ---: | ---: | ---: |
| 9.1 | 1 | R450,00 | R517,50 | R517,50 |
| D.1 | 2 | R1 050,00 | R1 207,50 | R2 415,00 |
| S.1 | 2 | R1 050,00 | R1 207,50 | R2 415,00 |
| **Total** | | | | **R5 347,50** |

---

## Data gaps

| Doc | Gap |
| :--- | :--- |
| 14741 | No transaction_items lines |
| 15166 / 51527 | Not in DB — TXT only |

*Turn 7f read-only. No registry changes.*