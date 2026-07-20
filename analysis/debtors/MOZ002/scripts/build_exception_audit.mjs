#!/usr/bin/env node
/**
 * MOZ002 Turn 4 — exception registry + audit from TXT + Turn 3 review queue.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const CODE = 'MOZ002';
const base = path.join(ROOT, `analysis/debtors/${CODE}`);

const PARTIAL_CN_AMOUNT = -2415.0;
const RESIDUAL_CYL_AMOUNT = -517.5;
const REASON_PARTIAL =
  'Customer returned 1 x 9kg cylinder short. CN R2,415.00 on empty invoice; residual R517.50 (= R450 + 15% VAT) remains open.';
const REASON_RESIDUAL =
  'Residual 1 x 9kg cylinder deposit credit (R517.50 incl) on empty invoice — companion to partial R2,415.00 return pattern.';
const REASON_BULK = 'Operator bulk-confirmed 2026-07-16: same 1-cylinder-short pattern as CN 00014741.';

// Partial R2,415.00 empty CNs from MOZ002CURRENT.TXT (DN contains EMPTY / EPTY / EMPTIES)
const partialCnTxt = [
  ['00012081', '2025-03-17', 'DN#4438-EMPTY', -2415.0],
  ['00012174', '2025-04-02', 'DN#12836-EMPTY', -2415.0],
  ['00012369', '2025-04-29', 'DN#13110-EMPTY', -2415.0],
  ['00012468', '2025-05-13', 'DN#12076-EMPTY', -2415.0],
  ['00012535', '2025-05-22', 'DN#12106-EMPTY', -2415.0],
  ['00012639', '2025-06-06', 'DN#12149-EMPTY', -2415.0],
  ['00012710', '2025-06-12', 'DN#12560-E,MPTY', -2415.0],
  ['00012812', '2025-06-25', 'DN#12325-EMPTY', -2415.0],
  ['00012872', '2025-07-01', 'DN#12349-EMPTY', -2415.0],
  ['00013165', '2025-08-08', 'DN#20072-- EMPTY', -2415.0],
  ['00013602', '2025-10-03', 'DN#21092-EPTY', -2415.0],
  ['00013931', '2025-11-22', 'DN#20859-EMPTY', -2415.0],
  ['00014007', '2025-12-04', 'DN20893 EMPTY', -2415.0],
  ['00014666', '2026-03-26', 'DN-21985-EMPTY', -2415.0],
  ['00014741', '2026-04-10', 'DN-22161-EMPTY', -2415.0],
  ['00015166', '2026-07-03', 'DN#22538=EMPTY', -2415.0],
];

const residualCnTxt = [['00012082', '2025-03-17', 'DN#4438-EMPTY', -517.5]];

// Turn 3 — payment 41529: ERP deposit splits; operator excluded from CYL allocation (2026-07-16)
const REJECTED_CYL_REASON =
  'Operator confirmed: payments are not allocated to CYL slices for MOZ002. ERP internal split — empty settlement via credit notes only.';
const payment41529Slices = [
  { ref: '44404', amount: 1207.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '43462', amount: 1035.0, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '43246', amount: 517.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '43082', amount: 517.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '45721', amount: 1207.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '47590', amount: 517.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '48096', amount: 1207.5, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '48348', amount: 1725.0, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
  { ref: '48940', amount: 0.01, status: 'REJECTED_CYL_SLICE_EXCLUDED' },
];

const overrides = [];
let id = 1;

for (const [doc, date, dn, amount] of partialCnTxt) {
  overrides.push({
    id: `EX-${String(id++).padStart(4, '0')}`,
    doc_no: doc,
    doc_type: 'credit_note',
    doc_date: date,
    delivery_ref: dn,
    amount,
    expected_full_empty: amount === -2415 ? -2932.5 : null,
    residual_open: amount === -2415 ? 517.5 : null,
    override_type: 'PARTIAL_EMPTY_RETURN',
    approval_status: 'approved',
    approved_by: 'operator',
    approved_date: '2026-07-16',
    reason: doc === '00014741' ? REASON_PARTIAL : REASON_BULK,
    evidence_source: 'operator_confirmation',
  });
}

for (const [doc, date, dn, amount] of residualCnTxt) {
  overrides.push({
    id: `EX-${String(id++).padStart(4, '0')}`,
    doc_no: doc,
    doc_type: 'credit_note',
    doc_date: date,
    delivery_ref: dn,
    amount,
    override_type: 'RESIDUAL_CYL_RETURN',
    approval_status: 'approved',
    approved_by: 'operator',
    approved_date: '2026-07-16',
    reason: REASON_RESIDUAL,
    evidence_source: 'operator_confirmation',
  });
}

overrides.push({
  id: `EX-${String(id++).padStart(4, '0')}`,
  payment_doc: '00041529',
  doc_type: 'payment',
  doc_date: '2025-10-06',
  amount: -0.01,
  override_type: 'PAYMENT_CASH_NET',
  approval_status: 'approved',
  approved_by: 'analysis',
  approved_date: '2026-07-16',
  reason:
    'Payment doc 00041529 is a CASH payment (TXT net R0.01). DB holds internal ERP deposit-allocation splits — not commercial payment→CYL allocation for MOZ002.',
  evidence_source: ['raw/MOZ002CURRENT.TXT', 'transaction_headers'],
  slices: payment41529Slices,
});

for (const s of payment41529Slices) {
  const target = String(s.ref).padStart(5, '0');
  overrides.push({
    id: `EX-${String(id++).padStart(4, '0')}`,
    payment_doc: '00041529',
    doc_type: 'payment_allocation_slice',
    doc_date: '2025-10-06',
    target_invoice: `000${target}`.slice(-8),
    amount: -s.amount,
    override_type: s.status,
    approval_status: 'rejected',
    approved_by: 'operator',
    approved_date: '2026-07-16',
    reason:
      s.amount === 0.01
        ? 'Operator confirmed: payments are not allocated to CYL slices for MOZ002. R0.01 slice is ERP housekeeping only — not a payment allocation.'
        : REJECTED_CYL_REASON,
    evidence_source: ['allocation_edges_2025.csv', 'operator_confirmation'],
  });
}

overrides.push({
  id: `EX-${String(id++).padStart(4, '0')}`,
  payment_doc: '00044227',
  doc_type: 'payment',
  doc_date: '2026-05-07',
  amount: -4978.91,
  override_type: 'UNALLOCATED_NO_TARGET',
  approval_status: 'pending',
  approved_by: null,
  approved_date: null,
  reason: 'Operator: no known invoice target. No ERP ref_no. Lag-window no match. Held for investigation.',
  evidence_source: ['raw/MOZ002CURRENT.TXT', 'allocation_edges_2026.csv'],
});

overrides.push({
  id: `EX-${String(id++).padStart(4, '0')}`,
  payment_doc: '00043234',
  doc_type: 'payment',
  doc_date: '2026-02-04',
  amount: -0.01,
  override_type: 'ROUNDING_RESIDUAL',
  approval_status: 'approved',
  approved_by: 'analysis',
  approved_date: '2026-07-16',
  reason: 'R0.01 micro-residual paired with confirmed 48940 allocation on same payment doc.',
  evidence_source: 'allocation_edges_2026.csv',
});

const registry = {
  debtorCode: CODE,
  doctrineVersion: 'allocation-v1',
  matchBasis: 'lpg_only',
  toleranceCents: 5,
  registryVersion: 2,
  approvalPolicy:
    'Per-invoice overrides for partial empty returns (R2,415 / R517.50), payment allocation slices, and unallocated payments.',
  overrides,
};

fs.writeFileSync(path.join(base, 'config/payment_pattern_overrides.json'), JSON.stringify(registry, null, 2) + '\n');

// Exception audit CSV
const auditRows = [
  'exception_id,doc_type,doc_no,doc_date,amount,target_ref,exception_type,approval_status,residual_open,reason',
];
for (const o of overrides) {
  auditRows.push(
    [
      o.id,
      o.doc_type,
      o.payment_doc || o.doc_no || '',
      o.doc_date || '',
      o.amount ?? '',
      o.target_invoice || o.delivery_ref || '',
      o.override_type,
      o.approval_status,
      o.residual_open ?? '',
      `"${(o.reason || '').replace(/"/g, '""')}"`,
    ].join(','),
  );
}
fs.writeFileSync(path.join(base, 'data/allocation_exception_audit.csv'), auditRows.join('\n') + '\n');

// Narrative report
const lines = [];
lines.push('# MOZ002 — Allocation Exceptions (Turn 4)');
lines.push('');
lines.push('**Generated:** 2026-07-16');
lines.push('');
lines.push('## 41529 — excluded from allocation (doctrine)');
lines.push('');
lines.push('**`00041529` is a CASH payment** (TXT net **R0.01**). DB holds internal ERP deposit-allocation splits — **not** commercial payment→invoice links.');
lines.push('');
lines.push('| Layer | Evidence |');
lines.push('| :--- | :--- |');
lines.push('| Account enquiry TXT | `Payment` / `CASH` / **R0.01** net (2025-10-07) |');
lines.push('| DB `transaction_headers` | 13 rows — internal **deposit allocation splits** across empty-invoice refs |');
lines.push('| Operator ruling (2026-07-16) | **Payments are NOT allocated to CYL slices for MOZ002** — empties settle via credit notes only |');
lines.push('');
lines.push('All **9 gross splits (R7,935.01)** on payment 41529 are **rejected** (`REJECTED_CYL_SLICE_EXCLUDED`).');
lines.push('');
lines.push('## Bulk partial empty CN registry (R2,415.00)');
lines.push('');
lines.push(`**${partialCnTxt.length} credit notes** registered — operator confirmed same **1 × 9kg cylinder short** pattern as CN 00014741.`);
lines.push('');
lines.push('| CN doc | Date | DN ref | Amount | Residual |');
lines.push('| :--- | :--- | :--- | ---: | ---: |');
for (const [doc, date, dn, amount] of partialCnTxt) {
  lines.push(`| ${doc} | ${date} | ${dn} | R2,415.00 | R517.50 |`);
}
lines.push('');
lines.push('## Residual R517.50 CN');
lines.push('');
lines.push('| CN doc | Date | DN ref | Amount | Notes |');
lines.push('| :--- | :--- | :--- | ---: | :--- |');
lines.push('| 00012082 | 2025-03-17 | DN#4438-EMPTY | R517.50 | Companion residual posting on same delivery |');
lines.push('');
lines.push('## Open review items');
lines.push('');
lines.push('| Doc | Type | Amount | Status |');
lines.push('| :--- | :--- | ---: | :--- |');
lines.push('| 00044227 | Payment | R4,978.91 | **UNALLOCATED** — operator: no known target |');
lines.push('| 00041529 | Payment (ERP splits) | R7,935.01 gross / R0.01 TXT net | **EXCLUDED** — no CYL payment allocation for MOZ002 |');
lines.push('| 00043234 | Payment | R0.01 | Rounding residual — approved |');
lines.push('');
lines.push('## Artifacts');
lines.push('');
lines.push('| File | Records |');
lines.push('| :--- | ---: |');
lines.push(`| \`config/payment_pattern_overrides.json\` | ${overrides.length} |`);
lines.push(`| \`data/allocation_exception_audit.csv\` | ${overrides.length} |`);
lines.push('');
lines.push('*Generated by `scripts/build_exception_audit.mjs`*');

fs.writeFileSync(path.join(base, 'reports/MOZ002_Allocation_Exceptions_2025_2026.md'), lines.join('\n') + '\n');

console.log(JSON.stringify({ overrides: overrides.length, partialCn: partialCnTxt.length, registryVersion: 2 }, null, 2));
