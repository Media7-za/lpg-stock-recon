# Preview of proposed rule R1: same-delivery-note credit-note pairs

Generated 2026-10-10 by `cn_rule_preview.mjs`. Read-only; the rule is **off by default** (`cnRivalFreeMaxDays: 0`) and nothing here changes any account. PROPOSED: needs an operator decision.

## The rule

A credit note and an invoice of the **same delivery-note number and lane**, with an **exact opposite amount**, are **CONFIRMED** when the credit note is dated up to **N days** after the invoice and the pairing is the **only possible one**: no other invoice and no other credit note of the same lane, delivery-note number and amount exists anywhere in the projection. Today they are CONFIRMED only up to 1 day and otherwise PROBABLE (and wait for approval). Pairs with a twin, pairs with no delivery-note number (`CN_AMOUNT_DATE`) and everything beyond N days stay PROBABLE.

## Counterfactual baseline

Baseline = the matcher with the 49 group-approval locks of 2026-10-10 left out, i.e. the state before you approved them. Lag distribution of the same-DN probable pairs in that baseline (days after the invoice → pairs): 2d → 20, 3d → 9, 4d → 8, 5d → 2. **No pair exists beyond 5 days**, so any N from that value up gives the same result today; the proposal uses the observed maximum rather than extrapolating.

## Effect per account (customer-view open rows; internal in brackets)

| Account | Same-DN probable pairs | Baseline open rows | N=3: pairs confirmed → open rows | N=5: pairs confirmed → open rows | N=7: pairs confirmed → open rows | N=14: pairs confirmed → open rows | N=31: pairs confirmed → open rows |
| :--- | ---: | :--- | :--- | :--- | :--- | :--- | :--- |
| FIR001 | 5 | 39 (21) | 3 → 33 (21) | 5 → 29 (21) | 5 → 29 (21) | 5 → 29 (21) | 5 → 29 (21) |
| JEN001 | 1 | 8 (6) | 0 → 8 (6) | 1 → 6 (6) | 1 → 6 (6) | 1 → 6 (6) | 1 → 6 (6) |
| MD0003 | 5 | 51 (32) | 5 → 41 (32) | 5 → 41 (32) | 5 → 41 (32) | 5 → 41 (32) | 5 → 41 (32) |
| MON001 | 2 | 18 (8) | 2 → 14 (8) | 2 → 14 (8) | 2 → 14 (8) | 2 → 14 (8) | 2 → 14 (8) |
| MOZ002 | 0 | 2 (2) | 2 → 2 (2) | 2 → 2 (2) | 2 → 2 (2) | 2 → 2 (2) | 2 → 2 (2) |
| RED001 | 0 | 6 (6) | 2 → 6 (6) | 2 → 6 (6) | 2 → 6 (6) | 2 → 6 (6) | 2 → 6 (6) |
| SA0001 | 9 | 39 (6) | 5 → 29 (6) | 9 → 21 (6) | 9 → 21 (6) | 9 → 21 (6) | 9 → 21 (6) |
| TAN002 | 17 | 83 (41) | 13 → 57 (41) | 16 → 51 (41) | 16 → 51 (41) | 16 → 51 (41) | 16 → 51 (41) |
| TWK002 | 0 | 10 (10) | 0 → 10 (10) | 0 → 10 (10) | 0 → 10 (10) | 0 → 10 (10) | 0 → 10 (10) |

## Does the rule reproduce your approvals? (N = 5)

- Same-DN pairs the rule confirms that you approved: **38**.
- Pairs the rule confirms that you did **not** approve: **4** — MOZ002: 12079 Crd Note + 41522 Invoice; MOZ002: 13602 Crd Note + 46826 Invoice; RED001: 12638 Crd Note + 43615 Invoice; RED001: 13187 Crd Note + 45541 Invoice.
- Pairs you approved that the rule does **not** confirm: **0**.
- Same-DN pairs the rule leaves PROBABLE (held back): **1** — TAN002: Invoice 49360 + Crd Note 14472 (lag 2d).

- **The 4 pairs the rule confirms that you did not approve** are pairs the zero-balance rule (rule 6) had already settled inside a group: the rule pairs them individually (rule 2 runs before rule 6), so the group shrinks. MOZ002: +2 ties; RED001: +2 ties. They are settled either way.
- With the real locks kept and the rule on (N = 5), do the **open rows and balances** change on any account, internal or customer view? **No: every account's open rows are identical to today.**

## Risks and what the rule does not do

- It rests on the delivery-note text. A re-keyed or mistyped DN that coincidentally matches another delivery would be paired; the rival check catches repeats within the account but not a unique mistake. Tripwire: an ERP allocation export (credit-note INVNO) pointing a credit note at a different invoice.
- It does not look at what else is open on the account, so a legitimately open invoice could be paired off if its credit note carries the same DN and amount. That is the same risk as the existing 0–1 day rule, over a longer window.
- It leaves `CN_AMOUNT_DATE` pairs (no DN) alone. Eleven were approved in groups on timing alone; confirming those by rule would be a separate, weaker proposal.
- The limit of N days is a judgement: the data shows nothing beyond 5, and the rule should be widened only on evidence.

## If you adopt it

Set `cnRivalFreeMaxDays: 5` in `RULES` (one line), add the amendment to the ratified note, re-run `matcher_preview.mjs` (it must show no unintended row change), and re-render. No account needs a lock for these pairs again; pairs already locked stay locked.

