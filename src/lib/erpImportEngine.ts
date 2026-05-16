import Papa from 'papaparse';
import { parse } from 'date-fns';

export interface RawHeaderRow extends Array<string> { }
export interface RawItemRow extends Array<string> { }

export interface ProcessedTransactionHeader {
    entry_type: string;
    period: number;
    account_no: string;
    account_name: string;
    doc_no: string;
    ref_no: string;
    description: string;
    order_no: string;
    batch_ref: string;
    tx_date: string; // ISO format
    amount_excl: number;
    tax_amount: number;
    tax_code: string;
    discount: number;
    flag: string;
    source_file: string;
    fingerprint: string;
}

export interface ProcessedTransactionItem {
    entry_type: string;
    period: number;
    account_no: string;
    doc_no: string;
    stock_no: string;
    description: string;
    category: string;
    product_group: string;
    brand: string;
    order_no: string;
    tx_date: string; // ISO format
    qty: number;
    retail_price: number;
    cost_price: number;
    reference: string;
    rep_code: string;
    user_code: string;
    location: string;
    tax_code: number;
    line_tax: number;
    rep_name: string;
    account_name: string;
    source_file: string;
    fingerprint: string;
}

export interface IntegrityFinding {
    id: string;
    rule: string;
    severity: 'CRITICAL' | 'WARNING';
    message: string;
    value?: number;
}

export class ERPImportEngine {
    constructor() { }

    /**
     * Financial Control Layer: Enforces integrity before data is accepted
     */
    public validateIntegrity(header: ProcessedTransactionHeader): IntegrityFinding[] {
        const findings: IntegrityFinding[] = [];

        // 1. VAT Consistency Check (Standard rate ~15%)
        if (header.tax_code === '1' || header.tax_code === 'Standard') {
            const expectedTax = Math.round(header.amount_excl * 0.15 * 100) / 100;
            const actualTax = Math.abs(header.tax_amount);
            if (Math.abs(expectedTax - actualTax) > 0.05) {
                findings.push({
                    id: header.doc_no,
                    rule: 'VAT_CONSISTENCY',
                    severity: 'WARNING',
                    message: `Expected VAT R${expectedTax}, found R${actualTax}`,
                    value: actualTax
                });
            }
        }

        // 2. Gross/Net Validation
        const total = header.amount_excl + header.tax_amount;
        if (isNaN(total)) {
            findings.push({
                id: header.doc_no,
                rule: 'GROSS_NET_VALIDATION',
                severity: 'CRITICAL',
                message: 'Invalid numeric value in amount or tax'
            });
        }

        // 3. Period Alignment
        const dateObj = new Date(header.tx_date);
        const txMonth = dateObj.getUTCMonth() + 1;
        // Period 1 = Jan, etc. Allow 1-month window for batch overlaps
        if (header.period !== txMonth && header.period !== (txMonth % 12) + 1) {
            findings.push({
                id: header.doc_no,
                rule: 'PERIOD_ALIGNMENT',
                severity: 'WARNING',
                message: `Transaction date ${header.tx_date} does not align with period ${header.period}`
            });
        }

        return findings;
    }

    private clean(v: string | undefined): string {
        if (!v) return "";
        return v.trim().replace(/"/g, '');
    }

    private parseDate(s: string): string | null {
        if (!s) return null;
        try {
            const d = parse(s.trim(), 'dd/MM/yyyy', new Date());
            return d.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }

    /**
     * Compute SHA-256 fingerprint in the browser
     */
    private async computeFingerprint(parts: any[]): Promise<string> {
        const raw = parts.join('|');
        const msgUint8 = new TextEncoder().encode(raw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Parse DRTXS Header file (16-col)
     */
    async parseHeaders(csvContent: string, fileName: string): Promise<ProcessedTransactionHeader[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<string[]>(csvContent, {
                header: false,
                skipEmptyLines: true,
                complete: async (results) => {
                    const processed: ProcessedTransactionHeader[] = [];
                    // Skip header row if it contains non-numeric data in index 1 (period)
                    const data = results.data[0][1].match(/\d+/) ? results.data : results.data.slice(1);

                    for (const row of data) {
                        if (row.length < 13) continue;
                        
                        const totalInc = parseFloat(this.clean(row[11])) || 0;
                        const tax = parseFloat(this.clean(row[12])) || 0;
                        const excl = totalInc - tax; 
                        const date = this.parseDate(this.clean(row[9]));
                        if (!date) continue;

                        const fp = await this.computeFingerprint([
                            this.clean(row[0]), // type
                            this.clean(row[2]), // account
                            this.clean(row[4]), // doc
                            this.clean(row[5]), // ref (inv)
                            this.clean(row[8]), // batch
                            date,
                            excl,
                            tax
                        ]);

                        processed.push({
                            entry_type: this.clean(row[0]),
                            period: parseInt(this.clean(row[1])) || 0,
                            account_no: this.clean(row[2]),
                            account_name: this.clean(row[3]),
                            doc_no: this.clean(row[4]),
                            ref_no: this.clean(row[5]),
                            description: this.clean(row[6]),
                            order_no: this.clean(row[7]),
                            batch_ref: this.clean(row[8]),
                            tx_date: date,
                            amount_excl: excl,
                            tax_amount: tax,
                            tax_code: this.clean(row[13]),
                            discount: parseFloat(this.clean(row[14])) || 0,
                            flag: this.clean(row[15]),
                            source_file: fileName,
                            fingerprint: fp
                        });
                    }
                    resolve(processed);
                },
                error: (err: Error) => reject(err),
            });
        });
    }

    /**
     * Parse STDatabase Item file (37-col)
     */
    async parseItems(csvContent: string, fileName: string): Promise<ProcessedTransactionItem[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<string[]>(csvContent, {
                header: false,
                skipEmptyLines: true,
                complete: async (results) => {
                    const processed: ProcessedTransactionItem[] = [];
                    const data = results.data[0][1].match(/\d+/) ? results.data : results.data.slice(1);

                    for (const row of data) {
                        if (row.length < 23) continue;

                        const qty = parseFloat(this.clean(row[11])) || 0;
                        const retail = parseFloat(this.clean(row[12])) || 0;
                        const date = this.parseDate(this.clean(row[10]));
                        if (!date) continue;

                        const fp = await this.computeFingerprint([
                            this.clean(row[0]), // type
                            this.clean(row[2]), // account
                            this.clean(row[3]), // doc
                            this.clean(row[4]), // stock
                            this.clean(row[5]), // desc
                            this.clean(row[14]), // ref
                            date,
                            qty,
                            retail
                        ]);

                        processed.push({
                            entry_type: this.clean(row[0]),
                            period: parseInt(this.clean(row[1])) || 0,
                            account_no: this.clean(row[2]),
                            doc_no: this.clean(row[3]),
                            stock_no: this.clean(row[4]),
                            description: this.clean(row[5]),
                            category: this.clean(row[6]),
                            product_group: this.clean(row[7]),
                            brand: this.clean(row[8]),
                            order_no: this.clean(row[9]),
                            tx_date: date,
                            qty,
                            retail_price: retail,
                            cost_price: parseFloat(this.clean(row[13])) || 0,
                            reference: this.clean(row[14]),
                            rep_code: this.clean(row[15]),
                            user_code: this.clean(row[16]),
                            location: this.clean(row[17]),
                            tax_code: parseInt(this.clean(row[21])) || 0,
                            line_tax: Math.abs(parseFloat(this.clean(row[22]))) || 0,
                            rep_name: this.clean(row[31]),
                            account_name: this.clean(row[32]),
                            source_file: fileName,
                            fingerprint: fp
                        });
                    }
                    resolve(processed);
                },
                error: (err: Error) => reject(err),
            });
        });
    }
}
