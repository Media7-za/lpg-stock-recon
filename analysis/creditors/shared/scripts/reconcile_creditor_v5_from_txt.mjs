#!/usr/bin/env node
/**
 * Rebuild creditor Analysis Statement v5 from ERP TXT (Tier-3 authority).
 * Accounts Payable fork of reconcile_debtor_v5_from_txt.mjs.
 *
 * Part 1 split: 1A LPG Gas Purchases | 1B CYL Deposits | Bridge (1A+1B = ERP).
 * AP direction: a GRV increases the payable (+), a Deb Note and a Payment
 * reduce it (−). Signs are carried by the TXT AMOUNT column, so the running-
 * balance arithmetic is identical to the debtor lane — only the document
 * literals, account scope (creditor + linked legacy account) and labels differ.
 *
 * DB-optional: when DATABASE_URL is unset the line-split (Part 1B) and custody
 * (Part 2) queries are skipped and every financial row routes to Part 1A. The
 * ERP TXT financial bridge still reconciles to R0.00; custody is left blank and
 * flagged UNVERIFIED by the ingest gate (see validate_txt_db_coverage.mjs).
 *
 * Usage: node analysis/creditors/shared/scripts/reconcile_creditor_v5_from_txt.mjs --creditor 008ORY
 * Config: analysis/creditors/[CODE]/config/statement_v5.json
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions, hasDatabaseUrl } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const SKUS = ['14.1', '19.1', '9.1', 'D.1', 'S.1'];
const CYL_PATTERN = /[-`#]?EMPTY|EMPTIES/i;
const DOCUMENT_TYPES = new Set(['GRV', 'Deb Note']);
const PAYMENT_TYPES = new Set([
  'Payment',
  'Ud Paymnt',
  'Bank XFer',
  'Bank UD',
  'Bank Dep',
  'Journal',
]);

function loadLatestCoverageReport(creditorCode) {
  const reportDir = path.join(ROOT, 'analysis/creditors', creditorCode, 'reports');
  if (!fs.existsSync(reportDir)) return null;
  const files = fs
    .readdirSync(reportDir)
    .filter((f) => f.match(new RegExp(`^${creditorCode}_INGEST_COVERAGE_\\d{4}-\\d{2}-\\d{2}\\.json$`)))
    .sort();
  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(path.join(reportDir, files.at(-1)), 'utf8'));
}

function buildIngestGateSection(coverage, creditorCode) {
  if (!coverage) {
    return `## Ingest Gate

*No coverage report found. Run \`npm run creditors:ingest-check -- --creditor ${creditorCode}\` before trusting Part 2 qty.*

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
    coverage.gates.custody === 'BLOCKED' || coverage.gates.custody === 'UNVERIFIED'
      ? `> **Custody conclusions ${coverage.gates.custody === 'UNVERIFIED' ? 'unverified' : 'blocked'}.** DB qty may be incomplete, stale, or unavailable vs statement TXT (\`${coverage.statement_txt}\`). See \`${coverage.account_no}_INGEST_COVERAGE_*.md\`.\n\n**Custody-blocking documents:**\n${gapList}\n\n`
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
  if (!coverage) return '';
  const custody = coverage.gates?.custody;
  if (custody !== 'BLOCKED' && custody !== 'UNVERIFIED') return '';
  return `\n> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage \`${coverage.display_status}\`. DB-backed qty may not reflect all TXT documents.\n`;
}

function loadConfig(creditorCode) {
  const configPath = path.join(ROOT, 'analysis/creditors', creditorCode, 'config/statement_v5.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Missing config: ${configPath}\nCopy from analysis/creditors/shared/templates/statement_v5_config.template.json`,
    );
  }
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (cfg.creditorCode !== creditorCode) {
    throw new Error(`Config creditorCode ${cfg.creditorCode} does not match --creditor ${creditorCode}`);
  }
  const txtPath = path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(ROOT, cfg.txtPath);
  if (!fs.existsSync(txtPath)) {
    throw new Error(`Missing ERP TXT: ${txtPath}`);
  }
  const cylOpeningFinancial = Number(cfg.cylOpeningFinancial ?? 0);
  const combinedBf = Number(cfg.combinedBf);
  return {
    ...cfg,
    txtPath,
    combinedBf,
    cylOpeningFinancial,
    lpgOpeningBf: Math.round((combinedBf - cylOpeningFinancial) * 100) / 100,
    paymentLane: cfg.paymentLane || 'LPG',
    linkedAccounts: cfg.linkedAccounts || [],
    reportPath: path.join(
      ROOT,
      `analysis/creditors/${creditorCode}/reports/${creditorCode}_Statement_Account_v5.md`,
    ),
    fixturePath: path.join(
      ROOT,
      `src/features/creditor-position-workspace/data/fixtures/${creditorCode}.v5.json`,
    ),
    skuRates: cfg.skuRates || { '14.1': 575, '19.1': 690, '9.1': 517.5, 'D.1': 1150, 'S.1': 1150 },
    cylOpeningQty: cfg.cylOpeningQty || Object.fromEntries(SKUS.map((s) => [s, 0])),
  };
}

function parseArgs() {
  const idx = process.argv.indexOf('--creditor');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node reconcile_creditor_v5_from_txt.mjs --creditor CODE');
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

// Deb Notes sort after GRVs on the same day (mirror of the debtor lane's
// Crd-Note-last ordering) so the running balance reflects charge-then-credit.
function docRank(entryType) {
  return entryType === 'Deb Note' ? 1 : 0;
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
      is_cyl_only: DOCUMENT_TYPES.has(p[3]) && isCylRef(p[6]),
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
  if (split && Math.abs(round2(split.lpg + split.cyl) - r.amount) < 0.02) {
    return { lpg: round2(split.lpg), cyl: round2(split.cyl) };
  }
  if (r.is_cyl_only) return { lpg: 0, cyl: r.amount };
  return { lpg: r.amount, cyl: 0 };
}

function buildLaneSections(financial, amountKey, runningKey, openingBf) {
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
      lines.push(
        `| ${r.date_str} | ${r.entry_type} | ${r.clean_doc} | ${fmt(r[amountKey])} | ${fmt(r[runningKey])} |`,
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
      docRank(a.entry_type) - docRank(b.entry_type) ||
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

  const part1a = buildLaneSections(financial, 'lpg_amount', 'running_lpg', cfg.lpgOpeningBf);
  const part1b = buildLaneSections(financial, 'cyl_amount', 'running_cyl', cfg.cylOpeningFinancial);

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

async function fetchDocLineSplit(client, cfg, accounts) {
  const res = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, debt_group,
      ROUND(SUM(line_total)::numeric, 2)::float AS s
    FROM vw_clean_transactions
    WHERE account_no = ANY($2) AND tx_date >= $1
      AND entry_type IN ('GRV', 'Deb Note')
    GROUP BY doc_no, entry_type, debt_group`,
    [cfg.periodStart, accounts],
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

async function buildPart2(client, cfg, accounts) {
  const cylRes = await client.query(
    `
    SELECT tx_date::text as tx_date, doc_no, entry_type, stock_no, SUM(qty)::int as qty
    FROM vw_clean_transactions
    WHERE account_no = ANY($2) AND debt_group = 'CYL' AND tx_date >= $1
      AND entry_type IN ('GRV', 'Deb Note')
    GROUP BY tx_date, doc_no, entry_type, stock_no
    ORDER BY tx_date, doc_no`,
    [cfg.periodStart, accounts],
  );

  const cylLookup = new Map();
  for (const c of cylRes.rows) {
    const docKey = `${c.doc_no.replace(/^0+/, '')}|${c.entry_type}`;
    if (!cylLookup.has(docKey)) cylLookup.set(docKey, {});
    const bucket = cylLookup.get(docKey);
    bucket[c.stock_no] = (bucket[c.stock_no] || 0) + c.qty;
  }

  const { rows } = parseTxtRows(cfg.txtPath);
  const periodRows = rows
    .filter((r) => r.iso >= cfg.periodStart && DOCUMENT_TYPES.has(r.entry_type))
    .sort(
      (a, b) =>
        a.iso.localeCompare(b.iso) ||
        docRank(a.entry_type) - docRank(b.entry_type) ||
        a.doc_no.localeCompare(b.doc_no),
    );

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
        lines.push(
          `| ${displayDate(r.iso)} | ${r.entry_type} | ${r.clean_doc} | ${changeStrs.join(' | ')} |`,
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
  const creditorCode = parseArgs();
  const cfg = loadConfig(creditorCode);
  const accounts = [creditorCode, ...cfg.linkedAccounts];
  const { rows, headerBalance } = parseTxtRows(cfg.txtPath);

  let docSplit = new Map();
  let part2 = [];
  let currentCyl = { ...cfg.cylOpeningQty };
  const dbConnected = hasDatabaseUrl();

  if (dbConnected) {
    const client = new pg.Client(pgClientOptions());
    await client.connect();
    docSplit = await fetchDocLineSplit(client, cfg, accounts);
    const built = await buildPart2(client, cfg, accounts);
    part2 = built.sections;
    currentCyl = built.currentCyl;
    await client.end();
  } else {
    console.warn(
      `[${creditorCode}] DATABASE_URL not set — running TXT-only (Tier-3) mode. ` +
        `Part 1B line-split and Part 2 custody skipped; all financial rows route to Part 1A.`,
    );
  }

  const { part1a, part1b, financial, finalLpg, finalCyl, finalCombined } = buildPart1Split(
    rows,
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

  const totalCustodyExposure = round2(custodyLines.reduce((s, l) => s + l.qty * l.rate, 0));
  const cylVariance = round2(finalCyl - totalCustodyExposure);

  const lastIso = financial.at(-1)?.iso || cfg.periodStart;
  const periodEndLabel = displayDate(lastIso).split(' ').slice(1).join(' ');
  const periodStartLabel = displayDate(cfg.periodStart).split(' ').slice(1).join(' ');
  const txtRel = path.relative(ROOT, cfg.txtPath);
  const coverage = loadLatestCoverageReport(cfg.creditorCode);
  const ingestGateSection = buildIngestGateSection(coverage, cfg.creditorCode);
  const custodyBlockedNote = buildCustodyBlockedNote(coverage);
  const part2Empty = !part2.length;

  const md = `# Creditor Analysis: ${cfg.creditorName} (${cfg.creditorCode}) - Version 5 (Sub-Ledger Position Statement)
**Type:** Accounts Payable (supplier) &nbsp;|&nbsp; **Period:** ${periodStartLabel} → ${periodEndLabel}
**Account:** ${cfg.creditorCode}${cfg.linkedAccounts.length ? ` (linked: ${cfg.linkedAccounts.join(', ')})` : ''}
**Combined Opening B/F:** R${fmt(cfg.combinedBf)} (ERP verified — source: \`${txtRel}\` ${cfg.bfSourceNote || ''})
**LPG Opening B/F (1A):** R${fmt(cfg.lpgOpeningBf)} &nbsp;|&nbsp; **CYL Opening B/F (1B):** R${fmt(cfg.cylOpeningFinancial)}
**Payment routing:** ${cfg.paymentLane} lane (payments post to Part 1A unless configured otherwise)
**Direction:** GRV increases payable (+); Deb Note & Payment reduce it (−)
**Last regenerated:** ${new Date().toISOString().slice(0, 10)} from ERP TXT (\`reconcile_creditor_v5_from_txt.mjs\`)

---

## Part 1A: LPG Gas Purchases Financial Statement
*Gas fill GRVs, supplier Deb Notes, and payments since ${periodStartLabel}. Payments route to this sub-ledger per creditor config (\`paymentLane: ${cfg.paymentLane}\`).*

${part1a.length ? part1a.join('\n\n---\n\n') : '_No LPG activity in period._'}

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (\`.1\` SKUs / \`-EMPTY\` refs). Populated from the DB line-split; empty when DATABASE_URL is not wired.*

${part1b.length ? part1b.join('\n\n---\n\n') : '_No CYL deposit activity in period._'}

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas Purchases | ${fmt(finalLpg)} |
| Part 1B — CYL Deposits | ${fmt(finalCyl)} |
| **Combined (1A + 1B)** | **${fmt(finalLpg + finalCyl)}** |
| ERP \`CURRENT BALANCE\` (TXT header) | ${fmt(headerBalance)} |
| **Variance (Combined − ERP)** | **${fmt(erpVariance)}** |

---

${ingestGateSection}

## Part 2: Cylinder (CYL) Shell Movement Tracker
*Cylinders tracked by physical count. Opening balances per \`config/statement_v5.json\`.${part2Empty ? ' **No DB-backed custody rows — see Ingest Gate above.**' : ''}*

${part2Empty ? '_No custody movement available (DB not wired or no CYL lines in period)._' : part2.join('\n\n---\n\n')}

---

<!-- INTERNAL_ONLY_START -->
<!-- CREDITOR_POSITION_WORKSPACE_START -->

## Creditor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Payable (Part 1A close) | R${fmt(finalLpg)} |
| Cylinder Financial Balance (Part 1B close) | R${fmt(finalCyl)} |
| **Total Creditor Balance (payable)** | **R${fmt(finalCombined)}** |

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

<!-- CREDITOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
`;

  fs.mkdirSync(path.dirname(cfg.reportPath), { recursive: true });
  fs.writeFileSync(cfg.reportPath, md);

  const fixture = {
    creditorCode: cfg.creditorCode,
    creditorName: cfg.creditorName,
    linkedAccounts: cfg.linkedAccounts,
    period: { from: cfg.periodStart, to: lastIso },
    version: 'v5',
    workspaceStatus:
      Math.abs(erpVariance) < 0.02 && Math.abs(subLedgerVariance) < 0.02 && Math.abs(cylVariance) < 1
        ? 'clean'
        : 'pending_review',
    dbConnected,
    lastGeneratedAt: new Date().toISOString(),
    source: txtRel,
    financialPosition: {
      lpgGasPayable: finalLpg,
      cylinderFinancialBalance: finalCyl,
      totalCreditorBalance: finalCombined,
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
      exceptions: [
        ...(Math.abs(erpVariance) >= 0.02
          ? [{ type: 'VARIANCE', basis: 'ASSERTED', status: 'open', description: 'Part 1 bridge differs from ERP TXT header' }]
          : []),
        ...(Math.abs(subLedgerVariance) >= 0.02
          ? [{ type: 'VARIANCE', basis: 'ASSERTED', status: 'open', description: 'Part 1A + 1B closing does not tie to combined running balance' }]
          : []),
        ...(!dbConnected
          ? [{ type: 'CUSTODY', basis: 'ASSUMED', status: 'open', description: 'Custody unverified — DATABASE_URL not wired; Part 1B/Part 2 skipped' }]
          : Math.abs(cylVariance) >= 1
            ? [{ type: 'CUSTODY', basis: 'ASSERTED', status: 'open', description: 'Part 1B financial vs Part 2 custody — check DB ingest vs TXT' }]
            : []),
      ],
    },
    artifacts: {
      statementMarkdown: `analysis/creditors/${cfg.creditorCode}/reports/${cfg.creditorCode}_Statement_Account_v5.md`,
      txtSource: txtRel,
    },
  };
  fs.mkdirSync(path.dirname(cfg.fixturePath), { recursive: true });
  fs.writeFileSync(cfg.fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);

  console.log(`[${cfg.creditorCode}] TXT header: R${fmt(headerBalance)}`);
  console.log(`[${cfg.creditorCode}] Part 1A LPG close: R${fmt(finalLpg)}`);
  console.log(`[${cfg.creditorCode}] Part 1B CYL close: R${fmt(finalCyl)}`);
  console.log(
    `[${cfg.creditorCode}] Combined 1A+1B: R${fmt(finalCombined)} (ERP variance R${fmt(erpVariance)})`,
  );
  console.log(`[${cfg.creditorCode}] Sub-ledger tie variance: R${fmt(subLedgerVariance)}`);
  console.log(`[${cfg.creditorCode}] Custody exposure: R${fmt(totalCustodyExposure)}`);
  console.log(`Written ${cfg.reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
