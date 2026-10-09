import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { applyEvidenceConfig } from './match_account.mjs';

test('applyEvidenceConfig: alias re-points an advice line; payer group reads sister TXT docs and payment postings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'family-'));
  const txt = (code, rows) => {
    const p = path.join(dir, `${code}.TXT`);
    fs.writeFileSync(p, ['"ACCOUNT:","X"', '"CURRENT BALANCE:","0.00"', ...rows].join('\n'));
    return p;
  };
  const child = txt('K', [
    '"1","","","","","","BALANCE B/F:","","","0.00","0.00"',
    '"2","01","00046857","Invoice","10/01/2026","","DN#1","","K","100.00","100.00"',
    '"3","01","00043500","Payment","25/02/2026","","TRANSF | STAT 123","","K","-38501.31","-38401.31"',
  ]);
  const evidence = { batches: [{ batchId: 'B1', paymentDoc: '43500', lines: [{ docType: 'Crd Note', doc: '10', gross: -6900 }, { docType: 'Invoice', doc: '46857', gross: 100 }] }], skipped: [] };
  const cfg = {
    remittanceDocAliases: { B1: { 'Crd Note|10': '13716' } },
    payerGroup: { parent: 'P', children: [{ code: 'K', txtPath: child }] },
  };
  const out = applyEvidenceConfig(evidence, cfg, dir);
  assert.equal(out.batches[0].lines[0].doc, '13716');
  assert.equal(out.batches[0].lines[0].aliasOf, '10');
  assert.equal(out.family.siteDocs['Invoice|46857'], 'K');
  assert.equal(out.family.postings['43500'].K, 38501.31);
  const plain = applyEvidenceConfig({ batches: [], skipped: [] }, {}, dir);
  assert.equal(plain.family, undefined); // accounts without config are untouched
});
