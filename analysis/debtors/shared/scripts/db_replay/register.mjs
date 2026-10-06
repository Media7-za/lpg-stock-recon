/**
 * Connector replay loader. Usage (from repo root):
 *   DATABASE_URL=replay://supabase-connector DB_REPLAY_DIR=<dir> \
 *     node --import ./analysis/debtors/shared/scripts/db_replay/register.mjs <script> [args]
 * Redirects only the bare specifier 'pg' to pg_replay.mjs. See replay_core.mjs.
 */
import { register } from 'node:module';

register('./hooks.mjs', import.meta.url);
