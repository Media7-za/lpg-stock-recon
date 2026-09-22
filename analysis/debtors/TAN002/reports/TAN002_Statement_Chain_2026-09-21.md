# TAN002 — Statement Chain Verification (§2 ERP Anchor)

**Date:** 2026-09-21
**Basis:** PROVEN (per `DEBTORS_DOCTRINE.md` §2/§4 — canonical evidence, arithmetically closed)
**Sources:** `raw/TAN002_2024.TXT`, `raw/TAN002_2025.TXT`, `raw/TAN002CURRENT.TXT` (operator-supplied DEBENQ account-enquiry exports)

---

## 1. What this verifies

Three DEBENQ statement exports were supplied, covering three non-overlapping
periods. Each is independently self-consistent (every row's `BALANCE` =
prior `BALANCE` + that row's `AMOUNT`, recomputed programmatically, zero
mismatches), and the `BALANCE B/F` of each file ties exactly to the closing
`TOTAL TRANSACTIONS` of the file before it:

| File | Period | Rows | B/F | Close |
| :--- | :--- | ---: | ---: | ---: |
| `TAN002_2024.TXT` | 19/09/2023 – 29/02/2024 | 94 | R0.00 | **R2,641.92** |
| `TAN002_2025.TXT` | 06/03/2024 – 27/02/2025 | 207 | **R2,641.92** ✓ | **R16,828.85** |
| `TAN002CURRENT.TXT` | 22/02/2025 – 20/08/2026 | 327 | **R16,828.85** ✓ | **R2,052.39** |

`TAN002CURRENT.TXT`'s own `"CURRENT BALANCE:"` header (R2,052.39) also ties
exactly to its last transaction row's balance — the header is not a separate
claim, it is this chain's terminus.

**Note on the period overlap (22/02/2025 vs 27/02/2025):** `TAN002CURRENT.TXT`'s
first dated row (payment `00036865`, 22/02/2025) predates
`TAN002_2025.TXT`'s own last row (27/02/2025) — the two "period" windows
overlap by 5 days on the calendar, even though the B/F/close handoff
between them ties exactly (R16,828.85 either way). Per operator-supplied
context (2026-09-22, ASSERTED — not independently verifiable from the TXT
or DB), payment `00036865` related to the account's carry balance as at
17/02/2025; the 22/02/2025 date is most likely when the SpeedPoint
terminal batch was posted into the ERP, not the underlying settlement
date. Confirmed via Supabase MCP that `transaction_headers` for this doc
is fully and cleanly `INVNO`-tagged across all 9 lines — this overlap does
not affect the chain's arithmetic in any way, it only explains why the two
files' calendar windows don't cut cleanly at a single date.

**Conclusion:** R2,052.39 is a **PROVEN** §2 ERP anchor as at the last
transaction date, **20 August 2026** (invoice DN#22891-EMPTY, DOCNO
00052694). No arithmetic gap, no unexplained jump, continuous coverage from
account inception (B/F R0.00) to date.

---

## 2. What this does NOT verify

Per the evidence hierarchy (`DEBTORS_DOCTRINE.md` §4), a statement-level
balance identity is the **financial anchor only** — it does not establish:

- **Custody** (cylinder/SKU quantities out vs returned) — requires
  `transaction_items` / DB-backed conservation checks. Not run: no
  `DATABASE_URL` this session.
- **SKU analysis / allocation** — which specific invoices remain open vs
  closed by which payment/credit-note lines (a v5 FIFO or similar build).
  Not run: `reconcile_debtor_v5_from_txt.mjs` requires DB access.
- **Ingest coverage** — whether DB-side records match every TXT document
  (`validate_txt_db_coverage.mjs`). Not run for the same reason.

`project.json.ingestGate` is intentionally left absent rather than
fabricated — per D19, absence must be read as `ingestBlockedScopes:
["custody","sku_analysis","allocation"]`, never as clearance.

---

## 3. Superseded figure

`shared/data/portfolio_candidates.csv` listed TAN002 at balance R3,523.86 /
aged_120_plus R739.87. That R3,523.86 figure is **not wrong data** — it
matches the running balance after DOCNO 00051543 on 02/07/2026 (line 323 of
`TAN002CURRENT.TXT`) — but it was a **stale mid-period snapshot**: R2,783.99
was subsequently received against invoice 00051542 on 15/07/2026, and
further trading through 20/08/2026 brought the account to R2,052.39. The
candidates-list figures are superseded by this PROVEN anchor and should not
be used going forward.

---

## 4. Next steps

1. Get `DATABASE_URL` access and run:
   ```bash
   npm run debtors:ingest-check -- --debtor TAN002
   node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor TAN002
   ```
2. Build `config/statement_v5.json` (B/F R16,828.85 as at 22/02/2025 is the
   latest available period-start anchor; `cylOpeningQty` / `skuRates` still
   need establishing — see `TAN001/config/statement_v5.json` for shape).
3. Once custody/SKU/ingest are verified, reassess `reconState` toward
   `complete` per `DEBTOR_STATE_MACHINE.md`.

---

## 5. Tripwires

| Closed statement | Reopens if |
| :--- | :--- |
| R2,052.39 PROVEN anchor as at 20/08/2026 | A fresher DEBENQ export changes the CURRENT BALANCE header |
| `agedDebt180Plus: 0.00` (ASSERTED) | Any FIFO/open-invoice aging run finds unpaid lines older than 180 days from the anchor date |
| Custody/SKU/allocation unverified | `DATABASE_URL` becomes available and the v5/ingest scripts are run |
