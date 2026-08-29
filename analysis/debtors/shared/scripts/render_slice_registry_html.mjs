#!/usr/bin/env node
/**
 * Render SLICE_REGISTRY.json → interactive HTML visualization.
 * Usage: node analysis/debtors/shared/scripts/render_slice_registry_html.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const registryPath = path.join(ROOT, 'analysis/debtors/shared/SLICE_REGISTRY.json');
const outPath = path.join(ROOT, 'analysis/debtors/shared/docs/SLICE_REGISTRY.html');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Debtors Slice Registry v${registry.version}</title>
  <style>
    :root {
      --bg: #0f1117;
      --panel: #171a22;
      --border: #2a3140;
      --text: #e8eaef;
      --muted: #9aa3b5;
      --accent: #4c8bf5;
      --derived: #3ecf8e;
      --presentation: #f5a623;
      --governance: #b48cff;
      --evidence: #6b7280;
      --danger: #ef6b6b;
      --lane: #5bc0de;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "SF Pro Text", "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }
    header {
      padding: 20px 24px 12px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }
    header h1 { margin: 0 0 6px; font-size: 1.35rem; font-weight: 600; }
    header p { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .layout {
      display: grid;
      grid-template-columns: 280px 1fr 320px;
      min-height: calc(100vh - 88px);
    }
    aside, .detail {
      border-right: 1px solid var(--border);
      background: var(--panel);
      padding: 16px;
      overflow: auto;
    }
    .detail { border-right: none; border-left: 1px solid var(--border); }
    main { padding: 16px; overflow: auto; }
    h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0 0 10px; }
    label { display: block; font-size: 0.8rem; color: var(--muted); margin-bottom: 4px; }
    input, select {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 12px;
      font-size: 0.85rem;
    }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .stat {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
    }
    .stat strong { display: block; font-size: 1.2rem; }
    .stat span { font-size: 0.75rem; color: var(--muted); }
    .legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .pill {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--bg);
    }
    .pill.t-derived { border-color: var(--derived); color: var(--derived); }
    .pill.t-presentation { border-color: var(--presentation); color: var(--presentation); }
    .pill.t-governance { border-color: var(--governance); color: var(--governance); }
    .pill.t-evidence { border-color: var(--evidence); color: var(--evidence); }
    .slice-list { list-style: none; padding: 0; margin: 0; }
    .slice-list li {
      padding: 8px 10px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.82rem;
      margin-bottom: 4px;
    }
    .slice-list li:hover { background: var(--bg); border-color: var(--border); }
    .slice-list li.active { background: #1e2430; border-color: var(--accent); }
    .slice-list .sub { color: var(--muted); font-size: 0.72rem; }
    #graph-wrap {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: auto;
      min-height: 520px;
    }
    svg { display: block; min-width: 100%; }
    .node rect {
      fill: var(--bg);
      stroke-width: 1.5;
      rx: 6;
      cursor: pointer;
    }
    .node text { fill: var(--text); font-size: 11px; pointer-events: none; }
    .node.selected rect { stroke-width: 2.5; filter: brightness(1.15); }
    .edge-dep { stroke: #556075; stroke-width: 1.2; fill: none; marker-end: url(#arrow-dep); }
    .edge-inv { stroke: var(--danger); stroke-width: 1; fill: none; stroke-dasharray: 4 3; opacity: 0.55; marker-end: url(#arrow-inv); }
    .edge-highlight { stroke-width: 2.2; opacity: 1; }
    .detail h3 { margin: 0 0 8px; font-size: 1rem; word-break: break-word; }
    .detail .role { color: var(--muted); font-size: 0.88rem; margin-bottom: 14px; }
    .detail section { margin-bottom: 16px; }
    .detail ul { margin: 0; padding-left: 18px; font-size: 0.82rem; }
    .detail li { margin-bottom: 4px; }
    .detail li button {
      background: none; border: none; color: var(--accent); cursor: pointer;
      padding: 0; font: inherit; text-align: left;
    }
    .detail li button:hover { text-decoration: underline; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .empty { color: var(--muted); font-size: 0.85rem; font-style: italic; }
    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      aside, .detail { border: none; border-bottom: 1px solid var(--border); max-height: 280px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Debtors Slice Registry</h1>
    <p>v${registry.version} · ratified ${registry.ratified} · ${registry.slices.length} slices · click a node to trace depends_on / invalidates</p>
  </header>
  <div class="layout">
    <aside>
      <h2>Filters</h2>
      <label for="search">Search</label>
      <input id="search" type="search" placeholder="slice id or role…" />
      <label for="tier">Tier</label>
      <select id="tier"><option value="">All tiers</option></select>
      <label for="scope">Scope</label>
      <select id="scope"><option value="">All scopes</option></select>
      <label for="lane">Lane</label>
      <select id="lane"><option value="">All lanes</option></select>
      <div class="stats">
        <div class="stat"><strong id="stat-visible">0</strong><span>visible</span></div>
        <div class="stat"><strong id="stat-edges">0</strong><span>dependency edges</span></div>
      </div>
      <h2>Slices</h2>
      <ul class="slice-list" id="slice-list"></ul>
    </aside>
    <main>
      <div class="legend">
        <span class="pill t-derived">derived</span>
        <span class="pill t-presentation">presentation</span>
        <span class="pill t-governance">governance</span>
        <span class="pill t-evidence">evidence</span>
        <span class="pill">solid → depends_on</span>
        <span class="pill" style="border-color:var(--danger);color:var(--danger)">dashed → invalidates</span>
      </div>
      <div id="graph-wrap"><svg id="graph" xmlns="http://www.w3.org/2000/svg"></svg></div>
    </main>
    <div class="detail" id="detail">
      <p class="empty">Select a slice to inspect dependencies and outputs.</p>
    </div>
  </div>
  <script>
    const REGISTRY = ${JSON.stringify(registry)};

    const tierColors = {
      derived: '#3ecf8e',
      presentation: '#f5a623',
      governance: '#b48cff',
      evidence: '#6b7280',
    };

    const nodes = [];
    const nodeById = new Map();

    for (const id of REGISTRY.evidence_ids) {
      const n = { id, tier: 'evidence', scope: 'evidence', role: 'Immutable input', optional: false, depends_on: [], invalidates: [], outputs: [] };
      nodes.push(n);
      nodeById.set(id, n);
    }
    for (const s of REGISTRY.slices) {
      nodes.push(s);
      nodeById.set(s.id, s);
    }

    let selectedId = null;
    let filteredIds = new Set(nodes.map(n => n.id));

    const tierEl = document.getElementById('tier');
    const scopeEl = document.getElementById('scope');
    const laneEl = document.getElementById('lane');
    [...new Set(nodes.map(n => n.tier))].sort().forEach(v => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; tierEl.appendChild(o);
    });
    [...new Set(nodes.map(n => n.scope))].sort().forEach(v => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; scopeEl.appendChild(o);
    });
    [...new Set(REGISTRY.slices.map(s => s.lane).filter(Boolean))].sort().forEach(v => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; laneEl.appendChild(o);
    });

    function domainOf(id) {
      if (id.startsWith('evidence.') || id.startsWith('ratification.') || id.startsWith('ratified.') || id.startsWith('account.')) return 'evidence';
      if (id.startsWith('v4.')) return 'v4';
      if (id.startsWith('v5.') || id.startsWith('fixture.v5') || id.startsWith('statement.v5')) return 'v5';
      if (id.startsWith('customer.') || id === 'tag.coverage' || id === 'balance.bridge') return 'customer';
      if (id.startsWith('allocation.') || id === 'settlement.discount' || id === 'payment.pattern' || id === 'event.ledger') return 'allocation';
      if (id.startsWith('portfolio.') || id.startsWith('turn.') || id.startsWith('d17.') || id === 'erp.freshness' || id === 'onboarding.status') return 'portfolio';
      if (id.startsWith('creditor.')) return 'creditor';
      if (id.startsWith('fixture.v4') || id.startsWith('statement.v4') || id === 'txt.parse' || id === 'ingest.coverage') return 'core';
      return 'other';
    }

    function applyFilters() {
      const q = document.getElementById('search').value.trim().toLowerCase();
      const tier = tierEl.value;
      const scope = scopeEl.value;
      const lane = laneEl.value;
      filteredIds = new Set();
      for (const n of nodes) {
        if (tier && n.tier !== tier) continue;
        if (scope && n.scope !== scope) continue;
        if (lane && n.lane !== lane) continue;
        if (q && !n.id.toLowerCase().includes(q) && !(n.role || '').toLowerCase().includes(q)) continue;
        filteredIds.add(n.id);
      }
      renderList();
      renderGraph();
    }

    function renderList() {
      const ul = document.getElementById('slice-list');
      ul.innerHTML = '';
      const items = nodes.filter(n => filteredIds.has(n.id)).sort((a, b) => a.id.localeCompare(b.id));
      document.getElementById('stat-visible').textContent = items.length;
      for (const n of items) {
        const li = document.createElement('li');
        if (n.id === selectedId) li.className = 'active';
        li.innerHTML = '<div>' + n.id + '</div><div class="sub">' + (n.tier || '') + (n.lane ? ' · ' + n.lane : '') + '</div>';
        li.onclick = () => selectNode(n.id);
        ul.appendChild(li);
      }
    }

    function layoutNodes(ids) {
      const idSet = new Set(ids);
      const depth = new Map();
      function getDepth(id, seen = new Set()) {
        if (depth.has(id)) return depth.get(id);
        if (seen.has(id)) return 0;
        seen.add(id);
        const n = nodeById.get(id);
        if (!n || !n.depends_on || !n.depends_on.length) { depth.set(id, 0); return 0; }
        const deps = n.depends_on.filter(d => idSet.has(d));
        const d = deps.length ? Math.max(...deps.map(getDepth)) + 1 : 0;
        depth.set(id, d);
        return d;
      }
      ids.forEach(getDepth);
      const columns = new Map();
      for (const id of ids) {
        const d = depth.get(id) || 0;
        if (!columns.has(d)) columns.set(d, []);
        columns.get(d).push(id);
      }
      const positions = new Map();
      const colWidth = 220;
      const rowHeight = 52;
      const padX = 40;
      const padY = 36;
      let maxCol = 0;
      for (const [col, colIds] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
        maxCol = Math.max(maxCol, col);
        colIds.sort();
        colIds.forEach((id, i) => {
          positions.set(id, { x: padX + col * colWidth, y: padY + i * rowHeight, w: 190, h: 38 });
        });
      }
      const maxRows = Math.max(...[...columns.values()].map(c => c.length), 1);
      return { positions, width: padX * 2 + (maxCol + 1) * colWidth, height: padY * 2 + maxRows * rowHeight };
    }

    function renderGraph() {
      const ids = [...filteredIds];
      const { positions, width, height } = layoutNodes(ids);
      const svg = document.getElementById('graph');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.innerHTML = '';

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = '<marker id="arrow-dep" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#556075"/></marker>' +
        '<marker id="arrow-inv" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#ef6b6b"/></marker>';
      svg.appendChild(defs);

      const highlight = new Set();
      if (selectedId && filteredIds.has(selectedId)) {
        highlight.add(selectedId);
        const n = nodeById.get(selectedId);
        (n.depends_on || []).forEach(d => filteredIds.has(d) && highlight.add(d));
        (n.invalidates || []).forEach(d => filteredIds.has(d) && highlight.add(d));
        nodes.forEach(x => {
          if ((x.depends_on || []).includes(selectedId) && filteredIds.has(x.id)) highlight.add(x.id);
          if ((x.invalidates || []).includes(selectedId) && filteredIds.has(x.id)) highlight.add(x.id);
        });
      }

      let edgeCount = 0;
      const edgesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (const n of nodes) {
        if (!filteredIds.has(n.id)) continue;
        const from = positions.get(n.id);
        if (!from) continue;
        for (const dep of n.depends_on || []) {
          if (!filteredIds.has(dep)) continue;
          const to = positions.get(dep);
          if (!to) continue;
          edgeCount++;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const x1 = to.x + to.w / 2, y1 = to.y + to.h;
          const x2 = from.x + from.w / 2, y2 = from.y;
          line.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 + y2) / 2 + ' ' + x2 + ',' + (y1 + y2) / 2 + ' ' + x2 + ',' + y2);
          line.setAttribute('class', 'edge-dep' + (highlight.has(n.id) && highlight.has(dep) ? ' edge-highlight' : ''));
          edgesG.appendChild(line);
        }
        for (const inv of n.invalidates || []) {
          if (!filteredIds.has(inv)) continue;
          const to = positions.get(inv);
          if (!to) continue;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const x1 = from.x + from.w, y1 = from.y + from.h / 2;
          const x2 = to.x, y2 = to.y + to.h / 2;
          line.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + 40) + ',' + y1 + ' ' + (x2 - 40) + ',' + y2 + ' ' + x2 + ',' + y2);
          line.setAttribute('class', 'edge-inv' + (highlight.has(n.id) && highlight.has(inv) ? ' edge-highlight' : ''));
          edgesG.appendChild(line);
        }
      }
      svg.appendChild(edgesG);
      document.getElementById('stat-edges').textContent = edgeCount;

      const nodesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      for (const id of ids) {
        const n = nodeById.get(id);
        const p = positions.get(id);
        if (!p) continue;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node' + (id === selectedId ? ' selected' : '') + (highlight.size && !highlight.has(id) ? '' : ''));
        g.style.opacity = highlight.size && !highlight.has(id) ? '0.35' : '1';
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', p.x);
        rect.setAttribute('y', p.y);
        rect.setAttribute('width', p.w);
        rect.setAttribute('height', p.h);
        rect.setAttribute('stroke', tierColors[n.tier] || '#888');
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', p.x + 8);
        text.setAttribute('y', p.y + 16);
        const label = n.id.length > 26 ? n.id.slice(0, 24) + '…' : n.id;
        text.textContent = label;
        g.appendChild(rect);
        g.appendChild(text);
        g.addEventListener('click', () => selectNode(id));
        nodesG.appendChild(g);
      }
      svg.appendChild(nodesG);
    }

    function selectNode(id) {
      selectedId = id;
      renderList();
      renderGraph();
      renderDetail(id);
    }

    function renderDetail(id) {
      const n = nodeById.get(id);
      const el = document.getElementById('detail');
      if (!n) { el.innerHTML = '<p class="empty">Not found.</p>'; return; }
      const depList = (n.depends_on || []).map(d =>
        '<li><button type="button" data-jump="' + d + '">' + d + '</button></li>').join('') || '<li class="empty">None</li>';
      const invList = (n.invalidates || []).map(d =>
        '<li><button type="button" data-jump="' + d + '">' + d + '</button></li>').join('') || '<li class="empty">None</li>';
      const outList = (n.outputs || []).map(o => '<li><code>' + o + '</code></li>').join('') || '<li class="empty">—</li>';
      el.innerHTML =
        '<h3>' + n.id + '</h3>' +
        '<div class="tag-row">' +
          '<span class="pill t-' + n.tier + '">' + n.tier + '</span>' +
          '<span class="pill">' + n.scope + '</span>' +
          (n.lane ? '<span class="pill">' + n.lane + '</span>' : '') +
          (n.optional ? '<span class="pill">optional</span>' : '') +
          '<span class="pill">' + domainOf(n.id) + '</span>' +
        '</div>' +
        '<p class="role">' + (n.role || '') + '</p>' +
        '<section><h2>Depends on</h2><ul>' + depList + '</ul></section>' +
        '<section><h2>Invalidates</h2><ul>' + invList + '</ul></section>' +
        '<section><h2>Outputs</h2><ul>' + outList + '</ul></section>';
      el.querySelectorAll('[data-jump]').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-jump');
          if (!filteredIds.has(target)) {
            document.getElementById('search').value = target.split('.').pop();
            applyFilters();
          }
          selectNode(target);
        });
      });
    }

    ['search', 'tier', 'scope', 'lane'].forEach(id => {
      document.getElementById(id).addEventListener('input', applyFilters);
      document.getElementById(id).addEventListener('change', applyFilters);
    });

    applyFilters();
    selectNode('allocation.edges');
  </script>
</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf8');
console.log(`Written ${outPath}`);
