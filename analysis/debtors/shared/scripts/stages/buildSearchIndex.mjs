import { docKey } from './docUtils.mjs';

export function buildSearchIndex(normalized, relationships, cases, debtorCode) {
  const base = `/debtors/${debtorCode}/investigate`;
  const entries = [];

  const push = (entry) => {
    entries.push({
      keywords: [...new Set(entry.keywords.filter(Boolean).map((k) => String(k).toLowerCase()))],
      ...entry,
    });
  };

  for (const [doc, invoice] of Object.entries(normalized.entities.invoices)) {
    const key = docKey(doc);
    push({
      id: `search-inv-${key}`,
      kind: 'invoice',
      label: `Invoice ${key}`,
      route: `${base}/invoices/${key}`,
      keywords: [key, doc, invoice.txDate, ...(invoice.lanes ?? [])],
    });
  }

  for (const [doc, payment] of Object.entries(normalized.entities.payments)) {
    const key = docKey(doc);
    const linkedInvoiceKeys = relationships
      .filter((r) => r.from.docKey === key && r.to.docKey)
      .map((r) => r.to.docKey);
    push({
      id: `search-pmt-${key}`,
      kind: 'payment',
      label: `Payment ${key}`,
      route: `${base}/payments/${key}`,
      keywords: [key, doc, payment.paymentDate, payment.batchRef, payment.statNo, ...linkedInvoiceKeys],
    });
  }

  for (const [doc, cn] of Object.entries(normalized.entities.creditNotes)) {
    const key = docKey(doc);
    push({
      id: `search-cn-${key}`,
      kind: 'credit_note',
      label: `Credit Note ${key}`,
      route: `${base}/credit-notes/${key}`,
      keywords: [key, doc, cn.txDate],
    });
  }

  for (const rel of relationships) {
    const fromKey = rel.from.docKey;
    const toKey = rel.to.docKey;
    push({
      id: `search-rel-${rel.id}`,
      kind: 'relationship',
      label: `REL ${rel.sourceEdgeId} Payment ${fromKey}${toKey ? ` → Invoice ${toKey}` : ''}`,
      route: `${base}/relationships/${encodeURIComponent(rel.id)}`,
      keywords: [rel.id, rel.sourceEdgeId, fromKey, toKey, rel.allocationType, rel.statNo, rel.batchRef],
    });
  }

  for (const caseRecord of cases) {
    push({
      id: `search-case-${caseRecord.allocationGroupId}`,
      kind: 'case',
      label: caseRecord.allocationGroupId,
      route: `${base}/cases/${encodeURIComponent(caseRecord.allocationGroupId)}`,
      keywords: [
        caseRecord.allocationGroupId,
        caseRecord.title,
        caseRecord.primaryInvoiceDoc ? docKey(caseRecord.primaryInvoiceDoc) : '',
        caseRecord.primaryPaymentDoc ? docKey(caseRecord.primaryPaymentDoc) : '',
        caseRecord.health,
      ],
    });
  }

  push({
    id: 'search-doctrine-tier1',
    kind: 'doctrine',
    label: 'Tier 1 — Open balance primary',
    route: `${base}/search?q=tier+1`,
    keywords: ['tier 1', 'open balance', 'doctrine'],
  });

  for (const row of normalized.outstanding) {
    push({
      id: `search-out-${row.invoiceDocKey}`,
      kind: 'invoice',
      label: `Outstanding ${row.invoiceDocKey}`,
      route: `${base}/invoices/${row.invoiceDocKey}`,
      keywords: [row.invoiceDocKey, 'outstanding', row.txDate],
    });
  }

  return entries;
}
