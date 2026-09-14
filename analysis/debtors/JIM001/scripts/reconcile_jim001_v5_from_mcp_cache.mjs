#!/usr/bin/env node
/**
 * JIM001 v5 statement generator -- MCP-cache variant.
 *
 * Identical to analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs
 * (Part 1A/1B split + reconciliation bridge + Part 2 custody tracker), except
 * the two DB-dependent lookups (doc-level LPG/CYL line split, cylinder qty
 * movements) are read from pre-fetched JSON caches instead of a live `pg`
 * connection, because DATABASE_URL was not available in this session's
 * sandbox. The caches were populated by running the *exact same* SQL the
 * shared script runs (see fetchDocLineSplit/buildPart2 there) via the
 * Supabase MCP tool against the same `vw_clean_transactions` view, project
 * oqhpxnaadahohwkslive, on 2026-09-14. Do not use this script for any debtor
 * other than JIM001 -- it is not a generic DB-free mode, just a one-off
 * workaround documented so it can be re-run if DATABASE_URL becomes
 * available (at which point the shared script should be used directly and
 * this file can be deleted).
 *
 * Usage: node analysis/debtors/JIM001/scripts/reconcile_jim001_v5_from_mcp_cache.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTOR_CODE = 'JIM001';
const CACHE_DIR = path.join(__dirname, 'v5_mcp_cache');

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

*Additional caveat for this run: generated via the MCP-cache variant (DATABASE_URL unavailable in-session) -- see the note at the top of \`reconcile_jim001_v5_from_mcp_cache.mjs\` for how the doc-split/qty lookups were sourced.*

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

${blockedNote}*Generated via the MCP-cache variant (DATABASE_URL unavailable in-session) -- doc-split/qty lookups sourced from a Supabase MCP query on 2026-09-14, not a live DB connection at generation time.*

---
`;
}

function buildCustodyBlockedNote(coverage) {
  if (!coverage || coverage.gates?.custody !== 'BLOCKED') return '';
  return `\n> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage \`${coverage.display_status}\`. DB-backed qty may not reflect all TXT documents.\n`;
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
    throw new Error(`Config debtorCode ${cfg.debtorCode} does not match ${debtorCode}`);
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
    ratificationScenario: null,
    ratificationRows: [],
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

/** MCP-cache variant of fetchDocLineSplit — reads the pre-fetched JSON instead of querying pg. */
function fetchDocLineSplitFromCache() {
  const cachePath = path.join(CACHE_DIR, 'doc_line_split_2025-03-01_onward.json');
  const rows = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const map = new Map();
  for (const r of rows) {
    const key = `${r.doc_no}|${r.entry_type}`;
    if (!map.has(key)) map.set(key, { lpg: 0, cyl: 0 });
    const bucket = map.get(key);
    if (r.debt_group === 'CYL') bucket.cyl = round2(bucket.cyl + Number(r.s));
    else bucket.lpg = round2(bucket.lpg + Number(r.s));
  }
  return map;
}

/** MCP-cache variant of buildPart2 — reads the pre-fetched JSON instead of querying pg. */
function buildPart2FromCache(cfg) {
  const cachePath = path.join(CACHE_DIR, 'cyl_qty_2025-03-01_onward.json');
  const cylRows = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const cylLookup = new Map();
  for (const c of cylRows) {
    const docKey = `${c.doc_no.replace(/^0+/, '')}|${c.entry_type}`;
    if (!cylLookup.has(docKey)) cylLookup.set(docKey, {});
    const bucket = cylLookup.get(docKey);
    bucket[c.stock_no] = (bucket[c.stock_no] || 0) + c.qty;
  }

  const { rows } = parseTxtRows(cfg.txtPath);
  const periodRows = rows
    .filter((r) => r.iso >= cfg.periodStart && (r.entry_type === 'Invoice' || r.entry_type === 'Crd Note'))
    .sort(
      (a, b) =>
        a.iso.localeCompare(b.iso) ||
        (a.entry_type === 'Crd Note' ? 1 : 0) - (b.entry_type === 'Crd Note' ? 1 : 0) ||
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

function main() {
  const cfg = loadConfig(DEBTOR_CODE);
  const { rows, headerBalance } = parseTxtRows(cfg.txtPath);
  const allRows = rows;

  const docSplit = fetchDocLineSplitFromCache();
  const { sections: part2, currentCyl } = buildPart2FromCache(cfg);

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

  const md = `# Statement of Account: ${cfg.debtorName} (${cfg.debtorCode}) - Version 5 (Sub-Ledger Position Statement)
**Period:** ${periodStartLabel} → ${periodEndLabel} &nbsp;|&nbsp; **Account:** ${cfg.debtorCode}
**Combined Opening B/F:** R${fmt(cfg.combinedBf)} (ERP verified — source: \`${txtRel}\` ${cfg.bfSourceNote || ''})
**LPG Opening B/F (1A):** R${fmt(cfg.lpgOpeningBf)} &nbsp;|&nbsp; **CYL Opening B/F (1B):** R${fmt(cfg.cylOpeningFinancial)}
**Payment routing:** ${cfg.paymentLane} lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** ${new Date().toISOString().slice(0, 10)} from ERP TXT (\`reconcile_jim001_v5_from_mcp_cache.mjs\` — MCP-cache variant, DATABASE_URL unavailable in-session; doc-split/qty lookups sourced via Supabase MCP query 2026-09-14 against project \`oqhpxnaadahohwkslive\`, same SQL as the shared generator)

---

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
  // positions only. It must NEVER compute or emit a `collectable` field.
  const fixture = {
    debtorCode: cfg.debtorCode,
    debtorName: cfg.debtorName,
    period: { from: cfg.periodStart, to: lastIso },
    version: 'v5',
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

main();
