#!/usr/bin/env node
/**
 * Verify SCRIPT_REGISTRY.json against the filesystem and render its views.
 *
 * @scope        universal
 * @durability   permanent
 * @entrypoint   npm run debtors:script-registry
 *
 * Same contract as render_skill_registry.mjs (doctrine D20): the registry
 * declares, this script scans and compares, and discovery is only ever used to
 * contradict a declaration — never to build one. A catalogue generated from the
 * filesystem agrees with the filesystem by construction and so can never report
 * that the filesystem is wrong.
 *
 * Durability is the one field that cannot be read off a path, so it is never
 * guessed. A record claims `permanent` only against named evidence; anything
 * unproven stays `unclassified` so the triage backlog is countable instead of
 * fabricated.
 *
 * Usage:
 *   node .../render_script_registry.mjs            # check only
 *   node .../render_script_registry.mjs --write    # check + render views
 *   node .../render_script_registry.mjs --scaffold # emit provable-only records
 *
 * Exit 0 = no hard failures. Exit 1 = at least one hard gate failed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const GATES = [
  'PATH_EXISTS',
  'NO_ORPHAN_FILES',
  'ENTRYPOINT_RESOLVES',
  'DOCBLOCK_MATCH',
  'SLICE_IDS_VALID',
  'REACHABLE_IS_PERMANENT',
  'EVIDENCE_REQUIRED',
];

/** Durability values that assert the script is load-bearing. */
export const LOAD_BEARING = new Set(['permanent']);

/** Evidence tokens a durability claim may cite. */
export const EVIDENCE_TOKENS = new Set([
  'npm-entrypoint',
  'test-suite',
  'imported-by-permanent',
  'invoked-by-permanent',
  'docblock-deprecated',
  'backup-directory',
  'operator-declared',
  'none',
]);

/** Evidence tokens produced by reachability, and so not assertable by hand. */
export const REACHABILITY_EVIDENCE = new Set(['imported-by-permanent', 'invoked-by-permanent']);

const SCRIPT_EXT = /\.(mjs|py|sql)$/;

/**
 * Directories whose scripts are governed. A script outside these is not in scope,
 * which is why adding a new scripts root is a tripwire on this register.
 */
export function isGovernedScriptPath(p) {
  return /^analysis\/[^/]+\/(?:[^/]+\/)?scripts\//.test(p) && SCRIPT_EXT.test(p);
}

/** Lane is provable from the path. */
export function laneOf(p) {
  const m = p.match(/^analysis\/([^/]+)\//);
  return m ? m[1] : null;
}

/**
 * Scope is provable from the path. A `shared/` segment, or no account segment at
 * all, means portfolio-wide; anything else is bound to the account that names it.
 */
export function scopeOf(p) {
  const m = p.match(/^analysis\/[^/]+\/(?:([^/]+)\/)?scripts\//);
  if (!m) return null;
  if (m[1] === undefined || m[1] === 'shared') return 'universal';
  return `account:${m[1]}`;
}

/**
 * Parse the `@scope` / `@durability` / `@owns-slice` / `@entrypoint` header
 * docblock. Returns only the keys actually present, so a script with no docblock
 * is distinguishable from one that declares nothing.
 */
export function parseDocblock(text) {
  const open = text.indexOf('/**');
  if (open === -1) return {};
  const close = text.indexOf('*/', open);
  if (close === -1) return {};
  const block = text.slice(open, close);
  const out = {};
  // A tag may sit on the opening `/**` line or on a continuation `*` line — both
  // forms are already in use, so neither is treated as the only spelling.
  const tagAt = (tag) => `(?:^|\\n)\\s*(?:/\\*\\*|\\*)\\s*@${tag}\\b`;
  const read = (tag) => {
    const m = block.match(new RegExp(`${tagAt(tag)}[ \\t]+([^\\n]+)`));
    return m ? m[1].trim() : undefined;
  };
  const scope = read('scope');
  const durability = read('durability');
  const ownsSlice = read('owns-slice');
  const entrypoint = read('entrypoint');
  // `@deprecated <reason>` predates this register and is already used in two scripts.
  // Honour it rather than requiring those authors' intent to be restated.
  if (new RegExp(tagAt('deprecated')).test(block)) out.deprecated = true;
  if (scope !== undefined) out.scope = scope;
  if (durability !== undefined) out.durability = durability;
  if (ownsSlice !== undefined) {
    out.owns_slices = ownsSlice
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (entrypoint !== undefined) out.entrypoint = entrypoint.replace(/^npm run\s+/, '').trim();
  return out;
}

/** Every governed script on disk, repo-relative, sorted. */
export function discoverScripts(root) {
  const found = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.isFile() && isGovernedScriptPath(rel)) found.push(rel);
    }
  };
  walk('analysis');
  return found.sort();
}

/**
 * Map each npm script target to the analysis/ script paths its command names.
 * Glob commands (`*.test.mjs`) are returned expanded against `existing`, because
 * `debtors:test` legitimately targets a set rather than one file.
 */
export function npmTargetPaths(pkgScripts, existing = []) {
  const out = new Map();
  for (const [target, cmd] of Object.entries(pkgScripts ?? {})) {
    const paths = [...String(cmd).matchAll(/(analysis\/[^\s'"]+\.(?:mjs|py|sql))/g)].map((m) => m[1]);
    if (!paths.length) continue;
    const expanded = paths.flatMap((p) => {
      if (!p.includes('*')) return [p];
      const rx = new RegExp(`^${p.replace(/[.]/g, '\\.').replace(/\*/g, '[^/]*')}$`);
      return existing.filter((e) => rx.test(e));
    });
    out.set(target, [...new Set(expanded)]);
  }
  return out;
}

const SUBPROCESS_CALL = /\b(?:spawnSync|spawn|execSync|execFileSync|execFile|exec)\s*\(/;

/**
 * Dependency edges between governed scripts, by kind.
 *
 * Two kinds, because they are not equally precise and must not be cited as if they
 * were. `import` edges come from resolved module specifiers and are exact. `invoke`
 * edges come from a script that shells out — `debtors_sync` runs `debtors_dashboard`
 * through `spawnSync`, which no import scan can see. Missing those would understate
 * what is load-bearing, and understating is the direction that gets a live script
 * deleted, so `invoke` scanning is deliberately generous: any script-shaped string
 * literal in a file that shells out at all counts.
 */
export function buildDependencyGraph({ files, readFile }) {
  const edges = new Map();
  const present = new Set(files);
  const resolve = (from, spec) => {
    const candidates = spec.startsWith('analysis/')
      ? [spec]
      : [path.posix.normalize(path.posix.join(path.posix.dirname(from), spec))];
    return candidates.filter((p) => present.has(p));
  };

  for (const f of files) {
    edges.set(f, { import: [], invoke: [] });
    if (!f.endsWith('.mjs')) continue;
    let text;
    try {
      text = readFile(f);
    } catch {
      continue;
    }

    const imports = [
      ...[...text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]),
      ...[...text.matchAll(/import\(\s*['"](\.[^'"]+)['"]/g)].map((m) => m[1]),
    ].flatMap((s) => resolve(f, s));

    let invokes = [];
    if (SUBPROCESS_CALL.test(text)) {
      invokes = [...text.matchAll(/['"]([^'"\s]+\.(?:mjs|py|sql))['"]/g)]
        .map((m) => m[1])
        .flatMap((s) => resolve(f, s))
        .filter((p) => p !== f);
    }

    edges.set(f, {
      import: [...new Set(imports)],
      invoke: [...new Set(invokes)].filter((p) => !imports.includes(p)),
    });
  }
  return edges;
}

/**
 * Transitive closure from `roots`, recording how each script was first reached.
 * Import edges win over invoke edges when both reach the same script, because the
 * import proof is the stronger of the two.
 *
 * @returns {Map<string,'import'|'invoke'>} reached script -> edge kind, roots excluded.
 */
export function reachableFrom(edges, roots) {
  const via = new Map();
  const stack = [...roots];
  while (stack.length) {
    const cur = stack.pop();
    const out = edges.get(cur) ?? { import: [], invoke: [] };
    for (const kind of ['import', 'invoke']) {
      for (const next of out[kind] ?? []) {
        if (via.get(next) === 'import') continue;
        if (via.get(next) === kind) continue;
        via.set(next, kind);
        stack.push(next);
      }
    }
  }
  for (const r of roots) via.delete(r);
  return via;
}

/**
 * Run every gate using injected views of the world.
 *
 * @param {object} env
 * @param {object} env.registry            Parsed SCRIPT_REGISTRY.json.
 * @param {Set<string>} env.sliceIds       Valid SLICE_REGISTRY slice ids.
 * @param {Map<string,string[]>} env.npmTargets npm target -> analysis paths it names.
 * @param {string[]} env.discovered        Governed scripts found on disk.
 * @param {Map<string,'import'|'invoke'>} env.reachable Reached script -> edge kind.
 * @param {(p:string)=>boolean} env.pathExists
 * @param {(p:string)=>object} env.docblockOf
 * @returns {{failures: Array, warnings: Array}}
 */
export function checkGates({
  registry,
  sliceIds,
  npmTargets,
  discovered,
  reachable,
  pathExists,
  docblockOf,
}) {
  const failures = [];
  const warnings = [];
  const fail = (gate, detail) => failures.push({ gate, detail });
  const warn = (gate, detail) => warnings.push({ gate, detail });
  const scripts = registry.scripts ?? [];
  const byPath = new Map(scripts.map((s) => [s.path, s]));

  // PATH_EXISTS — every declared path resolves on disk.
  for (const s of scripts) {
    if (!pathExists(s.path)) fail('PATH_EXISTS', `${s.id} declares missing path ${s.path}`);
  }

  // NO_ORPHAN_FILES — a script added without registration breaks the build rather
  // than joining the 98-file pile anonymously.
  for (const p of discovered) {
    if (!byPath.has(p)) fail('NO_ORPHAN_FILES', `${p} exists on disk but is not in the registry`);
  }

  // ENTRYPOINT_RESOLVES — both directions. Forward: a declared entrypoint is a real
  // npm target that actually names this script. Reverse: an npm target naming an
  // analysis/ script must resolve to a declared, existing file. The reverse
  // direction is the one that catches a hollow target — a documented command whose
  // script is absent — which SKILL_REGISTRY's SCRIPT_TARGETS_VALID cannot see,
  // because it validates that the target name exists, not that it runs.
  const acknowledged = new Map(
    (registry.missing_entrypoints ?? []).map((m) => [m.target, m]),
  );
  for (const s of scripts) {
    for (const target of s.entrypoints ?? []) {
      if (!npmTargets.has(target)) {
        fail('ENTRYPOINT_RESOLVES', `${s.id} declares npm target "${target}" absent from package.json`);
        continue;
      }
      if (!npmTargets.get(target).includes(s.path)) {
        fail(
          'ENTRYPOINT_RESOLVES',
          `${s.id} claims npm target "${target}" but that target does not name ${s.path}`,
        );
      }
    }
  }
  for (const [target, paths] of npmTargets) {
    for (const p of paths) {
      if (pathExists(p) && byPath.has(p)) continue;
      const ack = acknowledged.get(target);
      if (!ack) {
        fail(
          'ENTRYPOINT_RESOLVES',
          `npm target "${target}" names ${p} which ${
            pathExists(p) ? 'is not registered' : 'does not exist'
          }`,
        );
        continue;
      }
      if (ack.declared_path !== p) {
        fail(
          'ENTRYPOINT_RESOLVES',
          `npm target "${target}" is acknowledged as missing ${ack.declared_path} but names ${p}`,
        );
        continue;
      }
      if (!ack.reopens_when) {
        fail(
          'ENTRYPOINT_RESOLVES',
          `acknowledged missing entrypoint "${target}" names no reopens_when — a defect with no ` +
            'tripwire is an excuse, not a record',
        );
        continue;
      }
      warn('ENTRYPOINT_RESOLVES', `${target} -> ${p} is absent; acknowledged: ${ack.status}`);
    }
  }
  for (const target of acknowledged.keys()) {
    if (!npmTargets.has(target)) {
      fail(
        'ENTRYPOINT_RESOLVES',
        `missing_entrypoints declares "${target}" which is no longer in package.json — remove the ` +
          'acknowledgement now that the target is gone',
      );
    }
  }

  // DOCBLOCK_MATCH — where a script carries a header docblock, it agrees with the
  // record. The docblock is the script-side analogue of skill frontmatter: the fact
  // on disk that the declaration can be contradicted by.
  for (const s of scripts) {
    if (!pathExists(s.path)) continue;
    const doc = docblockOf(s.path);
    for (const field of ['scope', 'durability']) {
      if (doc[field] === undefined) continue;
      if (doc[field] !== s[field]) {
        fail(
          'DOCBLOCK_MATCH',
          `${s.id} declares ${field}="${s[field]}" but its docblock says "${doc[field]}"`,
        );
      }
    }
    if (doc.owns_slices !== undefined) {
      const declared = [...(s.owns_slices ?? [])].sort().join(',');
      const inFile = [...doc.owns_slices].sort().join(',');
      if (declared !== inFile) {
        fail('DOCBLOCK_MATCH', `${s.id} declares owns_slices [${declared}] but docblock says [${inFile}]`);
      }
    }
    if (doc.entrypoint !== undefined && !(s.entrypoints ?? []).includes(doc.entrypoint)) {
      fail(
        'DOCBLOCK_MATCH',
        `${s.id} docblock names entrypoint "${doc.entrypoint}" which the record does not list`,
      );
    }
    if (doc.deprecated && LOAD_BEARING.has(s.durability)) {
      fail(
        'DOCBLOCK_MATCH',
        `${s.id} is declared durability="${s.durability}" but the file carries @deprecated`,
      );
    }
  }

  // SLICE_IDS_VALID — owns_slices are foreign keys into SLICE_REGISTRY.
  for (const s of scripts) {
    for (const id of s.owns_slices ?? []) {
      if (!sliceIds.has(id)) fail('SLICE_IDS_VALID', `${s.id} owns unknown slice "${id}"`);
    }
  }

  // REACHABLE_IS_PERMANENT — a script that something running depends on is
  // load-bearing by proof, whatever anyone believes about it. This is the gate that
  // stops a module being filed as one-shot and then deleted.
  for (const [p, kind] of reachable) {
    const rec = byPath.get(p);
    if (!rec) continue;
    if (!LOAD_BEARING.has(rec.durability)) {
      fail(
        'REACHABLE_IS_PERMANENT',
        `${rec.id} is durability="${rec.durability}" but is ${kind === 'import' ? 'imported' : 'invoked'}` +
          ' by a registered entry point — reachability is proof of the opposite',
      );
    }
  }

  // EVIDENCE_REQUIRED — §6 applied to the register: a durability claim cites how it
  // is known, an unproven one is not dressed up as proven, and the two citations that
  // are machine-checkable are checked rather than taken on trust.
  for (const s of scripts) {
    if (!EVIDENCE_TOKENS.has(s.evidence)) {
      fail('EVIDENCE_REQUIRED', `${s.id} cites unknown evidence "${s.evidence}"`);
      continue;
    }
    if (LOAD_BEARING.has(s.durability) && s.evidence === 'none') {
      fail('EVIDENCE_REQUIRED', `${s.id} claims durability="permanent" citing no evidence`);
    }
    if (s.durability === 'unclassified' && s.evidence !== 'none') {
      fail(
        'EVIDENCE_REQUIRED',
        `${s.id} is unclassified but cites evidence "${s.evidence}" — classify it or drop the citation`,
      );
    }
    if (s.evidence === 'npm-entrypoint' && !(s.entrypoints ?? []).length) {
      fail('EVIDENCE_REQUIRED', `${s.id} cites npm-entrypoint evidence but lists no entrypoints`);
    }
    if (REACHABILITY_EVIDENCE.has(s.evidence)) {
      const expected = s.evidence === 'imported-by-permanent' ? 'import' : 'invoke';
      const actual = reachable.get(s.path);
      if (actual !== expected) {
        fail(
          'EVIDENCE_REQUIRED',
          `${s.id} cites "${s.evidence}" but the dependency graph reports ` +
            `${actual ? `a ${actual} edge` : 'no path from any entry point'}`,
        );
      }
    }
  }
  const unclassified = scripts.filter((s) => s.durability === 'unclassified');
  if (unclassified.length) {
    warn(
      'EVIDENCE_REQUIRED',
      `${unclassified.length} of ${scripts.length} scripts are unclassified — durability unproven, ` +
        'not assumed dead',
    );
  }

  return { failures, warnings };
}

/**
 * Emit provable-only records for scripts on disk. Used to bootstrap the registry
 * and to register newly added scripts; it never invents durability.
 */
export function scaffoldRecords({
  discovered,
  npmTargets,
  reachable,
  docblockOf = () => ({}),
  existingById = new Set(),
}) {
  const targetsByPath = new Map();
  for (const [target, paths] of npmTargets) {
    for (const p of paths) {
      if (!targetsByPath.has(p)) targetsByPath.set(p, []);
      targetsByPath.get(p).push(target);
    }
  }

  const idFor = (p) => {
    const base = p
      .replace(/^analysis\//, '')
      .replace(/\/scripts\//, '/')
      .replace(SCRIPT_EXT, '')
      .replace(/[^A-Za-z0-9]+/g, '.')
      .toLowerCase();
    let id = base;
    let n = 2;
    while (existingById.has(id)) id = `${base}.${n++}`;
    existingById.add(id);
    return id;
  };

  return discovered.map((p) => {
    const entrypoints = targetsByPath.get(p) ?? [];
    const isTest = /\.test\.mjs$/.test(p);
    const inBackups = /\/backups\//.test(p);
    const isSql = p.endsWith('.sql');

    const doc = docblockOf(p);
    const via = reachable.get(p);

    let durability = 'unclassified';
    let evidence = 'none';
    let kind = isSql ? 'query' : 'analysis';

    if (inBackups) {
      durability = 'superseded';
      evidence = 'backup-directory';
      kind = 'backup';
    } else if (isTest) {
      durability = 'permanent';
      evidence = 'test-suite';
      kind = 'test';
    } else if (entrypoints.length) {
      durability = 'permanent';
      evidence = 'npm-entrypoint';
      kind = 'entrypoint';
    } else if (via) {
      durability = 'permanent';
      evidence = via === 'import' ? 'imported-by-permanent' : 'invoked-by-permanent';
      kind = via === 'import' ? 'module' : 'entrypoint';
    } else if (doc.deprecated || doc.durability === 'deprecated') {
      durability = 'deprecated';
      evidence = 'docblock-deprecated';
      kind = 'wrapper';
    }

    return {
      id: idFor(p),
      path: p,
      lane: laneOf(p),
      scope: scopeOf(p),
      kind,
      durability,
      evidence,
      entrypoints,
      owns_slices: [],
      notes: null,
    };
  });
}

export function buildAudit({ registry, discovered, reachable, failures, warnings, npmTargets }) {
  const scripts = registry.scripts ?? [];
  const tally = (items, key) =>
    items.reduce((acc, s) => ({ ...acc, [s[key]]: (acc[s[key]] ?? 0) + 1 }), {});

  return {
    generated_by: 'analysis/debtors/shared/scripts/render_script_registry.mjs',
    generated_at: new Date().toISOString(),
    registry_version: registry.version,
    registry_status: registry.status ?? 'ratified',
    totals: {
      declared: scripts.length,
      discovered_on_disk: discovered.length,
      reachable_by_import: [...reachable.values()].filter((k) => k === 'import').length,
      reachable_by_invoke: [...reachable.values()].filter((k) => k === 'invoke').length,
      npm_targets_into_analysis: npmTargets.size,
      permanent: scripts.filter((s) => s.durability === 'permanent').length,
      unclassified: scripts.filter((s) => s.durability === 'unclassified').length,
    },
    by_lane: tally(scripts, 'lane'),
    by_scope: tally(scripts, 'scope'),
    by_kind: tally(scripts, 'kind'),
    by_durability: tally(scripts, 'durability'),
    by_evidence: tally(scripts, 'evidence'),
    gates: Object.fromEntries(
      GATES.map((g) => [
        g,
        {
          failures: failures.filter((f) => f.gate === g).length,
          warnings: warnings.filter((w) => w.gate === g).length,
        },
      ]),
    ),
    missing_entrypoints: registry.missing_entrypoints ?? [],
    unclassified_paths: scripts.filter((s) => s.durability === 'unclassified').map((s) => s.path),
    failures,
    warnings,
  };
}

export function renderMarkdown({ registry, audit, failures, warnings }) {
  const scripts = registry.scripts ?? [];
  const esc = (v) => String(v ?? '—').replace(/\|/g, '\\|');
  const lines = [];

  lines.push(`# Script Registry (v${registry.version})`);
  lines.push('');
  lines.push(`> **Status:** \`${registry.status ?? 'ratified'}\`  `);
  lines.push('> **Canonical machine-readable registry:** `analysis/debtors/shared/SCRIPT_REGISTRY.json`  ');
  lines.push('> **Audit:** `analysis/debtors/shared/docs/SCRIPT_REGISTRY_AUDIT.json`  ');
  lines.push(`> **Plan:** \`${registry.plan}\`  `);
  lines.push(`> **Authority:** \`${registry.authority}\`  `);
  lines.push('> **Generated — do not edit.** Regenerate: `npm run debtors:script-registry:write`');
  lines.push('');
  lines.push(
    `${audit.totals.declared} governed scripts. ${audit.totals.permanent} are proven load-bearing ` +
      `(registered entry point, test suite, or imported by one). ${audit.totals.unclassified} are ` +
      '`unclassified`: durability is unproven, which is not the same as dead. Each needs a read to ' +
      'classify, and that backlog is the point of counting it.',
  );
  lines.push('');
  lines.push('**Durability** is never inferred from a filename. **Scope** and **lane** are read from the path and so are always known.');
  lines.push('');
  lines.push('---');
  lines.push('');

  const broken = registry.missing_entrypoints ?? [];
  if (broken.length) {
    lines.push('## Hollow entry points');
    lines.push('');
    lines.push(
      'Documented `npm run` commands whose script is **absent from the repo**. These fail only when ' +
        'someone tries to run them, so they survive indefinitely in docs that claim them as done.',
    );
    lines.push('');
    lines.push('| Target | Missing script | Status | Reopens when |');
    lines.push('| :--- | :--- | :--- | :--- |');
    for (const m of broken) {
      lines.push(
        `| \`${m.target}\` | \`${m.declared_path}\` | ${esc(m.status)} | ${esc(m.reopens_when)} |`,
      );
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Durability');
  lines.push('');
  lines.push('| Durability | Count | Meaning |');
  lines.push('| :--- | ---: | :--- |');
  for (const [k, desc] of Object.entries(registry.durabilities ?? {})) {
    lines.push(`| \`${k}\` | ${audit.by_durability[k] ?? 0} | ${esc(desc)} |`);
  }
  lines.push('');
  lines.push('| Evidence | Count | Meaning |');
  lines.push('| :--- | ---: | :--- |');
  for (const [k, desc] of Object.entries(registry.evidence_kinds ?? {})) {
    lines.push(`| \`${k}\` | ${audit.by_evidence[k] ?? 0} | ${esc(desc)} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Registered entry points');
  lines.push('');
  lines.push('| `npm run` | Script | Lane | Owns slices |');
  lines.push('| :--- | :--- | :--- | :--- |');
  for (const s of scripts.filter((x) => (x.entrypoints ?? []).length).sort((a, b) => a.path.localeCompare(b.path))) {
    const slices = (s.owns_slices ?? []).map((x) => `\`${x}\``).join(' ') || '—';
    lines.push(
      `| ${s.entrypoints.map((t) => `\`${t}\``).join(' ')} | \`${s.path}\` | ${s.lane} | ${slices} |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Shared modules (imported, not run)');
  lines.push('');
  lines.push('Proven load-bearing by import reachability. Deleting one of these breaks a registered entry point.');
  lines.push('');
  lines.push('| Script | Lane |');
  lines.push('| :--- | :--- |');
  for (const s of scripts.filter((x) => x.kind === 'module').sort((a, b) => a.path.localeCompare(b.path))) {
    lines.push(`| \`${s.path}\` | ${s.lane} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  const retired = scripts.filter((s) => s.durability === 'deprecated' || s.durability === 'superseded');
  if (retired.length) {
    lines.push('## Deprecated and superseded');
    lines.push('');
    lines.push('Retained, not deleted — amendments append. Each names what replaced it.');
    lines.push('');
    lines.push('| Script | Durability | Why |');
    lines.push('| :--- | :--- | :--- |');
    for (const s of retired.sort((a, b) => a.path.localeCompare(b.path))) {
      lines.push(`| \`${s.path}\` | **${s.durability}** | ${esc(s.notes)} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Unclassified — triage backlog');
  lines.push('');
  lines.push(
    'No registered entry point, not a test, not imported by anything that runs. That makes them ' +
      '**unproven, not proven dead** — several are account forensics kept deliberately. Classifying ' +
      'one means reading it and recording `one-shot`, `permanent`, or `superseded` with evidence.',
  );
  lines.push('');
  const unclassifiedByScope = new Map();
  for (const s of scripts.filter((x) => x.durability === 'unclassified')) {
    if (!unclassifiedByScope.has(s.scope)) unclassifiedByScope.set(s.scope, []);
    unclassifiedByScope.get(s.scope).push(s.path);
  }
  lines.push('| Scope | Count | Scripts |');
  lines.push('| :--- | ---: | :--- |');
  for (const [scope, paths] of [...unclassifiedByScope].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(
      `| \`${scope}\` | ${paths.length} | ${paths.map((p) => `\`${path.basename(p)}\``).join(' ')} |`,
    );
  }
  lines.push('');
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

  return `${lines.join('\n')}\n`;
}

const REGISTRY_REL = 'analysis/debtors/shared/SCRIPT_REGISTRY.json';

export function loadWorld(ROOT) {
  const sliceRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json'), 'utf8'),
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const sliceIdList = Array.isArray(sliceRegistry.slices)
    ? sliceRegistry.slices.map((s) => s.id)
    : Object.keys(sliceRegistry.slices);

  const discovered = discoverScripts(ROOT);
  const npmTargets = npmTargetPaths(pkg.scripts, discovered);
  const edges = buildDependencyGraph({
    files: discovered,
    readFile: (p) => fs.readFileSync(path.join(ROOT, p), 'utf8'),
  });

  const roots = new Set(discovered.filter((p) => /\.test\.mjs$/.test(p)));
  for (const paths of npmTargets.values()) for (const p of paths) if (discovered.includes(p)) roots.add(p);
  const reachable = reachableFrom(edges, roots);

  return {
    sliceIds: new Set(sliceIdList.flatMap((id) => [id, id.replace(/\.month$/, '.{YYYY-MM}')])),
    npmTargets,
    discovered,
    reachable,
    pathExists: (p) => fs.existsSync(path.join(ROOT, p)),
    docblockOf: (p) => parseDocblock(fs.readFileSync(path.join(ROOT, p), 'utf8')),
  };
}

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const ROOT = path.resolve(__dirname, '../../../..');
  const WRITE = process.argv.includes('--write');
  const SCAFFOLD = process.argv.includes('--scaffold');

  const world = loadWorld(ROOT);

  if (SCAFFOLD) {
    const records = scaffoldRecords({
      discovered: world.discovered,
      npmTargets: world.npmTargets,
      reachable: world.reachable,
      docblockOf: world.docblockOf,
    });
    process.stdout.write(`${JSON.stringify(records, null, 2)}\n`);
    return;
  }

  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8'));
  const { failures, warnings } = checkGates({ registry, ...world });
  const audit = buildAudit({ registry, ...world, failures, warnings });

  if (WRITE) {
    const mdOut = path.join(ROOT, 'analysis/debtors/shared/docs/SCRIPT_REGISTRY.md');
    const auditOut = path.join(ROOT, 'analysis/debtors/shared/docs/SCRIPT_REGISTRY_AUDIT.json');
    fs.writeFileSync(mdOut, renderMarkdown({ registry, audit, failures, warnings }));
    fs.writeFileSync(auditOut, `${JSON.stringify(audit, null, 2)}\n`);
    console.log('Wrote analysis/debtors/shared/docs/SCRIPT_REGISTRY.md');
    console.log('Wrote analysis/debtors/shared/docs/SCRIPT_REGISTRY_AUDIT.json');
  }

  console.log(`\nScript registry v${registry.version} — ${audit.registry_status}`);
  console.log(
    `  ${audit.totals.declared} declared · ${audit.totals.discovered_on_disk} on disk · ` +
      `${audit.totals.permanent} permanent · ${audit.totals.unclassified} unclassified · ` +
      `${audit.totals.reachable_by_import} import-reachable`,
  );
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
