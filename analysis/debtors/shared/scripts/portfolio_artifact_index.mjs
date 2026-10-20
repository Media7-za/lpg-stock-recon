#!/usr/bin/env node
/**
 * Build the per-account artifact index — Register 2 of REGISTERS_PLAN.md.
 *
 * @scope        universal
 * @durability   permanent
 * @entrypoint   npm run debtors:artifact-index
 *
 * No `@owns-slice`: this register is not itself a slice. Minting a slice id for it
 * would amend SLICE_REGISTRY.json, which carries its own ratification date and is
 * not in scope for decision D4.
 *
 * Answers, without walking 22 account directories: which accounts have a v5
 * statement, which are still on v4, which have a tag-coverage report and how stale
 * it is, which carry an override config and which run on defaults.
 *
 * Keyed by SLICE_REGISTRY.json slice ids, so the index inherits that register's
 * dependency DAG and gets staleness for free: a slice whose newest output predates
 * a slice it depends on is stale by definition.
 *
 * Operator decision D4 fixes two things about this register:
 *
 *   1. It lives BESIDE project.json, in a single portfolio file, not inside each
 *      account's project.json. PROJECT_SCHEMA.md is therefore untouched, and
 *      project.json diffs stay reviewable instead of churning on every sync.
 *   2. It is REPORT-ONLY. Staleness and absence never fail `debtors:sync`. Failing
 *      the portfolio sync on staleness would repeat the migration mistake D19 §(6)
 *      exists to prevent.
 *
 * What this module deliberately does NOT do: decide whether an absent slice is a
 * defect. That needs the account's recon lane, and only 1 of 19 project.json files
 * declares one. Lanes are reported as OBSERVED from artifacts that exist, never as
 * an expectation an account has failed to meet.
 *
 * Gate logic is exported pure for contract tests — see portfolio_artifact_index.test.mjs.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

/** Directories under analysis/{lane}/ that are not accounts. */
export const NON_ACCOUNT_DIRS = new Set(['shared', 'Global Reports', 'evidence_exchange']);

/**
 * Last-commit time per repo-relative path, in epoch ms, from one reverse-chronological
 * `git log` pass.
 *
 * Filesystem mtime cannot answer "when was this generated" in a git working tree: a
 * fresh clone stamps every file with the checkout time. Measured on this repo, all 265
 * account report files carried mtimes inside a two-second window, which produced 21
 * confident and entirely false staleness findings. Commit time is the only date here
 * that survives a clone.
 *
 *   find analysis/debtors -path '*\/reports/*' -type f -printf '%T@\n' | cut -d. -f1 | sort -u
 *
 * @param {(args:string[])=>string} runGit
 */
export function gitCommitTimes(runGit) {
  const out = runGit(['log', '--pretty=format:C%ct', '--name-only', '--no-renames']);
  const times = new Map();
  let current = null;
  for (const line of out.split('\n')) {
    if (/^C\d+$/.test(line)) {
      current = Number(line.slice(1)) * 1000;
      continue;
    }
    if (!line || current === null) continue;
    // Reverse-chronological, so the first sighting of a path is its latest commit.
    if (!times.has(line)) times.set(line, current);
  }
  return times;
}

/**
 * Which lane a slice describes, derived from where its outputs land.
 *
 * SLICE_REGISTRY is the debtors register with two creditor slices appended, and those
 * two are the only ones whose outputs are written as absolute `analysis/creditors/`
 * paths. Every account-relative pattern (`reports/...`, `data/...`) therefore belongs
 * to the debtors lane. Without this, a creditor's own `reports/008ORY_Statement_
 * Account_v5.md` matches the DEBTOR v5 slice and the creditor reads as a debtor.
 */
export function sliceLane(slice) {
  for (const out of slice.outputs ?? []) {
    const m = out.match(/^analysis\/(debtors|creditors)\//);
    if (m) return m[1];
  }
  return 'debtors';
}

/**
 * Whether a slice is per-account or one portfolio-wide artifact.
 *
 * `portfolio.dashboard` writes a single `DEBTORS_DASHBOARD.md`. Matched per account it
 * reads as "present on all 22", which is true and useless — it says nothing about any
 * account. A repo-rooted output with no `{CODE}` in it is portfolio-level;
 * account-relative outputs are always per-account, `{CODE}` or not (`data/{run}/
 * context.json` has none and is still per-account).
 */
export function sliceGranularity(slice) {
  const files = (slice.outputs ?? []).filter((o) => !/\s/.test(o));
  if (!files.length) return 'portfolio';
  const repoRooted = files.every((o) => /^(analysis|src)\//.test(o) || !o.includes('/'));
  if (!repoRooted) return 'account';
  return files.some((o) => o.includes('{CODE}')) ? 'account' : 'portfolio';
}

/**
 * Resolve one SLICE_REGISTRY `outputs` entry into a repo-relative glob.
 *
 * Everything is normalised to repo-relative here so that matching never depends on
 * which directory a caller happened to scan.
 *
 * Not every output is a file. `d17.collections` declares "portfolio.sync exit code 2",
 * a process outcome; reporting that as an absent file would be a false negative
 * dressed up as a finding. A `#fragment` suffix names a key inside the file rather
 * than a separate artifact, so it is kept beside the path, not treated as one.
 */
export function resolveOutput(pattern, { code, lane }) {
  if (/\s/.test(pattern)) return { kind: 'non-file', assertion: pattern };

  const [rawPath, pointer] = pattern.split('#');
  const withCode = rawPath.replace(/\{CODE\}/g, code);

  let glob;
  if (/^(analysis|src)\//.test(withCode)) glob = withCode;
  else if (withCode.startsWith('evidence_exchange/')) glob = `analysis/${lane}/${withCode}`;
  else if (!withCode.includes('/')) glob = withCode;
  else glob = `analysis/${lane}/${code}/${withCode}`;

  return { kind: 'file', glob, pointer: pointer ?? null, scanRoot: literalPrefixDir(glob) };
}

/**
 * Longest literal directory prefix of a glob, before any `*` or `{placeholder}`.
 * Used to scan only the subtree a pattern can possibly match, instead of guessing a
 * fixed list of roots — a guess that silently reported 19 present `project.json`
 * files as absent.
 */
export function literalPrefixDir(glob) {
  const parts = glob.split('/');
  const literal = [];
  for (const part of parts.slice(0, -1)) {
    if (/[*{]/.test(part)) break;
    literal.push(part);
  }
  return literal.join('/');
}

/** Compile a slice output pattern to a regex. `*` and `{...}` match within one segment. */
export function globToRegExp(glob) {
  const source = glob
    .split(/(\{[^}]*\}|\*)/)
    .map((part) => (/^(\{[^}]*\}|\*)$/.test(part) ? '[^/]*' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${source}$`);
}

/**
 * Index one account against every slice that belongs to its lane.
 *
 * @param {object} env
 * @param {string} env.code
 * @param {string} env.lane
 * @param {Array} env.slices                        SLICE_REGISTRY slices.
 * @param {(root:string)=>string[]} env.listFiles  Repo-relative files under a root.
 * @param {(rel:string)=>{at:number|null,source:string|null}} env.dateOf
 */
export function indexAccount({ code, lane, slices, listFiles, dateOf }) {
  const scanCache = new Map();
  const filesUnder = (root) => {
    if (!scanCache.has(root)) scanCache.set(root, listFiles(root));
    return scanCache.get(root);
  };

  const out = {};
  for (const slice of slices) {
    // A slice from another lane is not "absent" here, it is out of scope. Reporting it
    // would invite the creditor/debtor confusion this filter exists to stop.
    if (sliceLane(slice) !== lane) continue;
    // Portfolio-wide artifacts are reported once, at portfolio level, not 22 times.
    if (sliceGranularity(slice) === 'portfolio') continue;

    const resolved = (slice.outputs ?? []).map((p) => resolveOutput(p, { code, lane }));
    // A slice with no file outputs at all is portfolio-level and was already skipped
    // above, so only the mixed case reaches here: real files plus a process assertion.
    const fileOutputs = resolved.filter((r) => r.kind === 'file');
    const assertions = resolved.filter((r) => r.kind === 'non-file').map((r) => r.assertion);
    const common = {
      tier: slice.tier,
      scope: slice.scope,
      lane: slice.lane ?? null,
      optional: slice.optional ?? false,
      ...(assertions.length ? { assertions } : {}),
    };

    const matches = [];
    for (const r of fileOutputs) {
      const rx = globToRegExp(r.glob);
      for (const f of filesUnder(r.scanRoot)) {
        if (rx.test(f)) matches.push({ path: f, pointer: r.pointer });
      }
    }

    const dated = [...new Map(matches.map((m) => [m.path, m])).values()]
      .map((m) => ({ ...m, ...dateOf(m.path) }))
      .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

    const newest = dated[0];
    out[slice.id] = {
      ...common,
      status: dated.length ? 'present' : 'absent',
      count: dated.length,
      paths: dated.map((m) => m.path),
      last_change: newest?.at ? new Date(newest.at).toISOString() : null,
      // Named per §6: only a git-sourced date is comparable across clones. A generated
      // but uncommitted artifact falls back to mtime, and says so.
      last_change_source: newest?.source ?? null,
    };
  }
  return out;
}

/**
 * How close two commits must be to count as one work session rather than a refresh gap.
 *
 * Regenerating a chain and committing it in two or three commits is normal practice, and
 * it leaves the dependency with a strictly later timestamp than its dependent. FIR001
 * showed this exactly: the v5 statement committed at 09:55:03, its ingest coverage at
 * 09:55:08, in a commit whose own message records the v5 regeneration. Reported as
 * staleness that is simply wrong. An hour is well past any commit-splitting gap and well
 * short of the multi-day gaps that indicate a real missed refresh (TWK002: 19 days).
 *
 * Pairs inside the window are reported as `same_session`, not discarded.
 */
export const SAME_SESSION_MS = 60 * 60 * 1000;

/**
 * Staleness by the DAG: a present slice whose newest output predates a present slice
 * it depends on.
 *
 * Two classes of edge are skipped rather than guessed at:
 *
 *   - `depends_on` also names evidence ids (`evidence.erp_txt` and friends) which
 *     declare no outputs, so there is nothing to compare and no honest verdict.
 *   - A comparison is only made when BOTH dates came from git. A date read off the
 *     filesystem reflects when the file was checked out or last regenerated locally,
 *     which is not comparable to a commit date, and mixing the two manufactures
 *     findings. Skipped pairs are counted, not dropped.
 *
 * Same-commit outputs are equal, not stale: regenerating a chain in one commit is
 * correct behaviour, so only a strictly older dependent counts.
 */
export function detectStaleness(accountSlices, slices, tolerance = SAME_SESSION_MS) {
  const bySliceId = new Map(slices.map((s) => [s.id, s]));
  const stale = [];
  const sameSession = [];
  let notComparable = 0;

  for (const [id, row] of Object.entries(accountSlices)) {
    if (row.status !== 'present' || !row.last_change) continue;
    const slice = bySliceId.get(id);
    if (!slice) continue;

    for (const depId of slice.depends_on ?? []) {
      const dep = accountSlices[depId];
      if (!dep || dep.status !== 'present' || !dep.last_change) continue;
      if (row.last_change_source !== 'git' || dep.last_change_source !== 'git') {
        notComparable += 1;
        continue;
      }
      const gap = Date.parse(dep.last_change) - Date.parse(row.last_change);
      if (gap <= 0) continue;
      const finding = {
        slice: id,
        slice_last_change: row.last_change,
        stale_against: depId,
        dependency_last_change: dep.last_change,
        gap_hours: Math.round((gap / 3600000) * 10) / 10,
      };
      if (gap <= tolerance) sameSession.push(finding);
      else stale.push(finding);
    }
  }
  return { stale, same_session: sameSession, not_comparable: notComparable };
}

/** Lanes an account is OBSERVED to be on, from lane-specific slices that exist. */
export function observedLanes(accountSlices) {
  const lanes = new Set();
  for (const row of Object.values(accountSlices)) {
    if (row.status === 'present' && row.lane) lanes.add(row.lane);
  }
  return [...lanes].sort();
}

export function buildIndex({ sliceRegistry, accounts, listFiles, dateOf, now = () => new Date() }) {
  const slices = sliceRegistry.slices;
  const perAccount = {};

  for (const { code, lane } of accounts) {
    const sliceRows = indexAccount({ code, lane, slices, listFiles, dateOf });
    const counts = { present: 0, absent: 0, 'not-a-file': 0 };
    for (const row of Object.values(sliceRows)) counts[row.status] += 1;
    const { stale, same_session, not_comparable } = detectStaleness(sliceRows, slices);

    perAccount[code] = {
      lane_root: lane,
      observed_lanes: observedLanes(sliceRows),
      counts,
      stale,
      same_session_regeneration: same_session,
      staleness_not_comparable: not_comparable,
      slices: sliceRows,
    };
  }

  // Portfolio roll-up: which accounts hold each slice. This is the lookup the plan
  // exists to make possible — "who has a v5 statement" without a directory walk.
  const bySlice = {};
  const portfolioSlices = {};
  for (const slice of slices) {
    const lane = sliceLane(slice);
    if (sliceGranularity(slice) === 'portfolio') {
      const resolved = (slice.outputs ?? []).map((p) => resolveOutput(p, { code: '', lane }));
      const files = resolved.filter((r) => r.kind === 'file');
      const matched = files.flatMap((r) => {
        const rx = globToRegExp(r.glob);
        return listFiles(r.scanRoot).filter((f) => rx.test(f));
      });
      const newest = matched
        .map((p) => ({ path: p, ...dateOf(p) }))
        .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))[0];
      portfolioSlices[slice.id] = {
        tier: slice.tier,
        scope: slice.scope,
        applies_to_lane: lane,
        status: files.length === 0 ? 'not-a-file' : matched.length ? 'present' : 'absent',
        assertions: resolved.filter((r) => r.kind === 'non-file').map((r) => r.assertion),
        paths: matched,
        last_change: newest?.at ? new Date(newest.at).toISOString() : null,
        last_change_source: newest?.source ?? null,
      };
      continue;
    }

    const inLane = Object.entries(perAccount).filter(([, a]) => a.lane_root === lane);
    const present = inLane
      .filter(([, a]) => a.slices[slice.id]?.status === 'present')
      .map(([code]) => code)
      .sort();
    bySlice[slice.id] = {
      tier: slice.tier,
      scope: slice.scope,
      applies_to_lane: lane,
      lane: slice.lane ?? null,
      optional: slice.optional ?? false,
      not_a_file: inLane.some(([, a]) => a.slices[slice.id]?.status === 'not-a-file'),
      accounts_in_scope: inLane.length,
      accounts_present: present,
      present_count: present.length,
      accounts_absent: inLane
        .filter(([, a]) => a.slices[slice.id]?.status === 'absent')
        .map(([code]) => code)
        .sort(),
    };
  }

  const staleTotal = Object.values(perAccount).reduce((n, a) => n + a.stale.length, 0);
  const sameSessionTotal = Object.values(perAccount).reduce(
    (n, a) => n + a.same_session_regeneration.length,
    0,
  );
  const notComparable = Object.values(perAccount).reduce((n, a) => n + a.staleness_not_comparable, 0);

  return {
    $schema: 'debtors/portfolio-artifact-index/v1',
    generated_by: 'analysis/debtors/shared/scripts/portfolio_artifact_index.mjs',
    generated_at: now().toISOString(),
    authority: 'analysis/debtors/shared/DEBTORS_DOCTRINE.md',
    plan: 'analysis/debtors/shared/docs/REGISTERS_PLAN.md',
    ruling:
      'Operator decision D4 — index lives beside project.json in one portfolio file, and is report-only. Staleness never fails debtors:sync.',
    slice_registry_version: sliceRegistry.version,
    enforcement: 'report-only',
    date_basis:
      'Last git commit touching the file. Filesystem mtime is not used for comparison: a fresh clone stamps every file with the checkout time, which put all 265 report mtimes inside a two-second window and produced 21 false staleness findings. An uncommitted artifact falls back to mtime and is labelled last_change_source: "filesystem", and is never compared.',
    reading_guide: {
      present: 'At least one file matched the slice output pattern.',
      absent:
        'No file matched. NOT a defect on its own — a lane-specific slice is absent by design on an account not routed to that lane, and lane routing is not machine-readable today.',
      'not-a-file': 'The slice declares a process outcome rather than an artifact, so presence cannot be observed on disk.',
      observed_lanes: 'Inferred FROM artifacts that exist. Never an expectation the account has failed to meet.',
      stale: 'Slice committed more than an hour before something it depends on. Report-only under D4.',
      same_session_regeneration:
        'Dependency committed within an hour of its dependent — chain regenerated in one session and split across commits, not staleness.',
      staleness_not_comparable: 'Dependency pairs skipped because at least one date was not git-sourced.',
    },
    totals: {
      accounts: Object.keys(perAccount).length,
      slices: slices.length,
      account_slices: Object.keys(bySlice).length,
      portfolio_slices: Object.keys(portfolioSlices).length,
      stale_rows: staleTotal,
      same_session_rows: sameSessionTotal,
      staleness_not_comparable: notComparable,
    },
    portfolio_slices: portfolioSlices,
    by_slice: bySlice,
    accounts: perAccount,
  };
}

export function renderMarkdown(index, sliceRegistry) {
  const lines = [];
  const accounts = Object.keys(index.accounts).sort();
  const slices = sliceRegistry.slices;

  lines.push('# Portfolio Artifact Index');
  lines.push('');
  lines.push(`> **Enforcement:** \`${index.enforcement}\` — operator decision **D4**  `);
  lines.push('> **Canonical machine-readable index:** `analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json`  ');
  lines.push(`> **Keyed by:** \`SLICE_REGISTRY.json\` v${index.slice_registry_version}  `);
  lines.push(`> **Plan:** \`${index.plan}\`  `);
  lines.push('> **Generated — do not edit.** Regenerate: `npm run debtors:artifact-index:write`');
  lines.push('');
  lines.push(
    `${index.totals.accounts} accounts × ${index.totals.account_slices} per-account slices, plus ` +
      `${index.totals.portfolio_slices} portfolio-wide slices reported once. ` +
      `${index.totals.stale_rows} slice(s) were committed before something they depend on.`,
  );
  lines.push('');
  lines.push(
    '**`absent` is not a defect.** A lane-specific slice is absent by design on an account not ' +
      'routed to that lane, and only 1 of 19 `project.json` files declares a lane, so the register ' +
      'reports what exists and refuses to infer what should.',
  );
  lines.push('');
  lines.push(
    '**Dates are git commit dates.** Filesystem mtime is meaningless in a fresh clone — every ' +
      'file carries the checkout time — so staleness is only computed between two committed ' +
      `artifacts. ${index.totals.staleness_not_comparable} dependency pair(s) were skipped as not ` +
      'comparable rather than guessed at.',
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Which accounts hold which slice');
  lines.push('');
  lines.push('| Slice | Tier | Scope | Have it | Present on |');
  lines.push('| :--- | :--- | :--- | ---: | :--- |');
  for (const s of slices) {
    const row = index.by_slice[s.id];
    if (!row) continue;
    const who = row.not_a_file
      ? '_not an artifact_'
      : row.accounts_present.length
        ? row.accounts_present.map((c) => `\`${c}\``).join(' ')
        : '—';
    lines.push(
      `| \`${s.id}\` | ${s.tier} | ${s.scope} | ${row.present_count}/${row.accounts_in_scope} | ${who} |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Portfolio-wide slices');
  lines.push('');
  lines.push('One artifact for the whole portfolio, so presence says nothing about any single account.');
  lines.push('');
  lines.push('| Slice | Status | Path | Last change |');
  lines.push('| :--- | :--- | :--- | :--- |');
  for (const [id, row] of Object.entries(index.portfolio_slices)) {
    const where = row.paths.length
      ? row.paths.map((p) => `\`${p}\``).join(' ')
      : row.assertions.length
        ? `_${row.assertions.join('; ')}_`
        : '—';
    lines.push(
      `| \`${id}\` | ${row.status} | ${where} | ${row.last_change ? row.last_change.slice(0, 10) : '—'} |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Per-account coverage');
  lines.push('');
  lines.push('| Account | Observed lanes | Present | Absent | Stale |');
  lines.push('| :--- | :--- | ---: | ---: | ---: |');
  for (const code of accounts) {
    const a = index.accounts[code];
    const lanes = a.observed_lanes.length ? a.observed_lanes.join(' · ') : '_none observed_';
    lines.push(
      `| \`${code}\` | ${lanes} | ${a.counts.present} | ${a.counts.absent} | ${a.stale.length || '—'} |`,
    );
  }
  lines.push('');

  const staleRows = accounts.flatMap((code) => index.accounts[code].stale.map((s) => ({ code, ...s })));
  if (staleRows.length) {
    lines.push('---');
    lines.push('');
    lines.push('## Stale slices');
    lines.push('');
    lines.push(
      'A slice regenerated before something it depends on. Report-only: the sync does not fail on ' +
        'these, because a stale derived artifact is a refresh job, not a correctness violation.',
    );
    lines.push('');
    lines.push('| Account | Slice | Committed | Older than | Dependency committed | Gap |');
    lines.push('| :--- | :--- | :--- | :--- | :--- | ---: |');
    for (const r of staleRows) {
      lines.push(
        `| \`${r.code}\` | \`${r.slice}\` | ${r.slice_last_change.slice(0, 10)} | \`${r.stale_against}\` | ${r.dependency_last_change.slice(0, 10)} | ${Math.round(r.gap_hours / 24)}d |`,
      );
    }
    lines.push('');
  }

  const sameSession = accounts.flatMap((code) =>
    index.accounts[code].same_session_regeneration.map((s) => ({ code, ...s })),
  );
  if (sameSession.length) {
    lines.push('---');
    lines.push('');
    lines.push('## Same-session regeneration — not stale');
    lines.push('');
    lines.push(
      'Dependency committed within an hour of its dependent: the chain was regenerated together ' +
        'and split across commits. Listed so the exclusion is visible rather than silent.',
    );
    lines.push('');
    lines.push('| Account | Slice | Older than | Gap |');
    lines.push('| :--- | :--- | :--- | ---: |');
    for (const r of sameSession) {
      lines.push(
        `| \`${r.code}\` | \`${r.slice}\` | \`${r.stale_against}\` | ${Math.round(r.gap_hours * 3600)}s |`,
      );
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

/** Discover accounts across both lanes. */
export function discoverAccounts(ROOT, lanes = ['debtors', 'creditors']) {
  const found = [];
  for (const lane of lanes) {
    const laneDir = path.join(ROOT, 'analysis', lane);
    if (!fs.existsSync(laneDir)) continue;
    for (const entry of fs.readdirSync(laneDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || NON_ACCOUNT_DIRS.has(entry.name)) continue;
      found.push({ code: entry.name, lane });
    }
  }
  return found.sort((a, b) => a.lane.localeCompare(b.lane) || a.code.localeCompare(b.code));
}

/**
 * Real filesystem views over repo-relative paths.
 *
 * Scan roots come from the patterns themselves, so the only thing walked is a subtree
 * some pattern can actually match. Results are cached across accounts because the
 * shared roots (UI fixtures, the repo root) are re-requested 23 times otherwise.
 */
export function fsViews(ROOT) {
  const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.venv', '__pycache__', 'snapshots']);
  const cache = new Map();

  const walk = (root, prefix, acc, depth) => {
    if (depth > 8) return acc;
    let entries;
    try {
      entries = fs.readdirSync(path.join(ROOT, root), { withFileTypes: true });
    } catch {
      return acc;
    }
    for (const e of entries) {
      if (SKIP.has(e.name)) continue;
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(rel, rel, acc, depth + 1);
      else if (e.isFile()) acc.push(rel);
    }
    return acc;
  };

  const listFiles = (scanRoot) => {
    if (!cache.has(scanRoot)) {
      // An empty scanRoot means a root-level file pattern such as DEBTORS_DASHBOARD.md;
      // that must not become a full-checkout crawl.
      const files = scanRoot
        ? walk(scanRoot, scanRoot, [], 0)
        : fs
            .readdirSync(ROOT, { withFileTypes: true })
            .filter((e) => e.isFile())
            .map((e) => e.name);
      cache.set(scanRoot, files);
    }
    return cache.get(scanRoot);
  };

  const mtimeOf = (rel) => {
    try {
      return fs.statSync(path.join(ROOT, rel)).mtimeMs;
    } catch {
      return null;
    }
  };

  return { listFiles, mtimeOf };
}

const INDEX_REL = 'analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json';
const VIEW_REL = 'analysis/debtors/shared/docs/PORTFOLIO_ARTIFACT_INDEX.md';

/**
 * Build and optionally write the index. Called by debtors_sync so there is one
 * portfolio entry point rather than a parallel script, per REGISTERS_PLAN §4.
 *
 * @returns {{index: object, written: string[]}}
 */
export function runArtifactIndex(ROOT, { write = false } = {}) {
  const sliceRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json'), 'utf8'),
  );
  const { listFiles, mtimeOf } = fsViews(ROOT);

  let commitTimes = new Map();
  try {
    commitTimes = gitCommitTimes((args) =>
      spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout ?? '',
    );
  } catch {
    // No git (exported tarball); every date falls back to mtime and is labelled as
    // such, so staleness reports nothing rather than reporting noise.
  }

  const dateOf = (rel) => {
    const committed = commitTimes.get(rel);
    if (committed !== undefined) return { at: committed, source: 'git' };
    const mtime = mtimeOf(rel);
    return { at: mtime, source: mtime === null ? null : 'filesystem' };
  };

  const index = buildIndex({
    sliceRegistry,
    accounts: discoverAccounts(ROOT),
    listFiles,
    dateOf,
  });

  const written = [];
  if (write) {
    const json = `${JSON.stringify(index, null, 2)}\n`;
    if (writeIfChanged(path.join(ROOT, INDEX_REL), json, sameExceptGeneratedAt)) written.push(INDEX_REL);
    if (writeIfChanged(path.join(ROOT, VIEW_REL), renderMarkdown(index, sliceRegistry), sameExceptGeneratedAt)) {
      written.push(VIEW_REL);
    }
  }
  return { index, written };
}

/**
 * `generated_at` moves on every run, so an unconditional write would leave a modified
 * file behind each time `debtors:sync` ran — and the index runs there automatically.
 * A register whose only change is its own clock trains readers to ignore its diffs,
 * which is how a real drift finding gets skimmed past. The timestamp is kept, but it
 * now means "when the findings last changed", not "when the script last ran".
 */
export function sameExceptGeneratedAt(a, b) {
  const strip = (s) => s.replace(/^(\s*"generated_at":\s*).*$/m, '$1');
  return strip(a) === strip(b);
}

function writeIfChanged(absPath, next, equivalent) {
  let current = null;
  try {
    current = fs.readFileSync(absPath, 'utf8');
  } catch {
    // Absent — first generation, always a write.
  }
  if (current !== null && equivalent(current, next)) return false;
  fs.writeFileSync(absPath, next);
  return true;
}

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT = path.resolve(__dirname, '../../../..');
  const { index, written } = runArtifactIndex(ROOT, { write: process.argv.includes('--write') });

  const writing = process.argv.includes('--write');
  for (const w of written) console.log(`Wrote ${w}`);
  if (writing && !written.length) console.log('Unchanged — findings identical to the committed views.');
  console.log(
    `\nArtifact index — ${index.totals.accounts} accounts × ${index.totals.slices} slices · ` +
      `${index.totals.stale_rows} stale (report-only)`,
  );
  // Report-only by D4: no non-zero exit, whatever the findings.
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
