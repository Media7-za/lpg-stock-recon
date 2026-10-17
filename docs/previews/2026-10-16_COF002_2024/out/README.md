# duplicated_item_rows_175.csv — README (ASSERTED, connector-sourced, 2026-10-17)

**What it is.** The header rows in `transaction_headers` that fit none of the four tax ratios (15% / 14% ex-tax, 15/115 / 14/114 inclusive) **and** whose `transaction_items` line totals are an exact whole multiple (here 2x) of the header: 175 header rows covering **102 distinct documents** (account, entry type, doc_no) across 21 accounts. The documents are not mis-taxed; the same document's item rows are present twice, once from each of two source files (`CURRENT.TXT` + `CURRENT2307.TXT`, `2025.TXT` + `STTRANS2024.TXT`, or `CURRENT2307.TXT` + `ST2504.TXT`). Where the header table also holds the document twice (`header_rows_for_doc` 2 or 3) each header row is a separate line here; `header_row_id` is `transaction_headers.id`. Credit-note header rows can carry either the inclusive or the ex-tax figure in `amount_excl` (see ratio column: 1.8 to 1.97 vs 2.00).

**Correction to my earlier wording:** "175 documents" was 175 header rows; the distinct document count is 102.

**Columns.** account, doc_no (leading zeros removed), entry_type, doc_date, header_amount_excl, header_tax_amount, items_line_net (sum qty*retail_price over all item rows of the document), items_line_tax (absolute sum of line_tax), ratio_items_net_to_header, item_row_count (all item rows of the document, both sources), item_source_files (distinct `source_file` values joined by `|`), header_row_id, header_rows_for_doc. Numbers are as the database returned them (some carry float noise such as 20128.980000000003).

**Not included / limits.** A document with header twin rows whose headers fit a 14/15% ratio is not in this list (it is classified). Items only duplicated by the same source file would also not show as multiple sources. The check does not show which copy is the original.

**Provenance.** Supabase project `oqhpxnaadahohwkslive`, `public.transaction_headers` and `public.transaction_items`, read-only SELECT through the connector under the operator's standing authorisation in this session (operator: "You are authorised to use supabase without my authorization", 2026-10-17). The CSV body was transcribed from the connector output; the saved body's md5 and byte length equal the server-side values: **md5 `21c049f3555b6f266640a484390e8c0b`, length 18378** (body = the 175 rows without header and without trailing newline; the CSV adds the header line and a final newline).

**Query** (read-only):

```sql
with u as (select id, account_no, entry_type, doc_no, tx_date, amount_excl, tax_amount
  from transaction_headers
  where entry_type in ('Invoice','Crd Note') and amount_excl<>0 and tax_amount<>0
    and abs(abs(tax_amount)/abs(amount_excl)-0.15)>=0.002 and abs(abs(tax_amount)/abs(amount_excl)-15.0/115)>=0.002
    and abs(abs(tax_amount)/abs(amount_excl)-0.14)>=0.002 and abs(abs(tax_amount)/abs(amount_excl)-14.0/114)>=0.002),
l as (select i.account_no, i.entry_type, i.doc_no, count(*) n_lines, sum(i.qty*i.retail_price) net, sum(i.line_tax) tax,
  string_agg(distinct i.source_file, '|' order by i.source_file) srcs
  from transaction_items i join (select distinct account_no, entry_type, doc_no from u) d using (account_no, entry_type, doc_no)
  group by 1,2,3),
j as (select u.*, l.n_lines, l.net, l.tax, l.srcs,
  (select count(*) from transaction_headers h where h.account_no=u.account_no and h.entry_type=u.entry_type and h.doc_no=u.doc_no) n_hdr
  from u join l on l.account_no=u.account_no and l.entry_type=u.entry_type and l.doc_no=u.doc_no
  where not (abs(abs(l.net)-abs(u.amount_excl))<=0.05 or abs(abs(l.net)+abs(l.tax)-abs(u.amount_excl))<=0.05)
    and abs(l.net)>abs(u.amount_excl)*1.5
    and (abs(round(abs(l.net)/abs(u.amount_excl))-abs(l.net)/abs(u.amount_excl))<0.02
      or abs(round((abs(l.net)+abs(l.tax))/abs(u.amount_excl))-(abs(l.net)+abs(l.tax))/abs(u.amount_excl))<0.02)),
t as (select string_agg(concat_ws(',', account_no, ltrim(doc_no,'0'), entry_type, tx_date, amount_excl::text, tax_amount::text,
  round(net::numeric,2)::text, round(abs(tax)::numeric,2)::text, round((net/amount_excl)::numeric,2)::text, n_lines::text, srcs, id::text, n_hdr::text),
  E'\n' order by account_no, tx_date, doc_no, id) body, count(*) n, count(distinct (account_no, entry_type, doc_no)) docs from j)
select md5(body) md5, length(body) len, n, docs, body from t
```

No secrets or connection strings are in this folder. Nothing in `config/`, the ERP or the database was changed.
