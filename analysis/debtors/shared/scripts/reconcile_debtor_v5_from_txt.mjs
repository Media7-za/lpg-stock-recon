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

function loadConfig(debtorCode) {
  const configPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'config/statement_v5.json');
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
  const ratificationScenario = loadRatificationScenario(cfg);
  const ratificationRows = ratificationScenario ? buildRatificationRows(ratificationScenario) : [];
  return {
    ...cfg,
    txtPath,
    combinedBf,
    cylOpeningFinancial,
    lpgOpeningBf: Math.round((combinedBf - cylOpeningFinancial) * 100) / 100,
    paymentLane: cfg.paymentLane || 'LPG',
    ratificationScenario,
    ratificationRows,
    reportPath: path.join(
      ROOT,
      `analysis/debtors/${debtorCode}/reports/${debtorCode}_Statement_Account_v5.md`,
    ),
    fixturePath: path.join(
      ROOT,
      `src/features/debtor-position-workspace/data/fixtures/${debtorCode}.v5.json`,
    ),
    skuRates: cfg.skuRates || { '14.1': 575, '19.1': 690, '9.1': 517.5, 'D.1': 1150, 'S.1': 1150 },
    cylOpeningQty: cfg.cylOpeningQty || Object.fromEntries(SKUS.map((s) => [s, 0])),
  };
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
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","([0-9.]+)"/)?.[1]);
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
      const ratNote = r.is_ratification ? ' *(ratification)*' : '';
      lines.push(
        `| ${r.date_str} | ${r.entry_type} | ${r.clean_doc}${ratNote} | ${fmt(r[amountKey])} | ${fmt(r[runningKey])} |`,
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

    financial.push({
      ...r,
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

  const { rows } = parseTxtRows(cfg.txtPath);
  const ratificationInvCn = (cfg.ratificationRows || []).filter((r) => r.is_ratification);
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
        const ratNote = r.is_ratification ? ' *(ratification)*' : '';
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
  const { rows, headerBalance } = parseTxtRows(cfg.txtPath);
  const allRows = mergeRatificationRows(rows, cfg.ratificationRows);

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const docSplit = await fetchDocLineSplit(client, cfg);
  for (const [k, v] of buildRatificationDocSplit(cfg.ratificationRows)) {
    docSplit.set(k, v);
  }
  const { sections: part2, currentCyl } = await buildPart2(client, cfg);
  await client.end();

  const { part1a, part1b, financial, finalLpg, finalCyl, finalCombined } = buildPart1Split(
    allRows,
    cfg,
    docSplit,
  );

  const erpVariance = round2(finalCombined - headerBalance);
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

  const md = `# Statement of Account: ${cfg.debtorName} (${cfg.debtorCode}) - Version 5 (Sub-Ledger Position Statement)
**Period:** ${periodStartLabel} → ${periodEndLabel} &nbsp;|&nbsp; **Account:** ${cfg.debtorCode}
**Combined Opening B/F:** R${fmt(cfg.combinedBf)} (ERP verified — source: \`${txtRel}\` ${cfg.bfSourceNote || ''})
**LPG Opening B/F (1A):** R${fmt(cfg.lpgOpeningBf)} &nbsp;|&nbsp; **CYL Opening B/F (1B):** R${fmt(cfg.cylOpeningFinancial)}
**Payment routing:** ${cfg.paymentLane} lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** ${new Date().toISOString().slice(0, 10)} from ERP TXT (\`reconcile_debtor_v5_from_txt.mjs\`)${cfg.ratificationScenario ? ' · **Ratification scenario active**' : ''}

---

${ratificationSection}

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since ${periodStartLabel}. Payments route to this sub-ledger per debtor config (\`paymentLane: ${cfg.paymentLane}\`).*

${part1a.length ? part1a.join('\n\n---\n\n') : '_No LPG activity in period._'}

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (\`-EMPTY\` / \`EMPTIES\` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

${part1b.length ? part1b.join('\n\n---\n\n') : '_No CYL deposit activity in period._'}

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | ${fmt(finalLpg)} |
| Part 1B — CYL Deposits | ${fmt(finalCyl)} |
| **Combined (1A + 1B)** | **${fmt(finalLpg + finalCyl)}** |
| ERP \`CURRENT BALANCE\` (TXT header) | ${fmt(headerBalance)} |
| **Variance (Combined − ERP)** | **${fmt(erpVariance)}** |

---

${ingestGateSection}

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
**ERP Combined Balance (TXT header):** R${fmt(headerBalance)}  
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
      Math.abs(cylVariance) < 1
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
  fs.mkdirSync(path.dirname(cfg.fixturePath), { recursive: true });
  fs.writeFileSync(cfg.fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);

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
