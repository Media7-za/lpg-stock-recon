import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres.');

    // Fetch all transaction items for Impendle accounts
    const itemsRes = await client.query(`
      SELECT 
        id, entry_type, period, tx_date::text as date, doc_no, stock_no, description, 
        qty::numeric as qty, retail_price::numeric as price, cost_price::numeric as cost, 
        line_tax::numeric as tax, rep_code, rep_name, account_no, account_name
      FROM transaction_items
      WHERE account_no IN ('BU0003', 'BU0009')
      ORDER BY tx_date ASC
    `);
    
    // Fetch all transaction headers for Impendle accounts to compute payments, credit terms, and balances
    const headersRes = await client.query(`
      SELECT 
        id, entry_type, period, tx_date::text as date, doc_no, ref_no, description, 
        amount_excl::numeric as amount_excl, tax_amount::numeric as tax_amount, account_no, account_name
      FROM transaction_headers
      WHERE account_no IN ('BU0003', 'BU0009')
      ORDER BY tx_date ASC
    `);

    console.log(`Loaded ${itemsRes.rows.length} transaction items and ${headersRes.rows.length} transaction headers.`);

    // Let's write the analysis logic in JS
    const items = itemsRes.rows;
    const headers = headersRes.rows;

    fs.writeFileSync('scripts/impendle_items.json', JSON.stringify(items, null, 2));
    fs.writeFileSync('scripts/impendle_headers.json', JSON.stringify(headers, null, 2));

    console.log('Saved raw data to JSON files.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
