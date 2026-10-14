# MD0003 — customer follow-up list (INTERNAL ONLY, 2026-10-13)

**Not for the customer. No contact text, no outbound action.** This is a working list for a later collections step. It records which MD0003 documents are missing from the customer's own AP ledger and what the ERP says applies cash to them. Nothing here is a ruling; the operator decides whether and how to contact the customer.

**Basis:** documents 43636, 43878, 44872 and 45160 are open in the matcher (`data/projection_matches.json`, PROVEN) and **do not appear** on either customer AP ledger export on file: `raw/Remittances/MD0003_DETAILED_LEDGER.xls` (session 2025-09-08, document dates to 2025-07-31, parsed `data/customer_ap_ledger_2024_2025.csv`) and `raw/Remittances/10.10.2025.pdf` (APVTRN01, session 2025-10-10, to 2025-09-30). Searched by document number in both (PROVEN). I read the absence as "not on the customer's books at those dates" (ASSUMED; the customer may have booked them under another number or after the snapshot).

| Doc | Date | Lane | Amount (R) | Reference (ERP) | Status in matcher | What applies cash to it (ERP allocation detail `raw/Enquiry/DEBENQ_CURRENT.TXT`, ASSERTED) | On a remittance advice? | On customer AP ledger? |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- | :--- | :--- |
| 43636 | 2025-06-05 | LPG | 751.80 | ROSEDALE- DN#12297 | Open (LPG row) | Payment **42858** (2025-12-31) slice R2,016.80, covering this invoice's LPG and CYL rows | No | **No** |
| 43636 | 2025-06-05 | CYL | 1,265.00 | same invoice (2 x 14kg deposit at R632.50) | Open (CYL row; no empties credit issued) | Same 42858 slice R2,016.80 (LPG 751.80 + CYL 1,265.00) | No | **No** |
| 43878 | 2025-06-12 | LPG | 7,511.13 | DN#12385 | Open | Payment **42858** slice R7,511.13 | No | **No** |
| 44872 | 2025-07-16 | LPG | 6,140.31 | DN#12642-ROSEDALE | Open | Payment **42440** (2025-11-28) slice R6,140.31 | No | **No** |
| 45160 | 2025-07-26 | LPG | 3,684.19 | ON:257219 DN20011 | Open | Payment **42440** slice R3,684.19 | No | **No** |
| **Total** | | | **19,352.43** | | | 42858: R9,277.93 (R7,511.13 + R2,016.80); 42440: R9,824.50 | | |

Totals (PROVEN arithmetic on the documents above): 751.80 + 1,265.00 + 7,511.13 + 6,140.31 + 3,684.19 = **R19,352.43** (gas R18,087.43, cylinder deposit R1,265.00).

## Things to know before any contact
- **Cash status is unproven.** Payments 42440 (R47,511.17) and 42858 (R9,730.26) are unallocated in the matcher. ERP slices apply them to these documents, but no remittance advice exists for either payment, so the customer may have intended the cash for other invoices (ASSERTED).
- **Rosedale pattern (ASSUMED, `unverified`):** 43636 and 44872 carry the site name ROSEDALE; other Rosedale deliveries (for example 42318) do appear on the customer ledger, so the pattern is not a rule. Whether Rosedale delivery notes DN#12297 and DN#12642 were received is unknown.
- **Document 43636** has two lanes. The CYL part (R1,265.00) is the only cylinder row on the account that is a plain unreturned deposit; credit notes 13494 and 15422 are separate (analysis §1.5).
- **If the operator approves ruling Q1 in the pack** (`docs/previews/2026-10-13_MD0003_ruling_pack.md`), these four documents leave the open list as settled by 42440 and 42858 and this list loses its collections purpose; the question would then be whether the customer agrees they were settled by that cash.
- **Related, not in scope:** 43387 (R2,577.63) is the reverse case: the customer shows it paid, we list it open (twin of 43319, ruling Q3a).

## Tripwires (reopen this list if)
A remittance advice or ledger naming any of the four documents; an allocation-detail export (request `docs/requests/2026-10-13_md0003_allocation_detail_request.md`) showing different targets for 42440 or 42858; the operator's ruling on Q1; the customer disputing receipt of the delivery notes.

## Sources
`data/projection_matches.json`; `data/customer_ap_ledger_2024_2025.csv`; `raw/Remittances/10.10.2025.pdf`; `raw/Enquiry/DEBENQ_CURRENT.TXT`; `data/v5_projection.json`; analysis `docs/previews/2026-10-13_MD0003_analysis.md` §1.4 and §1.6.
