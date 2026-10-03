#!/usr/bin/env node
/**
 * TWK002 — remittance-authoritative ledger restart (greenfield).
 *
 * Layer A: invoices + CNs from raw/TWK002_FULL_HISTORY.TXT (documents only).
 * Layer B: remittance line cash allocation (ignores ERP payment INVNO).
 * Layer C: Model B discount journals per batch (pro forma — not ERP Path B).
 *
 * Writes to analysis/debtors/TWK002/restart/ — does not touch live SOA.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_remit_ledger_restart.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTOR = 'TWK002';
const RAW = path.join(ROOT, `analysis/debtors/${DEBTOR}/raw`);
const DATA = path.join(ROOT, `analysis/debtors/${DEBTOR}/data`);
const OUT = path.join(ROOT, `analysis/debtors/${DEBTOR}/restart`);
const write = process.argv.includes('--write');

const TXT = path.join(RAW, 'TWK002_FULL_HISTORY.TXT');
const TOL = 0.05;
const TOL_PCT = 0.001;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const clean = (d) => {
  const s = String(d ?? '').trim();
  if (!s || /[^0-9]/.test(s.replace(/\//g, ''))) return s.replace(/^0+/, '') || s;
  return s.replace(/^0+/, '') || '0';
};
const fmtR = (n) => 'R' + round2(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const csvEsc = (v) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
};

const PAYMENT_TYPES = new Set(['Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep']);
const DOC_TYPES = new Set(['Invoice', 'Crd Note']);

/** ERP Path B catch-up journals — do not copy into remittance ledger. */
const PATH_B_DOCNOS = new Set([
  '334', '490', '491', '492', '493', '494', '495', '496', '499', '500', '501', '502',
  '503', '504', '505', '506', '507', '508', '509', '510', '511',
]);

function isPathBJournal(docno, ref) {
  const d = clean(docno);
  if (PATH_B_DOCNOS.has(d)) return true;
  const r = String(ref ?? '').toUpperCase();
  return (
    r.includes('DISCOUNT ALLOWED') ||
    r.includes('PAYMENT CORRECTION') ||
    r.includes('PAYMENT REDUCTION') ||
    r.includes('STAT 129') && d === '510'
  );
}

function parseFullHistory(absPath) {
  const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = {};
  for (const line of lines.slice(0, 15)) {
    const m = line.match(/^"([^"]+)","(.*)"$/);
    if (m) header[m[1].replace(/:$/, '')] = m[2];
  }
  const dataStart = lines.findIndex((l) => l.startsWith('"LINE"'));
  const rows = [];
  for (let i = dataStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('"') || line.includes('TOTAL TRANSACTIONS')) continue;
    const p = parseCsvLine(line);
    if (p[6] === 'BALANCE B/F:') {
      rows.push({
        kind: 'bf',
        iso: '2023-04-28',
        date: '28/04/2023',
        entry: 'Opening',
        docno: 'BF',
        invno: '',
        dn: '',
        ref: 'BALANCE B/F',
        amount: round2(p[9]),
        erpBalance: round2(p[10]),
      });
      continue;
    }
    if (!p[4]?.includes('/')) continue;
    rows.push({
      kind: 'txn',
      iso: parseTxtDate(p[4]),
      date: p[4],
      entry: p[3],
      docno: p[2]?.replace(/^0+/, '') || p[2],
      invno: p[5]?.replace(/^0+/, '') || '',
      dn: p[6] ?? '',
      ref: [p[6], p[8]].filter(Boolean).join(' · ') || '—',
      amount: round2(p[9]),
      erpBalance: round2(p[10]),
    });
  }
  return { header, rows };
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const hdr = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const parts = line.split(',');
    const row = {};
    hdr.forEach((h, i) => {
      row[h.trim()] = (parts[i] ?? '').trim();
    });
    return row;
  });
}

function loadManifests() {
  const batches = [];
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_manifest_${year}.json`);
    if (!fs.existsSync(p)) continue;
    const manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const b of manifest.batches ?? []) {
      batches.push({ ...b, manifestYear: year });
    }
  }
  return batches;
}

function loadRemittanceLines(debtorFilter = DEBTOR) {
  const byBatch = new Map();
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_lines_${year}.csv`);
    if (!fs.existsSync(p)) continue;
    for (const row of parseCsv(fs.readFileSync(p, 'utf8'))) {
      const bid = row.batch_id;
      const code = row.debtor_code?.trim();
      if (code && code !== debtorFilter) continue;
      if (!byBatch.has(bid)) byBatch.set(bid, []);
      byBatch.get(bid).push(row);
    }
  }
  return byBatch;
}

function parseDocDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  return s;
}

function buildRestart() {
  const { header, rows } = parseFullHistory(TXT);
  const erpHeaderBalance = round2(Number(header['CURRENT BALANCE']));

  // ── Layer A: document spine ──
  const spine = [];
  for (const r of rows) {
    if (r.kind === 'bf') {
      spine.push({
        docno: 'BF',
        entry: 'Opening',
        iso: r.iso,
        date: r.date,
        amount: r.amount,
        dn: '',
        ref: 'BALANCE B/F',
        in_spine: true,
      });
      continue;
    }
    if (!DOC_TYPES.has(r.entry)) continue;
    spine.push({
      docno: r.docno,
      entry: r.entry,
      iso: r.iso,
      date: r.date,
      amount: r.amount,
      dn: r.dn,
      ref: r.ref,
      invno_erp: r.invno,
      in_spine: true,
    });
  }

  // ── Cash pools (ERP receipts, no INVNO authority) ──
  const cashPools = [];
  for (const r of rows) {
    if (r.kind !== 'txn' || !PAYMENT_TYPES.has(r.entry)) continue;
    if (r.entry === 'Journal') continue;
    const statMatch = r.ref.match(/STAT[:\s]*(\d+)/i);
    cashPools.push({
      erp_doc: r.docno,
      erp_date: r.iso,
      erp_date_display: r.date,
      amount: r.amount,
      erp_gross: round2(Math.abs(r.amount)),
      stat: statMatch ? `STAT ${statMatch[1]}` : '',
      ref: r.ref,
      invno_erp: r.invno || '',
      allocation: '',
    });
  }

  // ── Layer B + C: remittance allocation ──
  const batches = loadManifests();
  const linesByBatch = loadRemittanceLines();
  const remittanceAlloc = [];
  const batchChecks = [];

  const sortedBatches = [...batches].sort((a, b) =>
    (a.electronic_paid_date ?? a.erp_payment_date ?? '').localeCompare(
      b.electronic_paid_date ?? b.erp_payment_date ?? '',
    ),
  );

  for (const batch of sortedBatches) {
    const batchId = batch.batch_id;
    const lines = linesByBatch.get(batchId) ?? [];
    const postDate = batch.electronic_paid_date ?? batch.erp_payment_date ?? '';
    const cashAmount = round2(batch.cash_amount ?? 0);
    const discountAmount = round2(batch.discount_amount ?? 0);
    const grossAmount = round2(batch.gross_payable ?? cashAmount + discountAmount);
    const twk002Split = batch.erp_payment_split?.find((s) => s.debtorCode === DEBTOR);
    const isMultiSite = Boolean(twk002Split);
    const twk002Cash = twk002Split ? round2(Math.abs(twk002Split.amount)) : cashAmount;
    const twk002Gross = isMultiSite ? twk002Cash : grossAmount;
    const twk002Discount = isMultiSite ? 0 : discountAmount;
    const erpDoc = clean(batch.erp_payment_doc ?? '');
    const erpPayment = cashPools.find((p) => p.erp_doc === erpDoc);

    let lineNetSum = 0;
    let lineSettleSum = 0;

    for (const line of lines) {
      const net = round2(line.net_amount);
      const disc = round2(line.discount_amount || 0);
      const orig = round2(line.original_amount || 0);
      const settle = round2(net + disc);
      lineNetSum = round2(lineNetSum + net);
      lineSettleSum = round2(lineSettleSum + settle);
      remittanceAlloc.push({
        batch_id: batchId,
        post_date: postDate,
        erp_receipt_doc: erpDoc,
        erp_stat: batch.erp_stat ?? '',
        line_type: line.line_type,
        target_doc: clean(line.doc_no),
        doc_date: parseDocDate(line.doc_date),
        original_amount: orig,
        net_amount: net,
        discount_amount: disc,
        settle_amount: settle,
        ledger_cash: round2(-net),
        notes: line.notes ?? '',
      });
    }

    const modelBOk =
      Math.abs(lineNetSum + twk002Discount - twk002Gross) <= Math.max(TOL, twk002Gross * TOL_PCT);
    const cashOk = Math.abs(lineNetSum - twk002Cash) <= Math.max(TOL, twk002Cash * TOL_PCT);
    const erpGross = erpPayment ? erpPayment.erp_gross : round2(Math.abs(batch.erp_payment_gross ?? 0));
    const erpOverpost = erpGross > grossAmount + TOL ? round2(erpGross - grossAmount) : 0;

    batchChecks.push({
      batch_id: batchId,
      post_date: postDate,
      erp_doc: erpDoc,
      erp_stat: batch.erp_stat ?? '',
      lines: lines.length,
      remittance_gross: twk002Gross,
      remittance_cash: twk002Cash,
      remittance_discount: twk002Discount,
      batch_gross_all_sites: grossAmount,
      batch_cash_all_sites: cashAmount,
      line_net_sum: lineNetSum,
      line_settle_sum: lineSettleSum,
      twk002_cash: twk002Cash,
      erp_gross: erpGross,
      erp_overpost: erpOverpost,
      model_b_ok: modelBOk,
      cash_ok: cashOk,
      multi_site: isMultiSite,
      status: !lines.length ? 'NO_LINES' : modelBOk && cashOk ? 'OK' : 'REVIEW',
    });

    if (lines.length && twk002Discount > 0) {
      remittanceAlloc.push({
        batch_id: batchId,
        post_date: postDate,
        erp_receipt_doc: erpDoc,
        erp_stat: batch.erp_stat ?? '',
        line_type: 'Discount Journal',
        target_doc: `DJ-${batchId}`,
        doc_date: postDate,
        original_amount: 0,
        net_amount: 0,
        discount_amount: round2(-twk002Discount),
        settle_amount: round2(-twk002Discount),
        ledger_cash: 0,
        notes: `Model B pro forma — Dr 240000 / Cr ${DEBTOR}`,
      });
    }

    if (erpOverpost > TOL) {
      remittanceAlloc.push({
        batch_id: batchId,
        post_date: postDate,
        erp_receipt_doc: erpDoc,
        erp_stat: batch.erp_stat ?? '',
        line_type: 'ERP_OVERPOST',
        target_doc: 'ERP_OVERPOST',
        doc_date: postDate,
        original_amount: 0,
        net_amount: 0,
        discount_amount: 0,
        settle_amount: round2(-erpOverpost),
        ledger_cash: round2(-erpOverpost),
        notes: `ERP gross ${fmtR(erpGross)} > remittance gross ${fmtR(grossAmount)} — not allocated to invoices`,
      });
    }
  }

  // Link cash pools to batches (reference only)
  for (const pool of cashPools) {
    const linked = batchChecks.find((b) => b.erp_doc === pool.erp_doc);
    pool.batch_id = linked?.batch_id ?? '';
    pool.remittance_gross = linked?.remittance_gross ?? '';
    pool.remittance_cash = linked?.remittance_cash ?? '';
    pool.erp_overpost = linked?.erp_overpost ?? 0;
  }

  // ── Build chronological ledger ──
  const events = [];

  for (const s of spine) {
    events.push({
      iso: s.iso,
      layer: 'A',
      entry: s.entry,
      docno: s.docno,
      target_doc: s.docno,
      amount: s.amount,
      batch_id: '',
      ref: s.ref,
    });
  }

  for (const a of remittanceAlloc) {
    if (a.line_type === 'ERP_OVERPOST') {
      events.push({
        iso: a.post_date,
        layer: 'B*',
        entry: 'ERP_OVERPOST',
        docno: a.erp_receipt_doc,
        target_doc: 'ERP_OVERPOST',
        amount: a.ledger_cash,
        batch_id: a.batch_id,
        ref: a.notes,
      });
      continue;
    }
    if (a.line_type === 'Discount Journal') {
      events.push({
        iso: a.post_date,
        layer: 'C',
        entry: 'Discount Journal',
        docno: a.target_doc,
        target_doc: a.target_doc,
        amount: a.discount_amount,
        batch_id: a.batch_id,
        ref: a.notes,
      });
      continue;
    }

    events.push({
      iso: a.post_date,
      layer: 'B',
      entry: 'Remit Cash',
      docno: a.erp_receipt_doc,
      target_doc: a.target_doc,
      amount: a.ledger_cash,
      batch_id: a.batch_id,
      ref: `${a.line_type} · ${a.erp_stat}`,
    });
  }

  events.sort((a, b) => {
    const d = (a.iso || '').localeCompare(b.iso || '');
    if (d !== 0) return d;
    const layerOrder = { A: 0, B: 1, 'B*': 2, C: 3 };
    return (layerOrder[a.layer] ?? 9) - (layerOrder[b.layer] ?? 9);
  });

  let running = 0;
  const ledger = [];
  for (const e of events) {
    running = round2(running + e.amount);
    ledger.push({ ...e, balance: running });
  }

  const remittanceClosing = running;

  // ── Per-doc open balances ──
  const docBalance = new Map();
  const docMeta = new Map();

  for (const s of spine) {
    if (s.docno === 'BF') continue;
    docBalance.set(s.docno, round2((docBalance.get(s.docno) ?? 0) + s.amount));
    docMeta.set(s.docno, {
      entry: s.entry,
      iso: s.iso,
      dn: s.dn,
      spine_amount: s.amount,
      invno_erp: s.invno_erp ?? '',
    });
  }

  // Spine CNs applied to linked invoices (invno_erp) — not payment tags.
  for (const s of spine) {
    if (s.entry !== 'Crd Note') continue;
    if (s.invno_erp) {
      const inv = clean(s.invno_erp);
      if (inv && inv !== s.docno && docMeta.has(inv)) {
        docBalance.set(inv, round2((docBalance.get(inv) ?? 0) + s.amount));
      }
      continue;
    }
    // DN-pairing fallback for CYL/empty CNs where TXT omits INVNO.
    const dn = String(s.dn ?? '').trim();
    if (!dn) continue;
    const candidates = [...docMeta.entries()].filter(
      ([, meta]) => meta.entry === 'Invoice' && String(meta.dn ?? '').trim() === dn,
    );
    if (!candidates.length) continue;
    const paired =
      candidates.find(([, meta]) => Math.abs(round2(meta.spine_amount + s.amount)) <= TOL) ??
      candidates[0];
    docBalance.set(paired[0], round2((docBalance.get(paired[0]) ?? 0) + s.amount));
  }

  for (const a of remittanceAlloc) {
    if (['Discount Journal', 'ERP_OVERPOST'].includes(a.line_type)) continue;
    if (a.target_doc.startsWith('STMT-')) continue;

    const key = a.target_doc;
    if (!docMeta.has(key)) {
      docMeta.set(key, { entry: a.line_type, iso: a.doc_date, dn: '', spine_amount: 0, invno_erp: '' });
      docBalance.set(key, 0);
    }
    docBalance.set(key, round2((docBalance.get(key) ?? 0) - a.settle_amount));
  }

  const remittanceTargets = new Set(
    remittanceAlloc
      .filter((a) => !['Discount Journal', 'ERP_OVERPOST'].includes(a.line_type))
      .map((a) => a.target_doc),
  );

  /** Spine CNs paired to an open invoice (invno_erp or DN+amount) — same pairing as remittance advice. */
  function pairedCnsForInvoice(invDocno) {
    const invMeta = docMeta.get(invDocno);
    const out = [];
    const seen = new Set();
    for (const s of spine) {
      if (s.entry !== 'Crd Note' || s.docno === 'BF') continue;
      let linked = false;
      if (s.invno_erp && clean(s.invno_erp) === invDocno) linked = true;
      else if (
        invMeta &&
        String(s.dn ?? '').trim() &&
        String(s.dn).trim() === String(invMeta.dn ?? '').trim()
      ) {
        linked = Math.abs(round2((invMeta.spine_amount ?? 0) + s.amount)) <= TOL;
      }
      if (!linked || seen.has(s.docno)) continue;
      seen.add(s.docno);
      out.push({
        docno: s.docno,
        amount: s.amount,
        doc_date: s.iso,
        dn: s.dn,
      });
    }
    out.sort((a, b) => a.doc_date.localeCompare(b.doc_date) || a.docno.localeCompare(b.docno));
    return out;
  }

  const openInvoices = [];
  const openBillLines = [];
  for (const [docno, bal] of docBalance) {
    if (bal <= TOL) continue;
    const m = docMeta.get(docno);
    if (m?.entry !== 'Invoice') continue;
    const pairedCns = pairedCnsForInvoice(docno);
    const cnAmount = round2(pairedCns.reduce((s, c) => s + c.amount, 0));
    const row = {
      docno,
      entry: 'Invoice',
      doc_date: m?.iso ?? '',
      dn: m?.dn ?? '',
      invoice_gross: m?.spine_amount ?? 0,
      cn_doc: pairedCns.map((c) => c.docno).join('+') || '',
      cn_amount: cnAmount,
      spine_amount: m?.spine_amount ?? 0,
      open_balance: bal,
      on_remittance: remittanceTargets.has(docno),
      note: remittanceTargets.has(docno) ? 'Remittance partial/unresolved' : '',
    };
    openInvoices.push(row);
    openBillLines.push({
      line_type: 'Invoice',
      docno,
      doc_date: row.doc_date,
      dn: row.dn,
      amount: row.invoice_gross,
      paired_invoice: '',
      due: bal,
    });
    for (const cn of pairedCns) {
      openBillLines.push({
        line_type: 'Crd Note',
        docno: cn.docno,
        doc_date: cn.doc_date,
        dn: cn.dn,
        amount: cn.amount,
        paired_invoice: docno,
        due: '',
      });
    }
  }
  openInvoices.sort((a, b) => a.doc_date.localeCompare(b.doc_date) || a.docno.localeCompare(b.docno));
  // openBillLines already built invoice-then-CN per pair — do not re-sort by docno.

  // ERP tie-out components
  let erpPathBJournals = 0;
  let erpPaymentsTotal = 0;
  let erpDocsTotal = 0;
  for (const r of rows) {
    if (r.kind === 'bf') continue;
    if (DOC_TYPES.has(r.entry)) erpDocsTotal = round2(erpDocsTotal + r.amount);
    if (PAYMENT_TYPES.has(r.entry)) erpPaymentsTotal = round2(erpPaymentsTotal + r.amount);
    if (r.entry === 'Journal' && isPathBJournal(r.docno, r.ref)) {
      erpPathBJournals = round2(erpPathBJournals + r.amount);
    }
  }

  const delta = round2(erpHeaderBalance - remittanceClosing);
  const openSum = round2(openInvoices.reduce((s, o) => s + o.open_balance, 0));

  return {
    header,
    erpHeaderBalance,
    remittanceClosing,
    delta,
    openSum,
    spine,
    cashPools,
    remittanceAlloc,
    batchChecks,
    ledger,
    openInvoices,
    openBillLines,
    erpPathBJournals,
    erpPaymentsTotal,
    stats: {
      spineRows: spine.length,
      cashPoolRows: cashPools.length,
      allocRows: remittanceAlloc.length,
      batchOk: batchChecks.filter((b) => b.status === 'OK').length,
      batchReview: batchChecks.filter((b) => b.status === 'REVIEW').length,
      ledgerRows: ledger.length,
    },
  };
}

function toCsv(rows, columns) {
  const hdr = columns.join(',');
  const body = rows.map((r) => columns.map((c) => csvEsc(r[c])).join(',')).join('\n');
  return hdr + '\n' + body + '\n';
}

function buildErpTieout(data) {
  const md = [];
  md.push('# TWK002 — Remittance ledger restart · ERP tie-out');
  md.push('');
  md.push('> **Greenfield restart** — remittance-authoritative. Ignores ERP payment INVNO, H-027, overrides, `allocation_edges.csv`.');
  md.push(`> Generated: ${new Date().toISOString().slice(0, 10)} · Source: \`raw/TWK002_FULL_HISTORY.TXT\``);
  md.push('');
  md.push('## Balances');
  md.push('');
  md.push('| Measure | Amount | Tag |');
  md.push('| :--- | ---: | :--- |');
  md.push(`| Remittance ledger closing | ${fmtR(data.remittanceClosing)} | **PROVEN** — \`restart/ledger.csv\` |`);
  md.push(`| ERP header (TXT) | ${fmtR(data.erpHeaderBalance)} | **PROVEN** — \`raw/TWK002_FULL_HISTORY.TXT\` |`);
  md.push(`| Delta (ERP − remittance) | ${fmtR(data.delta)} | **PROVEN** |`);
  md.push(`| Open invoices sum (restart) | ${fmtR(data.openSum)} | **PROVEN** — \`restart/open_invoices.csv\` |`);
  if (Math.abs(data.openSum - 18413.69) < 0.02) {
    md.push('');
    md.push('> Open sum **matches** live SOA Amount due R18,413.69 (inv 52484 + 52803 net of spine CNs 15443/15553).');
  }
  md.push('');
  md.push('## Expected delta drivers');
  md.push('');
  md.push('| Component | Amount | Tag |');
  md.push('| :--- | ---: | :--- |');
  md.push(`| ERP Path B journals (excluded from restart) | ${fmtR(data.erpPathBJournals)} | **PROVEN** — TXT Journal rows 00000334, 00000490–00000511 |`);
  const overpostTotal = round2(
    data.batchChecks.reduce((s, b) => s + (b.erp_overpost ?? 0), 0),
  );
  md.push(`| ERP over-post orphans (not on invoices) | ${fmtR(overpostTotal)} | **PROVEN** — batch register |`);
  md.push('');
  md.push('The delta is **ERP posting artefacts**, not TWK customer debt, when remittance batches tie Model B.');
  md.push('');
  md.push('## Batch Model B checks');
  md.push('');
  md.push('| Batch | Post date | STAT | Lines | Gross | Net Σ | Discount | Model B | Cash tie | Status |');
  md.push('| :--- | :--- | :--- | ---: | ---: | ---: | ---: | :---: | :---: | :--- |');
  for (const b of data.batchChecks) {
    md.push(
      `| ${b.batch_id} | ${b.post_date} | ${b.erp_stat} | ${b.lines} | ${fmtR(b.remittance_gross)} | ${fmtR(b.line_net_sum)} | ${fmtR(b.remittance_discount)} | ${b.model_b_ok ? '✓' : '✗'} | ${b.cash_ok ? '✓' : '✗'} | ${b.status}${b.multi_site ? ' (TWK002 slice)' : ''}${b.erp_overpost > 0 ? ` (+${fmtR(b.erp_overpost)} ERP)` : ''} |`,
    );
  }
  md.push('');
  md.push('## Open invoices (remittance bill)');
  md.push('');
  if (!data.openInvoices.length) {
    md.push('*No open invoices — all spine invoices settled by remittance advice.*');
  } else {
    md.push('TWK remittance advices list **invoices and credit notes** as separate lines; gross batch = Σ invoice + Σ CN.');
    md.push('');
    md.push('| Inv | Date | D/N | Invoice (R) | CN doc | CN (R) | **Due (R)** |');
    md.push('| :--- | :--- | :--- | ---: | :--- | ---: | ---: |');
    for (const o of data.openInvoices) {
      md.push(
        `| ${o.docno} | ${o.doc_date} | ${o.dn || '—'} | ${fmtR(o.invoice_gross)} | ${o.cn_doc || '—'} | ${o.cn_amount ? fmtR(o.cn_amount) : '—'} | ${fmtR(o.open_balance)} |`,
      );
    }
  }
  md.push('');
  md.push('---');
  md.push('');
  md.push('*Generated by `scripts/build_remit_ledger_restart.mjs`*');
  return md.join('\n');
}

const data = buildRestart();

console.log('TWK002 remittance ledger restart');
console.log(`  spine: ${data.stats.spineRows} docs`);
console.log(`  cash pools: ${data.stats.cashPoolRows} ERP receipts`);
console.log(`  remittance alloc: ${data.stats.allocRows} rows`);
console.log(`  batches: ${data.stats.batchOk} OK, ${data.stats.batchReview} REVIEW`);
console.log(`  remittance closing: ${fmtR(data.remittanceClosing)}`);
console.log(`  ERP header: ${fmtR(data.erpHeaderBalance)}`);
console.log(`  delta: ${fmtR(data.delta)}`);
console.log(`  open invoices: ${data.openInvoices.length} (${fmtR(data.openSum)})`);

if (write) {
  fs.mkdirSync(OUT, { recursive: true });

  fs.writeFileSync(
    path.join(OUT, 'raw_spine.csv'),
    toCsv(data.spine, ['docno', 'entry', 'iso', 'date', 'amount', 'dn', 'ref', 'invno_erp', 'in_spine']),
  );

  fs.writeFileSync(
    path.join(OUT, 'cash_pools.csv'),
    toCsv(data.cashPools, [
      'erp_doc', 'erp_date', 'erp_date_display', 'amount', 'erp_gross', 'stat', 'ref',
      'invno_erp', 'allocation', 'batch_id', 'remittance_gross', 'remittance_cash', 'erp_overpost',
    ]),
  );

  fs.writeFileSync(
    path.join(OUT, 'remittance_alloc.csv'),
    toCsv(data.remittanceAlloc, [
      'batch_id', 'post_date', 'erp_receipt_doc', 'erp_stat', 'line_type', 'target_doc', 'doc_date',
      'original_amount', 'net_amount', 'discount_amount', 'settle_amount', 'ledger_cash', 'notes',
    ]),
  );

  fs.writeFileSync(
    path.join(OUT, 'ledger.csv'),
    toCsv(data.ledger, [
      'iso', 'layer', 'entry', 'docno', 'target_doc', 'amount', 'balance', 'batch_id', 'ref',
    ]),
  );

  fs.writeFileSync(
    path.join(OUT, 'open_invoices.csv'),
    toCsv(data.openInvoices, [
      'docno', 'entry', 'doc_date', 'dn', 'invoice_gross', 'cn_doc', 'cn_amount',
      'spine_amount', 'open_balance', 'on_remittance', 'note',
    ]),
  );

  fs.writeFileSync(
    path.join(OUT, 'open_bill_lines.csv'),
    toCsv(data.openBillLines, [
      'line_type', 'docno', 'doc_date', 'dn', 'amount', 'paired_invoice', 'due',
    ]),
  );

  fs.writeFileSync(path.join(OUT, 'erp_tieout.md'), buildErpTieout(data));

  const readme = `# TWK002 remittance ledger restart

Greenfield remittance-authoritative ledger. **Does not overwrite live SOA.**

## Authority

| Source | Role |
| :--- | :--- |
| \`raw/TWK002_FULL_HISTORY.TXT\` | Document spine (Invoice + Crd Note only) |
| \`data/remittance_manifest_*.json\` + \`data/remittance_lines_*.csv\` | Allocation + Model B journals |
| ERP payment rows | Cash pool reference only — **INVNO ignored** |

## Ignored

- ERP payment \`INVNO\` / header allocation
- \`closedInvoiceOverrides\`, H-022–H-027, \`allocation_edges.csv\`
- Path B journals in TXT (00000490–00000511) — replaced by pro forma discount journals

## Artifacts

| File | Contents |
| :--- | :--- |
| \`raw_spine.csv\` | Layer A — invoices + CNs |
| \`cash_pools.csv\` | ERP receipts, unallocated |
| \`remittance_alloc.csv\` | Layer B + C — line cash + batch discount |
| \`ledger.csv\` | Running remittance AR |
| \`open_invoices.csv\` | Customer bill (not on remittance) |
| \`erp_tieout.md\` | Remittance AR vs ERP header |
| \`customer_bill_bridge.md\` | Customer bill vs remittance closing vs ERP header |

## Regenerate

\`\`\`bash
npm run debtors:twk002-stat123-site-split   # tag STAT 123 lines with debtor_code
npm run debtors:twk002-remit-ledger-restart
npm run debtors:twk002-customer-bill-bridge  # customer bill vs ERP bridge
npm run debtors:twk002-statement-restart     # fork SOA
\`\`\`

Multi-site STAT 123: see \`stat123_site_split.md\`.
`;
  fs.writeFileSync(path.join(OUT, 'README.md'), readme);

  console.log(`\nWrote ${path.relative(ROOT, OUT)}/`);
} else {
  console.log('\nDry run — pass --write to emit restart/');
}
