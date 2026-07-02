# Commercial Analytics Specification

Status: Draft architecture artifact  
Scope: Future reporting and decision-support layer for Pricing Desk

## Purpose

Commercial Analytics turns Pricing Desk, ERP, delivery economics, and market observations into management insight.

It must distinguish revenue, gross margin, delivery cost, net contribution, quote conversion, and market context. It must never treat revenue as profit.

## Source-of-Truth Policy

| Metric Source | Primary Authority |
|---|---|
| Invoiced revenue and volume | ERP |
| Customer price history | ERP-derived Customer Commercial Profile |
| Supplier cost and rebate views | Supplier Cost source / snapshots |
| Delivery cost | Delivery Economics / route evidence |
| Quoted price and rationale | Commercial Decision Records |
| Quote outcome | CDR outcome plus ERP order linkage where available |
| Competitor reference | Market Observations |
| Follow-up activity | Sales OS when implemented |

## Metric Families

### 1. Pricing Performance

- number of recommendations
- approvals by lane
- average approved price per kilogram
- floor / target / stretch selection distribution
- price exceptions below floor
- recommendation confidence distribution
- price changes from historic customer price

Questions:
- Which price bands are being approved?
- How often are we discounting below recommended target?
- Are approved prices aligned with customer lane?

### 2. Quote Conversion

- quoted CDR count
- won CDR count
- lost CDR count
- expired CDR count
- conversion rate by lane
- conversion rate by price band
- conversion rate by commercial status
- time from approval to quote
- time from quote to outcome

Questions:
- Which win-back offers convert?
- Do consuming customers convert differently from wholesalers?
- Are quotes expiring because they were not followed up?

### 3. Profitability and Contribution

- invoiced LPG kilograms
- gross margin per kilogram
- gross profit per order
- estimated delivery cost per order
- estimated net contribution per order
- contribution by customer, lane, route, and vehicle
- average contribution per kilogram

Questions:
- Which customers generate contribution after fuel?
- Which local customers are being underpriced?
- Which routes look profitable in revenue but weak in contribution?

Important limitation: v1 delivery cost may be fuel-only. All dashboards must label this clearly.

### 4. Customer Health

- customers due soon
- customers overdue relative to expected order rhythm
- churn risk distribution
- dormant customers
- win-back opportunities
- average order deterioration
- volume decline after price change

Questions:
- Which customers should be contacted this week?
- Where did volume drop after a price increase?
- Which win-back opportunities have strong historic contribution?

### 5. Market Intelligence

- competitor observations by date
- observed competitor prices by segment
- market price range
- competitor availability notes
- customer losses attributed to competitor pricing

Questions:
- Is Phoenix at R28.33/kg an isolated observation or a continuing floor?
- Where are we winning above competitor prices because of service or availability?
- Which customer lanes are most sensitive to competitor price movement?

### 6. Supplier and Rebate Position

- month-to-date LPG kilograms
- target kilograms
- kilograms remaining to target
- firm and conditional rebate status
- expected rebate value
- quote volume contributing to target

Questions:
- Are we on track for supplier target attainment?
- How much volume is needed before conditional rebate assumptions are safe for forecasting?
- Are late-month wholesale discounts justified by target economics?

Month posture analytics apply to wholesale lanes by default, not automatically to consuming, relationship, or strategic accounts.

## KPI Definitions

### Quote Conversion Rate

```text
won quoted CDRs / all terminal quoted CDRs
```

Exclude draft and recommended records.

### Gross Margin per Kilogram

```text
revenue excluding VAT per LPG kilogram
minus supplier cost excluding VAT per LPG kilogram
```

Use correct supplier cost snapshot for historical CDR analysis where available.

### Net Contribution per Order

```text
gross profit per order
minus allocated direct delivery cost
```

In v1, delivery cost may be fuel-only and must be labelled.

### Churn Overdue Ratio

```text
days since last LPG purchase / average days between qualifying LPG orders
```

This is an input to risk classification, not a standalone outcome.

### Price Realisation

```text
approved or invoiced price per kilogram
compared with target price per kilogram
```

## Required Dimensions

All future analytics should support grouping by:

- date
- customer
- customer lane
- commercial status
- location / route where known
- vehicle where known
- product size and product class
- sales representative where known
- supplier cost period
- competitor reference where relevant
- CDR outcome

## Data Integrity Rules

- Deposits, empties, bonds, CO2, and non-LPG lines must not enter LPG kg, LPG price-per-kg, or LPG margin metrics.
- Historical CDR analysis must use decision snapshots, not current live supplier cost.
- Financial reporting from ERP remains authoritative over Pricing Desk estimates.
- Estimates must be labelled as estimates.
- Missing delivery distance must not be silently treated as zero cost.

## Suggested Workspace Views

### Pricing Desk Home

- current guaranteed cost
- current month target position
- latest competitor observations
- pending approved decisions
- win-back opportunities
- churn alerts

### Customer Workspace

- average order and contribution
- average delivery cost
- last price paid
- buying rhythm
- quote and outcome history

### Management Analytics

- conversion by lane
- margin and contribution by customer
- competitor losses
- top and bottom routes
- dormant / win-back queue

## Implementation Order

1. Persist CDRs and outcomes.
2. Build Customer Commercial Context API.
3. Link proformas and ERP orders to CDRs.
4. Add basic decision and conversion reporting.
5. Add customer contribution and churn reporting.
6. Add route and market intelligence dashboards.

No dashboard should be built before the underlying metric definition and source-of-truth policy are accepted.
