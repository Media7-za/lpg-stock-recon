# Slice Registry (v1)

> **Canonical machine-readable registry:** `analysis/debtors/shared/SLICE_REGISTRY.json`  
> **Interactive visualization:** `analysis/debtors/shared/docs/SLICE_REGISTRY.html` (regenerate: `node analysis/debtors/shared/scripts/render_slice_registry_html.mjs`)  
> **Authority:** `DEBTORS_DOCTRINE.md` — evidence is canonical; slices are derived and regenerable.

Each **slice** is an independently regenerable artifact with declared `depends_on` and `invalidates` edges. Presentation slices (markdown/PDF) must not create financial truth — they render from derived JSON/CSV.

**Scopes:** `universal` · `lane-specific` · `account-specific`  
**Tiers:** `evidence` · `derived` · `presentation` · `governance`

---

## Statement slices (v4 / v5)

| ID | Tier | Scope | Depends on | Invalidates |
| :--- | :--- | :--- | :--- | :--- |
| `txt.parse` | derived | universal | ERP TXT | all statement Part 1/2 slices |
| `ingest.coverage` | derived | universal | TXT + DB | v5 Part 2, ingest gate section |
| `v4.part1.financial` | derived | lane: v4 | `txt.parse` | position summary, fixture |
| `v4.part1.financial.{YYYY-MM}` | derived | lane: v4 | `txt.parse` | full Part 1 |
| `v4.part2.custody` | derived | lane: v4 | `txt.parse`, DB, ingest | position summary, fixture |
| `v4.part2.custody.{YYYY-MM}` | derived | lane: v4 | `txt.parse`, DB | full Part 2 |
| `v4.position.summary` | derived | lane: v4 | Part 1 + Part 2 | composed statement, fixture |
| `statement.v4.composed` | presentation | lane: v4 | header + parts + summary | fixture |
| `fixture.v4` | derived | lane: v4 | position summary | — |
| `v5.part1a.lpg` | derived | lane: v5 | `txt.parse`, DB | bridge, summary, fixture |
| `v5.part1b.cyl` | derived | lane: v5 | `txt.parse`, DB | bridge, summary, fixture |
| `v5.bridge` | derived | lane: v5 | 1A + 1B + TXT | composed v5, fixture |
| `v5.part2.custody` | derived | lane: v5 | TXT + DB + ingest | summary, fixture |
| `v5.position.summary` | derived | lane: v5 | bridge + Part 2 | composed v5, fixture |
| `v5.ratification` | derived | account | ratification config | 1B, bridge, summary |
| `statement.v5.composed` | presentation | lane: v5 | all v5 sections | fixture |
| `fixture.v5` | derived | lane: v5 | position summary | — |

---

## Customer & gates

| ID | Tier | Scope | Depends on | Invalidates |
| :--- | :--- | :--- | :--- | :--- |
| `tag.coverage` | derived | lane: customer SOA | DEBENQ + remittance | customer SOA |
| `customer.soa.open_invoices` | derived | lane: customer SOA | DEBENQ + tag gate | customer SOA |
| `balance.bridge` | derived | account (TWK002) | open invoices + ratified lines | customer SOA |
| `customer.soa` | presentation | lane: customer SOA | tag + open inv + bridge | — |
| `erp.freshness` | governance | universal | ERP TXT | all balance-dependent slices |
| `d17.collections` | governance | universal | `project.json` | action prompts |

---

## Allocation & settlement cluster

| ID | Tier | Scope | Depends on | Invalidates |
| :--- | :--- | :--- | :--- | :--- |
| `allocation.edges` | derived | lane: allocation | payments, invoices, remittance | allocation report, customer SOA |
| `allocation.report` | presentation | lane: allocation | `allocation.edges` | — |
| `settlement.discount` | derived | lane: settlement | remittance + doctrine | allocation edges/report |
| `payment.pattern` | derived | lane: position_recon | payment TXT | — |
| `balance.bridge` | derived | account | open invoices + ratified config | customer SOA |
| `event.ledger` | derived | account (RED001) | delivery events | allocation edges |

**Efficiency rule:** regenerate only the slice whose evidence changed; downstream slices marked stale until explicitly refreshed.

---

## Portfolio & governance

| ID | Tier | Scope | Depends on | Invalidates |
| :--- | :--- | :--- | :--- | :--- |
| `portfolio.register` | governance | universal | — | dashboard, prompts, D17 |
| `portfolio.dashboard` | governance | universal | register | — |
| `portfolio.action_prompts` | governance | universal | register + D17 | — |
| `turn.brief` | governance | universal | ERP freshness | — |
| `turn.manifest` | governance | universal | turn brief | — |
| `onboarding.status` | presentation | universal | — | — |

---

## Creditor (AP mirror)

| ID | Tier | Scope | Depends on | Invalidates |
| :--- | :--- | :--- | :--- | :--- |
| `creditor.ingest.coverage` | derived | lane: creditor v5 | creditor TXT + DB | creditor v5 statement |
| `creditor.v5.statement` | presentation | lane: creditor v5 | ingest coverage | — |

---

## Regeneration patterns

```text
New remittance only     → allocation.edges → allocation.report
New DEBENQ only         → tag.coverage → open_invoices → customer.soa
New ERP TXT (Jul slice) → txt.parse → v4.part1.financial.2026-07 → compose
Ratified bridge line    → balance.bridge → customer.soa
Portfolio metadata      → portfolio.register → debtors:sync
```

## Slice folder convention (target)

```text
analysis/debtors/{CODE}/data/{layout}/runs/{timestamp}/
  run.json
  context.json
  sections/
  render/
```

Composed reports remain under `reports/`; sections under `data/` are the reproducible units.

---

*Ratified 2026-08-24. Amend `SLICE_REGISTRY.json` first; keep this page as the one-page operator view.*
