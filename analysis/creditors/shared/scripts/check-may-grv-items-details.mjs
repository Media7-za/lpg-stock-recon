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

    // Query details of the 33 GRV records in transaction_items for May 2026
    const res = await client.query(`
      SELECT 
        id::text,
        tx_date::text as date,
        entry_type,
        period,
        account_no,
        account_name,
        doc_no,
        stock_no,
        description,
        qty,
        cost_price,
        retail_price,
        reference,
        tax_code,
        line_tax,
        source_file
      FROM transaction_items
      WHERE entry_type = 'GRV'
        AND tx_date >= '2026-05-01'
        AND tx_date <= '2026-05-31'
      ORDER BY tx_date ASC, doc_no ASC, stock_no ASC
    `);
    
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
