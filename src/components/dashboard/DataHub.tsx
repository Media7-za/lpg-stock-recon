import { useState, useEffect } from 'react';
import { Database, FileText, CheckCircle2, AlertCircle, Loader2, Info, Clock, History } from 'lucide-react';
import { ERPImportEngine } from '../../lib/erpImportEngine';
import { SyncService, SyncProgress } from '../../lib/syncService';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import clsx from 'clsx';

type UploadState = 'idle' | 'parsing' | 'syncing' | 'complete' | 'error' | 'cancelled';

export default function DataHub() {
    const [state, setState] = useState<UploadState>('idle');
    const [progress, setProgress] = useState<SyncProgress | null>(null);

    const [errors, setErrors] = useState<string[]>([]);
    const [controller, setController] = useState<AbortController | null>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    const fetchLogs = async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from('sync_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        if (data) setRecentLogs(data);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'headers' | 'items') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setState('parsing');
        setErrors([]);
        setProgress(null);

        const abortController = new AbortController();
        setController(abortController);

        try {
            const content = await file.text();
            const engine = new ERPImportEngine();
            
            if (type === 'headers') {
                const headers = await engine.parseHeaders(content, file.name);
                setFileStats(prev => ({ ...prev, headers: headers.length }));
                setState('syncing');
                await SyncService.syncHeaders(headers, setProgress, abortController.signal);
            } else {
                const items = await engine.parseItems(content, file.name);
                setFileStats(prev => ({ ...prev, items: items.length }));
                setState('syncing');
                await SyncService.syncItems(items, setProgress, abortController.signal);
            }
            
            if (abortController.signal.aborted) {
                setState('cancelled');
            } else {
                setState('complete');
                fetchLogs();
            }
        } catch (err: any) {
            if (err.name === 'AbortError' || abortController.signal.aborted) {
                setState('cancelled');
            } else {
                console.error(err);
                setErrors([err.message || "Unknown error during upload"]);
                setState('error');
            }
        } finally {
            setController(null);
        }
    };

    const handleCancel = () => {
        if (controller) {
            controller.abort();
            setState('cancelled');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-500" />
                    Cloud Data Hub
                </h1>
                <p className="text-text-secondary text-lg">
                    Direct ERP-to-Cloud synchronization agent. Upload your daily exports to update the global reconciliation system.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Headers Upload Card */}
                <div className="bg-surface border border-border rounded-xl p-8 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="relative space-y-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Transaction Headers</h3>
                        <p className="text-text-secondary">Upload your <b>DRTXS</b> log file (.TXT). This contains the accounting totals and document info.</p>
                        
                        <label className="block">
                            <span className="sr-only">Choose File</span>
                            <input 
                                type="file" 
                                accept=".TXT,.txt"
                                onChange={(e) => handleFileUpload(e, 'headers')}
                                disabled={state === 'parsing' || state === 'syncing'}
                                className="block w-full text-sm text-text-secondary
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-500 file:text-white
                                    hover:file:bg-blue-600
                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                        </label>
                    </div>
                </div>

                {/* Items Upload Card */}
                <div className="bg-surface border border-border rounded-xl p-8 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="relative space-y-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <Database className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Line Items Archive</h3>
                        <p className="text-text-secondary">Upload your <b>CURRENT.TXT</b> or <b>STDatabase</b> file. This contains individual sku movements.</p>
                        
                        <label className="block">
                            <span className="sr-only">Choose File</span>
                            <input 
                                type="file" 
                                accept=".TXT,.txt"
                                onChange={(e) => handleFileUpload(e, 'items')}
                                disabled={state === 'parsing' || state === 'syncing'}
                                className="block w-full text-sm text-text-secondary
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-emerald-500 file:text-white
                                    hover:file:bg-emerald-600
                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Status Panel */}
            {state !== 'idle' && (
                <div className={clsx(
                    "rounded-xl border p-6 transition-all",
                    state === 'syncing' || state === 'parsing' ? "bg-blue-500/5 border-blue-500/20" :
                    state === 'complete' ? "bg-emerald-500/5 border-emerald-500/20" :
                    "bg-red-500/5 border-red-500/20"
                )}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {state === 'parsing' || state === 'syncing' ? (
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            ) : state === 'complete' ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            )}
                            <span className="font-semibold text-lg">
                                {state === 'parsing' ? 'Analyzing Export File...' : 
                                 state === 'syncing' ? 'Syncing to Cloud...' : 
                                 state === 'complete' ? 'Sync Complete' : 
                                 state === 'cancelled' ? 'Sync Cancelled' :
                                 'Sync Failed'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {(state === 'syncing' || state === 'parsing') && (
                                <button 
                                    onClick={handleCancel}
                                    className="text-sm font-medium text-red-500 hover:text-red-600 border border-red-500/20 px-3 py-1 rounded-md hover:bg-red-500/5 transition-all"
                                >
                                    Cancel Process
                                </button>
                            )}
                            {progress && (
                                <span className="text-sm font-mono text-text-secondary">
                                    {progress.synced} / {progress.total} Records
                                </span>
                            )}
                        </div>
                    </div>

                    {progress && (
                        <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={clsx(
                                    "h-full transition-all duration-300",
                                    state === 'complete' ? "bg-emerald-500" : "bg-blue-500"
                                )}
                                style={{ width: `${(progress.synced / progress.total) * 100}%` }}
                            />
                        </div>
                    )}

                    {progress?.hints && progress.hints.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {progress.hints.map((hint, i) => (
                                <p key={i} className="text-blue-500 text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4" /> {hint}
                                </p>
                            ))}
                        </div>
                    )}

                    {errors.length > 0 && (
                        <div className="mt-4 space-y-1">
                            {errors.map((err, i) => (
                                <p key={i} className="text-red-500 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {err}
                                </p>
                            ))}
                        </div>
                    )}

                    {state === 'complete' && (
                        <div className="mt-4 text-emerald-600 text-sm font-medium">
                            Successfully integrated the new export data. Reconciliation views will reflect these changes now.
                        </div>
                    )}
                </div>
            )}

            {/* Persistent Upload Log Widget */}
            {recentLogs.length > 0 && (
                <div className="mt-12 bg-white border border-border shadow-sm rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-gray-50/50 flex items-center gap-2">
                        <History className="w-5 h-5 text-text-secondary" />
                        <h3 className="font-semibold text-text-primary">Recent Uploads</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        log.file_type === 'HEADERS' ? "bg-blue-100/50 text-blue-600" : "bg-emerald-100/50 text-emerald-600"
                                    )}>
                                        {log.file_type === 'HEADERS' ? <FileText className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary text-sm">{log.filename}</p>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                                            <span className="mx-1">•</span>
                                            {log.records_synced.toLocaleString()} records ingested
                                        </div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-100/50 text-green-700 text-xs font-bold rounded-full">
                                    SUCCESS
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
