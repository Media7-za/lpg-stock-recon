import { describe, it, expect } from 'vitest';
import { ERPImportEngine, type ProcessedTransactionHeader } from './erpImportEngine';

/**
 * Builds a valid ProcessedTransactionHeader with sensible defaults so each test
 * only needs to override the fields it cares about.
 */
function makeHeader(overrides: Partial<ProcessedTransactionHeader> = {}): ProcessedTransactionHeader {
    return {
        entry_type: 'Invoice',
        period: 8,
        account_no: 'LIN001',
        account_name: 'TEST ACCOUNT',
        doc_no: 'DN99999',
        ref_no: 'INV1',
        description: 'Test transaction',
        order_no: '',
        batch_ref: 'B1',
        tx_date: '2026-08-15', // month 8, matches period 8
        amount_excl: 1000.00,
        tax_amount: 150.00,
        tax_code: '1',
        discount: 0,
        flag: '',
        source_file: 'DRTX2024.TXT',
        fingerprint: 'test-fingerprint',
        ...overrides,
    };
}

describe('ERPImportEngine.validateIntegrity — VAT_CONSISTENCY (DK-593)', () => {
    it('flags a Credit Note row as CRITICAL when amount_excl actually holds the VAT-inclusive (gross) amount', () => {
        const engine = new ERPImportEngine();

        // Reproduces the exact DK-593 bug shape found in DRTX2024.TXT / DRTX2025.TXT /
        // DTRX2603.TXT: amount_excl was populated with the gross (VAT-inclusive) total
        // instead of the ex-VAT amount, while tax_amount stayed correct.
        // Ex-VAT should have been 1000.00, VAT 150.00, gross 1150.00 — but amount_excl
        // was mis-set to the gross figure of 1150.00.
        const header = makeHeader({
            entry_type: 'Crd Note',
            amount_excl: 1150.00, // BUG: this is gross, not ex-VAT
            tax_amount: 150.00,   // correct
        });

        const findings = engine.validateIntegrity(header);
        const vatFinding = findings.find(f => f.rule === 'VAT_CONSISTENCY');

        expect(vatFinding).toBeDefined();
        expect(vatFinding?.severity).toBe('CRITICAL');
        expect(vatFinding?.id).toBe(header.doc_no);
    });

    it('passes a correctly-formed Credit Note row clean (no VAT_CONSISTENCY finding)', () => {
        const engine = new ERPImportEngine();

        // amount_excl correctly holds the ex-VAT amount; tax_amount is the matching 15%.
        const header = makeHeader({
            entry_type: 'Crd Note',
            amount_excl: 1000.00,
            tax_amount: 150.00,
        });

        const findings = engine.validateIntegrity(header);
        const vatFinding = findings.find(f => f.rule === 'VAT_CONSISTENCY');

        expect(vatFinding).toBeUndefined();
    });

    it('does not escalate to CRITICAL for non-Credit-Note entry types even if amount_excl looks gross', () => {
        const engine = new ERPImportEngine();

        // Same numeric shape as the bug case, but on an Invoice row — DK-593 confirmed
        // invoices are correct in every batch, so scope the CRITICAL escalation to
        // Credit Notes only, per the confirmed defect.
        const header = makeHeader({
            entry_type: 'Invoice',
            amount_excl: 1150.00,
            tax_amount: 150.00,
        });

        const findings = engine.validateIntegrity(header);
        const vatFinding = findings.find(f => f.rule === 'VAT_CONSISTENCY');

        expect(vatFinding).toBeDefined();
        expect(vatFinding?.severity).toBe('WARNING');
    });
});

describe('ERPImportEngine.parseHeaders — amount_excl arithmetic', () => {
    it('computes amount_excl as totalInc - tax for a correctly-formed raw row', async () => {
        const engine = new ERPImportEngine();

        // 16-column DRTXS header row. Col 11 = total inclusive, Col 12 = tax.
        // totalInc 1150.00 - tax 150.00 = ex-VAT 1000.00.
        const row = [
            'Crd Note',       // 0 entry_type
            '8',              // 1 period (numeric -> no header row to skip)
            'LIN001',         // 2 account_no
            'TEST ACCOUNT',   // 3 account_name
            'DN99999',        // 4 doc_no
            'INV1',           // 5 ref_no
            'Test CN',        // 6 description
            '',               // 7 order_no
            'B1',             // 8 batch_ref
            '15/08/2026',     // 9 tx_date
            '',               // 10 (unused)
            '1150.00',        // 11 total inclusive
            '150.00',         // 12 tax
            '1',              // 13 tax_code
            '0',              // 14 discount
            '',               // 15 flag
        ].join(',');

        const [header] = await engine.parseHeaders(row, 'DRTX2024.TXT');

        expect(header.amount_excl).toBeCloseTo(1000.00, 2);
        expect(header.tax_amount).toBeCloseTo(150.00, 2);
        expect(header.tx_date).toBe('2026-08-15');
    });
});

describe('ERPImportEngine Date Parsing', () => {
    it('should parse standard date strings exactly in local components to prevent timezone shifts', () => {
        const engine = new ERPImportEngine();
        
        // Use a private method access via cast to any to test the parseDate function
        const parseDate = (engine as any).parseDate.bind(engine);

        // Test normal date
        expect(parseDate('07/04/2026')).toBe('2026-04-07');
        
        // Test month-end boundary date
        expect(parseDate('01/03/2026')).toBe('2026-03-01');
        
        // Test year-end boundary date
        expect(parseDate('31/12/2025')).toBe('2025-12-31');
        expect(parseDate('01/01/2026')).toBe('2026-01-01');

        // Test spacing
        expect(parseDate('  15/08/2026  ')).toBe('2026-08-15');

        // Test invalid dates
        expect(parseDate('invalid-date')).toBeNull();
        expect(parseDate('')).toBeNull();
    });
});
