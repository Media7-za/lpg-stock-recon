/**
 * Shared DB connection helpers — never embed credentials in scripts.
 * Set DATABASE_URL in the environment before running ingest/reconcile scripts.
 */
export function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('ERROR: DATABASE_URL environment variable is required.');
    process.exit(1);
  }
  return url;
}

export function pgClientOptions() {
  const connectionString = requireDatabaseUrl();
  return {
    connectionString,
    // Strict verification by default. Supabase pooler often needs PGSSL_REJECT_UNAUTHORIZED=false
    // until operator configures CA bundle post-credential rotation.
    ssl: { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' },
  };
}
