import { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Loader2, ShieldAlert, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { submitReceiptReview } from '../../lib/receiptExtractionService';
import { ReceiptExtractedData, ReceiptExtraction, ReceiptLineItem } from '../../types';

interface Props {
  extraction: ReceiptExtraction;
  onBack: () => void;
  onReviewed: (extraction: ReceiptExtraction) => void;
  reviewedBy?: string;
}

const REASON_CODES = [
  { code: 'ILLEGIBLE_HANDWRITING', label: 'Illegible Handwriting' },
  { code: 'QTY_MISMATCH', label: 'Quantity Mismatch vs Total' },
  { code: 'WRONG_DOCUMENT_TYPE', label: 'Misidentified Document Type' },
  { code: 'DAMAGED_DOCUMENT', label: 'Damaged / Partial Document' },
  { code: 'DUPLICATE_SUBMISSION', label: 'Duplicate Submission' },
  { code: 'OTHER', label: 'Other Manual Correction' },
];

const CONFIDENCE_THRESHOLD = 80;

export default function ReceiptReviewScreen({ extraction, onBack, onReviewed, reviewedBy }: Props) {
  const [data, setData] = useState<ReceiptExtractedData>(extraction.extracted_data);
  const [reasonCode, setReasonCode] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState<'confirm' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(extraction.extracted_data),
    [data, extraction.extracted_data]
  );

  const isLowConfidence = extraction.system_confidence < CONFIDENCE_THRESHOLD;
  const requiresReason = isDirty || isLowConfidence;

  const shippedSum = useMemo(
    () => data.lineItems.reduce((acc, item) => acc + (item.shippedQty ?? 0), 0),
    [data.lineItems]
  );
  const totalMismatch = data.statedTotal != null && Math.abs(shippedSum - data.statedTotal) > 0.01;

  const updateField = <K extends keyof ReceiptExtractedData>(key: K, value: ReceiptExtractedData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateLineItem = (index: number, patch: Partial<ReceiptLineItem>) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeLineItem = (index: number) => {
    setData((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (decision: 'ACCEPT' | 'MODIFY' | 'REJECT') => {
    if (requiresReason && !reasonCode) {
      setError('Select a reason code before submitting — this extraction needs a human decision on record.');
      return;
    }

    setSubmitting(decision === 'REJECT' ? 'reject' : 'confirm');
    setError(null);

    try {
      const updated = await submitReceiptReview({
        id: extraction.id,
        decision: decision === 'ACCEPT' && isDirty ? 'MODIFY' : decision,
        reviewedData: isDirty ? data : undefined,
        reasonCodes: reasonCode ? [reasonCode] : undefined,
        notes: notes || undefined,
        reviewedBy,
      });
      onReviewed(updated);
    } catch (err) {
      console.error('[ReceiptReviewScreen] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 flex items-center relative">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto absolute left-1/2 -translate-x-1/2">Review Extraction</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex gap-4">
          <img
            src={extraction.image_url}
            alt="Source document"
            className="w-32 h-40 object-cover rounded-xl border border-gray-200 flex-shrink-0"
          />
          <div className="flex-1 space-y-2">
            <div className={clsx(
              'p-3 rounded-xl border flex items-start gap-2 text-sm',
              isLowConfidence ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            )}>
              {isLowConfidence ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>
                <strong>{extraction.system_confidence}% model confidence.</strong>{' '}
                {isLowConfidence
                  ? 'Below the review threshold — check every field carefully before confirming.'
                  : 'Above threshold, but still worth a quick check.'}
              </span>
            </div>
            {data.lowConfidenceFields.length > 0 && (
              <p className="text-xs text-text-secondary">
                Model flagged as uncertain: <span className="font-mono">{data.lowConfidenceFields.join(', ')}</span>
              </p>
            )}
          </div>
        </div>

        {totalMismatch && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Total mismatch:</strong> line items sum to {shippedSum}, but the document states a total of{' '}
              {data.statedTotal}. Fix the line items or confirm this is expected before submitting.
            </p>
          </div>
        )}

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Document Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Document Type">
              <select
                value={data.documentType}
                onChange={(e) => updateField('documentType', e.target.value as ReceiptExtractedData['documentType'])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="delivery_note">Delivery Note</option>
                <option value="cylinder_returns">Cylinder Returns</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Document Number">
              <input
                value={data.documentNumber ?? ''}
                onChange={(e) => updateField('documentNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Supplier">
              <input
                value={data.supplier ?? ''}
                onChange={(e) => updateField('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Document Date">
              <input
                value={data.documentDate ?? ''}
                onChange={(e) => updateField('documentDate', e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Customer Name">
              <input
                value={data.customerName ?? ''}
                onChange={(e) => updateField('customerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
            <Field label="Customer Number">
              <input
                value={data.customerNumber ?? ''}
                onChange={(e) => updateField('customerNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Line Items</h3>
            <span className="text-xs text-text-secondary">Sum: {shippedSum}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {data.lineItems.map((item, i) => (
              <div
                key={i}
                className={clsx(
                  'p-3 grid grid-cols-[1fr_80px_80px_60px_auto] gap-2 items-center',
                  item.confidence < CONFIDENCE_THRESHOLD && 'bg-amber-50/50'
                )}
              >
                <input
                  value={item.description}
                  onChange={(e) => updateLineItem(i, { description: e.target.value })}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm min-w-0"
                />
                <input
                  type="number"
                  value={item.orderedQty ?? ''}
                  onChange={(e) => updateLineItem(i, { orderedQty: e.target.value === '' ? null : Number(e.target.value) })}
                  placeholder="Ordered"
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="number"
                  value={item.shippedQty ?? ''}
                  onChange={(e) => updateLineItem(i, { shippedQty: e.target.value === '' ? null : Number(e.target.value) })}
                  placeholder="Shipped"
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold"
                />
                <span className="text-xs text-text-secondary text-center">
                  {item.confidence < CONFIDENCE_THRESHOLD ? (
                    <span className="text-amber-600 font-bold">{item.confidence}%</span>
                  ) : (
                    `${item.confidence}%`
                  )}
                </span>
                <button onClick={() => removeLineItem(i)} className="p-1.5 text-gray-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {data.lineItems.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No line items extracted.</div>
            )}
          </div>
        </section>

        {data.handwrittenNotes.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">Handwritten Notes</h3>
            <ul className="text-sm text-text-secondary list-disc list-inside space-y-1">
              {data.handwrittenNotes.map((note, i) => <li key={i}>{note}</li>)}
            </ul>
          </section>
        )}

        {requiresReason && (
          <section className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Reason Required
            </h3>
            <p className="text-xs text-text-secondary">
              {isDirty ? 'You edited the extracted data.' : `Confidence is below ${CONFIDENCE_THRESHOLD}%.`} Record why before this counts.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REASON_CODES.map((reason) => (
                <button
                  key={reason.code}
                  onClick={() => setReasonCode(reason.code)}
                  className={clsx(
                    'px-3 py-2 rounded-lg border text-left text-xs font-bold transition-all',
                    reasonCode === reason.code
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              rows={2}
            />
          </section>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex space-x-3">
        <button
          onClick={() => handleSubmit('REJECT')}
          disabled={submitting !== null}
          className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-lg rounded-xl transition disabled:opacity-50"
        >
          {submitting === 'reject' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reject'}
        </button>
        <button
          onClick={() => handleSubmit('ACCEPT')}
          disabled={submitting !== null}
          className="flex-[2] py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {submitting === 'confirm' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm & Submit'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
