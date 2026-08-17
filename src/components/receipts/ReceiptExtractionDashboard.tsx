import { useState } from 'react';
import { CheckCircle2, Clock, FileScan, Loader2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useReceiptExtractions } from '../../hooks/useReceiptExtractions';
import { useAuth } from '../../hooks/useAuth';
import ReceiptUpload from './ReceiptUpload';
import ReceiptReviewScreen from './ReceiptReviewScreen';
import { ReceiptExtraction } from '../../types';

export default function ReceiptExtractionDashboard() {
  const { extractions, loading, error, refresh } = useReceiptExtractions();
  const { userRole } = useAuth();
  const [selected, setSelected] = useState<ReceiptExtraction | null>(null);

  if (selected) {
    return (
      <ReceiptReviewScreen
        extraction={selected}
        reviewedBy={userRole ?? undefined}
        onBack={() => setSelected(null)}
        onReviewed={() => {
          setSelected(null);
          refresh();
        }}
      />
    );
  }

  const getStatusIcon = (status: ReceiptExtraction['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-text-primary flex items-center gap-3">
          <FileScan className="w-8 h-8 text-blue-500" />
          Receipt Extraction
        </h1>
        <p className="text-text-secondary">
          Scan a delivery note or cylinder returns slip. Every extraction needs a human confirm before it counts.
        </p>
      </header>

      <ReceiptUpload onExtracted={(extraction) => { setSelected(extraction); refresh(); }} />

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-3 border-b border-border">
          <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">Recent Extractions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-3 text-xs font-black uppercase text-text-secondary">Status</th>
                <th className="px-6 py-3 text-xs font-black uppercase text-text-secondary">Document</th>
                <th className="px-6 py-3 text-xs font-black uppercase text-text-secondary">Type</th>
                <th className="px-6 py-3 text-xs font-black uppercase text-text-secondary text-right">Confidence</th>
                <th className="px-6 py-3 text-xs font-black uppercase text-text-secondary">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading extractions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : extractions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary italic">
                    No receipts scanned yet.
                  </td>
                </tr>
              ) : extractions.map((ext) => (
                <tr
                  key={ext.id}
                  onClick={() => ext.status === 'PENDING_REVIEW' && setSelected(ext)}
                  className={clsx(
                    'transition-colors',
                    ext.status === 'PENDING_REVIEW' ? 'cursor-pointer hover:bg-gray-50' : 'opacity-70'
                  )}
                >
                  <td className="px-6 py-4">{getStatusIcon(ext.status)}</td>
                  <td className="px-6 py-4 font-mono font-bold">{ext.document_number || '—'}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{ext.document_type || '—'}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold">{ext.system_confidence}%</td>
                  <td className="px-6 py-4 text-xs text-text-secondary">{new Date(ext.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
