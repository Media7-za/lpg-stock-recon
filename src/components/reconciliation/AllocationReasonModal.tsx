import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AllocationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: string) => void;
  docNo: string;
  targetNo: string;
  amount: number;
}

const REASON_CODES = [
  { code: 'SAME_DEBORDER', label: 'Same Deborder Prefix' },
  { code: 'SAME_ORDERNO', label: 'Same Order Number' },
  { code: 'NAME_MATCH', label: 'Customer Name Similarity' },
  { code: 'EXACT_AMOUNT', label: 'Exact Financial Match' },
  { code: 'PARTIAL_MATCH', label: 'Logical Partial Split' },
  { code: 'DATE_PROXIMITY', label: 'Within 24hr Window' },
  { code: 'OTHER', label: 'Other Manual Decision' },
];

export function AllocationReasonModal({
  isOpen,
  onClose,
  onConfirm,
  docNo,
  targetNo,
  amount,
}: AllocationReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Manual Override</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Required for Score &lt; 80%</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Allocation</span>
              <span className="text-xs font-black text-emerald-500">R {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="text-slate-500">{docNo}</span>
              <Check size={12} className="text-slate-700" />
              <span className="text-blue-500">{targetNo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Select Reason Code</label>
            <div className="grid grid-cols-1 gap-2">
              {REASON_CODES.map((reason) => (
                <button
                  key={reason.code}
                  onClick={() => setSelectedReason(reason.code)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    selectedReason === reason.code
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-tight">{reason.label}</span>
                  {selectedReason === reason.code && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 pt-0">
          <button
            disabled={!selectedReason}
            onClick={() => onConfirm(selectedReason)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 uppercase text-sm tracking-[0.2em]"
          >
            Confirm Allocation
          </button>
        </div>
      </div>
    </div>
  );
}
