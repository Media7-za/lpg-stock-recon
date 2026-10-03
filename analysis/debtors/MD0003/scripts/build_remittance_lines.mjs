#!/usr/bin/env node
/**
 * MD0003 — extract COD remittance advice lines to data/remittance_lines_{YYYY}.csv
 * (same shape as TWK002/data/remittance_lines_*.csv) so the tag-coverage gate's
 * remittance-contradiction check can run (HUMAN_TASKS H-017).
 *
 * Source of truth is the advice PDF itself (via `pdftotext -layout`). Each advice
 * is cross-checked against its batch in data/remittance_manifest_*.json:
 *   Σ line payment amounts == printed Payment Total == manifest remittanceTotal
 *   line count == manifest lineCount
 *   manifest lines (where present) == PDF lines, doc-for-doc and cent-exact
 * Any mismatch aborts without writing.
 *
 * Note: several advices print a nonsensical Gross *Total* (e.g. 321,932.79 on
 * 01.11.2025) — a customer-side print artefact. The Payment column ties, so the
 * gross total is reported but not gated.
 *
 * Usage: node analysis/debtors/MD0003/scripts/build_remittance_lines.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REMIT_DIR = path.join(ROOT, 'raw/Remittances');
const DATA = path.join(ROOT, 'data');
const WRITE = process.argv.includes('--write');

// COD advices are named DD.MM.YYYY.pdf. Other files in raw/Remittances
// (customer AP ledger 10.10.2025.pdf, FNB notification, .xls ledgers) are not advices
// and are rejected below by the "C O D REMITTANCE ADVICE" header check.
const ADVICE_NAME = /^\d{2}\.\d{2}\.\d{4}\.pdf$/;

const cents = (s) => Math.round(parseFloat(String(s).replace(/,/g, '')) * 100);
const fmt = (c) => (c / 100).toFixed(2);
const pad8 = (d) => String(d).padStart(8, '0');
const isoFromDmy = (s) => {
  const [d, m, y] = s.split('/');
  return `${y}-${m}-${d}`;
};

function pdfText(file) {
  const r = spawnSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
  if (r.error || r.status !== 0) {
    throw new Error(`pdftotext failed on ${file}: ${r.error?.message || r.stderr}`);
  }
  return r.stdout;
}

function parseAdvice(file) {
  const text = pdfText(file);
  if (!/C O D REMITTANCE ADVICE/.test(text)) return null;

  const date = text.match(/Date:\s+(\d{2}\/\d{2}\/\d{4})/)?.[1];
  const payRef = text.match(/Payment Reference\s+(\d+)/)?.[1];
  const total = text.match(/Total\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})/);
  const status = text.match(/Status\s*:\s*(\S+)/)?.[1] || '';
  if (!date || !payRef || !total) throw new Error(`${file}: header/total not found`);

  const lines = [];
  const re = /^\s*(\d{2}\/\d{2}\/\d{4})\s+(C\/N\s+)?(\d+)\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s*$/gm;
  for (const m of text.matchAll(re)) {
    lines.push({
      docDate: isoFromDmy(m[1]),
      lineType: m[2] ? 'Crd Note' : 'Invoice',
      docNo: m[3],
      gross: cents(m[4]),
      discount: cents(m[5]),
      payment: cents(m[6]),
    });
  }
  return {
    remittanceDate: isoFromDmy(date),
    payRef,
    status,
    grossTotal: cents(total[1]),
    discountTotal: cents(total[2]),
    paymentTotal: cents(total[3]),
    lines,
  };
}

function loadManifestBatches() {
  const byRef = new Map();
  for (const f of fs.readdirSync(DATA).filter((n) => /^remittance_manifest_\d{4}\.json$/.test(n)).sort()) {
    const m = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
    for (const b of m.batches) {
      const lines = (m.lines || []).filter((l) => l.batchId === b.batchId);
      byRef.set(b.paymentReference, { ...b, manifest: f, lines });
    }
  }
  return byRef;
}

const manifestByRef = loadManifestBatches();
const errors = [];
const byYear = new Map();
const summary = [];

for (const name of fs.readdirSync(REMIT_DIR).filter((n) => ADVICE_NAME.test(n)).sort()) {
  const rel = `raw/Remittances/${name}`;
  const adv = parseAdvice(path.join(REMIT_DIR, name));
  if (!adv) {
    summary.push({ file: rel, status: 'SKIP', reason: 'not a COD remittance advice' });
    continue;
  }
  const mb = manifestByRef.get(adv.payRef);
  if (!mb) {
    errors.push(`${rel}: payment reference ${adv.payRef} not in any remittance_manifest_*.json`);
    continue;
  }
  const sum = adv.lines.reduce((s, l) => s + l.payment, 0);
  if (sum !== adv.paymentTotal) errors.push(`${rel}: Σ lines ${fmt(sum)} ≠ printed payment total ${fmt(adv.paymentTotal)}`);
  if (sum !== cents(mb.remittanceTotal)) errors.push(`${rel}: Σ lines ${fmt(sum)} ≠ manifest ${mb.batchId} remittanceTotal ${mb.remittanceTotal}`);
  if (mb.lineCount != null && adv.lines.length !== mb.lineCount) {
    errors.push(`${rel}: ${adv.lines.length} lines ≠ manifest lineCount ${mb.lineCount}`);
  }
  if (mb.lines.length) {
    const want = mb.lines.map((l) => `${Number(l.docNo)}:${cents(l.paymentAmount)}`).sort().join(',');
    const got = adv.lines.map((l) => `${Number(l.docNo)}:${l.payment}`).sort().join(',');
    if (want !== got) errors.push(`${rel}: PDF lines differ from manifest ${mb.manifest} lines`);
  }
  const lineGross = adv.lines.reduce((s, l) => s + l.gross, 0);

  const lane = new Map(mb.lines.filter((l) => l.lane).map((l) => [Number(l.docNo), l.lane]));
  const year = adv.remittanceDate.slice(0, 4);
  const rows = byYear.get(year) || [];
  for (const l of adv.lines) {
    const notes = [`erp_payment=${mb.erpPaymentDoc}`, `stat=${mb.erpBatchRef || ''}`, `source=${rel}`];
    if (lane.has(Number(l.docNo))) notes.push(`lane=${lane.get(Number(l.docNo))}`);
    rows.push([
      mb.batchId,
      l.lineType,
      pad8(l.docNo),
      l.docDate,
      '',
      fmt(l.gross),
      fmt(l.discount),
      fmt(l.payment),
      l.discount !== 0 ? 'true' : 'false',
      'true',
      'remittance_advice',
      notes.join('; '),
    ]);
  }
  byYear.set(year, rows);
  summary.push({
    file: rel,
    status: 'OK',
    batch: mb.batchId,
    erpPayment: mb.erpPaymentDoc,
    lines: adv.lines.length,
    paymentTotal: fmt(adv.paymentTotal),
    grossTotalPrinted: fmt(adv.grossTotal),
    grossTotalArtefact: adv.grossTotal !== lineGross,
  });
}

for (const s of summary) {
  if (s.status === 'SKIP') console.log(`SKIP ${s.file} — ${s.reason}`);
  else {
    console.log(
      `OK   ${s.file} ${s.batch} pay=${s.erpPayment} lines=${s.lines} total=R${s.paymentTotal}` +
        (s.grossTotalArtefact ? ` (printed gross total R${s.grossTotalPrinted} is a print artefact; not gated)` : ''),
    );
  }
}

if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error('Aborted: nothing written.');
  process.exit(1);
}

const HEADER = 'batch_id,line_type,doc_no,doc_date,our_ref,original_amount,discount_amount,net_amount,discount_eligible,on_remittance,source_type,notes';
const csvCell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
for (const [year, rows] of [...byYear].sort()) {
  const out = path.join(DATA, `remittance_lines_${year}.csv`);
  const body = [HEADER, ...rows.map((r) => r.map(csvCell).join(','))].join('\n') + '\n';
  if (WRITE) {
    fs.writeFileSync(out, body);
    console.log(`wrote ${path.relative(process.cwd(), out)} (${rows.length} lines)`);
  } else {
    console.log(`[dry-run] ${path.relative(process.cwd(), out)} (${rows.length} lines) — pass --write`);
  }
}
