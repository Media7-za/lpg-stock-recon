---
name: pricing-desk-price-resolution
description: Resolve the latest applicable governed customer price from GitHub before creating LPG quotes, price lists or proformas.
version: 1.0.0
status: draft
owner: Pricing Desk
---

# Pricing Desk — Customer Price Resolution

## Trigger
Run **before** generating or revising any customer-facing LPG price list, quotation, proforma, pricing recommendation using an existing account price, or instruction to update an ERP customer price.

## Required inputs
Customer/account identity; collection vs delivery; proposed transaction date or pricing period; product variant and LPG kg; VAT basis; any specifically authorised negotiated override.

## Mandatory lookup sequence
1. Identify the exact ERP account code; do not substitute a similar trading name.
2. Retrieve the current GitHub default-branch files under `docs/pricing-desk/customer-prices/` for that account. Use live GitHub access rather than conversation memory. Review relevant historical/successor records, not merely the first matching filename.
3. Filter by **account, fulfilment basis, effective date/period, VAT basis**, and any product-specific restrictions. Confirmation date is not automatically effective date.
4. Prefer the latest **applicable confirmed decision**, not necessarily the most recently edited file. A later decision for delivery must not override collection and vice versa.
5. Preserve per-kg precision during calculations and round final currency amounts to two decimals. Explicitly identify uncertain effective dates, VAT treatment, and ERP synchronisation.
6. If no live repository lookup is possible, say the current price cannot be verified; do **not** present memory as an authoritative current price. Request confirmation before issuing a final customer-facing price.
7. If multiple records conflict or the effective date cannot be resolved for the transaction, stop final issuance and escalate for commercial-owner clarification.
8. When preparing ERP update instructions, separately check ERP execution status. GitHub records commercial decisions; they do not prove ERP prices were changed.

## Initial governed record
- `docs/pricing-desk/customer-prices/WOR001_collection_2026-10-20.md`
- WOR001 / Works On Site / **Collection** / October 2026 / **R24.1357115/kg incl. VAT**.
- Confirmed 20 October 2026; precise effective day **unconfirmed**.
- Supersedes collection R23.77/kg incl. VAT.
- Delivery price **not updated**; requires separate decision.

## Operational caveat
This skill is a repository instruction, **not an automatic cross-session hook**. Agents and sessions must invoke it or be configured to load it. Until enforcement is wired into the quotation workflow, do not claim every session is guaranteed to retrieve current prices.
