import { Fragment, useState, useEffect, useCallback } from 'react';
import { Inbox, AlertCircle, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import clsx from 'clsx';
import {
    CardCaptureRequest,
    LedgerAccount,
    listCaptureQueue,
    listActiveLedgerAccounts,
    getReceiptSignedUrl,
    postCaptureRequest,
    rejectCaptureRequest,
} from '../../lib/cardReconService';
import { useCurrentActor } from '../../hooks/useCurrentActor';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

function formatZAR(value: number): string {
    const sign = value < 0 ? '-' : '';
    return `R${sign}${Math.abs(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const REJECTION_REASONS = ['Unreadable receipt', 'Amount mismatch', 'Duplicate', 'Other'];

// docs/Card-Recon/UX_Blueprint.md — Capture Queue (Slice A), Steps A.4-A.5.
// Single-request review is an inline expand-row here, not a separate
// screen. No cron/scheduled auto-posting — every post is Capture Clerk
// reviewed (Open Question 1, resolved).
export default function CardCaptureQueue() {
    const { actorId } = useCurrentActor();

    const [queue, setQueue] = useState<CardCaptureRequest[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [accounts, setAccounts] = useState<LedgerAccount[]>([]);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [reviewAccountCode, setReviewAccountCode] = useState('');
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const [rows, activeAccounts] = await Promise.all([listCaptureQueue(), listActiveLedgerAccounts()]);
            setQueue(rows);
            setAccounts(activeAccounts);

            const entries = await Promise.all(
                rows.map(async (r) => {
                    try {
                        const url = await getReceiptSignedUrl(r.receiptUrl);
                        return [r.id, url] as const;
                    } catch {
                        return null;
                    }
                })
            );
            setThumbnails(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load the queue'));
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    function toggleExpand(request: CardCaptureRequest) {
        if (expandedId === request.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(request.id);
        setReviewAccountCode(request.ledgerAccountCode ?? '');
        setPostError(null);
        setRejectingId(null);
    }

    async function handlePost(requestId: string) {
        if (!actorId) return;
        setPosting(true);
        setPostError(null);
        try {
            await postCaptureRequest(requestId, reviewAccountCode, actorId);
            setExpandedId(null);
            await load();
        } catch (err) {
            setPostError(getErrorMessage(err, 'Could not post this request'));
        } finally {
            setPosting(false);
        }
    }

    async function handleReject(requestId: string) {
        if (!actorId) return;
        setRejecting(true);
        setRejectError(null);
        try {
            await rejectCaptureRequest(requestId, rejectReason, actorId);
            setExpandedId(null);
            setRejectingId(null);
            setRejectReason('');
            await load();
        } catch (err) {
            setRejectError(getErrorMessage(err, 'Could not reject this request'));
        } finally {
            setRejecting(false);
        }
    }

    const oldestAge = queue && queue.length > 0
        ? formatDistanceToNow(new Date(queue[0].submittedAt))
        : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Inbox className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">Capture Queue</h1>
                    <p className="text-sm text-text-secondary">Review and post submitted receipts.</p>
                </div>
            </header>

            {queue !== null && queue.length > 0 && (
                <div
                    className={clsx(
                        'px-4 py-2 rounded-lg text-sm font-medium border',
                        queue.length > 0 && 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    )}
                >
                    {queue.length} pending — oldest submitted {oldestAge} ago
                </div>
            )}

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {queue === null && !error && (
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

                {queue !== null && !error && queue.length === 0 && (
                    <div className="p-8 text-center text-text-secondary">
                        Queue is clear — nothing pending.
                    </div>
                )}

                {queue !== null && !error && queue.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-text-secondary">
                                <th className="px-4 py-3 font-medium">Receipt</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Age</th>
                                <th className="px-4 py-3 font-medium text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {queue.map(request => (
                                <Fragment key={request.id}>
                                    <tr
                                        key={request.id}
                                        onClick={() => toggleExpand(request)}
                                        className="border-b border-border last:border-0 cursor-pointer hover:bg-surface-elevated"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-10 rounded overflow-hidden bg-surface-elevated flex items-center justify-center">
                                                {thumbnails[request.id] ? (
                                                    <img src={thumbnails[request.id]} alt="Receipt" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-text-secondary" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-text-primary">{request.description}</td>
                                        <td className="px-4 py-3 text-text-primary">{formatZAR(request.amount)}</td>
                                        <td className="px-4 py-3 text-text-secondary">{format(new Date(request.purchaseDate), 'dd MMM yyyy')}</td>
                                        <td className="px-4 py-3 text-text-secondary">{formatDistanceToNow(new Date(request.submittedAt))}</td>
                                        <td className="px-4 py-3 text-right text-text-secondary">
                                            {expandedId === request.id ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                                        </td>
                                    </tr>
                                    {expandedId === request.id && (
                                        <tr key={`${request.id}-detail`} className="border-b border-border last:border-0">
                                            <td colSpan={6} className="px-4 py-4 bg-surface-elevated/50">
                                                <div className="flex gap-6">
                                                    {thumbnails[request.id] && (
                                                        <img
                                                            src={thumbnails[request.id]}
                                                            alt="Receipt full"
                                                            className="w-40 h-40 object-contain rounded-lg border border-border flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-text-secondary mb-1">GL / cost code</label>
                                                            <select
                                                                value={reviewAccountCode}
                                                                onChange={(e) => setReviewAccountCode(e.target.value)}
                                                                className="w-full max-w-xs bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                                                            >
                                                                <option value="">Select an account…</option>
                                                                {accounts.map((a) => (
                                                                    <option key={a.id} value={a.code}>
                                                                        {a.name} ({a.code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {postError && (
                                                            <p className="flex items-center gap-2 text-sm text-red-500">
                                                                <AlertCircle className="w-4 h-4" />
                                                                {postError}
                                                            </p>
                                                        )}

                                                        {rejectingId !== request.id ? (
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handlePost(request.id)}
                                                                    disabled={posting || !reviewAccountCode}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg"
                                                                >
                                                                    {posting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                                    Post
                                                                </button>
                                                                <button
                                                                    onClick={() => { setRejectingId(request.id); setRejectError(null); }}
                                                                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <select
                                                                    value={rejectReason}
                                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                                    className="w-full max-w-xs bg-surface border border-border rounded-lg px-3 py-2 text-text-primary"
                                                                >
                                                                    <option value="">Select a reason…</option>
                                                                    {REJECTION_REASONS.map((r) => (
                                                                        <option key={r} value={r}>{r}</option>
                                                                    ))}
                                                                </select>
                                                                {rejectError && (
                                                                    <p className="flex items-center gap-2 text-sm text-red-500">
                                                                        <AlertCircle className="w-4 h-4" />
                                                                        {rejectError}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setRejectingId(null)}
                                                                        className="text-text-secondary hover:text-text-primary text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(request.id)}
                                                                        disabled={rejecting || !rejectReason}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg"
                                                                    >
                                                                        {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                                        Confirm Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
