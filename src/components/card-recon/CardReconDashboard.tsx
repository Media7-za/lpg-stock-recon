import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
    CardReconSession,
    listCardReconSessions,
    importStatement,
} from '../../lib/cardReconService';
import { useCurrentActor } from '../../hooks/useCurrentActor';
import StatusPill from './StatusPill';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

// docs/Card-Recon/UX_Blueprint.md — Card Recon Dashboard (Slice B),
// Step B.1. Statement CSV upload is the SOLE trigger for the whole
// slice — there is no separate "Start Reconciliation" action.
export default function CardReconDashboard() {
    const { actorId } = useCurrentActor();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sessions, setSessions] = useState<CardReconSession[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setSessions(await listCardReconSessions());
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load reconciliation sessions'));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function handleFileSelected(file: File | undefined) {
        if (!file || !actorId) return;
        setUploading(true);
        setUploadError(null);
        try {
            const session = await importStatement(file, actorId);
            navigate(`/card-recon/reconciliation/${session.id}`);
        } catch (err) {
            setUploadError(getErrorMessage(err, "Couldn't read this file — check it's the unedited bank export"));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Card Reconciliation</h1>
                    <p className="text-sm text-text-secondary">Upload the monthly statement to reconcile.</p>
                </div>
            </header>

            <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Statement CSV
                </button>
                {uploadError && (
                    <p className="flex items-center justify-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {uploadError}
                    </p>
                )}
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {sessions === null && !error && (
                    <div className="p-8 space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-12 bg-surface-elevated rounded animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-8 text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                        <p className="text-text-secondary">{error}</p>
                        <button onClick={load} className="text-sm text-blue-500 hover:text-blue-400 font-medium">
                            Retry
                        </button>
                    </div>
                )}

                {sessions !== null && !error && sessions.length === 0 && (
                    <div className="p-8 text-center text-text-secondary">
                        No reconciliations yet — upload this month's statement to start.
                    </div>
                )}

                {sessions !== null && !error && sessions.length > 0 && (
                    <ul className="divide-y divide-border">
                        {sessions.map(session => (
                            <li key={session.id}>
                                <button
                                    onClick={() => navigate(`/card-recon/reconciliation/${session.id}`)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-elevated"
                                >
                                    <div className="min-w-0">
                                        <p className="text-text-primary truncate">{session.statementFilename}</p>
                                        <p className="text-xs text-text-secondary">
                                            Imported {format(new Date(session.importedAt), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                    <StatusPill kind="reconSession" status={session.status} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
