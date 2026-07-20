#!/usr/bin/env node
/**
 * DN-pair reconciler — groups LPG + EMPTY + CN by delivery note reference.
 * Flags CN lag > 1d, CN amount ≠ EMPTY, missing pairs, multi-LPG same DN.
 *
 * Usage:
 *   node dn_pair_reconcile.mjs --debtor WO0001 --from 2026-06-01 --to 2026-06-30
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ACCOUNT = arg('--debtor', 'WO0001');
const FROM = arg('--from', '2026-06-01');
const TO = arg('--to', '2026-06-30');
const monthLabel = FROM.slice(0, 7);
const OUT =
  arg('--out', '') ||
  path.join(ROOT, `analysis/debtors/${ACCOUNT}/reports/${ACCOUNT}_DN_Pair_Recon_${monthLabel}.md`);
const STMT_PATH = path.join(ROOT, `analysis/debtors/${ACCOUNT}/reports/WO001CURRENT.TXT`);

const CN_LAG_OK_DAYS = 1;
const AMT_TOL = 1.0;

const client = new pg.Client(pgClientOptions());

const fmtR = (n) =>
  'R' + (Math.round(Math.abs(n) * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const fmtD = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);
const q = async (sql, p = []) => (await client.query(sql, p)).rows;

const EMPTY_RE = /EMPTY|EMPTIES/i;
const DN_RE = /DN[#\-]?(\d+)/i;

function parseDn(desc) {
  if (!desc) return null;
  const m = desc.match(DN_RE);
  if (!m) return null;
  return { dnId: m[1], isEmpty: EMPTY_RE.test(desc), raw: desc.trim() };
}

function findLpgForCn(cn, lpgList) {
  const byRef = lpgList.find((l) => l.doc === cn.refNo?.replace(/^0+/, ''));
  if (byRef) return byRef;
  return lpgList.find(
    (l) => fmtD(cn.date) === fmtD(l.date) && Math.abs(Math.abs(cn.amount) - l.amount) <= AMT_TOL,
  );
}

/** MULTIPLE_LPG + LPG correction CN + EMPTY net ≈ R0 → OK (e.g. DN#22655). */
function isCleanLpgCorrection(g, emptyNet) {
  if (g.lpg.length < 2) return false;
  if (Math.abs(emptyNet) > AMT_TOL) return false;

  const lpgCns = g.cn.filter((c) => !c.isEmpty && !EMPTY_RE.test(c.description));
  if (lpgCns.length === 0) return false;

  const matched = new Set();
  for (const cn of lpgCns) {
    const target = findLpgForCn(cn, g.lpg);
    if (!target) return false;
    if (Math.abs(Math.abs(cn.amount) - target.amount) > AMT_TOL) return false;
    matched.add(target.doc);
  }
  return g.lpg.some((l) => !matched.has(l.doc));
}

function signedTotal(entryType, lpg, cyl, headerTotal) {
  const t = Math.round((lpg + cyl !== 0 ? lpg + cyl : headerTotal) * 100) / 100;
  return entryType === 'Crd Note' ? -Math.abs(t) : t;
}

function parseStatementRows(fromD, toD) {
  if (!fs.existsSync(STMT_PATH)) return [];
  const out = [];
  for (const line of fs.readFileSync(STMT_PATH, 'utf8').split('\n')) {
    const m = line.match(
      /^"[^"]*","[^"]*","([^"]*)","(Invoice|Crd Note)","(\d{2})\/(\d{2})\/(\d{4})","[^"]*","([^"]*)","[^"]*","[^"]*","(-?\d+\.?\d*)"/,
    );
    if (!m) continue;
    const [, docRaw, entryType, dd, mm, yyyy, desc, amtStr] = m;
    const iso = `${yyyy}-${mm}-${dd}`;
    if (iso < fromD || iso > toD) continue;
    if (!parseDn(desc)) continue;
    const doc = docRaw.replace(/^0+/, '') || docRaw;
    const amt = parseFloat(amtStr);
    const dn = parseDn(desc);
    const isEmpty = dn.isEmpty;
    const isLpg = entryType === 'Invoice' && !isEmpty;
    out.push({
      doc,
      entryType,
      date: new Date(iso),
      refNo: doc,
      description: desc,
      dnId: dn.dnId,
      isEmpty,
      lane: entryType === 'Crd Note' ? 'CN' : isEmpty ? 'EMPTY' : isLpg ? 'LPG' : 'OTHER',
      amount: amt,
      source: 'statement',
    });
  }
  return out;
}

function buildClusters(docs) {
  const byDn = new Map();
  for (const d of docs) {
    if (!d.dnId) continue;
    if (!byDn.has(d.dnId)) {
      byDn.set(d.dnId, { dnId: d.dnId, lpg: [], empty: [], cn: [], other: [] });
    }
    const g = byDn.get(d.dnId);
    if (d.lane === 'LPG') g.lpg.push(d);
    else if (d.lane === 'EMPTY') g.empty.push(d);
    else if (d.lane === 'CN') g.cn.push(d);
    else g.other.push(d);
  }

  const docIndex = new Map(docs.map((d) => [d.doc, d]));
  const clusters = [];

  for (const g of byDn.values()) {
    const flags = [];
    const notes = [];

    if (g.lpg.length === 0 && g.empty.length > 0) flags.push('MISSING_LPG');
    if (g.empty.length === 0 && g.lpg.length > 0) flags.push('MISSING_EMPTY');
    if (g.empty.length > 0 && g.cn.length === 0) flags.push('MISSING_CN');
    if (g.lpg.length > 1) {
      flags.push('MULTIPLE_LPG');
      notes.push(`${g.lpg.length} LPG invoices share DN#${g.dnId}`);
    }
    if (g.empty.length > 1) flags.push('MULTIPLE_EMPTY');

    for (const cn of g.cn) {
      const targetsEmpty = cn.isEmpty || EMPTY_RE.test(cn.description);
      const refDoc = docIndex.get(cn.refNo?.replace(/^0+/, ''));
      if (refDoc && refDoc.lane === 'LPG' && !targetsEmpty) {
        flags.push('CN_ON_LPG');
        notes.push(`CN ${cn.doc} ref→LPG inv ${cn.refNo} (expected EMPTY)`);
      }

      const emptyTarget =
        g.empty.find((e) => e.doc === cn.refNo?.replace(/^0+/, '')) ||
        g.empty.find((e) => EMPTY_RE.test(cn.description)) ||
        g.empty[0];

      if (emptyTarget && targetsEmpty) {
        const lag = dayDiff(cn.date, emptyTarget.date);
        if (lag > CN_LAG_OK_DAYS) {
          flags.push('CN_LAG');
          notes.push(`CN ${cn.doc} +${lag}d after EMPTY ${emptyTarget.doc}`);
        }
        const delta = Math.round((Math.abs(cn.amount) - emptyTarget.amount) * 100) / 100;
        if (Math.abs(delta) > AMT_TOL) {
          flags.push('CN_AMOUNT_MISMATCH');
          notes.push(`CN ${fmtR(Math.abs(cn.amount))} vs EMPTY ${fmtR(emptyTarget.amount)} (Δ${fmtR(delta)})`);
        }
      } else if (targetsEmpty && g.empty.length === 0) {
        flags.push('CN_ORPHAN_EMPTY');
      }
    }

    for (const cn of g.cn.filter((c) => !c.isEmpty && !EMPTY_RE.test(c.description))) {
      const lpgTarget = findLpgForCn(cn, g.lpg);
      if (lpgTarget) {
        flags.push('LPG_CORRECTION_CN');
        notes.push(`CN ${cn.doc} reverses LPG ${lpgTarget.doc} ${fmtR(Math.abs(cn.amount))}`);
      }
    }

    const lpgTotal = Math.round(g.lpg.reduce((s, x) => s + x.amount, 0) * 100) / 100;
    const emptyNet =
      Math.round(g.empty.reduce((s, x) => s + x.amount, 0) * 100) / 100 +
      Math.round(
        g.cn.filter((c) => c.isEmpty || EMPTY_RE.test(c.description)).reduce((s, x) => s + x.amount, 0) * 100,
      ) / 100;

    const reviewFlags = [...new Set(flags)];
    if (isCleanLpgCorrection(g, emptyNet)) {
      const voided = g.cn
        .filter((c) => !c.isEmpty && !EMPTY_RE.test(c.description))
        .map((c) => findLpgForCn(c, g.lpg)?.doc)
        .filter(Boolean);
      const replacement = g.lpg.filter((l) => !voided.includes(l.doc)).map((l) => l.doc);
      notes.push(
        `Clean LPG correction: CN voids ${voided.join('/')}; replacement ${replacement.join('/')}; EMPTY net ${fmtR(emptyNet)}`,
      );
      for (const f of ['MULTIPLE_LPG', 'LPG_CORRECTION_CN', 'CN_ON_LPG']) {
        const i = reviewFlags.indexOf(f);
        if (i >= 0) reviewFlags.splice(i, 1);
      }
    }

    clusters.push({
      dnId: g.dnId,
      lpg: g.lpg,
      empty: g.empty,
      cn: g.cn,
      lpgTotal,
      emptyNet,
      flags: reviewFlags,
      notes,
      sources: [...new Set([...g.lpg, ...g.empty, ...g.cn].map((x) => x.source || 'db'))],
      status:
        reviewFlags.length === 0
          ? 'OK'
          : reviewFlags.some((f) => f.startsWith('MISSING'))
            ? 'GAP'
            : 'REVIEW',
    });
  }

  clusters.sort((a, b) => {
    const da = a.lpg[0]?.date || a.empty[0]?.date || a.cn[0]?.date;
    const db = b.lpg[0]?.date || b.empty[0]?.date || b.cn[0]?.date;
    return new Date(da) - new Date(db);
  });
  return clusters;
}

await client.connect();

const dbRows = await q(
  `
  SELECT LTRIM(h.doc_no,'0') as doc, h.entry_type, h.tx_date, LTRIM(h.ref_no,'0') as ref_no,
    h.description,
    ROUND(COALESCE(SUM(v.line_total) FILTER (WHERE v.debt_group='LPG'),0)::numeric,2)::float as lpg,
    ROUND(COALESCE(SUM(v.line_total) FILTER (WHERE v.debt_group='CYL'),0)::numeric,2)::float as cyl,
    ROUND(h.amount_excl::numeric,2)::float as hdr
  FROM transaction_headers h
  LEFT JOIN vw_clean_transactions v
    ON v.account_no = h.account_no AND LTRIM(v.doc_no,'0') = LTRIM(h.doc_no,'0') AND v.entry_type = h.entry_type
  WHERE h.account_no = $1
    AND h.tx_date >= $2::date AND h.tx_date <= $3::date
    AND h.entry_type IN ('Invoice', 'Crd Note')
  GROUP BY h.doc_no, h.entry_type, h.tx_date, h.ref_no, h.description, h.amount_excl
  ORDER BY h.tx_date, h.doc_no
`,
  [ACCOUNT, FROM, TO],
);

const dbDocs = dbRows.map((r) => {
  const dn = parseDn(r.description);
  const isEmpty = dn?.isEmpty || (r.cyl !== 0 && r.lpg === 0 && r.entry_type === 'Invoice');
  const isLpg = r.entry_type === 'Invoice' && r.lpg > 0 && !isEmpty;
  return {
    doc: r.doc,
    entryType: r.entry_type,
    date: r.tx_date,
    refNo: r.ref_no,
    description: r.description || '',
    dnId: dn?.dnId || null,
    isEmpty,
    lane: r.entry_type === 'Crd Note' ? 'CN' : isEmpty ? 'EMPTY' : isLpg ? 'LPG' : 'OTHER',
    lpg: r.lpg,
    cyl: r.cyl,
    amount: signedTotal(r.entry_type, r.lpg, r.cyl, r.hdr),
    source: 'db',
  };
});

const stmtDocs = parseStatementRows(FROM, TO);
const dbDocSet = new Set(dbDocs.map((d) => `${d.doc}|${d.entryType}`));
const mergedDocs = [
  ...dbDocs,
  ...stmtDocs.filter((s) => !dbDocSet.has(`${s.doc}|${s.entryType}`)),
];

const clusters = buildClusters(mergedDocs);
const ok = clusters.filter((c) => c.status === 'OK');
const review = clusters.filter((c) => c.status === 'REVIEW');
const gap = clusters.filter((c) => c.status === 'GAP');
const stmtOnly = clusters.filter((c) => c.sources.includes('statement') && !c.sources.includes('db'));

const md = `# ${ACCOUNT} — DN-Pair Reconciliation (${monthLabel})

**Period:** ${FROM} → ${TO}  
**Method:** Group by delivery note (DN#) · LPG + EMPTY + CN · flag lag > ${CN_LAG_OK_DAYS}d and amount mismatch > ${fmtR(AMT_TOL)}

## Summary

| Metric | Count |
| :--- | ---: |
| DN clusters | ${clusters.length} |
| OK | ${ok.length} |
| Review flags | ${review.length} |
| Missing-pair gaps | ${gap.length} |
| DB documents | ${dbDocs.length} |
| Statement-only supplements | ${stmtDocs.filter((s) => !dbDocSet.has(`${s.doc}|${s.entryType}`)).length} |
| Clusters statement-only (partial DB) | ${stmtOnly.length} |

${
  stmtDocs.length > dbDocs.length
    ? `> **Coverage:** Statement TXT includes June rows not yet in DB (e.g. DN#22655 on 22 Jun). Supplemented from \`WO001CURRENT.TXT\`.\n`
    : ''
}

## Clusters

${clusters
  .map((c) => {
    const src = c.sources.join(' + ');
    const lines = [];
    lines.push(`### DN#${c.dnId} — **${c.status}** · _${src}_${c.flags.length ? ` · \`${c.flags.join('`, `')}\`` : ''}`);
    lines.push('');
    lines.push(`| Lane | Doc | Date | Amount | Source | Description |`);
    lines.push(`| :--- | :--- | :--- | ---: | :--- | :--- |`);
    for (const x of [...c.lpg, ...c.empty, ...c.cn].sort((a, b) => new Date(a.date) - new Date(b.date))) {
      lines.push(
        `| ${x.lane} | ${x.doc} | ${fmtD(x.date)} | ${x.amount < 0 ? '-' : ''}${fmtR(Math.abs(x.amount))} | ${x.source || 'db'} | ${x.description} |`,
      );
    }
    lines.push('');
    lines.push(`- **LPG total (gas ledger):** ${fmtR(c.lpgTotal)}`);
    lines.push(`- **EMPTY net (deposit + CN):** ${fmtR(c.emptyNet)}`);
    if (c.notes.length) lines.push(`- **Notes:** ${c.notes.join('; ')}`);
    lines.push('');
    return lines.join('\n');
  })
  .join('\n')}

## Flag reference

| Flag | Meaning |
| :--- | :--- |
| \`MISSING_LPG\` | EMPTY/CN without gas invoice |
| \`MISSING_EMPTY\` | LPG without deposit invoice |
| \`MISSING_CN\` | EMPTY invoice, no credit note in period |
| \`CN_LAG\` | CN posted > ${CN_LAG_OK_DAYS}d after EMPTY |
| \`CN_AMOUNT_MISMATCH\` | CN amount ≠ EMPTY (±${fmtR(AMT_TOL)}) |
| \`MULTIPLE_LPG\` | >1 LPG invoice on same DN |
| \`CN_ON_LPG\` | CN ref/description hits LPG not EMPTY |
| \`LPG_CORRECTION_CN\` | CN reverses LPG (invoice correction) |
| \`LPG_CORRECTION_OK\` | Clean same-day correction: LPG CN voids one inv, replacement LPG remains, EMPTY net ≈ R0 (see notes) |

*Generated by \`dn_pair_reconcile.mjs\`*
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log('Written:', OUT);
console.log('Clusters:', clusters.length, '| OK:', ok.length, '| Review:', review.length, '| Gap:', gap.length);

await client.end();
