---
source/context: Pricing Desk conversation covering Allan pricing continuity, supplier movements, invoice-credit review, proforma generation, and WOR001 price/account history
run date: 2026-08-26
prompt version: pricing_desk_domain_model_discovery first-pass
review status: unreviewed
---

# Evidence-derived domain inventory

## 1. Commercial parties, actors and identifiers

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Customer | Entity; actor | “Allan”; “Fabers Gas”; “Works On Site” | Party buying LPG or receiving a commercial document | Business entity/reference | Commercial relationship | Non-temporal identity; attributes may change | Entered/observed | Explicit | Customer discussions, invoices and PDR updates |
| Customer account code | External reference/identifier; attribute | \`ALR003\`, \`WOR001\`, earlier \`FAM005\`, \`WOR005\` | ERP-facing identifier assigned to a customer account | String | Customer account | Temporally versioned because corrections occur | Imported/entered | Explicit | Works On Site correction sequence |
| Account-code assignment | Event; relationship | Works On Site: \`FAM005 → WOR005 → WOR001\` | Assignment or correction of an account code to a customer | Event with old/new values and effective time | Customer account | Temporal | Entered/observed | Explicit | WOR001 record discussion |
| Superseded account code | State/status | \`FAM005\` and \`WOR005\` superseded by \`WOR001\` | Historical identifier that must not be used as the active code | Enum/status plus identifier | Account-code assignment | Temporal | Derived from correction | Strongly inferred | Final correction to WOR001 |
| Commercial owner | Actor; relationship | “Commercial owner initiates a strategic review”; “approved_by: Commercial Owner” | Person authorized to review or approve pricing | Person/role reference | Pricing decision | Temporal relationship | Entered | Strongly inferred | Pricing review and decision-record discussion |
| Customer contact person | Attribute | Allan appears to be a person/contact; no formal customer account name established | Individual communicating for or as the customer | Person/string | Customer or customer account | May change | Observed | Tentative | WhatsApp pricing discussion |
| ERP agent | Actor/system role | “ERP agent”; “ERP Price Maintenance Agent” | Downstream actor that reviews or changes financial records | Agent/system reference | ERP workflow | Non-temporal role | Entered | Explicit | Credit-note task prompt |
| Pricing Desk | Actor/domain service concept | “commercial decision engine” | Capability responsible for commercial recommendations and decisions | Service/role concept | Pricing decision domain | Non-temporal doctrine | Commercial decision | Explicit | Architecture discussion |
| Proforma Invoice Agent | Actor/system role | \`proforma_invoice_agent\` | Execution capability that generates customer-facing documents using approved prices | Agent/service reference | Commercial-document workflow | Non-temporal role | Entered | Explicit | Fabers, WOR001 and other proforma discussions |
| Supplier | Entity; actor | Oryx | Party publishing LPG costs or movements | Business entity/reference | Supplier-cost relationship | Non-temporal identity | Observed/imported | Explicit | Supplier movement and cost-schedule discussion |

## 2. Customer and commercial-relationship concepts

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Customer status | State/status | Allan: “Active” | Operational state of the customer relationship | Enum | Customer relationship | Temporal | Entered/derived | Explicit | Allan commercial record |
| Customer classification | State/status; commercial observation | “Relationship / Retention Risk”; “Wholesale / Retention / Volume Recovery”; “Commodity / Local Trade”; “Volume Account”; “Transactional” | Descriptive classification used as an input to commercial judgement | Controlled taxonomy, possibly multi-valued | Customer relationship | Temporal | Observed/derived | Explicit examples; taxonomy tentative | Architecture discussion |
| Pricing posture | Commercial decision; state/status | \`retention\`, \`margin_first\`, \`volume_push\`, \`commodity_trade\`, \`strategic_account\` | Governed commercial stance applied when making a pricing decision | Enum/reference | Pricing decision or customer pricing episode | Temporal | Entered/approved/derived | Explicit concept; individual assignments vary | Pricing-posture discussion |
| Retention posture assignment | Commercial decision; relationship | Allan: “Retention” | Decision to prioritize continuity of an existing relationship | Posture reference | Customer pricing episode | Temporal | Commercial decision | Explicit | Allan pricing record |
| Customer value proposition | Observation; commercial rationale | “inclusive of VAT”; “delivered”; focus on full delivered value | Commercial basis communicated to the customer | Structured text/tags | Customer offer or price communication | Temporal to an offer | Entered/observed | Strongly inferred | Allan WhatsApp exchange |
| Customer price misunderstanding | Event; observation | Allan believed price was excluding VAT, then apologized after clarification | Customer interpreted the VAT basis incorrectly and later corrected that understanding | Event/narrative | Customer communication | Temporal | Observed | Explicit | Allan WhatsApp screenshot discussion |
| Pricing concern resolved | State transition/event | Conversation returned to a positive footing after VAT clarification | Outcome of a price clarification | Enum/event | Customer interaction | Temporal | Derived | Strongly inferred | Allan exchange |
| Retention risk | Observation/state | Allan compared pricing with another supplier | Evidence of possible price sensitivity or churn risk | Enum/risk assessment | Customer relationship | Temporal | Observed/derived | Strongly inferred | Allan discussion |
| Delivery mode | Attribute; commercial term | “delivered” | Whether the price includes delivery rather than collection | Enum | Customer price/offer/order | Temporal to transaction or agreement | Entered | Explicit | Allan historical price |
| Delivery address | Attribute | “Cinderella Park” | Destination associated with an order or customer | Address/string | Delivery/order; possibly customer | Can change | Entered | Explicit | Works On Site proforma |
| Payment reference | External reference/identifier | \`WOR001\`; earlier proforma used \`FAM005\` | Reference required when paying a commercial document | String | Commercial document/payment instruction | Temporal per document | Derived/entered | Explicit | WOR001 proforma history |
| Payment terms | Attribute | “Cash on Delivery” for Obsa | Terms governing when payment is due | Enum/text | Commercial document/order | Temporal | Entered | Explicit | Proforma inventory |
| Banking details | Attribute; sensitive operational reference | Gaz Express FNB account shown in proforma | Recipient account for settlement | Structured financial details | Issuer/payment instruction | Effective-dated | Entered/imported | Explicit | Edited Works On Site proforma |

## 3. Products, cylinder forms and quantities

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Product | Entity/concept | LPG | Commercial product being supplied | Product reference | Order/price | Non-temporal identity | Entered | Explicit | Multiple records |
| LPG refill line | Entity/relationship | “48kg LPG Refill”; “19kg LPG Refill” | Sale of LPG associated with a cylinder size, excluding deposits unless separately stated | Line-item concept | Quote/invoice/order | Temporal per transaction | Entered | Explicit | Proformas and quotes |
| Cylinder size | Attribute/reference | 9kg, 14kg, 19kg, 48kg | Nominal LPG mass associated with a cylinder product | Decimal mass + unit | Product variant/order line | Generally non-temporal | Entered/reference | Explicit | Quotes and proformas |
| Cylinder type | Attribute/reference | \`SV\`, \`DV\`, “48kg SV” | Cylinder-valve or product variant; exact expansion is not supplied | Enum/string | Product variant/order line | Non-temporal or effective-dated catalog value | Entered | Explicit value; meaning tentative | WOR001 orders and proformas |
| Ordered quantity | Attribute | \`60 × 9kg\`, \`8 × 19kg\`, \`15 × 48kg\`; WOR001 \`8 × SV\`, \`10 × 19\` | Count of cylinders requested on an order or quote line | Integer | Order/quote line | Temporal per request | Entered | Explicit | Fabers and WOR001 requests |
| Total cylinder count | Calculated/derived value | WOR001 quote: 8 + 10 = 18 | Sum of line quantities | Integer | Quote/order | Temporal snapshot | Calculated | Explicitly calculated | WOR001 quote |
| Total LPG mass | Calculated/derived value | WOR001: \`8×48 + 10×19 = 574kg\`; initial order \`10×48 = 480kg\` | Sum of quantity multiplied by nominal cylinder mass | Decimal mass | Quote/order | Temporal snapshot | Calculated | Explicit | WOR001 records |
| Cylinder exchange condition | Business rule/commercial term | “Subject to cylinder exchange policy”; foreign-cylinder deposit difference | Refill pricing may depend on eligible cylinder exchange | Rule/reference | Order/quote line | Temporal to transaction/policy | Entered | Explicit | Proforma notes and LIN001 |
| Cylinder deposit | Entity/value | “temporary 48kg deposit difference”; “do not include cylinder deposits” in credit review | Financial amount separate from LPG refill pricing | Money | Deposit transaction/order line | Temporal | Entered/calculated | Explicit | LIN001 and ERP credit prompt |
| Non-LPG item | Concept/classification | Exclude non-LPG items unless instructed | Invoice line not part of the price-credit exercise | Product/line category | Invoice line | Non-temporal classification | Derived/reference | Explicit | ERP review prompt |

## 4. Customer-price history and commercial decisions

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Customer price agreement | Entity; commercial decision; relationship | Allan locked at historical price; WOR001 August price | Approved commercial price applicable to a customer under stated conditions | Effective-dated commercial record | Customer/product/terms relationship | Temporal | Approved/entered | Explicit | Allan and WOR001 discussions |
| Approved unit price | Attribute/value; commercial decision | Allan: R1,517.95 per 48kg; WOR001 earlier R1,320 per 48kg | Approved monetary price for one product unit | Decimal money + currency + VAT basis | Customer price agreement | Temporal | Entered/approved | Explicit | Proformas and pricing records |
| Approved per-kilogram price | Attribute/value; commercial decision | Allan approximately R31.62/kg incl.; R27.50/kg excl.; WOR001 R23.16/kg with VAT basis unresolved | Approved or stated LPG price per kilogram | Decimal money per mass | Customer price agreement | Temporal | Entered or derived | Explicit values; authority differs | Pricing records |
| VAT basis | Attribute/commercial term | “inclusive of VAT”, “excl. VAT”; WOR001 August basis not specified | Indicates whether a price includes statutory VAT | Enum | Price/amount | Temporal to price | Entered | Explicit where stated; unresolved for WOR001 August | Allan and WOR001 |
| Delivery inclusion | Attribute/commercial term | Allan: R1,517.95 “delivered” | Whether delivery is included in the quoted price | Boolean/enum | Customer price agreement | Temporal | Entered | Explicit | Allan |
| Price effective date/period | Attribute | Allan historical agreement active from at least May 2026; WOR001 “August 2026” | Start or period for which a customer price applies | Date/month/range | Customer price agreement | Temporal | Entered/inferred | Mixed | Allan ERP review; WOR001 PDR |
| Price end date | Attribute | Not provided; Allan remains in force until review trigger | Date when an agreement ceases to apply | Nullable date/event reference | Customer price agreement | Temporal | Derived from future event | Strongly inferred | Price-continuity rule |
| Price status | State/status | “Current”; “Current (Approved)”; “No review required” | Operational standing of a customer price | Enum | Customer price agreement | Temporal | Derived/approved | Explicit | Allan record |
| Historical approved price | State/status; commercial fact | Allan’s R1,517.95 per 48kg | Previously agreed price that remains operative despite later analytical recommendations | Effective-dated price record | Customer price agreement | Temporal | Approved/observed | Explicit | Allan correction |
| Recommended price | Calculated/derived value; commercial recommendation | Allan: R29/kg incl., later rejected as current price | Non-binding price proposed by Pricing Desk | Money per kg/unit | Pricing recommendation | Temporal | Derived/recommended | Explicit but superseded for Allan | Earlier Allan analysis |
| Minimum price | Commercial decision/value | Example decision record: R28.50 incl. | Lower commercial boundary for a particular decision | Money | Pricing decision | Temporal | Approved/entered | Tentative example only | Illustrative YAML |
| Price continuity decision | Event; commercial decision | Continue Allan’s historical price; absorb June and July movement | Decision not to adjust the customer price | Event with rationale | Customer price agreement | Temporal | Approved | Explicit | Allan discussion |
| Price adjustment | Event | WOR001: \`R27.00 − R3.84 = R23.16/kg\` | Change from one price to a new price | Event with before/change/after | Customer price agreement | Temporal | Entered/calculated | Explicit calculation; basis ambiguous | WOR001 August update |
| Previous reference price | Attribute/value | WOR001 R27.00/kg | Price used as the basis for an adjustment; not necessarily identical to the earlier approved R27.50/kg record | Money per kg | Price-adjustment event | Temporal | Entered | Explicit | WOR001 August update |
| Price decrease amount | Attribute/event value | WOR001: R3.84/kg | Magnitude of the customer-price reduction | Decimal money/kg | Price-adjustment event | Temporal | Entered | Explicit | WOR001 message |
| Resulting customer price | Calculated value/commercial decision | WOR001: R23.16/kg | Arithmetic result of prior price less decrease | Decimal money/kg | Price-adjustment event/agreement | Temporal | Calculated, then proposed as record | Explicit | WOR001 update |
| Pricing-decision rationale | Attribute | Retention, continuity, cost movements absorbed | Explanation supporting a recommendation or decision | Structured text/reason codes | Pricing decision | Temporal | Entered/derived | Explicit | Allan record |
| Pricing-decision approver | Relationship/actor | \`approved_by: Commercial Owner\` | Person or role authorizing a price | Actor reference | Pricing decision | Temporal | Entered | Tentative because shown as proposed example | Decision-record proposal |
| Pricing-decision record | Candidate entity; external evidence artifact | \`pricing_decision_record.md\` example | Durable record explaining why a price was recommended or approved | Structured record | Pricing governance | Temporal | Entered/derived | Tentative/proposed | Architecture discussion |

### Important evidence conflict: WOR001 price history

The evidence contains three distinct WOR001 price observations:

| Observation | Classification | Status |
|---|---|---|
| R27.50/kg incl. VAT, yielding R1,320 per 48kg | Historical approved-price evidence | Explicit in the earlier proforma |
| R27.00/kg previous reference | Input to the August adjustment | Explicit, but its relationship to R27.50 is unexplained |
| R23.16/kg for August after a R3.84 decrease | New price calculation/decision | Explicit arithmetic; VAT basis unresolved |

These must remain separate temporal records. The evidence does **not** justify silently replacing R27.50 with R27.00 or treating them as equivalent.

## 5. Supplier costs and movements

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Supplier cost observation | Entity/event | Oryx posted cost; monthly movement values | Published supplier-side commercial input | Effective-dated cost observation | Supplier/product relationship | Temporal | Imported/observed | Explicit concept | Cost-schedule discussion |
| Posted supplier cost | Attribute/value | May figure discussed as approximately R24.51133/kg ex VAT; other supplier figures elsewhere | Supplier’s base LPG charge before rebates | Decimal money/kg | Supplier cost observation | Temporal | Imported/observed | Tentative for May value | Movement analysis |
| Supplier cost movement | Event/value | June \`-0.12953/kg\`; July \`+0.12481/kg\` | Period-on-period supplier cost change | Signed decimal money/kg | Supplier cost schedule | Temporal | Imported/observed | Explicit values; semantic basis requires verification | Movement table discussion |
| Cost movement period | Attribute | February–July 2026 | Month associated with a supplier movement | Year-month | Supplier cost movement | Temporal | Imported | Explicit | Movement image transcription |
| Movement direction | Derived state | decrease/increase | Sign-derived characterization of a movement | Enum | Supplier cost movement | Temporal | Calculated | Explicitly derived | June and July discussion |
| Net supplier movement | Calculated value | June + July = \`-R0.00472/kg\` | Cumulative signed change across selected periods | Decimal money/kg | Cost-movement series | Temporal snapshot | Calculated | Explicit | Allan record |
| Movement basis | Attribute/ambiguity | Incremental monthly movement versus cumulative index | Meaning of the supplier’s movement column | Enum/definition | Supplier cost schedule | Non-temporal definition or versioned methodology | Requires validation | Tentative | Explicit open question |
| Rebate | Commercial value/rule | Firm and conditional rebates referenced in cost governance | Supplier concession applied to posted cost | Money/kg plus conditions | Supplier agreement/cost observation | Temporal | Imported/derived | Explicit concept; not quantified in this evidence segment | Architecture discussion |
| Guaranteed/effective cost | Calculated/derived value | Governed cost basis intended for Pricing Desk | Supplier cost after applicable governed adjustments | Money/kg | Cost schedule | Temporal | Calculated/approved | Strongly inferred | Cost-governance discussion |
| Cost absorption | Commercial decision | June and July movements absorbed without changing Allan’s price | Decision not to pass a supplier movement to the customer | Decision/event | Customer pricing decision | Temporal | Commercial decision | Explicit | Allan updated record |
| Supplier movement versus customer price | Business rule/relationship | Supplier costs may move monthly; customer price changes only after justified review | Costs are inputs, not automatic customer-price mutations | Policy/rule | Pricing decision | Temporal evaluation | Derived and explicitly adopted | Explicit | Allan discussion |

## 6. Pricing calculations and reconciliation values

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Unit price from per-kg price | Calculation/derived value | WOR001: \`48 × 23.16 = 1,111.68\`; \`19 × 23.16 = 440.04\` | Converts mass-based price into cylinder-unit price | Decimal money | Quote line | Temporal snapshot | Calculated | Explicit arithmetic | WOR001 quote |
| Line total | Calculation/derived value | \`8 × 1,111.68 = 8,893.44\`; \`10 × 440.04 = 4,400.40\` | Quantity multiplied by approved unit price | Decimal money | Quote/invoice line | Temporal snapshot | Calculated | Explicit | WOR001 quote |
| Document total | Calculation/derived value | WOR001 quote R13,293.84; Fabers proforma R41,329.24 | Sum of commercial-document line totals and adjustments | Decimal money | Quote/proforma | Temporal snapshot | Calculated | Explicit | Generated outputs |
| Per-kg equivalent | Calculation/derived value | Allan: \`1,517.95 ÷ 48 = 31.623958…\` incl.; divided by 1.15 ≈ R27.50 excl. | Normalized unit price for comparison | Decimal money/kg | Price observation | Temporal | Calculated | Explicit, with displayed rounding | Allan |
| VAT amount | Calculation/derived value | Required separately in invoice credit review | Tax component of an amount | Decimal money | Invoice/credit line | Temporal snapshot | Calculated | Explicit | ERP review prompt |
| Excluding-VAT amount | Calculation/derived value | Allan equivalent around R27.50/kg excl. | Net amount derived from VAT-inclusive price | Decimal money | Price/transaction | Temporal snapshot | Calculated | Explicit | Allan |
| Price difference | Calculation/derived value | Invoiced unit price less agreed unit price | Difference used to identify an overcharge | Decimal money/unit | Invoice reconciliation line | Temporal snapshot | Calculated | Explicit | ERP credit prompt |
| Overcharge amount | Calculated value/state | Only where invoiced price exceeds agreed price | Excess charged on a historical invoice | Decimal money | Invoice reconciliation | Temporal | Calculated | Explicit | ERP review prompt |
| Credit amount excluding VAT | Calculated/derived value | Required reconciliation column | Net financial correction for an overcharge | Decimal money | Proposed credit note | Temporal | Calculated | Explicit | ERP review prompt |
| VAT adjustment | Calculated/derived value | Required reconciliation column | Tax correction corresponding to the net credit | Decimal money | Proposed credit note | Temporal | Calculated | Explicit | ERP review prompt |
| Total credit including VAT | Calculated/derived value | Required per invoice and in summary | Gross credit proposed for the customer | Decimal money | Proposed credit note/reconciliation | Temporal | Calculated | Explicit | ERP review prompt |
| Rounding convention | Business rule/ambiguity | Allan displayed R31.62/kg and “≈ R27.50/kg”; quote unit prices shown to cents | Precision and rounding method used in documents | Rule/configuration | Calculation policy | Potentially versioned | Derived; not formally stated | Tentative | Calculations shown |
| Currency | Attribute | Rand symbol \`R\` | Monetary denomination | ISO currency (\`ZAR\`) | Monetary value | Non-temporal | Inferred from notation/context | Strongly inferred | All monetary evidence |

## 7. Orders, quotes, invoices and credit correction

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Order request | Entity/event | Fabers: 60×9, 8×19, 15×48; WOR001: 8×SV, 10×19 | Customer-requested quantity mix | Structured event with lines | Customer transaction | Temporal | Entered | Explicit | User requests |
| Quote | Entity/event | WOR001 quote based on August price | Customer-facing statement of proposed pricing | Document/record | Commercial transaction | Temporal | Generated | Explicit | WOR001 |
| Proforma invoice | Entity/event | Fabers Gas, WOR001, LIN001, Al-Riaz, Obsa | Pre-sale payment/request document that is not necessarily a final tax invoice | Document | Commercial-document domain | Temporal | Generated | Explicit | Proforma inventory |
| Tax/ERP invoice | Entity | “all invoices raised from May to date” | Historical financial transaction recorded in ERP | Financial document | ERP/finance | Temporal | Imported | Explicit | Allan credit review |
| Credit note | Entity/event | “pass a credit”; create credit notes only after approval | Financial correction linked to an invoice | Financial document/event | ERP/finance | Temporal | Generated after approval | Explicit | ERP task prompt |
| Invoice review period | Attribute | 1 May 2026 to the present | Inclusive time window for invoice reconciliation | Date range | Reconciliation case | Temporal | Entered | Explicit | ERP task prompt |
| Invoice number | External reference/identifier | Required output, no examples supplied | ERP identifier for an invoice | String | Invoice | Non-temporal identity | Imported | Explicit | ERP task prompt |
| Invoice date | Attribute | Required output | Date an ERP invoice was raised | Date/time | Invoice | Temporal | Imported | Explicit | ERP task prompt |
| Invoiced unit price | Attribute/value | Required output | Unit price actually charged on an invoice line | Money/unit | Invoice line | Temporal snapshot | Imported | Explicit | ERP task prompt |
| Agreed unit price | Relationship/value | Allan R1,517.95 per 48kg incl. delivered | Customer price that should have governed the invoice | Price-agreement reference or copied snapshot | Reconciliation line | Temporal | Retrieved/derived | Explicit | ERP task prompt |
| Affected invoice state | State/status | Invoice where price charged exceeds agreed price | Eligibility state for corrective review | Boolean/enum | Invoice reconciliation | Temporal | Calculated | Explicit | ERP task prompt |
| Pricing indeterminate state | State/status | “Flag any invoice where pricing cannot be determined” | Review cannot identify the authoritative agreed price | Enum plus reason | Reconciliation line/case | Temporal | Derived | Explicit | ERP task prompt |
| Reconciliation report | Entity/artifact | Required before ERP updates | Evidence report supporting approval of proposed credits | Structured report | Reconciliation case | Temporal | Generated | Explicit | ERP task prompt |
| Reconciliation approval | Event/state | Await commercial approval | Authorization gate before credit creation | Approval event/status | Reconciliation case | Temporal | Entered | Explicit | ERP task prompt |
| Credit execution | Event | Create credit notes in ERP after approval | Financial system mutation implementing approved corrections | Event | Credit-note workflow | Temporal | Executed | Explicit | ERP task prompt |
| Invoice inclusion rule | Business rule | Only LPG refill lines; exclude deposits and non-LPG items unless instructed | Determines which invoice lines enter the correction calculation | Predicate/rule | Reconciliation case | Temporal to task/policy | Entered | Explicit | ERP task prompt |
| Overcharge predicate | Business rule | Include invoices where invoiced price exceeds agreed price | Condition determining whether credit is required | Boolean expression | Reconciliation | Temporal evaluation | Calculated | Explicit | ERP task prompt |
| Reconciliation control | Business rule | Reconcile calculations to original invoices before changes | Financial accuracy and audit requirement | Rule | Reconciliation workflow | Non-temporal policy | Entered | Explicit | ERP task prompt |
| Idempotency/duplicate-credit control | Business rule/ambiguity | Not stated | Need to establish whether earlier credits already exist before creating new ones | Rule/check | Credit workflow | Temporal | Not evidenced | Tentative gap | Absence in prompt |

## 8. Document-generation concepts and states

| Canonical name | Classification | Evidence examples / original terminology | Inferred meaning | Likely type | Owner | Temporal? | Origin | Confidence | Source/evidence |
|---|---|---|---|---|---|---|---|---|---|
| Commercial document status | State/status | “Designed”, “Generated”, “Current”, “Prompt Prepared” | Maturity/execution state of a document request | Enum | Commercial document | Temporal | Derived/entered | Explicit | Proforma inventory |
| Document issue date | Attribute | Fabers: 4 July 2026; Works On Site: 5 June 2026 | Date displayed on the document | Date | Commercial document | Temporal | Entered | Explicit | Proforma requests |
| Document validity period | Attribute/rule | “valid for 7 days unless otherwise advised” | Period during which offered terms remain usable | Duration/date range | Proforma/quote | Temporal | Entered | Explicit | Edited Works On Site proforma |
| Document reference | External reference/identifier | “Proforma – 10 x 48kg SV LPG Cylinders” | Human-readable commercial-document reference | String | Commercial document | Non-temporal identity | Generated/entered | Explicit | Works On Site proforma |
| Document design version | State/status | WOR001 became “V1 design reference” | Approved presentation standard for subsequent proformas | Version/reference | Document template | Temporal/versioned | Commercial decision | Explicit | Proforma inventory |
| Mobile-first presentation | Business rule/attribute | Compact HTML suitable for WhatsApp or screenshots | Required output form and layout constraint | Enum/boolean/design constraint | Document template | Versioned | Entered | Explicit | Proforma discussions |
| Customer-facing information boundary | Business rule | Must not expose supplier costs, rebates, margin, delivery calculations, competitor pricing or commercial posture | Restricts content of outbound documents | Policy/rule | Commercial document | Non-temporal or policy-versioned | Entered | Explicit | Proforma governance |
| Approved-price-only rule | Business rule | Agent must not invent or recalculate prices when approved prices are supplied | Document execution consumes an approved price | Rule | Proforma workflow | Non-temporal/policy-versioned | Entered | Explicit | Fabers request |
| Last-recorded-price fallback | Business rule/event | User instructed Fabers invoice to “Use last recorded price” | Reuse of prior customer prices after explicit authorization | Decision/action rule | Proforma generation | Temporal per instruction | Entered/approved | Explicit | Fabers proforma |
| Total-payable prominence | Business rule/design attribute | Prominent total on mobile document | Presentation priority | Boolean/design rule | Document template | Versioned | Entered | Explicit | WOR001 design standard |
| Stock-availability condition | Commercial term | “Subject to stock availability at time of confirmation” | Supply is conditional until confirmed | Boolean/terms text | Proforma/quote | Temporal | Entered | Explicit | Works On Site proforma |

## 9. Temporal events and state transitions

| Canonical event | Classification | Before | Event / evidence | After | Confidence |
|---|---|---|---|---|---|
| Allan price communicated | Event | No evidenced customer understanding | R1,517.95 per 48kg incl. VAT delivered communicated | Historical customer-price observation exists | Explicit |
| Allan VAT basis clarified | Event | Customer believed price excluded VAT | Seller clarified price was VAT-inclusive | Customer acknowledged misunderstanding | Explicit |
| Allan price recommendation generated | Event/recommendation | Historical price existed | R29/kg incl. retention recommendation proposed | Alternative recommendation existed but was not approved as current | Explicit |
| Allan historical price reaffirmed | Commercial decision/state transition | Recommendation risked being treated as current | User instructed continued use of historical price until Allan asks again | R1,517.95 remains current approved price | Explicit |
| June supplier movement observed | Event | Prior cost basis | \`-R0.12953/kg\` movement | Cost observation changed; customer price did not | Explicit value; movement semantics need verification |
| July supplier movement observed | Event | June-adjusted cost observation | \`+R0.12481/kg\` movement | Net June–July movement \`-R0.00472/kg\` | Explicit |
| Movement absorbed for Allan | Commercial decision | Supplier costs changed | No customer-price adjustment authorized | Historical customer price remains active | Explicit |
| Allan invoice discrepancy identified | Observation/problem state | Invoices raised from May onward | Prices charged allegedly did not match agreed price | Credit reconciliation requested | Explicit claim, not yet validated against invoices |
| Allan credit review requested | Event | Potential overcharging unquantified | ERP review prompt created | Review/recommendation pending | Explicit |
| WOR account code corrected | Event sequence | FAM005, then WOR005 | Corrections entered | WOR001 is current code | Explicit |
| WOR001 August price adjusted | Commercial decision/event | R27.00/kg reference | Decrease of R3.84/kg instructed | R23.16/kg for August, VAT basis unresolved | Explicit |
| WOR001 quote requested | Event | August price record present | 8×48kg SV and 10×19kg requested | Quote calculated at R13,293.84 | Explicit |
| Fabers invoice generated | Event | Order supplied but price missing | User authorized last recorded price | Proforma generated for R41,329.24 | Explicit |
| Proforma design standardized | Decision/state transition | Several ad hoc designs | WOR001 compact mobile layout adopted | WOR001 treated as V1 template/reference | Explicit |

## 10. Business rules emerging directly from the evidence

1. **Customer prices are effective-dated commercial decisions, not automatic mirrors of supplier cost.**  
   Classification: business rule; commercial decision.  
   Evidence: Allan’s June and July supplier movements were absorbed without repricing.

2. **An approved customer price remains operative until a review-trigger event or explicit replacement decision occurs.**  
   Classification: business rule; state transition.  
   Evidence: Allan remains on R1,517.95 until he requests pricing again or another material event is invoked.

3. **A supplier movement is an input to review, not itself a customer-price-change event.**  
   Classification: business rule.  
   Evidence: supplier movement and customer pricing were explicitly distinguished.

4. **Commercial posture precedes or shapes mathematical optimization.**  
   Classification: commercial-decision rule.  
   Evidence: Allan’s retention posture and the wider posture doctrine.

5. **Pricing Desk recommends or records commercial decisions; it does not execute ERP mutations or issue financial corrections.**  
   Classification: domain rule.  
   Evidence: separation between Pricing Desk, skills and execution agents.

6. **Deterministic calculations should be separated from commercial judgement.**  
   Classification: domain doctrine.  
   Evidence: skills calculate; agents exercise judgement.

7. **A proforma must use an approved price or an explicitly authorized previous price and must not invent commercial values.**  
   Classification: execution rule.  
   Evidence: Fabers workflow.

8. **Customer-facing documents must exclude internal costs, margins, rebates, competitor intelligence and internal posture/rationale.**  
   Classification: disclosure rule.

9. **Historical invoice correction requires reconciliation and approval before credit-note creation.**  
   Classification: financial-control rule.

10. **Only applicable LPG refill lines enter Allan’s proposed credit calculation; deposits and non-LPG lines are excluded unless explicitly authorized.**  
    Classification: reconciliation-scope rule.

11. **An account-code correction should preserve prior assignments as history while marking one code as current.**  
    Classification: identity-governance rule.  
    Evidence: Works On Site code sequence.

12. **VAT basis, delivery inclusion, product size/type and effective period are part of the price’s meaning.**  
    Classification: semantic integrity rule.  
    Evidence: Allan’s misunderstanding and WOR001’s unresolved VAT basis.

# Candidate entities

These are evidence-derived candidates, not implementation prescriptions.

| Candidate entity | Supporting evidence | Likely relationships | Boundary ambiguity |
|---|---|---|---|
| Customer | Allan, Fabers Gas, Works On Site | Has accounts, contacts, classifications, orders and pricing agreements | Allan may be a contact rather than the legal customer |
| Customer Account | ERP codes and correction history | Belongs to customer; referenced by ERP documents and payments | Whether account code identity belongs solely in ERP is unresolved |
| Account Identifier Assignment | FAM005 → WOR005 → WOR001 | Links account to effective identifier over time | Could be maintained solely as imported ERP history |
| Customer Relationship | Active status, retention risk, classification | Links customer to commercial observations and posture history | May overlap Customer Intelligence |
| Customer Classification Assessment | Retention risk, volume account, transactional | Informs pricing posture | Evidence does not establish whether classification is single-valued |
| Pricing Posture Assignment | Retention, margin-first, volume-push, etc. | Applies to a customer, account or decision episode | Persistence at customer level versus decision level is unresolved |
| Customer Price Agreement | Allan historical price; WOR001 August price | Links customer, product variant, VAT basis, delivery term and effective period | “Agreed”, “approved”, “quoted” and “current” are not yet formally distinguished |
| Price Recommendation | Allan R29/kg proposal | May lead to approval, rejection or expiry | Earlier responses blurred recommendation and current price |
| Pricing Decision | Continue historical price; absorb movement; change WOR001 price | References posture, rationale and approver | Decision-record governance remains proposed |
| Price Review Trigger | Customer request, material cost change, order/delivery change | Opens review of an active price agreement | Exact trigger thresholds are undefined |
| Supplier | Oryx | Publishes costs and movements | Supplier master ownership is unclear |
| Supplier Cost Observation | Posted cost, movement, rebate facts | Feeds governed cost basis | Movement methodology remains unverified |
| Supplier Cost Movement | June and July values | Relates consecutive supplier-cost periods | Incremental versus cumulative meaning unresolved |
| Product | LPG | Has cylinder/refill variants | Could be catalog-owned outside Pricing Desk |
| Product Variant | 9kg, 19kg, 48kg; SV/DV | Appears on prices and transaction lines | Meaning of SV/DV is not defined in evidence |
| Order Request | Fabers and WOR001 quantity requests | Produces quote/proforma | Order ownership may belong to ERP/order domain |
| Quote | WOR001 customer-facing calculation | Uses approved price; may precede order | Quote and proforma distinction needs governance |
| Proforma Invoice | Fabers, WOR001 and others | Uses approved price and payment instructions | Financial versus commercial-document ownership unclear |
| ERP Invoice | Allan invoices from May onward | Contains invoice lines and may require correction | ERP is the apparent system of record |
| Invoice Line | LPG refill, deposit or non-LPG line | Reconciled against applicable agreement | Product matching rules are not established |
| Reconciliation Case | Review of Allan’s invoices | Aggregates affected invoices and proposed credits | Could belong to Finance rather than Pricing Desk |
| Proposed Credit | Computed correction before approval | Linked to invoice/line and approval | Treatment of prior credits or payments is absent |
| Credit Note | Approved ERP financial correction | Corrects an invoice | Clearly execution/finance-owned |
| Commercial Document Template | WOR001 V1 mobile design | Renders quotes/proformas | Template version governance is only informally established |
| Customer Communication | Allan WhatsApp clarification | Supplies evidence about offer interpretation and acceptance | Whether chat constitutes agreement is unresolved |
| Commercial Evidence Item | Screenshots, user statements, ERP invoices | Supports observations, claims and decisions | Evidence authority hierarchy has not been formalized |

# Candidate bounded contexts

## 1. Customer and Account Identity

**Evidence-supported responsibilities**

- Customer identity
- Account codes
- Account-code corrections and supersession
- Customer status
- Contact and address references

**Ambiguity**

ERP appears authoritative for account identifiers, but Pricing Desk also needs historical identity resolution. It is unclear whether Pricing Desk owns any customer master data or merely consumes it.

## 2. Customer Intelligence

**Evidence-supported responsibilities**

- Customer classification
- Retention or churn observations
- Relationship/value observations
- Price-sensitivity signals
- Customer communication evidence

**Ambiguity**

The line between observed customer facts and commercial posture is not settled. Classification should inform pricing but not itself determine a price.

## 3. Commercial Pricing Governance

**Evidence-supported responsibilities**

- Pricing postures
- Review triggers
- Approval authority
- Customer-price continuity rules
- Disclosure restrictions
- Pricing-decision evidence

**Ambiguity**

Some governance artifacts were proposed rather than proven to exist. Their intended authority is clear, but their formal lifecycle is not.

## 4. Customer Pricing

**Evidence-supported responsibilities**

- Effective-dated price agreements
- Recommendations
- Approval/rejection
- VAT and delivery basis
- Product scope
- Price changes
- Price status and expiry/review conditions

**Ambiguity**

The evidence uses “quoted”, “agreed”, “approved”, “historical” and “current” inconsistently. These may be distinct states or distinct commercial event types.

## 5. Supplier Cost Intelligence

**Evidence-supported responsibilities**

- Posted costs
- Monthly movements
- Rebates
- Effective cost calculations
- Source evidence and confidence

**Ambiguity**

Movement semantics have not been validated. The domain must retain raw supplier observations separately from interpreted or governed costs.

## 6. Pricing Decisioning

**Evidence-supported responsibilities**

- Consume customer classification, posture, cost basis and delivery considerations
- Produce recommendations and rationales
- Record decisions not to change a price
- Distinguish a recommendation from an approval

**Ambiguity**

“Pricing Desk” may be a service spanning governance and decisioning rather than a clean bounded context. The evidence supports its responsibility but not its persistence boundary.

## 7. Commercial Documents

**Evidence-supported responsibilities**

- Quotes and proformas
- Template versions
- Approved-price consumption
- Customer-safe presentation
- Validity, references and payment instructions

**Ambiguity**

Whether quotes and proformas represent the same commercial commitment is unresolved. A proforma may be generated from an order, an approved quote or a direct instruction.

## 8. Orders and Fulfilment Intake

**Evidence-supported responsibilities**

- Requested cylinder quantities
- Product variants
- Total LPG mass
- Delivery address and exchange conditions

**Ambiguity**

The evidence contains order requests but does not establish whether Pricing Desk owns orders, merely evaluates them, or hands them to an operational order domain.

## 9. ERP Billing and Financial Correction

**Evidence-supported responsibilities**

- Final invoices
- Invoice lines
- Credit notes
- VAT correction
- Financial audit trail
- Approval-gated ERP execution

**Ambiguity**

This appears outside Pricing Desk. Pricing Desk may supply the authoritative commercial-price evidence, while ERP/Finance owns reconciliation and credit execution.

## 10. Reconciliation and Commercial Assurance

**Evidence-supported responsibilities**

- Compare historical invoices with effective customer agreements
- Identify overcharges
- Generate proposed credits
- Flag indeterminate pricing
- Reconcile totals before approval

**Ambiguity**

This could be a Finance capability, an ERP workflow or a separate assurance context. The evidence does not justify assigning it permanently to Pricing Desk.

# Unresolved evidence issues

- Allan’s R1,517.95 historical price is well grounded as VAT-inclusive and delivered, but its precise approval/effective date is not supplied.
- The claim that every Allan invoice from May onward used a non-agreed price remains unvalidated until original ERP invoices are inspected.
- June and July supplier movements were recorded, but whether the movement series is incremental or cumulative remains unresolved.
- WOR001 has conflicting historical bases: R27.50/kg incl. VAT and R27.00/kg. Both must be preserved until their relationship is explained.
- WOR001’s R23.16/kg August price has no explicit VAT basis. The generated quote assumed the same customer-facing basis, but that assumption is not governed fact.
- “SV” and “DV” are explicit product terminology, but their formal meanings were not supplied.
- The evidence does not establish whether WhatsApp acknowledgment constitutes formal price acceptance.
- No rule determines how to match an ERP invoice line to the correct historical price when product descriptions, cylinder variants or delivery terms differ.
- Credit handling lacks evidence for prior credit checks, returned goods, cancelled invoices, payments, rounding conventions and duplicate-credit prevention.
- The proposed layer structure—governance, agents, skills and execution—is architectural reasoning from the conversation, not proof of implemented system behavior.
