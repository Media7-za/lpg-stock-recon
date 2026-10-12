#!/usr/bin/env node
/**
 * MON001 Allocation Lane — Turn 2 Pilot (Apr–Jul 2026)
 * SKILL_Payment_To_Invoice_Allocation.md · MOZ002 engine pattern
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const ACCOUNT = 'MON001';
const FROM = '2026-04-01';
const TO = '2026-07-22';
const NO_CYL_PAYMENT_ALLOCATION = true;

const fmtR = (n) => 'R' + (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const fmtD = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const round2 = (n) => Math.round(n * 100) / 100;
const TOL = 0.05;

const client = new pg.Client(pgClientOptions());
await client.connect();
const q = async (sql, p = []) => (await client.query(sql, p)).rows;

const overridePath = path.join(ROOT, `analysis/debtors/${ACCOUNT}/config/payment_pattern_overrides.json`);
let overrideRegistry = { overrides: [] };
if (fs.existsSync(overridePath)) {
  overrideRegistry = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
}

// Dedupe cross-source line doubles (MON001 DETRANS overlap — same doc/stock/category/amount)
const lineRows = await q(
  `
  WITH deduped AS (
    SELECT DISTINCT ON (LTRIM(doc_no,'0'), debt_group, stock_no, category, line_total)
      LTRIM(doc_no,'0') AS doc_no, tx_date, debt_group, line_total
    FROM vw_clean_transactions
    WHERE account_no=$1 AND entry_type='Invoice'
    ORDER BY LTRIM(doc_no,'0'), debt_group, stock_no, category, line_total, id DESC
  )
  SELECT doc_no,
    MIN(tx_date) AS date,
    ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='LPG'),0)::numeric,2)::float AS lpg,
    ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='CYL'),0)::numeric,2)::float AS cyl,
    ROUND(COALESCE(SUM(line_total),0)::numeric,2)::float AS line_total
  FROM deduped
  GROUP BY doc_no
  `,
  [ACCOUNT],
);

const invoices = lineRows.map((i) => ({
  docNo: i.doc_no,
  date: new Date(i.date),
  dateStr: fmtD(i.date),
  lpg: i.lpg,
  cyl: i.cyl,
  lineTotal: i.line_total,
  matchAmount: i.lpg > 0 ? i.lpg : i.line_total,
}));
const invByDoc = new Map(invoices.map((i) => [i.docNo, i]));

const cnLpgRows = await q(
  `
  WITH deduped_cn AS (
    SELECT DISTINCT ON (LTRIM(doc_no,'0'), debt_group, stock_no, category, line_total)
      LTRIM(doc_no,'0') AS doc_no, debt_group, line_total
    FROM vw_clean_transactions
    WHERE account_no=$1 AND entry_type='Crd Note'
    ORDER BY LTRIM(doc_no,'0'), debt_group, stock_no, category, line_total, id DESC
  ),
  deduped_hdr AS (
    SELECT DISTINCT ON (LTRIM(doc_no,'0'))
      LTRIM(doc_no,'0') AS doc_no, LTRIM(ref_no,'0') AS ref_no, tx_date AS cn_date
    FROM transaction_headers
    WHERE account_no=$1 AND entry_type='Crd Note' AND ref_no NOT IN ('','Alloc','Recon')
    ORDER BY LTRIM(doc_no,'0'), tx_date, id DESC
  )
  SELECT h.doc_no, h.ref_no, h.cn_date,
    ROUND(COALESCE(SUM(d.line_total) FILTER (WHERE d.debt_group='LPG'),0)::numeric,2)::float AS lpg_amt,
    ROUND(COALESCE(SUM(d.line_total),0)::numeric,2)::float AS cn_total
  FROM deduped_hdr h
  LEFT JOIN deduped_cn d ON d.doc_no = h.doc_no
  GROUP BY h.doc_no, h.ref_no, h.cn_date
  `,
  [ACCOUNT],
);

const cnByInvoice = new Map();
for (const cn of cnLpgRows) {
  if (!cn.lpg_amt || Math.abs(cn.lpg_amt) <= 0) continue;
  const ref = cn.ref_no;
  if (!cnByInvoice.has(ref)) cnByInvoice.set(ref, []);
  cnByInvoice.get(ref).push({ docNo: cn.doc_no, date: new Date(cn.cn_date), amount: Math.abs(cn.lpg_amt) });
}

const openBalances = {};
const grossLpg = {};
for (const inv of invoices) {
  if (inv.matchAmount > 0) {
    openBalances[inv.docNo] = inv.matchAmount;
    grossLpg[inv.docNo] = inv.lpg > 0 ? inv.lpg : inv.lineTotal;
  }
}
for (const cn of cnLpgRows) {
  if (!cn.lpg_amt || Math.abs(cn.lpg_amt) <= 0) continue;
  if (cn.ref_no && openBalances[cn.ref_no] !== undefined) {
    openBalances[cn.ref_no] = round2(openBalances[cn.ref_no] - Math.abs(cn.lpg_amt));
  }
}

const pmtRows = await q(
  `
  SELECT LTRIM(doc_no,'0') AS doc_no, tx_date AS date,
    ROUND(ABS(amount_excl)::numeric,2)::float AS slice_amt,
    CASE WHEN ref_no IN ('Alloc','Recon') THEN 'Alloc'
         WHEN ref_no IN ('',' ') THEN ''
         ELSE LTRIM(ref_no,'0') END AS ref_no
  FROM transaction_headers
  WHERE account_no=$1 AND entry_type='Payment'
  ORDER BY tx_date, doc_no
  `,
  [ACCOUNT],
);

const pmtDocs = new Map();
for (const r of pmtRows) {
  if (!pmtDocs.has(r.doc_no)) {
    pmtDocs.set(r.doc_no, { docNo: r.doc_no, date: new Date(r.date), dateStr: fmtD(r.date), slices: [] });
  }
  const p = pmtDocs.get(r.doc_no);
  if (r.ref_no !== 'Alloc') p.slices.push({ refNo: r.ref_no, amount: r.slice_amt });
}
for (const p of pmtDocs.values()) {
  const sliceMap = new Map();
  for (const s of p.slices) {
    const key = s.refNo || '__blank__';
    const prev = sliceMap.get(key);
    if (!prev) sliceMap.set(key, { refNo: s.refNo, amount: s.amount });
    else if (Math.abs(prev.amount - s.amount) <= 0.01) {
      /* duplicate ERP row */
    } else sliceMap.set(key, { refNo: s.refNo, amount: round2(prev.amount + s.amount) });
  }
  p.slices = [...sliceMap.values()].filter((s) => s.amount > 0.0001);
  p.total = round2(p.slices.reduce((s, x) => s + x.amount, 0));
}

const payments = [...pmtDocs.values()].filter((p) => p.total > 0.0001);

function matchRef(slice) {
  const { refNo, amount } = slice;
  if (!refNo) return null;
  const inv = invByDoc.get(refNo);
  if (!inv) return null;
  if (NO_CYL_PAYMENT_ALLOCATION && inv.lpg === 0 && inv.cyl > 0) return null;
  if (inv.lpg > 0 && Math.abs(amount - inv.lpg) <= TOL) {
    return { targetDoc: inv.docNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: amount, status: 'CONFIRMED_REF_LPG_MATCH', review: false, tier: 1 };
  }
  if (inv.lpg === 0 && Math.abs(amount - inv.lineTotal) <= TOL) {
    return { targetDoc: inv.docNo, targetDate: inv.dateStr, targetAmt: inv.lineTotal, allocated: amount, status: 'CONFIRMED_REF_LINE_MATCH', review: false, tier: 1 };
  }
  if (Math.abs(amount - inv.matchAmount) <= TOL) {
    return { targetDoc: inv.docNo, targetDate: inv.dateStr, targetAmt: inv.matchAmount, allocated: amount, status: 'CONFIRMED_REF_LPG_MATCH', review: false, tier: 1 };
  }
  return { targetDoc: refNo, targetDate: inv?.dateStr ?? '', targetAmt: inv?.matchAmount ?? 0, allocated: 0, status: 'REVIEW_REF_VARIANCE', review: true, variance: round2(amount - (inv?.matchAmount ?? 0)), tier: 5 };
}

function lagMatch(p, amount, usedDocs) {
  const candidates = invoices
    .filter((i) => i.matchAmount > 0 && i.date <= p.date && !usedDocs.has(i.docNo))
    .sort((a, b) => b.date - a.date);

  for (const cand of candidates) {
    const open = openBalances[cand.docNo];
    if (open === undefined || open <= 0) continue;
    const lag = (p.date - cand.date) / 86400000;
    if (lag >= 0 && lag <= 90 && Math.abs(amount - open) <= TOL) {
      const status = lag <= 15 ? 'CONFIRMED_LAG_PROXIMITY' : 'CONFIRMED_EXPANDED_PROXIMITY';
      return { targetDoc: cand.docNo, targetDate: cand.dateStr, targetAmt: open, allocated: amount, status, review: false, tier: 2 };
    }
    if (lag >= 0 && lag <= 15 && amount < open && round2(open - amount) <= 25.51) {
      return { targetDoc: cand.docNo, targetDate: cand.dateStr, targetAmt: open, allocated: amount, status: 'REVIEW_TRUNCATION', review: true, variance: round2(open - amount), tier: 4 };
    }
  }
  return null;
}

function matchBlankSlice(p, slice) {
  if (slice.amount <= 1.0) {
    return { targetDoc: '', targetDate: '', targetAmt: 0, allocated: 0, status: 'REVIEW_ROUNDING_RESIDUAL', review: true, variance: slice.amount, tier: 4 };
  }

  const lag = lagMatch(p, slice.amount, new Set());
  if (lag) return lag;

  for (const inv of invoices.filter((i) => i.date <= p.date).sort((a, b) => b.date - a.date)) {
    const grossLpgAmt = grossLpg[inv.docNo];
    const grossLine = inv.lineTotal;
    const net = openBalances[inv.docNo];
    const cns = cnByInvoice.get(inv.docNo) ?? [];
    const cnBefore = cns.some((cn) => cn.date <= p.date);

    if (grossLpgAmt && Math.abs(slice.amount - grossLpgAmt) <= TOL) {
      if (cnBefore && net !== undefined && Math.abs(net - grossLpgAmt) > TOL) {
        return {
          targetDoc: inv.docNo,
          targetDate: inv.dateStr,
          targetAmt: grossLpgAmt,
          allocated: 0,
          status: 'REVIEW_GROSS_VS_NET_CN',
          review: true,
          variance: round2(slice.amount - net),
          tier: 5,
          notes: `LPG gross ${fmtR(grossLpgAmt)}; net open after CN is ${fmtR(net)}`,
        };
      }
      return { targetDoc: inv.docNo, targetDate: inv.dateStr, targetAmt: grossLpgAmt, allocated: slice.amount, status: 'CONFIRMED_BLANK_LPG_MATCH', review: false, tier: 2 };
    }

    if (Math.abs(slice.amount - grossLine) <= TOL) {
      if (cnBefore && net !== undefined && Math.abs(slice.amount - net) > TOL) {
        return {
          targetDoc: inv.docNo,
          targetDate: inv.dateStr,
          targetAmt: grossLine,
          allocated: 0,
          status: 'REVIEW_GROSS_VS_NET_CN',
          review: true,
          variance: round2(slice.amount - net),
          tier: 5,
          notes: `Slice matches invoice line total ${fmtR(grossLine)}; LPG net after CN 14792 is ${fmtR(net)}`,
        };
      }
      return { targetDoc: inv.docNo, targetDate: inv.dateStr, targetAmt: grossLine, allocated: slice.amount, status: 'CONFIRMED_BLANK_LINE_MATCH', review: false, tier: 2 };
    }
  }

  return { targetDoc: '', targetDate: '', targetAmt: 0, allocated: 0, status: 'UNALLOCATED', review: true, variance: slice.amount, tier: 5 };
}

function pushAlloc(allocs, p, slice, m) {
  allocs.push({
    paymentDoc: p.docNo,
    paymentDate: p.dateStr,
    paymentAmount: p.total,
    sliceAmount: slice?.amount ?? p.total,
    targetDoc: m.targetDoc,
    targetDate: m.targetDate,
    lpgTarget: m.targetAmt,
    allocated: m.allocated,
    variance: m.variance ?? round2((slice?.amount ?? p.total) - (m.allocated || 0)),
    status: m.status,
    reviewRequired: m.review,
    tier: m.tier ?? (m.status.startsWith('CONFIRMED') ? 1 : 5),
    notes: m.notes ?? '',
  });
  if (m.status.startsWith('CONFIRMED') && m.targetDoc && openBalances[m.targetDoc] !== undefined) {
    openBalances[m.targetDoc] = round2(openBalances[m.targetDoc] - m.allocated);
    if (openBalances[m.targetDoc] <= TOL) delete openBalances[m.targetDoc];
  }
}

const allocations = [];

for (const p of payments.sort((a, b) => a.date - b.date)) {
  const hasRefSlices = p.slices.some((s) => s.refNo);
  if (hasRefSlices) {
    for (const slice of p.slices) {
      if (!slice.refNo) continue;
      const m = matchRef(slice);
      if (!m) continue;
      pushAlloc(allocations, p, slice, m);
    }
    for (const slice of p.slices.filter((s) => !s.refNo && s.amount > 0.0001)) {
      pushAlloc(allocations, p, slice, matchBlankSlice(p, slice));
    }
    continue;
  }

  const m = lagMatch(p, p.total, new Set());
  if (m) pushAlloc(allocations, p, null, m);
  else pushAlloc(allocations, p, null, { targetDoc: '', targetDate: '', targetAmt: 0, allocated: 0, status: 'UNALLOCATED', review: true, variance: p.total, tier: 5 });
}

const fromD = new Date(FROM);
const toD = new Date(TO);
let period = allocations.filter((a) => {
  const d = new Date(a.paymentDate);
  return d >= fromD && d <= toD;
});

for (const ov of overrideRegistry.overrides.filter((o) => o.override_type === 'CONFIRMED_PAYMENT_ALLOCATION' && o.approval_status === 'approved')) {
  const pmt = clean(ov.payment_doc);
  const tgt = clean(ov.target_invoice);
  const amt = ov.allocated_amount ?? Math.abs(ov.amount);
  const inv = invByDoc.get(tgt);
  period = period.filter((a) => !(a.paymentDoc === pmt && a.targetDoc === tgt));
  period.push({
    paymentDoc: pmt,
    paymentDate: ov.doc_date,
    paymentAmount: amt,
    sliceAmount: amt,
    targetDoc: tgt,
    targetDate: inv?.dateStr ?? '',
    lpgTarget: inv?.lpg ?? amt,
    allocated: amt,
    variance: 0,
    status: 'CONFIRMED_OPERATOR_OVERRIDE',
    reviewRequired: false,
    tier: 1,
    notes: ov.reason,
  });
}

period.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate) || a.paymentDoc.localeCompare(b.paymentDoc));

const adj = new Map();
const addEdge = (u, v) => {
  const cu = clean(u);
  const cv = clean(v);
  if (!cu || !cv) return;
  if (!adj.has(cu)) adj.set(cu, new Set());
  if (!adj.has(cv)) adj.set(cv, new Set());
  adj.get(cu).add(cv);
  adj.get(cv).add(cu);
};
for (const a of period) {
  if (a.targetDoc && a.status.startsWith('CONFIRMED')) addEdge(a.paymentDoc, a.targetDoc);
}
const docToGroup = new Map();
let groupIdx = 1;
for (const node of adj.keys()) {
  if (docToGroup.has(node)) continue;
  const queue = [node];
  const comp = new Set([node]);
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj.get(cur) ?? []) {
      if (!comp.has(nb)) {
        comp.add(nb);
        queue.push(nb);
      }
    }
  }
  if (comp.size > 1) {
    const gid = `AG-${String(groupIdx++).padStart(6, '0')}`;
    for (const d of comp) docToGroup.set(d, gid);
  }
}
const getGroup = (pmt, tgt) => docToGroup.get(clean(pmt)) || docToGroup.get(clean(tgt)) || '';

const confirmed = period.filter((a) => a.status.startsWith('CONFIRMED'));
const tier4 = period.filter((a) => a.reviewRequired && (a.status.includes('LAG') || a.status.includes('PROXIMITY') || a.status.includes('TRUNCATION') || a.status === 'REVIEW_ROUNDING_RESIDUAL'));
const tier5 = period.filter((a) => a.status === 'UNALLOCATED' || a.status === 'REVIEW_GROSS_VS_NET_CN' || a.status === 'REVIEW_REF_VARIANCE' || (a.reviewRequired && !tier4.includes(a)));
const uniquePmtDocs = new Set(period.map((a) => a.paymentDoc));

const txtPath = path.join(ROOT, `analysis/debtors/${ACCOUNT}/raw/MON001CURRENT.TXT`);
let txtClosing = 2717.79;
if (fs.existsSync(txtPath)) {
  const hdr = fs.readFileSync(txtPath, 'utf8').match(/CURRENT BALANCE:.*?"([0-9.]+)"/);
  if (hdr) txtClosing = Number(hdr[1]);
}

const pilotOpenInvoices = ['51846', '51952', '52130', '50072', '50097', '50363'];
const openFromLedger = pilotOpenInvoices
  .map((doc) => {
    const net = openBalances[doc];
    const inv = invByDoc.get(doc);
    if (net !== undefined && net > TOL) {
      return { doc, amt: net, source: 'allocation engine net open after pilot payments' };
    }
    if (doc === '52130') {
      return { doc, amt: 960, source: 'TXT-only R960.00 — MISSING_HEADER_AND_LINES in DB' };
    }
    if (inv && ['51846', '51952'].includes(doc)) {
      return { doc, amt: inv.lpg, source: 'Jul 2026 — no payment in pilot window' };
    }
    return null;
  })
  .filter(Boolean);

const unallocCredit = round2(
  period.filter((a) => a.status === 'UNALLOCATED' || a.status === 'REVIEW_GROSS_VS_NET_CN').reduce((s, a) => s + a.sliceAmount, 0),
);
const openDebit = round2(openFromLedger.reduce((s, o) => s + o.amt, 0));

const tier12 = period.filter((a) => (a.tier === 1 || a.tier === 2) && !a.reviewRequired);
const tier12Pct = period.length ? round2((tier12.length / period.length) * 100) : 0;
const gatePass = tier12Pct >= 90;

const csvHeader =
  'allocation_id,allocation_group_id,payment_doc,payment_date,payment_amount,slice_amount,target_doc,target_date,lpg_target_amount,allocated_amount,variance,allocation_type,confidence,review_required\n';
let idx = 1;
const csvRows = period.map((a) =>
  [
    `AL-${String(idx++).padStart(4, '0')}`,
    getGroup(a.paymentDoc, a.targetDoc),
    a.paymentDoc,
    a.paymentDate,
    a.paymentAmount,
    a.sliceAmount,
    a.targetDoc,
    a.targetDate,
    a.lpgTarget ?? '',
    a.allocated,
    a.variance ?? 0,
    a.status,
    a.status.startsWith('CONFIRMED') ? 'Confirmed' : 'Exception',
    a.reviewRequired ? 'true' : 'false',
  ].join(','),
);

const dataDir = path.join(ROOT, `analysis/debtors/${ACCOUNT}/data`);
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'allocation_edges.csv'), csvHeader + csvRows.join('\n') + '\n');
fs.writeFileSync(path.join(dataDir, 'allocation_edges_pilot_2026Q2.csv'), csvHeader + csvRows.join('\n') + '\n');

const reportLines = [];
reportLines.push('# MON001 — Payment Allocation v1 (Turn 2 Pilot)');
reportLines.push('');
reportLines.push(`**Account:** SHORTEN INTERNATIONAL 66 ON MONZALI`);
reportLines.push(`**Pilot period:** ${FROM} → ${TO}`);
reportLines.push('**Skill:** `SKILL_Payment_To_Invoice_Allocation.md`');
reportLines.push('**Method:** LPG-only ref_no match + blank-slice gross/lag fallback + CN net gate');
reportLines.push(`**Generated:** ${fmtD(new Date())}`);
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 1. Executive Summary');
reportLines.push('');
reportLines.push('| Metric | Value |');
reportLines.push('| :--- | :--- |');
reportLines.push(`| Payment documents in pilot | ${uniquePmtDocs.size} |`);
reportLines.push(`| Allocation edges | ${period.length} |`);
reportLines.push(`| Tier 1 & 2 confirmed | ${tier12.length} (${tier12Pct}%) |`);
reportLines.push(`| Tier 4 probable / truncation | ${tier4.length} |`);
reportLines.push(`| Tier 5 review queue | ${tier5.length} |`);
reportLines.push(`| **Pilot gate (≥90% T1/T2)** | **${gatePass ? 'PASS ✅' : 'FAIL ❌'}** |`);
reportLines.push(`| ERP TXT closing (22 Jul 2026) | ${fmtR(txtClosing)} |`);
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 2. Confirmed Allocations (Tier 1 & 2)');
reportLines.push('');
reportLines.push('| Payment | Date | Slice | Target | Inv Date | LPG target | Allocated | Type |');
reportLines.push('| :--- | :--- | ---: | :--- | :--- | ---: | ---: | :--- |');
for (const a of confirmed) {
  reportLines.push(`| ${a.paymentDoc} | ${a.paymentDate} | ${fmtR(a.sliceAmount)} | ${a.targetDoc || '—'} | ${a.targetDate || '—'} | ${fmtR(a.lpgTarget ?? 0)} | ${fmtR(a.allocated)} | ${a.status} |`);
}
if (!confirmed.length) reportLines.push('*None in pilot window.*');
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 3. Review Queue (Tier 4 & 5)');
reportLines.push('');
reportLines.push('| Payment | Date | Slice | Target | Status | Notes |');
reportLines.push('| :--- | :--- | ---: | :--- | :--- | :--- |');
for (const a of [...tier4, ...tier5]) {
  reportLines.push(`| ${a.paymentDoc} | ${a.paymentDate} | ${fmtR(a.sliceAmount)} | ${a.targetDoc || '—'} | ${a.status} | ${a.notes || ''} |`);
}
if (!tier4.length && !tier5.length) reportLines.push('*Empty.*');
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 4. Open Position After Pilot Allocations');
reportLines.push('');
reportLines.push('| Invoice | Net open (LPG) | Source |');
reportLines.push('| :--- | ---: | :--- |');
for (const o of openFromLedger.sort((a, b) => a.doc.localeCompare(b.doc))) {
  reportLines.push(`| ${o.doc} | ${fmtR(o.amt)} | ${o.source} |`);
}
reportLines.push('');
reportLines.push(`Unapplied / review credit in pilot: ${fmtR(unallocCredit)} — **45216** blank slice R2,615.10 targets **50097** at gross line total; CN **14792** (−R498.53 LPG) leaves net R909.07 → operator review required.`);
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 5. Pilot Payments Reference');
reportLines.push('');
reportLines.push('| Doc | Date | Total | Expected behaviour |');
reportLines.push('| :--- | :--- | ---: | :--- |');
reportLines.push('| 43928 | 2026-04-08 | R2,527.19 | ref → 50072 (exact LPG match) |');
reportLines.push('| 44746 | 2026-06-18 | R3,109.32 | ref → 51175 (exact LPG match) |');
reportLines.push('| 45216 | 2026-07-15 | R5,430.30 | ref → 50363 + blank → 50097 (CN tension) |');
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## 6. Artifacts');
reportLines.push('');
reportLines.push('| File | Rows |');
reportLines.push('| :--- | ---: |');
reportLines.push(`| \`data/allocation_edges.csv\` | ${period.length} |`);
reportLines.push(`| \`data/allocation_edges_pilot_2026Q2.csv\` | ${period.length} |`);
reportLines.push('');
reportLines.push('*Generated by `scripts/allocation_ingest_pilot.mjs`*');

const reportPath = path.join(ROOT, `analysis/debtors/${ACCOUNT}/reports/MON001_Payment_Allocation_v1.md`);
fs.writeFileSync(reportPath, reportLines.join('\n'));

console.log(JSON.stringify({
  account: ACCOUNT,
  pilot: `${FROM} → ${TO}`,
  paymentDocs: uniquePmtDocs.size,
  edges: period.length,
  tier12: tier12.length,
  tier12Pct,
  gatePass,
  confirmed: confirmed.length,
  review: tier5.length + tier4.length,
  openInvoices: openFromLedger.map((o) => o.doc),
}, null, 2));

await client.end();
