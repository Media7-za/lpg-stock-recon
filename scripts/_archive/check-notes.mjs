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

    // Query for all transactions for April and May 2026 for the suppliers
    const res = await client.query(`
      SELECT 
        tx_date::text as date,
        entry_type,
        account_no,
        account_name,
        doc_no,
        stock_no,
        description,
        qty::numeric as qty,
        cost_price::numeric as cost_price,
        line_tax::numeric as line_tax,
        source_file
      FROM transaction_items
      WHERE tx_date >= '2026-04-01'
        AND tx_date <= '2026-05-31'
        AND (account_no IN ('008ORY', '001MZM', '002MZM') OR account_name LIKE '%ORYX%' OR account_name LIKE '%MZM%')
        AND entry_type IN ('Deb Note', 'Crd Note', 'GRV')
      ORDER BY tx_date ASC, entry_type ASC
    `);

    const items = res.rows;
    console.log(`Total items found: ${items.length}\n`);

    const types = {};
    items.forEach(item => {
      types[item.entry_type] = (types[item.entry_type] || 0) + 1;
    });
    console.log('Transaction Counts by Entry Type:', types);
    console.log();

    const nonGrv = items.filter(item => item.entry_type !== 'GRV');
    if (nonGrv.length > 0) {
      console.log('=== Non-GRV Adjustments (Deb/Crd Notes) ===');
      console.table(nonGrv.map(item => ({
        date: item.date,
        entry_type: item.entry_type,
        account: `${item.account_no} - ${item.account_name}`,
        doc_no: item.doc_no,
        stock_no: item.stock_no,
        description: item.description,
        qty: item.qty,
        cost_price: item.cost_price,
        total_excl: (parseFloat(item.qty) * parseFloat(item.cost_price)).toFixed(2)
      })));
    } else {
      console.log('No Debit Notes or Credit Notes found for these suppliers in April/May 2026.');
    }

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
