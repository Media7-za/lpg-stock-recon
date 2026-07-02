# Commercial Decision Record Doctrine

Status: Architecture Gate AG-001 — Awaiting Review  
Domain: Pricing Desk  
Applies to: Phase 2 Commercial Decision Record persistence

## 1. Purpose

A Commercial Decision Record (CDR) preserves the reasoning behind a commercial decision.

ERP records financial truth: invoices, orders, payments, and balances.

The CDR records commercial intent:

- what was recommended
- why it was recommended
- what information was available at the time
- who approved it
- what was quoted
- what eventually happened

The first implementation is a Pricing Decision Record, but the broader domain is Commercial Decision Records because future decisions may include minimum order rules, COD requirements, delivery restrictions, credit exposure decisions, promotional offers, or declined business.

## 2. Domain Ownership

| Domain | System / Owner |
|---|---|
| Customer master | ERP |
| Orders and invoices | ERP |
| Supplier cost | Supplier Cost skill / source data |
| Customer commercial context | Customer Intelligence |
| Delivery economics | Delivery Economics |
| Market observations | Market Intelligence |
| Commercial reasoning | Commercial Decision Record |
| Proforma document | Proforma Generator |
| Communications | Sales OS / Communication Agent |
| Opportunities | Sales OS / CRM |

A CDR does not own ERP orders, customer master data, proformas, opportunities, or communication threads. It may reference them.

## 3. Entity Definition

A CDR should include the following groups of fields.

### Identity

- `id`
- `decision_code` using format `CDR-YYYY-00001`
- `created_at`
- `updated_at`

### Customer Reference

- `customer_code`
- `customer_name_snapshot`
- `customer_lane`
- `commercial_status`

Customer lane and commercial status are separate concepts.

Example:

```yaml
customer_lane: consuming_customer
commercial_status: win_back
```

### Pricing Request Snapshot

- delivery or collection
- round-trip kilometers if delivery
- projected order quantity / kg
- requested competitor match if applicable
- customer-stated objection if applicable

### Customer Intelligence Snapshot

- last purchase date
- last price paid
- days since last purchase
- average order kg
- average order value
- average delivery cost per order
- average profit or contribution per order when available
- churn risk or win-back status

### Delivery Economics Snapshot

- selected vehicle
- fuel cost per km
- round-trip kilometers
- estimated delivery cost
- delivery viability notes

### Supplier Cost Snapshot

- posted supplier cost
- firm rebate
- guaranteed cost
- conditional rebate
- target cost if applicable
- month target context if applicable

### Market Context Snapshot

- competitor name
- competitor price
- observation date
- confidence level
- notes

### Recommendation

- floor price
- target price
- stretch price
- selected recommendation
- recommendation confidence
- recommendation reasoning

### Approval

- approval status
- approved price
- approved by name
- approved timestamp
- approval notes

### Relationships

- proforma id or reference
- ERP order number if won
- opportunity id if linked to Sales OS
- communication thread reference if available
- supersedes CDR code if this record replaces a previous one

### Outcome

- outcome status
- outcome reason
- outcome timestamp
- won/lost notes

## 4. State Machine

Valid lifecycle:

```text
Draft
   ↓
Recommended
   ↓
Approved
   ↓
Quoted
   ├── Won
   ├── Lost
   ├── Expired
   └── Superseded
```

## 5. Valid Transitions

| From | To | Meaning |
|---|---|---|
| Draft | Recommended | Pricing Desk has produced a recommendation |
| Recommended | Approved | Human has approved the decision |
| Approved | Quoted | Quote/proforma has been issued |
| Quoted | Won | Customer accepted and order was captured |
| Quoted | Lost | Customer declined or chose another supplier |
| Quoted | Expired | Quote expired without acceptance |
| Draft / Recommended / Approved / Quoted | Superseded | A later CDR replaced this one |

Prohibited:

- Won back to Quoted
- Lost back to Quoted
- Expired back to Quoted
- Editing the approved price after approval
- Recalculating snapshots after approval

If commercial terms change, create a new CDR and link it via `supersedes_decision_code`.

## 6. Invariants

1. A CDR is an audit record, not a live calculation.
2. A CDR must snapshot the information available at the time of decision.
3. Approved commercial values must not be recalculated later.
4. Approved decision fields are immutable except for outcome-related fields.
5. A CDR does not own ERP financial records.
6. A proforma should reference exactly one approved CDR once persistence exists.
7. Superseded CDRs remain part of the audit trail.
8. Deposit, empty-cylinder, and non-LPG SKUs must not contaminate LPG price-per-kg, kg volume, margin, churn, or contribution calculations.
9. Customer lane drives pricing strategy before month posture is considered.
10. Month pricing posture applies by default only to commodity wholesale and standard wholesale lanes.

## 7. Immutable After Approval

Once a CDR reaches `Approved`, the following must not change:

- customer code snapshot
- customer lane
- commercial status
- pricing request snapshot
- customer intelligence snapshot
- delivery economics snapshot
- supplier cost snapshot
- market context snapshot
- floor price
- target price
- stretch price
- approved price
- decision rationale
- approved by
- approved at

Allowed to change after approval:

- state
- proforma reference
- communication reference
- ERP order reference
- outcome status
- outcome reason
- outcome timestamp
- follow-up notes

## 8. Snapshot Policy

The CDR must freeze the decision context at approval time.

This prevents historical decisions from changing when:

- supplier cost changes
- competitor prices change
- customer purchase rhythm changes
- delivery cost changes
- customer lane is later reclassified
- ERP data is corrected or enriched

A historical CDR should answer:

> Why did we quote this price on that day using the information available then?

It should not answer:

> What would we quote today?

## 9. Relationship Model

```text
Customer
  ├── ERP Orders
  ├── Commercial Decision Records
  │     ├── Proforma
  │     ├── Communication Thread
  │     ├── Sales Opportunity
  │     └── ERP Order if Won
  └── Customer Intelligence Profile
```

The CDR is the bridge between Pricing Desk and downstream execution.

## 10. Outcome Taxonomy

Use controlled outcomes:

- `won`
- `lost_price`
- `lost_competitor`
- `lost_no_response`
- `lost_timing`
- `expired`
- `cancelled`
- `superseded`

Outcome notes may contain free text, but outcome status should remain controlled.

## 11. Approval Model

Pricing Desk may recommend, but a human approves.

Required approval data:

- approved price
- approved by name
- approved timestamp
- approval note if pricing is below floor or outside normal strategy

For Phase 2, `approved_by_name` may be plain text. A foreign key to user identity can be added when real auth is implemented.

## 12. Confidence

Each CDR should record decision confidence.

Suggested values:

- `high`
- `medium`
- `low`

Confidence should reflect completeness of context.

Examples:

High confidence:

- ERP history available
- distance known
- expected order known
- supplier cost known
- competitor reference current

Low confidence:

- no ERP account
- unknown order quantity
- unknown distance
- stale competitor information

## 13. Phase 2 Implementation Boundary

Phase 2 may implement:

- CDR table
- state fields
- approval snapshot fields
- immutability trigger
- human-readable decision code
- basic Supabase persistence
- application integration from Pricing Desk UX shell

Phase 2 must not implement:

- production proforma storage
- Sales OS communications
- ERP order capture
- advanced churn engine
- full customer profitability engine

Those belong to later slices.

## 14. Development Gate

Before SQL implementation begins, confirm:

- this doctrine is accepted
- the schema diff aligns with this doctrine
- approved-field immutability is enforceable
- outcome fields remain mutable
- auth limitations are acknowledged
- CDR numbering policy is accepted

Only then should Phase 2 implementation begin.
