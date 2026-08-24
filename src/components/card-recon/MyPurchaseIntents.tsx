import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PurchaseIntent, listMyPurchaseIntents } from '../../lib/cardReconService';
import { useCurrentActor } from '../../hooks/useCurrentActor';
import StatusPill from './StatusPill';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

// docs/Card-Recon/UX_Blueprint.md — "My Intents" screen (Slice A0).
// Closes the visibility gap Slice A0 otherwise leaves: cardholders can
// see their own intent history, including ones that go ABANDONED.
export default function MyPurchaseIntents() {
    const { actorId } = useCurrentActor();
    const [intents, setIntents] = useState<PurchaseIntent[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!actorId) return;
        setError(null);
        try {
            const rows = await listMyPurchaseIntents(actorId);
            setIntents(rows);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load your requests'));
        }
    }, [actorId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">My Intents</h1>
                    <p className="text-sm text-text-secondary">
                        Purchase intents you've logged with Quick Request.
                    </p>
                </div>
            </header>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {intents === null && !error && (
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

                {intents !== null && !error && intents.length === 0 && (
                    <div className="p-8 text-center text-text-secondary">
                        No intents logged yet — tap + Quick Request before your next purchase.
                    </div>
                )}

                {intents !== null && !error && intents.length > 0 && (
                    <ul className="divide-y divide-border">
                        {intents.map(intent => (
                            <li key={intent.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-text-primary truncate">{intent.description}</p>
                                    <p className="text-xs text-text-secondary">
                                        {intent.ledgerAccountCode} · {format(new Date(intent.requestedAt), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <StatusPill kind="purchaseIntent" status={intent.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
