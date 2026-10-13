import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- Connected to Supabase Postgres ---\n');

    // 1. Payment polarity: Are payments always negative, or are there positive payments?
    console.log('=== 1. Payment Polarity ===');
    const pmtPolarityRes = await client.query(`
      SELECT 
        CASE WHEN (amount_excl + tax_amount) < 0 THEN 'Negative'
             WHEN (amount_excl + tax_amount) > 0 THEN 'Positive'
             ELSE 'Zero' END as polarity,
        COUNT(*) as cnt,
        MIN(amount_excl + tax_amount) as min_amt,
        MAX(amount_excl + tax_amount) as max_amt,
        SUM(amount_excl + tax_amount) as sum_amt
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Payment'
      GROUP BY polarity;
    `);
    console.table(pmtPolarityRes.rows);

    // 2. Invoice polarity: Are invoices always positive?
    console.log('\n=== 2. Invoice Polarity ===');
    const invPolarityRes = await client.query(`
      SELECT 
        CASE WHEN (amount_excl + tax_amount) < 0 THEN 'Negative'
             WHEN (amount_excl + tax_amount) > 0 THEN 'Positive'
             ELSE 'Zero' END as polarity,
        COUNT(*) as cnt,
        MIN(amount_excl + tax_amount) as min_amt,
        MAX(amount_excl + tax_amount) as max_amt,
        SUM(amount_excl + tax_amount) as sum_amt
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Invoice'
      GROUP BY polarity;
    `);
    console.table(invPolarityRes.rows);

    // 3. Credit Note polarity: Are they always negative?
    console.log('\n=== 3. Credit Note Polarity ===');
    const crnPolarityRes = await client.query(`
      SELECT 
        CASE WHEN (amount_excl + tax_amount) < 0 THEN 'Negative'
             WHEN (amount_excl + tax_amount) > 0 THEN 'Positive'
             ELSE 'Zero' END as polarity,
        COUNT(*) as cnt,
        MIN(amount_excl + tax_amount) as min_amt,
        MAX(amount_excl + tax_amount) as max_amt,
        SUM(amount_excl + tax_amount) as sum_amt
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Crd Note'
      GROUP BY polarity;
    `);
    console.table(crnPolarityRes.rows);

    // 4. Detailed analysis of duplicated doc_no '00016282' (count 7)
    console.log('\n=== 4. Detailed Inspection of duplicated doc_no 00016282 ===');
    const duplicateRes = await client.query(`
      SELECT id, entry_type, period, doc_no, ref_no, description, batch_ref, tx_date, (amount_excl + tax_amount) as total_amount, available_balance
      FROM transaction_headers
      WHERE account_no = 'INC001' AND doc_no = '00016282'
      ORDER BY tx_date, entry_type;
    `);
    console.table(duplicateRes.rows);

    // 5. Let's check another duplicate with count > 1, e.g. doc_no '00017912' (count 4)
    console.log('\n=== 5. Detailed Inspection of duplicated doc_no 00017912 ===');
    const duplicateRes2 = await client.query(`
      SELECT id, entry_type, period, doc_no, ref_no, description, batch_ref, tx_date, (amount_excl + tax_amount) as total_amount, available_balance
      FROM transaction_headers
      WHERE account_no = 'INC001' AND doc_no = '00017912'
      ORDER BY tx_date, entry_type;
    `);
    console.table(duplicateRes2.rows);

    // 6. Are there actual duplicate payments (same doc_no and entry_type = 'Payment')?
    console.log('\n=== 6. Duplicate Payments (Same entry_type and doc_no) ===');
    const dupPmtRes = await client.query(`
      SELECT doc_no, COUNT(*) as cnt
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Payment'
      GROUP BY doc_no
      HAVING COUNT(*) > 1;
    `);
    console.log(`Found ${dupPmtRes.rowCount} duplicate Payment doc_nos.`);
    if (dupPmtRes.rowCount > 0) {
      console.table(dupPmtRes.rows);
    }

    // 7. Let's see if there are positive payments in the entire table across all accounts
    console.log('\n=== 7. Payment Polarity Across ALL Accounts ===');
    const allPmtPolarityRes = await client.query(`
      SELECT 
        CASE WHEN (amount_excl + tax_amount) < 0 THEN 'Negative'
             WHEN (amount_excl + tax_amount) > 0 THEN 'Positive'
             ELSE 'Zero' END as polarity,
        COUNT(*) as cnt
      FROM transaction_headers
      WHERE entry_type = 'Payment'
      GROUP BY polarity;
    `);
    console.table(allPmtPolarityRes.rows);

    // 8. Sample Payment Rows: Let's output 3 actual Payment records for INC001
    console.log('\n=== 8. Sample Payment Records for INC001 ===');
    const samplePmtRes = await client.query(`
      SELECT id, entry_type, doc_no, ref_no, description, batch_ref, tx_date, amount_excl, tax_amount, available_balance
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Payment'
      LIMIT 3;
    `);
    console.log(JSON.stringify(samplePmtRes.rows, null, 2));

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
