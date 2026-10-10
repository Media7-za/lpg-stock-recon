/**
 * Remittance evidence — proposal P11 (PROPOSED_Projection_Matching_Locks.md,
 * ratified 2026-10-10). business_rules.md §15 order A, rank 1: the customer's
 * remittance advice with a reconciling batch total outranks every pattern rule.
 *
 * This module normalises an account's remittance sources into one evidence shape:
 *   { batches: [{ batchId, paymentDoc, remittanceDate, cash, discount, lines:[…],
 *                 source:{ method, file, sha256 }, checks:{…} }], skipped:[…] }
 * Sources, in priority order per batch:
 *   1. lines already captured in data/remittance_manifest_*.json (operator-curated);
 *   2. lines extracted from the batch's PDF (C O D REMITTANCE ADVICE layout) — only
 *      accepted when Σ lines = the advice's own Total = the manifest's remittanceTotal.
 *   3. TWK002-style snake_case manifests (batch_id …) with lines in the manifest or in
 *      data/remittance_lines_{year}.csv — accepted when Σ net lines = cash_amount.
 * Nothing here edits a manifest or a PDF; malformed files are reported and skipped.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const num = (s) => Number(String(s).replace(/,/g, ''));
const isoFromDmy = (s) => {
  const [d, m, y] = s.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

/**
 * Parse the text of a "C O D REMITTANCE ADVICE" (pdftotext -layout). Returns null for
 * any other document (e.g. customer AP ledgers), so callers never misread them.
 */
export function parseCodRemittanceText(text) {
  if (!/C\s*O\s*D\s+REMITTANCE ADVICE/i.test(text)) return null;
  const date = text.match(/Date:\s+(\d{2}\/\d{2}\/\d{4})/)?.[1];
  const ref = text.match(/Payment Reference\s+(\S+)/)?.[1];
  const lines = [];
  const lineRe = /^\s*(\d{2}\/\d{2}\/\d{4})\s+(C\/N\s+)?(\d+)\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s*$/;
  for (const raw of text.split('\n')) {
    const m = raw.match(lineRe);
    if (!m) continue;
    lines.push({
      invoiceDate: isoFromDmy(m[1]),
      docType: m[2] ? 'Crd Note' : 'Invoice',
      doc: m[3],
      gross: num(m[4]),
      discount: num(m[5]),
      paid: num(m[6]),
    });
  }
  const t = text.match(/Total\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})\s+(-?[\d,]+\.\d{2})/);
  return {
    remittanceDate: date ? isoFromDmy(date) : null,
    paymentReference: ref || null,
    lines,
    total: t ? { gross: num(t[1]), discount: num(t[2]), paid: num(t[3]) } : null,
  };
}

function readJsonTolerant(p, skipped) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    skipped.push({ file: path.basename(p), reason: `unreadable JSON: ${e.message}` });
    return null;
  }
}

const sha256File = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function pdfText(p) {
  return execFileSync('pdftotext', ['-layout', p, '-'], { encoding: 'utf8' });
}

/** Lines from manifest entries ({batchId, docNo, paymentAmount, grossAmount, discount}). */
function manifestLines(manifest, batchId) {
  return (manifest.lines || [])
    .filter((l) => l.batchId === batchId)
    .map((l) => {
      const crn = /^C\/?N\s*/i.test(String(l.docNo)) || Number(l.paymentAmount) < 0;
      return {
        invoiceDate: l.invoiceDate || null,
        docType: crn ? 'Crd Note' : 'Invoice',
        doc: String(l.docNo).replace(/^C\/?N\s*/i, '').replace(/^0+/, ''),
        gross: round2(l.grossAmount ?? l.paymentAmount),
        discount: round2(l.discount ?? 0),
        paid: round2(l.paymentAmount),
      };
    });
}

const isoDate = (s) => {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
};

/** Minimal CSV reader for remittance_lines_YYYY.csv: the last column (notes) may contain commas. */
function readLinesCsv(p) {
  const [head, ...rows] = fs.readFileSync(p, 'utf8').trim().split(/\r?\n/);
  const keys = head.split(',');
  return rows.map((r) => {
    const v = r.split(',');
    const fixed = v.slice(0, keys.length - 1);
    return Object.fromEntries([...keys.slice(0, -1).map((k, i) => [k, fixed[i]]), [keys.at(-1), v.slice(keys.length - 1).join(',')]]);
  });
}

/**
 * TWK002-style manifests (snake_case): batches carry batch_id / erp_payment_doc / cash_amount;
 * lines live in the manifest's `lines` array or in data/remittance_lines_{year}.csv. A batch is
 * accepted only when Σ net lines = cash_amount (and line_count, when given, agrees). A line whose
 * net ≠ gross − discount is settled only in part by this advice (the rest by another remittance);
 * it keeps that difference as `alreadyPaid` and the matcher leaves such a batch unresolved.
 */
function snakeBatch(acctDir, dataDir, file, manifest, b) {
  const paymentDoc = b.erp_payment_doc ? String(b.erp_payment_doc).replace(/^0+/, '') : null;
  if (!paymentDoc) return { reason: `no ERP payment linked (erp_link_status ${b.erp_link_status ?? 'unknown'})` };
  const year = manifest.year || file.match(/(\d{4})/)?.[1];
  const csvPath = path.join(dataDir, `remittance_lines_${year}.csv`);
  let raw = (manifest.lines || []).filter((l) => l.batch_id === b.batch_id);
  let linesFile = path.relative(acctDir, path.join(dataDir, file));
  if (!raw.length && fs.existsSync(csvPath)) {
    raw = readLinesCsv(csvPath).filter((l) => l.batch_id === b.batch_id);
    linesFile = path.relative(acctDir, csvPath);
  }
  if (!raw.length) return { reason: 'no lines in manifest or remittance_lines CSV' };
  const lines = raw.map((l) => {
    const gross = round2(num(l.original_amount));
    // Credit-note lines record the discount as a positive magnitude; signed, it reduces the credit.
    const d = round2(num(l.discount_amount || 0));
    const discount = gross < 0 && d > 0 ? -d : d;
    const paid = round2(num(l.net_amount));
    const alreadyPaid = round2(gross - discount - paid);
    return {
      invoiceDate: isoDate(l.doc_date),
      docType: /cr/i.test(String(l.line_type)) ? 'Crd Note' : 'Invoice',
      doc: String(l.doc_no).trim().replace(/^0+/, ''),
      gross,
      discount,
      paid,
      ...(Math.abs(alreadyPaid) > 0.005 ? { alreadyPaid } : {}),
    };
  });
  const cash = round2(b.cash_amount);
  const sumPaid = round2(lines.reduce((s, l) => s + l.paid, 0));
  if (Math.abs(sumPaid - cash) > 0.005) return { reason: `lines do not reconcile: Σ net R${sumPaid} ≠ cash R${cash}` };
  if (b.line_count != null && Number(b.line_count) !== lines.length) return { reason: `line count ${lines.length} ≠ manifest line_count ${b.line_count}` };
  return {
    batch: {
      batchId: b.batch_id,
      paymentDoc,
      remittanceDate: b.advice_date || null,
      cash,
      manifest: path.relative(acctDir, path.join(dataDir, file)),
      discount: round2(lines.reduce((s, l) => s + l.discount, 0)),
      ...(b.discount_amount != null ? { adviceDiscount: round2(b.discount_amount) } : {}),
      lines,
      source: { method: 'manifest-snake', file: linesFile, remittanceRef: b.remittance_ref || null, advice: b.source_file || null },
      ...(b.journal_pending ? { discountJournal: { status: b.journal_pending.status ?? null, erpDoc: b.journal_pending.erp_doc ?? null } } : {}),
      checks: { linesSumToCash: true, sumPaid },
    },
  };
}

/**
 * Build evidence for one account directory (analysis/debtors/{CODE}).
 * `extract` can be stubbed in tests: (pdfPath) => text.
 */
export function buildRemittanceEvidence(acctDir, { extract = pdfText } = {}) {
  const skipped = [];
  const batches = [];
  const dataDir = path.join(acctDir, 'data');
  const manifests = fs.existsSync(dataDir)
    ? fs.readdirSync(dataDir).filter((f) => /^remittance_manifest_\d{4}\.json$/.test(f)).sort()
    : [];
  for (const f of manifests) {
    const mPath = path.join(dataDir, f);
    const manifest = readJsonTolerant(mPath, skipped);
    if (!manifest) continue;
    for (const b of manifest.batches || []) {
      if (b.batch_id) {
        const r = snakeBatch(acctDir, dataDir, f, manifest, b);
        if (r.batch) batches.push(r.batch);
        else skipped.push({ file: f, batchId: b.batch_id, reason: r.reason });
        continue;
      }
      if (!b.batchId || b.remittanceTotal == null) {
        skipped.push({ file: f, batchId: null, reason: 'unsupported manifest schema (no batchId / batch_id)' });
        continue;
      }
      const base = {
        batchId: b.batchId,
        paymentDoc: b.erpPaymentDoc ? String(b.erpPaymentDoc).replace(/^0+/, '') : null,
        remittanceDate: b.remittanceDate || null,
        cash: round2(b.remittanceTotal),
        manifest: path.relative(acctDir, mPath),
      };
      let lines = manifestLines(manifest, b.batchId);
      let source = { method: 'manifest', file: base.manifest };
      if (!lines.length && b.file) {
        const pdf = path.join(acctDir, b.file);
        if (!fs.existsSync(pdf)) {
          skipped.push({ batchId: b.batchId, reason: `no lines in manifest and PDF missing: ${b.file}` });
          continue;
        }
        const parsed = parseCodRemittanceText(extract(pdf));
        if (!parsed) {
          skipped.push({ batchId: b.batchId, reason: `PDF is not a C O D remittance advice: ${b.file}` });
          continue;
        }
        lines = parsed.lines;
        source = { method: 'pdf-extract', file: b.file, sha256: sha256File(pdf), paymentReference: parsed.paymentReference };
        const sumPaid = round2(lines.reduce((s, l) => s + l.paid, 0));
        if (!parsed.total || Math.abs(sumPaid - parsed.total.paid) > 0.005 || Math.abs(sumPaid - base.cash) > 0.005) {
          skipped.push({
            batchId: b.batchId,
            reason: `extracted lines do not reconcile: Σ lines R${sumPaid}, advice total R${parsed.total?.paid}, manifest R${base.cash}`,
          });
          continue;
        }
        if (b.lineCount != null && Number(b.lineCount) !== lines.length) {
          skipped.push({ batchId: b.batchId, reason: `line count ${lines.length} ≠ manifest lineCount ${b.lineCount}` });
          continue;
        }
      }
      if (!lines.length) {
        skipped.push({ batchId: b.batchId, reason: 'no lines in manifest and no PDF reference' });
        continue;
      }
      const sumPaid = round2(lines.reduce((s, l) => s + l.paid, 0));
      batches.push({
        ...base,
        discount: round2(lines.reduce((s, l) => s + l.discount, 0)),
        lines,
        source,
        checks: { linesSumToCash: Math.abs(sumPaid - base.cash) <= 0.005, sumPaid },
      });
    }
  }
  return { batches, skipped };
}
