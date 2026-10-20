# JES002 Empties Report — 2026-10-20

**Account:** `JES002` — JESMOND EMPTIES
**Scope:** cylinder (empties) SKUs 9.1, 14.1, 19.1, S.1, D.1
**Status:** analysis only. Not reconciled to a statement TXT. Figures are ERP-derived, not operator-ratified.
**Reproduce:** `python3 -I analysis/debtors/JES002/scripts/empties_check.py` (writes `data/empties_by_document.csv`)

---

## 1. Answer

| Question | Answer | Tag |
| :--- | :--- | :--- |
| How many empties does JES002 owe us (net)? | **16** (17 × 9.1 less 1 × S.1) | PROVEN for documents to 5 Sep 2025 |
| Value of those 16 (incl VAT)? | **R8,464.00** | PROVEN (matches the enquiry ledger) |
| Additional empties on invoice 00053488 (6 Oct 2026, R6,200.03)? | **Unknown** | UNVERIFIED (no item lines) |
| Current ledger balance | **R14,664.03** = R8,464.00 + R6,200.03 | PROVEN (enquiry CURRENT BALANCE) |

**Net vs gross:** the 16 is a net figure. Invoices still holding empties add up to **98** cylinders, and over-credits on other invoices add up to **−82**. The net is what the ledger says the customer owes. Whether the over-credits are genuine returns, reissues or posting errors is an open ERP question (section 5).

---

## 2. Sources

| Source | Path | Used for |
| :--- | :--- | :--- |
| Account enquiry (CURRENT) | `raw/JES002_DEBENQ_CURRENT.TXT` | Ledger balance, invoice 00053488, Sep 2025 carry-forward |
| Account enquiry (2024) | `raw/JES002_DEBENQ_2024.TXT` | Oct 2023 – Feb 2024 ledger |
| Account enquiry (2025) | `raw/JES002_DEBENQ_2025.TXT` | Mar 2024 – Feb 2025 ledger |
| Item extract (2024) | shared `ERP RAW DATA/2024.TXT` | Quantities and SKUs, 17 Oct 2023 – 22 Feb 2024 |
| Item extract (current) | shared `ERP RAW DATA/CURRENT.TXT` | Quantities and SKUs, 4 Mar 2024 – 5 Sep 2025 |

`DETRANS.TXT` and `STTRANS.TXT` were not used for quantities. They duplicate Sep 2025 lines already in `CURRENT.TXT`, and counting them again would double the Sep 2025 credits.

**Method:** item-level quantities are signed (credits negative) and summed by SKU and by document. Each document's item value is qty × price × 1.15 (VAT). This is compared to the enquiry ledger amount for the same document. The enquiry shows amounts incl VAT only, with no SKU or quantity.

---

## 3. Empties by document (net, to 5 Sep 2025)

Positive = cylinders still out with the customer. Negative = more credited back than invoiced on that document.

| Document | Date | Net empties | Value incl VAT (R) |
| :--- | :--- | ---: | ---: |
| 00025562 | 17/10/2023 | −1 | −598.00 |
| 00025701 | 21/10/2023 | 15 | 8,970.00 |
| 00025823 | 25/10/2023 | −7 | −4,186.00 |
| 00026050 | 31/10/2023 | 11 | 6,578.00 |
| 00026334 | 07/11/2023 | −13 | −7,774.00 |
| 00026364 | 08/11/2023 | 11 | 6,578.00 |
| 00026525 | 13/11/2023 | −26 | −15,548.00 |
| 00026795 | 20/11/2023 | −2 | −1,196.00 |
| 00029783 | 22/02/2024 | 1 | 598.00 |
| 00029785 | 22/02/2024 | 7 | 4,186.00 |
| 00029786 | 16/02/2024 | 13 | 7,774.00 |
| 00030435 | 15/03/2024 | −1 | −345.00 |
| 00031596 | 25/04/2024 | −1 | −345.00 |
| 00032650 | 01/06/2024 | −11 | −6,578.00 |
| 00032777 | 05/06/2024 | 20 | 11,960.00 |
| 00032817 | 06/06/2024 | −20 | −11,960.00 |
| 00040511 | 06/02/2025 | 20 | 10,350.00 |
| **Net** | | **16** | **8,464.00** |

Every document's item value equals its enquiry ledger value (0 mismatches). Ledger balance excluding 00053488 = R8,464.00.

---

## 4. Question checks (SKU and credit status)

**Q1 — Do all invoices carry only 9.1, 14.1, 19.1, S.1 or D.1?** No.

| Invoice | Date | Amount incl VAT (R) | SKUs | Credited | Net |
| :--- | :--- | ---: | :--- | ---: | ---: |
| 00046171 | 05/09/2025 | 4,760.03 | 9.4 ×17 | CN 00013394 | 0.00 |
| 00046173 | 05/09/2025 | 280.00 | 9.4 ×1 | CN 00013396 | 0.00 |
| 00046185 | 05/09/2025 | 5,040.04 | 9.4 ×18 | CN 00013403 | 0.00 |
| 00046201 | 05/09/2025 | 5,040.04 | 9.4 ×18 | CN 00013428 | 0.00 |
| 00053488 | 06/10/2026 | 6,200.03 | not in extracts | none | 6,200.03 |

9.4 is 9KG ORYX LPG, not an empty. Invoice 00053488 cannot be checked, because the item extracts stop at 5 Sep 2025.

**Q2 — Are the non-empties invoices fully credited?** Yes for the four 9.4 invoices above. They are credited in full by amount and by quantity. 00053488 is open.

---

## 5. Open items and limits

1. **Invoice 00053488 (R6,200.03, order 24707):** needs an item-level extract to check whether it contains empties. Until then the 16 is a floor, not a total.
2. **Gross vs net:** 98 out, −82 over-credited. The largest over-credits are 00026525 (−26), 00032817 (−20), 00026334 (−13) and 00032650 (−11). Each needs an ERP look at the credit notes against the delivery notes.
3. **Pre-Oct 2023:** `2023.TXT` has no JES002 rows and the earliest enquiry line is 17 Oct 2023. Any earlier empties are not in the data.
4. **No statement TXT:** the account-level ERP statement (`CURRENT BALANCE` header with ACCNO JES002) is not in `raw/`. The enquiry is used as the balance anchor instead.
5. **Sister account:** JES001 (2 ON JESMOND ROAD PTY LTD) is a separate ledger and is not included.

---

## 6. Corrections to earlier figures in this session

An earlier calculation gave **30 empties / R16,836.00**. That was wrong. The cause was de-duplicating identical rows across the item extracts, which removed one of two lines on credit note 00007447 (two lines × 14 empties = 28 empties, D/N 7792/7793). Both lines are distinct, and the enquiry ledger agrees (R16,744.00 = 28 × R598). The correct net is **16 / R8,464.00**.

The Q2 answer in the earlier reply (the four 9.4 invoices are fully credited) is not affected.

---

## 7. Next steps

- Obtain the item-level detail for invoice 00053488 (order 24707) and rerun `empties_check.py` after adding its lines.
- Ask the ERP side to confirm the over-credits in section 5 item 2.
- Once confirmed, record the net empties and value in `project.json` `financials` and `collections.notes`, with the basis above.
