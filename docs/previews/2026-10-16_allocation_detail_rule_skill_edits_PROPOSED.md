# Allocation-detail rule: proposed skill edits — PROPOSED, NOT RATIFIED

**Drafted 2026-10-16 by the COF001 analyst session at the operator's request. The skill files themselves are NOT edited here** (other agents' instruction files; AGENTS.md §7 / session brief). Operator or PM applies, or says "apply", after review.

## The rule (already written down, not new)
- `SKILL_Human_Sources_Agent.md` §6.1 and `analysis/debtors/shared/docs/business_rules.md` §3 and §15: ERP payment allocation (the `INVNO` column, present only when allocation detail is exported) is untrustworthy. An export with `"EXCLUDE:","ALLOCATION DETAIL"` is the normal, deliberate posture, not a defect. Allocation is reconstructed from evidence (remittance advices where they exist; otherwise exact-sum arithmetic, the account's payment pattern, business rules, then operator judgement recorded in `config/*.json`). Re-exporting with allocation detail recovers only Crd Note tagging; it never makes payment allocation trustworthy. Fetch it **only** when the operator specifically wants CYL / credit-note detail.
- Gap: the three skills that route and run the work do not say this, so sessions keep asking for allocation detail to resolve unallocated payments. Observed 2026-10-13 to 16: MD0003 request (`docs/requests/2026-10-13_md0003_allocation_detail_request.md`, ADM-129), the COF001 ticket ADM-135 wording ("Do not use the EXCLUDE: ALLOCATION DETAIL variant"), and this analyst session's own handoff lines (corrected in `docs/handoffs/2026-10-14_COF001.md`).

## Edit 1 — `SKILL_Debtors_Orchestrator.md`
**(a)** In §3, after the ERP freshness gate, add:

> ### Export request posture (allocation detail)
> Default every ERP export request to the statement posture: dated `<CODE>_<YYYY-MM-DD>.TXT`, header block, running balance, **`EXCLUDE: ALLOCATION DETAIL` left on**. Ask for allocation detail only when the operator specifically wants CYL / credit-note detail. Never request it to resolve unallocated payments or to "get the ERP's allocation": ERP payment allocation is untrusted (`business_rules.md` §3, §15). Unallocated payments are worked by the matcher plus operator rulings (`approve_tie.mjs`, `config/payment_pattern_overrides.json`), using the authority order in `business_rules.md` §15.

**(b)** In §5.7 "Failure modes observed", add a row:

> | Allocation detail as a remedy | A request or handoff says unallocated payments are "waiting for ERP allocation detail". The matcher and operator rulings resolve them; ERP payment tagging is never proof. |

## Edit 2 — `SKILL_Human_ERP_Agent.md`
In §2 "What you do" add a row, and in §3 "What you do NOT do" add a bullet:

> | Export statement TXT | Default posture: header block + running balance, `EXCLUDE: ALLOCATION DETAIL` on, file named `<CODE>_<YYYY-MM-DD>.TXT`. Include allocation detail only when the work order says the operator specifically wants CYL / credit-note detail. |
>
> - Treat a request for allocation detail as a request for Crd Note tagging only. If the stated reason is "to allocate payments", say so back to the requester: ERP payment tagging is not used as evidence on its own (`SKILL_Human_Sources_Agent.md` §6.1).

## Edit 3 — `SKILL_Payment_To_Invoice_Allocation.md`
In §5 "Tier 5 — Unallocated (Exception)", append:

> **How an unallocated payment is closed.** Never by requesting ERP allocation detail. Work it with evidence, in this order: remittance advice (where one exists); exact-sum arithmetic against open invoices (payment, or a batch of payments, equal to the cent to a set of invoices); the account's recorded payment pattern; business rules for the payer type; then an operator ruling recorded with `approve_tie.mjs` (treatments `exact`, `customer_credit`, `applied_to_bf`, `part_payment`, `short_paid`). A payment the evidence cannot place stays an open credit and is reported as such (basis `ASSUMED`), not "waiting for the ERP". Reference case: COF001, `docs/previews/2026-10-14_COF001_onboarding.md` section 11.

## Not covered
- `docs/requests/2026-10-13_md0003_allocation_detail_request.md` and ADM-129/ADM-135 are other sessions' artifacts; flagged, not changed. The operator decides whether to amend the tickets.
- `SKILL_Human_Sources_Agent.md` §6.1 already states the rule and needs no edit.
- Doctrine (`DEBTORS_DOCTRINE.md`, `ALLOCATION_DOCTRINE.md`) unchanged; if the operator wants this as a numbered doctrine item, that is a §7 ratification, staged separately.
