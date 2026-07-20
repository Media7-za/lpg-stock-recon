import fs from 'fs';
import path from 'path';
import { readCsvFile, toNumber, toBool } from './csvUtils.mjs';
import { docKey, docPadded } from './docUtils.mjs';

const RUNNER = 'payment_doc_allocation.mjs';

function aggregateInvoices(rows) {
  const invoices = {};
  const creditNotes = {};

  for (const row of rows) {
    const doc = docPadded(row.doc_no);
    const key = docKey(doc);
    const entryType = row.entry_type;
    const isCredit = entryType === 'Crd Note';
    const bucket = isCredit ? creditNotes : invoices;
    const target = bucket[doc] ?? {
      doc,
      docKey: key,
      entryType: isCredit ? 'credit_note' : 'invoice',
      txDate: row.tx_date,
      lanes: new Set(),
      amountIncl: 0,
      amountExcl: 0,
      isLpg: row.is_lpg === 'True',
      isCyl: row.is_cyl === 'True',
      lineCount: 0,
    };

    target.lanes.add(row.lane || 'LPG');
    target.amountIncl += toNumber(row.amount_incl);
    target.amountExcl += toNumber(row.amount_excl);
    target.lineCount += 1;
    if (row.tx_date && (!target.txDate || row.tx_date > target.txDate)) {
      target.txDate = row.tx_date;
    }
    bucket[doc] = target;
  }

  const finalize = (record) => ({
    ...record,
    lanes: [...record.lanes],
  });

  return {
    invoices: Object.fromEntries(
      Object.entries(invoices).map(([doc, rec]) => [doc, finalize(rec)])
    ),
    creditNotes: Object.fromEntries(
      Object.entries(creditNotes).map(([doc, rec]) => [doc, finalize(rec)])
    ),
  };
}

function aggregatePayments(edgeRows) {
  const payments = {};

  for (const row of edgeRows) {
    const doc = docPadded(row.payment_doc);
    const existing = payments[doc] ?? {
      doc,
      docKey: docKey(doc),
      paymentDate: row.payment_date,
      batchRef: row.batch_ref,
      statNo: row.stat_no,
      totalAmount: 0,
      sliceCount: 0,
      relationshipCount: 0,
    };

    existing.totalAmount = Math.max(existing.totalAmount, toNumber(row.payment_amount));
    existing.sliceCount += 1;
    existing.relationshipCount += 1;
    if (row.payment_date && (!existing.paymentDate || row.payment_date > existing.paymentDate)) {
      existing.paymentDate = row.payment_date;
    }
    if (row.batch_ref) existing.batchRef = row.batch_ref;
    if (row.stat_no) existing.statNo = row.stat_no;
    payments[doc] = existing;
  }

  return payments;
}

function parseOutstandingReport(reportText) {
  const outstanding = [];
  const exceptions = [];
  const sectionMatch = reportText.match(/## Outstanding[\s\S]*?(?=\n## |\n\*\*Edges:\*\*|$)/);
  const section = sectionMatch ? sectionMatch[0] : '';
  if (!section) return { outstanding, exceptions };

  const lines = section.split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes(':---') || line.includes('Invoice')) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 6) continue;

    const invoiceKey = docKey(cells[0]);
    if (!invoiceKey || invoiceKey === 'Invoice' || !/^\d+$/.test(invoiceKey)) continue;

    const parseMoney = (text) => {
      const cleaned = text.replace(/[R\s,]/g, '').replace(/−/g, '-');
      if (cleaned === '—' || cleaned === '') return 0;
      return Number(cleaned) || 0;
    };

    outstanding.push({
      invoiceDoc: docPadded(invoiceKey),
      invoiceDocKey: invoiceKey,
      txDate: cells[1],
      lpg: parseMoney(cells[2]),
      other: parseMoney(cells[3]),
      netTarget: parseMoney(cells[4]),
      engineOpen: parseMoney(cells[5]),
      paid: parseMoney(cells[6] ?? '0'),
    });
  }

  return { outstanding, exceptions };
}

export function normalize(debtorDir) {
  const dataDir = path.join(debtorDir, 'data');
  const reportsDir = path.join(debtorDir, 'reports');
  const projectPath = path.join(debtorDir, 'project.json');

  const edgeRows = readCsvFile(path.join(dataDir, 'allocation_edges.csv'));
  const invoiceRows = readCsvFile(path.join(dataDir, 'invoices.csv'));
  const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  const reportPath = path.join(reportsDir, `${project.debtorCode}_Allocation_Outstanding.md`);
  const reportText = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : '';
  const { outstanding } = parseOutstandingReport(reportText);

  const { invoices, creditNotes } = aggregateInvoices(invoiceRows);
  const payments = aggregatePayments(edgeRows);

  const normalizedEdges = edgeRows.map((row) => ({
    allocationId: row.allocation_id,
    paymentDoc: docPadded(row.payment_doc),
    paymentDocKey: docKey(row.payment_doc),
    paymentDate: row.payment_date,
    batchRef: row.batch_ref,
    statNo: row.stat_no,
    paymentAmount: toNumber(row.payment_amount),
    targetDoc: row.target_doc ? docPadded(row.target_doc) : '',
    targetDocKey: row.target_doc ? docKey(row.target_doc) : '',
    targetDate: row.target_date,
    targetLane: row.target_lane || 'LPG',
    targetAmount: toNumber(row.target_amount),
    allocatedAmount: toNumber(row.allocated_amount),
    residualAfterAllocation: toNumber(row.residual_after_allocation),
    allocationType: row.allocation_type,
    evidenceSource: row.evidence_source,
    confidence: row.confidence,
    commerciallyConfirmed: toBool(row.commercially_confirmed),
    reviewRequired: toBool(row.review_required),
    notes: row.notes,
  }));

  return {
    meta: {
      debtorCode: project.debtorCode,
      debtorName: project.clientName,
      runner: RUNNER,
      financials: project.financials ?? {},
    },
    edges: normalizedEdges,
    entities: { invoices, payments, creditNotes },
    outstanding,
    reportText,
  };
}
