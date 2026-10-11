/**
 * Contract tests for family_statement.mjs (consolidated parent + children customer statement).
 * Synthetic accounts only: the module is config-driven and holds no account names.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFamilyStatement, renderFamilyCustomerMarkdown, renderFamilyInternalMarkdown } from './family_statement.mjs';

const cfg = { customerName: 'ACME LTD', businessHeader: ['SELLER (PTY) LTD'], referenceLabel: 'Ref', referenceValue: 'R1' };
const row = (account, doc, type, date, amount, lane = 'LPG', ref = `DN#${doc}`) => ({
  row_id: `${account}|${doc}|${type}|${lane}`,
  clean_doc: doc,
  entry_type: type,
  kind: type === 'Invoice' ? 'invoice' : type === 'Crd Note' ? 'credit_note' : 'payment',
  date,
  ref_no: ref,
  lane,
  amount,
  txt_line: 1,
});

/** Build one member from rows; `ties` may reference rows by doc. All options are overridable. */
function member(code, role, rows, o = {}) {
  const closing = Math.round(rows.reduce((s, r) => s + r.amount, o.bf || 0) * 100) / 100;
  const sha = o.sha || `sha-${code}`;
  const ties = (o.ties || []).map((t, i) => ({
    tie_id: `T${i + 1}`,
    rule: t.rule || 'CN_DN_PAIR',
    confidence: t.confidence || 'CONFIRMED',
    members: t.docs.map((d) => rows.find((r) => r.clean_doc === d).row_id),
    docs: t.docs.map((d) => `${rows.find((r) => r.clean_doc === d).entry_type} ${d}`),
    net: 0,
  }));
  return {
    code,
    role,
    txtPath: `raw/${code}.TXT`,
    erpHeader: o.erpHeader ?? closing,
    txtSha256Actual: o.txtSha ?? sha,
    projection: {
      rows,
      openings: { combinedBf: o.bf || 0, lpgOpeningBf: o.bf || 0, cylOpeningFinancial: 0 },
      closings: { combined: closing },
      source: { erpCurrentBalance: o.projErp ?? closing, txtSha256: sha },
      window: { periodStart: '2026-01-01', lastRowDate: o.last || '2026-09-30' },
    },
    matches: {
      projection: { txtSha256: sha },
      ties,
      summary: { confirmed: ties.filter((t) => t.confidence === 'CONFIRMED').length, probable: ties.filter((t) => t.confidence === 'PROBABLE').length },
      lockConflicts: o.lockConflicts || [],
      reviewOnly: Boolean(o.reviewOnly),
      reviewOnlyReasons: o.reviewOnly ? ['ingestCoverage partial'] : [],
    },
    namedResiduals: [],
    rowNotes: [],
  };
}

const parent = () => member('P001', 'parent', [
  row('P001', '1001', 'Invoice', '2026-08-01', 1000),
  row('P001', '1002', 'Invoice', '2026-08-02', 500),
  row('P001', '9001', 'Payment', '2026-08-03', -500),
], { ties: [] });
// Child with a customer credit: invoice 20 x R100 vs credit note 20 x R115 => R-300 (ERP balance negative).
const creditChild = (o = {}) => member('C001', 'child', [
  row('C001', '2001', 'Invoice', '2026-07-01', 2000, 'OTHER'),
  row('C001', '2002', 'Crd Note', '2026-07-02', -2300, 'OTHER'),
], o);
const openChild = (o = {}) => member('C002', 'child', [
  row('C002', '3001', 'Invoice', '2026-09-01', 32500),
  row('C002', '3002', 'Invoice', '2026-09-01', 30000),
  row('C002', '3003', 'Crd Note', '2026-09-02', -32500),
], { ties: [{ docs: ['3001', '3003'], confidence: 'PROBABLE' }], ...o });

test('family aggregation: one list with an Account column, amount due = sum of the ERP balances', () => {
  const fam = buildFamilyStatement([parent(), creditChild(), openChild()]);
  assert.deepEqual(fam.problems, []);
  assert.equal(fam.erpTotal, 30700); // 1,000 + (-300) + 30,000 (the payment 9001 is an untied open row on the parent)
  assert.equal(fam.statementTotal, fam.erpTotal);
  assert.deepEqual([...new Set(fam.items.map((l) => l.account))], ['P001', 'C001', 'C002']);
  const md = renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel: '30 September 2026' });
  assert.match(md, /\| Account \| Date \| Type \| Doc # \| Reference \| Item \| Amount \(R\) \|/);
  assert.match(md, /\*\*R30,700\.00\*\*/);
  assert.match(md, /\| P001 \| 01 Aug 2026 \| Invoice \| 1001 \|/);
  assert.match(md, /\| C002 \| 01 Sept 2026 \| Invoice \| 3002 \|/);
  assert.match(md, /\*\*Accounts:\*\* P001, C001, C002/);
  assert.equal(fam.asAtIso, '2026-09-30');
});

test('settled items are not listed: a confirmed tie drops both documents', () => {
  const c = member('C003', 'child', [
    row('C003', '4001', 'Invoice', '2026-06-01', 800),
    row('C003', '4002', 'Crd Note', '2026-06-02', -800),
    row('C003', '4003', 'Invoice', '2026-06-03', 100),
  ], { ties: [{ docs: ['4001', '4002'] }] });
  const fam = buildFamilyStatement([parent(), c]);
  assert.deepEqual(fam.items.filter((l) => l.account === 'C003').map((l) => l.doc), ['4003']);
  assert.equal(fam.members[1].balance, 100);
});

test('per-account tie gate: any member that does not tie to its ERP header aborts (problems non-empty)', () => {
  const bad = openChild({ erpHeader: 61000.01 }); // ERP header differs from items by 1 cent
  const fam = buildFamilyStatement([parent(), creditChild(), bad]);
  assert.ok(fam.problems.some((p) => p.startsWith('C002:') && /≠ ERP header/.test(p)), fam.problems.join('\n'));
  assert.ok(fam.problems.some((p) => /sum of ERP headers/.test(p)));
});

test('gate: a stale projection (TXT fingerprint differs) and a lock conflict each abort', () => {
  const stale = buildFamilyStatement([parent(), creditChild({ txtSha: 'changed-file' })]);
  assert.ok(stale.problems.some((p) => p.startsWith('C001:') && /stale: TXT fingerprint/.test(p)));
  const locked = buildFamilyStatement([parent(), creditChild({ lockConflicts: [{ lock_id: 'L1', close_id: 'C1', problems: ['x'] }] })]);
  assert.ok(locked.problems.some((p) => p.startsWith('C001:') && /lock conflict/.test(p)));
  const erpMoved = buildFamilyStatement([parent(), creditChild({ projErp: -250 })]);
  assert.ok(erpMoved.problems.some((p) => /projection was built for ERP/.test(p)));
});

test('reviewOnly child => DRAFT marker on the customer copy; reasons stay internal', () => {
  const fam = buildFamilyStatement([parent(), creditChild(), openChild({ reviewOnly: true })]);
  assert.deepEqual(fam.problems, []);
  assert.equal(fam.draft, true);
  assert.match(fam.draftReasons[0], /^C002 is review-only/);
  const md = renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel: 'x' });
  assert.match(md, /^# Statement of Account — DRAFT PREVIEW/);
  assert.match(md, /NOT FOR RELEASE/);
  assert.doesNotMatch(md, /ingestCoverage/);
  const internal = renderFamilyInternalMarkdown(fam, { cfg, parentCode: 'P001', generatedOn: '2026-10-10' });
  assert.match(internal, /\*\*DRAFT: not releasable\*\*/);
  assert.match(internal, /C002 is review-only: ingestCoverage partial/);
});

test('no review-only member => no draft marker', () => {
  const fam = buildFamilyStatement([parent(), creditChild(), openChild()]);
  assert.equal(fam.draft, false);
  const md = renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel: 'x' });
  assert.match(md, /^# Statement of Account\n/);
  assert.doesNotMatch(md, /DRAFT|NOT FOR RELEASE/);
});

test('negative balance child (customer credit R-300.00) is shown as a credit and nets into the amount due', () => {
  const fam = buildFamilyStatement([parent(), creditChild(), openChild()]);
  const c = fam.members.find((m) => m.code === 'C001');
  assert.equal(c.erpHeader, -300);
  assert.equal(c.balance, -300);
  assert.deepEqual(c.items.map((l) => l.amount), [2000, -2300]);
  const md = renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel: 'x' });
  assert.match(md, /\| C001 \| -300\.00 \| 0\.00 \| -300\.00 \|/);
  assert.match(md, /\| C001 \| 02 Jul 2026 \| Crd Note \| 2002 \|.*\| -2,300\.00 \|/);
  assert.match(md, /A negative amount is a credit in your favour/);
  assert.equal(fam.statementTotal, 30700); // 1,000 + (-300) + 30,000
  const internal = renderFamilyInternalMarkdown(fam, { cfg, parentCode: 'P001', generatedOn: '2026-10-10' });
  assert.match(internal, /\| C001 \| child \| -300\.00 \| -300\.00 \|/);
});

test('probable credit-note pair stays listed with a credit footnote (not the payment wording)', () => {
  const fam = buildFamilyStatement([parent(), openChild()]);
  const md = renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel: 'x' });
  assert.match(md, /\| 3001 ² \|/);
  assert.match(md, /A credit note was issued against this invoice/);
  assert.doesNotMatch(md, /Payment received; allocation/);
});
