# Phase 3A App Integration — Slice Scope

STATUS: **Scoping only. No code written.** This defines the boundary of the
integration before implementation starts, per instruction: small enough that
pricing rules and logistics can't get touched by accident.

Goal: Quote Workspace stops reading customer commercial context from the
Phase 1 mock fixtures and loads it from `get_customer_commercial_context()`
(Phase 3A, applied and verified — see `Phase-3A-Schema-Diff.md`).

---

## 1. What "customer commercial context" means here, precisely

In the current code (`src/features/pricing-desk/components/QuoteWorkspace.tsx`),
a fixture bundle (`getFixtureBundle(customerCode)`) does **four** different jobs
at once:

```
QuoteWorkspace.tsx:76   context = fixture.context              -- customer commercial context (display)
QuoteWorkspace.tsx:158  contact = fixture.customer.primaryContact -- proforma contact field
usePricingDeskData.ts   fixture.recommendation                 -- illustrative floor/target/stretch (PRICING)
QuoteWorkspace.tsx (useState / selectFixtureCustomer)
                        fixture.intake                          -- order lines, delivery, lane, status (prefill)
```

Only the first of these — `context`, fed into `CustomerSummaryCard` — is what
Phase 3A's API actually replaces. The other three are explicitly **not**
touched by this slice. This is the core scoping move: the fixture bundle
stays exactly as it is structurally; only the `context` field stops being
read from it.

---

## 2. In Scope

1. **New repository function** — `src/features/pricing-desk/lib/customerContextRepository.ts` (naming/pattern matches the existing `cdrRepository.ts`): wraps `supabase.rpc('get_customer_commercial_context', { p_identifier })`, returns a typed result or `null`/`unknown` for `{"error":"unknown_customer"}`.
2. **Type update** — expand `CustomerCommercialContext` in `types/pricingDesk.ts` (or introduce a new type alongside it) to hold the real API shape: `purchase_history`, `pricing`, `average_order`, `commercial_profile` (including `buying_cycle`), `risk`, `classification`, `data_freshness`. The current type (`lastPurchaseDate`, `lastPricePerKgInclVat`, `averageOrderKg`, `averageNetContributionPerOrder`, `churnRisk`, `purchaseRhythm`, `previousDecisionSummaries`) is a Phase 1 placeholder shape that doesn't match what the API actually returns — this needs reconciling either way.
3. **`CustomerSummaryCard.tsx` display update** — show the real fields now available (buying cycle, average net contribution — still `null` until 004B/004C exist, and the card should show that honestly, not hide it or fake a number). Pure display component, no pricing logic.
4. **`QuoteWorkspace.tsx` — replace `context` sourcing only** — line 76's `fixture ? fixture.context : EMPTY_CONTEXT` becomes an async call to the new repository function, keyed on `intake.customerCode`. Needs a loading state (the API call is a network round trip; fixture lookups were synchronous) and graceful handling of `unknown_customer` (falls back to an empty/unknown context, same as today's `EMPTY_CONTEXT` behavior for a code with no fixture).
5. **Fix the Siyaya code mismatch** — the fixture customer list currently uses `SIYAYA001`, a made-up Phase 1 code that doesn't exist in the real data (the real account is `SIY000` — confirmed in `Phase-3A-Schema-Diff.md`). One-line change to `pricingDeskFixtures.ts`'s customer code so selecting "Siyaya" from the dropdown actually resolves against the real API instead of always returning `unknown_customer`. Included because leaving a known-broken code in place would make this integration untestable for one of the two demo customers, but it is a one-line, isolated fix — not a rework of the fixture file.

Nothing else in `pricingDeskFixtures.ts`, `usePricingDeskData.ts`, `RecommendationCard.tsx`, `DeliveryEconomicsCard.tsx`, `SupplierCostCard.tsx`, or `MarketContextCard.tsx` changes.

---

## 3. Explicitly Out of Scope

- **Pricing recommendation logic** (`computeIllustrativeRecommendation`, `RecommendationCard.tsx`, the `fixture.recommendation` lookup) — untouched. Still illustrative/Phase 1, still keyed off `intake.customerCode` against the fixture bundle. Phase 3A's API has no floor/target/stretch output; that's `pricing_strategy.md`'s job, unrelated to this slice.
- **Delivery economics** (`computeDeliveryEconomics`, `DeliveryEconomicsCard.tsx`) — untouched. Still computed live from `intake`, not from any API. Phase 3B (`logistics_context`) remains blocked; nothing here changes that.
- **Supplier cost / market context** (`SupplierCostCard.tsx`, `MarketContextCard.tsx`, `SUPPLIER_COST_SNAPSHOT`, `MARKET_OBSERVATIONS`) — untouched.
- **Intake prefill for order lines, delivery/collection, distance** — stays fixture-sourced exactly as today when a known customer is selected from the dropdown. The API doesn't provide per-quote order/delivery data (that's not historical fact, it's today's request), so there's nothing to replace it with. `customer_lane` / `commercial_status` prefill also stays fixture-sourced in `intake` for now, even though the real API also returns these — see Open Question 2 below for why this duplication is deliberately left alone rather than unified in this slice.
- **CDR persistence mechanism** (`cdrRepository.ts`, `PricingDeskProvider.tsx`) — untouched. `customerContextSnapshot` will contain real API data instead of fixture data once this slice lands, which is a desirable side effect, but the snapshot/write plumbing itself doesn't change.
- **Proforma generation** — untouched.
- **Auth / RLS** — untouched, already complete (Phase 2 Option A).
- **`get_customer_commercial_context()` SQL function itself** — untouched. Phase 3A is applied and verified; this slice only consumes it.
- **Home page win-back opportunities card** (`PricingDeskHome.tsx`, `listFixtureCustomers().filter(win_back)`) — deferred. It's a *list* query (customers by status), not a *single-customer context* lookup — different shape of work from what this slice covers. Flagged as a natural, small follow-up, not bundled in here to keep this slice to one thing.
- **Customer picker dropdown source** — stays `listFixtureCustomers()` (2 entries) for this slice. Not switched to a real `commercial_customers` list query. See Open Question 1.

---

## 4. Data Flow (proposed, not yet implemented)

```
User selects/types a customer code in Quote Workspace
    ↓
intake.customerCode changes
    ↓
QuoteWorkspace calls customerContextRepository.getCustomerCommercialContext(code)
    ↓
Loading state shown in CustomerSummaryCard's place
    ↓
Supabase RPC: get_customer_commercial_context(p_identifier := code)
    ↓
    ├── real customer found → typed context → CustomerSummaryCard renders it
    └── {"error":"unknown_customer"} → treated as "unknown", same as today's EMPTY_CONTEXT
```

Nothing downstream of `CustomerSummaryCard` (recommendation, delivery, CDR approval, proforma) is in this data flow change.

---

## 5. Open Questions

1. **Customer picker dropdown**: leave it as the 2-entry fixture list (current proposal), or switch it to a live query against `commercial_customers` (now has 4 real customers: TAN002, LIN001, SIY000, Impendle)? Leaving it as-is keeps this slice smaller, but means the dropdown and the real context data are sourced from two different places — a real inconsistency, just a small one. Recommend deferring to a fast follow-up slice rather than including here, but flagging since it directly affects how "done" this feels.
2. **`customer_lane` / `commercial_status` duplication**: once this slice lands, `intake.customerLane`/`intake.commercialStatus` (fixture-sourced) and the new real `context.customer.lane`/`context.customer.commercial_status` (API-sourced) could disagree for the same customer if the two are ever out of sync. For the 4 seeded customers they currently match (I set the fixture and the seed data consistently), but nothing enforces that going forward. Worth a decision: unify now (extra scope) or accept the drift risk short-term and unify in the dropdown follow-up (Open Question 1)?
3. **Loading UX**: should the rest of the form (order lines, delivery, recommendation) be usable while customer context is still loading, or should the workspace block until it resolves? Recommend non-blocking (context loads independently, everything else works immediately) to match the existing synchronous-fixture feel as closely as possible, but flagging as a real UX call.

None of these block starting the slice — they're refinements within it or immediately after it, not scope expansions into pricing/logistics.

---

## 6. Why this is safe

Every file this slice touches (`customerContextRepository.ts` [new], `types/pricingDesk.ts` [type addition], `CustomerSummaryCard.tsx` [display], `QuoteWorkspace.tsx` [one variable's data source], `pricingDeskFixtures.ts` [one code fix]) is either new or already fully understood from Phase 1/Phase 2 work this session. None of them are shared with pricing calculation, delivery calculation, CDR persistence, or auth — those subsystems have no code path that reads `context`, so there's no way this slice can change their behavior.
