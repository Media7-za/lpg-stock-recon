import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { useAllocationEngine } from '../../hooks/useAllocationEngine';
import { InvoiceCard } from './InvoiceCard';
import { AllocationCard } from './AllocationCard';
import { NormalizedDocument } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Database,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AllocationReasonModal } from './AllocationReasonModal';

export default function ReconciliationWorkspace() {
  const { accountNo } = useParams<{ accountNo: string }>();
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { 
    invoices, 
    credits, 
    focusInvoice, 
    queue, 
    loading, 
    error, 
    nextInvoice, 
    prevInvoice,
    session,
    refresh
  } = useAllocationEngine(accountNo || '');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<NormalizedDocument | null>(null);
  const [pendingAllocation, setPendingAllocation] = useState<{ source: NormalizedDocument, target: NormalizedDocument } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);

  // --- Drag & Drop Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveDoc(active.data.current as NormalizedDocument);
  };

  const performAllocation = async (source: NormalizedDocument, target: NormalizedDocument, reasonCode?: string) => {
    if (!session || !supabase) return;
    setIsAllocating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actorId = user?.id;
      const isAutoAccepted = (source.score || 0) >= 80;
      const allocationAmount = Math.min(source.available_balance, target.available_balance);

      // 1. Create Allocation Record
      const { data: allocation, error: allocErr } = await supabase
        .from('allocations')
        .insert([{
          session_id: session.id,
          credit_doc_id: source.id,
          invoice_doc_id: target.id,
          amount: allocationAmount,
          is_auto_accepted: isAutoAccepted,
          actor_id: actorId
        }])
        .select()
        .single();

      if (allocErr) throw allocErr;

      // 2. Create Impact Records (for audit)
      if (source.raw_items && source.raw_items.length > 0) {
        const impactRows = source.raw_items.map(item => ({
          allocation_id: allocation.id,
          stock_no: item.stock_no,
          qty_covered: item.qty,
          amount_covered: (item.qty / (source.raw_items?.reduce((acc, i) => acc + i.qty, 0) || 1)) * allocationAmount
        }));
        
        await supabase.from('allocation_item_impact').insert(impactRows);
      }

      // 3. Update Document Balances
      await Promise.all([
        supabase.rpc('decrement_available_balance', { doc_id: source.id, amount_to_dec: allocationAmount }),
        supabase.rpc('decrement_available_balance', { doc_id: target.id, amount_to_dec: allocationAmount })
      ]);

      // 4. Create Training Record if manual override
      if (!isAutoAccepted && reasonCode) {
        await supabase.from('training_records').insert([{
          allocation_id: allocation.id,
          reason_code: reasonCode,
          score_at_time: source.score,
          recommended_doc_id: source.id // In a real recommender, this would be the top-scored doc ID
        }]);
      }

      // 5. Update Local State & Refresh
      await refresh();
      
    } catch (err: any) {
      console.error('[LSR-5] Allocation failed:', err);
      alert(`Allocation failed: ${err.message}`);
    } finally {
      setIsAllocating(false);
      setIsModalOpen(false);
      setPendingAllocation(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id.toString().startsWith('invoice-')) {
      const sourceDoc = active.data.current as NormalizedDocument;
      const targetDoc = over.data.current as NormalizedDocument;
      
      const score = sourceDoc.score || 0;

      if (score >= 80) {
        performAllocation(sourceDoc, targetDoc);
      } else {
        setPendingAllocation({ source: sourceDoc, target: targetDoc });
        setIsModalOpen(true);
      }
    }

    setActiveId(null);
    setActiveDoc(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-blue-500 font-black">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <span className="tracking-[0.3em] uppercase">Initializing Engine...</span>
      </div>
    );
  }

  if (error || !accountNo) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-rose-950/20 border border-rose-500/50 rounded-3xl text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Engine Failure</h2>
        <p className="text-rose-300 mb-6 font-bold">{error || 'Missing Account Reference'}</p>
        <button onClick={() => navigate('/audit')} className="px-6 py-3 bg-rose-500 text-white font-black rounded-xl uppercase tracking-widest">
          Return to Audit
        </button>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-slate-950 text-white">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/audit')}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tighter">Debtors Reconciliation</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account: {accountNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
              <Database size={16} className="text-emerald-500" />
              <span className="text-xs font-black uppercase text-slate-300">Live Sync Active</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest">
              <Save size={16} /> Finalize Session
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Recommended Credits */}
          <div className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/30">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Recommendations</h3>
              <p className="text-[10px] font-bold text-slate-600 uppercase">Ranked by Matching Item Signature</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {credits.map(credit => (
                <AllocationCard key={credit.doc_no} document={credit} />
              ))}
              {credits.length === 0 && (
                <div className="text-center py-20 px-8">
                  <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4 opacity-20" />
                  <p className="text-xs font-black text-slate-600 uppercase">No unallocated credits found</p>
                </div>
              )}
            </div>
          </div>

          {/* Center Panel: Invoice Queue Workspace */}
          <div className="flex-1 relative flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
            
            {/* 3+1+3 Invoice Queue View */}
            <div className="flex items-center justify-center gap-4 w-full px-20">
              <button 
                onClick={prevInvoice}
                disabled={invoices.indexOf(focusInvoice!) === 0}
                className="p-4 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-10 rounded-full transition-all"
              >
                <ChevronLeft size={32} />
              </button>

              <div className="flex items-center gap-8 px-8 overflow-hidden">
                {queue.map((inv) => (
                  <InvoiceCard 
                    key={inv.doc_no} 
                    document={inv} 
                    isFocus={inv.doc_no === focusInvoice?.doc_no} 
                  />
                ))}
              </div>

              <button 
                onClick={nextInvoice}
                disabled={invoices.indexOf(focusInvoice!) === invoices.length - 1}
                className="p-4 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-10 rounded-full transition-all"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Queue Counter Info */}
            <div className="absolute bottom-12 px-6 py-2 bg-slate-900/80 border border-slate-700 rounded-full backdrop-blur-xl">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                Invoice {invoices.indexOf(focusInvoice!) + 1} of {invoices.length}
              </span>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeDoc ? (
            <div className="scale-105 rotate-2 shadow-2xl opacity-90">
              <AllocationCard document={activeDoc} />
            </div>
          ) : null}
        </DragOverlay>

        {pendingAllocation && (
          <AllocationReasonModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setPendingAllocation(null);
            }}
            onConfirm={(reasonCode) => performAllocation(pendingAllocation.source, pendingAllocation.target, reasonCode)}
            docNo={pendingAllocation.source.doc_no}
            targetNo={pendingAllocation.target.doc_no}
            amount={Math.min(pendingAllocation.source.available_balance, pendingAllocation.target.available_balance)}
          />
        )}

        {isAllocating && (
          <div className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-700 px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-sm font-black uppercase tracking-widest text-white">Persisting Allocation...</span>
            </div>
          </div>
        )}

      </div>
    </DndContext>
  );
}
