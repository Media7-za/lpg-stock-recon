# Debtor Operator Projection — Template (Turn 9)

**Constitutional basis:** `DEBTORS_DOCTRINE.md` §2 Projection Rule (max 5 questions)  
**Schema:** `PROJECT_PROJECTION_SCHEMA.md`

Copy per account; regenerate when evidence changes. Do not grow beyond five questions — spawn a report instead.

---

## Header

| Field | Value |
| :--- | :--- |
| Account | `{CODE}` — `{clientName}` |
| Generated | `{YYYY-MM-DD}` |
| ERP anchor | `{filename}` · balance **{amount}** · as-at **{date}** · **PROVEN** |
| reconState | `{pending|in-progress|complete}` |

---

## Five operational questions (max)

| # | Question | Answer | Tag |
| :---: | :--- | :--- | :--- |
| **Q1** | What is the ERP-anchored balance and extract freshness? | | PROVEN |
| **Q2** | What is Collectable (balance − ratified holds)? | | DERIVED |
| **Q3** | What open items require operator ratification? | | ASSERTED |
| **Q4** | What is the next bounded worker turn? | | — |
| **Q5** | Are customer comms safe to send (staleness gate)? | | PROVEN / BLOCKED |

*(Sixth question → new projection or linked report, not a sixth row.)*

---

## Collectable bridge (when Collectable ≠ ERP balance)

| Line | Doc / ref | Date | Amount | Registry / edge |
| :--- | :--- | :--- | ---: | :--- |
| ERP balance | | | | PROVEN anchor |
| Less: hold 1 | | | | ratified |
| **Collectable** | | | | derived |

> Credits are never re-subtracted — ERP is authoritative on netting.

---

## Evidence chain (warranty)

| Artifact | Path | Role |
| :--- | :--- | :--- |
| ERP TXT | `raw/` | PROVEN anchor |
| Allocation edges | `data/allocation_edges.csv` | Derived holds |
| Overrides | `config/payment_pattern_overrides.json` | Ratified decisions |
| Onboarding | `reports/{CODE}_Onboarding_Status.md` | Turn history |

---

## Staleness gate (comms)

- [ ] Customer HTML regenerated from same ERP closing as this projection  
- [ ] No portfolio delta (new TXT slice) since projection generated  
- [ ] Operator approved send date recorded  

If any unchecked → **comms BLOCKED** until regen.
