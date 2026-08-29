# SA0001 — Onboarding Status

**Updated:** 2026-08-05  
**Lane:** `position_recon` + v5 sub-ledger layout — **locked from TXT**  
**reconState:** **complete** (TXT financial bridge PROVEN; ingest CURRENT_COMPLETE)

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **SA0001** |
| Trading name | **SAKI - VICTORIA RD** |
| Portfolio hint | Global aged-debt row may lag TXT — use `raw/SA0001.TXT` header |
| Tier | B · `position_recon` |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement TXT | `raw/SA0001.TXT` | ✅ **ingested** |
| DTRX / item exports | `raw/` | ⚠️ optional / not required for v5 financial close |
| v5 config | `config/statement_v5.json` | ✅ |
| v5 statement | `reports/SA0001_Statement_Account_v5.md` | ✅ bridge **R0.00** |
| Ingest exceptions | `config/ingest_exceptions.json` | ✅ ING-SA0001-001..005 (operator ignore) |
| Ingest coverage | `reports/SA0001_INGEST_COVERAGE_2026-08-05.json` | ✅ `CURRENT_COMPLETE` |
| Turn brief | `evidence_exchange/SA0001/turn-001/turn_brief.md` | ✅ |

---

## ERP TXT summary (`raw/SA0001.TXT`)

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | **R10 804,97** |
| BALANCE B/F | R4 945,93 |
| Period in export | Feb 2023 → **31 Jul 2026** |
| Period rows | 309 |
| UD PAY/CHEQUES | R0,00 |

---

## Lane lock (confirmed from TXT)

| Signal | TXT evidence | Lock |
| :--- | :--- | :--- |
| Lane | v5 `position_recon` | ✅ |
| EMPTY pattern | `-EMPTY`, `=EMPTY`, `:EMPTY`, `-EMPTIES` | Part 1B ✓ |
| `paymentLane` | **LPG** (STAT 112–128 payments) | ✅ |
| Part 1B CYL close | R0,00 (deposits net in combined LPG lane for generator output) | ✅ |

---

## Turn status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 001 | Onboarding + ingest + v5 baseline | ✅ **COMPLETE** |

---

## Ratified ingest exceptions (2026-08-05)

Operator **ignore** — no DB header sync required: **44740**, **42780**, **45114**, **45329**, **45466** (`config/ingest_exceptions.json`).

---

## Next action

1. Confirm `raw/SA0001.TXT` remains latest ERP export (ERP freshness gate) before any collection comms.
2. Collections only if D17 satisfied separately (collectable balance + blockers assessed).
