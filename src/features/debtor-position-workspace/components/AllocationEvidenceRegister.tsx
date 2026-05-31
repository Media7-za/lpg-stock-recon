import { AllocationEvidenceEntry, AllocationConfidence } from '../types/debtorWorkspace';

interface AllocationEvidenceRegisterProps {
  entries: AllocationEvidenceEntry[];
}

const CLASSIFICATION_CONFIG: Record<AllocationConfidence, string> = {
  Confirmed: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50',
  Probable:  'bg-blue-900/40 text-blue-400 border border-blue-700/50',
  Assumed:   'bg-amber-900/40 text-amber-400 border border-amber-700/50',
  Exception: 'bg-red-900/40 text-red-400 border border-red-700/50',
};

export function AllocationEvidenceRegister({ entries }: AllocationEvidenceRegisterProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
        Allocation Evidence Register
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {['Event / Doc', 'Date', 'Classification', 'Evidence Source', 'Confidence', 'Summary'].map((h) => (
                <th key={h} className="text-left text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2 pr-4 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const badgeClass = CLASSIFICATION_CONFIG[entry.classification] ?? 'bg-slate-800 text-slate-400 border border-slate-600';
              return (
                <tr key={i} className="border-b border-border/50 last:border-0 align-top">
                  <td className="py-3 pr-4 font-mono text-xs text-text-primary whitespace-nowrap">{entry.event}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-text-secondary whitespace-nowrap">{entry.date}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                      {entry.classification}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">{entry.evidenceSource}</td>
                  <td className="py-3 pr-4 text-xs text-text-secondary">{entry.confidence}</td>
                  <td className="py-3 text-xs text-text-secondary">{entry.summary}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
