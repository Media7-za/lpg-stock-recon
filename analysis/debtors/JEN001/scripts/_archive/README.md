# Archived scripts (2026-10-13)

Moved here on operator instruction ("Archive them", 2026-10-13) after an audit found no references to them anywhere in the repo (no document, skill, test, other script or `package.json` entry) and no commit since 2026-07-20. Moved, not deleted; git history is intact.

JEN001 superseded exploratory variants (DB-only monthly stripped v2 and v3, Excel exports v1 and v2). `reconcile_jen_db_only_monthly_stripped.py` (v1), the v4 scripts and the v5 script stay in place.

Nothing here is part of the live pipeline (`reconcile_debtor_v5_from_txt.mjs`, `match_projection.mjs`, the generators). Not checked: which committed outputs, if any, these scripts originally produced. To restore: `git mv <this folder>/<file> <parent folder>/<file>`.
