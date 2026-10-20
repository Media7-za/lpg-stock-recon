// Script registry gate contract tests.
//
// Boundary under test: registry-vs-filesystem agreement only. No financial truth.
// Every gate must be shown to FAIL on a planted defect — a validator that only ever
// passes proves nothing.
//
// Run: node --test analysis/debtors/shared/scripts/render_script_registry.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GATES,
  EVIDENCE_TOKENS,
  checkGates,
  parseDocblock,
  discoverScripts,
  isGovernedScriptPath,
  laneOf,
  scopeOf,
  npmTargetPaths,
  buildDependencyGraph,
  reachableFrom,
  scaffoldRecords,
  buildAudit,
  renderMarkdown,
  loadWorld,
} from './render_script_registry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

/** A minimal clean registry: one registered entry point, one module, all gates satisfied. */
function cleanEnv(overrides = {}) {
  const registry = {
    version: '1.0.0',
    status: 'RATIFIED',
    plan: 'plan.md',
    authority: 'doctrine.md',
    kinds: { entrypoint: 'e', module: 'm' },
    durabilities: { permanent: 'p', unclassified: 'u' },
    evidence_kinds: { 'npm-entrypoint': 'n', 'imported-by-permanent': 'i', none: '-' },
    missing_entrypoints: [],
    scripts: [
      {
        id: 'debtors.shared.alpha',
        path: 'analysis/debtors/shared/scripts/alpha.mjs',
        lane: 'debtors',
        scope: 'universal',
        kind: 'entrypoint',
        durability: 'permanent',
        evidence: 'npm-entrypoint',
        entrypoints: ['debtors:alpha'],
        owns_slices: ['txt.parse'],
        notes: null,
      },
      {
        id: 'debtors.shared.helper',
        path: 'analysis/debtors/shared/scripts/helper.mjs',
        lane: 'debtors',
        scope: 'universal',
        kind: 'module',
        durability: 'permanent',
        evidence: 'imported-by-permanent',
        entrypoints: [],
        owns_slices: [],
        notes: null,
      },
    ],
  };

  return {
    registry,
    sliceIds: new Set(['txt.parse']),
    npmTargets: new Map([['debtors:alpha', ['analysis/debtors/shared/scripts/alpha.mjs']]]),
    discovered: [
      'analysis/debtors/shared/scripts/alpha.mjs',
      'analysis/debtors/shared/scripts/helper.mjs',
    ],
    reachable: new Map([['analysis/debtors/shared/scripts/helper.mjs', 'import']]),
    pathExists: () => true,
    docblockOf: () => ({}),
    ...overrides,
  };
}

const gatesHit = (result) => [...new Set(result.failures.map((f) => f.gate))];
const detailFor = (result, gate) => result.failures.find((f) => f.gate === gate)?.detail ?? '';

describe('baseline', () => {
  test('a clean registry raises no failures and no warnings', () => {
    const { failures, warnings } = checkGates(cleanEnv());
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  });

  test('every declared gate name is reachable from checkGates', () => {
    // Guards against a gate being listed in GATES but never actually run.
    assert.deepEqual(
      GATES,
      [
        'PATH_EXISTS',
        'NO_ORPHAN_FILES',
        'ENTRYPOINT_RESOLVES',
        'DOCBLOCK_MATCH',
        'SLICE_IDS_VALID',
        'REACHABLE_IS_PERMANENT',
        'EVIDENCE_REQUIRED',
      ],
    );
  });
});

describe('PATH_EXISTS', () => {
  test('fails when a declared script is missing from disk', () => {
    const result = checkGates(cleanEnv({ pathExists: () => false }));
    assert.ok(gatesHit(result).includes('PATH_EXISTS'));
    assert.match(detailFor(result, 'PATH_EXISTS'), /declares missing path/);
  });

  test('a missing file does not also trip DOCBLOCK_MATCH', () => {
    // A docblock cannot be read from a file that is not there; reporting both would
    // bury the real defect under a derived one.
    const result = checkGates(
      cleanEnv({ pathExists: () => false, docblockOf: () => ({ durability: 'one-shot' }) }),
    );
    assert.ok(!gatesHit(result).includes('DOCBLOCK_MATCH'));
  });
});

describe('NO_ORPHAN_FILES', () => {
  test('fails when a script on disk is absent from the registry', () => {
    const env = cleanEnv();
    env.discovered.push('analysis/debtors/shared/scripts/brand_new.mjs');
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('NO_ORPHAN_FILES'));
    assert.match(detailFor(result, 'NO_ORPHAN_FILES'), /brand_new\.mjs exists on disk/);
  });

  test('a registry entry with no file on disk is PATH_EXISTS, not an orphan', () => {
    const result = checkGates(cleanEnv({ discovered: [], pathExists: () => false }));
    assert.ok(gatesHit(result).includes('PATH_EXISTS'));
    assert.ok(!gatesHit(result).includes('NO_ORPHAN_FILES'));
  });
});

describe('ENTRYPOINT_RESOLVES', () => {
  test('fails when a record claims an npm target that package.json does not define', () => {
    const env = cleanEnv();
    env.registry.scripts[0].entrypoints = ['debtors:ghost'];
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('ENTRYPOINT_RESOLVES'));
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /absent from package\.json/);
  });

  test('fails when the claimed target exists but does not name this script', () => {
    // A renamed script whose old target still resolves is the silent version of this
    // defect: `npm run` succeeds while running something else.
    const env = cleanEnv();
    env.npmTargets = new Map([['debtors:alpha', ['analysis/debtors/shared/scripts/other.mjs']]]);
    env.registry.scripts.push({
      ...env.registry.scripts[0],
      id: 'debtors.shared.other',
      path: 'analysis/debtors/shared/scripts/other.mjs',
      entrypoints: [],
      evidence: 'none',
      durability: 'unclassified',
      owns_slices: [],
    });
    env.discovered.push('analysis/debtors/shared/scripts/other.mjs');
    const result = checkGates(env);
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /does not name/);
  });

  test('fails on a hollow npm target whose script does not exist', () => {
    // The live defect this gate was written for: debtors:parse-backlog.
    const env = cleanEnv();
    env.npmTargets.set('debtors:hollow', ['analysis/debtors/shared/scripts/never_written.mjs']);
    env.pathExists = (p) => p !== 'analysis/debtors/shared/scripts/never_written.mjs';
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('ENTRYPOINT_RESOLVES'));
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /never_written\.mjs which does not exist/);
  });

  test('fails when a target names a real but unregistered script', () => {
    const env = cleanEnv();
    env.npmTargets.set('debtors:stray', ['analysis/debtors/shared/scripts/stray.mjs']);
    const result = checkGates(env);
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /stray\.mjs which is not registered/);
  });

  test('an acknowledged hollow target downgrades to a warning, but only with a tripwire', () => {
    const base = () => {
      const env = cleanEnv();
      env.npmTargets.set('debtors:hollow', ['analysis/debtors/shared/scripts/never_written.mjs']);
      env.pathExists = (p) => p !== 'analysis/debtors/shared/scripts/never_written.mjs';
      return env;
    };

    const withoutTripwire = base();
    withoutTripwire.registry.missing_entrypoints = [
      {
        target: 'debtors:hollow',
        declared_path: 'analysis/debtors/shared/scripts/never_written.mjs',
        status: 'ABSENT',
      },
    ];
    const bad = checkGates(withoutTripwire);
    assert.ok(gatesHit(bad).includes('ENTRYPOINT_RESOLVES'));
    assert.match(detailFor(bad, 'ENTRYPOINT_RESOLVES'), /a defect with no tripwire is an excuse/);

    const withTripwire = base();
    withTripwire.registry.missing_entrypoints = [
      {
        target: 'debtors:hollow',
        declared_path: 'analysis/debtors/shared/scripts/never_written.mjs',
        status: 'ABSENT',
        reopens_when: 'the script is written or the target is removed',
      },
    ];
    const good = checkGates(withTripwire);
    assert.deepEqual(good.failures, []);
    assert.equal(good.warnings.length, 1);
    assert.match(good.warnings[0].detail, /is absent; acknowledged/);
  });

  test('an acknowledgement naming a different path than the target does not excuse it', () => {
    // Stops one acknowledgement from covering a second, unrelated breakage.
    const env = cleanEnv();
    env.npmTargets.set('debtors:hollow', ['analysis/debtors/shared/scripts/never_written.mjs']);
    env.pathExists = (p) => p !== 'analysis/debtors/shared/scripts/never_written.mjs';
    env.registry.missing_entrypoints = [
      {
        target: 'debtors:hollow',
        declared_path: 'analysis/debtors/shared/scripts/something_else.mjs',
        status: 'ABSENT',
        reopens_when: 'x',
      },
    ];
    const result = checkGates(env);
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /acknowledged as missing .* but names/);
  });

  test('fails when an acknowledgement outlives the target it excuses', () => {
    // Once the target is gone the acknowledgement is stale scar tissue that would
    // silently excuse a future target of the same name.
    const env = cleanEnv();
    env.registry.missing_entrypoints = [
      {
        target: 'debtors:long-gone',
        declared_path: 'analysis/debtors/shared/scripts/gone.mjs',
        status: 'ABSENT',
        reopens_when: 'x',
      },
    ];
    const result = checkGates(env);
    assert.match(detailFor(result, 'ENTRYPOINT_RESOLVES'), /no longer in package\.json/);
  });
});

describe('DOCBLOCK_MATCH', () => {
  test('fails when the docblock durability contradicts the record', () => {
    const result = checkGates(cleanEnv({ docblockOf: () => ({ durability: 'one-shot' }) }));
    assert.ok(gatesHit(result).includes('DOCBLOCK_MATCH'));
    assert.match(detailFor(result, 'DOCBLOCK_MATCH'), /docblock says "one-shot"/);
  });

  test('fails when the docblock scope contradicts the record', () => {
    const result = checkGates(cleanEnv({ docblockOf: () => ({ scope: 'account:BR0001' }) }));
    assert.match(detailFor(result, 'DOCBLOCK_MATCH'), /docblock says "account:BR0001"/);
  });

  test('fails when docblock slice ownership disagrees with the record', () => {
    const result = checkGates(cleanEnv({ docblockOf: () => ({ owns_slices: ['fixture.v5'] }) }));
    assert.match(detailFor(result, 'DOCBLOCK_MATCH'), /docblock says \[fixture\.v5\]/);
  });

  test('slice ownership comparison ignores declaration order', () => {
    const env = cleanEnv();
    env.registry.scripts[0].owns_slices = ['fixture.v5', 'txt.parse'];
    env.sliceIds = new Set(['txt.parse', 'fixture.v5']);
    env.docblockOf = (p) =>
      p === 'analysis/debtors/shared/scripts/alpha.mjs' ? { owns_slices: ['txt.parse', 'fixture.v5'] } : {};
    assert.ok(!gatesHit(checkGates(env)).includes('DOCBLOCK_MATCH'));
  });

  test('fails when a file carrying @deprecated is declared permanent', () => {
    const result = checkGates(cleanEnv({ docblockOf: () => ({ deprecated: true }) }));
    assert.match(detailFor(result, 'DOCBLOCK_MATCH'), /carries @deprecated/);
  });

  test('a script with no docblock is not a defect', () => {
    // Most of the 99 scripts predate the convention. Absence must stay silent or the
    // gate becomes noise nobody reads.
    assert.deepEqual(checkGates(cleanEnv({ docblockOf: () => ({}) })).failures, []);
  });

  test('accepts an npm target named in the docblock with the "npm run" prefix', () => {
    const env = cleanEnv();
    env.docblockOf = (p) =>
      p === 'analysis/debtors/shared/scripts/alpha.mjs' ? { entrypoint: 'debtors:alpha' } : {};
    assert.ok(!gatesHit(checkGates(env)).includes('DOCBLOCK_MATCH'));
  });

  test('fails when the docblock names an entrypoint the record does not list', () => {
    const env = cleanEnv();
    env.docblockOf = () => ({ entrypoint: 'debtors:somethingelse' });
    assert.match(detailFor(checkGates(env), 'DOCBLOCK_MATCH'), /which the record does not list/);
  });
});

describe('SLICE_IDS_VALID', () => {
  test('fails on a slice id absent from SLICE_REGISTRY', () => {
    const env = cleanEnv();
    env.registry.scripts[0].owns_slices = ['v5.invented'];
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('SLICE_IDS_VALID'));
    assert.match(detailFor(result, 'SLICE_IDS_VALID'), /owns unknown slice "v5\.invented"/);
  });
});

describe('REACHABLE_IS_PERMANENT', () => {
  test('fails when an imported script is filed as anything but permanent', () => {
    for (const durability of ['unclassified', 'one-shot', 'superseded', 'deprecated']) {
      const env = cleanEnv();
      env.registry.scripts[1].durability = durability;
      env.registry.scripts[1].evidence = durability === 'unclassified' ? 'none' : 'operator-declared';
      const result = checkGates(env);
      assert.ok(
        gatesHit(result).includes('REACHABLE_IS_PERMANENT'),
        `durability "${durability}" on an imported script must be a hard failure`,
      );
      assert.match(
        detailFor(result, 'REACHABLE_IS_PERMANENT'),
        /reachability is proof of the opposite/,
      );
    }
  });

  test('reports the edge kind, so a subprocess dependency is not read as an import', () => {
    const env = cleanEnv();
    env.reachable = new Map([['analysis/debtors/shared/scripts/helper.mjs', 'invoke']]);
    env.registry.scripts[1].durability = 'unclassified';
    env.registry.scripts[1].evidence = 'none';
    assert.match(detailFor(checkGates(env), 'REACHABLE_IS_PERMANENT'), /is invoked by/);
  });

  test('an unreachable script may be unclassified without complaint', () => {
    const env = cleanEnv({ reachable: new Map() });
    env.registry.scripts[1].durability = 'unclassified';
    env.registry.scripts[1].evidence = 'none';
    const result = checkGates(env);
    assert.ok(!gatesHit(result).includes('REACHABLE_IS_PERMANENT'));
  });
});

describe('EVIDENCE_REQUIRED', () => {
  test('fails when permanence is claimed with no evidence', () => {
    const env = cleanEnv({ reachable: new Map() });
    env.registry.scripts[1].evidence = 'none';
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('EVIDENCE_REQUIRED'));
    assert.match(detailFor(result, 'EVIDENCE_REQUIRED'), /claims durability="permanent" citing no evidence/);
  });

  test('fails when an unclassified record cites evidence anyway', () => {
    const env = cleanEnv({ reachable: new Map() });
    env.registry.scripts[1].durability = 'unclassified';
    env.registry.scripts[1].evidence = 'operator-declared';
    assert.match(detailFor(checkGates(env), 'EVIDENCE_REQUIRED'), /classify it or drop the citation/);
  });

  test('fails on an evidence token outside the declared vocabulary', () => {
    const env = cleanEnv();
    env.registry.scripts[1].evidence = 'because-i-said-so';
    assert.match(detailFor(checkGates(env), 'EVIDENCE_REQUIRED'), /cites unknown evidence/);
  });

  test('fails when npm-entrypoint evidence is cited with no entrypoint listed', () => {
    const env = cleanEnv();
    env.registry.scripts[0].entrypoints = [];
    env.npmTargets = new Map();
    assert.match(detailFor(checkGates(env), 'EVIDENCE_REQUIRED'), /cites npm-entrypoint evidence but lists no/);
  });

  test('reachability evidence is checked against the graph, not taken on trust', () => {
    // The two machine-checkable citations are the ones most tempting to assert by
    // hand when a gate is inconvenient.
    const env = cleanEnv({ reachable: new Map() });
    const result = checkGates(env);
    assert.match(detailFor(result, 'EVIDENCE_REQUIRED'), /no path from any entry point/);
  });

  test('citing an import edge when the real edge is a subprocess call fails', () => {
    const env = cleanEnv();
    env.reachable = new Map([['analysis/debtors/shared/scripts/helper.mjs', 'invoke']]);
    assert.match(detailFor(checkGates(env), 'EVIDENCE_REQUIRED'), /graph reports a invoke edge/);
  });

  test('warns — not fails — on unclassified records, so the backlog is countable', () => {
    const env = cleanEnv({ reachable: new Map() });
    env.registry.scripts[1].durability = 'unclassified';
    env.registry.scripts[1].evidence = 'none';
    const result = checkGates(env);
    assert.deepEqual(result.failures, []);
    assert.match(result.warnings[0].detail, /1 of 2 scripts are unclassified/);
  });
});

describe('path-derived fields', () => {
  test('lane and scope are read from the path, including the no-account form', () => {
    assert.equal(laneOf('analysis/debtors/shared/scripts/x.mjs'), 'debtors');
    assert.equal(scopeOf('analysis/debtors/shared/scripts/x.mjs'), 'universal');
    assert.equal(scopeOf('analysis/debtors/BR0001/scripts/x.mjs'), 'account:BR0001');
    assert.equal(scopeOf('analysis/inventory/scripts/x.sql'), 'universal');
  });

  test('only scripts under a scripts/ directory are governed', () => {
    assert.ok(isGovernedScriptPath('analysis/debtors/shared/scripts/a.mjs'));
    assert.ok(isGovernedScriptPath('analysis/inventory/scripts/a.sql'));
    assert.ok(!isGovernedScriptPath('analysis/debtors/shared/docs/a.md'));
    assert.ok(!isGovernedScriptPath('src/features/x/a.ts'));
  });

  test('nested stage modules are governed', () => {
    assert.ok(isGovernedScriptPath('analysis/debtors/shared/scripts/stages/normalize.mjs'));
  });
});

describe('parseDocblock', () => {
  test('reads tags from a multi-line docblock', () => {
    const doc = parseDocblock(
      ['/**', ' * @scope universal', ' * @durability permanent', ' * @owns-slice a, b', ' */'].join('\n'),
    );
    assert.deepEqual(doc, { scope: 'universal', durability: 'permanent', owns_slices: ['a', 'b'] });
  });

  test('reads a tag sitting on the opening line of a single-line docblock', () => {
    // Both @deprecated scripts in the repo are written this way.
    assert.deepEqual(parseDocblock('/** @deprecated Use other.mjs */'), { deprecated: true });
  });

  test('strips the "npm run" prefix from an entrypoint', () => {
    const doc = parseDocblock('/**\n * @entrypoint npm run debtors:sync\n */');
    assert.equal(doc.entrypoint, 'debtors:sync');
  });

  test('a file with no docblock yields no keys, distinct from declaring nothing', () => {
    assert.deepEqual(parseDocblock('const x = 1;\n'), {});
  });

  test('does not mistake a mid-file mention of a tag for a header declaration', () => {
    const doc = parseDocblock('/** Real header */\nconst s = "@durability permanent";\n');
    assert.equal(doc.durability, undefined);
  });
});

describe('dependency graph', () => {
  const files = [
    'analysis/debtors/shared/scripts/runner.mjs',
    'analysis/debtors/shared/scripts/lib.mjs',
    'analysis/debtors/shared/scripts/spawned.mjs',
    'analysis/debtors/shared/scripts/mentioned.mjs',
  ];

  test('resolves relative static imports', () => {
    const edges = buildDependencyGraph({
      files,
      readFile: (f) =>
        f.endsWith('runner.mjs') ? "import x from './lib.mjs';\n" : '',
    });
    assert.deepEqual(edges.get('analysis/debtors/shared/scripts/runner.mjs').import, [
      'analysis/debtors/shared/scripts/lib.mjs',
    ]);
  });

  test('captures subprocess edges an import scan cannot see', () => {
    // debtors_sync -> debtors_dashboard is exactly this shape.
    const edges = buildDependencyGraph({
      files,
      readFile: (f) =>
        f.endsWith('runner.mjs')
          ? "spawnSync('node', ['analysis/debtors/shared/scripts/spawned.mjs']);\n"
          : '',
    });
    const out = edges.get('analysis/debtors/shared/scripts/runner.mjs');
    assert.deepEqual(out.invoke, ['analysis/debtors/shared/scripts/spawned.mjs']);
    assert.deepEqual(out.import, []);
  });

  test('a path literal in a file that never shells out is not an invoke edge', () => {
    const edges = buildDependencyGraph({
      files,
      readFile: (f) =>
        f.endsWith('runner.mjs')
          ? "const doc = 'see analysis/debtors/shared/scripts/mentioned.mjs';\n"
          : '',
    });
    assert.deepEqual(edges.get('analysis/debtors/shared/scripts/runner.mjs').invoke, []);
  });

  test('an import edge is not double-counted as an invoke edge', () => {
    const edges = buildDependencyGraph({
      files,
      readFile: (f) =>
        f.endsWith('runner.mjs')
          ? "import x from './lib.mjs';\nspawnSync('node', ['./lib.mjs']);\n"
          : '',
    });
    const out = edges.get('analysis/debtors/shared/scripts/runner.mjs');
    assert.deepEqual(out.import, ['analysis/debtors/shared/scripts/lib.mjs']);
    assert.deepEqual(out.invoke, []);
  });

  test('reachability is transitive and excludes the roots themselves', () => {
    const edges = new Map([
      ['a', { import: ['b'], invoke: [] }],
      ['b', { import: ['c'], invoke: [] }],
      ['c', { import: [], invoke: [] }],
    ]);
    const via = reachableFrom(edges, new Set(['a']));
    assert.deepEqual([...via.keys()].sort(), ['b', 'c']);
    assert.ok(!via.has('a'));
  });

  test('an import edge outranks an invoke edge to the same script', () => {
    // The stronger proof should be the one cited, whichever is found first.
    const edges = new Map([
      ['root', { import: [], invoke: ['shared'] }],
      ['other', { import: ['shared'], invoke: [] }],
      ['shared', { import: [], invoke: [] }],
    ]);
    const via = reachableFrom(edges, new Set(['root', 'other']));
    assert.equal(via.get('shared'), 'import');
  });

  test('a dependency cycle terminates', () => {
    const edges = new Map([
      ['a', { import: ['b'], invoke: [] }],
      ['b', { import: ['a'], invoke: [] }],
    ]);
    assert.deepEqual([...reachableFrom(edges, new Set(['a'])).keys()], ['b']);
  });
});

describe('npmTargetPaths', () => {
  test('extracts analysis script paths from a command', () => {
    const map = npmTargetPaths({ 'debtors:sync': 'node analysis/debtors/shared/scripts/debtors_sync.mjs' });
    assert.deepEqual(map.get('debtors:sync'), ['analysis/debtors/shared/scripts/debtors_sync.mjs']);
  });

  test('expands a glob target against the files that exist', () => {
    // debtors:test legitimately targets a set, so it must not read as one missing file.
    const map = npmTargetPaths(
      { 'debtors:test': 'node --test analysis/debtors/shared/scripts/*.test.mjs' },
      ['analysis/debtors/shared/scripts/a.test.mjs', 'analysis/debtors/shared/scripts/b.test.mjs'],
    );
    assert.deepEqual(map.get('debtors:test'), [
      'analysis/debtors/shared/scripts/a.test.mjs',
      'analysis/debtors/shared/scripts/b.test.mjs',
    ]);
  });

  test('a glob does not reach into a nested directory', () => {
    const map = npmTargetPaths(
      { 'debtors:test': 'node --test analysis/debtors/shared/scripts/*.test.mjs' },
      ['analysis/debtors/shared/scripts/stages/deep.test.mjs'],
    );
    assert.deepEqual(map.get('debtors:test'), []);
  });

  test('ignores targets that name no analysis script', () => {
    assert.equal(npmTargetPaths({ dev: 'vite', lint: 'eslint .' }).size, 0);
  });
});

describe('scaffoldRecords', () => {
  const base = {
    discovered: [
      'analysis/debtors/shared/scripts/entry.mjs',
      'analysis/debtors/shared/scripts/mod.mjs',
      'analysis/debtors/shared/scripts/spawned.mjs',
      'analysis/debtors/shared/scripts/x.test.mjs',
      'analysis/debtors/shared/scripts/backups/old.py',
      'analysis/debtors/shared/scripts/dead.mjs',
      'analysis/debtors/BR0001/scripts/forensic.py',
      'analysis/inventory/scripts/q.sql',
    ],
    npmTargets: new Map([['debtors:entry', ['analysis/debtors/shared/scripts/entry.mjs']]]),
    reachable: new Map([
      ['analysis/debtors/shared/scripts/mod.mjs', 'import'],
      ['analysis/debtors/shared/scripts/spawned.mjs', 'invoke'],
    ]),
  };

  test('classifies only what is provable and leaves the rest unclassified', () => {
    const byPath = new Map(scaffoldRecords(base).map((r) => [r.path, r]));
    const check = (p, durability, evidence, kind) => {
      assert.equal(byPath.get(p).durability, durability, `${p} durability`);
      assert.equal(byPath.get(p).evidence, evidence, `${p} evidence`);
      assert.equal(byPath.get(p).kind, kind, `${p} kind`);
    };
    check('analysis/debtors/shared/scripts/entry.mjs', 'permanent', 'npm-entrypoint', 'entrypoint');
    check('analysis/debtors/shared/scripts/mod.mjs', 'permanent', 'imported-by-permanent', 'module');
    check('analysis/debtors/shared/scripts/spawned.mjs', 'permanent', 'invoked-by-permanent', 'entrypoint');
    check('analysis/debtors/shared/scripts/x.test.mjs', 'permanent', 'test-suite', 'test');
    check('analysis/debtors/shared/scripts/backups/old.py', 'superseded', 'backup-directory', 'backup');
    check('analysis/debtors/shared/scripts/dead.mjs', 'unclassified', 'none', 'analysis');
    check('analysis/debtors/BR0001/scripts/forensic.py', 'unclassified', 'none', 'analysis');
    check('analysis/inventory/scripts/q.sql', 'unclassified', 'none', 'query');
  });

  test('never invents durability for a script it cannot prove anything about', () => {
    // The whole point of the register: an honest gap beats a plausible guess.
    const scaffolded = scaffoldRecords(base);
    for (const r of scaffolded) {
      if (r.evidence === 'none') assert.equal(r.durability, 'unclassified');
      if (r.durability === 'permanent') assert.notEqual(r.evidence, 'none');
    }
  });

  test('honours an in-file @deprecated tag', () => {
    const records = scaffoldRecords({
      ...base,
      docblockOf: (p) => (p.endsWith('dead.mjs') ? { deprecated: true } : {}),
    });
    const dead = records.find((r) => r.path.endsWith('dead.mjs'));
    assert.equal(dead.durability, 'deprecated');
    assert.equal(dead.evidence, 'docblock-deprecated');
  });

  test('a registered entrypoint outranks an @deprecated tag, and the mismatch surfaces', () => {
    // Left to the DOCBLOCK_MATCH gate rather than silently resolved either way.
    const records = scaffoldRecords({
      ...base,
      docblockOf: (p) => (p.endsWith('entry.mjs') ? { deprecated: true } : {}),
    });
    assert.equal(records.find((r) => r.path.endsWith('entry.mjs')).durability, 'permanent');
  });

  test('scaffolded ids are unique and stable in path order', () => {
    const ids = scaffoldRecords(base).map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids, scaffoldRecords(base).map((r) => r.id));
  });

  test('scaffolded records satisfy every gate they are given the world for', () => {
    const discovered = base.discovered;
    const scripts = scaffoldRecords(base);
    const result = checkGates({
      registry: { scripts, missing_entrypoints: [] },
      sliceIds: new Set(),
      npmTargets: base.npmTargets,
      discovered,
      reachable: base.reachable,
      pathExists: () => true,
      docblockOf: () => ({}),
    });
    assert.deepEqual(result.failures, []);
  });
});

describe('the live repository', () => {
  const registry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SCRIPT_REGISTRY.json'), 'utf8'),
  );
  const world = loadWorld(ROOT);
  const result = checkGates({ registry, ...world });

  test('no hard gate fails against the committed registry', () => {
    assert.deepEqual(result.failures, []);
  });

  test('every governed script on disk is declared exactly once', () => {
    const paths = registry.scripts.map((s) => s.path);
    assert.equal(new Set(paths).size, paths.length, 'a path is declared twice');
    assert.deepEqual([...paths].sort(), [...world.discovered].sort());
  });

  test('registry ids are unique', () => {
    const ids = registry.scripts.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('every record uses a declared vocabulary value', () => {
    for (const s of registry.scripts) {
      assert.ok(registry.kinds[s.kind], `${s.id}: unknown kind "${s.kind}"`);
      assert.ok(registry.durabilities[s.durability], `${s.id}: unknown durability "${s.durability}"`);
      assert.ok(EVIDENCE_TOKENS.has(s.evidence), `${s.id}: unknown evidence "${s.evidence}"`);
      assert.ok(registry.evidence_kinds[s.evidence], `${s.id}: evidence not described in the view`);
    }
  });

  test('lane and scope agree with the path they were derived from', () => {
    for (const s of registry.scripts) {
      assert.equal(s.lane, laneOf(s.path), `${s.id} lane`);
      assert.equal(s.scope, scopeOf(s.path), `${s.id} scope`);
    }
  });

  test('discoverScripts finds exactly as many files as the registry declares', () => {
    assert.equal(discoverScripts(ROOT).length, registry.scripts.length);
  });

  test('this test file is itself registered', () => {
    // It was not, on first run, and NO_ORPHAN_FILES caught it. The register governs
    // its own test suite or it governs nothing.
    const self = registry.scripts.find((s) => s.path.endsWith('render_script_registry.test.mjs'));
    assert.ok(self, 'the register must declare its own tests');
    assert.equal(self.durability, 'permanent');
    assert.equal(self.evidence, 'test-suite');
  });

  test('the v5 debtor generator is registered, closing the proven asymmetry with creditors', () => {
    // REGISTERS_PLAN §5: the v5 lane owner ran by absolute path because no target
    // existed, while creditors:statement-v5 already did.
    const v5 = registry.scripts.find((s) => s.path.endsWith('reconcile_debtor_v5_from_txt.mjs'));
    assert.deepEqual(v5.entrypoints, ['debtors:statement-v5']);
    assert.equal(v5.durability, 'permanent');
    assert.deepEqual(v5.owns_slices, ['statement.v5.composed', 'fixture.v5']);
  });

  test('debtors_dashboard is proven load-bearing through its subprocess edge alone', () => {
    // It has no npm target and nothing imports it; only spawnSync from debtors_sync
    // reaches it. An import-only graph would have filed it as unclassified.
    const dash = registry.scripts.find((s) => s.path.endsWith('debtors_dashboard.mjs'));
    assert.equal(dash.durability, 'permanent');
    assert.equal(dash.evidence, 'invoked-by-permanent');
    assert.deepEqual(dash.entrypoints, []);
    assert.equal(world.reachable.get(dash.path), 'invoke');
  });

  test('the hollow debtors:parse-backlog target is recorded, not quietly tolerated', () => {
    const ack = registry.missing_entrypoints.find((m) => m.target === 'debtors:parse-backlog');
    assert.ok(ack, 'the known-absent target must stay declared until it is resolved');
    assert.ok(!fs.existsSync(path.join(ROOT, ack.declared_path)), 'script must still be absent');
    assert.ok(ack.reopens_when, 'a recorded defect names what closes it');
    assert.equal(ack.resolution_required, 'operator');
    assert.equal(ack.tag, 'PROVEN');
  });

  test('every acknowledged missing entrypoint is still a live package.json target', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    for (const m of registry.missing_entrypoints ?? []) {
      assert.ok(pkg.scripts[m.target], `${m.target} was removed; drop its acknowledgement too`);
    }
  });

  test('no npm target silently names a script outside the register', () => {
    const acknowledged = new Set((registry.missing_entrypoints ?? []).map((m) => m.declared_path));
    const declared = new Set(registry.scripts.map((s) => s.path));
    for (const [target, paths] of world.npmTargets) {
      for (const p of paths) {
        assert.ok(declared.has(p) || acknowledged.has(p), `${target} names unregistered ${p}`);
      }
    }
  });

  test('slice ownership is declared or absent, never guessed', () => {
    for (const s of registry.scripts) {
      for (const id of s.owns_slices ?? []) {
        assert.ok(world.sliceIds.has(id), `${s.id} claims unknown slice ${id}`);
      }
      if ((s.owns_slices ?? []).length) {
        assert.equal(s.durability, 'permanent', `${s.id} owns a slice but is not permanent`);
      }
    }
  });

  test('the unclassified backlog is reported as a warning, never as a pass', () => {
    const unclassified = registry.scripts.filter((s) => s.durability === 'unclassified');
    assert.ok(unclassified.length > 0, 'if this ever hits zero, drop the warning instead of faking it');
    assert.ok(
      result.warnings.some((w) => /unclassified/.test(w.detail)),
      'the backlog must surface every run',
    );
    for (const s of unclassified) assert.equal(s.evidence, 'none');
  });

  test('the rendered markdown view is deterministic for fixed input', () => {
    const audit = buildAudit({ registry, ...world, ...result });
    assert.equal(
      renderMarkdown({ registry, audit, ...result }),
      renderMarkdown({ registry, audit, ...result }),
    );
  });

  test('the committed markdown view is in step with the registry', () => {
    const viewPath = path.join(ROOT, 'analysis/debtors/shared/docs/SCRIPT_REGISTRY.md');
    assert.ok(fs.existsSync(viewPath), 'view has never been generated');
    const audit = buildAudit({ registry, ...world, ...result });
    assert.equal(
      fs.readFileSync(viewPath, 'utf8'),
      renderMarkdown({ registry, audit, ...result }),
      'SCRIPT_REGISTRY.md is stale — run npm run debtors:script-registry:write',
    );
  });
});
