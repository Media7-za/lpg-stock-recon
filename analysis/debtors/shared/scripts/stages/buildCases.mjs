import crypto from 'crypto';
import { docKey } from './docUtils.mjs';

function assessRelationshipHealth(rel) {
  if (rel.evidence.some((e) => e.result === 'FAIL')) return 'conflict';
  if (rel.allocationType === 'UNALLOCATED') {
    if (/OVERPAY|REF_DIVERGENCE|mismatch/i.test(rel.notes ?? '')) return 'conflict';
    return 'needs_review';
  }
  if (rel.confidence === 'Exception') return 'conflict';
  if (rel.reviewRequired) return 'needs_review';
  if (rel.evidence.some((e) => e.result === 'WARN') || rel.allocationType === 'OPEN_BALANCE_PARTIAL') {
    return 'needs_review';
  }
  return 'healthy';
}

function mergeHealth(current, next) {
  const rank = { conflict: 4, incomplete: 3, needs_review: 2, healthy: 1 };
  return rank[next] > rank[current] ? next : current;
}

function deriveLifecycle(health, openBalance) {
  if (health === 'conflict') return 'exception';
  if (health === 'healthy' && (openBalance ?? 0) <= 0.01) return 'resolved';
  return 'new';
}

function hashCaseId(relationshipIds) {
  const payload = [...relationshipIds].sort().join(',');
  const hash = crypto.createHash('sha256').update(payload).digest('hex').slice(0, 8);
  return `CASE-HASH-${hash.toUpperCase()}`;
}

export function buildCases(normalized, relationships) {
  const cases = new Map();
  const openByInvoice = new Map(
    normalized.outstanding.map((row) => [row.invoiceDoc, row.engineOpen])
  );

  const addCase = (caseId, patch) => {
    const existing = cases.get(caseId) ?? {
      allocationGroupId: caseId,
      title: caseId,
      health: 'healthy',
      lifecycle: 'new',
      relationshipIds: [],
      primaryInvoiceDoc: null,
      primaryPaymentDoc: null,
      openBalance: 0,
      paidAmount: 0,
    };
    cases.set(caseId, {
      ...existing,
      ...patch,
      relationshipIds: [...new Set([...(existing.relationshipIds ?? []), ...(patch.relationshipIds ?? [])])],
    });
  };

  for (const rel of relationships) {
    if (rel.to?.docKey) {
      const caseId = `CASE-INV${rel.to.docKey}`;
      addCase(caseId, {
        title: `Invoice ${rel.to.docKey}`,
        primaryInvoiceDoc: rel.to.doc,
        relationshipIds: [rel.id],
        openBalance: openByInvoice.get(rel.to.doc) ?? 0,
      });
    }

    if (rel.from?.docKey) {
      const paymentRels = relationships.filter((r) => r.from.docKey === rel.from.docKey);
      const hasException = paymentRels.some(
        (r) => r.confidence === 'Exception' || r.allocationType === 'UNALLOCATED' || r.reviewRequired
      );
      if (paymentRels.length > 1 || hasException) {
        const caseId = `CASE-PMT${rel.from.docKey}`;
        addCase(caseId, {
          title: `Payment ${rel.from.docKey}`,
          primaryPaymentDoc: rel.from.doc,
          relationshipIds: paymentRels.map((r) => r.id),
        });
      }
    }
  }

  for (const row of normalized.outstanding) {
    const caseId = `CASE-INV${row.invoiceDocKey}`;
    const relsForInvoice = relationships.filter((r) => r.to.docKey === row.invoiceDocKey).map((r) => r.id);
    addCase(caseId, {
      title: `Invoice ${row.invoiceDocKey}`,
      primaryInvoiceDoc: row.invoiceDoc,
      relationshipIds: relsForInvoice,
      openBalance: row.engineOpen,
      paidAmount: row.paid,
    });
  }

  for (const [caseId, caseRecord] of cases.entries()) {
    const rels = relationships.filter((r) => caseRecord.relationshipIds.includes(r.id));
    let health = 'healthy';
    for (const rel of rels) {
      health = mergeHealth(health, assessRelationshipHealth(rel));
    }
    if ((caseRecord.openBalance ?? 0) > 0.01 && health === 'healthy') {
      health = 'incomplete';
    }
    if (
      (caseRecord.openBalance ?? 0) <= 0.01 &&
      caseId.startsWith('CASE-INV') &&
      health === 'needs_review' &&
      rels.length > 0 &&
      rels.every((r) => r.confidence === 'Confirmed')
    ) {
      health = 'healthy';
    }
    cases.set(caseId, {
      ...caseRecord,
      health,
      lifecycle: deriveLifecycle(health, caseRecord.openBalance),
    });
  }

  const paymentOnlyClusters = relationships.filter(
    (r) => r.allocationType === 'UNALLOCATED' && !cases.has(`CASE-PMT${r.from.docKey}`)
  );
  if (paymentOnlyClusters.length) {
    const ids = paymentOnlyClusters.map((r) => r.id);
    const caseId = hashCaseId(ids);
    addCase(caseId, {
      title: 'Unallocated cluster',
      relationshipIds: ids,
      health: 'conflict',
      lifecycle: 'exception',
    });
  }

  return [...cases.values()].sort((a, b) => a.allocationGroupId.localeCompare(b.allocationGroupId));
}
