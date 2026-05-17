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

    // 1. Column details of transaction_headers
    console.log('=== 1. Table Schema of transaction_headers ===');
    const colsRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transaction_headers'
      ORDER BY ordinal_position;
    `);
    console.table(colsRes.rows);

    // 2. DTRX Discovery: Entry Types & Counts for INC001
    console.log('\n=== 2. DTRX Discovery: Entry Types & Counts for INC001 ===');
    const discoveryRes = await client.query(`
      SELECT DISTINCT entry_type, COUNT(*) AS cnt
      FROM transaction_headers
      WHERE account_no = 'INC001'
      GROUP BY entry_type
      ORDER BY cnt DESC;
    `);
    console.table(discoveryRes.rows);

    // 3. Overall unique entry types across the whole table (not just INC001)
    console.log('\n=== 3. Unique Entry Types across ALL Accounts ===');
    const allTypesRes = await client.query(`
      SELECT DISTINCT entry_type, COUNT(*) AS cnt
      FROM transaction_headers
      GROUP BY entry_type
      ORDER BY cnt DESC;
    `);
    console.table(allTypesRes.rows);

    // 4. Sample rows of each entry_type for INC001
    console.log('\n=== 4. Sample Rows for each Entry Type (INC001) ===');
    for (const row of discoveryRes.rows) {
      const type = row.entry_type;
      console.log(`\n--- Samples for entry_type: "${type}" ---`);
      const sampleRes = await client.query({
        text: `SELECT id, entry_type, period, account_no, account_name, doc_no, ref_no, description, batch_ref, tx_date, amount_excl, tax_amount, available_balance FROM transaction_headers WHERE account_no = 'INC001' AND entry_type = $1 LIMIT 3`,
        values: [type]
      });
      console.log(JSON.stringify(sampleRes.rows, null, 2));
    }

    // 5. Look for potential reversal markers (reversal, correction, negative amount, etc.)
    console.log('\n=== 5. Reversal and Correction Markers (INC001) ===');
    const reversalRes = await client.query(`
      SELECT id, entry_type, doc_no, ref_no, (amount_excl + tax_amount) as total_amount, available_balance, tx_date, description
      FROM transaction_headers
      WHERE account_no = 'INC001'
      AND (
        (amount_excl + tax_amount) < 0 
        OR entry_type ILIKE '%revers%' 
        OR description ILIKE '%revers%' 
        OR doc_no ILIKE '%revers%'
        OR ref_no ILIKE '%revers%'
        OR ref_no ILIKE '%cn%'
        OR ref_no ILIKE '%rv%'
      )
      LIMIT 15;
    `);
    console.log(`Found ${reversalRes.rowCount} potential reversal/correction rows.`);
    if (reversalRes.rowCount > 0) {
      console.table(reversalRes.rows);
    }

    // 6. Check for duplicate imports (duplicate doc_no or other keys)
    console.log('\n=== 6. Duplicate Import Patterns (Duplicate doc_no for INC001) ===');
    const dupRes = await client.query(`
      SELECT doc_no, COUNT(*), MIN(amount_excl + tax_amount) as min_amt, MAX(amount_excl + tax_amount) as max_amt, MIN(tx_date) as min_date
      FROM transaction_headers
      WHERE account_no = 'INC001'
      GROUP BY doc_no
      HAVING COUNT(*) > 1
      LIMIT 15;
    `);
    console.log(`Found ${dupRes.rowCount} duplicate doc_nos.`);
    if (dupRes.rowCount > 0) {
      console.table(dupRes.rows);
    }

    // 7. General payment completeness check
    console.log('\n=== 7. Payment Completeness Check (DTRX total vs other sources) ===');
    const totalPmtRes = await client.query(`
      SELECT COUNT(*) as total_count, SUM(amount_excl + tax_amount) as total_amount
      FROM transaction_headers
      WHERE account_no = 'INC001'
      AND entry_type = 'Payment';
    `);
    console.table(totalPmtRes.rows);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
