import { useEffect, useRef, useState } from 'react';
import { searchCustomers } from '../lib/paymentCollectionsRepository';
import { CustomerSearchResult } from '../types/paymentCollections';
import { usePaymentCollectionsStore } from '../state/PaymentCollectionsProvider';

const inputClass =
  'w-full bg-background border border-border rounded-md text-text-primary px-3 py-2 text-sm outline-none focus-visible:border-[#4A90A4]';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix — the API only wants the payload.
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PaymentAdminForm({ onClose }: { onClose: () => void }) {
  const { addPayment } = usePaymentCollectionsStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [selected, setSelected] = useState<CustomerSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected || query.trim().length < 2) {
      setResults([]);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        setResults(await searchCustomers(query.trim()));
      } catch {
        setResults([]);
      }
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, selected]);

  const submit = async () => {
    if (!selected || !amount) return;
    setSubmitting(true);
    setError(null);
    try {
      const fileInput = file ? { base64: await fileToBase64(file), name: file.name, contentType: file.type } : undefined;
      await addPayment({ commercialCustomerId: selected.id, amountDue: Number(amount), file: fileInput });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the outstanding payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-3">
        Add outstanding payment
      </div>

      {!selected ? (
        <>
          <label className={labelClass}>Customer</label>
          <input
            className={inputClass}
            placeholder="Search by customer name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {results.length > 0 && (
            <div className="mt-2 border border-border rounded-md overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setQuery(r.customerName);
                    setResults([]);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated border-b border-border last:border-b-0"
                >
                  {r.customerName}
                  {r.contactPhone && <span className="text-text-secondary text-xs ml-2">{r.contactPhone}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between bg-surface-elevated border border-border rounded-md px-3 py-2 mb-1">
          <span className="text-sm text-text-primary font-semibold">{selected.customerName}</span>
          <button
            onClick={() => {
              setSelected(null);
              setQuery('');
            }}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            Change
          </button>
        </div>
      )}

      <label className={`${labelClass} mt-3.5`}>Amount due (R)</label>
      <input
        className={inputClass}
        type="number"
        min="0"
        step="0.01"
        placeholder="e.g. 4250.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label className={`${labelClass} mt-3.5`}>Statement of account (optional)</label>
      <input
        className={`${inputClass} file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-surface-elevated file:text-text-primary file:text-xs`}
        type="file"
        accept="application/pdf,image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <div className="text-[11px] text-text-secondary mt-1.5">
        Uploaded so operators can pull it back up to send the customer when following up.
      </div>

      {error && <div className="text-xs text-amber-400 mt-3">{error}</div>}

      <div className="flex gap-2 mt-4">
        <button
          onClick={submit}
          disabled={!selected || !amount || submitting}
          className="bg-[#4A90A4] text-[#0E1113] rounded-md px-4 py-2 font-semibold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="bg-transparent text-text-secondary border border-border rounded-md px-4 py-2 font-semibold text-sm cursor-pointer hover:border-text-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
