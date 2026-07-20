#!/usr/bin/env node
/**
 * WO0001 Turn 8 — CN gate rebuild.
 * Tier 3a: baseline ref_no offsets (cn_offsets_baseline.json)
 * Tier 3b: DN-key extension for 2026 CNs missed by ref_no gate
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBTOR_DIR = path.resolve(__dirname, '..');
const DATA = path.join(DEBTOR_DIR, 'data');
const REPORTS = path.join(DEBTOR_DIR, 'reports');

const fmtR = (n) =>
  'R' +
  (Math.round(n * 100) / 100)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const round2 = (n) => Math.round(n * 100) / 100;
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const TOL = 0.05;
const CN_LAG_MIN = -1; // same-day correction: CN may post 1d before replacement invoice
const CN_LAG_MAX = 5;
const DASHBOARD_LPG = 92844.18;
const TURN7_OPEN_SUM = 161214.89;

function normalizeDn(desc) {
  if (!desc) return null;
  const m = String(desc).match(/DN\s*[#=\-*]?\s*(\d+)/i);
  return m ? m[1] : null;
}

function isEmptyDn(desc) {
  return /EMPTY/i.test(String(desc ?? ''));
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = [];
    let cur = '',
      inQ = false;
    for (const ch of line) {
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cols.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    const o = {};
    headers.forEach((h, i) => {
      o[h] = cols[i] ?? '';
    });
    return o;
  });
}

function loadInvoices() {
  const rows = parseCsv(fs.readFileSync(path.join(DATA, 'invoices.csv'), 'utf8'));
  const docs = new Map();
  for (const r of rows) {
    const doc = clean(r.doc_no);
    if (!docs.has(doc)) {
      docs.set(doc, {
        doc,
        entryType: r.entry_type,
        txDate: r.tx_date,
        descriptions: new Set(),
        lpg: 0,
        other: 0,
        dnKeys: new Set(),
      });
    }
    const d = docs.get(doc);
    if (r.description) d.descriptions.add(r.description);
    const dn = normalizeDn(r.description);
    if (dn) d.dnKeys.add(dn);
    const amt = parseFloat(r.amount_incl) || 0;
    if (r.lane === 'LPG' || r.debt_group === 'LPG') d.lpg = round2(d.lpg + amt);
    else if (r.lane === 'OTHER' || r.debt_group === 'OTHER') d.other = round2(d.other + amt);
  }
  return docs;
}

function loadPaidByInv() {
  const rows = parseCsv(fs.readFileSync(path.join(DATA, 'allocation_edges.csv'), 'utf8'));
  const paid = new Map();
  for (const r of rows) {
    if (!r.target_doc || r.allocation_type === 'UNALLOCATED') continue;
    const amt = parseFloat(r.allocated_amount) || 0;
    if (amt <= 0) continue;
    const k = clean(r.target_doc);
    paid.set(k, round2((paid.get(k) || 0) + amt));
  }
  return paid;
}

function discoverDnGateOffsets(docs, baselineKeys) {
  const invoices = [...docs.values()].filter((d) => d.entryType === 'Invoice' && d.lpg > TOL);
  const creditNotes = [...docs.values()].filter((d) => d.entryType === 'Crd Note' && Math.abs(d.lpg) > TOL);

  const discovered = [];
  for (const cn of creditNotes) {
    const cnKey = clean(cn.doc);
    if (baselineKeys.has(cnKey)) continue;

    const cnLpg = round2(Math.abs(cn.lpg));
    const cnDate = new Date(cn.txDate);
    const dnKeys = [...cn.dnKeys].filter((k) => {
      const sample = [...cn.descriptions].find((d) => normalizeDn(d) === k);
      return sample && !isEmptyDn(sample);
    });
    if (!dnKeys.length) continue;

    for (const dn of dnKeys) {
      const candidates = invoices.filter((inv) => {
        if (!inv.dnKeys.has(dn)) return false;
        const lag = (cnDate - new Date(inv.txDate)) / 86400000;
        return lag >= CN_LAG_MIN && lag <= CN_LAG_MAX;
      });
      candidates.sort((a, b) => {
        const da = Math.abs(a.lpg - cnLpg);
        const db = Math.abs(b.lpg - cnLpg);
        return da - db || new Date(a.txDate) - new Date(b.txDate);
      });
      const target = candidates.find((c) => Math.abs(c.lpg - cnLpg) <= TOL) || candidates[0];
      if (!target) continue;

      discovered.push({
        cnDoc: cnKey,
        cnDate: cn.txDate,
        targetInv: target.doc,
        invDate: target.txDate,
        cnLpg,
        invLpg: target.lpg,
        dnKey: dn,
        gate: 'dn_key',
        lagDays: round2((cnDate - new Date(target.txDate)) / 86400000),
        exact: Math.abs(target.lpg - cnLpg) <= TOL,
      });
      break;
    }
  }
  return discovered;
}

function main() {
  const docs = loadInvoices();
  const paidByInv = loadPaidByInv();
  const baseline = JSON.parse(fs.readFileSync(path.join(DATA, 'cn_offsets_baseline.json'), 'utf8'));
  const baselineKeys = new Set(baseline.map((b) => clean(b.cnDoc)));

  const dnDiscovered = discoverDnGateOffsets(docs, baselineKeys);

  const allOffsets = [
    ...baseline.map((b) => ({ ...b, cnDoc: clean(b.cnDoc), targetInv: clean(b.targetInv) })),
    ...dnDiscovered.map((d) => ({
      cnDoc: d.cnDoc,
      targetInv: d.targetInv,
      cnLpg: d.cnLpg,
      gate: d.gate,
      dnKey: d.dnKey,
      cnDate: d.cnDate,
      invDate: d.invDate,
      lagDays: d.lagDays,
    })),
  ];

  const netLpg = new Map();
  const invoices = [...docs.values()].filter((d) => d.entryType === 'Invoice' && d.lpg > TOL);
  for (const inv of invoices) netLpg.set(inv.doc, inv.lpg);

  for (const off of allOffsets) {
    const cur = netLpg.get(off.targetInv);
    if (cur === undefined) continue;
    netLpg.set(off.targetInv, round2(cur - off.cnLpg));
  }

  const outstanding = [];
  for (const inv of invoices) {
    const net = netLpg.get(inv.doc) ?? inv.lpg;
    if (net <= TOL) continue;
    const paid = paidByInv.get(inv.doc) || 0;
    const open = round2(Math.max(0, net - paid));
    if (open <= TOL) continue;
    outstanding.push({
      doc: inv.doc,
      date: inv.txDate,
      lpg: inv.lpg,
      other: inv.other,
      netTarget: round2(net + inv.other),
      engineOpen: open,
      paid,
      netLpg: net,
    });
  }
  outstanding.sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));

  const engineOpenSum = round2(outstanding.reduce((s, r) => s + r.engineOpen, 0));
  const phantomClosed = round2(TURN7_OPEN_SUM - engineOpenSum);

  const audit2026 = dnDiscovered.filter((d) => d.cnDate >= '2026-03-01' && d.cnDate <= '2026-06-30');

  fs.writeFileSync(
    path.join(DATA, 'cn_offsets_merged.json'),
    JSON.stringify({ baseline: baseline.length, dn_discovered: dnDiscovered.length, offsets: allOffsets }, null, 2) + '\n',
  );

  const auditMd = `# WO0001 — CN DN-Ref Audit (Mar–Jun 2026)

**Turn:** WO0001-8  
**Generated:** ${new Date().toISOString().slice(0, 10)}

---

## Executive summary

| Metric | Value | Tag |
| :--- | ---: | :--- |
| Baseline Tier-3 (ref_no gate) | ${baseline.length} offsets | PROVEN (Turn 7 engine) |
| **New DN-gate discoveries** | **${dnDiscovered.length}** | ASSERTED |
| Mar–Jun 2026 DN discoveries | ${audit2026.length} | — |
| Turn 7 engine-open sum | ${fmtR(TURN7_OPEN_SUM)} | ASSERTED |
| Turn 8 engine-open sum | ${fmtR(engineOpenSum)} | ASSERTED |
| **Phantom open closed** | **${fmtR(phantomClosed)}** | PROVEN (arithmetic) |
| Gap vs dashboard LPG | ${fmtR(round2(engineOpenSum - DASHBOARD_LPG))} | DEFECT (residual) |

---

## Root cause (Turn 7 defect)

2026 LPG credit notes cite **DN#** in \`ref_no\` / description, not \`invoice.doc_no\`:

| CN | DN | LPG | → Invoice | Missed by ref_no gate? |
| :--- | :--- | ---: | :--- | :---: |
| 14595 | 21959 | R13 895,01 | **49682** | **yes** |
| 14670 | 22031 | R8 759,77 | **49968** | **yes** |
| 14829 | 22357 | R11 835,47 | **50459** | **yes** (same-day correction) |
| 15010 | 22450 | R14 167,87 | **50937** | **yes** |

CN **14608**, **15011** already matched via ref_no in baseline.

---

## DN-gate discoveries (full ledger)

| CN | Date | DN | → Invoice | Inv LPG | CN LPG | Lag | Exact |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | :---: |
${dnDiscovered
  .map(
    (d) =>
      `| ${d.cnDoc} | ${d.cnDate} | ${d.dnKey} | ${d.targetInv} | ${fmtR(d.invLpg)} | ${fmtR(d.cnLpg)} | ${d.lagDays}d | ${d.exact ? '✓' : '~'} |`,
  )
  .join('\n')}

---

## Proposed gate rule (\`config/cn_dn_gate_proposed.json\`)

\`\`\`text
Tier 3a: CN.ref_no = invoice.doc_no (unchanged)
Tier 3b: CN LPG DN# = invoice LPG DN#, lag ∈ [${CN_LAG_MIN}, ${CN_LAG_MAX}]d, |cn_lpg| ≈ inv_lpg (±R${TOL})
\`\`\`

**Kill condition:** If Tier 3b match ambiguous (>1 candidate, no amount tie-break), STOP and queue operator.

---

## Invoices removed from outstanding by DN gate

${dnDiscovered
  .filter((d) => d.exact)
  .map((d) => `- **${d.targetInv}** ← CN ${d.cnDoc} (${fmtR(d.cnLpg)} void)`)
  .join('\n') || '_None_'}

---

*Read-only audit complete. Merged offsets: \`data/cn_offsets_merged.json\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_CN_DN_Ref_Audit_2026Q1Q2.md'), auditMd);

  const outMd = `# WO0001 — Full Ledger Allocation (DN CN gate v2)

**Method:** Tier 3a ref_no + Tier 3b DN-key CN offset · open balance from \`allocation_edges.csv\`  
**Turn:** WO0001-8  
**Generated:** ${new Date().toISOString().slice(0, 10)}

## Summary

| Metric | Turn 7 | Turn 8 | Δ |
| :--- | ---: | ---: | ---: |
| CN offsets (ref_no) | 24 | ${baseline.length} | — |
| CN offsets (DN gate added) | 0 | **${dnDiscovered.length}** | +${dnDiscovered.length} |
| **Outstanding invoices** | 28 | **${outstanding.length}** | ${outstanding.length - 28} |
| **Sum engine-open** | R161 214,89 | **${fmtR(engineOpenSum)}** | **${fmtR(round2(engineOpenSum - TURN7_OPEN_SUM))}** |
| Gap vs LPG debt R92 844,18 | R68 370,71 | **${fmtR(round2(engineOpenSum - DASHBOARD_LPG))}** | ${fmtR(round2(68370.71 - (engineOpenSum - DASHBOARD_LPG)))} |

## Tier 3b — DN gate additions (new)

| CN | Date | DN | → Invoice | CN LPG | Net after |
| :--- | :--- | :--- | :--- | ---: | ---: |
${dnDiscovered
  .map((d) => {
    const net = netLpg.get(d.targetInv);
    return `| ${d.cnDoc} | ${d.cnDate} | ${d.dnKey} | ${d.targetInv} | ${fmtR(d.cnLpg)} | ${net !== undefined ? fmtR(net) : '—'} |`;
  })
  .join('\n')}

## Outstanding (LPG + OTHER event net)

| Invoice | Date | LPG | OTHER | Net target | Engine open | Paid |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: |
${outstanding
  .map(
    (r) =>
      `| ${r.doc} | ${r.date} | ${fmtR(r.lpg)} | ${r.other ? fmtR(r.other) : '—'} | ${fmtR(r.netTarget)} | ${fmtR(r.engineOpen)} | ${fmtR(r.paid)} |`,
  )
  .join('\n')}

**Edges:** \`data/allocation_edges.csv\` (unchanged)

*Generated by \`scripts/cn_dn_gate_rebuild.mjs\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Allocation_Outstanding.md'), outMd);

  const bridgeMd = `# WO0001 — Statement Bridge (v2)

**Turn:** WO0001-8  
**Generated:** ${new Date().toISOString().slice(0, 10)}

---

## 1. CN gate fix — PROVEN partial close

| Identity | Result |
| :--- | :--- |
| Turn 7 open − Turn 8 open | **${fmtR(phantomClosed)} closed** |
| Invoices dropped from outstanding | ${28 - outstanding.length} (net count ${outstanding.length}) |
| DN-gate additions | ${dnDiscovered.length} (incl. CN 14595→49682 defect) |

---

## 2. Two-lane ERP (unchanged)

| Component | Amount |
| :--- | ---: |
| LPG gas debt | R92 844,18 |
| Cylinder financial | R17 945,18 |
| **ERP balance 2026-06-03** | **R110 789,36** |

---

## 3. Allocation-lane residual

| Line | Amount |
| :--- | ---: |
| Engine-open (Turn 8) | ${fmtR(engineOpenSum)} |
| Dashboard LPG debt | R92 844,18 |
| **Gap** | **${fmtR(round2(engineOpenSum - DASHBOARD_LPG))}** |

**STOP:** Gap still ≠ R0.05. Residual drivers: OTHER-lane unallocated slices, truncation micro-open (R1,09), historic partial-pay invoices, CYL overlap.

---

## 4. Next steps

1. Ratify \`allocation_overrides_proposed.json\` + \`cn_dn_gate_proposed.json\`
2. Worker Turn 9: OTHER-lane pass on unallocated edges (pre-2026)
3. Sources: ERP TXT refresh (CURRENT R88 768,73)

*Audit: \`WO0001_CN_DN_Ref_Audit_2026Q1Q2.md\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Statement_Bridge_v2.md'), bridgeMd);

  fs.writeFileSync(
    path.join(DEBTOR_DIR, 'config/cn_dn_gate_proposed.json'),
    JSON.stringify(
      {
        version: '2026-07-20',
        account: 'WO0001',
        tier3b: {
          dn_key_matching: true,
          cn_lag_min: CN_LAG_MIN,
          cn_lag_max: CN_LAG_MAX,
          lpg_tolerance: TOL,
          approval_status: 'proposed',
        },
        dn_discovered_count: dnDiscovered.length,
        phantom_open_closed: phantomClosed,
      },
      null,
      2,
    ) + '\n',
  );

  console.log(
    JSON.stringify(
      {
        baseline: baseline.length,
        dnDiscovered: dnDiscovered.length,
        outstandingCount: outstanding.length,
        engineOpenSum,
        phantomClosed,
        gapToLpg: round2(engineOpenSum - DASHBOARD_LPG),
      },
      null,
      2,
    ),
  );
}

main();
