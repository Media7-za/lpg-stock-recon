#!/usr/bin/env node
/**
 * Oryx (008ORY) monthly LPG volume report — GRV net of Deb Note (.4 SKUs).
 *
 * Usage: node analysis/creditors/shared/scripts/oryx_lpg_volume_monthly_report.mjs [--creditor 008ORY] [--from YYYY-MM] [--to YYYY-MM]
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const LPG_SKUS = ['9.4', '14.4', '19.4', 'S.4', 'D.4'];
const KG_PER = { '9.4': 9, '14.4': 14, '19.4': 19, 'S.4': 48, 'D.4': 48 };
const SKU_LABEL = {
  '9.4': '9kg',
  '14.4': '14kg',
  '19.4': '19kg',
  'S.4': '48kg SV',
  'D.4': '48kg DV',
};

/** Oryx volume rebate: R1.00/kg on all net kg; R1.50/kg when month net > 30,000 kg. */
const TARGET_KG = 30000;
const REBATE_STANDARD_EX_VAT = 1.0;
const REBATE_TIER_EX_VAT = 1.5;
const VAT_RATE = 0.15;

function monthRebate(netKg) {
  if (netKg <= 0) return 0;
  const rate = netKg > TARGET_KG ? REBATE_TIER_EX_VAT : REBATE_STANDARD_EX_VAT;
  return netKg * rate;
}

function monthRebateInclVat(netKg) {
  return monthRebate(netKg) * (1 + VAT_RATE);
}

function rebateRateLabel(netKg) {
  if (netKg <= 0) return '—';
  return netKg > TARGET_KG ? `R${REBATE_TIER_EX_VAT.toFixed(2)}/kg` : `R${REBATE_STANDARD_EX_VAT.toFixed(2)}/kg`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (f, d) => {
    const i = args.indexOf(f);
    return i >= 0 && args[i + 1] ? args[i + 1] : d;
  };
  return {
    creditorCode: (get('--creditor', '008ORY') || '008ORY').toUpperCase(),
    from: get('--from', '2025-01'),
    to: get('--to', '2026-08'),
  };
}

function loadConfig(creditorCode) {
  const p = path.join(ROOT, 'analysis/creditors', creditorCode, 'config/statement_v5.json');
  if (!fs.existsSync(p)) throw new Error(`Missing config: ${p}`);
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    ...cfg,
    linkedAccounts: [creditorCode, ...(cfg.linkedAccounts || [])].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
    txtPath: path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(ROOT, cfg.txtPath),
  };
}

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

/** Deb Note doc → linked GRV doc (GRVNO column). */
function buildDnToGrvMap(txtPath) {
  const map = new Map();
  if (!fs.existsSync(txtPath)) return map;
  for (const line of fs.readFileSync(txtPath, 'utf8').split('\n')) {
    if (!line.startsWith('"') || line.includes('LINE","PERIOD')) continue;
    const p = parseCsvLine(line);
    if (p[3] !== 'Deb Note') continue;
    const dn = p[2].replace(/^0+/, '') || p[2];
    const grv = (p[5] || '').replace(/^0+/, '').trim();
    if (grv) map.set(dn, grv);
  }
  return map;
}

function monthKeys(from, to) {
  const out = [];
  let [y, m] = from.split('-').map(Number);
  const [ey, em] = to.split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function monthLabel(key) {
  const [y, mo] = key.split('-');
  const d = new Date(`${y}-${mo}-01T12:00:00`);
  return d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
}

function cylToKg(stockNo, cyl) {
  const k = KG_PER[stockNo];
  return k ? Math.abs(cyl) * k : 0;
}

function fmt(n, dec = 0) {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtMoney(n) {
  return `R${fmt(n, 2)}`;
}

async function fetchLines(client, accounts, from, to) {
  const res = await client.query(
    `
    WITH deduped AS (
      SELECT DISTINCT ON (LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty)
        LTRIM(doc_no,'0') AS doc_no,
        entry_type,
        stock_no,
        qty::float AS qty,
        tx_date::date AS tx_date,
        to_char(tx_date, 'YYYY-MM') AS month_key
      FROM vw_clean_transactions
      WHERE account_no = ANY($1)
        AND entry_type IN ('GRV', 'Deb Note')
        AND debt_group = 'LPG'
        AND stock_no = ANY($2)
        AND tx_date >= $3::date
        AND tx_date < ($4::date + interval '1 month')
      ORDER BY LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty, id DESC
    )
    SELECT * FROM deduped ORDER BY tx_date, doc_no, stock_no`,
    [accounts, LPG_SKUS, `${from}-01`, `${to}-01`],
  );
  return res.rows;
}

function aggregateDoc(lines) {
  const bySku = {};
  let kg = 0;
  let cyl = 0;
  for (const r of lines) {
    const c = Math.abs(r.qty);
    bySku[r.stock_no] = (bySku[r.stock_no] || 0) + c;
    kg += cylToKg(r.stock_no, c);
    cyl += c;
  }
  return { bySku, kg, cyl };
}

function buildReport(data, cfg, dnToGrv) {
  const { months, monthData } = data;
  const lines = [
    `# ${cfg.creditorName} (${cfg.creditorCode}) — LPG Volume Analysis`,
    ``,
    `**Generated:** ${new Date().toISOString().slice(0, 10)} · **Period:** ${monthLabel(months[0])} → ${monthLabel(months[months.length - 1])}`,
    `**Accounts:** ${cfg.linkedAccounts.join(', ')} · **SKUs:** LPG full gas (\`.4\`) only`,
    `**Net formula:** |GRV qty| − |Deb Note qty| (per \`lpg_costing_and_supplier_rules.md\`)`,
    `**Target:** ${fmt(TARGET_KG)} kg/month (tier threshold) · **Rebate:** R${REBATE_STANDARD_EX_VAT.toFixed(2)}/kg ex VAT on all net kg; **R${REBATE_TIER_EX_VAT.toFixed(2)}/kg** when net > ${fmt(TARGET_KG)} kg`,
    ``,
    `---`,
    ``,
    `## Executive summary`,
    ``,
    `| Month | GRVs | GRV kg | DN kg | **Net kg** | vs Target | Tier | Rate | **Rebate (ex VAT)** | **Rebate (incl VAT)** |`,
    `| :--- | ---: | ---: | ---: | ---: | ---: | :--- | :--- | ---: | ---: |`,
  ];

  let totalNet = 0;
  let totalRebate = 0;
  let totalRebateInclVat = 0;

  for (const mk of months) {
    const m = monthData.get(mk);
    const rebate = monthRebate(m.netKg);
    const rebateInclVat = monthRebateInclVat(m.netKg);
    totalNet += m.netKg;
    totalRebate += rebate;
    totalRebateInclVat += rebateInclVat;
    const tier = m.netKg > TARGET_KG ? 'Tier 2' : m.netKg > 0 ? 'Tier 1' : '—';
    lines.push(
      `| ${monthLabel(mk)} | ${m.grvCount} | ${fmt(m.grvKg)} | ${fmt(m.dnKg)} | **${fmt(m.netKg)}** | ${m.netKg >= TARGET_KG ? '+' : ''}${fmt(m.netKg - TARGET_KG)} | ${tier} | ${rebateRateLabel(m.netKg)} | ${fmtMoney(rebate)} | ${fmtMoney(rebateInclVat)} |`,
    );
  }

  lines.push(
    `| **Total** | — | — | — | **${fmt(totalNet)}** | — | — | — | **${fmtMoney(totalRebate)}** | **${fmtMoney(totalRebateInclVat)}** |`,
    ``,
    `---`,
    ``,
  );

  for (const mk of months) {
    const m = monthData.get(mk);
    lines.push(`## ${monthLabel(mk)}`, ``);
    lines.push(
      `| Metric | Value |`,
      `| :--- | ---: |`,
      `| GRV documents | ${m.grvCount} |`,
      `| Deb Note documents (LPG) | ${m.dnCount} |`,
      `| GRV kg (gross) | ${fmt(m.grvKg)} |`,
      `| Deb Note kg (returns) | ${fmt(m.dnKg)} |`,
      `| **Net kg** | **${fmt(m.netKg)}** |`,
      `| Target (tier threshold) | ${fmt(TARGET_KG)} |`,
      `| Variance | ${m.netKg >= TARGET_KG ? '+' : ''}${fmt(m.netKg - TARGET_KG)} |`,
      `| Rebate rate | ${rebateRateLabel(m.netKg)} |`,
      `| **Rebate (ex VAT)** | **${fmtMoney(m.rebate)}** |`,
      `| **Rebate (incl VAT @ ${(VAT_RATE * 100).toFixed(0)}%)** | **${fmtMoney(m.rebateInclVat)}** |`,
      ``,
    );

    if (m.grvCount === 0) {
      lines.push(`*No LPG GRV activity in DB for this month.*`, ``, `---`, ``);
      continue;
    }

    lines.push(
      `### kg per GRV (net of linked Deb Note)`,
      ``,
      `| Date | GRV | GRV kg | Linked DN | DN kg | **Net kg** | Qty detail (GRV) |`,
      `| :--- | :--- | ---: | :--- | ---: | ---: | :--- |`,
    );

    for (const g of m.grvDetails) {
      const qtyParts = LPG_SKUS.filter((s) => g.grv.bySku[s])
        .map((s) => `${SKU_LABEL[s]} ${g.grv.bySku[s]}`)
        .join('; ');
      lines.push(
        `| ${g.date} | ${g.doc} | ${fmt(g.grv.kg)} | ${g.dnDoc || '—'} | ${fmt(g.dn.kg)} | **${fmt(g.netKg)}** | ${qtyParts || '—'} |`,
      );
    }

    if (m.unlinkedDn.length) {
      lines.push(``, `### Unlinked Deb Notes (LPG, not paired to GRV in month)`, ``);
      lines.push(`| Date | DN | kg | Qty detail |`, `| :--- | :--- | ---: | :--- |`);
      for (const d of m.unlinkedDn) {
        const qtyParts = LPG_SKUS.filter((s) => d.bySku[s])
          .map((s) => `${SKU_LABEL[s]} ${d.bySku[s]}`)
          .join('; ');
        lines.push(`| ${d.date} | ${d.doc} | ${fmt(d.kg)} | ${qtyParts || '—'} |`);
      }
    }

    lines.push(``, `---`, ``);
  }

  lines.push(
    `## Method notes`,
    ``,
    `- **Source:** \`vw_clean_transactions\` line items, \`debt_group = LPG\`, \`.4\` SKUs only.`,
    `- **Deb Note pairing:** GRVNO from \`${path.relative(ROOT, cfg.txtPath)}\` links DN → GRV for per-GRV net; month net = Σ|GRV| − Σ|DN|.`,
    `- **Rebate:** R${REBATE_STANDARD_EX_VAT.toFixed(2)}/kg ex VAT on all net kg; R${REBATE_TIER_EX_VAT.toFixed(2)}/kg when month net > ${fmt(TARGET_KG)} kg. Incl VAT = ex VAT × ${(1 + VAT_RATE).toFixed(2)} (${(VAT_RATE * 100).toFixed(0)}% VAT).`,
    `- **007ORY** legacy lines included via \`linkedAccounts\`.`,
    ``,
  );

  return lines.join('\n');
}

async function main() {
  const cli = parseArgs();
  const cfg = loadConfig(cli.creditorCode);
  const dnToGrv = buildDnToGrvMap(cfg.txtPath);
  const months = monthKeys(cli.from, cli.to);

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const rows = await fetchLines(client, cfg.linkedAccounts, cli.from, cli.to);
  await client.end();

  const byDoc = new Map();
  for (const r of rows) {
    const key = `${r.entry_type}|${r.doc_no}`;
    if (!byDoc.has(key)) byDoc.set(key, { ...r, lines: [] });
    byDoc.get(key).lines.push(r);
  }

  const monthData = new Map();

  for (const mk of months) {
    monthData.set(mk, {
      grvCount: 0,
      dnCount: 0,
      grvKg: 0,
      dnKg: 0,
      netKg: 0,
      rebate: 0,
      rebateInclVat: 0,
      grvDetails: [],
      unlinkedDn: [],
    });
  }

  for (const [key, doc] of byDoc) {
    const mk = doc.month_key;
    if (!monthData.has(mk)) continue;
    const agg = aggregateDoc(doc.lines);
    const m = monthData.get(mk);
    const date = doc.tx_date.toISOString().slice(0, 10);

    if (doc.entry_type === 'GRV') {
      m.grvCount += 1;
      m.grvKg += agg.kg;
      m.grvDetails.push({
        doc: doc.doc_no,
        date,
        grv: agg,
        dn: { bySku: {}, kg: 0, cyl: 0 },
        dnDoc: null,
        netKg: agg.kg,
      });
    } else {
      m.dnCount += 1;
      m.dnKg += agg.kg;
      doc._agg = agg;
      doc._date = date;
    }
  }

  // Link DN to GRV via TXT GRVNO (same or any month DN reduces GRV net when paired)
  const dnDocs = [...byDoc.entries()].filter(([k]) => k.startsWith('Deb Note|'));
  const grvByDoc = new Map();
  for (const m of monthData.values()) {
    for (const g of m.grvDetails) grvByDoc.set(g.doc, g);
  }

  const linkedDnKeys = new Set();
  for (const [, doc] of dnDocs) {
    const dnDoc = doc.doc_no;
    const grvDoc = dnToGrv.get(dnDoc);
    const agg = doc._agg || aggregateDoc(doc.lines);
    if (grvDoc && grvByDoc.has(grvDoc)) {
      const g = grvByDoc.get(grvDoc);
      g.dnDoc = g.dnDoc ? `${g.dnDoc}, ${dnDoc}` : dnDoc;
      for (const s of LPG_SKUS) {
        g.dn.bySku[s] = (g.dn.bySku[s] || 0) + (agg.bySku[s] || 0);
      }
      g.dn.kg += agg.kg;
      g.netKg = Math.max(0, g.grv.kg - g.dn.kg);
      linkedDnKeys.add(`Deb Note|${dnDoc}`);
    }
  }

  for (const mk of months) {
    const m = monthData.get(mk);
    m.netKg = m.grvKg - m.dnKg;
    m.rebate = monthRebate(m.netKg);
    m.rebateInclVat = monthRebateInclVat(m.netKg);
    m.grvDetails.sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));

    for (const [, doc] of dnDocs) {
      if (doc.month_key !== mk) continue;
      const key = `Deb Note|${doc.doc_no}`;
      if (linkedDnKeys.has(key)) continue;
      const agg = doc._agg || aggregateDoc(doc.lines);
      m.unlinkedDn.push({ doc: doc.doc_no, date: doc._date, ...agg });
    }
  }

  const md = buildReport({ months, monthData }, cfg, dnToGrv);
  const reportDir = path.join(ROOT, 'analysis/creditors', cli.creditorCode, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const slug = `${cli.from}_to_${cli.to}`.replace(/-/g, '');
  const outPath = path.join(reportDir, `${cli.creditorCode}_LPG_Volume_Monthly_${cli.from}_to_${cli.to}.md`);
  fs.writeFileSync(outPath, md);

  const jsonPath = outPath.replace('.md', '.json');
  const json = {
    creditorCode: cli.creditorCode,
    generated_at: new Date().toISOString(),
    from: cli.from,
    to: cli.to,
    target_kg: TARGET_KG,
    rebate_standard_ex_vat: REBATE_STANDARD_EX_VAT,
    rebate_tier_ex_vat: REBATE_TIER_EX_VAT,
    vat_rate: VAT_RATE,
    months: months.map((mk) => {
      const m = monthData.get(mk);
      return {
        month: mk,
        grv_count: m.grvCount,
        dn_count: m.dnCount,
        grv_kg: m.grvKg,
        dn_kg: m.dnKg,
        net_kg: m.netKg,
        vs_target: m.netKg - TARGET_KG,
        tier: m.netKg > TARGET_KG ? 'tier_2' : m.netKg > 0 ? 'tier_1' : 'none',
        rebate_rate: m.netKg > TARGET_KG ? REBATE_TIER_EX_VAT : REBATE_STANDARD_EX_VAT,
        rebate_ex_vat: m.rebate,
        rebate_incl_vat: m.rebateInclVat,
        grv_details: m.grvDetails,
      };
    }),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);

  console.log(`Written ${outPath}`);
  console.log(`Written ${jsonPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
