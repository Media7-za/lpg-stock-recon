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

    // Query 1: Find if BR0001 exists as an account
    console.log('=== Checking account info for BR0001 ===');
    const accRes = await client.query(`
      SELECT * FROM accounts WHERE accno = 'BR0001'
    `);
    console.log(accRes.rows);

    // Query 2: Find count of transaction_headers for BR0001
    console.log('\n=== Checking transaction_headers count for BR0001 ===');
    const thCountRes = await client.query(`
      SELECT COUNT(*) as cnt, MIN(tx_date) as min_date, MAX(tx_date) as max_date
      FROM transaction_headers
      WHERE account_no = 'BR0001'
    `);
    console.log(thCountRes.rows);

    // Query 3: Find count of transaction_items for BR0001
    console.log('\n=== Checking transaction_items count for BR0001 ===');
    const tiCountRes = await client.query(`
      SELECT COUNT(*) as cnt, MIN(tx_date) as min_date, MAX(tx_date) as max_date
      FROM transaction_items
      WHERE account_no = 'BR0001'
    `);
    console.log(tiCountRes.rows);

    // Query 4: Sample 2026 records from transaction_headers for BR0001
    console.log('\n=== Sample 2026 transaction_headers for BR0001 ===');
    const thSamples = await client.query(`
      SELECT * 
      FROM transaction_headers
      WHERE account_no = 'BR0001' 
        AND tx_date >= '2026-01-01' 
        AND tx_date <= '2026-12-31'
      ORDER BY tx_date DESC
      LIMIT 10
    `);
    console.log(thSamples.rows);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
