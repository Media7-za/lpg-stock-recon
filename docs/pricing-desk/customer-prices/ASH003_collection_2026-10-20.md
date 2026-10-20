---
record_id: ASH003-COLLECT-2026-10-20
account_code: ASH003
customer: AM Gas
price_type: collection
currency: ZAR
unit: kg
vat_basis: inclusive
new_price_per_kg: "25.00"
confirmed_on: "2026-10-20"
effective_from_exact: "2026-10-20"
status: confirmed-price-and-effective-date
erp_sync_status: not_verified
linear_issue: ADM-180
source: commercial owner confirmation in Pricing Desk conversation 2026-10-20
---

# ASH003 — AM Gas: Confirmed Collection Price

| Field | Value |
|---|---|
| Account | ASH003 — AM Gas (Ashley) |
| Price type | Collection |
| Confirmed price | **R25.00/kg inclusive of VAT** |
| Confirmed on | 20 October 2026 |
| Exact effective date | **20 October 2026 — confirmed** |
| Previous price list | R26.3563/kg (verify prior ERP price independently) |
| Delivery price | Unchanged / not decided here |
| ERP implementation | Pending verification, tracked in ADM-180 |

## Commercial evidence
The commercial owner offered R25.00/kg in the 20 October 2026 WhatsApp negotiation, declined the customer's R24.50/kg counteroffer, and subsequently **explicitly confirmed R25.00/kg** in the Pricing Desk conversation. This confirmation establishes the commercial price, not ERP execution. The commercial owner subsequently confirmed the effective start date as **20 October 2026**. The competitor R24.50/kg was customer-reported market intelligence, not the approved rate.

## Customer-facing LPG refill amounts (inclusive of VAT)
| Size | Refill |
|---|---:|
| 9kg | R225.00 |
| 14kg | R350.00 |
| 19kg | R475.00 |
| 48kg SV | R1,200.00 |
| 48kg DV | R1,200.00 |

## Controls
- Resolve this record by account, collection basis and applicable date before quoting.
- Apply the price from **20 October 2026**. Do not reprice earlier transactions without separate approval.
- Do not infer a delivery price change or cylinder deposit change.
- Keep this historical decision immutable; subsequent changes require a new decision record.
- ERP agent task: https://linear.app/p2p-marketplace/issue/ADM-180/ash003-implement-confirmed-r2500kg-collection-price-in-erp
