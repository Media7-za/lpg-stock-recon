# Ingest Gate — Staged Schema Addition (not yet in project.json)

> **Status:** STAGED — pilot on JEN001 coverage artifacts before `project.json` migration.  
> **Replaces:** Single coarse `ingestState` field (rejected).  
> **Constitutional fit:** Derived evidence first; compact gate in projection; tripwire `INGEST_DOC_MISSING`.

> **Boundary (binding on every field in this document):** source completeness and ingest
> health only. No financial truth. No reconciliation closure. No collections eligibility
> (D17/D18). No workspace workflow state (`workspaceStatus`). A `pass` here means source
> documents resolve to their expected header/line state — nothing more.

---

## Two dimensions (do not collapse)

| Field | Values | Meaning |
| :--- | :--- | :--- |
| `ingestFreshness` | `current` \| `stale` \| `unverified` | Are DB feeds at least as recent as the statement TXT? |
| `ingestCoverage` | `complete` \| `partial` \| `unverified` | Does every TXT doc resolve to expected header/line state? |

**Derived display status:**

```text
CURRENT_COMPLETE | CURRENT_PARTIAL | STALE_COMPLETE | STALE_PARTIAL | UNVERIFIED
```

---

## Staged `project.json` fragment (post-pilot)

```json
{
  "ingestGate": {
    "status": "pass | fail | unverified",
    "ingestFreshness": "current | stale | unverified",
    "ingestCoverage": "complete | partial | unverified",
    "displayStatus": "CURRENT_PARTIAL",
    "asAt": "2026-07-16",
    "reportPath": "analysis/debtors/JEN001/reports/JEN001_INGEST_COVERAGE_2026-07-22.json",
    "ingestBlockedScopes": ["custody", "sku_analysis"],
    "exceptions": []
  }
}
```

**Not staged yet:** `financialReconState`, `custodyReconState`, `allocationReconState` — use gate + operator projection until MVP proves need.

---

## Tripwire (constitutional)

```json
{
  "id": "INGEST_DOC_MISSING",
  "condition": "TXT document absent from required database feed",
  "reopens": ["custody ruling", "SKU projection", "allocation conclusions"],
  "doesNotReopen": ["TXT financial bridge when amount matches ERP header"]
}
```

---

## Exception registry (`config/ingest_exceptions.json`)

```json
{
  "exceptions": [
    {
      "exception_id": "ING-JEN001-001",
      "doc_no": "51155",
      "entry_type": "Invoice",
      "classification": "MISSING_HEADER_AND_LINES",
      "allowed_use": ["financial_balance_from_txt"],
      "blocked_use": ["custody", "sku_analysis", "allocation"],
      "reason": "Awaiting fresh DTRX and ITEMS export",
      "ratified_by": "operator",
      "ratified_at": "2026-07-22",
      "review_by": "2026-07-29"
    }
  ]
}
```

---

## ERP Ingest Completeness Rule (ratifiable doctrine)

> **Supabase is a derived cache of ERP exports.** The debtor statement TXT is authoritative for document existence, dates, and the combined running balance. Item-level ERP exports are authoritative for SKU and quantity detail. Before DB-backed detail may be relied upon, every transaction-bearing document in the applicable TXT period must resolve to its expected header and item state, or to an operator-ratified exception with explicitly permitted and blocked uses. Financial reconciliation may close from TXT while ingest coverage is partial; custody, SKU, and allocation lanes may not close where their required source documents are missing.

---

## Enforcement boundaries

| Boundary | Responsibility |
| :--- | :--- |
| **Sources / DataHub** | TXT + DTRX + ITEMS same session; run `debtors:ingest-check` before marking intake complete |
| **Coverage artifact** | `validate_txt_db_coverage.mjs` — evidence, not silent PASS/FAIL |
| **debtors:sync** | *(future)* Read latest coverage JSON; warn if `ingestGate.status === fail` |
| **Generators** | Block custody conclusions; emit `INGEST_GAP` rows; never infer SKU from paired CN |

---

## Export batch manifest (optional, operator-generated)

```json
{
  "exportBatchId": "ERP-2026-07-22-01",
  "operatorDeclaredSameSession": true,
  "statement": "analysis/debtors/JEN001/raw/JEN00116JULY.TXT",
  "headers": "DTRX2207.TXT",
  "items": "CURRENT2207.TXT",
  "periodStart": "2026-01-01"
}
```

Not native ERP proof — coherence aid for Sources workflow.
