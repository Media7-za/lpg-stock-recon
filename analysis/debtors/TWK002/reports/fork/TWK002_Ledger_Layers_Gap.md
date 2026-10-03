# TWK002 — ledger rows not in Reconciliation Layers

**Compare:** `TWK002_Full_History_Ledger.md` (301 rows) vs `TWK002_Reconciliation_Layers.md` (21 remittance batches)

| Metric | Value | Tag |
| :--- | ---: | :--- |
| Full-history rows | 301 | PROVEN |
| Linked to a layer | 214 | PROVEN |
| **Not in layers** | **87** | PROVEN |
| Remittance batches in layers | 21 | PROVEN |
| Allocation edges | 191 | PROVEN |

**What “linked” means:** row appears as Layer 1 payment doc, Layer 2 edge target/override, or Layer 3 Path B journal amount in `allocation_edges.csv` / payment bridge / phase2 checklist.

---

## Payments — no remittance batch (1)

These payment docs are in the ledger but not referenced by any batch in Reconciliation Layers.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 23/07/2024 | Payment | 37732 | — | -R10,430.79 | TRANSF / STAT:105 · TWK AGRI PTY LTD | Payment doc not referenced in allocation_edges, bridge, or phase2 checklist |

## Invoices — not remittance edge targets (15)

Not in `allocation_edges.csv` target_doc. Includes current open invoices (52484, 52803) if edges use different doc keys, CN-paired empties, and historical rows settled without an ingested edge.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 06/05/2023 | Invoice | 19977 | 19977 | R12,731.05 | D/N 4172 · TWK AGRI | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 06/05/2023 | Invoice | 19985 | 19985 | R19,734.00 | D/N 4172 EMPTIES · TWK AGRI | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 14/11/2023 | Invoice | 26553 | 26553 | R7,532.25 | D/N 6859 · TWK AGRI | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 04/07/2024 | Invoice | 34285 | — | R20,930.00 | D/N 9760 · TWK AGRI | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 03/10/2024 | Invoice | 36927 | — | R19,320.00 | EMPTY 10168 · TWK AGRI | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 07/04/2025 | Invoice | 42045 | 42045 | R20,324.30 | DN#10546 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 23/04/2025 | Invoice | 42469 | 42469 | R12,592.50 | DN#13029-EMPTY · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 16/05/2025 | Invoice | 43111 | 43111 | R10,649.34 | DN#13234 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 26/07/2025 | Invoice | 45149 | 45149 | R7,762.50 | DN 20009 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 09/01/2026 | Invoice | 48686 | 48686 | R12,380.03 | DN-20974 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 29/04/2026 | Invoice | 50440 | 50440 | R10,350.00 | DN-21880-EMPTY · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 12/06/2026 | Invoice | 51180 | 51180 | R29,721.98 | DN#22798 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 15/06/2026 | Invoice | 51227 | 51227 | R17,250.00 | DN#22904-EMPTY · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 12/08/2026 | Invoice | 52484 | 52484 | R18,138.84 | DN#23954 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |
| 26/08/2026 | Invoice | 52803 | 52803 | R28,392.35 | DN#24938 · TWK AGRI PTY LTD | Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row |

## Credit notes — not on remittance targets (33)

Mostly empty-return / deposit CN pairing — not modelled as remittance invoice slices.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 12/05/2023 | Crd Note | 4917 | 19977 | -R12,731.05 | D/N 4172 · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 12/05/2023 | Crd Note | 4918 | 19985 | -R19,734.00 | D/N 4172 EMPTIES · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 14/11/2023 | Crd Note | 6816 | 26553 | -R7,532.33 | QTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 27/03/2024 | Crd Note | 7848 | — | -R23,920.00 | 30762- EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 18/04/2024 | Crd Note | 8120 | — | -R16,744.00 | 31404- EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 06/05/2024 | Crd Note | 8324 | — | -R16,744.00 | 31907 - EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 24/05/2024 | Crd Note | 8530 | — | -R19,136.00 | 32419-EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 07/06/2024 | Crd Note | 8700 | — | -R548.49 | DN#8920 · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 20/06/2024 | Crd Note | 8913 | — | -R25,116.00 | 33277-EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 04/07/2024 | Crd Note | 9158 | — | -R12,075.00 | EMPTIES · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 04/07/2024 | Crd Note | 9393 | — | -R20,930.00 | D/N 9760 · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 18/07/2024 | Crd Note | 9426 | — | -R19,734.00 | 34337-EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 08/08/2024 | Crd Note | 9769 | — | -R22,724.00 | 35091-EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 07/09/2024 | Crd Note | 10189 | — | -R25,611.05 | 36005-EMPTY · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 03/10/2024 | Crd Note | 10617 | — | -R17,100.00 | EMPTY 10168 · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 10/10/2024 | Crd Note | 10723 | — | -R19,320.00 | EMPTY 10168 · TWK AGRI | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 31/10/2024 | Crd Note | 11003 | — | -R18,285.00 | EMPTY 11171 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 26/11/2024 | Crd Note | 11320 | — | -R22,425.00 | DN#10764 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 13/12/2024 | Crd Note | 11475 | — | -R15,870.00 | DN#10831 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 08/01/2025 | Crd Note | 11648 | — | -R15,870.00 | DN#11910 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 22/01/2025 | Crd Note | 11743 | — | -R10,350.00 | DN#11939 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 05/02/2025 | Crd Note | 11821 | — | -R13,282.50 | DN#12753 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 24/02/2025 | Crd Note | 11953 | — | -R15,352.50 | DN#12795 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 07/04/2025 | Crd Note | 12207 | 42045 | -R20,324.30 | DN#10546 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 23/04/2025 | Crd Note | 12329 | 42469 | -R12,592.50 | DN#13029-EMPTY · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 16/05/2025 | Crd Note | 12494 | 43111 | -R10,649.34 | DN#13234 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 26/07/2025 | Crd Note | 13057 | 45149 | -R7,762.50 | DN 20009 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 09/01/2026 | Crd Note | 14232 | 48686 | -R12,380.03 | DN-20974 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 30/04/2026 | Crd Note | 14820 | 50440 | -R10,350.00 | DN-21880-EMPTY · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 15/06/2026 | Crd Note | 15063 | 51180 | -R29,721.98 | DN#22798 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 15/06/2026 | Crd Note | 15070 | 51227 | -R17,250.00 | DN#22904-EMPTY · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 12/08/2026 | Crd Note | 15443 | 52484 | -R11,040.00 | DN#23954 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |
| 26/08/2026 | Crd Note | 15553 | 52803 | -R17,077.50 | DN#24938 · TWK AGRI PTY LTD | CN invno not in remittance edges — typically empty-return / deposit pairing |

## Path B payment correction journals (9)

2025 catch-up gross→cash pairs (00000494–496). Layer 3 for 2024 batches uses bridge; these are separate ERP posting fixes.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 01/03/2025 | Journal | 494 | 31558 | R1,762.55 | PAYMENT REDUCTION FIX | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 01/03/2025 | Journal | 495 | 32332 | R1,324.29 | PAYMENT CORRECTION JULY2024 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 01/03/2025 | Journal | 496 | 33224 | R1,141.52 | PAYMENT CORRECTION AUG 2024 / | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 22182 | R1,160.62 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 23115 | R203.65 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 23836 | R814.22 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 24560 | R367.10 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 25906 | R426.60 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |
| 12/07/2026 | Journal | 490 | 26681 | R1,046.93 | PAYMENT CORRECTION FOR 2023 | 2025 Path B gross→cash correction pair — not a remittance batch section |

## Discount journals — amount not in batch table (3)

DISCOUNT ALLOWED posted but amount not matched to bridge/checklist.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 26/10/2024 | Journal | 334 | — | -R385.04 | DISCOUNT ALLOWED | DISCOUNT ALLOWED amount not in bridge/checklist batch table |
| 23/07/2026 | Journal | 499 | — | R1,052.05 | DISCOUNT ALLOWED | DISCOUNT ALLOWED amount not in bridge/checklist batch table |
| 09/08/2026 | Journal | 503 | 35263 | R1,052.05 | DISCOUNT ALLOWED | DISCOUNT ALLOWED amount not in bridge/checklist batch table |

## Bank UD (1)

Deposit-screen reversal — outside remittance model.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 23/07/2024 | Bank UD | 37732 | — | R10,430.79 | TRANSF / STAT:105 · REV FNB APP PAYMENT FROM 00033 | Bank UD reversal row — deposit screen artefact, outside remittance batch model |

## Other journals (25)

Non-discount, non-correction journals.

| Date | Entry | Doc | Inv | Amount | Reference | Note |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| 01/03/2026 | Journal | 493 | 29684 | R4,081.85 | 00029684 FIX | 00029684 FIX |
| 12/07/2026 | Journal | 491 | — | -R203.65 | 26.07.2023 | 26.07.2023 |
| 12/07/2026 | Journal | 491 | — | -R367.10 | 26.09.2023 | 26.09.2023 |
| 12/07/2026 | Journal | 491 | — | -R426.60 | 26.10.2023 | 26.10.2023 |
| 12/07/2026 | Journal | 491 | — | -R469.22 | 28.08.2023 | 28.08.2023 |
| 12/07/2026 | Journal | 491 | — | -R701.93 | 27.11.2023 | 27.11.2023 |
| 12/07/2026 | Journal | 491 | — | -R1,160.62 | 26.06.2023 | 26.06.2023 |
| 09/08/2026 | Journal | 505 | 33921 | R108.19 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 26/08/2026 | Journal | 510 | 15155 | R431.25 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 15262 | R370.88 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 15370 | R491.63 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 51226 | -R311.80 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 51496 | -R743.05 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 51841 | -R103.50 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 51841 | -R507.56 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 26/08/2026 | Journal | 510 | 52241 | -R851.30 | STAT 129 � B226 � PAID 31/08/2 | STAT 129 � B226 � PAID 31/08/2 |
| 31/08/2026 | Journal | 511 | 11648 | R15,473.25 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 11743 | R10,091.25 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 11821 | R12,950.44 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 11953 | R14,968.69 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 37770 | R35,693.84 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 39683 | -R26,765.92 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 40081 | -R15,217.83 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 40459 | -R22,372.30 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |
| 31/08/2026 | Journal | 511 | 40950 | -R24,821.42 | TWK AGRI PTY LTD | TWK AGRI PTY LTD |

## Interpretation

| Category | Action |
| :--- | :--- |
| **payment_orphan** (37732 / STAT:105) | Add to remittance ingest or document as non-remittance transfer |
| **invoice_not_in_edges** | Many are **expected** — empty-return pairs, open invoices, or settled before edge ingest. Cross-check open list vs overrides. |
| **cn_not_in_edges** | Expected for CYL/empty CN activity — not remittance LPG slices |
| **pathb_payment_correction** | Already in ERP fix plan as 2025 catch-up — extend layers report if needed |
| **discount_journal_unmapped** | Match to batch or flag as orphan Path B post |

Regenerate: `node analysis/debtors/TWK002/scripts/list_ledger_layers_gap.mjs --write`
