# `reconciliation_status.csv` taxonomy — source and definitions

Companion doc to `analysis/debtors/shared/scripts/build_reconciliation_status.mjs`
(PDP-46). Written because the ticket that specified this taxonomy flagged its
own source as unresolved: the `settlement_unit` / `evidence_tier` /
`evidence_status` fields were said to originate from a "Portfolio Review —
Statement Pipeline & Payment-Pattern Classification" document that could not
be found. This doc records what was actually checked, what was decided, and
where the taxonomy's definitions now live, so a future session doesn't
re-run the same search.

## The missing source document

Confirmed absent from this repository by two independent checks:

1. `analysis/debtors/JIM001/reports/JIM001_Exact_Sum_Bridge_Review_2026-09-13.md`
   (§0) already hit this exact gap on 2026-09-13, handling
   `PORTFOLIO_Statement_Pipeline_Payment_Pattern_Review_2026-09-13.md` as a
   required-reading citation that "does not exist anywhere in this
   repository's history or branches."
2. Re-run here on 2026-09-15: `git log --all` across every ref, plus a
   full-repo text search for "Portfolio Review", "Payment-Pattern
   Classification", and "Reconciliation_Status_Methodology" (the prose
   methodology doc PDP-46 also cites) — no hits beyond the JIM001 report's
   own mention of the missing filename. Neither document exists in this repo.

**Decision (PDP-46, 2026-09-15, explicit user call):** proceed on the
taxonomy as given in the PDP-46 ticket text, documented here as chat-sourced
rather than pulled from a citable artifact. If the real Portfolio Review doc
resurfaces, diff it against this file and the `PROFILES` registry in
`build_reconciliation_status.mjs` before trusting either blindly.

## The three fields

Per the ticket, `evidence_status` supersedes the deprecated flat
`matched_via` field and **must be stored, never re-derived** — exact-sum
conservation alone does not prove `PROVEN` (the JEN001/JIM001 investigations
are the precedent for this: JIM001_Exact_Sum_Bridge_Review explicitly labels
every one of its findings `ASSERTED`, including human-ratified ones, because
JIM001 has no remittance advice on file at all).

### `settlement_unit`

The ticket's enum (used verbatim in the script's `PROFILES.classify()`
mappings):

`PER_INVOICE_REF_LINKED` · `PER_INVOICE_FIFO_BATCH` · `PER_INVOICE_LIFO_BATCH`
· `PER_CALENDAR_MONTH_EXACT_SUM` · `POOLED_MULTI_MONTH_WINDOW` ·
`REMITTANCE_BATCH` · `PROXIMITY_ONLY` · `UNCHARACTERIZED`

### `evidence_tier` (1 → 5)

The ticket gives only the two endpoints ("1 (remittance advice) → 5
(unallocated)"); the middle of the ladder is this script's own
operationalization, built to agree with the only two numbered precedents
that exist in-repo:

| Tier | Meaning | In-repo precedent |
| :--- | :--- | :--- |
| 1 | Remittance advice — a customer-supplied document names the target invoice | TWK002's `REMITTANCE_EXPLICIT`/`REMITTANCE_CN_OFFSET` rows |
| 2 | Bank/ERP-confirmed narrative without a remittance document | *(not yet used by any registered profile — reserved)* |
| 3 | ERP-ledger or pattern-based allocation with a specific target claimed, no remittance | JEN001's `LIFO_FULL`/`LIFO_PARTIAL`; JIM001's `SPLIT_PAYMENT_PORTION` — both match `JIM001_Exact_Sum_Bridge_Review` §8's explicit "ceilinged at Tier 3" finding |
| 4 | This script's own generated candidate pairing (exact-sum, contiguous-run, or proximity) — unconfirmed by ERP or a human | `build_reconciliation_status.mjs` STEP 3 output |
| 5 | Unallocated / no target at all | `UNALLOCATED_REMAINDER` (JEN001), `UNALLOCATED_PORTION` (JIM001), and STEP 6 orphaned cash with no candidate |

### `evidence_status`

`PROVEN` / `ASSERTED` / `UNASSESSED`. This script only ever emits `PROVEN`
for tier-1 rows with `confidence=Confirmed` (an actual remittance link).
Every pattern- or ERP-ledger-based allocation — LIFO, FIFO-batch, and this
script's own STEP 3 candidates — tops out at `ASSERTED`, even when
human-ratified, matching `JIM001_Exact_Sum_Bridge_Review`'s closing line: "No
figure in this review should be reported as `PROVEN`." `UNASSESSED` is
reserved for rows where no claim was ever made (orphaned cash, a
basket-check that couldn't run for lack of line-item data, a proximity-only
match).

## The settlement-mechanism registry (`PROFILES`)

The ticket's core design risk — every account checked so far uses a
different settlement mechanism, and a naive `SUM(allocated_amount)` once
silently miscounted a fully-unallocated JIM001 payment (doc 39812,
R20,557.69) as matched — is handled in `build_reconciliation_status.mjs` by
a `PROFILES` registry keyed on `allocation_edges.csv`'s column set *and*
its full `allocation_type` vocabulary. Three profiles are registered so far:

| Profile id | Precedent | Settlement types | Orphan/unallocated types |
| :--- | :--- | :--- | :--- |
| `ONE_SHOT_REMITTANCE` | TWK002 | `REMITTANCE_EXPLICIT`, `REMITTANCE_CN_OFFSET` | *(none observed)* |
| `LIFO_MULTI_SLICE` | JEN001 | `LIFO_FULL`, `LIFO_PARTIAL` | `UNALLOCATED_REMAINDER` |
| `FIFO_BATCH` | JIM001 | `SPLIT_PAYMENT_PORTION` | `UNALLOCATED_PORTION` |

An account whose `allocation_edges.csv` doesn't match one of these
registered profiles exactly — column set **and** every distinct
`allocation_type` value — makes the script throw and refuse to produce
`reconciliation_status.csv`, rather than guessing. This was verified against
**WO0001**, which turns out to use a fourth, still-different vocabulary
(`OPEN_BALANCE_MATCH`, `UNALLOCATED`, `COMBINATION_MATCH`,
`OPEN_BALANCE_PARTIAL`, `ROUNDING_RESIDUAL`, `PROXIMITY_INFERENCE`) — the
script correctly stops rather than misapplying the closest-matching
registered profile. Registering WO0001 (and any other account) requires
adding a new `PROFILES` entry with an explicit vocabulary and a
`classify()` mapping — never relaxing the detector to pass unknown types
through.

**Important asymmetry discovered while building this:** `allocated_amount`
does **not** mean the same thing across profiles for orphan/unallocated
rows. JEN001's `UNALLOCATED_REMAINDER` rows carry `allocated_amount≈0` (the
real leftover lives in `variance`); JIM001's `UNALLOCATED_PORTION` rows
carry `allocated_amount == payment_amount` (the real leftover lives in
`residual_after_allocation`). The one invariant that holds across both is
that an orphan/unallocated-type row must never carry a non-blank
`target_doc` — that is what the script actually validates (see
`validateOrphanInvariant` in the script), not any assumption about what
`allocated_amount` itself should equal.

## Known scope boundary — account-specific doctrine is not modeled

This script implements the *general* 8-step procedure and the settlement-
mechanism auto-detection PDP-46 asks for. It does **not** encode
account-specific business doctrine layered on top of that — e.g. TWK002's
settlement-discount doctrine (`TWK002_Settlement_Discount_Doctrine_v2.md`)
or DN-pair credit-note netting. A small residual "genuine gap" close to a
plausible discount amount should be checked against that account's own
doctrine docs before being treated as uncollected debt; the script's output
is a first-pass, auditable starting point, not a replacement for the
per-account narrative reports.
