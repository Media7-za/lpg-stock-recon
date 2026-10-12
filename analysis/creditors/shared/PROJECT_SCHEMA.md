# Creditor Project Schema (`project.json`)

Minimal contract for creditor micro-projects under `analysis/creditors/[CODE]/`.

```json
{
  "creditorCode": "008ORY",
  "supplierName": "ORYX ENERGY",
  "status": "active | on-hold | resolved",
  "reconState": "pending | in-progress | complete",
  "financials": {
    "totalPayable": null,
    "lastGrvDate": null,
    "lastPaymentDate": null
  },
  "ingestGate": {
    "status": "pass | fail | unverified",
    "ingestFreshness": "current | stale | unverified",
    "ingestCoverage": "complete | partial | unverified",
    "displayStatus": "string",
    "asAt": "YYYY-MM-DD | null",
    "reportPath": "string | null",
    "ingestBlockedScopes": [],
    "exceptions": []
  },
  "history": [{ "date": "YYYY-MM-DD", "event": "string" }]
}
```
