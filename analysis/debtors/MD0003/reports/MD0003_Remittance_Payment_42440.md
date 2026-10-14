# MD0003 — Remittance Cross-Check: Payment 42440 (STAT 121 / 28-Nov-2025 post)

**Source:** COD Remittance Advice dated **29/11/2025**, reference `000000000110925396`
**File:** `raw/Remittances/29.11.2025.pdf`
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003) — payee GAZ EXPRESS, account GAZ001
**ERP payment:** 42440, posted 28/11/2025, R47,511.17 (`raw/Enquiry/MD0003_2026-10-14.TXT`, allocation detail included)

---

## 1. Summary

| Field | Remittance | ERP payment 42440 |
| :--- | ---: | ---: |
| Total | **R47,511.17** | **R47,511.17** |
| Invoices listed (gross) | R55,388.67 | R47,511.17 (13 slices, all invoice refs or blank) |
| Credit notes deducted | −R7,877.50 (CN 11444 −4,830.00; CN 13494 −3,047.50) | none applied as slices |
| Blank-reference slices | — | R4,039.36 |

**Verdict:** the **total agrees**. The **invoice allocation does not**. R21,670.39 sits on different documents in the ERP than the remittance shows, and the two credit notes are treated differently.

---

## 2. Line-by-line

| Remittance doc | Remittance amount | ERP slice on 42440 | Difference | Status |
| :--- | ---: | ---: | ---: | :--- |
| 38939 | 13,758.14 | — | 13,758.14 | ✗ not applied on 42440 (see §3.3) |
| 43319 | 2,577.63 | — | 2,577.63 | ✗ ERP applies it to **42051** (see §3.1) |
| 43636 | 2,016.80 | — | 2,016.80 | ✗ ERP applies it to **42858** (see §3.2) |
| 43878 | 7,511.13 | — | 7,511.13 | ✗ ERP applies it to **42858** (see §3.2) |
| 44872 | 6,140.31 | 6,140.31 | 0.00 | ✓ |
| 45160 | 3,684.19 | 3,684.19 | 0.00 | ✓ |
| 45160A | 3,684.19 | — | 3,684.19 | ✗ no such doc in FINCON (see §3.4) |
| 46861 | 3,432.06 | 3,432.06 | 0.00 | ✓ |
| 47094 | 3,432.06 | 3,432.06 | 0.00 | ✓ |
| 47101 | 5,720.10 | 5,720.10 | 0.00 | ✓ |
| 47333 | 3,432.06 | 3,432.06 | 0.00 | ✓ |
| CN 11444 | −4,830.00 | — | −4,830.00 | ✗ not found in any FINCON file (see §3.5) |
| CN 13494 | −3,047.50 | — | −3,047.50 | ✗ ERP has this CN against 46445 (see §3.6) |

**ERP slices on 42440 that the remittance does not list:**

| ERP slice | Amount | Notes |
| :--- | ---: | :--- |
| 47558 | 3,360.06 | not on remittance |
| 47622 | 2,240.04 | not on remittance |
| 47827 | 5,600.10 | not on remittance |
| 47828 | 3,360.06 | not on remittance |
| 48372 | 3,070.77 | partial; invoice is 5,630.46 in FINCON; not on remittance |
| blank ref | 1,787.18 | unallocated slice |
| blank ref | 2,252.18 | unallocated slice |
| **Total** | **21,670.39** | equals the remittance items not matched above (net of CNs) |

---

## 3. Findings

**3.1 Invoice 43319 (R2,577.63) — probably on the wrong payment.**
The 1 Nov remittance (payment 42051) did not list 43319. FINCON nevertheless applies R2,577.63 of 42051 to 43319. This remittance lists 43319 under 42440. That points to the 42051 slice being wrong, not 42440. Confirm with FINCON.

**3.2 Invoices 43636 (R2,016.80) and 43878 (R7,511.13) — applied to payment 42858 instead.**
Both are on payment 42858 (31/12/2025, R9,730.26) in FINCON. This remittance lists them under 42440. No 31/12/2025 remittance is in the folder, so 42858 cannot be checked here. Confirm which payment the customer meant.

**3.3 Invoice 38939 (R13,758.14) — already applied in February.**
FINCON shows 38939 as an INVNO on payment 37144 (3/02/2025, STAT:112). This remittance lists 38939 again. Either it is an old invoice that was settled in February, or the remittance is wrong. Not resolved.

**3.4 "45160A" (R3,684.19) — no such document.**
The remittance lists 45160 twice, with the same amount. FINCON has one invoice, 45160 (R3,684.19), and it is already allocated. The second line is either a duplicate on the remittance or a document that is not in FINCON. Not resolved.

**3.5 Credit note 11444 (−R4,830.00) — not found.**
It is not in the statement export, the raw TXT files or the allocation CSVs. Possibly a typo on the remittance, or a credit note outside the statement window. Not resolved.

**3.6 Credit note 13494 (−R3,047.50) — applied in two places.**
FINCON already has CN 13494 against invoice 46445 (17/09/2025), the cylinder posting gap (MD3-CYL-001). The remittance deducts the same CN from this payment. FINCON applies no CN slice on 42440, so the payment covers gross invoices only. The net total agrees, but how the credit is treated differs. Operator ruling needed.

**3.7 Unallocated slices.** The two blank-reference slices (R1,787.18 and R2,252.18, total R4,039.36) show money held on 42440 without an invoice.

**3.8 Invoice 48372 (R3,070.77) — partial.**
FINCON applies part of invoice 48372 (R5,630.46). The remittance does not list it.

---

## 4. Net effect if the remittance is correct

If the remittance is the customer's intent, the ERP would need to move R21,670.39 of slices on 42440 onto the remittance invoices, and the two credit notes need treating consistently. Items 3.1 and 3.2 also imply corrections on 42051 and 42858. None of this is applied here. Corrections are for the ERP operator and the operator's ruling.

---

## 5. Open questions for the operator

1. Confirm 43319 belongs to 42440, and remove it from 42051.
2. Confirm 43636 and 43878 belong to 42440, and remove them from 42858.
3. Is 38939 still open? If it was settled in February, the remittance line needs a note.
4. Is "45160A" a duplicate line on the remittance?
5. Does CN 11444 exist in FINCON? If not, the remittance line is wrong.
6. Should CN 13494 be applied to 42440 (remittance treatment) or left on 46445 (current FINCON treatment)?
