# RCA Report: [Problem Name]

**RCA ID:** RCA-[XXX]
**Date:** YYYY-MM-DD
**Facilitator:** [PM Name]
**Participants:** [List who provided input]

---

## Problem Statement

[One sentence describing the recurring operational problem]

**Cost of problem:** [Financial, operational, or reputational impact]

---

## Phase 1: 5 Whys

| Level | Question | Answer |
|---|---|---|
| Symptom | [Current symptom] | [Description] |
| Why 1 | Why does that happen? | |
| Why 2 | Why does that happen? | |
| Why 3 | Why does that happen? | |
| Why 4 | Why does that happen? | |
| Why 5 | Why does that happen? | |
| **Root** | **Therefore:** | [Root cause statement] |

---

## Phase 2: Three Layer Analysis

| Layer | Findings |
|---|---|
| **Process Layer** | [What is broken in the workflow? Missing steps? Bad handoffs?] |
| **Role Layer** | [Who is accountable? Missing roles? Conflicting priorities?] |
| **Rule Layer** | [Missing or unenforced rules? Can they be automated?] |

---

## Phase 3: Countermeasure Routing

| Countermeasure Type | Action | Destination | Owner | Priority |
|---|---|---|---|---|
| **Business Rule** | [Describe rule] | `LPG-Stock-Recon-Blueprint.md` + LSR-XXX | | High/Med/Low |
| **SOP Change** | [Describe procedure change] | OPS ticket | | High/Med/Low |
| **Feature** | [Describe feature] | LSR Epic | | High/Med/Low |
| **Role Change** | [Describe role or permission change] | `docs/governance/` | | High/Med/Low |

**Note:** All four types must be considered. Mark N/A only if genuinely not applicable.

---

## Success Metric

**How will we know the fix worked?**
[Metric and target, e.g., "Daily stock variance < 1% for 30 consecutive days"]

---

## Linked References

**LSR Tickets:** [List ticket numbers with `See RCA-XXX for context`]
**Docs Updated:** [List docs that now link to this RCA]
**Related RCAs:** [If this RCA uncovered deeper issues, list follow-up RCAs]

---

## Sign-off

**PM:** `[Name]` **Date:** `[Date]`
**Operations:** `[Name]` **Date:** `[Date]` *(if SOP change required)*
