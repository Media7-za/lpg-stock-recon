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

    console.log('\n=== 1. Checking if available_balance differs from (amount_excl + tax_amount) ===');
    const balanceDiffRes = await client.query(`
      SELECT 
        COUNT(*) as total_rows,
        SUM(CASE WHEN ROUND(available_balance, 2) != ROUND(amount_excl + tax_amount, 2) THEN 1 ELSE 0 END) as diff_rows,
        MIN(available_balance - (amount_excl + tax_amount)) as min_diff,
        MAX(available_balance - (amount_excl + tax_amount)) as max_diff
      FROM transaction_headers
      WHERE account_no = 'INC001';
    `);
    console.table(balanceDiffRes.rows);

    console.log('\n=== 2. Inspecting the 8 Positive Payments for INC001 ===');
    const positivePmtsRes = await client.query(`
      SELECT id, entry_type, doc_no, ref_no, description, batch_ref, tx_date, (amount_excl + tax_amount) as total_amount, available_balance
      FROM transaction_headers
      WHERE account_no = 'INC001' AND entry_type = 'Payment' AND (amount_excl + tax_amount) > 0
      ORDER BY tx_date;
    `);
    console.table(positivePmtsRes.rows);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
