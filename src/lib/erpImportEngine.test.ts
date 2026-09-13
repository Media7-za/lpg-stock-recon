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

    it('flags CRITICAL for a real-world negative-amount Credit Note (PDP-34 sign-bug regression)', () => {
        const engine = new ERPImportEngine();

        // Real numbers from TWK002 doc 00007848 (transaction_headers id 132323,
        // source_file DRTX2025.TXT — one of the exact three DK-593-named batches).
        // Every Credit Note in production carries a negative amount_excl/tax_amount
        // (it's a return), unlike the synthetic positive fixture in the first test
        // above. Before this fix, grossImpliedTax was computed from the signed
        // (negative) amount_excl and compared directly against actualTax (forced
        // positive via Math.abs()) — opposite signs meant the equality-within-
        // tolerance check could never pass, so isGrossInExclDefect was always
        // false for every real Credit Note and this exact defect silently landed
        // as a WARNING (row accepted) instead of CRITICAL (row rejected) in every
        // production import. This is what let 21 TWK002 docs (PDP-34) through with
        // an unrejected gross-in-excl header row, plus a further 30 where the bad
        // row sits alongside a later separately-imported correct one.
        const header = makeHeader({
            entry_type: 'Crd Note',
            amount_excl: -23920.00, // BUG: gross, not ex-VAT (true ex-VAT is -20,800.00)
            tax_amount: -3120.00,   // correct
        });

        const findings = engine.validateIntegrity(header);
        const vatFinding = findings.find(f => f.rule === 'VAT_CONSISTENCY');

        expect(vatFinding).toBeDefined();
        expect(vatFinding?.severity).toBe('CRITICAL');
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

describe('ERPImportEngine.parseItems — PDP-31 fingerprint stability', () => {
    // 37-column STDatabase item row builder. Only the columns parseItems()
    // actually reads are populated; the rest are left as ''.
    function makeItemRow(overrides: Record<number, string> = {}): string[] {
        const row: string[] = new Array(23).fill('');
        row[0] = 'Invoice';       // entry_type
        row[1] = '4';             // period
        row[2] = 'TWK002';        // account_no
        row[3] = '00034285';      // doc_no
        row[4] = '9.1';           // stock_no
        row[5] = '9KG CYLINDER DEPOSIT'; // description
        row[6] = 'CYL';           // category
        row[7] = 'CYL';           // product_group
        row[8] = '';              // brand
        row[9] = '';              // order_no
        row[10] = '04/07/2024';   // tx_date
        row[11] = '35';           // qty
        row[12] = '520';          // retail_price
        row[13] = '299.973';      // cost_price
        row[14] = 'D/N 9760';     // reference
        row[15] = '001';          // rep_code
        row[16] = 'HANNAH';       // user_code
        row[17] = '01';           // location
        row[21] = '1';            // tax_code
        row[22] = '78';           // line_tax
        for (const [idx, val] of Object.entries(overrides)) {
            row[Number(idx)] = val;
        }
        return row;
    }

    it('produces the SAME fingerprint whether a description/reference has plain spaces or an internal NBSP (or other Unicode whitespace) in the middle of the text', async () => {
        const engine = new ERPImportEngine();

        // Plain ASCII spaces throughout.
        const plainRow = makeItemRow({
            5: '9KG CYLINDER DEPOSIT',
            14: 'D/N 9760',
        });

        // Same visible text, but the internal space is a non-breaking space
        // (U+00A0) in description, and reference has a run of an NBSP plus a
        // regular space collapsing to one space. `.trim()` alone never touches
        // these because they are not at the edges of the field.
        const nbspRow = makeItemRow({
            5: '9KG CYLINDER DEPOSIT',
            14: 'D/N  9760',
        });

        const csvA = plainRow.map(v => `"${v}"`).join(',') + '\n';
        const csvB = nbspRow.map(v => `"${v}"`).join(',') + '\n';

        const [itemA] = await engine.parseItems(csvA, '2025.TXT');
        const [itemB] = await engine.parseItems(csvB, 'STTRANS2024.TXT');

        // The stored description text must still read identically once cleaned...
        expect(itemA.description).toBe('9KG CYLINDER DEPOSIT');
        expect(itemB.description).toBe('9KG CYLINDER DEPOSIT');
        // ...and, critically, the two must now hash to the SAME fingerprint even
        // though they came from two differently-named "re-exports" and one had
        // hidden internal Unicode whitespace the other didn't (PDP-31).
        expect(itemB.fingerprint).toBe(itemA.fingerprint);
    });

    it('produces the SAME fingerprint for the same logical row re-imported under a different source file name (source_file is never part of the hash)', async () => {
        const engine = new ERPImportEngine();
        const row = makeItemRow();
        const csv = row.map(v => `"${v}"`).join(',') + '\n';

        const [fromApril] = await engine.parseItems(csv, '2025.TXT');
        const [fromSeptember] = await engine.parseItems(csv, 'STTRANS2024.TXT');

        expect(fromSeptember.fingerprint).toBe(fromApril.fingerprint);
    });

    it('pins the current fingerprint algorithm against the real PDP-31 duplicate pair, so a future change to the field list/order/cleaning is caught explicitly instead of silently drifting', async () => {
        const engine = new ERPImportEngine();

        // Reproduces transaction_items id 232906 (TWK002, doc 00034285, stock
        // 9.1, source_file STTRANS2024.TXT) exactly as stored in Supabase.
        const row = makeItemRow();
        const csv = row.map(v => `"${v}"`).join(',') + '\n';
        const [item] = await engine.parseItems(csv, 'STTRANS2024.TXT');

        // This is the fingerprint actually stored for id 232906 in the live
        // database, and matches recomputing today's algorithm by hand over the
        // same 9 cleaned fields. If this test ever fails after a deliberate
        // change to computeFingerprint()/parseItems(), that change invalidates
        // every fingerprint already stored for historical rows — treat it as a
        // signal that a coordinated backfill is required, not just a code diff.
        expect(item.fingerprint).toBe(
            'b12e40eeb61fbf77e4958d1b769ae97fae2bf90b3240409fd0b061a06e9036b9'
        );
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
