/**
 * Remittance evidence — proposal P11 (PROPOSED_Projection_Matching_Locks.md,
 * PROPOSED — NOT RATIFIED). business_rules.md §15 order A, rank 1: the customer's
 * remittance advice with a reconciling batch total outranks every pattern rule.
 *
 * This module normalises an account's remittance sources into one evidence shape:
 *   { batches: [{ batchId, paymentDoc, remittanceDate, cash, discount, lines:[…],
 *                 source:{ method, file, sha256 }, checks:{…} }], skipped:[…] }
 * Sources, in priority order per batch:
 *   1. lines already captured in data/remittance_manifest_*.json (operator-curated);
 *   2. lines extracted from the batch's PDF (C O D REMITTANCE ADVICE layout) — only
 *      accepted when Σ lines = the advice's own Total = the manifest's remittanceTotal.
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
      // Only the MD0003-style schema (batchId / erpPaymentDoc / remittanceTotal) is supported.
      // Other layouts (e.g. TWK002's snake_case batch_id / erp_payment_doc / cash_amount) need
      // their own adapter; skip them rather than emit batches full of nulls.
      if (!b.batchId || b.remittanceTotal == null) {
        skipped.push({
          file: f,
          batchId: b.batchId || b.batch_id || null,
          reason: 'unsupported manifest schema (expected batchId + remittanceTotal); adapter not built',
        });
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
