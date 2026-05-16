import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Seed item_classifications
    console.log('Seeding item_classifications...');
    const classifications = [
      ['9.1', 'CYL_DEPOSIT', 'Shell'],
      ['14.1', 'CYL_DEPOSIT', 'Shell'],
      ['19.1', 'CYL_DEPOSIT', 'Shell'],
      ['S.1', 'CYL_DEPOSIT', 'Shell'],
      ['D.1', 'CYL_DEPOSIT', 'Shell'],
      ['9.4', 'LPG_CONTENT', 'Gas'],
      ['901', 'LPG_CONTENT', 'Gas'],
      ['14.4', 'LPG_CONTENT', 'Gas'],
      ['1401', 'LPG_CONTENT', 'Gas'],
      ['19.4', 'LPG_CONTENT', 'Gas'],
      ['1901', 'LPG_CONTENT', 'Gas'],
      ['S.4', 'LPG_CONTENT', 'Gas'],
      ['S01', 'LPG_CONTENT', 'Gas'],
      ['D.4', 'LPG_CONTENT', 'Gas'],
      ['D01', 'LPG_CONTENT', 'Gas']
    ];

    for (const [stock_no, bucket, group] of classifications) {
      await client.query(
        'INSERT INTO item_classifications (stock_no, business_bucket, logical_group) VALUES ($1, $2, $3) ON CONFLICT (stock_no) DO NOTHING',
        [stock_no, bucket, group]
      );
    }
    console.log('item_classifications seeded.');

    // 2. Seed app_config (Scoring Weights)
    console.log('Seeding app_config...');
    const scoringWeights = {
      EXACT_AMOUNT: 100,
      ITEM_OVERLAP: 40,
      DATE_PROXIMITY: 20,
      NAME_SIMILARITY: 10
    };

    await client.query(
      'INSERT INTO app_config (config_key, config_data) VALUES ($1, $2) ON CONFLICT (config_key) DO UPDATE SET config_data = $2',
      ['RECON_SCORING_WEIGHTS', JSON.stringify(scoringWeights)]
    );
    console.log('app_config (RECON_SCORING_WEIGHTS) seeded.');

    console.log('Seeding Complete!');
    
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

main();
