/**
 * Creditor DB connection helpers — re-exported from the debtor module so the
 * creditor micro-project never diverges from the shared credential doctrine.
 * Set DATABASE_URL in the environment before running ingest/reconcile scripts.
 *
 * `hasDatabaseUrl()` lets creditor scripts degrade gracefully to a TXT-only
 * (Tier-3) run when Supabase is not wired — Part 1B line-splits and Part 2
 * custody qty require the DB, but the ERP TXT financial bridge does not.
 */
export {
  requireDatabaseUrl,
  pgClientOptions,
} from '../../../debtors/shared/scripts/require_database_url.mjs';

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}
