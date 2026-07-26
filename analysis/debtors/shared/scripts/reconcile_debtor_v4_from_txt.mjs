#!/usr/bin/env node
/**
 * Rebuild debtor Statement of Account v4 from ERP TXT (Tier-3 authority).
 * Usage: node analysis/debtors/shared/scripts/reconcile_debtor_v4_from_txt.mjs --debtor JEN001
 * Config: analysis/debtors/[CODE]/config/statement_v4.json
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const SKUS = ['14.1', '19.1', '9.1', 'D.1', 'S.1'];
const CYL_PATTERN = /[-`#]?EMPTY|EMPTIES/i;

function loadConfig(debtorCode) {
  const configPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'config/statement_v4.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config: ${configPath}\nCopy from analysis/debtors/shared/templates/statement_v4_config.template.json`);
  }
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (cfg.debtorCode !== debtorCode) {
    throw new Error(`Config debtorCode ${cfg.debtorCode} does not match --debtor ${debtorCode}`);
  }
  const txtPath = path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(ROOT, cfg.txtPath);
  if (!fs.existsSync(txtPath)) {
    throw new Error(`Missing ERP TXT: ${txtPath}`);
  }
  return {
    ...cfg,
    txtPath,
    reportPath: path.join(ROOT, `analysis/debtors/${debtorCode}/reports/${debtorCode}_Statement_Account_v4.md`),
    fixturePath: path.join(ROOT, `src/features/debtor-position-workspace/data/fixtures/${debtorCode}.v4.json`),
    skuRates: cfg.skuRates || { '14.1': 575, '19.1': 690, '9.1': 517.5, 'D.1': 1150, 'S.1': 1150 },
    cylOpeningQty: cfg.cylOpeningQty || Object.fromEntries(SKUS.map((s) => [s, 0])),
  };
}

function parseArgs() {
  const idx = process.argv.indexOf('--debtor');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node reconcile_debtor_v4_from_txt.mjs --debtor CODE');
    process.exit(1);
  }
  return process.argv[idx + 1].toUpperCase();
}

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
      amount: Math.round(Number(p[9]) * 100) / 100,
      erp_balance: Math.round(Number(p[10]) * 100) / 100,
      is_cyl_only:
        (p[3] === 'Invoice' || p[3] === 'Crd Note') && isCylRef(p[6]),
    });
  }
  return { rows, headerBalance };
}

function buildPart1(rows, cfg) {
  const periodRows = rows.filter((r) => r.iso >= cfg.periodStart);
  periodRows.sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.entry_type === 'Crd Note' ? 1 : 0) - (b.entry_type === 'Crd Note' ? 1 : 0) ||
      a.doc_no.localeCompare(b.doc_no),
  );

  const invoices = periodRows.filter((r) => r.entry_type === 'Invoice' && r.is_cyl_only);
  const crdNotes = periodRows.filter((r) => r.entry_type === 'Crd Note' && r.is_cyl_only);
  const strippedDocs = new Set();

  for (const inv of invoices) {
    const ref = inv.ref_no;
    for (const cn of crdNotes) {
      if (
        strippedDocs.has(cn.doc_no) ||
        cn.ref_no !== ref ||
        Math.abs(inv.amount + cn.amount) >= 0.01
      )
        continue;
      strippedDocs.add(inv.doc_no);
      strippedDocs.add(cn.doc_no);
      break;
    }
  }

  const financial = [];
  for (const r of periodRows) {
    if (strippedDocs.has(r.doc_no) || Math.abs(r.amount) < 0.01) continue;
    financial.push({ ...r, month_key: monthKey(r.iso), date_str: displayDate(r.iso) });
  }

  let running = cfg.combinedBf;
  for (const r of financial) {
    running = Math.round((running + r.amount) * 100) / 100;
    r.running_combined_balance = running;
  }

  const byMonth = new Map();
  for (const r of financial) {
    if (!byMonth.has(r.month_key)) byMonth.set(r.month_key, []);
    byMonth.get(r.month_key).push(r);
  }

  const monthKeys = [...byMonth.keys()].sort(
    (a, b) => new Date(`01 ${a}`) - new Date(`01 ${b}`),
  );

  const sections = [];
  for (const mk of monthKeys) {
    const p1 = byMonth.get(mk);
    const monthOpening = Math.round((p1[0].running_combined_balance - p1[0].amount) * 100) / 100;
    const lines = [
      `### ${mk}`,
      '',
      '| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |',
      '| :--- | :--- | :--- | ---: | ---: |',
      `| **01 ${mk.slice(0, 3)}** | **Opening Balance** | — | | **${fmt(monthOpening)}** |`,
    ];
    for (const r of p1) {
      lines.push(
        `| ${r.date_str} | ${r.entry_type} | ${r.clean_doc} | ${fmt(r.amount)} | ${fmt(r.running_combined_balance)} |`,
      );
    }
    sections.push(lines.join('\n'));
  }

  return { sections, financial, finalCombined: running, strippedCount: strippedDocs.size };
}

async function buildPart2(client, cfg) {
  const cylRes = await client.query(`
    SELECT tx_date::text as tx_date, doc_no, entry_type, stock_no, SUM(qty)::int as qty
    FROM vw_clean_transactions
    WHERE account_no = $2 AND debt_group = 'CYL' AND tx_date >= $1
    GROUP BY tx_date, doc_no, entry_type, stock_no
    ORDER BY tx_date, doc_no`, [cfg.periodStart, cfg.debtorCode]);

  const cylLookup = new Map();
  for (const c of cylRes.rows) {
    const docKey = `${c.doc_no.replace(/^0+/, '')}|${c.entry_type}`;
    if (!cylLookup.has(docKey)) cylLookup.set(docKey, {});
    const bucket = cylLookup.get(docKey);
    bucket[c.stock_no] = (bucket[c.stock_no] || 0) + c.qty;
  }

  // Also need invoice/CN rows from TXT for dates in Part 2 display
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

async function fetchLpgCylSplit(client, cfg) {
  const res = await client.query(
    `
    SELECT debt_group, ROUND(SUM(line_total)::numeric, 2)::float as s
    FROM vw_clean_transactions
    WHERE account_no = $2 AND tx_date >= $1
      AND entry_type IN ('Invoice', 'Crd Note')
    GROUP BY debt_group`,
    [cfg.periodStart, cfg.debtorCode],
  );
  const payRes = await client.query(
    `
    SELECT ROUND(SUM(amt)::numeric, 2)::float as s FROM (
      SELECT ROUND(SUM(amount_excl + tax_amount)::numeric, 2) as amt
      FROM transaction_headers
      WHERE account_no = $2 AND tx_date >= $1
        AND entry_type IN ('Payment','Ud Paymnt','Bank XFer','Bank UD','Bank Dep','Journal')
      GROUP BY doc_no, tx_date
    ) x`,
    [cfg.periodStart, cfg.debtorCode],
  );
  let lpgPeriod = 0,
    cylPeriod = 0;
  for (const r of res.rows) {
    if (r.debt_group === 'CYL') cylPeriod += Number(r.s);
    else lpgPeriod += Number(r.s);
  }
  const payments = Number(payRes.rows[0]?.s || 0);
  return { lpgPeriod, cylPeriod, payments };
}

async function main() {
  const debtorCode = parseArgs();
  const cfg = loadConfig(debtorCode);
  const { headerBalance } = parseTxtRows(cfg.txtPath);
  const { sections: part1, financial, finalCombined, strippedCount } = buildPart1(
    parseTxtRows(cfg.txtPath).rows,
    cfg,
  );

  const client = new pg.Client({
    connectionString:
      '',
  });
  await client.connect();
  const { sections: part2, currentCyl } = await buildPart2(client, cfg);
  const { cylPeriod } = await fetchLpgCylSplit(client, cfg);
  await client.end();

  const erpVariance = Math.round((finalCombined - headerBalance) * 100) / 100;

  const custodyLines = SKUS.map((sku) => ({
    sku,
    label: sku === '19.1' ? '19kg' : sku === '9.1' ? '9kg' : sku === '14.1' ? '14kg' : sku,
    qty: currentCyl[sku],
    rate: cfg.skuRates[sku],
  })).filter((l) => l.qty !== 0);

  const totalCustodyExposure = Math.round(
    custodyLines.reduce((s, l) => s + l.qty * l.rate, 0) * 100,
  ) / 100;

  const finalCylFinancial = Math.round((cfg.cylOpeningFinancial + cylPeriod) * 100) / 100;
  const finalGasDebt = Math.round((finalCombined - finalCylFinancial) * 100) / 100;
  const cylVariance = Math.round((finalCylFinancial - totalCustodyExposure) * 100) / 100;

  const lastIso = financial.at(-1)?.iso || cfg.periodStart;
  const periodEndLabel = displayDate(lastIso).split(' ').slice(1).join(' ');
  const periodStartLabel = displayDate(cfg.periodStart).split(' ').slice(1).join(' ');
  const txtRel = path.relative(ROOT, cfg.txtPath);

  const md = `# Statement of Account: ${cfg.debtorName} (${cfg.debtorCode}) - Version 4 (Canonical Settlement Allocation Doctrine)
**Period:** ${periodStartLabel} → ${periodEndLabel} &nbsp;|&nbsp; **Account:** ${cfg.debtorCode}
**Opening Balance B/F:** R${fmt(cfg.combinedBf)} (ERP verified — source: \`${txtRel}\` ${cfg.bfSourceNote || ''})
**Last regenerated:** ${new Date().toISOString().slice(0, 10)} from ERP TXT (\`reconcile_debtor_v4_from_txt.mjs\`)

---

## Part 1: Combined Financial Statement (LPG Gas & Cylinder Deposits)
*Tracks all gas invoiced, cylinder deposits, and payments received since ${periodStartLabel}. Matching cylinder invoice/credit note pairs (which cancel out exactly) are stripped from this view for readability. This combined ledger directly reconciles with the ERP running balance.*

${part1.join('\n\n---\n\n')}

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders are tracked purely by physical count. Opening balances per \`config/statement_v4.json\`.*

${part2.join('\n\n---\n\n')}

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R${fmt(finalGasDebt)} |
| Cylinder Financial Balance | R${fmt(finalCylFinancial)} |
| **Total Debtor Balance** | **R${fmt(finalCombined)}** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
${custodyLines.length ? custodyLines.map((l) => `| ${l.label} | ${l.qty} | R${fmt(l.rate)} | R${fmt(l.qty * l.rate)} |`).join('\n') : '| — | 0 | — | R0.00 |'}
| **Total** | **${custodyLines.reduce((s, l) => s + l.qty, 0)}** | — | **R${fmt(totalCustodyExposure)}** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | R${fmt(finalCylFinancial)} | R${fmt(totalCustodyExposure)} | R${fmt(cylVariance)} |

**ERP Combined Balance (TXT header):** R${fmt(headerBalance)}  
**Reconstructed Balance (Part 1):** R${fmt(finalCombined)}  
**Variance:** R${fmt(erpVariance)}

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
`;

  fs.writeFileSync(cfg.reportPath, md);

  const fixture = {
    debtorCode: cfg.debtorCode,
    debtorName: cfg.debtorName,
    period: { from: cfg.periodStart, to: lastIso },
    version: 'v4',
    // Application workflow status only (DebtorWorkspaceStatus) — not constitutional
    // reconState, not D17/D18 collections eligibility, not ingestGate.displayStatus.
    workspaceStatus:
      Math.abs(erpVariance) < 0.02 && Math.abs(cylVariance) < 1 ? 'clean' : 'pending_review',
    lastGeneratedAt: new Date().toISOString(),
    source: txtRel,
    financialPosition: {
      lpgGasDebt: finalGasDebt,
      cylinderFinancialBalance: finalCylFinancial,
      totalDebtorBalance: finalCombined,
      erpStatedBalance: headerBalance,
      erpVariance,
    },
    custodyPosition: {
      totalCustodyExposure,
      lines: custodyLines.map((l) => ({
        sku: l.sku,
        label: l.label,
        qty: l.qty,
        depositRate: l.rate,
        exposure: Math.round(l.qty * l.rate * 100) / 100,
      })),
    },
    reconciliationPosition: {
      cylinderVariance: cylVariance,
      erpVariance,
      exceptions: [
        ...(Math.abs(erpVariance) >= 0.02
          ? ['Part 1 running balance differs from ERP TXT header']
          : []),
        ...(Math.abs(cylVariance) >= 1
          ? ['Part 2 custody vs DB cylinder financial — check DB ingest vs TXT']
          : []),
      ],
    },
    artifacts: {
      statementMarkdown: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_Statement_Account_v4.md`,
      baselineMarkdown: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_BASELINE_v4.md`,
      txtSource: txtRel,
      defaultHtml: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_Statement_Account_v4.html`,
      internalHtml: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_Statement_Account_v4_Internal.html`,
      customerHtml: `analysis/debtors/${cfg.debtorCode}/reports/${cfg.debtorCode}_Statement_Account_v4_Customer.html`,
    },
  };
  fs.mkdirSync(path.dirname(cfg.fixturePath), { recursive: true });
  fs.writeFileSync(cfg.fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);

  console.log(`[${cfg.debtorCode}] TXT header: R${fmt(headerBalance)}`);
  console.log(`[${cfg.debtorCode}] Part 1 closing: R${fmt(finalCombined)} (variance R${fmt(erpVariance)})`);
  console.log(`[${cfg.debtorCode}] Stripped ${strippedCount} cylinder doc rows`);
  console.log(`[${cfg.debtorCode}] LPG R${fmt(finalGasDebt)} | CYL R${fmt(finalCylFinancial)} | Custody R${fmt(totalCustodyExposure)}`);
  console.log(`Written ${cfg.reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
