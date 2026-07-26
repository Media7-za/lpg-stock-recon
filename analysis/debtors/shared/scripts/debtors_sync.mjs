import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const baseDir = 'analysis/debtors';
const skipDirs = new Set(['shared', 'Global Reports']);

const validStatuses = ["active", "collection", "on-hold", "resolved"];
const validReconStates = ["pending", "in-progress", "complete"];

const VALID_INGEST_GATE_STATUS = ['pass', 'fail', 'unverified'];
const VALID_INGEST_FRESHNESS = ['current', 'stale', 'unverified'];
const VALID_INGEST_COVERAGE = ['complete', 'partial', 'unverified'];
const VALID_INGEST_BLOCKED_SCOPES = ['custody', 'sku_analysis', 'allocation', 'financial_bridge_from_txt'];

let hasHardFailures = false;
const blockedAccounts = [];

/**
 * D17 collections-eligibility gate — DEBTORS_DOCTRINE.md §4 (D17), Collectable Rule §2.
 *
 * Separated from projection validity: a blocked account must remain visible in the
 * dashboard, but may never be presented or acted on as collectable.
 *
 * Fails CLOSED. Absence of evidence is never clearance:
 *   - `financials.collectable` absent          → blocked (nothing stated)
 *   - `collections.blockers` absent            → blocked (not assessed)
 *   - `collections.blockers` === []            → assessed and clear
 * Age (`financials.agedDebt180Plus`) is a priority signal only and is never read here.
 *
 * @returns {{ blocked: boolean, reasons: string[] }}
 */
export function evaluateD17Gate(data) {
  const reasons = [];
  if (data?.status !== 'collection') return { blocked: false, reasons };

  // (a) constitutional closure — not a workbench session marked COMPLETE (D16)
  if (data.reconState !== 'complete') reasons.push('D17(a): reconState is not complete — cannot demand payment on an unverified ledger');
  if (!data.collections?.actionRequired) reasons.push('D17(a): collection status requires actionRequired = true');
  if (!data.collections?.actionType) reasons.push('D17(a): collection status requires actionType');

  // (b) stated collectable balance under §2: ERP balance − Σ ratified holds
  const c = data.financials?.collectable;
  if (c === undefined) {
    reasons.push('D17(b): financials.collectable missing — collectable balance must be stated under Constitution §2 (ERP balance − Σ ratified holds); cannot be inferred from totalOutstanding or age');
  } else {
    if (typeof c.amount !== 'number') reasons.push('D17(b): financials.collectable.amount missing or not a number');
    if (typeof c.erpBalance !== 'number') reasons.push('D17(b): financials.collectable.erpBalance missing or not a number — §2 requires the anchored ERP figure; totalOutstanding is a multi-code exposure aggregate, not the anchor');
    if (typeof c.ratifiedHoldsTotal !== 'number') reasons.push('D17(b): financials.collectable.ratifiedHoldsTotal missing or not a number — holds must be quantified, not implied');
    if (!c.asAt) reasons.push('D17(b): financials.collectable.asAt missing — the anchor requires an explicit as-at date');
    if (!c.source) reasons.push('D17(b): financials.collectable.source missing — the anchor requires a source file/artifact reference');
    if (!c.basis) reasons.push('D17(b): financials.collectable.basis missing — expected PROVEN | ASSERTED | STALE');
    else if (c.basis !== 'PROVEN') reasons.push(`D17(b): financials.collectable.basis is ${c.basis} — only PROVEN closes under §2`);
    if (c.operatorConfirmation !== 'confirmed') {
      reasons.push(`D17(b): financials.collectable.operatorConfirmation is "${c.operatorConfirmation ?? 'absent'}" — source is stale/unconfirmed until "confirmed"`);
    }
    if (typeof c.amount === 'number' && typeof c.erpBalance === 'number' && typeof c.ratifiedHoldsTotal === 'number') {
      const expected = c.erpBalance - c.ratifiedHoldsTotal;
      if (Math.abs(expected - c.amount) > 0.05) {
        reasons.push(`D17(b): collectable ${c.amount} ≠ erpBalance ${c.erpBalance} − ratifiedHolds ${c.ratifiedHoldsTotal} (= ${expected.toFixed(2)}); bridge must be itemized, dated, and registered`);
      }
    }
  }

  // (c) no OPEN blocker. Resolved blockers are retained as history and do not gate.
  const blockers = data.collections?.blockers;
  if (!Array.isArray(blockers)) {
    reasons.push('D17(c): collections.blockers missing or not an array — an empty array affirms "assessed and clear"; an absent field means not assessed');
  } else {
    const open = blockers.filter(b => (typeof b === 'string' ? true : b?.status !== 'resolved'));
    if (open.length > 0) {
      const named = open.map(b => (typeof b === 'string' ? b : `${b?.type ?? 'OTHER'}${b?.description ? ` (${b.description})` : ''}`)).join(', ');
      reasons.push(`D17(c): ${open.length} open blocker(s) — route to human review, not collections: ${named}`);
    }
  }

  return { blocked: reasons.length > 0, reasons };
}

/**
 * D19 ingest-gate structural check — DEBTORS_DOCTRINE.md D19.
 *
 * `ingestGate` is canonical but OPTIONAL: absent → WARN only (D19 migration
 * model — no existing debtor has this populated today, none should be
 * retroactively broken for lacking it). Present-but-malformed → hard error,
 * same severity class as any other schema-gap error in `validateProject`.
 *
 * This function does not trust the object's own self-reported `status` value
 * as proof of validity — same discipline as evaluateD17Gate not trusting
 * financials.collectable blindly. It independently checks required fields
 * and enum membership.
 *
 * Independence (D19): never reads/sets reconState, collections.blockers, or
 * workspaceStatus. A malformed or absent ingestGate must never be copied
 * into collections.blockers automatically.
 *
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function evaluateIngestGate(data) {
  const errors = [];
  const warnings = [];
  const gate = data?.ingestGate;

  if (gate === undefined) {
    warnings.push(
      'ingestGate absent (D19 migration model — WARN only). Any conclusion claiming custody/SKU/allocation ' +
      'closure must still treat this as ingestBlockedScopes: ["custody","sku_analysis","allocation"] — absence is never clearance.'
    );
    return { errors, warnings };
  }

  if (typeof gate !== 'object' || gate === null || Array.isArray(gate)) {
    errors.push('D19: ingestGate present but not an object — malformed');
    return { errors, warnings };
  }

  if (!VALID_INGEST_GATE_STATUS.includes(gate.status)) {
    errors.push(`D19: ingestGate.status invalid or missing: ${gate.status}`);
  }
  if (!VALID_INGEST_FRESHNESS.includes(gate.ingestFreshness)) {
    errors.push(`D19: ingestGate.ingestFreshness invalid or missing: ${gate.ingestFreshness}`);
  }
  if (!VALID_INGEST_COVERAGE.includes(gate.ingestCoverage)) {
    errors.push(`D19: ingestGate.ingestCoverage invalid or missing: ${gate.ingestCoverage}`);
  }
  if (typeof gate.displayStatus !== 'string' || !gate.displayStatus) {
    errors.push('D19: ingestGate.displayStatus missing or not a string');
  }
  if (!gate.asAt) errors.push('D19: ingestGate.asAt missing');
  if (!gate.reportPath) errors.push('D19: ingestGate.reportPath missing');

  if (!Array.isArray(gate.ingestBlockedScopes)) {
    errors.push('D19: ingestGate.ingestBlockedScopes missing or not an array');
  } else {
    for (const scope of gate.ingestBlockedScopes) {
      if (!VALID_INGEST_BLOCKED_SCOPES.includes(scope)) {
        errors.push(`D19: ingestGate.ingestBlockedScopes contains unrecognised scope "${scope}"`);
      }
    }
  }

  return { errors, warnings };
}

export function validateProject(code, data) {
  let errors = [];
  let warnings = [];

  // Root level requirements
  if (!data.debtorCode || data.debtorCode !== code) errors.push('debtorCode missing or mismatch');
  if (!data.clientName) errors.push('clientName missing');
  else if (data.clientName.includes('Placeholder')) warnings.push('clientName is placeholder');

  if (!validStatuses.includes(data.status)) errors.push(`invalid status: ${data.status}`);
  if (!validReconStates.includes(data.reconState)) errors.push(`invalid reconState: ${data.reconState}`);

  // Financials
  if (!data.financials) {
    errors.push('financials object missing');
  } else {
    if (typeof data.financials.totalOutstanding !== 'number') errors.push('totalOutstanding missing or not a number');
    if (typeof data.financials.agedDebt180Plus !== 'number') errors.push('agedDebt180Plus missing or not a number');
    
    if (data.financials.lastInvoiceDate === undefined) warnings.push('lastInvoiceDate omitted');
    if (data.financials.lastPaymentDate === undefined) warnings.push('lastPaymentDate omitted');
  }

  // Collections
  if (!data.collections) {
    errors.push('collections object missing');
  } else {
    if (typeof data.collections.actionRequired !== 'boolean') errors.push('actionRequired missing or not boolean');
    if (data.collections.actionType === undefined) warnings.push('actionType omitted');
    if (data.collections.dateSent === undefined) warnings.push('dateSent omitted');
    if (data.collections.deadlineDate === undefined) warnings.push('deadlineDate omitted');
    if (data.collections.nextAction === undefined) warnings.push('nextAction omitted');
    if (data.collections.nextActionDate === undefined) warnings.push('nextActionDate omitted');
    if (data.collections.notes === undefined) warnings.push('notes omitted');
  }

  // History
  if (!Array.isArray(data.history) || data.history.length === 0) {
    warnings.push('history array empty or missing');
  }

  // Ingest gate (D19): absent is a warning; present-but-malformed is a hard error.
  const ingestGateResult = evaluateIngestGate(data);
  errors = errors.concat(ingestGateResult.errors);
  warnings = warnings.concat(ingestGateResult.warnings);

  // Collections eligibility (D17) is evaluated separately from projection validity:
  // a blocked account stays visible in the dashboard but may never be acted on as collectable.
  const { reasons: eligibilityErrors } = evaluateD17Gate(data);
  
  if (data.status === 'resolved') {
    if (data.financials?.totalOutstanding !== 0.0) {
      warnings.push('STATE MACHINE: status is resolved but outstanding balance is not 0.0 (check if write-off is documented)');
    }
  }

  return { errors, warnings, eligibilityErrors };
}

function sync() {
  const folders = fs.readdirSync(baseDir).filter(f => {
    try {
      return fs.statSync(path.join(baseDir, f)).isDirectory() && !skipDirs.has(f);
    } catch {
      return false;
    }
  });

  console.log(`Starting debtors sync validation across ${folders.length} accounts...\n`);

  for (const code of folders) {
    const filePath = path.join(baseDir, code, 'project.json');
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${code} — no project.json (not a debtor micro-project)`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.log(`[FAIL] ${code} — invalid JSON syntax`);
      hasHardFailures = true;
      continue;
    }

    const { errors, warnings, eligibilityErrors } = validateProject(code, data);

    if (errors.length > 0) {
      console.log(`[FAIL] ${code}`);
      errors.forEach(e => console.log(`  - ERROR: ${e}`));
      hasHardFailures = true;
    } else if (warnings.length > 0) {
      console.log(`[WARN] ${code}`);
      warnings.forEach(w => console.log(`  - WARN: ${w}`));
    } else {
      console.log(`[PASS] ${code}`);
    }

    if (eligibilityErrors.length > 0) {
      console.log(`[COLLECTIONS_BLOCKED] ${code} — visible in dashboard, NOT collections-ready`);
      eligibilityErrors.forEach(e => console.log(`  - BLOCKED: ${e}`));
      blockedAccounts.push(code);
    }
  }

  console.log();

  // Projection validity and collections eligibility are separate concerns:
  //   projection validity     → can we generate and display the account?
  //   collections eligibility → may a human act on it as collectable?
  // A missing D17 contract blocks the second only. Suppressing the dashboard for a
  // D17 failure would remove portfolio visibility of exactly the unsafe accounts.
  if (hasHardFailures) {
    console.error('❌ Sync failed due to schema or state machine violations. Dashboard not generated. Fix errors and retry.');
    process.exit(1);
  }

  console.log('✅ Projection validation passed. Triggering dashboard generation...');
  const result = spawnSync('node', ['analysis/debtors/shared/scripts/debtors_dashboard.mjs'], { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error('❌ Dashboard generation failed.');
    process.exit(result.status || 1);
  }

  if (blockedAccounts.length > 0) {
    console.error(`\n⛔ D17: ${blockedAccounts.length} account(s) COLLECTIONS_BLOCKED — ${blockedAccounts.join(', ')}`);
    console.error('   Dashboard regenerated and these accounts remain visible, but they are NOT collections-ready.');
    console.error('   No collections action may be taken on them. Resolve via evidence, not by editing state.');
    process.exit(2);
  }
}

// Run only when executed directly, so validateProject can be imported by tests.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  sync();
}
