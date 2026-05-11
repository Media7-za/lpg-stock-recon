import { useState, useEffect, useRef } from 'react';
import { 
    X, FileUp, Send, CheckCircle2, AlertTriangle, 
    Loader2, Database, History, Eye, Info, Clock
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';
import { 
    generateInvoicePDF, mergePOD, triggerWhatsAppDispatch, 
    InvoiceHeader, InvoiceItem, DispatchLog 
} from '../../lib/dispatchService';
import { DispatchEligibleInvoice } from '../../types';

interface Props {
    invoice: DispatchEligibleInvoice;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DispatchDetailView({ invoice, onClose, onSuccess }: Props) {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [logs, setLogs] = useState<DispatchLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [podFile, setPodFile] = useState<File | null>(null);
    const [dispatching, setDispatching] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial fetch for items and logs
    useEffect(() => {
        async function fetchData() {
            if (!supabase) return;
            setLoading(true);

            const [itemsRes, logsRes] = await Promise.all([
                supabase
                    .from('transaction_items')
                    .select('stock_no, description, qty, retail_price')
                    .eq('doc_no', invoice.doc_no)
                    .eq('account_no', invoice.account_no),
                supabase
                    .from('invoice_dispatch_logs')
                    .select('*')
                    .eq('doc_no', invoice.doc_no)
                    .order('sent_at', { ascending: false })
            ]);

            if (itemsRes.data) setItems(itemsRes.data);
            if (logsRes.data) setLogs(logsRes.data);
            setLoading(false);
        }
        fetchData();
    }, [invoice]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPodFile(e.target.files[0]);
        }
    };

    const handleDispatch = async () => {
        if (!podFile || !supabase) return;
        setDispatching(true);
        setUploadProgress(10);

        try {
            // 1. Generate Base Invoice PDF
            const header: InvoiceHeader = {
                doc_no: invoice.doc_no,
                tx_date: invoice.tx_date,
                account_no: invoice.account_no,
                account_name: invoice.account_name,
                amount_excl: items.reduce((acc, item) => acc + (item.qty * item.retail_price), 0),
                tax_amount: invoice.amount_inc - items.reduce((acc, item) => acc + (item.qty * item.retail_price), 0),
            };
            const invoicePdfBytes = await generateInvoicePDF(header, items);
            setUploadProgress(30);

            // 2. Merge with POD
            const mergedPdfBytes = await mergePOD(invoicePdfBytes, podFile);
            setUploadProgress(50);

            // 3. Upload POD and Merged PDF to Storage
            const timestamp = Date.now();
            const podPath = `pods/${invoice.doc_no}_${timestamp}.${podFile.name.split('.').pop()}`;
            const mergedPath = `merged/${invoice.doc_no}_${timestamp}.pdf`;

            const [podUpload, mergedUpload] = await Promise.all([
                supabase.storage.from('invoice-documents').upload(podPath, podFile),
                supabase.storage.from('invoice-documents').upload(mergedPath, mergedPdfBytes, { contentType: 'application/pdf' })
            ]);

            if (podUpload.error) throw podUpload.error;
            if (mergedUpload.error) throw mergedUpload.error;
            setUploadProgress(70);

            const { data: { publicUrl: signedDocUrl } } = supabase.storage.from('invoice-documents').getPublicUrl(podPath);
            const { data: { publicUrl: mergedDocUrl } } = supabase.storage.from('invoice-documents').getPublicUrl(mergedPath);

            // 4. Create Log Entry (PENDING)
            const { data: logEntry, error: logError } = await supabase
                .from('invoice_dispatch_logs')
                .insert({
                    doc_no: invoice.doc_no,
                    status: 'PENDING',
                    signed_doc_url: signedDocUrl,
                    merged_doc_url: mergedDocUrl
                })
                .select()
                .single();

            if (logError) throw logError;
            setUploadProgress(85);

            // 5. Trigger WhatsApp Edge Function
            const result = await triggerWhatsAppDispatch(
                logEntry.id,
                invoice.doc_no,
                invoice.whatsapp_number!,
                mergedDocUrl
            );

            if (!result.success) throw new Error(result.error || 'Failed to dispatch WhatsApp message');

            setUploadProgress(100);
            onSuccess();
        } catch (err: any) {
            console.error('[Dispatch] Error:', err);
            alert(`Dispatch failed: ${err.message || 'Unknown error'}`);
        } finally {
            setDispatching(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-8 border-b border-border bg-gray-50 flex items-center justify-between flex-shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">Invoice</span>
                            <h3 className="text-2xl font-black">{invoice.doc_no}</h3>
                        </div>
                        <p className="text-text-secondary text-sm flex items-center gap-2">
                            <Database className="w-4 h-4" /> 
                            {invoice.account_name} ({invoice.account_no}) • {invoice.tx_date}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center border border-transparent hover:border-border transition-all"
                    >
                        <X className="text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Details & Items */}
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-xs font-black uppercase text-text-secondary tracking-widest mb-4 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Line Items
                            </h4>
                            {loading ? (
                                <div className="py-12 text-center text-text-secondary">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    <span className="text-sm">Fetching document detail...</span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-border text-center text-text-secondary italic text-sm">
                                    No line items found.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl text-sm">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="font-bold truncate">{item.description}</p>
                                                <p className="text-xs text-text-secondary font-mono">{item.stock_no}</p>
                                            </div>
                                            <div className="flex items-center gap-8 flex-shrink-0">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Qty</p>
                                                    <p className="font-mono font-bold">{item.qty}</p>
                                                </div>
                                                <div className="text-right w-20">
                                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Total</p>
                                                    <p className="font-mono font-bold">{(item.qty * item.retail_price).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-blue-50 rounded-xl flex justify-between items-center mt-4">
                                        <span className="font-bold text-blue-900">Total Amount (Incl)</span>
                                        <span className="font-mono font-black text-blue-900 text-lg">
                                            {invoice.amount_inc.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section>
                            <h4 className="text-xs font-black uppercase text-text-secondary tracking-widest mb-4 flex items-center gap-2">
                                <History className="w-3 h-3" />
                                Dispatch History
                            </h4>
                            {logs.length === 0 ? (
                                <p className="text-sm text-text-secondary italic">No previous dispatch attempts.</p>
                            ) : (
                                <div className="space-y-3">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                                            <div className={clsx(
                                                "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
                                                log.status === 'SENT' ? "bg-emerald-100 text-emerald-600" :
                                                log.status === 'FAILED' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"
                                            )}>
                                                {log.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : 
                                                 log.status === 'FAILED' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1 text-xs">
                                                <div className="flex justify-between font-bold">
                                                    <span>{log.status}</span>
                                                    <span className="text-text-secondary font-normal">{new Date(log.sent_at).toLocaleString()}</span>
                                                </div>
                                                {log.error_details && <p className="text-red-500 mt-1 truncate">{log.error_details}</p>}
                                            </div>
                                            {log.merged_doc_url && (
                                                <a href={log.merged_doc_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white rounded border border-transparent hover:border-border transition-all">
                                                    <Eye className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: POD & Action */}
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-xs font-black uppercase text-text-secondary tracking-widest mb-4 flex items-center gap-2">
                                <FileUp className="w-3 h-3" />
                                Proof of Delivery (Signed POD)
                            </h4>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={clsx(
                                    "relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden",
                                    podFile ? "border-blue-500 bg-blue-50/10" : "border-border hover:border-blue-400 hover:bg-gray-50"
                                )}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*,application/pdf"
                                    onChange={handleFileSelect}
                                />
                                
                                {podFile ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
                                            <FileUp className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-sm text-blue-900 truncate w-full px-4">{podFile.name}</p>
                                        <p className="text-xs text-blue-600">{(podFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPodFile(null); }}
                                            className="mt-4 text-xs font-bold text-red-500 hover:underline"
                                        >
                                            Remove and replace
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-text-secondary group-hover:scale-110 transition-transform">
                                            <FileUp className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-text-primary">Click or drop signed POD</p>
                                            <p className="text-xs text-text-secondary mt-1">Accepts JPG, PNG, or PDF (Max 5MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {!invoice.whatsapp_number && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p><strong>Missing Contact:</strong> This customer has no WhatsApp number. Please seed it in the DataHub first.</p>
                            </div>
                        )}

                        {invoice.last_status === 'SENT' && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-800 text-sm">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p><strong>Resend Note:</strong> This invoice was already sent. Sending again will create a new log entry.</p>
                            </div>
                        )}

                        <button
                            onClick={handleDispatch}
                            disabled={!podFile || !invoice.whatsapp_number || dispatching || !navigator.onLine}
                            className={clsx(
                                "w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all",
                                dispatching ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                                (!podFile || !invoice.whatsapp_number || !navigator.onLine) ? "bg-gray-100 text-gray-300 cursor-not-allowed" :
                                "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {dispatching ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{uploadProgress < 100 ? `Processing... ${uploadProgress}%` : 'Finalizing...'}</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Dispatch to WhatsApp</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
