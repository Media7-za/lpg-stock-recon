# DRAFT — NOT SENT — COF001 payment 35877 (30 Dec 2024, R9,649.56): bank line and receipt

**Status:** draft for the operator. Nothing has been sent to the ERP agent, the bank or the customer.
**Ticket:** Linear ADM-150. **Evidence:** `analysis/debtors/COF001/reports/COF001_ADM-150_35877_Payment_Investigation.md`.
**To (proposed):** ERP agent (FINCON) for items 2 to 4; operator / bank statements for item 1.

---

Hello,

We are reconciling COFFEEBERRY-CASCADES (account COF001). Receipt **35877** dated **30/12/2024** (STAT:110) is **R9,649.56**. The bank line reads "Magtape Credit Coffeeberry Cascades 00039311". Invoice 39311 (23/12/2024, DN#11988) less credit note 11573 comes to R8,390.92. The receipt is R1,258.64 more than that, which is exactly 15% of R8,390.92, so it looks as if VAT was added to an amount that already included VAT.

Please could you confirm:

1. **Bank statement line, 30 Dec 2024:** the amount, the payer name and the reference exactly as the bank shows them. In our bank table this line is still UNMATCHED.
2. **Receipt as captured in FINCON for 35877:** was a remittance or covering email filed with it? If so, which documents does it list, and does it mention VAT?
3. **Customer credit:** has the customer been told about a R1,258.64 credit, or claimed it as a refund or set-off?
4. **Who made the R407.62 reallocation, and when:** FINCON now shows R407.62 of 35877 against invoice 41238 (dated 05/03/2025). That slice first appears in the March 2026 transaction load (`DTRX2603.TXT`). Was it a manual reallocation, and on what date?

We are not asking for the full allocation detail. The database already holds the allocation slices for 35877 (R8,390.92 to 39311, R851.02 to 34831 and R407.62 to 41238). Under our rules (business_rules.md §15), payment allocation backs up other evidence but cannot prove a settlement on its own. ADM-144 recorded the same point.

Thank you.

---

*Operator: before sending, decide whether item 3 goes to the customer. Customer contact is not authorised from the ADM-150 session.*
