import Papa from 'papaparse';
import type { MovementItem } from '../types';

export interface TxtParseResult {
    success: boolean;
    data?: MovementItem[];
    error?: string;
}

export function parseMovementTxt(txtContent: string): TxtParseResult {
    try {
        const result = Papa.parse(txtContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => value.trim()
        });

        if (result.errors.length > 0) {
            return {
                success: false,
                error: `TXT parsing errors: ${result.errors.map(e => e.message).join(', ')}`
            };
        }

        const movements: MovementItem[] = (result.data as Record<string, string>[]).map((row) => {
            // Map columns (ENTRY, DATE, STOCKNO, DESCRIPTION, QTY, REF)
            const transactionType = row['ENTRY'] || '';
            const date = row['DATE'] || '';
            const sku = row['STOCKNO'] || '';
            const description = row['DESCRIPTION'] || '';
            const quantityStr = row['QTY'] || '0';
            const reference = row['REF'] || '';

            const quantity = parseFloat(quantityStr.toString().replace(/,/g, '')) || 0;

            // Only care about specific transaction types if needed, but for now we take them all
            // We'll filter/categorize them tightly to match Invoice, GRV, Credit Note
            let mappedType: "Invoice" | "GRV" | "Credit Note" = "Invoice";
            if (transactionType.toLowerCase().includes('grv')) mappedType = "GRV";
            if (transactionType.toLowerCase().includes('credit')) mappedType = "Credit Note";

            return {
                date,
                sku: sku.toString().replace(/^0+/, ''), // Strip leading zeros from stock numbers typically exported by ERPs like Pastel
                description: description.toString(),
                quantity,
                transactionType: mappedType,
                reference: reference.toString()
            };
        }).filter((item: MovementItem) => item.sku !== '');

        return {
            success: true,
            data: movements
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error parsing TXT'
        };
    }
}
