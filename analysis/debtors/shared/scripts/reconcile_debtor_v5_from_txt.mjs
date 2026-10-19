#!/usr/bin/env node
/**
 * Rebuild debtor Statement of Account v5 from ERP TXT (Tier-3 authority).
 * Part 1 split: 1A LPG Gas | 1B CYL Deposits | Bridge (1A+1B = ERP).
 *
 * Usage: node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor JEN001
 * Config: analysis/debtors/[CODE]/config/statement_v5.json
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const SKUS = ['14.1', '19.1', '9.1', 'D.1', 'S.1'];
const CYL_PATTERN = /[-`#]?EMPTY|EMPTIES/i;
const PAYMENT_TYPES = new Set([
  'Payment',
  'Ud Paymnt',
  'Bank XFer',
  'Bank UD',
  'Bank Dep',
  'Journal',
]);

function loadLatestCoverageReport(debtorCode) {
  const reportDir = path.join(ROOT, 'analysis/debtors', debtorCode, 'reports');
  if (!fs.existsSync(reportDir)) return null;
  const files = fs
    .readdirSync(reportDir)
    .filter((f) => f.match(new RegExp(`^${debtorCode}_INGEST_COVERAGE_\\d{4}-\\d{2}-\\d{2}\\.json$`)))
    .sort();
  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(path.join(reportDir, files.at(-1)), 'utf8'));
}

function buildIngestGateSection(coverage, debtorCode) {
  if (!coverage) {
    return `## Ingest Gate

*No coverage report found. Run \`npm run debtors:ingest-check -- --debtor ${debtorCode}\` before trusting Part 2 qty.*

---
`;
  }

  const gapDocs = coverage.documents.filter(
    (d) =>
      d.in_txt &&
      d.blocks?.includes('custody') &&
      !['HEALTHY', 'EXPECTED_HEADER_ONLY', 'RATIFIED_EXCEPTION'].includes(d.classification),
  );
  const gapList =
    gapDocs.length > 0
      ? gapDocs.map((d) => `- **${d.doc_no}** (${d.doc_type}, ${d.tx_date}) — \`${d.classification}\``).join('\n')
      : '- None';

  const blockedNote =
    coverage.gates.custody === 'BLOCKED'
      ? `> **Custody conclusions blocked.** DB qty may be incomplete or stale vs statement TXT (\`${coverage.statement_txt}\`). See \`${coverage.account_no}_INGEST_COVERAGE_*.md\`.\n\n**INGEST_GAP documents (custody-blocking):**\n${gapList}\n\n`
      : '';

  return `## Ingest Gate (\`ingestFreshness: ${coverage.ingestFreshness}\` · \`ingestCoverage: ${coverage.ingestCoverage}\`)

| Check | Status |
| :--- | :--- |
| Display status | \`${coverage.display_status}\` |
| Financial balance from TXT | **${coverage.gates.financial_balance_from_txt}** |
| Custody / Part 2 qty | **${coverage.gates.custody}** |
| SKU analysis | **${coverage.gates.sku_analysis}** |

${blockedNote}---
`;
}

function buildCustodyBlockedNote(coverage) {
  if (!coverage || coverage.gates?.custody !== 'BLOCKED') return '';
  return `\n> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage \`${coverage.display_status}\`. DB-backed qty may not reflect all TXT documents.\n`;
}

function loadRatificationScenario(cfg) {
  const rel = cfg.ratificationScenariosPath;
  if (!rel) return null;
  const scenarioPath = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  if (!fs.existsSync(scenarioPath)) return null;
  const bundle = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
  if (!bundle.activeScenarioId) return null;
  const scenario = bundle.scenarios?.find((s) => s.id === bundle.activeScenarioId);
  if (!scenario) {
    throw new Error(`Ratification scenario not found: ${bundle.activeScenarioId}`);
  }
  return scenario;
}

function buildRatificationRows(scenario) {
  // A scenario may list several synthetic documents in `rows` (projection of an ERP correction set).
  if (Array.isArray(scenario.rows)) {
    return scenario.rows.map((r) => ({
      lineNo: 99999,
      period: 'RAT',
      doc_no: String(r.doc_no),
      clean_doc: String(r.doc_no),
      entry_type: r.entry_type,
      iso: r.iso,
      ref_no: r.ref_no || '',
      amount: round2(r.amount),
      erp_balance: null,
      is_cyl_only: r.lane === 'CYL',
      is_ratification: true,
      ratification_id: scenario.id,
      ratification_title: scenario.title,
      cyl_qty: r.cylQty || {},
      note_label: r.label || 'projected',
    }));
  }
  const erp = scenario.erpAction;
  const syn = scenario.v5Synthetic;
  const docNo = syn.doc_no;
  const iso = syn.iso || erp.date;
  const amount = round2(erp.amount_incl_vat ?? erp.amount);
  const ref = erp.ref_no;
  const lane = erp.lane || 'CYL';
  const row = {
    lineNo: 99999,
    period: 'RAT',
    doc_no: docNo.padStart(8, '0'),
    clean_doc: docNo,
    entry_type: erp.entry_type || 'Invoice',
    iso,
    ref_no: ref,
    amount,
    erp_balance: null,
    is_cyl_only: lane === 'CYL' || isCylRef(ref),
    is_ratification: true,
    ratification_id: scenario.id,
    ratification_title: scenario.title,
    cyl_qty: syn.cylQty || {},
  };
  return [row];
}

function mergeRatificationRows(rows, ratificationRows) {
  if (!ratificationRows?.length) return rows;
  return [...rows, ...ratificationRows].sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.is_ratification ? 1 : 0) - (b.is_ratification ? 1 : 0) ||
      (a.entry_type === 'Crd Note' ? 1 : 0) - (b.entry_type === 'Crd Note' ? 1 : 0) ||
      a.doc_no.localeCompare(b.doc_no),
  );
}

function buildRatificationDocSplit(ratificationRows) {
  const map = new Map();
  for (const r of ratificationRows || []) {
    if (!r.is_ratification) continue;
    const key = `${r.clean_doc}|${r.entry_type}`;
    const lane = r.is_cyl_only ? 'cyl' : 'lpg';
    map.set(key, {
      lpg: lane === 'lpg' ? r.amount : 0,
      cyl: lane === 'cyl' ? r.amount : 0,
    });
  }
  return map;
}

function buildRatificationSection(scenario, erpVariance) {
  if (!scenario) return '';
  if (Array.isArray(scenario.rows)) {
    return `## Projection Scenario (active)

**ID:** \`${scenario.id}\` · **Status:** ${scenario.status}

${scenario.assumption}

| Projected document | Date | Amount (R) | Lane | Basis |
| :--- | :--- | ---: | :--- | :--- |
${scenario.rows.map((r) => `| ${r.entry_type} ${r.doc_no} | ${r.iso} | ${fmt(r.amount)} | ${r.lane === 'CYL' ? '1B' : '1A'} | ${r.basis || ''} |`).join('\n')}

> **ERP variance expected:** the projected documents are not in the ERP TXT, so the combined balance differs from the ERP by **R${fmt(erpVariance)}** until they are posted.${scenario.notes ? ` ${scenario.notes}` : ''}

---
`;
  }
  const erp = scenario.erpAction;
  return `## Ratification Scenario (active)

**ID:** \`${scenario.id}\` · **Status:** ${scenario.status}

${scenario.assumption}

| Synthetic v5 row | ERP action (when posted) |
| :--- | :--- |
| Doc **${scenario.v5Synthetic.doc_no}** · ${erp.date} · **+R${fmt(erp.amount_incl_vat ?? erp.amount)}** · Part 1B | **${erp.entry_type}** (not ${erp.notEntryType || 'debit note'}) · ref \`${erp.ref_no}\` · ${erp.lines?.[0]?.qty ?? '?'}× ${erp.lines?.[0]?.stock_no ?? 'CYL'} |

> **ERP TXT variance expected:** Combined reconstruct exceeds TXT header by **R${fmt(scenario.expectedEffect?.combinedDeltaVsTxt ?? erpVariance)}** until correction invoice is posted live. See \`docs/RED001_ERP_Agent_Note_CN13687.md\`.

---
`;
}

// Optional `--suffix _Tag`: alternate period statement (config/statement_v5_Tag.json ->
// reports/CODE_Statement_Account_v5_Tag.md). No workspace fixture is written for suffixed runs.
const SUFFIX = process.argv.includes('--suffix') ? process.argv[process.argv.indexOf('--suffix') + 1] : '';

function loadConfig(debtorCode) {
  const configPath = path.join(ROOT, 'analysis/debtors', debtorCode, `config/statement_v5${SUFFIX}.json`);
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Missing config: ${configPath}\nCopy from analysis/debtors/shared/templates/statement_v5_config.template.json`,
    );
  }
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (cfg.debtorCode !== debtorCode) {
    throw new Error(`Config debtorCode ${cfg.debtorCode} does not match --debtor ${debtorCode}`);
  }
  const txtPath = path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(ROOT, cfg.txtPath);
  if (!fs.existsSync(txtPath)) {
    throw new Error(`Missing ERP TXT: ${txtPath}`);
  }
  const cylOpeningFinancial = Number(cfg.cylOpeningFinancial ?? 0);
  const combinedBf = Number(cfg.combinedBf);
  // Optional `quarantineFile` (path relative to the debtor folder): documents held aside from 1A/1B.
  // Optional `quarantineSkip` (item doc_no list): items in the quarantine file this statement does not hold aside.
  const quarantined = (
    cfg.quarantineFile
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'analysis/debtors', debtorCode, cfg.quarantineFile), 'utf8')).items || []
      : []
  ).filter((q) => !(cfg.quarantineSkip || []).includes(String(q.doc_no)));
  // A quarantined payment dated before the window is already inside the ERP opening balance;
  // take it out of the opening 1A balance (documents dated inside the window are held aside by loadTxt).
  const preWindowQuarantine = quarantined.filter((q) => q.date < cfg.periodStart);
  for (const q of preWindowQuarantine) {
    if (q.lane === 'CYL' || !(PAYMENT_TYPES.has(q.entry_type) || q.entry_type === 'Carry')) {
      throw new Error(`Quarantined ${q.entry_type} ${q.doc_no} dated before the window: only LPG-lane payments and carries are supported`);
    }
  }
  const preWindowQuarantineTotal = Math.round(preWindowQuarantine.reduce((sum, q) => sum + Number(q.amount), 0) * 100) / 100;
  // Optional `laneOverridesFile`: SKU lines moved between 1A and 1B by operator decision. Lines dated before the
  // window move the opening balances (and Part 2 opening qty); lines inside it are applied to the line split.
  const laneOverrides = (
    cfg.laneOverridesFile
      ? JSON.parse(fs.readFileSync(path.join(ROOT, 'analysis/debtors', debtorCode, cfg.laneOverridesFile), 'utf8')).items || []
      : []
  ).filter((o) => !cfg.periodEnd || o.date <= cfg.periodEnd);
  const preWindowOverrides = laneOverrides.filter((o) => o.date < cfg.periodStart);
  const cylOpeningQty = { ...(cfg.cylOpeningQty || Object.fromEntries(SKUS.map((s) => [s, 0]))) };
  let overrideCylShift = 0;
  for (const o of preWindowOverrides) {
    const { cyl, qty } = laneOverrideShift(o);
    overrideCylShift += cyl;
    if (SKUS.includes(o.stock_no)) cylOpeningQty[o.stock_no] = (cylOpeningQty[o.stock_no] || 0) + qty;
  }
  const cylOpeningAdjusted = Math.round((cylOpeningFinancial + overrideCylShift) * 100) / 100;
  // Optional `cancellationsFile`: document pairs that cancel exactly (net 0.00), dropped from the statement.
  const cancellations = cfg.cancellationsFile
    ? JSON.parse(fs.readFileSync(path.join(ROOT, 'analysis/debtors', debtorCode, cfg.cancellationsFile), 'utf8')).items || []
    : [];
  const ratificationScenario = loadRatificationScenario(cfg);
  const ratificationRows = ratificationScenario ? buildRatificationRows(ratificationScenario) : [];
  // Synthetic rows dated before the window move the opening balances (combined, the 1B lane if CYL, and
  // the Part 2 opening quantities); rows inside the window are posted in the tables.
  const preWindowRatification = ratificationRows.filter((r) => r.iso < cfg.periodStart);
  let ratCombinedShift = 0;
  let ratCylShift = 0;
  for (const r of preWindowRatification) {
    ratCombinedShift += r.amount;
    if (r.is_cyl_only) ratCylShift += r.amount;
    for (const [sku, qty] of Object.entries(r.cyl_qty || {})) cylOpeningQty[sku] = (cylOpeningQty[sku] || 0) + Number(qty);
  }
  const combinedOpening = Math.round((combinedBf + ratCombinedShift) * 100) / 100;
  const cylOpeningWithRat = Math.round((cylOpeningAdjusted + ratCylShift) * 100) / 100;
  return {
    ...cfg,
    txtPath,
    combinedBf: combinedOpening,
    combinedBfErp: combinedBf,
    preWindowRatification,
    cylOpeningFinancial: cylOpeningWithRat,
    cylOpeningFinancialConfig: cylOpeningFinancial,
    laneOverrides,
    preWindowOverrides,
    cancellations,
    lpgOpeningBf: Math.round((combinedOpening - cylOpeningWithRat - preWindowQuarantineTotal) * 100) / 100,
    paymentLane: cfg.paymentLane || 'LPG',
    ratificationScenario,
    ratificationRows,
    quarantined,
    reportPath: path.join(
      ROOT,
      `analysis/debtors/${debtorCode}/reports/${debtorCode}_Statement_Account_v5${SUFFIX}.md`,
    ),
    fixturePath: path.join(
      ROOT,
      `src/features/debtor-position-workspace/data/fixtures/${debtorCode}.v5.json`,
    ),
    skuRates: cfg.skuRates || { '14.1': 575, '19.1': 690, '9.1': 517.5, 'D.1': 1150, 'S.1': 1150 },
    cylOpeningQty,
  };
}

// Change to the CYL lane (amount) and to Part 2 custody (qty) when a lane override moves a line.
function laneOverrideShift(o) {
  const amount = Number(o.amount);
  const qty = Number(o.qty || 0);
  if (o.fromLane === 'CYL' && o.toLane === 'LPG') return { cyl: -amount, lpg: amount, qty: -qty };
  if (o.fromLane === 'LPG' && o.toLane === 'CYL') return { cyl: amount, lpg: -amount, qty: SKUS.includes(o.stock_no) ? qty : 0 };
  throw new Error(`Lane override ${o.entry_type} ${o.doc_no} ${o.stock_no}: fromLane/toLane must be CYL→LPG or LPG→CYL`);
}

function parseArgs() {
  const idx = process.argv.indexOf('--debtor');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node reconcile_debtor_v5_from_txt.mjs --debtor CODE');
    process.exit(1);
  }
  return process.argv[idx + 1].toUpperCase();
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const fmt = (n) =>
  (Math.abs(Number(n)) < 0.005 ? 0 : Number(n)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function parseCsvLine(line) {
  const out = [];
  let cur = '',
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === ',' && !inQ) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseTxtDate(d) {
  const [dd, mm, yy] = d.split('/');
  const y = yy.length === 2 ? `20${yy}` : yy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function monthKey(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
}

function displayDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

function isCylRef(ref) {
  return CYL_PATTERN.test((ref || '').trim());
}

function parseTxtRows(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!line.startsWith('"') || line.includes('LINE","PERIOD')) continue;
    const p = parseCsvLine(line);
    if (!p[0] || isNaN(+p[0])) continue;
    if (!p[4] || !p[4].includes('/')) continue;
    const iso = parseTxtDate(p[4]);
    rows.push({
      lineNo: +p[0],
      period: p[1],
      doc_no: p[2],
      clean_doc: p[2].replace(/^0+/, '') || p[2],
      entry_type: p[3],
      iso,
      ref_no: (p[6] || '').trim(),
      amount: round2(Number(p[9])),
      erp_balance: round2(Number(p[10])),
      is_cyl_only:
        (p[3] === 'Invoice' || p[3] === 'Crd Note') && isCylRef(p[6]),
    });
  }
  return { rows, headerBalance };
}

// Optional `periodEnd` (ISO date) in config: keep only TXT rows dated on or before it, and take the
// closing check balance from the ERP running balance on the last such row in file order (the TXT
// header balance only describes the end of the whole extract).
function loadTxt(cfg) {
  const parsed = parseTxtRows(cfg.txtPath);
  let rows = parsed.rows;
  let headerBalance = parsed.headerBalance;
  if (cfg.periodEnd) {
    rows = rows.filter((r) => r.iso <= cfg.periodEnd);
    if (!rows.length) throw new Error(`No TXT rows on or before periodEnd ${cfg.periodEnd}`);
    // `erpClosingBalance` (optional) overrides the last-row ERP balance when documents posted after the
    // window were dated inside it, so the last in-window row's running balance is not a closing balance.
    headerBalance = Number(cfg.erpClosingBalance ?? rows.at(-1).erp_balance);
  }
  // Quarantined documents stay in the ERP balance but are held aside from the sub-ledgers.
  // In-window documents are removed from the rows; documents dated before the window are checked
  // against the TXT and reported (their effect is taken out of the opening balance in loadConfig).
  const quarantinedRows = [];
  const quarantinedPre = [];
  for (const q of cfg.quarantined || []) {
    if (cfg.periodEnd && q.date > cfg.periodEnd) continue; // after the window: not part of this statement
    // A `Carry` item holds aside part of the 1A balance rather than one TXT document. Inside the window it
    // posts an offsetting 1A row on its date; before the window loadConfig takes it out of the opening 1A.
    if (q.entry_type === 'Carry') {
      if (q.lane === 'CYL') throw new Error(`Quarantined carry ${q.doc_no}: only LPG-lane carries are supported`);
      const carry = { lineNo: 0, doc_no: String(q.doc_no), clean_doc: String(q.doc_no), entry_type: 'Carry', iso: q.date, ref_no: '', amount: round2(q.amount), erp_balance: null, is_cyl_only: false };
      if (q.date < cfg.periodStart) {
        quarantinedPre.push({ ...carry, quarantine: q });
      } else {
        quarantinedRows.push({ ...carry, quarantine: q });
        rows.push({ ...carry, entry_type: 'Carry held aside', amount: round2(-q.amount) });
      }
      continue;
    }
    const clean = String(q.doc_no).replace(/^0+/, '');
    const matches = (r) =>
      r.clean_doc === clean && r.entry_type === q.entry_type && r.iso === q.date && Math.abs(r.amount - q.amount) < 0.005;
    const idx = rows.findIndex(matches);
    if (idx < 0) throw new Error(`Quarantined ${q.entry_type} ${q.doc_no} (${q.date}, ${q.amount}) not found in TXT`);
    if (q.date < cfg.periodStart) {
      quarantinedPre.push({ ...rows[idx], quarantine: q });
    } else {
      quarantinedRows.push({ ...rows[idx], quarantine: q });
      rows = rows.filter((_, i) => i !== idx);
    }
  }
  // Cancellation pairs wholly inside the window are removed from the rows (they net to 0.00, so the ERP
  // balance needs no bridge line). Pairs wholly before the window are already netted in the opening balance.
  const cancelledRows = [];
  for (const c of cfg.cancellations || []) {
    const inWindow = c.documents.map((d) => d.date >= cfg.periodStart && (!cfg.periodEnd || d.date <= cfg.periodEnd));
    if (inWindow.every((x) => !x)) continue;
    if (!inWindow.every(Boolean)) throw new Error(`Cancellation ${c.id} straddles the statement window`);
    const net = round2(c.documents.reduce((sum, d) => sum + Number(d.amount), 0));
    if (Math.abs(net) >= 0.01) throw new Error(`Cancellation ${c.id} does not net to zero (${net})`);
    for (const d of c.documents) {
      const clean = String(d.doc_no).replace(/^0+/, '');
      const idx = rows.findIndex(
        (r) => r.clean_doc === clean && r.entry_type === d.entry_type && r.iso === d.date && Math.abs(r.amount - Number(d.amount)) < 0.005,
      );
      if (idx < 0) throw new Error(`Cancelled ${d.entry_type} ${d.doc_no} (${d.date}, ${d.amount}) not found in TXT`);
      cancelledRows.push({ ...rows[idx], cancellation: c });
      rows = rows.filter((_, i) => i !== idx);
    }
  }
  return { rows, headerBalance, quarantinedRows, quarantinedPre, cancelledRows };
}

function splitRowAmount(r, docSplit, cfg) {
  if (PAYMENT_TYPES.has(r.entry_type)) {
    if (cfg.paymentLane === 'CYL') return { lpg: 0, cyl: r.amount };
    if (cfg.paymentLane === 'COMBINED') return { lpg: r.amount, cyl: 0 };
    return { lpg: r.amount, cyl: 0 };
  }

  const key = `${r.clean_doc}|${r.entry_type}`;
  const split = docSplit.get(key);
  if (split) {
    const dbTotal = round2(split.lpg + split.cyl);
    if (Math.abs(dbTotal - r.amount) < 0.02) {
      return { lpg: round2(split.lpg), cyl: round2(split.cyl) };
    }
    // Single-lane line detail — route by TXT header even when ref lacks -EMPTY (e.g. CN 13687)
    if (Math.abs(split.lpg) < 0.01 && Math.abs(split.cyl) >= 0.01) {
      return { lpg: 0, cyl: r.amount };
    }
    if (Math.abs(split.cyl) < 0.01 && Math.abs(split.lpg) >= 0.01) {
      return { lpg: r.amount, cyl: 0 };
    }
  }
  if (r.is_cyl_only) return { lpg: 0, cyl: r.amount };
  return { lpg: r.amount, cyl: 0 };
}

function buildLaneSections(financial, lane, openingBf, amountKey, runningKey) {
  const filtered = financial.filter((r) => Math.abs(r[amountKey]) >= 0.01);
  const byMonth = new Map();
  for (const r of filtered) {
    if (!byMonth.has(r.month_key)) byMonth.set(r.month_key, []);
    byMonth.get(r.month_key).push(r);
  }

  const monthKeys = [...byMonth.keys()].sort(
    (a, b) => new Date(`01 ${a}`) - new Date(`01 ${b}`),
  );

  const sections = [];
  for (const mk of monthKeys) {
    const rows = byMonth.get(mk);
    const monthOpening = round2(rows[0][runningKey] - rows[0][amountKey]);
    const lines = [
      `### ${mk}`,
      '',
      '| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |',
      '| :--- | :--- | :--- | ---: | ---: |',
      `| **01 ${mk.slice(0, 3)}** | **Opening Balance** | — | | **${fmt(monthOpening)}** |`,
    ];
    for (const r of rows) {
      const ratNote = r.is_ratification ? ` *(${r.note_label || 'ratification'})*` : '';
      lines.push(
        `| ${r.date_str} | ${r.entry_type} | ${r.clean_doc}${ratNote}${r.doc_note || ''} | ${fmt(r[amountKey])} | ${fmt(r[runningKey])} |`,
      );
    }
    sections.push(lines.join('\n'));
  }

  const closing =
    filtered.length > 0 ? filtered[filtered.length - 1][runningKey] : openingBf;
  return { sections, closing };
}

function buildPart1Split(rows, cfg, docSplit) {
  const periodRows = rows.filter((r) => r.iso >= cfg.periodStart);
  periodRows.sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.entry_type === 'Crd Note' ? 1 : 0) - (b.entry_type === 'Crd Note' ? 1 : 0) ||
      a.doc_no.localeCompare(b.doc_no),
  );

  const financial = [];
  let runningLpg = cfg.lpgOpeningBf;
  let runningCyl = cfg.cylOpeningFinancial;

  for (const r of periodRows) {
    if (Math.abs(r.amount) < 0.01) continue;
    const { lpg, cyl } = splitRowAmount(r, docSplit, cfg);
    if (Math.abs(lpg) < 0.01 && Math.abs(cyl) < 0.01) continue;

    runningLpg = round2(runningLpg + lpg);
    runningCyl = round2(runningCyl + cyl);

    // Mixed gas/deposit documents appear in both lane tables with only that lane's part; documents whose
    // lane split is inferred (not in the database) are flagged via optional `assumedLaneDocs` in config.
    const isSplit = Math.abs(lpg) >= 0.01 && Math.abs(cyl) >= 0.01;
    const isAssumed = (cfg.assumedLaneDocs || []).includes(`${r.clean_doc}|${r.entry_type}`);
    const overrides = (cfg.laneOverrides || []).filter(
      (o) => o.date >= cfg.periodStart && `${o.doc_no}|${o.entry_type}` === `${r.clean_doc}|${r.entry_type}`,
    );
    const noteParts = [
      isSplit ? `split of R${fmt(r.amount)}` : null,
      isAssumed ? 'lane assumed' : null,
      ...overrides.map((o) => `${o.stock_no} R${fmt(o.amount)} moved to ${o.toLane === 'LPG' ? '1A' : '1B'}, lane override ${o.status || ''}`.trim()),
    ].filter(Boolean);
    financial.push({
      ...r,
      doc_note: noteParts.length ? ` *(${noteParts.join('; ')})*` : '',
      month_key: monthKey(r.iso),
      date_str: displayDate(r.iso),
      lpg_amount: lpg,
      cyl_amount: cyl,
      running_lpg: runningLpg,
      running_cyl: runningCyl,
      running_combined: round2(runningLpg + runningCyl),
    });
  }

  const part1a = buildLaneSections(financial, 'lpg', cfg.lpgOpeningBf, 'lpg_amount', 'running_lpg');
  const part1b = buildLaneSections(
    financial,
    'cyl',
    cfg.cylOpeningFinancial,
    'cyl_amount',
    'running_cyl',
  );

  const finalCombined = financial.length
    ? financial[financial.length - 1].running_combined
    : cfg.combinedBf;

  return {
    part1a: part1a.sections,
    part1b: part1b.sections,
    financial,
    finalLpg: part1a.closing,
    finalCyl: part1b.closing,
    finalCombined,
  };
}

async function fetchDocLineSplit(client, cfg) {
  const res = await client.query(
    `
    WITH deduped AS (
      SELECT DISTINCT ON (LTRIM(doc_no,'0'), entry_type, debt_group, stock_no, category, line_total)
        LTRIM(doc_no,'0') AS doc_no, entry_type, debt_group, line_total
      FROM vw_clean_transactions
      WHERE account_no = $2 AND tx_date >= $1
        AND entry_type IN ('Invoice', 'Crd Note')
      ORDER BY LTRIM(doc_no,'0'), entry_type, debt_group, stock_no, category, line_total, id DESC
    )
    SELECT doc_no, entry_type, debt_group,
      ROUND(SUM(line_total)::numeric, 2)::float AS s
    FROM deduped
    GROUP BY doc_no, entry_type, debt_group`,
    [cfg.periodStart, cfg.debtorCode],
  );
  const map = new Map();
  for (const r of res.rows) {
    const key = `${r.doc_no}|${r.entry_type}`;
    if (!map.has(key)) map.set(key, { lpg: 0, cyl: 0 });
    const bucket = map.get(key);
    if (r.debt_group === 'CYL') bucket.cyl = round2(bucket.cyl + Number(r.s));
    else bucket.lpg = round2(bucket.lpg + Number(r.s));
  }
  return map;
}

async function buildPart2(client, cfg) {
  const cylRes = await client.query(
    `
    WITH deduped AS (
      SELECT DISTINCT ON (LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty)
        tx_date::text AS tx_date, LTRIM(doc_no,'0') AS doc_no, entry_type, stock_no, qty
      FROM vw_clean_transactions
      WHERE account_no = $2 AND debt_group = 'CYL' AND tx_date >= $1
      ORDER BY LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty, id DESC
    )
    SELECT tx_date, doc_no, entry_type, stock_no, SUM(qty)::int AS qty
    FROM deduped
    GROUP BY tx_date, doc_no, entry_type, stock_no
    ORDER BY tx_date, doc_no`,
    [cfg.periodStart, cfg.debtorCode],
  );

  const cylLookup = new Map();
  for (const c of cylRes.rows) {
    const docKey = `${c.doc_no.replace(/^0+/, '')}|${c.entry_type}`;
    if (!cylLookup.has(docKey)) cylLookup.set(docKey, {});
    const bucket = cylLookup.get(docKey);
    bucket[c.stock_no] = (bucket[c.stock_no] || 0) + c.qty;
  }
  for (const o of (cfg.laneOverrides || []).filter((x) => x.date >= cfg.periodStart)) {
    const { qty } = laneOverrideShift(o);
    if (!qty) continue;
    const key = `${o.doc_no}|${o.entry_type}`;
    if (!cylLookup.has(key)) cylLookup.set(key, {});
    const bucket = cylLookup.get(key);
    bucket[o.stock_no] = (bucket[o.stock_no] || 0) + qty;
  }

  const { rows } = loadTxt(cfg);
  const ratificationInvCn = (cfg.ratificationRows || []).filter((r) => r.is_ratification && r.iso >= cfg.periodStart);
  const periodRows = [
    ...rows.filter(
      (r) => r.iso >= cfg.periodStart && (r.entry_type === 'Invoice' || r.entry_type === 'Crd Note'),
    ),
    ...ratificationInvCn,
  ].sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.entry_type === 'Crd Note' ? 1 : 0) - (b.entry_type === 'Crd Note' ? 1 : 0) ||
      a.doc_no.localeCompare(b.doc_no),
  );

  for (const r of ratificationInvCn) {
    const key = `${r.clean_doc}|${r.entry_type}`;
    if (!cylLookup.has(key)) cylLookup.set(key, {});
    const bucket = cylLookup.get(key);
    for (const [sku, qty] of Object.entries(r.cyl_qty || {})) {
      bucket[sku] = (bucket[sku] || 0) + Number(qty);
    }
  }

  const byMonth = new Map();
  for (const r of periodRows) {
    const mk = monthKey(r.iso);
    if (!byMonth.has(mk)) byMonth.set(mk, []);
    byMonth.get(mk).push(r);
  }

  const monthKeys = [...byMonth.keys()].sort(
    (a, b) => new Date(`01 ${a}`) - new Date(`01 ${b}`),
  );

  const currentCyl = { ...cfg.cylOpeningQty };
  const sections = [];

  for (const mk of monthKeys) {
    const lines = [
      `### ${mk}`,
      '| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |',
      '| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |',
      `| **01 ${mk.slice(0, 3)}** | **Opening Balance** | — | **${currentCyl['14.1']}** | **${currentCyl['19.1']}** | **${currentCyl['9.1']}** | **${currentCyl['D.1']}** | **${currentCyl['S.1']}** |`,
    ];

    for (const r of byMonth.get(mk)) {
      const key = `${r.clean_doc}|${r.entry_type}`;
      const changes = cylLookup.get(key);
      if (!changes) continue;
      const changeStrs = SKUS.map((s) => {
        const c = changes[s] || 0;
        currentCyl[s] += c;
        if (c > 0) return `+${c}`;
        if (c < 0) return `${c}`;
        return '0';
      });
      if (changeStrs.some((x) => x !== '0')) {
        const ratNote = r.is_ratification ? ` *(${r.note_label || 'ratification'})*` : '';
        lines.push(
          `| ${displayDate(r.iso)} | ${r.entry_type} | ${r.clean_doc}${ratNote} | ${changeStrs.join(' | ')} |`,
        );
      }
    }
    lines.push(
      `| **End ${mk.slice(0, 3)}** | **Closing Balance** | — | **${currentCyl['14.1']}** | **${currentCyl['19.1']}** | **${currentCyl['9.1']}** | **${currentCyl['D.1']}** | **${currentCyl['S.1']}** |`,
    );
    sections.push(lines.join('\n'));
  }

  return { sections, currentCyl };
}

async function main() {
  const debtorCode = parseArgs();
  const cfg = loadConfig(debtorCode);
  const { rows, headerBalance, quarantinedRows: quarantinedInWindow, quarantinedPre, cancelledRows } = loadTxt(cfg);
  const quarantinedRows = [...quarantinedPre, ...quarantinedInWindow].sort((a, b) => a.iso.localeCompare(b.iso));
  const allRows = mergeRatificationRows(rows, cfg.ratificationRows);

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const docSplit = await fetchDocLineSplit(client, cfg);
  for (const [k, v] of buildRatificationDocSplit(cfg.ratificationRows)) {
    docSplit.set(k, v);
  }
  for (const o of cfg.laneOverrides.filter((x) => x.date >= cfg.periodStart)) {
    const key = `${o.doc_no}|${o.entry_type}`;
    const bucket = docSplit.get(key);
    if (!bucket) throw new Error(`Lane override ${key}: no line split in the database for this document`);
    const { cyl, lpg } = laneOverrideShift(o);
    bucket.cyl = round2(bucket.cyl + cyl);
    bucket.lpg = round2(bucket.lpg + lpg);
  }
  const { sections: part2, currentCyl } = await buildPart2(client, cfg);
  await client.end();

  const { part1a, part1b, financial, finalLpg, finalCyl, finalCombined } = buildPart1Split(
    allRows,
    cfg,
    docSplit,
  );

  const quarantinedTotal = round2(quarantinedRows.reduce((sum, r) => sum + r.amount, 0));
  const erpExpected = round2(headerBalance - quarantinedTotal);
  const erpVariance = round2(finalCombined - erpExpected);
  const subLedgerVariance = round2(finalLpg + finalCyl - finalCombined);

  const custodyLines = SKUS.map((sku) => ({
    sku,
    label: sku === '19.1' ? '19kg' : sku === '9.1' ? '9kg' : sku === '14.1' ? '14kg' : sku,
    qty: currentCyl[sku],
    rate: cfg.skuRates[sku],
  })).filter((l) => l.qty !== 0);

  const totalCustodyExposure = round2(
    custodyLines.reduce((s, l) => s + l.qty * l.rate, 0),
  );
  const cylVariance = round2(finalCyl - totalCustodyExposure);

  const lastIso = financial.at(-1)?.iso || cfg.periodStart;
  const periodEndLabel = displayDate(lastIso).split(' ').slice(1).join(' ');
  const periodStartLabel = displayDate(cfg.periodStart).split(' ').slice(1).join(' ');
  const txtRel = path.relative(ROOT, cfg.txtPath);
  const coverage = loadLatestCoverageReport(cfg.debtorCode);
  const ingestGateSection = buildIngestGateSection(coverage, cfg.debtorCode);
  const custodyBlockedNote = buildCustodyBlockedNote(coverage);
  const ratificationSection = buildRatificationSection(cfg.ratificationScenario, erpVariance);

  const laneLegend =
    (financial.some((r) => (r.doc_note || '').includes('split'))
      ? ' Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane\'s part of that total.'
      : '') +
    (financial.some((r) => (r.doc_note || '').includes('lane assumed'))
      ? ' `(lane assumed)` means the document is not yet in the database, so its gas/cylinder split is inferred from its amount, not proven.'
      : '');
  const quarantineBridgeRows = quarantinedRows.length
    ? `\n| Less: quarantined documents held aside | ${fmt(quarantinedTotal)} |\n| **ERP balance excluding quarantined documents** | **${fmt(erpExpected)}** |`
    : '';
  const quarantineSection = quarantinedRows.length
    ? `## Quarantined Documents (held aside)

| Date | Entry Type | Doc # | Amount (R) | Would post to | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
${quarantinedRows
  .map((r) => `| ${r.date_str || displayDate(r.iso)} | ${r.entry_type} | ${r.clean_doc} | ${fmt(r.amount)} | ${cfg.paymentLane === 'CYL' ? '1B' : '1A'} | ${r.quarantine.decision} (${r.quarantine.decidedOn}) |`)
  .join('\n')}

*Held aside from Part 1A and 1B and the running balances above, pending review (documents dated before this period are excluded from the opening balances). They remain in the ERP balance, so the bridge shows them as a reconciling line. Record: \`${cfg.quarantineFile}\`.*

---
`
    : '';
  const cancelledSection = cancelledRows.length
    ? `## Cancelled Documents (removed from this statement)

| Date | Entry Type | Doc # | Amount (R) | Pair | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
${cancelledRows
  .map((r) => `| ${displayDate(r.iso)} | ${r.entry_type} | ${r.clean_doc} | ${fmt(r.amount)} | ${r.cancellation.id} | ${r.cancellation.decision} (${r.cancellation.decidedBy}, ${r.cancellation.decidedOn}) |`)
  .join('\n')}

*Each pair cancels exactly (net R0.00), so it is left out of Part 1A, 1B and Part 2; the ERP balance is unchanged. Record: \`${cfg.cancellationsFile}\`.*

---
`
    : '';
  const preWindowHeader = quarantinedPre.length
    ? `\n**Quarantine adjustment:** opening 1A excludes quarantined ${quarantinedPre
        .map((r) => `${r.entry_type.toLowerCase()} ${r.clean_doc} (${displayDate(r.iso)}, R${fmt(r.amount)})`)
        .join('; ')}, dated before this period; the combined opening B/F above is the ERP figure.`
    : '';
  const overrideHeader = cfg.preWindowOverrides.length
    ? `\n**Lane override adjustment:** opening 1B is R${fmt(cfg.cylOpeningFinancialConfig)} per config, adjusted for ${cfg.preWindowOverrides
        .map((o) => `${o.entry_type.toLowerCase()} ${o.doc_no} ${o.stock_no} ×${o.qty} (${displayDate(o.date)}, R${fmt(o.amount)}) moved to ${o.toLane === 'LPG' ? '1A' : '1B'} (${o.status})`)
        .join('; ')}; opening 1A moves by the same amount. Record: \`${cfg.laneOverridesFile}\`.`
    : '';
  const overrideLegend = financial.some((r) => (r.doc_note || '').includes('lane override'))
    ? ` \`lane override\` marks a line moved between 1A and 1B by operator decision (record: \`${cfg.laneOverridesFile}\`).`
    : '';
  const quarantineSummary = quarantinedRows.length
    ? `\n**Quarantined documents (held aside):** R${fmt(quarantinedTotal)}  \n**ERP balance excluding quarantined documents:** R${fmt(erpExpected)}  `
    : '';

  const md = `# Statement of Account: ${cfg.debtorName} (${cfg.debtorCode}) - Version 5 (Sub-Ledger Position Statement)
**Period:** ${periodStartLabel} → ${periodEndLabel} &nbsp;|&nbsp; **Account:** ${cfg.debtorCode}
**Combined Opening B/F:** R${fmt(cfg.combinedBfErp)} (ERP verified — source: \`${txtRel}\` ${cfg.bfSourceNote || ''})
**LPG Opening B/F (1A):** R${fmt(cfg.lpgOpeningBf)} &nbsp;|&nbsp; **CYL Opening B/F (1B):** R${fmt(cfg.cylOpeningFinancial)}${preWindowHeader}${overrideHeader}${cfg.preWindowRatification.length ? `\n**Projection adjustment:** opening balances include projected ${cfg.preWindowRatification.map((r) => `${r.entry_type.toLowerCase()} ${r.clean_doc} (${displayDate(r.iso)}, R${fmt(r.amount)}, ${r.is_cyl_only ? '1B' : '1A'}${Object.keys(r.cyl_qty || {}).length ? `; Part 2 ${Object.entries(r.cyl_qty).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ')}` : ''})`).join('; ')}, dated before this period; combined opening with projection R${fmt(cfg.combinedBf)}.` : ''}
**Payment routing:** ${cfg.paymentLane} lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** ${new Date().toISOString().slice(0, 10)} from ERP TXT (\`reconcile_debtor_v5_from_txt.mjs\`)${cfg.ratificationScenario ? ' · **Ratification scenario active**' : ''}

---

${ratificationSection}

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since ${periodStartLabel}. Payments route to this sub-ledger per debtor config (\`paymentLane: ${cfg.paymentLane}\`).${laneLegend}${overrideLegend}*

${part1a.length ? part1a.join('\n\n---\n\n') : '_No LPG activity in period._'}

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (\`-EMPTY\` / \`EMPTIES\` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.${laneLegend}${overrideLegend}*

${part1b.length ? part1b.join('\n\n---\n\n') : '_No CYL deposit activity in period._'}

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | ${fmt(finalLpg)} |
| Part 1B — CYL Deposits | ${fmt(finalCyl)} |
| **Combined (1A + 1B)** | **${fmt(finalLpg + finalCyl)}** |
| ERP \`CURRENT BALANCE\` (TXT header) | ${fmt(headerBalance)} |${quarantineBridgeRows}
| **Variance (Combined − ERP${quarantinedRows.length ? ' excl. quarantine' : ''})** | **${fmt(erpVariance)}** |

---

${quarantineSection}
${cancelledSection}${ingestGateSection}

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per \`config/statement_v5.json\`.${coverage?.gates?.custody === 'BLOCKED' ? ' **Gate: custody BLOCKED — see Ingest Gate above.**' : ''}*

${part2.join('\n\n---\n\n')}

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R${fmt(finalLpg)} |
| Cylinder Financial Balance (Part 1B close) | R${fmt(finalCyl)} |
| **Total Debtor Balance** | **R${fmt(finalCombined)}** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
${custodyLines.length ? custodyLines.map((l) => `| ${l.label} | ${l.qty} | R${fmt(l.rate)} | R${fmt(l.qty * l.rate)} |`).join('\n') : '| — | 0 | — | R0.00 |'}
| **Total** | **${custodyLines.reduce((s, l) => s + l.qty, 0)}** | — | **R${fmt(totalCustodyExposure)}** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R${fmt(finalCyl)} | R${fmt(totalCustodyExposure)} | R${fmt(cylVariance)} |
| Sub-ledger tie (1A + 1B vs combined) | R${fmt(finalCombined)} | — | R${fmt(subLedgerVariance)} |
${custodyBlockedNote}
**ERP Combined Balance (TXT header):** R${fmt(headerBalance)}  ${quarantineSummary}
**Reconstructed Balance (1A + 1B):** R${fmt(finalCombined)}  
**Variance:** R${fmt(erpVariance)}

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
`;

  fs.mkdirSync(path.dirname(cfg.reportPath), { recursive: true });
  fs.writeFileSync(cfg.reportPath, md);

  // Boundary (DEBTORS_DOCTRINE.md D18 / PROJECT_PROJECTION_SCHEMA.md "collectable —
  // derivation rule"): this generator computes Statement-of-Account sub-ledger
  // positions only (LPG gas debt, cylinder financial balance, custody exposure,
  // reconciliation variances). It must NEVER compute or emit a `collectable` field.
  // If a collectable figure is ever needed on this fixture, it must be read verbatim
  // from project.json.financials.collectable — never derived here from ERP TXT rows,
  // totalOutstanding, aged balances, or the statement arithmetic below.
  const fixture = {
    debtorCode: cfg.debtorCode,
    debtorName: cfg.debtorName,
    period: { from: cfg.periodStart, to: lastIso },
    version: 'v5',
    // Application workflow status only (DebtorWorkspaceStatus) — not constitutional
    // reconState, not D17/D18 collections eligibility, not ingestGate.displayStatus.
    workspaceStatus:
      Math.abs(erpVariance) < 0.02 &&
      Math.abs(subLedgerVariance) < 0.02 &&
      Math.abs(cylVariance) < 1 &&
      quarantinedRows.length === 0
        ? 'clean'
        : 'pending_review',
    lastGeneratedAt: new Date().toISOString(),
    source: txtRel,
    financialPosition: {
      lpgGasDebt: finalLpg,
      cylinderFinancialBalance: finalCyl,
      totalDebtorBalance: finalCombined,
      erpStatedBalance: headerBalance,
      erpVariance,
      subLedgerVariance,
    },
    custodyPosition: {
      totalCustodyExposure,
      lines: custodyLines.map((l) => ({
        sku: l.sku,
        label: l.label,
        qty: l.qty,
        depositRate: l.rate,
        exposure: round2(l.qty * l.rate),
      })),
    },
    reconciliationPosition: {
      cylinderVariance: cylVariance,
      erpVariance,
      subLedgerVariance,
      // Typed per StatementException (debtorWorkspace.ts). basis: 'ASSERTED' — a
      // computed variance is a stated fact, not yet closed to zero (not PROVEN) and
      // not a hypothesis (not ASSUMED). status: 'open' — freshly detected on this
      // run; resolution is a human/evidence action, never assumed by the generator.
      // Boundary: these are Statement-of-Account exceptions only — NEVER copied into
      // collections.blockers. A D18 blocker requires its own evidence-backed
      // assessment, not an inference from statement variance.
      exceptions: [
        ...(Math.abs(erpVariance) >= 0.02
          ? [{ type: 'VARIANCE', basis: 'ASSERTED', status: 'open', description: 'Part 1 bridge differs from ERP TXT header' }]
          : []),
        ...(Math.abs(subLedgerVariance) >= 0.02
          ? [{ type: 'VARIANCE', basis: 'ASSERTED', status: 'open', description: 'Part 1A + 1B closing does not tie to combined running balance' }]
          : []),
        ...(quarantinedRows.length
          ? [{ type: 'OTHER', basis: 'ASSERTED', status: 'open', description: `Quarantined documents held aside from 1A/1B: ${quarantinedRows.map((r) => `${r.entry_type} ${r.clean_doc}`).join(', ')}` }]
          : []),
        ...(Math.abs(cylVariance) >= 1
          ? [{ type: 'CUSTODY', basis: 'ASSERTED', status: 'open', description: 'Part 1B financial vs Part 2 custody — check DB ingest vs TXT' }]
          : []),
      ],
    },
    artifacts: {
      statementMarkdown: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_Statement_Account_v5.md`,
      txtSource: txtRel,
    },
  };
  if (!SUFFIX) {
    fs.mkdirSync(path.dirname(cfg.fixturePath), { recursive: true });
    fs.writeFileSync(cfg.fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);
  }

  console.log(`[${cfg.debtorCode}] TXT header: R${fmt(headerBalance)}`);
  console.log(`[${cfg.debtorCode}] Part 1A LPG close: R${fmt(finalLpg)}`);
  console.log(`[${cfg.debtorCode}] Part 1B CYL close: R${fmt(finalCyl)}`);
  console.log(
    `[${cfg.debtorCode}] Combined 1A+1B: R${fmt(finalCombined)} (ERP variance R${fmt(erpVariance)})`,
  );
  console.log(`[${cfg.debtorCode}] Sub-ledger tie variance: R${fmt(subLedgerVariance)}`);
  console.log(`[${cfg.debtorCode}] Custody exposure: R${fmt(totalCustodyExposure)}`);
  console.log(`Written ${cfg.reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
