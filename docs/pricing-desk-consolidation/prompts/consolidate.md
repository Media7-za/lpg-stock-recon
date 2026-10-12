# Consolidate collected Pricing Desk handoffs

Prompt ID: PD-HANDOFF-CONSOLIDATE  
Version: 1.0

Read docs/pricing-desk-consolidation/README.md in Media7-za/lpg-stock-recon at a recorded main commit, then read every registered handoff at that same commit.

Report collected/reviewed/missing coverage separately from total GPT project coverage. An unknown project session inventory stays unknown. Do not treat titles found by search as proof of project membership.

Update only the following synthesis files and the register review statuses, following repository instructions and the public-repository publication boundary:
- consolidation/findings.md
- consolidation/conflicts-and-gaps.md
- consolidation/workflow-proposal.md

For every material conclusion, cite collection/item ID, handoff version, source path and Git commit. Separate explicit user decisions, reported implementation, independently verified implementation, assumptions and your inferences. Reviewed handoffs may still contain unresolved or unapproved decisions.

Group workflows and ownership from the evidence; preserve distinctions between pricing decisions, quotes/offers, agreements, orders, customer status and pipeline stage. Keep customer-specific terms out of general rules.

Compare recorded dates, effective dates, scope and authority. Do not settle conflicts by extraction date or recency alone. Preserve both positions and name the evidence or operator decision needed. Add stable finding/conflict/proposal IDs; retain resolved or superseded entries with reasons.

The workflow proposal remains PROPOSED — NOT RATIFIED. Identify missing handoffs and unresolved dependencies before recommending a completion sequence. Record explicit ratification only when evidenced; never infer it from a commit, silence or implementation.

Append revision history and a source manifest. Commit related synthesis/register changes atomically, without force-pushing; read back to verify. Report the main outcome, remaining conflicts, coverage and commit. Do not update live commercial records.
