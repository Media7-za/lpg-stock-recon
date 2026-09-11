# FIR001 raw intake

| File | Purpose | Status |
| :--- | :--- | :---: |
| `FIR001CURRENT.TXT.TXT` | Authoritative v5 source (`config/statement_v5.json` `txtPath`) | ✅ as-at **5 Sep 2026** (Jul–Sep CURRENT window; double `.TXT` as dropped) |
| Same-session DTRX | `transaction_headers` | ⚠️ gaps **45779**, **45995** |
| Same-session ITEMS | `transaction_items` / CURRENT/STTR | ⚠️ CN **15488** missing header + lines |

Do not substitute `ERP RAW DATA/DETRANS.TXT` or Supabase for the statement running balance.
