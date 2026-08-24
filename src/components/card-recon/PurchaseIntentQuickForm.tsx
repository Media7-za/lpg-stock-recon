import { useState, useEffect } from 'react';
import { Plus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
    LedgerAccount,
    listActiveLedgerAccounts,
    createPurchaseIntent,
} from '../../lib/cardReconService';
import { useCurrentActor } from '../../hooks/useCurrentActor';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

// Persistent FAB + quick-log form for Slice A0 (Purchase Intent).
// docs/Card-Recon/UX_Blueprint.md — Step A0.1/A0.2, Component Specification.
// Non-blocking by design: this form has no validation that can prevent
// or delay a purchase (Slice Brief Section D) -- it only logs intent.
export default function PurchaseIntentQuickForm() {
    const { actorId } = useCurrentActor();

    const [open, setOpen] = useState(false);
    const [accounts, setAccounts] = useState<LedgerAccount[] | null>(null);
    const [accountsError, setAccountsError] = useState<string | null>(null);

    const [description, setDescription] = useState('');
    const [ledgerAccountCode, setLedgerAccountCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [justLogged, setJustLogged] = useState(false);

    useEffect(() => {
        if (!open || accounts !== null) return;
        listActiveLedgerAccounts()
            .then(setAccounts)
            .catch((err) => setAccountsError(getErrorMessage(err, 'Could not load ledger accounts')));
    }, [open, accounts]);

    function resetAndClose() {
        setOpen(false);
        setDescription('');
        setLedgerAccountCode('');
        setSubmitError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!actorId) {
            setSubmitError('Could not identify the current user');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        try {
            await createPurchaseIntent(description, ledgerAccountCode, actorId);
            setJustLogged(true);
            resetAndClose();
            setTimeout(() => setJustLogged(false), 3000);
        } catch (err) {
            setSubmitError(getErrorMessage(err, 'Could not log this request'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Quick Request
            </button>

            {justLogged && (
                <div className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-sm font-medium rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Logged
                </div>
            )}

            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-md bg-surface border border-border rounded-xl p-6 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-text-primary">Quick Request</h2>
                            <button
                                type="button"
                                onClick={resetAndClose}
                                className="text-text-secondary hover:text-text-primary"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this for? e.g. litre of oil for the vehicle"
                                maxLength={200}
                                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Ledger account
                            </label>
                            {accountsError && (
                                <p className="flex items-center gap-2 text-sm text-red-500 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {accountsError}
                                </p>
                            )}
                            {accounts !== null && accounts.length === 0 && !accountsError && (
                                <p className="text-sm text-text-secondary">
                                    No active ledger accounts — ask an admin to create one first.
                                </p>
                            )}
                            {accounts !== null && accounts.length > 0 && (
                                <select
                                    value={ledgerAccountCode}
                                    onChange={(e) => setLedgerAccountCode(e.target.value)}
                                    className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                                >
                                    <option value="">Select an account…</option>
                                    {accounts.map((a) => (
                                        <option key={a.id} value={a.code}>
                                            {a.name} ({a.code})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {submitError && (
                            <p className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="w-4 h-4" />
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !description.trim() || !ledgerAccountCode}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
