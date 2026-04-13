import { describe, it, expect } from 'vitest';
import { parseCSV } from './csvParser';

describe('CSV Parser Logic', () => {

    it('should successfully parse standard ERP STKCOUNT.csv structure', () => {
        const standardCsv = `ITEM NUMBER,CAT,GROUP,DESCRIPTION,UOM,TOTAL,CALC. ON HAND,QTY AVAIL
9.4,LPG,ORYX,9Kg Full Oryx,ea,100,105,105
19.4,LPG,ORYX,19Kg Full Oryx,ea,50,50,50
`;
        const result = parseCSV(standardCsv);
        
        expect(result.success).toBe(true);
        expect(result.data?.length).toBe(2);
        
        expect(result.data?.[0].sku).toBe('9.4');
        expect(result.data?.[0].description).toBe('9Kg Full Oryx');
        expect(result.data?.[0].quantity).toBe(105);

        expect(result.data?.[1].sku).toBe('19.4');
        expect(result.data?.[1].quantity).toBe(50);
    });

    it('should correctly parse thousands comma-separated quantities', () => {
        const commaCsv = `ITEM NUMBER,CALC. ON HAND
9.1,"1,250.5"
19.1,"3,000"
`;
        const result = parseCSV(commaCsv);
        
        expect(result.success).toBe(true);
        expect(result.data?.[0].sku).toBe('9.1');
        expect(result.data?.[0].quantity).toBe(1250.5); // float with stripped comma
        
        expect(result.data?.[1].sku).toBe('19.1');
        expect(result.data?.[1].quantity).toBe(3000);
    });

    it('should gracefully handle and filter out completely empty lines/SKUs', () => {
        const messyCsv = `ITEM NUMBER,CALC. ON HAND
9.4,10

19.4,5
,0
`;
        const result = parseCSV(messyCsv);
        
        expect(result.success).toBe(true);
        // Only 2 valid items with an SKU. The empty lines and the empty SKU row should be filtered out
        expect(result.data?.length).toBe(2);
    });

    it('should fallback to alternate header columns gracefully if exact export header changes', () => {
        // ERP systems often change headers. Using alternate lowercase headers should still work
        const alternateCsv = `sku,Category,Group,Description,uom,quantity
9.4,lpg,oryx,9kg f,ea,10
`;
        const result = parseCSV(alternateCsv);
        
        expect(result.success).toBe(true);
        expect(result.data?.[0].sku).toBe('9.4');
        expect(result.data?.[0].quantity).toBe(10);
        expect(result.data?.[0].category).toBe('lpg');
    });

    it('should fail cleanly if PapaParse encounters a critical malformed structure', () => {
        // A single unclosed quote across the whole file can cause a Papaparse error
        // Or using an entirely corrupt stream. Since PapaParse is very resilient, 
        // we might not get an error unless we pass something explicitly unsupported 
        // or a completely malformed layout
        const badCsv = `"Unclosed quote in header, col2
data1,data2`;
        const result = parseCSV(badCsv);
        expect(result.success).toBe(false);
        expect(result.error).toContain('CSV parsing errors');
    });
});
