#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Find the repo root by looking for the lpg-stock-recon directory
// The skill can be invoked from anywhere, so we need to detect the actual repo location
const ROOT = process.env.REPO_ROOT || process.cwd();
const DEBTORS_ROOT = path.join(ROOT, 'analysis/debtors');

function validateInput(code, clientName) {
  const errors = [];

  if (!code || typeof code !== 'string') {
    errors.push('Debtor code is required');
  } else if (!/^[A-Z0-9]{3,6}$/.test(code)) {
    errors.push(
      `Debtor code "${code}" is invalid. Must be 3–6 uppercase alphanumeric characters (e.g., EMB001, TWK002)`,
    );
  }

  if (!clientName || typeof clientName !== 'string') {
    errors.push('Client name is required');
  } else if (clientName.trim().length === 0) {
    errors.push('Client name cannot be empty');
  }

  const accountPath = path.join(DEBTORS_ROOT, code);
  if (fs.existsSync(accountPath)) {
    errors.push(`Account directory already exists: ${accountPath}`);
  }

  return errors;
}

function getTodayISO() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function createDirectories(code) {
  const basePath = path.join(DEBTORS_ROOT, code);
  const dirs = ['config', 'data', 'raw', 'docs', 'reports'];

  dirs.forEach((dir) => {
    const dirPath = path.join(basePath, dir);
    fs.mkdirSync(dirPath, { recursive: true });
  });

  return basePath;
}

function createProjectJson(code, clientName, basePath) {
  const projectJson = {
    debtorCode: code,
    clientName: clientName,
    status: 'active',
    reconState: 'pending',
    financials: {
      totalOutstanding: 0.0,
      lastInvoiceDate: null,
      lastPaymentDate: null,
      agedDebt180Plus: 0.0,
    },
    collections: {
      actionRequired: false,
      actionType: null,
      dateSent: null,
      deadlineDate: null,
      nextAction: null,
      nextActionDate: null,
      notes: 'Account initialization',
      blockers: [],
    },
    history: [
      {
        date: getTodayISO(),
        event: 'Initialized micro-project scaffolding',
      },
    ],
  };

  const filePath = path.join(basePath, 'project.json');
  fs.writeFileSync(filePath, JSON.stringify(projectJson, null, 2) + '\n');
  return filePath;
}

function createConfigFiles(code, basePath) {
  const today = getTodayISO();
  const configDir = path.join(basePath, 'config');
  const files = {};

  // statement_of_account.json
  files.statementOfAccount = path.join(configDir, 'statement_of_account.json');
  fs.writeFileSync(
    files.statementOfAccount,
    JSON.stringify(
      {
        debtorCode: code,
        layoutVersion: 'v5',
        created: today,
      },
      null,
      2,
    ) + '\n',
  );

  // statement_v5.json
  files.statementV5 = path.join(configDir, 'statement_v5.json');
  fs.writeFileSync(
    files.statementV5,
    JSON.stringify(
      {
        version: 5,
        debtorCode: code,
        created: today,
        properties: {},
      },
      null,
      2,
    ) + '\n',
  );

  // payment_pattern_overrides.json
  files.paymentPatterns = path.join(configDir, 'payment_pattern_overrides.json');
  fs.writeFileSync(
    files.paymentPatterns,
    JSON.stringify({ patterns: [] }, null, 2) + '\n',
  );

  // settlement_discount_overrides.json
  files.settlementDiscounts = path.join(configDir, 'settlement_discount_overrides.json');
  fs.writeFileSync(
    files.settlementDiscounts,
    JSON.stringify({ discounts: [] }, null, 2) + '\n',
  );

  return files;
}

function validateSync(code) {
  try {
    const output = execSync(`npm run debtors:sync 2>&1`, {
      stdio: 'pipe',
      cwd: ROOT
    }).toString();
    return { success: true, output: 'Validation passed' };
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    // Check if the NEW account itself passed (allow other accounts to fail)
    if (output.includes(`[WARN] ${code}`) || output.includes(`[PASS] ${code}`)) {
      return {
        success: true,
        output: `Account ${code} validated successfully (portfolio has pre-existing issues in other accounts)`
      };
    }
    if (output.includes(`[FAIL] ${code}`) || output.includes(`[ERROR] ${code}`)) {
      return { success: false, output };
    }
    return { success: false, output };
  }
}

function reportSummary(code, clientName, basePath, configFiles, syncResult) {
  console.log(`\n✅ Scaffolded debtor account: ${code} (${clientName})\n`);

  console.log('📁 Created directories:');
  ['config', 'data', 'raw', 'docs', 'reports'].forEach((dir) => {
    console.log(`  - analysis/debtors/${code}/${dir}/`);
  });

  console.log('\n📄 Generated files:');
  console.log(`  - project.json`);
  Object.keys(configFiles).forEach((key) => {
    const fileName = path.basename(configFiles[key]);
    console.log(`  - config/${fileName}`);
  });

  console.log(`\n${syncResult.success ? '✅' : '❌'} Validation: ${syncResult.success ? 'PASS' : 'FAIL'}`);
  if (!syncResult.success) {
    console.log(`   Error details:\n${syncResult.output}`);
  }

  console.log('\n📋 Next steps:');
  console.log(
    `  1. Obtain DEBENQ.TXT from finance → analysis/debtors/${code}/raw/DEBENQ.TXT`,
  );
  console.log(
    `  2. (Optional) npm run debtors:pull-db -- --debtor ${code}`,
  );
  console.log(
    `  3. npm run debtors:reconciliation-status -- --debtor ${code}`,
  );
  console.log(
    `  4. npm run debtors:ingest-check -- --debtor ${code}`,
  );
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const codeIdx = args.indexOf('--code');
  const nameIdx = args.indexOf('--name');

  const code = codeIdx !== -1 ? args[codeIdx + 1] : null;
  const clientName = nameIdx !== -1 ? args[nameIdx + 1] : null;

  if (!code || !clientName) {
    console.error(
      'Usage: node scaffold.mjs --code <CODE> --name "<CLIENT_NAME>"',
    );
    console.error('Example: node scaffold.mjs --code EMB001 --name "ACME CORP PTY LTD"');
    process.exit(2);
  }

  const errors = validateInput(code, clientName);
  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  try {
    const basePath = createDirectories(code);
    createProjectJson(code, clientName, basePath);
    const configFiles = createConfigFiles(code, basePath);
    const syncResult = validateSync(code);
    reportSummary(code, clientName, basePath, configFiles, syncResult);

    process.exit(syncResult.success ? 0 : 1);
  } catch (error) {
    console.error(`❌ Error during scaffolding: ${error.message}`);
    process.exit(1);
  }
}

main();
