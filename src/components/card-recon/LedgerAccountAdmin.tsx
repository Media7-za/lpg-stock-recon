import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, Loader2, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import {
    LedgerAccount,
    listAllLedgerAccounts,
    createLedgerAccount,
    deactivateLedgerAccount,
} from '../../lib/cardReconService';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

export default function LedgerAccountAdmin() {
    const [accounts, setAccounts] = useState<LedgerAccount[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);
    const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

    const loadAccounts = useCallback(async () => {
        setLoadError(null);
        try {
            const rows = await listAllLedgerAccounts();
            setAccounts(rows);
        } catch (err) {
            setLoadError(getErrorMessage(err, 'Could not load ledger accounts'));
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const activeCount = accounts?.filter(a => a.active).length ?? 0;

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateError(null);

        if (!newCode.trim() || !newName.trim()) {
            setCreateError('Code and name are both required');
            return;
        }

        setCreating(true);
        try {
            await createLedgerAccount(newCode, newName);
            setNewCode('');
            setNewName('');
            setShowCreateForm(false);
            await loadAccounts();
        } catch (err) {
            setCreateError(getErrorMessage(err, 'Could not create account'));
        } finally {
            setCreating(false);
        }
    }

    async function handleDeactivate(id: string) {
        setDeactivatingId(id);
        try {
            await deactivateLedgerAccount(id);
            setConfirmDeactivateId(null);
            await loadAccounts();
        } catch (err) {
            setLoadError(getErrorMessage(err, 'Could not deactivate account'));
        } finally {
            setDeactivatingId(null);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Ledger Accounts</h1>
                        <p className="text-sm text-text-secondary">
                            GL/cost code reference list for card purchase requests.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Account
                </button>
            </header>

            {showCreateForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-surface border border-border rounded-xl p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-text-primary">New Ledger Account</h2>
                        <button
                            type="button"
                            onClick={() => { setShowCreateForm(false); setCreateError(null); }}
                            className="text-text-secondary hover:text-text-primary"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Code</label>
                        <input
                            type="text"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="e.g. FUEL"
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Fuel & Vehicle Costs"
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        />
                    </div>

                    {createError && (
                        <p className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            {createError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={creating || !newCode.trim() || !newName.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                    </button>
                </form>
            )}

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {accounts === null && !loadError && (
                    <div className="p-8 space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-10 bg-surface-elevated rounded animate-pulse" />
                        ))}
                    </div>
                )}

                {loadError && (
                    <div className="p-8 text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                        <p className="text-text-secondary">{loadError}</p>
                        <button
                            onClick={loadAccounts}
                            className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {accounts !== null && !loadError && accounts.length === 0 && (
                    <div className="p-8 text-center text-text-secondary">
                        No ledger accounts yet — create one to get started.
                    </div>
                )}

                {accounts !== null && !loadError && accounts.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-text-secondary">
                                <th className="px-4 py-3 font-medium">Code</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 font-mono text-text-primary">{account.code}</td>
                                    <td className="px-4 py-3 text-text-primary">{account.name}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={clsx(
                                                'inline-block px-2 py-0.5 rounded text-xs font-semibold',
                                                account.active
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-surface-elevated text-text-secondary'
                                            )}
                                        >
                                            {account.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">
                                        {format(new Date(account.createdAt), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {account.active && confirmDeactivateId !== account.id && (
                                            <button
                                                onClick={() => setConfirmDeactivateId(account.id)}
                                                className="text-text-secondary hover:text-red-500 text-sm font-medium"
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                        {account.active && confirmDeactivateId === account.id && (
                                            <div className="flex items-center justify-end gap-2">
                                                {activeCount === 1 && (
                                                    <span className="text-xs text-amber-500">
                                                        Only active account
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDeactivateId(null)}
                                                    className="text-text-secondary hover:text-text-primary text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(account.id)}
                                                    disabled={deactivatingId === account.id}
                                                    className="flex items-center gap-1 text-red-500 hover:text-red-400 text-sm font-medium disabled:opacity-50"
                                                >
                                                    {deactivatingId === account.id && (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    )}
                                                    Confirm
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
