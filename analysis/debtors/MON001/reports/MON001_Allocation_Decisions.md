# MON001 — Allocation Decision Queue

**Generated:** 2026-08-25 · regenerate via `scripts/allocation_ingest_stripped_pilot.mjs`

Tick exactly one disposition per card. `REALLOCATE` needs `docs:` and amounts. Rulings merge into `data/allocation_decisions.json` on re-run; unticked cards stay open.

| Open | Ruled | Total |
| ---: | ---: | ---: |
| 4 | 0 | 4 |

---

### D-MON001-33672-REM · Payment 33672 — R7,923.90 · STAT 106 · 25 Sept 2024

**Status:** OPEN


**Engine allocation:** R1,543.67 unallocated remainder · UNALLOCATED_REMAINDER

**Anomaly:** Payment 33672 (R7,923.90) leaves R1,543.67 unallocated after LIFO targets — no open gas invoice at or before 25 Sept 2024 absorbs the remainder.

**Ledger window** *(running balance is window-local)*

| Date | Doc | Entry | DN | Amount | Running |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 14 Aug 2024 | 9834 | Crd Note | EMPTY | R-1,794.00 | R-1,794.00 |
| 14 Aug 2024 | 35241 | Invoice | DN#9408 | R2,875.23 | R1,081.23 |
| 14 Aug 2024 | 35242 | Invoice | EMPTY | R1,794.00 | R2,875.23 |
| 15 Aug 2024 | 32849 | Payment | TRANSF | STAT 105 | R-2,875.23 | R0.00 |
| 25 Sept 2024 | **→** 33672 | Payment | TRANSF | STAT 106 | R-7,923.90 | R-7,923.90 |
| 27 Sept 2024 | 36720 | Invoice | DN#10064 | R2,602.86 | R-5,321.04 |
| 27 Sept 2024 | 36721 | Invoice | 36720-EMPTY | R1,196.00 | R-4,125.04 |
| 28 Sept 2024 | 10514 | Crd Note | 36720-EMPTY | R-1,196.00 | R-5,321.04 |
| 01 Oct 2024 | 39293 | Payment | TRANSF | STAT 109 | R-2,602.86 | R-7,923.90 |
| 07 Nov 2024 | 11103 | Crd Note | 38044-EMPTY | R-1,196.00 | R-9,119.90 |
| 07 Nov 2024 | 38044 | Invoice | DN#11186 | R2,651.33 | R-6,468.57 |
| 07 Nov 2024 | 38045 | Invoice | 38044-EMPTY | R1,196.00 | R-5,272.57 |

**Your ruling** (tick one)

- [ ] `CONFIRM`
- [ ] `REALLOCATE` → docs: ``  amounts: ``
- [ ] `UNAPPLIED_CASH`
- [ ] `DUPLICATE_REVERSE`
- [ ] `NEEDS_EVIDENCE` → artifact: ``
- [ ] `DEFER`

Reason: ``

---

### D-MON001-39293 · Payment 39293 — R2,602.86 · STAT 109 · 01 Oct 2024

**Status:** OPEN


**Engine allocation:** R2,602.86 → 36720 (27 Sept 2024, DN#10064, open R2,602.86) · LIFO_FULL

**Anomaly:** Payment 39293 (R2,602.86) allocated R2,602.86 to 36720 (27 Sept 2024, open R2,602.86) — full; account balance before payment R-5,321.04.

**Ledger window** *(running balance is window-local)*

| Date | Doc | Entry | DN | Amount | Running |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 25 Sept 2024 | 33672 | Payment | TRANSF | STAT 106 | R-7,923.90 | R-7,923.90 |
| 27 Sept 2024 | 36720 | Invoice | DN#10064 | R2,602.86 | R-5,321.04 |
| 27 Sept 2024 | 36721 | Invoice | 36720-EMPTY | R1,196.00 | R-4,125.04 |
| 28 Sept 2024 | 10514 | Crd Note | 36720-EMPTY | R-1,196.00 | R-5,321.04 |
| 01 Oct 2024 | **→** 39293 | Payment | TRANSF | STAT 109 | R-2,602.86 | R-7,923.90 |
| 07 Nov 2024 | 11103 | Crd Note | 38044-EMPTY | R-1,196.00 | R-9,119.90 |
| 07 Nov 2024 | 38044 | Invoice | DN#11186 | R2,651.33 | R-6,468.57 |
| 07 Nov 2024 | 38045 | Invoice | 38044-EMPTY | R1,196.00 | R-5,272.57 |
| 15 Nov 2024 | 11205 | Crd Note | DN#11186 | R-2,651.33 | R-7,923.90 |
| 15 Nov 2024 | 38283 | Invoice | 07/11/2024 38044 | R2,651.33 | R-5,272.57 |
| 18 Nov 2024 | 35241 | Payment | TRANSF | STAT 109 | R-2,651.33 | R-7,923.90 |
| 18 Dec 2024 | 35818 | Payment | TRANSF | STAT 109 | R-1,059.20 | R-8,983.10 |

**Your ruling** (tick one)

- [ ] `CONFIRM`
- [ ] `REALLOCATE` → docs: ``  amounts: ``
- [ ] `UNAPPLIED_CASH`
- [ ] `DUPLICATE_REVERSE`
- [ ] `NEEDS_EVIDENCE` → artifact: ``
- [ ] `DEFER`

Reason: ``

---

### D-MON001-35818 · Payment 35818 — R1,059.20 · STAT 109 · 18 Dec 2024

**Status:** OPEN
 · **Coupled:** ruling here reopens D-MON001-36258


**Engine allocation:** R1,059.20 → 39150 (18 Dec 2024, D/N 11966, open R3,038.90) · LIFO_PARTIAL

**Anomaly:** Payment 35818 (R1,059.20) allocated R1,059.20 to 39150 (18 Dec 2024, open R3,038.90) — partial, R1,979.70 remains open; account balance before payment R436.04.

**Ledger window** *(running balance is window-local)*

| Date | Doc | Entry | DN | Amount | Running |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 01 Oct 2024 | 39293 | Payment | TRANSF | STAT 109 | R-2,602.86 | R-2,602.86 |
| 07 Nov 2024 | 11103 | Crd Note | 38044-EMPTY | R-1,196.00 | R-3,798.86 |
| 07 Nov 2024 | 38044 | Invoice | DN#11186 | R2,651.33 | R-1,147.53 |
| 07 Nov 2024 | 38045 | Invoice | 38044-EMPTY | R1,196.00 | R48.47 |
| 15 Nov 2024 | 11205 | Crd Note | DN#11186 | R-2,651.33 | R-2,602.86 |
| 15 Nov 2024 | 38283 | Invoice | 07/11/2024 38044 | R2,651.33 | R48.47 |
| 18 Nov 2024 | 35241 | Payment | TRANSF | STAT 109 | R-2,651.33 | R-2,602.86 |
| 18 Dec 2024 | 11510 | Crd Note | D/N 11966 | R-2,932.50 | R-5,535.36 |
| 18 Dec 2024 | **→** 35818 | Payment | TRANSF | STAT 109 | R-1,059.20 | R-6,594.56 |
| 18 Dec 2024 | 39150 | Invoice | D/N 11966 | R5,971.40 | R-623.16 |
| 05 Jan 2025 | 35817 | Payment | CASH | R-0.01 | R-623.17 |
| 16 Jan 2025 | 36258 | Payment | TRANSF | STAT 110 | R-3,090.00 | R-3,713.17 |
| 17 Jan 2025 | 11714 | Crd Note | DN#9329-EMPTY | R-2,415.00 | R-6,128.17 |
| 17 Jan 2025 | 39953 | Invoice | D/N 9329 | R2,792.84 | R-3,335.33 |
| 17 Jan 2025 | 39972 | Invoice | DN#9329-EMPTY | R2,415.00 | R-920.33 |

**Your ruling** (tick one)

- [ ] `CONFIRM`
- [ ] `REALLOCATE` → docs: ``  amounts: ``
- [ ] `UNAPPLIED_CASH`
- [ ] `DUPLICATE_REVERSE`
- [ ] `NEEDS_EVIDENCE` → artifact: ``
- [ ] `DEFER`

Reason: ``

---

### D-MON001-36258-REM · Payment 36258 — R3,090.00 · STAT 110 · 16 Jan 2025

**Status:** OPEN


**Engine allocation:** R1,110.30 unallocated remainder · UNALLOCATED_REMAINDER

**Anomaly:** Payment 36258 (R3,090.00) leaves R1,110.30 unallocated after LIFO targets — no open gas invoice at or before 16 Jan 2025 absorbs the remainder.

**Ledger window** *(running balance is window-local)*

| Date | Doc | Entry | DN | Amount | Running |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 18 Dec 2024 | 11510 | Crd Note | D/N 11966 | R-2,932.50 | R-2,932.50 |
| 18 Dec 2024 | 35818 | Payment | TRANSF | STAT 109 | R-1,059.20 | R-3,991.70 |
| 18 Dec 2024 | 39150 | Invoice | D/N 11966 | R5,971.40 | R1,979.70 |
| 05 Jan 2025 | 35817 | Payment | CASH | R-0.01 | R1,979.69 |
| 16 Jan 2025 | **→** 36258 | Payment | TRANSF | STAT 110 | R-3,090.00 | R-1,110.31 |
| 17 Jan 2025 | 11714 | Crd Note | DN#9329-EMPTY | R-2,415.00 | R-3,525.31 |
| 17 Jan 2025 | 39953 | Invoice | D/N 9329 | R2,792.84 | R-732.47 |
| 17 Jan 2025 | 39972 | Invoice | DN#9329-EMPTY | R2,415.00 | R1,682.53 |
| 10 Feb 2025 | 36737 | Payment | TRANSF | STAT 111 | R-2,792.84 | R-1,110.31 |
| 11 Feb 2025 | 11874 | Crd Note | DN#11682-EMPTY | R-2,415.00 | R-3,525.31 |
| 11 Feb 2025 | 40628 | Invoice | DN#11682 | R2,816.83 | R-708.48 |
| 11 Feb 2025 | 40629 | Invoice | DN#11682-EMPTY | R2,415.00 | R1,706.52 |

**Your ruling** (tick one)

- [ ] `CONFIRM`
- [ ] `REALLOCATE` → docs: ``  amounts: ``
- [ ] `UNAPPLIED_CASH`
- [ ] `DUPLICATE_REVERSE`
- [ ] `NEEDS_EVIDENCE` → artifact: ``
- [ ] `DEFER`

Reason: ``

---

