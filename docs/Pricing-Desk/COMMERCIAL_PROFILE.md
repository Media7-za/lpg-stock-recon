# Customer Commercial Profile

Status: Draft architecture artifact  
Scope: Live derived customer intelligence used by Pricing Desk

## Purpose

The Customer Commercial Profile answers:

> How valuable is this customer, how do they normally buy, and what commercial risk or opportunity exists today?

It is live derived intelligence, not an immutable audit record. Pricing Desk snapshots relevant values into a Commercial Decision Record at approval time.

## Minimum Profile Contract

### Identity

- canonical customer id
- display name
- related ERP account codes
- customer lane
- commercial status
- classification confidence

### Purchase History

- first purchase date
- last purchase date
- days since last purchase
- last LPG order kilograms
- last LPG price per kilogram, including and excluding VAT
- last LPG order value
- average days between orders
- expected next order date
- reorder status

### Average Order

- average LPG kilograms
- average order value
- cylinder mix by size

### Profitability

- average gross margin per kilogram excluding VAT
- average gross profit per order
- average delivery cost per order
- average net contribution per order
- lifetime LPG kilograms when available
- lifetime net contribution when available

### Logistics

- typical round-trip distance
- preferred vehicle
- estimated fuel cost per delivery
- route confidence

### Pricing

- last price paid
- average price over 3, 6, and 12 months when enough history exists
- lowest and highest observed price
- current pricing rule when one is approved

### Risk

- churn risk
- churn reason
- price sensitivity
- competitor risk
- data confidence

## Calculation Policy

### LPG-only Rule

LPG kilograms, price per kilogram, margin, purchase rhythm, churn, and contribution must use LPG content SKUs only.

Exclude deposits, empty cylinders, cylinder bonds, CO2, accessories, and non-LPG service lines.

SKU treatment must follow `docs/governance/sku_suffix_mapping.md`.

### Customer Consolidation

When a commercial customer has several ERP account codes, confirmed related accounts are consolidated into one profile while retaining each account role.

Possible roles:
- historical billing
- active billing
- empties or deposit
- branch

Empties/deposit accounts may appear in operational context but must not enter LPG financial measures.

### Average Order Window

Use a transparent lookback window.

Suggested defaults:
- 6 months for current operating behaviour
- 12 months for strategic history
- all available qualifying records for lifetime metrics

### Delivery Cost per Average Order

Use the best available evidence in this order:

1. captured actual route cost
2. confirmed round-trip distance plus vehicle selection rule
3. labelled estimate

Fuel-only calculation is acceptable for v1, but it must be labelled as fuel-only.

### Average Net Contribution

Average net contribution per order equals average gross profit per order less average delivery cost per order.

The profile must state which direct costs are excluded, such as driver, maintenance, finance, and overhead.

### Churn Risk

Churn risk is derived, not a financial fact.

Suggested v1 statuses:
- unknown
- low
- medium
- high

Baseline reasoning:
- insufficient purchase history: unknown
- within expected order rhythm: low
- approaching expected reorder: medium
- materially overdue relative to normal rhythm: high
- past inactive threshold: dormant/high

Store risk reason and data confidence, not only a status label.

## Lane and Status Policy

Customer lane is strategic:
- commodity wholesale
- standard wholesale
- consuming customer
- relationship account
- strategic account

Commercial status is current:
- new prospect
- active customer
- dormant customer
- win-back
- churn risk

These must remain separate. Example: a consuming customer may be a win-back.

## Pricing Desk Use

Before recommendation, Pricing Desk should identify:

- last price paid
- typical order size
- buying rhythm
- average gross profit and net contribution
- delivery cost per order
- retention, churn, or win-back context

The profile informs a decision. It does not approve a price.

## Phase 3 Minimum Output

The first Customer Commercial Context API should return:

- customer identity and account mapping
- lane and commercial status
- last LPG purchase and last price paid
- last and average LPG order kilograms
- average days between orders
- days since last purchase
- estimated delivery cost per average order where distance is available
- average gross profit and net contribution where cost history is sufficiently reliable
- churn risk and data confidence
