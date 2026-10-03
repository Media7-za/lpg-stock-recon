// Skill registry gate contract tests.
//
// Boundary under test: registry-vs-filesystem agreement only. No financial truth.
// The point of these tests is that every gate must be shown to FAIL on a planted
// defect — a validator that only ever passes proves nothing.
//
// Run: node --test analysis/debtors/shared/scripts/render_skill_registry.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GATES,
  checkGates,
  parseFrontmatterName,
  discoverSkillFiles,
  sliceIdsFrom,
  buildAudit,
  renderMarkdown,
} from './render_skill_registry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

/** A minimal clean registry: one active skill, all gates satisfied. */
function cleanEnv(overrides = {}) {
  const registry = {
    version: '1.0.0',
    status: 'PROPOSED — NOT RATIFIED',
    plan: 'plan.md',
    authority: 'doctrine.md',
    kinds: { generator: 'g' },
    lanes: { debtors: 'AR' },
    statuses: { active: 'a', duplicate: 'd', unregistered: 'u', superseded: 's' },
    skills: [
      {
        id: 'alpha',
        name: 'alpha-skill',
        path: '.agents/skills/alpha.md',
        root: '.agents/skills',
        kind: 'generator',
        lane: 'debtors',
        status: 'active',
        canonical_for: 'Alpha',
        not_for: 'Beta',
        owns_scripts: ['debtors:sync'],
        produces_slices: ['txt.parse'],
        related: [],
        notes: null,
      },
    ],
  };

  return {
    registry,
    sliceIds: new Set(['txt.parse']),
    scriptTargets: new Set(['debtors:sync']),
    discovered: [{ root: '.agents/skills', path: '.agents/skills/alpha.md' }],
    pathExists: () => true,
    frontmatterName: () => 'alpha-skill',
    ...overrides,
  };
}

const gatesHit = (result) => [...new Set(result.failures.map((f) => f.gate))];

describe('baseline', () => {
  test('a clean registry raises no failures and no warnings', () => {
    const { failures, warnings } = checkGates(cleanEnv());
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  });
});

describe('PATH_EXISTS', () => {
  test('fails when a declared skill file is missing from disk', () => {
    const result = checkGates(cleanEnv({ pathExists: () => false }));
    assert.ok(gatesHit(result).includes('PATH_EXISTS'));
    assert.match(result.failures[0].detail, /alpha declares missing path/);
  });

  test('a missing file does not also trip FRONTMATTER_MATCH', () => {
    // Frontmatter cannot be read from a file that is not there; reporting both
    // would bury the real defect under a derived one.
    const result = checkGates(cleanEnv({ pathExists: () => false }));
    assert.ok(!gatesHit(result).includes('FRONTMATTER_MATCH'));
  });
});

describe('NO_ORPHAN_FILES', () => {
  test('fails when a skill file on disk is absent from the registry', () => {
    const env = cleanEnv();
    env.discovered.push({ root: '.agents/skills', path: '.agents/skills/unregistered_new.md' });
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('NO_ORPHAN_FILES'));
    assert.match(
      result.failures.find((f) => f.gate === 'NO_ORPHAN_FILES').detail,
      /unregistered_new\.md exists under root .agents\/skills but is not in the registry/,
    );
  });

  test('a registry entry with no file on disk is PATH_EXISTS, not an orphan', () => {
    const env = cleanEnv({ discovered: [], pathExists: () => false });
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('PATH_EXISTS'));
    assert.ok(!gatesHit(result).includes('NO_ORPHAN_FILES'));
  });
});

describe('NAME_UNIQUE', () => {
  // Hard since doctrine D20 (2026-09-29). There is no longer an "acknowledged
  // duplicate" state: a collision must be resolved by superseding one side.
  const collidingEnv = (statusA, statusB) => {
    const env = cleanEnv();
    env.registry.skills = [
      { ...env.registry.skills[0], id: 'one', status: statusA },
      { ...env.registry.skills[0], id: 'two', status: statusB, path: '.agents/skills/beta.md' },
    ];
    env.discovered = [
      { root: '.agents/skills', path: '.agents/skills/alpha.md' },
      { root: '.agents/skills', path: '.agents/skills/beta.md' },
    ];
    return env;
  };

  test('fails on a name collision between two active records', () => {
    const result = checkGates(collidingEnv('active', 'active'));
    assert.ok(gatesHit(result).includes('NAME_UNIQUE'));
    assert.match(result.failures[0].detail, /resolve by marking one superseded/);
  });

  test('still fails when a collision is merely labelled, never downgraded to a warning', () => {
    // Guards the D20 promotion: labelling a collision must not buy tolerance.
    for (const status of ['duplicate', 'superseded', 'unregistered']) {
      const result = checkGates(collidingEnv(status, status));
      assert.ok(
        gatesHit(result).includes('NAME_UNIQUE'),
        `collision with status "${status}" should still be a hard failure`,
      );
      assert.equal(result.warnings.length, 0, 'NAME_UNIQUE must never warn');
    }
  });

  test('a superseded record with its name removed no longer collides', () => {
    // This is the shape D2 resolved lsr-pm into.
    const env = collidingEnv('active', 'superseded');
    env.registry.skills[1].name = null;
    const result = checkGates({
      ...env,
      frontmatterName: (p) => (p === '.agents/skills/beta.md' ? null : 'alpha-skill'),
    });
    assert.deepEqual(result.failures, []);
    assert.deepEqual(result.warnings, []);
  });

  test('null names never collide with each other', () => {
    const env = cleanEnv();
    env.registry.skills = [
      { ...env.registry.skills[0], id: 'one', name: null, status: 'unregistered' },
      {
        ...env.registry.skills[0],
        id: 'two',
        name: null,
        status: 'unregistered',
        path: '.agents/skills/beta.md',
      },
    ];
    env.discovered = [
      { root: '.agents/skills', path: '.agents/skills/alpha.md' },
      { root: '.agents/skills', path: '.agents/skills/beta.md' },
    ];
    const result = checkGates({ ...env, frontmatterName: () => null });
    assert.deepEqual(result.failures, []);
    assert.deepEqual(result.warnings, []);
  });
});

describe('FRONTMATTER_MATCH', () => {
  test('fails when the declared name disagrees with the file', () => {
    const result = checkGates(cleanEnv({ frontmatterName: () => 'something-else' }));
    assert.ok(gatesHit(result).includes('FRONTMATTER_MATCH'));
    assert.match(result.failures[0].detail, /declares name "alpha-skill" but .* has "something-else"/);
  });

  test('fails when a file with no frontmatter is claimed active', () => {
    // This is the defect that matters: an "active" skill no runtime can load.
    const result = checkGates(cleanEnv({ frontmatterName: () => null }));
    const details = result.failures.filter((f) => f.gate === 'FRONTMATTER_MATCH');
    assert.equal(details.length, 2, 'name mismatch and un-loadable-but-active are distinct defects');
    assert.ok(details.some((d) => /expected "unregistered"/.test(d.detail)));
  });

  test('accepts a frontmatter-less file when it is declared unregistered', () => {
    const env = cleanEnv({ frontmatterName: () => null });
    env.registry.skills[0].name = null;
    env.registry.skills[0].status = 'unregistered';
    const result = checkGates(env);
    assert.deepEqual(result.failures, []);
  });
});

describe('SLICE_IDS_VALID', () => {
  test('fails when produces_slices names a slice SLICE_REGISTRY does not declare', () => {
    const env = cleanEnv();
    env.registry.skills[0].produces_slices = ['txt.parse', 'v9.invented.slice'];
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('SLICE_IDS_VALID'));
    assert.match(result.failures[0].detail, /produces unknown slice "v9.invented.slice"/);
  });
});

describe('SCRIPT_TARGETS_VALID', () => {
  test('fails when owns_scripts names an npm target package.json does not define', () => {
    const env = cleanEnv();
    env.registry.skills[0].owns_scripts = ['debtors:sync', 'debtors:does-not-exist'];
    const result = checkGates(env);
    assert.ok(gatesHit(result).includes('SCRIPT_TARGETS_VALID'));
    assert.match(result.failures[0].detail, /owns unregistered npm target "debtors:does-not-exist"/);
  });
});

describe('parseFrontmatterName', () => {
  test('reads a name from a well-formed block', () => {
    assert.equal(parseFrontmatterName('---\nname: foo-bar\ndescription: x\n---\n# Doc'), 'foo-bar');
  });

  test('returns null when the file has no frontmatter at all', () => {
    assert.equal(parseFrontmatterName('# Just a heading\n\nProse.'), null);
  });

  test('returns null when frontmatter exists but declares no name', () => {
    assert.equal(parseFrontmatterName('---\ndescription: x\n---\n# Doc'), null);
  });

  test('returns null on an unterminated frontmatter block', () => {
    assert.equal(parseFrontmatterName('---\nname: foo\n# never closed'), null);
  });

  test('does not mistake a body line for frontmatter', () => {
    assert.equal(parseFrontmatterName('---\ndescription: x\n---\nname: not-frontmatter'), null);
  });
});

describe('sliceIdsFrom', () => {
  test('accepts both the .month id and its {YYYY-MM} rendering', () => {
    const ids = sliceIdsFrom({ slices: [{ id: 'v4.part1.financial.month' }] });
    assert.ok(ids.has('v4.part1.financial.month'));
    assert.ok(ids.has('v4.part1.financial.{YYYY-MM}'));
  });
});

describe('live repository registry', () => {
  const registry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SKILL_REGISTRY.json'), 'utf8'),
  );
  const sliceRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json'), 'utf8'),
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const discovered = discoverSkillFiles(ROOT);
  const sliceIds = sliceIdsFrom(sliceRegistry);

  const result = checkGates({
    registry,
    sliceIds,
    scriptTargets: new Set(Object.keys(pkg.scripts ?? {})),
    discovered,
    pathExists: (p) => fs.existsSync(path.join(ROOT, p)),
    frontmatterName: (p) => parseFrontmatterName(fs.readFileSync(path.join(ROOT, p), 'utf8')),
  });

  test('the committed registry has zero hard gate failures', () => {
    assert.deepEqual(result.failures, [], JSON.stringify(result.failures, null, 2));
  });

  test('every skill file discovered on disk is declared', () => {
    const declared = new Set(registry.skills.map((s) => s.path));
    const orphans = discovered.filter((d) => !declared.has(d.path)).map((d) => d.path);
    assert.deepEqual(orphans, []);
  });

  test('declared count equals discovered count — no phantom records', () => {
    assert.equal(registry.skills.length, discovered.length);
  });

  test('ids are unique', () => {
    const ids = registry.skills.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('every record declares canonical_for and not_for', () => {
    for (const s of registry.skills) {
      assert.ok(s.canonical_for, `${s.id} missing canonical_for`);
      assert.ok(s.not_for, `${s.id} missing not_for`);
    }
  });

  test('every status and kind and lane is one the registry defines', () => {
    for (const s of registry.skills) {
      assert.ok(registry.statuses[s.status], `${s.id} has undefined status ${s.status}`);
      assert.ok(registry.kinds[s.kind], `${s.id} has undefined kind ${s.kind}`);
      assert.ok(registry.lanes[s.lane], `${s.id} has undefined lane ${s.lane}`);
    }
  });

  test('every root a record cites is a root the registry defines', () => {
    for (const s of registry.skills) {
      assert.ok(registry.roots[s.root], `${s.id} cites undefined root ${s.root}`);
    }
  });

  test('related ids resolve to real records', () => {
    const ids = new Set(registry.skills.map((s) => s.id));
    for (const s of registry.skills) {
      for (const r of s.related ?? []) {
        assert.ok(ids.has(r), `${s.id} relates to unknown id ${r}`);
      }
    }
  });

  test('registry gate list matches the implemented gates', () => {
    assert.deepEqual(registry.gates, GATES);
  });

  test('a non-active record explains itself in notes', () => {
    for (const s of registry.skills.filter((x) => x.status !== 'active')) {
      assert.ok(s.notes, `${s.id} is "${s.status}" but has no note explaining why`);
    }
  });

  test('the lsr-pm collision is resolved — exactly one record claims the name', () => {
    // Regression guard for operator decision D2. The collision was real; if a second
    // claimant reappears, which file an agent loads becomes load-order dependent again.
    const claimants = registry.skills.filter((s) => s.name === 'lsr-pm');
    assert.equal(claimants.length, 1, 'exactly one record may claim "lsr-pm"');
    assert.equal(claimants[0].path, '.agents/skills/New_Feature_PM_Skill.md');
  });

  test('the superseded lsr-pm file is retained, marked, and un-loadable', () => {
    // Amendments append: the file must still exist, must be flagged superseded, and
    // must have lost its name: key so no runtime can pick it up.
    const short = registry.skills.find((s) => s.id === 'pipeline.pm.short');
    assert.equal(short.status, 'superseded');
    assert.equal(short.name, null);
    const body = fs.readFileSync(path.join(ROOT, short.path), 'utf8');
    assert.ok(fs.existsSync(path.join(ROOT, short.path)), 'superseded file must not be deleted');
    assert.match(body, /SUPERSEDED/);
    assert.equal(parseFrontmatterName(body), null, 'superseded file must declare no name');
  });

  test('registry statuses no longer offer "duplicate" as a tolerable state', () => {
    assert.ok(!registry.statuses.duplicate, '"duplicate" must be retired, not active');
    assert.ok(registry.retired_statuses?.duplicate, 'retirement must be recorded, not erased');
  });

  test('relocated account-local skills are auto-loadable and still account-scoped', () => {
    for (const id of ['fam000.recon', 'jen001.recon']) {
      const s = registry.skills.find((x) => x.id === id);
      assert.ok(s.name, `${id} must declare a name so a runtime can discover it`);
      assert.equal(s.kind, 'account-local');
      assert.match(s.not_for, /Any other account/);
    }
  });

  test('no skill file remains outside a skill root', () => {
    // D20: an account-local skill left under analysis/debtors/{CODE}/docs/ is
    // undiscoverable. The root is still scanned so a new one trips NO_ORPHAN_FILES.
    const stragglers = discovered.filter((d) => d.root === 'analysis/debtors');
    assert.deepEqual(stragglers, []);
  });

  test('the rendered markdown view is deterministic for fixed input', () => {
    const audit = buildAudit({ registry, discovered, ...result, sliceIds });
    const a = renderMarkdown({ registry, audit, ...result });
    const b = renderMarkdown({ registry, audit, ...result });
    assert.equal(a, b);
  });

  test('the committed markdown view is in step with the registry', () => {
    // Catches a registry edit committed without regenerating the view.
    const viewPath = path.join(ROOT, 'analysis/debtors/shared/docs/SKILL_REGISTRY.md');
    assert.ok(fs.existsSync(viewPath), 'view has never been generated');
    const audit = buildAudit({ registry, discovered, ...result, sliceIds });
    const expected = renderMarkdown({ registry, audit, ...result });
    assert.equal(
      fs.readFileSync(viewPath, 'utf8'),
      expected,
      'SKILL_REGISTRY.md is stale — run npm run debtors:skill-registry:write',
    );
  });
});
