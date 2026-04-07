import Papa from 'papaparse';
import type { ERPItem } from '../types';

export interface CSVParseResult {
  success: boolean;
  data?: ERPItem[];
  error?: string;
}

export function parseCSV(csvText: string): CSVParseResult {
  try {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });

    if (result.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`
      };
    }

    // Map CSV columns to ERPItem
    const erpItems: ERPItem[] = (result.data as Record<string, string>[]).map((row) => {
      // Handle different possible column names
      const sku = row['ITEM NUMBER'] || row['Item Number'] || row['SKU'] || row['sku'] || '';
      const category = row['CAT'] || row['Category'] || row['category'] || '';
      const group = row['GROUP'] || row['Group'] || row['group'] || '';
      const description = row['DESCRIPTION'] || row['Description'] || row['description'] || '';
      const uom = row['UOM'] || row['uom'] || '';
      const quantityStr = row['CALC. ON HAND'] || row['Calc. On Hand'] || row['Quantity'] || row['quantity'] || '0';
      const quantity = parseFloat(quantityStr.toString().replace(/,/g, '')) || 0;

      return {
        sku: sku.toString(),
        category: category.toString(),
        group: group.toString(),
        description: description.toString(),
        uom: uom.toString(),
        quantity
      };
    }).filter((item: ERPItem) => item.sku !== ''); // Filter out empty rows

    return {
      success: true,
      data: erpItems
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing CSV'
    };
  }
}

