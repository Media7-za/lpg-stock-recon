# TWK002 — Stale open-invoice finding (2026-08-11)

**Trigger:** User cross-checked `raw/Remittances/31.05.2025.pdf` against the `TWK002_Statement_of_Account.md` open-invoice list and flagged invoices **42468** and **42470** as already paid.

## Finding

Invoices 42468 (R7,713.58, DN#13029) and 42470 (R1,236.86, DN#13030), both dated 23 Apr 2025, were showing as **open** on the customer statement. They are not real debt — they were paid over a year ago.

| Check | Result |
| :--- | :--- |
| Remittance advice | `31.05.2025.pdf` lists both invoices with early-settlement discount (net R7,520.74 + R1,205.94) |
| Batch | STAT 114 / `BATCH-2025-05-31`, receipt `00039080`, paid 30/05/2025 |
| Batch match | **CASH_ONLY / FULL_MATCH** — remittance cash R15,365.65 = ERP payment total R15,365.65 exactly (`data/remittance_lines_2025.csv`, `TWK002_Phase2_2025_Linkage.md`) |
| Discount journal | Path B journal **00000509** (−R393.99) already posted 2026-08-09, matches batch discount total exactly |

## Root cause

The batch's ERP payment (`00039080`) was posted in the TXT as two lines:

```
"26","03","00039080","Payment","30/05/2025","","TRANSF | STAT 114","","TWK AGRI PTY LTD","-7306.68","46323.97"
"27","03","00039080","Payment","30/05/2025","00042050","TRANSF | STAT 114","","TWK AGRI PTY LTD","-8058.97","38265.00"
```

The second line is explicitly tagged to invoice `00042050` (which nets to zero against its own CN and closes correctly). The first line (**-7,306.68**) carries **no `invno`** — it is an account-level payment slice with no invoice tag, even though the remittance advice proves it (together with the tagged slice and paired credit notes) settles invoices 41747, 42050, 42468, and 42470 as a batch.

The generic `generate_statement_of_account.mjs` open-invoice model reconstructs "open" status purely from ERP's own doc-level `invno` tagging (Invoice − matched Crd Note/Payment/Journal). Since ERP never tagged a CN/payment to 42468 or 42470's `invno`, they never got netted off in that reconstruction, despite being paid in full (net of discount) at the account level. This is the same "ERP payment-to-invoice tagging is unreliable" issue documented elsewhere for this account (`business_rules.md`, `TWK002_Recreated_Ledger_2023/2024.md`) — this is simply a fresh instance of it surfacing in 2025 data.

Invoices 41747 and 42050 from the same batch were **not** affected — both happened to get explicit CN/payment tags elsewhere in the TXT that net them to zero, so they were already correctly excluded from the open list.

## Fix applied

1. Added `closedInvoiceOverrides` to `analysis/debtors/TWK002/config/statement_of_account.json` listing docs `42468` and `42470` with the evidence trail above.
2. Updated `analysis/debtors/shared/scripts/generate_statement_of_account.mjs` (`computeOpenInvoices`) to exclude any doc number listed in a debtor's `closedInvoiceOverrides`, so future re-runs won't resurrect these two.
3. Added the same field (empty by default) to `analysis/debtors/shared/templates/statement_of_account_config.template.json` for reuse on other debtors.
4. Regenerated `TWK002_Statement_of_Account.md` / `.pdf` (2026-08-11) — the two invoices are removed from the open-invoice table. **Balance due is unchanged (R117,831.54)** since the ERP header balance never included this as real debt; only the per-invoice breakdown changes. The R8,950.44 (gross) that dropped out of explicit invoice lines is now absorbed into the existing 120-day reconciliation adjustment, which already exists for exactly this class of untagged, account-level amounts.

## Residual risk — now addressed systematically

The open-invoice reconstruction is only as good as ERP's `invno` tagging, so any batch with an untagged payment slice could hide the same issue. Rather than leave that as a note to remember, it is now enforced in code and doctrine:

| Control | Where |
| :--- | :--- |
| Rule: open-invoice lists are hypotheses; Σ(open) ≤ ERP balance invariant; exports must include allocation detail | `shared/docs/business_rules.md` §15 |
| Invariant + tripwire | `shared/DEBTORS_DOCTRINE.md` §5 |
| Shared open-invoice model + risk analysis | `shared/scripts/debenq_open_invoices.mjs` |
| Gate CLI and portfolio sweep | `npm run debtors:tag-check[:all]` |
| Statement generator refuses to write when the gate blocks | `generate_statement_of_account.mjs` |
| Contract tests, with this case as a permanent regression fixture | `shared/scripts/debenq_open_invoices.test.mjs` |
| Intake rejects exports lacking allocation detail | `SKILL_Human_Sources_Agent.md` §6.1 |

Verified by regression: with the two overrides removed, the gate returns `BLOCKED`, names both invoices from the remittance evidence, independently reports the invariant breach of R865.77, and the statement generator aborts.

**TWK002 specifically:** no other instances in the current window. STAT 110/112 batches predate the TXT export window; STAT 123's 20 lines were all explicitly tagged. The account now gates `ALLOWED`. `H-013`/`H-014` (STAT 123 shortfall) remain open and should re-run `debtors:tag-check` once a fresh full-history TXT lands.

**Portfolio:** the same sweep found TWK002 is the *only* account with a customer-ready open-invoice list — eight exports carry no allocation detail at all and MD0003 over-states by R59,456.42. See `shared/reports/PORTFOLIO_Invoice_Tag_Coverage_2026-08-11.md`, tasks `H-016` / `H-017`.
