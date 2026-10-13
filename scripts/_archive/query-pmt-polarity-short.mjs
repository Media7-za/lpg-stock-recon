import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- Connected to Supabase Postgres ---');

    console.log('\n=== 1. Payment Polarity for INC001 ===');
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

    console.log('\n=== 2. Invoice Polarity for INC001 ===');
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

    console.log('\n=== 3. Credit Note Polarity for INC001 ===');
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

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
