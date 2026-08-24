import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, FileUp, Loader2, AlertCircle, CheckCircle2, X, FileText } from 'lucide-react';
import {
    LedgerAccount,
    listActiveLedgerAccounts,
    PurchaseIntent,
    listMyPurchaseIntents,
    submitCaptureRequest,
} from '../../lib/cardReconService';
import { processReceiptFile, ProcessedReceipt } from '../../lib/receiptProcessing';
import { useCurrentActor } from '../../hooks/useCurrentActor';

function getErrorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
}

function todayForDateInput(): string {
    return new Date().toISOString().slice(0, 10);
}

// docs/Card-Recon/UX_Blueprint.md — Capture Request Form (Slice A),
// Steps A.1-A.3. FR-CCR-RECEIPT-001 governs the receipt attach/process
// flow specifically.
export default function CardCaptureForm() {
    const { actorId } = useCurrentActor();

    const photoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [accounts, setAccounts] = useState<LedgerAccount[] | null>(null);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [openIntents, setOpenIntents] = useState<PurchaseIntent[] | null>(null);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(todayForDateInput());
    const [ledgerAccountCode, setLedgerAccountCode] = useState('');
    const [intentId, setIntentId] = useState('');

    const [processing, setProcessing] = useState(false);
    const [processed, setProcessed] = useState<ProcessedReceipt | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string | null>(null);
    const [attachError, setAttachError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [justSubmitted, setJustSubmitted] = useState(false);

    useEffect(() => {
        listActiveLedgerAccounts()
            .then(setAccounts)
            .catch((err) => setAccountsError(getErrorMessage(err, 'Could not load ledger accounts')));
        if (actorId) {
            listMyPurchaseIntents(actorId)
                .then((rows) => setOpenIntents(rows.filter((r) => r.status === 'OPEN')))
                .catch(() => setOpenIntents([]));
        }
    }, [actorId]);

    useEffect(() => {
        // Revoke the previous preview URL whenever it changes/unmounts, so
        // object URLs don't leak.
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileSelected = useCallback(async (file: File | undefined) => {
        if (!file) return;
        setAttachError(null);
        setProcessed(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);

        setProcessing(true);
        try {
            const result = await processReceiptFile(file);
            setProcessed(result);
            if (result.mimeType === 'application/pdf') {
                setPreviewUrl(null);
                setPreviewFileName(file.name);
            } else {
                setPreviewUrl(URL.createObjectURL(result.blob));
                setPreviewFileName(null);
            }
        } catch (err) {
            setAttachError(getErrorMessage(err, "Couldn't read this file — try another photo."));
        } finally {
            setProcessing(false);
        }
    }, [previewUrl]);

    function handleIntentSelected(id: string) {
        setIntentId(id);
        const intent = openIntents?.find((i) => i.id === id);
        if (intent) {
            setDescription(intent.description);
            setLedgerAccountCode(intent.ledgerAccountCode);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!processed || !actorId) return;

        setSubmitting(true);
        setSubmitError(null);
        try {
            await submitCaptureRequest(
                {
                    description,
                    amount: Number(amount),
                    purchaseDate,
                    ledgerAccountCode: ledgerAccountCode || undefined,
                },
                processed,
                actorId,
                intentId || undefined
            );

            setJustSubmitted(true);
            setTimeout(() => setJustSubmitted(false), 3000);
            setDescription('');
            setAmount('');
            setPurchaseDate(todayForDateInput());
            setLedgerAccountCode('');
            setIntentId('');
            setProcessed(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewFileName(null);
            if (photoInputRef.current) photoInputRef.current.value = '';
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            // Every entered field — description, amount, date, intent link,
            // and the already-processed file — is retained for retry
            // (FR-CCR-RECEIPT-001 atomicity requirement).
            setSubmitError(getErrorMessage(err, "Couldn't save your receipt — check your connection"));
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit = !!processed && !!description.trim() && !!amount && Number(amount) > 0 && !!purchaseDate;

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <header>
                <h1 className="text-xl font-semibold text-text-primary">Capture Request</h1>
                <p className="text-sm text-text-secondary">Attach your receipt and submit for posting.</p>
            </header>

            {justSubmitted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-sm font-medium rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Submitted — awaiting batch
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Receipt</label>

                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/heic,image/heif,application/pdf"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/heic,image/heif,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    />

                    {!processed && !processing && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => photoInputRef.current?.click()}
                                className="flex-1 flex flex-col items-center gap-2 py-6 border border-dashed border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-blue-500/50 transition-colors"
                            >
                                <Camera className="w-6 h-6" />
                                <span className="text-sm font-medium">Take Photo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex flex-col items-center gap-2 py-6 border border-dashed border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-blue-500/50 transition-colors"
                            >
                                <FileUp className="w-6 h-6" />
                                <span className="text-sm font-medium">Choose File</span>
                            </button>
                        </div>
                    )}

                    {processing && (
                        <div className="flex items-center justify-center gap-2 py-6 text-text-secondary">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Processing receipt…</span>
                        </div>
                    )}

                    {processed && !processing && (
                        <div className="relative">
                            {previewUrl && (
                                <img src={previewUrl} alt="Receipt preview" className="w-full max-h-64 object-contain rounded-lg border border-border" />
                            )}
                            {previewFileName && (
                                <div className="flex items-center gap-2 py-6 border border-border rounded-lg justify-center text-text-secondary">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm">{previewFileName}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setProcessed(null);
                                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                                    setPreviewUrl(null);
                                    setPreviewFileName(null);
                                    if (photoInputRef.current) photoInputRef.current.value = '';
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {attachError && (
                        <p className="flex items-center gap-2 text-sm text-red-500 mt-2">
                            <AlertCircle className="w-4 h-4" />
                            {attachError}
                        </p>
                    )}
                    {!processed && !attachError && (
                        <p className="text-xs text-text-secondary mt-2">
                            Attach your receipt to continue
                        </p>
                    )}
                </div>

                {openIntents !== null && openIntents.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Link to a request?</label>
                        <select
                            value={intentId}
                            onChange={(e) => handleIntentSelected(e.target.value)}
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        >
                            <option value="">None</option>
                            {openIntents.map((intent) => (
                                <option key={intent.id} value={intent.id}>
                                    {intent.description}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's this for? e.g. litre of oil for the vehicle"
                        maxLength={200}
                        className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                        <input
                            type="date"
                            value={purchaseDate}
                            max={todayForDateInput()}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Ledger account</label>
                    {accountsError && (
                        <p className="flex items-center gap-2 text-sm text-red-500 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            {accountsError}
                        </p>
                    )}
                    {accounts !== null && (
                        <select
                            value={ledgerAccountCode}
                            onChange={(e) => setLedgerAccountCode(e.target.value)}
                            className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary"
                        >
                            <option value="">Select an account… (optional — clerk can confirm)</option>
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
                    disabled={!canSubmit || submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit
                </button>
            </form>
        </div>
    );
}
