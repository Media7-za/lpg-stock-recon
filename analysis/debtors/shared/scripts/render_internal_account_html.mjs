#!/usr/bin/env node
/**
 * Internal Account HTML — the operational/reconciliation projection.
 *
 * Reads the FULL canonical account (no filtering). This is the one renderer
 * allowed to show reconciliation machinery, data-quality gate detail, and
 * source references — see canonical_account_model.mjs's module header for
 * why none of that belongs on the customer projection.
 */
import fs from 'fs';
import path from 'path';
import { fmtAmount, displayDate } from './debenq_open_invoices.mjs';
import { ROOT } from './canonical_account_model.mjs';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const R = (n) => (n == null ? '—' : `R${fmtAmount(Math.abs(n))}${n < 0 ? ' CR' : ''}`);

function eventRow(e) {
  const laneTag = e.lane ? `<span class="tag tag-${e.lane.toLowerCase()}">${e.lane}</span>` : '';
  const amtClass = e.amount < 0 ? 'neg' : '';
  return `<tr>
    <td>${displayDate(e.date)}</td>
    <td>${esc(e.description)} ${laneTag}</td>
    <td class="mono">${esc(e.reference)}${e.dnRef ? ` <span class="ref-sub">${esc(e.dnRef)}</span>` : ''}</td>
    <td class="num ${amtClass}">${fmtAmount(e.amount)}</td>
    <td class="num">${fmtAmount(e.balanceAfter)}</td>
    <td class="mono src">${esc(e.sourceSystem)}</td>
  </tr>`;
}

function exceptionRow(x) {
  return `<tr><td>${esc(x.type)}</td><td>${esc(x.basis)}</td><td>${esc(x.status)}</td><td>${esc(x.description)}</td></tr>`;
}

function invoiceRow(inv) {
  return `<tr><td>${esc(inv.doc)}</td><td>${displayDate(inv.date)}</td><td class="mono">${esc(inv.reference)}</td><td class="num">${fmtAmount(inv.due)}</td></tr>`;
}

function docRow(d) {
  return `<tr><td>${esc(d.label)}</td><td><span class="tag tag-${d.visibility}">${d.visibility}</span></td><td class="mono">${esc(d.path)}</td></tr>`;
}

export function renderInternalHtml(canonical) {
  const fp = canonical.financialPosition;
  const invTotal = canonical.events.filter((e) => e.type === 'invoice').reduce((s, e) => s + e.amount, 0);
  const cnTotal = canonical.events.filter((e) => e.type === 'credit_note').reduce((s, e) => s + e.amount, 0);
  const payTotal = canonical.events.filter((e) => e.type === 'payment' || e.type === 'journal').reduce((s, e) => s + e.amount, 0);
  const gate = canonical.dataQuality.invoiceTagCoverage;
  const recon = canonical.reconciliation;
  const custody = canonical.custodyPosition;

  return `<title>${esc(canonical.customer.name)} — Internal Account</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
  :root{
    --bg:#F2F5F5; --surface:#FFFFFF; --surface-2:#E9F1F1;
    --ink:#16222B; --ink-soft:#51636D; --ink-faint:#8496A0; --border:#D6E0E1;
    --accent:#1B6E76; --accent-ink:#0E4B52; --accent-soft:#E1EFEF;
    --good:#1D7A45; --good-soft:#E3F4E9;
    --warn:#9A6A0C; --warn-soft:#F6EBD2;
    --bad:#A6403B; --bad-soft:#F7E4E2;
    --neg:#A6403B; --mono-bg:#EDF2F2; --shadow:rgba(20,40,45,0.10);
    --lpg:#1B6E76; --cyl:#7A5B1E;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#0E161A; --surface:#141F24; --surface-2:#17282C;
      --ink:#E7F0F1; --ink-soft:#9AB0B6; --ink-faint:#6C8288; --border:#263539;
      --accent:#4FC2C9; --accent-ink:#8CE0E5; --accent-soft:rgba(79,194,201,0.14);
      --good:#4FCB86; --good-soft:rgba(79,203,134,0.14);
      --warn:#E0B054; --warn-soft:rgba(224,176,84,0.14);
      --bad:#E4948E; --bad-soft:rgba(228,148,142,0.14);
      --neg:#E4948E; --mono-bg:#172427; --shadow:rgba(0,0,0,0.45);
      --lpg:#4FC2C9; --cyl:#E0B054;
    }
  }
  :root[data-theme="dark"]{
    --bg:#0E161A; --surface:#141F24; --surface-2:#17282C;
    --ink:#E7F0F1; --ink-soft:#9AB0B6; --ink-faint:#6C8288; --border:#263539;
    --accent:#4FC2C9; --accent-ink:#8CE0E5; --accent-soft:rgba(79,194,201,0.14);
    --good:#4FCB86; --good-soft:rgba(79,203,134,0.14);
    --warn:#E0B054; --warn-soft:rgba(224,176,84,0.14);
    --bad:#E4948E; --bad-soft:rgba(228,148,142,0.14);
    --neg:#E4948E; --mono-bg:#172427; --shadow:rgba(0,0,0,0.45);
    --lpg:#4FC2C9; --cyl:#E0B054;
  }
  *{box-sizing:border-box;}
  body{ background:var(--bg); color:var(--ink); font-family:'IBM Plex Sans', system-ui, sans-serif; padding-inline:20px; padding-block:44px 80px; }
  .page{ max-width:920px; margin-inline:auto; }
  h1,h2{ font-family:'Spectral', Georgia, serif; text-wrap:balance; margin:0; }
  .num, .mono{ font-family:'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric:tabular-nums; }
  .eyebrow{ font-size:0.72rem; letter-spacing:0.09em; text-transform:uppercase; color:var(--accent-ink); font-weight:600; }
  h1{ font-size:clamp(1.7rem,4vw,2.2rem); margin-top:4px; }
  .sub{ color:var(--ink-soft); margin-top:6px; font-size:0.92rem; }
  .pill{ display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:99px; font-size:0.7rem; font-weight:600; letter-spacing:0.03em; text-transform:uppercase; }
  .pill::before{ content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
  .pill-good{ background:var(--good-soft); color:var(--good); }
  .pill-warn{ background:var(--warn-soft); color:var(--warn); }
  .pill-bad{ background:var(--bad-soft); color:var(--bad); }
  .pill-accent{ background:var(--accent-soft); color:var(--accent-ink); }

  .stat-strip{ display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; margin-top:24px; }
  .stat{ background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:13px 15px; }
  .stat-label{ font-size:0.68rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:6px; }
  .stat-value{ font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; font-size:1.25rem; font-weight:600; }

  section{ margin-top:40px; }
  .section-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:14px; }
  h2{ font-size:1.15rem; font-weight:600; }
  .note{ color:var(--ink-soft); font-size:0.85rem; max-width:70ch; margin:0 0 14px; }

  .table-wrap{ overflow-x:auto; border:1px solid var(--border); border-radius:10px; background:var(--surface); }
  table{ width:100%; border-collapse:collapse; font-size:0.85rem; }
  thead th{ text-align:right; font-size:0.66rem; letter-spacing:0.04em; text-transform:uppercase; color:var(--ink-faint); font-weight:600; background:var(--surface-2); padding:8px 12px; white-space:nowrap; }
  thead th:first-child, thead th:nth-child(2), thead th:nth-child(3){ text-align:left; }
  tbody td{ padding:7px 12px; text-align:right; border-top:1px solid var(--border); }
  tbody td:first-child, tbody td:nth-child(2), tbody td:nth-child(3){ text-align:left; }
  .neg{ color:var(--neg); }
  .ref-sub{ color:var(--ink-faint); font-size:0.76rem; }
  .src{ color:var(--ink-faint); font-size:0.76rem; }
  .tag{ display:inline-block; padding:1px 7px; border-radius:6px; font-size:0.62rem; font-weight:700; letter-spacing:0.03em; margin-left:4px; }
  .tag-lpg{ background:var(--accent-soft); color:var(--lpg); }
  .tag-cyl{ background:var(--warn-soft); color:var(--cyl); }
  .tag-internal{ background:var(--bad-soft); color:var(--bad); }
  .tag-customer{ background:var(--good-soft); color:var(--good); }
  .tag-both{ background:var(--accent-soft); color:var(--accent-ink); }

  .gate-banner{ padding:14px 16px; border-radius:10px; border:1px solid var(--border); margin-bottom:14px; font-size:0.86rem; }
  .gate-ALLOWED{ background:var(--good-soft); border-color:transparent; }
  .gate-REVIEW_REQUIRED{ background:var(--warn-soft); border-color:transparent; }
  .gate-BLOCKED, .gate-NOT_DERIVABLE_FROM_TXT{ background:var(--bad-soft); border-color:transparent; }
  .gate-title{ font-weight:700; margin-bottom:4px; }

  footer{ margin-top:48px; padding-top:16px; border-top:1px solid var(--border); font-size:0.74rem; color:var(--ink-faint); }
  @media (max-width:520px){ thead th, tbody td{ padding:6px 8px; font-size:0.78rem; } }
</style>

<div class="page">
  <span class="eyebrow">Internal Account View</span>
  <h1>${esc(canonical.customer.name)}</h1>
  <p class="sub">
    Account <span class="mono">${esc(canonical.account.code)}</span>
    &nbsp;·&nbsp; ${recon ? `<span class="pill pill-${recon.workspaceStatus === 'clean' ? 'good' : 'warn'}">${esc(recon.workspaceStatus)}</span>` : ''}
    &nbsp;·&nbsp; last updated ${esc(canonical.sourceMetadata.generatedAt.slice(0, 16).replace('T', ' '))}
  </p>

  <div class="stat-strip">
    <div class="stat"><div class="stat-label">Current Balance</div><div class="stat-value">${R(fp.currentBalance)}</div></div>
    <div class="stat"><div class="stat-label">Window Opening B/F</div><div class="stat-value">${R(fp.windowOpeningBalance)}</div></div>
    <div class="stat"><div class="stat-label">Open Invoices</div><div class="stat-value">${R(canonical.openInvoices.subtotal)}</div></div>
    <div class="stat"><div class="stat-label">Account-Level Balance</div><div class="stat-value">${R(fp.accountLevelBalance)}</div></div>
  </div>

  <section id="financial-position">
    <div class="section-head"><h2>Financial Position</h2></div>
    <div class="table-wrap">
      <table>
        <tbody>
          <tr><td>Window opening balance</td><td class="num">${fmtAmount(fp.windowOpeningBalance)}</td></tr>
          <tr><td>Σ Invoices</td><td class="num">${fmtAmount(invTotal)}</td></tr>
          <tr><td>Σ Credit notes</td><td class="num neg">${fmtAmount(cnTotal)}</td></tr>
          <tr><td>Σ Payments / journals</td><td class="num neg">${fmtAmount(payTotal)}</td></tr>
          <tr><td><b>Current balance</b></td><td class="num"><b>${fmtAmount(fp.currentBalance)}</b></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section id="activity">
    <div class="section-head"><h2>Account Activity</h2></div>
    <p class="note">Full event ledger, recomputed in calendar order from the ERP export (the export's own row order is grouped by entry type, not date — see canonical_account_model.mjs).</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Event</th><th>Reference</th><th>Amount (R)</th><th>Balance (R)</th><th>Source</th></tr></thead>
        <tbody>${canonical.events.map(eventRow).join('')}</tbody>
      </table>
    </div>
  </section>

  <section id="reconciliation">
    <div class="section-head"><h2>Reconciliation</h2><span class="tag tag-internal">internal only</span></div>
    ${recon ? `
    <div class="table-wrap">
      <table>
        <tbody>
          <tr><td>Source</td><td class="mono">${esc(recon.source)}</td></tr>
          <tr><td>LPG Gas Debt (1A)</td><td class="num">${fmtAmount(recon.lpgGasDebt)}</td></tr>
          <tr><td>Cylinder Financial Balance (1B)</td><td class="num">${fmtAmount(recon.cylinderFinancialBalance)}</td></tr>
          <tr><td>ERP variance</td><td class="num">${fmtAmount(recon.erpVariance)}</td></tr>
          <tr><td>Sub-ledger tie variance</td><td class="num">${fmtAmount(recon.subLedgerVariance)}</td></tr>
          <tr><td>Cylinder variance</td><td class="num">${fmtAmount(recon.cylinderVariance)}</td></tr>
        </tbody>
      </table>
    </div>
    ${recon.exceptions.length ? `<div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Type</th><th>Basis</th><th>Status</th><th>Description</th></tr></thead><tbody>${recon.exceptions.map(exceptionRow).join('')}</tbody></table></div>` : '<p class="note">No open reconciliation exceptions.</p>'}
    ` : '<p class="note">No v5 fixture found for this debtor — reconciliation detail unavailable.</p>'}
  </section>

  <section id="data-quality">
    <div class="section-head"><h2>Data Quality — Invoice Tag Coverage</h2><span class="tag tag-internal">internal only</span></div>
    <div class="gate-banner gate-${gate.gate}">
      <div class="gate-title">${esc(gate.gate)} <span style="font-weight:400; color:var(--ink-soft)">· evidence: ${esc(gate.evidenceBasis)}</span></div>
      <div>${esc(gate.meaning)}</div>
    </div>
    <div class="table-wrap">
      <table>
        <tbody>
          <tr><td>Export excludes allocation detail</td><td class="num">${canonical.dataQuality.excludesAllocationDetail ? 'yes' : 'no'}</td></tr>
          <tr><td>Clear / stale-open / likely-paid / unassessable</td><td class="num mono">${gate.counts.clear} / ${gate.counts.stale_open} / ${gate.counts.likely_paid} / ${gate.counts.unassessable}</td></tr>
          <tr><td>Invariant (Σ open ≤ ERP balance)</td><td class="num">${esc(gate.invariant.status)}</td></tr>
          <tr><td>Untagged credit total</td><td class="num">${fmtAmount(gate.untaggedCreditTotal)}</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  ${custody ? `
  <section id="operational">
    <div class="section-head"><h2>Operational / Asset Position</h2></div>
    <p class="note">Cylinder custody — physical count, not yet exposed on the customer view beyond the aggregate total (see Customer Account View).</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>SKU</th><th>Net Returnable Qty</th><th>Deposit Rate</th><th>Custody Exposure</th></tr></thead>
        <tbody>
          ${custody.lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="num">${l.qty}</td><td class="num">${fmtAmount(l.depositRate)}</td><td class="num">${fmtAmount(l.exposure)}</td></tr>`).join('')}
          <tr><td><b>Total</b></td><td></td><td></td><td class="num"><b>${fmtAmount(custody.totalCustodyExposure)}</b></td></tr>
        </tbody>
      </table>
    </div>
  </section>` : ''}

  <section id="open-invoices">
    <div class="section-head"><h2>Open Invoices (raw reconstruction)</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Inv</th><th>Inv date</th><th>Ref</th><th>Due (R)</th></tr></thead>
        <tbody>${canonical.openInvoices.items.map(invoiceRow).join('')}</tbody>
      </table>
    </div>
  </section>

  <section id="documents">
    <div class="section-head"><h2>Documents</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Document</th><th>Visibility</th><th>Path</th></tr></thead>
        <tbody>${canonical.documents.map(docRow).join('')}</tbody>
      </table>
    </div>
  </section>

  <footer>
    Rendered from the canonical account layer — source ${esc(canonical.sourceMetadata.primaryTxt)}, config ${esc(canonical.sourceMetadata.configPath)}. Generated by canonical_account_model.mjs + render_internal_account_html.mjs.
  </footer>
</div>
`;
}

export function writeInternalHtml(canonical) {
  const outDir = path.join(ROOT, 'analysis/debtors', canonical.account.code, 'canonical');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${canonical.account.code}_internal_account.html`);
  fs.writeFileSync(outPath, renderInternalHtml(canonical));
  return outPath;
}
