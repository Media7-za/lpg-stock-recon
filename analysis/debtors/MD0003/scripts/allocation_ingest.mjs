#!/usr/bin/env node
/**
 * MD0003 Payment-to-Invoice Allocation (SKILL_Payment_To_Invoice_Allocation.md)
 * LPG-only match, open-balance at payment date, skill §8 report.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const ACCOUNT = 'MD0003';
const FROM = '2025-01-01';
const TO = '2026-07-16';
const ERP_STATED_BALANCE = 12005.45;
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

const lineRows = await q(
  `
  SELECT LTRIM(doc_no,'0') AS doc_no,
    MIN(tx_date) AS date,
    ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='LPG'),0)::numeric,2)::float AS lpg,
    ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='CYL'),0)::numeric,2)::float AS cyl,
    ROUND(COALESCE(SUM(line_total),0)::numeric,2)::float AS line_total
  FROM vw_clean_transactions
  WHERE account_no=$1 AND entry_type='Invoice'
  GROUP BY LTRIM(doc_no,'0')
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
  matchAmount: i.lpg > 0 ? i.lpg : 0,
}));
const invByDoc = new Map(invoices.map((i) => [i.docNo, i]));

const cnRows = await q(
  `
  SELECT LTRIM(h.doc_no,'0') AS doc_no, h.tx_date AS date, LTRIM(h.ref_no,'0') AS ref_no,
    ROUND(COALESCE(SUM(v.line_total) FILTER (WHERE v.debt_group='LPG'),0)::numeric,2)::float AS lpg_amt,
    ROUND(COALESCE(SUM(v.line_total),0)::numeric,2)::float AS total_amt
  FROM transaction_headers h
  LEFT JOIN vw_clean_transactions v
    ON v.account_no=h.account_no AND v.entry_type='Crd Note' AND LTRIM(v.doc_no,'0')=LTRIM(h.doc_no,'0')
  WHERE h.account_no=$1 AND h.entry_type='Crd Note' AND h.ref_no NOT IN ('','Alloc','Recon')
  GROUP BY h.doc_no, h.tx_date, h.ref_no
  ORDER BY h.tx_date
  `,
  [ACCOUNT],
);

const cnOffsets = [];
const openBalances = {};
for (const inv of invoices) {
  if (inv.matchAmount > 0) openBalances[inv.docNo] = inv.matchAmount;
}
for (const cn of cnRows) {
  const inv = invByDoc.get(cn.ref_no);
  if (!inv) continue;
  const cnLpg = cn.lpg_amt > 0 ? cn.lpg_amt : Math.abs(cn.total_amt);
  if (openBalances[cn.ref_no] !== undefined) {
    openBalances[cn.ref_no] = round2(openBalances[cn.ref_no] - cnLpg);
    cnOffsets.push({ cnDoc: cn.doc_no, cnDate: fmtD(cn.date), refInvoice: cn.ref_no, cnAmount: -cnLpg, effect: `Net open → ${fmtR(openBalances[cn.ref_no])}` });
    if (Math.abs(openBalances[cn.ref_no]) <= TOL) delete openBalances[cn.ref_no];
  }
}

const pmtRows = await q(
  `
  SELECT LTRIM(doc_no,'0') AS doc_no, tx_date AS date, batch_ref,
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
    pmtDocs.set(r.doc_no, {
      docNo: r.doc_no,
      date: new Date(r.date),
      dateStr: fmtD(r.date),
      batchRef: r.batch_ref || '',
      slices: [],
    });
  }
  const p = pmtDocs.get(r.doc_no);
  if (r.ref_no !== 'Alloc') {
    p.slices.push({ refNo: r.ref_no, amount: r.slice_amt });
  }
  if (r.batch_ref) p.batchRef = r.batch_ref;
}

for (const p of pmtDocs.values()) {
  const sliceMap = new Map();
  for (const s of p.slices) {
    const key = s.refNo || '__blank__';
    const prev = sliceMap.get(key);
    if (!prev) sliceMap.set(key, { refNo: s.refNo, amount: s.amount });
    else if (Math.abs(prev.amount - s.amount) <= 0.01) {
      /* duplicate row */
    } else {
      sliceMap.set(key, { refNo: s.refNo, amount: round2(prev.amount + s.amount) });
    }
  }
  p.slices = [...sliceMap.values()].filter((s) => s.amount > 0.0001);
  p.total = round2(p.slices.reduce((s, x) => s + x.amount, 0));
}

const payments = [...pmtDocs.values()].filter((p) => p.total > 0.0001);

function openAtPayment(docNo, payDate, paidSoFar) {
  const inv = invByDoc.get(docNo);
  if (!inv || inv.matchAmount <= 0) return 0;
  if (inv.date > payDate) return 0;
  const prior = paidSoFar.get(docNo) ?? 0;
  const base = openBalances[docNo] ?? inv.matchAmount;
  return round2(Math.max(0, base - prior));
}

const paidSoFar = new Map();

function matchRef(p, slice) {
  const { refNo, amount } = slice;
  if (!refNo) return null;
  const inv = invByDoc.get(refNo);
  if (!inv) {
    return { targetDoc: refNo, targetDate: '', targetAmt: 0, allocated: 0, status: 'UNALLOCATED', review: true, tier: 5, notes: 'ref_no points to missing invoice' };
  }
  if (NO_CYL_PAYMENT_ALLOCATION && inv.lpg === 0 && inv.cyl > 0) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: 0, allocated: 0, status: 'REVIEW_CYL_REF', review: true, tier: 5, notes: 'CYL-only ref — no LPG settlement' };
  }
  if (p.date < inv.date) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: 0, status: 'UNALLOCATED', review: true, tier: 5, notes: 'Prepayment / DN-lag — payment before invoice date' };
  }
  const open = openAtPayment(refNo, p.date, paidSoFar);
  if (open <= TOL) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: 0, status: 'REVIEW_CLOSED_EVENT', review: true, tier: 5, variance: round2(amount - inv.lpg) };
  }
  if (Math.abs(amount - open) <= TOL) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: open, allocated: amount, status: 'OPEN_BALANCE_MATCH', review: false, tier: 1, evidence: 'EXPLICIT_ALLOCATION' };
  }
  if (Math.abs(amount - inv.lpg) <= TOL) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: amount, status: 'EXPLICIT_REF', review: false, tier: 1, evidence: 'EXPLICIT_ALLOCATION' };
  }
  if (amount < open - 1 && amount <= open + TOL) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: open, allocated: amount, status: 'OPEN_BALANCE_PARTIAL', review: true, tier: 1, variance: round2(open - amount) };
  }
  if (amount < inv.lpg && round2(inv.lpg - amount) <= 1.0 && round2(inv.lpg - amount) >= 0.06) {
    return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: amount, status: 'REVIEW_TRUNCATION', review: true, tier: 5, variance: round2(inv.lpg - amount) };
  }
  return { targetDoc: refNo, targetDate: inv.dateStr, targetAmt: inv.lpg, allocated: 0, status: 'REVIEW_REF_VARIANCE', review: true, tier: 5, variance: round2(amount - inv.lpg) };
}

function lagMatch(p, amount) {
  const candidates = invoices
    .filter((i) => i.matchAmount > 0 && i.date <= p.date)
    .sort((a, b) => b.date - a.date);

  for (const cand of candidates) {
    const open = openAtPayment(cand.docNo, p.date, paidSoFar);
    if (open <= TOL) continue;
    const lag = (p.date - cand.date) / 86400000;
    if (lag >= 3 && lag <= 14 && Math.abs(amount - open) <= 5.0) {
      return { targetDoc: cand.docNo, targetDate: cand.dateStr, targetAmt: open, allocated: amount, status: 'PROXIMITY_INFERENCE', review: true, tier: 4 };
    }
    if (lag >= 0 && lag <= 90 && Math.abs(amount - open) <= TOL) {
      return { targetDoc: cand.docNo, targetDate: cand.dateStr, targetAmt: open, allocated: amount, status: 'OPEN_BALANCE_MATCH', review: false, tier: 1 };
    }
  }

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = openAtPayment(candidates[i].docNo, p.date, paidSoFar);
      const b = openAtPayment(candidates[j].docNo, p.date, paidSoFar);
      if (a <= TOL || b <= TOL) continue;
      const sum = round2(a + b);
      if (Math.abs(amount - sum) <= 1.0) {
        return {
          split: true,
          status: 'COMBINATION_MATCH',
          review: false,
          tier: 2,
          targets: [
            { targetDoc: candidates[i].docNo, targetDate: candidates[i].dateStr, targetAmt: a, allocated: a },
            { targetDoc: candidates[j].docNo, targetDate: candidates[j].dateStr, targetAmt: b, allocated: b },
          ],
        };
      }
    }
  }
  return null;
}

function recordAllocation(row) {
  if (row.targetDoc && row.allocated > 0) {
    paidSoFar.set(row.targetDoc, round2((paidSoFar.get(row.targetDoc) ?? 0) + row.allocated));
  }
}

const allocations = [];

for (const p of payments.sort((a, b) => a.date - b.date)) {
  const hasRefSlices = p.slices.some((s) => s.refNo);

  if (hasRefSlices) {
    for (const slice of p.slices) {
      if (slice.refNo) {
        const m = matchRef(p, slice);
        allocations.push({
          paymentDoc: p.docNo,
          paymentDate: p.dateStr,
          batchRef: p.batchRef,
          paymentAmount: p.total,
          sliceAmount: slice.amount,
          segmentRef: slice.refNo,
          targetDoc: m.targetDoc,
          targetDate: m.targetDate,
          targetLane: 'LPG',
          targetAmount: m.targetAmt,
          allocated: m.allocated,
          variance: m.variance ?? round2(slice.amount - (m.allocated || 0)),
          allocationType: m.status,
          evidenceSource: m.evidence ?? (m.tier <= 2 ? 'OPEN_BALANCE_AT_PAYMENT' : 'ERP_LEDGER'),
          confidence: m.review ? (m.tier === 4 ? 'Probable' : 'Exception') : 'Confirmed',
          commerciallyConfirmed: false,
          reviewRequired: m.review,
          tier: m.tier,
          notes: m.notes ?? '',
        });
        if (!m.review && m.allocated > 0) recordAllocation(m);
      } else if (slice.amount <= 1.0) {
        allocations.push({
          paymentDoc: p.docNo,
          paymentDate: p.dateStr,
          batchRef: p.batchRef,
          paymentAmount: p.total,
          sliceAmount: slice.amount,
          segmentRef: '',
          targetDoc: '',
          targetDate: '',
          targetLane: 'LPG',
          targetAmount: 0,
          allocated: slice.amount,
          variance: 0,
          allocationType: 'ROUNDING_RESIDUAL',
          evidenceSource: 'EXPLICIT_ALLOCATION',
          confidence: 'Confirmed',
          commerciallyConfirmed: false,
          reviewRequired: false,
          tier: 1,
          notes: 'Micro-residual ≤R1 absorbed into payment doc group',
        });
      } else {
        allocations.push({
          paymentDoc: p.docNo,
          paymentDate: p.dateStr,
          batchRef: p.batchRef,
          paymentAmount: p.total,
          sliceAmount: slice.amount,
          segmentRef: '',
          targetDoc: '',
          targetDate: '',
          targetLane: 'LPG',
          targetAmount: 0,
          allocated: 0,
          variance: slice.amount,
          allocationType: 'UNALLOCATED',
          evidenceSource: 'ERP_LEDGER',
          confidence: 'Exception',
          commerciallyConfirmed: false,
          reviewRequired: true,
          tier: 5,
          notes: 'Material blank-ref slice on ref batch',
        });
      }
    }
    continue;
  }

  const m = lagMatch(p, p.total);
  if (m?.split) {
    for (const t of m.targets) {
      const row = {
        paymentDoc: p.docNo,
        paymentDate: p.dateStr,
        batchRef: p.batchRef,
        paymentAmount: p.total,
        sliceAmount: t.allocated,
        segmentRef: '',
        targetDoc: t.targetDoc,
        targetDate: t.targetDate,
        targetLane: 'LPG',
        targetAmount: t.targetAmt,
        allocated: t.allocated,
        variance: 0,
        allocationType: m.status,
        evidenceSource: 'EXPLICIT_ALLOCATION',
        confidence: 'Confirmed',
        commerciallyConfirmed: false,
        reviewRequired: false,
        tier: m.tier,
        notes: '',
      };
      allocations.push(row);
      recordAllocation(row);
    }
  } else if (m) {
    allocations.push({
      paymentDoc: p.docNo,
      paymentDate: p.dateStr,
      batchRef: p.batchRef,
      paymentAmount: p.total,
      sliceAmount: p.total,
      segmentRef: '',
      targetDoc: m.targetDoc,
      targetDate: m.targetDate,
      targetLane: 'LPG',
      targetAmount: m.targetAmt,
      allocated: m.allocated,
      variance: 0,
      allocationType: m.status,
      evidenceSource: m.tier === 4 ? 'PARTIAL_INVOICE_INFERENCE' : 'OPEN_BALANCE_AT_PAYMENT',
      confidence: m.review ? 'Probable' : 'Confirmed',
      commerciallyConfirmed: false,
      reviewRequired: m.review,
      tier: m.tier,
      notes: '',
    });
    if (!m.review) recordAllocation(m);
  } else {
    allocations.push({
      paymentDoc: p.docNo,
      paymentDate: p.dateStr,
      batchRef: p.batchRef,
      paymentAmount: p.total,
      sliceAmount: p.total,
      segmentRef: '',
      targetDoc: '',
      targetDate: '',
      targetLane: 'LPG',
      targetAmount: 0,
      allocated: 0,
      variance: p.total,
      allocationType: 'UNALLOCATED',
      evidenceSource: 'ERP_LEDGER',
      confidence: 'Exception',
      commerciallyConfirmed: false,
      reviewRequired: true,
      tier: 5,
      notes: 'No ref_no; open-balance and combination tiers exhausted',
    });
  }
}

const fromD = new Date(FROM);
const toD = new Date(TO);
let period = allocations.filter((a) => {
  const d = new Date(a.paymentDate);
  return d >= fromD && d <= toD;
});

for (const ov of overrideRegistry.overrides ?? []) {
  if (ov.approval_status !== 'approved') continue;
  const pmt = clean(ov.payment_doc);
  const tgt = clean(ov.target_doc ?? ov.target_invoice);
  period = period.filter((a) => !(a.paymentDoc === pmt && a.targetDoc === tgt));
  period.push({
    paymentDoc: pmt,
    paymentDate: ov.payment_date ?? ov.doc_date,
    batchRef: ov.batch_ref ?? '',
    paymentAmount: ov.allocated_amount ?? Math.abs(ov.amount),
    sliceAmount: ov.allocated_amount ?? Math.abs(ov.amount),
    segmentRef: tgt,
    targetDoc: tgt,
    targetDate: invByDoc.get(tgt)?.dateStr ?? '',
    targetLane: 'LPG',
    targetAmount: invByDoc.get(tgt)?.lpg ?? ov.allocated_amount,
    allocated: ov.allocated_amount ?? Math.abs(ov.amount),
    variance: 0,
    allocationType: ov.override_type ?? 'VERIFIED_EXPLICIT_REF',
    evidenceSource: ov.evidence_source ?? 'remittance_advice',
    confidence: 'Confirmed',
    commerciallyConfirmed: ov.evidence_source === 'remittance_advice',
    reviewRequired: false,
    tier: 1,
    notes: ov.reason ?? '',
  });
}

period.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate) || a.paymentDoc.localeCompare(b.paymentDoc));

const confirmed = period.filter((a) => a.confidence === 'Confirmed' && a.allocated > 0);
const tier12 = period.filter((a) => a.tier <= 2 && !a.reviewRequired);
const tier4 = period.filter((a) => a.tier === 4 || (a.reviewRequired && a.allocationType === 'PROXIMITY_INFERENCE'));
const tier5 = period.filter((a) => a.allocationType === 'UNALLOCATED' || (a.reviewRequired && a.tier === 5));
const uniquePmtDocs = new Set(period.map((a) => a.paymentDoc));

const confirmedAmt = round2(confirmed.reduce((s, a) => s + a.allocated, 0));
const unallocAmt = round2(tier5.reduce((s, a) => s + (a.sliceAmount || 0), 0));
const allocatedLpg = confirmedAmt;
const openLpgPost = round2(
  Object.entries(openBalances).reduce((s, [, v]) => s + Math.max(0, v), 0) -
    Object.entries(Object.fromEntries(paidSoFar)).reduce((s, [, v]) => s + v, 0),
);
const bridgeVariance = round2(ERP_STATED_BALANCE - (unallocAmt + Math.max(0, openLpgPost)));

const csvHeader =
  'allocation_id,payment_doc,payment_date,batch_ref,payment_amount,target_doc,target_date,target_lane,target_amount,allocated_amount,residual_after_allocation,allocation_type,evidence_source,confidence,commercially_confirmed,review_required,notes\n';

let idx = 1;
const csvRows = period.map((a) => {
  const residual = round2((a.sliceAmount || 0) - (a.allocated || 0));
  return [
    `AL-${String(idx++).padStart(4, '0')}`,
    a.paymentDoc,
    a.paymentDate,
    a.batchRef,
    a.paymentAmount,
    a.targetDoc,
    a.targetDate,
    a.targetLane,
    a.targetAmount,
    a.allocated,
    residual,
    a.allocationType,
    a.evidenceSource,
    a.confidence,
    a.commerciallyConfirmed ? 'true' : 'false',
    a.reviewRequired ? 'true' : 'false',
    `"${(a.notes || '').replace(/"/g, "'")}"`,
  ].join(',');
});

const dataDir = path.join(ROOT, `analysis/debtors/${ACCOUNT}/data`);
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'allocation_edges.csv'), csvHeader + csvRows.join('\n') + '\n');

const y2025 = period.filter((a) => a.paymentDate.startsWith('2025'));
const y2026 = period.filter((a) => a.paymentDate.startsWith('2026'));
function writeYear(rows, year) {
  let i = 1;
  const body = rows.map((a) => {
    const residual = round2((a.sliceAmount || 0) - (a.allocated || 0));
    return [
      `AL-${String(i++).padStart(4, '0')}`,
      a.paymentDoc,
      a.paymentDate,
      a.batchRef,
      a.paymentAmount,
      a.targetDoc,
      a.targetDate,
      a.targetLane,
      a.targetAmount,
      a.allocated,
      residual,
      a.allocationType,
      a.evidenceSource,
      a.confidence,
      a.commerciallyConfirmed ? 'true' : 'false',
      a.reviewRequired ? 'true' : 'false',
      `"${(a.notes || '').replace(/"/g, "'")}"`,
    ].join(',');
  });
  fs.writeFileSync(path.join(dataDir, `allocation_edges_${year}.csv`), csvHeader + body.join('\n') + '\n');
}
writeYear(y2025, '2025');
writeYear(y2026, '2026');

const report = [];
report.push(`# ${ACCOUNT} — Payment Allocation v1`);
report.push('');
report.push(`**Period:** ${FROM} → ${TO}`);
report.push('**Skill:** `SKILL_Payment_To_Invoice_Allocation.md`');
report.push('**Method:** LPG-only open balance at payment date + explicit ref_no cross-check');
report.push(`**Generated:** ${fmtD(new Date())}`);
report.push('');
report.push('---');
report.push('');
report.push('## 1. Executive Summary');
report.push('');
report.push('| Metric | Count | Amount |');
report.push('| :--- | ---: | ---: |');
report.push(`| Payment documents analysed | ${uniquePmtDocs.size} | — |`);
report.push(`| Tier 1 & 2 Confirmed | ${tier12.length} | ${fmtR(tier12.reduce((s, a) => s + a.allocated, 0))} |`);
report.push(`| Tier 4 Probable | ${tier4.length} | ${fmtR(tier4.reduce((s, a) => s + a.allocated, 0))} |`);
report.push(`| Tier 5 Unallocated / Review | ${tier5.length} | ${fmtR(unallocAmt)} |`);
report.push(`| ERP stated balance (portfolio) | — | ${fmtR(ERP_STATED_BALANCE)} |`);
report.push('');
report.push('---');
report.push('');
report.push('## 2. Confirmed Allocations (Tier 1 & 2)');
report.push('');
report.push('| Payment Doc | Date | STAT Ref | Segment Ref | Amount | Target Invoice | Inv Date | Match Target (LPG) | Variance | Type |');
report.push('| :--- | :--- | :--- | :--- | ---: | :--- | :--- | ---: | ---: | :--- |');
for (const a of tier12.filter((x) => x.targetDoc)) {
  report.push(
    `| ${a.paymentDoc} | ${a.paymentDate} | ${a.batchRef} | ${a.segmentRef || '—'} | ${fmtR(a.sliceAmount)} | ${a.targetDoc} | ${a.targetDate} | ${fmtR(a.targetAmount)} | ${fmtR(a.variance ?? 0)} | ${a.allocationType} |`,
  );
}
report.push('');
report.push('---');
report.push('');
report.push('## 3. Credit Note Offsets Applied');
report.push('');
report.push('| CN Doc | CN Date | Ref Invoice | CN Amount (LPG) | Effect on Open Balance |');
report.push('| :--- | :--- | :--- | ---: | :--- |');
const recentCn = cnOffsets.filter((c) => c.cnDate >= '2025-01-01').slice(-20);
for (const cn of recentCn) {
  report.push(`| ${cn.cnDoc} | ${cn.cnDate} | ${cn.refInvoice} | ${fmtR(cn.cnAmount)} | ${cn.effect} |`);
}
if (!recentCn.length) report.push('*No LPG credit note offsets in scope.*');
report.push('');
report.push('---');
report.push('');
report.push('## 4. Probable / Review Required (Tier 4)');
report.push('');
if (tier4.length) {
  report.push('| Payment Doc | Date | Amount | Candidate Invoice | Proximity Δ | Notes |');
  report.push('| :--- | :--- | ---: | :--- | ---: | :--- |');
  for (const a of tier4) {
    report.push(`| ${a.paymentDoc} | ${a.paymentDate} | ${fmtR(a.sliceAmount)} | ${a.targetDoc} | ${fmtR(a.variance ?? 0)} | ${a.allocationType} |`);
  }
} else {
  report.push('*No Tier 4 probable allocations.*');
}
report.push('');
report.push('---');
report.push('');
report.push('## 5. Unallocated Pool (Tier 5)');
report.push('');
report.push('| Payment Doc | Date | STAT Ref | Amount | Notes |');
report.push('| :--- | :--- | :--- | ---: | :--- |');
for (const a of tier5) {
  report.push(`| ${a.paymentDoc} | ${a.paymentDate} | ${a.batchRef} | ${fmtR(a.sliceAmount)} | ${a.notes || a.allocationType} |`);
}
const reviewOther = period.filter((a) => a.reviewRequired && !tier5.includes(a) && !tier4.includes(a));
if (reviewOther.length) {
  report.push('');
  report.push('### Other review items (truncation / ref variance / partial)');
  report.push('');
  report.push('| Payment Doc | Date | Segment Ref | Amount | Target | Variance | Type |');
  report.push('| :--- | :--- | :--- | ---: | :--- | ---: | :--- |');
  for (const a of reviewOther) {
    report.push(`| ${a.paymentDoc} | ${a.paymentDate} | ${a.segmentRef || '—'} | ${fmtR(a.sliceAmount)} | ${a.targetDoc} | ${fmtR(a.variance ?? 0)} | ${a.allocationType} |`);
  }
}
report.push('');
report.push('---');
report.push('');
report.push('## 6. Reconciliation Bridge');
report.push('');
report.push('| Component | Amount |');
report.push('| :--- | ---: |');
report.push(`| ERP stated balance | ${fmtR(ERP_STATED_BALANCE)} |`);
report.push(`| Sum allocated to LPG invoices (confirmed) | ${fmtR(allocatedLpg)} |`);
report.push(`| Sum unallocated payments (Tier 5) | ${fmtR(unallocAmt)} |`);
report.push(`| Open LPG invoices post-allocation (informational) | ${fmtR(Math.max(0, openLpgPost))} |`);
report.push(`| **Bridge variance** | **${fmtR(bridgeVariance)}** |`);
report.push('');
report.push('> Bridge is indicative until MD0003 CURRENT.TXT is ingested. Unallocated blank-ref batches require operator review before promotion.');
report.push('');
report.push('---');
report.push('');
report.push('## 7. Artifacts');
report.push('');
report.push('| File | Rows |');
report.push('| :--- | ---: |');
report.push(`| \`data/allocation_edges.csv\` | ${period.length} |`);
report.push(`| \`data/allocation_edges_2025.csv\` | ${y2025.length} |`);
report.push(`| \`data/allocation_edges_2026.csv\` | ${y2026.length} |`);
report.push('');
report.push('*Generated by `scripts/allocation_ingest.mjs` per SKILL_Payment_To_Invoice_Allocation.md*');

const reportPath = path.join(ROOT, `analysis/debtors/${ACCOUNT}/reports/${ACCOUNT}_Payment_Allocation_v1.md`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, report.join('\n'));

console.log(
  JSON.stringify(
    {
      paymentDocs: uniquePmtDocs.size,
      edges: period.length,
      confirmed: tier12.length,
      confirmedAmt,
      tier4: tier4.length,
      tier5: tier5.length,
      unallocAmt,
      y2025: y2025.length,
      y2026: y2026.length,
    },
    null,
    2,
  ),
);

await client.end();
