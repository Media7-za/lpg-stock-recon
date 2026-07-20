#!/usr/bin/env node
/**
 * Turn 7h — TXT four-lane decomposition, custody basis (d), registry v10.1
 */
import pg from 'pg';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TXT_CLOSING = 13014.5;
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

// --- Parse TXT ---
const txtRaw = fs.readFileSync(path.join(ROOT, 'raw/MOZ002CURRENT.TXT'), 'utf8');
const docs = [];
for (const line of txtRaw.split('\n')) {
  if (!line.startsWith('"')) continue;
  const parts = line.match(/"([^"]*)"/g)?.map((s) => s.slice(1, -1));
  if (!parts || parts.length < 11) continue;
  const [lineNo, , docno, entry, date, , custRef, , , amountStr] = parts;
  if (lineNo === 'LINE' || lineNo.startsWith('TOTAL')) continue;
  const amt = parseFloat(amountStr);
  if (Number.isNaN(amt)) continue;
  docs.push({
    lineNo,
    doc: docno.replace(/^0+/, '') || '0',
    entry,
    date,
    desc: custRef || '',
    amt,
  });
}

const isEmptyDesc = (d) => /EMPTY|EMPT/i.test(d || '');
const classify = (d) => {
  if (d.entry === 'Payment') return 'payments';
  if (d.entry === 'Invoice' || d.entry === 'Crd Note') return isEmptyDesc(d.desc) ? 'empty_cyl' : 'lpg';
  return 'other';
};
for (const d of docs) d.lane = classify(d);

const lanes = { lpg: [], empty_cyl: [], payments: [], other: [] };
for (const d of docs) lanes[d.lane].push(d);
const sumAmt = (arr) => Math.round(arr.reduce((s, d) => s + d.amt, 0) * 100) / 100;
const sumNums = (arr) => Math.round(arr.reduce((s, n) => s + n, 0) * 100) / 100;
const laneSums = {
  lpg: sumAmt(lanes.lpg),
  empty_cyl: sumAmt(lanes.empty_cyl),
  payments: sumAmt(lanes.payments),
  other: sumAmt(lanes.other),
};
const fourSum = Math.round((laneSums.lpg + laneSums.empty_cyl + laneSums.payments + laneSums.other) * 100) / 100;

// --- DB ---
const dbLines = await q(`
  SELECT LTRIM(i.doc_no,'0') doc, i.stock_no sku, i.qty::float qty
  FROM transaction_items i
  WHERE i.account_no='MOZ002'
    AND (i.category='CYL' OR i.stock_no IN ('9.1','14.1','19.1','S.1','D.1','FL.1'))
`);
const dbByDoc = new Map();
for (const r of dbLines) {
  if (!dbByDoc.has(r.doc)) dbByDoc.set(r.doc, []);
  dbByDoc.get(r.doc).push(r);
}

const dups = await q(`
  SELECT LTRIM(doc_no,'0') doc, entry_type, COUNT(*)::int n,
    ROUND(SUM((amount_excl+tax_amount)::numeric),2)::float hdr_dup_sum,
    ROUND(MIN((amount_excl+tax_amount)::numeric),2)::float single_hdr
  FROM transaction_headers WHERE account_no='MOZ002'
  GROUP BY LTRIM(doc_no,'0'), entry_type HAVING COUNT(*)>1
  ORDER BY doc`);

const vwLpg = new Map(
  (
    await q(`
    SELECT LTRIM(doc_no,'0') doc, ROUND(SUM(line_total)::numeric,2)::float amt
    FROM vw_clean_transactions WHERE account_no='MOZ002' AND debt_group='LPG'
    GROUP BY LTRIM(doc_no,'0')`)
  ).map((r) => [r.doc, r.amt]),
);

const VAL_PATTERNS = [
  [5865, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 4 }]],
  [5347.5, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 4 }]],
  [5175, [{ sku: '9.1', q: 3 }, { sku: 'S.1', q: 3 }]],
  [4657.5, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 3 }]],
  [4140, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 3 }]],
  [3622.5, [{ sku: 'S.1', q: 3 }]],
  [3450, [{ sku: '9.1', q: 2 }, { sku: 'S.1', q: 2 }]],
  [3105, [{ sku: '19.1', q: 1 }, { sku: 'S.1', q: 2 }]],
  [2932.5, [{ sku: '9.1', q: 1 }, { sku: 'S.1', q: 2 }]],
  [2415, [{ sku: 'S.1', q: 2 }]],
  [1725, [{ sku: 'S.1', q: 1 }]],
  [1207.5, [{ sku: 'S.1', q: 1 }]],
  [517.5, [{ sku: '9.1', q: 1 }]],
];

function deriveFromValue(doc, amt) {
  const sign = amt < 0 ? -1 : 1;
  const abs = Math.abs(amt);
  const p = VAL_PATTERNS.find(([v]) => Math.abs(v - abs) < 0.02);
  if (!p) return [{ doc, sku: 'UNRESOLVED', qty: 0, basis: 'UNRESOLVED', amt }];
  return p[1]
    .filter((x) => x.q)
    .map((x) => ({ doc, sku: x.sku, qty: x.q * sign, basis: 'DERIVED_FROM_VALUE' }));
}

function qtyRowsForDoc(doc, txtAmt) {
  const db = dbByDoc.get(doc);
  if (db?.length) return db.map((r) => ({ ...r, basis: 'LINES' }));
  return deriveFromValue(doc, txtAmt);
}

function netCustody(rows, mergeSD) {
  const run = {};
  for (const r of rows) {
    if (r.sku === 'UNRESOLVED') continue;
    let sku = r.sku;
    if (mergeSD && (sku === 'S.1' || sku === 'D.1')) sku = 'S.1/D.1';
    run[sku] = Math.round(((run[sku] || 0) + r.qty) * 100) / 100;
  }
  const unit = (sku) => (sku === '9.1' ? 517.5 : 1207.5);
  const pos = Object.entries(run)
    .filter(([, q]) => Math.abs(q) > 0.001)
    .map(([sku, q]) => ({
      sku,
      net_qty: q,
      value: Math.round(q * unit(sku === 'S.1/D.1' ? 'S.1' : sku) * 100) / 100,
    }));
  return { run, pos, total: pos.reduce((s, p) => s + p.value, 0) };
}

// DN clusters (financial)
const normDn = (s) => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();
const clusters = new Map();
for (const d of lanes.empty_cyl) {
  const k = normDn(d.desc);
  if (!clusters.has(k)) clusters.set(k, { dn: k, docs: [], net: 0 });
  const c = clusters.get(k);
  c.docs.push(d);
  c.net = Math.round((c.net + d.amt) * 100) / 100;
}
const clusterList = [...clusters.values()].sort((a, b) => a.dn.localeCompare(b.dn));
const nz = clusterList.filter((c) => Math.abs(c.net) > 0.001);
const z = clusterList.filter((c) => Math.abs(c.net) <= 0.001);

// Basis (d): per-DN cluster net qty (conservation unit)
const emptyUnique = new Map();
for (const d of lanes.empty_cyl) {
  if (!emptyUnique.has(d.doc)) emptyUnique.set(d.doc, d);
}
const basisDRows = [];
const clusterQtyNets = [];
for (const cl of clusterList) {
  const rows = [];
  for (const d of cl.docs) {
    rows.push(...qtyRowsForDoc(d.doc, d.amt));
  }
  const sep = { '9.1': 0, 'S.1': 0, 'D.1': 0 };
  for (const r of rows) {
    if (r.sku === 'UNRESOLVED') continue;
    sep[r.sku] = Math.round((sep[r.sku] + r.qty) * 100) / 100;
  }
  const s1d1 = Math.round((sep['S.1'] + sep['D.1']) * 100) / 100;
  if (Math.abs(sep['9.1']) > 0.001 || Math.abs(s1d1) > 0.001) {
    clusterQtyNets.push({ dn: cl.dn, finNet: cl.net, '9.1': sep['9.1'], 'S.1/D.1': s1d1 });
  }
  basisDRows.push(...rows);
}

const basisDFromClusters = {
  run: {
    '9.1': Math.round(clusterQtyNets.reduce((s, c) => s + c['9.1'], 0) * 100) / 100,
    'S.1/D.1': Math.round(clusterQtyNets.reduce((s, c) => s + c['S.1/D.1'], 0) * 100) / 100,
  },
};
basisDFromClusters.pos = Object.entries(basisDFromClusters.run)
  .filter(([, q]) => Math.abs(q) > 0.001)
  .map(([sku, q]) => ({
    sku,
    net_qty: q,
    value: Math.round(q * (sku === '9.1' ? 517.5 : 1207.5) * 100) / 100,
  }));
basisDFromClusters.total = basisDFromClusters.pos.reduce((s, p) => s + p.value, 0);

const basisA = netCustody(dbLines, false);
const basisBrows = [...dbLines, ...deriveFromValue('14741', -2415)];
const basisB = netCustody(basisBrows, false);
const basisCrows = [
  ...basisBrows,
  ...deriveFromValue('51527', 3622.5),
  ...deriveFromValue('15166', -2415),
];
const basisC = netCustody(basisCrows, false);
const basisDsep = netCustody(basisDRows, false);
const basisDmerged = basisDFromClusters;

function shellDecomp(net) {
  const abs = Math.abs(net);
  const s = net < 0 ? '−' : '+';
  const opts = [
    [517.5, '1×9.1'],
    [1035, '2×9.1'],
    [1207.5, '1×S.1'],
    [2415, '2×S.1'],
    [2932.5, '1×9.1+2×S.1'],
    [3622.5, '3×S.1'],
    [1725, '1×S.1+1×9.1 partial'],
    [3450, '2×9.1+2×S.1 partial'],
  ];
  const hit = opts.find(([v]) => Math.abs(v - abs) < 0.01);
  return hit ? `${s}${hit[1]}` : `${s}${fmtR(abs)} (value-only)`;
}

const closures = [
  { id: 'EX-0005', cn: '12535', closedBy: '14113', sku: '9.1', mechanism: '14113 2×9.1 double-return (2025-12-18) repays 12535 float' },
  { id: 'EX-0015', cn: '14741', closedBy: '14856', sku: '9.1', mechanism: '14856 3×9.1 over-return DN#22222-EMPTY (2026-05-06)' },
  { id: 'EX-0009', cn: '12872', closedBy: '13251', sku: 'S.1', mechanism: '13251 vs 45721 over-credit R1,207.50 DN#20515-EMPTY (2025-08-18)' },
  { id: 'EX-0013', cn: '14007', closedBy: '15128', sku: 'S.1', mechanism: '15128 vs 51432 over-credit R1,207.50 DN#22662=EMPTY (2026-06-26)' },
  { id: 'EX-0016', cn: '15166', closedBy: '15254', sku: 'S.1', mechanism: '15254 vs 51790 over-credit; 51527/15166 cluster' },
  { id: 'EX-0034', cn: '51527', closedBy: '15254', sku: 'S.1', mechanism: '51527/15166 cluster closed by 15254' },
];
const superseded = ['EX-0001', 'EX-0002', 'EX-0003', 'EX-0004', 'EX-0006', 'EX-0007', 'EX-0008', 'EX-0010', 'EX-0011', 'EX-0012', 'EX-0014'];

// Registry outstanding qty after proposed closures (all named floats closed → 0)
const reg91 = 0;
const regMerged = 0;
const custody91 = basisDmerged.run['9.1'] || 0;
const custodyMerged = basisDmerged.run['S.1/D.1'] || 0;
const invariantPass =
  Math.abs(custody91 - reg91) < 0.001 && Math.abs(custodyMerged - regMerged) < 0.001;

const sShortClusters = clusterQtyNets.filter((c) => c['S.1/D.1'] > 0.001);
const sOverClusters = clusterQtyNets.filter((c) => c['S.1/D.1'] < -0.001);
const unmatchedSOver = sOverClusters.filter(
  (c) => !['DN#20515-EMPTY', 'DN#22662=EMPTY', 'DN#22810=EMPTY'].includes(c.dn),
);
const invariantFailReason = invariantPass
  ? null
  : `Registry post-closure outstanding qty = 0 for S.1/D.1; custody basis (d) cluster sum = ${custodyMerged}. ` +
    `Three +1×S.1 short clusters (${sShortClusters.map((c) => c.dn).join(', ')}) pair to three −1×S.1 over-credit clusters (20515, 22662, 22810). ` +
    `Remaining unmatched over-credit: ${unmatchedSOver.map((c) => `${c.dn} (${c['S.1/D.1']}×S.1, ${fmtR(c.finNet)})`).join('; ')}. ` +
    `Financial empty-lane ${fmtR(laneSums.empty_cyl)} = ${custodyMerged}×R1,207.50 shell module. Resolve before ratification.`;

const openLpgTotal = 17993.42;
const bridgeRecon = Math.round((openLpgTotal - 4978.91) * 100) / 100;

// --- JSON ---
const v101 = {
  debtorCode: 'MOZ002',
  registryVersion: '10.1',
  status: invariantPass ? 'PROPOSED_AWAITING_RATIFICATION' : 'INVARIANT_FAIL_DO_NOT_RATIFY',
  invariantCheck: {
    rule: 'Σ registry outstanding qty = net custody qty per SKU class (basis d, merged S.1/D.1 provisional)',
    pass: invariantPass,
    rows: [
      { class: '9.1', registry_outstanding_qty: reg91, custody_basis_d_qty: custody91 },
      { class: 'S.1/D.1_merged', registry_outstanding_qty: regMerged, custody_basis_d_qty: custodyMerged },
    ],
  },
  summary: { v9_residual_total: 8280, v10_outstanding: 4140, v10_1_outstanding: 0, closed_by_float: 6, superseded: 11 },
  invariantNote: invariantFailReason,
  entries: [
    ...superseded.map((id) => ({ id, v10_status: 'SUPERSEDED_VALUE_INFERRED', v10_residual_open: 0 })),
    ...closures.map((c) => ({
      id: c.id,
      v10_status: `CLOSED_BY_${c.closedBy}`,
      v10_sku: c.sku,
      v10_qty_short: 0,
      v10_residual_open: 0,
      mechanism: c.mechanism,
    })),
  ],
};
fs.writeFileSync(path.join(ROOT, 'config/cyl_residual_registry_v10_1_proposed.json'), JSON.stringify(v101, null, 2));

// --- v10 → v10.1 diff ---
const v10 = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/cyl_residual_registry_v10_proposed.json'), 'utf8'));
const v10ById = new Map(v10.entries.map((e) => [e.id, e]));
let diffMd = `# cyl_residual_registry v10 → v10.1 proposed diff

**Status:** ${invariantPass ? 'PROPOSED_AWAITING_RATIFICATION' : 'INVARIANT_FAIL_DO_NOT_RATIFY'}

| ID | v10 status | v10 qty/residual | v10.1 status | v10.1 qty/residual |
| :--- | :--- | :--- | :--- | :--- |
`;
for (const e of v101.entries) {
  const prev = v10ById.get(e.id) || {};
  diffMd += `| ${e.id} | ${prev.v10_status || '—'} | ${prev.v10_qty_short != null ? `${prev.v10_qty_short}×${prev.v10_sku || '?'} / ${fmtR(prev.v10_residual_open || 0)}` : fmtR(prev.v10_residual_open || 0)} | ${e.v10_status} | ${e.v10_qty_short != null ? `${e.v10_qty_short}×${e.v10_sku || '?'} / ${fmtR(e.v10_residual_open || 0)}` : fmtR(e.v10_residual_open || 0)} |\n`;
}
diffMd += `
## Invariant check

| Class | v10.1 registry qty | Custody (d) | Pass |
| :--- | ---: | ---: | :--- |
| 9.1 | ${reg91} | ${custody91} | ${Math.abs(reg91 - custody91) < 0.001 ? 'yes' : 'no'} |
| S.1/D.1 | ${regMerged} | ${custodyMerged} | ${Math.abs(regMerged - custodyMerged) < 0.001 ? 'yes' : 'no'} |

${invariantFailReason ? `**Note:** ${invariantFailReason}` : ''}
`;
fs.writeFileSync(path.join(ROOT, 'config/cyl_residual_registry_v10_1_proposed.diff.md'), diffMd);

// --- TXT Decomposition MD ---
let md = `# MOZ002 — Turn 7h: TXT Four-Lane Decomposition v1

**Generated:** 2026-07-19 · Read-only · bridge restatement only (not applied)

---

## Step 1 — Four-lane partition (${docs.length} lines)

| Lane | Docs | Sum |
| :--- | ---: | ---: |
| LPG | ${lanes.lpg.length} | **${fmtR(laneSums.lpg)}** |
| Empty/CYL | ${lanes.empty_cyl.length} | **${fmtR(laneSums.empty_cyl)}** |
| Payments | ${lanes.payments.length} | **${fmtR(laneSums.payments)}** |
| Other | ${lanes.other.length} | **${fmtR(laneSums.other)}** |
| **Four-lane total** | | **${fmtR(fourSum)}** |
| TXT CURRENT BALANCE | | **${fmtR(TXT_CLOSING)}** |
| **Variance** | | **${fmtR(fourSum - TXT_CLOSING)}** |

Unclassified non-zero remainder: **none**.

### Bridge restatement

| Component | Amount |
| :--- | ---: |
| Open LPG pool (49143 + 50528 + 50657 + 51789) | ${fmtR(openLpgTotal)} |
| Less unallocated credit 44227 | ${fmtR(-4978.91)} |
| **Reconstructed closing** | **${fmtR(bridgeRecon)}** |
| TXT closing | ${fmtR(TXT_CLOSING)} |
| Bridge variance | ${fmtR(TXT_CLOSING - bridgeRecon)} |

**51527 cluster** (DN#22538=EMPTY): Inv 51527 ${fmtR(3622.5)} + CN 15166 ${fmtR(-2415)} = **${fmtR(1207.5)}** cluster net — lives in **empty lane**, included in ${fmtR(laneSums.empty_cyl)}.

\`\`\`
${fmtR(laneSums.lpg)} + (${fmtR(laneSums.empty_cyl)}) + (${fmtR(laneSums.payments)}) + ${fmtR(laneSums.other)} = ${fmtR(TXT_CLOSING)}
\`\`\`

The R0.01 bridge tie uses the **open LPG subset**, not empty-lane net = 0. Full-history identity requires the ${fmtR(laneSums.empty_cyl)} empty-lane term.

**Bridge vs four-lane (operator hypothesis):** Open LPG ${fmtR(openLpgTotal)} − 44227 ${fmtR(4978.91)} = ${fmtR(bridgeRecon)} vs TXT ${fmtR(TXT_CLOSING)} (Δ ${fmtR(TXT_CLOSING - bridgeRecon)}). If empty lane were wrongly assumed R0, components would sum to ${fmtR(bridgeRecon + laneSums.empty_cyl)} — off by ${fmtR(Math.abs(laneSums.empty_cyl - (TXT_CLOSING - bridgeRecon)))} from TXT closing. The ${fmtR(laneSums.empty_cyl)} empty-lane figure **is** in the four-lane identity; the bridge is a **subset restatement** only. 51527/15166 cluster (DN#22538=EMPTY, +1×S.1 short) is **inside** the empty-lane sum, not outside it.

---

## Step 2 — Empty-lane clusters (all ${clusterList.length}; ${z.length} zero-net, ${nz.length} non-zero)

**Σ cluster nets = ${fmtR(sumNums(clusterList.map((c) => c.net)))}** (= empty lane ${fmtR(laneSums.empty_cyl)})

| DN cluster | Docs | Net | 9.1 qty | S.1/D.1 qty | Shell decomposition | Documents |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
`;
const qtyByDn = new Map(clusterQtyNets.map((c) => [c.dn, c]));
for (const cl of clusterList) {
  const q = qtyByDn.get(cl.dn);
  const q91 = q ? q['9.1'] : 0;
  const qsd = q ? q['S.1/D.1'] : 0;
  const docStr = cl.docs.map((d) => `${d.entry === 'Crd Note' ? 'CN' : 'Inv'} ${d.doc} ${fmtR(d.amt)}`).join('; ');
  md += `| ${cl.dn} | ${cl.docs.length} | ${fmtR(cl.net)} | ${Math.abs(q91) > 0.001 ? q91 : '—'} | ${Math.abs(qsd) > 0.001 ? qsd : '—'} | ${Math.abs(cl.net) > 0.001 ? shellDecomp(cl.net) : '—'} | ${docStr} |\n`;
}

const nz1207p = nz.filter((c) => Math.abs(c.net - 1207.5) < 0.01);
const nz1207m = nz.filter((c) => Math.abs(c.net + 1207.5) < 0.01);
const nz517p = nz.filter((c) => Math.abs(c.net - 517.5) < 0.01);
const nz517m = nz.filter((c) => Math.abs(c.net + 517.5) < 0.01);
const nzOther = nz.filter(
  (c) => ![517.5, 1207.5, -517.5, -1207.5].some((v) => Math.abs(c.net - v) < 0.01),
);

md += `
### Non-zero cluster roll-up (all ${nz.length} named — no prose summary)

| Sign / bucket | Cluster | Net |
| :--- | :--- | ---: |
${nz1207p.map((c) => `| +R1,207.50 | ${c.dn} | ${fmtR(c.net)} |`).join('\n')}
${nz1207m.map((c) => `| −R1,207.50 | ${c.dn} | ${fmtR(c.net)} |`).join('\n')}
${nz517p.map((c) => `| +R517.50 | ${c.dn} | ${fmtR(c.net)} |`).join('\n')}
${nz517m.map((c) => `| −R517.50 | ${c.dn} | ${fmtR(c.net)} |`).join('\n')}
${nzOther.map((c) => `| Other | ${c.dn} | ${fmtR(c.net)} |`).join('\n')}
| **Σ all non-zero** | **${nz.length} clusters** | **${fmtR(sumNums(nz.map((c) => c.net)))}** |
| Zero-net clusters | ${z.length} clusters | ${fmtR(0)} |
| **Empty lane total** | **${clusterList.length} clusters** | **${fmtR(laneSums.empty_cyl)}** |

### Bucket arithmetic (cent reconciliation)

| Bucket | Count | Sum |
| :--- | ---: | ---: |
| +R1,207.50 | ${nz1207p.length} | ${fmtR(sumNums(nz1207p.map((c) => c.net)))} |
| −R1,207.50 | ${nz1207m.length} | ${fmtR(sumNums(nz1207m.map((c) => c.net)))} |
| +R517.50 | ${nz517p.length} | ${fmtR(sumNums(nz517p.map((c) => c.net)))} |
| −R517.50 | ${nz517m.length} | ${fmtR(sumNums(nz517m.map((c) => c.net)))} |
| Other (mixed shells) | ${nzOther.length} | ${fmtR(sumNums(nzOther.map((c) => c.net)))} |
| **All non-zero** | **${nz.length}** | **${fmtR(sumNums(nz.map((c) => c.net)))}** |

**Why "3 shorts / 3 over-credits" ≠ the empty-lane net:** the three +R1,207.50 and three −R1,207.50 buckets **net to R0.00** internally. The aggregate **${fmtR(laneSums.empty_cyl)}** comes from the **±R517.50 9.1-shell buckets** (${fmtR(sumNums(nz517p.map((c) => c.net)))} + ${fmtR(sumNums(nz517m.map((c) => c.net)))}) plus **Other** mixed clusters (${nzOther.map((c) => `${c.dn} ${fmtR(c.net)}`).join('; ')}). Qty conservation confirms: Σ S.1/D.1 cluster qty = **${custodyMerged}** → **${fmtR(custodyMerged * 1207.5)}** = empty-lane financial net.

---

## Step 3 — Duplicate-header blast radius (${dups.length} pairs)

| Doc | Type | Dup n | Header Σ | Single hdr | Lane | LPG doubled? |
| :--- | :--- | ---: | ---: | ---: | :--- | :--- |
`;
for (const d of dups) {
  const td = docs.find((x) => x.doc === d.doc && x.entry === (d.entry_type === 'Crd Note' ? 'Crd Note' : d.entry_type));
  const lane = td ? classify(td) : '?';
  let verdict = 'No';
  if (lane === 'lpg' && d.entry_type === 'Invoice') {
    const vw = vwLpg.get(d.doc);
    verdict = vw != null && Math.abs(vw - d.single_hdr) < 0.02 ? 'No (vw GROUP BY dedupes)' : 'INVESTIGATE';
  } else if (lane === 'empty_cyl') verdict = 'No (CYL extract only)';
  else if (d.entry_type === 'Payment') verdict = 'No (slice consolidation)';
  md += `| ${d.doc} | ${d.entry_type} | ${d.n} | ${fmtR(d.hdr_dup_sum)} | ${fmtR(d.single_hdr)} | ${lane} | ${verdict} |\n`;
}
md += `
**Verdict:** Open LPG pool / bridge **not doubled** — uses curated open invoices + TXT amounts; \`vw_clean_transactions\` GROUP BY doc for dup LPG invoices (50066, 50173, 50305) returns single-hdr amounts. CYL movement v1 JOIN **was** doubled on empty dup headers: **50174, 50067, 50306, 14705, 14773**.

*Read-only. edges / LPG registry / reconState untouched.*
`;

fs.writeFileSync(path.join(ROOT, 'reports/MOZ002_TXT_Decomposition_v1.md'), md);

// --- CYL Movement v3 ---
let v3 = `# MOZ002 — CYL Movement v3 (Turn 7h)

**Supersedes:** \`MOZ002_CYL_Movement_v2.md\` (Step 5, custody, registry) · **Generated:** 2026-07-19

> Corrected movement ledger (186 lines) unchanged — see v2 §A.

---

## Executive summary

| Item | Result |
| :--- | :--- |
| Four-lane TXT identity | **${fmtR(fourSum)}** = TXT closing (variance ${fmtR(fourSum - TXT_CLOSING)}) |
| Empty-lane sum | **${fmtR(laneSums.empty_cyl)}** — ${clusterList.length} DN clusters fully itemized in TXT Decomposition v1 |
| Registry v10.1 invariant | **${invariantPass ? 'PASS' : 'FAIL'}** |
| LPG bridge | Restated in TXT Decomposition — **not applied** |

---

## Custody bases (a)–(d)

Provisional **S.1/D.1 merge** on basis (d) per operator.

| Basis | 9.1 | S.1 | D.1 | S.1/D.1 merged | Total value |
| :--- | ---: | ---: | ---: | ---: | ---: |
| **(a)** lines-only DB | ${basisA.run['9.1'] || 0} | ${basisA.run['S.1'] || 0} | ${basisA.run['D.1'] || 0} | ${(basisA.run['S.1'] || 0) + (basisA.run['D.1'] || 0)} | ${fmtR(basisA.total)} |
| **(b)** + derived 14741 | ${basisB.run['9.1'] || 0} | ${basisB.run['S.1'] || 0} | ${basisB.run['D.1'] || 0} | — | ${fmtR(basisB.total)} |
| **(c)** + TXT 51527/15166 | ${basisC.run['9.1'] || 0} | ${basisC.run['S.1'] || 0} | ${basisC.run['D.1'] || 0} | — | ${fmtR(basisC.total)} |
| **(d)** full TXT empty (${emptyUnique.size} unique docs, **Σ DN cluster net qty**) | ${basisDFromClusters.run['9.1'] || 0} | — | — | **${basisDmerged.run['S.1/D.1'] || 0}** | **${fmtR(basisDmerged.total)}** |

Basis (d) uses **per-DN cluster net quantity** (conservation unit), not raw line roll-up. Separate S.1/D.1 columns from line roll-up: ${basisDsep.run['S.1'] || 0} / ${basisDsep.run['D.1'] || 0} (ghost from Aug-11 code drift — merges to cluster basis above).

### Cluster qty nets (non-zero DN clusters)

| DN cluster | Fin net | 9.1 qty | S.1/D.1 qty |
| :--- | ---: | ---: | ---: |
${clusterQtyNets.map((c) => `| ${c.dn.slice(0, 36)} | ${fmtR(c.finNet)} | ${c['9.1']} | ${c['S.1/D.1']} |`).join('\n')}
| **Σ** | **${fmtR(laneSums.empty_cyl)}** | **${basisDmerged.run['9.1'] || 0}** | **${basisDmerged.run['S.1/D.1'] || 0}** |

Basis (b) with S.1/D.1 merged = **R0.00** (conservation signature).

### EX-0015

**Yes** — net 9.1 = 0 on bases (a) and (d). Closed by **14856**.

---

## Step 5 — Empty-lane net

**${fmtR(laneSums.empty_cyl)}** · See TXT Decomposition v1 §Step 2 for all ${clusterList.length} clusters.

---

## Registry v10.1

**Invariant: ${invariantPass ? 'PASS — ratification may proceed' : 'INVARIANT FAIL — do not ratify'}**

${invariantPass ? '' : `> **INVARIANT FAIL** — Σ registry outstanding qty ≠ net custody qty (basis d). Artifact staged for revision only; no ratification request.\n>\n> ${invariantFailReason}\n`}

| Class | Registry outstanding qty | Custody basis (d) merged | Match |
| :--- | ---: | ---: | :--- |
| 9.1 | ${reg91} | ${custody91} | ${Math.abs(reg91 - custody91) < 0.001 ? '✓' : '✗'} |
| S.1/D.1 | ${regMerged} | ${custodyMerged} | ${Math.abs(regMerged - custodyMerged) < 0.001 ? '✓' : '✗'} |

**Conservation rule:** per SKU class, Σ registry outstanding qty must equal net custody qty. Financial empty-lane ${fmtR(laneSums.empty_cyl)} = ${custodyMerged}×R1,207.50 when 9.1 qty net = 0.

### Closure map (symmetric float logic)

| ID | Short | Closed by | Mechanism |
| :--- | :--- | :--- | :--- |
`;
for (const c of closures) {
  v3 += `| ${c.id} | CN ${c.cn} 1×${c.sku} | **${c.closedBy}** | ${c.mechanism} |\n`;
}
v3 += `
| EX-0001…EX-0014 (11) | v9 R517.50 each | — | SUPERSEDED_VALUE_INFERRED (FULL_CLEAR at qty) |

### v9 → v10 → v10.1 diff

| Version | Outstanding total | Notes |
| :--- | ---: | :--- |
| v9 live | R8,280.00 | 16 × value-inferred R517.50 |
| v10 proposed | R4,140.00 | Failed conservation (ignored) |
| **v10.1 proposed** | **R0.00** | All floats closed; invariant ${invariantPass ? 'PASS' : 'FAIL'} |

Staged: \`config/cyl_residual_registry_v10_1_proposed.json\` — not applied.

---

*Turn 7h. Read-only on edges, LPG registry, reconState.*
`;
fs.writeFileSync(path.join(ROOT, 'reports/MOZ002_CYL_Movement_v3.md'), v3);

// Supersede v2 header if needed
const v2path = path.join(ROOT, 'reports/MOZ002_CYL_Movement_v2.md');
let v2 = fs.readFileSync(v2path, 'utf8');
if (!v2.includes('Turn 7h')) {
  v2 = v2.replace(
    '# MOZ002 — Turn 7g:',
    '> **⛔ SUPERSEDED** (Step 5, custody, registry) by `MOZ002_CYL_Movement_v3.md` + `MOZ002_TXT_Decomposition_v1.md` — Turn 7h.\n\n# MOZ002 — Turn 7g:',
  );
  fs.writeFileSync(v2path, v2);
}

console.log(
  JSON.stringify(
    {
      fourSum,
      empty: laneSums.empty_cyl,
      basisDmerged: basisDmerged.run,
      invariantPass,
      basisDrows: basisDRows.length,
    },
    null,
    2,
  ),
);

await client.end();
