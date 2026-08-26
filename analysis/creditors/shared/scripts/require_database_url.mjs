import { requireDatabaseUrl as req } from '../../../debtors/shared/scripts/require_database_url.mjs';

export { requireDatabaseUrl } from '../../../debtors/shared/scripts/require_database_url.mjs';

export function pgClientOptions() {
  const connectionString = req();
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  return {
    connectionString,
    ssl: isLocal
      ? false
      : { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' },
  };
}
