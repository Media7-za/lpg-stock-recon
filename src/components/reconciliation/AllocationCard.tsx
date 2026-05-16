import { useDraggable } from '@dnd-kit/core';
import { NormalizedDocument } from '../../types';
import { clsx } from 'clsx';
import { Calendar, Tag } from 'lucide-react';

interface AllocationCardProps {
  document: NormalizedDocument;
}

export function AllocationCard({ document }: AllocationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `credit-${document.doc_no}`,
    data: document
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? '0.95' : '1'
  } : undefined;

  const scoreColor = document.score === undefined ? 'bg-slate-500' :
    document.score >= 80 ? 'bg-emerald-500' :
    document.score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl cursor-grab active:cursor-grabbing select-none",
        isDragging && "shadow-2xl ring-2 ring-blue-500"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-900 rounded text-slate-400 uppercase">
          {document.entry_type}
        </span>
        {document.score !== undefined && (
          <div className={clsx("text-[10px] font-black text-white px-2 py-0.5 rounded-full", scoreColor)}>
            {document.score}% MATCH
          </div>
        )}
      </div>

      <div className="mb-1">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Available Balance</span>
        <h3 className="text-xl font-black text-white">R {document.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
      </div>
      
      <p className="text-[10px] text-slate-500 font-mono mb-4">{document.doc_no}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
          <Calendar size={10} className="text-blue-500" />
          {new Date(document.tx_date).toLocaleDateString()}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(document.item_signature).map(([bucket, qty]) => (
            <div key={bucket} className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded text-[9px] font-black text-slate-400 border border-slate-700/50">
              <Tag size={8} className="text-slate-500" />
              <span>{qty}</span>
              <span className="text-[8px] opacity-60 uppercase">{bucket.replace('CYL_', '').replace('LPG_', '')}</span>
            </div>
          ))}
          {Object.keys(document.item_signature).length === 0 && (
            <div className="text-[8px] text-slate-600 italic font-bold">No item signature</div>
          )}
        </div>
      </div>
    </div>
  );
}
