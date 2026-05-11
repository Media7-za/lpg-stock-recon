import { 
    FileUp, CheckCircle2, AlertTriangle, 
    Loader2, Info, Users, Download
} from 'lucide-react';
import Papa from 'papaparse';
import clsx from 'clsx';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CustomerImport() {
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<{success: number, errors: string[]} | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setImporting(true);
        setResults(null);

        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[];
                let successCount = 0;
                const errorList: string[] = [];

                if (!supabase) return;

                // Process in batches of 50
                const batchSize = 50;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize).map(row => ({
                        account_code: row.account_code || row.AccountCode || row.Code,
                        name: row.name || row.Name || row.AccountName,
                        whatsapp_number: row.whatsapp_number || row.WhatsApp || row.Number
                    })).filter(r => r.account_code && r.whatsapp_number);

                    if (batch.length === 0) continue;

                    const { error } = await supabase
                        .from('customers')
                        .upsert(batch, { onConflict: 'account_code' });

                    if (error) {
                        errorList.push(`Batch ${i/batchSize + 1}: ${error.message}`);
                    } else {
                        successCount += batch.length;
                    }
                }

                setResults({ success: successCount, errors: errorList });
                setImporting(false);
            },
            error: (err) => {
                setResults({ success: 0, errors: [err.message] });
                setImporting(false);
            }
        });
    };

    const downloadTemplate = () => {
        const csv = "account_code,name,whatsapp_number\nACC001,John Doe,+27821234567\nACC002,Jane Smith,+27839876543";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customer_template.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Customer Contact Seed
                    </h3>
                    <p className="text-sm text-text-secondary">Upsert customer WhatsApp numbers via CSV for automated dispatch.</p>
                </div>
                <button 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 text-text-secondary transition-all"
                >
                    <Download className="w-4 h-4" />
                    CSV Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-4">
                        <h4 className="font-bold text-blue-900 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Import Instructions
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                            <li>Ensure CSV has headers: <strong>account_code</strong>, <strong>name</strong>, <strong>whatsapp_number</strong></li>
                            <li>WhatsApp numbers should include country code (e.g., +2782...)</li>
                            <li>Existing accounts will be updated (Upsert)</li>
                            <li>Duplicates in the same CSV will be handled gracefully</li>
                        </ul>
                    </div>

                    <div className="relative group">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={importing}
                        />
                        <div className={clsx(
                            "h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all",
                            importing ? "bg-gray-100 border-gray-300" : "bg-white border-border group-hover:border-blue-500 group-hover:bg-blue-50/10"
                        )}>
                            {importing ? (
                                <>
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p className="font-bold text-text-secondary">Processing CSV...</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-text-secondary group-hover:scale-110 transition-transform">
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-text-primary">Drop CSV or Click to Upload</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {results ? (
                        <div className={clsx(
                            "p-8 rounded-3xl border animate-in slide-in-from-right-4 duration-300",
                            results.errors.length > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
                        )}>
                            <div className="flex items-center gap-3 mb-4">
                                {results.errors.length > 0 ? (
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                ) : (
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                )}
                                <div>
                                    <h4 className={clsx(
                                        "text-lg font-black",
                                        results.errors.length > 0 ? "text-red-900" : "text-emerald-900"
                                    )}>
                                        Import {results.errors.length > 0 ? 'Completed with Errors' : 'Successful'}
                                    </h4>
                                    <p className={clsx(
                                        "text-sm font-medium",
                                        results.errors.length > 0 ? "text-red-700" : "text-emerald-700"
                                    )}>
                                        {results.success} customers processed
                                    </p>
                                </div>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="mt-4 p-4 bg-white/50 rounded-xl max-h-40 overflow-y-auto text-xs font-mono text-red-800">
                                    {results.errors.map((err, i) => <p key={i}>{err}</p>)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                            <HistoryIcon className="w-12 h-12 opacity-10 mb-4" />
                            <p className="text-sm">Import results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function HistoryIcon(props: any) {
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
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
