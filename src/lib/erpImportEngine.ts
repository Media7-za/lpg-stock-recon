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
                // DK-593: a known ERP export defect on Credit Note rows from older
                // batches (DRTX2024.TXT, DRTX2025.TXT, DTRX2603.TXT) populates
                // amount_excl with the VAT-INCLUSIVE (gross) figure instead of the
                // ex-VAT figure, while tax_amount stays correct. That silently
                // double-counts VAT wherever amount_excl + tax_amount is summed.
                // Detect that specific shape via the gross-side double-check: if
                // treating amount_excl as gross reproduces tax_amount, the column
                // is holding gross, not ex-VAT.
                //
                // PDP-34 fix: Credit Note amount_excl is negative in real data, so
                // grossImpliedTax (derived from the signed amount_excl) comes out
                // negative while actualTax is forced positive via Math.abs() above.
                // Comparing them directly (without abs() on grossImpliedTax) could
                // never match for any negative-amount Credit Note — which is the
                // normal case — so this detector silently never fired as CRITICAL
                // in production: 21 TWK002 docs (single bad row) and 30 more (an
                // unrejected bad row sitting alongside a later, separately
                // re-imported, correct row) all carry this exact defect, sourced
                // from the named batches above, undetected until now. Comparing
                // magnitudes on both sides is the fix.
                const grossImpliedTax = Math.round((header.amount_excl / 1.15) * 0.15 * 100) / 100;
                const isGrossInExclDefect =
                    header.entry_type === 'Crd Note' &&
                    Math.abs(Math.abs(grossImpliedTax) - actualTax) <= 0.02;

                findings.push({
                    id: header.doc_no,
                    rule: 'VAT_CONSISTENCY',
                    severity: isGrossInExclDefect ? 'CRITICAL' : 'WARNING',
                    message: isGrossInExclDefect
                        ? `Credit Note amount_excl (R${header.amount_excl}) appears VAT-inclusive (gross), not ex-VAT: tax R${actualTax} matches the gross-side calculation instead of the ex-VAT one (DK-593). Row rejected.`
                        : `Expected VAT R${expectedTax}, found R${actualTax}`,
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
        // Collapse ANY run of whitespace — not just the outer edges — to a single
        // ASCII space before trimming. JS's `\s` class already matches Unicode
        // space variants (NBSP U+00A0, figure space, etc), so this normalizes an
        // internal NBSP-vs-regular-space difference in the same way `.trim()`
        // already normalized *leading/trailing* whitespace differences. Without
        // this, two cleaned values could still diverge only in the middle of the
        // string (e.g. a description or reference field), which survives into
        // both the stored row and the fingerprint hash input undetected — see
        // PDP-31 / computeFingerprint() below.
        return v.replace(/\s+/g, ' ').trim().replace(/"/g, '');
    }

    private parseDate(s: string): string | null {
        if (!s) return null;
        try {
            const d = parse(s.trim(), 'dd/MM/yyyy', new Date());
            if (isNaN(d.getTime())) return null;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return null;
        }
    }

    /**
     * Compute SHA-256 fingerprint in the browser
     *
     * PDP-31 stability contract: `SyncService` (see syncService.ts) upserts on
     * `onConflict: 'fingerprint'` and that is the ONLY mechanism that recognises
     * an incoming row as "already imported" rather than a new transaction. That
     * only holds if the same logical row hashes to the same value on every
     * future import, regardless of which file name it is re-exported under.
     *
     * PDP-31 root cause (confirmed, not the whitespace/NBSP hypothesis this
     * function's `clean()` helper now also guards against): this invariant was
     * broken once already, at the code level rather than the data level. Two
     * confirmed duplicate pairs (TWK002 doc 00034285/9.1, JEN001 doc
     * 00030227/19.1 — both from a single batch export re-ingested under the
     * names `2025.TXT` then, months later, `STTRANS2024.TXT`) have byte-for-byte
     * identical stored `entry_type, account_no, doc_no, stock_no, description,
     * reference, tx_date, qty, retail_price` in every case checked (verified via
     * Postgres `length()`/`octet_length()` equality — ruling out hidden internal
     * whitespace, a unicode variant, or float-rounding residue in the stored
     * data), yet carry two different `fingerprint` values. Recomputing today's
     * exact algorithm over each pair's own stored fields reproduces the *newer*
     * row's fingerprint precisely, every time, but never the older row's. The
     * older rows were inserted the day *before* this fingerprinting scheme
     * (this exact field list / `clean()` / column mapping) was introduced in
     * the codebase — i.e. they were hashed by a different implementation of
     * this function. When the same historical export was re-run months later
     * under the current build, it produced a fresh fingerprint for identical
     * data, and the upsert had no way left to recognise the row as a duplicate.
     *
     * Takeaway for future changes to this function: changing the field list,
     * field order, column-index mapping, or cleaning rules changes every future
     * fingerprint for data already stored under the old rules. That silently
     * reproduces this exact bug the next time any of that historical data is
     * re-imported. Treat such a change as requiring a coordinated backfill of
     * existing `fingerprint` values, not just a code change.
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
