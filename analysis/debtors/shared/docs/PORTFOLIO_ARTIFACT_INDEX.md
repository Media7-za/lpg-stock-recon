# Portfolio Artifact Index

> **Enforcement:** `report-only` — operator decision **D4**  
> **Canonical machine-readable index:** `analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json`  
> **Keyed by:** `SLICE_REGISTRY.json` v1.0.0  
> **Plan:** `analysis/debtors/shared/docs/REGISTERS_PLAN.md`  
> **Generated — do not edit.** Regenerate: `npm run debtors:artifact-index:write`

23 accounts × 34 per-account slices, plus 3 portfolio-wide slices reported once. 2 slice(s) were committed before something they depend on.

**`absent` is not a defect.** A lane-specific slice is absent by design on an account not routed to that lane, and only 1 of 19 `project.json` files declares a lane, so the register reports what exists and refuses to infer what should.

**Dates are git commit dates.** Filesystem mtime is meaningless in a fresh clone — every file carries the checkout time — so staleness is only computed between two committed artifacts. 0 dependency pair(s) were skipped as not comparable rather than guessed at.

---

## Which accounts hold which slice

| Slice | Tier | Scope | Have it | Present on |
| :--- | :--- | :--- | ---: | :--- |
| `txt.parse` | derived | universal | 0/22 | — |
| `ingest.coverage` | derived | universal | 12/22 | `BR0001` `FIR001` `GAS004` `IVE001` `JAY000` `JEN001` `MON001` `MOZ002` `RED001` `SA0001` `TAN001` `TWK002` |
| `v4.header` | presentation | lane-specific | 0/22 | — |
| `v4.part1.financial` | derived | lane-specific | 0/22 | — |
| `v4.part1.financial.month` | derived | lane-specific | 0/22 | — |
| `v4.part2.custody` | derived | lane-specific | 0/22 | — |
| `v4.part2.custody.month` | derived | lane-specific | 0/22 | — |
| `v4.position.summary` | derived | lane-specific | 0/22 | — |
| `statement.v4.composed` | presentation | lane-specific | 4/22 | `FAM000` `JEN001` `JIM001` `TAN001` |
| `fixture.v4` | derived | lane-specific | 3/22 | `FAM000` `JEN001` `TAN001` |
| `v5.part1a.lpg` | derived | lane-specific | 0/22 | — |
| `v5.part1b.cyl` | derived | lane-specific | 0/22 | — |
| `v5.bridge` | derived | lane-specific | 0/22 | — |
| `v5.part2.custody` | derived | lane-specific | 0/22 | — |
| `v5.position.summary` | derived | lane-specific | 0/22 | — |
| `v5.ratification` | derived | account-specific | 0/22 | — |
| `statement.v5.composed` | presentation | lane-specific | 12/22 | `BR0001` `FIR001` `GAS004` `IVE001` `JAY000` `JEN001` `MON001` `MOZ002` `RED001` `SA0001` `TAN001` `TWK002` |
| `fixture.v5` | derived | lane-specific | 12/22 | `BR0001` `FIR001` `GAS004` `IVE001` `JAY000` `JEN001` `MON001` `MOZ002` `RED001` `SA0001` `TAN001` `TWK002` |
| `tag.coverage` | derived | lane-specific | 2/22 | `FIR001` `TWK002` |
| `customer.soa.open_invoices` | derived | lane-specific | 0/22 | — |
| `balance.bridge` | derived | account-specific | 1/22 | `TWK002` |
| `customer.soa` | presentation | lane-specific | 5/22 | `FIR001` `JAY000` `JEN001` `MD0003` `TWK002` |
| `allocation.edges` | derived | lane-specific | 9/22 | `BU0009` `JEN001` `JIM001` `MD0003` `MON001` `MOZ002` `RED001` `TWK002` `WO0001` |
| `allocation.report` | presentation | lane-specific | 7/22 | `JEN001` `MD0003` `MON001` `MOZ002` `RED001` `TWK002` `WO0001` |
| `settlement.discount` | derived | lane-specific | 2/22 | `MD0003` `TWK002` |
| `payment.pattern` | derived | lane-specific | 3/22 | `JIM001` `MD0003` `TWK002` |
| `event.ledger` | derived | account-specific | 1/22 | `RED001` |
| `erp.freshness` | governance | universal | 4/22 | `CAP000` `GAS004` `SA0001` `WO0001` |
| `portfolio.register` | governance | universal | 22/22 | `BR0001` `BU0002` `BU0005` `BU0009` `CAP000` `FAM000` `FAM001` `FIR001` `GAS004` `IVE001` `JAY000` `JEN001` `JIM001` `MD0003` `MON001` `MOZ002` `RED001` `SA0001` `TAN001` `TWK002` `WES004` `WO0001` |
| `turn.brief` | governance | universal | 3/22 | `CAP000` `GAS004` `SA0001` |
| `turn.manifest` | governance | universal | 4/22 | `CAP000` `GAS004` `SA0001` `WO0001` |
| `onboarding.status` | presentation | universal | 14/22 | `BR0001` `BU0002` `BU0005` `CAP000` `FIR001` `GAS004` `IVE001` `JEN001` `MD0003` `MON001` `MOZ002` `RED001` `SA0001` `TWK002` |
| `creditor.v5.statement` | presentation | lane-specific | 1/1 | `008ORY` |
| `creditor.ingest.coverage` | derived | lane-specific | 1/1 | `008ORY` |

---

## Portfolio-wide slices

One artifact for the whole portfolio, so presence says nothing about any single account.

| Slice | Status | Path | Last change |
| :--- | :--- | :--- | :--- |
| `d17.collections` | not-a-file | _portfolio.sync exit code 2_ | — |
| `portfolio.dashboard` | present | `DEBTORS_DASHBOARD.md` | 2026-08-29 |
| `portfolio.action_prompts` | present | `analysis/debtors/shared/ACTION_PROMPTS.md` | 2026-08-29 |

---

## Per-account coverage

| Account | Observed lanes | Present | Absent | Stale |
| :--- | :--- | ---: | ---: | ---: |
| `008ORY` | creditor position_recon v5 | 2 | 0 | — |
| `BR0001` | position_recon + statement v5 | 5 | 27 | — |
| `BU0002` | _none observed_ | 2 | 30 | — |
| `BU0005` | _none observed_ | 2 | 30 | — |
| `BU0009` | allocation | 2 | 30 | — |
| `CAP000` | _none observed_ | 5 | 27 | — |
| `FAM000` | position_recon + statement v4 | 3 | 29 | — |
| `FAM001` | _none observed_ | 1 | 31 | — |
| `FIR001` | customer statement · position_recon + statement v5 | 7 | 25 | — |
| `GAS004` | position_recon + statement v5 | 8 | 24 | — |
| `IVE001` | position_recon + statement v5 | 5 | 27 | — |
| `JAY000` | customer statement · position_recon + statement v5 | 5 | 27 | — |
| `JEN001` | allocation · customer statement · position_recon + statement v4 · position_recon + statement v5 | 10 | 22 | — |
| `JIM001` | allocation · position_recon · position_recon + statement v4 | 4 | 28 | — |
| `MD0003` | allocation · customer statement · position_recon · settlement_discount | 7 | 25 | — |
| `MON001` | allocation · position_recon + statement v5 | 7 | 25 | — |
| `MOZ002` | allocation · position_recon + statement v5 | 7 | 25 | — |
| `RED001` | allocation · position_recon + statement v5 | 8 | 24 | — |
| `SA0001` | position_recon + statement v5 | 8 | 24 | — |
| `TAN001` | position_recon + statement v4 · position_recon + statement v5 | 6 | 26 | — |
| `TWK002` | allocation · customer statement · position_recon · position_recon + statement v5 · settlement_discount | 12 | 20 | 2 |
| `WES004` | _none observed_ | 1 | 31 | — |
| `WO0001` | allocation | 5 | 27 | — |

---

## Stale slices

A slice regenerated before something it depends on. Report-only: the sync does not fail on these, because a stale derived artifact is a refresh job, not a correctness violation.

| Account | Slice | Committed | Older than | Dependency committed | Gap |
| :--- | :--- | :--- | :--- | :--- | ---: |
| `TWK002` | `statement.v5.composed` | 2026-08-10 | `ingest.coverage` | 2026-08-29 | 19d |
| `TWK002` | `allocation.report` | 2026-08-18 | `allocation.edges` | 2026-08-31 | 13d |

---

## Same-session regeneration — not stale

Dependency committed within an hour of its dependent: the chain was regenerated together and split across commits. Listed so the exclusion is visible rather than silent.

| Account | Slice | Older than | Gap |
| :--- | :--- | :--- | ---: |
| `FIR001` | `statement.v5.composed` | `ingest.coverage` | 0s |

