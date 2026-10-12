/**
 * Creditor ingest shapes — STDatabase line items + ERP TXT authority.
 *
 * Creditors do not ingest AP headers via DTRX (debtor lane). GRV/Deb Note custody
 * comes from CURRENT.TXT line items; payments are Tier-3 TXT only.
 */
export {
  ingestShapeForEntryType as debtorIngestShapeForEntryType,
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from '../../../debtors/shared/scripts/ingest_coverage_classifier.mjs';

/** @type {Record<string, import('../../../debtors/shared/scripts/ingest_coverage_classifier.mjs').IngestShape>} */
const CREDITOR_ENTRY_INGEST_SHAPE = {
  GRV: 'lines_only',
  'Deb Note': 'lines_only',
  Payment: 'txt_only',
  'Ud Paymnt': 'txt_only',
  'Bank XFer': 'txt_only',
  'Bank Dep': 'txt_only',
  Journal: 'txt_only',
  'Ud XFer': 'txt_only',
  Expense: 'txt_only',
  'Bank UD': 'unresolved',
};

/**
 * @param {string} entryType
 * @returns {import('../../../debtors/shared/scripts/ingest_coverage_classifier.mjs').IngestShape}
 */
export function ingestShapeForEntryType(entryType) {
  if (CREDITOR_ENTRY_INGEST_SHAPE[entryType]) {
    return CREDITOR_ENTRY_INGEST_SHAPE[entryType];
  }
  return debtorIngestShapeForEntryType(entryType);
}
