import { docKey } from './docUtils.mjs';

function parseSummaryFromReport(reportText) {
  const defaults = {
    cnOffsets: 0,
    cnVoidedInvoices: 0,
    paymentEdges: 0,
    confirmedAllocations: 0,
    openBalanceMatches: 0,
    refDivergenceFlags: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
  };
  if (!reportText) return defaults;

  const pick = (label) => {
    const re = new RegExp(`\\|\\s*${label}[^|]*\\|\\s*([^|]+)\\|`, 'i');
    const match = reportText.match(re);
    if (!match) return null;
    return match[1].trim();
  };

  const parseCountCell = (text) => {
    if (!text) return 0;
    const num = text.match(/([\d,]+)/);
    return num ? Number(num[1].replace(/,/g, '')) : 0;
  };

  const outstandingCell = pick('\\*\\*Outstanding invoices\\*\\*') || pick('Outstanding invoices');
  if (outstandingCell) {
    const countMatch = outstandingCell.match(/(\d+)/);
    const amountMatch = outstandingCell.match(/R\s*([\d\s,]+)/);
    defaults.outstandingCount = countMatch ? Number(countMatch[1]) : 0;
    defaults.outstandingAmount = amountMatch ? Number(amountMatch[1].replace(/\s/g, '').replace(/,/g, '')) : 0;
  }

  defaults.cnOffsets = parseCountCell(pick('Tier 3 CN offsets'));
  defaults.paymentEdges = parseCountCell(pick('Payment edges'));
  defaults.confirmedAllocations = parseCountCell(pick('Confirmed allocations'));
  defaults.openBalanceMatches = parseCountCell(pick('Open-balance matches'));

  return defaults;
}

export function computeDashboard(normalized, relationships, cases) {
  const reportSummary = parseSummaryFromReport(normalized.reportText);
  const outstanding = normalized.outstanding.map((row) => ({
    invoiceDoc: row.invoiceDoc,
    invoiceDocKey: row.invoiceDocKey,
    txDate: row.txDate,
    engineOpen: row.engineOpen,
    paid: row.paid,
    netTarget: row.netTarget,
    caseId: `CASE-INV${row.invoiceDocKey}`,
  }));

  const exceptions = relationships
    .filter(
      (rel) =>
        rel.reviewRequired ||
        rel.confidence === 'Exception' ||
        rel.allocationType === 'UNALLOCATED' ||
        rel.evidence.some((e) => e.result === 'FAIL')
    )
    .map((rel) => ({
      relationshipId: rel.id,
      sourceEdgeId: rel.sourceEdgeId,
      paymentDocKey: rel.from.docKey,
      invoiceDocKey: rel.to.docKey || null,
      allocationType: rel.allocationType,
      confidence: rel.confidence,
      notes: rel.notes,
      caseId:
        cases.find((c) => c.relationshipIds.includes(rel.id))?.allocationGroupId ??
        (rel.from.docKey ? `CASE-PMT${rel.from.docKey}` : null),
    }));

  const healthCounts = cases.reduce(
    (acc, c) => {
      acc[c.health] = (acc[c.health] ?? 0) + 1;
      return acc;
    },
    { healthy: 0, needs_review: 0, conflict: 0, incomplete: 0 }
  );

  const timelineMap = new Map();
  for (const rel of relationships) {
    if (!rel.paymentDate) continue;
    const bucket = rel.paymentDate.slice(0, 7);
    const entry = timelineMap.get(bucket) ?? { period: bucket, edgeCount: 0, allocatedAmount: 0 };
    entry.edgeCount += 1;
    entry.allocatedAmount += rel.amount;
    timelineMap.set(bucket, entry);
  }

  const recentRelationships = [...relationships]
    .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '') || b.id.localeCompare(a.id))
    .slice(0, 12)
    .map((rel) => ({
      id: rel.id,
      paymentDate: rel.paymentDate,
      fromDocKey: rel.from.docKey,
      toDocKey: rel.to.docKey,
      amount: rel.amount,
      allocationType: rel.allocationType,
    }));

  const summary = {
    relationshipCount: relationships.length,
    caseCount: cases.length,
    outstandingCount: outstanding.length || reportSummary.outstandingCount,
    outstandingAmount:
      outstanding.reduce((sum, row) => sum + row.engineOpen, 0) || reportSummary.outstandingAmount,
    confirmedAllocations: reportSummary.confirmedAllocations,
    openBalanceMatches: reportSummary.openBalanceMatches,
    exceptionCount: exceptions.length,
    healthCounts,
    totalDebtorBalance: normalized.meta.financials.totalOutstanding ?? null,
  };

  return {
    summary,
    outstanding,
    exceptions,
    timelineBuckets: [...timelineMap.values()].sort((a, b) => a.period.localeCompare(b.period)),
    recentRelationships,
    recentCases: [...cases]
      .sort((a, b) => b.relationshipIds.length - a.relationshipIds.length)
      .slice(0, 8)
      .map((c) => ({
        allocationGroupId: c.allocationGroupId,
        title: c.title,
        health: c.health,
        lifecycle: c.lifecycle,
        relationshipCount: c.relationshipIds.length,
      })),
    needsReviewCases: cases
      .filter((c) => c.health === 'needs_review' || c.health === 'conflict' || c.health === 'incomplete')
      .slice(0, 12),
    largestOutstanding: [...outstanding].sort((a, b) => b.engineOpen - a.engineOpen).slice(0, 8),
  };
}
