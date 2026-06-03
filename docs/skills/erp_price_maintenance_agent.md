# ERP Price Maintenance Agent Skill

## Purpose

The ERP Price Maintenance Agent updates ERP/customer price records after a commercial price has been approved.

This agent does **not** decide prices.

It executes approved pricing changes, documents them, and verifies that ERP pricing output matches the approved commercial decision.

---

## Scope

Use this skill when a customer-specific price, SKU price, delivery-inclusive price, or wholesale rate has been approved and must be reflected in the ERP system or ERP-derived price records.

Examples:

- Update Impendle Wholesale selling prices after approved commercial decision.
- Convert approved incl. VAT customer prices into ERP ex VAT item prices.
- Update customer-specific price list entries.
- Validate that the ERP invoice preview matches the approved customer-facing price.

---

## Non-Negotiable Rules

1. **Do not decide pricing.**
   - Pricing must come from the Commercial Owner / Pricing Agent approval.

2. **Do not infer VAT treatment silently.**
   - Confirm whether ERP stores prices incl. VAT or excl. VAT.

3. **Do not mix delivery and gas pricing without explicit approval.**
   - Determine whether delivery is baked into item price or charged separately.

4. **Never update ERP from an unapproved recommendation.**
   - Required input: approved price decision.

5. **Always create a verification record.**
   - Show approved price vs ERP stored price vs invoice-preview output.

6. **Respect source-of-truth boundaries.**
   - LPG Intelligence owns commercial decision memory.
   - LPG Stock Recon / ERP repo owns ERP evidence, execution notes, and validation.

---

## Required Inputs

The task request must include:

- Customer name
- ERP customer code
- Approved price basis
- Effective date
- Product/SKU list
- Approved customer-facing prices
- VAT treatment
- Delivery treatment
- Approval source

Recommended input format:

```yaml
customer: Impendle Wholesale
erp_customer_code: BU0009
approved_by: Commercial Owner
approval_date: 2026-06-03
price_basis: R29.00/kg incl VAT delivered on wholesale load
vat_treatment: customer-facing price includes VAT
delivery_treatment: delivery included in price for wholesale load
minimum_load_condition: wholesale load
products:
  - size: 9kg
    customer_price_inc_vat: 261.00
  - size: 14kg
    customer_price_inc_vat: 406.00
  - size: 19kg
    customer_price_inc_vat: 551.00
  - size: 48kg
    customer_price_inc_vat: 1392.00
```

---

## Execution Workflow

### 1. Confirm Pricing Basis

Before updating anything, confirm:

- Does ERP store item prices incl. VAT or excl. VAT?
- Are prices stored per cylinder, per SKU, or per kg?
- Is delivery included in item price or separate?
- Is the price customer-specific or global?
- Is the price temporary, promotional, or permanent?

If any answer is unknown, stop and request clarification.

---

### 2. Convert Approved Prices to ERP Format

If ERP stores ex VAT prices, convert:

```text
ex_vat_price = inc_vat_price / 1.15
```

For kg-based approved pricing:

```text
inc_vat_cylinder_price = kg_size * approved_inc_vat_price_per_kg
ex_vat_cylinder_price = inc_vat_cylinder_price / 1.15
```

For Impendle at R29.00/kg incl VAT:

| Size | Customer Price Incl VAT | ERP Price Ex VAT |
|---|---:|---:|
| 9kg | R261.00 | R226.96 |
| 14kg | R406.00 | R353.04 |
| 19kg | R551.00 | R479.13 |
| 48kg | R1,392.00 | R1,210.43 |

Round according to ERP pricing precision rules.

---

### 3. Identify ERP Price Records

Locate the relevant ERP price records for:

- customer-specific price list
- product/SKU mapping
- historical active price records
- effective date rules
- inactive or duplicate customer accounts

For Impendle:

- Active account: `BU0009`
- Historical account: `BU0003`
- Inactive empties account: `BU0031` must not receive LPG selling price updates unless explicitly instructed.

---

### 4. Apply Price Update

Update only the approved records.

Record:

- previous ERP price
- new ERP price
- changed SKU/account
- effective date
- approval reference
- operator/agent

---

### 5. Validate ERP Output

Generate or simulate an invoice/price preview and confirm:

- 9kg outputs approved customer price
- 14kg outputs approved customer price
- 19kg outputs approved customer price
- 48kg outputs approved customer price
- VAT calculation matches approved basis
- delivery treatment matches approved basis
- no inactive account was updated accidentally

---

## Required Output File

Create or update a maintenance report at:

```text
analysis/debtors/<ERP_CUSTOMER_CODE>/reports/price_maintenance_<YYYY-MM-DD>.md
```

For Impendle:

```text
analysis/debtors/BU0009/reports/price_maintenance_2026-06-03.md
```

---

## Required Report Structure

```md
# ERP Price Maintenance Report: <Customer>

## Metadata
- Date:
- Customer:
- ERP Account:
- Agent:
- Approval Source:

## Approved Commercial Decision

## ERP Pricing Basis

## Price Conversion Table

## Records Updated

## Validation Results

## Exceptions / Open Questions

## Final Status
```

---

## Completion Criteria

The task is complete only when:

- approved prices are converted correctly
- ERP records are updated or update instructions are documented
- invoice/price preview validates the customer-facing price
- report is written to the required path
- linked GitHub issue is updated with result summary

---

## Escalation Triggers

Escalate to the Commercial Owner if:

- approved pricing is below cost
- delivery treatment is unclear
- ERP pricing model cannot represent the commercial decision
- customer account mapping is ambiguous
- inactive/historical accounts appear to contain active pricing records
- VAT treatment differs from approval
