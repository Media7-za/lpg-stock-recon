#!/usr/bin/env node
/**
 * Verify SKILL_REGISTRY.json against the filesystem and render its views.
 *
 * The registry declares; this script scans and compares. A register derived from
 * the thing it governs cannot detect that the thing has drifted, so discovery is
 * used only to contradict the declaration — never to build it.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/render_skill_registry.mjs           # check only
 *   node analysis/debtors/shared/scripts/render_skill_registry.mjs --write   # check + render views
 *
 * Exit 0 = no hard failures. Exit 1 = at least one hard gate failed.
 *
 * Gate logic is exported pure for contract tests — see render_skill_registry.test.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const GATES = [
  'PATH_EXISTS',
  'NO_ORPHAN_FILES',
  'NAME_UNIQUE',
  'FRONTMATTER_MATCH',
  'SLICE_IDS_VALID',
  'SCRIPT_TARGETS_VALID',
];

/**
 * Run every gate against a registry using injected views of the world.
 *
 * @param {object} env
 * @param {object} env.registry        Parsed SKILL_REGISTRY.json.
 * @param {Set<string>} env.sliceIds   Valid SLICE_REGISTRY slice ids.
 * @param {Set<string>} env.scriptTargets Valid `npm run` targets.
 * @param {Array<{root:string,path:string}>} env.discovered Skill files found on disk.
 * @param {(p:string)=>boolean} env.pathExists
 * @param {(p:string)=>string|null} env.frontmatterName
 * @returns {{failures: Array, warnings: Array}}
 */
export function checkGates({
  registry,
  sliceIds,
  scriptTargets,
  discovered,
  pathExists,
  frontmatterName,
}) {
  const failures = [];
  const warnings = [];
  const fail = (gate, detail) => failures.push({ gate, detail });
  const warn = (gate, detail) => warnings.push({ gate, detail });
  const skills = registry.skills ?? [];

  // PATH_EXISTS — every declared path resolves on disk.
  for (const s of skills) {
    if (!pathExists(s.path)) {
      fail('PATH_EXISTS', `${s.id} declares missing path ${s.path}`);
    }
  }

  // NO_ORPHAN_FILES — every skill file on disk is declared. This is the gate that
  // stops a new skill from quietly becoming invisible.
  const declaredPaths = new Set(skills.map((s) => s.path));
  for (const d of discovered) {
    if (!declaredPaths.has(d.path)) {
      fail('NO_ORPHAN_FILES', `${d.path} exists under root ${d.root} but is not in the registry`);
    }
  }

  // NAME_UNIQUE — no two records share a name. Hard since 2026-09-29 (doctrine D20):
  // a name declared twice makes which file loads depend on load order, so a collision
  // must be resolved by superseding one side, not acknowledged in place.
  const byName = new Map();
  for (const s of skills) {
    if (!s.name) continue;
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name).push(s);
  }
  for (const [name, group] of byName) {
    if (group.length < 2) continue;
    fail(
      'NAME_UNIQUE',
      `name "${name}" declared by ${group.length} records (${group.map((s) => s.id).join(', ')}) — ` +
        'resolve by marking one superseded and removing its name: key',
    );
  }

  // FRONTMATTER_MATCH — declared name agrees with the file on disk, and a file that
  // cannot be auto-loaded is not claimed to be active.
  for (const s of skills) {
    if (!pathExists(s.path)) continue;
    const actual = frontmatterName(s.path);
    if ((s.name ?? null) !== actual) {
      fail(
        'FRONTMATTER_MATCH',
        `${s.id} declares name ${JSON.stringify(s.name ?? null)} but ${s.path} has ${JSON.stringify(actual)}`,
      );
    }
    if (actual === null && s.status !== 'unregistered' && s.status !== 'superseded') {
      fail(
        'FRONTMATTER_MATCH',
        `${s.id} has no frontmatter name so cannot be auto-loaded, but status is "${s.status}" (expected "unregistered")`,
      );
    }
  }

  // SLICE_IDS_VALID — produces_slices are foreign keys into SLICE_REGISTRY.
  for (const s of skills) {
    for (const id of s.produces_slices ?? []) {
      if (!sliceIds.has(id)) {
        fail('SLICE_IDS_VALID', `${s.id} produces unknown slice "${id}"`);
      }
    }
  }

  // SCRIPT_TARGETS_VALID — owns_scripts are real npm run targets.
  for (const s of skills) {
    for (const target of s.owns_scripts ?? []) {
      if (!scriptTargets.has(target)) {
        fail('SCRIPT_TARGETS_VALID', `${s.id} owns unregistered npm target "${target}"`);
      }
    }
  }

  return { failures, warnings };
}

/** Parse a frontmatter `name:` out of raw markdown, or null when absent. */
export function parseFrontmatterName(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const match = text.slice(3, end).match(/^name:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Discovery rules per root. Each root uses a different file layout, which is itself
 * one of the defects the registry exists to record.
 */
export function discoverSkillFiles(root) {
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');

  const listFiles = (dir, filter) => {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((e) => e.isFile() && filter(e.name))
      .map((e) => rel(path.join(abs, e.name)));
  };

  const listNested = (dir, leaf) => {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(abs, e.name, leaf))
      .filter((p) => fs.existsSync(p))
      .map(rel);
  };

  const listAccountLocal = (dir) => {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .flatMap((e) => {
        const docs = path.join(abs, e.name, 'docs');
        if (!fs.existsSync(docs)) return [];
        return fs
          .readdirSync(docs)
          .filter((f) => /_reconciliation_skill\.md$/i.test(f))
          .map((f) => rel(path.join(docs, f)));
      });
  };

  const isMd = (f) => f.endsWith('.md');
  const rules = {
    '.agents/skills': () => listFiles('.agents/skills', isMd),
    'analysis/skills': () => listNested('analysis/skills', 'SKILL.md'),
    '.claude/skills': () => listNested('.claude/skills', 'SKILL.md'),
    'docs/skills': () => listFiles('docs/skills', isMd),
    'analysis/debtors': () => listAccountLocal('analysis/debtors'),
  };

  return Object.entries(rules).flatMap(([rootName, scan]) =>
    scan().map((p) => ({ root: rootName, path: p })),
  );
}

/** Expand SLICE_REGISTRY ids, tolerating the `.month` / `.{YYYY-MM}` alias pair. */
export function sliceIdsFrom(sliceRegistry) {
  const ids = Array.isArray(sliceRegistry.slices)
    ? sliceRegistry.slices.map((s) => s.id)
    : Object.keys(sliceRegistry.slices);
  return new Set(ids.flatMap((id) => [id, id.replace(/\.month$/, '.{YYYY-MM}')]));
}

export function buildAudit({ registry, discovered, failures, warnings, sliceIds }) {
  const skills = registry.skills;
  const tally = (items, key) =>
    items.reduce((acc, s) => ({ ...acc, [s[key]]: (acc[s[key]] ?? 0) + 1 }), {});

  return {
    generated_by: 'analysis/debtors/shared/scripts/render_skill_registry.mjs',
    generated_at: new Date().toISOString(),
    registry_version: registry.version,
    registry_status: registry.status ?? 'ratified',
    totals: {
      declared: skills.length,
      discovered_on_disk: discovered.length,
      roots: new Set(discovered.map((d) => d.root)).size,
      auto_loadable: skills.filter((s) => s.name !== null).length,
      without_frontmatter: skills.filter((s) => s.name === null).length,
    },
    by_root: tally(discovered, 'root'),
    by_status: tally(skills, 'status'),
    by_kind: tally(skills, 'kind'),
    gates: Object.fromEntries(
      GATES.map((g) => [
        g,
        {
          failures: failures.filter((f) => f.gate === g).length,
          warnings: warnings.filter((w) => w.gate === g).length,
        },
      ]),
    ),
    failures,
    warnings,
    skills_without_frontmatter: skills.filter((s) => s.name === null).map((s) => s.path),
    slice_coverage: {
      slices_claimed: [...new Set(skills.flatMap((s) => s.produces_slices ?? []))].sort(),
      slices_unclaimed: [...sliceIds]
        .filter((id) => !id.includes('{'))
        .filter((id) => !skills.some((s) => (s.produces_slices ?? []).includes(id)))
        .sort(),
    },
  };
}

export function renderMarkdown({ registry, audit, failures, warnings }) {
  const skills = registry.skills;
  const esc = (v) => String(v ?? '—').replace(/\|/g, '\\|');
  const lines = [];

  lines.push(`# Skill Registry (v${registry.version})`);
  lines.push('');
  lines.push(`> **Status:** \`${registry.status ?? 'ratified'}\`  `);
  lines.push('> **Canonical machine-readable registry:** `analysis/debtors/shared/SKILL_REGISTRY.json`  ');
  lines.push('> **Audit:** `analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json`  ');
  lines.push(`> **Plan:** \`${registry.plan}\`  `);
  lines.push(`> **Authority:** \`${registry.authority}\`  `);
  lines.push('> **Generated — do not edit.** Regenerate: `npm run debtors:skill-registry:write`');
  lines.push('');
  lines.push(
    `${skills.length} skill files across ${audit.totals.roots} roots. ` +
      `${audit.totals.auto_loadable} carry frontmatter and are auto-loadable by an agent runtime; ` +
      `${audit.totals.without_frontmatter} do not and are reachable only by explicit path.`,
  );
  lines.push('');
  lines.push(`**Kinds:** ${Object.keys(registry.kinds).map((k) => `\`${k}\``).join(' · ')}  `);
  lines.push(`**Statuses:** ${Object.keys(registry.statuses).map((k) => `\`${k}\``).join(' · ')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const lane of Object.keys(registry.lanes)) {
    const group = skills.filter((s) => s.lane === lane);
    if (!group.length) continue;
    lines.push(`## Lane: ${lane}`);
    lines.push('');
    lines.push(`_${registry.lanes[lane]}_`);
    lines.push('');
    lines.push('| ID | Name | Kind | Status | Canonical for |');
    lines.push('| :--- | :--- | :--- | :--- | :--- |');
    for (const s of group) {
      const status = s.status === 'active' ? s.status : `**${s.status}**`;
      const name = s.name ? `\`${s.name}\`` : '_(no frontmatter)_';
      lines.push(`| \`${s.id}\` | ${name} | ${s.kind} | ${status} | ${esc(s.canonical_for)} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Negative scope');
  lines.push('');
  lines.push('What each skill must **not** be used for. Carried from skill frontmatter — the wrong-lane mistake is the expensive one.');
  lines.push('');
  lines.push('| ID | Not for |');
  lines.push('| :--- | :--- |');
  for (const s of skills) lines.push(`| \`${s.id}\` | ${esc(s.not_for)} |`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## Paths and owned entry points');
  lines.push('');
  lines.push('| ID | Path | Owns `npm run` | Produces slices |');
  lines.push('| :--- | :--- | :--- | :--- |');
  for (const s of skills) {
    const scripts = (s.owns_scripts ?? []).map((x) => `\`${x}\``).join(' ') || '—';
    const slices = (s.produces_slices ?? []).map((x) => `\`${x}\``).join(' ') || '—';
    lines.push(`| \`${s.id}\` | \`${s.path}\` | ${scripts} | ${slices} |`);
  }
  lines.push('');

  const flagged = skills.filter((s) => s.status !== 'active');
  if (flagged.length) {
    lines.push('---');
    lines.push('');
    lines.push('## Flagged records');
    lines.push('');
    lines.push('Records that are not `active`. Each states why.');
    lines.push('');
    lines.push('| ID | Status | Note |');
    lines.push('| :--- | :--- | :--- |');
    for (const s of flagged) lines.push(`| \`${s.id}\` | **${s.status}** | ${esc(s.notes)} |`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Gate results');
  lines.push('');
  lines.push('| Gate | Failures | Warnings |');
  lines.push('| :--- | ---: | ---: |');
  for (const [gate, counts] of Object.entries(audit.gates)) {
    lines.push(`| \`${gate}\` | ${counts.failures} | ${counts.warnings} |`);
  }
  lines.push('');
  for (const w of warnings) lines.push(`- **WARN** \`${w.gate}\` — ${w.detail}`);
  for (const f of failures) lines.push(`- **FAIL** \`${f.gate}\` — ${f.detail}`);
  if (!warnings.length && !failures.length) lines.push('_All gates clean._');
  lines.push('');

  const unclaimed = audit.slice_coverage.slices_unclaimed;
  if (unclaimed.length) {
    lines.push('---');
    lines.push('');
    lines.push('## Slices with no owning skill');
    lines.push('');
    lines.push(
      'Declared in `SLICE_REGISTRY.json` but no registered skill claims to produce them. ' +
        'Not necessarily a defect — some slices are produced by scripts invoked directly.',
    );
    lines.push('');
    lines.push(unclaimed.map((id) => `\`${id}\``).join(' · '));
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT = path.resolve(__dirname, '../../../..');
  const WRITE = process.argv.includes('--write');

  const registry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SKILL_REGISTRY.json'), 'utf8'),
  );
  const sliceRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json'), 'utf8'),
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  const sliceIds = sliceIdsFrom(sliceRegistry);
  const scriptTargets = new Set(Object.keys(pkg.scripts ?? {}));
  const discovered = discoverSkillFiles(ROOT);

  const { failures, warnings } = checkGates({
    registry,
    sliceIds,
    scriptTargets,
    discovered,
    pathExists: (p) => fs.existsSync(path.join(ROOT, p)),
    frontmatterName: (p) => parseFrontmatterName(fs.readFileSync(path.join(ROOT, p), 'utf8')),
  });

  const audit = buildAudit({ registry, discovered, failures, warnings, sliceIds });

  if (WRITE) {
    const mdOut = path.join(ROOT, 'analysis/debtors/shared/docs/SKILL_REGISTRY.md');
    const auditOut = path.join(ROOT, 'analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json');
    fs.writeFileSync(mdOut, renderMarkdown({ registry, audit, failures, warnings }));
    fs.writeFileSync(auditOut, `${JSON.stringify(audit, null, 2)}\n`);
    console.log('Wrote analysis/debtors/shared/docs/SKILL_REGISTRY.md');
    console.log('Wrote analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json');
  }

  console.log(`\nSkill registry v${registry.version} — ${audit.registry_status}`);
  console.log(
    `  ${audit.totals.declared} declared · ${audit.totals.discovered_on_disk} discovered on disk · ` +
      `${audit.totals.roots} roots · ${audit.totals.without_frontmatter} without frontmatter`,
  );
  for (const [root, n] of Object.entries(audit.by_root)) console.log(`    ${root}: ${n}`);
  console.log('  Gates:');
  for (const [gate, counts] of Object.entries(audit.gates)) {
    const mark = counts.failures ? 'FAIL' : counts.warnings ? 'WARN' : 'pass';
    console.log(`    [${mark}] ${gate}`);
  }
  for (const w of warnings) console.log(`  WARN ${w.gate}: ${w.detail}`);
  for (const f of failures) console.log(`  FAIL ${f.gate}: ${f.detail}`);

  if (failures.length) {
    console.error(`\n${failures.length} hard gate failure(s).`);
    process.exit(1);
  }
  console.log(`\nOK — ${warnings.length} acknowledged warning(s), 0 failures.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
