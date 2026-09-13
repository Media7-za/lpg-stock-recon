# FIR001 — Invoice tag coverage gate

**Generated:** 2026-09-08  
**Source:** `analysis/debtors/FIR001/raw/FIR001CURRENT.TXT.TXT`  
**Gate:** **NOT_DERIVABLE_FROM_TXT**

> This export carries no invoice tagging, so an open-invoice list cannot be derived from the TXT alone. Usually deliberate rather than a defect — the omitted INVNO column is the untrustworthy one. The CURRENT BALANCE header and ageing remain valid; only the invoice-level breakdown must come from elsewhere.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Export allocation detail | **ABSENT** |
| Settlement rows naming an invoice | 0 of 21 (0%) |
| — Crd Note rows tagged *(broadly canonical)* | 0 of 12 (0%) |
| — Payment rows tagged *(not authoritative)* | 0 of 9 (0%) |
| Evidence basis | **PATTERN_ONLY** |
| Open invoices assessed | 13 |
| — unassessable (no allocation detail) | **13** |
| Untagged credit rows | 21 |
| Untagged credit total | R-162,606.16 |
| Opening BALANCE B/F | R597.43 |
| Σ open invoices | R85,748.59 |
| ERP CURRENT BALANCE | R8,721.02 |
| Reconciliation gap (header − Σ open) | R-77,027.57 |
| Ratified closed (overrides) | 11 |

The two tagging rows are not equivalent. ERP tags Crd Notes to their originating invoice as a matter of course (CYL deposit / empty-return credits especially), so that percentage is meaningful evidence. ERP payment allocation is historically broken (`business_rules.md` §3) — a high payment percentage is not reassurance, and a low one is not necessarily an error. Authority over whether an invoice is settled rests with the allocation lane, never with this column.

### Checks that ran

**PATTERN_ONLY** — No extracted remittance lines for this account (data/remittance_lines_*.csv), so the remittance-contradiction check could not run. Settlement claims here rest on payment patterns, business rules and operator ratification — see business_rules.md §15, authority order B.

Concretely: the remittance-contradiction check did **not** run on this account, so a clean result below rests on arithmetic (the invariant) and an anomaly heuristic (staleness) alone. Neither can detect a settled invoice whose credit was untagged *and* whose absence does not break the account total. Establishing settlement here requires the pattern route — exact-sum month tests, the account’s established payment cadence, the business rules for that payer type, and operator ratification recorded in config.

---

## Invariant

**Σ(open invoices) ≤ ERP CURRENT BALANCE** — **NOT_APPLICABLE**

Not evaluated: with no allocation detail in the export, the open-invoice list is an artefact of missing data rather than a claim about the account, so comparing it to the ERP balance would be meaningless.

---

## Open invoices by risk

Not listed. With no allocation detail, the reconstruction returns every invoice raised in the export window (13 of them, R85,748.59) because nothing can ever be netted off. Listing them individually would imply a per-invoice finding that does not exist.

---

## Untagged credit rows

These reduce the account balance but name no invoice — the reason the open-invoice list is a hypothesis rather than a fact.

| Doc | Entry | Date | Ref | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 00015165 | Crd Note | 03 Jul 2026 | DN#22536=EMPTY | -6,555.00 |
| 00015181 | Crd Note | 06 Jul 2026 | DN#22555=EMPTY | -6,037.50 |
| 00045093 | Payment | 06 Jul 2026 | TRANSF | STAT 128 | -8,084.86 |
| 00045103 | Payment | 09 Jul 2026 | TRANSF | STAT 128 | -7,827.07 |
| 00015253 | Crd Note | 13 Jul 2026 | DN#22809=EMPTY | -6,555.00 |
| 00015269 | Crd Note | 16 Jul 2026 | DN#22960=EMPTY | -6,555.00 |
| 00045205 | Payment | 17 Jul 2026 | TRANSF | STAT 128 | -16,241.18 |
| 00015319 | Crd Note | 24 Jul 2026 | DN#23906-EMPTY | -6,555.00 |
| 00015361 | Crd Note | 31 Jul 2026 | DN#23927:EMPTY | -6,555.00 |
| 00045474 | Payment | 31 Jul 2026 | TRANSF | STAT 128 | -8,120.59 |
| 00015379 | Crd Note | 03 Aug 2026 | DN#24234-EMPTY | -6,037.50 |
| 00045586 | Payment | 05 Aug 2026 | TRANSF | STAT 129 | -7,827.07 |
| 00045591 | Payment | 07 Aug 2026 | TRANSF | STAT 129 | -8,120.59 |
| 00015439 | Crd Note | 11 Aug 2026 | DN#24259-EMPTY | -6,555.00 |
| 00015488 | Crd Note | 15 Aug 2026 | DN#24913-EMPTY | -6,555.00 |
| 00045779 | Payment | 17 Aug 2026 | TRANSF | STAT 129 | -14,379.90 |
| 00015535 | Crd Note | 24 Aug 2026 | DN#24929-EMPTY | -6,037.50 |
| 00045891 | Payment | 26 Aug 2026 | TRANSF | STAT 129 | -7,189.95 |
| 00015569 | Crd Note | 28 Aug 2026 | DN#23984-EMPTY | -6,555.00 |
| 00045995 | Payment | 31 Aug 2026 | TRANSF | STAT 129 | -7,189.95 |
| 00015604 | Crd Note | 05 Sept 2026 | DN#24820-EMPTY | -7,072.50 |

---

## Ratified closed invoices (excluded from open list)

| Doc | Reason |
| :--- | :--- |
| 51530 | STAT 128 / payment 45093 TRANSF R8,084.86 exact match DN#22536 (FIFO). TXT 06 Jul 2026. |
| 51628 | STAT 128 / payment 45103 TRANSF R7,827.07 exact match DN#22555 (FIFO). TXT 09 Jul 2026. |
| 51791 | STAT 128 / payment 45205 TRANSF R16,241.18 = inv 51791+51877 (2×R8,120.59) FIFO. TXT 17 Jul 2026. |
| 51877 | STAT 128 / payment 45205 TRANSF R16,241.18 = inv 51791+51877 FIFO. TXT 17 Jul 2026. |
| 52036 | STAT 128 / payment 45474 TRANSF R8,120.59 exact match DN#23906 (FIFO). TXT 31 Jul 2026. |
| 52195 | STAT 129 / payments 45586+45591 FIFO-clear DN#23927 R8,120.59. TXT 05–07 Aug 2026. |
| 52268 | STAT 129 / payment 45586 TRANSF R7,827.07 exact match DN#24234 (amount); FIFO remainder of 45591 also closes this stack. TXT 05–07 Aug 2026. |
| 52463 | STAT 129 / payment 45779 TRANSF R14,379.90 = inv 52463+52578 (2×R7,189.95) FIFO. TXT 17 Aug 2026. |
| 52578 | STAT 129 / payment 45779 TRANSF R14,379.90 = inv 52463+52578 FIFO. TXT 17 Aug 2026. |
| 52736 | STAT 129 / payment 45891 TRANSF R7,189.95 exact match DN#24929 (FIFO). TXT 26 Aug 2026. |
| 52844 | STAT 129 / payment 45995 TRANSF R7,189.95 exact match DN#23984 (FIFO). TXT 31 Aug 2026. |

---

## What to do

Do not try to fix this by trusting ERP tagging, and do not assume a re-export is the answer — it recovers only Crd Note tagging (broadly canonical, useful for CYL credits) while payment tagging stays non-authoritative either way (business_rules.md §3). Build the invoice-level view in the allocation lane instead. Where remittance advices exist (3 accounts) they lead. Otherwise work the pattern route: exact-sum tests against the account payment pattern, the business rules for that payer type, and operator ratification recorded in config — business_rules.md §15 authority order B, SKILL_Payment_To_Invoice_Allocation.md tiers.

Until resolved, do **not** send an open-invoice list or statement to this customer. The ERP CURRENT BALANCE total remains valid and safe to quote.
