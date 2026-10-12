# `reconciliation_status.csv` taxonomy — source and definitions

Companion doc to `analysis/debtors/shared/scripts/build_reconciliation_status.mjs`
(PDP-46). Written because the ticket that specified this taxonomy flagged its
own source as unresolved: the `settlement_unit` / `evidence_tier` /
`evidence_status` fields were said to originate from a "Portfolio Review —
Statement Pipeline & Payment-Pattern Classification" document that could not
be found. This doc records what was actually checked, what was decided, and
where the taxonomy's definitions now live, so a future session doesn't
re-run the same search.

## UPDATE 2026-09-16 — the source document surfaced

The doc has been found: the user supplied a Google Docs link,
[`DOCTRINE (PROPOSED, NOT RATIFIED) — Layered Reconciliation Architecture`](https://docs.google.com/document/d/1i-DsX4ZdRKIO2Du00O6kRUjOrMpDOd-6yIPtTgGoRJs/edit),
now saved into this repo verbatim as
`DOCTRINE_Layered_Reconciliation_Architecture_PROPOSED.md` in this same
directory. Its title differs from the ticket's citation, but its content is
unmistakably the same material — D-NEW.5 gives the exact `settlement_unit` →
`evidence_tier` mapping this taxonomy needs, built from the same TWK002/
JEN001/JIM001/MOZ002/BU0002 evidence base. **It is still marked PROPOSED, NOT
RATIFIED** by its own status line — a future session should check whether
it's since been ratified or superseded before treating it as unconditionally
binding, but it is now a citable, in-repo artifact rather than a chat-only
claim.

Reconciling `build_reconciliation_status.mjs` against it on 2026-09-16 found
one real bug and one real gap, both fixed:

1. **Tier assignment bug.** The script originally assigned `evidence_tier: 4`
   uniformly to every STEP 3 candidate (exact-sum single, exact-sum
   contiguous-run, and proximity-only alike). D-NEW.5's table says an
   exact-sum match — `PER_CALENDAR_MONTH_EXACT_SUM` or
   `POOLED_MULTI_MONTH_WINDOW` — is tier 3, the same ceiling as the LIFO/FIFO
   profiles, because "the exact-sum test proves the month ties out." Only
   `PROXIMITY_ONLY` (a genuinely non-exact match) is tier 4. Fixed to match.
2. **Missing D-NEW.7 check.** The doctrine's "absence of a match is not
   evidence of non-payment" rule — established from a real JEN001 case where
   36 invoices predating `allocation_edges.csv`'s own earliest payment looked
   like a backlog but were simply outside the allocator's scope — was not
   implemented. Added: the script now computes `allocation_edges.csv`'s
   earliest `payment_date` as a coverage boundary, and any doc before it is
   classified `NOT_ATTEMPTED_BY_DESIGN` (in the row's `notes`, since that
   phrase is not part of the ticket's closed `settlement_unit` enum) rather
   than counted as a genuine gap. This reclassified 4 TWK002 docs and 1
   JIM001 doc on re-run.

D-NEW.6 (lane classification is a property of the line, never the document)
was already satisfied without changes — the script's STEP 1 aggregates
`lpgAmount` from `is_lpg=True` line rows only, never infers lane from a
doc-level heuristic.

## The missing source document (original 2026-09-15 search — kept for record)

Confirmed absent from this repository by two independent checks, before the
Google Doc above was supplied:

1. `analysis/debtors/JIM001/reports/JIM001_Exact_Sum_Bridge_Review_2026-09-13.md`
   (§0) already hit this exact gap on 2026-09-13, handling
   `PORTFOLIO_Statement_Pipeline_Payment_Pattern_Review_2026-09-13.md` as a
   required-reading citation that "does not exist anywhere in this
   repository's history or branches."
2. Re-run here on 2026-09-15: `git log --all` across every ref, plus a
   full-repo text search for "Portfolio Review", "Payment-Pattern
   Classification", and "Reconciliation_Status_Methodology" (the prose
   methodology doc PDP-46 also cites) — no hits beyond the JIM001 report's
   own mention of the missing filename. Neither document existed in-repo at
   that point — the file now saved as `DOCTRINE_Layered_Reconciliation_
   Architecture_PROPOSED.md` lived only in Google Docs until 2026-09-16.

**Decision (PDP-46, 2026-09-15, explicit user call):** proceed on the
taxonomy as given in the PDP-46 ticket text. Superseded the next day once the
real source was supplied — see the UPDATE section above.

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

Now sourced directly from D-NEW.5 of `DOCTRINE_Layered_Reconciliation_
Architecture_PROPOSED.md` (see UPDATE above), which gives an explicit
`settlement_unit` → tier mapping rather than just the two endpoints the
ticket text alone gave:

| Tier | `settlement_unit` | In-repo precedent |
| :--- | :--- | :--- |
| 1–2 | `PER_INVOICE_REF_LINKED` | TWK002's `REMITTANCE_EXPLICIT`/`REMITTANCE_CN_OFFSET` rows (this script always assigns the stronger 1, since these are `confidence=Confirmed` ERP-direct links) |
| 1 | `REMITTANCE_BATCH` | *(not yet used by any registered profile — reserved for an advice that names a batch rather than a specific invoice)* |
| 3 | `PER_CALENDAR_MONTH_EXACT_SUM` | This script's STEP 3 exact-sum single/contiguous-run candidates within one month — "the exact-sum test proves the month ties out," per D-NEW.5, not a weaker tier-4 guess |
| 3 (ASSERTED) | `PER_INVOICE_FIFO_BATCH` / `PER_INVOICE_LIFO_BATCH` | JEN001's `LIFO_FULL`/`LIFO_PARTIAL`; JIM001's `SPLIT_PAYMENT_PORTION` — matches `JIM001_Exact_Sum_Bridge_Review` §8's "ceilinged at Tier 3" finding |
| 3 (weak) | `POOLED_MULTI_MONTH_WINDOW` | This script's STEP 3 exact-sum contiguous-run candidates spanning more than one calendar month |
| 4 | `PROXIMITY_ONLY` | This script's STEP 3 non-exact proximity-band fallback — the weakest inferential basis per D-NEW.5 |
| 5 | `UNCHARACTERIZED` | `UNALLOCATED_REMAINDER` (JEN001), `UNALLOCATED_PORTION` (JIM001), STEP 6 orphaned cash with no candidate, and STEP-2 D-NEW.7 not-attempted-by-design docs |

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
