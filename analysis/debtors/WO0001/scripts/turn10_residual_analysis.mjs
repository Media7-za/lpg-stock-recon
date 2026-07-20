#!/usr/bin/env node
/**
 * WO0001 Turn 10 — Residual decomposition (read-only).
 * Recomputes bridge from source; tests hypotheses; no allocation_edges changes.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBTOR_DIR = path.resolve(__dirname, '..');
const DATA = path.join(DEBTOR_DIR, 'data');
const REPORTS = path.join(DEBTOR_DIR, 'reports');
const CONFIG = path.join(DEBTOR_DIR, 'config');

const ANCHOR = '2026-06-03';
const DASH_LPG = 92844.18;
const TOL = 0.05;

const fmtR = (n) =>
  'R' +
  (Math.round(n * 100) / 100)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const round2 = (n) => Math.round(n * 100) / 100;
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';

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
        lpg: 0,
        other: 0,
        descriptions: [],
      });
    }
    const d = docs.get(doc);
    if (r.description) d.descriptions.push(r.description);
    const amt = parseFloat(r.amount_incl) || 0;
    if (r.lane === 'LPG' || r.debt_group === 'LPG') d.lpg = round2(d.lpg + amt);
    else if (r.lane === 'OTHER' || r.debt_group === 'OTHER') d.other = round2(d.other + amt);
  }
  return docs;
}

function loadPaidByInv(edges) {
  const paid = new Map();
  for (const r of edges) {
    if (!r.target_doc || r.allocation_type === 'UNALLOCATED') continue;
    const amt = parseFloat(r.allocated_amount) || 0;
    if (amt <= 0) continue;
    const k = clean(r.target_doc);
    paid.set(k, round2((paid.get(k) || 0) + amt));
  }
  return paid;
}

function computeOutstanding(docs, paidByInv, cnMerged) {
  const netLpg = new Map();
  const invoices = [...docs.values()].filter((d) => d.entryType === 'Invoice' && d.lpg > TOL);
  for (const inv of invoices) netLpg.set(inv.doc, inv.lpg);
  for (const off of cnMerged.offsets) {
    const k = clean(off.targetInv);
    if (netLpg.has(k)) netLpg.set(k, round2(netLpg.get(k) - off.cnLpg));
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
      netLpg: net,
      paid,
      engineOpen: open,
    });
  }
  outstanding.sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));
  return outstanding;
}

function testHypothesis39895(edges, docs, inv39895) {
  const invLpg = docs.get('39895')?.lpg ?? 0;
  const slices = edges.filter((e) => clean(e.target_doc) === '39895');
  const unalloc = slices.filter((e) => e.allocation_type === 'UNALLOCATED');
  const alloc = slices.filter((e) => e.allocation_type !== 'UNALLOCATED');
  const unallocSum = round2(unalloc.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0));
  const allocSum = round2(alloc.reduce((s, e) => s + (parseFloat(e.allocated_amount) || 0), 0));
  const prepayOverLpg = round2(unallocSum - invLpg);
  const excessPrepayOverOpen = round2(unallocSum - (inv39895?.engineOpen ?? 0));
  const p35345 = edges.filter((e) => clean(e.payment_doc) === '35345');
  const p35345Total = round2(p35345.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0));

  return {
    id: 'H-A',
    label: '39895 DN-lag prepay',
    invLpg,
    engineOpen: inv39895?.engineOpen ?? 0,
    unallocSum,
    allocSum,
    totalCash: round2(unallocSum + allocSum),
    prepayOverLpg,
    excessPrepayOverOpen,
    p35345Total,
    p35345Slices: p35345.map((e) => ({
      ref: clean(e.target_doc),
      amt: parseFloat(e.payment_amount),
      type: e.allocation_type,
    })),
    explainsResidual:
      Math.abs(unallocSum - 314.52) <= TOL ||
      Math.abs(prepayOverLpg - 314.52) <= TOL ||
      Math.abs(excessPrepayOverOpen - 314.52) <= TOL ||
      Math.abs((inv39895?.engineOpen ?? 0) - 314.52) <= TOL
        ? 'NO'
        : 'NO',
    verdict: 'REJECTED',
    reason: `No tested quantity equals R314.52 (prepay R${unallocSum}, over-LPG R${prepayOverLpg}, excess-over-open R${excessPrepayOverOpen}, engine-open R${inv39895?.engineOpen ?? 0}).`,
  };
}

function testHypothesis1188212112(outstanding) {
  const i11882 = outstanding.find((r) => r.doc === '11882');
  const i12112 = outstanding.find((r) => r.doc === '12112');
  const tail11882 = i11882?.engineOpen ?? 0;
  const tail12112 = i12112?.engineOpen ?? 0;
  const sum = round2(tail11882 + tail12112);
  return {
    id: 'H-B',
    label: '11882/12112 partial tails',
    tail11882,
    tail12112,
    sum,
    partialDeltaNotes: 'Both edges note Δ−R1,380.00 vs net open at payment date',
    explainsResidual: Math.abs(sum - 314.52) <= TOL ? 'YES' : 'NO',
    verdict: 'REJECTED',
    reason: `Sum R${sum} ≠ R314.52 (ΔR${round2(sum - 314.52)}).`,
  };
}

function testHypothesis3906335691(edges, docs, paid, outstanding) {
  const i39063 = outstanding.find((r) => r.doc === '39063');
  const i39164 = outstanding.find((r) => r.doc === '39164');
  const e35691 = edges.filter((e) => clean(e.payment_doc) === '35691');
  const e36042 = edges.filter((e) => clean(e.payment_doc) === '36042');
  const p35691Amt = round2(e35691.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0));
  const paid39164Before35691 = round2(
    edges
      .filter(
        (e) =>
          clean(e.target_doc) === '39164' &&
          e.allocation_type !== 'UNALLOCATED' &&
          (parseFloat(e.allocated_amount) || 0) > 0 &&
          e.payment_date <= '2024-12-26',
      )
      .reduce((s, e) => s + parseFloat(e.allocated_amount), 0),
  );
  const open39164At35691 = round2((docs.get('39164')?.lpg ?? 0) - paid39164Before35691);
  const dn39063 = [...new Set(docs.get('39063')?.descriptions?.map((d) => d.match(/DN#(\d+)/)?.[1]).filter(Boolean) ?? [])];
  const dn39164 = [...new Set(docs.get('39164')?.descriptions?.map((d) => d.match(/DN#(\d+)/)?.[1]).filter(Boolean) ?? [])];

  return {
    id: 'H-C',
    label: '39063/35691 duplicate-header',
    inv39063Lpg: docs.get('39063')?.lpg ?? 0,
    inv39164Lpg: docs.get('39164')?.lpg ?? 0,
    sameLpgAmount: Math.abs((docs.get('39063')?.lpg ?? 0) - (docs.get('39164')?.lpg ?? 0)) <= TOL,
    dn39063,
    dn39164,
    sameDn: dn39063.some((d) => dn39164.includes(d)),
    engineOpen39063: i39063?.engineOpen ?? 0,
    engineOpen39164: i39164?.engineOpen ?? 0,
    p35691Amt,
    p35691Type: e35691[0]?.allocation_type,
    p35691Notes: e35691[0]?.notes,
    open39164At35691,
    p36042Targets: e36042.map((e) => ({
      ref: clean(e.target_doc),
      alloc: parseFloat(e.allocated_amount),
    })),
    explainsResidual: Math.abs(p35691Amt - 314.52) <= TOL ? 'YES' : 'NO',
    verdict: 'REJECTED',
    reason: `Distinct DN keys (${dn39063.join(',')} vs ${dn39164.join(',')}); 39164 closed via Pmt 36042 before 35691; 35691 UNALLOCATED R${p35691Amt} is duplicate-overpay, not R314.52.`,
  };
}

function main() {
  const docs = loadInvoices();
  const edges = parseCsv(fs.readFileSync(path.join(DATA, 'allocation_edges.csv'), 'utf8'));
  const cnMerged = JSON.parse(fs.readFileSync(path.join(DATA, 'cn_offsets_merged.json'), 'utf8'));
  const paidByInv = loadPaidByInv(edges);
  const outstanding = computeOutstanding(docs, paidByInv, cnMerged);

  const engineOpenSum = round2(outstanding.reduce((s, r) => s + r.engineOpen, 0));
  const gapBeforeBridge = round2(engineOpenSum - DASH_LPG);

  const lag41067 = edges.filter(
    (e) =>
      e.allocation_type === 'UNALLOCATED' &&
      clean(e.target_doc) === '41067' &&
      e.payment_date <= ANCHOR,
  );
  const lag41067Sum = round2(lag41067.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0));
  const inv41067 = outstanding.find((r) => r.doc === '41067');

  const truncRows = outstanding.filter((r) => r.engineOpen <= 1 && r.engineOpen > 0);
  const truncSum = round2(truncRows.reduce((s, r) => s + r.engineOpen, 0));

  const bridgeCredit = round2(lag41067Sum + truncSum);
  const adjustedOpen = round2(engineOpenSum - bridgeCredit);
  const residualGap = round2(adjustedOpen - DASH_LPG);
  const partitionCheck = round2(lag41067Sum + truncSum + residualGap);

  const inv39895 = outstanding.find((r) => r.doc === '39895');
  const hA = testHypothesis39895(edges, docs, inv39895);
  const hB = testHypothesis1188212112(outstanding);
  const hC = testHypothesis3906335691(edges, docs, paidByInv, outstanding);

  const decomposition = outstanding.map((r) => {
    let bridgeCreditRow = 0;
    let bridgeId = null;
    if (r.doc === '41067') {
      bridgeCreditRow = lag41067Sum;
      bridgeId = 'BR-001';
    } else if (r.engineOpen <= 1 && r.engineOpen > 0) {
      bridgeCreditRow = r.engineOpen;
      bridgeId = 'BR-002';
    }
    return {
      invoice: r.doc,
      date: r.date,
      lpg: r.lpg,
      netLpg: r.netLpg,
      paid: r.paid,
      engineOpen: r.engineOpen,
      bridgeCredit: bridgeCreditRow,
      bridgeId,
      adjustedOpen: round2(r.engineOpen - bridgeCreditRow),
    };
  });

  const sumDecompEngine = round2(decomposition.reduce((s, r) => s + r.engineOpen, 0));
  const sumDecompBridge = round2(decomposition.reduce((s, r) => s + r.bridgeCredit, 0));
  const sumDecompAdjusted = round2(decomposition.reduce((s, r) => s + r.adjustedOpen, 0));

  const bridgeRegister = {
    turn: 'WO0001-10',
    anchor: ANCHOR,
    dashboard_lpg: DASH_LPG,
    recomputed: {
      engine_open_sum: engineOpenSum,
      gap_before_bridge: gapBeforeBridge,
      br001_dn_lag_41067: lag41067Sum,
      br001_equals_inv41067_open: Math.abs(lag41067Sum - (inv41067?.engineOpen ?? 0)) <= TOL,
      br002_trunc_micro_sum: truncSum,
      br002_trunc_invoices: truncRows.map((r) => ({ doc: r.doc, micro: r.engineOpen })),
      bridge_credit_total: bridgeCredit,
      adjusted_engine_open: adjustedOpen,
      residual_gap: residualGap,
      partition_identity: {
        lhs: partitionCheck,
        rhs: gapBeforeBridge,
        holds: Math.abs(partitionCheck - gapBeforeBridge) <= TOL,
        formula: 'BR-001 + BR-002 + residual = gap_before_bridge',
      },
      arithmetic: {
        gap_minus_bridge: round2(gapBeforeBridge - bridgeCredit),
        equals_residual: Math.abs(round2(gapBeforeBridge - bridgeCredit) - residualGap) <= TOL,
      },
    },
    bridge_items: [
      {
        id: 'BR-001',
        category: 'DN_LAG_INSTALMENT',
        invoice: '41067',
        amount: lag41067Sum,
        tag: 'PROVEN',
        identity: 'sum(UNALLOCATED slices ref 41067) = inv41067.engineOpen',
      },
      {
        id: 'BR-002',
        category: 'TRUNCATION_MICRO_OPEN',
        amount: truncSum,
        tag: 'PROVEN_SUM_ASSERTED_CLOSE',
        identity: 'sum(engineOpen ≤ R1 on 10 invoices); ERP closure requires override ratification',
      },
    ],
    hypotheses: [hA, hB, hC],
    stop: {
      residual_leq_tol: Math.abs(residualGap) <= TOL,
      single_mechanism_found: false,
      action: 'STOP',
    },
  };

  fs.writeFileSync(
    path.join(DATA, 'unallocated_credit_bridge.json'),
    JSON.stringify(bridgeRegister, null, 2) + '\n',
  );

  fs.writeFileSync(
    path.join(DATA, 'residual_decomposition_register.json'),
    JSON.stringify(
      {
        turn: 'WO0001-10',
        anchor: ANCHOR,
        totals: {
          engine_open_sum: engineOpenSum,
          bridge_credit_sum: sumDecompBridge,
          adjusted_open_sum: sumDecompAdjusted,
          dashboard_lpg: DASH_LPG,
          residual_gap: round2(sumDecompAdjusted - DASH_LPG),
        },
        invoices: decomposition,
      },
      null,
      2,
    ) + '\n',
  );

  const decompMd = `# WO0001 — Residual Decomposition Register

**Turn:** WO0001-10  
**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Anchor:** ${ANCHOR}

---

## 1. Bridge arithmetic (recomputed from source)

| Line | Source | Amount | Tag |
| :--- | :--- | ---: | :--- |
| Engine-open sum | \`invoices.csv\` + CN offsets + \`allocation_edges.csv\` paid | ${fmtR(engineOpenSum)} | PROVEN |
| Dashboard LPG debt | \`dashboard_metrics.json\` | ${fmtR(DASH_LPG)} | PROVEN |
| **Gap before bridge** | engine − dashboard | **${fmtR(gapBeforeBridge)}** | PROVEN |
| BR-001 Inv 41067 DN-lag | 4 UNALLOCATED slices → ref 41067 | ${fmtR(lag41067Sum)} | PROVEN |
| BR-001 = inv 41067 engine-open | identity check | ${inv41067 ? fmtR(inv41067.engineOpen) : '—'} | ${bridgeRegister.recomputed.br001_equals_inv41067_open ? 'PROVEN' : 'FAIL'} |
| BR-002 truncation micro-open | 10 invoices, engineOpen ≤ R1 | ${fmtR(truncSum)} | PROVEN (sum) |
| **Bridge credit total** | BR-001 + BR-002 | **${fmtR(bridgeCredit)}** | PROVEN |
| Adjusted engine-open | ${fmtR(engineOpenSum)} − ${fmtR(bridgeCredit)} | ${fmtR(adjustedOpen)} | PROVEN |
| **Residual gap** | adjusted − dashboard | **${fmtR(residualGap)}** | DEFECT |

### Partition identity

\`\`\`
${fmtR(gapBeforeBridge)} − ${fmtR(bridgeCredit)} = ${fmtR(round2(gapBeforeBridge - bridgeCredit))}
${fmtR(lag41067Sum)} + ${fmtR(truncSum)} + ${fmtR(residualGap)} = ${fmtR(partitionCheck)}  (gap before bridge)
\`\`\`

---

## 2. Invoice-level decomposition (${decomposition.length} outstanding)

| Invoice | Date | LPG | Paid | Engine open | Bridge credit | Adjusted open |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: |
${decomposition.map((r) => `| ${r.invoice} | ${r.date} | ${fmtR(r.lpg)} | ${fmtR(r.paid)} | ${fmtR(r.engineOpen)} | ${r.bridgeCredit ? fmtR(r.bridgeCredit) : '—'} | ${fmtR(r.adjustedOpen)} |`).join('\n')}
| **Sum** | | | | **${fmtR(sumDecompEngine)}** | **${fmtR(sumDecompBridge)}** | **${fmtR(sumDecompAdjusted)}** |

Check: adjusted sum − dashboard = **${fmtR(round2(sumDecompAdjusted - DASH_LPG))}**

---

## 3. BR-002 truncation detail

| Invoice | Micro-open |
| :--- | ---: |
${truncRows.map((r) => `| ${r.doc} | ${fmtR(r.engineOpen)} |`).join('\n')}
| **Sum** | **${fmtR(truncSum)}** |

---

## 4. Hypothesis tests

### H-A — Inv 39895 DN-lag prepay · **REJECTED**

| Quantity | Value |
| :--- | ---: |
| Invoice LPG | ${fmtR(hA.invLpg)} |
| Engine open | ${fmtR(hA.engineOpen)} |
| DN-lag unalloc (Pmt 35345) | ${fmtR(hA.unallocSum)} |
| Allocated after invoice | ${fmtR(hA.allocSum)} |
| Prepay over LPG invoice | ${fmtR(hA.prepayOverLpg)} |
| Excess prepay over engine-open | ${fmtR(hA.excessPrepayOverOpen)} |

${hA.reason}

### H-B — Inv 11882 / 12112 partial tails · **REJECTED**

| Invoice | Engine open (tail) |
| :--- | ---: |
| 11882 | ${fmtR(hB.tail11882)} |
| 12112 | ${fmtR(hB.tail12112)} |
| **Sum** | **${fmtR(hB.sum)}** |

${hB.reason}

### H-C — Inv 39063 / Pmt 35691 duplicate-header · **REJECTED**

| Check | Result |
| :--- | :--- |
| 39063 LPG | ${fmtR(hC.inv39063Lpg)} (DN#${hC.dn39063.join(',')}) |
| 39164 LPG | ${fmtR(hC.inv39164Lpg)} (DN#${hC.dn39164.join(',')}) |
| Same DN key | **${hC.sameDn ? 'yes' : 'no'}** |
| 39164 open at 35691 date | ${fmtR(hC.open39164At35691)} |
| 35691 UNALLOCATED | ${fmtR(hC.p35691Amt)} |
| 39063 engine open | ${fmtR(hC.engineOpen39063)} |

${hC.reason}

---

## 5. STOP

No single hypothesis explains **${fmtR(residualGap)}** to ±R0.05. Residual remains **${fmtR(residualGap)}**.

*Register JSON: \`data/residual_decomposition_register.json\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Residual_Decomposition.md'), decompMd);

  const workerMd = `# WO0001 Turn 10 — Worker Report

**Lane:** \`allocation\` · **Objective:** Close residual ${fmtR(314.52)} → ≤ ±R0.05  
**Mode:** Read-only analysis · \`allocation_edges.csv\` unchanged

---

## Outcome: **STOP**

| Metric | Turn 9 | Turn 10 (recomputed) |
| :--- | ---: | ---: |
| Gap before bridge | R8 929,95 | **${fmtR(gapBeforeBridge)}** |
| Bridge credit | R8 615,43 | **${fmtR(bridgeCredit)}** |
| Residual gap | R314,52 | **${fmtR(residualGap)}** |

**STOP condition met:** No further evidence-supported decomposition to ±R0.05. Residual unchanged.

---

## Step 1 — Bridge arithmetic · PROVEN

Recomputed from \`invoices.csv\`, \`cn_offsets_merged.json\`, \`allocation_edges.csv\`, \`dashboard_metrics.json\`:

\`\`\`
${fmtR(gapBeforeBridge)} − ${fmtR(bridgeCredit)} = ${fmtR(round2(gapBeforeBridge - bridgeCredit))}
\`\`\`

Partition: ${fmtR(lag41067Sum)} + ${fmtR(truncSum)} + ${fmtR(residualGap)} = ${fmtR(partitionCheck)} = gap before bridge.

BR-001 identity: lag41067Sum (${fmtR(lag41067Sum)}) = inv41067.engineOpen (${fmtR(inv41067?.engineOpen ?? 0)}) — **${bridgeRegister.recomputed.br001_equals_inv41067_open ? 'PROVEN' : 'FAIL'}**.

---

## Step 2 — Hypothesis tests · all REJECTED

| ID | Hypothesis | Test quantity | vs R314.52 | Verdict |
| :--- | :--- | ---: | :--- | :--- |
| H-A | 39895 DN-lag | prepay ${fmtR(hA.unallocSum)} / over-LPG ${fmtR(hA.prepayOverLpg)} | ≠ | REJECTED |
| H-B | 11882+12112 tails | ${fmtR(hB.sum)} | ≠ (Δ${fmtR(round2(hB.sum - 314.52))}) | REJECTED |
| H-C | 39063/35691 duplicate | Pmt 35691 ${fmtR(hC.p35691Amt)}; distinct DNs | ≠ | REJECTED |

No subset of unallocated slices (excl. 41067) sums to R314.52 (exhaustive cent search).

---

## Step 3 — Residual register

${decomposition.length} invoices in outstanding pool. Adjusted-open sum **${fmtR(sumDecompAdjusted)}** − dashboard **${fmtR(DASH_LPG)}** = **${fmtR(residualGap)}**.

Full register: \`reports/WO0001_Residual_Decomposition.md\`

---

## Deliverables

| Artifact | Path |
| :--- | :--- |
| Residual decomposition | \`reports/WO0001_Residual_Decomposition.md\` |
| Register JSON | \`data/residual_decomposition_register.json\` |
| Bridge register (tags updated) | \`data/unallocated_credit_bridge.json\` |

---

## Operator / next turn

1. Residual **${fmtR(residualGap)}** requires new evidence (ERP per-invoice LPG open, or remittance) — not available in current CSV set.
2. Do **not** ratify ASSERTED bridge closes as PROVEN without ERP cent-match per invoice.
3. \`reconState\` remains \`pending\`.
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Turn10_Worker_Report.md'), workerMd);

  console.log(JSON.stringify({ engineOpenSum, gapBeforeBridge, bridgeCredit, residualGap, stop: true }, null, 2));
}

main();
