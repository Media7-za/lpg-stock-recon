# TWK002 — Phantom CN nets breakdown (+R9,894.01)

**Bridge line:** Path B phantom journal nets (invno refs without Invoice row in Mar 2025+ export)
**Generated:** 2026-08-11
**Source:** `DEBENQ_TWK002.TXT` journal rows · remittance batches · DB line detail (`vw_clean_transactions`)

> These journals carry an `INVNO` pointing at a **payment receipt number**, not a billable invoice in the current export window. The tables below show the **underlying remittance batch documents** each payment ref settled.

---

## Summary

| Group | Journal(s) | Posted | Net (R) | Phantom invno refs |
| :--- | :--- | :--- | ---: | :--- |
| 2023 payment correction | 00000490 | 2026-07-12 | 4019.12 | 22182, 23115, 23836, 24560, 25906, 26681 |
| 2025 Mar discount mirror pairs | 00000494, 00000495, 00000496 | 2025-03-01 | 2299.40 | 31558, 32332, 33224 |
| 2026 Mar FIX | 00000492, 00000493 | 2026-03-01 | 3575.49 | 29684 |
| 2026 Aug discount hygiene | 00000503, 00000504, 00000505, 00000506 | 2026-08-09 | 0.00 | 35263, 30419, 33921, 34518 |
| **Total phantom CN nets** | | | **9894.01** | |

Paired untagged journal **00000491** (−R3,329.12) is **not** in this line — it sits in Untagged settlements. Net 2023 correction pair: +R4,019.12 − R3,329.12 = **+R690.00**.

---

## 2023 payment correction — journal 00000490

**Posted:** 2026-07-12 &nbsp;|&nbsp; **Group net:** R4019.12

### Journal postings (ERP export)

| Date | Journal | INVNO ref | Description | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 12 Jul 2026 | 490 | 22182 |  | 1160.62 |
| 12 Jul 2026 | 490 | 23115 |  | 203.65 |
| 12 Jul 2026 | 490 | 23836 |  | 814.22 |
| 12 Jul 2026 | 490 | 24560 |  | 367.10 |
| 12 Jul 2026 | 490 | 25906 |  | 426.60 |
| 12 Jul 2026 | 490 | 26681 |  | 1046.93 |
| | | | **Net** | **4019.12** |

### Payment ref **22182** — BATCH-2023-06-26 (STAT:92)

Remittance: `raw/Remittances/26.06.2023.pdf` · paid 2023-06-26 · cash **R45,264.25**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 28/04/2023 | Invoice | 19704 | 0 | 0 | 0 | 0 | 0 |
| 28/04/2023 | Invoice | 19706 | 0 | 0 | +15 | 0 | +4 |
| 29/04/2023 | Invoice | 19768 | 0 | 0 | 0 | 0 | 0 |
| 29/04/2023 | Invoice | 19769 | +6 | +15 | 0 | 0 | 0 |
| 24/05/2023 | Invoice | 20606 | 0 | 0 | 0 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 28/04/2023 | Invoice | 19704 | 9509.10 | 0.00 | 9509.10 | 9271.37 | 237.73 |
| 28/04/2023 | Invoice | 19706 | 0.00 | 11362.00 | 11362.00 | 11077.95 | 284.05 |
| 29/04/2023 | Invoice | 19768 | 10726.82 | 0.00 | 10726.82 | 10458.65 | 268.17 |
| 29/04/2023 | Invoice | 19769 | 0.00 | 12558.00 | 12558.00 | 12244.05 | 313.95 |
| 24/05/2023 | Invoice | 20606 | 2268.95 | 0.00 | 2268.95 | 2212.23 | 56.72 |
| | | **Batch subtotal** | **22504.87** | **23920.00** | | **45264.25** | |

*Payment 22182 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **23115** — BATCH-2023-07-26 (STAT 92)

Remittance: `raw/Remittances/26.07.2023.pdf` · paid 2023-07-26 · cash **R7,942.14**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 08/06/2023 | Invoice | 21122 | 0 | 0 | 0 | 0 | 0 |
| 23/06/2023 | Invoice | 21594 | 0 | 0 | 0 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 08/06/2023 | Invoice | 21122 | 3491.05 | 0.00 | 3491.05 | 3403.77 | 87.28 |
| 23/06/2023 | Invoice | 21594 | 4654.74 | 0.00 | 4654.74 | 4538.37 | 116.37 |
| | | **Batch subtotal** | **8145.79** | **0.00** | | **7942.14** | |

*Payment 23115 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **23836** — BATCH-2023-08-28 (STAT 93)

Remittance: `raw/Remittances/28.08.2023.pdf` · paid 2023-08-28 · cash **R26,924.19**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 24/05/2023 | Invoice | 20607 | 0 | 0 | +10 | 0 | 0 |
| 08/06/2023 | Invoice | 21123 | 0 | 0 | +15 | 0 | 0 |
| 23/06/2023 | Invoice | 21597 | 0 | 0 | +20 | 0 | 0 |
| 06/07/2023 | Invoice | 22058 | +5 | +5 | +10 | 0 | +1 |
| 06/07/2023 | Invoice | 22060 | 0 | 0 | 0 | 0 | 0 |
| 12/07/2023 | Invoice | 22255 | 0 | 0 | 0 | 0 | 0 |
| 12/07/2023 | Invoice | 22268 | 0 | +5 | +15 | 0 | 0 |
| 20/07/2023 | Crd Note | 5038 | 0 | -1 | -8 | 0 | 0 |
| 20/07/2023 | Crd Note | 5308 | -1 | -3 | -15 | 0 | 0 |
| 20/07/2023 | Crd Note | 5498 | 0 | 0 | -20 | 0 | 0 |
| 21/07/2023 | Invoice | 22626 | 0 | 0 | 0 | 0 | 0 |
| 21/07/2023 | Invoice | 22627 | 0 | +10 | +20 | 0 | 0 |
| 24/07/2023 | Invoice | 22702 | 0 | 0 | 0 | 0 | 0 |
| 24/07/2023 | Invoice | 22739 | 0 | +5 | 0 | 0 | 0 |
| 26/07/2023 | Crd Note | 5603 | -3 | -11 | -8 | 0 | 0 |
| 31/07/2023 | Crd Note | 5155 | 0 | -2 | -13 | 0 | 0 |
| 02/08/2023 | Crd Note | 5443 | -2 | -6 | -10 | 0 | 0 |
| 04/08/2023 | Crd Note | 5632 | 0 | 0 | -6 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 24/05/2023 | Invoice | 20607 | 0.00 | 3450.00 | 3450.00 | 3450.00 | 0.00 |
| 08/06/2023 | Invoice | 21123 | 0.00 | 5175.00 | 5175.00 | 5175.00 | 0.00 |
| 23/06/2023 | Invoice | 21597 | 0.00 | 6900.00 | 6900.00 | 6727.50 | 172.50 |
| 06/07/2023 | Invoice | 22058 | 0.00 | 7245.00 | 7245.00 | 7063.87 | 181.13 |
| 06/07/2023 | Invoice | 22060 | 7059.90 | 0.00 | 7059.90 | 6883.40 | 176.50 |
| 12/07/2023 | Invoice | 22255 | 5359.00 | 0.00 | 5359.00 | 5225.02 | 133.98 |
| 12/07/2023 | Invoice | 22268 | 0.00 | 6900.00 | 6900.00 | 6727.50 | 172.50 |
| 20/07/2023 | Crd Note | 5038 | 0.00 | -3105.00 | -3105.00 | -3027.37 | -77.63 |
| 20/07/2023 | Crd Note | 5308 | 0.00 | -6555.00 | -6555.00 | -6391.12 | -163.88 |
| 20/07/2023 | Crd Note | 5498 | 0.00 | -6900.00 | -6900.00 | -6727.50 | -172.50 |
| 21/07/2023 | Invoice | 22626 | 8621.01 | 0.00 | 8621.01 | 8405.48 | 215.53 |
| 21/07/2023 | Invoice | 22627 | 0.00 | 10350.00 | 10350.00 | 10091.25 | 258.75 |
| 24/07/2023 | Invoice | 22702 | 2213.50 | 0.00 | 2213.50 | 2158.16 | 55.34 |
| 24/07/2023 | Invoice | 22739 | 0.00 | 1725.00 | 1725.00 | 1681.87 | 43.13 |
| 26/07/2023 | Crd Note | 5603 | 0.00 | -7590.00 | -7590.00 | -7400.25 | -189.75 |
| 31/07/2023 | Crd Note | 5155 | 0.00 | -5175.00 | -5175.00 | -5045.62 | -129.38 |
| 02/08/2023 | Crd Note | 5443 | 0.00 | -6210.00 | -6210.00 | -6054.75 | -155.25 |
| 04/08/2023 | Crd Note | 5632 | 0.00 | -2070.00 | -2070.00 | -2018.25 | -51.75 |
| | | **Batch subtotal** | **23253.41** | **4140.00** | | **26924.19** | |

*Payment 23836 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **24560** — BATCH-2023-09-26 (STAT 94)

Remittance: `raw/Remittances/26.09.2023.pdf` · paid 2023-09-26 · cash **R14,317.17**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/08/2023 | Invoice | 23075 | 0 | 0 | 0 | 0 | 0 |
| 03/08/2023 | Invoice | 23077 | 0 | 0 | +20 | 0 | 0 |
| 08/08/2023 | Crd Note | 5768 | 0 | -1 | -13 | 0 | 0 |
| 10/08/2023 | Invoice | 23311 | 0 | 0 | 0 | 0 | 0 |
| 10/08/2023 | Invoice | 23312 | 0 | +5 | +15 | 0 | +2 |
| 14/08/2023 | Crd Note | 5845 | 0 | -3 | -11 | 0 | -2 |
| 14/08/2023 | Crd Note | 58455875 | 0 | 0 | 0 | 0 | 0 |
| 16/08/2023 | Crd Note | 5875 | 0 | 0 | 0 | 0 | 0 |
| 31/08/2023 | Invoice | 23 | 0 | 0 | 0 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/08/2023 | Invoice | 23075 | 3943.81 | 0.00 | 3943.81 | 3508.84 | 89.97 |
| 03/08/2023 | Invoice | 23077 | 0.00 | 6900.00 | 6900.00 | 6727.50 | 172.50 |
| 08/08/2023 | Crd Note | 5768 | 0.00 | -4830.00 | -4830.00 | -4709.25 | -120.75 |
| 10/08/2023 | Invoice | 23311 | 7142.65 | 0.00 | 7142.65 | 6964.08 | 178.57 |
| 10/08/2023 | Invoice | 23312 | 0.00 | 7590.00 | 7590.00 | 7400.25 | 189.75 |
| 14/08/2023 | Crd Note | 5845 | 0.00 | -5520.00 | -5520.00 | -5045.62 | -129.38 |
| 14/08/2023 | Crd Note | 58455875 | 0.00 | 0.00 | -197.17 | -192.24 | -4.93 |
| 16/08/2023 | Crd Note | 5875 | -197.19 | 0.00 | -197.19 | -336.37 | -8.63 |
| 31/08/2023 | Invoice | 23 | 0.00 | 0.00 | -0.02 | -0.02 | 0.00 |
| | | **Batch subtotal** | **10889.27** | **4140.00** | | **14317.17** | |

*Payment 24560 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **25906** — BATCH-2023-10-26 (STAT 95)

Remittance: `raw/Remittances/26.10.2023.pdf` · paid 2023-10-26 · cash **R16,637.78**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 01/09/2023 | Invoice | 24011 | 0 | 0 | 0 | 0 | 0 |
| 01/09/2023 | Invoice | 24012 | 0 | +10 | +20 | 0 | 0 |
| 06/09/2023 | Invoice | 24201 | 0 | 0 | 0 | 0 | 0 |
| 06/09/2023 | Invoice | 24202 | 0 | +10 | +20 | 0 | 0 |
| 02/10/2023 | Invoice | 25043 | +2 | +5 | +25 | 0 | 0 |
| 11/10/2023 | Crd Note | 6078 | 0 | -10 | -20 | 0 | 0 |
| 11/10/2023 | Crd Note | 6134 | -1 | -5 | -14 | 0 | 0 |
| 11/10/2023 | Crd Note | 6387 | -2 | -5 | -25 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 01/09/2023 | Invoice | 24011 | 8532.19 | 0.00 | 8532.19 | 4955.14 | 127.05 |
| 01/09/2023 | Invoice | 24012 | 0.00 | 10350.00 | 10350.00 | 10091.25 | 258.75 |
| 06/09/2023 | Invoice | 24201 | 8532.19 | 0.00 | 8532.19 | 8318.89 | 213.30 |
| 06/09/2023 | Invoice | 24202 | 0.00 | 10350.00 | 10350.00 | 10091.25 | 258.75 |
| 02/10/2023 | Invoice | 25043 | 0.00 | 11040.00 | 11040.00 | 10764.00 | 276.00 |
| 11/10/2023 | Crd Note | 6078 | 0.00 | -10350.00 | -10350.00 | -10091.25 | -258.75 |
| 11/10/2023 | Crd Note | 6134 | 0.00 | -6900.00 | -6900.00 | -6727.50 | -172.50 |
| 11/10/2023 | Crd Note | 6387 | 0.00 | -11040.00 | -11040.00 | -10764.00 | -276.00 |
| | | **Batch subtotal** | **17064.38** | **3450.00** | | **16637.78** | |

*Payment 25906 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **26681** — BATCH-2023-11-27 (STAT 96)

Remittance: `raw/Remittances/27.11.2023.pdf` · paid 2023-11-27 · cash **R30,825.36**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 01/09/2023 | Invoice | 24011 | 0 | 0 | 0 | 0 | 0 |
| 02/10/2023 | Invoice | 25042 | 0 | 0 | 0 | 0 | 0 |
| 09/10/2023 | Invoice | 25293 | 0 | 0 | 0 | 0 | 0 |
| 09/10/2023 | Invoice | 25294 | 0 | +10 | 0 | 0 | +2 |
| 25/10/2023 | Crd Note | 6461 | 0 | -10 | 0 | 0 | 0 |
| 25/10/2023 | Crd Note | 6462 | 0 | -3 | -9 | 0 | -1 |
| 31/10/2023 | Invoice | 26027 | 0 | 0 | 0 | 0 | 0 |
| 31/10/2023 | Invoice | 26033 | 0 | +15 | +25 | 0 | 0 |
| 07/11/2023 | Crd Note | 6667 | -1 | -8 | -22 | 0 | -1 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 01/09/2023 | Invoice | 24011 | 8532.19 | 0.00 | 8532.19 | 3450.00 | 0.00 |
| 02/10/2023 | Invoice | 25042 | 8330.42 | 0.00 | 8330.42 | 8122.16 | 208.26 |
| 09/10/2023 | Invoice | 25293 | 7466.86 | 0.00 | 7466.86 | 7280.19 | 186.67 |
| 09/10/2023 | Invoice | 25294 | 0.00 | 4140.00 | 4140.00 | 4036.50 | 103.50 |
| 25/10/2023 | Crd Note | 6461 | 0.00 | -3450.00 | -3450.00 | -3363.75 | -86.25 |
| 25/10/2023 | Crd Note | 6462 | 0.00 | -4485.00 | -4485.00 | -4372.87 | -112.13 |
| 31/10/2023 | Invoice | 26027 | 13315.01 | 0.00 | 13315.01 | 12982.13 | 332.88 |
| 31/10/2023 | Invoice | 26033 | 0.00 | 13800.00 | 13800.00 | 13455.00 | 345.00 |
| 07/11/2023 | Crd Note | 6667 | 0.00 | -11040.00 | -11040.00 | -10764.00 | -276.00 |
| | | **Batch subtotal** | **37644.48** | **-1035.00** | | **30825.36** | |

*Payment 26681 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

---

## 2025 Mar discount mirror pairs — journals 00000494–496

**Posted:** 2025-03-01 &nbsp;|&nbsp; **Group net:** R2299.40

### Journal postings (ERP export)

| Date | Journal | INVNO ref | Description | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 01 Mar 2025 | 494 | 31558 |  | -956.28 |
| 01 Mar 2025 | 494 | 31558 |  | 1762.55 |
| 01 Mar 2025 | 495 | 32332 |  | -429.16 |
| 01 Mar 2025 | 495 | 32332 |  | 1324.29 |
| 01 Mar 2025 | 496 | 33224 |  | -543.52 |
| 01 Mar 2025 | 496 | 33224 |  | 1141.52 |
| | | | **Net** | **2299.40** |

### Payment ref **31558** — BATCH-2024-06-26 (STAT 103)

Remittance: `raw/Remittances/26.06.2024.pdf` · paid 2024-06-26 · cash **R37,294.98**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 06/05/2024 | Invoice | 31907 | 0 | 0 | 0 | 0 | 0 |
| 06/05/2024 | Invoice | 31908 | 0 | +10 | +20 | 0 | 0 |
| 07/05/2024 | Crd Note | 8324 | 0 | -8 | -20 | 0 | 0 |
| 24/05/2024 | Invoice | 32419 | 0 | 0 | 0 | 0 | 0 |
| 24/05/2024 | Invoice | 32425 | 0 | +16 | +30 | 0 | +1 |
| 06/06/2024 | Crd Note | 8530 | -1 | -9 | -22 | 0 | 0 |
| 07/06/2024 | Crd Note | 8700 | 0 | 0 | 0 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 06/05/2024 | Invoice | 31907 | 10677.41 | 0.00 | 10677.41 | 10410.47 | 266.94 |
| 06/05/2024 | Invoice | 31908 | 0.00 | 17940.00 | 17940.00 | 17491.50 | 448.50 |
| 07/05/2024 | Crd Note | 8324 | 0.00 | -16744.00 | -16744.00 | -16325.40 | -418.60 |
| 24/05/2024 | Invoice | 32419 | 17956.15 | 0.00 | 17956.15 | 17507.25 | 448.90 |
| 24/05/2024 | Invoice | 32425 | 0.00 | 28106.00 | 28106.00 | 27403.35 | 702.65 |
| 06/06/2024 | Crd Note | 8530 | 0.00 | -19136.00 | -19136.00 | -18657.60 | -478.40 |
| 07/06/2024 | Crd Note | 8700 | -548.49 | 0.00 | -548.49 | -534.59 | -13.71 |
| | | **Batch subtotal** | **28085.07** | **10166.00** | | **37294.98** | |

*Payment 31558 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **32332** — BATCH-2024-07-26 (STAT 104)

Remittance: `raw/Remittances/26.07.2024.pdf` · paid 2024-07-26 · cash **R16,737.35**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 20/06/2024 | Invoice | 33277 | 0 | 0 | 0 | 0 | 0 |
| 20/06/2024 | Invoice | 33278 | 0 | +15 | +30 | 0 | 0 |
| 20/06/2024 | Crd Note | 8913 | -1 | -11 | -30 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 20/06/2024 | Invoice | 33277 | 15372.51 | 0.00 | 15372.51 | 14988.20 | 384.31 |
| 20/06/2024 | Invoice | 33278 | 0.00 | 26910.00 | 26910.00 | 26237.25 | 672.75 |
| 20/06/2024 | Crd Note | 8913 | 0.00 | -25116.00 | -25116.00 | -24488.10 | -627.90 |
| | | **Batch subtotal** | **15372.51** | **1794.00** | | **16737.35** | |

*Payment 32332 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **33224** — BATCH-2024-08-26 (STAT 105)

Remittance: `raw/Remittances/26.08.2024.pdf` · paid 2024-08-26 · cash **R21,197.32**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 04/07/2024 | Invoice | 33800 | 0 | 0 | 0 | 0 | 0 |
| 18/07/2024 | Invoice | 34342 | 0 | 0 | 0 | 0 | 0 |
| 18/07/2024 | Invoice | 34343 | 0 | +9 | +20 | 0 | +3 |
| 30/07/2024 | Crd Note | 9426 | 0 | -6 | -26 | 0 | -1 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 04/07/2024 | Invoice | 33800 | 8724.99 | 0.00 | 8724.99 | 8506.87 | 218.12 |
| 18/07/2024 | Invoice | 34342 | 13613.85 | 0.00 | 13613.85 | 13273.50 | 340.35 |
| 18/07/2024 | Invoice | 34343 | 0.00 | 19136.00 | 19136.00 | 18657.60 | 478.40 |
| 30/07/2024 | Crd Note | 9426 | 0.00 | -19734.00 | -19734.00 | -19240.65 | -493.35 |
| | | **Batch subtotal** | **22338.84** | **-598.00** | | **21197.32** | |

*Payment 33224 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

---

## 2026 Mar FIX — journals 00000492/493 on payment ref 29684

**Posted:** 2026-03-01 &nbsp;|&nbsp; **Group net:** R3575.49

### Journal postings (ERP export)

| Date | Journal | INVNO ref | Description | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 01 Mar 2026 | 492 | 29684 |  | -506.36 |
| 01 Mar 2026 | 493 | 29684 |  | 4081.85 |
| | | | **Net** | **3575.49** |

### Payment ref **29684** — BATCH-2024-03-26 (STAT 100)

Remittance: `raw/Remittances/26.03.2024.pdf` · paid 2024-03-26 · cash **R73,610.18**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/08/2023 | Invoice | 23075 | 0 | 0 | 0 | 0 | 0 |
| 14/11/2023 | Invoice | 26554 | 0 | +5 | +25 | 0 | 0 |
| 14/11/2023 | Invoice | 26577 | 0 | 0 | 0 | 0 | 0 |
| 22/11/2023 | Crd Note | 6810 | -2 | -8 | -18 | -1 | 0 |
| 06/12/2023 | Invoice | 27340 | 0 | 0 | 0 | 0 | 0 |
| 06/12/2023 | Invoice | 27341 | 0 | +18 | +34 | 0 | +4 |
| 11/12/2023 | Crd Note | 6990 | -1 | -17 | -25 | 0 | -4 |
| 19/12/2023 | Invoice | 27764 | 0 | 0 | 0 | 0 | 0 |
| 19/12/2023 | Invoice | 27765 | 0 | +10 | +30 | 0 | 0 |
| 09/01/2024 | Crd Note | 7127 | 0 | -7 | -18 | 0 | 0 |
| 18/01/2024 | Invoice | 28765 | 0 | 0 | 0 | 0 | 0 |
| 18/01/2024 | Invoice | 28766 | 0 | +15 | +10 | 0 | 0 |
| 23/01/2024 | Crd Note | 7332 | 0 | -10 | -15 | 0 | 0 |
| 31/01/2024 | Invoice | 29140 | 0 | 0 | 0 | 0 | 0 |
| 06/02/2024 | Crd Note | 7410 | -3 | -23 | -27 | 0 | 0 |
| 26/02/2024 | Invoice | 29889 | 0 | 0 | 0 | 0 | 0 |
| 26/02/2024 | Invoice | 29890 | 0 | +10 | +20 | 0 | 0 |
| 28/02/2024 | Crd Note | 7547 | 0 | -9 | -18 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/08/2023 | Invoice | 23075 | 3943.81 | 0.00 | 3943.81 | 345.00 | 0.00 |
| 14/11/2023 | Invoice | 26554 | 0.00 | 10350.00 | 10350.00 | 10350.00 | 0.00 |
| 14/11/2023 | Invoice | 26577 | 8764.79 | 0.00 | 8764.79 | 8764.79 | 0.00 |
| 22/11/2023 | Crd Note | 6810 | 0.00 | -10005.00 | -10005.00 | -10005.00 | 0.00 |
| 06/12/2023 | Invoice | 27340 | 23007.60 | 0.00 | 23007.60 | 23007.60 | 0.00 |
| 06/12/2023 | Invoice | 27341 | 0.00 | 19320.00 | 19320.00 | 19320.00 | 0.00 |
| 11/12/2023 | Crd Note | 6990 | 0.00 | -16215.00 | -16215.00 | -16215.00 | 0.00 |
| 19/12/2023 | Invoice | 27764 | 13119.20 | 0.00 | 13119.20 | 13119.20 | 0.00 |
| 19/12/2023 | Invoice | 27765 | 0.00 | 13800.00 | 13800.00 | 13800.00 | 0.00 |
| 09/01/2024 | Crd Note | 7127 | 0.00 | -8625.00 | -8625.00 | -8625.00 | 0.00 |
| 18/01/2024 | Invoice | 28765 | 10732.43 | 0.00 | 10732.43 | 10464.12 | 268.31 |
| 18/01/2024 | Invoice | 28766 | 0.00 | 8625.00 | 8625.00 | 8409.37 | 215.63 |
| 23/01/2024 | Crd Note | 7332 | 0.00 | -8625.00 | -8625.00 | -8409.37 | -215.63 |
| 31/01/2024 | Invoice | 29140 | 14650.14 | 0.00 | 14650.14 | 14283.89 | 366.25 |
| 06/02/2024 | Crd Note | 7410 | 0.00 | -18285.00 | -18285.00 | -17827.87 | -457.13 |
| 26/02/2024 | Invoice | 29889 | 11363.38 | 0.00 | 11363.38 | 11079.30 | 284.08 |
| 26/02/2024 | Invoice | 29890 | 0.00 | 17940.00 | 17940.00 | 17491.50 | 448.50 |
| 28/02/2024 | Crd Note | 7547 | 0.00 | -16146.00 | -16146.00 | -15742.35 | -403.65 |
| | | **Batch subtotal** | **85581.35** | **-7866.00** | | **73610.18** | |

*Payment 29684 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

---

## 2026 Aug discount hygiene — journals 00000503–506

**Posted:** 2026-08-09 &nbsp;|&nbsp; **Group net:** R0.00

### Journal postings (ERP export)

| Date | Journal | INVNO ref | Description | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 09 Aug 2026 | 503 | 35263 |  | -552.04 |
| 09 Aug 2026 | 503 | 35263 |  | 1052.05 |
| 09 Aug 2026 | 504 | 30419 |  | -375.10 |
| 09 Aug 2026 | 505 | 33921 |  | 108.19 |
| 09 Aug 2026 | 506 | 34518 |  | -233.10 |
| | | | **Net** | **0.00** |

### Payment ref **35263** — BATCH-2024-11-26 (STAT 108)

Remittance: `raw/Remittances/26.11.2024.pdf` · paid 2024-11-26 · cash **R21,529.67**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/10/2024 | Invoice | 36926 | 0 | 0 | 0 | 0 | 0 |
| 03/10/2024 | Invoice | 37189 | +14 | 0 | +45 | 0 | +2 |
| 23/10/2024 | Crd Note | 10617 | -1 | -16 | -39 | 0 | -1 |
| 28/10/2024 | Crd Note | 10189 | 0 | -19 | -23 | 0 | 0 |
| 31/10/2024 | Invoice | 37817 | 0 | 0 | 0 | 0 | 0 |
| 31/10/2024 | Invoice | 37818 | 0 | +20 | +40 | 0 | 0 |
| 01/11/2024 | Crd Note | 11003 | 0 | -14 | -37 | 0 | -2 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03/10/2024 | Invoice | 36926 | 21036.66 | 0.00 | 21036.66 | 20510.74 | 525.92 |
| 03/10/2024 | Invoice | 37189 | 0.00 | 21045.00 | 21045.00 | 20518.87 | 526.13 |
| 23/10/2024 | Crd Note | 10617 | 0.00 | -17100.00 | -17100.00 | -16672.52 | -427.50 |
| 28/10/2024 | Crd Note | 10189 | -495.05 | -25116.00 | -25611.05 | -24970.77 | -640.28 |
| 31/10/2024 | Invoice | 37817 | 20296.12 | 0.00 | 20296.12 | 19788.72 | 507.40 |
| 31/10/2024 | Invoice | 37818 | 0.00 | 20700.00 | 20700.00 | 20182.50 | 517.50 |
| 01/11/2024 | Crd Note | 11003 | 0.00 | -18285.00 | -18285.00 | -17827.87 | -457.13 |
| | | **Batch subtotal** | **40837.73** | **-18756.00** | | **21529.67** | |

*Payment 35263 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **30419** — BATCH-2024-04-26 (STAT 101)

Remittance: `raw/Remittances/26.04.2024.pdf` · paid 2024-04-26 · cash **R28,428.84**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 31/01/2024 | Invoice | 29141 | 0 | +15 | +25 | 0 | 0 |
| 27/03/2024 | Invoice | 30762 | 0 | 0 | 0 | 0 | 0 |
| 27/03/2024 | Invoice | 30763 | 0 | +15 | +25 | 0 | 0 |
| 28/03/2024 | Crd Note | 7848 | 0 | -15 | -25 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 31/01/2024 | Invoice | 29141 | 0.00 | 13800.00 | 13800.00 | 13800.00 | 0.00 |
| 27/03/2024 | Invoice | 30762 | 15003.94 | 0.00 | 15003.94 | 14628.84 | 375.10 |
| 27/03/2024 | Invoice | 30763 | 0.00 | 23920.00 | 23920.00 | 23322.00 | 598.00 |
| 28/03/2024 | Crd Note | 7848 | 0.00 | -23920.00 | -23920.00 | -23322.00 | -598.00 |
| | | **Batch subtotal** | **15003.94** | **13800.00** | | **28428.84** | |

*Payment 30419 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **33921** — BATCH-2024-09-26 (STAT 106)

Remittance: `raw/Remittances/26.09.2024.pdf` · paid 2024-09-26 · cash **R2,984.27**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 04/07/2024 | Invoice | 33801 | 0 | 0 | +35 | 0 | 0 |
| 17/07/2024 | Crd Note | 9393 | -1 | -3 | -31 | 0 | 0 |
| 08/08/2024 | Invoice | 35091 | 0 | 0 | 0 | 0 | 0 |
| 08/08/2024 | Invoice | 35092 | 0 | +8 | +30 | 0 | 0 |
| 14/08/2024 | Crd Note | 9769 | -1 | -12 | -25 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 04/07/2024 | Invoice | 33801 | 0.00 | 12075.00 | 12075.00 | 12075.00 | 0.00 |
| 17/07/2024 | Crd Note | 9393 | 0.00 | -20930.00 | -20930.00 | -20406.75 | -523.25 |
| 08/08/2024 | Invoice | 35091 | 11606.17 | 0.00 | 11606.17 | 11316.02 | 290.15 |
| 08/08/2024 | Invoice | 35092 | 0.00 | 22724.00 | 22724.00 | 22155.90 | 568.10 |
| 14/08/2024 | Crd Note | 9769 | 0.00 | -22724.00 | -22724.00 | -22155.90 | -568.10 |
| | | **Batch subtotal** | **11606.17** | **-8855.00** | | **2984.27** | |

*Payment 33921 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

### Payment ref **34518** — BATCH-2024-10-26 (STAT 107)

Remittance: `raw/Remittances/26.10.2024.pdf` · paid 2024-10-26 · cash **R38,338.45**

#### Quantities (Part 2 — cylinder custody, v5 layout)

| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 06/09/2024 | Invoice | 36005 | 0 | 0 | 0 | 0 | 0 |
| 06/09/2024 | Invoice | 36006 | 0 | +20 | +20 | 0 | 0 |

#### Values (Part 1 — financial, v5 layout)

| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 06/09/2024 | Invoice | 36005 | 15401.49 | 0.00 | 15401.49 | 15016.45 | 385.04 |
| 06/09/2024 | Invoice | 36006 | 0.00 | 23920.00 | 23920.00 | 23322.00 | 598.00 |
| | | **Batch subtotal** | **15401.49** | **23920.00** | | **38338.45** | |

*Payment 34518 has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: no.*

---

## Related

- `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`
- `data/allocation_edges.csv` (remittance payment→document links)
- `TWK002_Statement_Account_v5.md` (full v5 layout reference)