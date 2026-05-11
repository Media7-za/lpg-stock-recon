import { useState, useEffect } from 'react';
import { 
    Truck, Calendar, Search, Eye, CheckCircle2, 
    AlertTriangle, Info, Clock, AlertCircle, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useDispatchInvoices, useMaxTxDate } from '../../hooks/useDispatchInvoices';
import DispatchDetailView from './DispatchDetailView';
import { DispatchEligibleInvoice } from '../../types';

export default function DispatchDashboard() {
    const maxDate = useMaxTxDate();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedInvoice, setSelectedInvoice] = useState<DispatchEligibleInvoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (maxDate && !selectedDate) {
            setSelectedDate(maxDate);
        }
    }, [maxDate, selectedDate]);

    const { invoices, loading, error, refresh } = useDispatchInvoices(selectedDate);

    const filteredInvoices = invoices.filter(inv => 
        inv.doc_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.account_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case 'SENT':
            case 'DELIVERED':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'FAILED':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'PENDING':
                return <Clock className="w-5 h-5 text-gray-400" />;
            default:
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-text-primary flex items-center gap-3">
                        <Truck className="w-8 h-8 text-blue-500" />
                        Invoice Dispatch
                    </h1>
                    <p className="text-text-secondary">Dispatch invoices with signed PODs to customers via WhatsApp.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative group w-full sm:w-auto">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        />
                    </div>
                    <div className="relative group w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search Doc / Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                </div>
            </header>

            {!navigator.onLine && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 animate-pulse">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Connection Required</p>
                        <p className="text-sm">You must be online to dispatch invoices or upload documents. Some features may be disabled.</p>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Status</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Doc No</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Customer</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary text-right">Amount (Incl)</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Contact</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary">Last Sent</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <span>Loading Invoices...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                                        <p className="font-bold">Error loading data</p>
                                        <p className="text-sm">{error}</p>
                                        <button onClick={refresh} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold">Retry</button>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary italic">
                                        No invoices found for the selected date or search criteria.
                                    </td>
                                </tr>
                            ) : filteredInvoices.map(inv => (
                                <tr key={inv.doc_no} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                            inv.last_status === 'SENT' ? "bg-emerald-100/50" :
                                            inv.last_status === 'FAILED' ? "bg-red-100/50" :
                                            inv.last_status === 'PENDING' ? "bg-gray-100/50" :
                                            "bg-blue-100/50"
                                        )}>
                                            {getStatusIcon(inv.last_status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold">{inv.doc_no}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-text-primary">{inv.account_name}</p>
                                        <p className="text-xs text-text-secondary">{inv.account_no}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">
                                        {inv.amount_inc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4">
                                        {inv.whatsapp_number ? (
                                            <span className="text-sm font-medium text-text-primary">{inv.whatsapp_number}</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Missing</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                                        {inv.last_sent_at ? new Date(inv.last_sent_at).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedInvoice(inv)}
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

            {selectedInvoice && (
                <DispatchDetailView 
                    invoice={selectedInvoice} 
                    onClose={() => setSelectedInvoice(null)} 
                    onSuccess={() => {
                        setSelectedInvoice(null);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}
