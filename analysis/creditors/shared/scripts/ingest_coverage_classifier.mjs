/**
 * Creditor (Accounts Payable) ingest requirements for TXT ↔ DB coverage checks.
 *
 * Mirrors the debtor classifier but maps AP document literals: the supplier
 * charge is a `GRV` (goods received voucher, the AP analogue of an Invoice) and
 * the supplier credit is a `Deb Note` (the AP analogue of a Crd Note). Payment
 * families are unchanged. Shared classification logic is re-exported verbatim so
 * the two lanes stay in lock-step.
 */
export {
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from '../../../debtors/shared/scripts/ingest_coverage_classifier.mjs';

/** @typedef {'header_and_lines' | 'header_only' | 'unresolved'} IngestShape */

/** @type {Record<string, IngestShape>} */
export const CREDITOR_ENTRY_INGEST_SHAPE = {
  GRV: 'header_and_lines',
  'Deb Note': 'header_and_lines',
  Payment: 'header_only',
  'Ud Paymnt': 'header_only',
  'Bank XFer': 'header_only',
  'Bank Dep': 'header_only',
  Journal: 'header_only',
  'Bank UD': 'unresolved',
};

/**
 * @param {string} entryType ERP ENTRY column literal (AP side)
 * @returns {IngestShape}
 */
export function ingestShapeForEntryType(entryType) {
  return CREDITOR_ENTRY_INGEST_SHAPE[entryType] ?? 'unresolved';
}
