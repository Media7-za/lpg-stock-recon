import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
    Search, ChevronRight, CheckCircle2, AlertTriangle, 
    Calculator, Info, Loader2, Database, Eye, Download
} from 'lucide-react';
import clsx from 'clsx';

interface AuditRow {
    header_id: string;
    account_no: string;
    account_name: string;
    doc_no: string;
    tx_date: string;
    entry_type: string;
    amount_excl: number;
    amount_inc: number;
    calc_lpg: number;
    calc_cyl: number;
    calc_total: number | null;
    lpg_qty: number;
    cyl_qty: number;
    line_count: number;
}

interface ItemDetail {
    stock_no: string;
    description: string;
    qty: number;
    retail_price: number;
    amt: number;
}

export default function AuditDashboard() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<{account_no: string, account_name: string}[]>([]);
    const [selectedAcc, setSelectedAcc] = useState<string>('');
    const [auditData, setAuditData] = useState<AuditRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [hideFinancials, setHideFinancials] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<AuditRow | null>(null);
    const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
    const [itemLoading, setItemLoading] = useState(false);

    // Initial load: Fetch unique accounts from the aggregated view
    useEffect(() => {
        async function fetchAccounts() {
            if (!supabase) return;
            const { data } = await supabase
                .from('unique_accounts')
                .select('*')
                .order('account_no', { ascending: true });
            
            if (data) {
                setAccounts(data);
            }
        }
        fetchAccounts();
    }, []);

    // Fetch audit data when account changes
    useEffect(() => {
        async function fetchAudit() {
            if (!selectedAcc || !supabase) {
                setAuditData([]);
                return;
            }
            setLoading(true);
            const { data } = await supabase
                .from('reconciliation_summary')
                .select('*')
                .eq('account_no', selectedAcc)
                .order('tx_date', { ascending: false });
            
            if (data) setAuditData(data);
            setLoading(false);
        }
        fetchAudit();
    }, [selectedAcc]);

    // Fetch item details on drill-down
    const fetchDetails = async (row: AuditRow) => {
        setSelectedDoc(row);
        setItemLoading(true);
        if (!supabase) return;

        const { data } = await supabase
            .from('transaction_items')
            .select('stock_no, description, qty, retail_price')
            .eq('doc_no', row.doc_no)
            .eq('account_no', row.account_no);
        
        if (data) {
            setItemDetails(data.map(d => ({ ...d, amt: d.qty * d.retail_price })));
        }
        setItemLoading(false);
    };

    // Add Smart Match logic dynamically
    const enrichedData = auditData.map(row => {
        const calcVal = row.calc_total || 0;
        let srcVal = 0;
        let status = 'MATCH';
        let is_financial_only = false;

        // Legacy Smart Match Algorithm
        if (row.calc_total !== null) {
            if (Math.abs(calcVal - row.amount_excl) < 0.1) srcVal = row.amount_excl;
            else if (Math.abs(calcVal - row.amount_inc) < 0.1) srcVal = row.amount_inc;
            else { 
                srcVal = row.amount_inc; 
                status = 'VARIANCE'; 
            }
        } else {
            srcVal = row.amount_inc; // Default to gross for missing items
            if (['Payment', 'Journal', 'Interest'].includes(row.entry_type)) {
                status = 'HDR ONLY (NO DETAIL)';
                is_financial_only = true;
            } else {
                status = 'MISSING IN DATABASE';
            }
        }

        return {
            ...row,
            hdr_total: srcVal,
            variance: calcVal - srcVal,
            status,
            is_financial_only
        };
    });

    const filteredData = hideFinancials 
        ? enrichedData.filter(r => !r.is_financial_only)
        : enrichedData;

    const stats = {
        total: filteredData.length,
        matches: filteredData.filter(r => r.status === 'MATCH').length,
        variances: filteredData.filter(r => r.status === 'VARIANCE').length,
        missing: filteredData.filter(r => ['MISSING IN DATABASE', 'HDR ONLY (NO DETAIL)'].includes(r.status)).length,
    };

    const successRate = stats.total > 0 ? (stats.matches / stats.total) * 100 : 0;

    // Helper to trigger browser download
    const triggerCSVDownload = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export 1: Summary Report
    const exportSummaryToCSV = () => {
        if (!selectedAcc) return;
        
        let headerRow = "DOCNO,DATE,TYPE,HDR_TOTAL,CALC_LPG,CALC_CYL,CALC_TOTAL,VARIANCE,STATUS,LPG_QTY,CYL_QTY\n";
        
        const rows = filteredData.map(row => {
            // Match legacy format "DD/MM/YYYY" parsing manually to avoid TZ shifts
            let formattedDate = '';
            if (row.tx_date) {
                const [y, m, d] = row.tx_date.split('-');
                if (y && m && d) formattedDate = `${d}/${m}/${y}`;
            }
            
            return [
                row.doc_no,
                formattedDate,
                row.entry_type,
                (row.hdr_total || 0).toFixed(2),
                (row.calc_lpg || 0).toFixed(2),
                (row.calc_cyl || 0).toFixed(2),
                (row.calc_total || 0).toFixed(2),
                (row.variance || 0).toFixed(2),
                row.status,
                (row.lpg_qty || 0).toFixed(1),
                (row.cyl_qty || 0).toFixed(1)
            ].join(',');
        });

        triggerCSVDownload(headerRow + rows.join('\n'), `RECON_SUMMARY_${selectedAcc}.CSV`);
    };

    // Export 2: Detailed Report
    const exportDetailedToCSV = async () => {
        if (!selectedAcc || !supabase) return;

        // Fetch all item-level data for this account directly
        const { data, error } = await supabase
            .from('transaction_items')
            .select('*')
            .eq('account_no', selectedAcc)
            .order('tx_date', { ascending: true });

        if (error || !data) {
            console.error("Failed to fetch detailed data for CSV");
            return;
        }

        let headerRow = "DOCNO,DATE,TYPE,STOCKNO,DESC,CAT,QTY,LINE_TOTAL,FILE\n";
        
        const rows = data.map(item => {
            let formattedDate = '';
            if (item.tx_date) {
                const [y, m, d] = item.tx_date.split('-');
                if (y && m && d) formattedDate = `${d}/${m}/${y}`;
            }
            // Make sure description and filename don't contain commas that break CSV structure
            const safeDesc = (item.description || '').replace(/,/g, '');
            const safeFile = (item.source_file || '').replace(/,/g, '');
            // Legacy calculated Gross based on qty * retail_price +/- line_tax
            const excl = (item.qty * item.retail_price) || 0;
            const lineTotal = excl < 0 ? excl - (item.line_tax || 0) : excl + (item.line_tax || 0);

            return [
                item.doc_no,
                formattedDate,
                item.entry_type,
                item.stock_no,
                safeDesc,
                item.category,
                (item.qty || 0).toFixed(1),
                lineTotal.toFixed(2),
                safeFile
            ].join(',');
        });

        triggerCSVDownload(headerRow + rows.join('\n'), `DETAILED_REPORT_${selectedAcc}.CSV`);
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-text-primary flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-blue-500" />
                        Transactional Audit
                    </h1>
                    <p className="text-text-secondary">Perform deep-dive analysis of ERP logs vs Individual line items.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-blue-500 transition-colors" />
                        <select 
                            value={selectedAcc}
                            onChange={(e) => setSelectedAcc(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 appearance-none"
                        >
                            <option value="">Select Account...</option>
                            {accounts.map(acc => (
                                <option key={acc.account_no} value={acc.account_no}>
                                    {acc.account_no} - {acc.account_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {selectedAcc && (
                <>
                    {/* Action Bar */}
                    <div className="flex justify-end gap-3 -mt-2">
                        <button 
                            onClick={exportSummaryToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 text-text-secondary hover:text-text-primary transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Summary CSV
                        </button>
                        <button 
                            onClick={exportDetailedToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-100 text-blue-700 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Detailed CSV
                        </button>
                        <button 
                            onClick={() => navigate(`/debtors-recon/${selectedAcc}`)}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 border border-emerald-500 rounded-lg text-sm font-black shadow-lg shadow-emerald-900/20 text-white hover:bg-emerald-500 transition-all uppercase tracking-widest ml-4"
                        >
                            <Calculator className="w-4 h-4" />
                            Reconcile Account
                        </button>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <CheckCircle2 className="w-16 h-16" />
                            </div>
                            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Match Rate</p>
                            <p className={clsx(
                                "text-4xl font-black",
                                successRate === 100 ? "text-emerald-500" : successRate > 80 ? "text-blue-500" : "text-amber-500"
                            )}>
                                {successRate.toFixed(1)}%
                            </p>
                            <div className="mt-4 w-full bg-border rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${successRate}%` }} />
                            </div>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Variances</p>
                            <p className={clsx("text-4xl font-black", stats.variances > 0 ? "text-red-500" : "text-text-primary")}>
                                {stats.variances}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">Requires attention</p>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Deduplicated Items</p>
                            <p className="text-4xl font-black text-text-primary">
                                {auditData.reduce((acc, row) => acc + (row.line_count || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">Total SKU movements</p>
                        </div>

                        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Hide Financials</span>
                                <button 
                                    onClick={() => setHideFinancials(!hideFinancials)}
                                    className={clsx(
                                        "w-12 h-6 rounded-full p-1 transition-colors",
                                        hideFinancials ? "bg-blue-600" : "bg-gray-400"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-4 h-4 bg-white rounded-full transition-transform",
                                        hideFinancials ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">Exclude non-stock journals and payments from audit.</p>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Status</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Doc No</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Date</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Type</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary text-right">Accounting (HDR)</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary text-right">Integrated (Item)</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary text-right">Variance</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                    <span>Calculating Reconciliation...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-text-secondary italic">
                                                No records found matching filters.
                                            </td>
                                        </tr>
                                    ) : filteredData.map(row => (
                                        <tr key={row.header_id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    row.status === 'MATCH' ? "bg-emerald-100/50 text-emerald-600" :
                                                    row.status === 'VARIANCE' ? "bg-red-100/50 text-red-600" :
                                                    "bg-amber-100/50 text-amber-600"
                                                )}>
                                                    {row.status === 'MATCH' ? <CheckCircle2 className="w-5 h-5" /> : 
                                                     row.status === 'VARIANCE' ? <AlertTriangle className="w-5 h-5" /> : 
                                                     <Info className="w-5 h-5" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold">{row.doc_no}</td>
                                            <td className="px-6 py-4 text-text-secondary font-medium">{row.tx_date}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                    row.is_financial_only ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {row.entry_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold">{(row.hdr_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">{(row.calc_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className={clsx(
                                                "px-6 py-4 text-right font-mono font-bold",
                                                Math.abs(row.variance || 0) < 0.01 ? "text-emerald-500/50" : "text-red-500"
                                            )}>
                                                {(row.variance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => fetchDetails(row)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border text-text-secondary hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Drill-down Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
                    <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black">Document Audit: {selectedDoc.doc_no}</h3>
                                <p className="text-text-secondary text-sm flex items-center gap-2">
                                    <Database className="w-4 h-4" /> 
                                    Line-item breakdown retrieved from Cloud Logs
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedDoc(null)}
                                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center border border-transparent hover:border-border transition-all"
                            >
                                <ChevronRight className="rotate-90 text-text-secondary" />
                            </button>
                        </div>
                        
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {itemLoading ? (
                                <div className="py-20 text-center text-text-secondary">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                                    <p className="font-bold">Locating detail records...</p>
                                </div>
                            ) : itemDetails.length === 0 ? (
                                <div className="py-20 text-center text-text-secondary italic">
                                    No item-level logs found for this document. Verify that the correct STDatabase file was uploaded.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black uppercase text-text-secondary tracking-widest border-b border-border">
                                        <div className="col-span-8">Product / Description</div>
                                        <div className="col-span-1 text-right">Qty</div>
                                        <div className="col-span-3 text-right">Amount</div>
                                    </div>
                                    {itemDetails.map((item, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100">
                                            <div className="col-span-8">
                                                <p className="font-bold text-sm">{item.description}</p>
                                                <p className="text-xs text-text-secondary font-mono">#{item.stock_no}</p>
                                            </div>
                                            <div className="col-span-1 text-right font-black font-mono pt-1">{item.qty}</div>
                                            <div className="col-span-3 text-right font-black font-mono pt-1">{item.amt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    ))}
                                    <div className="pt-4 flex justify-end">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Line Count</p>
                                                <p className="text-lg font-black font-mono text-blue-900">{itemDetails.length}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Calculated Total</p>
                                                <p className="text-lg font-black font-mono text-blue-900">{itemDetails.reduce((a, b) => a + b.amt, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
