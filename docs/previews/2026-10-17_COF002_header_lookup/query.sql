-- Read-only, run through the Supabase connector (project oqhpxnaadahohwkslive) on 2026-10-17, authorised by the operator in the COF001 session ("Authorise the connector replay for COF002 headers").
-- Doc numbers asked for by the COF002 session (+ 30218, 29691, 29646, 29696, 30276). Receipts and invoices have SEPARATE number series, so the same number appears under other accounts as an invoice.
SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, account_no, account_name, tx_date::text AS tx_date, period, ref_no, description, order_no, batch_ref,
       ROUND((amount_excl + tax_amount)::numeric,2)::float AS amount, flag, source_file, created_at::text AS created_at
FROM transaction_headers
WHERE LTRIM(doc_no,'0') IN ('29492','30219','31096','32598','32615','37735','29493','29503','29505','44819','44825','44826','30218','29691','29646','29696','30276')
ORDER BY LTRIM(doc_no,'0'), entry_type, account_no
