---
name: pricing-desk-lpg-refill-price-list
description: Generate a compact, screenshot-friendly Gas Express LPG refill price list for a named customer/account using an explicitly supplied or verified per-kg rate.
version: 1.0.0
status: draft
owner: Pricing Desk
---

# LPG Refill Price List — Presentation Skill

## Purpose
Render the customer-facing compact price-list layout agreed in the ASH003 conversation. This is a presentation and deterministic calculation skill, **not** a pricing approval, PDR creation, or ERP price-maintenance skill.

## Inputs
- Customer trading name and account code.
- Price period (month/year, or effective date when provided).
- Fulfilment basis: Collection or Delivery.
- Selling price per kg and VAT basis, from an approved or explicitly user-authorised source.
- Cylinder variants to display, normally 9kg, 14kg, 19kg, 48kg SV, 48kg DV.
- Whether prices cover LPG refills only, and any deposit/exchange terms.

If VAT basis, fulfilment basis, or price authority is unknown, flag the unknown rather than inventing a customer-facing assurance. A rate discussed in a chat is not automatically an ERP update.

## Calculation
For each size: refill price = nominal LPG kilograms × per-kg price. Use decimal arithmetic; round the final unit amount to two decimal places (standard half-up currency rounding). Preserve the source per-kg rate at its stated precision. 48kg SV and DV have equal LPG refill prices when priced solely by kg; deposits/cylinder charges are separate.

## Layout (mandatory)
- Centered **GAS EXPRESS** brand heading.
- Centered **LPG REFILL PRICE LIST** subtitle.
- Centered compact customer name, account code, and price period.
- Single neutral, rounded highlight containing:
  - Small label **Collection price** or **Delivery price**.
  - Prominent **Rxx.xxxx/kg** figure.
- Two-column table: **Cylinder Size** | **Refill Price**, right-aligned ZAR values.
- Rows in ascending nominal cylinder size, with SV and DV separately labelled where applicable.
- Small muted footer with fulfilment basis, confirmed VAT basis, refill-only scope and deposit exclusion if applicable.
- Narrow, mobile/screenshot-friendly; avoid extra columns and long explanatory paragraphs.
- **Never show an increase indicator**, upward arrow, previous price, price delta, margin, supplier cost, rebate, or internal analysis on the customer-facing price list.
- No fabricated approval, VAT basis, deposit policy, stock confirmation, or ERP update.

## Example — ASH003, October 2026
Source: user requested a R1/kg revision of the previously recorded R25.3563/kg collection rate, giving R26.3563/kg. VAT-inclusive treatment was **assumed in the conversation**, not independently verified.

**GAS EXPRESS**

**LPG REFILL PRICE LIST**

AM Gas | ASH003 | October 2026

> Collection price
>
> **R26.3563/kg**

| Cylinder Size | Refill Price |
|---|---:|
| 9kg | R237.21 |
| 14kg | R368.99 |
| 19kg | R500.77 |
| 48kg SV | R1,265.10 |
| 48kg DV | R1,265.10 |

Collection only · VAT basis requires confirmation · LPG refills only · Cylinder deposits excluded (subject to confirmation).

## Execution boundaries
1. Verify or obtain rate, period, VAT basis, and fulfilment basis.
2. Calculate each displayed unit price and render the prescribed layout.
3. If any qualifier remains uncertain, keep it visible outside the customer-facing list or withhold the affected assertion; ask only for essential missing facts.
4. Never write an ERP record, change a PDR, or claim a price is approved unless separately authorised and executed.
5. Historical rate changes belong in pricing history, not on this price-list presentation.
