import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, FileText, Activity, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePhysicalCountSessions, useERPSnapshots, useMovementData } from '../../hooks/useDatabase';
import { runReconciliation } from '../../lib/reconciliationEngine';
import type { ReconciliationResult } from '../../types';
import CSVUpload from '../csv/CSVUpload';
import clsx from 'clsx';

type ReconcileMode = 'system' | 'physical';

export default function EngineRunner() {
  const [searchParams] = useSearchParams();
  const passedCountId = searchParams.get('countId');

  const { sessions } = usePhysicalCountSessions();
  const { snapshots } = useERPSnapshots();
  const { movements } = useMovementData();

  const [mode, setMode] = useState<ReconcileMode>('system');

  const [amCountId, setAmCountId] = useState<string>('');
  const [pmCountId, setPmCountId] = useState<string>('');
  const [pmErpId, setPmErpId] = useState<string>('');
  const [movementId, setMovementId] = useState<string>('');

  const [results, setResults] = useState<ReconciliationResult | null>(null);

  const [activeTab, setActiveTab] = useState<'deposits' | 'content'>('deposits');
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  // Auto-selection effect
  useEffect(() => {
    // Auto-select passed count ID into PM or AM depending on what's logical (default: PM for single-point)
    if (passedCountId && sessions.length > 0) {
      const isPassedPresent = sessions.find(s => s.id === passedCountId);
      if (isPassedPresent) {
        setPmCountId(passedCountId);

        // If Physical vs Physical is chosen, we might want to guess the AM count (the previous one from today)
        const todaysCounts = sessions.filter(s => {
          const sDate = new Date(s.timestamp).toDateString();
          const pDate = new Date(isPassedPresent.timestamp).toDateString();
          return sDate === pDate && s.id !== passedCountId;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (todaysCounts.length > 0) {
          setAmCountId(todaysCounts[0].id);
        }
      }
    }

    // Auto-select most recent snapshot from today if not selected
    if (!pmErpId && snapshots.length > 0) {
      const today = new Date().toDateString();
      const todaysSnapshots = snapshots.filter(s => new Date(s.timestamp).toDateString() === today)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (todaysSnapshots.length > 0) {
        setPmErpId(todaysSnapshots[0].id);
      }
    }

    // Auto-select most recent movement from today if not selected
    if (!movementId && movements.length > 0) {
      const today = new Date().toDateString();
      const todaysMovements = movements.filter(m => new Date(m.timestamp).toDateString() === today)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (todaysMovements.length > 0) {
        setMovementId(todaysMovements[0].id);
      }
    }
  }, [passedCountId, sessions, snapshots, movements, pmErpId, movementId]);


  const handleRunMath = () => {
    const pmPhys = sessions.find(s => s.id === pmCountId);

    if (mode === 'system') {
      const pmErp = snapshots.find(s => s.id === pmErpId);
      if (!pmPhys || !pmErp) {
        alert("Please select a Physical Count and an ERP Snapshot.");
        return;
      }
      const calculatedResults = runReconciliation(pmErp, pmPhys, undefined, undefined);
      setResults(calculatedResults);
    } else {
      const amPhys = sessions.find(s => s.id === amCountId);
      const mData = movements.find(m => m.id === movementId);

      // For physical vs physical, we theoretically don't strictly *need* an ERP snapshot to view the difference,
      // but the engine requires it to get 'descriptions' and SKUs. 
      // We can grab the most recent ERP snapshot just to fulfill the engine signature if one exists.
      const pmErp = snapshots.length > 0 ? snapshots[0] : undefined;

      if (!pmPhys || !amPhys || !mData || !pmErp) {
        alert("Requires Start Physical Count, End Physical Count, Movement Data (CURRENT.TXT), and at least one ERP Snapshot in DB.");
        return;
      }

      const calculatedResults = runReconciliation(pmErp, pmPhys, amPhys, mData);
      setResults(calculatedResults);
    }
  };

  if (results) {
    const sortedDeposits = [...results.depositReconciliation].sort((a, b) => Math.abs(b.sohVariance) - Math.abs(a.sohVariance));
    const sortedContent = [...results.contentReconciliation].sort((a, b) => Math.abs(b.sohVariance) - Math.abs(a.sohVariance));
    const activeList = activeTab === 'deposits' ? sortedDeposits : sortedContent;

    const pmPhys = sessions.find(s => s.id === pmCountId);
    const pmErp = snapshots.find(s => s.id === pmErpId);

    const criticalCount = results.criticalCount;

    return (
      <div className="max-w-xl mx-auto space-y-4 pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md pt-4 pb-4 px-2 -mx-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Activity className="w-5 h-5 text-blue-600" />
                LPG Reconciliation
              </h2>
              <div className="text-xs text-gray-500 mt-1 space-y-0.5 font-medium">
                <p>Session: {pmPhys?.sessionType === 'PM' ? 'End-of-Day' : pmPhys?.sessionType || 'Baseline'}</p>
                <p>Snapshot: {pmErp ? new Date(pmErp.exportTime || pmErp.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Live'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm",
                results.totalDepositVariance + results.totalContentVariance > 0 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-green-100 text-green-800 border border-green-200"
              )}>
                {results.totalDepositVariance + results.totalContentVariance > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {results.totalDepositVariance + results.totalContentVariance > 0 ? "Variance Detected" : "Fully Reconciled"}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Alert Card */}
        <div className={clsx(
          "p-6 rounded-3xl mb-6 text-white shadow-xl relative overflow-hidden",
          results.criticalCount > 0
            ? "bg-gradient-to-br from-red-500 to-red-700"
            : results.minorCount > 0
              ? "bg-gradient-to-br from-amber-500 to-amber-600"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600"
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertCircle className="w-24 h-24 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black opacity-90 tracking-widest flex items-center gap-2 mb-2 uppercase">
              Variance Summary
            </h3>
            <p className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
              {results.criticalCount > 0 ? `${results.criticalCount} Critical` : results.minorCount > 0 ? `${results.minorCount} Minor` : 'All Clear'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                {criticalCount} Critical SKUs
              </span>
              <span className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                {results.totalDepositVariance + results.totalContentVariance} Item Variances
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Toggle */}
        <div className="flex p-1.5 bg-gray-200/70 rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab('deposits'); setExpandedSku(null); }}
            className={clsx(
              "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
              activeTab === 'deposits' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            Deposits ({results.depositReconciliation.filter(v => v.status !== 'match').length})
          </button>
          <button
            onClick={() => { setActiveTab('content'); setExpandedSku(null); }}
            className={clsx(
              "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
              activeTab === 'content' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            Content ({results.contentReconciliation.filter(v => v.status !== 'match').length})
          </button>
        </div>

        {/* SKU List */}
        <div className="space-y-3">
          {activeList.map(v => {
            const isExpanded = expandedSku === v.sku;
            const isCritical = v.status === 'critical';
            const isWarning = v.status === 'minor';

            return (
              <div
                key={v.sku}
                className={clsx(
                  "bg-white rounded-2xl overflow-hidden transition-all shadow-sm ring-1 ring-inset",
                  isCritical ? "ring-red-200" : isWarning ? "ring-amber-200" : "ring-gray-200",
                  isExpanded ? "ring-2 ring-blue-500 shadow-md" : ""
                )}
              >
                <div
                  onClick={() => setExpandedSku(isExpanded ? null : v.sku)}
                  className="p-5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      {isCritical ? <div className="w-3 h-3 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> :
                        isWarning ? <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> :
                          <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />}
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{v.description || v.sku}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-3 pr-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Variance</span>
                        <span className={clsx(
                          "text-base font-black font-mono",
                          v.timelineVariance !== 0 || v.sohVariance !== 0 ? "text-gray-900" : "text-gray-400"
                        )}>{v.timelineVariance !== 0 ? (v.timelineVariance > 0 ? `+${v.timelineVariance}` : v.timelineVariance) : (v.sohVariance > 0 ? `+${v.sohVariance}` : v.sohVariance)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Impact</span>
                        <span className={clsx(
                          "text-base font-black tracking-tight",
                          isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-400"
                        )}>
                          {v.status !== 'match' ? `Var: ${v.sohVariance > 0 ? '+' : ''}${v.sohVariance}` : 'OK'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 text-gray-400 bg-gray-50 p-2 rounded-xl">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50/80 p-5 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">System ERP SOH</span>
                          <span className="font-mono font-black text-gray-900 text-xl">{v.systemSOH}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Physical SOH</span>
                          <span className="font-mono font-black text-blue-900 text-xl">{v.afternoonPhysical}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tier 1: SOH</span>
                          <span className={clsx("font-mono font-black", v.sohVariance !== 0 ? "text-gray-900" : "text-gray-400")}>{v.sohVariance > 0 ? `+${v.sohVariance}` : v.sohVariance}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tier 2: Move</span>
                          <span className={clsx("font-mono font-black", v.movementVariance !== 0 ? "text-gray-900" : "text-gray-400")}>{v.movementVariance > 0 ? `+${v.movementVariance}` : v.movementVariance}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tier 3: Time</span>
                          <span className={clsx("font-mono font-black", v.timelineVariance !== 0 ? "text-gray-900" : "text-gray-400")}>{v.timelineVariance > 0 ? `+${v.timelineVariance}` : v.timelineVariance}</span>
                        </div>
                      </div>

                      {/* Mock Trend Visualization */}
                      <div className="pt-2">
                        <span className="text-[10px] text-gray-500 block mb-2 uppercase tracking-wider font-bold">Trend (Last 5 Sessions)</span>
                        <div className="flex items-end gap-1.5 h-10 w-full max-w-[150px]">
                          {[1, 4, 3, 7, 5].map((h, i) => (
                            <div key={i} className="flex-1 bg-gray-200 rounded-sm" style={{ height: `${h * 10}%` }}></div>
                          ))}
                          <div className={clsx("flex-1 rounded-sm", isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-green-500")} style={{ height: `${Math.max(20, Math.min(100, Math.abs(v.sohVariance) * 5))}%` }}></div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {activeList.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-80" />
              <p className="font-bold text-gray-900 text-lg">All Clear</p>
              <p className="text-sm text-gray-500 mt-1">No variances detected in this category.</p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setResults(null)}
          className="fixed bottom-8 right-6 bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:bg-blue-700 active:scale-95 transition-all px-5 py-4 rounded-full flex items-center justify-center gap-2 font-bold z-50 ring-4 ring-white"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white text-gray-900 p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Reconciliation Setup Wizard</h2>

        <p className="text-gray-500 mb-6">Select the type of variance check you want to perform.</p>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode('system')}
            className={clsx(
              "p-6 rounded-xl border-2 text-left transition-all",
              mode === 'system' ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={clsx("p-2 rounded-lg", mode === 'system' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500")}>
                <FileText className="w-6 h-6" />
              </div>
              <h3 className={clsx("font-bold text-lg", mode === 'system' ? "text-blue-900" : "text-gray-900")}>Physical vs System</h3>
            </div>
            <p className={clsx("text-sm", mode === 'system' ? "text-blue-700" : "text-gray-500")}>
              Compare a single physical count against an ERP snapshot to find immediate shrinkage.
            </p>
          </button>

          <button
            onClick={() => setMode('physical')}
            className={clsx(
              "p-6 rounded-xl border-2 text-left transition-all",
              mode === 'physical' ? "border-green-500 bg-green-50/50" : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={clsx("p-2 rounded-lg", mode === 'physical' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
                <Activity className="w-6 h-6" />
              </div>
              <h3 className={clsx("font-bold text-lg", mode === 'physical' ? "text-green-900" : "text-gray-900")}>Physical vs Physical</h3>
            </div>
            <p className={clsx("text-sm", mode === 'physical' ? "text-green-700" : "text-gray-500")}>
              Compare two physical counts across time using movement data to find missing invoices.
            </p>
          </button>
        </div>

        <hr className="border-gray-100 my-8" />

        <div className="space-y-6">

          {mode === 'system' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Physical Count (Reality)</label>
                  <select className="w-full border-gray-300 text-gray-900 rounded-lg p-2.5 bg-gray-50 focus:bg-white transition-colors" value={pmCountId} onChange={e => setPmCountId(e.target.value)}>
                    <option value="">-- Select Count --</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.sessionType} - {new Date(s.timestamp).toLocaleString()} ({s.zones.length} Zones)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ERP Snapshot (STKCOUNT.csv)</label>
                  <select className="w-full border-gray-300 text-gray-900 rounded-lg p-2.5 bg-gray-50 focus:bg-white transition-colors" value={pmErpId} onChange={e => setPmErpId(e.target.value)}>
                    <option value="">-- Select Snapshot --</option>
                    {snapshots.map(s => <option key={s.id} value={s.id}>Exported: {new Date(s.exportTime || s.timestamp).toLocaleString()}</option>)}
                  </select>
                </div>
              </div>

              {/* Inline Upload for STKCOUNT if missing today */}
              {(!pmErpId || snapshots.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length === 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-amber-600 mb-3 bg-amber-50 p-2 rounded-md border border-amber-100">
                    No ERP Snapshot found for today. Upload one below:
                  </p>
                  <CSVUpload allowTxt={false} title="" />
                </div>
              )}
            </div>
          )}

          {mode === 'physical' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Count (e.g. Morning)</label>
                    <select className="w-full border-gray-300 text-gray-900 rounded-lg p-2.5 bg-white" value={amCountId} onChange={e => setAmCountId(e.target.value)}>
                      <option value="">-- Select Start Count --</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.sessionType} - {new Date(s.timestamp).toLocaleString()}</option>)}
                    </select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-900 mb-2">End Count (e.g. Afternoon)</label>
                    <select className="w-full border-blue-200 rounded-lg p-2.5 bg-white text-blue-900" value={pmCountId} onChange={e => setPmCountId(e.target.value)}>
                      <option value="">-- Select End Count --</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.sessionType} - {new Date(s.timestamp).toLocaleString()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 h-full">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Movement Data (CURRENT.TXT)</label>
                  <select className="w-full border-gray-300 text-gray-900 rounded-lg p-2.5 bg-white mb-4" value={movementId} onChange={e => setMovementId(e.target.value)}>
                    <option value="">-- Select Movement --</option>
                    {movements.map(m => <option key={m.id} value={m.id}>Imported: {new Date(m.timestamp).toLocaleString()}</option>)}
                  </select>

                  {/* Inline Upload for CURRENT.TXT if missing today */}
                  {(!movementId || movements.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString()).length === 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-amber-600 mb-3 block">
                        Missing today's Movement Data:
                      </p>
                      <CSVUpload allowTxt={true} title="" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        <button
          onClick={handleRunMath}
          className="w-full mt-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 text-lg shadow-md transition-all active:scale-[0.98]"
        >
          <Play fill="currentColor" className="w-5 h-5" /> Run Reconciliation Match
        </button>
      </div>

    </div>
  );
}
