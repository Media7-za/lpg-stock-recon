# Allocation-detail rule: draft edits (2026-10-16), for operator review, NOT APPLIED

Status: DRAFT. Nothing in `.agents/skills/`, `AGENTS.md` or `docs/requests/` has been edited.

**Why this exists.** Agents keep asking for ERP allocation detail as the way to unblock unallocated payments. The rule against it is already written in `SKILL_Human_Sources_Agent.md` section 6.1 and `analysis/debtors/shared/docs/business_rules.md` (rule 3, "Never derive an open-invoice list from ERP payment tagging alone"). It sits in the Sources agent's skill, which a worker or PM session does not open when it hits a blocker. The main session also broke the rule: `docs/requests/2026-10-13_md0003_allocation_detail_request.md` and ADM-129 asked for exactly this, and COF001 followed the same pattern.

**The rule in one line.** ERP allocations are unreliable input (ASSERTED at best). Allocation is the matcher's job. An untied payment is worked from ledger evidence, remittance advices and the matcher's rules; it is never a reason to request ERP allocation detail.

**Allowed exception (unchanged from section 6.1).** A fresh export with allocation detail may be requested only when the operator specifically wants credit-note (`Crd Note`) or cylinder detail, because credit-note tagging is broadly canonical. It must not be requested "to tie payments".

---

## Block 1: `AGENTS.md` (governance file; stage as PROPOSED, operator decides)

Append to "Non-negotiables":

```markdown
- **ERP allocations are not evidence of intent.** Never request an ERP export "with
  allocation detail" to tie, or to unblock, unallocated payments. Allocation is the
  matcher's job. Work an untied payment from ledger evidence, remittance advices and the
  matcher. The only allowed reason for an allocation-detail export is operator-requested
  credit-note or cylinder detail. See `.agents/skills/SKILL_Human_Sources_Agent.md` §6.1.
```

Marked `PROPOSED — NOT RATIFIED` until the operator approves (AGENTS.md section 7).

## Block 2: `SKILL_Debtors_Orchestrator.md`, append to "### 7. Failure modes observed (audit for these)"

```markdown
- **Asking the ERP for allocation detail to unblock untied payments.** Wrong blocker. ERP
  payment allocations are unreliable (ASSERTED); allocation is the matcher's job. When
  payments stay untied, work them from ledger evidence and remittance advices, or hold them
  as a ruling. Do not raise an ERP export request for "allocation detail". The one allowed
  exception is operator-requested credit-note or cylinder detail
  (`SKILL_Human_Sources_Agent.md` §6.1; `business_rules.md` rule 3). Seen on MD0003
  (request of 2026-10-13, ADM-129) and COF001 (2026-10-16): both were mistakes.
```

## Block 3: `SKILL_Human_ERP_Agent.md`, append to "## 3. What you do NOT do"

```markdown
- **Do not accept or raise a request for an export "with allocation detail" to tie
  payments.** ERP allocations are unreliable and are not a source for payment-to-invoice
  allocation. If a work order asks for one for that purpose, reply that the matcher does
  the allocation and ask the PM to confirm the request. Allocation detail is exported only
  when the operator specifically asks for credit-note or cylinder detail
  (`SKILL_Human_Sources_Agent.md` §6.1).
```

## Block 4: `SKILL_Payment_To_Invoice_Allocation.md`, append to "## 11. Anti-Patterns (Do Not)"

```markdown
- **Do not request an ERP export "with allocation detail" to resolve Tier 5 (unallocated)
  payments.** The ERP's payment tagging is the unreliable input the allocation tiers exist
  to replace. Tier 5 payments go to the evidence ladder: remittance advice, ledger
  evidence, the matcher's rules, then an operator ruling. A remittance advice from the
  customer is the right external request, not an ERP export.
```

## Block 5: `docs/requests/2026-10-13_md0003_allocation_detail_request.md`, add a note at the top (append-only; do not delete the request)

```markdown
> **SUPERSEDED 2026-10-16 as a pattern.** This request asked the ERP for allocation detail
> to tie untied payments. That is not the right blocker (see AGENTS.md proposed rule and
> `SKILL_Human_Sources_Agent.md` §6.1). The file was delivered (ADM-129) and is on record;
> do not copy this request for other accounts.
```

## Block 6: COF001 session and open Linear items (no edit now; for the PM to act on)

- Tell the COF001 session not to request allocation detail for its 14 unallocated payments (-R67,751.39). It has already conceded this in its own report; the instruction should live in its handoff `docs/handoffs/2026-10-14_COF001.md`.
- ADM-135 asks Sharmin for a dated export that must not say `EXCLUDE: ALLOCATION DETAIL`. That line should be relaxed to "plain statement export, same as the 8 Oct files; allocation detail not needed".

## Check before applying

- The three skill files and `business_rules.md` are agent instructions; the operator approves before any edit, per standing practice.
- Block 1 touches `AGENTS.md` and needs ratification wording from the operator.
