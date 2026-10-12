# Pricing Desk Analysis

## Purpose

This directory contains Pricing Desk analytical and domain-discovery evidence derived from ERP, Stock Recon, customer, pricing, and commercial workflow context.

It exists to support discovery, reconciliation, profitability analysis, customer intelligence, and the design of future Pricing Desk data models.

## Boundary

Content under `analysis/pricing-desk/` is **analysis and discovery evidence**. It is not, by itself, governed commercial truth and must not be treated as the authoritative source for customer pricing, supplier costs, rebates, commercial policy, or approved business rules.

ERP/Stock Recon evidence may be analysed here without unnecessarily duplicating source transaction data into another repository.

## Intended Structure

```text
analysis/pricing-desk/
├── README.md
├── domain-discovery/
│   └── first-pass/
├── customer-intelligence/
└── profitability/
```

### `domain-discovery/first-pass/`

Stores first-pass domain-discovery outputs from individual Pricing Desk sessions or contexts.

First-pass artifacts must:

- be treated as discovery evidence, not governed domain truth;
- preserve the source/context that produced the discovery;
- identify their run date and prompt version where known;
- carry a review status, normally `unreviewed`;
- remain unreconciled until a later synthesis/review workflow compares evidence across contexts.

Recommended filename:

```text
YYYY-MM-DD_<context-name>_domain_discovery.md
```

### `customer-intelligence/`

For analytical outputs concerning customer behaviour, purchase history, commercial risk, retention, volume trends, and opportunities where the underlying evidence is available.

### `profitability/`

For analysis that combines realised commercial activity with historically appropriate cost/economic evidence. Historical profitability should use the cost and delivery assumptions applicable to the relevant transaction/deal period rather than current values.

## Source-of-Truth Principle

Use the following conceptual separation:

```text
Conversation context  -> discovers and captures provisional commercial evidence
GitHub analysis        -> preserves discovery/reconciliation artifacts
Governed artifacts     -> define approved policy/reference rules
Operational database   -> records structured commercial events and state
ERP                     -> proves invoiced/financial execution
```

Do not convert an analytical conclusion into authoritative pricing or policy merely because it is stored in this directory.

## Cross-Domain Objective

This area provides a controlled bridge between ERP evidence and Pricing Desk domain discovery. It should help establish the eventual boundaries for customers, pricing decisions, offers, quotes, deals, orders, supplier costs, delivery economics, profitability, and related commercial events before formal database schemas are locked.
