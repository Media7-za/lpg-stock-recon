#!/usr/bin/env node
/**
 * Customer Account HTML — the "account portal" projection.
 *
 * Reads ONLY projectCustomerView(canonical) — never the canonical object
 * directly. That's the architectural boundary this whole layer exists to
 * enforce: no reconciliation variance, no ingest/data-quality gate detail,
 * no internal document references. Just what the customer asked for: what
 * they bought, what they paid, what they owe, what's happening.
 */
import fs from 'fs';
import path from 'path';
import { fmtAmount, displayDate } from './debenq_open_invoices.mjs';
import { ROOT, projectCustomerView } from './canonical_account_model.mjs';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const monthName = (period) => new Date(`${period}-01T12:00:00`).toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

function movementRow(e) {
  const isCharge = e.amount > 0;
  return `<tr>
    <td>${displayDate(e.date)}</td>
    <td>${esc(e.description)}</td>
    <td class="num ${isCharge ? 'charge' : 'credit'}">${isCharge ? '+' : ''}${fmtAmount(e.amount)}</td>
  </tr>`;
}

function monthlyRow(m) {
  return `<tr><td>${monthName(m.period)}</td><td class="num">${fmtAmount(m.invoiced)}</td><td class="num">${fmtAmount(m.paymentsCredits)}</td><td class="num">${fmtAmount(m.closingBalance)}</td></tr>`;
}

function docRow(d) {
  return `<li>${esc(d.label)}</li>`;
}

export function renderCustomerHtml(canonical) {
  const v = projectCustomerView(canonical);

  return `<title>${esc(v.business.header[0])} Account Portal</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700&family=Work+Sans:wght@400;500;600;700&display=swap">
<style>
  :root{
    --bg:#EAE7E1; --paper:#FFFFFF; --ink:#221F1A; --ink-soft:#726B5E; --ink-faint:#A29A8B;
    --border:#DDD7CC; --accent:#B54B18; --accent-deep:#7C330E; --accent-soft:#F5E2D3;
    --good:#1D7A45; --good-soft:#E3F4E9; --shadow:rgba(35,22,10,0.12);
  }
  *{box-sizing:border-box;}
  body{ background:var(--bg); color:var(--ink); font-family:'Work Sans', system-ui, sans-serif; padding-inline:20px; padding-block:40px 80px; }
  .wrap{ max-width:760px; margin-inline:auto; }
  h1,h2{ font-family:'Fraunces', Georgia, serif; text-wrap:balance; margin:0; }
  .num{ font-variant-numeric:tabular-nums; }

  .topbar{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:22px; }
  .brand{ font-size:0.92rem; font-weight:600; color:var(--ink-soft); }
  .acct{ font-size:0.8rem; color:var(--ink-faint); }

  .balance-card{
    background:var(--paper); border:1px solid var(--border); border-radius:16px;
    padding:28px 30px; box-shadow:0 10px 26px -18px var(--shadow);
    display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:14px 24px;
  }
  .balance-card .label{ font-size:0.78rem; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); font-weight:600; margin-bottom:6px; }
  .balance-card .amount{ font-family:'Fraunces',serif; font-weight:600; font-size:2.4rem; color:var(--accent-deep); }
  .balance-card .asat{ font-size:0.82rem; color:var(--ink-soft); }
  .balance-card .cta{
    display:inline-block; padding:10px 18px; border-radius:99px; background:var(--accent);
    color:#fff; font-weight:600; font-size:0.85rem; text-decoration:none;
  }

  .cards{ display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:12px; margin-top:16px; }
  .card{ background:var(--paper); border:1px solid var(--border); border-radius:12px; padding:16px 18px; }
  .card .label{ font-size:0.7rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:6px; }
  .card .value{ font-family:'Fraunces',serif; font-weight:600; font-size:1.3rem; }

  section{ margin-top:36px; }
  .section-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:12px; }
  h2{ font-size:1.05rem; font-weight:600; }
  .hint{ font-size:0.8rem; color:var(--ink-faint); }

  .table-wrap{ background:var(--paper); border:1px solid var(--border); border-radius:12px; overflow:hidden; overflow-x:auto; }
  table{ width:100%; border-collapse:collapse; font-size:0.88rem; }
  thead th{ text-align:right; font-size:0.68rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); font-weight:600; padding:10px 16px; background:var(--accent-soft); }
  thead th:first-child, thead th:nth-child(2){ text-align:left; }
  tbody td{ padding:9px 16px; text-align:right; border-top:1px solid var(--border); }
  tbody td:first-child, tbody td:nth-child(2){ text-align:left; }
  .charge{ color:var(--accent-deep); font-weight:600; }
  .credit{ color:var(--good); }

  .doc-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
  .doc-list li{ background:var(--paper); border:1px solid var(--border); border-radius:10px; padding:12px 16px; font-size:0.88rem; }

  .custody-row{ display:flex; justify-content:space-between; padding:10px 16px; border-top:1px solid var(--border); font-size:0.88rem; }
  .custody-row:first-child{ border-top:none; }

  .withheld{ background:var(--accent-soft); border:1px solid var(--border); border-radius:10px; padding:14px 16px; font-size:0.86rem; color:var(--ink-soft); }

  footer{ margin-top:44px; padding-top:16px; border-top:1px solid var(--border); font-size:0.76rem; color:var(--ink-faint); }
  @media (max-width:480px){ .balance-card .amount{ font-size:1.9rem; } thead th, tbody td{ padding:7px 10px; font-size:0.82rem; } }
</style>

<div class="wrap">
  <div class="topbar">
    <div class="brand">${esc(v.business.header[0])}</div>
    <div class="acct">Account <b>${esc(v.account.code)}</b>${v.customer.referenceValue ? ` · ${esc(v.customer.referenceLabel)} ${esc(v.customer.referenceValue)}` : ''}</div>
  </div>

  <div class="balance-card">
    <div>
      <div class="label">Current Balance</div>
      <div class="amount num">R${fmtAmount(v.currentBalance)}</div>
      <div class="asat">As at ${displayDate(v.account.asAt)}</div>
    </div>
    <a class="cta" href="#statement">Download Statement</a>
  </div>

  <div class="cards">
    <div class="card"><div class="label">Movement this month</div><div class="value num">R${fmtAmount(v.movementThisMonth)}</div></div>
    ${v.openInvoices.withheld
      ? `<div class="card"><div class="label">Open items</div><div class="value" style="font-size:0.95rem; color:var(--ink-soft)">Verifying — see statement</div></div>`
      : `<div class="card"><div class="label">Open invoices</div><div class="value num">R${fmtAmount(v.openInvoices.subtotal)}</div></div>`}
    ${v.custody ? `<div class="card"><div class="label">Cylinder deposit held</div><div class="value num">R${fmtAmount(Math.abs(v.custody.totalCustodyExposure))}</div></div>` : ''}
  </div>

  <section id="movement">
    <div class="section-head"><h2>Account Movement</h2><span class="hint">most recent first</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Activity</th><th>Amount (R)</th></tr></thead>
        <tbody>${v.movement.map(movementRow).join('')}</tbody>
      </table>
    </div>
  </section>

  <section id="monthly">
    <div class="section-head"><h2>Monthly Activity</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Period</th><th>Invoiced</th><th>Payments / Credits</th><th>Closing Balance</th></tr></thead>
        <tbody>${v.monthlyActivity.map(monthlyRow).join('')}</tbody>
      </table>
    </div>
  </section>

  ${v.custody ? `
  <section id="assets">
    <div class="section-head"><h2>Cylinders on Your Account</h2></div>
    <div class="table-wrap">
      ${v.custody.lines.map((l) => `<div class="custody-row"><span>${esc(l.label)} cylinders held</span><span class="num">${Math.abs(l.qty)}</span></div>`).join('')}
      <div class="custody-row"><b>Total deposit held</b><b class="num">R${fmtAmount(Math.abs(v.custody.totalCustodyExposure))}</b></div>
    </div>
  </section>` : ''}

  ${v.openInvoices.withheld ? `
  <section id="open-invoices">
    <div class="section-head"><h2>Open Invoices</h2></div>
    <div class="withheld">This account's open-invoice detail is currently being verified and isn't shown here yet — your current balance above is accurate. Please refer to your statement or contact us for a breakdown.</div>
  </section>` : ''}

  <section id="documents">
    <div class="section-head"><h2>Documents</h2></div>
    <ul class="doc-list">${v.documents.map(docRow).join('')}</ul>
  </section>

  <section id="statement">
    <div class="section-head"><h2>Statement</h2></div>
    <div class="table-wrap" style="padding:18px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
      <span>Your Statement of Account, current as at ${displayDate(v.account.asAt)}.</span>
      <a class="cta" style="padding:9px 16px;" href="#">Download Customer Statement (PDF)</a>
    </div>
  </section>

  <footer>
    ${esc(v.business.header.join(' · '))}
  </footer>
</div>
`;
}

export function writeCustomerHtml(canonical) {
  const outDir = path.join(ROOT, 'analysis/debtors', canonical.account.code, 'canonical');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${canonical.account.code}_customer_account.html`);
  fs.writeFileSync(outPath, renderCustomerHtml(canonical));
  return outPath;
}
