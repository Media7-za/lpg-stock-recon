# TWK AGRI family runbook (TWK002 parent + TWK003 + TWK004)

Status: index and state sheet, not doctrine and not a procedure. Procedures live in the skills; governing rules are DEBTORS_DOCTRINE D20/D21 and ALLOCATION_DOCTRINE section 6. **Read every figure, hold, lock and quarantine from the files named below. Nothing here is a source of numbers.** Created 2026-10-13.

Trigger phrase: **"Run TWK Analysis"** (launcher: `.claude/skills/run-twk-analysis/SKILL.md`).

## 1. Members and where they live

| Member | Role | ERP TXT (current in config) | Config | Replay captures |
| :-- | :-- | :-- | :-- | :-- |
| TWK002 | parent | `analysis/debtors/TWK002/config/statement_v5.json` `txtPath` and `statement_of_account.json` `primaryTxt` | `TWK002/config/` | `TWK002/data/db_replay/<date>/` |
| TWK003 | child | `TWK003/config/statement_v5.json` `txtPath` (file sits in `TWK002/raw/`) | `TWK003/config/` | `TWK003/data/db_replay/<date>/` |
| TWK004 | child | `TWK004/config/statement_v5.json` `txtPath` (file sits in `TWK002/raw/`) | `TWK004/config/` | `TWK004/data/db_replay/<date>/` |

Children's TXT path must also match `payerGroup.children[].txtPath` in the parent's `statement_v5.json`. Exports arrive from the ERP Agent (Sharmin) in the Drive folder named on the Linear export task; file name `<CODE>_<YYYY-MM-DD>.TXT`.

Family evidence: STAT 123 (payment 43500) is one receipt posted across all three accounts; `TWK002/data/remittance_evidence.json` (`family.postings`, `family.siteDocs`) and `remittance_lines_2026.csv`.

## 2. Run order (each member, then the parent)

Use `SKILL_Family_Statement_Refresh.md` for the commands and the gate table. TWK order: TWK002, TWK003, TWK004, then:

```bash
node analysis/debtors/shared/scripts/generate_statement_of_account.mjs --debtor TWK002
```

Outputs: `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md` (live file; a `..._Consolidated_DRAFT_PREVIEW.md` instead when any draft reason exists) and `TWK002_Family_Internal_Reconciliation.md`. No `--snapshot`; the PDF only via `md_to_pdf.mjs` and only when not a draft.

## 3. Where the current state lives (read it, do not copy it)

| State | File |
| :-- | :-- |
| Open operator holds | `TWK002/config/statement_of_account.json` `familyReleaseHolds` |
| Customer quarantines | each member's `config/statement_v5.json` `customerQuarantine` (TWK003 has one) |
| Locks | each member's `config/payment_pattern_overrides.json` `projectionLocks` |
| Rulings on rows | each member's `config/statement_v5.json` `rowNotes` |
| Review-only reasons | each member's `data/projection_matches.json` `reviewOnly`, `reviewOnlyReasons` |
| History of what was done | `docs/previews/2026-10-10_TWK_consolidated_statement_preview.md` (dated updates) |

## 4. Standing rulings (links; each carries its own tripwires)

| Ruling | Recorded in |
| :-- | :-- |
| CN 15775 is a cylinder (CYL) credit, no double credit against the STAT 123 cash deposits | TWK002 `rowNotes` (ADM-94 Q5); `docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md` |
| TWK004 pair 53535 / CN 15781 is matcher-confirmed (a note, not a lock); invoice 53536 replaces 53535 | TWK004 `rowNotes` |
| TWK003 R-300.00 (invoice 47866 / CN 13933) is an ERP price typo, held off the customer copy by a quarantine; the ERP correction is pending and the generator aborts when it posts | TWK003 `customerQuarantine` Q1 and `rowNotes` |
| Payment 43500 (TWK003 slice) applied to 47991 by operator-approved lock | TWK003 `projectionLocks` |
| The v5 evidence path stands in for the invoice-tag gate on the open_items layout (`tag-check` returns NOT_DERIVABLE_FROM_TXT) | preview note section 14; TWK003/TWK004 have no `tag-check` of their own |
| Account-level lines are shown to the customer as one "Opening balance" line | preview note section 16 |

## 5. Stop points (a human acts, the agent does not)

Approving a lock or tie; clearing or adding a hold; resolving a quarantine abort (the ERP correction posting); releasing; **sending** (agent prepares a draft and a committed send record only); the customer contact and email thread (not recorded in the repo: ask the operator); repairing any manifest or ERP data.

## 6. Which skill for which task

| Task | Skill |
| :-- | :-- |
| New ERP export arrives | `SKILL_Human_Sources_Agent.md` §6.2, then `SKILL_Family_Statement_Refresh.md` |
| Rebuild after a sync, ruling or lock | `SKILL_Family_Statement_Refresh.md` |
| Explain a cylinder residual or credit note | `SKILL_Cylinder_Custody_Check.md` |
| Check list items against remittance advices | `SKILL_Remittance_Advice_Cross_Check.md` |
| Record an operator ruling, hold or quarantine | `SKILL_Family_Rulings_And_Holds.md` |
| Prepare the customer email | `SKILL_Customer_Statement_Send.md` |

## 7. Known traps specific to this family

- Credit-note headers in the DB read 1.1304 times the TXT for the TWK documents sampled (unexplained); lines and TXT agree, use them.
- The customer amount due deliberately differs from the sum of the three ERP balances by the quarantined amount; the internal view carries the reconciling line.
- A re-export of any one member makes its projection stale and stops the whole family run (fingerprint gate); refresh all three each time.
- TWK003 and TWK004 have no `statement_of_account.json`, so they have no customer-statement tag-check of their own.
