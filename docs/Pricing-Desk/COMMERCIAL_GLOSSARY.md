# Commercial Glossary

Status: Draft architecture artifact  
Scope: Pricing Desk, Commercial Decision Records, Customer Intelligence, and future Sales OS

## Purpose

This glossary defines the commercial vocabulary used by Pricing Desk. Agents, database schemas, UX copy, reports, and implementation work must use these terms consistently.

## Core Terms

### Customer
An ERP-backed relationship identity that may own one or more ERP account codes, order histories, commercial decisions, and opportunities.

### Customer Lane
The primary commercial behaviour model used to determine pricing strategy.

Allowed v1 lanes:
- `commodity_wholesale`
- `standard_wholesale`
- `consuming_customer`
- `relationship_account`
- `strategic_account`

A lane is not a temporary sales state.

### Commercial Status
The current relationship state of the customer or opportunity.

Allowed v1 statuses:
- `new_prospect`
- `active_customer`
- `dormant_customer`
- `win_back`
- `churn_risk`

A customer may be a `consuming_customer` lane and simultaneously have `win_back` status.

### Commercial Profile
A live, derived customer-level summary of historical purchasing, pricing, profitability, delivery economics, and risk indicators.

It is not a transactional record and may change as ERP data changes.

### Customer Intelligence
The clean, decision-ready customer facts supplied to Pricing Desk from ERP and derived analytics. It includes last purchase, last price, average order, buying rhythm, and churn indicators.

### Supplier Cost
The supplier LPG cost basis used for a commercial decision.

For Oryx June 2026, the model distinguishes:
- posted cost
- firm rebate
- guaranteed cost
- conditional rebate
- target cost

### Guaranteed Cost
The supplier cost used by default for live pricing decisions.

It equals posted cost less only rebates that are firm, earned, and not dependent on month-end volume attainment.

### Target Cost
A forecast-only cost view that may include conditional rebates when target attainment is plausibly secured. It must not be used as the default live quote floor.

### Market Observation
A dated, sourced observation of competitor pricing, availability, service terms, or market behaviour.

A market observation is not automatically a price instruction.

### Delivery Economics
The operational cost and feasibility view for a proposed delivery, including route distance, vehicle selection, fuel cost, payload fit, and contribution after fuel.

### Gross Margin
Revenue excluding VAT less direct LPG supplier cost excluding VAT. It does not include delivery cost, driver cost, vehicle wear, admin, or finance cost.

### Delivery Cost
The estimated direct route cost allocated to the delivery. In v1 this is fuel cost; later versions may add driver, maintenance, and route allocation.

### Net Contribution
Gross margin less delivery cost and any other selected direct costs. It is the preferred measure for comparing delivery opportunities.

### Average Order
The historical average LPG order for a customer, expressed at minimum in kilograms and optionally in value, cylinder mix, and contribution.

### Average Net Contribution Per Order
Average historical gross margin less average delivery cost for the customer’s qualifying LPG orders.

### Churn Risk
A derived risk indicator that a customer is unlikely to reorder within their expected buying rhythm or has materially reduced purchasing.

### Win-back
A commercial status used for a formerly active customer being actively pursued after loss or dormancy.

### Floor Price
The lowest commercially acceptable price for a specific decision, based on available cost, delivery, customer, and approval context.

A quote below floor requires explicit exception approval.

### Target Price
The preferred commercially sound price for the present decision.

### Stretch Price
A higher tested price that remains plausible given customer value, service, supply reliability, and market context.

### Price Recommendation
The Pricing Strategy output containing floor, target, stretch, selected recommendation, confidence, and rationale.

### Commercial Decision Record (CDR)
An immutable-after-approval record of what was recommended, what was approved, the context used, and the eventual outcome.

### Pricing Decision Record (PDR)
The first implementation category of Commercial Decision Record, focused on a price decision.

### Proforma
A customer-facing pre-order quotation document. It is not an ERP tax invoice and should reference one approved CDR once persistence is implemented.

### Opportunity
A sales lifecycle record owned by Sales OS / CRM. It tracks pipeline and engagement, not pricing rationale.

### Outcome
The terminal result of a quoted CDR. Controlled v1 values:
- `won`
- `lost_price`
- `lost_competitor`
- `lost_no_response`
- `lost_timing`
- `expired`
- `cancelled`
- `superseded`

## LPG Product Classification Terms

### LPG Content SKU
A SKU representing saleable LPG gas content. It may participate in LPG kilograms, price-per-kg, margin, purchase rhythm, and churn calculations.

### Deposit SKU
A cylinder bond or deposit SKU. Deposit entries must not enter LPG kilograms, LPG revenue, price-per-kg, margin, churn, or delivery contribution calculations.

### Empty Cylinder SKU
An empty cylinder or shell transaction. It is commercially relevant but is analytically separate from LPG gas content.

## Non-Negotiable Language Rules

- Do not refer to ERP account codes as customers when one commercial customer has multiple billing identities.
- Do not call supplier posted cost the guaranteed cost.
- Do not call revenue profit.
- Do not call gross margin net contribution.
- Do not classify a customer lane from a single quote without evidence.
- Do not merge customer lane and commercial status into one field.
