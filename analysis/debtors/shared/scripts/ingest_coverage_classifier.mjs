/**
 * Canonical ERP document ingest requirements for TXT ↔ DB coverage checks.
 * Aligns with CURRENT_STATE.md DTRX literals and LANE_1_INPUT_INGESTION.md.
 */

/** @typedef {'header_and_lines' | 'header_only' | 'lines_only' | 'txt_only' | 'unresolved'} IngestShape */

/** @type {Record<string, IngestShape>} */
export const ENTRY_INGEST_SHAPE = {
  Invoice: 'header_and_lines',
  'Crd Note': 'header_and_lines',
  Payment: 'header_only',
  'Ud Paymnt': 'header_only',
  'Bank XFer': 'header_only',
  'Bank Dep': 'header_only',
  Journal: 'header_only',
  'Bank UD': 'unresolved',
};

/** @typedef {'HEALTHY' | 'MISSING_HEADER' | 'MISSING_LINES' | 'MISSING_HEADER_AND_LINES' | 'DB_ONLY_DOCUMENT' | 'EXPECTED_HEADER_ONLY' | 'EXPECTED_TXT_ONLY' | 'DOCUMENT_TYPE_UNRESOLVED' | 'RATIFIED_EXCEPTION'} CoverageClassification */

/**
 * @param {string} entryType ERP ENTRY column literal
 * @returns {IngestShape}
 */
export function ingestShapeForEntryType(entryType) {
  return ENTRY_INGEST_SHAPE[entryType] ?? 'unresolved';
}

/**
 * @param {object} p
 * @param {boolean} p.inTxt
 * @param {boolean} p.headerPresent
 * @param {boolean} p.linesPresent
 * @param {IngestShape} p.requiredShape
 * @param {boolean} [p.ratified]
 * @returns {CoverageClassification}
 */
export function classifyDocument({ inTxt, headerPresent, linesPresent, requiredShape, ratified = false }) {
  if (ratified) return 'RATIFIED_EXCEPTION';
  if (!inTxt && (headerPresent || linesPresent)) return 'DB_ONLY_DOCUMENT';
  if (!inTxt) return 'HEALTHY'; // not applicable — caller should filter

  if (requiredShape === 'unresolved') return 'DOCUMENT_TYPE_UNRESOLVED';

  if (requiredShape === 'header_only') {
    if (headerPresent) return 'EXPECTED_HEADER_ONLY';
    return 'MISSING_HEADER';
  }

  if (requiredShape === 'lines_only') {
    if (linesPresent) return 'HEALTHY';
    return 'MISSING_LINES';
  }

  if (requiredShape === 'txt_only') {
    return 'EXPECTED_TXT_ONLY';
  }

  // header_and_lines
  if (headerPresent && linesPresent) return 'HEALTHY';
  if (!headerPresent && !linesPresent) return 'MISSING_HEADER_AND_LINES';
  if (!headerPresent) return 'MISSING_HEADER';
  return 'MISSING_LINES';
}

/** @type {Record<CoverageClassification, string[]>} */
export const CLASSIFICATION_BLOCKS = {
  HEALTHY: [],
  EXPECTED_HEADER_ONLY: [],
  EXPECTED_TXT_ONLY: [],
  MISSING_HEADER: ['custody', 'sku_analysis', 'allocation'],
  MISSING_LINES: ['custody', 'sku_analysis', 'allocation'],
  MISSING_HEADER_AND_LINES: ['custody', 'sku_analysis', 'allocation'],
  DB_ONLY_DOCUMENT: ['financial_bridge_from_txt'],
  DOCUMENT_TYPE_UNRESOLVED: ['custody', 'sku_analysis', 'allocation'],
  RATIFIED_EXCEPTION: [],
};

/**
 * @param {'current' | 'stale' | 'unverified'} freshness
 * @param {'complete' | 'partial' | 'unverified'} coverage
 */
export function deriveDisplayStatus(freshness, coverage) {
  if (freshness === 'unverified' || coverage === 'unverified') return 'UNVERIFIED';
  const f = freshness === 'current' ? 'CURRENT' : 'STALE';
  const c = coverage === 'complete' ? 'COMPLETE' : 'PARTIAL';
  return `${f}_${c}`;
}

/**
 * @param {CoverageClassification} c
 * @returns {boolean}
 */
export function classificationIsPass(c) {
  return (
    c === 'HEALTHY' ||
    c === 'EXPECTED_HEADER_ONLY' ||
    c === 'EXPECTED_TXT_ONLY' ||
    c === 'RATIFIED_EXCEPTION'
  );
}
