# LIN001 raw intake

| File | Purpose | Status |
| :--- | :--- | :---: |
| `DEBENQ (1).TXT` | Authoritative v5 source (`config/statement_v5.json` `txtPath`) | ✅ as-at **2 Sep 2026** |
| Same-session DTRX | `transaction_headers` | ⚠️ stale vs TXT — gaps **44976**, **45840**, **52924** |
| Same-session ITEMS | `transaction_items` / CURRENT/STTR | ⚠️ **52924** missing lines |

Do not substitute `ERP RAW DATA/DETRANS.TXT` or Supabase for the statement running balance.
