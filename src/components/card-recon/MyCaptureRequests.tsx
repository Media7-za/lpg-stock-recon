import { useState, useEffect, useCallback } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
    CardCaptureRequest,
    listMyCaptureRequests,
    getReceiptSignedUrl,
} from '../../lib/cardReconService';
import { useCurrentActor } from '../../hooks/useCurrentActor';
import StatusPill from './StatusPill';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

function formatZAR(value: number): string {
    const sign = value < 0 ? '-' : '';
    return `R${sign}${Math.abs(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// docs/Card-Recon/UX_Blueprint.md — "My Requests" screen (Slice A).
export default function MyCaptureRequests() {
    const { actorId } = useCurrentActor();
    const [requests, setRequests] = useState<CardCaptureRequest[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        if (!actorId) return;
        setError(null);
        try {
            const rows = await listMyCaptureRequests(actorId);
            setRequests(rows);

            const entries = await Promise.all(
                rows.map(async (r) => {
                    try {
                        // Never a stored public URL (FR-CCR-RECEIPT-001) — a
                        // fresh short-lived signed URL per view.
                        const url = await getReceiptSignedUrl(r.receiptUrl);
                        return [r.id, url] as const;
                    } catch {
                        return null;
                    }
                })
            );
            setThumbnails(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load your requests'));
        }
    }, [actorId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header>
                <h1 className="text-xl font-semibold text-text-primary">My Requests</h1>
                <p className="text-sm text-text-secondary">Receipts you've submitted for posting.</p>
            </header>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {requests === null && !error && (
                    <div className="p-8 space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-14 bg-surface-elevated rounded animate-pulse" />
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

                {requests !== null && !error && requests.length === 0 && (
                    <div className="p-8 text-center text-text-secondary">
                        No requests yet — tap + Quick Request to log a purchase, or submit a receipt after buying.
                    </div>
                )}

                {requests !== null && !error && requests.length > 0 && (
                    <ul className="divide-y divide-border">
                        {requests.map(request => (
                            <li key={request.id} className="px-4 py-3 flex items-center gap-3">
                                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-surface-elevated flex items-center justify-center">
                                    {thumbnails[request.id] ? (
                                        <img src={thumbnails[request.id]} alt="Receipt" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-text-secondary" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-text-primary truncate">{request.description}</p>
                                    <p className="text-xs text-text-secondary">
                                        {formatZAR(request.amount)} · {format(new Date(request.purchaseDate), 'dd MMM yyyy')}
                                    </p>
                                    {request.status === 'REJECTED' && request.rejectionReason && (
                                        <p className="text-xs text-red-500 mt-0.5">{request.rejectionReason}</p>
                                    )}
                                </div>
                                <StatusPill kind="captureRequest" status={request.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
