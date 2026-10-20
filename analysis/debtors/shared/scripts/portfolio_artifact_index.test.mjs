// Portfolio artifact index contract tests — Register 2 (operator decision D4).
//
// Boundary under test: slice-pattern resolution, presence, lane scoping and staleness.
// No financial truth. The tests that matter most here are the ones that pin down what
// the register must REFUSE to claim: absence is not a defect, mtime is not a date, and
// a commit-split chain is not stale.
//
// Run: node --test analysis/debtors/shared/scripts/portfolio_artifact_index.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  NON_ACCOUNT_DIRS,
  SAME_SESSION_MS,
  gitCommitTimes,
  sliceLane,
  sliceGranularity,
  resolveOutput,
  literalPrefixDir,
  globToRegExp,
  indexAccount,
  detectStaleness,
  observedLanes,
  buildIndex,
  renderMarkdown,
  discoverAccounts,
  runArtifactIndex,
  sameExceptGeneratedAt,
} from './portfolio_artifact_index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const slice = (over = {}) => ({
  id: 'demo.slice',
  tier: 'derived',
  scope: 'universal',
  depends_on: [],
  optional: false,
  outputs: ['reports/{CODE}_Demo.md'],
  ...over,
});

describe('sliceLane', () => {
  test('creditor slices are identified by their absolute output path', () => {
    assert.equal(
      sliceLane(slice({ outputs: ['analysis/creditors/{CODE}/reports/{CODE}_Statement_Account_v5.md'] })),
      'creditors',
    );
  });

  test('an account-relative output belongs to the debtors lane, the register home lane', () => {
    // Without this, a creditor's own reports/008ORY_Statement_Account_v5.md matches the
    // DEBTOR v5 slice and the creditor is reported as a debtor on v5.
    assert.equal(sliceLane(slice({ outputs: ['reports/{CODE}_Statement_Account_v5.md'] })), 'debtors');
  });

  test('an explicit analysis/debtors path is the debtors lane', () => {
    assert.equal(sliceLane(slice({ outputs: ['analysis/debtors/{CODE}/project.json'] })), 'debtors');
  });
});

describe('sliceGranularity', () => {
  test('a repo-rooted output with no {CODE} is portfolio-wide', () => {
    assert.equal(sliceGranularity(slice({ outputs: ['DEBTORS_DASHBOARD.md'] })), 'portfolio');
    assert.equal(
      sliceGranularity(slice({ outputs: ['analysis/debtors/shared/ACTION_PROMPTS.md'] })),
      'portfolio',
    );
  });

  test('a repo-rooted output with {CODE} is per-account', () => {
    assert.equal(sliceGranularity(slice({ outputs: ['analysis/debtors/{CODE}/project.json'] })), 'account');
  });

  test('an account-relative output is per-account even with no {CODE}', () => {
    assert.equal(sliceGranularity(slice({ outputs: ['data/{run}/context.json'] })), 'account');
    assert.equal(sliceGranularity(slice({ outputs: ['data/allocation_edges.csv'] })), 'account');
  });

  test('a slice with no file outputs is portfolio-level', () => {
    assert.equal(sliceGranularity(slice({ outputs: ['portfolio.sync exit code 2'] })), 'portfolio');
  });
});

describe('resolveOutput', () => {
  const ctx = { code: 'BR0001', lane: 'debtors' };

  test('account-relative patterns resolve under the account directory', () => {
    const r = resolveOutput('reports/{CODE}_Statement_Account_v5.md', ctx);
    assert.equal(r.kind, 'file');
    assert.equal(r.glob, 'analysis/debtors/BR0001/reports/BR0001_Statement_Account_v5.md');
  });

  test('repo-rooted patterns are left alone', () => {
    assert.equal(
      resolveOutput('src/features/debtor-position-workspace/data/fixtures/{CODE}.v5.json', ctx).glob,
      'src/features/debtor-position-workspace/data/fixtures/BR0001.v5.json',
    );
  });

  test('the evidence_exchange tree resolves under the lane, not the account', () => {
    assert.equal(
      resolveOutput('evidence_exchange/{CODE}/turn-{NNN}/manifest.json', ctx).glob,
      'analysis/debtors/evidence_exchange/BR0001/turn-{NNN}/manifest.json',
    );
  });

  test('a root-level filename stays at the root', () => {
    assert.equal(resolveOutput('DEBTORS_DASHBOARD.md', ctx).glob, 'DEBTORS_DASHBOARD.md');
  });

  test('a process outcome is not treated as a missing file', () => {
    // d17.collections declares "portfolio.sync exit code 2". Calling that absent would
    // be a false negative dressed up as a finding.
    const r = resolveOutput('portfolio.sync exit code 2', ctx);
    assert.equal(r.kind, 'non-file');
    assert.equal(r.assertion, 'portfolio.sync exit code 2');
  });

  test('a #fragment names a key inside the file, not a separate artifact', () => {
    const r = resolveOutput('evidence_exchange/{CODE}/turn-*/manifest.json#erp_freshness', ctx);
    assert.equal(r.pointer, 'erp_freshness');
    assert.ok(!r.glob.includes('#'));
  });
});

describe('literalPrefixDir', () => {
  test('stops at the first placeholder or star', () => {
    assert.equal(literalPrefixDir('analysis/debtors/BR0001/data/{run}/context.json'), 'analysis/debtors/BR0001/data');
    assert.equal(literalPrefixDir('analysis/debtors/evidence_exchange/X/turn-*/manifest.json'), 'analysis/debtors/evidence_exchange/X');
  });

  test('a fully literal path yields its own directory', () => {
    assert.equal(literalPrefixDir('analysis/debtors/BR0001/project.json'), 'analysis/debtors/BR0001');
  });

  test('a root-level file yields an empty root, not the whole checkout', () => {
    // An empty scan root must mean "root-level files only"; treating it as a crawl of
    // everything would walk node_modules 23 times.
    assert.equal(literalPrefixDir('DEBTORS_DASHBOARD.md'), '');
  });
});

describe('globToRegExp', () => {
  test('placeholders and stars match within one segment only', () => {
    const rx = globToRegExp('reports/X_INGEST_COVERAGE_{date}.json');
    assert.ok(rx.test('reports/X_INGEST_COVERAGE_2026-09-11.json'));
    assert.ok(!rx.test('reports/X_INGEST_COVERAGE_2026/09.json'));
  });

  test('dots are literal, not wildcards', () => {
    const rx = globToRegExp('reports/Xav5.md');
    assert.ok(!rx.test('reports/Xavb5md'));
  });

  test('a trailing star matches a prefix family', () => {
    const rx = globToRegExp('reports/X_Settlement_*');
    assert.ok(rx.test('reports/X_Settlement_Discount_v1.md'));
    assert.ok(!rx.test('reports/X_Other.md'));
  });
});

describe('indexAccount', () => {
  const slices = [
    slice({ id: 'v5', outputs: ['reports/{CODE}_Statement_Account_v5.md'] }),
    slice({ id: 'v4', outputs: ['reports/{CODE}_Statement_Account_v4.md'] }),
    slice({ id: 'cov', outputs: ['reports/{CODE}_INGEST_COVERAGE_{date}.json'] }),
    slice({ id: 'gate', outputs: ['portfolio.sync exit code 2'] }),
    slice({ id: 'cred', outputs: ['analysis/creditors/{CODE}/reports/{CODE}_Statement_Account_v5.md'] }),
    slice({ id: 'dash', outputs: ['DEBTORS_DASHBOARD.md'] }),
  ];

  const files = [
    'analysis/debtors/AAA/reports/AAA_Statement_Account_v5.md',
    'analysis/debtors/AAA/reports/AAA_INGEST_COVERAGE_2026-09-01.json',
    'analysis/debtors/AAA/reports/AAA_INGEST_COVERAGE_2026-09-10.json',
  ];

  const env = {
    code: 'AAA',
    lane: 'debtors',
    slices,
    listFiles: (root) => files.filter((f) => f.startsWith(`${root}/`)),
    dateOf: (rel) => ({ at: rel.includes('2026-09-10') ? 2000 : 1000, source: 'git' }),
  };

  test('present and absent are distinguished by an actual file match', () => {
    const rows = indexAccount(env);
    assert.equal(rows.v5.status, 'present');
    assert.equal(rows.v4.status, 'absent');
  });

  test('a glob slice collects every match and dates itself from the newest', () => {
    const rows = indexAccount(env);
    assert.equal(rows.cov.count, 2);
    assert.equal(rows.cov.paths[0], 'analysis/debtors/AAA/reports/AAA_INGEST_COVERAGE_2026-09-10.json');
    assert.equal(rows.cov.last_change, new Date(2000).toISOString());
  });

  test('a process-outcome slice is never reported per account as absent', () => {
    // d17.collections is one exit code for the whole sync run, so it belongs at
    // portfolio level. Listing it per account as absent would be a false negative.
    assert.ok(!('gate' in indexAccount(env)));
  });

  test('a slice mixing real files with a process assertion keeps both', () => {
    const rows = indexAccount({
      ...env,
      slices: [
        slice({ id: 'mixed', outputs: ['reports/{CODE}_Statement_Account_v5.md', 'sync exit code 2'] }),
      ],
    });
    assert.equal(rows.mixed.status, 'present');
    assert.deepEqual(rows.mixed.assertions, ['sync exit code 2']);
  });

  test('another lane\u2019s slice is omitted, not reported absent', () => {
    assert.ok(!('cred' in indexAccount(env)));
  });

  test('a portfolio-wide slice is omitted from every account', () => {
    // Reported per account it reads as "present on all 22", which says nothing about any
    // one of them.
    assert.ok(!('dash' in indexAccount(env)));
  });

  test('the date source is carried, so an uncommitted artifact is distinguishable', () => {
    const rows = indexAccount({ ...env, dateOf: () => ({ at: 500, source: 'filesystem' }) });
    assert.equal(rows.v5.last_change_source, 'filesystem');
  });

  test('a file matched by two patterns is counted once', () => {
    const rows = indexAccount({
      ...env,
      slices: [slice({ id: 'dup', outputs: ['reports/{CODE}_Statement_Account_v5.md', 'reports/{CODE}_*_v5.md'] })],
    });
    assert.equal(rows.dup.count, 1);
  });
});

describe('detectStaleness', () => {
  const slices = [
    slice({ id: 'stmt', depends_on: ['cov', 'evidence.erp_txt'] }),
    slice({ id: 'cov', depends_on: [] }),
  ];
  const at = (ms, source = 'git') => ({
    status: 'present',
    last_change: new Date(ms).toISOString(),
    last_change_source: source,
  });

  test('a dependency committed days later marks the dependent stale', () => {
    const { stale } = detectStaleness({ stmt: at(0), cov: at(19 * DAY) }, slices);
    assert.equal(stale.length, 1);
    assert.equal(stale[0].slice, 'stmt');
    assert.equal(stale[0].stale_against, 'cov');
    assert.equal(stale[0].gap_hours, 19 * 24);
  });

  test('a dependency committed seconds later is same-session, not stale', () => {
    // FIR001: v5 statement at 09:55:03, its ingest coverage at 09:55:08, in a commit
    // whose message records the v5 regeneration.
    const { stale, same_session } = detectStaleness({ stmt: at(0), cov: at(5000) }, slices);
    assert.deepEqual(stale, []);
    assert.equal(same_session.length, 1);
  });

  test('the same-session window is an hour, and the boundary is inclusive', () => {
    const inside = detectStaleness({ stmt: at(0), cov: at(SAME_SESSION_MS) }, slices);
    assert.equal(inside.stale.length, 0);
    const outside = detectStaleness({ stmt: at(0), cov: at(SAME_SESSION_MS + 1) }, slices);
    assert.equal(outside.stale.length, 1);
  });

  test('a dependency older than its dependent is not a finding', () => {
    const { stale, same_session } = detectStaleness({ stmt: at(10 * DAY), cov: at(0) }, slices);
    assert.deepEqual(stale, []);
    assert.deepEqual(same_session, []);
  });

  test('a filesystem-sourced date is counted as not comparable, never compared', () => {
    // Mixing a checkout timestamp with a commit date manufactures findings. This is the
    // guard on the bug that produced 21 false stale rows.
    const r = detectStaleness({ stmt: at(0, 'filesystem'), cov: at(19 * DAY) }, slices);
    assert.deepEqual(r.stale, []);
    assert.equal(r.not_comparable, 1);
  });

  test('evidence dependencies are skipped, not assumed fresh', () => {
    // evidence.erp_txt declares no outputs, so there is no date and no honest verdict.
    const r = detectStaleness({ stmt: at(0), cov: at(0) }, slices);
    assert.deepEqual(r.stale, []);
    assert.equal(r.not_comparable, 0);
  });

  test('an absent dependency yields no verdict', () => {
    const r = detectStaleness({ stmt: at(0), cov: { status: 'absent', last_change: null } }, slices);
    assert.deepEqual(r.stale, []);
  });
});

describe('gitCommitTimes', () => {
  test('a path takes its most recent commit, since the log is reverse-chronological', () => {
    const log = ['C2000', 'a.md', '', 'C1000', 'a.md', 'b.md', ''].join('\n');
    const times = gitCommitTimes(() => log);
    assert.equal(times.get('a.md'), 2000 * 1000);
    assert.equal(times.get('b.md'), 1000 * 1000);
  });

  test('an untracked path is absent rather than defaulted', () => {
    assert.equal(gitCommitTimes(() => 'C1000\na.md\n').get('never-committed.md'), undefined);
  });

  test('empty git output yields no times instead of throwing', () => {
    assert.equal(gitCommitTimes(() => '').size, 0);
  });
});

describe('observedLanes', () => {
  test('lanes are read from lane-specific slices that exist', () => {
    const rows = {
      a: { status: 'present', lane: 'statement v5' },
      b: { status: 'absent', lane: 'statement v4' },
      c: { status: 'present', lane: null },
    };
    assert.deepEqual(observedLanes(rows), ['statement v5']);
  });

  test('an account with nothing present observes no lane, rather than guessing one', () => {
    assert.deepEqual(observedLanes({ a: { status: 'absent', lane: 'statement v5' } }), []);
  });
});

describe('buildIndex', () => {
  const sliceRegistry = {
    version: '1.0.0',
    slices: [
      slice({ id: 'v5', outputs: ['reports/{CODE}_Statement_Account_v5.md'] }),
      slice({ id: 'dash', outputs: ['DEBTORS_DASHBOARD.md'] }),
      slice({ id: 'cred', outputs: ['analysis/creditors/{CODE}/reports/{CODE}_Statement_Account_v5.md'] }),
    ],
  };
  const files = [
    'analysis/debtors/AAA/reports/AAA_Statement_Account_v5.md',
    'analysis/creditors/ZZZ/reports/ZZZ_Statement_Account_v5.md',
    'DEBTORS_DASHBOARD.md',
  ];
  const index = buildIndex({
    sliceRegistry,
    accounts: [
      { code: 'AAA', lane: 'debtors' },
      { code: 'BBB', lane: 'debtors' },
      { code: 'ZZZ', lane: 'creditors' },
    ],
    listFiles: (root) => (root === '' ? files.filter((f) => !f.includes('/')) : files.filter((f) => f.startsWith(`${root}/`))),
    dateOf: () => ({ at: 1000, source: 'git' }),
    now: () => new Date(0),
  });

  test('present counts are scoped to the accounts a slice can apply to', () => {
    // 1 of 2 debtors, not 1 of 3 accounts: the creditor was never in scope.
    assert.equal(index.by_slice.v5.present_count, 1);
    assert.equal(index.by_slice.v5.accounts_in_scope, 2);
    assert.deepEqual(index.by_slice.v5.accounts_present, ['AAA']);
    assert.deepEqual(index.by_slice.v5.accounts_absent, ['BBB']);
  });

  test('the creditor slice is scoped to creditor accounts only', () => {
    assert.equal(index.by_slice.cred.accounts_in_scope, 1);
    assert.deepEqual(index.by_slice.cred.accounts_present, ['ZZZ']);
  });

  test('portfolio-wide slices are reported once, outside by_slice', () => {
    assert.ok(!('dash' in index.by_slice));
    assert.equal(index.portfolio_slices.dash.status, 'present');
    assert.deepEqual(index.portfolio_slices.dash.paths, ['DEBTORS_DASHBOARD.md']);
  });

  test('the index states that it is report-only', () => {
    assert.equal(index.enforcement, 'report-only');
    assert.match(index.ruling, /report-only/);
  });

  test('the index states its date basis so a reader knows what is comparable', () => {
    assert.match(index.date_basis, /git commit/i);
    assert.match(index.date_basis, /mtime is not used/i);
  });

  test('absent is documented as not-a-defect', () => {
    assert.match(index.reading_guide.absent, /NOT a defect/);
  });
});

describe('the live repository', () => {
  const { index } = runArtifactIndex(ROOT);
  const sliceRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json'), 'utf8'),
  );

  test('every account directory is discovered, and no scaffolding directory is', () => {
    const codes = discoverAccounts(ROOT).map((a) => a.code);
    for (const skip of NON_ACCOUNT_DIRS) assert.ok(!codes.includes(skip), `${skip} is not an account`);
    assert.ok(codes.includes('BR0001'));
    assert.ok(codes.includes('008ORY'), 'creditor accounts are indexed too');
  });

  test('portfolio.register presence matches the project.json files that exist', () => {
    // The bug this pins: a hand-picked scan root list reported all 19 as absent.
    const onDisk = discoverAccounts(ROOT, ['debtors'])
      .filter((a) => fs.existsSync(path.join(ROOT, 'analysis/debtors', a.code, 'project.json')))
      .map((a) => a.code)
      .sort();
    assert.deepEqual(index.by_slice['portfolio.register'].accounts_present, onDisk);
    assert.ok(onDisk.length > 10, 'sanity: the portfolio is not empty');
  });

  test('the creditor account is not reported as holding debtor slices', () => {
    // 008ORY has its own reports/008ORY_Statement_Account_v5.md, which matched the
    // debtor v5 slice before lane scoping existed.
    const declared = Object.keys(index.accounts['008ORY'].slices);
    assert.ok(!declared.includes('statement.v5.composed'));
    assert.deepEqual(declared.sort(), ['creditor.ingest.coverage', 'creditor.v5.statement']);
  });

  test('every indexed slice id exists in SLICE_REGISTRY', () => {
    const known = new Set(sliceRegistry.slices.map((s) => s.id));
    const seen = new Set([
      ...Object.keys(index.by_slice),
      ...Object.keys(index.portfolio_slices),
      ...Object.values(index.accounts).flatMap((a) => Object.keys(a.slices)),
    ]);
    for (const id of seen) assert.ok(known.has(id), `${id} is not a registered slice`);
  });

  test('account and portfolio slices together cover the whole register', () => {
    const covered = new Set([...Object.keys(index.by_slice), ...Object.keys(index.portfolio_slices)]);
    assert.equal(covered.size, sliceRegistry.slices.length);
  });

  test('every staleness finding is git-anchored on both sides', () => {
    for (const [code, a] of Object.entries(index.accounts)) {
      for (const s of a.stale) {
        assert.equal(a.slices[s.slice].last_change_source, 'git', `${code}/${s.slice}`);
        assert.equal(a.slices[s.stale_against].last_change_source, 'git', `${code}/${s.stale_against}`);
        assert.ok(s.gap_hours * HOUR > SAME_SESSION_MS, `${code}/${s.slice} gap must exceed the window`);
      }
    }
  });

  test('the markdown view is deterministic and in step with the committed index', () => {
    const viewPath = path.join(ROOT, 'analysis/debtors/shared/docs/PORTFOLIO_ARTIFACT_INDEX.md');
    assert.ok(fs.existsSync(viewPath), 'view has never been generated');
    const a = renderMarkdown(index, sliceRegistry);
    assert.equal(a, renderMarkdown(index, sliceRegistry));
    assert.equal(
      fs.readFileSync(viewPath, 'utf8'),
      a,
      'PORTFOLIO_ARTIFACT_INDEX.md is stale — run npm run debtors:artifact-index:write',
    );
  });

  test('running the index does not write unless asked', () => {
    // debtors:sync calls it with write:true, but a read-only check must stay read-only.
    const indexPath = path.join(ROOT, 'analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json');
    const before = fs.readFileSync(indexPath, 'utf8');
    runArtifactIndex(ROOT);
    assert.equal(fs.readFileSync(indexPath, 'utf8'), before);
  });

  test('writing when only the clock moved leaves the committed views untouched', () => {
    // debtors:sync writes the index on every run. If a moved generated_at counted as a
    // change, every sync would dirty the tree, and a register whose diffs are always
    // noise is a register whose real findings get skimmed past.
    const indexPath = path.join(ROOT, 'analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json');
    const viewPath = path.join(ROOT, 'analysis/debtors/shared/docs/PORTFOLIO_ARTIFACT_INDEX.md');
    const before = { index: fs.readFileSync(indexPath, 'utf8'), view: fs.readFileSync(viewPath, 'utf8') };

    const { written } = runArtifactIndex(ROOT, { write: true });

    assert.deepEqual(written, [], 'nothing should have been rewritten');
    assert.equal(fs.readFileSync(indexPath, 'utf8'), before.index);
    assert.equal(fs.readFileSync(viewPath, 'utf8'), before.view);
  });
});

describe('sameExceptGeneratedAt', () => {
  const doc = (stamp, body) => `{\n  "generated_at": "${stamp}",\n  "totals": { "accounts": ${body} }\n}\n`;

  test('a moved timestamp alone is not a change', () => {
    assert.ok(sameExceptGeneratedAt(doc('2026-09-29T10:00:00.000Z', 23), doc('2026-09-29T11:00:00.000Z', 23)));
  });

  test('a changed finding is a change even when the timestamp is identical', () => {
    assert.ok(!sameExceptGeneratedAt(doc('2026-09-29T10:00:00.000Z', 23), doc('2026-09-29T10:00:00.000Z', 24)));
  });

  test('a changed finding is a change when the timestamp also moved', () => {
    assert.ok(!sameExceptGeneratedAt(doc('2026-09-29T10:00:00.000Z', 23), doc('2026-09-29T11:00:00.000Z', 24)));
  });

  test('only the first generated_at is normalised, so a nested one still counts', () => {
    // Guards against the strip becoming global and swallowing a real per-account field.
    const a = `{\n  "generated_at": "A",\n  "x": {\n    "generated_at": "P"\n  }\n}\n`;
    const b = `{\n  "generated_at": "B",\n  "x": {\n    "generated_at": "Q"\n  }\n}\n`;
    assert.ok(!sameExceptGeneratedAt(a, b));
  });

  test('content with no timestamp at all compares exactly', () => {
    assert.ok(sameExceptGeneratedAt('# View\n\nrow\n', '# View\n\nrow\n'));
    assert.ok(!sameExceptGeneratedAt('# View\n\nrow\n', '# View\n\nother\n'));
  });
});
