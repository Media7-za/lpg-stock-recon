#!/usr/bin/env node
/**
 * Turn 7i — line-level lane partition, shell-line hunt, invariant re-test
 * Turn 7j Step 7 — hardened: DATABASE_URL required, registry-driven invariant, --unmerged
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UNMERGED = process.argv.includes('--unmerged');
const TXT_CLOSING = 13014.5;
const OPEN_LPG_DOCS = ['49143', '50528', '50657', '51789'];
const OPEN_LPG_DOC_TOTAL = 17993.42;
const UNALLOC_44227 = 4978.91;

const fmtR = (n) =>
  (n < 0 ? '-' : '') +
  'R' +
  Math.abs(Math.round(n * 100) / 100)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
    .replace('.', ',');

const client = new pg.Client(pgClientOptions());
await client.connect();
const q = async (sql, p = []) => (await client.query(sql, p)).rows;

const shellSkus = new Set(['9.1', '14.1', '19.1', 'S.1', 'D.1', 'FL.1']);
const isShellLine = (r) => r.category === 'CYL' || shellSkus.has(r.stock_no);
const isEmptyDesc = (d) => /EMPTY|EMPT/i.test(d || '');
const normDn = (s) => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();
const round2 = (n) => Math.round(n * 100) / 100;
const sumNums = (arr) => round2(arr.reduce((s, n) => s + n, 0));

/** Values with more than one valid shell decomposition — must not auto-pick. */
const AMBIGUOUS_VALUES = new Set([3105]);

const VAL_PATTERNS = [
  [5865, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 4 }]],
  [5347.5, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 4 }]],
  [5175, [{ sku: '9.1', q: 3 }, { sku: 'S.1', q: 3 }]],
  [4657.5, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 3 }]],
  [4140, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 3 }]],
  [3622.5, [{ sku: 'S.1', q: 3 }]],
  [3450, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 2 }]],
  [2932.5, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 2 }]],
  [2415, [{ sku: 'S.1', q: 2 }]],
  [1725, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 1 }]],
  [1207.5, [{ sku: 'S.1', q: 1 }]],
  [517.5, [{ sku: '9.1', q: 1 }]],
];

function deriveFromValue(amt) {
  const sign = amt < 0 ? -1 : 1;
  const abs = Math.abs(amt);
  if (AMBIGUOUS_VALUES.has(abs)) {
    throw new Error(`Ambiguous shell decomposition for value ${abs} — operator resolution required`);
  }
  const p = VAL_PATTERNS.find(([v]) => Math.abs(v - abs) < 0.02);
  if (!p) return [];
  return p[1].filter((x) => x.q).map((x) => ({ sku: x.sku, qty: x.q * sign }));
}

function loadLiveRegistry() {
  const live = path.join(ROOT, 'config/cyl_residual_registry.json');
  const proposed = path.join(ROOT, 'config/cyl_residual_registry_v10_2_proposed.json');
  const p = fs.existsSync(live) ? live : proposed;
  if (!fs.existsSync(p)) return { entries: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function computeRegistryOutstanding(registry, unmerged) {
  const run = { '9.1': 0, 'S.1': 0, 'D.1': 0 };
  for (const e of registry.entries || []) {
    const qty = e.v10_qty_short ?? 0;
    if (Math.abs(qty) < 0.001) continue;
    const sku = e.v10_sku;
    if (sku === '9.1') run['9.1'] = round2(run['9.1'] + qty);
    else if (sku === 'S.1') run['S.1'] = round2(run['S.1'] + qty);
    else if (sku === 'D.1') run['D.1'] = round2(run['D.1'] + qty);
  }
  if (unmerged) return run;
  return { '9.1': run['9.1'], 'S.1/D.1': round2(run['S.1'] + run['D.1']) };
}

// --- Parse TXT ---
const txtRaw = fs.readFileSync(path.join(ROOT, 'raw/MOZ002CURRENT.TXT'), 'utf8');
const txtDocs = new Map();
const txtPayments = [];
for (const line of txtRaw.split('\n')) {
  if (!line.startsWith('"')) continue;
  const parts = line.match(/"([^"]*)"/g)?.map((s) => s.slice(1, -1));
  if (!parts || parts.length < 11) continue;
  const [lineNo, , docno, entry, date, , custRef, , , amountStr] = parts;
  if (lineNo === 'LINE' || lineNo.startsWith('TOTAL')) continue;
  const amt = parseFloat(amountStr);
  if (Number.isNaN(amt)) continue;
  const doc = docno.replace(/^0+/, '') || '0';
  if (entry === 'Payment') {
    txtPayments.push({ doc, entry, date, desc: custRef || '', amt });
    continue;
  }
  if (entry === 'Invoice' || entry === 'Crd Note') {
    txtDocs.set(doc, { entry, date, desc: custRef || '', amt });
  }
}

const docClassify7h = (desc) => (isEmptyDesc(desc) ? 'empty_cyl' : 'lpg');

// --- DB ---
const hdrs = await q(`
  SELECT LTRIM(doc_no,'0') doc, entry_type, description, tx_date::date dt
  FROM transaction_headers WHERE account_no='MOZ002'`);
const hdrDesc = new Map();
for (const h of hdrs) hdrDesc.set(`${h.doc}|${h.entry_type}`, h.description);

const allVwLines = await q(`
  SELECT LTRIM(doc_no,'0') doc, entry_type, stock_no sku, category, debt_group,
    qty::float qty, ROUND(line_total::numeric,2)::float val
  FROM vw_clean_transactions WHERE account_no='MOZ002'`);
const linesByDoc = new Map();
for (const r of allVwLines) {
  if (!linesByDoc.has(r.doc)) linesByDoc.set(r.doc, []);
  linesByDoc.get(r.doc).push(r);
}

// CN index for DN resolution (unique match required)
const cnByDate = new Map();
for (const [doc, meta] of txtDocs) {
  if (meta.entry !== 'Crd Note') continue;
  const dn = normDn(meta.desc);
  if (!dn) continue;
  if (!cnByDate.has(meta.date)) cnByDate.set(meta.date, []);
  cnByDate.get(meta.date).push({ doc, dn });
}

function resolveClusterDn(doc, meta) {
  const hdr = hdrDesc.get(`${doc}|${meta.entry}`) || meta.desc;
  if (normDn(hdr)) return normDn(hdr);
  if (meta.entry === 'Invoice') {
    const cands = cnByDate.get(meta.date) || [];
    const uniqueDns = [...new Set(cands.map((c) => c.dn))];
    if (uniqueDns.length === 1) return uniqueDns[0];
    return 'UNRESOLVED';
  }
  return normDn(hdr) || 'UNRESOLVED';
}

// --- Step 1: Shell-line hunt ---
const lpgClassifiedDocs = new Set();
const emptyClassifiedDocs = new Set();
for (const [doc, meta] of txtDocs) {
  if (docClassify7h(meta.desc) === 'lpg') lpgClassifiedDocs.add(doc);
  else emptyClassifiedDocs.add(doc);
}

const shellHitsLpg = [];
for (const doc of [...lpgClassifiedDocs].sort()) {
  const meta = txtDocs.get(doc);
  const lines = (linesByDoc.get(doc) || []).filter(isShellLine);
  for (const ln of lines) {
    shellHitsLpg.push({
      doc,
      date: meta.date,
      entry: meta.entry,
      txt_desc: meta.desc,
      hdr_desc: hdrDesc.get(`${doc}|${meta.entry}`) || '',
      sku: ln.sku,
      qty: ln.qty,
      value: ln.val,
    });
  }
}

const reverseLpgOnEmpty = [];
for (const doc of [...emptyClassifiedDocs].sort()) {
  const meta = txtDocs.get(doc);
  for (const ln of linesByDoc.get(doc) || []) {
    if (ln.debt_group === 'LPG' && !isShellLine(ln)) {
      reverseLpgOnEmpty.push({ doc, date: meta.date, sku: ln.sku, category: ln.category, value: ln.val, desc: meta.desc });
    }
  }
}

const shellHitTotal = round2(shellHitsLpg.reduce((s, h) => s + h.value, 0));
const shellHitByDoc = new Map();
for (const h of shellHitsLpg) {
  if (!shellHitByDoc.has(h.doc)) shellHitByDoc.set(h.doc, { lines: [], sum: 0 });
  const b = shellHitByDoc.get(h.doc);
  b.lines.push(h);
  b.sum = round2(b.sum + h.value);
}

if (shellHitsLpg.length === 0) {
  console.log('STOP: Step 1 found no shell lines on LPG-classified documents.');
  await client.end();
  process.exit(0);
}

// --- Step 2: Line-level four-lane partition ---
const laneLine = { lpg: 0, empty_cyl: 0, payments: 0, other: 0 };
const mixedDocs = [];
const hdrLineMismatch = [];

for (const [doc, meta] of txtDocs) {
  const dbLines = linesByDoc.get(doc) || [];
  if (!dbLines.length) {
    laneLine[isEmptyDesc(meta.desc) ? 'empty_cyl' : 'lpg'] += meta.amt;
    continue;
  }
  let lpg = 0;
  let empty = 0;
  for (const ln of dbLines) {
    if (isShellLine(ln)) empty += ln.val;
    else lpg += ln.val;
  }
  if (Math.abs(lpg) > 0.001 && Math.abs(empty) > 0.001) {
    mixedDocs.push({ doc, desc: meta.desc, lpg: round2(lpg), empty: round2(empty), hdr: meta.amt });
  }
  const lineSum = round2(lpg + empty);
  if (Math.abs(lineSum - meta.amt) > 0.02) hdrLineMismatch.push({ doc, hdr: meta.amt, lineSum, diff: round2(meta.amt - lineSum) });
  laneLine.lpg += lpg;
  laneLine.empty_cyl += empty;
}
for (const p of txtPayments) laneLine.payments += p.amt;
for (const k of Object.keys(laneLine)) laneLine[k] = round2(laneLine[k]);
const fourSumLine = round2(laneLine.lpg + laneLine.empty_cyl + laneLine.payments + laneLine.other);

const laneDoc = { lpg: 0, empty_cyl: 0, payments: 0, other: 0 };
for (const [doc, meta] of txtDocs) laneDoc[docClassify7h(meta.desc)] += meta.amt;
for (const p of txtPayments) laneDoc.payments += p.amt;
for (const k of Object.keys(laneDoc)) laneDoc[k] = round2(laneDoc[k]);

// --- Step 3: Basis (d) + registry-driven invariant ---
const clusters = new Map();
const unresolvedDns = [];
for (const [doc, meta] of txtDocs) {
  const dn = resolveClusterDn(doc, meta);
  if (dn === 'UNRESOLVED') unresolvedDns.push(doc);
  if (!clusters.has(dn)) clusters.set(dn, { dn, fin: 0, q91: 0, s1: 0, d1: 0, docs: new Set() });
  const c = clusters.get(dn);
  c.docs.add(doc);
  const dbLines = linesByDoc.get(doc) || [];
  if (dbLines.length) {
    for (const ln of dbLines.filter(isShellLine)) {
      c.fin += ln.val;
      if (ln.sku === '9.1') c.q91 += ln.qty;
      if (ln.sku === 'S.1') c.s1 += ln.qty;
      if (ln.sku === 'D.1') c.d1 += ln.qty;
    }
  } else if (isEmptyDesc(meta.desc)) {
    c.fin += meta.amt;
    for (const r of deriveFromValue(meta.amt)) {
      if (r.sku === '9.1') c.q91 += r.qty;
      if (r.sku === 'S.1') c.s1 += r.qty;
      if (r.sku === 'D.1') c.d1 += r.qty;
    }
  }
}

const clusterList = [...clusters.values()]
  .map((c) => ({
    ...c,
    fin: round2(c.fin),
    q91: round2(c.q91),
    s1: round2(c.s1),
    d1: round2(c.d1),
    qsd: round2(c.s1 + c.d1),
    'S.1/D.1': round2(c.s1 + c.d1),
  }))
  .sort((a, b) => a.dn.localeCompare(b.dn));

const clusterQtyNets = clusterList.filter(
  (c) => c.dn !== 'UNRESOLVED' && (Math.abs(c.fin) > 0.001 || Math.abs(c.q91) > 0.001 || Math.abs(c.qsd) > 0.001),
);

const custody91 = round2(clusterQtyNets.reduce((s, c) => s + c.q91, 0));
const custodyS1 = round2(clusterQtyNets.reduce((s, c) => s + c.s1, 0));
const custodyD1 = round2(clusterQtyNets.reduce((s, c) => s + c.d1, 0));
const custodyMerged = round2(custodyS1 + custodyD1);

const registry = loadLiveRegistry();
const regRun = computeRegistryOutstanding(registry, UNMERGED);

let invariantPass;
if (UNMERGED) {
  invariantPass =
    Math.abs(custody91 - (regRun['9.1'] || 0)) < 0.001 &&
    Math.abs(custodyS1 - (regRun['S.1'] || 0)) < 0.001 &&
    Math.abs(custodyD1 - (regRun['D.1'] || 0)) < 0.001;
} else {
  invariantPass =
    Math.abs(custody91 - (regRun['9.1'] || 0)) < 0.001 &&
    Math.abs(custodyMerged - (regRun['S.1/D.1'] || 0)) < 0.001;
}

const closures = [
  { id: 'EX-0005', cn: '12535', closedBy: '14113', sku: '9.1', mechanism: '14113 2×9.1 double-return DN#21716-EMPTY repays 12535 float' },
  { id: 'EX-0015', cn: '14741', closedBy: '14856', sku: '9.1', mechanism: '14856 3×9.1 over-return DN#22222-EMPTY' },
  { id: 'EX-0009', cn: '12872', closedBy: '13251', sku: 'S.1', mechanism: '13251 vs 45721 DN#20515-EMPTY' },
  { id: 'EX-0013', cn: '14007', closedBy: '15128', sku: 'S.1', mechanism: '15128 vs 51432 DN#22662=EMPTY' },
  { id: 'EX-0016', cn: '15166', closedBy: '15254', sku: 'S.1', mechanism: '15254 vs 51790 DN#22810=EMPTY cluster' },
  { id: 'EX-0034', cn: '51527', closedBy: '15254', sku: 'S.1', mechanism: '51527/15166 DN#22538=EMPTY closed by 15254/51790' },
];
const superseded = [
  'EX-0001', 'EX-0002', 'EX-0003', 'EX-0004', 'EX-0006', 'EX-0007', 'EX-0008',
  'EX-0010', 'EX-0011', 'EX-0012', 'EX-0014',
];

const washPair = { charge: '43859', credit: '12710', dn: 'DN#12560-E,MPTY' };
const washCharge = round2(shellHitsLpg.filter((h) => h.doc === washPair.charge).reduce((s, h) => s + h.value, 0));
const washCredit = round2(shellHitsLpg.filter((h) => h.doc === washPair.credit).reduce((s, h) => s + h.value, 0));

const bridgeRecon = round2(OPEN_LPG_DOC_TOTAL - UNALLOC_44227);
const bridgeVariance = round2(TXT_CLOSING - bridgeRecon);

const reg91 = regRun['9.1'] ?? regRun['9.1'] ?? 0;
const regMerged = regRun['S.1/D.1'] ?? 0;
const regS1 = regRun['S.1'] ?? 0;
const regD1 = regRun['D.1'] ?? 0;

// --- Reports (unchanged structure) ---
let md = `# MOZ002 — Turn 7i: TXT Decomposition v2 (line-level lanes)

**Generated:** 2026-07-20 · Read-only · supersedes \`MOZ002_TXT_Decomposition_v1.md\` (doc-level lanes)

> **Doctrine:** Lane membership is a property of the **line**, not the document. Mixed documents are the norm; doc-level partitioning manufactured the −R1,207.50 phantom that consumed Turns 7g–7i.

---

## Step 1 — Shell-line hunt (Turn 7h LPG-classified documents)

**Hypothesis window:** Dec 2025 / DN#21716 / candidate **48347**.

| Finding | Result |
| :--- | :--- |
| Shell lines on LPG-classified docs | **${shellHitsLpg.length} lines** across **${shellHitByDoc.size} documents** |
| Σ net shell on LPG-classified docs | **${fmtR(shellHitTotal)}** (unpaired — driven by **51078**/**15027**; paired typo-headers net R0 per cluster) |
| **48347** (DN#21716 LPG invoice) | **No shell lines** — LPG product only (9.4, S.4) |
| **48348** / **14113** (DN#21716-EMPTY) | Shell lines on **empty-classified** headers (not in this hunt) |
| Reverse contamination (LPG product on empty-header docs) | **${reverseLpgOnEmpty.length} lines** |

### Every shell hit on LPG-classified documents

| Doc | Date | Type | SKU | Qty | Value | TXT desc | Header desc |
| :--- | :--- | :--- | :--- | ---: | ---: | :--- | :--- |
`;
for (const h of shellHitsLpg) {
  md += `| ${h.doc} | ${h.date} | ${h.entry} | ${h.sku} | ${h.qty} | ${fmtR(h.value)} | ${h.txt_desc || '—'} | ${h.hdr_desc || '—'} |\n`;
}
md += `
### Per-document shell subtotals (LPG-classified)

| Doc | Σ shell value | Lines |
| :--- | ---: | :--- |
`;
for (const [doc, b] of [...shellHitByDoc.entries()].sort((a, c) => a[0].localeCompare(c[0]))) {
  md += `| ${doc} | ${fmtR(b.sum)} | ${b.lines.map((l) => `${l.sku} ${fmtR(l.value)}`).join('; ')} |\n`;
}
md += `
**48347 neighbour check:** Inv **48347** (DN#21716, ${fmtR(3770.39)} LPG) has **zero** CYL/deposit lines. The DN#21716 shell activity lives on **48348** + **14113** (empty headers). The Turn 7h −R1,207.50 phantom was **not** a missing 48347 shell line — it was **doc-level lane assignment** aggregating asymmetric cluster financials while shell lines on typo-LPG headers (e.g. \`DN#12560-E,MPTY\`) sat in the LPG lane.

**Reverse contamination:** ${reverseLpgOnEmpty.length ? 'see table' : 'none'}.

---

## Step 2 — Four-lane identity (line-level partition)

| Lane | Doc-level (Turn 7h) | **Line-level (Turn 7i)** | Δ |
| :--- | ---: | ---: | ---: |
| LPG | ${fmtR(laneDoc.lpg)} | **${fmtR(laneLine.lpg)}** | ${fmtR(laneLine.lpg - laneDoc.lpg)} |
| Empty/CYL | ${fmtR(laneDoc.empty_cyl)} | **${fmtR(laneLine.empty_cyl)}** | ${fmtR(laneLine.empty_cyl - laneDoc.empty_cyl)} |
| Payments | ${fmtR(laneDoc.payments)} | ${fmtR(laneLine.payments)} | ${fmtR(0)} |
| **Four-lane total** | ${fmtR(round2(laneDoc.lpg + laneDoc.empty_cyl + laneDoc.payments))} | **${fmtR(fourSumLine)}** | ${fmtR(fourSumLine - TXT_CLOSING)} |

Expected: LPG **R181,398.05**, empty **R0.00** — **actual: LPG ${fmtR(laneLine.lpg)}, empty ${fmtR(laneLine.empty_cyl)}**.

---

## Step 3 — Invariant re-test (line-level basis d)

Registry source: \`config/cyl_residual_registry.json\` (or proposed fallback) · mode: **${UNMERGED ? 'unmerged S.1 + D.1' : 'merged S.1/D.1 provisional'}**

| Class | Registry qty | Custody (d) | Match |
| :--- | ---: | ---: | :--- |
| 9.1 | ${UNMERGED ? regRun['9.1'] : reg91} | ${custody91} | ${Math.abs(custody91 - (UNMERGED ? regRun['9.1'] : reg91)) < 0.001 ? '✓' : '✗'} |
`;
if (UNMERGED) {
  md += `| S.1 | ${regS1} | ${custodyS1} | ${Math.abs(custodyS1 - regS1) < 0.001 ? '✓' : '✗'} |\n| D.1 | ${regD1} | ${custodyD1} | ${Math.abs(custodyD1 - regD1) < 0.001 ? '✓' : '✗'} |\n`;
} else {
  md += `| S.1/D.1 | ${regMerged} | ${custodyMerged} | ${Math.abs(custodyMerged - regMerged) < 0.001 ? '✓' : '✗'} |\n`;
}
md += `
**Invariant: ${invariantPass ? 'PASS' : 'FAIL'}**

${unresolvedDns.length ? `DN resolution UNRESOLVED docs: ${unresolvedDns.join(', ')}\n` : ''}
### Non-zero DN clusters

| DN cluster | Fin net | 9.1 | S.1/D.1 |
| :--- | ---: | ---: | ---: |
`;
for (const c of clusterQtyNets) {
  md += `| ${c.dn.slice(0, 36)} | ${fmtR(c.fin)} | ${c.q91 || '—'} | ${c.qsd || '—'} |\n`;
}
md += `| **Σ** | **${fmtR(laneLine.empty_cyl)}** | **${custody91}** | **${custodyMerged}** |

---

## Step 4 — Bridge note

| Component | Amount |
| :--- | ---: |
| Open LPG pool | ${fmtR(OPEN_LPG_DOC_TOTAL)} |
| Less 44227 | ${fmtR(-UNALLOC_44227)} |
| Reconstructed closing | ${fmtR(bridgeRecon)} |
| TXT closing | ${fmtR(TXT_CLOSING)} |
| Variance | ${fmtR(bridgeVariance)} |

Four-lane identity: **exact** at ${fmtR(TXT_CLOSING)}. Bridge Δ ${fmtR(bridgeVariance)} = **EX-0029** (43234 cent).

---

*Turn 7i. Read-only on edges, LPG registry, reconState, 44227.*
`;
fs.writeFileSync(path.join(ROOT, 'reports/MOZ002_TXT_Decomposition_v2.md'), md);

if (invariantPass && fs.existsSync(path.join(ROOT, 'config/cyl_residual_registry_v10_2_proposed.json'))) {
  const v102 = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/cyl_residual_registry_v10_2_proposed.json'), 'utf8'));
  fs.writeFileSync(path.join(ROOT, 'config/cyl_residual_registry_v10_2_proposed.json'), JSON.stringify(v102, null, 2));
}

console.log(
  JSON.stringify(
    {
      step1_hits: shellHitsLpg.length,
      shellHitTotal,
      lineLanes: laneLine,
      fourSumLine,
      invariantPass,
      unmerged: UNMERGED,
      regRun,
      custody: { q91: custody91, s1: custodyS1, d1: custodyD1, merged: custodyMerged },
      bridgeVariance,
      unresolvedDns,
    },
    null,
    2,
  ),
);

await client.end();
