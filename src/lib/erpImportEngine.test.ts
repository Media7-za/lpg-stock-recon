import { describe, it, expect } from 'vitest';
import { ERPImportEngine } from './erpImportEngine';

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
