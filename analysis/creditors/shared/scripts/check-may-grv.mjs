import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- Connected to Supabase Postgres ---\n');

    // 1. Get count and total of GRVs in May 2026 in transaction_headers
    console.log('=== 1. GRV Summary in transaction_headers (May 2026) ===');
    const thRes = await client.query(`
      SELECT 
        entry_type,
        COUNT(*) as count,
        SUM(amount_excl) as total_amount_excl,
        SUM(tax_amount) as total_tax,
        SUM(amount_excl + tax_amount) as total_amount_incl
      FROM transaction_headers
      WHERE entry_type = 'GRV'
        AND tx_date >= '2026-05-01'
        AND tx_date <= '2026-05-31'
      GROUP BY entry_type
    `);
    console.table(thRes.rows);

    // 2. Get count and total of GRVs in May 2026 in transaction_items
    console.log('\n=== 2. GRV Summary in transaction_items (May 2026) ===');
    const tiRes = await client.query(`
      SELECT 
        entry_type,
        COUNT(*) as count,
        SUM(qty * cost_price) as total_cost_price,
        SUM(qty * retail_price) as total_retail_price
      FROM transaction_items
      WHERE entry_type = 'GRV'
        AND tx_date >= '2026-05-01'
        AND tx_date <= '2026-05-31'
      GROUP BY entry_type
    `);
    console.table(tiRes.rows);

    // 3. Show details of all GRVs in May 2026 in transaction_headers
    console.log('\n=== 3. List of May 2026 GRVs (transaction_headers) ===');
    const thDetails = await client.query(`
      SELECT 
        id,
        tx_date::text as date,
        account_no,
        account_name,
        doc_no,
        ref_no,
        description,
        amount_excl,
        tax_amount,
        (amount_excl + tax_amount) as amount_incl,
        source_file
      FROM transaction_headers
      WHERE entry_type = 'GRV'
        AND tx_date >= '2026-05-01'
        AND tx_date <= '2026-05-31'
      ORDER BY tx_date ASC, doc_no ASC
    `);
    console.log(JSON.stringify(thDetails.rows, null, 2));

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
