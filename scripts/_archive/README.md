# Archived scripts (2026-10-13)

Moved here on operator instruction ("Archive them", 2026-10-13) after an audit found no references to them anywhere in the repo (no document, skill, test, other script or `package.json` entry) and no commit since 2026-07-20. Moved, not deleted; git history is intact.

One-off exploration and query scripts (Impendle/BU0009 analysis, BR0001 and note checks, payment and balance queries, CN 11984 check). `deploy-lsr5-schema.mjs`, `seed-lsr5-data.mjs`, `importDexieExport.mjs` and `manage-auth-users.mjs` were deliberately left in place.

Nothing here is part of the live pipeline (`reconcile_debtor_v5_from_txt.mjs`, `match_projection.mjs`, the generators). Not checked: which committed outputs, if any, these scripts originally produced. To restore: `git mv <this folder>/<file> <parent folder>/<file>`.
