# Statement of Account

> **INTERNAL DRAFT — DTRX / `transaction_headers` reconstruction.** Not a DEBENQ enquiry. Balance due is **ASSERTED** (sum of ingested header amounts), not **PROVEN** from an ERP `CURRENT BALANCE` header. Do not send to the customer until a DEBENQ TXT lands and this is re-run.

**BELLA ENERGY SERVICES300 (PTY) LTD T/A GAZ EXPRESS**  
50 WINSTON ROAD  
PIETERMARITZBURG  
3201  

---

**To:** JAYZ GRILL  
**Account:** JAY000  
**Trading as:** Jays Grill  
**Statement date:** 08 September 2026  
**Source:** DTRX headers (9 rows) + item lines (10)

---

## Account summary

| | Amount (R) | Epistemic |
| :--- | ---: | :--- |
| **Opening balance** (1 September 2026) | 19,897.64 | ASSERTED — reconstructed running total before 2026-09-01 |
| Movement this month (invoices, credit notes) | -6,037.50 | ASSERTED |
| JAY000 reconstructed header total | 13,860.14 | ASSERTED — Σ DTRX header (excl+tax) |
| **Balance due** | **13,860.14** | ASSERTED — not DEBENQ CURRENT BALANCE |

---

## Aged balance — open invoices

Age is calculated from **invoice date** to 31 August 2026.

| Current | 30 day | 60 day | 90 day | 120+ day | **Subtotal** |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 13,860.14 | 0.00 | 0.00 | 0.00 | 0.00 | **13,860.14** |

---

## Open invoices

Reconstructed from DTRX header `ref_no` tagging (Crd Note → invoice). Screening hypothesis — see tag gate below.

| Inv | Inv date | DN / ref | **Due (R)** |
| :--- | :--- | :--- | ---: |
| 52688 | 18 Aug 2026 | DN#24274 | 12,967.57 |
| 52793 | 25 Aug 2026 | DN#23979 | 892.57 |

---

## Tag coverage

| Field | Value |
| :--- | :--- |
| Gate | **ALLOWED** · PATTERN_ONLY |
| Meaning | No contradiction found: the list ties within the ERP balance and no open invoice is marooned behind a payment gap. This is absence of evidence against the list, not proof it is right — ERP payment tagging is not authoritative (business_rules.md §3). Read it together with evidence.basis: REMITTANCE_BACKED means the customer’s own records were checked too; PATTERN_ONLY means they were not, because none exist, and the claim rests on the payment pattern and business rules instead. |
| Invariant Σ(open) vs reconstructed total | PASS (open 13,860.14 / header 13,860.14) |

No remittance advices on this account — remittance-contradiction check did not run. `ALLOWED` here is absence of contradiction against the reconstructed total, not verification.

---

## DTRX item tagging exceptions

Header `ref_no` and item stock group disagree. Totals still tie; the **which-invoice** split may be wrong. Operator review before customer send.

| CN | Tagged invoice | CN group | Invoice group | CN amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 15594 | 52793 | CYL | LPG | -6,037.50 |

---

## Item sub-ledgers (DTRX lines)

| Lane | Net (R) | Epistemic |
| :--- | ---: | :--- |
| LPG gas | 13,860.14 | ASSERTED — Σ vw/item line_total |
| CYL deposits | 0.00 | ASSERTED — Σ vw/item line_total |
| **1A + 1B** | **13,860.14** | Must equal reconstructed header total |

Mixed header documents (LPG + CYL on one invoice):

| Doc | LPG (R) | CYL (R) | Header total (R) |
| :--- | ---: | ---: | ---: |
| 52688 | 6,930.07 | 6,037.50 | 12,967.57 |

---

## Provenance

| Field | Value |
| :--- | :--- |
| Source kind | `dtrx_headers` |
| Headers | `analysis/debtors/JAY000/data/dtrx_headers.csv` |
| Items | `analysis/debtors/JAY000/data/dtrx_items.csv` |
| As-at | 2026-09-08 |
| Ageing as-at | 2026-08-31 |
| Authority | DTRX headers + items only — DEBENQ TXT **absent** |

*Tripwire:* a DEBENQ / statement TXT for this account reopens the balance. If its `CURRENT BALANCE` ≠ the reconstructed total, this draft is superseded and must not be sent.

