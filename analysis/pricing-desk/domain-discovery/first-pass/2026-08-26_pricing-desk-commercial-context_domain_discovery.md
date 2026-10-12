---
source/context: Pricing Desk raw context from current session
run date: 2026-08-26
prompt version: first-pass-domain-discovery-v1
review status: unreviewed
---

Yes. Treating the conversation as **raw domain-discovery evidence**, rather than projecting the existing Pricing Desk architecture onto it, produces a richer model.

A particularly important finding is that several things that initially look like “customer fields” or “price fields” are actually **time-varying events, observations, offers, decisions, or commercial states**.

# 1. Evidence-derived domain inventory

## A. Commercial party / account identity

| Canonical concept | Evidence examples | Inferred meaning | Type | Owner | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|---|---|
| `commercial_party_name` | “Works On Site”, “Duma Manzi Eco Lodge”, “LIN001”, “Amandla Supermarket”, “Fabers Gas” | Business/person participating in a commercial relationship | string | Commercial Party | Mostly non-temporal, but names can change | Entered/observed | Explicit |
| `party_role` | “New prospect”, “Wholesale Prospect”, “Customer”, “Wholesale customer” | Role the party currently plays commercially | enum-like | Commercial Party / relationship | **Temporal** | Entered/derived | Explicit |
| `erp_account_code` | `WOR001`, `LIN001`, `ASH003`, `PENDING` | External ERP identifier for a commercial party | string | Party ↔ ERP relationship | **Temporal** | Imported/entered | Explicit |
| `account_code_assignment` | FAM005 → WOR005 → WOR001 | Assignment/correction of ERP identity | event | Party ↔ ERP | **Temporal event** | Entered | Explicit |
| `market_segment` | “Hospitality / Eco Lodge”, “Food production”, “Wholesale” | Commercial segmentation | enum/string | Party or commercial relationship | Can change | Entered/derived | Explicit |
| `relationship_stage` | “New”, prospect, customer | Maturity of commercial relationship | state | Commercial relationship | **Temporal** | Derived/observed | Strongly inferred |
| `address/location` | Cinderella Park; Umzimkulu; Underberg | Physical/commercial location | structured location/string | Party/location | Can change | Entered | Explicit |
| `contact_person` | John | Human contact associated with party | string/relationship | Party | Temporal | Entered | Explicit |
| `telephone` | prospect telephone numbers appear elsewhere in evidence | Contact channel | string | Contact | Temporal | Entered | Explicit |

### Important identity evidence

The sequence:

> FAM005 → WOR005 → WOR001

is not merely correction of a string field. It demonstrates an **identity-resolution event/history**. The domain needs to distinguish:

- the business itself: **Works On Site**
- the ERP identifier assigned to it
- historical erroneous/previous identifiers
- the currently authoritative identifier.

That is stronger than a simple `customer.account_code` field.

---

# 2. Product and cylinder concepts

| Canonical concept | Evidence examples | Meaning | Type | Owner | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|---|---|
| `product` | LPG | Commodity being sold | reference/string | Product | Non-temporal | Entered | Explicit |
| `cylinder_nominal_size_kg` | 9kg, 14kg, 19kg, 48kg | LPG capacity associated with cylinder/product unit | number | Cylinder/Product Variant | Generally non-temporal | Reference | Explicit |
| `cylinder_valve_type` | SV, DV | 48kg cylinder configuration | enum | Cylinder Variant | Non-temporal | Entered | Explicit |
| `SV` | “SV = 48kg”, “48kg SV” | Single Valve 48kg cylinder | terminology/reference | Cylinder Variant | Non-temporal | Entered | Explicit |
| `DV` | “48dv”, “6 × DV” | Double Valve 48kg cylinder | terminology/reference | Cylinder Variant | Non-temporal | Entered | Explicit |
| `order_quantity` | 10 × SV; 30 × 9kg; 10 × 48 DV | Number of units requested/offered | integer | Order/Commercial Request | **Temporal/event-specific** | Entered | Explicit |
| `lpg_mass_kg` | 10 × 48kg = 480kg; Duma = 190kg | Total LPG mass represented by order | decimal | Order/Analysis | Event-specific | Calculated | Explicit/derived |

Repeated terminology suggests the canonical unit identity cannot safely be just `size = 48kg`; **48kg SV and 48kg DV are distinct commercially relevant variants**.

---

# 3. Cylinder ownership / exchange / deposit concepts

This is one of the strongest emergent domains in the evidence.

| Canonical concept | Evidence | Meaning | Type | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|---|
| `cylinder_supply_basis` | Exchange; new cylinders; deposit | How physical cylinders are supplied | enum | Per transaction | Entered | Explicit |
| `cylinder_exchangeability` | “exchangeable shells”, “foreign cylinders” | Whether customer's empties can participate in normal exchange | classification/state | Temporal | Observed | Explicit |
| `foreign_cylinder` | “foreigns” | Cylinder outside normal exchange pool | classification | Temporal/transactional | Observed | Explicit |
| `foreign_cylinder_credit_value` | “All Sizes of Foreign Cylinders = 345” | Value recognised when accepting foreign cylinder | money | **Temporal commercial value** | Entered/policy | Explicit |
| `standard_cylinder_deposit` | 9kg R517.50 incl; 14kg R632.50; 19kg R690; 48kg R1,207.50 | Deposit/sale value by cylinder variant | money | **Temporal** | Governed/entered | Explicit |
| `deposit_difference_due` | normal deposit less R345 foreign-cylinder value | Additional amount customer must pay | money | Transaction-specific | Calculated | Strongly inferred |
| `deposit_refundability` | “extra amount…is just a deposit and is refundable” | Deposit can be recovered on qualifying return | business rule | Temporal policy | Entered | Explicit |

### Derived rule visible in evidence

For a foreign cylinder accepted against a normal exchangeable cylinder:

**amount payable = applicable standard deposit − foreign-cylinder credit**

Example for 48kg:

R1,207.50 − R345 = **R862.50 incl VAT**

But the evidence also contains a nuanced operational condition: sometimes Gaz Express cannot immediately exchange a foreign 48kg cylinder and instead asks the customer to retain it and pay the full normal deposit temporarily.

That means **foreign-cylinder treatment is not just a price calculation; it has operational states and conditional rules.**

---

# 4. Commercial demand / order profile

A significant distinction emerges between **actual order**, **quoted order**, and **average/expected order**.

| Canonical concept | Evidence | Meaning | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|
| `requested_order` | LIN001 “HIS ORDER: 9kg—80…” | Specific current customer requirement | Event | Entered | Explicit |
| `quoted_order` | FAM005 30×9, 10×19, 10×48DV, 6×14 | Quantity used for a commercial quote | Event/versioned | Entered | Explicit |
| `accepted_order` | “ASH003 deal done. Collected” | Commercial request accepted/executed | Event | Observed | Explicit |
| `average_order_profile` | Duma: average 10 × 19kg | Expected/repeated demand profile | **Temporal estimate** | Entered/observed | Explicit |
| `estimated_payload_kg` | Duma 190kg | Mass expected from average/requested order | Event/profile-specific | Calculated | Explicit |
| `order_frequency` | “average monthly requirement” appears in Duma narrative | Expected recurrence | duration/frequency | Temporal | Assumed/entered | Strongly inferred |
| `quantity_firmness` | quantities may change daily | Degree to which quantity is committed | state | Temporal | Entered | Explicit |

This evidence argues strongly against one generic `order_quantity` field.

At least three different concepts exist:

**demand profile ≠ quoted transaction ≠ accepted order.**

---

# 5. Price observations and commercial price events

This is probably the most important temporal area.

The evidence contains many different kinds of “price”:

- historical invoice price
- supplier cost
- competitor price
- customer offer
- business offer
- recommendation
- approved price
- ERP price
- cylinder deposit
- unit price derived from per-kg price.

They should not collapse into a generic `price`.

## Price-event inventory

| Canonical concept | Evidence | Meaning | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|
| `historical_selling_price` | March R19.38/kg ex VAT; May R25.83/kg ex VAT | Price actually charged historically | **Temporal** | Imported/observed invoice | Explicit |
| `customer_offer_price` | LIN001 offering R28.37/kg; FAM005 offering R27/kg | Price proposed by customer | **Event** | Observed/entered | Explicit |
| `seller_offer_price` | “I offered the load at 27.50” | Price proposed by Gaz Express | **Event** | Entered | Explicit |
| `recommended_price` | Pricing Desk recommendations | System/agent recommendation before approval | **Versioned event** | Derived | Explicit |
| `approved_price` | Duma R32.15/kg incl VAT | Commercially approved price | **Decision/event** | Approved | Explicit |
| `collect_price` | ASH003 R30/kg | Selling price conditional on collection basis | Temporal commercial term | Entered | Explicit |
| `competitor_price_observation` | R26.10/kg quoted to Amandla Supermarket in Impendle | Observed external market price | **Temporal observation** | Observed | Explicit |
| `unit_price` | 19kg at R610.85 from R32.15/kg | Price for cylinder refill/unit | Transaction-specific | Calculated | Explicit |
| `price_tax_basis` | incl VAT / excl VAT | Tax interpretation of monetary value | qualifier | Per price | Entered | Explicit |
| `price_unit_basis` | `/kg`, per cylinder | Unit to which monetary value applies | qualifier | Per price | Entered | Explicit |
| `price_fulfilment_basis` | collect / delivered | Fulfilment conditions underlying price | qualifier | Per commercial term | Entered | Strongly inferred |

### Strong temporal conclusion

There should not conceptually be a single:

`customer.current_price`

as the primary historical model.

Evidence looks more like:

```text
Customer offer
→ Seller offer
→ Pricing recommendation
→ Commercial review
→ Approved price
→ Quote
→ Negotiation
→ New recommendation
→ New approved price
```

Each is a different commercial event with time, actor, status and basis.

---

# 6. Supplier economics

| Canonical concept | Evidence | Meaning | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|
| `supplier_posted_cost` | Oryx R21.16/kg ex VAT August | Published/base supplier cost | **Effective-period based** | External/imported | Explicit |
| `firm_rebate` | R1.00/kg | Rebate believed/contracted independently of stretch target | **Effective-period based** | External/commercial fact | Explicit |
| `conditional_rebate` | R0.50/kg | Additional conditional rebate | **Temporal/conditional** | External | Explicit |
| `volume_rebate` | R1.50 if 30 tons reached | Cost adjustment conditional on monthly volume | **Conditional event/value** | Entered | Explicit |
| `rebate_threshold` | 30 tons | Volume required for rebate | quantity | Effective-period based | Entered | Explicit |
| `expected_rebate_achievement` | “I am expecting this month” | Belief that threshold will be achieved | assumption | Temporal | Assumption | Explicit |
| `effective_supplier_cost` | posted cost minus applicable rebate | Commercial cost basis | calculated | Temporal | Derived | Explicit |
| `guaranteed_cost` | prior terminology | Cost after rebates considered sufficiently certain | derived/commercial interpretation | Temporal | Derived | Explicit |

An important epistemic distinction emerges:

> **rebate existence**, **rebate eligibility**, **expected achievement**, and **realised rebate** are not the same fact.

---

# 7. Delivery economics

| Canonical concept | Evidence | Meaning | Temporal? | Provenance | Confidence |
|---|---|---|---|---|---|
| `round_trip_distance_km` | 18, 60, 112, 152, 212, 216km | Distance used for delivery costing | Per route/opportunity | Entered/calculated | Explicit |
| `delivery_basis` | Delivered, Collect | Responsibility for fulfilment | Per opportunity/price | Entered | Explicit |
| `fuel_price` | R29.50 then R28.37 | Fuel input used in calculation | **Temporal** | Entered | Explicit |
| `fuel_consumption_l_per_km` | 0.194 L/km | Vehicle operating constant | Effective-period/configuration | Governed assumption | Explicit |
| `average_speed_kmh` | 90km/h | Travel-time assumption | Effective-period/configuration | Governed assumption | Explicit |
| `driver_count` | 1 | Crew assumption | Calculation-specific/default | Governed | Explicit |
| `assistant_count` | 1 | Crew assumption | Calculation-specific/default | Governed | Explicit |
| `default_vehicle` | 4-ton LPG delivery truck | Default vehicle used by Pricing Desk | Effective-period policy | Governed decision | Explicit |
| `economic_payload_kg` | ≈1,500kg | Practical payload used for economics | Configuration | Assumption/governed | Explicit |
| `payload_utilisation` | Duma ≈12.7–13% | Payload divided by economic payload | Calculation | Calculated | Explicit |
| `delivery_cost` | THW001 asks “delivery cost only” | Expected trip fulfilment cost | Calculation | Calculated | Explicit |
| `delivery_cost_per_kg` | discussed repeatedly | Delivery cost allocated to LPG mass | Calculation | Calculated | Explicit |
| `dedicated_delivery` | Duma small load over 112km | Trip effectively undertaken for one opportunity/customer | condition | Per opportunity | Assumed/entered | Explicit |

The fuel-price changes demonstrate again that calculator inputs require an **effective time/version**, rather than being timeless constants.

---

# 8. Profitability / commercial analysis

The evidence contains several layers of profitability.

| Canonical concept | Meaning | Type | Temporal? | Provenance |
|---|---|---|---|---|
| `revenue` | Selling price × LPG quantity | money | Analysis-specific | Calculated |
| `lpg_cost` | Applicable supplier cost × LPG quantity | money | Analysis-specific | Calculated |
| `gross_profit_before_delivery` | Revenue less LPG commodity cost | money | Analysis-specific | Calculated |
| `gross_margin` | Gross profit relative to revenue | percentage | Analysis-specific | Calculated |
| `delivery_cost` | Cost of fulfilling delivery | money | Analysis-specific | Calculated |
| `contribution_after_delivery` | Gross profit less allocated/dedicated delivery economics | money | Analysis-specific | Calculated |
| `profit_target` | “10% is just a nice to have target” | Desired rather than hard constraint | commercial objective | Temporal | Explicit |
| `break_even` | “Do we at least break even?” | Minimum economic viability condition | calculated/decision input | Per opportunity | Explicit |

### Important terminology ambiguity

The conversation uses “profit”, “margin”, “profit after delivery” and “break even”.

These should **not yet be assumed equivalent**.

Candidate canonical terminology could be:

- commodity gross profit
- gross margin %
- contribution after delivery
- contribution margin %
- fully loaded profit

But the evidence does not establish whether labour/vehicle overhead/tax/other operating expenses make “contribution after delivery” equivalent to accounting profit.

That ambiguity should remain open.

---

# 9. Market / competitor intelligence

The latest evidence adds a distinct concept.

```yaml
observed_customer: Amandla Supermarket
location: Impendle
customer_segment: Wholesale
observed_competitor_price: R26.10/kg
```

Classification:

- **observation/fact:** a reported competitor quote exists.
- **temporal:** absolutely; competitor pricing can change.
- **external:** price originates outside Gaz Express.
- **commercial intelligence:** relevant to other opportunities.
- **confidence/source status:** source provenance is currently weak in the raw evidence because competitor identity, quote date, document evidence and tax basis are not all established.

The phrase:

> “Lowest competitor price to wholesale customers”

is stronger than:

> “R26.10 was quoted to Amandla.”

The latter is direct evidence. “Lowest” is a comparative claim requiring a defined observation set.

Therefore I would model:

**Observed fact:** R26.10/kg competitor quote reported for Amandla.

**Derived/qualified observation:** lowest known competitor wholesale price, conditional on the available market observations.

---

# 10. Commercial posture

Several expressions describe strategy:

- Win New Customer
- Retention
- Volume Recovery
- Margin First
- Commodity Trade
- Volume Push

These appear to represent a **commercial decision/recommendation**, not an intrinsic customer property.

This matters for Duma.

The raw record says:

```yaml
classification:
  commercial_posture: Win New Customer
```

I would challenge that ownership during domain discovery.

`commercial_posture` appears more naturally associated with a **commercial opportunity/recommendation at a point in time**, because the same customer could later have:

```text
Opportunity 1 → Win New Customer
Opportunity 2 → Margin First
Opportunity 3 → Retention
```

Therefore:

**customer classification ≠ commercial posture.**

Confidence: strongly inferred.

---

# 11. Prospect / opportunity / customer lifecycle

The evidence suggests several states, but also reveals that they may belong to different objects.

Observed terms include:

```text
New Prospect
QUALIFIED
PRICED
QUOTED
NEGOTIATING
PROFORMA
WON
LOST
Customer
Collected
Awaiting Response
```

These should not immediately be forced into one state machine.

Potential distinctions:

### Relationship state

```text
Prospect
Customer
Former/Lost Customer
```

### Opportunity state

```text
New
Qualified
Priced
Quoted
Negotiating
Won
Lost
Expired
Withdrawn
```

### Quote state

```text
Draft
Sent
Accepted
Rejected
Superseded
Expired
```

### Fulfilment/order state

Evidence includes:

> “ASH003 deal done. Collected”

which may represent:

```text
Commercial acceptance
+
Order completion/collection
```

rather than one commercial-pipeline state.

---

# 12. Pricing recommendation / analysis evidence

The discussion establishes an emerging distinction between two business artifacts.

## Commercial Analysis

Contains working reasoning such as:

- average order
- payload
- delivery distance
- selected/default vehicle
- vehicle utilisation
- supplier economics
- market intelligence
- competitor price
- gross margin
- contribution after delivery
- alternative prices
- sensitivity scenarios
- assumptions
- confidence.

It can change when facts change.

Example:

```text
Analysis v1 → 112km delivered
Analysis v2 → corrected distance
Analysis v3 → customer collects
```

Classification:

**versioned work product / analysis event.**

## Pricing Decision

Contains what was recommended and ultimately authorised.

Example concepts:

```yaml
recommended_price:
approved_price:
recommended_posture:
approved_posture:
review_outcome:
```

Classification:

**commercial decision / immutable historical record.**

This distinction is strongly supported by the evidence.

---

# 13. Commercial review

Observed decision authority:

```text
Pricing Desk recommends
Commercial Owner reviews
```

Commercial Review outcomes:

- Approve
- Adjust
- Reject
- Supply additional context.

Therefore Commercial Review appears to be an **event**, not merely a status.

Potential fields:

| Concept | Meaning |
|---|---|
| `reviewed_recommendation` | Recommendation presented for review |
| `review_outcome` | approved / adjusted / rejected |
| `approved_price` | Final authorised price |
| `approved_posture` | Final authorised posture |
| `adjustment_reason` | Why reviewer deviated |
| `reviewed_by` | Actor |
| `reviewed_at` | Timestamp |

This also creates analytically useful derived information:

```text
approved_price − recommended_price
```

which could later measure Commercial Owner overrides.

---

# 14. Quote and proforma evidence

These are clearly separate concepts.

### Quote

Evidence:

- “Create quotes”
- “Quote FAM005”
- `quote.status: Sent`
- customer counteroffers.

Likely role:

**communicates an approved commercial offer.**

### Proforma

Evidence:

- Gaz Express mobile-first HTML proforma
- payment reference
- bank details
- “quotation purposes only and not a tax invoice”
- customer-facing information restrictions.

Likely role:

**formal customer-facing commercial/payment document**, sometimes downstream of a quote.

They are not equivalent to the pricing decision itself.

---

# 15. Commercial negotiation

Negotiation appears as a sequence of events rather than a mutable quote.

Examples:

```text
FAM005 offers R27.00
Gaz Express offers R27.50
Awaiting response
```

and:

```text
LIN001 offers R28.37
Gaz Express accepts
Cylinder issue changes fulfilment terms
```

Potential canonical events:

```text
CustomerPriceProposed
SellerPriceProposed
RecommendationProduced
OfferSent
CustomerCountered
OfferAccepted
OfferRejected
TermsChanged
```

This supports preserving negotiation history rather than overwriting a “current offer”.

---

# 16. Temporal information discovered

The evidence is heavily temporal.

At minimum, time matters for:

- supplier posted costs
- rebates
- rebate eligibility
- fuel prices
- competitor observations
- customer offers
- seller offers
- recommended prices
- approved prices
- historical invoice prices
- ERP price assignments
- customer/account identity mappings
- average order estimates
- opportunity state
- quote status
- relationship state
- commercial posture
- cylinder pricing schedules
- deposit policies.

Two temporal patterns appear.

### Effective-period facts

Example:

```text
August 2026 supplier cost
```

These have something like:

```text
effective_from
effective_to
```

### Occurrence events

Example:

```text
Customer offered R28.37/kg
```

These have something like:

```text
occurred_at
actor
event_type
value
```

Those should not be conflated.

---

# 17. Actors discovered

The evidence implies several business actors without requiring us to adopt existing agent architecture.

### Internal human actors

- Commercial Owner
- Driver
- Assistant
- ERP operator/maintainer

### External actors

- Prospect
- Customer
- Customer contact
- Supplier
- Competitor

### System/decision actors

- Pricing recommendation capability (“Pricing Desk”)
- Delivery calculator
- ERP
- Quote/proforma generation capability.

There is an important distinction between:

**who supplies evidence**,  
**who recommends**,  
**who approves**, and  
**who executes**.

---

# 18. Relationships emerging from evidence

The strongest relationships appear to be:

```text
Commercial Party
    has Commercial Relationship

Commercial Party
    may have ERP Account Identifier

Commercial Party
    may have Demand Profile(s)

Commercial Party
    participates in Opportunity

Opportunity
    contains Product Requirements

Opportunity
    has Delivery Basis

Opportunity
    may require Cylinder Treatment

Opportunity
    receives Commercial Analysis versions

Commercial Analysis
    consumes Cost Observations
    consumes Delivery Economics
    consumes Market Observations
    produces Pricing Recommendation

Pricing Recommendation
    undergoes Commercial Review

Commercial Review
    may result in Pricing Decision

Pricing Decision
    authorises Commercial Terms

Commercial Terms
    may be communicated through Quote

Quote
    may lead to Negotiation

Pricing Decision
    may support Proforma

Accepted Opportunity
    may create/link ERP Customer

Opportunity Outcome
    contributes Customer Intelligence
```

These are evidence-derived relationships, not implementation prescriptions.

---

# 19. Important calculated/derived values

The evidence contains many deterministic derivations:

**Order LPG mass**

```text
Σ(quantity × nominal kg)
```

**Cylinder unit refill price**

```text
per-kg selling price × cylinder kg
```

Example:

R32.15 × 19 = **R610.85**

**Order value**

```text
Σ(quantity × unit price)
```

Duma:

10 × R610.85 = **R6,108.50**

**Vehicle utilisation**

```text
payload / economic payload
```

Duma:

190 / 1,500 = **12.67%**

**Effective supplier cost**

Conceptually:

```text
posted cost − qualifying rebates
```

**Contribution after delivery**

Conceptually:

```text
sales revenue
− LPG acquisition cost
− attributable delivery cost
```

The precise definition of “profit after delivery” remains unresolved and should therefore not yet be promoted to an authoritative formula.

---

# 20. Business rules directly supported by evidence

Several rules emerge independently of implementation architecture:

1. **Prices must retain VAT basis.**  
   R29/kg incl VAT and R29/kg excl VAT are not interchangeable.

2. **Prices have commercial basis.**  
   Delivered and collect prices may differ.

3. **Cylinder value is independent of LPG commodity price.**

4. **Foreign cylinders have different commercial treatment from normal exchangeable cylinders.**

5. **Deposit amounts may be refundable under qualifying return conditions.**

6. **A customer counteroffer does not itself become an approved selling price.**

7. **A recommendation does not become executable merely because Pricing Desk produced it.**

8. **Commercial review may approve, adjust or reject a recommendation.**

9. **Material negotiation changes should preserve prior commercial history.**

10. **Supplier rebates must not automatically be treated as realised cost reductions merely because they are expected.**

11. **Delivery economics depend on both distance and load characteristics.**

12. **Low vehicle utilisation can materially change opportunity economics.**

13. **Competitor observations inform pricing but do not dictate price.**

14. **Customer-facing commercial documents must not expose internal cost/margin calculations.**

---

# 21. Evidence conflicts and unresolved ambiguities

These are especially valuable for domain discovery.

### WOR001 pricing

Evidence across the broader project contains multiple commercially adjacent values around Works On Site/FAM005, including R27.00, R27.50 and later pricing updates. They should **not be silently collapsed into one timeless WOR001 price**.

The account-code correction further complicates provenance.

### `Win New Customer`

It appears in Duma classification, but semantically behaves more like an opportunity-specific commercial posture than a customer classification.

### “Profit after delivery”

Not sufficiently defined to know whether it means:

- contribution after direct delivery costs,
- gross profit after logistics,
- operating profit,
- or fully loaded net profit.

### Competitor R26.10

Explicit observation:

> R26.10/kg quoted to Amandla Supermarket in Impendle.

Not yet established in the evidence:

- competitor identity
- quote date
- whether VAT is included
- delivered/collect basis
- order volume
- cylinder basis
- documentary verification.

Those missing qualifiers materially affect comparability.

### Average order

Duma's `10 × 19kg` is explicitly described as an average order. It should not automatically become an actual order or accepted commitment.

---

# Candidate entities

Only after examining the evidence, I would propose the following **candidate** domain concepts.

### Strong candidates

**Commercial Party**  
A business/person with whom commercial activity occurs.

**Commercial Relationship**  
Relationship between Gaz Express and that party over time.

**External Account Identity**  
ERP/customer identifiers and their assignment history.

**Product Variant**  
LPG sale unit/cylinder configuration such as 19kg or 48kg DV.

**Demand Profile**  
Expected/average customer requirement.

**Opportunity**  
A particular commercial selling opportunity with quantities, fulfilment basis and outcome.

**Commercial Offer / Proposal**  
Price/terms proposed by either party.

**Commercial Analysis**  
Versioned analysis of an opportunity.

**Pricing Recommendation**  
Recommendation generated from an analysis.

**Commercial Review**  
Human review event against a recommendation.

**Pricing Decision**  
Authorised commercial terms resulting from review.

**Quote**  
Customer-facing communication of authorised terms.

**Proforma**  
Formal customer-facing commercial/payment artifact.

**Supplier Cost Observation**  
Time-bound external commodity-cost evidence.

**Rebate Arrangement / Rebate Condition**  
Commercial supplier adjustment with qualification criteria.

**Market Price Observation**  
External competitor/market price evidence.

**Delivery Cost Analysis**  
Calculation of fulfilment economics.

**Cylinder Deposit / Exchange Treatment**  
Commercial handling of physical cylinder assets.

**Opportunity Outcome**  
Won/lost/expired/etc. commercial result.

### Candidate rather than confirmed

**Prospect** may ultimately be a role/state of Commercial Party rather than a separate entity.

Likewise, **Customer** may be another role/state rather than a fundamentally different entity.

That distinction should remain open until more lifecycle evidence is examined.

---

# Candidate bounded contexts

These are deliberately tentative.

### Commercial Relationship

Potential ownership:

- party identity
- prospect/customer relationship
- contacts
- market segment
- demand profiles
- relationship history.

### Commercial Opportunity

Potential ownership:

- specific commercial requirement
- requested quantities
- opportunity state
- negotiation
- outcome.

### Pricing & Commercial Decisioning

Potential ownership:

- analysis
- pricing recommendations
- commercial review
- approved commercial decisions
- decision history.

### Supply Economics

Potential ownership:

- supplier posted costs
- rebates
- thresholds
- effective cost observations.

### Delivery Economics

Potential ownership:

- routes/distances
- vehicles
- fuel assumptions
- payload
- utilisation
- delivery cost
- cost allocation.

### Cylinder Commercial Management

Potential ownership:

- cylinder variants
- exchangeability
- deposits
- foreign-cylinder credits
- conversion/difference rules.

### Market Intelligence

Potential ownership:

- competitor price observations
- geographic market observations
- source/provenance
- comparability/confidence.

### Commercial Documentation

Potential ownership:

- quotes
- proformas
- document status
- customer-facing commercial terms.

### ERP Integration

Potential ownership:

- external account identifiers
- customer creation handoff
- price-maintenance handoff
- execution references.

The boundary between **Commercial Relationship** and **Commercial Opportunity** is already fairly strong. The boundaries around **Pricing**, **Market Intelligence**, and **Supply Economics** need more evidence before being treated as settled.

---

## Most important discovery

The raw evidence suggests that Pricing Desk is fundamentally **event- and evidence-driven**.

The dangerous simplification would be:

```text
Customer
  current_price
  current_cost
  current_distance
  current_posture
  current_status
```

The evidence actually looks much more like:

```text
Commercial Party
    ↓
Commercial Relationship
    ↓
Opportunity
    ├── demand evidence
    ├── customer offer
    ├── market observations
    ├── supplier-cost observations
    ├── delivery analysis
    ├── Commercial Analysis v1
    ├── Commercial Analysis v2
    ├── Pricing Recommendation
    ├── Commercial Review
    ├── Pricing Decision
    ├── Quote
    ├── Negotiation events
    └── Outcome
```

That distinction is probably the most consequential result of the domain discovery: **prices, costs, classifications, assumptions and commercial positions frequently describe what was known or decided at a particular point in time, rather than timeless properties of a customer.**