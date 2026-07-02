# Commercial Domain Model

Status: Draft architecture artifact  
Scope: Pricing Desk v1 and future Sales OS integration

## Purpose

This document defines the commercial entities, their ownership, relationships, and lifecycle boundaries. It is the data-model companion to `COMMERCIAL_DECISION_DOCTRINE.md`.

## Authority Model

| Entity / Fact | System of Record | Notes |
|---|---|---|
| Customer master and account codes | ERP | A commercial customer may map to multiple ERP accounts. |
| Product / SKU mapping | ERP + governance mapping | Classification rules determine analytical treatment. |
| Orders, invoices, credits, payments | ERP | Financial and transactional truth. |
| Supplier cost source | Supplier intelligence | Pricing Desk snapshots relevant cost at approval. |
| Commercial profile | Derived analytics | Live and recalculable. |
| Commercial Decision Record | Pricing Desk | Commercial reasoning and approved decision audit trail. |
| Opportunity / pipeline | Sales OS | Engagement lifecycle. |
| Communication thread | Sales OS / messaging system | Contact and nurture history. |
| Proforma artifact | Pricing Desk / document store | Customer-facing generated quote. |

## Entities

### 1. Commercial Customer

A relationship identity used by Pricing Desk.

Key fields:
- customer code or canonical id
- display name
- associated ERP account codes
- customer lane
- commercial status
- contact references

Relationships:
- one Commercial Customer has many ERP accounts
- one Commercial Customer has one live Commercial Profile
- one Commercial Customer has many CDRs
- one Commercial Customer has many opportunities and communications

### 2. ERP Account

A billing identity from ERP.

It must not be assumed to be identical to a Commercial Customer.

Examples of roles:
- historical billing account
- active billing account
- branch account
- empties/deposit account

### 3. Commercial Profile

A live derived profile for one Commercial Customer.

It includes:
- last purchase and last price
- average order kg and value
- average gross margin and delivery cost per order
- average net contribution per order
- purchase rhythm
- churn risk
- lifetime LPG volume and contribution where data is available

The profile is not immutable and is not the CDR.

### 4. Market Observation

A dated record of external market intelligence.

Key fields:
- competitor
- observed price
- VAT basis
- customer segment
- location or delivery context
- observation date
- source and confidence
- notes

A Market Observation may be referenced by many CDRs.

### 5. Supplier Cost Position

A dated supplier cost configuration.

Key fields:
- supplier
- posted cost
- firm rebate
- guaranteed cost
- conditional rebate
- target cost
- target volume
- effective date

A CDR snapshots relevant values; it does not reference live values as historical truth.

### 6. Delivery Economics Assessment

A calculation context for a proposed order.

Key fields:
- delivery or collection
- one-way / round-trip kilometers
- proposed LPG kg
- selected vehicle
- fuel cost per km
- estimated fuel cost
- payload assessment
- delivery viability notes

This may be computed on demand but is snapshotted into the CDR upon approval.

### 7. Price Recommendation

A pricing strategy output.

Key fields:
- floor price
- target price
- stretch price
- selected recommendation
- confidence
- reasoning
- exception requirement

A recommendation may exist before approval. Once approved it becomes immutable context within a CDR.

### 8. Commercial Decision Record

An audit record for a commercial decision.

Key fields:
- decision code
- customer reference and customer snapshot
- pricing request snapshot
- intelligence snapshot
- supplier cost snapshot
- delivery economics snapshot
- market context snapshot
- recommendation snapshot
- approval fields
- state and outcome fields
- downstream references

See `COMMERCIAL_DECISION_DOCTRINE.md` for lifecycle and invariants.

### 9. Proforma

A generated customer-facing quote document.

Key fields:
- proforma id
- source CDR id / code
- customer snapshot
- approved price snapshot
- line items
- total
- document location
- generated timestamp

A proforma does not own pricing strategy. It renders approved decision data.

### 10. Opportunity

A Sales OS record representing a customer conversion attempt.

Key fields:
- customer reference
- pipeline stage
- owner
- next action
- expected value
- linked CDRs
- outcome

Opportunity is separate from a CDR because an opportunity may involve multiple pricing decisions.

### 11. Communication Thread

A Sales OS interaction timeline linked to a customer and optionally an opportunity or CDR.

Examples:
- WhatsApp quote sent
- follow-up due
- customer replied
- price objection
- callback requested

## Relationship Diagram

```text
Commercial Customer
  ├── ERP Account(s)
  ├── Commercial Profile (derived, live)
  ├── Market-relevant context
  ├── Commercial Decision Record(s)
  │      ├── Price Recommendation snapshot
  │      ├── Supplier Cost snapshot
  │      ├── Delivery Economics snapshot
  │      ├── Customer Intelligence snapshot
  │      ├── Proforma (0..n)
  │      ├── ERP Order (0..1 initially)
  │      └── Communication / Opportunity links (0..n)
  ├── Opportunity(s)
  └── Communication Thread(s)
```

## Cardinalities

| Relationship | Cardinality |
|---|---|
| Commercial Customer → ERP Account | 1 to many |
| Commercial Customer → Commercial Profile | 1 to 1 live view |
| Commercial Customer → CDR | 1 to many |
| CDR → Proforma | 0 to many; v1 expectation is one current proforma |
| CDR → ERP Order | 0 to 1 in v1 |
| Opportunity → CDR | 0 to many |
| CDR → Market Observation | 0 to many via snapshot/references |
| CDR → Communication Thread | 0 to many |

## Separation Rules

- CDRs own decision snapshots; they do not own live customer profile data.
- Customer profiles are derived and may change; CDR snapshots must not.
- ERP owns actual order and invoice totals.
- Sales OS owns contact cadence and opportunity stages.
- Proformas render an approved CDR and must not independently derive price.

## V1 Boundaries

V1 supports manual lane/status assignment and snapshot JSON/structured fields where needed.

V1 does not require:
- a complete CRM
- persistent messaging integration
- automated route allocation
- automatic price approval
- a full profitability ledger
