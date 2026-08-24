import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
    CardReconSession,
    CardStatementLine,
    CardReconMatch,
    CardLedgerEntry,
    getCardReconSession,
    listSessionStatementLines,
    listSessionMatches,
    listUnreconciledLedgerEntries,
    getCardLedgerEntriesByIds,
    getReceiptSignedUrl,
    confirmManualMatch,
    cancelException,
    canFinalize as checkCanFinalize,
    finalizeSession,
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

const CANCEL_REASONS = [
    'Bank fee, no receipt expected',
    'Duplicate charge',
    'Confirmed error, written off',
    'Other',
];

// docs/Card-Recon/UX_Blueprint.md — Card Recon Workspace (Slice B),
// Steps B.2-B.5.
export default function CardReconWorkspace() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { actorId } = useCurrentActor();

    const [session, setSession] = useState<CardReconSession | null>(null);
    const [lines, setLines] = useState<CardStatementLine[] | null>(null);
    const [matches, setMatches] = useState<CardReconMatch[]>([]);
    const [matchedEntries, setMatchedEntries] = useState<Record<string, CardLedgerEntry>>({});
    const [candidateEntries, setCandidateEntries] = useState<CardLedgerEntry[]>([]);
    const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
    const [canFinalizeFlag, setCanFinalizeFlag] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
    const [matchError, setMatchError] = useState<string | null>(null);
    const [matchErrorLineId, setMatchErrorLineId] = useState<string | null>(null);
    const [matchingLineId, setMatchingLineId] = useState<string | null>(null);

    const [cancelTarget, setCancelTarget] = useState<{ id: string; type: 'statementLine' | 'ledgerEntry' } | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [finalizeError, setFinalizeError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!sessionId) return;
        setError(null);
        try {
            const [sessionData, lineData, matchData, candidates, finalizable] = await Promise.all([
                getCardReconSession(sessionId),
                listSessionStatementLines(sessionId),
                listSessionMatches(sessionId),
                listUnreconciledLedgerEntries(),
                checkCanFinalize(sessionId),
            ]);
            setSession(sessionData);
            setLines(lineData);
            setMatches(matchData);
            setCandidateEntries(candidates);
            setCanFinalizeFlag(finalizable);

            const matchedEntryIds = matchData.map((m) => m.ledgerEntryId);
            const matchedEntryRows = await getCardLedgerEntriesByIds(matchedEntryIds);
            setMatchedEntries(Object.fromEntries(matchedEntryRows.map((e) => [e.id, e])));

            const allEntries = [...matchedEntryRows, ...candidates];
            const entries = await Promise.all(
                allEntries.map(async (e) => {
                    try {
                        return [e.id, await getReceiptSignedUrl(e.receiptUrl)] as const;
                    } catch {
                        return null;
                    }
                })
            );
            setThumbnails(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load this reconciliation session'));
        }
    }, [sessionId]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleConfirmMatch(lineId: string) {
        if (!sessionId || !actorId) return;
        const entryId = matchSelections[lineId];
        if (!entryId) return;

        setMatchingLineId(lineId);
        setMatchError(null);
        setMatchErrorLineId(null);
        try {
            await confirmManualMatch(sessionId, lineId, entryId, actorId);
            await load();
        } catch (err) {
            setMatchError(getErrorMessage(err, 'Could not confirm this match'));
            setMatchErrorLineId(lineId);
        } finally {
            setMatchingLineId(null);
        }
    }

    async function handleCancelException() {
        if (!sessionId || !actorId || !cancelTarget) return;
        setCancelling(true);
        setCancelError(null);
        try {
            await cancelException(sessionId, cancelTarget.id, cancelTarget.type, cancelReason, actorId);
            setCancelTarget(null);
            setCancelReason('');
            await load();
        } catch (err) {
            setCancelError(getErrorMessage(err, 'Could not cancel this exception'));
        } finally {
            setCancelling(false);
        }
    }

    async function handleFinalize() {
        if (!sessionId || !actorId) return;
        setFinalizing(true);
        setFinalizeError(null);
        try {
            await finalizeSession(sessionId, actorId);
            setShowFinalizeConfirm(false);
            await load();
        } catch (err) {
            setFinalizeError(getErrorMessage(err, 'Could not finalize this session'));
        } finally {
            setFinalizing(false);
        }
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-text-secondary">{error}</p>
                <button onClick={load} className="text-sm text-blue-500 hover:text-blue-400 font-medium">Retry</button>
            </div>
        );
    }

    if (!session || lines === null) {
        return (
            <div className="max-w-4xl mx-auto p-8 space-y-3">
                {[0, 1, 2].map(i => <div key={i} className="h-14 bg-surface-elevated rounded animate-pulse" />)}
            </div>
        );
    }

    const matchedLines = lines.filter((l) => l.status === 'MATCHED');
    const needsReviewLines = lines.filter((l) => l.status === 'UNMATCHED' || l.status === 'EXCEPTION_UNRESOLVED');
    const cancelledLines = lines.filter((l) => l.status === 'EXCEPTION_CANCELLED');
    const isReadOnly = session.status === 'FINALIZED';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">{session.statementFilename}</h1>
                    <p className="text-sm text-text-secondary">
                        Imported {format(new Date(session.importedAt), 'dd MMM yyyy')}
                    </p>
                </div>
                <StatusPill kind="reconSession" status={session.status} />
            </header>

            {matchedLines.length > 0 && (
                <section className="bg-surface border border-border rounded-xl overflow-hidden">
                    <h2 className="px-4 py-3 border-b border-border font-medium text-text-primary">
                        Matched automatically ({matchedLines.length})
                    </h2>
                    <table className="w-full text-sm">
                        <tbody>
                            {matchedLines.map((line) => {
                                const match = matches.find((m) => m.statementLineId === line.id);
                                const entry = match ? matchedEntries[match.ledgerEntryId] : undefined;
                                return (
                                    <tr key={line.id} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 text-text-secondary">{format(new Date(line.date), 'dd MMM yyyy')}</td>
                                        <td className="px-4 py-3 text-text-primary">{line.description}</td>
                                        <td className="px-4 py-3 text-text-primary">{formatZAR(line.amount)}</td>
                                        <td className="px-4 py-3 text-text-secondary">
                                            {entry ? `↔ ${entry.reference}` : ''}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {match && <StatusPill kind="matchMethod" status={match.matchMethod} />}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            )}

            <section className="bg-surface border border-border rounded-xl overflow-hidden">
                <h2 className="px-4 py-3 border-b border-border font-medium text-text-primary">
                    Needs review — bank lines ({needsReviewLines.length})
                </h2>
                {needsReviewLines.length === 0 ? (
                    <div className="p-6 text-center text-text-secondary">Everything matched automatically.</div>
                ) : (
                    <ul className="divide-y divide-border">
                        {needsReviewLines.map((line) => (
                            <li key={line.id} className="px-4 py-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-text-primary">{line.description}</p>
                                        <p className="text-xs text-text-secondary">
                                            {formatZAR(line.amount)} · {format(new Date(line.date), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                    <StatusPill kind="statementLine" status={line.status} />
                                </div>

                                {!isReadOnly && cancelTarget?.id !== line.id && (
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={matchSelections[line.id] ?? ''}
                                            onChange={(e) => setMatchSelections((s) => ({ ...s, [line.id]: e.target.value }))}
                                            className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
                                        >
                                            <option value="">Match to a ledger entry…</option>
                                            {candidateEntries.map((entry) => (
                                                <option key={entry.id} value={entry.id}>
                                                    {entry.reference} — {formatZAR(entry.amount)} ({format(new Date(entry.date), 'dd MMM')})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleConfirmMatch(line.id)}
                                            disabled={!matchSelections[line.id] || matchingLineId === line.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg"
                                        >
                                            {matchingLineId === line.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => { setCancelTarget({ id: line.id, type: 'statementLine' }); setCancelError(null); }}
                                            className="text-red-500 hover:text-red-400 text-sm font-medium whitespace-nowrap"
                                        >
                                            Cancel Exception
                                        </button>
                                    </div>
                                )}

                                {matchError && matchErrorLineId === line.id && (
                                    <p className="flex items-center gap-2 text-sm text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        {matchError}
                                    </p>
                                )}

                                {cancelTarget?.id === line.id && (
                                    <CancelExceptionForm
                                        reason={cancelReason}
                                        setReason={setCancelReason}
                                        onCancel={() => { setCancelTarget(null); setCancelReason(''); setCancelError(null); }}
                                        onConfirm={handleCancelException}
                                        cancelling={cancelling}
                                        error={cancelError}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {candidateEntries.length > 0 && (
                <section className="bg-surface border border-border rounded-xl overflow-hidden">
                    <h2 className="px-4 py-3 border-b border-border font-medium text-text-primary">
                        Needs review — ledger entries ({candidateEntries.length})
                    </h2>
                    <ul className="divide-y divide-border">
                        {candidateEntries.map((entry) => (
                            <li key={entry.id} className="px-4 py-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-surface-elevated flex items-center justify-center">
                                        {thumbnails[entry.id] ? (
                                            <img src={thumbnails[entry.id]} alt="Receipt" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-text-secondary" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-text-primary">{entry.reference}</p>
                                        <p className="text-xs text-text-secondary">
                                            {formatZAR(entry.amount)} · {format(new Date(entry.date), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                    <StatusPill kind="ledgerEntryReconciliation" status={entry.reconciliationStatus} />
                                </div>

                                {!isReadOnly && cancelTarget?.id !== entry.id && (
                                    <button
                                        onClick={() => { setCancelTarget({ id: entry.id, type: 'ledgerEntry' }); setCancelError(null); }}
                                        className="text-red-500 hover:text-red-400 text-sm font-medium"
                                    >
                                        Cancel Exception
                                    </button>
                                )}

                                {cancelTarget?.id === entry.id && (
                                    <CancelExceptionForm
                                        reason={cancelReason}
                                        setReason={setCancelReason}
                                        onCancel={() => { setCancelTarget(null); setCancelReason(''); setCancelError(null); }}
                                        onConfirm={handleCancelException}
                                        cancelling={cancelling}
                                        error={cancelError}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {cancelledLines.length > 0 && (
                <section className="bg-surface border border-border rounded-xl overflow-hidden">
                    <h2 className="px-4 py-3 border-b border-border font-medium text-text-primary">
                        Cancelled ({cancelledLines.length})
                    </h2>
                    <ul className="divide-y divide-border">
                        {cancelledLines.map((line) => (
                            <li key={line.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-text-primary">{line.description}</p>
                                    <p className="text-xs text-text-secondary">
                                        {formatZAR(line.amount)} · {line.cancelReason}
                                    </p>
                                </div>
                                <StatusPill kind="statementLine" status={line.status} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {!isReadOnly && (
                <div className="space-y-3">
                    {!canFinalizeFlag && (
                        <p className="text-sm text-text-secondary">
                            {needsReviewLines.length} item{needsReviewLines.length === 1 ? '' : 's'} still need
                            {needsReviewLines.length === 1 ? 's' : ''} to be matched or cancelled before finalizing.
                        </p>
                    )}
                    {finalizeError && (
                        <p className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {finalizeError}
                        </p>
                    )}
                    {!showFinalizeConfirm ? (
                        <button
                            onClick={() => setShowFinalizeConfirm(true)}
                            disabled={!canFinalizeFlag}
                            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg"
                        >
                            Finalize Session
                        </button>
                    ) : (
                        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                            <p className="text-text-primary text-sm">
                                Finalize this period?{cancelledLines.length > 0 && ` ${cancelledLines.length} item${cancelledLines.length === 1 ? ' was' : 's were'} cancelled with a reason.`} This cannot be undone.
                            </p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowFinalizeConfirm(false)} className="text-text-secondary hover:text-text-primary text-sm">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    disabled={finalizing}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
                                >
                                    {finalizing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Finalize
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isReadOnly && (
                <div className="flex items-center gap-2 text-sm text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    Finalized {session.finalizedAt && format(new Date(session.finalizedAt), 'dd MMM yyyy')}
                </div>
            )}
        </div>
    );
}

function CancelExceptionForm({
    reason,
    setReason,
    onCancel,
    onConfirm,
    cancelling,
    error,
}: {
    reason: string;
    setReason: (v: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
    cancelling: boolean;
    error: string | null;
}) {
    return (
        <div className="space-y-2 bg-surface-elevated rounded-lg p-3">
            <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
            >
                <option value="">Select a reason…</option>
                {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            {error && (
                <p className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
            <div className="flex items-center gap-3">
                <button onClick={onCancel} className="text-text-secondary hover:text-text-primary text-sm">
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={!reason || cancelling}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg"
                >
                    {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Cancel
                </button>
            </div>
        </div>
    );
}
