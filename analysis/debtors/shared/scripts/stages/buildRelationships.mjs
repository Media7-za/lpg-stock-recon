import { docKey } from './docUtils.mjs';

const COMPILED_BY = 'allocation_knowledge_compile.mjs';
const SOURCE_FILE = 'allocation_edges.csv';

function parseErpRefFromNotes(notes) {
  const agree = notes.match(/ERP ref cross-check agrees \((\d+)\)/i);
  if (agree) return { ref: agree[1], result: 'PASS' };
  const mismatch = notes.match(/ERP ref cross-check/i);
  if (mismatch) return { ref: null, result: 'WARN' };
  return { ref: null, result: 'NA' };
}

function doctrineFromEdge(edge) {
  if (edge.allocationType === 'CN_OFFSET' || edge.allocationType === 'REMITTANCE_CN_OFFSET') return 'Tier 3';
  if (edge.allocationType === 'UNALLOCATED') return 'Tier 5';
  if (edge.allocationType === 'ROUNDING_RESIDUAL') return 'Tier 2';
  if (edge.evidenceSource === 'EXPLICIT_ALLOCATION' || edge.allocationType === 'REMITTANCE_EXPLICIT') {
    return 'Tier 1';
  }
  if (edge.evidenceSource === 'REMITTANCE_ADVICE') return 'Tier 1';
  if (edge.allocationType.startsWith('OPEN_BALANCE')) return 'Tier 1';
  return 'Tier 4';
}

function buildEvidence(edge) {
  const items = [];
  const baseProv = {
    source: SOURCE_FILE,
    derivedBy: `${COMPILED_BY}:buildRelationships`,
    runner: 'payment_doc_allocation.mjs',
  };

  if (edge.evidenceSource === 'OPEN_BALANCE_AT_PAYMENT') {
    items.push({
      type: 'OPEN_BALANCE',
      result: edge.allocationType === 'UNALLOCATED' ? 'FAIL' : edge.allocationType === 'OPEN_BALANCE_PARTIAL' ? 'WARN' : 'PASS',
      detail: edge.notes,
      provenance: { ...baseProv, column: 'allocation_type' },
    });
  }

  if (edge.evidenceSource === 'ERP_LEDGER' || /ERP ref cross-check/i.test(edge.notes)) {
    const erp = parseErpRefFromNotes(edge.notes);
    items.push({
      type: 'ERP_REFERENCE',
      result: erp.result,
      detail: edge.notes,
      provenance: { ...baseProv, column: 'notes' },
    });
  }

  if (edge.allocationType === 'ROUNDING_RESIDUAL') {
    items.push({
      type: 'ROUNDING',
      result: 'PASS',
      detail: edge.notes,
      provenance: { ...baseProv, column: 'allocation_type' },
    });
  }

  if (edge.reviewRequired) {
    items.push({
      type: 'REVIEW_FLAG',
      result: 'WARN',
      detail: 'Runner flagged review_required',
      provenance: { ...baseProv, column: 'review_required' },
    });
  }

  if (!items.length) {
    items.push({
      type: 'ALLOCATION_EDGE',
      result: edge.confidence === 'Exception' ? 'FAIL' : 'PASS',
      detail: edge.notes,
      provenance: { ...baseProv, column: 'notes' },
    });
  }

  return items;
}

export function buildRelationships(normalized) {
  const relationships = [];

  for (const edge of normalized.edges) {
    const relId = `REL-${edge.allocationId.replace(/^AL-/, 'AL-')}`;
    const from = { kind: 'payment', doc: edge.paymentDoc, docKey: edge.paymentDocKey };
    const to = edge.targetDoc
      ? { kind: 'invoice', doc: edge.targetDoc, docKey: edge.targetDocKey }
      : { kind: 'invoice', doc: '', docKey: '' };

    relationships.push({
      id: relId,
      from,
      to,
      amount: edge.allocatedAmount,
      paymentSliceAmount: edge.paymentAmount,
      doctrine: doctrineFromEdge(edge),
      confidence: edge.confidence,
      allocationType: edge.allocationType,
      targetLane: edge.targetLane,
      evidence: buildEvidence(edge),
      reviewRequired: edge.reviewRequired,
      sourceEdgeId: edge.allocationId,
      paymentDate: edge.paymentDate,
      batchRef: edge.batchRef,
      statNo: edge.statNo,
      notes: edge.notes,
      source: {
        source: SOURCE_FILE,
        column: 'allocation_id',
        derivedBy: `${COMPILED_BY}:buildRelationships`,
        runner: 'payment_doc_allocation.mjs',
      },
    });
  }

  return relationships;
}

export function relationshipDocKeys(rel) {
  const keys = new Set();
  if (rel.from?.docKey) keys.add(rel.from.docKey);
  if (rel.to?.docKey) keys.add(rel.to.docKey);
  return keys;
}
