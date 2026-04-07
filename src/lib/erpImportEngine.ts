import Papa from 'papaparse';
import { parse } from 'date-fns';

export interface RawDetransRow {
    ENTRY: string;
    PERIOD: string;
    ACCNO: string;
    NAME: string;
    DOCNO: string;
    INVNO: string;
    DEBORDER: string;
    ORDERNO: string;
    DEPREF: string;
    DATE: string;
    REF: string;
    AMOUNT: string;
    TAX: string;
    EXCODE: string;
    FAMOUNT: string;
    PAID: string;
}

export interface RawSttransRow {
    ENTRY: string;
    PERIOD: string;
    ACCNO: string;
    DOCNO: string;
    STOCKNO: string;
    DESC: string;
    CAT: string;
    GROUP: string;
    BRAND: string;
    ORDERNO: string;
    DATE: string;
    QTY: string;
    RETAIL: string;
    COST: string;
    REP: string;
    REP_NAME: string;
    NAME: string;
    // ... other fields as needed
}

export interface ProcessedAccount {
    accountNo: string;
    currentName: string;
}

export interface ProcessedProduct {
    stockNo: string;
    description: string;
    category: string;
    group: string;
    brand: string;
}

export interface ProcessedSalesRep {
    repCode: string;
    name: string;
}

export interface ProcessedTransactionHeader {
    entryType: string;
    period: number;
    accountNo: string;
    accountName: string;
    docNo: string;
    invNo: string;
    date: Date;
    ref: string;
    amount: number;
    taxAmount: number;
    fAmount: number;
    isPaid: boolean;
}

export interface ProcessedLineItem {
    docNo: string;
    accountNo: string;
    stockNo: string;
    description: string;
    quantity: number;
    retailPrice: number;
    costPrice: number;
    category: string;
    repCode: string;
}

export interface ProcessedAllocation {
    sourceDocNo: string;
    targetDocNo: string;
    amount: number;
    eventType: string;
}

export class ERPImportEngine {
    private accounts = new Map<string, ProcessedAccount>();
    private products = new Map<string, ProcessedProduct>();
    private salesReps = new Map<string, ProcessedSalesRep>();

    private transactions: ProcessedTransactionHeader[] = [];
    private allocations: ProcessedAllocation[] = [];
    private lineItems: ProcessedLineItem[] = [];

    constructor() { }

    /**
   * Parse STTRANS.TXT content
   */
    async parseSttrans(csvContent: string) {
        return new Promise((resolve, reject) => {
            Papa.parse<RawSttransRow>(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.processSttransRows(results.data);
                    resolve(true);
                },
                error: (err: Error) => reject(err),
            });
        });
    }

    private processSttransRows(rows: RawSttransRow[]) {
        for (const row of rows) {
            // 1. Normalize Product
            if (row.STOCKNO && !this.products.has(row.STOCKNO)) {
                this.products.set(row.STOCKNO, {
                    stockNo: row.STOCKNO,
                    description: row.DESC,
                    category: row.CAT,
                    group: row.GROUP,
                    brand: row.BRAND,
                });
            }

            // 2. Normalize SalesRep
            if (row.REP && !this.salesReps.has(row.REP)) {
                this.salesReps.set(row.REP, {
                    repCode: row.REP,
                    name: row.REP_NAME,
                });
            }

            // 3. Prepare Line Item
            const lineItem = {
                docNo: row.DOCNO,
                accountNo: row.ACCNO,
                stockNo: row.STOCKNO,
                description: row.DESC, // Snapshot (1B)
                quantity: parseFloat(row.QTY) || 0,
                retailPrice: parseFloat(row.RETAIL) || 0,
                costPrice: parseFloat(row.COST) || 0,
                category: row.CAT,
                repCode: row.REP,
            };

            this.lineItems.push(lineItem);
        }
    }

    /**
     * Parse DETRANS.TXT content
     */
    async parseDetrans(csvContent: string) {
        return new Promise((resolve, reject) => {
            Papa.parse<RawDetransRow>(csvContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    this.processDetransRows(results.data);
                    resolve(true);
                },
                error: (err: Error) => reject(err),
            });
        });
    }

    private processDetransRows(rows: RawDetransRow[]) {
        for (const row of rows) {
            // 1. Normalize Account
            if (!this.accounts.has(row.ACCNO)) {
                this.accounts.set(row.ACCNO, {
                    accountNo: row.ACCNO,
                    currentName: row.NAME,
                });
            }

            // 2. Prepare Transaction Header
            const header = {
                entryType: row.ENTRY,
                period: parseInt(row.PERIOD) || 0,
                accountNo: row.ACCNO,
                accountName: row.NAME, // Snapshot (1B)
                docNo: row.DOCNO,
                invNo: row.INVNO,
                date: this.parseERPDate(row.DATE),
                ref: row.REF,
                amount: parseFloat(row.AMOUNT) || 0,
                taxAmount: parseFloat(row.TAX) || 0,
                fAmount: parseFloat(row.FAMOUNT) || 0,
                isPaid: row.PAID === 'Y',
            };

            this.transactions.push(header);

            // 3. Derive Allocation Event (2A)
            // If it's a payment/credit hitting a different invoice
            if ((row.ENTRY === 'Payment' || row.ENTRY === 'Crd Note') &&
                row.INVNO && row.INVNO !== row.DOCNO && row.INVNO !== 'Alloc') {
                this.allocations.push({
                    sourceDocNo: row.DOCNO,
                    targetDocNo: row.INVNO,
                    amount: Math.abs(parseFloat(row.AMOUNT)) || 0,
                    eventType: 'ALLOCATE',
                });
            }
        }
    }

    private parseERPDate(dateStr: string): Date {
        try {
            // Format is DD/MM/YYYY
            return parse(dateStr, 'dd/MM/yyyy', new Date());
        } catch (e) {
            console.error(`Failed to parse date: ${dateStr}`);
            return new Date();
        }
    }

    getProcessedData() {
        return {
            accounts: Array.from(this.accounts.values()),
            products: Array.from(this.products.values()),
            salesReps: Array.from(this.salesReps.values()),
            transactions: this.transactions,
            allocations: this.allocations,
        };
    }
}
