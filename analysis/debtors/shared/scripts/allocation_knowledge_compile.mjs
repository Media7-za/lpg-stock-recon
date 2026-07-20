#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalize } from './stages/normalize.mjs';
import { buildRelationships } from './stages/buildRelationships.mjs';
import { buildCases } from './stages/buildCases.mjs';
import { computeDashboard } from './stages/computeDashboard.mjs';
import { buildSearchIndex } from './stages/buildSearchIndex.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const debtorsRoot = path.join(repoRoot, 'analysis/debtors');

function parseArgs(argv) {
  const args = { debtor: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--debtor' && argv[i + 1]) {
      args.debtor = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function serializeEntities(entities) {
  return {
    invoices: Object.fromEntries(
      Object.entries(entities.invoices).map(([doc, inv]) => [
        doc,
        {
          doc: inv.doc,
          docKey: inv.docKey,
          entryType: inv.entryType,
          txDate: inv.txDate,
          lanes: inv.lanes,
          amountIncl: inv.amountIncl,
          amountExcl: inv.amountExcl,
          lineCount: inv.lineCount,
          isLpg: inv.isLpg,
          isCyl: inv.isCyl,
        },
      ])
    ),
    payments: entities.payments,
    creditNotes: Object.fromEntries(
      Object.entries(entities.creditNotes).map(([doc, cn]) => [
        doc,
        {
          doc: cn.doc,
          docKey: cn.docKey,
          entryType: cn.entryType,
          txDate: cn.txDate,
          lanes: cn.lanes,
          amountIncl: cn.amountIncl,
          amountExcl: cn.amountExcl,
          lineCount: cn.lineCount,
        },
      ])
    ),
  };
}

export function compileKnowledgeBundle(debtorCode) {
  const debtorDir = path.join(debtorsRoot, debtorCode);
  const edgesPath = path.join(debtorDir, 'data/allocation_edges.csv');
  if (!fs.existsSync(edgesPath)) {
    throw new Error(`Missing allocation_edges.csv for debtor ${debtorCode}`);
  }

  const normalized = normalize(debtorDir);
  const relationships = buildRelationships(normalized);
  const cases = buildCases(normalized, relationships);
  const dashboard = computeDashboard(normalized, relationships, cases);
  const searchIndex = buildSearchIndex(normalized, relationships, cases, debtorCode);

  return {
    schemaVersion: '1.0',
    domain: 'allocation',
    debtorCode,
    debtorName: normalized.meta.debtorName,
    generatedAt: new Date().toISOString(),
    compiledBy: 'allocation_knowledge_compile.mjs',
    relationships,
    cases,
    entities: serializeEntities(normalized.entities),
    views: {
      summary: dashboard.summary,
      outstanding: dashboard.outstanding,
      exceptions: dashboard.exceptions,
      timelineBuckets: dashboard.timelineBuckets,
      recentRelationships: dashboard.recentRelationships,
      recentCases: dashboard.recentCases,
      needsReviewCases: dashboard.needsReviewCases,
      largestOutstanding: dashboard.largestOutstanding,
      searchIndex,
    },
    decisionLog: [],
  };
}

function main() {
  const { debtor } = parseArgs(process.argv);
  if (!debtor) {
    console.error('Usage: allocation_knowledge_compile.mjs --debtor WO0001');
    process.exit(1);
  }

  try {
    const bundle = compileKnowledgeBundle(debtor);
    const outDir = path.join(debtorsRoot, debtor, 'data');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'knowledge-bundle.json');
    fs.writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`);

    console.log(`Wrote ${outPath}`);
    console.log(
      `  relationships: ${bundle.relationships.length}, cases: ${bundle.cases.length}, outstanding: ${bundle.views.summary.outstandingCount}`
    );
  } catch (err) {
    console.error(`Cannot compile knowledge bundle for ${debtor}: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
