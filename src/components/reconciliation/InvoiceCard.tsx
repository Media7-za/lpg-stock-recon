import { useDroppable } from '@dnd-kit/core';
import { NormalizedDocument } from '../../types';
import { clsx } from 'clsx';
import { Target, Calendar, Tag, CheckCircle2 } from 'lucide-react';

interface InvoiceCardProps {
  document: NormalizedDocument;
  isFocus?: boolean;
}

export function InvoiceCard({ document, isFocus }: InvoiceCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `invoice-${document.doc_no}`,
    data: document,
    disabled: !isFocus
  });

  const progress = ((document.total_amount - document.available_balance) / document.total_amount) * 100;
  const isFullyPaid = document.available_balance <= 0.01;

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "relative transition-all duration-500 ease-out",
        isFocus ? "w-full max-w-lg scale-100 z-10" : "w-64 scale-90 opacity-40 grayscale blur-[1px]",
        isOver && "ring-8 ring-emerald-500/20 scale-[1.02] shadow-[0_0_50px_rgba(16,185,129,0.2)]"
      )}
    >
      <div className={clsx(
        "relative bg-slate-900 border-2 rounded-3xl p-8 overflow-hidden shadow-2xl",
        isFocus ? "border-slate-700 shadow-blue-900/10" : "border-slate-800",
        isOver ? "border-emerald-500 bg-emerald-950/20" : "",
        isFullyPaid && "border-emerald-500/50"
      )}>
        {/* Drop Highlight Overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse flex items-center justify-center">
            <div className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl scale-110">
              <Target size={32} strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Progress Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase">Focus Invoice</span>
              {isFullyPaid && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                  <CheckCircle2 size={10} /> Paid
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter">{document.doc_no}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-1">
              <Calendar size={12} />
              {new Date(document.tx_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outstanding</span>
            <div className="text-3xl font-black text-white">
              R {document.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
              Total: R {document.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Item Signature Summary */}
        <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 mb-2">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-slate-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Item Signature</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(document.item_signature).map(([bucket, qty]) => (
              <div key={bucket} className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase">{bucket.replace('CYL_', '').replace('LPG_', '')}</span>
                <span className="text-sm font-black text-slate-200">{qty}</span>
              </div>
            ))}
            {Object.keys(document.item_signature).length === 0 && (
              <div className="col-span-2 text-center py-2 text-xs text-slate-600 italic font-bold">
                No items recorded for this invoice
              </div>
            )}
          </div>
        </div>

        {/* Instructions Overlay for Focus */}
        {isFocus && !isOver && !isFullyPaid && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">
            <Target size={12} />
            Drop credit document here to allocate
          </div>
        )}
      </div>
    </div>
  );
}
