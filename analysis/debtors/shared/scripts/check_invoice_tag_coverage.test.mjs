// Console rendering contract for the D21 payment-tag-integrity gate.
//
// Boundary under test: whether the gate is *legible* from the terminal. The
// arithmetic of INVNO_TAG_CHRONOLOGY is covered by debenq_open_invoices.test.mjs;
// these tests exist because a correct finding that never reaches the screen is
// indistinguishable from no finding at all. GAS004 shipped with 10 unrecorded
// chronology violations that the console never mentioned — the gate value was
// right, the output was silent. Any change that lets a violation go unprinted,
// or that prints nothing when the gate passes, is a regression.
//
// Run: node --test analysis/debtors/shared/scripts/check_invoice_tag_coverage.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { d21ConsoleLines } from './check_invoice_tag_coverage.mjs';

const violation = (o) => ({
  settlement_doc: '42549',
  settlement_entry: 'Payment',
  settlement_iso: '2025-12-09',
  tagged_invno: '48382',
  invoice_iso: '2025-12-19',
  days_early: 10,
  amount: 690,
  ...o,
});

const pti = (o) => ({
  status: 'PASS',
  false_leads_loaded: 0,
  chronology_violations: 0,
  chronology_violations_recorded: 0,
  chronology_violations_unrecorded: 0,
  unrecorded: [],
  closed_on_false_tag: [],
  false_lead_contradicted_by_remittance: [],
  ...o,
});

const result = (ptiOverrides) => ({ debtor: 'TST001', payment_tag_integrity: pti(ptiOverrides) });

describe('d21ConsoleLines', () => {
  test('a passing gate still says so, with the counts that were checked', () => {
    const lines = d21ConsoleLines(result());
    assert.equal(lines.length, 1);
    assert.match(lines[0], /d21=PASS/);
    assert.match(lines[0], /chronology violations 0 \(0 ruled on, 0 unrecorded\)/);
  });

  test('a passing gate with no false-lead registry declares the registry check inert', () => {
    const [line] = d21ConsoleLines(result());
    assert.match(line, /registry check inert/);
  });

  test('a loaded false-lead registry is not labelled inert', () => {
    const [line] = d21ConsoleLines(result({ false_leads_loaded: 3 }));
    assert.match(line, /false leads registered 3/);
    assert.doesNotMatch(line, /inert/);
  });

  test('every unrecorded violation is printed, not just a count', () => {
    const lines = d21ConsoleLines(
      result({
        status: 'REVIEW',
        chronology_violations: 2,
        chronology_violations_unrecorded: 2,
        unrecorded: [
          violation({ settlement_doc: '38772', tagged_invno: '48410', invoice_iso: '2025-12-20', days_early: 211, amount: -0.01 }),
          violation({ settlement_doc: '41598', tagged_invno: '47726', invoice_iso: '2025-11-17', days_early: 38, amount: 5520 }),
        ],
      }),
    );
    const body = lines.join('\n');
    assert.match(body, /d21=REVIEW/);
    assert.match(body, /38772.*inv 48410.*211 day\(s\) early/);
    assert.match(body, /41598.*inv 47726.*38 day\(s\) early/);
    assert.equal(lines.filter((l) => l.includes('INVNO_TAG_CHRONOLOGY')).length, 2);
  });

  test('violations carry the instruction to record the ruling in config', () => {
    const lines = d21ConsoleLines(
      result({ status: 'REVIEW', chronology_violations: 1, chronology_violations_unrecorded: 1, unrecorded: [violation()] }),
    );
    assert.match(lines.join('\n'), /config\/payment_tag_false_leads\.json/);
  });

  test('a clean gate does not print the config instruction', () => {
    assert.doesNotMatch(d21ConsoleLines(result()).join('\n'), /payment_tag_false_leads/);
  });

  test('an invoice closed on a ratified false lead is named', () => {
    const lines = d21ConsoleLines(
      result({ status: 'BREACHED', false_leads_loaded: 1, closed_on_false_tag: [{ invno: '44076' }] }),
    );
    assert.match(lines.join('\n'), /INVOICE_CLOSED_ON_FALSE_TAG inv 44076/);
  });

  test('a remittance contradicting a ratified false lead is named with the authority order', () => {
    const lines = d21ConsoleLines(
      result({ status: 'BREACHED', false_leads_loaded: 1, false_lead_contradicted_by_remittance: [{ invno: '42470' }] }),
    );
    const body = lines.join('\n');
    assert.match(body, /FALSE_LEAD_CONTRADICTED_BY_REMITTANCE inv 42470/);
    assert.match(body, /remittance outranks tag chronology/);
  });

  test('a missing integrity block reports that the check did not run, rather than passing silently', () => {
    const lines = d21ConsoleLines({ debtor: 'TST001', payment_tag_integrity: null });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /d21=NOT_EVALUATED/);
  });

  test('every line is prefixed with the debtor code so portfolio output stays greppable', () => {
    const lines = d21ConsoleLines(
      result({
        status: 'REVIEW',
        chronology_violations: 1,
        chronology_violations_unrecorded: 1,
        unrecorded: [violation()],
        closed_on_false_tag: [{ invno: '1' }],
        false_lead_contradicted_by_remittance: [{ invno: '2' }],
      }),
    );
    for (const line of lines) assert.match(line, /^\[TST001\]/);
  });
});
