import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log('Connected.\n');

// 1. Raw header record
console.log('═══ 1. RAW HEADER RECORD (transaction_headers) for Crd Note doc_no containing 11984 ═══');
const headerRes = await client.query(`
  SELECT id, entry_type, account_no, doc_no, ref_no, tx_date::text,
         amount_excl, tax_amount, tax_code,
         ROUND((amount_excl + tax_amount)::numeric, 2) AS computed_total
  FROM transaction_headers
  WHERE doc_no LIKE '%11984%'
    AND account_no = 'FAM000'
    AND entry_type = 'Crd Note'
  ORDER BY tx_date;
`);
console.table(headerRes.rows);

// 2. Line items from transaction_items
console.log('\n═══ 2. LINE ITEMS (transaction_items) for Crd Note doc_no containing 11984 ═══');
const itemsRes = await client.query(`
  SELECT id, entry_type, account_no, doc_no, stock_no, description, category,
         qty, retail_price, cost_price, line_tax,
         ROUND((qty * retail_price)::numeric, 2) AS line_excl,
         ROUND(((qty * retail_price) - ABS(line_tax))::numeric, 2) AS line_incl
  FROM transaction_items
  WHERE doc_no LIKE '%11984%'
    AND account_no = 'FAM000'
    AND entry_type = 'Crd Note'
  ORDER BY stock_no;
`);
console.table(itemsRes.rows);

// 3. Sum of line items
console.log('\n═══ 3. LINE ITEM TOTALS ═══');
const sumRes = await client.query(`
  SELECT 
    ROUND(SUM(qty * retail_price)::numeric, 2) AS sum_line_excl,
    ROUND(SUM(-ABS(line_tax))::numeric, 2) AS sum_line_tax,
    ROUND(SUM((qty * retail_price) - ABS(line_tax))::numeric, 2) AS sum_line_incl
  FROM transaction_items
  WHERE doc_no LIKE '%11984%'
    AND account_no = 'FAM000'
    AND entry_type = 'Crd Note';
`);
console.table(sumRes.rows);

// 4. vw_clean_transactions view for the same doc
console.log('\n═══ 4. vw_clean_transactions VIEW for Crd Note doc_no containing 11984 ═══');
const viewRes = await client.query(`
  SELECT doc_no, entry_type, stock_no, category, debt_group,
         qty, retail_price, line_tax_fixed, line_total
  FROM vw_clean_transactions
  WHERE doc_no LIKE '%11984%'
    AND account_no = 'FAM000'
    AND entry_type = 'Crd Note'
  ORDER BY stock_no;
`);
console.table(viewRes.rows);

// 5. Sum from view
console.log('\n═══ 5. vw_clean_transactions TOTAL ═══');
const viewSumRes = await client.query(`
  SELECT 
    ROUND(SUM(line_total)::numeric, 2) AS view_total
  FROM vw_clean_transactions
  WHERE doc_no LIKE '%11984%'
    AND account_no = 'FAM000'
    AND entry_type = 'Crd Note';
`);
console.table(viewSumRes.rows);

// 6. Cross-check: Header total vs Line item total
if (headerRes.rows.length > 0 && sumRes.rows.length > 0) {
  const headerTotal = parseFloat(headerRes.rows[0].computed_total);
  const lineTotal = parseFloat(sumRes.rows[0].sum_line_incl);
  const lineExcl = parseFloat(sumRes.rows[0].sum_line_excl);
  const headerExcl = parseFloat(headerRes.rows[0].amount_excl);
  const headerTax = parseFloat(headerRes.rows[0].tax_amount);
  
  console.log('\n═══ 6. CROSS-CHECK ANALYSIS ═══');
  console.log(`Header amount_excl:          R${headerExcl.toFixed(2)}`);
  console.log(`Header tax_amount:           R${headerTax.toFixed(2)}`);
  console.log(`Header computed total:       R${headerTotal.toFixed(2)} (amount_excl + tax_amount)`);
  console.log(`Line items sum (excl tax):   R${lineExcl.toFixed(2)}`);
  console.log(`Line items sum (incl tax):   R${lineTotal.toFixed(2)}`);
  console.log(`Delta (header - line_incl):  R${(headerTotal - lineTotal).toFixed(2)}`);
  console.log(`Delta (header_excl - line_excl): R${(headerExcl - lineExcl).toFixed(2)}`);
  
  // Check if header amount_excl actually equals line inclusive total
  if (Math.abs(headerExcl - lineTotal) < 0.05) {
    console.log('\n⚠️  CONFIRMED: header.amount_excl matches the INCLUSIVE line total, not exclusive.');
    console.log('    This means the ERP wrote the tax-inclusive amount into the exclusive field.');
  } else if (Math.abs(headerExcl - lineExcl) < 0.05) {
    console.log('\n✅  Header.amount_excl correctly matches the exclusive line total.');
  } else {
    console.log('\n❓  Neither match cleanly — further investigation needed.');
  }
}

await client.end();
