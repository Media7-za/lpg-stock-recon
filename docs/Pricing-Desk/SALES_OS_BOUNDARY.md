# Pricing Desk and Sales OS Boundary

Status: Draft architecture artifact  
Scope: Separation between commercial decisioning and customer engagement

## Purpose

Pricing Desk and Sales OS are connected but separate domains.

Pricing Desk answers:

> What commercial terms should we offer, and why?

Sales OS answers:

> How do we engage, nurture, follow up, and convert the customer?

The boundary prevents pricing rules from becoming mixed with communication workflow and prevents sales workflow from silently changing commercial decisions.

## Ownership

| Capability | Pricing Desk | Sales OS |
|---|---:|---:|
| Customer intelligence | Owns commercial interpretation | Reads relevant summary |
| Supplier cost | Owns pricing input | Read-only reference |
| Delivery economics | Owns pricing input | Read-only reference |
| Market observations | Owns commercial interpretation | May attach context |
| Price recommendation | Owns | Must not alter |
| Price approval | Owns human approval record | Reads approval |
| Commercial Decision Record | Owns | Links to it |
| Proforma generation | Owns approved document generation | May send/link document |
| Opportunity pipeline | Links only | Owns |
| Communication messages | May draft approved wording | Owns delivery, thread and timeline |
| Follow-up cadence | Does not own | Owns |
| Customer response logging | Reads commercial signals | Owns interaction record |
| Order/invoice | ERP owns | Links outcome |

## Workflow

```text
Customer request
  ↓
Pricing Desk intake and recommendation
  ↓
Human approval
  ↓
Commercial Decision Record
  ├── Proforma generated
  └── Sales OS receives approved offer context
         ↓
      Message / quote delivery
         ↓
      Follow-up and negotiation
         ↓
      Outcome recorded
         ↓
      Outcome linked back to CDR
```

## Handoff Contract: Pricing Desk to Sales OS

Sales OS should receive an approved-offer payload containing:

- CDR id and decision code
- customer identity and contact target
- approved price and VAT basis
- approved order assumptions
- quote validity if provided
- proforma reference if generated
- customer lane and commercial status
- allowed commercial message framing
- action needed: send, follow up, callback, negotiate, or close

Sales OS must not receive only a raw price without the relevant commercial instruction.

## Handoff Contract: Sales OS to Pricing Desk

Sales OS returns commercial events that may require a new decision:

- competitor price disclosed
- customer requests a lower price
- quantity changed
- delivery distance changed
- payment terms changed
- customer asks for a new cylinder mix
- customer accepts
- customer declines
- customer becomes unresponsive

When commercial terms change, Pricing Desk creates a new or superseding CDR. Sales OS must not edit the prior approved price.

## Opportunity and CDR Relationship

One Sales Opportunity may contain several CDRs.

Example:

```text
Tandoor win-back opportunity
  ├── CDR 1: initial R30.50/kg offer
  ├── CDR 2: revised order quantity / price request
  └── CDR 3: approved final quote
```

The opportunity tracks pursuit. The CDR tracks each commercial decision.

## Communication Guardrails

The Communication Agent may:

- draft a WhatsApp or email from approved offer content
- create a follow-up reminder
- classify customer response
- suggest return to Pricing Desk when terms change

The Communication Agent may not:

- discount a price
- alter validity
- promise a delivery time not confirmed operationally
- change payment terms
- create a final commercial commitment without an approved CDR

## V1 Boundary

V1 may use a lightweight activity feed and manual send process.

V1 does not require:
- live WhatsApp integration
- full CRM pipeline persistence
- automated communications
- campaign management
- communication analytics

The CDR and proforma link are sufficient to create a future-safe handoff.
